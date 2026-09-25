// s8_outro.js: S8 · Outro (227.7–254.82). The neon goes out, the silk is left.
// S8a 227.68–236.52  the lotus of the drop, drawn in neon over silk: its tubes switch off one by one as the loud part ends
//                    (the ghost petals first, the last real petal last) while the room light returns to the silk. The
//                    last painted petal falls into the water on "Cánh hoa úa tàn", brushed large and slow.
// S8b 236.52–242.84  a watercolour bloom opens onto the silk portrait; one painted tear runs down her cheek while
//                    "khuôn mặt đáng thương" is brushed beside her.
// S8c 242.84–254.82  the scroll rolls up from the bottom, taking the painting with it; on the mount behind it: the tear
//                    that soaked through, the red seal and a small credit line; then only plain silk with a faint glow.

const S8_T0 = 227.7, S8_B = 236.52, S8_C = 242.84, S8_END = 254.82;
const S8_ROLL = [242.84, 247.1];                   // the scroll rolls up (starts on bar 96, ends before bar 98)
const S8_FLOWER = { x: 1310, y: 400, s: 285, water: 905, seed: 2 };
const S8_FACE = { x: 1480, y: 520, R: 205 };
const S8_TEAR = 237.4;                              // the one tear starts to run as "khuôn" is sung

// ---------- helpers ----------
// sung word times of LY[i], stretched onto the hook span [h0, h1] (the outro phrases are sung long and slow)
function S8_words(i, h0, h1) {
  const L = LY[i]; if (!L) return [];
  const ws = wordTimes(L); if (!ws.length) return [];
  const a = ws[0].t, b = ws[ws.length - 1].end, m = v => h0 + (v - a) / Math.max(.01, b - a) * (h1 - h0);
  return ws.map(w => ({ w: w.w, t: m(w.t), end: m(w.end) }));
}
const S8_lineIdx = (a, b) => LY.findIndex(l => l[0] >= a && l[0] < b);
// Brush a line of words, each written on over its sung span (slow). groups: [[wordIdx…], …] per text line.
function S8_brushLines(t, ws, groups, o) {
  groups.forEach((g, li) => {
    const size = o.sizes[li], fnt = FONT.vnI(size), sp = textW(' ', fnt) * .95;
    let x = o.xs[li];
    g.forEach(wi => {
      const w = ws[wi]; if (!w) return;
      const ww = textW(w.w, fnt), k = easeInOut(clamp((t - w.t + .05) / (Math.max(.5, w.end - w.t) + .35)));
      if (k > 0) S8_brush(w.w, x, o.ys[li], { size, font: fnt, k, color: o.colors?.[li] || SK_PAL.ink, alpha: o.alpha ?? .95, seed: wi * 3.7 + li, dry: .5 });
      x += ww + sp;
    });
  });
}
// skBrushText's blurred bleed reads a padded region of its shared layer: clear it so nothing stale bleeds in
function S8_brush(str, x, y, o) { const c = skLay('_skTxt'); c.x.clearRect(0, 0, c.width, c.height); return skBrushText(str, x, y, o); }
// soft graded washes (sky from the top, water from the bottom) behind the motifs
function S8_ground(top, bottom, seed) {
  skWash(() => X.rect(-120, -120, W + 240, 760), top, { a: .42, grad: [0, -120, 0, 640], gradTo: 0, edge: .15, feather: .7, rough: .5, seed, scale: 4, color2: SK_PAL.rose, mix: .25 });
  skWash(() => X.rect(-120, 620, W + 240, 600), bottom, { a: .36, grad: [0, 1200, 0, 640], gradTo: 0, edge: .15, feather: .7, rough: .5, seed: seed + 1, scale: 4 });
}
// Silk in a dark room, lit by coloured light (a cheap stand-in for skSilk's backlight): the room light drops to `dim`
// and soft glows are screened on. lights: [[x, y, r, colour, a]] in world space.
function S8_glowSilk(t, k, dim, lights) {
  skSilk(t);
  if (k <= .005) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.globalCompositeOperation = 'multiply'; const d = lerp(1, dim, k); X.fillStyle = `rgb(${Math.round(255 * d)},${Math.round(250 * d)},${Math.round(246 * d)})`; X.fillRect(0, 0, W, H);
  X.globalCompositeOperation = 'screen';
  for (const [x, y, r, c, a] of lights) { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, skRgba(c, a * k)); g.addColorStop(.45, skRgba(c, a * k * .4)); g.addColorStop(1, skRgba(c, 0)); X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); }
  X.restore();
}
// Ink water lines under the lotus
function S8_water(y, a = 1) {
  skInk([[[1020, y, .4], [1260, y - 3], [1560, y + 2], [1820, y - 1, .4]], [[1110, y + 44, .3], [1400, y + 41], [1700, y + 46, .3]], [[1200, y + 92, .25], [1480, y + 90], [1640, y + 93, .2]]],
    { w: 3.2, alpha: .45 * a, dry: .6, color: SK_PAL.indigo, seed: 5 });
}

