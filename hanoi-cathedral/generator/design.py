"""St. Joseph's Cathedral, Hanoi -- LEGO model generator (approx. 1:100).

Grid: x = studs left->right (facade width), z = studs front->back, y = plates up (0 = top of base).
"""
import math
import numpy as np
from builder import Model, rotmat
from bricks import fill

# LDraw colour codes
BLACK, WHITE, TAN, DTAN = 0, 15, 19, 28
LBG, DBG, RB, DBROWN, DRED = 71, 72, 70, 308, 320
GREEN, DGREEN, BGREEN = 2, 288, 10
PGOLD = 297
TCLEAR, TRED, TDBLUE, TYEL, TGREEN, TLBLUE, TORANGE = 47, 36, 33, 46, 34, 43, 57

WALL, TRIM, ROOF, DOOR = DBG, LBG, BLACK, RB

# --- plan -------------------------------------------------------------
BX0, BX1 = 3, 28            # building x extent (inclusive)
ZF = 11                     # facade front plane (towers z 11..18)
TOWERS = {'L': (3, 10), 'R': (21, 28)}
TZ0, TZ1 = 11, 18
NAVE_X = (11, 20)           # clerestory / arcade walls
BAYS = [19 + 7 * i for i in range(5)]   # bay start z; each 7 deep -> 19..53
ZREAR = 54
APSE = (12, 19, 55, 62)
AISLE_TOP = 42
CLER_TOP = 69

CROSS_ROT = 90
LANCET = [TDBLUE, TRED, TDBLUE, TYEL, TDBLUE, TRED, TDBLUE]

m = Model()


def S(name):
    m.section = name


def course(cells, y, color=WALL, kind='brick', flip=None, note=None, **kw):
    if flip is None:
        flip = (y // 3) % 2 == 1
    return fill(m, cells, y, color, kind=kind, flip=flip, note=note, **kw)


def fill_course_levels(cells, y, h, color=WALL, note=None):
    """Fill cells for levels y..y+h: bricks where 3 plates are free, plates elsewhere."""
    yy = y
    while yy < y + h:
        if y + h - yy >= 3:
            course(cells, yy, color, note=note)
        free_cells = [c for c in cells if m.free(c[0], c[1], yy, 1, 1, 1)]
        if free_cells:
            course(free_cells, yy, color, kind='plate', note=note)
        # remaining plate levels inside this brick course
        if y + h - yy >= 3:
            for j in (1, 2):
                fc = [c for c in cells if m.free(c[0], c[1], yy + j, 1, 1, 1)]
                if fc:
                    course(fc, yy + j, color, kind='plate', note=note)
            yy += 3
        else:
            yy += 1


def slope(part, color, x, z, y, facing, **kw):
    rot = {'-z': 0, '-x': 90, '+z': 180, '+x': 270}[facing]
    return m.add(part, color, x, z, y, rot=rot, **kw)


def lancet(x, z, y0, n, face_rot=0, colors=LANCET, round_=True):
    """Stained-glass lancet: n trans 1x1 (round) bricks topped by a trans cone."""
    for i in range(n):
        m.add('3062b' if round_ else '3005', colors[i % len(colors)], x, z, y0 + 3 * i)
    m.add('59900', TYEL if n > 3 else TRED, x, z, y0 + 3 * n)


def snot_matrix():
    # studs of a plate pointing to -z (towards the front)
    return np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], dtype=float)


def ld(level):
    return -level * 8


def at1(part, color, x, z, y, h=1, rot=0, note=None):
    """Place a part whose origin is the top-centre of a 1x1 cell (for irregular bounding boxes)."""
    return m.raw(part, color, (x * 20 + 10, ld(y) - h * 8, z * 20 + 10), rotmat(rot),
                 cells=[(x, z, y + j) for j in range(h)], note=note)


# ======================================================================
# 1. BASE
# ======================================================================
S('base')
m.step('Base plates')
base = []
for bx in range(2):
    for bz in range(4):
        base.append(m.add('91405', DBG, bx * 16, bz * 16, -1))

# building footprint mask (cells at y=0 that are covered by walls/floor, not plaza)
def in_building(x, z):
    if BX0 <= x <= BX1 and TZ0 <= z <= ZREAR:
        return True
    ax0, ax1, az0, az1 = APSE
    if ax0 <= x <= ax1 and az0 <= z <= az1:
        return True
    return False

