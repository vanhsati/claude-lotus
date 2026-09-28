import { m, C, PLATE, BRICK, TILE, rect, ring, minus, union, X, Y, Z, CX, CZ, WATER, POND, STAIR, cellsOf } from './ctx.mjs';

// =============================================================================
// BAG 2 — Linh Chiểu pond: walls, water and lotus
// =============================================================================
m.bag(2, 'Linh Chiểu lotus pond');
const pondRing = ring(POND.x0, POND.z0, POND.x1, POND.z1);
const shaftCell = rect(3, 12, 4, 14);          // worm shaft passes through the ring here
const columns = [[6, 6], [23, 7], [6, 19], [23, 19]];

m.step('Pond foundation walls');
m.solid(cellsOf(minus(pondRing, shaftCell), 1, 4, C.dbg));
m.step('Pond foundation walls');
m.solid(cellsOf(minus(pondRing, shaftCell), 4, 8, C.dbg));
m.step('Support columns under the pond floor');
for (const [x, z] of columns) m.solid(cellsOf(rect(x, z, x + 2, z + 2), 1, 8, C.dbg));

m.step('Pond floor', { note: 'The Technic plate goes over the drive axle; the axle passes through its centre hole.' });
m.add('3709b', C.dbg, CX - 2, CZ - 1, 8);
m.fill(minus(rect(POND.x0, POND.z0, POND.x1, POND.z1), rect(CX - 2, CZ - 1, CX + 2, CZ + 1)), 8, PLATE, C.darkBlue);

// pond wall above the floor (the stair crosses the front wall)
const stairOnRing = rect(STAIR.x0, POND.z1 - 1, STAIR.x1, POND.z1);
m.step('Pond walls');
m.solid(cellsOf(minus(pondRing, stairOnRing), 9, 12, C.lbg));
m.step('Pond walls');
m.solid(cellsOf(minus(pondRing, stairOnRing), 12, 13, C.lbg));

// lotus pads (2x2 round plates flush with the water) and flowers
export const pads = [[4, 6], [6, 3], [10, 3], [24, 3], [26, 6], [5, 11], [26, 11], [25, 16], [4, 17], [4, 22], [7, 25], [10, 23], [21, 24], [24, 21], [22, 4], [12, 10]];
const flowers = [[6, 3], [26, 11], [4, 22], [21, 24], [12, 10], [24, 3]];
const leaves = [[9, 7], [22, 8], [8, 15], [27, 20], [11, 26], [20, 26], [27, 25], [4, 14], [16, 4], [9, 20], [23, 13]];
const interior = rect(POND.x0 + 1, POND.z0 + 1, POND.x1 - 1, POND.z1 - 1);
const pillar = rect(CX - 2, CZ - 2, CX + 2, CZ + 2);
const stairWater = rect(STAIR.x0, STAIR.zTop, STAIR.x1, POND.z1 - 1);
let water = minus(interior, pillar, stairWater);
for (const [x, z] of pads) water = minus(water, rect(x, z, x + 2, z + 2));
for (const [x, z] of leaves) water = minus(water, rect(x, z, x + 1, z + 1));

m.step('Lotus pads');
for (const [x, z] of pads) m.addC('4032a', [C.green, C.brightGreen, C.darkGreen][(x + z) % 3], x + 1, z + 1, 9);
for (const [x, z] of leaves) m.addC('6141', (x + z) % 2 ? C.green : C.brightGreen, x + 0.5, z + 0.5, 9);

m.step('Water', { note: 'Leave the 4 x 4 area in the middle open for the pillar.' });
const waterTile = { '1x1': TILE['1x1'], '1x2': TILE['1x2'], '2x2': TILE['2x2'] };
m.fill(water, 9, waterTile, C.transLightBlue);

m.step('Lotus flowers');
for (const [x, z] of flowers) {
  m.addC('6141', C.green, x + 0.5, z + 0.5, 10);
  m.addC('24866', C.brightPink, x + 0.5, z + 0.5, 11);
  m.addC('98138', C.yellow, x + 0.5, z + 0.5, 12);
}