// ---------- S8a · the lotus: neon off, the last petal ----------
// The tubes of the neon lotus and when each switches off (a sputter, then dark). Ghost petals (already shed from the
// painting) go out in the order the painting lost them; the one real petal left is last.
const S8_TUBES = (() => {
  const out = [];
  out.push({ kind: 'frame', off: 227.99, color: SK_PAL.neonCyan });
  out.push({ kind: 'moon', off: 228.31, color: SK_PAL.neonAmber });
  out.push({ kind: 'ripple', off: 228.47, color: SK_PAL.neonCyan });
  out.push({ kind: 'stem', off: 228.62, color: SK_PAL.neonCyan });
  const ghosts = SK_SHED.slice(0, 10);   // in pairs, as the painting lost them
  for (let j = 0; j < 5; j++) out.push({ kind: 'petal', i: [ghosts[j * 2], ghosts[j * 2 + 1]], off: 228.94 + j * .19, color: SK_PAL.neonPink });
  out.push({ kind: 'pod', off: 229.9, color: SK_PAL.neonAmber });
  out.push({ kind: 'petal', i: [10], off: barT(91), color: SK_PAL.neonPink });
  return out;
})();
// tube intensity: full, then a short sputter (on drops unevenly), then dark
const S8_on = (t, off) => t < off - .12 ? 1 : t >= off + .1 ? 0 : clamp(1 - (t - off + .12) / .22) * (hash(Math.floor(t * 30) * 1.7 + off) < .6 ? 1 : .15);

