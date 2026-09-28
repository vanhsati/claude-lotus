import { m, C, TILE, rect, X, Y, Z, GROUND, FLOOR, POND, STAIR, WATER } from './ctx.mjs';

// =============================================================================
// BAG 4 — The 13-step brick stair to Liên Hoa Đài
// =============================================================================
m.bag(4, 'Thirteen-step stair');
const cells = new Map();
for (let z = STAIR.zTop; z < STAIR.zBot; z++) {
  const k = STAIR.zBot - z;                    // step number 1 (bottom) .. 13 (top)
  const tread = GROUND + 2 * k;
  const b = z < POND.z1 ? WATER - 1 : GROUND - 1;
  for (let x = STAIR.x0; x < STAIR.x1; x++) {
    const wall = x === STAIR.x0 || x === STAIR.x1 - 1;
    cells.set(`${x},${z}`, { b, t: wall ? tread + 3 : tread, color: C.lbg, tile: true, topColor: wall ? C.lbg : C.dbg });
  }
}
m.step('Stair foundation in the pond');
m.solid(cells, {
  onLayer: h => { if (h > WATER - 1 && (h - (WATER - 1)) % 6 === 0) m.step('Build up the stair'); },
});
