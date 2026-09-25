// s4_verse2.js: S4 · Verse 2 (86.3–125.3). The rap middle, then the verse ending sung again.
//
// RAP (86.3–105.5): a SPLIT SCREEN that drifts apart. Silk memory on the left (the face as a silk painting, turned
//   toward the seam), neon present on the right (the same face in tubes, turned toward her). The two panels start
//   touching; "khoảng cách đôi ta" rips the gap open and it keeps widening until "bên ai đó" pushes them off the frame.
//   The dense lines are stacked as fast fragments: small words brushed (silk) or struck (neon) on their sung times, the
//   key words huge ("không phải em", "cảm xúc", "khoảng | cách" split across the gap, "nơi nào", "nói cho anh nghe").
//   P0 86.3   neon drips back into watercolour on the left half; "không phải em" brushed, then again in neon
//   P1 88.10  close on the two faces at the seam; "cảm xúc" fades as "nhạt phai" is sung
//   P2 90.0   wide; on "khoảng cách" the gap snaps open, the word torn in two (ink | neon); "đôi ta" floats in the void
//   P3 93.15  close on the silk face; "hôm qua"
//   P4 95.68  close on the neon face; "nơi nào?" twice in neon
//   P5 98.2   wide, further apart; "nơi nào" once in ink, once in neon
//   P6 100.73 "NÓI CHO ANH NGHE": a neon column in the void, every word struck on the beat, re-struck the second time
//   P7 102.94 the panels slide off the frame; the neon face turns away; "bên ai đó"
// VERSE ENDING (105.5–125.3): silk again, verse 1's imagery with neon bleeding in at the edges, building to chorus 2.
//   V1 105.47 (watercolour blooms out of the split) the portrait close; painted tears run as "nước mắt" is sung
//   V2 109.89 rain as ink over the lake, two figures under one umbrella; "Hạt mưa rơi / tình chơi vơi"
//   V3 112.10 the face with closed eyes, colour blooming around her on the beat; "Giấc mơ này"
//   V4 114.94 the song on a stave; struck through with a neon tube on "hết", an ink full stop on "chấm"
//   V5 119.99 the road to the vanishing point, where the neon world glows; the camera walks in; "điều ước", "bình yên";
//             from bar 49 the neon floods through the silk (hand-off to chorus 2 at 125.3)

const S4_T0 = 86.3, S4_T1 = 125.3;
const S4_P = SK_PAL;
const S4_cut = t => beatT(Math.floor(beatF(t) * 2 + .02) / 2);   // the 8th-note at or before t

// ---------- lyric lines of this section (by time) and word times kept inside their line ----------
const S4_L = LY.filter(l => l[0] >= 86.2 && l[0] < S4_T1);
const S4_WS = S4_L.map(L => {
  const ws = wordTimes(L), a = L[0], last = ws.length ? ws[ws.length - 1].t : a, lim = L[1] - .16;
  if (last > lim && last > a) { const k = (lim - a) / (last - a); ws.forEach(w => { w.t = a + (w.t - a) * k; w.end = a + (w.end - a) * k; }); }
  return ws;
});
const S4_w = i => S4_WS[i] || [];
const S4_lt = (i, j) => (S4_WS[i] && S4_WS[i][j] ? S4_WS[i][j].t : 1e9);   // time of word j of line i

// ---------- cached paintings (deterministic, keyed; a still painting is drawn once and moved by the camera) ----------
const S4_CACHE = new Map();
function S4_sprite(key, fn) {
  key = key + '|' + SX;
  let c = S4_CACHE.get(key);
  if (c) { S4_CACHE.delete(key); S4_CACHE.set(key, c); return c; }
  c = mkCanvas(Math.round(W * SX), Math.round(H * SX));
  const prev = X; X = c.getContext('2d');
  X.setTransform(SX, 0, 0, SX, 0, 0);
  try { fn(); } finally { X = prev; }
  S4_CACHE.set(key, c); if (S4_CACHE.size > 14) S4_CACHE.delete(S4_CACHE.keys().next().value);
  return c;
}
// A painting rendered through camera (Zq, Fq) in its own coordinates.
function S4_render(key, Zq, Fq, fn) {
  return S4_sprite(key + '@' + Zq + ',' + Fq[0] + ',' + Fq[1], () => { X.translate(W / 2, H / 2); X.scale(Zq, Zq); X.translate(-Fq[0], -Fq[1]); fn(); });
}
// Blit such a sprite so that its content point p lands where the camera (Z, F) puts world point p + off.
function S4_place(c, Zq, Fq, Z, F, off, op = 'source-over', a = 1) {
  const k = Z / Zq;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = op; X.globalAlpha = a;
  X.translate(W / 2 + Z * (Fq[0] + off[0] - F[0]), H / 2 + Z * (Fq[1] + off[1] - F[1])); X.scale(k, k); X.translate(-W / 2, -H / 2);
  X.imageSmoothingQuality = 'high'; X.drawImage(c, 0, 0, W, H); X.restore();
}
// Run fn in world space under camera (Z, F), shifted by off.
function S4_inCam(Z, F, off, fn) {
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.translate(W / 2, H / 2); X.scale(Z, Z); X.translate(-F[0] + off[0], -F[1] + off[1]); fn(); X.restore();
}
const S4_sx = (Z, F, x) => W / 2 + Z * (x - F[0]);
const S4_sy = (Z, F, y) => H / 2 + Z * (y - F[1]);

// Sequential keyframes: [[t0, value, dur, easeFn]], each blending from the value so far.
function S4_ramp(t, keys, v0) {
  let v = v0;
  for (const [t0, val, d, f] of keys) { if (t <= t0) break; v = lerp(v, val, (f || expoOut)(clamp((t - t0) / d))); }
  return v;
}

