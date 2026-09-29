import json, os, subprocess
inv = json.load(open('build/inventory.json'))
lines = ['0 thumbs', '0 Name: thumbs.ldr']
shots = []
os.makedirs('build/thumbs', exist_ok=True)
for i, r in enumerate(inv):
    lines.append(f"1 {r['ldraw_color']} 0 0 0 1 0 0 0 1 0 0 0 1 {r['ldraw_part']}.dat")
    lines.append('0 STEP')
    shots.append({'file': os.path.abspath(f"build/thumbs/{r['ldraw_part']}_{r['ldraw_color']}.png"), 'onlyIdx': [i],
                  'az': 35, 'el': 30, 'width': 220, 'height': 220, 'fov': 20, 'margin': 0.82})
open('build/thumbs.ldr', 'w').write('\n'.join(lines) + '\n')
json.dump({'mpd': os.path.abspath('build/thumbs.ldr'), 'setup': {'exposure': 1.05}, 'shots': shots}, open('tjob.json', 'w'))
r = subprocess.run(['node', '../render/render.mjs', 'tjob.json'], capture_output=True, text=True)
print('\n'.join(l for l in r.stderr.splitlines() if '404' not in l)[-800:])
