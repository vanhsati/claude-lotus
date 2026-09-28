// Inlines the model, the packed LDraw library and LDConfig into the viewer template.
//   -> viewer/one-pillar-pagoda.html (page body, as published) and index.html (standalone local copy)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname;
const model = JSON.parse(fs.readFileSync(ROOT + 'build/model.json', 'utf8'));
const slim = { bags: model.bags, steps: model.steps.map(({ i, title, bag, sub, attach, part }) => ({ i, title, bag, sub, attach, part })),
  parts: model.parts.map(({ part, color, R, pos, step, sub, moving, pivot }) => ({ part, color, R, pos, step, sub, moving, pivot })) };
const lib = fs.readFileSync(ROOT + 'build/library.ldr', 'utf8');
const ldconfig = fs.readFileSync(ROOT + 'build/LDConfig.ldr', 'utf8').split('\n').filter(l => l.startsWith('0 !COLOUR')).join('\n');
for (const t of [lib, ldconfig]) if (/<\/script/i.test(t)) throw new Error('unsafe text');
const body = fs.readFileSync(ROOT + 'viewer/viewer.template.html', 'utf8')
  .replace('/*MODEL*/', () => JSON.stringify(slim)).replace('/*LIBRARY*/', () => lib).replace('/*LDCONFIG*/', () => ldconfig);
fs.writeFileSync(ROOT + 'viewer/one-pillar-pagoda.html', body);
fs.writeFileSync(ROOT + 'index.html', `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style>\n${body}\n</html>\n`);
console.log(`viewer: ${(body.length / 1e6).toFixed(2)} MB`);
