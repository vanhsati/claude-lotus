// Usage: node render.mjs job.json
// job = { mpd: "/abs/path.mpd", setup: {...}, shots: [{ file, ...renderOpts }] }
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const here = path.dirname(new URL(import.meta.url).pathname);
const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const LDRAW = path.resolve(here, '../ldraw');

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--disable-background-networking', '--disable-component-update', '--no-first-run'],
});
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
page.on('pageerror', e => console.error('pageerror:', e.message));
await page.route('http://local/**', async route => {
  const u = new URL(route.request().url());
  let p = decodeURIComponent(u.pathname);
  let f;
  if (p.startsWith('/ldraw/')) f = path.join(LDRAW, p.slice(7));
  else if (p.startsWith('/abs/')) f = p.slice(4);
  else f = path.join(here, p);
  if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nf' });
  const ct = f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'text/plain';
  route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
});
await page.goto('http://local/page.html');
await page.waitForFunction(() => window.ready === true);
const t0 = Date.now();
const info = await page.evaluate(o => window.setup(o), { ...(job.setup || {}), mpd: 'http://local/abs' + job.mpd });
console.error('loaded', JSON.stringify(info), (Date.now() - t0) + 'ms');
if (job.boxes) fs.writeFileSync(job.boxes, JSON.stringify(await page.evaluate(() => window.partBoxes())));
for (const s of job.shots || []) {
  const t = Date.now();
  const url = await page.evaluate(o => window.render(o), s);
  fs.mkdirSync(path.dirname(s.file), { recursive: true });
  fs.writeFileSync(s.file, Buffer.from(url.split(',')[1], 'base64'));
  if (!job.verbose && (job.shots.indexOf(s) % 20 === 0)) console.error('shot', job.shots.indexOf(s), (Date.now() - t) + 'ms');
  if (job.verbose) console.error('shot', s.file, (Date.now() - t) + 'ms');
}
await browser.close();
