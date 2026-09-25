// tests.js: development pages (not part of the video).
//   node tools/render.mjs --job=job003 --test=style --stills=0,1 --scale=1 --dir=style
//     page 1 (t = 0): LỤA — silk ground (plain, weave ×3, backlit), washes, bloom, tear bleed, ink lines, brush text, rain,
//                     the face as a silk painting with tears, the cracked porcelain mask, the lotus shedding petals into water
//     page 2 (t = 1): NEON — wet street, tubes (lit, flickering, striking, off), neon title with reflection, the neon face,
//                     neon rain, and the three transitions at k = .3 / .6
//   node tools/render.mjs --job=job003 --test=perf --scale=1 --dir=style      (times typical frames, logs ms)
window.TESTS = window.TESTS || {};
window.TEST_FINISH = true;

function SKT_label(str, x, y, dark) {
  X.save(); X.font = FONT.mono(14); X.fillStyle = dark ? 'rgba(220,230,255,.75)' : 'rgba(43,42,51,.8)'; X.textBaseline = 'top'; X.fillText(str, x, y); X.restore();
}
// a thin mounting line around a swatch (a scroll mount)
function SKT_frame(x, y, w, h, dark) { X.save(); X.strokeStyle = dark ? 'rgba(200,210,240,.25)' : 'rgba(43,42,51,.28)'; X.lineWidth = 1; X.strokeRect(x - .5, y - .5, w + 1, h + 1); X.restore(); }
// a brushed swatch shape
function SKT_blob(x, y, w, h, s = 0) {
  const pts = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, r = 1 + noise1(a * 1.3 + s * 7) * .12 + noise1(a * 4 + s) * .05; pts.push([x + w / 2 + Math.cos(a) * w * .5 * r * (Math.abs(Math.cos(a)) > .7 ? 1.05 : 1), y + h / 2 + Math.sin(a) * h * .5 * r]); }
  pathSmooth(pts);
}

// ---- demo scenes (used for the transition panels and the perf test) ----
function SKT_silkScene(t) {
  skSilk(t);
  skWash(() => X.ellipse(1380, 560, 460, 330, -.2, 0, TAU), SK_PAL.indigo, { a: .35, edge: .6, color2: SK_PAL.rose, mix: .5, seed: 4, scale: 3 });
  skWash(() => X.ellipse(620, 360, 380, 200, .3, 0, TAU), SK_PAL.ochre, { a: .45, edge: .6, seed: 5, scale: 3 });
  skFacePortrait(1380, 520, 190, t, { tears: .7, eyes: 'down' });
  skBrushText('Khuôn Mặt Đáng Thương', 120, 900, { size: 110 });
}
function SKT_neonScene(t) {
  skNight(t, { lights: [{ x: 700, y: 330, r: 420, color: SK_PAL.neonPink }, { x: 1400, y: 300, r: 380, color: SK_PAL.neonCyan }], bokeh: 30 });
  skNeonText('KHUÔN MẶT', 160, 420, { size: 200, color: SK_PAL.neonPink, reflect: 600, flicker: .3, broken: 3 });
  skFaceNeon(1440, 330, 150, t, { tearT: [t - .6] });
  skRainNeon(t, { n: 200, lights: [{ x: 700, y: 330, r: 420, color: SK_PAL.neonPink }, { x: 1400, y: 300, r: 380, color: SK_PAL.neonCyan }], ground: 620 });
}

