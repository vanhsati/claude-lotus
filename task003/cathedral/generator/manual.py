"""Build the instruction manual as HTML, then print it to PDF with Chromium."""
import json, os, html, subprocess
from collections import OrderedDict

B = os.path.abspath('build')
S = json.load(open(f'{B}/steps.json'))
inv = json.load(open(f'{B}/inventory.json'))
steps = S['steps']
CN = {r['ldraw_color']: r['bricklink_color'] for r in inv}
DESC = {r['ldraw_part']: r['description'] for r in inv}
BL = {r['ldraw_part']: r['bricklink_item'] for r in inv}
total = sum(r['quantity'] for r in inv)

css = """
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1d2330; }
.page { width: 297mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always; padding: 10mm 12mm; background: #fff; }
.cover { padding: 0; background: #dfe6ee; }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover .t { position: absolute; left: 14mm; top: 12mm; }
.cover h1 { font-size: 30pt; margin: 0; letter-spacing: .5px; }
.cover h2 { font-size: 14pt; font-weight: 400; margin: 2mm 0 0; color: #3a4658; }
.cover .badge { position: absolute; right: 14mm; bottom: 12mm; background: #1d2330; color: #fff; padding: 4mm 6mm; border-radius: 3mm; font-size: 13pt; }
h3 { margin: 0 0 4mm; font-size: 16pt; }
p, li { font-size: 10.5pt; line-height: 1.45; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; height: 100%; }
.stepgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; height: 182mm; }
.step { position: relative; border: 0.3mm solid #d9dee6; border-radius: 3mm; padding: 3mm; display: flex; flex-direction: column; }
.step .num { position: absolute; left: 4mm; top: 3mm; font-size: 26pt; font-weight: 700; color: #1d2330; }
.step .callout { margin-left: 18mm; display: flex; flex-wrap: wrap; gap: 1.5mm; background: #eef3fa; border: 0.3mm solid #b8c7dc; border-radius: 2mm; padding: 1.5mm; align-self: flex-start; max-width: calc(100% - 18mm); }
.pc { display: flex; flex-direction: column; align-items: center; width: 15mm; }
.pc img { width: 14mm; height: 14mm; object-fit: contain; }
.pc span { font-size: 8pt; font-weight: 700; }
.step .img { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.step .img img { max-width: 100%; max-height: 100%; object-fit: contain; }
.footer { position: absolute; bottom: 4mm; left: 12mm; right: 12mm; display: flex; justify-content: space-between; font-size: 8pt; color: #7a8599; }
.sec { position: absolute; right: 12mm; top: 4mm; font-size: 9pt; color: #7a8599; text-transform: uppercase; letter-spacing: 1px; }
.inv { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2mm; }
.inv div { border: 0.3mm solid #e1e5ec; border-radius: 1.5mm; padding: 1mm; text-align: center; font-size: 6.5pt; }
.inv img { width: 17mm; height: 17mm; object-fit: contain; display: block; margin: 0 auto; }
.inv b { font-size: 9pt; }
.feat img { width: 100%; height: 72mm; object-fit: cover; border-radius: 2mm; }
.feat .cap { font-size: 9.5pt; margin: 1.5mm 0 4mm; }
.tip { background: #fff6dd; border-left: 1.5mm solid #e8b400; padding: 2mm 3mm; font-size: 9.5pt; margin-top: 2mm; }
"""

def thumb(p, c):
    return f'thumbs/{p}_{c}.png'

pages = []
pages.append(f"""<div class="page cover"><img src="renders/hero_front.jpg">
<div class="t"><h1>St. Joseph's Cathedral</h1><h2>Nhà thờ Lớn Hà Nội &middot; Hanoi, Vietnam &middot; 1886</h2></div>
<div class="badge">{total:,} pieces &middot; approx. 1:100</div></div>""")

