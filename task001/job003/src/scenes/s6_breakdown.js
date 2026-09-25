// s6_breakdown.js: S6 · Breakdown (146.2–186.0). "Cánh hoa úa tàn" ×4, then the ad-lib "Nah woh nah yeah".
// The neon of chorus 2 (the cracked mask) goes dark and blooms back into silk. Almost monochrome: one silk-painted lotus
// over still water sheds one petal per phrase; each petal falls, lands and dissolves into rings. Each phrase is brushed
// huge, then bleeds and runs like wet ink. Four framings of the same painting, joined by soft watercolour dissolves.
//   S6 A 146.2–150.62   neon dies → dissolve to silk. Wide: the lotus right, "Cánh hoa / úa tàn" in two lines at left.
//   S6 B 150.62–154.42  closer on the lotus (right third); the words fall down the left edge in a cascade.
//   S6 C 154.42–158.84  down at the water: the petal falls through frame; the line is brushed above the water and mirrored in it.
//   S6 D 158.84–166.42  the last phrase, biggest, at right with the lotus at left; a slow pull-out while the ink runs.
//   S6 E 166.42–177.15  empty silk: the painting holds, and neon starts to glow behind the silk (backlight grows with the build).
//   S6 F 177.15–184.73  "Nah woh nah yeah" brushed small in the right margin; from ~180 ink dots spread on every beat (claps).
//   S6 G 184.73–186.0   hard cut on bar 73: tight, strong backlight, the neon face a glow behind the silk. A held breath.

const S6_T0 = 146.2, S6_END = 186.0;
const S6_LN = LY.filter(l => l[0] >= S6_T0 - .05 && l[0] < S6_END);
const S6_PH = S6_LN.filter(l => /hoa/i.test(l[2])).slice(0, 4);            // the four "Cánh hoa úa tàn"
const S6_AD = S6_LN.find(l => /nah/i.test(l[2]));                           // "Nah woh nah yeah"
const S6_PT = [0, 1, 2, 3].map(i => S6_PH[i] ? S6_PH[i][0] : [146.2, 151, 155, 159][i]);
// one petal per phrase, on the sung "úa" (withered); it falls for S6_FALL s and lands inside the same phrase
const S6_FALL = 2.5;
const S6_SHED = S6_PT.map((p, i) => { const L = S6_PH[i]; return L ? wordTimes(L)[Math.min(2, wordTimes(L).length - 1)].t : p + 1.26; });
const S6_WY = 880;                                   // the water line (world)
const S6_FX = 1380, S6_FY = 470, S6_FS = 175;        // the lotus
const S6_FACE = [640, 400, 250];                      // the neon face behind the silk (world)
const S6_CUT = [S6_T0, beatT(238), beatT(244), beatT(251), beatT(263), barT(70), barT(73), S6_END];
const S6_CLAPS = Array.from({ length: 7 }, (_, i) => beatT(285 + i));   // 180.3 … 184.1

// ---------- helpers ----------
const S6_e = k => easeInOut(clamp(k));
const S6_lt = (t, i) => clamp((t - S6_CUT[i]) / (S6_CUT[i + 1] - S6_CUT[i]));
// backlight strength: 0 until the build, then grows to the drop
function S6_bk(t) {
  if (t < S6_CUT[4]) return 0;
  const b = Math.pow(clamp((t - S6_CUT[4]) / (S6_CUT[6] - S6_CUT[4])), 1.4) * .62;
  const g = t >= S6_CUT[6] ? lerp(.7, .92, easeOut(clamp((t - S6_CUT[6]) / (S6_END - S6_CUT[6])))) : 0;
  const clap = t > S6_CLAPS[0] - .05 && t < S6_CUT[6] ? .07 * pulse(t, .6) : 0;
  return clamp(Math.max(b, g) + clap + .04 * VOX(t) * clamp((t - 170) / 6));
}
// what glows behind the silk: colour pools and, as the build grows, the neon face switching on (world space, under cam)
function S6_behind(cam) {
  return tt => {
    X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
    X.save(); X.translate(W / 2, H / 2); X.scale(cam.zoom, cam.zoom); X.translate(-cam.x, -cam.y);
    const grow = clamp((tt - S6_CUT[4]) / (S6_END - S6_CUT[4]));
    X.globalCompositeOperation = 'lighter';
    const pool = (x, y, r, c, a) => { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, skRgba(c, a)); g.addColorStop(.4, skRgba(c, a * .45)); g.addColorStop(1, skRgba(c, 0)); X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); };
    pool(S6_FACE[0], S6_FACE[1], 560, SK_PAL.neonPink, .22 + .2 * grow);
    pool(1560, 250, 460, SK_PAL.neonCyan, .2 + .25 * grow);
    pool(1150, 760, 360, SK_PAL.neonAmber, .08 + .12 * grow);
    X.globalCompositeOperation = 'source-over';
    const on = clamp((tt - 170.5) / 5);
    if (on > 0) skFaceNeon(S6_FACE[0], S6_FACE[1], S6_FACE[2], tt, { on, flicker: .35 * (1 - grow), eyes: 'down', w: 5 });
    X.restore();
  };
}