// ---------- type ----------
// A row of words from one line: brushed (ink, write-on following the sung words) or struck (neon, letter by letter).
// r: {a, b (word indices), m: 'ink'|'neon', size, x, y, align, color, font, out (time it leaves), punch (scale pop), alpha}
function S4_row(t, ws, r) {
  if (!ws.length || !ws[r.a]) return null;
  const b = Math.min(r.b ?? r.a, ws.length - 1), t0 = ws[r.a].t;
  if (t < t0 - .03) return null;
  if (r.out !== undefined && t >= r.out) return null;
  const words = ws.slice(r.a, b + 1), str = words.map(w => w.w).join(' '), size = r.size;
  const neon = r.m === 'neon', fnt = r.font || (neon ? FONT.vnSansB(size) : size >= 100 ? FONT.vnI(size) : FONT.vnIR(size));
  const tr = neon ? size * .04 : 0;
  let res = null;
  const pop = r.punch ? lerp(1.22, 1, expoOut((t - t0) / .22)) : 1;
  X.save();
  if (pop !== 1) {
    const wd = textW(str, fnt, tr), cx = r.align === 'center' ? r.x : r.align === 'right' ? r.x - wd / 2 : r.x + wd / 2;
    X.translate(cx, r.y - size * .35); X.scale(pop, pop); X.translate(-cx, -(r.y - size * .35));
  }
  if (neon) {
    // letters switch on in order, each word on its sung time (a short sputter as the tube strikes)
    const on = []; let li = 0;
    words.forEach((w, wi) => {
      [...w.w].forEach((ch, q) => { const ts = w.t + q * .028, age = t - ts; on[li++] = age < 0 ? 0 : age < .07 ? .55 : 1; });
      if (wi < words.length - 1) on[li++] = 1;
    });
    res = skNeonText(str, r.x, r.y, { size, font: fnt, color: r.color || S4_P.neonPink, on, align: r.align, flicker: r.flicker ?? .08, t, seed: r.seed ?? (r.a * 3 + 1), w: r.w, halo: r.halo, broken: r.broken, tracking: tr, I: r.alpha });
  } else {
    // the brush follows the voice: its front runs to the end of the word being sung
    const L = layout(str, fnt, 0), wEnds = [], wStarts = []; let acc = 0;
    words.forEach((w, wi) => { const ww = textW(w.w, fnt); wStarts.push(acc); wEnds.push(acc + ww); acc += ww + textW(' ', fnt); });
    let j = -1; words.forEach((w, wi) => { if (t >= w.t - .02) j = wi; });
    const dur = Math.max(.12, Math.min(.3, (words[j + 1] ? words[j + 1].t : words[j].t + .3) - words[j].t));
    const p = easeOut(clamp((t - words[j].t + .02) / dur)), fx = lerp(wStarts[j], wEnds[j], p) + size * .5;
    const w = L.width, x0 = r.align === 'center' ? r.x - w / 2 : r.align === 'right' ? r.x - w : r.x;
    const k = j === words.length - 1 && p >= 1 ? 1 : clamp((fx + size * .4) / (w + size * .5));
    res = skBrushText(str, r.x, r.y, { size, font: fnt, k, align: r.align, color: r.color || S4_P.ink, alpha: r.alpha ?? .95, dry: r.dry ?? .4, seed: r.a * 1.7 + 2 });
    res.x0 = x0;
  }
  X.restore();
  return res;
}
const S4_rows = (t, i, rows, out) => rows.forEach(r => S4_row(t, S4_w(i), { out, ...r }));

// ---------- the silk memory panel (the split screen's left side) ----------
// Painting coordinates: its right edge is x = W, the face sits near it, turned toward the seam.
const S4_SF = [W - 300, 440], S4_SR = 180;
function S4_silkPainting(o = {}) {
  skSilk(0);
  // night sky in indigo, graded down into bare silk; the lamplight in ochre; rose around the face
  skWash(() => X.rect(-60, -60, W + 120, 640), S4_P.indigo, { a: .34, edge: .5, grad: [0, -60, 0, 600], gradTo: .04, seed: 41, scale: 3, color2: S4_P.cobalt, mix: .3 });
  skWash(() => X.ellipse(W - 560, 250, 250, 190, .2, 0, TAU), S4_P.ochre, { a: .26, edge: .6, feather: .45, seed: 42, scale: 2.5 });
  skWash(() => X.ellipse(S4_SF[0] + 40, S4_SF[1] + 40, 360, 420, -.1, 0, TAU), S4_P.rose, { a: .16, edge: .5, feather: .35, seed: 43, scale: 3 });
  // willow strands hanging from the top left, celadon leaves worked in wet
  const strands = [];
  for (let i = 0; i < 9; i++) {
    const x0 = 300 + i * 95 + sjit(i * 3.3, 30), len = 280 + hash(i * 7.1) * 340, pts = [];
    for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([x0 + Math.sin(u * 2.2 + i) * 28 * u + u * 40, -20 + u * len, .9 - u * .6]); }
    strands.push(pts);
  }
  skWash(() => strands.forEach((s, i) => { for (let k = 3; k < s.length; k += 1) { const [x, y] = s[k]; X.moveTo(x + 22, y); X.ellipse(x, y, 22, 9, 1.2 + (i % 2) * .5, 0, TAU); } }), S4_P.celadon, { a: .34, edge: .6, seed: 44, feather: .3, scale: 1.5 });
  skInk(strands, { w: 3.2, dry: .5, alpha: .6, seed: 45, tail: .6 });
  // the lake: two quiet ink lines and an indigo reflection band
  skWash(() => X.rect(-60, 850, W + 120, 300), S4_P.indigo, { a: .22, edge: .5, grad: [0, 1100, 0, 850], gradTo: .2, seed: 46, scale: 3 });
  skInk([[[40, 852, .4], [700, 848], [1500, 853], [1900, 849, .4]], [[200, 905, .3], [900, 902], [1600, 906, .3]]], { w: 3, alpha: .45, dry: .6, color: S4_P.indigo, seed: 47 });
  skFacePortrait(S4_SF[0], S4_SF[1], S4_SR, 0, { turn: .32, look: [.8, .1], eyes: o.eyes || 'open', seed: 5 });
  skSeal(W - 90, 1000, 46, 'LỤA');
}
// painted tears on the panel face (live: they run as the song asks)
function S4_silkTears(t, k, fx, fy, R, turn, seed = 5, len = .85) {
  if (k <= 0) return;
  const G = skFaceGeo(R, 0, { turn, sway: 0 });
  for (const e of G.eyes) skBleed(fx + e.x + e.sd * e.rx * .35, fy + e.y + e.ry * .85, S4_P.indigo, 0, 0, { k: clamp(k * (e.sd > 0 ? 1 : .8)), len: R * len, w: R * .07, seed: seed + e.sd * 7, a: .34, color2: S4_P.rose });
}

