import { m, C, PLATE, BRICK, TILE, rect, ring, minus, union, X, Y, Z, W, D, CX, CZ, GROUND, POND, STAIR, WORM_Z, cellsOf } from './ctx.mjs';

// =============================================================================
// BAG 3 — Courtyard: base walls, paving and the glazed balustrade
// =============================================================================
m.bag(3, 'Courtyard and balustrade');
const outer = ring(0, 0, W, D);
const shaftCell = rect(0, WORM_Z - 1, 1, WORM_Z + 1);
const ribs = union(rect(8, 28, 9, 39), rect(13, 28, 14, 39), rect(18, 28, 19, 39), rect(23, 28, 24, 39), rect(1, 33, 31, 34));

m.step('Outer walls of the base');
m.solid(cellsOf(minus(outer, shaftCell), 1, 7, C.dbg));
m.solid(cellsOf(ribs, 1, 7, C.dbg));
m.step('Outer walls of the base');
m.solid(cellsOf(minus(outer, shaftCell), 7, 13, C.dbg));
m.solid(cellsOf(shaftCell, 7, 13, C.dbg));
m.solid(cellsOf(ribs, 7, 13, C.dbg));

const stairOnRing = rect(STAIR.x0, POND.z1 - 1, STAIR.x1, POND.z1);
m.step('Courtyard sub-floor');
const cover = minus(rect(0, 0, W, D), rect(POND.x0 + 1, POND.z0 + 1, POND.x1 - 1, POND.z1 - 1), stairOnRing);
m.fill(cover, 13, PLATE, C.lbg, { alt: true });

// ---- paving -----------------------------------------------------------------
// decorations that need studs instead of tiles (kept in sync with garden.mjs)
export const studIslands = {
  bodhi: rect(23, 30, 29, 36),        // bodhi tree trunk and roots (6x6)
  frangipani: rect(4, 31, 8, 35),     // frangipani tree base
  lanternL: rect(11, 33, 12, 34), lanternR: rect(20, 33, 21, 34),
  urn: rect(15, 37, 17, 39),          // incense urn on the entrance path
  stele: rect(2, 5, 3, 7),            // small stele beside the pond
};
const stairLand = rect(STAIR.x0, POND.z1, STAIR.x1, STAIR.zBot);
const path = minus(rect(STAIR.x0 + 1, STAIR.zBot, STAIR.x1 - 1, D - 1), rect(15, 37, 17, 39));
const border = ring(0, 0, W, D);
let paving = minus(rect(0, 0, W, D), rect(POND.x0, POND.z0, POND.x1, POND.z1), stairLand, path, border, ...Object.values(studIslands));

m.step('Border tiles');
m.fill(minus(border, ...Object.values(studIslands)), 14, { '1x1': TILE['1x1'], '1x2': TILE['1x2'], '1x3': TILE['1x3'], '1x4': TILE['1x4'], '1x6': TILE['1x6'], '1x8': TILE['1x8'] }, C.dbg);
m.step('Stud islands for trees and lanterns');
for (const s of Object.values(studIslands)) m.fill(s, 14, PLATE, C.dbg);

// Bát Tràng terracotta pavers: 1x2 tiles in running bond, colour varied by a fixed hash
const hash = (x, z) => ((x * 73856093) ^ (z * 19349663)) >>> 0;
const paverColor = (x, z) => { const r = hash(x, z) % 17; return r < 2 ? C.reddishBrown : r < 4 ? C.medNougat : C.darkOrange; };
const rows = new Map();
for (const k of paving) { const [x, z] = k.split(',').map(Number); if (!rows.has(z)) rows.set(z, []); rows.get(z).push(x); }
const zs = [...rows.keys()].sort((a, b) => a - b);
const half = Math.ceil(zs.length / 2);
for (const [i, z] of zs.entries()) {
  if (i === 0 || i === half) m.step('Terracotta paving');
  const xs = new Set(rows.get(z));
  const sorted = [...xs].sort((a, b) => a - b);
  for (let j = 0; j < sorted.length;) {
    const x = sorted[j];
    const startSingle = (x + z) % 2 === 1;   // stagger joints row to row
    if (!startSingle && xs.has(x + 1)) { m.add(TILE['1x2'], paverColor(x, z), x, z, 14, 0); j += 2; }
    else { m.add(TILE['1x1'], paverColor(x, z), x, z, 14, 0); j += 1; }
  }
}
m.step('Stone entrance path');
m.fill(path, 14, { '2x2': TILE['2x2'], '1x2': TILE['1x2'], '1x1': TILE['1x1'] }, C.lbg);

// ---- balustrade around the pond ---------------------------------------------
// posts every fifth stud, lattice fences of glazed green ceramic between them
const { x0, z0, x1, z1 } = POND;
const posts = [];
const fences = [];   // [x, z, rot]
for (const p of [0, 5, 10, 15, 20, 25]) {
  posts.push([x0 + p, z0], [x0 + p, z1 - 1], [x0, z0 + p], [x1 - 1, z0 + p]);
}
posts.push([x1 - 1, z1 - 1]);
for (const p of [1, 6, 11, 16, 21]) {
  fences.push([x0 + p, z0, 0]);                          // back
  if (!(x0 + p >= STAIR.x0 && x0 + p < STAIR.x1)) fences.push([x0 + p, z1 - 1, 0]); // front, open for the stair
  fences.push([x0, z0 + p, 90], [x1 - 1, z0 + p, 90]);   // sides
}
const postSet = new Set(posts.map(([x, z]) => `${x},${z}`).filter(k => !stairOnRing.has(k)));
const plinth = minus(ring(x0, z0, x1, z1), stairOnRing);
m.step('Balustrade plinth');
// 1-wide courses along each side
m.run(BRICK, C.lbg, x0, z0, 14, x1 - x0, 'x', 0);
m.run(BRICK, C.lbg, x0, z0 + 1, 14, z1 - z0 - 2, 'z', 3);
m.run(BRICK, C.lbg, x1 - 1, z0 + 1, 14, z1 - z0 - 2, 'z', 3);
m.run(BRICK, C.lbg, x0, z1 - 1, 14, STAIR.x0 - x0, 'x', 0);
m.run(BRICK, C.lbg, STAIR.x1, z1 - 1, 14, x1 - STAIR.x1, 'x', 0);
m.step('Balustrade posts');
for (const k of postSet) { const [x, z] = k.split(',').map(Number);
  m.add(BRICK['1x1'], C.lbg, x, z, 17); m.addC('6141', C.lbg, x + 0.5, z + 0.5, 20); m.addC('98138', C.dbg, x + 0.5, z + 0.5, 21); }
m.step('Glazed lattice fences');
for (const [x, z, rot] of fences) m.add('3633', C.darkGreen, x, z, 17, rot);