# ======================================================================
# 2. FLOOR, PEWS, ALTAR  (inside, on the base)
# ======================================================================
S('interior')
m.step('Nave floor')
# centre aisle runner (dark red) and pews on bare studs, rest tiled
for z in range(21, 48, 2):
    for x0 in (12, 17):
        m.add('3623', RB, x0, z, 0, rot=0, note='pew')
        m.add('63864', RB, x0, z, 1, note='pew')
m.step('Nave floor tiles')
runner = [(x, z) for x in (15, 16) for z in range(12, 54)]
course(runner, 0, DRED, kind='tile')
m.step('Aisle floor tiles')
floor = []
for x in range(4, 28):
    for z in range(12, 54):
        if 4 <= x <= 9 and z <= 18 or 22 <= x <= 27 and z <= 18:
            continue  # tower interiors (tiled separately)
        if x in (3, 10, 21, 28):
            continue
        if x in (11, 20) and (z <= 18 or z in BAYS):
            continue
        floor.append((x, z))
floor = [c for c in floor if m.free(c[0], c[1], 0)]
course(floor, 0, LBG, kind='tile')
# tower ground floors
m.step('Tower floors')
for (t0, t1) in TOWERS.values():
    course([(x, z) for x in range(t0 + 1, t1) for z in range(TZ0 + 1, TZ1)], 0, LBG, kind='tile')
# sanctuary (apse) raised floor + altar
m.step('Sanctuary and altar')
ax0, ax1, az0, az1 = APSE
sanct = [(x, z) for x in range(ax0 + 1, ax1) for z in range(ZREAR, az1)]
course(sanct, 0, WHITE, kind='plate')
m.add('3004', WHITE, 15, 58, 1, rot=0, note='altar')
m.add('3069b', PGOLD if False else WHITE, 15, 58, 4, note='altar top')
tiles_sanct = [c for c in sanct if m.free(c[0], c[1], 1)]
course(tiles_sanct, 1, WHITE, kind='tile')


# ======================================================================
# 3. NAVE (aisle walls, arcade, clerestory, rear wall, apse walls)
# ======================================================================
S('nave')
ax0, ax1, az0, az1 = APSE


def nave_cells(y):
    c = set()
    if y < AISLE_TOP:
        for z in range(19, 54):
            c.add((3, z)); c.add((28, z))
        for x in list(range(3, 11)) + list(range(21, 29)):
            c.add((x, ZREAR))
        # buttresses
        for b in BAYS[1:]:
            if y < 33:
                c.add((2, b)); c.add((29, b))
            if y < 15:
                c.add((1, b)); c.add((30, b))
    else:
        # rear aisle wall infill under the lean-to roofs
        k = (y - AISLE_TOP) // 3
        for x in range(5 + 2 * k, 11):
            c.add((x, ZREAR))
        for x in range(21, 27 - 2 * k):
            c.add((x, ZREAR))
    # front part of the nave side walls (between the towers)
    if y < 72:
        for z in range(12, 19):
            c.add((11, z)); c.add((20, z))
    # clerestory walls above the arcade
    if 36 <= y < CLER_TOP:
        for z in range(19, 54):
            c.add((11, z)); c.add((20, z))
    # nave rear wall
    if y < CLER_TOP:
        for x in range(11, 21):
            if y < 36 and 12 <= x <= 19:
                if y < 30 and 13 <= x <= 18 or y >= 30:
                    continue  # sanctuary opening + arch
            c.add((x, ZREAR))
    # apse walls
    if y < 36:
        for z in range(az0, az1 + 1):
            c.add((ax0, z)); c.add((ax1, z))
        for x in range(ax0, ax1 + 1):
            c.add((x, az1))
    return c