// ---------- the neon present panel (right side) ----------
// Panel coordinates: its left edge is x = 0.
const S4_NF = [300, 440], S4_NR = 180;
function S4_neonFace(turn, eyes) {
  skFaceNeon(S4_NF[0], S4_NF[1], S4_NR, 0, { turn, eyes, sway: 0, sparkRot: .3, w: 5 });
}
// neon tears falling from the panel face (live)
function S4_neonTears(t, times, fx, fy, R, turn) {
  const G = skFaceGeo(R, 0, { turn, sway: 0 }), w = Math.max(2.2, R * .028);
  for (const tt of times) {
    const age = t - tt; if (age < 0 || age > 1.8) continue;
    G.eyes.forEach((e, ei) => {
      const x0 = fx + e.x + e.sd * e.rx * .35, y0 = fy + e.y + e.ry * .85, fall = age < .25 ? 0 : Math.pow((age - .25) / 1.2, 2) * R * 2.2, yy = y0 + fall + R * .03 * clamp(age / .25);
      const s = R * .075 * (.6 + .4 * clamp(age / .25)), fade = 1 - clamp((age - 1.3) / .5);
      skNeon(() => { X.moveTo(x0, yy - s * 2.2); X.quadraticCurveTo(x0 + s * 1.1, yy - s * .2, x0, yy + s); X.quadraticCurveTo(x0 - s * 1.1, yy - s * .2, x0, yy - s * 2.2); }, S4_P.neonCyan, { seed: 16 + ei, w: w * .75, I: fade, halo: 1.3, t });
    });
  }
}

// ---------- the split screen ----------
// v: {Z, F (camera), c (seam centre, world x), g (gap), turnN (neon face turn), silkEyes, tears (silk k), tearT (neon),
//     neonA (brightness), drip (0..1 progress of the opening drip, or undefined)}
function S4_split(t, v) {
  const Z = v.Z, F = v.F, eL = v.c - v.g / 2, eR = v.c + v.g / 2, sL = S4_sx(Z, F, eL), sR = S4_sx(Z, F, eR);
  const offS = [eL - W, 0], offN = [eR, 0];
  // the void between them
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.fillStyle = '#07080D'; X.fillRect(0, 0, W, H); X.restore();
  // ---- neon (right) ----
  if (sR < W + 20) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.beginPath(); X.rect(sR, 0, W - sR + 10, H); X.clip();
    S4_neonSide(t, v, Z, F, offN);
    X.restore();
    // the edge of the present: a cyan tube
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    skNeon(() => { X.moveTo(sR + 3, -30); X.lineTo(sR + 3, H + 30); }, S4_P.neonCyan, { w: 4, halo: .7, seed: 21, flicker: .15, t, I: .8 + KICK(t) * .2 });
    X.restore();
  }
  // ---- silk (left), with a torn, fibrous edge ----
  if (sL > -20) {
    const edge = []; for (let y = -30; y <= H + 30; y += 10) edge.push([sL + noise1(y / 36 + 3.1) * 7 + noise1(y / 8.5 + 7) * 2.6, y]);
    const drawSilk = () => {
      const Zq = v.Zq || 1, Fq = v.Fq || [W / 2, H / 2];
      S4_place(S4_render('silkA' + (v.silkEyes || ''), Zq, Fq, () => S4_silkPainting({ eyes: v.silkEyes })), Zq, Fq, Z, F, offS);
      if (v.tears) S4_inCam(Z, F, offS, () => S4_silkTears(t, v.tears, S4_SF[0], S4_SF[1], S4_SR, .32));
    };
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.beginPath(); X.moveTo(-40, -40); edge.forEach(p => X.lineTo(p[0], p[1])); X.lineTo(-40, H + 40); X.closePath(); X.clip();
    if (v.drip !== undefined && v.drip < 1) {
      skDrip(v.drip, 7, () => S4_neonSide(t, v, Z, F, [eL - 900, 0], true), drawSilk, { rect: [0, 0, sL + 12, H], color: S4_P.neonPink, glow: true, n: 14 });
    } else drawSilk();
    X.restore();
    // the torn edge: a pale cut line and loose threads reaching into the dark
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.lineCap = 'round';
    X.strokeStyle = 'rgba(247,241,228,.85)'; X.lineWidth = 1.4; X.beginPath(); edge.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
    X.strokeStyle = 'rgba(247,241,228,.55)'; X.lineWidth = .9; X.beginPath();
    for (let i = 0; i < edge.length; i++) {
      if (hash(i * 3.7) < .45) continue;
      const [x, y] = edge[i], L = 5 + hash(i * 1.3) * 16 + (v.g > 200 ? hash(i * 2.1) * 20 : 0), a = (hash(i * 5.9) - .5) * 1.2 + noise1(t * .8 + i) * .15;
      X.moveTo(x, y); X.quadraticCurveTo(x + L * .5, y + a * L * .3, x + Math.cos(a) * L, y + Math.sin(a) * L + L * .2);
    }
    X.stroke(); X.restore();
  }
}
// the neon panel's content (also the "before" of the opening drip, when bare = true)
function S4_neonSide(t, v, Z, F, off, bare) {
  const fx = S4_sx(Z, F, S4_NF[0] + off[0]), fy = S4_sy(Z, F, S4_NF[1]), hz = S4_sy(Z, F, 760);
  const lights = [{ x: fx, y: fy - 40 * Z, r: 460 * Z, color: S4_P.neonPink, a: .55 + KICK(t) * .25 }, { x: fx + 620 * Z, y: fy - 200 * Z, r: 380 * Z, color: S4_P.neonCyan, a: .7 }];
  skNight(t, { horizon: clamp(hz, 300, 1000), lights, bokeh: 26 });
  if (!bare) {
    const Zq = v.nZq || 1, Fq = v.nFq || [W / 2, H / 2], turn = v.turnN ?? -.32;
    const sp = S4_render('neonF' + turn + (v.neonEyes || ''), Zq, Fq, () => S4_neonFace(turn, v.neonEyes));
    const I = (v.neonA ?? 1) * (.82 + .18 * VOX(t) + .1 * KICK(t)), fl = hash(Math.floor(t * 24) * 1.7) < .04 ? .6 : 1;
    S4_place(sp, Zq, Fq, Z, F, off, 'lighter', clamp(I * fl));
    if (v.tearT) S4_inCam(Z, F, off, () => S4_neonTears(t, v.tearT, S4_NF[0], S4_NF[1], S4_NR, turn));
  }
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  skRainNeon(t, { n: 110, lights, ground: clamp(hz, 300, 1000) + 20, splash: 24, alpha: .8 });
  X.restore();
}

