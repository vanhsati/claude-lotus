// tests.js: development pages (not part of the video).
//   node tools/render.mjs --job=job002 --test=style --stills=0,1 --scale=1 --dir=style
//     page 1 (t = 0): materials, sanding, inlaid type, idol, silver Clawd, time machine
//     page 2 (t = 1): masked dancers, karst river + red disc, buffalo in silver rain, gate, wall-of-death drum
//   node tools/render.mjs --job=job002 --test=perf --scale=1 --dir=style       (paints the sheet 4× and logs ms)
window.TESTS = window.TESTS || {};

function TS_label(str, x, y, col = 'rgba(246,227,161,.8)') {
  X.save(); X.font = FONT.mono(15); X.fillStyle = col; X.textBaseline = 'top'; X.fillText(str, x, y); X.restore();
}
// A lacquer panel frame: dark bevelled board edge around a swatch.
function TS_panel(x, y, w, h) {
  lqLacquer(() => X.rect(x - 8, y - 8, w + 16, h + 16), LQ_PAL.black2, { lift: 10, rim: 2, bounds: [x - 8, y - 8, w + 16, h + 16], glint: .35 });
}

function TS_page1(t) {
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
  lqInlayText('em ơi', 770, 1030, { font: FONT.vnI(104), material: 'egg', glint: .5 });
  TS_label('INLAY · Playfair Display 900 / 700i · Be Vietnam Pro 900 · eggshell', 44, 1044);

  // ---- right: the cast ----
  // head close-up in nón lá
  idolHead(1590, 440, 84, { hat: 'nonla', eyes: 'open', mouth: .25, look: [.1, 0], tilt: -.06, hatTilt: .05, blush: .7, bust: false });
  TS_label('IDOL · NÓN LÁ', 1470, 640);
  // full body in áo dài
  idolBody(1815, 600, 26, { lSh: .5, lEl: .6, rSh: -1.9, rEl: -.4, hR: 'open', lHip: .12, rHip: -.18, rKn: .15, lean: -.04, skirt: .4 }, { outfit: 'aodai', face: { hat: 'nonla', mouth: .4, eyes: 'happy' } });
  TS_label('IDOL · ÁO DÀI', 1750, 830);
  // silver Clawd and the time machine
  lqTimeMachine(1675, 1005, 480, t, { doors: 1, spin: 12, trail: .5, glint: .5 });
  lqClawd(1290, 1030, 170, { arms: [1, 0], glint: .45 });
  TS_label('SILVER CLAWD', 1240, 1044);
  TS_label('TIME MACHINE', 1700, 1044);
}

function TS_page2(t) {
  lqGround(t, { camX: 0 });
  X.save(); X.font = FONT.vnSansM(20); X.fillStyle = 'rgba(246,227,161,.85)'; X.fillText('COME MY WAY · SƠN MÀI CUT · SCENERY & CROWD', 44, 44); X.restore();
  // karst river with the red disc stage and masked dancers on it
  {
    const R = [44, 76, 1100, 560]; TS_panel(...R);
    const { horizon } = lqKarstRiver(t, { rect: R, camX: 300, sunX: .7 });
    lqRedDisc(R[0] + 560, horizon + 105, 330, 74, { glint: .45 });
    for (let i = 0; i < 7; i++) { const u = (i - 3) / 3.4; lqMaskDancer(R[0] + 560 + u * 260, horizon + 105 + Math.cos(u * 1.3) * 20 - 6, 118, t, { arms: [(i % 3) * .45, ((i + 1) % 3) * .45], step: i * .3 + t, lean: u * .05, flip: i > 3 }); }
    TS_label('lqKarstRiver · lqRedDisc · lqMaskDancer — Sông đêm', R[0], R[1] + R[3] + 14);
  }
  // buffalo charging through silver rain, a gold sun
  {
    const R = [1180, 76, 700, 560]; TS_panel(...R);
    X.save(); X.beginPath(); X.rect(...R); X.clip();
    lqLacquer(() => X.rect(...R), '#1b1310', { rim: 0, glint: .3, bounds: R });
    lqGold(() => X.arc(R[0] + 540, R[1] + 150, 70, 0, TAU), { glint: .5, scale: .3 });
    lqLacquer(() => { X.moveTo(R[0], R[1] + 470); X.quadraticCurveTo(R[0] + 350, R[1] + 440, R[0] + R[2], R[1] + 480); X.lineTo(R[0] + R[2], R[1] + R[3]); X.lineTo(R[0], R[1] + R[3]); X.closePath(); }, LQ_PAL.brown, { rim: 0, glint: .5, bounds: [R[0], R[1] + 440, R[2], 120] });
    lqRain(t, { rect: R, n: 260, ground: R[1] + 500, angle: .28 });
    lqBuffalo(R[0] + 330, R[1] + 505, 470, t, { gait: 'charge', glint: .45 });
    lqRain(t + 7, { rect: R, n: 70, angle: .28, len: 140, alpha: .8 });
    X.restore();
    TS_label('lqBuffalo (charge) · lqRain', R[0], R[1] + R[3] + 14);
  }
  // wall-of-death drum and a top-down disc
  lqDrum(t, { x: 250, y: 870, r: 170, a: -t * 3 - 1.2, glint: .5 });
  TS_label('lqDrum', 60, 1050);
  lqRedDisc(1255, 780, 80, 80, { topdown: true, glint: .5 });
  TS_label('lqRedDisc topdown', 1180, 876);
  // the gate at night with a masked crowd
  {
    const R = [480, 690, 660, 340]; TS_panel(...R);
    X.save(); X.beginPath(); X.rect(...R); X.clip();
    lqLacquer(() => X.rect(...R), '#0f0c10', { rim: 0, glint: .6, bounds: R });
    lqGate(R[0] + 330, R[1] + 300, 330, { glint: .5, lit: .8 });
    for (let i = 0; i < 16; i++) { const u = i / 15; lqMaskDancer(R[0] + 30 + u * 600, R[1] + 330 + (i % 2) * 8, 78 + (i % 2) * 8, t, { arms: .5 + .5 * Math.sin(i * .9 + t * 3), step: i * .5 + t * 2, lean: Math.sin(i + t) * .06 }); }
    X.restore();
    TS_label('lqGate · masked crowd ×16', R[0], R[1] + R[3] + 14);
  }
  // mask dancer line-up
  [[0, 0, 0], [1, .3, .4], [[1, 0], .6, -.05], [[.2, .8], .9, .06]].forEach(([arms, step, lean], i) => lqMaskDancer(1400 + i * 125, 1030, 250, t, { arms, step, lean, mask: i === 3 ? 'gold' : 'egg' }));
  TS_label('lqMaskDancer: arms / step / lean / gold mask', 1330, 1044);
}

