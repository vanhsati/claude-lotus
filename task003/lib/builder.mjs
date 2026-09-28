// Model builder: places real LDraw parts on the stud grid and records build steps.
//
// Coordinates used by the design code:
//   x, z  in studs (1 stud = 20 LDU), x to the right, z towards the viewer (front)
//   h     in plates above the table (1 plate = 8 LDU, 1 brick = 3 plates)
// LDraw uses y pointing down, so Y = -8 * h.
import { partInfo, mul } from './ldraw.mjs';

export const C = {
  black: 0, blue: 1, green: 2, red: 4, white: 15, yellow: 14, tan: 19, orange: 25,
  lbg: 71, dbg: 72, reddishBrown: 70, darkRed: 320, darkTan: 28, darkBrown: 308,
  pearlGold: 297, sandGreen: 378, darkGreen: 288, brightGreen: 10, oliveGreen: 330,
  darkOrange: 484, darkBlue: 272, medNougat: 84, brightPink: 29, darkPink: 5,
  transLightBlue: 43, transClear: 47, transYellow: 46, transOrange: 57, lime: 27,
};

export const PLATE = { '1x1': '3024', '1x2': '3023', '1x3': '3623', '1x4': '3710', '1x6': '3666', '1x8': '3460', '1x10': '4477', '1x12': '60479',
  '2x2': '3022', '2x3': '3021', '2x4': '3020', '2x6': '3795', '2x8': '3034', '2x10': '3832', '2x12': '2445',
  '4x4': '3031', '4x6': '3032', '4x8': '3035', '4x10': '3030', '4x12': '3029', '6x6': '3958', '6x8': '3036', '6x10': '3033', '6x12': '3028',
  '8x8': '41539', '8x16': '92438', '16x16': '91405' };
export const BRICK = { '1x1': '3005', '1x2': '3004', '1x3': '3622', '1x4': '3010', '1x6': '3009', '1x8': '3008',
  '2x2': '3003', '2x3': '3002', '2x4': '3001', '2x6': '2456', '2x8': '3007' };
export const TILE = { '1x1': '3070b', '1x2': '3069b', '1x3': '63864', '1x4': '2431', '1x6': '6636', '1x8': '4162',
  '2x2': '3068b', '2x3': '26603', '2x4': '87079' };

const ROT = {
  0: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  90: [0, 0, 1, 0, 1, 0, -1, 0, 0],
  180: [-1, 0, 0, 0, 1, 0, 0, 0, -1],
  270: [0, 0, -1, 0, 1, 0, 1, 0, 0],
};
export function rotY(deg) { deg = ((deg % 360) + 360) % 360; if (ROT[deg]) return ROT[deg].slice();
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
export function rotX(deg) { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [1, 0, 0, 0, c, -s, 0, s, c]; }
export function rotZ(deg) { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
export function m3mul(A, B) { return mul([...A, 0, 0, 0], [...B, 0, 0, 0]).slice(0, 9); }
const clean = v => Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1e6) / 1e6;

function rotatedBox(info, R) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const x of [info.min[0], info.max[0]]) for (const y of [info.min[1], info.max[1]]) for (const z of [info.min[2], info.max[2]]) {
    const p = [R[0] * x + R[1] * y + R[2] * z, R[3] * x + R[4] * y + R[5] * z, R[6] * x + R[7] * y + R[8] * z];
    for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[a]); mx[a] = Math.max(mx[a], p[a]); }
  }
  return { mn, mx };
}