// ---------- the rap: camera, seam and gap over time ----------
const S4_CUTS = { p1: 88.10, p2: S4_cut(90.0), p3: S4_cut(93.2), p4: S4_cut(95.8), p5: S4_cut(98.3), p6: S4_cut(100.8), p7: S4_cut(103.2), v1: 105.468 };
function S4_gap(t) {
  return S4_ramp(t, [
    [88.10, 18, .3], [90.0, 70, 2.0, ease],
    [S4_lt(2, 12) - .03, 380, .45], [93.2, 440, 2.5, ease],
    [98.2, 560, .5], [S4_lt(6, 0) - .03, 720, .3], [S4_lt(6, 4) - .03, 980, .3],
    [S4_CUTS.p7, 1180, 2.4, easeInOut],
  ], 0);
}
function S4_rapView(t) {
  const g = S4_gap(t), c = 960, C = S4_CUTS;
  const v = { c, g, turnN: -.32, tearT: [] };
  // silk-side and neon-side face centres in world space
  const sF = [c - g / 2 - (W - S4_SF[0]), S4_SF[1]], nF = [c + g / 2 + S4_NF[0], S4_NF[1]];
  if (t < C.p1) { const lt = t - S4_T0; v.Z = 1 + lt * .012; v.F = [960, 540]; v.drip = clamp((t - S4_T0) / .8); }
  else if (t < C.p2) { const lt = t - C.p1; v.Z = 1.32 + lt * .02; v.F = [960 + lt * 4, 450]; v.Zq = 1.3; v.nZq = 1.3; v.Fq = [W - 330, 450]; v.nFq = [330, 450]; }
  else if (t < C.p3) { const lt = t - C.p2; v.Z = 1 + lt * .01; v.F = [960, 540 - lt * 3]; }
  else if (t < C.p4) { const lt = t - C.p3; v.Z = 1.28 + lt * .012; v.F = [sF[0] - 170 + lt * 10, 470]; v.Zq = 1.3; v.Fq = [S4_SF[0] - 170, 470]; v.tears = clamp((t - 94.0) / 3) * .6; }
  else if (t < C.p5) { const lt = t - C.p4; v.Z = 1.28 + lt * .012; v.F = [nF[0] + 150 - lt * 10, 470]; v.nZq = 1.3; v.nFq = [S4_NF[0] + 150, 470]; v.tearT = [S4_lt(4, 4), S4_lt(4, 12)]; v.tears = .6; }
  else if (t < C.p6) { const lt = t - C.p5; v.Z = 1 + lt * .01; v.F = [960, 540]; v.tears = .6 + lt * .05; v.tearT = [S4_lt(5, 5)]; }
  else if (t < C.p7) { v.Z = 1 + KICK(t) * .012; v.F = [960, 540]; v.tears = .75; }
  else { const lt = t - C.p7; v.Z = 1 + lt * .008; v.F = [960, 540]; v.tears = .75 + lt * .08; v.turnN = .3; }
  return v;
}
// the words of the rap, set per line
function S4_rapType(t) {
  const C = S4_CUTS, ln = i => (S4_L[i] ? S4_L[i][0] : 1e9);
  const v = S4_rapView(t), eL = S4_sx(v.Z, v.F, v.c - v.g / 2), eR = S4_sx(v.Z, v.F, v.c + v.g / 2);
  // L0: "Em giờ | KHÔNG PHẢI EM | mà anh thì | KHÔNG PHẢI EM mà"
  S4_rows(t, 0, [
    { a: 0, b: 1, m: 'ink', size: 50, x: 86, y: 862 },
    { a: 2, b: 4, m: 'ink', size: 128, x: 64, y: 1010 },
    { a: 5, b: 7, m: 'neon', size: 42, x: 1010, y: 862, color: S4_P.neonCyan },
    { a: 8, b: 11, m: 'neon', size: 92, x: 1004, y: 1000, punch: 1 },
  ], C.p1);
  // L1: close on the faces. "Khuôn mặt em yêu vẫn thế nhưng nay | CẢM XÚC | đã quá nhạt phai mà" (the big word fades)
  const fade = 1 - .72 * easeOut((t - S4_lt(1, 12)) / .5);
  S4_rows(t, 1, [
    { a: 0, b: 5, m: 'ink', size: 50, x: 80, y: 110 },
    { a: 6, b: 7, m: 'neon', size: 42, x: 1840, y: 110, align: 'right', color: S4_P.neonCyan },
    { a: 8, b: 9, m: 'ink', size: 180, x: 60, y: 1010, alpha: .95 * fade },
    { a: 10, b: 14, m: 'neon', size: 42, x: 1840, y: 1030, align: 'right', color: S4_P.neonCyan, alpha: .5 + .5 * fade },
  ], C.p2);
  // L2: wide. "Nơi đâu cho anh cảm xúc thăng hoa | nơi đâu anh nhìn | KHOẢNG ‖ CÁCH | đôi ta"
  if (t >= C.p2 && t < C.p3) {
    S4_rows(t, 2, [
      { a: 0, b: 7, m: 'ink', size: 50, x: 80, y: 110 },
      { a: 8, b: 11, m: 'neon', size: 42, x: 1840, y: 110, align: 'right', color: S4_P.neonCyan },
      { a: 12, b: 12, m: 'ink', size: 170, x: eL - 30, y: 1005, align: 'right' },
      { a: 13, b: 13, m: 'neon', size: 150, x: eR + 34, y: 1000, punch: 1 },
      { a: 14, b: 15, m: 'neon', size: 40, x: (eL + eR) / 2, y: 560, align: 'center', color: S4_P.neonWhite, halo: .6 },
    ], C.p3);
  }
  // L3: close on silk. "Không gian đâu không chắc / cho em nhìn ra / một con người / đến từ | HÔM QUA"
  S4_rows(t, 3, [
    { a: 0, b: 4, m: 'ink', size: 50, x: 80, y: 130 },
    { a: 5, b: 8, m: 'ink', size: 50, x: 80, y: 200 },
    { a: 9, b: 13, m: 'ink', size: 50, x: 80, y: 270 },
    { a: 14, b: 15, m: 'ink', size: 170, x: 70, y: 1000 },
  ], C.p4);
  // L4: close on neon. "Em giờ đang ở | NƠI NÀO | cơn gió mang em đi đến | NƠI NÀO"
  S4_rows(t, 4, [
    { a: 0, b: 3, m: 'neon', size: 44, x: 1840, y: 120, align: 'right', color: S4_P.neonCyan },
    { a: 4, b: 5, m: 'neon', size: 150, x: 1850, y: 320, align: 'right', punch: 1 },
    { a: 6, b: 11, m: 'neon', size: 44, x: 1840, y: 820, align: 'right', color: S4_P.neonCyan },
    { a: 12, b: 13, m: 'neon', size: 150, x: 1850, y: 1010, align: 'right', punch: 1, color: S4_P.neonCyan },
  ], C.p5);
  // L5: wide. "Bên cạnh ai kia ở | NƠI NÀO (ink) | đôi chân em lang thang đến | NƠI NÀO (neon)"
  S4_rows(t, 5, [
    { a: 0, b: 4, m: 'ink', size: 50, x: 80, y: 110 },
    { a: 5, b: 6, m: 'ink', size: 160, x: 60, y: 1005 },
    { a: 7, b: 12, m: 'neon', size: 42, x: 1840, y: 110, align: 'right', color: S4_P.neonCyan },
    { a: 13, b: 14, m: 'neon', size: 140, x: 1850, y: 1000, align: 'right', punch: 1 },
  ], C.p6);
  // L6: "NÓI / CHO / ANH / NGHE": a neon column in the void; the repeat re-strikes each word in cyan
  if (t >= C.p6 && t < C.p7) {
    const ws = S4_w(6);
    for (let j = 0; j < 4 && ws[j]; j++) {
      const t1 = ws[j].t, t2 = ws[j + 4] ? ws[j + 4].t : 1e9; if (t < t1 - .02) continue;
      const again = t >= t2 - .02, tl = again ? t2 : t1, pop = lerp(1.3, 1, expoOut((t - tl) / .2));
      const y = 250 + j * 200, str = ws[j].w.toUpperCase(), size = 170;
      X.save(); X.translate(960, y - size * .35); X.scale(pop, pop); X.translate(-960, -(y - size * .35));
      skNeonText(str, 960, y, { size, font: FONT.vnSans(size), align: 'center', color: again ? S4_P.neonCyan : S4_P.neonPink, on: t - tl < .06 ? .5 : 1, t, seed: 40 + j, flicker: .05 });
      X.restore();
    }
  }
  // L7: "Bước đi vội vàng / em đang đi | BÊN AI ĐÓ"
  S4_rows(t, 7, [
    { a: 0, b: 3, m: 'neon', size: 44, x: 960, y: 420, align: 'center', color: S4_P.neonWhite, halo: .6 },
    { a: 4, b: 6, m: 'neon', size: 44, x: 960, y: 500, align: 'center', color: S4_P.neonWhite, halo: .6 },
    { a: 7, b: 9, m: 'neon', size: 150, x: 960, y: 760, align: 'center', punch: 1, color: S4_P.neonCyan },
  ], 106.2);
}
function S4_rap(t) {
  const v = S4_rapView(t);
  S4_split(t, v);
  S4_rapType(t);
}

