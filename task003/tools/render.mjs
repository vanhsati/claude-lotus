// Presentation renders of the finished model -> <project>/renders/*.png   (PROJECT=cat node tools/render.mjs)
import fs from 'node:fs';
import { openRenderer } from './browser.mjs';
import { PDIR, config } from '../lib/project.mjs';
const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const r = await openRenderer();
const all = { mainView: true, maxStep: model.steps.length - 1, bg: '#e9e2d6', edges: false, exposure: 1.05 };
const out = PDIR + 'renders/';
for (const [f, o] of Object.entries(config.renders)) { await r.save(out + f, { ...all, ...o }); console.log(f); }
if (config.extraRenders) await config.extraRenders(r, { model, out, all });
await r.close();