def nave_specials(y):
    # aisle lancets: groups of three per bay, centre taller
    if y == 9:
        for b in BAYS:
            for x in (3, 28):
                lancet(x, b + 2, 9, 5); lancet(x, b + 3, 9, 6); lancet(x, b + 4, 9, 5)
        for x in (5, 8, 23, 26):
            lancet(x, ZREAR, 9, 6)
        # apse lancets
        for z in (57, 60):
            lancet(ax0, z, 9, 5); lancet(ax1, z, 9, 5)
        for x in (14, 17):
            lancet(x, az1, 9, 5)
        for x in (15, 16):
            lancet(x, az1, 9, 6)
    if y == 0:
        # arcade piers (round columns)
        for b in BAYS:
            for x in (11, 20):
                for k in range(10):
                    m.add('3062b', TRIM, x, b, 3 * k, note='pier')
        # light-kit cable port in the rear wall
        m.add('3700', WALL, 21, ZREAR, 3, note='cable port')
    if y == 30:
        for b in BAYS:
            for x in (11, 20):
                m.add('3307', TRIM, x, b + 1, 30, rot=90, note='arcade arch')
        m.add('3308a', TRIM, 12, ZREAR, 30, note='sanctuary arch')
    if y == 15:
        for b in BAYS[1:]:
            slope('54200', TRIM, 1, b, 15, '-x'); slope('54200', TRIM, 30, b, 15, '+x')
    if y == 33:
        for b in BAYS[1:]:
            slope('54200', TRIM, 2, b, 33, '-x'); slope('54200', TRIM, 29, b, 33, '+x')
    if y == 57:
        for b in BAYS:
            for x in (11, 20):
                lancet(x, b + 2, 57, 2); lancet(x, b + 3, 57, 3); lancet(x, b + 4, 57, 2)
        # rear clerestory rose-lancets
        for x in (14, 17):
            lancet(x, ZREAR, 57, 2)
        for x in (15, 16):
            lancet(x, ZREAR, 57, 3)


for y in range(0, 72, 3):
    m.step(f'Nave walls y{y}', view='nave')
    nave_specials(y)
    fill_course_levels(sorted(nave_cells(y)), y, 3, TRIM if y in (33, 66) else WALL, note='nave')

# ======================================================================
# 4. AISLE ROOFS (33 degree lean-to)
# ======================================================================
S('aisle_roof')
SL33 = {4: '3297', 2: '3298', 1: '4286'}


def run_pieces(z0, z1, offset, table, prefer=(4, 2, 1)):
    """Split z0..z1 (inclusive) into lengths, starting with a shorter piece when offset."""
    out = []
    z = z0
    first = True
    while z <= z1:
        rem = z1 - z + 1
        if first and offset:
            L = min(offset, rem)
        else:
            L = next(l for l in prefer if l <= rem)
        L = next(l for l in prefer if l <= L)
        out.append((z, L))
        z += L
        first = False
    return out


for c in range(4):
    m.step(f'Aisle roofs course {c}', view='aisle_roof')
    y = AISLE_TOP + 3 * c
    for side in ('L', 'R'):
        x = 2 + 2 * c if side == 'L' else 27 - 2 * c
        for (z, L) in run_pieces(19, 53, (0, 2, 1, 3)[c], SL33):
            slope(SL33[L], ROOF, x, z, y, '-x' if side == 'L' else '+x', note='aisle roof')

# ======================================================================
# 5. TOWERS
# ======================================================================