const S8_MOON = [330, 200, 92];
function S8_moonPath() { const [x, y, r] = S8_MOON; X.moveTo(x + r * Math.cos(-2.2), y + r * Math.sin(-2.2)); X.arc(x, y, r, -2.2, 2.2, true); X.arc(x - r * .42, y - r * .1, r * .8, 2.05, -2.05, false); X.closePath(); }
// The last petal: painted exactly like skFlower's front-centre petal, it lets go on "Cánh", tumbles and withers on the
// way down, lands on the water on "tàn", and dissolves into rings.
const S8_PETAL = { t0: 230.45, land: 235.0 };
function S8_petal(t) {
  const F = S8_FLOWER, i = 10, [a, l, wd] = SK_LOTUS[i], L = l * F.s, Wd = wd * F.s, ns = F.s / 150, bend = (hash(i + F.seed) - .5) * .6;
  const age = Math.max(0, t - S8_PETAL.t0), fd = S8_PETAL.land - S8_PETAL.t0, fk = clamp(age / fd), landed = t >= S8_PETAL.land, dis = landed ? clamp((t - S8_PETAL.land) / 2.6) : 0;
  const sway = Math.sin(t * .7 + F.seed) * .03;
  // rest pose: the petal's centre, half a petal up from the base of the bloom
  const rx = F.x + Math.sin(sway) * L * .5, ry = F.y - Math.cos(sway) * L * .5;
  const lx = F.x - 120, px = lerp(rx, lx, easeInOut(fk)) + Math.sin(age * 1.4) * 70 * clamp(age) * (1 - fk * .7), py = lerp(ry, F.water - 8, Math.pow(fk, 1.35));
  if (landed) skRipple(lx, F.water, t, S8_PETAL.land, { r: 170, flat: .26, n: 3, dur: 3.2, color: SK_PAL.indigo, w: 2.6 });
  if (dis >= 1) return;
  // tumbling on the way down, settling flat (on its side) as it reaches the water
  const settle = easeInOut(clamp((fk - .8) / .2)), tumble = age > 0 ? Math.sin(age * 1.6) * .9 * clamp(age / .8) + age * .35 : 0;
  const rot = lerp(sway + tumble, Math.PI / 2 + Math.round((sway + tumble - Math.PI / 2) / Math.PI) * Math.PI, settle);
  const curl = age > 0 && !landed ? lerp(.4 + .6 * Math.abs(Math.cos(age * 1.8)), 1, settle) : 1, wither = clamp(age / (fd * 1.1)) * .75;
  X.save(); X.translate(px, py); X.scale(1 + dis * .6, lerp(1, .32, settle) + dis * .1); X.rotate(rot);
  const path = () => skPetalPath(0, L, Wd, bend, 0, L * .5, curl);
  skWash(path, SK_PAL.rose, { a: .42 * (1 - dis), edge: .75 * (1 - dis * .6), color2: age > 0 ? SK_PAL.ochre : '#E3A6A4', mix: age > 0 ? .25 + wither : .6, grad: [0, -L * .5, 0, L * .5], gradTo: .12, seed: F.seed + i * 3, scale: ns, blur: 3 * ns + dis * 12 * ns, spread: 10 * ns + dis * 24 * ns, feather: .08 + dis * .8, rough: .35 + dis * .4 });
  if (dis < .3) skInk(path, { w: F.s * .011, color: '#6E3B42', alpha: .6 * (1 - dis / .3), dry: .5, seed: F.seed + i, bleed: .6 });
  X.restore();
}
function S8_neonLotus(t) {
  const F = S8_FLOWER, sway = Math.sin(t * .7 + F.seed) * .03;
  for (const tb of S8_TUBES) {
    const on = S8_on(t, tb.off); if (on <= 0) continue;
    const o = { on, w: tb.kind === 'petal' ? 5 : 4.5, seed: tb.off * 13, t, flicker: .15, halo: .9 };
    if (tb.kind === 'frame') skNeon(() => X.roundRect(70, 60, W - 140, H - 120, 26), tb.color, { ...o, w: 4 });
    else if (tb.kind === 'moon') skNeon(() => S8_moonPath(), tb.color, o);
    else if (tb.kind === 'ripple') skNeon(() => { X.ellipse(1300, F.water + 20, 260, 34, 0, 0, TAU); X.moveTo(1640, F.water + 60); X.ellipse(1480, F.water + 60, 160, 20, 0, 0, TAU); }, tb.color, o);
    else if (tb.kind === 'stem') withT(F.x, F.y, 0, 1, () => { const s = F.s, st = s * 1.7; skNeon(() => { pathSmooth([[sway * s, 0], [s * .08, st * .4], [-s * .02, st * .75], [s * .05, st]], false); X.moveTo(s * .95 + s * 1.05, st * .82); X.ellipse(s * .95, st * .82, s * 1.05, s * .32, -.08, 0, TAU); }, tb.color, o); });
    else if (tb.kind === 'pod') withT(F.x, F.y, sway, 1, () => skNeon(() => X.ellipse(0, -F.s * .52, F.s * .14, F.s * .05, 0, 0, TAU), tb.color, o));
    else withT(F.x, F.y, sway, 1, () => skNeon(() => tb.i.forEach(i => { const [a, l, wd] = SK_LOTUS[i]; skPetalPath(a, l * F.s, wd * F.s, (hash(i + F.seed) - .5) * .6, 0, 0, 1); }), tb.color, o));
  }
}
function S8_lotusScene(t) {
  const F = S8_FLOWER, lt = t - S8_T0;
  // backlight dies with the tubes; the room light returns to the silk
  const nOn = S8_TUBES.reduce((a, tb) => a + (t < tb.off ? 1 : t < tb.off + .3 ? 1 - (t - tb.off) / .3 : 0), 0) / S8_TUBES.length;
  const bk = .9 * Math.pow(nOn, .7);
  camBegin({ zoom: 1.03 + lt * .0045, x: W / 2 - lt * 4, y: H / 2 - lt * 2, shake: KICK(t) * 5 * clamp(1 - lt / .8) });
  S8_glowSilk(t, bk, .2, [[F.x, F.y - 60, 640, SK_PAL.neonPink, .5], [F.x - 40, F.water + 20, 520, SK_PAL.neonCyan, .4]]);
  S8_ground(SK_PAL.indigo, SK_PAL.celadon, 81);
  S8_water(F.water, 1);
  // the painted lotus: ten petals are long gone; the last one falls as "Cánh" is sung
  skWash(() => X.arc(S8_MOON[0], S8_MOON[1], S8_MOON[2] * .96, 0, TAU), SK_PAL.ochre, { a: .24, edge: .06, feather: .75, rough: .2, seed: 84, color2: SK_PAL.rose, mix: .2 });
  skFlower(F.x, F.y, F.s, t, { shed: 11, shedT: Array(11).fill(-1e3), water: F.water, seed: F.seed, leaf: true });
  // with the petals gone the seed head stands alone on its stem
  { const s2 = F.s, sw = Math.sin(t * .7 + F.seed) * .03;
    withT(F.x, F.y, sw, 1, () => {
      skWash(() => pathSmooth([[-s2 * .15, -s2 * .53], [s2 * .15, -s2 * .53], [s2 * .07, -s2 * .36], [0, -s2 * .31], [-s2 * .07, -s2 * .36]], true), SK_PAL.celadon, { a: .45, edge: .7, color2: SK_PAL.ochre, mix: .4, seed: 86, scale: F.s / 300 });
      skInk([[[0, 0, .7], [s2 * .012, -s2 * .16], [0, -s2 * .32, .8]]], { w: F.s * .045, color: '#58735F', dry: .35, tail: .2, alpha: .9, seed: 87 });
      skInk([[[-s2 * .15, -s2 * .52, .4], [-s2 * .06, -s2 * .36], [0, -s2 * .31, .6]], [[s2 * .15, -s2 * .52, .4], [s2 * .06, -s2 * .36], [0, -s2 * .31, .6]]], { w: F.s * .012, alpha: .55, dry: .4, seed: 88 });
    });
  }
  S8_petal(t);
  // the neon lotus drawn on top, going out tube by tube
  if (t < barT(91) + .2) S8_neonLotus(t);
  // "Cánh hoa úa tàn" brushed on the calm left half, large and slow
  const li = S8_lineIdx(230, 236.3);
  if (li >= 0) S8_brushLines(t, S8_words(li, 230.4, 235.9), [[0, 1], [2, 3]], { xs: [170, 290], ys: [480, 720], sizes: [200, 200], colors: [SK_PAL.ink, '#7A4A3E'] });
  camEnd();
}
shot(S8_T0, S8_B, (t, lt) => S8_lotusScene(t), { seed: 2277, dark: true });

