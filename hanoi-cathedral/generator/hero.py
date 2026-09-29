import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
S = json.load(open('build/steps.json'))
info, notes, sec = S['info'], S['notes'], S['sections']
N = len(info)
idx = lambda f: [i for i in range(N) if f(i)]
roof = sec['main_roof']
# doors
def leaves(section):
    return idx(lambda i: notes[i] == 'door leaf' and info[i][3] == section)
cl = leaves('facade')
cl_left = [i for i in cl if info[i][2][0] < 320]
cl_right = [i for i in cl if info[i][2][0] >= 320]
tl, tr = leaves('towerL'), leaves('towerR')
door_tf = [
    {'idx': cl_left, 'axis': [0, 1, 0], 'pivot': [280, 0, 220], 'angle': 80},
    {'idx': cl_right, 'axis': [0, 1, 0], 'pivot': [360, 0, 240], 'angle': 70},
    {'idx': tl, 'axis': [0, 1, 0], 'pivot': [120, 0, 220], 'angle': 80},
    {'idx': tr, 'axis': [0, 1, 0], 'pivot': [26 * 20, 0, 240], 'angle': 70},
]
bell_notes = ('bell hanger', 'bell yoke', 'bell')
axle_y = -96 * 8 + 10
bells_L = idx(lambda i: notes[i] in bell_notes and info[i][3] == 'towerL')
bells_R = idx(lambda i: notes[i] in bell_notes and info[i][3] == 'towerR')
bell_tf = [{'idx': bells_L, 'axis': [0, 0, 1], 'pivot': [140, axle_y, 0], 'angle': 14},
           {'idx': bells_R, 'axis': [0, 0, 1], 'pivot': [500, axle_y, 0], 'angle': -14}]
roof_tf = [{'idx': roof, 'axis': [0, 1, 0], 'angle': 0, 'offset': [0, -650, 0]}]
belfry_L = idx(lambda i: info[i][3] in ('towerL',) and -100 * 8 < info[i][2][1] < -72 * 8)

W, H = 3600, 2400
shots = [
    dict(name='hero_front', az=28, el=16, fov=24, margin=0.86),
    dict(name='hero_facade', az=0, el=6, fov=20, margin=0.88),
    dict(name='hero_aerial_rear', az=212, el=34, fov=24, margin=0.86),
    dict(name='hero_side', az=90, el=12, fov=22, margin=0.9),
    dict(name='feature_roof_lifted', az=62, el=48, fov=26, margin=0.86, transforms=roof_tf),
    dict(name='feature_doors_open', az=18, el=14, fov=18, margin=0.9, transforms=door_tf,
         fitIdx=idx(lambda i: info[i][3] in ('facade', 'towerL', 'towerR') and info[i][2][1] > -40 * 8 and info[i][2][2] < 300)),
    dict(name='feature_bells', az=0, el=0, fov=18, margin=0.75, transforms=bell_tf, fitIdx=belfry_L),
]
only = sys.argv[1:]
job = []
for s in shots:
    if only and s['name'] not in only:
        continue
    s = dict(s)
    s['file'] = os.path.abspath(f"build/renders/{s.pop('name')}.png")
    s.update(width=W, height=H)
    job.append(s)
os.makedirs('build/renders', exist_ok=True)
json.dump({'mpd': os.path.abspath('build/hanoi_cathedral.ldr'),
           'setup': {'shadows': True, 'ground': True, 'groundY': -8, 'sun': 2.4, 'env': 0.55, 'hemi': 0.55, 'exposure': 1.05},
           'shots': job}, open('hjob.json', 'w'))
r = subprocess.run(['node', '../render/render.mjs', 'hjob.json'], capture_output=True, text=True)
print('\n'.join(l for l in r.stderr.splitlines() if '404' not in l)[-800:])
# composite on a soft sky gradient
for s in job:
    im = Image.open(s['file']).convert('RGBA')
    bb = im.getchannel('A').point(lambda a: 255 if a > 150 else 0).getbbox()
    if bb:
        cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
        w, h = (bb[2] - bb[0]) * 1.12, (bb[3] - bb[1]) * 1.12
        if w / h < 1.5: w = h * 1.5
        else: h = w / 1.5
        im = im.crop((int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2))).resize((2400, 1600), Image.LANCZOS)
    bg = Image.new('RGBA', im.size)
    dr = ImageDraw.Draw(bg)
    top, bot = (200, 214, 228), (246, 241, 232)
    for yy in range(im.size[1]):
        t = yy / im.size[1]
        dr.line([(0, yy), (im.size[0], yy)], fill=tuple(int(top[k] * (1 - t) + bot[k] * t) for k in range(3)) + (255,))
    bg.alpha_composite(im)
    bg.convert('RGB').save(s['file'].replace('.png', '.jpg'), quality=92)
    os.remove(s['file'])
print('done')
