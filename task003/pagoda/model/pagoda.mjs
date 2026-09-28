import { m, C, PLATE, BRICK, TILE, rect, ring, minus, union, rotY, X, Y, Z, CX, CZ, WATER, FLOOR } from './ctx.mjs';

// =============================================================================
// BAG 5 — The stone pillar and the lotus frame (Liên Hoa Đài platform)
// =============================================================================
m.bag(5, 'Stone pillar and lotus frame');
const PILLAR_TOP = WATER - 1 + 21;    // 7 round 4x4 bricks: h9..30
for (let i = 0; i < 7; i++) {
  if (i % 2 === 0) m.step('The single stone pillar', { note: i === 0 ? 'Slide each round brick down over the drive axle.' : '' });
  m.addC('87081', C.lbg, CX, CZ, WATER - 1 + 3 * i);
}
// capital: three plate layers, each with a Technic plate so the axle passes through
m.step('Capital on top of the pillar');
m.add('3709b', C.black, CX - 2, CZ - 1, 30);
m.add(PLATE['1x4'], C.darkRed, CX - 2, CZ - 2, 30); m.add(PLATE['1x4'], C.darkRed, CX - 2, CZ + 1, 30);
m.add('3709b', C.black, CX - 2, CZ - 1, 31);
m.add(PLATE['2x6'], C.darkRed, CX - 3, CZ - 3, 31); m.add(PLATE['2x6'], C.darkRed, CX - 3, CZ + 1, 31);
m.add(PLATE['1x2'], C.darkRed, CX - 3, CZ - 1, 31, 90); m.add(PLATE['1x2'], C.darkRed, CX + 2, CZ - 1, 31, 90);
m.step('Capital on top of the pillar');
m.add('3709b', C.black, CX - 1, CZ - 2, 32, 90);
m.add(PLATE['2x6'], C.darkRed, CX - 3, CZ - 3, 32, 90); m.add(PLATE['2x6'], C.darkRed, CX + 1, CZ - 3, 32, 90);
m.add(PLATE['1x2'], C.darkRed, CX - 1, CZ - 3, 32); m.add(PLATE['1x2'], C.darkRed, CX - 1, CZ + 2, 32);

// eight curved struts — the petals of the lotus rising from the pillar
const face = [ // [x, z, rot] of level-1 footprint min corner; level 2 moves one stud outward
  [CX - 1, CZ - 4, 0, 0, -1], [CX - 1, CZ + 2, 180, 0, 1], [CX + 2, CZ - 1, 270, 1, 0], [CX - 4, CZ - 1, 90, -1, 0]];
const corner = [ // 3676 inverted double convex: default overhang +x/-z
  [CX + 2, CZ - 4, 0, 1, -1], [CX - 4, CZ - 4, 90, -1, -1], [CX - 4, CZ + 2, 180, -1, 1], [CX + 2, CZ + 2, 270, 1, 1]];
m.step('Lotus-petal struts', { note: 'Four straight struts and four corner struts spring from the capital.' });
m.addC('87081', C.lbg, CX, CZ, 33);
for (const [x, z, r] of face) m.add('3660', C.reddishBrown, x, z, 33, r);
for (const [x, z, r] of corner) m.add('3676', C.reddishBrown, x, z, 33, r);
m.step('Lotus-petal struts');
m.addC('87081', C.lbg, CX, CZ, 36);
for (const [x, z, r, dx, dz] of face) m.add('3660', C.reddishBrown, x + dx, z + dz, 36, r);
for (const [x, z, r, dx, dz] of corner) m.add('3676', C.reddishBrown, x + dx, z + dz, 36, r);

// platform 14x14
const P = { x0: CX - 7, z0: CZ - 7, x1: CX + 7, z1: CZ + 7 };
m.step('Platform of Liên Hoa Đài', { note: 'The Technic plate in the centre lets the drive axle through.' });
m.add('3709b', C.black, CX - 2, CZ - 1, FLOOR - 2);
m.fill(minus(rect(P.x0, P.z0, P.x1, P.z1), rect(CX - 2, CZ - 1, CX + 2, CZ + 1)), FLOOR - 2, PLATE, C.reddishBrown);
export { P };
