// British Shorthair cat (blue tabby, amber eyes, peach collar) — life-size LEGO bust sculpture.
// Shape: signed-distance blobs in stud units, voxelised at 1 stud x 1 plate, hollowed to a 2-stud shell.
// Motion: the head (from the collar up) sits on a 4x4 turntable and turns left/right.
import { Model, C, PLATE, BRICK, TILE, rect } from '../../lib/builder.mjs';
import { voxelize, sdEllipsoid as E, sdCapsule as Cap, smin } from '../../lib/voxel.mjs';
import { writeOutputs } from '../../lib/output.mjs';

const m = new Model('British Shorthair Cat');
const COL = { fur: C.lbg, stripe: C.dbg, white: C.white, iris: C.orange, pupil: C.black, nose: C.darkPink,
  ear: C.brightPink, collar: C.nougat, buckle: C.red, floor: C.medNougat, floorDark: C.reddishBrown };

const BASE = 2;                 // cat stands on the base top (plate level 2)
const OX = 12, OZ = 12;         // cat centre in grid coordinates
const NX = 24, NZ = 24;         // base size
const SPLIT = BASE + 34;        // head (collar and up) starts at this plate level
const Y = h => (h - BASE + 0.5) * 0.4;                 // plate level -> height in studs (voxel centre)

// ---- shape ----------------------------------------------------------------------
function body(p) {
  let d = E(p, [0, 4.0, -2.0], [7.9, 4.6, 7.4]);                    // haunches
  d = smin(d, E(p, [0, 9.0, 0.5], [6.3, 7.0, 5.4]), 2.5);            // chest and back
  for (const s of [-1, 1]) {
    d = smin(d, E(p, [s * 5.0, 3.6, -1.4], [2.9, 3.4, 4.6]), 1.5);   // thighs
    d = smin(d, Cap(p, [s * 2.3, 1.4, 4.3], [s * 2.1, 8.5, 2.6], 1.65), 1.2);   // front legs
    d = smin(d, E(p, [s * 2.4, 0.9, 5.2], [1.8, 1.0, 2.2]), 0.8);    // paws
  }
  d = smin(d, E(p, [0, 14.6, 0.9], [4.2, 3.2, 3.8]), 2);             // neck
  return d;
}
function head(p) {
  let d = E(p, [0, 14.6, 0.9], [4.2, 3.2, 3.8]);                      // neck (collar sits here)
  d = smin(d, E(p, [0, 19.4, 1.4], [6.3, 4.3, 4.9]), 2);            // round skull
  for (const s of [-1, 1]) d = smin(d, E(p, [s * 3.0, 18.0, 3.4], [3.5, 2.7, 3.0]), 1.5);   // cheeks
  d = smin(d, E(p, [0, 18.2, 5.3], [2.4, 1.6, 1.8]), 1);             // muzzle
  return Math.min(d, ear(p, -1).d, ear(p, 1).d);
}
function ear(p, s) {
  const b = [s * 3.7, 22.0, 1.3], a = [s * 5.4, 25.6, 1.0];
  const t = (p[1] - b[1]) / (a[1] - b[1]);
  if (t < 0 || t > 1) return { d: 1, t };
  const ax = b[0] + (a[0] - b[0]) * t, az = b[2] + (a[2] - b[2]) * t, r = 2.3 * (1 - t) + 0.3;
  return { d: Math.max(Math.abs(p[0] - ax) - r, Math.abs(p[2] - az) - 1.1 * (1 - 0.4 * t)), t, inner: Math.abs(p[0] - ax) < r * 0.55 };
}
// tail lies on the floor and curls round the left side toward the paws
const tailPts = [[-2, 1.2, -8.2], [-6.5, 1.1, -7.2], [-9.2, 1.1, -3.8], [-9.6, 1.1, 0.6], [-8.2, 1.1, 4.4]];
function tail(p) {
  let best = { d: Infinity, s: 0 };
  for (let i = 0; i < tailPts.length - 1; i++) {
    const r = t => 1.35 - 0.12 * (i + t);
    const d = Cap(p, tailPts[i], tailPts[i + 1], r);
    if (d < best.d) {
      const a = tailPts[i], b = tailPts[i + 1], ba = b.map((v, k) => v - a[k]);
      const t = Math.max(0, Math.min(1, p.reduce((s2, v, k) => s2 + (v - a[k]) * ba[k], 0) / ba.reduce((s2, v) => s2 + v * v, 0)));
      best = { d, s: i + t };
    }
  }
  return best;
}

const legDist = p => Math.min(...[-1, 1].map(s => Cap(p, [s * 2.3, 1.4, 4.3], [s * 2.1, 8.5, 2.6], 1.65)));