// ---------- the painting (world space) ----------
function S6_ground(t, cam) {
  const bk = S6_bk(t);
  skSilk(t, { tint: '#BDBAB6', tintA: .2, backlight: bk, dim: lerp(.85, .6, bk), behind: bk > 0 ? S6_behind(cam) : undefined });
}
// Static parts of the painting are painted once into a cached layer at a fixed transform (their washes are memoised
// there) and composited under the moving camera: key → {c, ox, oy, sc}. Deterministic: same key, same pixels.
const S6_CACHE = {};
function S6_cache(key, ox, oy, sc, fn) {
  const k = key + '|' + SX; let e = S6_CACHE[k];
  if (!e) {
    const c = mkCanvas(Math.round(W * SX), Math.round(H * SX)), prev = X;
    X = c.getContext('2d'); X.save(); X.setTransform(sc * SX, 0, 0, sc * SX, -ox * sc * SX, -oy * sc * SX);
    try { fn(); } finally { X.restore(); X = prev; }
    e = S6_CACHE[k] = { c, ox, oy, sc };
  }
  return e;
}
function S6_put(e, op = 'multiply', a = 1) {
  X.save(); X.globalCompositeOperation = op; X.globalAlpha = a; X.imageSmoothingQuality = 'high';
  X.drawImage(e.c, 0, 0, e.c.width, e.c.height, e.ox, e.oy, e.c.width / (e.sc * SX), e.c.height / (e.sc * SX)); X.restore();
}
function S6_pond() {
  S6_put(S6_cache('pond', -700, S6_WY - 40, .5, () =>
    skWash(() => X.rect(-700, S6_WY + 3, 3400, 700), SK_PAL.inkLt, { a: .2, edge: .3, feather: .5, grad: [0, S6_WY, 0, S6_WY + 330], gradTo: .15, seed: 61, scale: 3, rough: .5 })));
  S6_put(S6_cache('pondInk', 300, S6_WY - 60, .85, () => skInk([
    [[380, S6_WY + 1, .25], [900, S6_WY - 2], [1500, S6_WY + 1], [2150, S6_WY - 1, .2]],
    [[720, S6_WY + 52, .15], [1180, S6_WY + 49, .5], [1640, S6_WY + 53], [1960, S6_WY + 51, .15]],
    [[980, S6_WY + 118, .1], [1330, S6_WY + 115, .35], [1620, S6_WY + 119, .1]],
  ], { w: 4.5, alpha: .5, dry: .75, seed: 62 })));
}
// the lotus: the standing flower (cached per number of petals shed) + the petals in flight, landing and dissolving
function S6_lotus(t) {
  const nShed = S6_SHED.filter(s => t >= s).length;
  S6_put(S6_cache('lotus' + nShed, 1160, 255, 1.45, () =>
    skFlower(S6_FX, S6_FY, S6_FS, 0, { shed: 4, shedT: S6_SHED.map((s, i) => i < nShed ? -1e4 : 1e4), water: S6_WY, stem: S6_WY - S6_FY + 30, seed: 2 })));
  // falling petals (the same motion as skFlower's own)
  const s = S6_FS, ns = s / 150, seed = 2, fd = S6_FALL, x = S6_FX, y = S6_FY;
  S6_SHED.forEach((T0, n) => {
    const i = SK_SHED[n], age = t - T0; if (age < 0) return;
    const [a, l, wd] = SK_LOTUS[i], L = l * s, cx0 = x + Math.sin(a) * L * .45, cy0 = y - Math.cos(a) * L * .45;
    const fk = clamp(age / fd), yy = lerp(cy0, S6_WY, Math.pow(fk, 1.5)), xx = cx0 + Math.sin(age * 1.5 + i) * s * .3 * clamp(age) + (hash(i * 3.1) - .5) * s * .6 * fk;
    const landed = age >= fd, dis = landed ? clamp((age - fd) / 2.4) : 0;
    if (landed) skRipple(xx, S6_WY, t, T0 + fd, { r: s * .75, flat: .28, color: SK_PAL.indigo, dur: 3.2 });
    if (dis >= 1) return;
    const wither = clamp(age / (fd * 1.2)) * .7, Wd = wd * s;
    X.save(); X.translate(xx, landed ? S6_WY : yy);
    if (landed) X.scale(1 + dis * .5, .35); else X.rotate(a + age * (.8 + hash(i) * .8) * (hash(i * 2) < .5 ? -1 : 1));
    const curl = landed ? 1 : .3 + .7 * Math.abs(Math.cos(age * 2.1 + i));
    skWash(() => skPetalPath(0, L, Wd, .3, 0, -L * .5, curl), SK_PAL.rose, { a: .5 * (1 - dis), edge: .8 * (1 - dis * .6), color2: SK_PAL.ochre, mix: wither, seed: seed + i * 3, scale: ns, blur: 3 * ns + dis * 10 * ns, spread: 10 * ns + dis * 20 * ns, feather: .08 + dis * .8, rough: .35 + dis * .4, memo: false });
    if (!landed) skInk(() => skPetalPath(0, L, Wd, .3, 0, -L * .5, curl), { w: s * .01, color: '#6E3B42', alpha: .5 * (1 - fk * .5), dry: .6, seed: seed + i, bleed: .6 });
    X.restore();
  });
}
// ink dots on the claps (world space): each beat a drop and a few satellites spread into the silk and dry with a dark rim
function S6_dot(x, y, r, t, t0, seed) {
  const age = t - t0; if (age < 0) return;
  const k = expoOut(clamp(age / .5)), rr = r * (.2 + .8 * k), dry = clamp(age / 1.4);
  X.save(); X.globalCompositeOperation = 'multiply';
  X.fillStyle = skRgba(SK_PAL.ink, .1 * (1 - dry) + .05); skLobePath(x, y, rr * 1.3, seed + 1, 8, 48); X.fill();
  X.fillStyle = skRgba(SK_PAL.ink, lerp(.92, .78, dry)); skLobePath(x, y, rr, seed, 9, 60); X.fill();
  X.strokeStyle = skRgba(SK_PAL.ink, .6); X.lineWidth = Math.max(1, rr * .1); X.stroke();
  // splatter: a few tiny droplets thrown on impact
  X.fillStyle = skRgba(SK_PAL.ink, .85);
  for (let q = 0; q < 5; q++) { const an = hash(seed + q * 1.7) * TAU, d = r * (1.3 + hash(seed + q * 2.3) * 1.6) * k, rq = r * (.05 + .09 * hash(seed + q)); X.beginPath(); X.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, rq, 0, TAU); X.fill(); }
  X.restore();
}
function S6_dots(t) {
  S6_CLAPS.forEach((c, i) => {
    if (t < c - .02) return;
    const n = 1 + (i % 2) + (i === S6_CLAPS.length - 1 ? 2 : 0);
    for (let j = 0; j < n; j++) {
      const s = i * 7.3 + j * 1.91, x = 260 + hash(s) * 1000 + (j ? sjit(s + 3, 120) : 0), y = 170 + hash(s + 1.7) * 560;
      S6_dot(x, y, j ? 9 + hash(s + 4) * 12 : 22 + hash(s + 5) * 22, t, c + j * .06, s);
    }
  });
}
// the build: a drop hits the still water on every bar (and on the half bar once it grows), leaving rings
function S6_drops(t) {
  for (let n = 66; n <= 73; n++) for (let h = 0; h < 2; h++) {
    if (h && n < 69) continue;
    const t0 = barT(n) + h * BAR / 2, s = n * 3.7 + h * 1.3; if (t < t0) continue;
    skRipple(700 + hash(s) * 1000, S6_WY + 12 + hash(s + 1) * 70, t, t0, { r: 60 + hash(s + 2) * 50, flat: .26, dur: 3, color: SK_PAL.ink, alpha: 1, w: 3 });
  }
}
function S6_world(t, cam) {
  S6_ground(t, cam);
  camBegin(cam);
  S6_pond(t);
  S6_lotus(t);
  if (t >= S6_CUT[4]) S6_drops(t);
  if (t >= S6_CLAPS[0] - .05) S6_dots(t);
  camEnd();
}

