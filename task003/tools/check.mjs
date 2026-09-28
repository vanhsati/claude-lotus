// Structural checks on build/model.json using real LDraw part geometry:
//  1. collisions  — overlapping part bounding boxes (studs excluded, 1 LDU tolerance)
//  2. connectivity — every part must be reachable from the base plates through stud connections
//                    (a stud of one part inside the bottom footprint of the part sitting on it),
//                    Technic axles/holes, or explicitly declared joints.
import fs from 'node:fs';
import { partInfo } from '../lib/ldraw.mjs';
import { PDIR } from '../lib/project.mjs';

const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const P = model.parts;
const TOL = 1.0;

function worldBox(p) {
  const i = partInfo(p.part), R = p.R;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const x of [i.min[0], i.max[0]]) for (const y of [i.min[1], i.max[1]]) for (const z of [i.min[2], i.max[2]]) {
    const v = [R[0] * x + R[1] * y + R[2] * z + p.pos[0], R[3] * x + R[4] * y + R[5] * z + p.pos[1], R[6] * x + R[7] * y + R[8] * z + p.pos[2]];
    for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], v[a]); mx[a] = Math.max(mx[a], v[a]); }
  }
  return { mn, mx };
}
const boxes = P.map(worldBox);
const studsOf = p => partInfo(p.part).studs.map(s => {
  const R = p.R, [x, y, z] = s;
  const d = s[3].split(',').map(Number);
  const wd = [R[0] * d[0] + R[1] * d[1] + R[2] * d[2], R[3] * d[0] + R[4] * d[1] + R[5] * d[2], R[6] * d[0] + R[7] * d[1] + R[8] * d[2]];
  return { p: [R[0] * x + R[1] * y + R[2] * z + p.pos[0], R[3] * x + R[4] * y + R[5] * z + p.pos[1], R[6] * x + R[7] * y + R[8] * z + p.pos[2]], up: wd[1] < -0.5 };
});

// parts allowed to pass through others (axles through holes) or deliberately meshing
const THROUGH = new Set(['50451', '3708', '3707', '3705', '3706', '4519']);
const HOLED = new Set(['3700', '3709b', '87081', '15535', '4716', '3648b', '3713', '6538b', '4185a', '4032a', '32123a']);
const MESH = [['4716', '3648b']];
const JOINT = [['60596', '60623']];   // door hinged into its frame
const ROUND = new Set(['87081', '3941', '4032a', '18674', '15535', '6141', '98138', '3062b', '24866', '33291', '4589', '14769']);
// footprint of a round part is a circle; compare by distance instead of box overlap
function roundOverlap(a, b) {
  const A = boxes[a], B = boxes[b];
  const ca = [(A.mn[0] + A.mx[0]) / 2, (A.mn[2] + A.mx[2]) / 2], cb = [(B.mn[0] + B.mx[0]) / 2, (B.mn[2] + B.mx[2]) / 2];
  const ra = (A.mx[0] - A.mn[0]) / 2, rb = (B.mx[0] - B.mn[0]) / 2;
  if (ROUND.has(P[a].part) && ROUND.has(P[b].part)) return Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) < ra + rb - TOL;
  // circle vs box
  const [c, r, bx] = ROUND.has(P[a].part) ? [ca, ra, B] : [cb, rb, A];
  const qx = Math.max(bx.mn[0], Math.min(c[0], bx.mx[0])), qz = Math.max(bx.mn[2], Math.min(c[1], bx.mx[2]));
  return Math.hypot(c[0] - qx, c[1] - qz) < r - TOL;
}

// ---- spatial hash ------------------------------------------------------------
const CELL = 40, grid = new Map();
boxes.forEach((b, i) => {
  for (let x = Math.floor(b.mn[0] / CELL); x <= Math.floor(b.mx[0] / CELL); x++)
    for (let y = Math.floor(b.mn[1] / CELL); y <= Math.floor(b.mx[1] / CELL); y++)
      for (let z = Math.floor(b.mn[2] / CELL); z <= Math.floor(b.mx[2] / CELL); z++) {
        const k = `${x},${y},${z}`; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i);
      }
});
const pairs = new Set();
for (const list of grid.values()) for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) pairs.add(list[a] < list[b] ? list[a] * 100000 + list[b] : list[b] * 100000 + list[a]);

