// Quick preview renders: node tools/snap.mjs out.png '{"dir":[1,0.8,1.3]}' ...
import { openRenderer } from './browser.mjs';
const r = await openRenderer();
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) await r.save(args[i], JSON.parse(args[i + 1] || '{}'));
await r.close();
