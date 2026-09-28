// Starts a static server over task003/ and a headless Chromium page with WebGL (SwiftShader).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
const ROOT = new URL('../', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.ldr': 'text/plain', '.png': 'image/png', '.css': 'text/css' };
export async function openRenderer(page = 'viewer/render.html', modelUrl = '../build/model.json') {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const exe = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await browser.newPage();
  pg.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  pg.on('pageerror', e => console.error('[pageerror]', e.message));
  await pg.goto(`http://127.0.0.1:${port}/${page}`);
  await pg.waitForFunction(() => window.ready === true);
  const info = await pg.evaluate(u => window.init(u), modelUrl);
  const save = async (file, opts) => {
    const url = await pg.evaluate(o => window.view(o), { format: file.endsWith('.jpg') ? 'jpeg' : 'png', ...opts });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  };
  const close = async () => { await browser.close(); server.close(); };
  return { page: pg, info, save, close, port };
}
