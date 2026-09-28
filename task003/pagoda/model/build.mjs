// One-Pillar Pagoda (Chùa Một Cột, Hà Nội) — LEGO model generator.
// Writes build/model.json (placements + steps) and build/one-pillar-pagoda.mpd (LDraw; opens in BrickLink Studio).
import { m } from './ctx.mjs';
import { writeOutputs } from '../../lib/output.mjs';
await import('./base.mjs');
for (const mod of ['./pond.mjs', './land.mjs', './stair.mjs', './pagoda.mjs', './shrine.mjs', './roof.mjs', './garden.mjs']) {
  try { await import(mod); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND' || !e.message.includes(mod.slice(2))) throw e; }
}
writeOutputs(m, new URL('../build/', import.meta.url).pathname, 'one-pillar-pagoda');
