// Inlines the model, the packed LDraw library and LDConfig into the viewer template.
//   -> <project>/build/viewer.html (page body, as published) and <project>/index.html (standalone copy)
import fs from 'node:fs';
import { ROOT, PDIR, PROJECT, config } from '../lib/project.mjs';
const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const slim = { bags: model.bags, steps: model.steps.map(({ i, title, bag, sub, attach, part }) => ({ i, title, bag, sub, attach, part })),
  parts: model.parts.map(({ part, color, R, pos, step, sub, moving, pivot }) => ({ part, color, R, pos, step, sub, moving, pivot })) };
const lib = fs.readFileSync(PDIR + 'build/library.ldr', 'utf8');
const ldconfig = fs.readFileSync(PDIR + 'build/LDConfig.ldr', 'utf8').split('\n').filter(l => l.startsWith('0 !COLOUR')).join('\n');
for (const t of [lib, ldconfig]) if (/<\/script/i.test(t)) throw new Error('unsafe text');
const body = fs.readFileSync(PDIR + 'viewer.template.html', 'utf8')
  .replace('/*MODEL*/', () => JSON.stringify(slim)).replace('/*LIBRARY*/', () => lib).replace('/*LDCONFIG*/', () => ldconfig);
fs.writeFileSync(PDIR + 'build/viewer.html', body);
fs.writeFileSync(PDIR + 'index.html', `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style>\n${body}\n</html>\n`);
console.log(`viewer: ${(body.length / 1e6).toFixed(2)} MB`);