pages.append(f"""<div class="page"><div class="two"><div>
<h3>About this model</h3>
<p>St. Joseph's Cathedral was completed in 1886 in the Gothic Revival style, modelled on Notre-Dame de Paris. Its twin bell towers rise 31.5&nbsp;m over a nave 64.5&nbsp;m long and 20.5&nbsp;m wide.</p>
<p>This model is built at roughly 1:100 on a 32&nbsp;&times;&nbsp;64-stud footprint (26&nbsp;&times;&nbsp;51&nbsp;cm). The towers stand about 34&nbsp;cm tall. The nave length is compressed to five bays so the set stays under 3,000 pieces.</p>
<h3 style="margin-top:6mm">Features</h3>
<ul>
<li><b>Swinging bells.</b> Each belfry holds two gold bells on a Technic axle. Turn the grey wheel on the back of each tower to rock them.</li>
<li><b>Opening doors.</b> All four portal doors sit on swivel hinge plates. The left door of each pair opens outwards and the right door opens inwards, which is how the hinge plate is built.</li>
<li><b>Lift-off nave roof.</b> The whole main roof (121 pieces) comes off in one piece to show the arcaded nave, pews, red aisle carpet and the altar.</li>
<li><b>Light-ready interior.</b> More than 450 stained-glass pieces are transparent, so an LED kit makes every window glow. A Technic brick low in the rear wall is the cable port.</li>
<li>Rose window, clock, St. Joseph in the gable niche, the garden statue of Our Lady, trees and the street fence.</li>
</ul>
<div class="tip">Parts are called out in the blue box of every step. New parts are shown in full colour; everything built earlier is drawn pale.</div>
</div><div class="feat">
<img src="renders/feature_roof_lifted.jpg"><div class="cap">The nave roof lifts off in one piece.</div>
<img src="renders/feature_doors_open.jpg"><div class="cap">Portal doors on swivel hinges.</div>
</div></div></div>""")

pages.append("""<div class="page"><div class="two"><div class="feat">
<img src="renders/feature_bells.jpg"><div class="cap">Turn the wheel behind each tower to swing its bells.</div>
<img src="renders/hero_aerial_rear.jpg"><div class="cap">Rear view: aisles, clerestory and the hipped apse.</div>
</div><div class="feat">
<img src="renders/hero_facade.jpg" style="height:150mm;object-fit:contain;background:#e6ebf1"><div class="cap">Main facade.</div>
</div></div></div>""")

# steps: 2 per page
cur_sec = None
for i in range(0, len(steps), 2):
    cells = []
    for st in steps[i:i + 2]:
        callout = ''.join(f'<div class="pc"><img src="{thumb(p, c)}"><span>{q}x</span></div>' for p, c, q in st['parts'])
        cells.append(f"""<div class="step"><div class="num">{st['n']}</div><div class="callout">{callout}</div>
<div class="img"><img src="steps/step{st['n']:03d}.jpg"></div></div>""")
    sec = html.escape(steps[i]['title'])
    pn = len(pages) + 1
    pages.append(f"""<div class="page"><div class="sec">{sec}</div><div class="stepgrid" style="margin-top:3mm">{''.join(cells)}</div>
<div class="footer"><span>St. Joseph's Cathedral, Hanoi</span><span>{pn}</span></div></div>""")

pages.append("""<div class="page"><div class="two"><div>
<h3>Finished!</h3>
<p>Turn the wheels at the back of the towers to ring the bells, open the portals, and lift the nave roof to look inside.</p>
<p><b>Adding lights:</b> lift off the nave roof and run a LED strip along the tops of the clerestory walls, with small LEDs behind the rose window and in each belfry. Feed the cable out through the Technic brick in the rear wall at floor level.</p>
</div><div class="feat"><img src="renders/hero_side.jpg" style="height:150mm;object-fit:contain;background:#e6ebf1"></div></div></div>""")

# inventory, 40 per page
rows = sorted(inv, key=lambda r: (r['bricklink_color'], r['ldraw_part']))
for i in range(0, len(rows), 40):
    items = ''.join(f"""<div><img src="{thumb(r['ldraw_part'], r['ldraw_color'])}"><b>{r['quantity']}x</b><br>{html.escape(r['bricklink_item'])}<br>{html.escape(r['bricklink_color'])}</div>""" for r in rows[i:i + 40])
    pages.append(f"""<div class="page"><h3>Parts inventory ({total:,} pieces, {len(inv)} lots) &middot; BrickLink part number and colour</h3><div class="inv">{items}</div></div>""")

doc = f"<!doctype html><html><head><meta charset='utf-8'><style>{css}</style></head><body>{''.join(pages)}</body></html>"
open(f'{B}/manual.html', 'w').write(doc)
print(len(pages), 'pages')