// ---------- the verse ending: neon bleeding in at the edges of the silk ----------
// amt 0..1; sides: which edges ('r', 'l', 'b', 't')
function S4_bleed(t, amt, sides = 'rl') {
  if (amt <= 0) return;
  const k = amt * (.85 + .15 * KICK(t));
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  const band = (x0, y0, x1, y1, col, wdt) => {
    const g = X.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); return g;
  };
  const defs = { r: [W, 0, W - 1, 0, S4_P.neonPink], l: [0, 0, 1, 0, S4_P.neonCyan], b: [0, H, 0, H - 1, S4_P.neonPink], t: [0, 0, 0, 1, S4_P.neonCyan] };
  for (const s of sides) {
    const [x0, y0, x1, y1, col] = defs[s], wd = (s === 'r' || s === 'l' ? 420 : 260) * amt, dx = (x1 - x0) * wd, dy = (y1 - y0) * wd;
    // the night creeps in (multiply), then the tube light on it
    X.globalCompositeOperation = 'multiply'; X.fillStyle = band(x0, y0, x0 + dx, y0 + dy, `rgba(28,22,52,${.85 * k})`); X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'lighter'; X.fillStyle = band(x0, y0, x0 + dx * .7, y0 + dy * .7, skRgba(col, .55 * k)); X.fillRect(0, 0, W, H);
  }
  X.restore();
}
// a neon tube creeping along an edge of the frame (0..1 drawn)
function S4_edgeTube(t, k, pts, col, seed) {
  if (k <= 0) return;
  let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  skNeon(() => {
    let left = tot * clamp(k); X.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) { const u = Math.min(1, left / seg[i - 1]); X.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= seg[i - 1]; }
  }, col, { w: 5, seed, flicker: .2, t, halo: .9 });
  X.restore();
}