// ---- voxelise ----------------------------------------------------------------------
const occ = new Map();
const frac = v => v - Math.floor(v);
for (let h = BASE; h < BASE + 70; h++) for (let x = 0; x < NX; x++) for (let z = 0; z < NZ; z++) {
  const p = [x + 0.5 - OX, Y(h), z + 0.5 - OZ];
  const tl = tail(p);
  const isHead = h >= SPLIT;
  const d = isHead ? head(p) : Math.min(body(p), tl.d);
  if (d > 0) continue;
  let col = COL.fur;
  const [px, py, pz] = p;
  if (!isHead) {
    if (tl.d <= 0 && body(p) > 0) col = (frac(tl.s * 1.1) < 0.4 || tl.s > 3.4) ? COL.stripe : COL.fur;
    else if (legDist(p) < 0.35 && py < 8.5) col = frac(py * 0.6 + 0.1) < 0.3 ? COL.stripe : COL.fur;             // leg bands
    else if (Math.abs(px) > 3.8 && frac(pz * 0.28 + py * 0.16 + 0.35 * Math.sin(py * 0.9)) < 0.3) col = COL.stripe;   // tabby flank stripes
    if (pz > 3.6 && py > 9.6 && py < 13.8 && Math.abs(px) < 1.2 + (py - 9.6) * 0.3) col = COL.white;                 // chest bib
  } else {
    const ax = Math.abs(px);
    if (pz > 1.5 && ((ax === 0.5 && py > 21.4 && py < 22.8) || (ax === 2.5 && py > 21.8 && py < 23.2) || (ax === 1.5 && py > 22.8 && py < 23.6))) col = COL.stripe;   // forehead "M"
    if (py < 18.1 && pz > 5 && ax < 2.2) col = COL.white;                                                                // muzzle
    if (py < 16.8 && pz > 3 && ax < 1.6) col = COL.white;                                                                // chin
    if (h < SPLIT + 2) col = COL.collar;                                                                                // collar band
  }
  occ.set(`${x},${z},${h}`, col);
}
// the lowest layers rest on the floor: extrude them straight down so nothing overhangs the boards
for (let h = BASE + 7; h > BASE; h--) for (const [k, col] of [...occ]) { const [x, z, hh] = k.split(',').map(Number); if (hh === h && !occ.has(`${x},${z},${h - 1}`)) occ.set(`${x},${z},${h - 1}`, col); }
// hollow: drop voxels that are 2 studs inside the surface (and 2 plates from any top/bottom)
const inside = (x, z, h) => { for (let dh = -2; dh <= 2; dh++) for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (!occ.has(`${x + dx},${z + dz},${h + dh}`)) return false; return true; };
const keepSolid = (x, z, h) => h >= SPLIT && h < SPLIT + 3 && x >= OX - 2 && x < OX + 2 && z >= OZ - 1 && z < OZ + 3;   // head floor over the turntable
const hollow = [...occ.keys()].filter(k => { const [x, z, h] = k.split(',').map(Number); return h > BASE && inside(x, z, h) && !keepSolid(x, z, h); });

// ---- face details on the front surface ------------------------------------------------
const front = (x, h) => { let best = null; for (let z = NZ - 1; z >= 0; z--) if (occ.has(`${x},${z},${h}`)) return z; return best; };
const paint = (cx, h, col, depth = 2) => { const x = cx + OX - 0.5; const z = front(x, h); if (z === null) return; for (let d = 0; d < depth; d++) if (occ.has(`${x},${z - d},${h}`)) occ.set(`${x},${z - d},${h}`, col); };
const EYE_H = BASE + 50;
for (const s of [-1, 1]) {
  const c = s * 2.5;
  const rows = [[EYE_H - 1, '.O.'], [EYE_H, 'OBO'], [EYE_H + 1, 'OBO'], [EYE_H + 2, '.O.']];
  for (const [h, pat] of rows) [...pat].forEach((ch, i) => { const cx = c + (i - 1); if (ch === 'O') paint(cx, h, COL.iris); if (ch === 'B') paint(cx, h, COL.pupil); if (ch === '.') paint(cx, h, COL.stripe); });
  for (const i of [-1, 0, 1]) paint(c + i, EYE_H + 3, COL.stripe);        // upper lid line
}
paint(-0.5, BASE + 46, COL.nose); paint(0.5, BASE + 46, COL.nose);         // nose
paint(-0.5, BASE + 45, COL.stripe); paint(0.5, BASE + 45, COL.stripe);     // mouth
paint(-0.5, SPLIT, COL.buckle, 1); paint(0.5, SPLIT, COL.buckle, 1); paint(-0.5, SPLIT + 1, COL.buckle, 1); paint(0.5, SPLIT + 1, COL.buckle, 1);
// inner ears
for (const [k] of occ) { const [x, z, h] = k.split(',').map(Number); if (h < SPLIT) continue;
  const p = [x + 0.5 - OX, Y(h), z + 0.5 - OZ];
  for (const s of [-1, 1]) { const e = ear(p, s); if (e.d <= 0 && e.inner && e.t > 0.08 && e.t < 0.8 && front(x, h) === z) occ.set(k, COL.ear); } }
