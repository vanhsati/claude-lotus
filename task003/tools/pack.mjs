// Packs every LDraw file needed by build/model.json into one text file (0 FILE blocks) for the browser.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PDIR } from '../lib/project.mjs';
const LD = path.join(ROOT, 'ldraw');
const DIRS = [['parts/', ''], ['parts/s/', 's/'], ['p/', ''], ['p/48/', '48/'], ['p/8/', '8/']];
const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const seen = new Map();
function find(ref) {
  ref = ref.toLowerCase().replace(/\\/g, '/');
  for (const [d, prefix] of DIRS) {
    if (prefix && !ref.startsWith(prefix)) continue;
    const rel = prefix ? ref.slice(prefix.length) : ref;
    const p = path.join(LD, d, rel);
    if (fs.existsSync(p)) return p;
  }
  // parts may reference s/ files without prefix handling above
  for (const [d] of DIRS) { const p = path.join(LD, d, ref); if (fs.existsSync(p)) return p; }
  throw new Error('missing ' + ref);
}
function add(ref) {
  ref = ref.toLowerCase().replace(/\\/g, '/');
  if (seen.has(ref)) return;
  const txt = fs.readFileSync(find(ref), 'utf8');
  seen.set(ref, txt);
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim().split(/\s+/);
    if (t[0] === '1' && t.length >= 15) add(t.slice(14).join(' '));
  }
}
for (const p of new Set(model.parts.map(p => p.part))) add(p + '.dat');
let out = '';
// key names as LDrawLoader resolves them: s/ -> parts/s/, 48/ -> p/48/
const key = n => n.startsWith('s/') ? 'parts/' + n : n.startsWith('48/') ? 'p/' + n : n;
for (const [name, txt] of seen) out += `0 FILE ${key(name)}\n${txt.trim()}\n0 NOFILE\n`;
fs.mkdirSync(PDIR + 'build', { recursive: true });
fs.writeFileSync(PDIR + 'build/library.ldr', out);
fs.copyFileSync(path.join(LD, 'LDConfig.ldr'), PDIR + 'build/LDConfig.ldr');
console.log(`packed ${seen.size} files, ${(out.length / 1e6).toFixed(2)} MB`);
