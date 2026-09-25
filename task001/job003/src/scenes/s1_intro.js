// s1_intro.js: S1 · Intro (0–33.2). A silk handscroll in the dark, before the song begins.
// S1a  0–15.47    the scroll unrolls from its roller; the colophon (title + seal) is already there at frame 0. The camera
//                 drifts over the silk while the four "…ở nơi nào" lines (window.LY_INTRO) are inscribed one by one as a
//                 poem, and a brush paints the idol's face in a few broad strokes.
// S1b  15.47–25.57 the voice enters: close on her eye, a single painted tear wells up (a bloom at the lid) and runs down
//                 the silk as the camera pulls back. The sung lines are brushed in the top-right margin.
// S1c  25.57–30.63 the beat: the room goes dark and the silk is lit from behind; the neon street shows through the weave
//                 as blurred colour pulsing on the kick. KHUÔN MẶT ĐÁNG THƯƠNG is brushed large across the scroll.
// S1d  30.63–33.2  push in on the face against the light; on the last beat the light drains and the silk is left for the verse.

const S1_FX = 840, S1_FY = 470, S1_R = 160;               // the painted face (world)
const S1_EYE = [S1_FX + S1_R * .39, S1_FY + S1_R * .17];   // her right eye (viewer's right)
const S1_TB = barT(6), S1_TC = barT(10), S1_TD = barT(12), S1_END = 33.2;
const S1_INK = SK_PAL.ink;

// ---------- the silk, moving with the camera ----------
function S1_silk() { X.drawImage(skSilkBake(), -60, -34, W + 120, H + 68); }
function S1_camApply(c) {
  X.setTransform(SX, 0, 0, SX, 0, 0); X.translate(W / 2, H / 2); X.scale(c.zoom, c.zoom); X.translate(-c.x, -c.y);
}

// ---------- snapshots: static paintings are painted once per camera framing and reused (a painting holds still) ----------
// A snapshot holds something as seen by a camera {x, y, zoom} on a transparent full-frame canvas; S1_put redraws it
// under another camera (a pure scale + offset), so each snapshot is used near its own zoom. Deterministic, so it is a cache.
const S1_SNAP = {};
const S1_CAMS = {
  wide: { x: S1_FX, y: S1_FY - 40, zoom: 1.15 }, mid: { x: S1_FX + 160, y: S1_FY - 20, zoom: 1.6 }, mid2: { x: S1_FX + 130, y: S1_FY - 30, zoom: 2.1 }, eye: { x: S1_EYE[0] + 20, y: S1_EYE[1] + 40, zoom: 2.6 },
  scroll: { x: 972, y: 536, zoom: 1.03 }, C: { x: 1215, y: 540, zoom: 1.05 }, screen: { x: W / 2, y: H / 2, zoom: 1 },
};
function S1_snap(id, cam, fn) {
  const k = id + '|' + cam + '@' + SX; if (S1_SNAP[k]) return S1_SNAP[k];
  const c = mkCanvas(Math.round(W * SX), Math.round(H * SX)), prev = X;
  X = c.getContext('2d');
  try { X.save(); S1_camApply(S1_CAMS[cam]); fn(); X.restore(); } finally { X = prev; }
  const n = Object.keys(S1_SNAP); if (n.length > 14) delete S1_SNAP[n[0]];
  return (S1_SNAP[k] = c);
}
function S1_put(img, cam, c, alpha = 1, op = 'multiply', ctx = X) {
  const cc = S1_CAMS[cam], r = c.zoom / cc.zoom;
  const ox = SX * (W / 2 * (1 - r) + c.zoom * (cc.x - c.x)), oy = SX * (H / 2 * (1 - r) + c.zoom * (cc.y - c.y));
  ctx.save(); ctx.setTransform(r, 0, 0, r, ox, oy); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = op; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0); ctx.restore();
}
// the sharpest face snapshot that holds everything of the face this camera can see
function S1_pickCam(c) {
  const fb = [S1_FX - S1_R * 1.95, S1_FY - S1_R * 1.95, S1_FX + S1_R * 1.95, S1_FY + S1_R * 1.6];
  const view = z => [z.x - W / 2 / z.zoom, z.y - H / 2 / z.zoom, z.x + W / 2 / z.zoom, z.y + H / 2 / z.zoom];
  const v = view(c), need = [Math.max(v[0], fb[0]), Math.max(v[1], fb[1]), Math.min(v[2], fb[2]), Math.min(v[3], fb[3])];
  for (const k of ['eye', 'mid2', 'mid']) {
    const cc = S1_CAMS[k]; if (cc.zoom > c.zoom * 1.12) continue;
    const q = view(cc); if (q[0] <= need[0] + 1 && q[1] <= need[1] + 1 && q[2] >= need[2] - 1 && q[3] >= need[3] - 1) return k;
  }
  return c.zoom > 1.3 ? 'mid' : 'wide';
}
function S1_face(c, alpha = 1, op = 'multiply', ctx = X) {
  const cam = S1_pickCam(c);
  S1_put(S1_snap('face', cam, () => skFacePortrait(S1_FX, S1_FY, S1_R, 0, { eyes: 'down', tears: 0, seed: 3, blush: .9 })), cam, c, alpha, op, ctx);
}