for (const k of hollow) occ.delete(k);

// turntable in the neck: clear its space and a 4x4 support column under it
const TT = { x: OX - 2, z: OZ - 1 };               // 4x4 turntable footprint (centre OX, OZ + 1)
const column = rect(TT.x, TT.z, TT.x + 4, TT.z + 4);
for (const cell of column) for (let h = BASE; h < SPLIT; h++) occ.delete(`${cell},${h}`);

// ---- base: wooden floor ---------------------------------------------------------------
const bodyOcc = new Map([...occ].filter(([k]) => +k.split(',')[2] < SPLIT));
const headOcc = new Map([...occ].filter(([k]) => +k.split(',')[2] >= SPLIT));
const footprint = new Set([...bodyOcc.keys()].filter(k => +k.split(',')[2] === BASE).map(k => k.split(',').slice(0, 2).join(',')));
for (const c of column) footprint.add(c);

m.bag(1, 'Wooden floor');
m.step('Base plates');
m.fill(rect(0, 0, NX, NZ), 0, PLATE, C.reddishBrown);
m.step('Floor boards');
m.fill(footprint, 1, PLATE, C.medNougat, { alt: true });
const boards = [...rect(0, 0, NX, NZ)].filter(k => !footprint.has(k));
// planks run left-right in 1x4/1x6/1x8 tiles, staggered
const rowsZ = new Map(); for (const k of boards) { const [x, z] = k.split(',').map(Number); if (!rowsZ.has(z)) rowsZ.set(z, []); rowsZ.get(z).push(x); }
for (const [z, xs] of [...rowsZ].sort((a, b) => a[0] - b[0])) {
  if (z % 6 === 0) m.step('Floor boards');
  const set = new Set(xs); let x = Math.min(...xs); const end = Math.max(...xs);
  let first = true;
  while (x <= end) {
    if (!set.has(x)) { x++; continue; }
    let run = 0; while (set.has(x + run)) run++;
    let pos = x;
    while (run > 0) {
      const want = first ? [2, 4, 6, 3][z % 4] : 8;
      const len = [8, 6, 4, 3, 2, 1].find(l => l <= Math.min(run, want));
      m.add(TILE['1x' + len], (z * 7 + pos) % 5 === 0 ? C.darkTan : C.medNougat, pos, z, 1, 0);
      pos += len; run -= len; first = false;
    }
    x = pos;
  }
}

// ---- body -------------------------------------------------------------------------
m.bag(2, 'Body');
const bagFor = h => h < BASE + 12 ? 2 : 3;
let lastBag = 0;
m.step('Support column for the head turntable', { note: 'This hidden column carries the turntable in the neck.' });
m.solid(new Map([...column].map(k => [k, { b: BASE, t: SPLIT - 3, color: C.dbg }])), { maxBrick: 4 });
voxelize(m, bodyOcc, { onLayer: h => {
  const b = bagFor(h);
  if (b !== lastBag) { lastBag = b; m.bag(b, b === 2 ? 'Paws, tail and haunches' : 'Chest, back and neck'); }
  m.step(h === SPLIT - 1 ? 'Smooth neck top (the head turns on these tiles)' : `Body layer ${h - BASE + 1}`);
} });
m.bag(4, 'Turntable and head');
m.step('Turntable in the neck', { note: 'Only the turntable holds the head, so the head can turn.' });
m.add('3403c01', C.dbg, TT.x, TT.z, SPLIT - 3, 0);

// ---- head (turns on the turntable) --------------------------------------------------------
m.beginSub('Head');
voxelize(m, headOcc, { onLayer: h => {
  if (h === BASE + 56) m.bag(5, 'Face, forehead and ears');
  m.step(h < SPLIT + 2 ? 'Collar' : h >= BASE + 58 ? 'Ears' : `Head layer ${h - SPLIT + 1}`);
} });
m.parts.filter(p => p.sub === 'Head').forEach(p => { p.moving = 'head'; p.pivot = [OX * 20, (OZ + 1) * 20]; });
m.endSub('Place the head on the turntable');

writeOutputs(m, new URL('../build/', import.meta.url).pathname, 'british-shorthair-cat');
