// Builds task003/index.html: a gallery of every model in task003 with links to its viewer, manual and parts.
//   node tools/gallery.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname;
const REPO = 'https://github.com/vanhsati/claude-lotus/blob/claude/one-pillar-pagoda-lego-7u8m75/task003/';

const projects = [
  { dir: 'pagoda', name: 'Chùa Một Cột', en: 'One-Pillar Pagoda, Hà Nội', mpd: 'one-pillar-pagoda.mpd',
    blurb: 'Ngôi chùa trên một cột đá giữa hồ Linh Chiểu, dựng từ năm 1049. Có hồ sen, lan can men xanh, 13 bậc thang, cây bồ đề và mái cong với lưỡng long chầu nguyệt.',
    moves: ['Quay tay quay: tượng Quan Âm xoay nhờ bánh vít giấu dưới hồ', 'Cửa mở vào trong', 'Nhấc mái ra để nhìn vào điện'],
    size: '32 × 40 stud · cao khoảng 35 cm' },
  { dir: 'cat', name: 'Mèo Anh lông ngắn', en: 'British Shorthair Cat', mpd: 'british-shorthair-cat.mpd',
    blurb: 'Tượng mèo cỡ thật dựng theo ảnh: lông xám xanh có vằn tabby, mắt hổ phách, mũi hồng, vòng cổ cam đào có khóa đỏ, ngồi trên sàn gỗ.',
    moves: ['Đầu xoay trái phải trên bàn xoay giấu trong cổ'],
    size: '24 × 24 stud · cao khoảng 23 cm' },
];

const cards = projects.map(p => {
  const dir = ROOT + p.dir + '/';
  const model = JSON.parse(fs.readFileSync(dir + 'build/model.json', 'utf8'));
  const cfg = fs.readFileSync(dir + 'project.mjs', 'utf8');
  const pdf = cfg.match(/pdfName: '([^']+)'/)[1];
  const lots = fs.readFileSync(dir + 'parts/parts-list.csv', 'utf8').trim().split('\n').length - 1;
  return `
  <article class="card">
    <a class="shot" href="${p.dir}/"><img src="${p.dir}/renders/hero-front.png" alt="Ảnh render mô hình ${p.name}" loading="lazy"></a>
    <div class="body">
      <p class="en">${p.en}</p>
      <h2>${p.name}</h2>
      <p>${p.blurb}</p>
      <dl class="facts">
        <div><dt>Chi tiết</dt><dd>${model.parts.length.toLocaleString('vi-VN')}</dd></div>
        <div><dt>Loại</dt><dd>${lots}</dd></div>
        <div><dt>Bước lắp</dt><dd>${model.steps.length}</dd></div>
      </dl>
      <p class="size">${p.size}</p>
      <ul class="moves">${p.moves.map(m => `<li>${m}</li>`).join('')}</ul>
      <nav class="links">
        <a class="primary" href="${p.dir}/">Xem 3D</a>
        <a href="${p.dir}/instructions/${pdf}">Sách hướng dẫn (PDF)</a>
        <a href="${REPO}${p.dir}/parts/parts-list.md">Danh sách linh kiện</a>
        <a href="${p.dir}/parts/bricklink-wanted-list.xml">BrickLink XML</a>
        <a href="${p.dir}/${p.mpd}">File LDraw (Studio)</a>
        <a href="${REPO}${p.dir}/renders">Ảnh render</a>
      </nav>
    </div>
  </article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Xưởng LEGO task003</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;800&display=swap">
<style>
  :root {
    color-scheme: light;
    --bg: #eceee9; --card: #fbfbf8; --ink: #1d231f; --muted: #5b655e; --line: #d4d9d2;
    --accent: #b3261e; --accent-ink: #ffffff; --stud: #dfe2dc;
    --font: 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
    color-scheme: dark; --bg: #151916; --card: #1f2520; --ink: #e8ece6; --muted: #9ea99f; --line: #313a33; --accent: #e5594e; --accent-ink: #1a0d0c; --stud: #1c211d; } }
  :root[data-theme="dark"] { color-scheme: dark; --bg: #151916; --card: #1f2520; --ink: #e8ece6; --muted: #9ea99f; --line: #313a33; --accent: #e5594e; --accent-ink: #1a0d0c; --stud: #1c211d; }
  html { background: var(--bg); }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--font);
    background-image: radial-gradient(circle at 12px 12px, var(--stud) 5px, transparent 5.5px); background-size: 24px 24px; }
  .wrap { max-width: 1120px; margin: 0 auto; padding-inline: 16px; padding-block: 40px 64px; }
  header { max-width: 640px; margin-bottom: 32px; }
  .eyebrow { font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); font-weight: 700; margin: 0; }
  h1 { font-size: clamp(32px, 6vw, 52px); line-height: 1.05; margin: 8px 0 12px; font-weight: 800; text-wrap: balance; }
  header p { color: var(--muted); margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr)); gap: 24px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
  .shot { display: block; position: relative; background: #e9e2d6; aspect-ratio: 4 / 3; overflow: hidden; }
  .shot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  .body { padding: 20px 22px 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .body p { margin: 0; }
  .en { font-size: 13px; color: var(--muted); letter-spacing: .04em; }
  h2 { margin: -6px 0 0; font-size: 26px; font-weight: 800; }
  .facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 4px 0 0; }
  .facts div { border-top: 3px solid var(--accent); padding-top: 6px; }
  .facts dt { font-size: 12px; color: var(--muted); }
  .facts dd { margin: 0; font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .size { font-size: 14px; color: var(--muted); }
  .moves { margin: 0; padding-left: 20px; font-size: 15px; }
  .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 8px; }
  .links a { font-size: 14px; color: var(--ink); text-decoration: none; border: 1px solid var(--line); border-radius: 8px; padding: 7px 12px; }
  .links a:hover { border-color: var(--accent); }
  .links a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .links a.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 700; }
  footer { margin-top: 40px; font-size: 13px; color: var(--muted); max-width: 720px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">task003 · Xưởng LEGO</p>
    <h1>Mô hình LEGO tự thiết kế</h1>
    <p>Mỗi mô hình có bản xem 3D tương tác, sách hướng dẫn lắp từng bước, danh sách linh kiện để đặt mua trên BrickLink, và file LDraw mở được bằng BrickLink Studio.</p>
  </header>
  <main class="grid">${cards}
  </main>
  <footer>Hình khối lấy từ thư viện chi tiết <a href="https://www.ldraw.org">LDraw</a> (CC BY 2.0), dựng hình bằng three.js. LEGO® là thương hiệu của LEGO Group; các mô hình này không được LEGO Group tài trợ hay xác nhận.</footer>
</div>
</body>
</html>
`;
fs.writeFileSync(ROOT + 'index.html', html);
console.log('gallery: ' + projects.map(p => p.dir).join(', '));