// ---------- the brush revealing the face: a few broad strokes, each made of bristles ----------
const S1_arc = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const S1_STROKES = [   // face-local, in units of R; times in song seconds
  { t0: 4.4, t1: 6.0, w: .95, pts: S1_arc(0, -.06, 1.26, 150, 272) },
  { t0: 6.0, t1: 7.4, w: .95, pts: S1_arc(0, -.06, 1.26, 268, 392) },
  { t0: 7.8, t1: 8.7, w: .62, pts: [[-.72, -1.02], [-.98, -.4], [-1.02, .3], [-.88, 1.0]] },
  { t0: 8.7, t1: 9.6, w: .62, pts: [[.72, -1.02], [.98, -.4], [1.02, .3], [.88, 1.0]] },
  { t0: 10.0, t1: 11.7, w: .78, pts: S1_arc(0, .08, .46, -110, 262, 30) },
  { t0: 12.0, t1: 12.9, w: .62, pts: [[-.05, .55], [.02, 1.05], [0, 1.62]] },
];
const S1_FILL = [13.0, 14.4];   // the last washes settle everywhere
function S1_polyPart(pts, k) {   // the first k (0..1) of a polyline, by length
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tgt = L[L.length - 1] * k, out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= tgt) out.push(pts[i]);
    else { const u = (tgt - L[i - 1]) / (L[i] - L[i - 1] || 1); out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; }
  }
  return out;
}
function S1_strokeMask(t) {   // in world space (current transform): the bristles laid so far
  X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = '#fff';
  S1_STROKES.forEach((s, si) => {
    const k0 = clamp((t - s.t0) / (s.t1 - s.t0)); if (k0 <= 0) return;
    const k = easeInOut(k0);
    for (let j = 0; j < 7; j++) {
      const off = (j / 6 - .5) * s.w * .78, lag = hash(si * 9 + j) * .12, kk = clamp((k - lag) / (1 - lag) * (1 + hash(j * 3 + si) * .06));
      if (kk <= 0) continue;
      const P = s.pts.map((p, i, a) => { const q = a[Math.min(i + 1, a.length - 1)], r0 = a[Math.max(i - 1, 0)], dx = q[0] - r0[0], dy = q[1] - r0[1], l = Math.hypot(dx, dy) || 1; return [S1_FX + (p[0] - dy / l * off) * S1_R, S1_FY + (p[1] + dx / l * off) * S1_R]; });
      const part = S1_polyPart(P, kk); if (part.length < 2) continue;
      X.lineWidth = s.w * S1_R * (.2 + hash(si * 5 + j * 7) * .12); X.globalAlpha = .75 + hash(j + si * 2) * .25;
      X.beginPath(); part.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
    }
  });
  const f = clamp((t - S1_FILL[0]) / (S1_FILL[1] - S1_FILL[0]));
  if (f > 0) { X.globalAlpha = easeInOut(f); X.fillStyle = '#fff'; X.fillRect(S1_FX - S1_R * 2.2, S1_FY - S1_R * 2.2, S1_R * 4.4, S1_R * 4.2); }
  X.globalAlpha = 1;
}
function S1_faceReveal(t, c) {
  if (t >= S1_FILL[1]) { S1_face(c); return; }
  if (t < S1_STROKES[0].t0) return;
  const L = skLay('S1_rev', 1), M = skLay('S1_msk', .5);
  M.x.clearRect(0, 0, M.width, M.height);
  const prev = X; X = M.x;
  try { X.save(); X.setTransform(SX * .5, 0, 0, SX * .5, 0, 0); X.translate(W / 2, H / 2); X.scale(c.zoom, c.zoom); X.translate(-c.x, -c.y); S1_strokeMask(t); X.restore(); }
  finally { X = prev; }
  L.x.clearRect(0, 0, L.width, L.height);
  S1_face(c, 1, 'source-over', L.x);
  L.x.globalCompositeOperation = 'destination-in'; L.x.filter = `blur(${Math.max(1, 2.5 * SX)}px)`; L.x.drawImage(M, 0, 0, L.width, L.height); L.x.filter = 'none'; L.x.globalCompositeOperation = 'source-over';
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.drawImage(L, 0, 0); X.restore();
}

