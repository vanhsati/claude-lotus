import { chromium } from 'playwright-core';
const [,, src, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
await p.goto('file://' + src, { waitUntil: 'load', timeout: 600000 });
await p.pdf({ path: out, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true, timeout: 600000 });
await b.close();
