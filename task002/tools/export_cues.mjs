// Writes tools/cues.json: every narration sentence of the film, in playback order.
// Usage (from task002/): node tools/export_cues.mjs   (needs the playwright package)
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

// Use a local playwright if installed, otherwise the global one.
const pw = await import("playwright").catch(() =>
  import(resolve(execSync("npm root -g").toString().trim(), "playwright", "index.mjs")));
const { chromium } = pw;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + resolve("index.html"));
const cues = await page.evaluate(() => window.nibbanaCues());
writeFileSync("tools/cues.json", JSON.stringify(cues, null, 1));
console.log(`${cues.length} cues -> tools/cues.json`);
await browser.close();