// ---------- the single painted tear ----------
const S1_TEAR0 = 16.9;
function S1_tearK(t) { return clamp((t - S1_TEAR0) / 8.5); }
function S1_tear(t) {
  const e = { x: S1_R * .39, y: S1_R * .17, rx: S1_R * 1.06 * .21, ry: S1_R * 1.06 * .25 };
  const x = S1_FX + e.x + e.rx * .35, y = S1_FY + e.y + e.ry * .85;
  // it gathers at the lower lid first (a small bloom), then runs down the cheek and past the chin into the silk
  const k = S1_tearK(t);
  if (k > 0) skBleed(x, y, SK_PAL.indigo, t, 0, { k: Math.pow(k, .8), len: S1_R * .78, w: S1_R * .13, seed: 11, a: .42, color2: SK_PAL.rose, dur: 3 });
}

// ---------- type ----------
const S1_POEM = () => (window.LY_INTRO || []);
const S1_POEM_T = [3.4, 6.4, 9.4, 12.2], S1_POEM_D = 2.3, S1_POEM_S = 38;
function S1_poemX() {
  const f = FONT.vnIR(S1_POEM_S), w = Math.max(0, ...S1_POEM().map((s, i) => layout(s, f).width + i * 14));
  return 1790 - w;
}
function S1_poem(t, alpha = 1, only) {
  const x0 = S1_poemX(), f = FONT.vnIR(S1_POEM_S);
  S1_POEM().forEach((s, i) => {
    if (only !== undefined && !only(i)) return;
    const k = clamp((t - S1_POEM_T[i]) / S1_POEM_D); if (k <= 0) return;
    skBrushText(s, x0 + i * 14, 330 + i * 84, { size: S1_POEM_S, font: f, k: easeInOut(k), color: S1_INK, alpha: .9 * alpha, dry: .35, seed: 40 + i });
  });
  // a thin margin rule, brushed down once the first line is there
  const kr = clamp((t - 3.0) / 1.2);
  if (kr > 0 && (only === undefined || only(-1))) skInk([[x0 - 44, 272, .4], [x0 - 46, 450], [x0 - 43, 640, .3]], { w: 3, k: easeOut(kr), dry: .6, alpha: .55 * alpha, color: SK_PAL.inkLt, seed: 9 });
}
function S1_colophon(alpha = 1) {
  skBrushText('Khuôn Mặt', 104, 470, { size: 58, alpha: .95 * alpha, dry: .4, seed: 3 });
  skBrushText('Đáng Thương', 132, 548, { size: 58, alpha: .95 * alpha, dry: .4, seed: 5 });
  skBrushText('lụa & neon · 2015', 136, 606, { size: 26, font: FONT.vnIR(26), color: SK_PAL.inkLt, alpha: .85 * alpha, dry: .2 });
  skSeal(206, 690, 56, 'LỤA NEON', { alpha: .88 * alpha, rot: -.03 });
}
// The sung lines: brushed small in the top-right margin as they are sung (write-on follows the word times).
function S1_capK(L, t) {
  // a line still being sung when the section ends is written a little faster, so it is complete on the last frame
  if (L[1] > S1_END - .25) t = L[0] + (t - L[0]) * (L[1] - L[0]) / (S1_END - .25 - L[0]);
  const ws = wordTimes(L), tot = L[2].length; let done = 0;
  for (const w of ws) {
    const len = w.w.length + 1;
    if (t >= w.end) done += len; else if (t > w.t) { done += len * clamp((t - w.t) / Math.max(.1, w.end - w.t)); break; } else break;
  }
  return clamp(done / tot);
}
// Each sung line wraps into short rows (a column inscription, continuation rows indented) at the right of the frame.
const S1_CAP_S = 44, S1_CAP_X = 1150, S1_CAP_W = 660;
function S1_capRows(str, f) {
  const ws = str.split(' '), rows = []; let cur = '';
  for (const w of ws) { const nx = cur ? cur + ' ' + w : w; if (cur && layout(nx, f).width > S1_CAP_W) { rows.push(cur); cur = w; } else cur = nx; }
  if (cur) rows.push(cur); return rows;
}
function S1_captions(t, o = {}) {
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  const lines = LY.filter(l => l[0] >= 0 && l[0] < S1_END), f = FONT.vnIR(S1_CAP_S);
  let y = 330;
  lines.forEach((L, i) => {
    const rows = S1_capRows(L[2], f), y0 = y; y += rows.length * 60 + 26;
    if (t < L[0]) return;
    const k = S1_capK(L, t), newer = lines[i + 1] && t >= lines[i + 1][0], a = (newer ? (o.old ?? .6) : 1) * (o.alpha ?? 1);
    const tot = L[2].length;
    const draw = (kc, al = .95) => { let c0 = 0; rows.forEach((r, j) => { const kk = clamp((kc * tot - c0) / r.length); c0 += r.length + 1; if (kk > 0) skBrushText(r, S1_CAP_X + (j ? 34 : 0), y0 + j * 60, { size: S1_CAP_S, font: f, k: Math.max(.02, kk), color: o.color || SK_PAL.indigo, alpha: al, dry: .25, seed: 60 + i * 3 + j }); }); };
    if (k >= 1) S1_put(S1_snap('cap' + i + (o.color || ''), 'screen', () => draw(1)), 'screen', S1_CAMS.screen, a);
    else draw(Math.max(.01, k), .95 * a);
  });
  X.restore();
}

