// Fetch LDraw parts (and every sub-file they reference) from the gkjohnson/ldraw-parts-library mirror.
// Usage: node tools/fetch_ldraw.mjs 3001 3941 ...   (part numbers, .dat optional)
import fs from 'node:fs';
import path from 'node:path';
const ROOT = new URL('../ldraw/', import.meta.url).pathname;
const BASE = 'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/complete/ldraw/';
const SEARCH = ['parts/', 'p/', 'parts/s/', 'p/48/', 'p/8/', 'models/'];

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url); if (r.status === 404) return null; if (r.ok) return await r.text(); } catch {}
    await new Promise(r => setTimeout(r, 500 * 2 ** i));
  }
  throw new Error('failed ' + url);
}
const done = new Map(); // name -> local rel path | null
async function resolve(name) {
  name = name.toLowerCase().replace(/\\/g, '/');
  if (done.has(name)) return done.get(name);
  done.set(name, null);
  for (const dir of SEARCH) {
    const local = path.join(ROOT, dir, name);
    let txt = fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : null;
    if (txt === null) { txt = await get(BASE + dir + name); if (txt === null) continue;
      fs.mkdirSync(path.dirname(local), { recursive: true }); fs.writeFileSync(local, txt); }
    done.set(name, dir + name);
    const subs = [];
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim().split(/\s+/);
      if (t[0] === '1' && t.length >= 15) subs.push(t.slice(14).join(' '));
    }
    await Promise.all(subs.map(resolve));
    return dir + name;
  }
  console.error('MISSING', name);
  return null;
}
if (!fs.existsSync(ROOT + 'LDConfig.ldr')) fs.writeFileSync(ROOT + 'LDConfig.ldr', await get(BASE + 'LDConfig.ldr'));
const want = process.argv.slice(2).map(p => p.endsWith('.dat') ? p : p + '.dat');
await Promise.all(want.map(resolve));
console.log('files:', [...done.values()].filter(Boolean).length);
