// silk.js: the "Lụa & Neon" material library for job003 (Khuôn Mặt Đáng Thương).
//
// Two media that fight each other:
//   LỤA  (tranh lụa, Vietnamese silk painting): raw silk with a visible plain weave, watercolour washes that pool pigment at
//        their edges and granulate, wet-in-wet blooms, tear bleeds that run down the silk, ink brush lines with pressure and
//        dry-brush breaks, Vietnamese brush calligraphy written on.
//   NEON: tubes with white-hot cores and coloured halos on a wet black street, with rippled puddle reflections and rain.
// plus the transitions between them (silk tears, watercolour dissolve, neon drips) and the recurring motifs (the idol's
// face in both media, a porcelain mask that cracks, a silk-painted lotus that sheds petals into water).
//
// Every texture is built once, lazily, from hash/rng (deterministic). Every call is a pure function of its arguments.
// Path arguments (pathFn) are builders like `() => X.ellipse(...)`, in the current user space. Inside a pathFn a
// beginPath() is ignored, so one pathFn may call pathSmooth()/pathPoly() several times to make several sub-shapes.
//
//   SK_PAL                                         palette (DIRECTION.md + a few working shades)
// ---- silk ----
//   skSilk(t, o)                                   full-frame raw silk. o: {tint, tintA, backlight 0..1, behind: fn (the scene behind the
//                                                  silk, drawn in world space) | lights: [[x, y, r, colour], ...], dim (0..1 room light when backlit)}
//   skWash(pathFn, colour, o)                      watercolour wash (multiply). o: {a density .5, edge .55 (pigment pooling), rough .35 (edge wobble),
//                                                  feather .12 (0 hard/dry .. 1 wet-in-wet), wick .12 (feathering along the weave), gran .45 (granulation),
//                                                  mottle .35, color2, mix 0..1 (second pigment, wet-in-wet), grad:[x0,y0,x1,y1] + gradTo (graded wash),
//                                                  blur 5, spread 14 (user px), scale 1 (noise size), seed, alpha, op, res}
//   skBloom(x, y, r, colour, t, t0, o)             wet-in-wet cauliflower bloom spreading from t0. o: {dur 1.6, seed, a, edge, lobes}
//   skBleed(x, y, colour, t, t0, o)                a painted tear: a drop that runs down the silk and spreads. o: {len 150, w 12, dur 2.2, k (0..1 overrides time), seed, a}
//   skInk(pathFn | points | [points...], o)        ink brush line. points [[x, y, pressure?], ...]. o: {w 8, k write-on 0..1, dry .3, dryTail .45,
//                                                  attack, tail .35, tip .12, fade .35 (ink runs out), color, alpha .92, bleed 1, seed, smooth}
//   skBrushText(str, x, y, o)                      ink calligraphy. o: {size 96, font (FONT.vnI), align, tracking, k write-on 0..1, color, alpha, dry .45, bleed 1} → {x0, w}
//   skSeal(x, y, s, str, o)                        a small cinnabar artist's seal
// ---- neon ----
//   skNight(t, o)                                  wet black street. o: {horizon (y, default 560), lights: [{x, y, r, color, a, gy}], bokeh (count), haze}
//   skNeon(pathFn, colour, o)                      neon tube. o: {w 7, on 0..1, flicker 0..1, seed, halo 1, core, reflect: y | {y, a, stretch, fade}, ground:'dark'|'light'}
//   skNeonText(str, x, y, o)                       neon lettering. o: {size 120, font (FONT.vnSansB), align, tracking, color, w, on (number | array per letter),
//                                                  flicker, broken (index of a letter that sputters), reflect, seed, ground} → {x0, w}
//   skReflect(drawFn, y, o)                        draw anything mirrored in the wet ground below y. o: {a .55, stretch 1.15, fade 320, ripple 1, t}
// ---- transitions (pure functions of k and seed; masks at reduced resolution) ----
//   skTear(k, seed, drawUnder, drawOver, o)        silk tears along a ragged fibrous line. o: {rect, pos .5, rim (light colour behind), fray 1}
//   skDissolve(k, seed, drawA, drawB, o)           B blooms through A. o: {rect, n 16, rim colour, rimA}
//   skDrip(k, seed, drawA, drawB, o)               colour drips down to reveal B. o: {rect, n 22, color, glow (neon drips)}
// ---- motifs ----
//   skFacePortrait(x, y, R, t, o)                  the sunflower idol as a silk painting. o: {tears 0..1, eyes:'open'|'down'|'closed', look, mouth, turn}
//   skFaceNeon(x, y, R, t, o)                      the same face in neon tubes. o: {tearT: [times], on, flicker, reflect, eyes, colors:{line, petal, eye}}
//   skMask(x, y, R, o)                             porcelain mask. o: {crack 0..1, at:[x,y] (unit coords), glow (colour through the cracks), seed, tear}
//   skFlower(x, y, s, t, o)                        silk-painted lotus. o: {shed n, shedT:[times] | shedAt + shedGap, water (y), fall 3.2, seed, leaf}
//   skRipple(x, y, t, t0, o)                       water rings. o: {r 70, n 3, flat .3, dur 2.6, neon colour, color, w}
//   skRainInk(t, o) / skRainNeon(t, o)             rain. o: {rect, n, angle, speed, len, dots (ink), lights (neon), ground (neon splashes)}
// ---- finish ----
//   skFinish(t, sh)                                frame finish (JOB.finish): soft bloom, vignette, grain. sh.bloom / sh.vig override.

const SK_PAL = {
  silk: '#EDE3CF', silkHi: '#F7F1E4', silkDk: '#D8C9AC', ink: '#2B2A33', inkLt: '#5E5A66',
  indigo: '#4B5E86', rose: '#C9727B', celadon: '#9DB8A2', ochre: '#C9A15B',
  sienna: '#A9623F', skin: '#EFCFB4', cinnabar: '#B23A2C', cobalt: '#2C4A93',
  neonPink: '#FF3EA5', neonCyan: '#35E0FF', neonAmber: '#FFB547', neonWhite: '#EEF4FF',
  night: '#0B0D14', nightHi: '#18203A', glaze: '#F6F5F0',
};

// ---------- small helpers ----------
const SK_TEX = {};
const skHex = h => { if (Array.isArray(h)) return h; h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
function skMix(a, b, k, alpha = 1) {
  const A = skHex(a), B = skHex(b);
  return `rgba(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))},${alpha})`;
}
const skRgba = (c, a) => { const C = skHex(c); return `rgba(${C[0]},${C[1]},${C[2]},${a})`; };
const skSS = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
// Periodic value noise (period P lattice cells).
function skPN(x, y, P, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash2(((a % P) + P) % P + s * 31.7, ((b % P) + P) % P + s * 7.3);
  return lerp(lerp(h(i, j), h(i + 1, j), ux), lerp(h(i, j + 1), h(i + 1, j + 1), ux), uy) * 2 - 1;
}
// A 256² periodic fbm tile (0..1) and a granulation tile, sampled with skNS / skNG in the hot loops.
function skNoiseTile() {
  if (SK_TEX.nt) return SK_TEX.nt;
  const S = 256, a = new Float32Array(S * S), g = new Float32Array(S * S), r = rng(29);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = skPN(x / 32, y / 32, 8, 1) * .5 + skPN(x / 16, y / 16, 16, 2) * .27 + skPN(x / 8, y / 8, 32, 3) * .15 + skPN(x / 4, y / 4, 64, 4) * .08;
    a[y * S + x] = clamp(.5 + n * .62);
    const gn = skPN(x / 2, y / 2, 128, 5) * .55 + skPN(x / 5.12, y / 5.12, 50, 6) * .25 + (r() - .5) * .5;
    g[y * S + x] = clamp(.5 + gn * .6);
  }
  return (SK_TEX.nt = { a, g });
}
function skNS(A, x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, i0 = i & 255, j0 = j & 255, i1 = (i + 1) & 255, j1 = (j + 1) & 255;
  const a = A[j0 * 256 + i0], b = A[j0 * 256 + i1], c = A[j1 * 256 + i0], d = A[j1 * 256 + i1];
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

// ---------- paths: record a path builder as polylines (current user space) ----------
function skFlatten(pathFn) {
  const lines = [], stack = []; let cur = null, cm = new DOMMatrix(), lx = 0, ly = 0, fx0 = 0, fy0 = 0;
  const m0 = X.getTransform(), sc0 = Math.sqrt(Math.abs(m0.a * m0.d - m0.b * m0.c)) || 1;
  const P = (x, y) => [cm.a * x + cm.c * y + cm.e, cm.b * x + cm.d * y + cm.f];
  const start = (x, y) => { cur = [P(x, y)]; cur.closed = false; lines.push(cur); lx = fx0 = x; ly = fy0 = y; };
  const to = (x, y) => { if (!cur) return start(x, y); cur.push(P(x, y)); lx = x; ly = y; };
  const arcPts = (x, y, rx, ry, rot, a0, a1, ccw) => {
    let sw = a1 - a0;
    if (!ccw) { if (sw < 0) sw = sw % TAU + TAU; if (a1 - a0 >= TAU) sw = TAU; } else { if (sw > 0) sw = sw % TAU - TAU; if (a0 - a1 >= TAU) sw = -TAU; }
    const sc = sc0 * Math.sqrt(Math.abs(cm.a * cm.d - cm.b * cm.c)), n = clamp(Math.ceil(Math.abs(sw) * Math.max(rx, ry) * sc / 5), 6, 256);
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= n; i++) {
      const a = a0 + sw * i / n, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry, px = x + ex * cr - ey * sr, py = y + ex * sr + ey * cr;
      if (i === 0 && !cur) start(px, py); else to(px, py);
    }
  };
  const rec = {
    beginPath() {}, moveTo: start, lineTo: to,
    closePath() { if (cur) { cur.closed = true; cur = null; lx = fx0; ly = fy0; } },
    quadraticCurveTo(cx, cy, x, y) { const x0 = lx, y0 = ly; for (let i = 1; i <= 10; i++) { const u = i / 10, v = 1 - u; to(v * v * x0 + 2 * u * v * cx + u * u * x, v * v * y0 + 2 * u * v * cy + u * u * y); } },
    bezierCurveTo(a, b, c, d, x, y) { const x0 = lx, y0 = ly; for (let i = 1; i <= 14; i++) { const u = i / 14, v = 1 - u; to(v * v * v * x0 + 3 * v * v * u * a + 3 * v * u * u * c + u * u * u * x, v * v * v * y0 + 3 * v * v * u * b + 3 * v * u * u * d + u * u * u * y); } },
    arc(x, y, r, a0, a1, ccw) { arcPts(x, y, r, r, 0, a0, a1, ccw); },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) { arcPts(x, y, rx, ry, rot, a0, a1, ccw); },
    arcTo(x1, y1) { to(x1, y1); },
    rect(x, y, w, h) { start(x, y); to(x + w, y); to(x + w, y + h); to(x, y + h); cur.closed = true; cur = null; },
    roundRect(x, y, w, h, r) {
      r = Math.min(Array.isArray(r) ? r[0] : (r || 0), Math.abs(w) / 2, Math.abs(h) / 2);
      if (!r) return this.rect(x, y, w, h);
      cur = null; arcPts(x + w - r, y + r, r, r, 0, -Math.PI / 2, 0); arcPts(x + w - r, y + h - r, r, r, 0, 0, Math.PI / 2);
      arcPts(x + r, y + h - r, r, r, 0, Math.PI / 2, Math.PI); arcPts(x + r, y + r, r, r, 0, Math.PI, Math.PI * 1.5); if (cur) { cur.closed = true; cur = null; }
    },
    save() { stack.push(cm); }, restore() { cm = stack.pop() || cm; }, translate(x, y) { cm = cm.translate(x, y); },
    rotate(a) { cm = cm.rotate(a * 180 / Math.PI); }, scale(a, b) { cm = cm.scale(a, b ?? a); }, getTransform() { return m0.multiply(cm); },
    transform(a, b, c, d, e, f) { cm = cm.multiply(new DOMMatrix([a, b, c, d, e, f])); },
  };
  const real = X, px = new Proxy(rec, { get: (t, k) => k in t ? t[k] : (typeof real[k] === 'function' ? () => {} : real[k]), set: () => true });
  X = px; try { pathFn(); } finally { X = real; }
  return lines;
}
function skReplay(lines, ctx = X) { for (const L of lines) { ctx.moveTo(L[0][0], L[0][1]); for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]); if (L.closed) ctx.closePath(); } }
function skClampBox(x0, y0, x1, y1) {
  const cw = Math.round(W * SX), ch = Math.round(H * SX);
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(cw, Math.ceil(x1)); y1 = Math.min(ch, Math.ceil(y1));
  return x1 > x0 && y1 > y0 ? [x0, y0, x1 - x0, y1 - y0] : null;
}
// Device box of polylines (user space) under matrix m, padded (device px).
function skBox(lines, m = X.getTransform(), pad = 4) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const L of lines) for (const p of L) { const dx = m.a * p[0] + m.c * p[1] + m.e, dy = m.b * p[0] + m.d * p[1] + m.f; if (dx < x0) x0 = dx; if (dx > x1) x1 = dx; if (dy < y0) y0 = dy; if (dy > y1) y1 = dy; }
  return x0 > x1 ? null : skClampBox(x0 - pad, y0 - pad, x1 + pad, y1 + pad);
}
const skScale = (m = X.getTransform()) => Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;

// ---------- layers ----------
// Named scratch canvases. skLay(name, res): a canvas the size of the frame × res (not cleared). rf: willReadFrequently.
const SK_LAY = {};
function skLay(name, res = 1, rf = false) {
  const w = Math.max(1, Math.round(W * SX * res)), h = Math.max(1, Math.round(H * SX * res)); let c = SK_LAY[name];
  if (!c || c.width !== w || c.height !== h) { c = SK_LAY[name] = mkCanvas(w, h); c.x = c.getContext('2d', rf ? { willReadFrequently: true } : undefined); c.res = res; }
  const x = c.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.shadowColor = 'transparent';
  return c;
}
// Run fn with X on a layer (transform m, scaled by the layer's res). The layer region `box` (device px, or all) is cleared first.
function skOn(c, m, box, fn) {
  const r = c.res, prev = X;
  if (box) c.x.clearRect(Math.floor(box[0] * r) - 1, Math.floor(box[1] * r) - 1, Math.ceil(box[2] * r) + 3, Math.ceil(box[3] * r) + 3); else c.x.clearRect(0, 0, c.width, c.height);
  X = c.x; X.save(); X.setTransform(r, 0, 0, r, 0, 0); if (m) X.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  try { fn(); } finally { X.restore(); X = prev; }
  return c;
}
// Scratch canvases sized to the job (bucketed, LRU-cached, cleared on request). Canvas filters (blur) cost as much as the
// canvas they draw into, so every filtered step runs on a scratch canvas no bigger than the shape.
const SK_SCR = new Map();
function skScr(name, w, h, rf = false) {
  const q = v => v <= 512 ? Math.max(64, Math.ceil(v / 64) * 64) : Math.ceil(v / 256) * 256;
  const bw = q(w), bh = q(h), key = name + ':' + bw + 'x' + bh;
  let c = SK_SCR.get(key);
  if (c) SK_SCR.delete(key); else { c = mkCanvas(bw, bh); c.x = c.getContext('2d', rf ? { willReadFrequently: true } : undefined); }
  SK_SCR.set(key, c); if (SK_SCR.size > 40) SK_SCR.delete(SK_SCR.keys().next().value);
  const x = c.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.shadowColor = 'transparent';
  x.clearRect(0, 0, Math.min(bw, Math.ceil(w) + 2), Math.min(bh, Math.ceil(h) + 2));
  return c;
}
// Blit a region of a (possibly reduced-resolution) layer back at device scale; a filter runs on a scratch copy of the region.
function skBlit(c, box, alpha = 1, op = 'source-over', filter) {
  const r = c.res ?? 1, b = box || [0, 0, W * SX, H * SX], pad = filter ? Math.ceil(3 * parseFloat((filter.match(/blur\(([\d.]+)px\)/) || [0, 0])[1]) + 2) : 0;
  const sx = Math.max(0, Math.floor(b[0] * r) - pad), sy = Math.max(0, Math.floor(b[1] * r) - pad), sw = Math.min(c.width - sx, Math.ceil(b[2] * r) + 1 + pad * 2), sh = Math.min(c.height - sy, Math.ceil(b[3] * r) + 1 + pad * 2);
  if (sw <= 0 || sh <= 0) return;
  let src = c, ox = sx, oy = sy;
  let fw = sw, fh = sh;
  if (filter) {   // blurs run at half resolution on a scratch copy (a blur hides the difference, and costs a quarter)
    const bpx = parseFloat((filter.match(/blur\(([\d.]+)px\)/) || [0, 0])[1]), hr = bpx >= 1.5 ? .5 : 1;
    fw = Math.ceil(sw * hr); fh = Math.ceil(sh * hr);
    const F = skScr('_skF', fw, fh); F.x.filter = hr < 1 ? filter.replace(/blur\(([\d.]+)px\)/, (_, v) => `blur(${v * hr}px)`) : filter; F.x.drawImage(c, sx, sy, sw, sh, 0, 0, fw, fh); F.x.filter = 'none'; src = F; ox = 0; oy = 0;
  }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = alpha; X.globalCompositeOperation = op;
  X.drawImage(src, ox, oy, fw, fh, sx / r, sy / r, sw / r, sh / r); X.restore();
}