// ---------- the phrase: brushed huge, then it bleeds and runs like wet ink (screen space) ----------
// lay: [{w: [word indices], x, y, size, align}], o: {t0 (earliest write), fade (s), mirror: y (water line on screen)}
function S6_phrase(t, i, lay, o = {}) {
  const L = S6_PH[i]; if (!L) return;
  const ws = wordTimes(L), last = ws[ws.length - 1];
  const fadeAt = last.end + .4, f = easeOut(clamp((t - fadeAt) / (o.fade ?? 3.4)));
  const col = skMix(SK_PAL.ink, '#4A5270', f * .6), alpha = .97 * (1 - .62 * f), bleed = 1 + 1.3 * f, dry = .45 + .45 * f;
  const draw = (mir) => lay.forEach((g, gi) => {
    const fnt = FONT.vnI(g.size), sp = textW(' ', fnt) * .9, words = g.w.map(j => ws[j]).filter(Boolean);
    const widths = words.map(w => textW(w.w, fnt)), tot = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = g.align === 'right' ? g.x - tot : g.align === 'center' ? g.x - tot / 2 : g.x;
    words.forEach((w, j) => {
      const st = Math.max(w.t, o.t0 ?? 0), dur = clamp((w.end - w.t) * 1.05, .4, .75), k = clamp((t - st) / dur);
      if (k > 0) {
        if (mir) skBrushText(w.w, x, g.y, { size: g.size, k, color: col, alpha: alpha * mir, bleed: bleed * 1.6, dry: .75, seed: i * 5 + gi * 2 + j });
        else skBrushText(w.w, x, g.y, { size: g.size, k, color: col, alpha, bleed, dry, seed: i * 5 + gi * 2 + j });
        // the ink runs: a pale, blurred copy of the word slides down the silk from the letters as they bleed
        if (!mir && f > 0) {
          const top = g.y - g.size * .72, st2 = 1 + .55 * f * (o.run ?? 1);
          X.save(); X.translate(0, top); X.scale(1, st2); X.translate(0, -top);
          skBrushText(w.w, x, g.y + g.size * .05 * f, { size: g.size, color: '#3C4160', alpha: .3 * f * (1 - f * .4), bleed: 2.5, dry: .85, seed: i * 5 + gi * 2 + j + 20 });
          X.restore();
        }
      }
      x += widths[j] + sp;
    });
  });
  if (o.mirror !== undefined) { X.save(); X.translate(0, o.mirror); X.scale(1, -.62); X.translate(0, -o.mirror); X.translate(0, sjit(i, 0) + Math.sin(t * 1.3) * 2); draw(.22); X.restore(); }
  draw(0);
}
// a small brushed inscription: the ad-lib, one word per line in the right margin, written as sung
function S6_adlib(t) {
  const L = S6_AD; if (!L) return;
  const ws = wordTimes(L), x = 1690, y0 = 300, lh = 84, sz = 60;
  ws.forEach((w, j) => {
    const k = clamp((t - w.t) / clamp(w.end - w.t, .35, .6));
    if (k > 0) skBrushText(w.w, x + j * 14, y0 + j * lh, { size: sz, font: FONT.vnIR(sz), k, color: SK_PAL.ink, alpha: .92, seed: 40 + j });
  });
  const sk = clamp((t - ws[ws.length - 1].end) / .3);
  if (sk > 0) skSeal(x + 70, y0 + ws.length * lh + 10, 46, 'LỤA', { alpha: .85 * sk });
}