export class Model {
  constructor(name) {
    this.name = name;
    this.parts = [];
    this.steps = [];      // {title, sub, bag, note, view}
    this.cur = null;
    this.subStack = [];
  }
  // ---- steps and structure -------------------------------------------------
  bag(n, title) { this.curBag = n; this.bagTitles = this.bagTitles || {}; this.bagTitles[n] = title; }
  step(title = '', opts = {}) {
    this.cur = { i: this.steps.length, title, bag: this.curBag, sub: this.subStack.at(-1) || null, ...opts };
    this.steps.push(this.cur);
    return this;
  }
  beginSub(name) { this.subStack.push(name); }
  endSub(title, opts = {}) {
    const name = this.subStack.pop();
    this.step(title || `Attach the ${name}`, { attach: name, ...opts });
  }
  // ---- placement ----------------------------------------------------------
  _push(part, color, R, pos, extra = {}) {
    if (!this.cur) this.step();
    const p = { part: part.toLowerCase().replace(/\.dat$/, ''), color, R: R.map(clean), pos: pos.map(clean), step: this.cur.i, sub: this.subStack.at(-1) || null, ...extra };
    this.parts.push(p);
    return p;
  }
  // footprint-aligned: rotated bounding box min corner at (x, z) studs, bottom at plate level h
  add(part, color, x, z, h, rot = 0, extra) {
    const info = partInfo(part), R = rotY(rot), b = rotatedBox(info, R);
    const pos = [x * 20 - b.mn[0], -8 * h - b.mx[1], z * 20 - b.mn[2]];
    return this._push(part, color, R, pos, extra);
  }
  // origin at stud-grid point (cx, cz), bottom of bounding box at plate level h
  addC(part, color, cx, cz, h, rot = 0, extra) {
    const info = partInfo(part), R = rotY(rot), b = rotatedBox(info, R);
    return this._push(part, color, R, [cx * 20, -8 * h - b.mx[1], cz * 20], extra);
  }
  // raw LDraw placement (LDU, y down) for mechanisms and angled parts
  addRaw(part, color, pos, R = ROT[0], extra) { return this._push(part, color, R, pos, extra); }
  footprint(part, rot = 0) {
    const info = partInfo(part), b = rotatedBox(info, rotY(rot));
    return { w: Math.round((b.mx[0] - b.mn[0]) / 20), d: Math.round((b.mx[2] - b.mn[2]) / 20), hPlates: (b.mx[1] - b.mn[1]) / 8 };
  }

  // ---- generic fills --------------------------------------------------------
  // mask: Set of "x,z" cell keys (cell = stud at [x,x+1]x[z,z+1]).
  // table: size map like PLATE/BRICK/TILE; alt flips orientation preference for bonding.
  fill(mask, h, table, color, { alt = false, maxLen = 99, prefer = null } = {}) {
    const cells = new Set(mask);
    const sizes = Object.keys(table).map(k => k.split('x').map(Number))
      .filter(([a, b]) => b <= maxLen)
      .sort((p, q) => q[0] * q[1] - p[0] * p[1] || q[1] - p[1]);
    const keys = [...cells].map(k => k.split(',').map(Number));
    keys.sort((a, b) => alt ? (a[0] - b[0] || a[1] - b[1]) : (a[1] - b[1] || a[0] - b[0]));
    const placed = [];
    for (const [x, z] of keys) {
      if (!cells.has(`${x},${z}`)) continue;
      let done = false;
      for (const [a, b] of sizes) {
        // orientation 1: b along x (rot 0), orientation 2: b along z (rot 90)
        const orients = alt ? [[a, b, 90], [b, a, 0]] : [[b, a, 0], [a, b, 90]];
        for (const [w, d, rot] of orients) {
          let ok = true;
          for (let i = 0; i < w && ok; i++) for (let j = 0; j < d && ok; j++) if (!cells.has(`${x + i},${z + j}`)) ok = false;
          if (!ok) continue;
          for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) cells.delete(`${x + i},${z + j}`);
          const key = `${a}x${b}`;
          const R = (a === b) ? 0 : rot;
          placed.push(this.add(table[key], typeof color === 'function' ? color(x, z, w, d) : color, x, z, h, R));
          done = true; break;
        }
        if (done) break;
      }
      if (!done) throw new Error(`cannot fill cell ${x},${z}`);
    }
    return placed;
  }
  // straight 1-wide run of bricks/plates/tiles with staggered joints
  run(table, color, x, z, h, len, dir = 'x', offset = 0) {
    const lens = Object.keys(table).filter(k => k.startsWith('1x')).map(k => +k.split('x')[1]).sort((a, b) => b - a);
    const pieces = [];
    let rem = len;
    if (offset > 0 && offset < len && lens.includes(offset)) { pieces.push(offset); rem -= offset; }
    while (rem > 0) { const l = lens.find(v => v <= rem && v <= 8); pieces.push(l); rem -= l; }
    let p = 0;
    for (const l of pieces) {
      if (dir === 'x') this.add(table['1x' + l], color, x + p, z, h, 0);
      else this.add(table['1x' + l], color, x, z + p, h, 90);
      p += l;
    }
  }
}