// V1: the portrait close, the tears of "ngàn giọt nước mắt đắng cay"
const S4_V1F = [1330, 470], S4_V1R = 290;
function S4_v1Painting() {
  skSilk(0);
  skWash(() => X.ellipse(1300, 520, 720, 560, -.15, 0, TAU), S4_P.rose, { a: .16, edge: .55, feather: .4, seed: 61, scale: 4, color2: S4_P.ochre, mix: .4 });
  skWash(() => X.rect(-60, -60, W + 120, 420), S4_P.indigo, { a: .28, grad: [0, -60, 0, 380], gradTo: .02, seed: 62, scale: 3 });
  skFacePortrait(S4_V1F[0], S4_V1F[1], S4_V1R, 0, { turn: -.12, eyes: 'down', seed: 8 });
}
function S4_v1(t) {
  const lt = t - S4_CUTS.v1, Z = 1 + lt * .012, F = [1000 + lt * 6, 540];
  S4_place(S4_render('v1', 1, [1000, 540], S4_v1Painting), 1, [1000, 540], Z, F, [0, 0]);
  const tk = clamp((t - S4_lt(8, 9) + .3) / 2.6);
  S4_inCam(Z, F, [0, 0], () => S4_silkTears(t, tk, S4_V1F[0], S4_V1F[1], S4_V1R, -.12, 8, .95));
  S4_bleed(t, .35 + .1 * (lt / 4.4), 'r');
  S4_rows(t, 8, [
    { a: 0, b: 3, m: 'ink', size: 54, x: 110, y: 200 },
    { a: 4, b: 8, m: 'ink', size: 54, x: 110, y: 275 },
    { a: 9, b: 11, m: 'ink', size: 150, x: 90, y: 900 },
    { a: 12, b: 13, m: 'ink', size: 54, x: 110, y: 985, color: S4_P.inkLt },
  ]);
}
// V2: rain as ink over the lake, two under one umbrella
function S4_v2Painting() {
  skSilk(0);
  skWash(() => X.rect(-60, -60, W + 120, 760), S4_P.indigo, { a: .42, grad: [0, -60, 0, 700], gradTo: .15, seed: 71, scale: 3, color2: S4_P.cobalt, mix: .35 });
  skWash(() => X.rect(-60, 700, W + 120, 440), S4_P.indigo, { a: .3, grad: [0, 1100, 0, 700], gradTo: .35, seed: 72, scale: 3 });
  // far shore: trees in soft indigo
  skWash(() => { const pts = [[-60, 700]]; for (let x = -60; x <= W + 60; x += 40) pts.push([x, 640 - 40 * (noise1(x / 190 + 2) + 1) - 25 * noise1(x / 60)]); pts.push([W + 60, 700]); pathSmooth(pts); }, S4_P.ink, { a: .22, edge: .6, seed: 73, scale: 2, color2: S4_P.celadon, mix: .4 });
  // the lamp and its long reflection
  skWash(() => X.ellipse(1480, 420, 170, 170, 0, 0, TAU), S4_P.ochre, { a: .38, edge: .5, feather: .7, seed: 74, op: 'source-over', alpha: .55 });
  skInk([[[1480, 700, .9], [1482, 560], [1480, 440, .6]]], { w: 7, seed: 75, dry: .3 });
  skWash(() => { X.moveTo(1450, 720); X.lineTo(1510, 720); X.lineTo(1540, 1080); X.lineTo(1420, 1080); X.closePath(); }, S4_P.ochre, { a: .3, feather: .6, seed: 76, grad: [0, 720, 0, 1080], gradTo: .1 });
  skInk([[[40, 702, .4], [900, 698], [1880, 703, .4]]], { w: 3, alpha: .5, dry: .6, color: S4_P.ink, seed: 77 });
  // two figures under one umbrella on the shore path
  const ux = 1180, uy = 560;
  skWash(() => { X.ellipse(ux - 34, uy + 110, 30, 100, .03, 0, TAU); X.moveTo(ux + 70, uy + 115); X.ellipse(ux + 40, uy + 115, 30, 96, -.03, 0, TAU); }, S4_P.ink, { a: .55, edge: .7, seed: 78, color2: S4_P.indigo, mix: .5 });
  skWash(() => { X.moveTo(ux - 150, uy); X.quadraticCurveTo(ux, uy - 150, ux + 150, uy); X.quadraticCurveTo(ux, uy - 30, ux - 150, uy); }, S4_P.rose, { a: .6, edge: .8, seed: 79, color2: S4_P.cinnabar, mix: .3 });
  skInk([[[ux - 150, uy, .5], [ux - 60, uy - 110], [ux + 60, uy - 110], [ux + 150, uy, .5]], [[ux, uy - 80], [ux + 4, uy + 120, .5]]], { w: 4, dry: .35, seed: 80 });
  skWash(() => { X.ellipse(ux - 34, uy + 30, 20, 22, 0, 0, TAU); X.moveTo(ux + 60, uy + 34); X.ellipse(ux + 40, uy + 34, 20, 22, 0, 0, TAU); }, S4_P.ink, { a: .6, edge: .6, seed: 81 });
}
function S4_v2(t) {
  const lt = t - S4_CUTS.v2, Z = 1.02 + lt * .012, F = [960 + lt * 12, 540];
  S4_place(S4_render('v2', 1, [960, 540], S4_v2Painting), 1, [960, 540], Z, F, [0, 0]);
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainInk(t, { n: 190, dots: 40, len: 44, angle: .16, speed: 900 }); X.restore();
  S4_bleed(t, .4, 'rt');
  S4_rows(t, 9, [
    { a: 0, b: 2, m: 'ink', size: 170, x: 100, y: 330 },
    { a: 3, b: 5, m: 'ink', size: 170, x: 200, y: 520 },
  ]);
}
// V3: the dream, eyes closed, blooms of colour on the beat
const S4_V3F = [1260, 480], S4_V3R = 250;
function S4_v3Painting() {
  skSilk(0);
  skWash(() => X.ellipse(1260, 500, 600, 480, 0, 0, TAU), S4_P.indigo, { a: .16, edge: .4, feather: .6, seed: 91, scale: 4, color2: S4_P.rose, mix: .5 });
  skFacePortrait(S4_V3F[0], S4_V3F[1], S4_V3R, 0, { turn: 0, eyes: 'closed', seed: 9 });
}
const S4_V3B = [[1640, 200, 120, 'rose'], [860, 760, 140, 'indigo'], [1690, 780, 110, 'celadon'], [900, 190, 100, 'ochre'], [1760, 470, 90, 'rose'], [760, 470, 90, 'celadon']];
function S4_v3(t) {
  const lt = t - S4_CUTS.v3, Z = 1 + lt * .014, F = [1000, 520 - lt * 4];
  S4_place(S4_render('v3', 1, [1000, 520], S4_v3Painting), 1, [1000, 520], Z, F, [0, 0]);
  S4_inCam(Z, F, [0, 0], () => S4_V3B.forEach(([x, y, r, c], i) => skBloom(x, y, r, S4_P[c], t, S4_CUTS.v3 + .15 + i * BEAT, { seed: 90 + i, dur: 1.8, color2: i % 2 ? S4_P.rose : undefined, mix: .4 })));
  S4_bleed(t, .45, 'rb');
  S4_rows(t, 10, [
    { a: 0, b: 2, m: 'ink', size: 170, x: 90, y: 300 },
    { a: 3, b: 7, m: 'ink', size: 54, x: 110, y: 400 },
  ]);
}
// V4: the song on a stave, struck through
function S4_v4Painting() {
  skSilk(0);
  skWash(() => X.rect(60, 120, W - 120, 700), S4_P.ochre, { a: .12, edge: .5, feather: .5, seed: 101, scale: 4, color2: S4_P.rose, mix: .3 });
  for (let s = 0; s < 2; s++) {
    const y0 = 260 + s * 260, lines = [];
    for (let i = 0; i < 5; i++) { const y = y0 + i * 18; lines.push([[120, y + sjit(s * 9 + i, 2), .5], [700, y + sjit(s * 7 + i + 3, 2)], [1300, y + sjit(i * 5 + s, 2)], [1800, y + sjit(i + s * 11, 2), .4]]); }
    skInk(lines, { w: 2.2, alpha: .5, dry: .5, seed: 102 + s, color: S4_P.inkLt });
    // notes: ink heads and stems
    const heads = [];
    for (let n = 0; n < 11; n++) { const x = 240 + n * 140 + sjit(n + s * 20, 20), y = y0 + 72 - Math.round(hash(n * 3.1 + s) * 8) * 9; heads.push([x, y]); }
    skWash(() => heads.forEach(([x, y]) => { X.moveTo(x + 12, y); X.ellipse(x, y, 12, 9, -.35, 0, TAU); }), S4_P.ink, { a: .7, edge: .6, seed: 104 + s, feather: .1 });
    skInk(heads.map(([x, y]) => [[x + 11, y - 2, .8], [x + 12, y - 70, .4]]), { w: 2.4, alpha: .7, dry: .3, seed: 106 + s });
  }
}
function S4_v4(t) {
  const lt = t - S4_CUTS.v4, Z = 1 + lt * .01, F = [960 - lt * 6, 540];
  S4_place(S4_render('v4', 1, [960, 540], S4_v4Painting), 1, [960, 540], Z, F, [0, 0]);
  S4_inCam(Z, F, [0, 0], () => {
    S4_rows(t, 11, [
      { a: 0, b: 5, m: 'ink', size: 60, x: 140, y: 238 },
      { a: 6, b: 9, m: 'ink', size: 60, x: 140, y: 498 },
      { a: 10, b: 12, m: 'ink', size: 180, x: 120, y: 900 },
      { a: 13, b: 13, m: 'ink', size: 60, x: 1480, y: 900, color: S4_P.inkLt },
    ]);
    // the full stop: an ink blot that lands on "chấm" and blooms
    const tc = S4_lt(11, 11);
    if (t >= tc) { skBloom(1400, 870, 46, S4_P.ink, t, tc, { seed: 110, dur: .9, a: .7, edge: 1.1, core: false }); }
  });
  // struck through: a neon tube slashing across the song on "hết"
  const th = S4_lt(11, 12);
  if (t >= th - .02) {
    const k = expoOut((t - th + .02) / .22);
    X.save(); S4_inCam(Z, F, [0, 0], () => {
      skNeon(() => { X.moveTo(110, 250); X.lineTo(lerp(110, 1800, k), lerp(250, 520, k)); }, S4_P.neonPink, { w: 7, seed: 111, t, flicker: .1 });
      if (k > .5) skNeon(() => { X.moveTo(1800, 230); X.lineTo(lerp(1800, 140, (k - .5) * 2), lerp(230, 540, (k - .5) * 2)); }, S4_P.neonPink, { w: 5, seed: 112, t, flicker: .15 });
    }); X.restore();
  }
  S4_bleed(t, .35 + .25 * clamp((t - th) / 1), 'rl');
}
// V5: the road to the vanishing point, where the neon world waits
const S4_VP = [1180, 520];
function S4_v5Painting() {
  skSilk(0);
  skWash(() => X.rect(-60, -60, W + 120, 600), S4_P.indigo, { a: .3, grad: [0, -60, 0, 560], gradTo: .1, seed: 121, scale: 3 });
  skWash(() => { const pts = [[-60, 560]]; for (let x = -60; x <= W + 60; x += 40) pts.push([x, 520 - 50 * (noise1(x / 230 + 5) + 1) * (Math.abs(x - S4_VP[0]) > 160 ? 1 : .2)]); pts.push([W + 60, 560]); pathSmooth(pts); }, S4_P.ink, { a: .2, edge: .6, seed: 122, scale: 2, color2: S4_P.celadon, mix: .35 });
  // the road: two ink edges converging, a sienna wash between
  skWash(() => { X.moveTo(S4_VP[0] - 12, S4_VP[1]); X.lineTo(S4_VP[0] + 12, S4_VP[1]); X.lineTo(1900, 1100); X.lineTo(250, 1100); X.closePath(); }, S4_P.sienna, { a: .2, grad: [0, 1100, 0, 520], gradTo: .15, seed: 123, scale: 3, color2: S4_P.ochre, mix: .4 });
  skInk([[[250, 1100, 1], [700, 830], [S4_VP[0] - 12, S4_VP[1], .2]], [[1900, 1100, 1], [1560, 830], [S4_VP[0] + 12, S4_VP[1], .2]]], { w: 10, dry: .45, seed: 124, tail: .6 });
  // lamps along it, smaller with distance
  for (let i = 0; i < 5; i++) {
    const u = Math.pow(.62, i), side = i % 2 ? 1 : -1, bx = S4_VP[0] + side * (820 * u + 20), by = S4_VP[1] + 560 * u, hgt = 520 * u;
    skInk([[[bx, by, 1], [bx, by - hgt, .5]]], { w: Math.max(2, 8 * u), seed: 125 + i, dry: .3 });
    skWash(() => X.ellipse(bx, by - hgt, 90 * u + 8, 90 * u + 8, 0, 0, TAU), S4_P.ochre, { a: .35, feather: .7, seed: 130 + i, op: 'source-over', alpha: .6 });
  }
}
function S4_v5(t) {
  const lt = t - S4_CUTS.v5, T1 = S4_T1 - S4_CUTS.v5;
  // the camera walks down the road: slow, then faster from "Cho em bình yên"
  const walk = lt * .02 + easeIn(clamp((t - 123.1) / 2.2)) * .35, Z = 1 + walk, F = [lerp(1000, S4_VP[0], clamp(walk * 3)), lerp(560, S4_VP[1], clamp(walk * 3))];
  S4_place(S4_render('v5', 1, [1000, 560], S4_v5Painting), 1, [1000, 560], Z, F, [0, 0]);
  // the neon world glowing at the end of the road, growing; from bar 49 it floods through the silk
  const sx = S4_sx(Z, F, S4_VP[0]), sy = S4_sy(Z, F, S4_VP[1]), fl = easeIn(clamp((t - beatT(Math.round(beatF(124.11)))) / 1.2));
  const gl = .35 + .25 * clamp(lt / 3) + KICK(t) * .15;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  if (fl > 0) { X.globalCompositeOperation = 'multiply'; X.fillStyle = `rgba(${Math.round(255 - 205 * fl)},${Math.round(255 - 215 * fl)},${Math.round(255 - 180 * fl)},1)`; X.fillRect(0, 0, W, H); }
  X.globalCompositeOperation = 'lighter';
  for (const [c, r, a] of [[S4_P.neonPink, 300 + fl * 900, .55], [S4_P.neonCyan, 140 + fl * 500, .45]]) {
    const g = X.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, skRgba(c, a * gl * (1 + fl))); g.addColorStop(.4, skRgba(c, a * .35 * gl * (1 + fl))); g.addColorStop(1, skRgba(c, 0));
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  }
  X.restore();
  // tubes creep in from the frame edges toward the end
  S4_edgeTube(t, clamp((t - 122.36) / 2.5), [[W - 40, H + 20], [W - 40, 60], [W * .6, 60]], S4_P.neonPink, 131);
  S4_edgeTube(t, clamp((t - 123.1) / 2.2), [[40, -20], [40, H - 60], [W * .45, H - 60]], S4_P.neonCyan, 132);
  S4_bleed(t, .3 + .5 * clamp((t - 121.5) / 3.8), 'rlb');
  // L12 "Cuối con đường / anh xin một | ĐIỀU ƯỚC" and L13 "Cho em | BÌNH YÊN | vững bước chân"
  const inkC = fl > .4 ? S4_P.neonWhite : S4_P.ink;
  S4_rows(t, 12, [
    { a: 0, b: 2, m: 'ink', size: 56, x: 110, y: 180 },
    { a: 3, b: 5, m: 'ink', size: 56, x: 110, y: 255 },
    { a: 6, b: 7, m: 'ink', size: 170, x: 90, y: 430 },
  ], S4_L[13] ? S4_L[13][0] - .05 : 1e9);
  // the wish: a little ochre spark over "ước"
  const tw = S4_lt(12, 7);
  if (t >= tw && t < S4_lt(13, 0)) { const k = expoOut((t - tw) / .3); X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter'; skNeon(() => sparkPath(700, 300, 30 * k, 4, .25, t * .8, .5), S4_P.neonAmber, { w: 3, seed: 133, t, halo: .8 }); X.restore(); }
  S4_rows(t, 13, [
    { a: 0, b: 1, m: 'ink', size: 56, x: 110, y: 180 },
    { a: 2, b: 3, m: 'ink', size: 180, x: 90, y: 400 },
    { a: 4, b: 6, m: 'ink', size: 56, x: 110, y: 490 },
  ]);
}
S4_CUTS.v2 = S4_cut(110.13); S4_CUTS.v3 = S4_cut(112.33); S4_CUTS.v4 = S4_cut(115.23); S4_CUTS.v5 = S4_cut(120.03);

