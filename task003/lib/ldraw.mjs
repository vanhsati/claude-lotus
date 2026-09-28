// Minimal LDraw reader: flattens a part into world-space geometry and connection points.
// Used for footprint alignment, collision checks and stud connectivity of the generated model.
import fs from 'node:fs';
import path from 'node:path';

export const LDRAW_DIR = new URL('../ldraw/', import.meta.url).pathname;
const SEARCH = ['parts/', 'p/', 'parts/s/', 'p/48/', 'p/8/'];
const TOP_STUD = /^(stud|stud2|stud2a|stud6|stud6a|stud10|stud13|stud15|stud17a|stud18a)\.dat$/;
const BOTTOM = /^(stud3|stud3a|stud4|stud4a|stud4h|stud4o|stud4s|stud4f\d.*|stud12|stud16)\.dat$/;

const fileCache = new Map();
function readFile(name) {
  name = name.toLowerCase().replace(/\\/g, '/');
  if (fileCache.has(name)) return fileCache.get(name);
  for (const d of SEARCH) {
    const p = path.join(LDRAW_DIR, d, name);
    if (fs.existsSync(p)) { const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/); fileCache.set(name, lines); return lines; }
  }
  throw new Error('LDraw file not found: ' + name);
}

// 3x4 affine matrix as [a b c d e f g h i x y z] mapping v -> (a*vx+b*vy+c*vz+x, ...)
export const I = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
export function mul(A, B) { // A*B
  const r = new Array(12);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  for (let i = 0; i < 3; i++) r[9 + i] = A[i * 3] * B[9] + A[i * 3 + 1] * B[10] + A[i * 3 + 2] * B[11] + A[9 + i];
  return r;
}
export function apply(M, v) {
  return [M[0] * v[0] + M[1] * v[1] + M[2] * v[2] + M[9], M[3] * v[0] + M[4] * v[1] + M[5] * v[2] + M[10], M[6] * v[0] + M[7] * v[1] + M[8] * v[2] + M[11]];
}
function dir(M, v) { return [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]]; }

const infoCache = new Map();
// Returns { min, max (bbox without top studs), studs: [[x,y,z,dir]], tubes: [[x,y,z]], desc }
export function partInfo(part) {
  part = part.toLowerCase(); if (!part.endsWith('.dat')) part += '.dat';
  if (infoCache.has(part)) return infoCache.get(part);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const studs = [], tubes = [];
  let desc = '';
  function walk(name, M, depth) {
    const lines = readFile(name);
    for (const line of lines) {
      const t = line.trim().split(/\s+/);
      if (depth === 0 && !desc && t[0] === '0' && t.length > 1) desc = t.slice(1).join(' ');
      if (t[0] === '1' && t.length >= 15) {
        const n = t.slice(14).join(' ').toLowerCase().replace(/\\/g, '/');
        const base = n.split('/').pop();
        const L = [+t[5], +t[6], +t[7], +t[8], +t[9], +t[10], +t[11], +t[12], +t[13], +t[2], +t[3], +t[4]];
        const W = mul(M, L);
        if (TOP_STUD.test(base)) { const p = apply(W, [0, 0, 0]); const d = dir(W, [0, -1, 0]); studs.push([...p.map(r2), d.map(Math.round).join(',')]); continue; }
        if (BOTTOM.test(base)) { tubes.push(apply(W, [0, 0, 0]).map(r2)); }
        walk(n, W, depth + 1);
      } else if (t[0] === '3' || t[0] === '4') {
        const k = t[0] === '3' ? 3 : 4;
        for (let i = 0; i < k; i++) {
          const p = apply(M, [+t[2 + i * 3], +t[3 + i * 3], +t[4 + i * 3]]);
          for (let a = 0; a < 3; a++) { if (p[a] < min[a]) min[a] = p[a]; if (p[a] > max[a]) max[a] = p[a]; }
        }
      }
    }
  }
  walk(part, I, 0);
  const info = { part, desc, min: min.map(r2), max: max.map(r2), studs, tubes };
  infoCache.set(part, info);
  return info;
}
const r2 = v => Math.round(v * 100) / 100;

export function ldconfigColors() {
  const txt = fs.readFileSync(path.join(LDRAW_DIR, 'LDConfig.ldr'), 'utf8');
  const out = {};
  for (const m of txt.matchAll(/!COLOUR\s+(\S+)\s+CODE\s+(\d+)\s+VALUE\s+(#\w+)\s+EDGE\s+(#\w+)(.*)/g))
    out[+m[2]] = { name: m[1], hex: m[3], edge: m[4], rest: m[5].trim() };
  return out;
}
