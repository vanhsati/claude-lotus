import json, os, subprocess
S = json.load(open('build/steps.json'))
os.makedirs('build/steps', exist_ok=True)
shots = []
for st in S['steps']:
    az, el = st['view']
    shots.append({'file': os.path.abspath(f"build/steps/step{st['n']:03d}.jpg"), 'upto': st['idx'][-1] + 1, 'newIdx': st['idx'],
                  'fade': 0.5, 'fit': 'focus', 'minSize': 420, 'pad': 60, 'az': az, 'el': el, 'width': 1200, 'height': 900,
                  'bg': '#ffffff', 'fov': 22, 'margin': 0.88, 'jpeg': True})
json.dump({'mpd': os.path.abspath('build/hanoi_cathedral.ldr'), 'setup': {'exposure': 1.05}, 'shots': shots}, open('stjob.json', 'w'))
r = subprocess.run(['node', '../render/render.mjs', 'stjob.json'], capture_output=True, text=True)
print('\n'.join(l for l in r.stderr.splitlines() if '404' not in l)[-600:])
