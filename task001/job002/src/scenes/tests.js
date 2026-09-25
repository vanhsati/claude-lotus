// tests.js: development pages (not part of the video).
//   node tools/render.mjs --job=job002 --test=style --scale=1 --dir=style      (material / cast style sheet)
//   node tools/render.mjs --job=job002 --test=perf --scale=1 --dir=style       (paints the sheet 4× and logs ms)
window.TESTS = window.TESTS || {};

function TS_label(str, x, y, col = 'rgba(246,227,161,.8)') {
  X.save(); X.font = FONT.mono(15); X.fillStyle = col; X.textBaseline = 'top'; X.fillText(str, x, y); X.restore();
}
// A lacquer panel frame: dark bevelled board edge around a swatch.
function TS_panel(x, y, w, h) {
  lqLacquer(() => X.rect(x - 8, y - 8, w + 16, h + 16), LQ_PAL.black2, { lift: 10, rim: 2, bounds: [x - 8, y - 8, w + 16, h + 16], glint: .35 });
}

TESTS.style = t => {
  T = t;
  lqGround(t, { camX: 0 });
  const G = .42;   // glint position for the sheet
  // ---- title ----
  X.save(); X.font = FONT.vnSansM(20); X.fillStyle = 'rgba(246,227,161,.85)'; X.fillText('COME MY WAY · SƠN MÀI CUT · MATERIAL SHEET', 44, 44); X.restore();

  // ---- row A: swatches ----
  const sw = [
    ['GOLD LEAF', (x, y, w, h) => lqGold(() => X.rect(x, y, w, h), { glint: G, bounds: [x, y, w, h], lift: 0 })],
    ['SILVER LEAF', (x, y, w, h) => lqSilver(() => X.rect(x, y, w, h), { glint: .55, bounds: [x, y, w, h], lift: 0 })],
    ['EGGSHELL INLAY', (x, y, w, h) => lqEggshell(() => X.rect(x, y, w, h), { glint: .5, bounds: [x, y, w, h] })],
    ['CINNABAR LACQUER', (x, y, w, h) => lqLacquer(() => X.rect(x, y, w, h), LQ_PAL.cinnabar, { glint: .45, bounds: [x, y, w, h] })],
    ['BROWN LACQUER', (x, y, w, h) => lqLacquer(() => X.rect(x, y, w, h), LQ_PAL.brown, { glint: .5, bounds: [x, y, w, h] })],
  ];
  sw.forEach(([name, fn], i) => {
    const x = 44 + i * 232, y = 84, w = 208, h = 196;
    TS_panel(x, y, w, h); fn(x, y, w, h); TS_label(name, x, y + h + 14);
  });
  // raised motifs on lacquer: a gold spark, a silver disc, an eggshell lotus leaf on cinnabar
  {
    const x = 44 + 5 * 232, y = 84, w = 208, h = 196;
    TS_panel(x, y, w, h);
    lqLacquer(() => X.rect(x, y, w, h), LQ_PAL.cinnabarDk, { glint: .4, bounds: [x, y, w, h] });
    lqEggshell(() => { X.ellipse(x + 70, y + 130, 52, 40, -.4, 0, TAU); }, { lift: 3, glint: .5, scale: .35 });
    lqSilver(() => X.arc(x + 150, y + 62, 36, 0, TAU), { lift: 4, glint: .6, scale: .3 });
    lqGold(() => sparkPath(x + 150, y + 142, 44, 6, .26, .2, .62), { lift: 5, glint: .45, scale: .3 });
    TS_label('RAISED MOTIFS', x, y + h + 14);
  }

  // ---- row B: sanding reveals ----
  [.3, .6, .9].forEach((k, i) => {
    const x = 44 + i * 390, y = 360, w = 360, h = 220, reg = [x, y, w, h];
    TS_panel(x, y, w, h);
    X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip();
    lqReveal(
      () => { lqGold(() => X.rect(x, y, w, h), { glint: .4 + i * .05, bounds: reg, lift: 0 }); lqInlayText('ơi', x + w / 2, y + h * .78, { font: FONT.vnI(150), align: 'center', material: 'egg', glint: .5 }); },
      () => lqLacquer(() => X.rect(x, y, w, h), LQ_PAL.cinnabar, { glint: .5, bounds: reg }),
      k, 3 + i, { region: reg, angle: -.35 });
    X.restore();
    TS_label(`SANDING REVEAL k = ${k}`, x, y + h + 14);
  });

  // ---- row C: inlaid type ----
  lqInlayText('SƠN MÀI', 40, 820, { font: FONT.vn(200), material: 'gold', glint: .35, tracking: 6 });
  lqInlayText('Anh đang đến đây, em ơi', 44, 930, { font: FONT.vnI(80), material: 'gold', glint: .6 });
  lqInlayText('COME MY WAY', 44, 1030, { font: FONT.vnSans(78), material: 'silver', glint: .5, tracking: 4 });
  lqInlayText('em', 900, 1030, { font: FONT.vn(120), material: 'egg', glint: .5 });
  TS_label('INLAY · Playfair Display 900 / 700i · Be Vietnam Pro 900 · eggshell', 44, 1044);

  // ---- right: the cast ----
  // head close-up in nón lá
  idolHead(1390, 340, 96, { hat: 'nonla', eyes: 'open', mouth: .25, look: [.1, 0], tilt: -.06, hatTilt: .05, blush: .7, bust: false });
  TS_label('IDOL · NÓN LÁ', 1300, 560);
  // full body in áo dài
  idolBody(1760, 560, 26, { lSh: .5, lEl: .6, rSh: -1.9, rEl: -.4, hR: 'open', lHip: .12, rHip: -.18, rKn: .15, lean: -.04, skirt: .4 }, { outfit: 'aodai', face: { hat: 'nonla', mouth: .4, eyes: 'happy' } });
  TS_label('IDOL · ÁO DÀI', 1700, 820);
  // silver Clawd and the time machine
  lqClawd(1290, 1030, 190, { arms: [1, 0], glint: .45 });
  TS_label('THE VISITOR · SILVER CLAWD', 1190, 1044);
  lqTimeMachine(1655, 1005, 520, t, { doors: .75, spin: 12, trail: .8, glint: .5 });
  TS_label('TIME MACHINE', 1700, 1044);
};

TESTS.perf = t => {
  const ms = [];
  for (let i = 0; i < 4; i++) { const a = performance.now(); X.setTransform(SX, 0, 0, SX, 0, 0); TESTS.style(t + i * .1); ms.push(Math.round(performance.now() - a)); }
  const a = performance.now(); for (let i = 0; i < 4; i++) { X.setTransform(SX, 0, 0, SX, 0, 0); lqGround(t + i); } const g = (performance.now() - a) / 4;
  console.warn('style sheet ms per paint:', ms.join(', '), '· lqGround ms:', g.toFixed(1));
};
