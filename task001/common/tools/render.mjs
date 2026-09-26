// render.mjs: paints frames in headless Chromium and encodes the MP4 with ffmpeg.
//
// Every command takes --job=<folder> (a sibling of common/, e.g. job001). Output goes to <job>/out.
//   node tools/render.mjs --job=job001 --frames=0:156.65 --workers=4     # every frame into out/frames (resumable)
//   node tools/render.mjs --job=job001 --encode --out=out/video.mp4      # join frames + song
//   node tools/render.mjs --stills=1.5,4.2,23 --scale=.5            # quick stills into out/stills
//   node tools/render.mjs --test=charsheet --scale=1                # a TESTS[name] page into out/stills
//   node tools/render.mjs --preview=0:40 --scale=.5 --fps=15        # a quick low-res video with audio
//
// Chromium comes from /opt/pw-browsers (or --chrome=path). ffmpeg must be on PATH.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TASK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');   // serves common/ and every job
const argv0 = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
if (!argv0.job) { console.error('pass --job=<folder>, e.g. --job=job001'); process.exit(1); }
const ROOT = path.join(TASK, argv0.job);
const JOBJSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'job.json'), 'utf8'));   // {audio, dur}
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const FPS = +(args.fps || 30), SCALE = +(args.scale || 1), WORKERS = +(args.workers || 4);
const OUT = path.join(ROOT, 'out'), AUDIO = path.join(ROOT, JOBJSON.audio), DUR = JOBJSON.dur;
const CHROME = args.chrome || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(TASK, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(TASK) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(browser, port, extra = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.setViewport({ width: Math.round(1920 * SCALE), height: Math.round(1080 * SCALE) });
  await page.goto(`http://127.0.0.1:${port}/${argv0.job}/studio.html?scale=${SCALE}${extra}`, { waitUntil: 'load' });
  await page.evaluate(() => window.ready);
  return page;
}
async function grab(page, t, file, q = .93) {
  const data = await page.evaluate((t, q) => window.grab(t, q), t, q);
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}
const launch = () => puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--disable-web-security', '--autoplay-policy=no-user-gesture-required'] });

async function main() {
  if (args.encode) return encode();
  const srv = await serve(), port = srv.address().port, browser = await launch();
  try {
    if (args.stills || args.test) {
      const dir = path.join(OUT, args.dir || 'stills'); fs.mkdirSync(dir, { recursive: true });
      const extra = args.test ? `&test=${args.test}` : '';
      const page = await openPage(browser, port, extra);
      const ts = args.stills ? String(args.stills).split(',').map(Number) : [+(args.t || 0)];
      for (const t of ts) {
        const f = path.join(dir, (args.test ? args.test + '_' : 't_') + t.toFixed(2).padStart(7, '0') + '.jpg');
        await grab(page, t, f, .92); console.log(f);
      }
      return;
    }
    if (args.frames || args.preview) {
      const [a, b] = String(args.frames || args.preview).split(':').map(Number);
      const dir = args.preview ? path.join(OUT, `prev_${SCALE}_${FPS}`) : path.join(OUT, 'frames');
      fs.mkdirSync(dir, { recursive: true });
      const f0 = Math.round(a * FPS), f1 = Math.min(Math.round(b * FPS), Math.floor(DUR * FPS));
      const todo = []; for (let f = f0; f < f1; f++) { const file = path.join(dir, String(f).padStart(5, '0') + '.jpg'); if (args.force || !fs.existsSync(file)) todo.push([f, file]); }
      console.log(`${todo.length} frames to paint with ${WORKERS} workers`);
      const t0 = Date.now(); let done = 0;
      // Each worker paints a contiguous block of frames (so scene caches stay local), and reopens its page every
      // --recycle frames (default 400) so caches from earlier scenes are released instead of piling up in memory.
      const RECYCLE = +(args.recycle || 400), per = Math.ceil(todo.length / WORKERS);
      await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
        const mine = todo.slice(w * per, (w + 1) * per);
        let page = await openPage(browser, port), n = 0;
        for (const [f, file] of mine) {
          if (n > 0 && n % RECYCLE === 0) { await page.close(); page = await openPage(browser, port); }
          await grab(page, f / FPS, file + '.tmp', args.preview ? .85 : .95); fs.renameSync(file + '.tmp', file); n++;
          if (++done % 100 === 0) console.log(`${done}/${todo.length}  ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} fps`);
        }
        await page.close();
      }));
      console.log(`painted in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      if (args.preview) {
        const out = path.join(OUT, `preview_${a}_${b}.mp4`);
        run(['-y', '-framerate', FPS, '-start_number', f0, '-i', path.join(dir, '%05d.jpg'), '-ss', a / 1, '-t', (b - a), '-i', AUDIO,
          '-frames:v', f1 - f0, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', 24, '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', out]);
        console.log(out);
      }
    }
  } finally { await browser.close(); srv.close(); }
}
function run(a) { const r = spawnSync('ffmpeg', a.map(String), { stdio: ['ignore', 'inherit', 'inherit'] }); if (r.status) throw new Error('ffmpeg failed'); }
function encode() {
  const dir = path.join(OUT, 'frames'), out = path.resolve(ROOT, args.out || path.join(OUT, 'video.mp4'));   // --out is relative to the job folder
  run(['-y', '-hide_banner', '-loglevel', 'warning', '-stats', '-framerate', FPS, '-i', path.join(dir, '%05d.jpg'), '-i', AUDIO,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', args.crf || 17, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', out]);
  console.log(out);
}
main().catch(e => { console.error(e); process.exit(1); });