function SKT_page1(t) {
  skSilk(t);
  X.save(); X.font = FONT.vnSansM(20); X.fillStyle = 'rgba(43,42,51,.85)'; X.fillText('KHUÔN MẶT ĐÁNG THƯƠNG · LỤA · MATERIAL SHEET', 44, 44); X.restore();
  // ---- row A: silk and washes ----
  const sw = 150, shh = 190, y0 = 76;
  const slot = i => 44 + i * 164;
  { // weave at 3×
    const x = slot(0), bake = skSilkBake();
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.imageSmoothingEnabled = false; X.drawImage(bake, 800 * SX, 400 * SX, sw / 3 * SX, shh / 3 * SX, x * SX, y0 * SX, sw * SX, shh * SX); X.restore();
    SKT_frame(x, y0, sw, shh); SKT_label('SILK WEAVE ×3', x, y0 + shh + 10);
  }
  { // backlit
    const x = slot(1); X.save(); X.beginPath(); X.rect(x, y0, sw, shh); X.clip();
    skSilk(t, { backlight: .9, lights: [[x + 40, y0 + 60, 90, SK_PAL.neonPink], [x + 120, y0 + 140, 110, SK_PAL.neonCyan], [x + 90, y0 + 30, 50, SK_PAL.neonAmber]] });
    X.restore(); SKT_frame(x, y0, sw, shh); SKT_label('BACKLIT', x, y0 + shh + 10);
  }
  [['INDIGO', SK_PAL.indigo], ['ROSE', SK_PAL.rose], ['CELADON', SK_PAL.celadon], ['OCHRE', SK_PAL.ochre]].forEach(([nm, c], i) => {
    const x = slot(2 + i);
    skWash(() => SKT_blob(x + 8, y0 + 10, sw - 30, shh - 60, i), c, { a: .5, edge: .65, seed: i, color2: i === 0 ? SK_PAL.rose : undefined, mix: .4 });
    skWash(() => SKT_blob(x + 40, y0 + 90, sw - 50, shh - 100, i + 9), c, { a: .45, edge: .6, seed: i + 9 });
    SKT_label(nm + ' WASH', x, y0 + shh + 10);
  });
  { // graded ink wash
    const x = slot(6);
    skWash(() => X.rect(x + 6, y0 + 6, sw - 12, shh - 12), SK_PAL.ink, { a: .7, edge: .5, grad: [x, y0, x, y0 + shh], gradTo: .05, seed: 7, rough: .45 });
    SKT_label('GRADED INK', x, y0 + shh + 10);
  }
  // ---- row B: bloom, tear bleed, ink lines ----
  const y1 = 330;
  [.25, .8, 3].forEach((age, i) => skBloom(80 + i * 118, y1 + 90, 50, [SK_PAL.rose, SK_PAL.indigo, SK_PAL.celadon][i], age, 0, { seed: i + 1, color2: i === 1 ? SK_PAL.rose : undefined, mix: .5 }));
  SKT_label('BLOOM · t0+0.25 / 0.8 / 3 s', 44, y1 + 190);
  [.35, 1.6, 5].forEach((age, i) => skBleed(420 + i * 55, y1 + 10, SK_PAL.indigo, age, 0, { len: 150, w: 13, seed: i + 2, color2: SK_PAL.rose }));
  SKT_label('TEAR BLEED', 400, y1 + 190);
  skInk([[600, y1 + 40, .6], [680, y1 + 10], [780, y1 + 50], [860, y1 + 20, .5]], { w: 16, dry: .35, seed: 1 });
  skInk([[600, y1 + 110, .8], [700, y1 + 90], [800, y1 + 130], [880, y1 + 95]], { w: 26, dry: .8, dryTail: .7, seed: 2 });
  skInk([[610, y1 + 180, .5], [690, y1 + 150], [760, y1 + 175], [820, y1 + 150, .7]], { w: 12, dry: .25, k: .6, seed: 3 });
  skInk(() => { X.moveTo(910, y1 + 20); X.bezierCurveTo(1000, y1 - 10, 960, y1 + 120, 1040, y1 + 170); }, { w: 9, dry: .5, seed: 4 });
  SKT_label('INK: PRESSURE · DRY BRUSH · WRITING (k=.6)', 600, y1 + 190);
  // rain as ink
  X.save(); X.beginPath(); X.rect(1060, y1 - 6, 110, 200); X.clip(); skRainInk(t + 3.3, { rect: [1060, y1 - 6, 110, 200], n: 40, dots: 10, len: 30 }); X.restore();
  SKT_label('INK RAIN', 1060, y1 + 190);
  // ---- row C: brushed title, half written and done ----
  skBrushText('Khuôn Mặt Đáng Thương', 50, 660, { size: 92, k: .5 });
  skBrushText('Khuôn Mặt Đáng Thương', 50, 800, { size: 92 });
  skSeal(1150, 752, 54, 'LỤA');
  SKT_label('BRUSH TEXT · k = .5 (wet front) / 1 · FONT.vnI', 50, 830);
  skBrushText('cánh hoa úa tàn', 50, 950, { size: 60, font: FONT.vnIR(60), color: SK_PAL.indigo });
  SKT_label('LYRIC INSCRIPTION · FONT.vnIR indigo', 50, 975);
  // ---- right: motifs ----
  skFacePortrait(1395, 250, 108, t, { tears: .75, eyes: 'down', mouth: 0 });
  SKT_label('FACE · SILK · TEARS .75', 1280, 480);
  skMask(1330, 800, 118, { crack: .8 });
  SKT_label('PORCELAIN MASK · CRACK .8', 1245, 1030);
  // the lotus over water: petals already falling, landing, dissolving into rings
  const wy = 880;
  skInk([[[1560, wy, .4], [1700, wy - 3], [1880, wy + 2, .4]], [[1600, wy + 40, .3], [1760, wy + 38], [1870, wy + 42, .3]]], { w: 3, alpha: .5, dry: .6, color: SK_PAL.indigo });
  skFlower(1700, 560, 150, t, { shed: 4, shedT: [-5.2, -3.9, -2.2, -.8], water: wy, leaf: true });
  SKT_label('LOTUS · SHEDDING · RIPPLES', 1580, 1030);
}

