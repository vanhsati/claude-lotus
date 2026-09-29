"""Grid-based LDraw model builder with collision and connectivity checks.

Coordinates: x (studs, +right), z (studs, +towards the back), y (plates, +up; 0 = top of the base).
Placement is by the minimum corner of the part's rotated footprint and the level of its underside.
"""
import math
from collections import defaultdict
import numpy as np
import ldraw

STUD, PLATE = 20, 8

# Parts whose top has no studs anywhere.
NO_STUD_WORDS = ('Tile', 'Slope Brick Curved', 'Slope Brick 31', 'Double',
                 'Bar ', 'Technic Axle', 'Fence', 'Minifig', 'Arch  1 x  5 x  4', 'Round Corner')


def rotmat(rot):
    a = math.radians(rot)
    c, s = round(math.cos(a)), round(math.sin(a))
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=float)


class PartInfo:
    _cache = {}

    @classmethod
    def get(cls, part):
        if part not in cls._cache:
            cls._cache[part] = cls(part)
        return cls._cache[part]

    def __init__(self, part):
        self.part = part
        self.file = part + '.dat'
        self.desc = ldraw.description(self.file)
        lo, hi = ldraw.bbox(self.file)
        self.lo, self.hi = lo, hi
        self.h = max(1, round((hi[1] - lo[1]) / PLATE - 0.25))  # body height in plates
        self.bottom = hi[1]                                         # LDraw y of underside
        # footprint in local LDraw x/z, snapped to half studs
        self.x0 = math.floor(lo[0] / 10 + 0.3) * 10
        self.x1 = math.ceil(hi[0] / 10 - 0.3) * 10
        self.z0 = math.floor(lo[2] / 10 + 0.3) * 10
        self.z1 = math.ceil(hi[2] / 10 - 0.3) * 10
        d = self.desc
        self.studs_top = 'all'
        if 'Double Convex' in d:
            self.studs_top = 'origin_cell'
        elif any(w in d for w in NO_STUD_WORDS):
            self.studs_top = 'none'
        elif d.startswith('Slope Brick') and 'Inverted' not in d:
            self.studs_top = 'origin_row'
        elif d.startswith('Slope Brick') and 'Inverted' in d:
            self.studs_top = 'all'


class Placed:
    __slots__ = ('part', 'color', 'mat', 'pos', 'cells', 'top_studs', 'bottom_cells', 'step',
                 'section', 'idx', 'note', 'group')


