import { m, C, PLATE, BRICK, TILE, rect, ring, minus, union, rotY, X, Y, Z, CX, CZ, FLOOR } from './ctx.mjs';

// =============================================================================
// BAG 7 — Roof: hip-and-gable, concave terracotta tiles, upturned corners,
//          and "lưỡng long chầu nguyệt" (two dragons facing the moon) on the ridge
// =============================================================================
m.bag(7, 'Roof and ridge dragons');
const R0 = FLOOR - 1 + 18 + 1;           // top of the wall plate (h59)
const d = (x, z) => Math.max(Math.abs(x + 0.5 - CX), Math.abs(z + 0.5 - CZ));
const cells = (pred) => { const s = new Set(); for (let x = CX - 9; x < CX + 9; x++) for (let z = CZ - 9; z < CZ + 9; z++) if (pred(x, z, d(x, z))) s.add(`${x},${z}`); return s; };
const mv = { moving: 'roof' };
const TERRA = C.reddishBrown, RIDGE = C.lbg, WOOD = C.reddishBrown, GABLE = C.darkRed;

m.beginSub('Roof');
m.step('Roof frame', { note: 'The roof is a separate module that lifts off to show the statue.' });
m.fill(cells((x, z, r) => r >= 3.5), R0, PLATE, WOOD, { alt: false }).forEach(p => Object.assign(p, mv));
m.step('Roof frame');
m.fill(cells((x, z, r) => r >= 3.5), R0 + 1, PLATE, WOOD, { alt: true }).forEach(p => Object.assign(p, mv));
m.step('Roof frame');
m.fill(cells((x, z, r) => r >= 3.5 && r <= 6.5), R0 + 2, PLATE, TERRA, { alt: false }).forEach(p => Object.assign(p, mv));
m.fill(cells((x, z, r) => r >= 3.5 && r <= 6.5), R0 + 3, PLATE, TERRA, { alt: true }).forEach(p => Object.assign(p, mv));

// sides: [outward rotation, function(i) -> footprint corner]
const sides = [
  { rot: 0, at: (lo, depth, a) => [a, CZ - lo, 'x'] },            // back  (outward -z)
  { rot: 180, at: (lo, depth, a) => [a, CZ + lo - depth, 'x'] },   // front (outward +z)
  { rot: 90, at: (lo, depth, a) => [CX - lo, a, 'z'] },            // left  (outward -x)
  { rot: 270, at: (lo, depth, a) => [CX + lo - depth, a, 'z'] },   // right (outward +x)
];
// ring of sloped pieces: `lo` = distance of outer edge from centre, `depth` studs deep, pieces `w` wide
function slopeRing(part, h, lo, depth, w, cornerPart, cornerColor = RIDGE) {
  for (const s of sides) {
    for (let a = -lo + depth; a < lo - depth; a += w) {
      const [x, z, axis] = s.at(lo, depth, a + (axis0(s) === 'x' ? CX : CZ));
      m.add(part, TERRA, x, z, h, s.rot, mv);
    }
  }
  if (!cornerPart) return;
  // corners: default orientation of the corner parts slopes toward +x / -z (NE)
  for (const [sx, sz, rot] of [[1, -1, 0], [-1, -1, 90], [-1, 1, 180], [1, 1, 270]]) {
    const x = sx > 0 ? CX + lo - depth : CX - lo, z = sz > 0 ? CZ + lo - depth : CZ - lo;
    m.add(cornerPart, cornerColor, x, z, h, rot, mv);
  }
}
const axis0 = s => (s.rot === 0 || s.rot === 180) ? 'x' : 'z';