// ---------- S8b · the portrait with one painted tear ----------
function S8_portraitCam(t) {
  const lt = t - S8_B;
  camBegin({ zoom: 1.02 + lt * .003, x: W / 2 - lt * 3, y: H / 2 + lt * 1.2 });
}
// The portrait is a painting that holds still: paint it once (per output scale) into a cache, lay it on with multiply.
let S8_FC = null;
function S8_faceDraw() {
  const R = S8_FACE.R, x0 = -2.1 * R, y0 = -2.15 * R, w = 4.2 * R, h = 3.95 * R;
  if (!S8_FC || S8_FC.sx !== SX) {
    const res = SX * 1.15, c = mkCanvas(Math.ceil(w * res), Math.ceil(h * res)), prev = X;
    X = c.getContext('2d');
    try { X.setTransform(res, 0, 0, res, -x0 * res, -y0 * res); skFacePortrait(0, 0, R, 0, { eyes: 'down', mouth: 0, lost: 2, seed: 3 }); } finally { X = prev; }
    S8_FC = { sx: SX, c };
  }
  X.save(); X.globalCompositeOperation = 'multiply'; X.drawImage(S8_FC.c, x0, y0, w, h); X.restore();
}
function S8_portraitBody(t) {
  const P = S8_FACE;
  S8_ground(SK_PAL.indigo, SK_PAL.rose, 91);
  const br = 1 + Math.sin((t - S8_B) * 1.5) * .004;      // she breathes
  withT(P.x, P.y, 0, br, () => {
    S8_faceDraw();
    // one painted tear, from her left eye (screen right), running slowly and bleeding into the silk
    const R = P.R, ex = R * .39 + R * 1.06 * .21 * .35, ey = R * .17 + R * 1.06 * .25 * .85 * .55;
    skBleed(ex, ey, SK_PAL.indigo, t, S8_TEAR, { dur: 3.4, len: R * .62, w: R * .1, seed: 17, a: .26, color2: SK_PAL.rose });
  });
}
function S8_portraitText(t) {
  const li = S8_lineIdx(236.3, 241);
  if (li >= 0) S8_brushLines(t, S8_words(li, 237.4, 240.9), [[0, 1], [2, 3]], { xs: [150, 210], ys: [480, 700], sizes: [150, 150], colors: [SK_PAL.ink, SK_PAL.ink] });
}
function S8_portraitScene(t) {
  S8_portraitCam(t);
  skSilk(t);
  S8_portraitBody(t);
  S8_portraitText(t);
  camEnd();
}
shot(S8_B, S8_C, (t, lt) => {
  const d = .9;
  if (lt < d) skDissolve(easeInOut(lt / d), 23, () => S8_lotusScene(t), () => S8_portraitScene(t), { n: 14, rim: SK_PAL.indigo, rimA: .5 });
  else S8_portraitScene(t);
}, { seed: 2365 });

