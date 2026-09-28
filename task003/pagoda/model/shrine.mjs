import { m, C, PLATE, BRICK, TILE, rect, ring, minus, union, rotY, X, Y, Z, CX, CZ, FLOOR } from './ctx.mjs';
import { P } from './pagoda.mjs';

// =============================================================================
// BAG 6 — The shrine: veranda, lattice walls, door and the Quan Âm statue
// =============================================================================
m.bag(6, 'Shrine and Quan Âm statue');
const B = { x0: CX - 5, z0: CZ - 5, x1: CX + 5, z1: CZ + 5 };   // shrine body 10x10
const F = FLOOR - 1;                                                // plate level of floor tiles / wall bottoms
const railRing = ring(P.x0, P.z0, P.x1, P.z1);
const wallRing = ring(B.x0, B.z0, B.x1, B.z1);

m.step('Veranda floor boards');
const walk = minus(rect(P.x0 + 1, P.z0 + 1, P.x1 - 1, P.z1 - 1), rect(B.x0, B.z0, B.x1, B.z1));
m.fill(walk, F, { '1x2': TILE['1x2'], '1x4': TILE['1x4'], '1x6': TILE['1x6'], '1x8': TILE['1x8'], '1x1': TILE['1x1'] }, C.reddishBrown, { alt: false });
m.step('Shrine floor', { note: 'The round tile with a hole is the bearing for the rotating lotus throne.' });
m.addC('15535', C.dbg, CX, CZ, F);
m.fill(minus(rect(B.x0 + 1, B.z0 + 1, B.x1 - 1, B.z1 - 1), rect(CX - 1, CZ - 1, CX + 1, CZ + 1)), F, TILE, C.darkTan);

// ---- railing ----------------------------------------------------------------
m.step('Veranda railing');
for (const [x, z] of [[P.x0, P.z0], [P.x1 - 1, P.z0], [P.x0, P.z1 - 1], [P.x1 - 1, P.z1 - 1]]) {
  m.add('3062b', C.darkRed, x, z, F); m.addC('98138', C.pearlGold, x + 0.5, z + 0.5, F + 3);
}
for (const s of [1, 5, 9]) {
  m.add('3633', C.reddishBrown, P.x0 + s, P.z0, F);                     // back
  m.add('3633', C.reddishBrown, P.x0, P.z0 + s, F, 90);                 // sides
  m.add('3633', C.reddishBrown, P.x1 - 1, P.z0 + s, F, 90);
  if (s !== 5) m.add('3633', C.reddishBrown, P.x0 + s, P.z1 - 1, F);   // front, open for the stair
}

// ---- Quan Âm on the lotus throne (rotates with the drive axle) ----------------
m.beginSub('Quan Âm statue');
m.step('Lotus throne');
m.addC('4032a', C.darkRed, CX, CZ, FLOOR, 0, { moving: 'statue' });
for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) m.addC('24866', C.brightPink, CX + dx, CZ + dz, FLOOR + 1, 0, { moving: 'statue' });
m.step('Seated Quan Âm');
m.addC('18674', C.pearlGold, CX, CZ, FLOOR + 2, 0, { moving: 'statue' });
m.addC('4589', C.pearlGold, CX, CZ, FLOOR + 3, 0, { moving: 'statue' });
m.addC('6141', C.pearlGold, CX, CZ, FLOOR + 6, 0, { moving: 'statue' });
m.addC('6141', C.pearlGold, CX, CZ, FLOOR + 7, 0, { moving: 'statue' });
m.addC('98138', C.pearlGold, CX, CZ, FLOOR + 8, 0, { moving: 'statue' });
m.endSub('Place the statue on the drive axle', { note: 'Press the round plate onto the axle so the statue turns when the crank is turned.' });

// ---- walls --------------------------------------------------------------------
const col = (x, z) => { for (let i = 0; i < 6; i++) m.add('3062b', C.darkRed, x, z, F + 3 * i); };
function panel4(x, z, rot) {
  m.add(BRICK['1x4'], C.darkRed, x, z, F, rot);
  m.add('30055', C.reddishBrown, x, z, F + 3, rot);
  m.add(BRICK['1x4'], C.darkRed, x, z, F + 9, rot);
  m.add('30055', C.reddishBrown, x, z, F + 12, rot);
}
m.step('Corner columns');
col(B.x0, B.z0); col(B.x1 - 1, B.z0); col(B.x0, B.z1 - 1); col(B.x1 - 1, B.z1 - 1);
m.step('Lattice walls');
panel4(B.x0 + 1, B.z0, 0); panel4(B.x0 + 5, B.z0, 0);                     // back
panel4(B.x0, B.z0 + 1, 90); panel4(B.x0, B.z0 + 5, 90);                   // left
panel4(B.x1 - 1, B.z0 + 1, 90); panel4(B.x1 - 1, B.z0 + 5, 90);           // right
m.step('Front wall and door', { note: 'The door opens inwards; turn the crank to make Quan Âm face the door.' });
for (const x of [B.x0 + 1, B.x1 - 3]) for (let i = 0; i < 6; i++) m.add('2877', C.darkRed, x, B.z1 - 1, F + 3 * i);
const frame = m.add('60596', C.reddishBrown, CX - 2, B.z1 - 1, F, 180);
const [fx, fy, fz] = frame.pos;
m.addRaw('60623', C.reddishBrown, [fx + 31, fy, fz - 5], rotY(180), { moving: 'door', pivot: [fx + 32, fz - 5] });

m.step('Wall plate');
m.fill(wallRing, F + 18, PLATE, C.darkRed, { alt: true });
export { B };
