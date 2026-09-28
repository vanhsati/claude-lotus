import { m, C, PLATE, BRICK, rect, rotX, rotY, rotZ, X, Y, Z, W, D, CX, CZ, WORM_Z, AXLE_H, cellsOf } from './ctx.mjs';

// =============================================================================
// BAG 1 — Base and the crank mechanism
// =============================================================================
m.bag(1, 'Base and lotus-throne drive');
m.step('Base plates');
m.fill(rect(0, 0, W, D), 0, PLATE, C.dbg);

// --- gear box around the vertical drive axle ---------------------------------
m.step('Gear box: bearing and first walls');
m.addC('15535', C.lbg, CX, CZ, 1);                           // smooth tile with hole: axle bearing
const gearBox = {
  west: [[13, 11, 1, 1], [13, 14, 1, 4]], east: [[18, 11, 1, 1], [18, 14, 1, 4]],
  north: [[14, 11, 4, 1]], south: [[14, 17, 4, 1]],
};
const boxCells = new Set();
for (const side of Object.values(gearBox)) for (const [x, z, w, d] of side) for (const k of rect(x, z, x + w, z + d)) boxCells.add(k);
m.solid(cellsOf(boxCells, 1, 8, C.dbg), { maxBrick: 4 });

// Technic bricks carrying the worm shaft: lower 1x2 brick, Technic brick, plate on top
export const shaftSupports = [18, 13, 10, 3, 0];
m.step('Worm shaft supports');
for (const x of shaftSupports) {
  m.add(BRICK['1x2'], C.dbg, x, WORM_Z - 1, 1, 90);
  m.add('3700', C.black, x, WORM_Z - 1, 4, 90);
}
m.step('Worm gear and crank shaft');
m.addRaw('3708', C.black, [X(13), -AXLE_H, Z(WORM_Z)], rotY(0), { moving: 'crank' });            // axle 12: x 7..19
m.addRaw('4716', C.lbg, [X(CX), -AXLE_H, Z(WORM_Z)], rotY(90), { moving: 'crank' });             // worm on the shaft
m.addRaw('6538b', C.lbg, [X(7), -AXLE_H, Z(WORM_Z)], rotY(90), { moving: 'crank' });             // axle joiner
m.addRaw('3707', C.black, [X(3), -AXLE_H, Z(WORM_Z)], rotY(0), { moving: 'crank' });             // axle 8: x -1..7
m.addRaw('4185a', C.dbg, [X(-0.5), -AXLE_H, Z(WORM_Z)], rotY(90), { moving: 'crank' });          // crank wheel just outside the base

m.step('Vertical drive axle with 24-tooth gear', { note: 'Push the 16L axle down until it touches the base plate; it will rise 16 studs above the gear box.' });
m.addRaw('3713', C.lbg, [X(CX), Y(1) - 8 - 10, Z(CZ)], rotX(90), { moving: 'drive' });          // bush 16..36 LDU
m.addRaw('3648b', C.lbg, [X(CX), -(36 + 9.62), Z(CZ)], rotX(90), { moving: 'drive' });          // gear centre 45.6 LDU
m.addRaw('50451', C.black, [X(CX), -(12 + 160), Z(CZ)], rotZ(90), { moving: 'drive' });

m.step('Close the gear box');
for (const x of shaftSupports.filter(x => x > 0)) m.add(PLATE['1x2'], C.dbg, x, WORM_Z - 1, 7, 90);