def tower(name, t0, t1):
    S('tower' + name)
    outer = t0 if name == 'L' else t1
    inner = t1 if name == 'L' else t0
    side_px = t0 - 1 if name == 'L' else t1 + 1   # side pilaster column
    cx = t0 + 4                                    # tower centre line (between cells)
    faces = {
        'front': [(x, TZ0) for x in range(t0, t1 + 1)],
        'back': [(x, TZ1) for x in range(t0, t1 + 1)],
        'outer': [(outer, z) for z in range(TZ0, TZ1 + 1)],
        'inner': [(inner, z) for z in range(TZ0, TZ1 + 1)],
    }
    perim = set(sum(faces.values(), []))
    pil = [(t0, TZ0 - 1), (t1, TZ0 - 1), (side_px, TZ0), (side_px, TZ1)]
    bands = {33, 54, 69, 93}
    hinge_parts = []

    def face_cells(face, rel):
        cells = faces[face]
        return [cells[r] for r in rel]

    for y in range(0, 96, 3):
        m.step(f'Tower {name} y{y}', view='tower' + name)
        col = TRIM if y in bands else WALL
        openings = set()
        # side portal
        if y < 18:
            openings |= set(face_cells('front', [3, 4]))
        if y == 0:
            # door on a swivel hinge
            if name == 'L':
                pos = ((t0 + 3) * 20, ld(0) - 8, TZ0 * 20); R = rotmat(0)
                fixed = [(t0 + 1, TZ0), (t0 + 2, TZ0)]
            else:
                pos = ((t0 + 5) * 20, ld(0) - 8, (TZ0 + 1) * 20); R = rotmat(180)
                fixed = [(t0 + 5, TZ0), (t0 + 6, TZ0)]
            leafx = t0 + 3
            h = m.raw('2429c01', BLACK, pos, R, cells=[(x, TZ0, 0) for x in range(min(fixed)[0], min(fixed)[0] + 4)] if name == 'L'
                      else [(x, TZ0, 0) for x in range(t0 + 3, t0 + 7)], note='door hinge',
                      top=[(x, TZ0, 1) for x in (fixed[0][0], fixed[1][0])],
                      bottom=[(x, TZ0, 0) for x in range(min(t0 + 1, t0 + 3) if name == 'L' else t0 + 3, (t0 + 5) if name == 'L' else t0 + 7)])
            hinge_parts.append(h)
            leaf = []
            for k in range(5):
                leaf.append(m.add('3004', DOOR, leafx, TZ0, 1 + 3 * k, note='door leaf'))
            leaf.append(m.add('3069b', DOOR, leafx, TZ0, 16, note='door leaf'))
            m.link(h, leaf[0])
        if y == 18:
            m.add('3659', TRIM, t0 + 2, TZ0, 18, note='portal arch')
        if y < 21:
            for px in (t0 + 2, t0 + 5):
                m.add('3062b', TRIM, px, TZ0 - 1, y, note='portal column')
        if y == 21:
            m.add('3020', TRIM, t0 + 2, TZ0 - 1, 21, note='portal lintel')
            slope('3040b', TRIM, t0 + 2, TZ0 - 1, 22, '-x', note='gablet')
            slope('3040b', TRIM, t0 + 4, TZ0 - 1, 22, '+x', note='gablet')
            m.add('3044c', TRIM, t0 + 3, TZ0 - 1, 25, rot=90, note='gablet')
        # story 2 & 3 lancets
        if y == 39:
            for x in (t0 + 2, t0 + 5):
                lancet(x, TZ0, 39, 4)
            for z in (TZ0 + 2, TZ0 + 5):
                lancet(outer, z, 39, 4)
        if y == 60:
            for x in (t0 + 2, t0 + 5):
                lancet(x, TZ0, 60, 2); lancet(x, TZ1, 60, 2)
            for z in (TZ0 + 2, TZ0 + 5):
                lancet(outer, z, 60, 2)
        # belfry
        if 75 <= y < 87:
            for f in faces:
                openings |= set(face_cells(f, [2, 3, 4, 5]))
        if y == 75:
            for f in ('front', 'back'):
                x0 = t0 + 2
                zz = TZ0 if f == 'front' else TZ1
                m.add('15332', TRIM, x0, zz, 75, note='belfry balustrade')
            for xx in (t0, t1):
                m.add('15332', TRIM, xx, TZ0 + 2, 75, rot=90, note='belfry balustrade')
        if y == 87:
            for f in ('front', 'back'):
                zz = TZ0 if f == 'front' else TZ1
                m.add('3307', TRIM, t0 + 1, zz, 87, note='belfry arch')
            for xx in (t0, t1):
                m.add('3307', TRIM, xx, TZ0 + 1, 87, rot=90, note='belfry arch')
        if y == 93:
            # bell mechanism: bearings, hangers, axle, bells, knob
            b1 = m.add('3700', TRIM, t0 + 3, TZ0, 93, note='bell bearing')
            b2 = m.add('3700', TRIM, t0 + 3, TZ1, 93, note='bell bearing')
            ax_y = ld(96) + 10
            hang = []
            for i, zz in enumerate((TZ0 + 2, TZ0 + 5)):
                hg = m.add('32064a', BLACK, t0 + 3, zz, 93, note='bell hanger')
                hang.append(hg)
                bx = t0 + 3 + i  # bell under one stud of the hanger
                m.add('3062b', BLACK, bx, zz, 90, note='bell yoke')
                cone = m.add('59900', PGOLD, bx, zz, 87, note='bell')
                m.link(m.raw('4740', PGOLD, (bx * 20 + 10, ld(86) - 8, zz * 20 + 10), np.eye(3), note='bell'), cone)
            # axle along z through both bearings, sticking out of the back
            axle_len = 200  # Technic axle 10
            zc = TZ0 * 20 + axle_len / 2
            axm = np.array([[0, 0, 1], [0, 1, 0], [-1, 0, 0]], dtype=float)   # local x -> world z
            ax = m.raw('3737', BLACK, (cx * 20, ax_y, zc), axm, note='bell axle')
            bush = m.raw('3713', LBG, (cx * 20, ax_y, (TZ1 + 1) * 20 + 10), np.array([[1, 0, 0], [0, 1, 0], [0, 0, -1]]), note='knob bush')
            knob = m.raw('4185a', LBG, (cx * 20, ax_y, (TZ1 + 2) * 20 + 5), np.eye(3), note='bell knob')
            for p in hang + [b1, b2, bush, knob]:
                m.link(ax, p)
        cells = [c for c in perim if c not in openings]
        cells += pil
        fill_course_levels(sorted(cells), y, 3, col, note='tower ' + name)
    # top: ring (2 plates), deck, parapet, pinnacles
    m.step(f'Tower {name} top ring', view='tower' + name)
    ring = sorted(perim)
    course(ring, 96, TRIM, kind='plate')
    course(ring, 97, TRIM, kind='plate')
    for (x, z) in pil:
        m.add('3070b', TRIM, x, z, 96, note='pilaster cap')
    m.step(f'Tower {name} roof deck', view='tower' + name)
    deck = [(x, z) for x in range(t0, t1 + 1) for z in range(TZ0, TZ1 + 1)]
    m.add('3036', DBG, t0, TZ0, 98, note='tower deck')           # 6x8 plate
    course([c for c in deck if m.free(c[0], c[1], 98)], 98, DBG, kind='plate')
    m.step(f'Tower {name} parapet', view='tower' + name)
    corners = [(t0, TZ0), (t1, TZ0), (t0, TZ1), (t1, TZ1)]
    for (x, z) in corners:
        m.add('3062b', TRIM, x, z, 99, note='pinnacle')
        m.add('3062b', TRIM, x, z, 102, note='pinnacle')
        m.add('59900', TRIM, x, z, 105, note='pinnacle')
    for (x, z) in ring:
        if (x, z) in corners:
            continue
        r = (x - t0) + (z - TZ0)
        if r % 2 == 0:
            m.add('3005', TRIM, x, z, 99, note='crenel')
            m.add('3070b', TRIM, x, z, 102, note='crenel')
        else:
            m.add('3070b', TRIM, x, z, 99, note='crenel')
    inner_deck = [(x, z) for x in range(t0 + 1, t1) for z in range(TZ0 + 1, TZ1)]
    course(inner_deck, 99, DBG, kind='tile')