// ---------- S8c · the scroll rolls up; seal, credits, plain silk ----------
function S8_mount(t) {
  // the mount behind the painting: plain silk with a faint warm glow from behind, breathing
  const g = .16 + .07 * Math.sin((t - S8_C) * 1.1) + RMS(t) * .12;
  S8_glowSilk(t, 1, .97, [[960, 500, 820, SK_PAL.neonAmber, g * 1.1], [1300, 420, 460, SK_PAL.rose, g * .5]]);
  // seal and a small credit line, fading at the very end
  const fa = 1 - ease(clamp((t - 251.3) / 2.0));
  if (fa > .01) {
    skSeal(960, 360, 104, 'LỤA NEON', { alpha: .85 * fa, rot: -.03 });
    S8_brush('Khuôn Mặt Đáng Thương · Lụa & Neon', 960, 540, { size: 60, align: 'center', font: FONT.vnIR(60), alpha: .9 * fa, bleed: .8, dry: .35 });
    rtext('Music: Sơn Tùng M-TP', 960, 622, { font: FONT.vnSansM(26), color: SK_PAL.inkLt, align: 'center', tracking: 2.5, alpha: .9 * fa });
    rtext('Animation drawn in code by Claude', 960, 666, { font: FONT.vnSansM(26), color: SK_PAL.inkLt, align: 'center', tracking: 2.5, alpha: .9 * fa });
  }
}
// the rolled silk: a cylinder with its rod, catching the light on top, shadowed underneath, casting a shadow on the mount
function S8_roll(y, r, t) {
  const x0 = -80, x1 = W + 80;
  X.save();
  // cast shadow on the mount, below the roll
  let g = X.createLinearGradient(0, y, 0, y + r + 70); g.addColorStop(0, 'rgba(40,28,20,.42)'); g.addColorStop(1, 'rgba(40,28,20,0)');
  X.fillStyle = g; X.fillRect(x0, y, x1 - x0, r + 70);
  // the painting curls into the roll: a soft shade just above it
  g = X.createLinearGradient(0, y - r - 60, 0, y - r); g.addColorStop(0, 'rgba(40,28,20,0)'); g.addColorStop(1, 'rgba(40,28,20,.22)');
  X.fillStyle = g; X.fillRect(x0, y - r - 60, x1 - x0, 60);
  // the cylinder
  g = X.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, '#9C8C72'); g.addColorStop(.18, '#E6DAC2'); g.addColorStop(.34, '#F8F2E4'); g.addColorStop(.6, '#D9CBAE'); g.addColorStop(.88, '#8E7C60'); g.addColorStop(1, '#5E5040');
  X.fillStyle = g; X.fillRect(x0, y - r, x1 - x0, r * 2);
  // wound layers: faint lines along the roll, and a hint of the painting's colour wound inside
  X.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 9; i++) {
    const yy = y - r * .8 + hash(i * 3.3) * r * 1.6, a = .08 + hash(i * 1.7) * .1;
    X.strokeStyle = `rgba(90,70,50,${a})`; X.lineWidth = 1 + hash(i) * 1.5; X.beginPath(); X.moveTo(x0, yy); X.lineTo(x1, yy + sjit(i, 2)); X.stroke();
  }
  X.fillStyle = skRgba(SK_PAL.indigo, .1); X.fillRect(1150, y - r * .55, 620, r * .5);
  X.fillStyle = skRgba(SK_PAL.ochre, .12); X.fillRect(1080, y - r * .5, 760, r * .35);
  X.globalCompositeOperation = 'source-over';
  // ink edge lines of the silk border (the mount's brocade edge) at top and bottom of the roll
  X.strokeStyle = 'rgba(43,42,51,.55)'; X.lineWidth = 1.5;
  X.beginPath(); X.moveTo(x0, y - r + .5); X.lineTo(x1, y - r + .5); X.stroke();
  X.beginPath(); X.moveTo(x0, y + r - .5); X.lineTo(x1, y + r - .5); X.stroke();
  X.restore();
}
shot(S8_C, S8_END + .1, (t, lt) => {
  const k = easeInOut(clamp((t - S8_ROLL[0]) / (S8_ROLL[1] - S8_ROLL[0])));
  S8_portraitCam(t);
  if (k >= 1) { S8_mount(t); camEnd(); return; }
  const r = 24 + 26 * k, y = lerp(H + 140, -140, k);      // the roll grows as it takes up the silk
  S8_mount(t);
  // the painting, above the roll
  X.save(); X.beginPath(); X.rect(-400, -400, W + 800, y + 400); X.clip();
  skSilk(t); S8_portraitBody(t); S8_portraitText(t);
  X.restore();
  S8_roll(y, r, t);
  camEnd();
}, { seed: 2428 });