// ---------- the opening: chorus 2 ends with the mask shattered and the neon sputtering out; the shards fall into the dark ----------
function S6_neon(t) {
  const age = t - S6_T0, off = easeIn(clamp(age / .5));
  skNight(t, { lights: [{ x: 480, y: 160, r: 520, color: SK_PAL.neonPink, a: .7 * (1 - off) }, { x: 1440, y: 900, r: 520, color: SK_PAL.neonCyan, a: .6 * (1 - off) }], bokeh: 18 });
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  for (let i = 0; i < 9; i++) {     // porcelain shards tumbling down from where the mask broke
    const s = i * 3.7 + 1, a0 = hash(s) * TAU, v = 60 + hash(s + 1) * 160, g = 900 + hash(s + 2) * 500, a = age + .6;
    const x = 960 + Math.cos(a0) * v * a, y = 560 + Math.sin(a0) * v * a * .6 + g * a * a * .5, r = 22 + hash(s + 3) * 40, rot = a0 + a * (hash(s + 4) - .5) * 6;
    X.save(); X.translate(x, y); X.rotate(rot);
    const pts = [[-r, -r * .3], [r * .2, -r * .8], [r, r * .1], [-r * .1, r * .7]].map((p, k) => [p[0] * (.7 + hash(s + k) * .5), p[1] * (.7 + hash(s + k + 9) * .5)]);
    pathPoly(pts); X.fillStyle = `rgba(235,238,244,${.9 * (1 - off * .6)})`; X.fill();
    X.strokeStyle = skRgba(SK_PAL.neonPink, .8 * (1 - off)); X.lineWidth = 2.5; X.stroke();
    X.restore();
  }
  X.fillStyle = `rgba(5,6,10,${off * .55})`; X.fillRect(0, 0, W, H); X.restore();
}