// =====================================================================================================================
// SILK
// =====================================================================================================================
// Plain weave, 3 px pitch, 240 px periodic tile. Two maps: shade (grey, for multiply) and transmission (for backlight).
function skWeave() {
  if (SK_TEX.weave) return SK_TEX.weave;
  const S = 240, P = 3, N = S / P, r = rng(71);
  const th = () => { const o = [], t = [], b = []; for (let i = 0; i < N; i++) { o.push((r() - .5) * .55); t.push(.6 + r() * .28 + (r() < .07 ? .3 : 0)); b.push((r() - .5) * .12); } return { o, t, b }; };
  const wa = th(), we = th();
  const sh = mkCanvas(S, S), sx = sh.getContext('2d'), si = sx.createImageData(S, S), sd = si.data;
  const tr = mkCanvas(S, S), tx = tr.getContext('2d'), ti = tx.createImageData(S, S), td = ti.data;
  const hi = mkCanvas(S, S), hx = hi.getContext('2d'), hid = hx.createImageData(S, S), hd = hid.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const ix = Math.floor(x / P), jy = Math.floor(y / P);
    // slubs: each thread swells and thins along its length
    const slW = skPN(y / 12, ix * 3.1, S / 12, 7) * .22, slF = skPN(x / 15, jy * 2.3, S / 15, 8) * .26;
    const cw = ix * P + P / 2 + wa.o[ix] + skPN(y / 30, ix * 1.7, S / 30, 9) * .35, hw = wa.t[ix] * P / 2 * (1 + slW);
    const cf = jy * P + P / 2 + we.o[jy] + skPN(x / 30, jy * 1.3, S / 30, 10) * .35, hf = we.t[jy] * P / 2 * (1 + slF);
    const dw = x + .5 - cw, df = y + .5 - cf;
    const covW = clamp((hw - Math.abs(dw)) / .8 + .5), covF = clamp((hf - Math.abs(df)) / .8 + .5);
    const pw = Math.sqrt(Math.max(0, 1 - (dw / hw) * (dw / hw))), pf = Math.sqrt(Math.max(0, 1 - (df / hf) * (df / hf)));
    const lw = .8 + .2 * pw + wa.b[ix], lf = .8 + .2 * pf + we.b[jy], gap = .5;
    const over = (ix + jy) % 2 === 0;
    const v = over ? covW * lw + (1 - covW) * (covF * lf * .92 + (1 - covF) * gap) : covF * lf + (1 - covF) * (covW * lw * .92 + (1 - covW) * gap);
    const i = (y * S + x) * 4, g = Math.round(clamp(v) * 255);
    sd[i] = g; sd[i + 1] = g; sd[i + 2] = Math.round(g * .985); sd[i + 3] = 255;
    const open = (1 - covW) * (1 - covF), T = clamp(.42 + .58 * open + (over ? covW * (1 - pw) : covF * (1 - pf)) * .15);
    const tg = Math.round(T * 255); td[i] = tg; td[i + 1] = tg; td[i + 2] = tg; td[i + 3] = 255;
    // lustre: the crown of whichever thread is on top catches the light
    const lu = over ? covW * Math.pow(pw, 6) : covF * Math.pow(pf, 6);
    hd[i] = 255; hd[i + 1] = 252; hd[i + 2] = 244; hd[i + 3] = Math.round(lu * 255);
  }
  sx.putImageData(si, 0, 0); tx.putImageData(ti, 0, 0); hx.putImageData(hid, 0, 0);
  return (SK_TEX.weave = { shade: sh, trans: tr, lustre: hi, S });
}
// A pattern of a world-space tile, drawn with the identity device transform (scaled to SX, anchored at device (ox, oy)).
function skDevPat(key, canvas, scale = 1, ox = 0, oy = 0) {
  const k = '_p_' + key; if (!SK_TEX[k]) SK_TEX[k] = X.createPattern(canvas, 'repeat');
  const p = SK_TEX[k]; p.setTransform(new DOMMatrix().translate(ox, oy).scale(SX * scale)); return p;
}
// The silk ground (static, baked per output scale): uneven dye, weft bars, age at the edges, foxing, the weave.
function skSilkBake() {
  const key = 'silk_' + SX; if (SK_TEX[key]) return SK_TEX[key];
  const w = 960, h = 540, c0 = mkCanvas(w, h), x0 = c0.getContext('2d'), id = x0.createImageData(w, h), d = id.data, r = rng(11);
  const lt = [247, 240, 225], mid = skHex(SK_PAL.silk), dk = [222, 205, 172], age = [196, 164, 112];
  for (let y = 0; y < h; y++) {
    const Y = y * 2, bars = noise1(Y / 7 + 3) * .3 + noise1(Y / 31 + 11) * .45 + noise1(Y / 3.1 + 5) * .12;
    for (let x = 0; x < w; x++) {
      const XX = x * 2;
      const dye = noise2(XX / 460 + 5, Y / 460) * .5 + noise2(XX / 150, Y / 150 + 3) * .3 + noise2(XX / 45 + 9, Y / 60) * .2;
      const warp = noise1(XX / 9 + 7) * .5 + noise1(XX / 41 + 2) * .5;
      const v = dye * .6 + bars * .28 + warp * .12;
      const ex = Math.abs(XX - 960) / 960, ey = Math.abs(Y - 540) / 540, e = Math.pow(Math.max(ex * .92, ey), 5) * .6 + Math.pow(Math.hypot(ex, ey) / 1.414, 3) * .25;
      const k = clamp(.55 + v * .75), C = k > .5 ? [lerp(mid[0], lt[0], (k - .5) * 2), lerp(mid[1], lt[1], (k - .5) * 2), lerp(mid[2], lt[2], (k - .5) * 2)] : [lerp(dk[0], mid[0], k * 2), lerp(dk[1], mid[1], k * 2), lerp(dk[2], mid[2], k * 2)];
      const n = (r() - .5) * 3, i = (y * w + x) * 4;
      d[i] = lerp(C[0], age[0], e) + n; d[i + 1] = lerp(C[1], age[1], e) + n; d[i + 2] = lerp(C[2], age[2], e) + n; d[i + 3] = 255;
    }
  }
  x0.putImageData(id, 0, 0);
  const c = mkCanvas(Math.round(W * SX), Math.round(H * SX)), g = c.getContext('2d');
  g.imageSmoothingQuality = 'high'; g.drawImage(c0, 0, 0, c.width, c.height);
  g.setTransform(SX, 0, 0, SX, 0, 0);
  // tide marks: faint rings where the silk was once wet
  const r2 = rng(5);
  g.filter = `blur(${2.5 * SX}px)`;
  for (let i = 0; i < 5; i++) {
    const cx = r2() * W, cy = r2() * H, R = 120 + r2() * 260; g.strokeStyle = `rgba(150,112,62,${.05 + r2() * .05})`; g.lineWidth = 5 + r2() * 6;
    g.beginPath(); for (let k = 0; k <= 60; k++) { const a = k / 60 * TAU, rr = R * (1 + noise1(a * 2 + i * 9) * .18); k ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8); } g.stroke();
  }
  g.filter = 'none';
  // foxing: clusters of small rust-brown spots, soft, some with a darker core
  for (let i = 0; i < 90; i++) {
    const cx = r2() * W, cy = r2() * H, n = 1 + Math.floor(Math.pow(r2(), 2) * 7), edge = Math.max(Math.abs(cx - W / 2) / (W / 2), Math.abs(cy - H / 2) / (H / 2));
    for (let k = 0; k < n; k++) {
      const x = cx + (r2() - .5) * 26, y = cy + (r2() - .5) * 26, R = .8 + Math.pow(r2(), 3) * 7, a = (.08 + r2() * .22) * (.6 + edge * .6);
      const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(138,88,40,${a})`); gr.addColorStop(.55, `rgba(150,100,50,${a * .55})`); gr.addColorStop(1, 'rgba(160,110,60,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
    }
  }
  // the weave: thread relief (multiply), then lustre on the crowns (screen)
  const wv = skWeave();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const pat = g.createPattern(wv.shade, 'repeat'); pat.setTransform(new DOMMatrix().scale(SX));
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .34; g.fillStyle = pat; g.fillRect(0, 0, c.width, c.height);
  const lp = g.createPattern(wv.lustre, 'repeat'); lp.setTransform(new DOMMatrix().scale(SX));
  g.globalCompositeOperation = 'screen'; g.globalAlpha = .16; g.fillStyle = lp; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  return (SK_TEX[key] = c);
}
// Default lights behind the silk (the neon city bleeding through).
const SK_BACKLIGHTS = [[420, 380, 260, '#FF3EA5'], [1500, 330, 300, '#35E0FF'], [980, 760, 220, '#FFB547'], [1250, 600, 180, '#FF3EA5']];
function skSilk(t, o = {}) {
  // grounds are full-frame: they map the world onto whatever canvas X is (the frame or a reduced-resolution layer)
  const bake = skSilkBake(), cw = X.canvas.width, ch = X.canvas.height;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  X.drawImage(bake, 0, 0, cw, ch);
  if (o.tint) { X.globalCompositeOperation = 'multiply'; X.globalAlpha = o.tintA ?? .35; X.fillStyle = o.tint; X.fillRect(0, 0, cw, ch); }
  X.restore();
  const bk = clamp(o.backlight || 0);
  if (bk <= 0) return;
  // the room goes dark: the silk is lit from behind
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply';
  const dm = lerp(1, o.dim ?? .2, bk); X.fillStyle = `rgb(${Math.round(255 * dm)},${Math.round(252 * dm)},${Math.round(250 * dm)})`; X.fillRect(0, 0, cw, ch); X.restore();
  // what is behind, at half resolution, then diffused through the silk (1/8 resolution + blur)
  const Lm = skLay('_skBLm', .5), Ls = skLay('_skBLs', .125), Lf = skLay('_skBLf', 1);
  skOn(Lm, new DOMMatrix([SX, 0, 0, SX, 0, 0]), null, () => {
    if (o.behind) o.behind(t);
    else {
      X.fillStyle = '#000'; X.fillRect(0, 0, W, H); X.globalCompositeOperation = 'lighter';
      for (const [x, y, R, c] of (o.lights || SK_BACKLIGHTS)) { const g = X.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, skRgba(c, .95)); g.addColorStop(.35, skRgba(c, .45)); g.addColorStop(1, skRgba(c, 0)); X.fillStyle = g; X.fillRect(x - R, y - R, R * 2, R * 2); }
    }
  });
  Ls.x.clearRect(0, 0, Ls.width, Ls.height); Ls.x.filter = `blur(${Math.max(1, 4 * SX)}px) contrast(1.9) brightness(.9)`; Ls.x.drawImage(Lm, 0, 0, Ls.width, Ls.height); Ls.x.filter = 'none';
  const f = Lf.x, fw = Lf.width, fh = Lf.height; f.fillStyle = '#000'; f.fillRect(0, 0, fw, fh);
  f.globalCompositeOperation = 'lighter'; f.imageSmoothingQuality = 'high';
  f.globalAlpha = 1; f.drawImage(Ls, 0, 0, fw, fh); f.globalAlpha = .5; f.drawImage(Ls, 0, 0, fw, fh);
  const Lc = skScr('_skBLc', Lm.width, Lm.height); Lc.x.filter = `contrast(2) brightness(.85) blur(${Math.max(.5, .6 * SX)}px)`; Lc.x.drawImage(Lm, 0, 0); Lc.x.filter = 'none';
  f.globalAlpha = .4; f.drawImage(Lc, 0, 0, Lm.width, Lm.height, 0, 0, fw, fh);
  // light passes the open cells of the weave more than the threads, and takes the warm colour of the silk
  f.globalAlpha = 1; f.globalCompositeOperation = 'multiply';
  const tp = f.createPattern(skWeave().trans, 'repeat'); tp.setTransform(new DOMMatrix().scale(SX)); f.fillStyle = tp; f.fillRect(0, 0, fw, fh);
  f.fillStyle = '#FFF0DA'; f.fillRect(0, 0, fw, fh);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  X.globalCompositeOperation = 'screen'; X.globalAlpha = bk; X.drawImage(Lf, 0, 0, cw, ch); X.globalAlpha = bk * .5; X.drawImage(Lf, 0, 0, cw, ch);
  // the fibres themselves take on the colour (diffuse glow on the silk surface)
  X.globalCompositeOperation = 'screen'; X.globalAlpha = bk * .22; X.drawImage(Ls, 0, 0, cw, ch);
  X.restore();
}

// =====================================================================================================================
// WATERCOLOUR
// =====================================================================================================================
// The wash is rasterised at reduced resolution: the shape mask is blurred twice (a small blur for the wobbly, soft
// boundary; a large one for the pigment distribution), then each pixel gets a density from noise (edge wobble, wicking
// along the weave, mottling, granulation) and is laid on the frame with multiply.
// Wobble polylines with 2-octave value noise (amp in user px), resampling long segments first.
function skWarp(lines, amp, f, seed) {
  if (amp <= .05) return lines;
  const step = Math.max(2, Math.min(amp * .8, 1 / f / 6));
  return lines.map(L => {
    const P = L.closed ? [...L, L[0]] : L, out = [];
    for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
    if (!L.closed) out.push(P[P.length - 1]);
    const w = out.map(([x, y]) => [x + (noise2(x * f + seed, y * f) + noise2(x * f * 3.7 + 9, y * f * 3.7 + seed) * .35) * amp, y + (noise2(x * f + 50, y * f + seed) + noise2(x * f * 3.7 + seed, y * f * 3.7 + 31) * .35) * amp]);
    w.closed = L.closed; return w;
  });
}
// Washes are memoised on their exact inputs (outline points, colour, options, transform, output scale), so a static
// painting costs a blit per frame; any change (moving camera, animated shape) recomputes. Output is identical either way.
const SK_WMEMO = new Map(); let SK_WMEMO_PX = 0;
function skWashKey(lines, color, o, m) {
  let h = 0, n = 0;
  for (const L of lines) { for (const p of L) { h = (h * 31 + Math.round(p[0] * 64)) | 0; h = (h * 31 + Math.round(p[1] * 64)) | 0; n++; } h = (h * 31 + (L.closed ? 7 : 3)) | 0; }
  return [color, h, n, m.a, m.b, m.c, m.d, m.e, m.f, SX, JSON.stringify(o)].join('|');
}
function skWash(pathFn, color, o = {}) {
  let lines = skFlatten(pathFn); if (!lines.length) return;
  const m = X.getTransform(), sc = skScale(m);
  { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const L of lines) for (const p of L) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const sz = Math.max(x1 - x0, y1 - y0), amp = o.warp ?? Math.min(40, sz * .014) * (o.rough ?? .35) / .35;
    lines = skWarp(lines, amp, 1 / Math.max(20, sz * .22), (o.seed ?? 0) * 13.1); }
  const bS = (o.blur ?? 5) * (.6 + (o.feather ?? .12) * 2), bL = o.spread ?? 14;
  const box = skBox(lines, m, (bS * 2.2 + bL * 1.3 + 6) * sc); if (!box) return;
  const area = box[2] * box[3], res = o.res ?? (area > 1500000 ? .25 : area > 700000 ? .32 : area > 200000 ? .45 : area > 50000 ? .6 : .85);
  const mw = Math.max(2, Math.ceil(box[2] * res)), mh = Math.max(2, Math.ceil(box[3] * res));
  const key = o.memo === false ? null : skWashKey(lines, color, o, m), hit = key && SK_WMEMO.get(key);
  const put = cv => { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = o.op || 'multiply'; X.globalAlpha = o.alpha ?? 1; X.imageSmoothingQuality = 'high'; X.drawImage(cv, 0, 0, mw, mh, box[0], box[1], mw / res, mh / res); X.restore(); };
  if (hit) { SK_WMEMO.delete(key); SK_WMEMO.set(key, hit); put(hit); return; }
  const A = skScr('_skWA', mw, mh), B = skScr('_skWB', mw, mh, true), C = skScr('_skWC', mw, mh, true), D = skScr('_skWD', mw, mh);
  A.x.setTransform(res, 0, 0, res, -box[0] * res, -box[1] * res); A.x.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  A.x.fillStyle = '#fff'; A.x.beginPath(); skReplay(lines, A.x); A.x.fill(o.rule || 'nonzero'); A.x.setTransform(1, 0, 0, 1, 0, 0);
  B.x.filter = `blur(${Math.max(.3, bS * sc * res)}px)`; B.x.drawImage(A, 0, 0, mw, mh, 0, 0, mw, mh); B.x.filter = 'none';
  C.x.filter = `blur(${Math.max(.5, bL * sc * res)}px)`; C.x.drawImage(A, 0, 0, mw, mh, 0, 0, mw, mh); C.x.filter = 'none';
  const dS = B.x.getImageData(0, 0, mw, mh).data, dL = C.x.getImageData(0, 0, mw, mh).data;
  const out = D.x.createImageData(mw, mh), od = out.data, NT = skNoiseTile(), NA = NT.a, NG = NT.g;
  const inv = m.inverse(), col = skHex(color), col2 = skHex(o.color2 || color), mixA = o.color2 ? (o.mix ?? .6) : 0;
  const A0 = o.a ?? .5, E = o.edge ?? .55, rough = o.rough ?? .35, wick = o.wick ?? .12, mot = o.mottle ?? .42, gran = o.gran ?? .45;
  const sw = .03 + (o.feather ?? .12) * .3, ns = 1.15 / (o.scale ?? 1), seed = (o.seed ?? 0) * 37.7, sxo = hash(seed + 1) * 256, syo = hash(seed + 2) * 256;
  const gr = o.grad, gTo = o.gradTo ?? .08; let gx = 0, gy = 0, gdx = 0, gdy = 0, gL2 = 1;
  if (gr) { gx = gr[0]; gy = gr[1]; gdx = gr[2] - gr[0]; gdy = gr[3] - gr[1]; gL2 = gdx * gdx + gdy * gdy || 1; }
  const lo = .5 - sw - rough * .5 - wick * .5;
  for (let py = 0; py < mh; py++) {
    const dy = box[1] + (py + .5) / res;
    for (let px = 0; px < mw; px++) {
      const i = (py * mw + px) * 4, s = dS[i + 3] / 255;
      if (s < lo) continue;
      const dx = box[0] + (px + .5) / res, ux = inv.a * dx + inv.c * dy + inv.e, uy = inv.b * dx + inv.d * dy + inv.f;
      const wx = dx / SX, wy = dy / SX;
      const nb = skNS(NA, ux * ns + sxo, uy * ns + syo) * .8 + skNS(NA, ux * ns * 3.1 + syo, uy * ns * 3.1 + sxo) * .2;
      let v = s + (nb - .5) * rough;
      if (v - wick * .5 < .5 + sw) v += (Math.max(skNS(NA, wx * .22 + 40, wy * 2.4 + 17), skNS(NA, wx * 2.4 + 91, wy * .22 + 63)) - .5) * wick;
      const a = skSS(.5 - sw, .5 + sw, v); if (a <= 0) continue;
      const q = clamp((dL[i + 3] / 255 - .5) * 2.2 + (nb - .5) * .5), edge = q >= 1 ? 0 : (1 - q) * (1 - q) * (1 - q) * clamp(.25 + 1.5 * skNS(NA, ux * ns * .45 + 71, uy * ns * .45 + 13));
      const nm = skNS(NA, ux * ns * .3 + syo, uy * ns * .3 + sxo), g = NG[((Math.floor(wy * 1.3) & 255) << 8) | (Math.floor(wx * 1.3) & 255)];
      let den = a * (A0 * (1 + (nm - .5) * mot * 2.2) + E * edge * (.55 + nb * .7)) + 4 * a * (1 - a) * E * .35;
      den *= 1 + (g - .5) * gran * 2 * (1.3 - Math.min(1, den));
      if (gr) den *= lerp(1, gTo, clamp(((ux - gx) * gdx + (uy - gy) * gdy) / gL2));
      const mk = mixA * clamp((nm - .5) * 3 + .5), dk = 1 - edge * .22;
      od[i] = (col[0] + (col2[0] - col[0]) * mk) * dk; od[i + 1] = (col[1] + (col2[1] - col[1]) * mk) * dk; od[i + 2] = (col[2] + (col2[2] - col[2]) * mk) * dk;
      od[i + 3] = Math.min(255, den * 255);
    }
  }
  if (key && mw * mh < 1.5e6) {
    const cv = mkCanvas(mw, mh); cv.getContext('2d').putImageData(out, 0, 0); put(cv);
    SK_WMEMO.set(key, cv); SK_WMEMO_PX += mw * mh;
    while (SK_WMEMO_PX > 12e6 && SK_WMEMO.size) { const [k0, c0] = SK_WMEMO.entries().next().value; SK_WMEMO.delete(k0); SK_WMEMO_PX -= c0.width * c0.height; }
  } else { D.x.putImageData(out, 0, 0); put(D); }
}
// Lobed "cauliflower" outline: backruns push the edge into scallops with sharp inward cusps.
function skLobePath(cx, cy, rr, seed, lobes = 9, n = 72, sq = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, sc = Math.abs(Math.sin(a * lobes / 2 + seed * 3.1)) * .9 + Math.abs(Math.sin(a * lobes * 1.7 + seed)) * .35;
    const r = rr * (1 + noise1(a * 1.6 + seed * 7) * .16 + noise1(a * 5 + seed * 3) * .07 + (sc - .6) * .09);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * sq]);
  }
  pathPoly(pts);
}
function skBloom(x, y, r, color, t, t0, o = {}) {
  if (t < t0) return;
  const age = t - t0, k = easeOut(clamp(age / (o.dur ?? 1.6))), rr = r * (.18 + .82 * Math.sqrt(k)), seed = o.seed ?? (x * .013 + y * .007);
  const dry = clamp(age / ((o.dur ?? 1.6) * 1.6));
  // the pigment is pushed outward as the water spreads: the centre pales, the rim darkens as it dries
  skWash(() => skLobePath(x, y, rr, seed, o.lobes ?? 9, 72, o.sq ?? 1), color, {
    a: (o.a ?? .34) * lerp(1.5, .6, k), edge: (o.edge ?? .9) * lerp(.35, 1, dry), rough: .22, feather: lerp(.5, .08, dry), spread: rr * .28, blur: 3 + rr * .02,
    seed, color2: o.color2, mix: o.mix, gran: .6, mottle: .5,
  });
  if (o.core !== false) skWash(() => skLobePath(x + rr * .1, y - rr * .05, rr * .45, seed + 5, 7, 48, o.sq ?? 1), color, { a: .12 * (1 - k * .5), edge: .5 * dry, feather: .5, spread: rr * .2, seed: seed + 5 });
}
// A painted tear: a drop that swells at the eye, runs down with a wobble, leaves a track, and bleeds sideways into the weave.
function skBleed(x, y, color, t, t0, o = {}) {
  const dur = o.dur ?? 2.2, age = o.k !== undefined ? o.k * dur * 1.6 : t - t0;
  if (age <= 0) return;
  const run = easeOut(clamp(age / dur)), spread = 1 + .6 * easeOut(clamp((age - dur * .6) / (dur * 1.5)));
  const L = (o.len ?? 150) * run, w = (o.w ?? 12) * spread, seed = o.seed ?? (x * .031 + y * .017);
  const n = Math.max(3, Math.ceil(L / 6)), left = [], right = [];
  const cx = yy => x + noise1(yy / 38 + seed * 5) * w * .45 + noise1(yy / 11 + seed) * w * .12;
  for (let i = 0; i <= n; i++) {
    const u = i / n, yy = y + L * u, hw = w * (.14 + .16 * u + .07 * noise1(u * 7 + seed));
    left.push([cx(yy) - hw, yy]); right.push([cx(yy) + hw, yy]);
  }
  const hx = cx(y + L), hy = y + L, hr = w * (.42 - .08 * (spread - 1)) * (.5 + .5 * clamp(age / .25));
  const path = () => {
    pathPoly([...left, ...Array.from({ length: 11 }, (_, i) => { const a = Math.PI - i / 10 * Math.PI; return [hx + Math.cos(a) * hr, hy + hr * .15 + Math.sin(a) * hr * 1.15]; }), ...right.slice().reverse()]);
    X.moveTo(x + w * .4, y); X.ellipse(x, y, w * .4, w * .28, 0, 0, TAU);
  };
  skWash(path, color, { a: (o.a ?? .36) / Math.sqrt(spread), edge: .8, rough: .25, feather: .1 + (1 - run) * .25, blur: 2.5, spread: w * .4, seed, wick: .2, gran: .5, color2: o.color2, mix: .5, grad: [x, y + L, x, y], gradTo: .35 });
  // the wet drop at the head is darker until it dries
  const wet = 1 - clamp((age - dur) / (dur * .8));
  if (wet > 0) skWash(() => X.ellipse(hx, hy + hr * .25, hr * .7, hr * .9, 0, 0, TAU), color, { a: .22 * wet, edge: .6, feather: .3, blur: 2, spread: hr * .5, seed: seed + 3 });
}

// =====================================================================================================================
// INK
// =====================================================================================================================
function skCR(pts, step) {       // Catmull-Rom resample of an open polyline (keeps a 3rd pressure value)
  const out = [], n = pts.length; if (n < 2) return pts.slice();
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const seg = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let s = 0; s < seg; s++) {
      const u = s / seg, u2 = u * u, u3 = u2 * u, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), lerp(p1[2] ?? 1, p2[2] ?? 1, u)]);
    }
  }
  const l = pts[n - 1]; out.push([l[0], l[1], l[2] ?? 1]); return out;
}
function skResample(pts, step) {  // linear resample (for flattened paths)
  const out = [[pts[0][0], pts[0][1], pts[0][2] ?? 1]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d < 1e-6) continue;
    let s = step - acc;
    while (s <= d) { const u = s / d; out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2] ?? 1, b[2] ?? 1, u)]); s += step; }
    acc = d - (s - step);
  }
  const l = pts[pts.length - 1]; out.push([l[0], l[1], l[2] ?? 1]); return out;
}
// One brush stroke onto the current context (a layer): an exact thick-thin silhouette with ragged edges, then dry-brush
// streaks rubbed out along the bristle lines.
function skInkStroke(pts, o, seed, sc) {
  const w = o.w ?? 8, step = Math.max(.8, Math.min(3, w * .25));
  let P = o.smooth === false ? skResample(pts, step) : skCR(pts, step);
  if (P.length < 2) return;
  const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const Ltot = cum[cum.length - 1] || 1, kk = clamp(o.k ?? 1); if (kk <= 0) return;
  let nEnd = P.length; if (kk < 1) { nEnd = cum.findIndex(c => c > Ltot * kk); if (nEnd < 0) nEnd = P.length; }
  if (nEnd < 2) return;
  const att = o.attack ?? Math.min(.12, w * 1.4 / Ltot), tl = o.tail ?? .35, tip = o.tip ?? .12, wob = o.wobble ?? 1;
  const press = u => {
    const a = u < att ? lerp(.5, 1.18, easeOut(u / att)) : lerp(1.18, 1, clamp((u - att) / .12));
    const e = u > 1 - tl ? lerp(1, tip, easeIn((u - (1 - tl)) / tl)) : 1;
    return a * e * (1 + noise1(u * Ltot / (w * 4) + seed * 7) * .14 * wob);
  };
  const HW = [], NX = [], NY = [];
  for (let i = 0; i < nEnd; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    NX.push(-dy / l); NY.push(dx / l); HW.push(w / 2 * press(cum[i] / Ltot) * (P[i][2] ?? 1));
  }
  // wet head while writing: the brush is pressed, a small pool
  if (kk < 1) HW[nEnd - 1] = Math.max(HW[nEnd - 1], w * .55);
  const ragged = (i, s) => 1 + (hash(i * .37 + seed * 3 + s) - .5) * .16 + noise1(i * .21 + seed + s * 9) * .07;
  const g = X.createLinearGradient(P[0][0], P[0][1], P[nEnd - 1][0], P[nEnd - 1][1]), c0 = o.color || SK_PAL.ink;
  g.addColorStop(0, c0); g.addColorStop(1, skMix(c0, SK_PAL.inkLt, (o.fade ?? .35) * (Ltot * kk / Ltot)));
  X.fillStyle = g; X.beginPath();
  for (let i = 0; i < nEnd; i++) { const hw = HW[i] * ragged(i, 0); i ? X.lineTo(P[i][0] + NX[i] * hw, P[i][1] + NY[i] * hw) : X.moveTo(P[i][0] + NX[i] * hw, P[i][1] + NY[i] * hw); }
  for (let i = nEnd - 1; i >= 0; i--) { const hw = HW[i] * ragged(i, 5); X.lineTo(P[i][0] - NX[i] * hw, P[i][1] - NY[i] * hw); }
  X.closePath(); X.fill();
  // round-ish start (the brush lands) and the wet head
  X.beginPath(); X.arc(P[0][0], P[0][1], HW[0] * .95, 0, TAU); X.fill();
  if (kk < 1) { X.beginPath(); X.arc(P[nEnd - 1][0], P[nEnd - 1][1], HW[nEnd - 1] * 1.05, 0, TAU); X.fill(); }
  // dry brush: bristle lines rubbed out where the brush runs dry (the outer hairs first, and at the end of the stroke)
  const dry = o.dry ?? .3; if (dry <= 0) return;
  const hwMax = Math.max(...HW), nb = clamp(Math.round(hwMax * 2 * sc / 1.7), 4, 22), dt = o.dryTail ?? .45;
  X.save(); X.globalCompositeOperation = 'destination-out'; X.lineCap = 'round';
  for (let j = 0; j < nb; j++) {
    const v = (j + .5) / nb * 2 - 1 + (hash(j * 3.3 + seed) - .5) * .5 / nb, edgeF = Math.abs(v), fq = 2.5 + hash(j * 7.1 + seed) * 7;
    X.lineWidth = Math.max(.6 / sc, hwMax * 2 / nb * (.45 + hash(j + seed * 2) * .5)); X.beginPath(); let on = false;
    for (let i = 0; i < nEnd; i++) {
      const u = cum[i] / Ltot, dr = dry * (skSS(1 - dt, 1, u) * 1.1 + .12 + (kk < 1 && i > nEnd - 6 ? -.5 : 0)) * (.45 + edgeF * 1.1);
      const gap = (noise1(cum[i] / fq + j * 31.7 + seed) * .5 + .5) < dr;
      const px = P[i][0] + NX[i] * HW[i] * v, py = P[i][1] + NY[i] * HW[i] * v;
      if (gap) { if (!on) { X.moveTo(px, py); on = true; } else X.lineTo(px, py); } else on = false;
    }
    X.stroke();
  }
  X.restore();
}
function skInk(src, o = {}) {
  let strokes;
  if (typeof src === 'function') { strokes = skFlatten(src).map(L => L.closed ? [...L, L[0]] : L); o = { smooth: false, ...o }; }
  else strokes = Array.isArray(src[0][0]) ? src : [src];
  strokes = strokes.filter(s => s.length > 1); if (!strokes.length) return;
  const m = X.getTransform(), sc = skScale(m), w = o.w ?? 8, bl = o.bleed ?? 1;
  const box = skBox(strokes, m, (w * 1.4 + 6 * bl) * sc + 4); if (!box) return;
  const L = skOn(skLay('_skInk'), m, box, () => strokes.forEach((s, i) => skInkStroke(s, o, (o.seed ?? 0) + i * 1.37, sc)));
  // ink bleeds a little into the silk (a soft halo), then the stroke itself
  if (bl > 0 && w * sc >= 3) skBlit(L, box, (o.alpha ?? .92) * .28 * bl, 'multiply', `blur(${Math.max(.6, 2.2 * bl * sc)}px)`);
  skBlit(L, box, o.alpha ?? .92, o.op || 'multiply');
}
// Dry-brush texture for calligraphy: streaks along the brush direction with blank spots.
function skDryTex() {
  if (SK_TEX.dry) return SK_TEX.dry;
  const S = 512, c = mkCanvas(S, S), g = c.getContext('2d'), r = rng(53);
  g.lineCap = 'round';
  for (let i = 0; i < 1600; i++) {
    const x = r() * S, y = r() * S, a = -.3 + (r() - .5) * .35, l = 6 + r() * 60, lw = .4 + Math.pow(r(), 3) * 2.4;
    const patch = skPN(x / 64, y / 64, 8, 21) * .5 + .5; if (patch < .55 && r() > .12) continue;
    g.strokeStyle = `rgba(255,255,255,${(.2 + r() * .7) * clamp((patch - .4) * 2.5)})`; g.lineWidth = lw;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); }
  }
  return (SK_TEX.dry = c);
}
const wd0 = L => L.length ? L[L.length - 1].x + L[L.length - 1].w : 0;
function skBrushText(str, x, y, o = {}) {
  const size = o.size || 96, fnt = o.font || FONT.vnI(size), tr = o.tracking || 0;
  const L = layout(str, fnt, tr), w = L.width; let x0 = x; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w;
  const k = clamp(o.k ?? 1); if (k <= 0) return { x0, w };
  const m = X.getTransform(), sc = skScale(m), bl = o.bleed ?? 1;
  const box = skBox([[[x0 - size * .3, y - size * 1.25], [x0 + w + size * .3, y + size * .45]]], m, 8 * sc); if (!box) return { x0, w };
  const front = lerp(x0 - size * .4, x0 + w + size * .1, k), fw = size * .45;
  const hand = o.hand ?? 1, sd = o.seed ?? (str.length * 1.3);
  const each = fn => L.forEach((l, i) => { if (l.ch === ' ') return; X.save(); X.translate(x0 + l.x + l.w / 2, y + sjit(i * 3.1 + sd, size * .02 * hand)); X.rotate(sjit(i * 5.7 + sd, .035 * hand)); const sc2 = 1 + sjit(i * 1.9 + sd, .035 * hand); X.scale(sc2, sc2); fn(l.ch, -l.w / 2); X.restore(); });
  const words = []; { let a = null; L.forEach((l, i) => { if (l.ch === ' ') { if (a !== null) words.push([a, L[i - 1].x + L[i - 1].w]); a = null; } else if (a === null) a = l.x; }); if (a !== null) words.push([a, wd0(L)]); }
  const Lt = skOn(skLay('_skTxt'), m, box, () => {
    X.font = fnt; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    X.fillStyle = o.color || SK_PAL.ink; each((ch, dx) => X.fillText(ch, dx, 0));
    X.lineWidth = size * .012; X.strokeStyle = o.color || SK_PAL.ink; X.lineJoin = 'round'; each((ch, dx) => X.strokeText(ch, dx, 0));
    // the brush is dipped at the start of each word and runs dry toward its end
    X.globalCompositeOperation = 'destination-out';
    for (const [a, b] of words) { const g = X.createLinearGradient(x0 + a, 0, x0 + b, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${.28 * (o.runout ?? 1)})`); X.fillStyle = g; X.fillRect(x0 + a - 2, y - size * 1.5, b - a + 4, size * 2.2); }
    // dry-brush streaks rubbed out of the ink
    X.globalCompositeOperation = 'destination-out'; X.globalAlpha = o.dry ?? .55;
    const p = X.createPattern(skDryTex(), 'repeat'); p.setTransform(new DOMMatrix().translate(x0, y).scale(size / 150)); X.fillStyle = p;
    X.fillRect(x0 - size, y - size * 1.5, w + size * 2, size * 2.2); X.globalAlpha = 1;
    // write-on: everything left of the brush, with a soft wet front
    if (k < 1) {
      X.globalCompositeOperation = 'destination-in';
      const g = X.createLinearGradient(front - fw, 0, front, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      X.fillStyle = g; X.fillRect(x0 - size, y - size * 1.5, w + size * 2, size * 2.2);
    }
  });
  if (bl > 0) skBlit(Lt, box, (o.alpha ?? .97) * .3 * bl, 'multiply', `blur(${Math.max(.7, size * .018 * bl * sc)}px)`);
  skBlit(Lt, box, o.alpha ?? .97, 'multiply');
  if (k < 1) {
    // the wet front: darker, glossier ink that has not soaked in yet, and a wider bleed spreading from it
    const Wt = skOn(skLay('_skTxtW'), null, box, () => {
      X.drawImage(Lt, box[0], box[1], box[2], box[3], box[0], box[1], box[2], box[3]);
      X.globalCompositeOperation = 'destination-in'; X.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
      const g = X.createLinearGradient(front - fw * 2.2, 0, front, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      X.fillStyle = g; X.fillRect(x0 - size, y - size * 1.5, w + size * 2, size * 2.2);
    });
    skBlit(Wt, box, .6, 'multiply');
    skBlit(Wt, box, .35, 'multiply', `blur(${Math.max(1, size * .05 * sc)}px)`);
  }
  return { x0, w };
}
// A small cinnabar seal (square chop) with carved characters.
function skSeal(x, y, s, str = 'LỤA', o = {}) {
  X.save(); X.translate(x, y); X.rotate(o.rot ?? -.02);
  const m = X.getTransform(), sc = skScale(m), box = skBox([[[-s * .6, -s * .6], [s * .6, s * .6]]], m, 4);
  if (!box) { X.restore(); return; }
  const Ls = skOn(skLay('_skSeal'), m, box, () => {
    X.fillStyle = o.color || SK_PAL.cinnabar; X.beginPath(); X.roundRect(-s / 2, -s / 2, s, s, s * .08); X.fill();
    X.globalCompositeOperation = 'destination-out';
    X.strokeStyle = '#000'; X.lineWidth = s * .05; X.beginPath(); X.roundRect(-s * .4, -s * .4, s * .8, s * .8, s * .04); X.stroke();
    X.font = FONT.vnSansB(s * .3); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#000';
    const parts = str.split(' '); parts.forEach((p, i) => X.fillText(p, 0, (i - (parts.length - 1) / 2) * s * .32));
    // worn stamp: ink did not take everywhere
    X.globalAlpha = .7; const p = X.createPattern(skDryTex(), 'repeat'); p.setTransform(new DOMMatrix().scale(s / 260).rotate(70)); X.fillStyle = p; X.fillRect(-s, -s, s * 2, s * 2);
  });
  skBlit(Ls, box, o.alpha ?? .85, 'multiply');
  X.restore();
}

