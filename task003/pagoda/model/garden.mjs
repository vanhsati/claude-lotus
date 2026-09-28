import { m, C, PLATE, BRICK, TILE, rect, rotY, X, Y, Z, GROUND } from './ctx.mjs';
import { partInfo } from '../../lib/ldraw.mjs';

// =============================================================================
// BAG 8 — Garden: bodhi tree, frangipani, stone lanterns, incense urn, stele
// =============================================================================
m.bag(8, 'Garden and temple details');
const G = GROUND;
const greens = [C.green, C.brightGreen, C.darkGreen];

// leaves (2423) radiate from the stud next to the trunk, pointing outward
function leafRing(cx, cz, h, diagonal, colors, flowers = null) {
  const dirs = diagonal ? [45, 135, 225, 315] : [0, 90, 180, 270];
  dirs.forEach((a, i) => {
    // stem stud one stud out from the trunk centre, in the leaf direction (leaf points to -z at 0 deg)
    const r = diagonal ? 1 : 1.5;
    const ux = -Math.sin(a * Math.PI / 180), uz = -Math.cos(a * Math.PI / 180);
    const sx = diagonal ? cx + Math.sign(ux) * 1.5 : cx + ux * 1.5 + (ux === 0 ? (i < 2 ? -0.5 : 0.5) : 0);
    const sz = diagonal ? cz + Math.sign(uz) * 1.5 : cz + uz * 1.5 + (uz === 0 ? (i < 2 ? 0.5 : -0.5) : 0);
    const R = rotY(a);
    const leaf = m.addRaw('2423', colors[i % colors.length], [X(sx), Y(h) - 8, Z(sz)], R, { free: true });
    if (flowers) for (const j of flowers) {
      const st = partInfo('2423').studs[j];
      const wx = R[0] * st[0] + R[2] * st[2] + X(sx), wz = R[6] * st[0] + R[8] * st[2] + Z(sz);
      m.addRaw('24866', C.white, [wx, Y(h + 1) - 8, wz], rotY(a), { free: true });
      m.addRaw('98138', C.yellow, [wx, Y(h + 2) - 8, wz], rotY(a), { free: true });
    }
  });
}

// ---- Bodhi tree (gift from India, 1958, in the Diên Hựu garden) ---------------
m.beginSub('Bodhi tree');
const bx = 26, bz = 33;
m.step('Bodhi tree trunk and roots');
for (const [x, z, r] of [[23, 32, 90], [27, 33, 270], [25, 30, 0], [26, 34, 180]]) m.add('11477', C.reddishBrown, x, z, G, r, { free: true });
for (let i = 0; i < 4; i++) m.addC('3941', C.reddishBrown, bx, bz, G + 3 * i);
m.step('Bodhi tree branches');
m.addC('3941', C.reddishBrown, bx, bz, G + 12);
m.add(PLATE['4x4'], C.reddishBrown, bx - 2, bz - 2, G + 15);
leafRing(bx, bz, G + 16, true, [C.darkGreen, C.green]);
m.step('Bodhi tree branches');
m.addC('3941', C.reddishBrown, bx, bz, G + 16, 0, { free: true });
m.add(PLATE['4x4'], C.reddishBrown, bx - 2, bz - 2, G + 19);
leafRing(bx, bz, G + 20, false, greens);
m.step('Bodhi tree canopy');
m.addC('3941', C.reddishBrown, bx, bz, G + 20, 0, { free: true });
m.add(PLATE['4x4'], C.reddishBrown, bx - 2, bz - 2, G + 23);
leafRing(bx, bz, G + 24, true, [C.brightGreen, C.green]);
m.step('Bodhi tree crown');
m.addC('3941', C.reddishBrown, bx, bz, G + 24, 0, { free: true });
m.add(PLATE['2x2'], C.green, bx - 1, bz - 1, G + 27);
m.addRaw('2417', C.brightGreen, [X(bx), Y(G + 28) - 8, Z(bz)], rotY(20), { free: true });
m.endSub('Plant the bodhi tree');

// ---- Frangipani (hoa sứ) with white flowers --------------------------------
m.beginSub('Frangipani tree');
const fx = 6, fz = 33;
m.step('Frangipani trunk');
for (let i = 0; i < 3; i++) m.addC('3941', C.darkTan, fx, fz, G + 3 * i);
m.add(PLATE['4x4'], C.darkTan, fx - 2, fz - 2, G + 9);
m.step('Frangipani leaves and flowers');
leafRing(fx, fz, G + 10, false, [C.brightGreen, C.green], [3, 5]);
m.endSub('Plant the frangipani');

// ---- stone lanterns at the foot of the stair -----------------------------------
m.step('Stone lanterns');
for (const [x, z] of [[11, 33], [20, 33]]) {
  m.add(BRICK['1x1'], C.lbg, x, z, G);
  m.addC('6141', C.lbg, x + 0.5, z + 0.5, G + 3);
  m.add('3062b', C.transYellow, x, z, G + 4);
  m.addC('6141', C.dbg, x + 0.5, z + 0.5, G + 7);
  m.add('4589', C.dbg, x, z, G + 8);
}
// ---- incense urn on the entrance path ------------------------------------------
m.step('Incense urn');
m.addC('4032a', C.dbg, 16, 38, G);
m.addC('3941', C.dbg, 16, 38, G + 1);
m.addC('4032a', C.dbg, 16, 38, G + 4);
for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) m.addC('98138', C.transOrange, 16 + dx, 38 + dz, G + 5);
// ---- stele beside the pond ---------------------------------------------------
m.step('Stone stele');
m.add(BRICK['1x2'], C.dbg, 2, 5, G, 90);
m.add(BRICK['1x2'], C.dbg, 2, 5, G + 3, 90);
m.add('3044b', C.dbg, 2, 5, G + 6, 90);
