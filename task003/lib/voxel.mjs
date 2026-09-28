// Voxel sculpture -> LEGO. A voxel is one stud wide/deep and one plate high.
// occupancy: Map "x,z,h" -> colour. Converts layer by layer (bottom up): bricks where the same
// colour continues for 3 layers, plates otherwise, tiles on voxels whose top is exposed.
import { BRICK, PLATE, TILE } from './builder.mjs';

const key = (x, z, h) => `${x},${z},${h}`;
// colours that exist in few moulds: keep to small, common shapes
const COMMON = new Set([0, 15, 71, 72, 70, 19, 4, 14, 1, 2, 28]);
const pick = (table, keys) => Object.fromEntries(keys.filter(k => table[k]).map(k => [k, table[k]]));
const SMALL_PLATE = ['1x1', '1x2', '1x3', '1x4', '2x2', '2x3', '2x4'];
const SMALL_TILE = ['1x1', '1x2', '1x3', '1x4', '2x2'];
const SMALL_BRICK = ['1x1', '1x2', '1x4', '2x2', '2x4'];

export function voxelize(m, occ, { onLayer = null, maxLen = 8 } = {}) {
  let hmin = Infinity, hmax = -Infinity;
  for (const k of occ.keys()) { const h = +k.split(',')[2]; hmin = Math.min(hmin, h); hmax = Math.max(hmax, h); }
  const filled = new Set();
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let alt = false;
  for (let h = hmin; h <= hmax; h++) {
    const layer = [...occ].filter(([k]) => +k.split(',')[2] === h && !filled.has(k));
    if (!layer.length) continue;
    if (onLayer) onLayer(h);
    const here = new Map(layer.map(([k, c]) => [k.split(',').slice(0, 2).join(','), c]));
    const supported = xz => h === hmin || occ.has(`${xz},${h - 1}`);
    // an overhanging cell must share a plate with a supported neighbour: give it that neighbour's
    // colour if needed, and keep the neighbours as plates (no bricks or tiles) so they can merge
    const plateOnly = new Set();
    for (const [xz, col] of here) {
      if (supported(xz)) continue;
      const [x, z] = xz.split(',').map(Number);
      const nb = N4.map(([dx, dz]) => `${x + dx},${z + dz}`).filter(n => here.has(n) && supported(n));
      if (nb.length && !nb.some(n => here.get(n) === col)) here.set(xz, here.get(nb[0]));
      plateOnly.add(xz); nb.forEach(n => plateOnly.add(n));
    }
    const groups = new Map();
    for (const [xz, col] of here) {
      const [x, z] = xz.split(',').map(Number);
      const top = !occ.has(key(x, z, h + 1));
      const brick = !plateOnly.has(xz) && supported(xz) && !top && occ.get(key(x, z, h + 1)) === col && occ.get(key(x, z, h + 2)) === col
        && !filled.has(key(x, z, h + 1)) && !filled.has(key(x, z, h + 2)) && occ.has(key(x, z, h + 3))
        // a neighbour that will overhang in the next two layers needs this cell free to share a plate
        && ![1, 2].some(d => N4.some(([dx, dz]) => occ.has(key(x + dx, z + dz, h + d)) && !occ.has(key(x + dx, z + dz, h + d - 1))));
      const kind = brick ? 'brick' : top && supported(xz) && !plateOnly.has(xz) ? 'tile' : 'plate';
      const g = kind + '|' + col;
      if (!groups.has(g)) groups.set(g, new Set());
      groups.get(g).add(xz);
    }
    for (const [g, cells] of groups) {
      const [kind, c] = g.split('|'); const col = +c;
      let table = kind === 'brick' ? BRICK : kind === 'tile' ? TILE : PLATE;
      if (!COMMON.has(col)) table = pick(table, kind === 'brick' ? SMALL_BRICK : kind === 'tile' ? SMALL_TILE : SMALL_PLATE);
      const hp = kind === 'brick' ? 3 : 1;
      for (const r of anchoredFill(cells, table, supported, alt, maxLen)) {
        const p = m.add(table[r.size], col, r.x, r.z, h, r.rot);
        p.cells = r.cells;
        for (const cell of r.cells) for (let d = 0; d < hp; d++) filled.add(`${cell},${h + d}`);
      }
    }
    alt = !alt;
  }
}

// Greedy rectangle cover that handles overhanging cells first and prefers pieces reaching a supported cell.
function anchoredFill(cellSet, table, supported, alt, maxLen) {
  const free = new Set(cellSet);
  const sizes = Object.keys(table).map(k => { const [a, b] = k.split('x').map(Number); return { k, a, b }; }).filter(s => s.b <= maxLen);
  const order = [...free].map(k => k.split(',').map(Number))
    .sort((p, q) => (supported(`${p[0]},${p[1]}`) - supported(`${q[0]},${q[1]}`)) || (alt ? p[0] - q[0] || p[1] - q[1] : p[1] - q[1] || p[0] - q[0]));
  const out = [];
  for (const [cx, cz] of order) {
    if (!free.has(`${cx},${cz}`)) continue;
    let best = null;
    for (const s of sizes) for (const [w, d, rot] of s.a === s.b ? [[s.a, s.a, 0]] : [[s.b, s.a, 0], [s.a, s.b, 90]]) {
      for (let ox = 0; ox < w; ox++) for (let oz = 0; oz < d; oz++) {
        const x0 = cx - ox, z0 = cz - oz, cells = [];
        let ok = true, anchor = false;
        for (let i = 0; i < w && ok; i++) for (let j = 0; j < d && ok; j++) {
          const k = `${x0 + i},${z0 + j}`;
          if (!free.has(k)) ok = false; else { cells.push(k); if (supported(k)) anchor = true; }
        }
        if (!ok) continue;
        const along = (rot === 0) === !alt ? 1 : 0;
        const score = (anchor ? 1e6 : 0) + w * d * 100 + along * 10 - (ox + oz);
        if (!best || score > best.score) best = { score, x: x0, z: z0, size: s.k, rot, cells };
      }
    }
    best.cells.forEach(k => free.delete(k));
    out.push(best);
  }
  return out;
}

// ---- signed-distance helpers (units: studs; y up) ----------------------------
export const sdEllipsoid = (p, c, r) => {
  const q = [(p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]];
  return (Math.hypot(...q) - 1) * Math.min(...r);
};
export const sdCapsule = (p, a, b, r) => {
  const pa = p.map((v, i) => v - a[i]), ba = b.map((v, i) => v - a[i]);
  const t = Math.max(0, Math.min(1, pa.reduce((s, v, i) => s + v * ba[i], 0) / ba.reduce((s, v) => s + v * v, 0)));
  return Math.hypot(...pa.map((v, i) => v - ba[i] * t)) - (typeof r === 'function' ? r(t) : r);
};
export const smin = (a, b, k = 1) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
