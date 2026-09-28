// Builds the instruction manual: renders every step with real LDraw geometry, composes HTML pages,
// and prints <project>/instructions/<pdfName> with headless Chromium.
//   PROJECT=cat node tools/manual.mjs [--skip-render]
import fs from 'node:fs';
import path from 'node:path';
import { openRenderer } from './browser.mjs';

import { ROOT, PDIR, PROJECT, config } from '../lib/project.mjs';
const OUT = PDIR + 'instructions/';
const IMG = OUT + 'img/';
const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const bom = JSON.parse(fs.readFileSync(PDIR + 'build/bom.json', 'utf8'));
const skip = process.argv.includes('--skip-render');
fs.mkdirSync(IMG + 'steps', { recursive: true });
fs.mkdirSync(IMG + 'thumbs', { recursive: true });

const steps = model.steps;
const attachStep = {}; for (const s of steps) if (s.attach) attachStep[s.attach] = s.i;
const partsIn = i => model.parts.filter(p => p.step === i);
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');
const M = config.manual;
const DIR = M.dir || [-0.7, 0.8, 1.2];
const stepDir = s => (M.stepDir && M.stepDir(s)) || DIR;

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
    const opts = { size: [1500, 1000], bg: '#ffffff', fade: true, edges: true, dir: stepDir(s) };
    if (s.sub) Object.assign(opts, { sub: s.sub, maxStep: s.i, newSteps: [s.i] });
    else if (s.attach) Object.assign(opts, { mainView: true, maxStep: s.i, newSub: s.attach, focus: 0.55 });
    else Object.assign(opts, { mainView: true, maxStep: s.i, newSteps: [s.i], focus: 0.4, zoom: 0.8 });
    await r.save(`${IMG}steps/${String(s.i + 1).padStart(3, '0')}.jpg`, opts);
    if (s.i % 10 === 0) console.log('step', s.i + 1, '/', steps.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  // feature and cover pictures
  const all = { mainView: true, maxStep: steps.length - 1 };
  await r.save(`${IMG}cover.png`, { ...all, size: [1800, 1500], ground: true, exposure: 1.05, ...M.coverView });
  if (M.images) await M.images(r, { model, IMG, all });
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

const bagCount = new Set(steps.map(s => s.bag)).size;
page('cover', `<img class="hero" src="img/cover.png"><div class="title"><div class="kicker">${M.kicker}</div><h1>${M.h1}</h1><h2>${M.h2}</h2>
  <div class="meta">${model.parts.length} pieces · ${steps.length} steps · ${bagCount} bags</div></div>`);
for (const [cls, html] of M.introPages) page(cls, html);

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
page('text', `<h2>Finished!</h2><img class="figure wide" src="img/${M.finishImage || 'cover.png'}">`);
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
fs.writeFileSync(OUT + 'manual.html', `<!doctype html><html><head><meta charset="utf-8"><title>${esc(model.name)} — Building Instructions</title><style>${css}</style></head><body>${pages.join('\n')}</body></html>`);

// print to PDF
const { chromium } = await import('playwright-core');
const exe = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe });
const pg = await browser.newPage();
await pg.goto('file://' + OUT + 'manual.html');
await pg.waitForLoadState('networkidle');
await pg.pdf({ path: OUT + config.pdfName, width: '297mm', height: '210mm', printBackground: true });
await browser.close();
console.log(`manual: ${pages.length} pages -> ${PROJECT}/instructions/${config.pdfName}`);
