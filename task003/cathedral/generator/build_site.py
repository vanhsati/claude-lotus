"""Assemble task003/cathedral/ for the GitHub Pages gallery."""
import json, os, shutil, csv
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, '../cath/build')
OUT = os.path.join(HERE, 'cathedral')
shutil.rmtree(OUT, ignore_errors=True)
for d in ('renders', 'parts', 'instructions', 'model'):
    os.makedirs(f'{OUT}/{d}')
S = json.load(open(f'{B}/steps.json'))
info, notes, sec = S['info'], S['notes'], S['sections']
N = len(info)
idx = lambda f: [i for i in range(N) if f(i)]
VI = {'Base': 'Đế', 'Nave floor, pews and altar': 'Sàn gian giữa, ghế và bàn thờ', 'Nave, aisles and apse walls': 'Tường gian giữa, gian bên và hậu cung',
      'Aisle roofs': 'Mái gian bên', 'Left bell tower': 'Tháp chuông trái', 'Right bell tower': 'Tháp chuông phải', 'Main facade': 'Mặt tiền',
      'Lift-off nave roof': 'Mái gian giữa (nhấc ra được)', 'Rear gable': 'Đầu hồi sau', 'Apse roof': 'Mái hậu cung', 'Cathedral square': 'Quảng trường nhà thờ'}
step_of = [0] * N
steps = []
for k, st in enumerate(S['steps']):
    for i in st['idx']:
        step_of[i] = k
    steps.append({'title': VI[st['title']], 'count': len(st['idx'])})
leaves = lambda s: idx(lambda i: notes[i] == 'door leaf' and info[i][3] == s)
cl = leaves('facade')
axle_y = -96 * 8 + 10
bell = ('bell hanger', 'bell yoke', 'bell')
movers = {
    'doorC1': {'idx': [i for i in cl if info[i][2][0] < 320], 'axis': 'y', 'pivot': [280, 0, 220], 'open': 80},
    'doorC2': {'idx': [i for i in cl if info[i][2][0] >= 320], 'axis': 'y', 'pivot': [360, 0, 240], 'open': 70},
    'doorL': {'idx': leaves('towerL'), 'axis': 'y', 'pivot': [120, 0, 220], 'open': 80},
    'doorR': {'idx': leaves('towerR'), 'axis': 'y', 'pivot': [520, 0, 240], 'open': 70},
    'bellsL': {'idx': idx(lambda i: notes[i] in bell and info[i][3] == 'towerL'), 'axis': 'z', 'pivot': [140, axle_y, 0]},
    'bellsR': {'idx': idx(lambda i: notes[i] in bell and info[i][3] == 'towerR'), 'axis': 'z', 'pivot': [500, axle_y, 0]},
    'roof': {'idx': sec['main_roof']},
}
meta = {'stepOf': step_of, 'steps': steps, 'movers': movers}
mpd = open(f'{B}/hanoi_cathedral.mpd').read()
ldc = '\n'.join(l for l in open(os.path.join(HERE, '../ldraw/LDConfig.ldr')).read().split('\n') if l.startswith('0 !COLOUR'))
for t in (mpd, ldc):
    assert '</script' not in t.lower()
html = open(os.path.join(HERE, 'viewer.template.html')).read()
html = html.replace('/*META*/', json.dumps(meta, separators=(',', ':'))).replace('/*MPD*/', mpd).replace('/*LDCONFIG*/', ldc)
open(f'{OUT}/index.html', 'w').write(html)
# renders (JPEG, web size)
for f in sorted(os.listdir(f'{B}/renders')):
    im = Image.open(f'{B}/renders/{f}')
    im.thumbnail((1800, 1200), Image.LANCZOS)
    im.save(f'{OUT}/renders/' + f.replace('_', '-'), quality=86, optimize=True)
shutil.copy(f'{B}/instruction_manual.pdf', f'{OUT}/instructions/Hanoi-Cathedral-Instructions.pdf')
shutil.copy(f'{B}/hanoi_cathedral.mpd', f'{OUT}/hanoi-cathedral.mpd')
shutil.copy(f'{B}/hanoi_cathedral.ldr', f'{OUT}/model/hanoi-cathedral.ldr')
shutil.copy(f'{B}/bricklink_wanted_list.xml', f'{OUT}/parts/bricklink-wanted-list.xml')
shutil.copy(f'{B}/parts_list.csv', f'{OUT}/parts/parts-list.csv')
shutil.copy(f'{B}/rebrickable_parts.csv', f'{OUT}/parts/rebrickable-parts.csv')
inv = json.load(open(f'{B}/inventory.json'))
total = sum(r['quantity'] for r in inv)
md = ['# Parts list — Hanoi St. Joseph\'s Cathedral', '',
      f'{total:,} pieces in {len(inv)} lots ({len({r["ldraw_part"] for r in inv})} different moulds).', '',
      'To order: upload `bricklink-wanted-list.xml` at BrickLink (Want > Upload), or import `rebrickable-parts.csv` on Rebrickable.', '',
      '| Qty | Part | Description | Colour (BrickLink / LEGO) |', '|---:|---|---|---|']
for r in inv:
    md.append(f"| {r['quantity']} | [{r['bricklink_item']}](https://www.bricklink.com/v2/catalog/catalogitem.page?P={r['bricklink_item']}&idColor={r['bricklink_color_id']}) | {r['description']} | {r['bricklink_color']} / {r['lego_color']} |")
open(f'{OUT}/parts/parts-list.md', 'w').write('\n'.join(md) + '\n')
json.dump({'parts': N, 'lots': len(inv), 'steps': len(steps)}, open(f'{OUT}/stats.json', 'w'))
print('pieces', N, total, 'lots', len(inv), 'steps', len(steps), 'viewer MB', round(len(html) / 1e6, 2), {k: len(v['idx']) for k, v in movers.items()})