// =====================================================================================================================
// NEON
// =====================================================================================================================
// Tube intensity: o.on 0..1 (a tube being struck sputters between dark and lit), o.flicker (mains buzz + dropouts), o.I (scale).
function skNeonI(t, o, seed) {
  const on = o.on ?? 1; if (on <= 0) return 0;
  let I = on >= 1 ? 1 : (hash(Math.floor(t * 24) * 1.37 + seed * 7.7) < on ? Math.sqrt(on) : on * .1);
  const f = o.flicker ?? 0;
  if (f > 0) {
    I *= 1 - f * .12 * hash(Math.floor(t * 60) + seed * 3.1);
    if (hash(Math.floor(t * 14) * 1.13 + seed * 13.1) < f * .22) I *= .12 + .35 * hash(Math.floor(t * 40) + seed);
  }
  return I * (o.I ?? 1);
}
// The glow stack for any stroked geometry. paint(lineWidth, alphaOf) strokes on X, with alphaOf(I) → alpha per item.
// Halo at 1/4 resolution with a wide blur, glow at 1/2 with a tight blur, then the coloured tube, the white-hot core, and
// the dim glass of any unlit tube.
function skGlow(box, m, paint, col, w, o = {}) {
  const sc = skScale(m), halo = o.halo ?? 1, light = o.ground === 'light', op = light ? 'source-over' : 'lighter';
  const passes = [[.25, w * 5 * halo, 3, light ? .38 : .55, 'A'], [.5, w * 1.3, 1.8, light ? .5 : .7, 'B']];
  for (const [res, blur, lw, a, nm] of passes) {
    const bw = Math.ceil(box[2] * res) + 2, bh = Math.ceil(box[3] * res) + 2, S = skScr('_skGS', bw, bh), F = skScr('_skGF', bw, bh), br = Math.max(.6, blur * sc * res);
    const prev = X; X = S.x; X.save(); X.setTransform(res, 0, 0, res, -box[0] * res, -box[1] * res); X.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    try { X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round'; paint(lw * w, I => I); } finally { X.restore(); X = prev; }
    F.x.filter = `blur(${br}px)`; F.x.drawImage(S, 0, 0); F.x.filter = 'none';
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = op; X.globalAlpha = a; X.drawImage(F, 0, 0, bw, bh, box[0], box[1], bw / res, bh / res);
    if (nm === 'A' && !light) {   // the air glows wider still
      const F2 = skScr('_skGF2', bw, bh); F2.x.filter = `blur(${br}px)`; F2.x.drawImage(F, 0, 0); F2.x.filter = 'none';
      X.globalAlpha = a * .3; X.drawImage(F2, 0, 0, bw, bh, box[0], box[1], bw / res, bh / res);
    }
    X.restore();
  }
  X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
  // unlit glass: a pale tube with a thin highlight, visible where the tube is off
  X.globalCompositeOperation = 'source-over';
  X.strokeStyle = light ? 'rgba(120,120,130,1)' : 'rgba(170,180,205,1)'; paint(w * .95, I => (1 - clamp(I * 2.5)) * (light ? .3 : .22));
  X.strokeStyle = 'rgba(255,255,255,1)'; paint(w * .22, I => (1 - clamp(I * 2.5)) * .25);
  // the lit tube: saturated colour, then the white-hot core
  X.strokeStyle = col; paint(w, I => clamp(I * 1.15) * .95);
  X.strokeStyle = o.core || skMix(col, '#FFFFFF', .88); paint(w * .5, I => Math.pow(clamp(I), 1.4));
  X.restore();
}
function skNeon(pathFn, color, o = {}) {
  if (o.reflect !== undefined && o.reflect !== null && o.reflect !== false) {
    const rf = typeof o.reflect === 'number' ? { y: o.reflect } : o.reflect;
    skReflect(() => skNeon(pathFn, color, { ...o, reflect: null }), rf.y, { t: T, ...rf });
  }
  const lines = skFlatten(pathFn); if (!lines.length) return;
  const m = X.getTransform(), sc = skScale(m), w = o.w ?? 7, seed = o.seed ?? 1, I = skNeonI(o.t ?? T, o, seed);
  const box = skBox(lines, m, w * (5 * (o.halo ?? 1) * 2.4 + 4) * sc); if (!box) return;
  skGlow(box, m, (lw, af) => { const a = af(I); if (a <= .003) return; X.globalAlpha = a; X.lineWidth = lw; X.beginPath(); skReplay(lines); X.stroke(); }, color, w, o);
}
function skNeonText(str, x, y, o = {}) {
  const size = o.size || 120, fnt = o.font || FONT.vnSansB(size), tr = o.tracking ?? size * .04, col = o.color || SK_PAL.neonPink;
  const L = layout(str, fnt, tr), wd = L.width; let x0 = x; if (o.align === 'center') x0 = x - wd / 2; else if (o.align === 'right') x0 = x - wd;
  if (o.reflect !== undefined && o.reflect !== null && o.reflect !== false) {
    const rf = typeof o.reflect === 'number' ? { y: o.reflect } : o.reflect;
    skReflect(() => skNeonText(str, x, y, { ...o, reflect: null }), rf.y, { t: T, ...rf });
  }
  const m = X.getTransform(), sc = skScale(m), w = o.w ?? Math.max(2.2, size * .036), seed = o.seed ?? 3, t = o.t ?? T;
  const Is = L.map((l, i) => {
    const on = Array.isArray(o.on) ? (o.on[i] ?? 1) : (o.on ?? 1);
    return skNeonI(t, { ...o, on, flicker: i === o.broken ? Math.max(.85, o.flicker || 0) : o.flicker }, seed + i * 1.7);
  });
  const box = skBox([[[x0 - size * .2, y - size * 1.25], [x0 + wd + size * .2, y + size * .35]]], m, w * (5 * (o.halo ?? 1) * 2.4 + 4) * sc); if (!box) return { x0, w: wd };
  skGlow(box, m, (lw, af) => {
    X.font = fnt; X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.lineWidth = lw;
    L.forEach((l, i) => { if (l.ch === ' ') return; const a = af(Is[i]); if (a <= .003) return; X.globalAlpha = a; X.strokeText(l.ch, x0 + l.x, y); });
  }, col, w, o);
  return { x0, w: wd };
}

// ---------- the wet night street ----------
const SK_NIGHT_H = 600;
function skNightBake(hz) {
  const key = 'night_' + SX + '_' + hz; if (SK_TEX[key]) return SK_TEX[key];
  const w = 960, h = 540, c0 = mkCanvas(w, h), g0 = c0.getContext('2d'), id = g0.createImageData(w, h), d = id.data;
  const m0 = mkCanvas(w, h), gm = m0.getContext('2d'), mid = gm.createImageData(w, h), md = mid.data, r = rng(19);
  const top = skHex(SK_PAL.night), hzc = skHex('#1A2238'), asp = [15, 17, 24], aspH = [26, 30, 44], pud = [10, 12, 20];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const XX = x * 2, YY = y * 2, i = (y * w + x) * 4; let C, wet = 0;
    if (YY < hz) {
      const k = Math.pow(YY / hz, 3), n = noise2(XX / 300, YY / 200) * .5 + .5;
      C = [lerp(top[0], hzc[0], k) + n * 4, lerp(top[1], hzc[1], k) + n * 4, lerp(top[2], hzc[2], k) + n * 7];
    } else {
      const dz = (YY - hz) / (H - hz), px = (XX - W / 2) / (dz + .12), pz = 1 / (dz + .1);
      const pn = noise2(px / 380 + 3, pz * 2.2) * .6 + noise2(px / 130, pz * 6.5 + 4) * .3 + noise2(px / 40, pz * 18) * .1;
      const puddle = skSS(.1, .22, pn), gr = r(), speck = gr > .996 ? .5 : 0;
      const base = [lerp(aspH[0], asp[0], Math.sqrt(dz)), lerp(aspH[1], asp[1], Math.sqrt(dz)), lerp(aspH[2], asp[2], Math.sqrt(dz))];
      const ag = (.86 + gr * .12 + noise2(XX / 5, YY / 5) * .12 + noise2(XX / 17, YY / 13) * .08) + speck;
      const sky = [lerp(hzc[0], pud[0], Math.sqrt(dz)), lerp(hzc[1], pud[1], Math.sqrt(dz)), lerp(hzc[2], pud[2], Math.sqrt(dz))];
      const rim = Math.max(0, 1 - Math.abs(pn - .16) / .03) * .35;
      C = [lerp(base[0] * ag, sky[0], puddle) + rim * 12, lerp(base[1] * ag, sky[1], puddle) + rim * 14, lerp(base[2] * ag, sky[2], puddle) + rim * 20];
      wet = .42 + .18 * (noise2(XX / 50, YY / 30) * .5 + .5) + puddle * .5;
      wet *= skSS(0, .04, dz);
      const hb = skSS(.03, 0, dz); C = [lerp(C[0], hzc[0], hb), lerp(C[1], hzc[1], hb), lerp(C[2], hzc[2], hb)];
    }
    d[i] = C[0]; d[i + 1] = C[1]; d[i + 2] = C[2]; d[i + 3] = 255;
    md[i] = md[i + 1] = md[i + 2] = 255; md[i + 3] = Math.round(clamp(wet) * 255);
  }
  g0.putImageData(id, 0, 0); gm.putImageData(mid, 0, 0);
  const c = mkCanvas(Math.round(W * SX), Math.round(H * SX)), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c0, 0, 0, c.width, c.height);
  const wm = mkCanvas(c.width, c.height), gw = wm.getContext('2d'); gw.imageSmoothingQuality = 'high'; gw.drawImage(m0, 0, 0, c.width, c.height);
  return (SK_TEX[key] = { c, wet: wm, hz });
}
function skNight(t, o = {}) {
  const hz = o.horizon ?? SK_NIGHT_H, b = skNightBake(hz), cw = X.canvas.width, ch = X.canvas.height, gs = cw / W;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; X.drawImage(b.c, 0, 0, cw, ch); X.restore();
  X.save(); X.setTransform(gs, 0, 0, gs, 0, 0); X.globalCompositeOperation = 'lighter';
  // haze along the horizon (the city's light in the wet air)
  const hc = o.haze ?? '#3A2A6A', hg = X.createLinearGradient(0, hz - 260, 0, hz + 60);
  hg.addColorStop(0, skRgba(hc, 0)); hg.addColorStop(.75, skRgba(hc, .22 * (o.hazeA ?? 1))); hg.addColorStop(1, skRgba(hc, 0)); X.fillStyle = hg; X.fillRect(0, hz - 260, W, 320);
  // far bokeh: out-of-focus city lights
  const nb = o.bokeh ?? 0, BK = [SK_PAL.neonPink, SK_PAL.neonCyan, SK_PAL.neonAmber, '#8A7CFF'];
  for (let i = 0; i < nb; i++) {
    const bx = hash(i * 3.3 + 1) * W, by = hz - 30 - Math.pow(hash(i * 5.1 + 2), 1.5) * hz * .6, br = 8 + hash(i * 7.7) * 30, a = (.12 + hash(i * 1.9) * .2) * (.75 + .25 * Math.sin(t * (.6 + hash(i)) + i));
    const c = BK[i % 4], gr = X.createRadialGradient(bx, by, 0, bx, by, br); gr.addColorStop(0, skRgba(c, a)); gr.addColorStop(.7, skRgba(c, a * .8)); gr.addColorStop(1, skRgba(c, 0));
    X.fillStyle = gr; X.beginPath(); X.arc(bx, by, br, 0, TAU); X.fill();
  }
  // lights: glow in the air
  for (const L of (o.lights || [])) {
    const gr = X.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); gr.addColorStop(0, skRgba(L.color, .5 * (L.a ?? 1))); gr.addColorStop(.3, skRgba(L.color, .18 * (L.a ?? 1))); gr.addColorStop(1, skRgba(L.color, 0));
    X.fillStyle = gr; X.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
  }
  X.restore();
  // the lights' long reflections in the wet street, only where it is wet
  const Ls = o.lights || [], nlb = Math.min(nb, 60);
  if (Ls.length || nlb) {
    const Q = skOn(skLay('_skNQ', .5), new DOMMatrix([SX, 0, 0, SX, 0, 0]), null, () => {
      X.globalCompositeOperation = 'lighter';
      for (const L of Ls) {
        const gy = L.gy ?? hz + 20, ry = 2 * gy - L.y, len = (L.r * 1.6 + (gy - L.y) * .8);
        X.save(); X.translate(L.x, Math.max(gy, ry)); X.scale(.3, 1);
        const gr = X.createRadialGradient(0, 0, 0, 0, 0, len); gr.addColorStop(0, skRgba(L.color, .7 * (L.a ?? 1))); gr.addColorStop(.35, skRgba(L.color, .28 * (L.a ?? 1))); gr.addColorStop(1, skRgba(L.color, 0));
        X.fillStyle = gr; X.fillRect(-len, -len * .6, len * 2, len * 1.6); X.restore();
      }
      for (let i = 0; i < nlb; i++) {
        const bx = hash(i * 3.3 + 1) * W, c = BK[i % 4], a = (.08 + hash(i * 1.9) * .12), ln = 40 + hash(i * 2.9) * 120;
        const gr = X.createLinearGradient(0, hz, 0, hz + ln); gr.addColorStop(0, skRgba(c, a)); gr.addColorStop(1, skRgba(c, 0)); X.fillStyle = gr; X.fillRect(bx - 5, hz, 10, ln);
      }
      X.globalCompositeOperation = 'destination-in'; X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(b.wet, 0, 0, Q_W(), Q_H());
    });
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'lighter'; X.drawImage(Q, 0, 0, cw, ch); X.restore();
  }
}
const Q_W = () => Math.round(W * SX * .5), Q_H = () => Math.round(H * SX * .5);
// Reflection of anything in the wet ground below y (user space): mirrored, stretched, rippled in horizontal strips,
// masked by the puddles of skNight's street (o.wet false for a plain mirror), added with 'lighter'.
function skReflect(drawFn, y, o = {}) {
  const m = X.getTransform(), st = o.stretch ?? 1.15, sc = skScale(m), t = o.t ?? T;
  const R = skOn(skLay('_skRf', .5), m, null, () => { X.translate(0, y); X.scale(1, -st); X.translate(0, -y); drawFn(); });
  const cw = Math.round(W * SX), ch = Math.round(H * SX), gy = Math.round(m.b * 0 + m.d * y + m.f), fade = (o.fade ?? 420) * sc;
  if (gy >= ch) return;
  const Q = skLay('_skRq', 1), q = Q.x; q.clearRect(0, Math.max(0, gy - 2), cw, ch);
  const hs = Math.max(2, Math.round(3 * SX)), amp = (o.ripple ?? 1) * 2.2 * sc;
  for (let sy = Math.max(0, gy); sy < ch; sy += hs) {
    const dist = (sy - gy) / sc, a = (o.a ?? .8) * Math.exp(-(sy - gy) / fade); if (a < .01) break;
    const dx = (noise1(dist / 14 + t * 1.3) * .65 + noise1(dist / 4.5 - t * 2.1) * .35) * amp * (1 + dist * .012);
    q.globalAlpha = a; q.drawImage(R, 0, sy * .5, R.width, hs * .5, dx, sy, cw, hs);
  }
  q.globalAlpha = 1;
  if (o.wet !== false) { const b = skNightBake(o.horizon ?? SK_NIGHT_H); q.globalCompositeOperation = 'destination-in'; q.drawImage(b.wet, 0, 0, cw, ch); q.globalCompositeOperation = 'source-over'; }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = o.op || 'lighter'; X.drawImage(Q, 0, Math.max(0, gy), cw, ch - Math.max(0, gy), 0, Math.max(0, gy), cw, ch - Math.max(0, gy)); X.restore();
}