tower('L', *TOWERS['L'])
tower('R', *TOWERS['R'])

# ======================================================================
# 6. FACADE CENTRE (portal, rose window, clock, gable, cross)
# ======================================================================
S('facade')
M_SNOT = snot_matrix()
FX0, FX1 = 11, 20


def facade_cells(y):
    c = set()
    for x in range(FX0, FX1 + 1):
        if y < 27 and 14 <= x <= 17:
            continue                      # main portal
        if 27 <= y < 33 and 13 <= x <= 18:
            continue                      # portal arch
        if 45 <= y < 54 and 13 <= x <= 18:
            continue                      # rose opening
        if 54 <= y < 60 and 12 <= x <= 19:
            continue                      # rose arch
        c.add((x, ZF))
    if y == 42 or y == 60:
        for x in range(13, 19):
            c.add((x, ZF + 1))            # ties the rose backing to the facade
    if 45 <= y < 60:
        for x in range(13, 19):
            if not (50 <= y < 55):
                c.add((x, ZF + 1))        # backing wall behind the rose
    return c


def rose_window():
    # three 1x2x1.667 bricks with side studs, carrying a vertical 6x6 round plate
    mounts = [m.add('22885', BLACK, x, ZF + 1, 50, note='rose mount') for x in (13, 15, 17)]
    face_z = (ZF + 1) * 20
    cy = ld(55) + 20              # between the two stud rows
    cxw = 16 * 20
    disc_pos = np.array([cxw, cy, face_z - 8])
    disc = m.raw('11213', BLACK, disc_pos, M_SNOT, note='rose window')
    for mt in mounts:
        m.link(disc, mt)
    # mosaic of 1x1 round plates on the disc studs
    for gx in range(-50, 51, 20):
        for gz in range(-50, 51, 20):
            r = math.hypot(gx, gz)
            if r > 58:
                continue
            col = TYEL if r < 20 else (TRED if r < 40 else TDBLUE)
            p = disc_pos + M_SNOT @ np.array([gx, -8, gz])
            m.link(m.raw('6141', col, p, M_SNOT, note='rose glass'), disc)