// soft ground washes on the scroll (organic blobs, very pale): indigo behind the colophon, ochre light behind the face
function S1_blob(cx, cy, rx, ry, sd) { const P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, r = 1 + noise1(a * 1.4 + sd * 7) * .16 + noise1(a * 4.3 + sd) * .06; P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } pathSmooth(P); }
function S1_ground(colophon) {
  if (colophon) skWash(() => S1_blob(300, 560, 230, 380, 1), SK_PAL.indigo, { a: .1, edge: .12, feather: .8, seed: 21, scale: 3, grad: [0, 180, 0, 980], gradTo: .3 });
  skWash(() => S1_blob(S1_FX - 10, S1_FY + 20, 400, 330, 2), SK_PAL.ochre, { a: .09, edge: .1, feather: .85, seed: 22, scale: 3 });
}

// ---------- S1a: the scroll unrolls ----------
function S1_rollX(t) { return lerp(610, W + 140, easeInOut(clamp((t - .9) / 3.6))); }
function S1_table(rx, c) {   // what is beyond the unrolled silk: a dark lacquer table, the roll of silk on its roller
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  const sx = W / 2 + (rx - c.x) * c.zoom;   // roller in screen x
  if (sx < W + 80) {
    const g = X.createLinearGradient(sx, 0, W, 0); g.addColorStop(0, '#15100C'); g.addColorStop(1, '#0B0A0E'); X.fillStyle = g; X.fillRect(sx, 0, W - sx + 2, H);
    const lg = X.createRadialGradient(sx + 380, H * .55, 0, sx + 380, H * .55, 700); lg.addColorStop(0, 'rgba(201,161,91,.10)'); lg.addColorStop(1, 'rgba(201,161,91,0)'); X.fillStyle = lg; X.fillRect(sx, 0, W, H);
    // the shadow of the roll on the silk
    const sg = X.createLinearGradient(sx - 60, 0, sx, 0); sg.addColorStop(0, 'rgba(40,26,14,0)'); sg.addColorStop(1, 'rgba(40,26,14,.38)'); X.fillStyle = sg; X.fillRect(sx - 60, 0, 60, H);
    // the roll: silk wound round a dark wooden rod (fatter while more is still rolled)
    const rw = lerp(92, 58, clamp((rx - 610) / (W - 470))) * c.zoom;
    const rg = X.createLinearGradient(sx, 0, sx + rw, 0);
    rg.addColorStop(0, '#8E7A5C'); rg.addColorStop(.18, '#E6D8BC'); rg.addColorStop(.42, '#F3EBDA'); rg.addColorStop(.75, '#B9A47F'); rg.addColorStop(1, '#4A3A28');
    X.fillStyle = rg; X.fillRect(sx, -10, rw, H + 20);
    for (let i = 0; i < 9; i++) { X.fillStyle = `rgba(120,96,60,${.08 + hash(i) * .08})`; X.fillRect(sx + rw * (.1 + i * .09), -10, 1.2, H + 20); }
    // brocade edge band on the silk, and the rod ends peeking out
    X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(sx + rw, -10, 5, H + 20);
  }
  X.restore();
}
function S1_camA(t) { const u = clamp(t / 15.5); return { x: 960 + 26 * easeInOut(u) + noise1(t * .13 + 2) * 6, y: 540 - 8 * u + noise1(t * .11 + 7) * 4, zoom: 1.03 + .05 * easeInOut(u) }; }
function S1_sceneA(t) {
  const c = S1_camA(t), rx = S1_rollX(t);
  X.save(); S1_camApply(c);
  X.save(); X.beginPath(); X.rect(-200, -200, rx + 200, H + 400); X.clip();
  S1_silk();
  // a pale indigo ground wash behind the colophon, and an ochre breath of light where the face will be
  // everything already dry is one snapshot (ground washes, colophon, finished poem lines); the line being written is live
  const nDone = S1_POEM_T.filter(t0 => t >= t0 + S1_POEM_D).length, rule = t >= 4.2;
  S1_put(S1_snap('A' + nDone + rule, 'scroll', () => { S1_ground(true); S1_colophon(); S1_poem(99, 1, i => i < 0 ? rule : i < nDone); }), 'scroll', c);
  S1_faceReveal(t, c);
  S1_poem(t, 1, i => i < 0 ? !rule : i >= nDone);
  X.restore();
  X.restore();
  S1_table(rx, c);
}