m.step('Curved eaves');
slopeRing('15068', R0 + 2, 9, 2, 2, null);
m.step('Upturned eave corners');
for (const [sx, sz] of [[1, -1], [-1, -1], [-1, 1], [1, 1]]) {
  const x = sx > 0 ? CX + 7 : CX - 9, z = sz > 0 ? CZ + 7 : CZ - 9;
  m.add(PLATE['2x2'], TERRA, x, z, R0 + 2, 0, mv);
  m.add(PLATE['2x2'], RIDGE, x, z, R0 + 3, 0, mv);
  // curling tip: horn on the outermost stud, pointing diagonally outward and up
  const cx = sx > 0 ? x + 1.5 : x + 0.5, cz = sz > 0 ? z + 1.5 : z + 0.5;
  const ang = Math.atan2(sx, sz) * 180 / Math.PI;
  m.addC('6141', RIDGE, cx, cz, R0 + 4, 0, mv);
  m.addRaw('53451', RIDGE, [X(cx), Y(R0 + 5) - 5, Z(cz)], rotY(ang), mv);
}
m.step('Lower roof slopes');
slopeRing('3298', R0 + 4, 7, 3, 2, '3675');
m.step('Roof core');
m.solid(new Map([...ring(CX - 4, CZ - 4, CX + 4, CZ + 4)].map(k => [k, { b: R0 + 4, t: R0 + 7, color: TERRA }]))).forEach(l => l.parts.forEach(p => Object.assign(p, mv)));
m.step('Upper hip slopes');
slopeRing('3039', R0 + 7, 5, 2, 2, '3045');

// gable top along x: front and back slopes, Dark Red gable ends
const G = R0 + 10;
m.step('Gable', { note: 'Hip-and-gable roof: the upper part closes with small gables on the left and right.' });
for (let x = CX - 4; x < CX + 4; x += 2) { m.add('3039', TERRA, x, CZ - 4, G, 0, mv); m.add('3039', TERRA, x, CZ + 2, G, 180, mv); }
m.add(BRICK['1x4'], GABLE, CX - 4, CZ - 2, G, 90, mv); m.add(BRICK['1x4'], GABLE, CX + 3, CZ - 2, G, 90, mv);
m.step('Gable');
for (let x = CX - 4; x < CX + 4; x += 2) { m.add('3039', TERRA, x, CZ - 3, G + 3, 0, mv); m.add('3039', TERRA, x, CZ + 1, G + 3, 180, mv); }
m.add(BRICK['1x2'], GABLE, CX - 4, CZ - 1, G + 3, 90, mv); m.add(BRICK['1x2'], GABLE, CX + 3, CZ - 1, G + 3, 90, mv);
m.step('Gable');
for (let x = CX - 4; x < CX + 4; x += 2) { m.add('3039', TERRA, x, CZ - 2, G + 6, 0, mv); m.add('3039', TERRA, x, CZ, G + 6, 180, mv); }

const RT = G + 9;
m.step('Ridge');
m.add(PLATE['2x10'], RIDGE, CX - 5, CZ - 1, RT, 0, mv);
m.step('Two dragons facing the moon', { note: 'Lưỡng long chầu nguyệt: each dragon curls its tail at the end of the ridge and raises its head toward the pearl moon.' });
for (const side of [-1, 1]) {
  // tail curl at the ridge end, arched body rising toward the head, jaws facing the moon
  const tailX = side < 0 ? CX - 5 : CX + 4, bodyX = side < 0 ? CX - 4 : CX + 2, headX = side < 0 ? CX - 2 : CX + 1;
  m.add(PLATE['1x2'], RIDGE, tailX, CZ - 1, RT + 1, 90, mv);
  m.addRaw('53451', RIDGE, [X(tailX + 0.5), Y(RT + 2) - 5, Z(CZ - 0.5)], rotY(side < 0 ? 270 : 90), mv);
  m.addRaw('53451', RIDGE, [X(tailX + 0.5), Y(RT + 2) - 5, Z(CZ + 0.5)], rotY(side < 0 ? 270 : 90), mv);
  for (const dz of [-1, 0]) m.add('11477', RIDGE, bodyX, CZ + dz, RT + 1, side < 0 ? 90 : 270, mv);
  m.add(PLATE['1x2'], RIDGE, headX, CZ - 1, RT + 1, 90, mv);
  m.add(PLATE['1x2'], RIDGE, headX, CZ - 1, RT + 2, 90, mv);
  for (const dz of [-1, 0]) m.add('15070', RIDGE, headX, CZ + dz, RT + 3, side < 0 ? 270 : 90, mv);
}
m.addC('18674', RIDGE, CX, CZ, RT + 1, 0, mv);
m.addC('3062b', C.pearlGold, CX, CZ, RT + 2, 0, mv);
m.addC('98138', C.pearlGold, CX, CZ, RT + 5, 0, mv);
m.endSub('Place the roof on the shrine');