const collisions = [];
for (const key of pairs) {
  const a = Math.floor(key / 100000), b = key % 100000;
  const A = boxes[a], B = boxes[b];
  let ov = true;
  for (let k = 0; k < 3; k++) if (A.mx[k] - TOL <= B.mn[k] || B.mx[k] - TOL <= A.mn[k]) ov = false;
  if (!ov) continue;
  // overlaps no deeper than a stud at a top/bottom interface are stud-like details (pins, hollow studs)
  const yov = Math.min(A.mx[1], B.mx[1]) - Math.max(A.mn[1], B.mn[1]);
  if (yov <= 4.5) continue;
  const pa = P[a].part, pb = P[b].part;
  if (JOINT.some(([x, y]) => (pa === x && pb === y) || (pa === y && pb === x))) continue;
  if (P[a].free && P[b].free) continue;
  if ((THROUGH.has(pa) && (HOLED.has(pb) || THROUGH.has(pb))) || (THROUGH.has(pb) && (HOLED.has(pa) || THROUGH.has(pa)))) continue;
  if (MESH.some(([x, y]) => (pa === x && pb === y) || (pa === y && pb === x))) continue;
  if ((ROUND.has(pa) || ROUND.has(pb)) && !roundOverlap(a, b)) continue;
  collisions.push([a, b]);
}

// ---- connectivity --------------------------------------------------------------
const adj = P.map(() => new Set());
const link = (a, b) => { adj[a].add(b); adj[b].add(a); };
const allStuds = P.map(studsOf);
for (const key of pairs) {
  const a = Math.floor(key / 100000), b = key % 100000;
  for (const [lo, hi] of [[a, b], [b, a]]) {
    const H = boxes[hi];
    for (const s of allStuds[lo]) {
      if (!s.up) continue;
      // stud base at y; the part above has its bottom at the same y and covers the stud in plan
      if (Math.abs(H.mx[1] - s.p[1]) > 1.1) continue;
      if (s.p[0] > H.mn[0] + 2 && s.p[0] < H.mx[0] - 2 && s.p[2] > H.mn[2] + 2 && s.p[2] < H.mx[2] - 2) { link(lo, hi); break; }
    }
  }
  if (JOINT.some(([x, y]) => (P[a].part === x && P[b].part === y) || (P[a].part === y && P[b].part === x))) link(a, b);
  // axles are held by the parts they pass through
  const pa = P[a].part, pb = P[b].part;
  if ((THROUGH.has(pa) && HOLED.has(pb)) || (THROUGH.has(pb) && HOLED.has(pa))) {
    const A = boxes[a], B = boxes[b];
    let ov = true; for (let k = 0; k < 3; k++) if (A.mx[k] <= B.mn[k] || B.mx[k] <= A.mn[k]) ov = false;
    if (ov) link(a, b);
  }
}
// the drive axle's joiner, worm and gear sit on axles (bounding boxes already overlap them)
const seen = new Set();
const queue = P.map((p, i) => i).filter(i => boxes[i].mx[1] >= -0.5 && boxes[i].mx[1] <= 0.5);
queue.forEach(i => seen.add(i));
while (queue.length) { const i = queue.pop(); for (const j of adj[i]) if (!seen.has(j)) { seen.add(j); queue.push(j); } }
const floating = P.map((p, i) => i).filter(i => !seen.has(i));

const fmtP = i => `#${i} ${P[i].part} c${P[i].color} step ${P[i].step} (${model.steps[P[i].step].title}) @ ${P[i].pos.map(v => Math.round(v)).join(',')}`;
const report = [];
report.push(`parts: ${P.length}, steps: ${model.steps.length}`);
report.push(`collisions: ${collisions.length}`);
for (const [a, b] of collisions.slice(0, 60)) report.push(`  ${fmtP(a)}  <->  ${fmtP(b)}`);
report.push(`not connected to the base: ${floating.length}`);
for (const i of floating.slice(0, 5000)) report.push(`  ${fmtP(i)}`);
const weak = P.map((p, i) => i).filter(i => seen.has(i) && adj[i].size === 1 && !P[i].free);
report.push(`parts held by a single neighbour: ${weak.length}`);
fs.writeFileSync(PDIR + 'build/check.txt', report.join('\n') + '\n');
console.log(report.slice(0, 3).join('\n') + '\n' + report.find(l => l.startsWith('not connected')) );
if (process.argv.includes('-v')) console.log(report.join('\n'));
process.exitCode = collisions.length || floating.length ? 1 : 0;
