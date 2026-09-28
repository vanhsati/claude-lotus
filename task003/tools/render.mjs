// Presentation renders of the finished model -> renders/*.png
import fs from 'node:fs';
import { openRenderer } from './browser.mjs';
const ROOT = new URL('../', import.meta.url).pathname;
const model = JSON.parse(fs.readFileSync(ROOT + 'build/model.json', 'utf8'));
const last = model.steps.length - 1;
const r = await openRenderer();
const all = { mainView: true, maxStep: last, bg: '#e9e2d6', edges: false, exposure: 1.05 };
const shots = {
  'hero-front.png': { ...all, size: [2400, 1800], dir: [-0.75, 0.5, 1.1], zoom: 0.72 },
  'front-elevation.png': { ...all, size: [1800, 2000], dir: [0, 0.12, 1], zoom: 0.7, fov: 18 },
  'back-left.png': { ...all, size: [2000, 1500], dir: [0.9, 0.55, -0.9], zoom: 0.75 },
  'shrine-closeup.png': { ...all, size: [1800, 1500], dir: [-0.5, 0.35, 1], zoom: 0.33, target: [320, 470, 300] },
  'roof-ridge-dragons.png': { ...all, size: [1800, 1100], dir: [0.1, 0.45, 1], zoom: 0.16, target: [320, 690, 300] },
  'roof-lifted.png': { ...all, size: [1800, 1500], dir: [-0.4, 1.2, 1], zoom: 0.42, target: [320, 380, 300], hideMoving: ['roof'] },
  'top-down.png': { ...all, size: [1800, 2100], dir: [0.001, 1, 0.02], zoom: 0.66, fov: 20 },
  'with-edges-instructions-style.png': { ...all, bg: '#ffffff', edges: true, size: [2000, 1500], dir: [-0.75, 0.55, 1.1], zoom: 0.75 },
};
for (const [f, o] of Object.entries(shots)) { await r.save(ROOT + 'renders/' + f, o); console.log(f); }
const mech = model.parts.map((p, i) => (p.moving === 'crank' || p.moving === 'drive' || p.moving === 'statue' || model.steps[p.step].bag === 1) ? null : i).filter(i => i !== null);
await r.page.evaluate(ids => { window.__hide = new Set(ids); }, mech);
await r.save(ROOT + 'renders/drive-mechanism.png', { ...all, edges: true, size: [1800, 1400], dir: [-1, 0.5, 0.7], zoom: 0.55, onlyMechanism: true });
await r.close();