// ---------- rain ----------
function skRainDrops(t, o, fn) {
  const [rx, ry, rw, rh] = o.rect || [0, 0, W, H], n = o.n ?? 160, ang = o.angle ?? .14, sp = o.speed ?? 1100, len = o.len ?? 38, span = rh + len * 2;
  const ta = Math.tan(ang);
  for (let i = 0; i < n; i++) {
    const s = sp * (.75 + .5 * hash(i * 3.1 + 1)), yy = ry - len + frac(hash(i * 7.13) + t * s / span) * span;
    const xx = rx + frac(hash(i * 1.71) + Math.floor(hash(i * 7.13) + t * s / span) * .618) * (rw + rh * ta) - (yy - ry) * ta;
    const l = len * (.6 + .8 * hash(i * 5.3));
    fn(i, xx, yy, xx + Math.sin(ang) * l, yy - Math.cos(ang) * l, l);
  }
}
function skRainInk(t, o = {}) {
  X.save(); X.globalCompositeOperation = 'multiply'; X.lineCap = 'round';
  const col = o.color || SK_PAL.ink, A = o.alpha ?? 1;
  for (let bk = 0; bk < 3; bk++) {
    X.strokeStyle = skRgba(col, (.16 + bk * .12) * A); X.lineWidth = (o.w ?? 1.6) * (.7 + bk * .35); X.beginPath();
    skRainDrops(t, o, (i, x0, y0, x1, y1) => { if (i % 3 !== bk) return; X.moveTo(x0, y0); X.lineTo(x1, y1); });
    X.stroke();
  }
  // where the rain lands, ink dots spread on the silk and fade
  const [rx, ry, rw, rh] = o.rect || [0, 0, W, H], nd = o.dots ?? 36, P = 2.6;
  for (let j = 0; j < nd; j++) {
    const ph = hash(j * 4.7 + 2), cyc = Math.floor(t / P + ph), age = (t / P + ph - cyc) * P;
    const x = rx + hash(j * 9.1 + cyc * 3.7) * rw, y = ry + hash(j * 5.3 + cyc * 1.9) * rh, R = (3 + hash(j * 2.2 + cyc) * 9) * (o.dotSize ?? 1);
    const k = easeOut(age / .45), al = (1 - age / P) * A, r = R * (.3 + .7 * k);
    const gr = X.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, skRgba(col, .1 * al)); gr.addColorStop(.75, skRgba(col, .22 * al)); gr.addColorStop(.92, skRgba(col, .42 * al)); gr.addColorStop(1, skRgba(col, 0));
    X.fillStyle = gr; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
    if (hash(j * 3.9 + cyc) < .5) { X.fillStyle = skRgba(col, .3 * al); X.beginPath(); X.arc(x + (hash(j + cyc * 2.1) - .5) * R * 3, y + (hash(j * 1.3 + cyc) - .5) * R * 3, R * .18, 0, TAU); X.fill(); }
  }
  X.restore();
}
function skRainNeon(t, o = {}) {
  const Ls = o.lights || [], cols = Ls.length ? Ls.map(l => l.color) : [o.color || '#BFD6FF'], nb = 4;
  const bins = cols.map(() => Array.from({ length: nb }, () => []));
  skRainDrops(t, o, (i, x0, y0, x1, y1) => {
    let best = 0, bi = 0;
    Ls.forEach((L, li) => { const d2 = ((x0 - L.x) ** 2 + (y0 - L.y) ** 2) / (L.r * L.r * 1.8); const v = (L.a ?? 1) * Math.exp(-d2); if (v > best) { best = v; bi = li; } });
    const I = Ls.length ? clamp(.12 + best) : .5; bins[bi][Math.min(nb - 1, Math.floor(I * nb))].push([x0, y0, x1, y1]);
  });
  X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
  cols.forEach((c, ci) => bins[ci].forEach((arr, b) => {
    if (!arr.length) return; const I = (b + .5) / nb;
    X.strokeStyle = skMix(c, '#FFFFFF', .45, .08 + I * .6 * (o.alpha ?? 1)); X.lineWidth = (o.w ?? 1.5) * (.8 + I * .5); X.beginPath();
    for (const s of arr) { X.moveTo(s[0], s[1]); X.lineTo(s[2], s[3]); } X.stroke();
  }));
  // splashes on the street
  if (o.ground !== undefined) {
    const [rx, , rw] = o.rect || [0, 0, W, H], ns = o.splash ?? 50, gy = o.ground;
    X.lineWidth = 1.2;
    for (let j = 0; j < ns; j++) {
      const P = .55, ph = hash(j * 2.7), cyc = Math.floor(t / P + ph), age = (t / P + ph - cyc) * P, k = age / P;
      const x = rx + hash(j * 6.1 + cyc * 1.3) * rw, y = gy + Math.pow(hash(j * 3.3 + cyc * 2.9), 1.6) * (H - gy), s = .4 + (y - gy) / (H - gy + 1);
      let best = .15, bc = cols[0]; Ls.forEach(L => { const v = (L.a ?? 1) * Math.exp(-(((x - L.x) ** 2) / (L.r * L.r * 4))); if (v > best) { best = v; bc = L.color; } });
      X.strokeStyle = skMix(bc, '#FFFFFF', .5, (1 - k) * .55 * clamp(best * 1.5)); X.beginPath(); X.ellipse(x, y, 10 * s * (.3 + k), 2.2 * s * (.3 + k), 0, 0, TAU); X.stroke();
    }
  }
  X.restore();
}