class Model:
    def __init__(self):
        self.parts = []
        self.occ = {}                # cell -> part index
        self.step_label = None
        self.section = 'main'
        self.links = []              # explicit (a, b) connections for SNOT / technic
        self.errors = []
        self.group = None
        self.cur_step = 0
        self.step_meta = {}          # step -> dict(section, title, camera...)
        self.allow_overlap = False

    # ---- steps -------------------------------------------------------
    def step(self, title=None, **meta):
        """Start a new instruction step."""
        if self.cur_step == 0 or any(p.step == self.cur_step for p in self.parts[-200:]):
            self.cur_step += 1
        self.step_meta[self.cur_step] = dict(section=self.section, title=title, **meta)
        return self.cur_step

    # ---- placement ---------------------------------------------------
    def add(self, part, color, x, z, y, rot=0, occ=None, studs=None, note=None, check=True):
        info = PartInfo.get(part)
        R = rotmat(rot)
        # rotated footprint corners
        cs = np.array([[info.x0, 0, info.z0], [info.x1, 0, info.z0],
                       [info.x0, 0, info.z1], [info.x1, 0, info.z1]], dtype=float) @ R.T
        mnx, mnz = cs[:, 0].min(), cs[:, 2].min()
        mxx, mxz = cs[:, 0].max(), cs[:, 2].max()
        ox = x * STUD - mnx
        oz = z * STUD - mnz
        oy = -y * PLATE - info.bottom
        p = Placed()
        p.part, p.color, p.mat, p.pos = part, color, R, (ox, oy, oz)
        p.step, p.section, p.note, p.group = self.cur_step, self.section, note, self.group
        w = int(round((mxx - mnx) / STUD)); d = int(round((mxz - mnz) / STUD))
        fx = round((mxx - mnx) / 10) % 2 == 1
        fz = round((mxz - mnz) / 10) % 2 == 1
        # occupancy
        cells = []
        if occ is None:
            boxes = [(0, 0, 0, max(w, 1), max(d, 1), info.h)]
        elif occ == 'none':
            boxes = []
        else:
            boxes = occ  # list of (x, z, y, w, d, h) in rotated/world-aligned local cells
        for (bx, bz, by, bw, bd, bh) in boxes:
            for i in range(bx, bx + bw):
                for k in range(bz, bz + bd):
                    for j in range(by, by + bh):
                        cells.append((x + i, z + k, y + j))
        p.cells = cells
        p.idx = len(self.parts)
        if check and not self.allow_overlap:
            for c in cells:
                if c in self.occ:
                    o = self.parts[self.occ[c]]
                    self.errors.append(f'collision: {part} c{color} at {c} with {o.part} (#{o.idx}, {o.note or o.section})'
                                       f' [{note or self.section}]')
                    break
        for c in cells:
            self.occ[c] = p.idx
        # stud / anti-stud cells (for connectivity)
        top = y + info.h
        if studs is not None:
            p.top_studs = [(x + a, z + b, top) for (a, b) in studs]
        elif info.studs_top == 'none':
            p.top_studs = []
        elif info.studs_top == 'origin_cell':
            p.top_studs = []
            for i in range(w):
                for k in range(d):
                    cx = x * STUD + i * STUD + 10 - ox
                    cz = z * STUD + k * STUD + 10 - oz
                    if abs(cx) < 10.5 and abs(cz) < 10.5:
                        p.top_studs.append((x + i, z + k, top))
        elif info.studs_top == 'origin_row':
            # cells whose centre lies within one stud-width row containing the origin
            p.top_studs = []
            for i in range(w):
                for k in range(d):
                    cx = x * STUD + i * STUD + 10 - ox
                    cz = z * STUD + k * STUD + 10 - oz
                    loc = R.T @ np.array([cx, 0, cz])
                    if abs(loc[2]) < 10.5:
                        p.top_studs.append((x + i, z + k, top))
        else:
            p.top_studs = [(x + i, z + k, top) for i in range(w) for k in range(d)]
        p.bottom_cells = [(x + i, z + k, y) for i in range(max(w, 1)) for k in range(max(d, 1))]
        self.parts.append(p)
        return p

    def raw(self, part, color, pos, mat, cells=(), note=None, top=(), bottom=()):
        """Place with explicit LDraw position/matrix (for technic, bars, angled parts)."""
        p = Placed()
        p.part, p.color, p.mat, p.pos = part, color, np.array(mat, dtype=float).reshape(3, 3), tuple(pos)
        p.step, p.section, p.note, p.group = self.cur_step, self.section, note, self.group
        p.cells = list(cells)
        p.idx = len(self.parts)
        for c in p.cells:
            if c in self.occ and not self.allow_overlap:
                o = self.parts[self.occ[c]]
                self.errors.append(f'collision(raw): {part} at {c} with {o.part} (#{o.idx}, {o.note or o.section})')
                break
            self.occ[c] = p.idx
        p.top_studs, p.bottom_cells = list(top), list(bottom)
        self.parts.append(p)
        return p

    def link(self, a, b):
        self.links.append((a.idx if hasattr(a, 'idx') else a, b.idx if hasattr(b, 'idx') else b))

    def free(self, x, z, y, w=1, d=1, h=1):
        return all((i, k, j) not in self.occ for i in range(x, x + w) for k in range(z, z + d) for j in range(y, y + h))

    # ---- analysis ----------------------------------------------------
    def connectivity(self, roots):
        stud_at = {}
        for p in self.parts:
            for c in p.top_studs:
                stud_at[c] = p.idx
        adj = defaultdict(set)
        for p in self.parts:
            for c in p.bottom_cells:
                q = stud_at.get(c)
                if q is not None and q != p.idx:
                    adj[p.idx].add(q); adj[q].add(p.idx)
        for a, b in self.links:
            adj[a].add(b); adj[b].add(a)
        seen = set(roots)
        todo = list(roots)
        while todo:
            n = todo.pop()
            for m in adj[n]:
                if m not in seen:
                    seen.add(m); todo.append(m)
        return [p for p in self.parts if p.idx not in seen], adj

    # ---- output ------------------------------------------------------
    def ldr_line(self, p):
        m = p.mat.flatten()
        f = lambda v: ('%.3f' % v).rstrip('0').rstrip('.') if abs(v - round(v)) > 1e-6 else str(int(round(v)))
        return '1 %d %s %s %s %s %s.dat' % (p.color, f(p.pos[0]), f(p.pos[1]), f(p.pos[2]),
                                             ' '.join(f(v) for v in m), p.part)

    def to_ldr(self, name, author='Claude', upto=None, steps=True, header_extra=()):
        out = [f'0 {name}', f'0 Name: {name}.ldr', f'0 Author: {author}', '0 !LDRAW_ORG Unofficial_Model', *header_extra]
        cur = None
        for p in sorted(self.parts, key=lambda p: (p.step, p.idx)):
            if upto is not None and p.step > upto:
                break
            if steps and cur is not None and p.step != cur:
                out.append('0 STEP')
            cur = p.step
            out.append(self.ldr_line(p))
        out.append('0 STEP' if steps else '')
        return '\n'.join(out) + '\n'