function SKT_page2(t) {
  const lights = [{ x: 380, y: 200, r: 330, color: SK_PAL.neonPink }, { x: 1540, y: 280, r: 360, color: SK_PAL.neonCyan }, { x: 900, y: 420, r: 300, color: SK_PAL.neonPink, a: .6 }];
  skNight(t, { horizon: 600, lights, bokeh: 40 });
  X.save(); X.font = FONT.vnSansM(20); X.fillStyle = 'rgba(220,230,255,.8)'; X.fillText('KHUÔN MẶT ĐÁNG THƯƠNG · NEON · MATERIAL SHEET', 44, 44); X.restore();
  // tubes in four states
  const tu = [
    ['LIT', SK_PAL.neonPink, { on: 1 }, (x, y) => heartPath(x, y, 46)],
    ['FLICKER', SK_PAL.neonCyan, { flicker: 1 }, (x, y) => sparkPath(x, y, 60, 6, .25, .2, .55)],
    ['STRIKING on=.5', SK_PAL.neonAmber, { on: .5 }, (x, y) => { X.moveTo(x - 60, y + 30); X.lineTo(x - 20, y - 40); X.lineTo(x + 10, y + 20); X.lineTo(x + 60, y - 40); }],
    ['OFF (glass)', SK_PAL.neonPink, { on: 0 }, (x, y) => X.arc(x, y, 48, 0, TAU)],
  ];
  tu.forEach(([nm, c, o, fn], i) => { const x = 110 + i * 170, y = 150; skNeon(() => fn(x, y), c, { ...o, seed: i * 3 + 1, t }); SKT_label(nm, x - 60, 240, true); });
  // the title in neon with its reflection in the wet street
  skNeonText('KHUÔN MẶT ĐÁNG THƯƠNG', 60, 520, { size: 104, color: SK_PAL.neonPink, reflect: { y: 600, a: .6 }, broken: 9, flicker: .2, t });
  SKT_label('NEON TEXT · FONT.vnSansB · REFLECTION IN PUDDLES', 60, 280 + 50, true);
  skNeonText('em ơi', 760, 380, { size: 70, color: SK_PAL.neonCyan, font: FONT.vnSansB(70), t });
  // the neon face with a tear falling
  skFaceNeon(1555, 300, 112, t, { tearT: [t - .55, t - 1.2], eyes: 'down', reflect: { y: 600, a: .45 } });
  SKT_label('FACE · NEON · TEARS', 1480, 560, true);
  X.save(); X.beginPath(); X.rect(1250, 60, 670, 700); X.clip(); skRainNeon(t + 2, { rect: [1250, 60, 670, 700], n: 120, lights, ground: 640 }); X.restore();
  skRipple(1100, 690, t, t - .6, { neon: SK_PAL.neonCyan, r: 80, flat: .25 });
  // transitions at k = .3 and .6
  const s = .148, pw = W * s, ph = H * s, y0 = 780;
  const panels = [['TEAR', .3], ['TEAR', .6], ['DISSOLVE', .3], ['DISSOLVE', .6], ['DRIP', .3], ['DRIP', .6]];
  panels.forEach(([nm, k], i) => {
    const x0 = 44 + i * (pw + 18);
    X.save(); X.beginPath(); X.rect(x0, y0, pw, ph); X.clip(); X.translate(x0, y0); X.scale(s, s);
    const silk = () => { skSilk(t); skWash(() => X.ellipse(W * .6, H * .5, 700, 380, -.2, 0, TAU), SK_PAL.indigo, { a: .4, edge: .7, seed: 3, scale: 4 }); skBrushText('Khuôn Mặt', 160, 620, { size: 300 }); };
    const neon = () => { skNight(t, { lights: [{ x: 900, y: 400, r: 700, color: SK_PAL.neonPink }] }); skNeonText('NEON', 360, 700, { size: 480, color: SK_PAL.neonCyan, t }); };
    if (nm === 'TEAR') skTear(k, 7, neon, silk, { rim: SK_PAL.neonPink });
    else if (nm === 'DISSOLVE') skDissolve(k, 5, silk, neon, {});
    else skDrip(k, 3, neon, silk, { color: SK_PAL.neonPink, glow: true });
    X.restore(); SKT_frame(x0, y0, pw, ph, true);
    SKT_label(`${nm} k=${k}`, x0, y0 + ph + 8, true);
  });
}