// =====================================================================================================================
// TRANSITIONS
// =====================================================================================================================
const SK_GEOM = new Map();
function skGeom(key, make) { if (!SK_GEOM.has(key)) { SK_GEOM.set(key, make()); if (SK_GEOM.size > 64) SK_GEOM.delete(SK_GEOM.keys().next().value); } return SK_GEOM.get(key); }
function skTearGeom(seed, R, pos) {
  return skGeom(['tear', seed, R.join(','), pos].join('|'), () => {
    const r = rng(seed * 3.7 + 1), [rx, ry, rw, rh] = R, n = 110, pts = [], cx = rx + rw * pos;
    for (let i = 0; i <= n; i++) {
      const u = i / n, yy = ry - 40 + (rh + 80) * u;
      pts.push([cx + noise1(u * 3 + seed * 5) * rw * .05 + noise1(u * 13 + seed) * rw * .012 + (r() - .5) * rw * .006 + (r() < .1 ? (r() - .5) * rw * .02 : 0), yy]);
    }
    const fib = [];
    for (let i = 0; i < n * 4; i++) fib.push({ u: r(), side: r() < .5 ? -1 : 1, len: 3 + Math.pow(r(), 2.4) * 26, ang: (r() - .5) * .9, curl: (r() - .5) * 1.4, bridge: r() < .12, blen: 12 + r() * 80, lw: .5 + r() * .9 });
    return { pts, fib };
  });
}
function skTear(k, seed, drawUnder, drawOver, o = {}) {
  const R = o.rect || [0, 0, W, H];
  if (k <= 0) { drawOver(); return; }
  if (k >= 1) { drawUnder(); return; }
  const m = X.getTransform(), sc = skScale(m), [rx, ry, rw, rh] = R, pos = o.pos ?? .5, G = skTearGeom(seed, R, pos);
  const run = clamp(k / .22), open = ease(clamp((k - .18) / .82)), front = ry - 40 + (rh * 1.3 + 80) * easeOut(run), gw = (1.5 + 5 * run) * (o.gap ?? 1);
  const tx = rx + rw * pos, off = [open * (tx - rx + rw * .15), open * (rx + rw - tx + rw * .15)], rot = [-open * .07, open * .07];
  const gOf = yy => yy > front ? 0 : gw * clamp((front - yy) / (rh * .18 + 1));
  const edge = side => G.pts.map(p => [p[0] + side * gOf(p[1]), p[1]]);
  const halfT = side => { const i = side < 0 ? 0 : 1, pv = side < 0 ? [rx, ry] : [rx + rw, ry]; X.translate(side * off[i], open * open * rh * .05); X.translate(pv[0], pv[1]); X.rotate(rot[i]); X.translate(-pv[0], -pv[1]); };
  const applyT = (side, p) => { const i = side < 0 ? 0 : 1, pv = side < 0 ? [rx, ry] : [rx + rw, ry], c = Math.cos(rot[i]), s = Math.sin(rot[i]), dx = p[0] - pv[0], dy = p[1] - pv[1]; return [pv[0] + dx * c - dy * s + side * off[i], pv[1] + dx * s + dy * c + open * open * rh * .05]; };
  const Lo = skOn(skLay('_skTearO'), m, null, drawOver);
  const mi = m.inverse(), fray = o.fray ?? 1, rim = o.rim, silkC = o.thread || '#F4ECDC';
  X.save(); X.beginPath(); X.rect(rx, ry, rw, rh); X.clip();
  drawUnder();
  for (const side of [-1, 1]) {
    const E = edge(side), outer = side < 0 ? rx - rw : rx + rw * 2, poly = [[outer, ry - rh], ...E, [outer, ry + rh * 2]];
    X.save(); halfT(side);
    X.save(); X.shadowColor = `rgba(0,0,0,${o.shadow ?? .6})`; X.shadowBlur = 26 * sc; X.shadowOffsetX = -side * 6 * sc; X.shadowOffsetY = 8 * sc; X.fillStyle = '#000'; pathPoly(poly); X.fill(); X.restore();
    X.save(); pathPoly(poly); X.clip(); X.transform(mi.a, mi.b, mi.c, mi.d, mi.e, mi.f); X.drawImage(Lo, 0, 0); X.restore();
    // the torn edge: a darker lip, a light cut line, and loose threads pulled out of the weave into the gap
    const vis = E.filter(p => p[1] < front);
    if (vis.length > 1) {
      X.lineCap = 'round'; X.lineJoin = 'round';
      X.globalCompositeOperation = 'multiply'; X.strokeStyle = 'rgba(90,70,50,.35)'; X.lineWidth = 4; X.beginPath(); vis.forEach((p, i) => i ? X.lineTo(p[0] + side * 2, p[1]) : X.moveTo(p[0] + side * 2, p[1])); X.stroke();
      X.globalCompositeOperation = 'source-over'; X.strokeStyle = skRgba(silkC, .9); X.lineWidth = 1.4; X.beginPath(); vis.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
      const n = G.pts.length - 1;
      for (const pass of rim ? [0, 1] : [0]) {
        X.globalCompositeOperation = pass ? 'lighter' : 'source-over';
        X.strokeStyle = pass ? skRgba(rim, .55) : skRgba(silkC, .92); X.beginPath();
        for (const f of G.fib) {
          if (f.side !== side) continue;
          const fi = f.u * n, i0 = Math.floor(fi), p0 = E[i0], p1 = E[Math.min(n, i0 + 1)], px = lerp(p0[0], p1[0], fi - i0), py = lerp(p0[1], p1[1], fi - i0);
          if (py > front) continue;
          const L = f.len * fray * (.5 + .5 * clamp((front - py) / 120)), a = f.ang, dx = -side * Math.cos(a) * L, dy = Math.sin(a) * L + L * .25;
          X.moveTo(px, py); X.quadraticCurveTo(px + dx * .5 - f.curl * L * .3, py + dy * .5 + f.curl * L * .3, px + dx, py + dy);
        }
        X.lineWidth = pass ? 1.6 : .9; X.stroke();
      }
      if (rim) { X.globalCompositeOperation = 'lighter'; X.shadowColor = rim; X.shadowBlur = 14 * sc; X.strokeStyle = skRgba(rim, .7); X.lineWidth = 2; X.beginPath(); vis.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke(); X.shadowColor = 'transparent'; }
      X.globalCompositeOperation = 'source-over';
    }
    X.restore();
  }
  // threads still bridging the gap stretch, sag and snap as the halves part
  const n = G.pts.length - 1, EL = edge(-1), ER = edge(1);
  X.lineCap = 'round'; X.strokeStyle = skRgba(silkC, .85); X.lineWidth = .9; X.beginPath();
  for (const f of G.fib) {
    if (!f.bridge) continue;
    const fi = f.u * n, i0 = Math.floor(fi), py = lerp(G.pts[i0][1], G.pts[Math.min(n, i0 + 1)][1], fi - i0); if (py > front) continue;
    const a = applyT(-1, [lerp(EL[i0][0], EL[Math.min(n, i0 + 1)][0], fi - i0), py]), b = applyT(1, [lerp(ER[i0][0], ER[Math.min(n, i0 + 1)][0], fi - i0), py]);
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]); if (dist > f.blen) continue;
    const sag = (1 - dist / f.blen) * f.blen * .25 + 2;
    X.moveTo(a[0], a[1]); X.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, b[0], b[1]);
  }
  X.stroke();
  X.restore();
}
function skDissolveGeom(seed, R, n) {
  return skGeom(['dis', seed, R.join(','), n].join('|'), () => {
    const r = rng(seed * 5.3 + 2), [rx, ry, rw, rh] = R, out = [], cell = Math.sqrt(rw * rh / n);
    for (let i = 0; i < n; i++) { const big = r() < .3; out.push({ x: rx + r() * rw, y: ry + r() * rh, ki: Math.pow(r(), 1.2) * .6, rad: cell * (big ? 1.1 + r() * .5 : .45 + r() * .5), sd: r() * 50, lobes: 7 + Math.floor(r() * 8) }); }
    return out;
  });
}
function skDissolve(k, seed, drawA, drawB, o = {}) {
  const R = o.rect || [0, 0, W, H];
  if (k <= 0) { drawA(); return; }
  if (k >= 1) { drawB(); return; }
  const m = X.getTransform(), sc = skScale(m), G = skDissolveGeom(seed, R, o.n ?? 30);
  const rr = b => b.rad * 1.3 * Math.sqrt(easeOut(clamp((k - b.ki) / .45)));
  const shapes = (f = 1) => { for (const b of G) { const r = rr(b) * f; if (r > 1) skLobePath(b.x, b.y, r, b.sd, b.lobes, 96); } };
  const fill = clamp((k - .82) / .18);
  drawA();
  // the mask at 1/4 resolution (upscaled: a soft, wet edge)
  const M = skOn(skLay('_skDsM', .5), m, null, () => { X.fillStyle = '#fff'; for (const b of G) { const r = rr(b); if (r > 1) { X.beginPath(); skLobePath(b.x, b.y, r, b.sd, b.lobes, 96); X.fill(); } } if (fill > 0) { X.globalAlpha = fill; X.fillRect(R[0], R[1], R[2], R[3]); } });
  // pigment pushed to the bloom edges: a dark rim on A just outside B
  const rim = o.rim ?? SK_PAL.indigo, ra = (o.rimA ?? .55) * (1 - fill);
  if (ra > 0) {
    X.save(); X.beginPath(); X.rect(R[0], R[1], R[2], R[3]); X.clip(); X.globalCompositeOperation = o.rimOp || 'multiply'; X.lineJoin = 'round';
    // the water runs ahead of the pigment: a pale wet halo darkens A just beyond each bloom
    X.fillStyle = skRgba(rim, ra * .1); for (const b of G) { const r = rr(b) * 1.1 + 6; if (r > 8) { X.beginPath(); skLobePath(b.x, b.y, r, b.sd + 3, b.lobes, 72); X.fill(); } }
    X.strokeStyle = skRgba(rim, ra * .12); X.lineWidth = 12; X.beginPath(); shapes(); X.stroke(); X.lineWidth = 6; X.stroke();
    X.strokeStyle = skRgba(rim, ra * .7); X.lineWidth = 2.2; X.beginPath(); shapes(); X.stroke(); X.restore();
  }
  const B = skOn(skLay('_skDsB'), m, null, drawB);
  B.x.save(); B.x.setTransform(1, 0, 0, 1, 0, 0); B.x.globalCompositeOperation = 'destination-in'; B.x.imageSmoothingQuality = 'high'; B.x.drawImage(M, 0, 0, B.width, B.height); B.x.restore();
  X.save(); X.beginPath(); X.rect(R[0], R[1], R[2], R[3]); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(B, 0, 0); X.restore();
}
function skDripGeom(seed, R, n) {
  return skGeom(['drip', seed, R.join(','), n].join('|'), () => {
    const r = rng(seed * 2.9 + 3), [rx, , rw, rh] = R, out = [];
    for (let i = 0; i < n; i++) { const thin = r() < .35; out.push({ x: rx + rw * (i + .5 + (r() - .5) * .9) / n, w: rw / n * (thin ? .12 + r() * .15 : .3 + r() * .5), lead: rh * (thin ? .2 + r() * .55 : .04 + Math.pow(r(), 2) * .35), d: r() * .3, sd: r() * 20 }); }
    return out;
  });
}
function skDrip(k, seed, drawA, drawB, o = {}) {
  const R = o.rect || [0, 0, W, H];
  if (k <= 0) { drawA(); return; }
  if (k >= 1) { drawB(); return; }
  const m = X.getTransform(), sc = skScale(m), [rx, ry, rw, rh] = R, G = skDripGeom(seed, R, o.n ?? 22);
  const yc = ry - rh * .1 + rh * 1.25 * Math.pow(k, 1.35);
  const shape = (dil = 0) => {
    const n = 48; X.moveTo(rx - 20, ry - 20); X.lineTo(rx + rw + 20, ry - 20);
    for (let i = n; i >= 0; i--) { const xx = rx - 20 + (rw + 40) * i / n; X.lineTo(xx, yc + dil + noise1(xx / 60 + seed) * 10 + noise1(xx / 13 + seed * 3) * 3); }
    X.closePath();
    for (const d of G) {
      const g = clamp((k - d.d) / .35), yh = yc + d.lead * easeOut(g) * (1 + .15 * noise1(k * 3 + d.sd)); if (yh < yc + 2) continue;
      const w = d.w * (.7 + .3 * g) + dil * 2, hr = w * .62;
      const wob = u => noise1(u * 3 + d.sd) * w * .5, ym = lerp(yc + w, yh, .5);
      X.moveTo(d.x - w * 1.6, yc - 1); X.quadraticCurveTo(d.x - w / 2, yc, d.x - w / 2 + wob(0), yc + w * 1.2);
      X.quadraticCurveTo(d.x - w * .3 + wob(1), ym, d.x - w * .36 + wob(2), yh);
      X.arc(d.x + wob(2), yh, hr, Math.PI, 0, true);
      X.quadraticCurveTo(d.x + w * .3 + wob(1), ym, d.x + w / 2 + wob(0), yc + w * 1.2); X.quadraticCurveTo(d.x + w / 2, yc, d.x + w * 1.6, yc - 1); X.closePath();
    }
  };
  drawA();
  const col = o.color || SK_PAL.neonPink, M = skOn(skLay('_skDrM', .25), m, null, () => { X.fillStyle = '#fff'; X.beginPath(); shape(); X.fill(); });
  // the dripping colour: a band just outside B (glowing if neon)
  X.save(); X.beginPath(); X.rect(rx, ry, rw, rh); X.clip();
  if (o.glow) {
    const Gl = skOn(skLay('_skDrG', .25), m, null, () => { X.fillStyle = col; X.beginPath(); shape(8); X.fill(); });
    skBlit(Gl, null, .9, 'lighter', `blur(${8 * sc * .25}px)`);
    X.fillStyle = skMix(col, '#FFFFFF', .3); X.beginPath(); shape(3); X.fill(); X.fillStyle = skMix(col, '#FFFFFF', .85); X.beginPath(); shape(1.2); X.fill();
  } else {
    X.globalCompositeOperation = 'multiply'; X.fillStyle = skRgba(col, .6); X.beginPath(); shape(7); X.fill();
    X.fillStyle = skRgba(col, .45); X.beginPath(); shape(3); X.fill();
  }
  X.restore();
  const B = skOn(skLay('_skDrB'), m, null, drawB);
  B.x.save(); B.x.setTransform(1, 0, 0, 1, 0, 0); B.x.globalCompositeOperation = 'destination-in'; B.x.imageSmoothingQuality = 'high'; B.x.drawImage(M, 0, 0, B.width, B.height); B.x.restore();
  X.save(); X.beginPath(); X.rect(rx, ry, rw, rh); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(B, 0, 0); X.restore();
}