// ---------- the shots ----------
function S6_A(t) {
  const e = S6_e(S6_lt(t, 0));
  S6_world(t, { x: lerp(960, 990, e), y: lerp(540, 548, e), zoom: lerp(1.0, 1.045, e) });
  S6_phrase(t, 0, [{ w: [0, 1], x: 110, y: 470, size: 215 }, { w: [2, 3], x: 330, y: 730, size: 215 }], { t0: 146.62 });
}
function S6_B(t) {
  const e = S6_e(S6_lt(t, 1));
  S6_world(t, { x: lerp(1120, 1140, e), y: lerp(470, 488, e), zoom: lerp(1.42, 1.47, e) });
  S6_phrase(t, 1, [{ w: [0], x: 100, y: 285, size: 175 }, { w: [1], x: 190, y: 485, size: 175 }, { w: [2], x: 280, y: 685, size: 175 }, { w: [3], x: 370, y: 885, size: 175 }]);
}
function S6_C(t) {
  const e = S6_e(S6_lt(t, 2)), cam = { x: lerp(1270, 1250, e), y: lerp(760, 772, e), zoom: lerp(1.65, 1.7, e) };
  S6_world(t, cam);
  const wy = H / 2 + (S6_WY - cam.y) * cam.zoom;
  S6_phrase(t, 2, [{ w: [0, 1, 2, 3], x: 700, y: 470, size: 168, align: 'center' }], { mirror: wy });
}
function S6_D(t) {
  const e = S6_e(S6_lt(t, 3));
  S6_world(t, { x: lerp(1700, 1720, e), y: lerp(560, 580, e), zoom: lerp(1.04, 1.16, e) });
  S6_phrase(t, 3, [{ w: [0, 1], x: 1760, y: 440, size: 230, align: 'right' }, { w: [2, 3], x: 1760, y: 710, size: 230, align: 'right' }], { fade: 5, run: 1.5 });
}
function S6_E(t) {
  const e = S6_e(S6_lt(t, 4));
  S6_world(t, { x: lerp(1330, 1140, e), y: lerp(600, 515, e), zoom: lerp(1.32, 1.04, e) });
}
function S6_F(t) {
  const e = S6_e(S6_lt(t, 5));
  S6_world(t, { x: lerp(1050, 1030, e), y: lerp(515, 525, e), zoom: lerp(1.08, 1.18, e) });
  S6_adlib(t);
}
function S6_G(t) {
  const e = easeOut(S6_lt(t, 6));
  S6_world(t, { x: lerp(1000, 1010, e), y: lerp(485, 475, e), zoom: lerp(1.3, 1.36, e) });
  S6_adlib(t);
}

// [fn, incoming dissolve (s), seed]
const S6_SHOTS = [[S6_A, 0, 0], [S6_B, .6, 11], [S6_C, .6, 12], [S6_D, .6, 13], [S6_E, .7, 14], [S6_F, .6, 15], [S6_G, 0, 0]];
S6_SHOTS.forEach(([fn, dis, seed], i) => shot(S6_CUT[i], S6_CUT[i + 1], (t, lt) => {
  if (i === 0) {       // the neon goes dark, then the silk blooms through it
    const k = clamp((t - 146.45) / .75);
    if (k < 1) skDissolve(easeInOut(k), 9, () => S6_neon(t), () => fn(t), { rim: SK_PAL.neonPink, rimA: .25 });
    else fn(t);
  } else if (dis && lt < dis) skDissolve(easeInOut(lt / dis), seed, () => S6_SHOTS[i - 1][0](t), () => fn(t), { rimA: .3 });
  else fn(t);
}, { seed: 60 + i }));