def clock():
    b = m.add('11211', WALL, 15, ZF, 63, note='clock mount')
    top = ld(66)
    jp = np.array([16 * 20, top + 10, ZF * 20 - 8])
    j = m.raw('15573', WHITE, jp, M_SNOT, note='clock')
    dp = jp + M_SNOT @ np.array([0, -8, 0])
    dface = m.raw('4740', WHITE, dp, M_SNOT, note='clock face')
    hp = dp + M_SNOT @ np.array([0, -8, 0])
    hh = m.raw('98138', BLACK, hp, M_SNOT, note='clock hands')
    m.link(j, b); m.link(dface, j); m.link(hh, dface)


for y in range(0, 72, 3):
    m.step(f'Facade y{y}', view='facade')
    col = TRIM if y in (33, 69) else WALL
    if y == 0:
        # double doors on swivel hinges
        hl = m.raw('2429c01', BLACK, (14 * 20, ld(0) - 8, ZF * 20), rotmat(0),
                   cells=[(x, ZF, 0) for x in range(12, 16)], note='door hinge',
                   top=[(x, ZF, 1) for x in range(12, 14)], bottom=[(x, ZF, 0) for x in range(12, 16)])
        hr = m.raw('2429c01', BLACK, (18 * 20, ld(0) - 8, (ZF + 1) * 20), rotmat(180),
                   cells=[(x, ZF, 0) for x in range(16, 20)], note='door hinge',
                   top=[(x, ZF, 1) for x in range(18, 20)], bottom=[(x, ZF, 0) for x in range(16, 20)])
        for h, lx in ((hl, 14), (hr, 16)):
            leaf = [m.add('3004', DOOR, lx, ZF, 1 + 3 * k, note='door leaf') for k in range(8)]
            m.add('3069b', DOOR, lx, ZF, 25, note='door leaf')
            m.link(h, leaf[0])
    if y == 27:
        m.add('3307', TRIM, 13, ZF, 27, note='portal arch')
    if y < 33:
        for px in (13, 18):
            m.add('3062b', TRIM, px, ZF - 1, y, note='portal column')
    if y == 33:
        m.add('3795', TRIM, 13, ZF - 1, 33, note='portal lintel')
    if y == 50:
        pass
    if y == 54:
        m.add('3308a', TRIM, 12, ZF, 54, note='rose arch')
    if y == 63:
        clock()
    if y in (42, 60):
        m.add('3002', col, 13, ZF, y, rot=90 if False else 0, note='rose tie')
        m.add('3002', col, 16, ZF, y, note='rose tie')
    cells = sorted(facade_cells(y))
    back = [c for c in cells if c[1] == ZF + 1 and 13 <= c[0] <= 18 and 45 <= y < 60]
    cells = [c for c in cells if c not in back]
    if y == 48:
        fill_course_levels(back, y, 2, BLACK, note='rose backing')
        fill_course_levels(cells, y, 2, col, note='facade')
        rose_window()
        fill_course_levels(sorted(c for c in facade_cells(y) if c not in back), y + 2, 1, col, note='facade')
        fill_course_levels(back, y + 2, 1, BLACK, note='rose backing')
        continue
    fill_course_levels(cells, y, 3, col, note='facade')
    if back:
        fill_course_levels(back, y, 3, BLACK, note='rose backing')

m.step('Main portal gablet', view='facade')
slope('3040b', TRIM, 13, ZF - 1, 34, '-x', note='gablet'); slope('3040b', TRIM, 17, ZF - 1, 34, '+x', note='gablet')
m.add('3004', WALL, 15, ZF - 1, 34, note='gablet')
slope('3040b', TRIM, 14, ZF - 1, 37, '-x', note='gablet'); slope('3040b', TRIM, 16, ZF - 1, 37, '+x', note='gablet')
m.add('3044c', TRIM, 15, ZF - 1, 40, rot=90, note='gablet')

# technic pins tying the towers to the nave front walls
S('facade')
m.step('Pin the towers to the nave', view='facade')
# (pins are added in the nave/tower walls via technic bricks: see pin_ties below)

# gable
m.step('Gable', view='facade')