export function rect(x0, z0, x1, z1) { const s = new Set(); for (let x = x0; x < x1; x++) for (let z = z0; z < z1; z++) s.add(`${x},${z}`); return s; }
export function minus(a, ...bs) { const s = new Set(a); for (const b of bs) for (const k of b) s.delete(k); return s; }
export function union(...as) { const s = new Set(); for (const a of as) for (const k of a) s.add(k); return s; }
export function ring(x0, z0, x1, z1, w = 1) { return minus(rect(x0, z0, x1, z1), rect(x0 + w, z0 + w, x1 - w, z1 - w)); }

// Fill a height-field region layer by layer: bricks where 3 plates of height remain, plates otherwise,
// tiles on the top layer when requested. cells: Map "x,z" -> {b, t, color, topColor, tile}
// Returns placed parts grouped by layer so callers can turn layers into build steps.
Model.prototype.solid = function (cells, { stepEvery = 0, title = '', onLayer = null, maxBrick = 8, noBricks = false } = {}) {
  let hmin = Infinity, hmax = -Infinity;
  for (const c of cells.values()) { hmin = Math.min(hmin, c.b); hmax = Math.max(hmax, c.t); }
  const filled = new Map(); // "x,z" -> height filled up to
  for (const [k, c] of cells) filled.set(k, c.b);
  const layers = [];
  let alt = false;
  for (let h = hmin; h < hmax; h++) {
    const need = [...cells].filter(([k, c]) => filled.get(k) === h && h < c.t);
    if (!need.length) continue;
    if (onLayer) onLayer(h);
    const byGroup = new Map();
    for (const [k, c] of need) {
      const isTop = h === c.t - 1;
      const kind = isTop && c.tile ? 'tile' : (!noBricks && !c.noBrick && c.t - h >= 3 && !(c.tile && c.t - h === 3) ? 'brick' : 'plate');
      const col = isTop && c.topColor !== undefined ? c.topColor : c.color;
      const g = kind + '|' + col;
      if (!byGroup.has(g)) byGroup.set(g, new Set());
      byGroup.get(g).add(k);
    }
    const placed = [];
    for (const [g, set] of byGroup) {
      const [kind, col] = g.split('|');
      const table = kind === 'brick' ? BRICK : kind === 'tile' ? TILE : PLATE;
      const opts = { alt, maxLen: kind === 'brick' ? maxBrick : 99 };
      const parts = this.fill(set, h, table, +col, opts);
      for (const p of parts) {
        const hp = kind === 'brick' ? 3 : 1;
        // mark cells covered by this part
        for (const k of p.cells) filled.set(k, h + hp);
      }
      placed.push(...parts);
    }
    layers.push({ h, parts: placed });
    alt = !alt;
  }
  return layers;
};

// record covered cells on parts placed by fill()
const _fill = Model.prototype.fill;
Model.prototype.fill = function (mask, h, table, color, opts) {
  const before = this.parts.length;
  const out = _fill.call(this, mask, h, table, color, opts);
  for (const p of out) {
    const info = partInfo(p.part);
    const R = p.R;
    const b = rotatedBox(info, R);
    const x0 = Math.round((p.pos[0] + b.mn[0]) / 20), x1 = Math.round((p.pos[0] + b.mx[0]) / 20);
    const z0 = Math.round((p.pos[2] + b.mn[2]) / 20), z1 = Math.round((p.pos[2] + b.mx[2]) / 20);
    p.cells = [];
    for (let x = x0; x < x1; x++) for (let z = z0; z < z1; z++) p.cells.push(`${x},${z}`);
  }
  return out;
};
