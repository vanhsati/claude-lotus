// Builds the instruction manual: renders every step with real LDraw geometry, composes HTML pages,
// and prints instructions/One-Pillar-Pagoda-Instructions.pdf with headless Chromium.
//   node tools/manual.mjs [--skip-render]
import fs from 'node:fs';
import path from 'node:path';
import { openRenderer } from './browser.mjs';

const ROOT = new URL('../', import.meta.url).pathname;
const OUT = ROOT + 'instructions/';
const IMG = OUT + 'img/';
const model = JSON.parse(fs.readFileSync(ROOT + 'build/model.json', 'utf8'));
const bom = JSON.parse(fs.readFileSync(ROOT + 'build/bom.json', 'utf8'));
const skip = process.argv.includes('--skip-render');
fs.mkdirSync(IMG + 'steps', { recursive: true });
fs.mkdirSync(IMG + 'thumbs', { recursive: true });

const steps = model.steps;
const attachStep = {}; for (const s of steps) if (s.attach) attachStep[s.attach] = s.i;
const partsIn = i => model.parts.filter(p => p.step === i);
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');
const bagDir = { 1: [-0.9, 1.0, 0.8], 7: [-0.6, 0.9, 1.0] };
const DIR = [-0.7, 0.8, 1.2];

if (!skip) {
  const r = await openRenderer();
  const t0 = Date.now();
  // part thumbnails
  for (const l of bom) {
    const url = await r.page.evaluate(([p, c]) => window.thumb(p, c, 200), [l.part, l.color]);
    fs.writeFileSync(`${IMG}thumbs/${l.part}_${l.color}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('thumbs', ((Date.now() - t0) / 1000).toFixed(0) + 's');
  // finished sub-models for the attach callouts
  for (const sub of Object.keys(attachStep))
    await r.save(`${IMG}steps/sub-${slug(sub)}.png`, { sub, maxStep: attachStep[sub], size: [700, 600], dir: DIR, ground: false, edges: true });
  // steps
  for (const s of steps) {
    const opts = { size: [1500, 1000], bg: '#ffffff', fade: true, edges: true, dir: bagDir[s.bag] || DIR };
    if (s.sub) Object.assign(opts, { sub: s.sub, maxStep: s.i, newSteps: [s.i], dir: s.sub === 'Roof' ? [-0.6, 1.1, 1] : DIR });
    else if (s.attach) Object.assign(opts, { mainView: true, maxStep: s.i, newSub: s.attach, focus: 0.55 });
    else Object.assign(opts, { mainView: true, maxStep: s.i, newSteps: [s.i], focus: 0.4, zoom: 0.8 });
    await r.save(`${IMG}steps/${String(s.i + 1).padStart(3, '0')}.jpg`, opts);
    if (s.i % 10 === 0) console.log('step', s.i + 1, '/', steps.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  // feature and cover pictures
  const all = { mainView: true, maxStep: steps.length - 1 };
  await r.save(`${IMG}cover.png`, { ...all, size: [1800, 1500], dir: [-0.75, 0.55, 1.1], zoom: 0.78, ground: true, exposure: 1.05 });
  await r.save(`${IMG}back.png`, { ...all, size: [1200, 1000], dir: [0.8, 0.6, -1], zoom: 0.8 });
  await r.save(`${IMG}roof-off.png`, { ...all, size: [1200, 1000], dir: [-0.4, 1.3, 1], zoom: 0.42, target: [320, 380, 300], hideMoving: ['roof'] });
  const mech = model.parts.map((p, i) => (p.moving === 'crank' || p.moving === 'drive' || p.moving === 'statue' || steps[p.step].bag === 1) ? null : i).filter(i => i !== null);
  await r.page.evaluate(ids => { window.__hide = new Set(ids); }, mech);
  await r.save(`${IMG}mechanism.png`, { ...all, size: [1200, 1000], dir: [-1, 0.5, 0.7], zoom: 0.6, hideMoving: [], onlyMechanism: true });
  await r.close();
}

// ---------------------------------------------------------------------------- HTML
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lotOf = (p) => bom.find(l => l.part === p.part && l.color === p.color);
function pli(i) {
  const s = steps[i];
  if (s.attach) return `<div class="pli sub"><figure><img src="img/steps/sub-${slug(s.attach)}.png"><figcaption>1x</figcaption></figure></div>`;
  const counts = new Map();
  for (const p of partsIn(i)) { const k = p.part + '_' + p.color; counts.set(k, (counts.get(k) || 0) + 1); }
  return `<div class="pli">${[...counts].map(([k, n]) => `<figure><img src="img/thumbs/${k}.png"><figcaption>${n}x</figcaption></figure>`).join('')}</div>`;
}
const pages = [];
const bagTitles = model.bags;
const page = (cls, html) => pages.push(`<section class="page ${cls}">${html}<div class="folio">${pages.length + 1}</div></section>`);

page('cover', `<img class="hero" src="img/cover.png"><div class="title"><div class="kicker">Hà Nội · 1049</div><h1>Chùa Một Cột</h1><h2>One-Pillar Pagoda</h2>
  <div class="meta">${model.parts.length} pieces · ${steps.length} steps · 8 bags</div></div>`);
page('text', `<h2>The lotus rising from the pond</h2>
<div class="cols"><div>
<p>In 1049 Emperor <b>Lý Thái Tông</b> dreamed that the bodhisattva <b>Quan Âm</b> (Avalokiteśvara), seated on a lotus, handed him a baby son. On the advice of the monk Thiền Tuệ he raised a single stone pillar in the middle of a lotus pond and set a small wooden shrine on top, so that the whole building would look like a lotus flower growing out of the water.</p>
<p>The shrine, <b>Liên Hoa Đài</b> ("Lotus Platform"), is about 3 × 3 m. It rests on a stone pillar 1.2 m across that stands about 4 m above the <b>Linh Chiểu</b> pond; eight curved beams spread from the pillar like petals. Thirteen steps lead up from the bank. On the ridge of the roof, two dragons face the moon — <i>lưỡng long chầu nguyệt</i>.</p>
<p>French Union forces blew the pagoda up on 11 September 1954; it was rebuilt in 1955 to the traditional design. The bodhi tree in the garden grew from a cutting of the tree at Bodh Gaya, a gift from India's President Rajendra Prasad (1958–59).</p>
</div><div>
<h3>What this model does</h3>
<ul>
<li><b>Turning Quan Âm.</b> Turn the crank wheel on the right side of the base. A worm gear hidden under the pond drives a 16-stud axle that runs up through the hollow stone pillar and turns the gilded statue on her lotus throne — 24 turns of the crank for one full turn of the statue, and the worm holds her in place when you let go.</li>
<li><b>Opening door.</b> The front door swings inwards on real hinges.</li>
<li><b>Lift-off roof.</b> The roof is a separate module; lift it off to look into the shrine.</li>
<li><b>Glazed balustrade, lotus pond and courtyard</b> paved with Bát Tràng-style terracotta, with a bodhi tree, a frangipani in flower, stone lanterns and an incense urn.</li>
</ul>
<p class="dim">Scale about 1:37 (minifigure scale). Footprint 32 × 40 studs (25.6 × 32 cm); height about 35 cm.</p>
</div></div>`);
page('text', `<h2>How it works</h2><div class="cols"><div><img class="figure" src="img/mechanism.png"><p class="dim">Crank → worm → 24-tooth gear → axle through the pillar → lotus throne.</p></div>
<div><img class="figure" src="img/roof-off.png"><p class="dim">Roof lifted off: the statue turns inside the shrine.</p></div></div>
<h3>Before you start</h3><ul><li>Sort the pieces by bag. The parts list at the back gives BrickLink numbers and colours.</li>
<li>Bag 1 builds the drive. The long black axle stands up out of the base until the pillar is built around it — build carefully around it.</li>
<li>Faded parts in the pictures were placed in earlier steps; parts in full colour are new in this step.</li></ul>`);

let lastBag = null;
for (const s of steps) {
  if (s.bag !== lastBag) {
    lastBag = s.bag;
    page('bag', `<div class="bagno">${s.bag}</div><h2>${esc(bagTitles[s.bag])}</h2>`);
  }
  const subLabel = s.sub ? `<div class="sublabel">${esc(s.sub)}</div>` : '';
  const title = `${esc(s.title)}${s.part ? ` <span class="dim">(${s.part})</span>` : ''}`;
  page(s.sub ? 'step subasm' : 'step', `${subLabel}<div class="num">${s.i + 1}</div>${pli(s.i)}
    <img class="shot" src="img/steps/${String(s.i + 1).padStart(3, '0')}.jpg"><div class="caption">${title}${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}</div>`);
}
page('text', `<h2>Finished!</h2><img class="figure wide" src="img/back.png">`);
// inventory
const perPage = 40;
for (let i = 0; i < bom.length; i += perPage) {
  page('inventory', `<h2>Parts list ${i ? '(continued)' : ''}</h2><div class="inv">${bom.slice(i, i + perPage).map(l =>
    `<figure><img src="img/thumbs/${l.part}_${l.color}.png"><figcaption><b>${l.qty}x</b> ${l.bl}<br>${esc(l.blColorName)}</figcaption></figure>`).join('')}</div>`);
}

const css = `@page { size: 297mm 210mm; margin: 0 }
* { box-sizing: border-box } body { margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #222 }
.page { width: 297mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always; background: #fff; padding: 12mm 14mm }
.folio { position: absolute; bottom: 6mm; right: 10mm; font-size: 10pt; color: #888 }
.cover { padding: 0; background: linear-gradient(160deg, #f6efe2, #e6d6bd) }
.cover .hero { position: absolute; right: -10mm; top: -6mm; height: 225mm }
.cover .title { position: absolute; left: 16mm; top: 22mm; width: 120mm }
.cover h1 { font-size: 46pt; margin: 4mm 0 0; color: #6b1d1d } .cover h2 { font-size: 22pt; margin: 2mm 0; font-weight: 400 }
.kicker { letter-spacing: .3em; text-transform: uppercase; color: #8a6d3b; font-size: 11pt } .meta { margin-top: 8mm; font-size: 12pt; color: #555 }
.text h2 { color: #6b1d1d; font-size: 22pt; margin: 0 0 6mm } .text h3 { color: #8a6d3b; margin: 6mm 0 2mm }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; font-size: 11pt; line-height: 1.5 } .dim { color: #777; font-size: 10pt }
.figure { width: 100%; border-radius: 3mm; background: #f4f1ea } .figure.wide { width: auto; height: 160mm; display: block; margin: 0 auto }
.bag { display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f4efe6 }
.bagno { width: 44mm; height: 44mm; border-radius: 50%; background: #6b1d1d; color: #fff; font-size: 64pt; display: flex; align-items: center; justify-content: center }
.bag h2 { font-size: 26pt; margin-top: 8mm; color: #333 }
.step .num { position: absolute; left: 12mm; top: 8mm; font-size: 40pt; font-weight: 700 }
.pli { position: absolute; left: 36mm; top: 8mm; right: 14mm; display: flex; flex-wrap: wrap; gap: 2mm; padding: 2mm 3mm; border: .4mm solid #b9c7d6; border-radius: 2mm; background: #eef3f8; max-height: 44mm; overflow: hidden; width: max-content; max-width: 240mm }
.pli figure { margin: 0; text-align: center; font-size: 9pt; font-weight: 700 } .pli img { width: 17mm; height: 17mm; object-fit: contain; display: block }
.pli.sub img { width: 36mm; height: 30mm }
.step .shot { position: absolute; left: 14mm; right: 14mm; top: 36mm; bottom: 16mm; width: calc(100% - 28mm); height: calc(100% - 52mm); object-fit: contain }
.caption { position: absolute; left: 14mm; bottom: 7mm; font-size: 11pt; color: #444; max-width: 230mm } .note { color: #6b1d1d; margin-top: 1mm }
.subasm { background: #fbf6ec } .subasm .shot { border: .5mm solid #d9c7a0; border-radius: 3mm; background: #fff }
.sublabel { position: absolute; right: 14mm; top: 8mm; background: #8a6d3b; color: #fff; padding: 1mm 4mm; border-radius: 2mm; font-size: 10pt; z-index: 2 }
.inventory h2 { margin: 0 0 4mm; color: #6b1d1d } .inv { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2mm 3mm }
.inv figure { margin: 0; font-size: 8pt; text-align: center } .inv img { width: 20mm; height: 20mm; object-fit: contain }`;
fs.writeFileSync(OUT + 'manual.html', `<!doctype html><html><head><meta charset="utf-8"><title>One-Pillar Pagoda — Building Instructions</title><style>${css}</style></head><body>${pages.join('\n')}</body></html>`);

// print to PDF
const { chromium } = await import('playwright-core');
const exe = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe });
const pg = await browser.newPage();
await pg.goto('file://' + OUT + 'manual.html');
await pg.waitForLoadState('networkidle');
await pg.pdf({ path: OUT + 'One-Pillar-Pagoda-Instructions.pdf', width: '297mm', height: '210mm', printBackground: true });
await browser.close();
console.log(`manual: ${pages.length} pages -> instructions/One-Pillar-Pagoda-Instructions.pdf`);
