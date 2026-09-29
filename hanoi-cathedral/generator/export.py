"""Export the cathedral: stepped LDraw file, packed MPD, parts lists, and step metadata."""
import json, math, os, collections, csv
from xml.sax.saxutils import escape
import design as d
import ldraw

OUT = os.path.abspath('build')
os.makedirs(OUT, exist_ok=True)
m = d.m
MAXP = 18

# ---------------------------------------------------------------- colours
COLORS = {  # ldraw: (BrickLink id, BrickLink name, LEGO name)
    0: (11, 'Black', 'Black'),
    2: (6, 'Green', 'Dark Green'),
    4: (5, 'Red', 'Bright Red'),
    14: (3, 'Yellow', 'Bright Yellow'),
    15: (1, 'White', 'White'),
    19: (2, 'Tan', 'Brick Yellow'),
    33: (14, 'Trans-Dark Blue', 'Transparent Blue'),
    36: (17, 'Trans-Red', 'Transparent Red'),
    46: (19, 'Trans-Yellow', 'Transparent Yellow'),
    70: (88, 'Reddish Brown', 'Reddish Brown'),
    71: (86, 'Light Bluish Gray', 'Medium Stone Grey'),
    72: (85, 'Dark Bluish Gray', 'Dark Stone Grey'),
    288: (80, 'Dark Green', 'Earth Green'),
    297: (115, 'Pearl Gold', 'Warm Gold'),
    320: (59, 'Dark Red', 'Dark Red'),
}
# LDraw part -> BrickLink item number (only where they differ)
BL_PART = {'3040b': '3040', '3044c': '3044c', '32064a': '32064', '4185a': '4185', '3308a': '3308',
           '2429c01': '2429c01'}
# LDraw part -> LEGO design ID (Pick a Brick search), where it differs
LEGO_DESIGN = {'3040b': '3040', '32064a': '32064', '4185a': '4185', '3308a': '3308', '2429c01': '2429/2430',
               '3068b': '3068', '3069b': '3069', '3070b': '3070', '3062b': '3062', '87079': '87079'}

SECTION_TITLE = {
    'base': 'Base', 'interior': 'Nave floor, pews and altar', 'nave': 'Nave, aisles and apse walls',
    'aisle_roof': 'Aisle roofs', 'towerL': 'Left bell tower', 'towerR': 'Right bell tower',
    'facade': 'Main facade', 'main_roof': 'Lift-off nave roof', 'rear_gable': 'Rear gable',
    'apse_roof': 'Apse roof', 'square': 'Cathedral square'}
VIEW = {  # azimuth, elevation (degrees). az 0 = looking at the facade
    'base': (30, 50), 'interior': (35, 55), 'nave': (35, 40), 'aisle_roof': (55, 40),
    'towerL': (-30, 22), 'towerR': (30, 22), 'facade': (10, 18), 'main_roof': (50, 38),
    'rear_gable': (205, 28), 'apse_roof': (200, 35), 'square': (20, 38)}


def pick_view(sec, ps):
    az, el = VIEW.get(sec, (30, 30))
    if sec in ('nave', 'aisle_roof', 'main_roof', 'interior', 'square'):
        xs = [c[0] for p in ps for c in p.cells] or [16]
        zs = [c[1] for p in ps for c in p.cells] or [30]
        cx, cz = sum(xs) / len(xs), sum(zs) / len(zs)
        side = 1 if cx >= 15.5 else -1
        if sec == 'nave' and cz > 52:
            return (180 - 35 * side, 35)
        return (side * abs(az), el)
    return (az, el)


def cell_key(p):
    if p.cells:
        c = min(p.cells, key=lambda c: (c[2], c[1], c[0]))
        return (c[2], c[1], c[0])
    return (-p.pos[1] / 8, p.pos[2] / 20, p.pos[0] / 20)


# ---------------------------------------------------------------- split steps
by_step = collections.defaultdict(list)
for p in m.parts:
    by_step[p.step].append(p)
final = []   # list of (section, [parts])
for s in sorted(by_step):
    ps = by_step[s]
    sec = m.step_meta[s]['section'] if s in m.step_meta else ps[0].section
    if len(ps) <= MAXP:
        final.append((sec, ps))
        continue
    # group spatially: by plate level first, then along z/x
    ps = sorted(ps, key=lambda p: (cell_key(p)[0], cell_key(p)[1], cell_key(p)[2]))
    k = math.ceil(len(ps) / MAXP)
    n = math.ceil(len(ps) / k)
    for i in range(k):
        final.append((sec, ps[i * n:(i + 1) * n]))