def gable(zz, y0=72, note='gable', cross=False):
    for k in range(5):
        y = y0 + 3 * k
        xl, xr = FX0 + k, FX1 - k
        if k < 4:
            slope('3040b', TRIM, xl, zz, y, '-x', note=note)
            slope('3040b', TRIM, xr - 1, zz, y, '+x', note=note)
            mid = [(x, zz) for x in range(xl + 2, xr - 1)]
            if cross and k < 2:
                mid = [c for c in mid if c[0] not in (15, 16)]
            if cross and k == 0:
                jb = m.add('15573', WHITE, 15, zz, y, note='St Joseph plinth')
                sx = 16 * 20
                a1 = m.raw('59900', WHITE, (sx, ld(y + 1) - 24, zz * 20 + 10), np.eye(3), note='St Joseph statue')
                a2 = m.raw('6141', WHITE, (sx, ld(y + 4) - 8, zz * 20 + 10), np.eye(3), note='St Joseph statue')
                a3 = m.raw('98138', WHITE, (sx, ld(y + 5) - 8, zz * 20 + 10), np.eye(3), note='St Joseph statue')
                m.link(a1, jb); m.link(a2, a1); m.link(a3, a2)
            if mid:
                fill_course_levels(mid, y, 3, WALL, note=note)
        else:
            if cross:
                m.add('3023', TRIM, xl, zz, y, note=note)
                jb = m.add('15573', TRIM, xl, zz, y + 1, note='cross base')
                # cross: centred on the jumper stud
                cx = (xl + 1) * 20
                base = np.array([cx, ld(y + 2) - 8, zz * 20 + 10])
                chain = [jb, m.raw('6141', TRIM, base, np.eye(3), note='cross')]
                chain.append(m.raw('3005', TRIM, base + np.array([0, -24, 0]), np.eye(3), note='cross'))
                c4 = base + np.array([0, -48, 0])
                chain.append(m.raw('47905', TRIM, c4, rotmat(CROSS_ROT), note='cross'))
                for sgn in (-1, 1):
                    Ms = np.array([[0, -sgn, 0], [sgn, 0, 0], [0, 0, 1]], dtype=float)
                    m.link(m.raw('6141', TRIM, c4 + np.array([sgn * 18, 10, 0]), Ms, note='cross arm'), chain[-1])
                chain.append(m.raw('3024', TRIM, c4 + np.array([0, -8, 0]), np.eye(3), note='cross'))
                chain.append(m.raw('98138', TRIM, c4 + np.array([0, -16, 0]), np.eye(3), note='cross'))
                for a, b in zip(chain, chain[1:]):
                    m.link(a, b)
            else:
                m.add('3044c', TRIM, xl, zz, y, rot=90, note=note)


gable(ZF, cross=True)

# ======================================================================
# 7. MAIN ROOF (lifts off to reveal the nave)
# ======================================================================
S('main_roof')
SL45 = {4: '3037', 2: '3039', 1: '3040b'}
for c in range(5):
    m.step(f'Main roof course {c}', view='main_roof')
    y = CLER_TOP + 3 * c
    z0 = 19 if c == 0 else ZF + 1
    for side in ('L', 'R'):
        x = 10 + c if side == 'L' else 20 - c
        for (z, L) in run_pieces(z0, 53, (0, 2, 1, 3, 2)[c], SL45):
            slope(SL45[L], ROOF, x, z, y, '-x' if side == 'L' else '+x', note='main roof')
m.step('Main roof ridge', view='main_roof')
for (z, L) in run_pieces(ZF + 1, 53, 2, None, prefer=(4, 2)):
    m.add('3041' if L == 4 else '3043', ROOF, 15, z, CLER_TOP + 15, rot=90 if L == 4 else 0, note='ridge')

# rear gable (part of the nave, built after the roof so it can be seen)
S('rear_gable')
m.step('Rear gable', view='rear')
fill_course_levels([(x, ZREAR) for x in range(FX0, FX1 + 1)], CLER_TOP, 3, TRIM, note='rear gable')
gable(ZREAR)

# ======================================================================
# 8. APSE ROOF (hipped)
# ======================================================================
S('apse_roof')