// ---------- S1b: the tear ----------
function S1_camB(t) {
  const u = clamp((t - 18.8) / 5.2), e = easeInOut(u);
  return { x: lerp(S1_EYE[0] + 40, S1_FX + 360, e) + noise1(t * .12 + 3) * 5, y: lerp(S1_EYE[1] + 90, S1_FY + 20, e) + noise1(t * .1 + 5) * 4, zoom: lerp(2.85, 1.52, e) - .08 * clamp((t - S1_TB) / 3.3) * (1 - u) };
}
function S1_sceneB(t) {
  const c = S1_camB(t);
  X.save(); S1_camApply(c);
  S1_silk();
  S1_put(S1_snap('G', 'mid', () => S1_ground(false)), 'mid', c);
  S1_face(c);
  S1_tear(t);
  X.restore();
  S1_captions(t);
}

// ---------- S1c/d: the silk lit from behind ----------
const S1_LIGHTS = t => {
  const k = KICK(t), g = .55 + .45 * clamp((t - S1_TC) / 7);
  return [
    { x: 300, y: 330, r: 400 * (1 + k * .25), color: SK_PAL.neonPink, a: (.95 + k * .7) * g },
    { x: 1150, y: 300, r: 440 * (1 + k * .2), color: SK_PAL.neonCyan, a: (.9 + k * .6) * g },
    { x: 980, y: 700, r: 340, color: SK_PAL.neonAmber, a: .6 * g },
    { x: 1640, y: 760, r: 300 * (1 + k * .3), color: '#8A7CFF', a: (.55 + k * .7) * g },
    { x: 540, y: 420, r: 460 * (1 + k * .2), color: SK_PAL.neonAmber, a: (.5 + k * .45) * clamp((t - S1_TD) / 1.2) },
  ];
};
function S1_city(t) {   // the neon street behind the silk (drawn in world space, then diffused through the weave)
  const Ls = S1_LIGHTS(t), k = KICK(t);
  skNight(t, { horizon: 700, lights: Ls, bokeh: 50 });
  // tubes, cheaply: they are only ever seen blurred through the silk
  const tube = (fn, col, w, I) => {
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; X.lineJoin = 'round';
    X.strokeStyle = skRgba(col, .28 * I); X.lineWidth = w * 4; X.beginPath(); fn(); X.stroke();
    X.strokeStyle = skRgba(col, .9 * I); X.lineWidth = w; X.beginPath(); fn(); X.stroke();
    X.strokeStyle = skRgba(SK_PAL.neonWhite, .7 * I); X.lineWidth = w * .35; X.beginPath(); fn(); X.stroke(); X.restore();
  };
  const I = .7 + k * .3, fl = hash(Math.floor(t * 12) * 1.7) < .12 ? .35 : 1;
  tube(() => { X.moveTo(1050, 130); X.lineTo(1050, 560); }, SK_PAL.neonCyan, 14, I);
  tube(() => X.rect(1660, 690, 130, 290), SK_PAL.neonPink, 10, I * fl);
  tube(() => heartPath(340, 360, 90), SK_PAL.neonPink, 12, I);
  tube(() => { X.moveTo(640, 250); X.lineTo(980, 250); }, SK_PAL.neonAmber, 10, .8);
  tube(() => X.arc(760, 170, 62, 0, TAU), SK_PAL.neonCyan, 9, I * .9);
}
function S1_backlight(t) {
  const up = easeOut(clamp((t - S1_TC) / .5)), grow = .55 + .4 * clamp((t - S1_TC) / 7.2);
  const drain = 1 - .75 * easeInOut(clamp((t - (S1_END - .62)) / .5));
  return clamp((grow + KICK(t) * .14) * up * drain);
}
function S1_camC(t) { const u = clamp((t - S1_TC) / (S1_TD - S1_TC)); return { x: 1200 + 22 * u + noise1(t * .2) * 4, y: 540 + noise1(t * .17 + 3) * 3, zoom: 1.03 + .03 * u + KICK(t) * .004 }; }
function S1_camD(t) { const u = easeInOut(clamp((t - S1_TD) / 2.6)); return { x: S1_FX + 330 + 12 * u, y: S1_FY + 20 - 6 * u, zoom: lerp(1.34, 1.52, u) + KICK(t) * .006 }; }
function S1_sceneCD(t, c, big) {
  const bk = S1_backlight(t);
  skSilk(t, { backlight: bk, behind: S1_city, dim: .16 });
  X.save(); S1_camApply(c);
  S1_put(S1_snap('G', 'mid', () => S1_ground(false)), 'mid', c);
  S1_face(c);
  S1_tear(t);
  if (big) {   // the title, brushed large on the first bar of the beat
    const k = clamp((t - (S1_TC + .12)) / 2.3), w0 = layout('Khuôn Mặt Đáng Thương', FONT.vnI(150)).width, sz = Math.min(150, 150 * 1640 / w0);
    const draw = kk => skBrushText('Khuôn Mặt Đáng Thương', 1210, 990, { size: sz, align: 'center', k: kk, dry: .5, seed: 77 });
    if (k >= 1) { X.save(); S1_put(S1_snap('title', 'C', () => draw(1)), 'C', c); X.restore(); } else if (k > 0) draw(easeInOut(k));
  }
  X.restore();
  S1_captions(t, { color: S1_INK, old: .7 });
}

// ---------- shots ----------
shot(0, S1_TB, t => S1_sceneA(t), { seed: 1 });
shot(S1_TB, S1_TC, t => {
  const k = (t - S1_TB) / .9;
  if (k < 1) skDissolve(k, 4, () => S1_sceneA(t), () => S1_sceneB(t), { rim: SK_PAL.indigo, n: 22 });
  else S1_sceneB(t);
}, { seed: 2 });
shot(S1_TC, S1_TD, t => S1_sceneCD(t, S1_camC(t), true), { seed: 3 });
shot(S1_TD, S1_END, t => S1_sceneCD(t, S1_camD(t), false), { seed: 4 });