// =====================================================================================================================
// MOTIFS
// =====================================================================================================================
// The idol's proportions (from common/src/chars/idol.js idolHead), as plain geometry both media can draw.
function skFaceGeo(R, t, o = {}) {
  const turn = o.turn || 0, fx = turn * R * .22, sway = o.sway ?? Math.sin(t * 2.1) * .025, crown = o.crown ?? 1, lost = o.lost || 0;
  const petal = (a, dist, len, wid) => {
    const cx = Math.cos(a), sy = Math.sin(a), px = -turn * R * .06 + cx * dist, py = -R * .06 + sy * dist, pts = [];
    for (let k = 0; k < 16; k++) {
      const u = k / 16 * TAU, along = Math.cos(u), side = Math.sin(u) * (along < 0 ? .55 + .45 * (1 + along) : 1);
      pts.push([px + cx * along * len - sy * side * wid, py + sy * along * len + cx * side * wid]);
    }
    return { a, pts, root: [px - cx * len, py - sy * len], tip: [px + cx * len, py + sy * len], c: [px, py] };
  };
  const back = [], front = [];
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (i + .5) / 12 * TAU + sway * 1.4 + Math.sin(t * 1.1 + i * 1.7) * .02;
    if (Math.sin(a) > .7) continue; back.push(petal(a, R * 1.28 * crown, R * .62 * crown, R * .27));
  }
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + i / 12 * TAU + sway + Math.sin(t * 1.3 + i) * .02;
    if (Math.sin(a) > .7) continue; front.push(petal(a, R * 1.2 * crown, R * .56 * crown * (i % 2 ? .94 : 1), R * .3));
  }
  if (lost) front.splice(Math.max(0, front.length - lost), lost);
  const hair = [[-R * 1.02 - fx * .15, R * .15], [-R * 1.1, -R * .45], [-R * .72, -R * 1.02], [0, -R * 1.16], [R * .72, -R * 1.02], [R * 1.1, -R * .45], [R * 1.02 - fx * .15, R * .15], [R * .98, R * .8], [R * .78, R * .98], [R * .5, R * .7], [-R * .5, R * .7], [-R * .78, R * .98], [-R * .98, R * .8]];
  const face = [];
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, s = Math.sin(a), c = Math.cos(a), wx = .88 - .2 * Math.pow(Math.max(0, s), 2.2); face.push([c * R * wx + fx * .35 * (1 - Math.abs(c)), s * R * (s > 0 ? 1.04 : .96)]); }
  const tips = [[-.98, .38], [-.74, -.02], [-.52, -.16], [-.3, .02], [-.08, -.12], [.14, .04], [.36, -.14], [.58, -.02], [.8, -.2], [.98, .38]];
  const valley = [[-.86, -.34], [-.63, -.4], [-.41, -.34], [-.19, -.38], [.03, -.36], [.25, -.38], [.47, -.36], [.69, -.4], [.9, -.3]];
  const fr = []; for (let i = tips.length - 1; i >= 0; i--) { fr.push([tips[i][0] * R + fx * .5, tips[i][1] * R]); if (i > 0) fr.push([valley[i - 1][0] * R + fx * .5, valley[i - 1][1] * R]); }
  const crownPts = [[-R * 1.06 + fx * .1, R * .2], [-R * 1.1, -R * .45], [-R * .7, -R * 1.04], [0, -R * 1.16], [R * .7, -R * 1.04], [R * 1.1, -R * .45], [R * 1.06 + fx * .1, R * .2]];
  const lock = sd => [[sd * R * 1.05 + fx * .1, -R * .1], [sd * R * .98 + fx * .1, R * .6], [sd * R * .9 + fx * .1, R * .95], [sd * R * .8 + fx * .1, R * .55], [sd * R * .82 + fx * .1, R * .05]];
  const eyes = [-1, 1].map(sd => { const far = turn !== 0 && sd === -Math.sign(turn), sq = far ? 1 - Math.abs(turn) * .32 : 1 + Math.abs(turn) * .05; return { sd, x: sd * R * .39 + fx * (far ? .7 : 1.25), y: R * .17, rx: R * 1.06 * .21 * sq, ry: R * 1.06 * .25 }; });
  return { back, front, hair, face, fringe: [...crownPts, ...fr], lockL: lock(-1), lockR: lock(1), eyes, mouth: [fx * 1.25, R * .62], clip: [R * .74 + fx * .2, -R * .56], fx };
}
const skEll = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
// The face as a silk painting: ink outline + watercolour fills, petals as washes, painted tears.
function skFacePortrait(x, y, R, t, o = {}) {
  o = { sway: 0, sparkRot: .3, ...o };   // a painting holds still (motion comes from the camera); pass sway/sparkRot to animate
  const G = skFaceGeo(R, o.animate ? t : 0, o), sd0 = o.seed ?? 3, ns = R / 160, lw = R * .014;
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0);
  // ---- petal crown: two ochre rings, sienna pooled at the edges, rose blushing into the tips (never painted under the hair) ----
  const hairL = skFlatten(() => pathSmooth(G.hair, true, .9)), faceL = skFlatten(() => pathSmooth(G.face));
  X.save(); X.beginPath(); X.rect(-R * 4, -R * 4, R * 8, R * 8); skReplay(hairL); X.clip('evenodd');
  skWash(() => G.back.forEach(p => pathSmooth(p.pts)), SK_PAL.ochre, { a: .5, edge: .75, color2: SK_PAL.sienna, mix: .7, seed: sd0, blur: 4 * ns, spread: 12 * ns, scale: ns, feather: .1 });
  skWash(() => G.front.forEach(p => pathSmooth(p.pts)), '#D9B46A', { a: .36, edge: .7, color2: SK_PAL.ochre, mix: .6, seed: sd0 + 1, blur: 4 * ns, spread: 10 * ns, scale: ns, feather: .1 });
  skWash(() => G.front.forEach(p => { const cx = lerp(p.c[0], p.tip[0], .6), cy = lerp(p.c[1], p.tip[1], .6); X.moveTo(cx + Math.cos(p.a) * R * .2, cy + Math.sin(p.a) * R * .2); X.ellipse(cx, cy, R * .2, R * .09, p.a, 0, TAU); }), SK_PAL.rose, { a: .14, edge: .15, feather: .9, seed: sd0 + 2, blur: 6 * ns, spread: 10 * ns, scale: ns });
  // ink: loose petal outlines (one side and the tip, like a quick contour) and a centre vein
  skInk(G.front.map(p => { const n = p.pts.length; return [...p.pts.slice(Math.round(n * .62)), ...p.pts.slice(0, Math.round(n * .45))].map((q, i, a) => [q[0], q[1], .55 + .45 * Math.sin(i / (a.length - 1) * Math.PI)]); }), { w: lw * 1.1, dry: .35, alpha: .75, tail: .4, seed: sd0, bleed: .8 });
  skInk(G.front.map(p => [[lerp(p.root[0], p.c[0], .7), lerp(p.root[1], p.c[1], .7)], [lerp(p.c[0], p.tip[0], .5), lerp(p.c[1], p.tip[1], .5)]]), { w: lw * .6, alpha: .35, color: SK_PAL.sienna, dry: .2 });
  skInk(G.back.map(p => { const n = p.pts.length; return p.pts.slice(Math.round(n * .7)).concat(p.pts.slice(0, Math.round(n * .3))); }), { w: lw * .8, dry: .5, alpha: .45, seed: sd0 + 4 });
  X.restore();
  // ---- neck: a skin wash fading into the bare silk ----
  X.save(); X.beginPath(); X.rect(-R * 4, -R * 4, R * 8, R * 8); skReplay(faceL); X.clip('evenodd');
  skWash(() => { X.moveTo(-R * .24 + G.fx * .3, R * .8); X.lineTo(R * .24 + G.fx * .3, R * .8); X.lineTo(R * .27 + G.fx * .3, R * 1.55); X.lineTo(-R * .27 + G.fx * .3, R * 1.55); X.closePath(); }, SK_PAL.skin, { a: .34, edge: .45, feather: .2, seed: sd0 + 30, scale: ns, grad: [0, R * 1.0, 0, R * 1.55], gradTo: 0, color2: SK_PAL.rose, mix: .3 });
  skWash(() => X.ellipse(G.fx * .3, R * 1.05, R * .25, R * .08, 0, 0, TAU), SK_PAL.sienna, { a: .22, edge: .2, feather: .8, seed: sd0 + 31, scale: ns });
  X.restore();
  // ---- hair: a sienna bob (not under the face), with rose worked in wet ----
  X.save(); X.beginPath(); X.rect(-R * 4, -R * 4, R * 8, R * 8); skReplay(faceL); X.clip('evenodd');
  skWash(() => pathSmooth(G.hair, true, .9), SK_PAL.sienna, { a: .5, edge: .7, color2: SK_PAL.rose, mix: .45, seed: sd0 + 5, blur: 5 * ns, spread: 20 * ns, scale: ns });
  X.restore();
  // ---- face: bare silk warmed by a thin skin wash, a shadow on the far side, rose blush ----
  skWash(() => pathSmooth(G.face), SK_PAL.skin, { a: .3, edge: .4, feather: .25, seed: sd0 + 7, blur: 3 * ns, spread: 24 * ns, scale: ns, gran: .25, color2: '#F2D6C0', mix: .5 });
  const shs = o.turn ? -Math.sign(o.turn) : -1;
  skWash(() => pathSmooth(G.face), SK_PAL.rose, { a: .22, edge: .2, feather: .5, seed: sd0 + 8, scale: ns, grad: [shs * R * .95, 0, shs * R * .2, 0], gradTo: 0, color2: SK_PAL.ochre, mix: .5 });
  const bl = o.blush ?? 1;
  if (bl > 0) skWash(() => { for (const e of G.eyes) { X.moveTo(e.x + e.sd * R * .1 + R * .17, R * .46); X.ellipse(e.x + e.sd * R * .1, R * .46, R * .17, R * .09, 0, 0, TAU); } }, SK_PAL.rose, { a: .35 * bl, edge: .25, feather: .85, seed: sd0 + 9, blur: 6 * ns, scale: ns });
  // ---- eyes ----
  const eyes = o.eyes || 'open', open = eyes === 'down' ? .55 : eyes === 'closed' ? 0 : clamp(o.open ?? 1), look = eyes === 'down' ? [o.look?.[0] ?? 0, .7] : (o.look || [0, 0]);
  for (const e of G.eyes) {
    X.save(); X.translate(e.x, e.y);
    const oy = e.ry * open, cy = (e.ry - oy) * .5;
    if (open > .08) {
      X.save(); X.globalAlpha = .75; X.fillStyle = SK_PAL.silkHi; X.beginPath(); X.ellipse(0, cy, e.rx, oy, 0, 0, TAU); X.fill(); X.restore();
      X.save(); X.beginPath(); X.ellipse(0, cy, e.rx, oy, 0, 0, TAU); X.clip();
      const ix = look[0] * e.rx * .35, iy = look[1] * e.ry * .3 + R * .02, ir = R * .19;
      skWash(() => X.arc(ix, iy, ir, 0, TAU), SK_PAL.sienna, { a: .72, edge: .8, color2: SK_PAL.ink, mix: .35, seed: sd0 + 11 + e.sd, blur: 1.5 * ns, spread: 5 * ns, scale: ns * .5, feather: .05, rough: .2 });
      skWash(() => sparkPath(ix, iy + ir * .05, ir * .72, 6, .2, o.sparkRot ?? t * .6, .55), SK_PAL.ochre, { a: .6, edge: .5, seed: sd0 + 13, blur: 1 * ns, spread: 3 * ns, scale: ns * .4, feather: .05, rough: .15, op: 'source-over', alpha: .8 });
      X.globalCompositeOperation = 'multiply'; X.fillStyle = skRgba(SK_PAL.ink, .9); X.beginPath(); X.arc(ix, iy + ir * .05, ir * .17, 0, TAU); X.fill();
      X.globalCompositeOperation = 'source-over'; X.fillStyle = 'rgba(255,253,246,.92)'; X.beginPath(); X.arc(ix - ir * .42, iy - ir * .42, ir * .2, 0, TAU); X.fill(); X.beginPath(); X.arc(ix + ir * .38, iy + ir * .4, ir * .09, 0, TAU); X.fill();
      X.restore();
      // lash line: pressed at the outer corner, lifted at the inner; a flick of a wing; a faint lower lid
      skInk([skEll(0, cy, e.rx * 1.04, oy * 1.04, e.sd > 0 ? Math.PI * 1.1 : Math.PI * 1.9, e.sd > 0 ? Math.PI * 1.93 : Math.PI * 1.07, 14).map((p, i) => [p[0], p[1], .35 + .65 * i / 14])], { w: R * .065, tail: .12, tip: .7, dry: .3, seed: sd0 + e.sd * 3 });
      const wa = e.sd > 0 ? Math.PI * 1.93 : Math.PI * 1.07, wx = Math.cos(wa) * e.rx, wy = cy + Math.sin(wa) * oy;
      skInk([[wx, wy, 1], [wx + e.sd * R * .06, wy - R * .035], [wx + e.sd * R * .11, wy - R * .075, .5]], { w: R * .035, tail: .6, dry: .4, seed: sd0 + e.sd * 5 });
      skInk([skEll(0, cy, e.rx * .88, oy * 1.02, Math.PI * .28, Math.PI * .72, 8)], { w: R * .016, alpha: .45, dry: .5, color: SK_PAL.sienna });
    } else {
      skInk([skEll(0, 0, e.rx, R * .08, Math.PI * .1, Math.PI * .9, 12).map(p => [p[0], p[1] - R * .03])], { w: R * .05, dry: .3, seed: sd0 + e.sd });
    }
    X.restore();
  }
  // brows peek from under the fringe; sad = inner ends raised
  const sad = eyes === 'down' || o.sad;
  skInk(G.eyes.map(e => { const bx = e.x, by = -R * .15; return sad ? [[bx - e.sd * R * .15, by - R * .06], [bx, by - R * .03], [bx + e.sd * R * .15, by + R * .02]] : [[bx - e.sd * R * .14, by], [bx, by - R * .045], [bx + e.sd * R * .14, by + R * .015]]; }), { w: R * .035, color: SK_PAL.sienna, alpha: .7, dry: .4 });
  // nose and mouth
  skInk([[G.fx * 1.3 + R * .015, R * .38], [G.fx * 1.3 - R * .025, R * .45, .7]], { w: R * .022, color: SK_PAL.sienna, alpha: .55 });
  const [mx, my] = G.mouth, mo = clamp(o.mouth || 0);
  if (mo > .06) skWash(() => { const w2 = R * (.07 + .06 * mo), h2 = R * (.03 + .1 * mo); X.moveTo(mx - w2, my); X.quadraticCurveTo(mx, my - h2 * .5, mx + w2, my); X.quadraticCurveTo(mx, my + h2 * 1.6, mx - w2, my); }, SK_PAL.rose, { a: .7, edge: .6, color2: SK_PAL.cinnabar, mix: .6, seed: sd0 + 15, scale: ns * .5, blur: 1.5 * ns, spread: 4 * ns });
  skWash(() => X.ellipse(mx, my + R * .02, R * .07, R * .03, 0, 0, TAU), SK_PAL.rose, { a: .35, edge: .4, feather: .5, seed: sd0 + 16, scale: ns * .5 });
  skInk([sad && mo < .06 ? [[mx - R * .07, my + R * .02], [mx, my - R * .012], [mx + R * .07, my + R * .02, .5]] : [[mx - R * .08, my - R * .01], [mx, my + R * .045], [mx + R * .08, my - R * .01, .5]]], { w: R * .026, color: SK_PAL.cinnabar, alpha: .8, dry: .2 });
  // ---- fringe and side locks over the forehead ----
  skWash(() => { pathSmooth(G.lockL); pathSmooth(G.lockR); pathPoly(G.fringe); }, SK_PAL.sienna, { a: .48, edge: .75, color2: SK_PAL.ochre, mix: .5, seed: sd0 + 17, blur: 3 * ns, spread: 10 * ns, scale: ns });
  // ---- ink contours: broken, pressed and lifted ----
  const F = G.face, seg = (a, b) => { const o2 = []; for (let i = a; i <= b; i++) o2.push(F[((i % 36) + 36) % 36]); return o2; };
  skInk([seg(3, 9).map((p, i) => [p[0], p[1], .3 + i / 8]), seg(10, 15).map((p, i) => [p[0], p[1], 1 - i / 7])], { w: R * .03, dry: .3, seed: sd0 + 21, tail: .3 });
  skInk([G.hair.slice(0, 7), G.hair.slice(6, 9), G.hair.slice(10).concat([G.hair[0]])], { w: R * .028, dry: .45, seed: sd0 + 22 });
  // fringe: locks brushed from the hairline down to their points
  const fr = G.fringe.slice(7), locks = [];
  for (let j = 1; j < fr.length - 1; j += 2) { const v = fr[j]; for (const tp of [fr[j + 1]]) locks.push([[v[0], v[1], 1], [lerp(v[0], tp[0], .5) + (tp[0] - v[0]) * .12, lerp(v[1], tp[1], .5)], [tp[0], tp[1], .15]]); }
  skInk(locks, { w: R * .022, dry: .4, alpha: .78, seed: sd0 + 23, tail: .6, tip: .1 });
  skInk([G.lockL.slice(0, 3), G.lockR.slice(0, 3)], { w: R * .02, dry: .5, alpha: .7, seed: sd0 + 24 });
  const strands = []; for (let i = 0; i < 5; i++) { const u = -.7 + i * .35; strands.push([[u * R * .5 + G.fx * .3, -R], [u * R * .8 + G.fx * .4, -R * .62], [u * R + G.fx * .5, -R * .36]]); }
  skInk(strands, { w: R * .012, alpha: .45, dry: .6, color: SK_PAL.sienna });
  // spark hair clip
  withT(G.clip[0], G.clip[1], (o.sparkRot ?? t * .8), 1, () => {
    skWash(() => sparkPath(0, 0, R * .22, 6, .28, 0, .6), SK_PAL.ochre, { a: .7, edge: .8, color2: SK_PAL.rose, mix: .4, seed: sd0 + 25, scale: ns * .4, blur: 1.2 * ns, spread: 4 * ns });
    skInk(() => sparkPath(0, 0, R * .22, 6, .28, 0, .6), { w: R * .012, alpha: .7, dry: .3 });
  });
  // ---- painted tears: they gather at the lower lid, run down the cheek and bleed into the silk ----
  const tr = o.tears || 0;
  if (tr > 0) for (const e of G.eyes) skBleed(e.x + e.sd * e.rx * .35, e.y + e.ry * .85, SK_PAL.indigo, t, 0, { k: clamp(tr * (e.sd > 0 ? 1 : .8)), len: R * (o.tearLen ?? .85), w: R * .07, seed: sd0 + e.sd * 7, a: .34, color2: SK_PAL.rose });
  X.restore();
}
// The same face as neon tubes: outline, eyes with the spark iris, petals, neon tears dropping at o.tearT.
function skFaceNeon(x, y, R, t, o = {}) {
  if (o.reflect !== undefined && o.reflect !== null && o.reflect !== false) {
    const rf = typeof o.reflect === 'number' ? { y: o.reflect } : o.reflect;
    skReflect(() => skFaceNeon(x, y, R, t, { ...o, reflect: null }), rf.y, { t, ...rf });
  }
  const G = skFaceGeo(R, t, o), C = { line: SK_PAL.neonCyan, petal: SK_PAL.neonPink, eye: SK_PAL.neonWhite, tear: SK_PAL.neonCyan, ...(o.colors || {}) };
  const w = o.w ?? Math.max(2.2, R * .028), base = { on: o.on, flicker: o.flicker, ground: o.ground, t, w };
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0);
  // petals: the front ring as teardrop tubes, the back ring as single strokes between them
  skNeon(() => G.back.forEach(p => { X.moveTo(lerp(p.root[0], p.c[0], .9), lerp(p.root[1], p.c[1], .9)); X.lineTo(lerp(p.c[0], p.tip[0], .7), lerp(p.c[1], p.tip[1], .7)); }), C.petal, { ...base, seed: 11, I: .55, w: w * .8, halo: .8 });
  skNeon(() => G.front.forEach(p => pathSmooth(p.pts)), C.petal, { ...base, seed: 12, halo: .8 });
  // head: the outer silhouette of the bob, the jaw, the fringe
  const H = G.hair, fr = G.fringe.slice(7);
  skNeon(() => { pathSmooth([H[11], H[12], ...H.slice(0, 9)], false, .9); const F = G.face; pathSmooth([F[33], F[34], F[35], ...F.slice(0, 22)], false); X.moveTo(fr[0][0], fr[0][1]); for (let j = 1; j + 1 < fr.length; j += 2) X.quadraticCurveTo(fr[j][0], fr[j][1] + R * .2, fr[j + 1][0], fr[j + 1][1]); }, C.line, { ...base, seed: 13, halo: .8 });
  const eyes = o.eyes || 'open', open = eyes === 'down' ? .6 : eyes === 'closed' ? 0 : 1;
  skNeon(() => {
    for (const e of G.eyes) {
      const oy = e.ry * open, cy = e.y + (e.ry - oy) * .5;
      if (open > .08) { X.moveTo(e.x + e.rx, cy); X.ellipse(e.x, cy, e.rx, oy, 0, 0, TAU); const wa = e.sd > 0 ? Math.PI * 1.95 : Math.PI * 1.05; X.moveTo(e.x + Math.cos(wa) * e.rx, cy + Math.sin(wa) * oy); X.lineTo(e.x + Math.cos(wa) * e.rx + e.sd * R * .11, cy + Math.sin(wa) * oy - R * .09); }
      else { X.moveTo(e.x - e.rx, e.y); X.quadraticCurveTo(e.x, e.y + R * .1, e.x + e.rx, e.y); }
    }
    const [mx, my] = G.mouth; X.moveTo(mx - R * .08, my - R * .01); X.quadraticCurveTo(mx, my + R * .06, mx + R * .08, my - R * .01);
  }, C.eye, { ...base, seed: 14, w: w * .85, halo: .7 });
  skNeon(() => {
    if (open > .08) for (const e of G.eyes) { const oy = e.ry * open, iy = e.y + (e.ry - oy) * .5 + (eyes === 'down' ? oy * .3 : 0); sparkPath(e.x, iy, Math.min(R * .12, oy * .75), 6, .25, o.sparkRot ?? t * .6, .55); }
    for (const e of G.eyes) for (let k = 0; k < 3; k++) { const bx = e.x + e.sd * R * .06 + (k - 1) * R * .07, by = R * .47; X.moveTo(bx + R * .025, by - R * .03); X.lineTo(bx - R * .025, by + R * .03); }
  }, C.petal, { ...base, seed: 15, w: w * .6, halo: .6 });
  // neon tears: a bright drop swells at the lid, falls with gravity, leaves a fading trail
  for (const tt of (o.tearT || [])) {
    const age = t - tt; if (age < 0 || age > 1.8) continue;
    G.eyes.forEach((e, ei) => {
      if ((o.tearEye ?? 2) !== 2 && ei !== o.tearEye) return;
      const x0 = e.x + e.sd * e.rx * .35, y0 = e.y + e.ry * .85, fall = age < .25 ? 0 : Math.pow((age - .25) / 1.2, 2) * R * 2.2, yy = y0 + fall + R * .03 * clamp(age / .25);
      const s = R * .075 * (.6 + .4 * clamp(age / .25)), fade = 1 - clamp((age - 1.3) / .5);
      skNeon(() => { X.moveTo(x0, yy - s * 2.2); X.quadraticCurveTo(x0 + s * 1.1, yy - s * .2, x0, yy + s); X.quadraticCurveTo(x0 - s * 1.1, yy - s * .2, x0, yy - s * 2.2); }, C.tear, { ...base, seed: 16 + ei, w: w * .75, I: fade, halo: 1.3 });
      if (fall > s) skNeon(() => { X.moveTo(x0, y0); X.lineTo(x0, yy - s * 2.4); }, C.tear, { ...base, seed: 18 + ei, w: w * .35, I: .45 * fade * (1 - clamp(age / 1.4)), halo: .7 });
    });
  }
  X.restore();
}