# merge tiny consecutive steps in the same section (<=2 parts) into the previous step
merged = []
for sec, ps in final:
    if merged and merged[-1][0] == sec and (len(ps) <= 2 or len(merged[-1][1]) <= 2) and len(merged[-1][1]) + len(ps) <= MAXP:
        merged[-1] = (sec, merged[-1][1] + ps)
    else:
        merged.append((sec, ps))
final = merged

# ---------------------------------------------------------------- LDraw output
lines = ['0 St. Joseph\'s Cathedral, Hanoi', '0 Name: hanoi_cathedral.ldr', '0 Author: Claude (generated)',
         '0 !LDRAW_ORG Unofficial_Model', '0 !LICENSE Licensed under CC BY 4.0', '']
order = []
steps_meta = []
idx = 0
for i, (sec, ps) in enumerate(final):
    cur = []
    for p in ps:
        lines.append(m.ldr_line(p))
        cur.append(idx)
        order.append(p)
        idx += 1
    lines.append('0 STEP')
    cnt = collections.Counter((p.part, p.color) for p in ps)
    steps_meta.append({'n': i + 1, 'section': sec, 'title': SECTION_TITLE.get(sec, sec), 'idx': cur,
                       'parts': [[pt, c, q] for (pt, c), q in sorted(cnt.items(), key=lambda kv: (-kv[1], kv[0]))],
                       'view': pick_view(sec, ps)})
ldr = '\n'.join(lines) + '\n'
open(os.path.join(OUT, 'hanoi_cathedral.ldr'), 'w').write(ldr)
open(os.path.join(OUT, 'hanoi_cathedral.mpd'), 'w').write(
    ldraw.pack('hanoi_cathedral.ldr', ldr, {p.part + '.dat' for p in m.parts}))

# section membership per final-part index (for context fitting)
sec_idx = collections.defaultdict(list)
for i, p in enumerate(order):
    sec_idx[p.section].append(i)
json.dump({'steps': steps_meta, 'sections': sec_idx,
           'notes': [p.note for p in order],
           'info': [[p.part, p.color, list(map(float, p.pos)), p.section] for p in order]}, open(os.path.join(OUT, 'steps.json'), 'w'))

# ---------------------------------------------------------------- parts lists
inv = collections.Counter((p.part, p.color) for p in m.parts)
rows = []
for (pt, c), q in sorted(inv.items(), key=lambda kv: (COLORS[kv[0][1]][1], kv[0][0])):
    bl_c, bl_name, lego_name = COLORS[c]
    rows.append({'ldraw_part': pt, 'bricklink_item': BL_PART.get(pt, pt), 'lego_design_id': LEGO_DESIGN.get(pt, pt),
                 'description': ldraw.description(pt + '.dat').replace('  ', ' ').strip(),
                 'ldraw_color': c, 'bricklink_color_id': bl_c, 'bricklink_color': bl_name,
                 'lego_color': lego_name, 'quantity': q})
with open(os.path.join(OUT, 'parts_list.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader(); w.writerows(rows)
# BrickLink wanted list XML (Upload at bricklink.com > Want > Upload)
xml = ['<INVENTORY>']
for r in rows:
    xml.append('  <ITEM><ITEMTYPE>P</ITEMTYPE><ITEMID>%s</ITEMID><COLOR>%d</COLOR><MINQTY>%d</MINQTY><CONDITION>N</CONDITION></ITEM>'
               % (escape(r['bricklink_item']), r['bricklink_color_id'], r['quantity']))
xml.append('</INVENTORY>')
open(os.path.join(OUT, 'bricklink_wanted_list.xml'), 'w').write('\n'.join(xml) + '\n')
# Rebrickable-style CSV (Part,Color,Quantity) using LDraw colour ids, which Rebrickable accepts
with open(os.path.join(OUT, 'rebrickable_parts.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['Part', 'Color', 'Quantity'])
    for r in rows:
        w.writerow([r['bricklink_item'], r['ldraw_color'], r['quantity']])

json.dump(rows, open(os.path.join(OUT, 'inventory.json'), 'w'))
print(len(final), 'steps;', len(m.parts), 'parts;', len(rows), 'lots')