TESTS.style = t => { T = t; (Math.floor(t) % 2 ? SKT_page2 : SKT_page1)(t); };

TESTS.perf = t => {
  const flush = () => X.getImageData(0, 0, 1, 1);
  const time = (n, fn) => { const ms = []; for (let i = 0; i < n; i++) { const a = performance.now(); X.setTransform(SX, 0, 0, SX, 0, 0); T = t + i * .1; fn(i); flush(); ms.push(Math.round(performance.now() - a)); } return ms.join(', '); };
  const fin = () => skFinish(t, null);
  const r = {
    page1: time(3, i => SKT_page1(t + i * .1)), page2: time(3, i => SKT_page2(1 + t + i * .1)),
    silk: time(3, () => skSilk(t)), silkBacklit: time(3, () => skSilk(t, { backlight: .8 })),
    silkBehindNeon: time(3, () => skSilk(t, { backlight: .8, behind: tt => SKT_neonScene(tt) })),
    wash5: time(3, i => { skSilk(t); for (let k = 0; k < 5; k++) skWash(() => X.ellipse(300 + k * 330, 500, 260, 300, k, 0, TAU), SK_PAL.indigo, { seed: k + i }); }),
    washFull: time(3, i => { skSilk(t); skWash(() => X.rect(-50, -50, W + 100, H + 100), SK_PAL.indigo, { seed: i, grad: [0, 0, 0, H] }); }),
    face: time(3, i => { skSilk(t); skFacePortrait(960, 540, 260, t + i, { tears: .6 + i * .1, seed: i }); }),
    faceStatic: time(3, i => { skSilk(t); skFacePortrait(960, 540, 260, t + i, { tears: .6 }); }),
    face180: time(3, i => { skSilk(t); skFacePortrait(960, 540, 180, t + i, { tears: .6 + i * .1, seed: i + 5 }); }),
    silkScene: time(3, i => { SKT_silkScene(t + i); fin(); }),
    silkSceneMoving: time(3, i => { camBegin({ zoom: 1 + i * .01 }); SKT_silkScene(t + i); camEnd(); fin(); }),
    neonScene: time(3, i => { SKT_neonScene(t + i); fin(); }),
    faceNeon: time(3, i => { skNight(t); skFaceNeon(960, 500, 260, t + i, { tearT: [t + i - .5] }); }),
    tear: time(3, i => { skTear(.3 + i * .25, 7, () => SKT_neonScene(t), () => SKT_silkScene(t), { rim: SK_PAL.neonPink }); fin(); }),
    dissolve: time(3, i => { skDissolve(.3 + i * .25, 5, () => SKT_silkScene(t), () => SKT_neonScene(t)); fin(); }),
    drip: time(3, i => { skDrip(.3 + i * .25, 3, () => SKT_neonScene(t), () => SKT_silkScene(t), { glow: true }); fin(); }),
    mask: time(3, i => { skSilk(t); skMask(960, 540, 300, { crack: .3 + i * .3 }); }),
    flower: time(3, i => { skSilk(t); skFlower(960, 500, 200, t + i, { shed: 4, shedT: [-4, -2.5, -1, 0], water: 900 }); }),
    finish: time(3, () => fin()),
  };
  console.error('ms · ' + Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(' · '));
};

// full-frame materials in use (dev): t=0 silk, 1 neon, 2 backlit silk with the neon street behind, 3 tear, 4 dissolve, 5 drip
TESTS.scenes = t => {
  T = t; const p = Math.floor(t), tt = 20 + t;
  if (p === 0) SKT_silkScene(tt);
  else if (p === 1) SKT_neonScene(tt);
  else if (p === 2) { skSilk(tt, { backlight: .85, behind: u => SKT_neonScene(u) }); skBrushText('Khuôn Mặt Đáng Thương', 120, 900, { size: 110, alpha: .8 }); }
  else if (p === 3) skTear(.5, 7, () => SKT_neonScene(tt), () => SKT_silkScene(tt), { rim: SK_PAL.neonPink });
  else if (p === 4) skDissolve(.45, 5, () => SKT_silkScene(tt), () => SKT_neonScene(tt));
  else if (p === 5) skDrip(.45, 3, () => SKT_neonScene(tt), () => SKT_silkScene(tt), { color: SK_PAL.neonPink, glow: true });
};