// ---------- the porcelain mask ----------
function skMaskGeom(seed, at) {
  return skGeom(['mask', seed, at.join(',')].join('|'), () => {
    const r = rng(seed * 4.1 + 7), segs = [], inside = (x, y) => (x * x) / (.95 * .95) + (y * y) / (1.25 * 1.25) < 1, nMain = 7;
    const grow = (x, y, a, d, len, wd, depth) => {
      let px = x, py = y, dd = d;
      for (let s = 0; s < len; s++) {
        a += (r() - .5) * (r() < .2 ? .9 : .25); const st = .03 + r() * .05, nx = px + Math.cos(a) * st, ny = py + Math.sin(a) * st;
        if (!inside(nx, ny)) break;
        segs.push({ x0: px, y0: py, x1: nx, y1: ny, d0: dd, d1: dd + st, w: wd * (1 - s / len * .6) }); dd += st; px = nx; py = ny;
        if (depth < 2 && r() < .13) grow(px, py, a + (r() < .5 ? 1 : -1) * (.5 + r() * .7), dd, Math.floor(len * .45), wd * .6, depth + 1);
      }
      return dd;
    };
    const ends = [];
    for (let i = 0; i < nMain; i++) { const a = i / nMain * TAU + (r() - .5) * .6; ends.push(a); grow(at[0], at[1], a, 0, 22 + Math.floor(r() * 20), 1, 0); }
    // spider-web rings between the main branches near the impact
    for (const rad of [.09, .2]) { const as = ends.slice().sort((p, q) => p - q); for (let i = 0; i < as.length; i++) { if (r() < .35) continue; const a0 = as[i], a1 = as[(i + 1) % as.length] + (i + 1 === as.length ? TAU : 0), n = 4; for (let k = 0; k < n; k++) { const u0 = lerp(a0, a1, k / n), u1 = lerp(a0, a1, (k + 1) / n), rr = rad * (1 + (r() - .5) * .3); segs.push({ x0: at[0] + Math.cos(u0) * rr, y0: at[1] + Math.sin(u0) * rr, x1: at[0] + Math.cos(u1) * rr, y1: at[1] + Math.sin(u1) * rr, d0: rad * 2.2 + k * .02, d1: rad * 2.2 + (k + 1) * .02, w: .5 }); } } }
    const maxD = Math.max(...segs.map(s => s.d1));
    const chips = []; for (let i = 0; i < 7; i++) { const a = r() * TAU, rr = .02 + r() * .08, sz = .02 + r() * .035; chips.push({ x: at[0] + Math.cos(a) * rr, y: at[1] + Math.sin(a) * rr, sz, rot: r() * TAU, vx: (r() - .5) * .3, k0: .78 + r() * .15 }); }
    return { segs, maxD, chips };
  });
}
function skCrackleTex() {
  if (SK_TEX.crackle) return SK_TEX.crackle;
  const S = 512, c = mkCanvas(S, S), g = c.getContext('2d'), r = rng(61);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 130; i++) {
    let x = r() * S, y = r() * S, a = r() * TAU; const pts = [[x, y]], n = 6 + Math.floor(r() * 16);
    for (let k = 0; k < n; k++) { a += (r() - .5) * .9; x += Math.cos(a) * 11; y += Math.sin(a) * 11; pts.push([x, y]); }
    g.strokeStyle = `rgba(110,125,150,${.12 + r() * .25})`; g.lineWidth = .5 + r() * .4;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0] + ox, p[1] + oy) : g.moveTo(p[0] + ox, p[1] + oy)); g.stroke(); }
  }
  return (SK_TEX.crackle = c);
}
function skMask(x, y, R, o = {}) {
  const crack = clamp(o.crack || 0), at = o.at || [-.32, -.62], G = skMaskGeom(o.seed ?? 5, at), dark = o.ground === 'dark';
  X.save(); X.translate(x, y); X.rotate(o.rot || 0);
  const outline = () => pathSmooth([[0, -R * 1.26], [R * .62, -R * 1.1], [R * .93, -R * .62], [R * .97, -R * .05], [R * .86, R * .45], [R * .6, R * .88], [R * .26, R * 1.14], [0, R * 1.2], [-R * .26, R * 1.14], [-R * .6, R * .88], [-R * .86, R * .45], [-R * .97, -R * .05], [-R * .93, -R * .62], [-R * .62, -R * 1.1]], true, 1);
  const eyeP = sd => { const ex = sd * R * .38, ey = -R * .12; X.moveTo(ex - R * .25, ey + R * .01); X.quadraticCurveTo(ex - sd * R * .02, ey - R * .17, ex + R * .25, ey - R * .015 * sd); X.quadraticCurveTo(ex + sd * R * .02, ey + R * .12, ex - R * .25, ey + R * .01); X.closePath(); };
  // drop shadow and glaze body
  X.save(); X.shadowColor = dark ? 'rgba(0,0,0,.7)' : 'rgba(70,50,30,.35)'; X.shadowBlur = R * .18 * skScale(); X.shadowOffsetX = R * .05 * skScale(); X.shadowOffsetY = R * .09 * skScale();
  const gb = X.createRadialGradient(-R * .3, -R * .45, R * .1, 0, 0, R * 1.35); gb.addColorStop(0, '#FFFFFF'); gb.addColorStop(.45, SK_PAL.glaze); gb.addColorStop(.8, '#DCE1E6'); gb.addColorStop(1, '#B9C3CF');
  X.fillStyle = gb; X.beginPath(); outline(); X.fill(); X.restore();
  X.save(); X.beginPath(); outline(); X.clip();
  // relief: brow ridge, cheek hollows and a nose ridge as soft blue-grey shading
  X.globalCompositeOperation = 'multiply';
  const sh = (cx, cy, rx, ry, a) => { const g = X.createRadialGradient(cx, cy, 0, cx, cy, rx); g.addColorStop(0, `rgba(170,184,204,${a})`); g.addColorStop(1, 'rgba(170,184,204,0)'); X.save(); X.translate(cx, cy); X.scale(1, ry / rx); X.translate(-cx, -cy); X.fillStyle = g; X.fillRect(cx - rx, cy - rx, rx * 2, rx * 2); X.restore(); };
  sh(R * .55, R * .3, R * .45, R * .6, .5); sh(-R * .62, R * .35, R * .35, R * .5, .3); sh(R * .12, R * .22, R * .1, R * .3, .45); sh(0, R * .95, R * .5, R * .25, .35);
  // eye sockets under the brow ridge, the nose's side and tip, the hollow under the lip
  for (const sd of [-1, 1]) sh(sd * R * .38, -R * .1, R * .34, R * .2, sd > 0 ? .6 : .42);
  sh(R * .1, R * .3, R * .07, R * .16, .55); sh(0, R * .44, R * .12, R * .05, .5); sh(0, R * .8, R * .14, R * .06, .45); sh(R * .8, -R * .3, R * .3, R * .9, .35);
  // crackle glaze
  const cp = X.createPattern(skCrackleTex(), 'repeat'); cp.setTransform(new DOMMatrix().scale(R / 300)); X.globalAlpha = .22; X.fillStyle = cp; X.fillRect(-R, -R * 1.3, R * 2, R * 2.6); X.globalAlpha = 1;
  X.globalCompositeOperation = 'source-over';
  // blue-and-white decoration in cobalt ink: brows, a lotus on the forehead, cloud scrolls, a painted tear
  const cob = o.ink || SK_PAL.cobalt;
  skInk([[[-R * .66, -R * .38, .4], [-R * .42, -R * .5], [-R * .14, -R * .42, .5]], [[R * .14, -R * .42, .5], [R * .42, -R * .5], [R * .66, -R * .38, .4]]], { w: R * .05, color: cob, dry: .35, alpha: .9, bleed: .6 });
  const lx = 0, ly = -R * .78;
  skInk([0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + (i - 2) * .55, L = R * (i === 2 ? .27 : .21); return [[lx, ly + R * .04], [lx + Math.cos(a - .25) * L * .6, ly + Math.sin(a - .25) * L * .6], [lx + Math.cos(a) * L, ly + Math.sin(a) * L, .4], [lx + Math.cos(a + .25) * L * .6, ly + Math.sin(a + .25) * L * .6, .6], [lx, ly + R * .04, .3]]; }), { w: R * .024, color: cob, dry: .15, alpha: .9, bleed: .5 });
  skWash(() => X.ellipse(lx, ly - R * .05, R * .13, R * .1, 0, 0, TAU), cob, { a: .08, edge: .35, feather: .5, scale: R / 300, seed: 3, gran: .6 });
  // a border of cobalt dots along the temples and jaw (blue-and-white ware)
  X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = skRgba(cob, .7);
  for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) { const a = Math.PI * (.08 + i * .065), rx = R * .8, ry = R * 1.02; X.beginPath(); X.arc(sd * Math.cos(a) * rx, Math.sin(a) * ry - R * .05, R * (.018 - i * .0012), 0, TAU); X.fill(); }
  X.restore();
  // the painted tear: a cobalt drop under the right eye
  if (o.tear !== false) {
    skInk([[[R * .4, R * .0, .3], [R * .41, R * .12, .6], [R * .4, R * .2, .9]]], { w: R * .03, color: cob, dry: .2, alpha: .75, tail: .1, attack: .5 });
    skWash(() => { const tx = R * .4, ty = R * .26; X.moveTo(tx, ty - R * .08); X.quadraticCurveTo(tx + R * .05, ty, tx, ty + R * .04); X.quadraticCurveTo(tx - R * .05, ty, tx, ty - R * .08); }, cob, { a: .7, edge: .8, feather: .05, scale: R / 500, seed: 8, blur: 1, spread: 3 });
  }
  // lips: a small cinnabar bud
  skWash(() => { X.moveTo(-R * .12, R * .66); X.quadraticCurveTo(-R * .05, R * .6, 0, R * .64); X.quadraticCurveTo(R * .05, R * .6, R * .12, R * .66); X.quadraticCurveTo(0, R * .76, -R * .12, R * .66); }, SK_PAL.cinnabar, { a: .6, edge: .6, feather: .1, scale: R / 400, seed: 9 });
  // glaze highlights
  X.globalCompositeOperation = 'screen';
  const hl = (cx, cy, rx, ry, rot, a) => { X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(1, ry / rx); const g = X.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = g; X.fillRect(-rx, -rx, rx * 2, rx * 2); X.restore(); };
  hl(-R * .35, -R * .75, R * .3, R * .1, -.5, .9); hl(-R * .55, R * .25, R * .16, R * .07, -1.1, .8); hl(R * .02, R * .1, R * .035, R * .2, 0, .75); hl(-R * .02, R * .7, R * .08, R * .025, 0, .6);
  X.globalCompositeOperation = 'source-over';
  // nostrils: two small cobalt-grey marks
  X.fillStyle = 'rgba(90,100,125,.55)'; for (const sd of [-1, 1]) { X.beginPath(); X.ellipse(sd * R * .06, R * .45, R * .025, R * .012, sd * .4, 0, TAU); X.fill(); }
  X.globalCompositeOperation = 'source-over';
  X.restore();
  // eye holes
  const glow = o.glow;
  for (const sd of [-1, 1]) {
    X.save(); X.beginPath(); eyeP(sd); X.clip();
    const eg = X.createLinearGradient(0, -R * .3, 0, R * .05); eg.addColorStop(0, '#07070B'); eg.addColorStop(1, '#1E1F2A'); X.fillStyle = eg; X.fillRect(-R, -R * .5, R * 2, R * .6);
    if (glow) { X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(sd * R * .38, -R * .1, 0, sd * R * .38, -R * .1, R * .25); g.addColorStop(0, skRgba(glow, .9)); g.addColorStop(1, skRgba(glow, 0)); X.fillStyle = g; X.fillRect(-R, -R * .5, R * 2, R * .6); }
    X.restore();
    inkStroke(() => eyeP(sd), skRgba(cob, .85), R * .022);
  }
  inkStroke(outline, dark ? 'rgba(120,135,160,.5)' : 'rgba(90,100,120,.45)', R * .012);
  // cracks: a spider-web from the impact, growing with o.crack; light leaks through if o.glow
  if (crack > 0) {
    const lim = crack * G.maxD, segs = [];
    for (const s of G.segs) { if (s.d0 >= lim) continue; const u = clamp((lim - s.d0) / (s.d1 - s.d0)); segs.push([s.x0 * R, s.y0 * R, lerp(s.x0, s.x1, u) * R, lerp(s.y0, s.y1, u) * R, s.w]); }
    X.lineCap = 'round';
    const strokeSegs = (col, wm, dx = 0, dy = 0) => { for (const bw of [1, .6, .3]) { X.strokeStyle = col; X.lineWidth = Math.max(.6, R * .012 * bw * wm); X.beginPath(); for (const s of segs) if ((s[4] > .8 ? 1 : s[4] > .45 ? .6 : .3) === bw) { X.moveTo(s[0] + dx, s[1] + dy); X.lineTo(s[2] + dx, s[3] + dy); } X.stroke(); } };
    if (glow) { X.save(); X.globalCompositeOperation = 'lighter'; X.shadowColor = glow; X.shadowBlur = R * .12 * skScale(); strokeSegs(skRgba(glow, .75), 2.4); X.restore(); }
    strokeSegs('rgba(255,255,255,.7)', .8, R * .006, R * .006);
    strokeSegs(glow ? skMix(glow, '#FFFFFF', .6) : 'rgba(28,30,40,.92)', 1);
    // chips break out of the impact and fall
    for (const c of G.chips) {
      const kk = clamp((crack - c.k0) / .2); if (kk <= 0) continue;
      const cx = c.x * R, cy = c.y * R, s = c.sz * R;
      X.fillStyle = glow ? skRgba(glow, .8) : '#15161E'; X.beginPath(); X.moveTo(cx - s, cy); X.lineTo(cx, cy - s * .8); X.lineTo(cx + s * .9, cy + s * .2); X.lineTo(cx - s * .1, cy + s * .7); X.closePath(); X.fill();
      withT(cx + c.vx * R * kk, cy + kk * kk * R * .9, c.rot + kk * 3, 1, () => { X.globalAlpha = 1 - kk * .7; X.fillStyle = SK_PAL.glaze; X.strokeStyle = 'rgba(80,90,110,.8)'; X.lineWidth = 1; X.beginPath(); X.moveTo(-s, 0); X.lineTo(0, -s * .8); X.lineTo(s * .9, s * .2); X.lineTo(-s * .1, s * .7); X.closePath(); X.fill(); X.stroke(); });
    }
  }
  X.restore();
}

