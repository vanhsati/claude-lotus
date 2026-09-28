// One-Pillar Pagoda (Chùa Một Cột, Hà Nội) — LEGO model generator.
// Writes build/model.json (placements + steps) and build/one-pillar-pagoda.mpd (LDraw, opens in BrickLink Studio).
import { Model, C, PLATE, BRICK, TILE, rect, ring, minus, union, rotX, rotY, rotZ, m3mul } from '../../lib/builder.mjs';

export const m = new Model('One-Pillar Pagoda');
const X = v => v * 20, Y = h => -8 * h, Z = v => v * 20; // grid -> LDU

// ---- key dimensions (studs / plates) ---------------------------------------
const W = 32, D = 40;          // base footprint
const CX = 16, CZ = 15;        // pagoda centre (grid point)
const WATER = 10;              // water surface (top of water tiles)
const GROUND = 15;             // courtyard surface
const FLOOR = 41;              // shrine / veranda floor surface
const POND = { x0: 3, z0: 2, x1: 29, z1: 28 }; // outer edge of pond wall ring
const STAIR = { x0: 13, x1: 19, zTop: 22, zBot: 35 };  // 13 steps, treads x14..18
const WORM_Z = 13, AXLE_H = 46;                         // worm shaft line and height (LDU)

const cellsOf = (set, b, t, color, extra = {}) => { const mp = new Map(); for (const k of set) mp.set(k, { b, t, color, ...extra }); return mp; };
// Split a list of already-placed parts over steps is not possible after the fact, so solid() calls
// are wrapped so that each layer group lands in its own step when large.
function layered(cells, title, { per = 1, ...opts } = {}) {
  let layerNo = 0;
  m.step(title);
  let inStep = 0;
  m.solid(cells, { ...opts, onLayer: () => { if (inStep >= per) { m.step(title); inStep = 0; } inStep++; } });
}


export { C, PLATE, BRICK, TILE, rect, ring, minus, union, rotX, rotY, rotZ, m3mul };
export { X, Y, Z, W, D, CX, CZ, WATER, GROUND, FLOOR, POND, STAIR, WORM_Z, AXLE_H, cellsOf, layered };
