// Bill of materials: CSV, BrickLink wanted-list XML, Rebrickable CSV and a Markdown summary.
import fs from 'node:fs';
import { partInfo } from '../lib/ldraw.mjs';
import { COLORS, BL_ID, NAMES, VERIFY } from '../lib/catalog.mjs';
import { ROOT, PDIR, PROJECT, config } from '../lib/project.mjs';
const model = JSON.parse(fs.readFileSync(PDIR + 'build/model.json', 'utf8'));
const lots = new Map();
for (const p of model.parts) {
  const k = p.part + '|' + p.color;
  if (!lots.has(k)) lots.set(k, { part: p.part, color: p.color, qty: 0, bags: new Set() });
  const l = lots.get(k); l.qty++; l.bags.add(model.steps[p.step].bag);
}
const rows = [...lots.values()].map(l => {
  const c = COLORS[l.color]; if (!c) throw new Error('no colour mapping for ' + l.color);
  const bl = BL_ID[l.part] || l.part;
  const desc = NAMES[l.part] || partInfo(l.part).desc.replace(/^~/, '');
  return { ...l, bl, desc, blColor: c[0], blColorName: c[1], legoColor: c[2], hex: c[3], note: VERIFY[l.part + '|' + l.color] || '', bags: [...l.bags].sort((a, b) => a - b) };
}).sort((a, b) => a.blColorName.localeCompare(b.blColorName) || a.desc.localeCompare(b.desc));
fs.mkdirSync(PDIR + 'parts', { recursive: true });
const q = s => `"${String(s).replace(/"/g, '""')}"`;
fs.writeFileSync(PDIR + 'parts/parts-list.csv', ['BrickLink Part,Description,LDraw File,BrickLink Color ID,BrickLink Color,LEGO Color,Quantity,Bags,Note',
  ...rows.map(r => [r.bl, q(r.desc), r.part + '.dat', r.blColor, r.blColorName, r.legoColor, r.qty, q(r.bags.join(' ')), q(r.note)].join(','))].join('\n') + '\n');
fs.writeFileSync(PDIR + 'parts/bricklink-wanted-list.xml', '<INVENTORY>\n' + rows.map(r =>
  `  <ITEM><ITEMTYPE>P</ITEMTYPE><ITEMID>${r.bl}</ITEMID><COLOR>${r.blColor}</COLOR><MINQTY>${r.qty}</MINQTY><CONDITION>X</CONDITION></ITEM>`).join('\n') + '\n</INVENTORY>\n');
fs.writeFileSync(PDIR + 'parts/rebrickable-parts.csv', ['Part,Color,Quantity', ...rows.map(r => `${r.bl},${r.color},${r.qty}`)].join('\n') + '\n');
const total = rows.reduce((a, r) => a + r.qty, 0);
const md = [`# Parts list — One-Pillar Pagoda`, '', `${total} pieces in ${rows.length} lots (${new Set(rows.map(r => r.part)).size} different moulds).`, '',
  '| Qty | Part | Description | Colour (BrickLink / LEGO) | Bags | Note |', '|---:|---|---|---|---|---|',
  ...rows.map(r => `| ${r.qty} | [${r.bl}](https://www.bricklink.com/v2/catalog/catalogitem.page?P=${r.bl}&idColor=${r.blColor}) | ${r.desc} | ${r.blColorName} / ${r.legoColor} | ${r.bags.join(', ')} | ${r.note} |`)];
fs.writeFileSync(PDIR + 'parts/parts-list.md', md.join('\n') + '\n');
fs.writeFileSync(PDIR + 'build/bom.json', JSON.stringify(rows.map(r => ({ ...r, bags: r.bags }))));
console.log(`BOM: ${total} pieces, ${rows.length} lots`);