TESTS.style = t => { T = t; (Math.floor(t) % 2 ? TS_page2 : TS_page1)(t); };

TESTS.perf = t => {
  // getImageData forces Chrome to execute the deferred canvas commands, so the timings are real
  const flush = () => X.getImageData(0, 0, 1, 1);
  const time = (n, fn) => { const ms = []; for (let i = 0; i < n; i++) { const a = performance.now(); X.setTransform(SX, 0, 0, SX, 0, 0); fn(i); flush(); ms.push(Math.round(performance.now() - a)); } return ms.join(', '); };
  const p1 = time(4, i => TESTS.style(t + i * .1)), p2 = time(3, i => TESTS.style(t + 1 + i * .1));
  const g = time(3, i => lqGround(t + i));
  const d40 = time(3, i => { lqGround(t); for (let k = 0; k < 40; k++) lqMaskDancer(60 + k * 45, 900 + (k % 3) * 40, 180, t, { arms: k % 3 * .4, step: k * .3 + i }); });
  const kr = time(3, i => { lqKarstRiver(t + i, { camX: i * 100 }); lqRedDisc(960, 850, 500, 110, {}); for (let k = 0; k < 12; k++) lqMaskDancer(560 + k * 70, 860, 150, t, { arms: .5 }); });
  const rv = time(3, i => lqReveal(() => lqGold(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H] }), () => lqGround(t), .3 + i * .25, 7, {}));
  const tx = time(3, i => { lqGround(t); lqInlayText('COME MY WAY', 120, 600, { font: FONT.hero(300), glint: .3 + i * .2 }); });
  const idl = time(3, i => { lqGround(t); idolBody(960, 600, 40, dance(t + i, 'groove'), { outfit: 'aodai', face: { hat: 'nonla' } }); });
  const tm = time(3, i => { lqGround(t); lqTimeMachine(960, 900, 1200, t + i, { doors: .5, trail: .8, spin: 20 }); lqClawd(400, 1000, 300, {}); });
  const bu = time(3, i => { lqGround(t); lqBuffalo(900, 900, 900, t + i, { gait: 'charge' }); lqRain(t + i, { n: 300 }); });
  const gd = time(3, i => { lqGround(t); lqGate(960, 1000, 900, { lit: 1 }); lqDrum(t, { r: 300, x: 300, y: 400 }); });
  const gf = time(3, i => lqGold(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H], glint: .2 + i * .3 }));
  const sd = time(3, i => lqSand(.3 + i * .25, 7, {}));
  const rv2 = time(3, i => lqReveal(() => lqGold(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H] }), () => lqGround(t), .3 + i * .25, 7, { halo: null }));
  console.error(`ms · gold full frame: ${gf} · sand mask: ${sd} · reveal without halo: ${rv2}`);
  console.error(`ms · page1: ${p1} · page2: ${p2} · ground: ${g} · ground+40 dancers: ${d40} · karst+disc+12 dancers: ${kr} · full-frame reveal: ${rv} · 300px inlay: ${tx} · idol: ${idl} · car+clawd: ${tm} · buffalo+rain: ${bu} · gate+drum: ${gd}`);
};

// the áo dài idol large, posed and dancing
TESTS.idolbig = t => {
  T = t; lqGround(t, {});
  idolBody(700, 560, 60, { lSh: .5, lEl: .6, rSh: -1.9, rEl: -.4, hR: 'open', lHip: .12, rHip: -.18, rKn: .15, lean: -.04, skirt: .4 }, { outfit: 'aodai', face: { hat: 'nonla', mouth: .4, eyes: 'happy' } });
  idolBody(1400, 560, 60, dance(t, 'groove'), { outfit: 'aodai', face: { hat: 'nonla', mouth: .4 } });
};