def hip_ring(x0, x1, z0, z1, y, color):
    # corners
    slope('3045', color, x0, z0, y, '-z', note='hip') if False else None
    parts = []
    corner_rot = {('-', '-'): None}
    # place convex corners using rotations: find rotation whose footprint origin fits
    for (cx, cz, rot) in ((x0, z0, 90), (x1 - 1, z0, 0), (x1 - 1, z1 - 1, 270), (x0, z1 - 1, 180)):
        parts.append(m.add('3045', color, cx, cz, y, rot=rot, note='hip corner'))
    for (xa, xb, zz, face) in ((x0 + 2, x1 - 2, z0, '-z'), (x0 + 2, x1 - 2, z1 - 1, '+z')):
        for (x, L) in run_pieces(xa, xb, 0, None, prefer=(4, 2, 1)):
            parts.append(slope(SL45[L], color, x, zz, y, face, note='hip'))
    for (za, zb, xx, face) in ((z0 + 2, z1 - 2, x0, '-x'), (z0 + 2, z1 - 2, x1 - 1, '+x')):
        for (z, L) in run_pieces(za, zb, 0, None, prefer=(4, 2, 1)):
            parts.append(slope(SL45[L], color, xx, z, y, face, note='hip'))
    return parts


for k in range(3):
    m.step(f'Apse roof ring {k}', view='apse')
    hip_ring(ax0 + k, ax1 - k, az0 + k, az1 - k, 36 + 3 * k, ROOF)
m.step('Apse roof cap', view='apse')
m.add('3688', ROOF, ax0 + 3, az0 + 3, 45, note='apse cap')

# ======================================================================
# 9. CATHEDRAL SQUARE: garden with the statue of Our Lady, trees, fence, paving
# ======================================================================
S('square')
m.step('Garden of Our Lady', view='square')
GX0, GZ0 = 13, 2
garden = m.add('3958', GREEN, GX0, GZ0, 0, note='garden')                 # 6x6 plate
for x in range(GX0, GX0 + 6):
    for z in range(GZ0, GZ0 + 6):
        edge = x in (GX0, GX0 + 5) or z in (GZ0, GZ0 + 5)
        if edge and (x + z) % 2 == 0:
            m.link(at1('32607', DGREEN, x, z, 1, rot=90 * ((x + z) % 4), note='hedge'), garden)
        elif edge:
            m.link(at1('24866', [4, 14, 15][(x * 3 + z) % 3], x, z, 1, note='flowers'), garden)
m.step('Statue of Our Lady', view='square')
m.add('3941', LBG, GX0 + 2, GZ0 + 2, 1, note='pedestal')
m.add('3941', LBG, GX0 + 2, GZ0 + 2, 4, note='pedestal')
ped = m.add('87580', LBG, GX0 + 2, GZ0 + 2, 7, note='pedestal top')
sx, sz = (GX0 + 3) * 20, (GZ0 + 3) * 20
s1 = m.raw('59900', WHITE, (sx, ld(8) - 24, sz), np.eye(3), note='statue')
s2 = m.raw('6141', WHITE, (sx, ld(11) - 8, sz), np.eye(3), note='statue')
s3 = m.raw('98138', WHITE, (sx, ld(12) - 8, sz), np.eye(3), note='statue')
m.link(s1, ped); m.link(s2, s1); m.link(s3, s2)

m.step('Trees', view='square')


def tree(x, z, h=4):
    tr = [m.add('3062b', RB, x, z, 3 * k, note='tree trunk') for k in range(h)]
    top = np.array([x * 20 + 10, ld(3 * h), z * 20 + 10])
    prev = tr[-1]
    for i, (col, rot) in enumerate(((DGREEN, 0), (GREEN, 90), (DGREEN, 180), (GREEN, 270))):
        lf = m.raw('2417', col, top - np.array([0, 8 * (i + 1), 0]), rotmat(rot), note='tree leaves')
        m.link(lf, prev); prev = lf


tree(3, 4); tree(28, 4)
tree(1, 58); tree(30, 58)

m.step('Front fence', view='square')
for x in (0, 4, 8, 20, 24, 28):
    m.add('3633', BLACK, x, 0, 0, note='fence')
m.step('Paving', view='square')
free0 = [(x, z) for x in range(32) for z in range(64) if m.free(x, z, 0)]
path = [c for c in free0 if 14 <= c[0] <= 17 and c[1] <= 10]
course(path, 0, TAN, kind='tile')
rest = [c for c in free0 if c not in path and m.free(c[0], c[1], 0)]
course(rest, 0, LBG, kind='tile')