// ---------- shots ----------
{
  const C = S4_CUTS;
  shot(S4_T0, C.p1, t => S4_rap(t), { seed: 401, dark: true });
  shot(C.p1, C.p2, t => S4_rap(t), { seed: 402, dark: true });
  shot(C.p2, C.p3, t => S4_rap(t), { seed: 403, dark: true });
  shot(C.p3, C.p4, t => S4_rap(t), { seed: 404, dark: true });
  shot(C.p4, C.p5, t => S4_rap(t), { seed: 405, dark: true });
  shot(C.p5, C.p6, t => S4_rap(t), { seed: 406, dark: true });
  shot(C.p6, C.p7, t => S4_rap(t), { seed: 407, dark: true });
  shot(C.p7, C.v1, t => S4_rap(t), { seed: 408, dark: true });
  // watercolour blooms out of the split into the portrait
  shot(C.v1, C.v2, t => { const k = (t - C.v1) / .8; if (k < 1) skDissolve(k, 11, () => S4_rap(t), () => S4_v1(t), { n: 26, rim: S4_P.indigo }); else S4_v1(t); }, { seed: 409 });
  shot(C.v2, C.v3, t => { const k = (t - C.v2) / .6; if (k < 1) skDissolve(k, 12, () => S4_v1(t), () => S4_v2(t), { n: 22 }); else S4_v2(t); }, { seed: 410 });
  shot(C.v3, C.v4, t => S4_v3(t), { seed: 411 });
  shot(C.v4, C.v5, t => { const k = (t - C.v4) / .6; if (k < 1) skDissolve(k, 13, () => S4_v3(t), () => S4_v4(t), { n: 20, rim: S4_P.rose }); else S4_v4(t); }, { seed: 412 });
  shot(C.v5, S4_T1, t => S4_v5(t), { seed: 413 });
}

// dev: time full frames of this section (node tools/render.mjs --job=job003 --test=s4perf --scale=1 --dir=S4)
window.TESTS = window.TESTS || {};
TESTS.s4perf = () => {
  const out = [], flush = () => X.getImageData(0, 0, 1, 1), keep = window.TEST; window.TEST = null;
  for (const t0 of [86.5, 87.2, 89.0, 91.0, 92.3, 94.5, 97.0, 99.5, 101.5, 104.5, 105.7, 106.5, 108.8, 110.0, 111.2, 113.5, 115.1, 117.0, 119.0, 121.0, 124.5]) {
    const ms = []; for (let i = 0; i < 3; i++) { const a = performance.now(); drawFrame(t0 + i / 30); flush(); ms.push(Math.round(performance.now() - a)); }
    out.push(t0 + ': ' + ms.join('/'));
  }
  window.TEST = keep; console.error('S4 ms · ' + out.join(' · '));
};
