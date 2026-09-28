// Paints frames of src/index.html in headless Chromium and encodes the MP4.
//   node tools/render.mjs --stills=1,8,30 [--scale=.5]      -> out/stills/t_*.jpg
//   node tools/render.mjs --frames [--workers=3] [--fps=30]  -> frames/NNNNN.jpg
//   node tools/render.mjs --encode                           -> video/resinepic.mp4 (with audio/music.wav)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { chromium } from 'playwright-core';
const ROOT = new URL('../', import.meta.url).pathname;
const arg = (k, d) => { const a = process.argv.find(x => x === `--${k}` || x.startsWith(`--${k}=`)); if (!a) return d; const v = a.split('=')[1]; return v === undefined ? true : v; };
const FPS = +arg('fps', 30), SCALE = +arg('scale', 1), DUR = 45;
const FFMPEG = spawnSync('python3', ['-c', 'import imageio_ffmpeg as i;print(i.get_ffmpeg_exe())']).stdout.toString().trim();

async function page() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    const ext = path.extname(p);
    res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' }[ext] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const exe = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await browser.newPage();
  pg.on('pageerror', e => console.error('[pageerror]', e.message));
  pg.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await pg.goto(`http://127.0.0.1:${server.address().port}/src/index.html?s=${SCALE}`);
  await pg.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  const grab = async (t, file) => {
    const url = await pg.evaluate(async t => { await window.frame(t); return document.getElementById('out').toDataURL('image/jpeg', 0.93); }, t);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  };
  return { grab, close: async () => { await browser.close(); server.close(); } };
}

if (arg('stills')) {
  const dir = ROOT + 'out/stills/'; fs.mkdirSync(dir, { recursive: true });
  const p = await page();
  for (const t of String(arg('stills')).split(',').map(Number)) { const t0 = Date.now(); await p.grab(t, `${dir}t_${t.toFixed(2)}.jpg`); console.log(t, Date.now() - t0, 'ms'); }
  await p.close();
} else if (arg('frames') && !arg('worker')) {
  const n = Math.round(DUR * FPS), workers = +arg('workers', 3);
  const [from, to] = String(arg('range', `0:${n}`)).split(':').map(Number);
  const per = Math.ceil((to - from) / workers);
  const kids = [];
  for (let w = 0; w < workers; w++) {
    const a = from + w * per, b = Math.min(to, a + per);
    if (a >= b) continue;
    kids.push(new Promise(r => spawn('node', [process.argv[1], '--frames', '--worker', `--range=${a}:${b}`, `--fps=${FPS}`, `--scale=${SCALE}`], { stdio: 'inherit' }).on('exit', r)));
  }
  await Promise.all(kids);
} else if (arg('worker')) {
  const [a, b] = String(arg('range')).split(':').map(Number);
  const dir = ROOT + 'frames/'; fs.mkdirSync(dir, { recursive: true });
  const p = await page(); const t0 = Date.now();
  for (let i = a; i < b; i++) {
    const f = `${dir}${String(i).padStart(5, '0')}.jpg`;
    if (!fs.existsSync(f)) await p.grab(i / FPS, f);
    if ((i - a) % 60 === 0) console.log(`worker ${a}-${b}: frame ${i} (${((Date.now() - t0) / (i - a + 1) / 1000).toFixed(2)} s/frame)`);
  }
  await p.close();
} else if (arg('encode')) {
  fs.mkdirSync(ROOT + 'video', { recursive: true });
  const outFile = ROOT + 'video/' + arg('out', 'resinepic.mp4');
  const audio = ROOT + 'audio/music.wav';
  const a = ['-y', '-framerate', FPS, '-i', ROOT + 'frames/%05d.jpg'];
  if (fs.existsSync(audio)) a.push('-i', audio);
  a.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  if (fs.existsSync(audio)) a.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  a.push(outFile);
  const r = spawnSync(FFMPEG, a.map(String), { stdio: 'inherit' }); if (r.status) process.exit(1);
  console.log('wrote', outFile);
}