// ---------- water rings ----------
function skRipple(x, y, t, t0, o = {}) {
  const age = t - t0; if (age < 0) return;
  const dur = o.dur ?? 2.6, n = o.n ?? 3, flat = o.flat ?? .3, R0 = o.r ?? 70;
  for (let j = 0; j < n; j++) {
    const a = age - j * .38; if (a < 0 || a > dur) continue;
    const k = a / dur, r = R0 * (.12 + .88 * Math.pow(k, .6)), al = Math.pow(1 - k, 1.5) * (o.alpha ?? 1);
    if (o.neon) { skNeon(() => X.ellipse(x, y, r, r * flat, 0, 0, TAU), o.neon, { w: (o.w ?? 2.4) * (1 - k * .5), I: al, halo: .7, seed: j + 1 }); continue; }
    X.save(); X.globalCompositeOperation = 'multiply'; X.lineCap = 'round';
    const col = o.color || SK_PAL.indigo, seg = 7 + j * 2;
    for (let s = 0; s < seg; s++) {   // broken ring: a brush circles the water and lifts
      const a0 = s / seg * TAU + hash(j * 3 + s) * .3, a1 = a0 + TAU / seg * (.55 + hash(j * 7 + s * 1.3) * .4);
      X.strokeStyle = skRgba(col, (.35 + .3 * hash(s + j)) * al); X.lineWidth = (o.w ?? 2.2) * (1 - k * .55) * (Math.sin(a0) > 0 ? 1.25 : .8);
      X.beginPath(); X.ellipse(x, y, r, r * flat, 0, a0, a1); X.stroke();
    }
    if (j === 0) { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, skRgba(col, .1 * al)); g.addColorStop(1, skRgba(col, 0)); X.save(); X.translate(x, y); X.scale(1, flat); X.translate(-x, -y); X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); X.restore(); }
    X.restore();
  }
}

// ---------- the silk-painted lotus ----------
// (x, y) = the base of the bloom (top of the stem), s = petal length.
const SK_LOTUS = [   // [angle from vertical, length, width, layer] — back row first, then the open front row
  [-.78, .95, .3, 0], [-.27, 1.05, .3, 0], [.27, 1.03, .3, 0], [.78, .94, .3, 0],
  [-1.5, .82, .28, 1], [1.48, .84, .28, 1], [-1.05, .9, .33, 1], [1.02, .9, .33, 1], [-.52, .95, .36, 1], [.5, .96, .36, 1], [0, .9, .38, 1],
];
const SK_SHED = [4, 5, 6, 7, 1, 8, 2, 9, 0, 3, 10];   // the order petals fall in
function skPetalPath(a, len, wid, bend = 0, cx = 0, cy = 0, curl = 1) {
  const pts = [], n = 14, ca = Math.sin(a), sa = -Math.cos(a);   // direction of the petal (up = angle 0)
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i <= n; i++) {
    const u = side < 0 ? i / n : 1 - i / n, wd = wid * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), .75) * (1 - Math.pow(u, 6) * .9) * curl;
    const along = len * u, off = side * wd + bend * u * u * len * .2;
    pts.push([cx + ca * along - sa * off, cy + sa * along + ca * off]);
  }
  pathSmooth(pts, true, .8);
}
function skFlower(x, y, s, t, o = {}) {
  const seed = o.seed ?? 2, ns = s / 150, water = o.water ?? y + s * 1.9, fd = o.fall ?? 3.2;
  const nShed = o.shed ?? 0, times = o.shedT || Array.from({ length: nShed }, (_, i) => (o.shedAt ?? 0) + i * (o.shedGap ?? 1.4));
  const shedOf = {}; for (let i = 0; i < Math.min(nShed, SK_SHED.length); i++) shedOf[SK_SHED[i]] = times[i] ?? -1e9;
  const sway = Math.sin(t * .7 + seed) * .03;
  X.save(); X.translate(x, y);
  // stem and leaf
  const stem = o.stem ?? s * 1.7;
  if (o.leaf !== false) {
    const lx = s * .95, ly = stem * .82;
    skWash(() => X.ellipse(lx, ly, s * 1.05, s * .32, -.08, 0, TAU), SK_PAL.celadon, { a: .55, edge: .75, color2: '#6F9478', mix: .6, seed: seed + 1, scale: ns, blur: 5 * ns, spread: 18 * ns, gran: .6 });
    skWash(() => { X.moveTo(lx - s * .9, ly + s * .05); X.ellipse(lx, ly + s * .04, s * .92, s * .22, -.08, Math.PI * .95, Math.PI * .05, true); X.closePath(); }, SK_PAL.indigo, { a: .18, edge: .3, feather: .5, seed: seed + 2, scale: ns });
    skInk(Array.from({ length: 9 }, (_, i) => { const a = Math.PI + i / 8 * Math.PI; return [[lx, ly], [lx + Math.cos(a) * s * .95, ly + Math.sin(a) * s * .29, .3]]; }), { w: s * .01, color: '#4E6B57', alpha: .55, dry: .4, seed: seed + 3 });
    skInk([skEll(lx, ly, s * 1.05, s * .32, -.3, Math.PI * .85, 20).map((p, i) => [p[0], p[1], .4 + .6 * Math.sin(i / 20 * Math.PI)])], { w: s * .02, color: SK_PAL.ink, alpha: .75, dry: .45, seed: seed + 4 });
  }
  skInk([[[sway * s, 0, .8], [s * .08, stem * .4], [-s * .02, stem * .75], [s * .05, stem, .6]]], { w: s * .05, color: '#58735F', dry: .35, tail: .2, tip: .7, seed: seed + 5, alpha: .9 });
  X.rotate(sway);
  // petals: rose washes paling to silk at the base, darker tips; the back row behind the seed pod
  const drawPetal = (p, i, extra = {}) => {
    const [a, l, wd] = SK_LOTUS[i], L = l * s, Wd = wd * s, tip = [Math.sin(a) * L, -Math.cos(a) * L];
    skWash(() => skPetalPath(a, L, Wd, (hash(i + seed) - .5) * .6, 0, 0, extra.curl ?? 1), SK_PAL.rose, { a: .4, edge: .75, color2: '#E3A6A4', mix: .6, grad: [tip[0], tip[1], 0, 0], gradTo: .12, seed: seed + i * 3, scale: ns, blur: 3 * ns, spread: 10 * ns, feather: .08, ...extra.wash });
    if (extra.ink !== false) skInk(() => skPetalPath(a, L, Wd, (hash(i + seed) - .5) * .6, 0, 0, extra.curl ?? 1), { w: s * .011, color: '#6E3B42', alpha: .6 * (extra.alpha ?? 1), dry: .5, seed: seed + i, bleed: .6 });
    if (extra.ink !== false) skInk([[[Math.sin(a) * L * .12, -Math.cos(a) * L * .12], [Math.sin(a) * L * .75, -Math.cos(a) * L * .75, .3]]], { w: s * .006, color: SK_PAL.rose, alpha: .5 * (extra.alpha ?? 1), dry: .3 });
  };
  for (let i = 0; i < SK_LOTUS.length; i++) {
    if (SK_LOTUS[i][3] !== 0) continue; if (shedOf[i] !== undefined && t >= shedOf[i]) continue; drawPetal(null, i);
  }
  skWash(() => X.ellipse(0, -s * .52, s * .14, s * .05, 0, 0, TAU), SK_PAL.celadon, { a: .4, edge: .6, color2: '#C9C07A', mix: .6, seed: seed + 30, scale: ns * .5 });
  skInk([skEll(0, -s * .52, s * .14, s * .05, Math.PI * 1.05, Math.PI * 1.95, 12)], { w: s * .01, alpha: .5, dry: .4 });
  for (let i = 0; i < SK_LOTUS.length; i++) {
    if (SK_LOTUS[i][3] !== 1) continue; if (shedOf[i] !== undefined && t >= shedOf[i]) continue; drawPetal(null, i);
  }
  X.restore();
  // falling petals: detach, drift and curl, wither, land on the water and dissolve into rings
  for (const k of Object.keys(shedOf)) {
    const i = +k, T0 = shedOf[i], age = t - T0; if (age < 0) continue;
    const [a, l] = SK_LOTUS[i], L = l * s, cx0 = x + Math.sin(a) * L * .45, cy0 = y - Math.cos(a) * L * .45;
    const fk = clamp(age / fd), yy = lerp(cy0, water, Math.pow(fk, 1.5)), xx = cx0 + Math.sin(age * 1.5 + i) * s * .3 * clamp(age) + (hash(i * 3.1) - .5) * s * .6 * fk;
    const landed = age >= fd, da = age - fd, dis = landed ? clamp(da / 2.4) : 0;
    if (landed) skRipple(xx, water, t, T0 + fd, { r: s * .75, flat: .28, color: o.rippleColor || SK_PAL.indigo, neon: o.rippleNeon });
    if (dis >= 1) continue;
    const wither = clamp(age / (fd * 1.2)) * .7;
    X.save(); X.translate(xx, landed ? water : yy);
    if (landed) X.scale(1 + dis * .5, .35); else X.rotate(a + age * (.8 + hash(i) * .8) * (hash(i * 2) < .5 ? -1 : 1));
    const curl = landed ? 1 : .3 + .7 * Math.abs(Math.cos(age * 2.1 + i));
    const [, , wd] = SK_LOTUS[i], Wd = wd * s;
    skWash(() => skPetalPath(0, L, Wd, .3, 0, -L * .5, curl), SK_PAL.rose, { a: .5 * (1 - dis), edge: .8 * (1 - dis * .6), color2: SK_PAL.ochre, mix: wither, seed: seed + i * 3, scale: ns, blur: 3 * ns + dis * 10 * ns, spread: 10 * ns + dis * 20 * ns, feather: .08 + dis * .8, rough: .35 + dis * .4 });
    if (!landed) skInk(() => skPetalPath(0, L, Wd, .3, 0, -L * .5, curl), { w: s * .01, color: '#6E3B42', alpha: .5 * (1 - fk * .5), dry: .6, seed: seed + i, bleed: .6 });
    X.restore();
  }
}

// =====================================================================================================================
// FINISH (replaces common's paper print finish; see src/job.js)
// =====================================================================================================================
// A soft bloom (bright things glow a little: neon cores, backlit silk), a vignette and a fine animated grain.
let SK_VIG = null;
function skFinish(t, sh) {
  X.setTransform(1, 0, 0, 1, 0, 0);
  const cw = X.canvas.width, ch = X.canvas.height, bl = sh && sh.bloom !== undefined ? sh.bloom : .22;
  if (bl > 0) {
    const B = skLay('_skBloom', .125);
    B.x.clearRect(0, 0, B.width, B.height); B.x.filter = `blur(${Math.max(1, 3 * SX)}px) brightness(.8) contrast(2.2)`; B.x.drawImage(X.canvas, 0, 0, B.width, B.height); B.x.filter = 'none';
    X.globalCompositeOperation = 'screen'; X.globalAlpha = bl; X.imageSmoothingQuality = 'high'; X.drawImage(B, 0, 0, cw, ch);
  }
  if (!SK_VIG || SK_VIG.width !== cw) {
    SK_VIG = mkCanvas(cw, ch); const v = SK_VIG.getContext('2d');
    const g = v.createRadialGradient(cw / 2, ch / 2, ch * .42, cw / 2, ch / 2, ch * 1.02); g.addColorStop(0, 'rgba(20,14,10,0)'); g.addColorStop(1, 'rgba(20,14,10,.38)'); v.fillStyle = g; v.fillRect(0, 0, cw, ch);
  }
  X.globalCompositeOperation = 'source-over'; X.globalAlpha = sh && sh.vig !== undefined ? sh.vig : 1; X.drawImage(SK_VIG, 0, 0);
  // film grain: a fine mid-grey noise tile, shifted 12 times a second
  const g = skGrain(), k = Math.floor(t * 12), p = X.createPattern(g, 'repeat');
  p.setTransform(new DOMMatrix().translate(Math.floor(hash(k * 1.7) * 256), Math.floor(hash(k * 3.1) * 256)));
  X.globalCompositeOperation = 'source-over'; X.globalAlpha = sh && sh.grain !== undefined ? sh.grain : 1; X.fillStyle = p; X.fillRect(0, 0, cw, ch);
  X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
}
function skGrain() {
  if (SK_TEX.grain) return SK_TEX.grain;
  const S = 256, c = mkCanvas(S, S), g = c.getContext('2d'), id = g.createImageData(S, S), d = id.data, r = rng(83);
  for (let i = 0; i < S * S; i++) { const v = ((r() + r() + r()) / 3 - .5) * 2; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v > 0 ? 255 : 0; d[i * 4 + 3] = Math.round(Math.abs(v) * 18); }
  g.putImageData(id, 0, 0); return (SK_TEX.grain = c);
}
