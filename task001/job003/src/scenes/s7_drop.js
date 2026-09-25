// s7_drop.js: S7 · Final drop (bridge), 186.0–227.7. NEON OVER SILK: the loudest section.
// Neon tubes are drawn on top of the silk paintings, both media at once, everything pulsing on the beat. The key words of
// each bridge line ("ánh mắt", "mãi mãi", "không bên em", "nơi nào") are brushed big in ink and traced over in neon; the
// rest of the line is a small brush inscription. The repeat of the four lines escalates: the silk is torn into strips with
// the neon behind, the lyric moves onto a torn silk banner, and the cuts go from every 4 beats to every 2, then every beat.
//
//  A  186.00–188.52  the face on backlit silk; the neon face strikes on over the painting        "ánh mắt"
//  A2 188.52–191.05  extreme close-up on the eyes (painted + neon)
//  B  191.05–196.10  the lake at night: an ink ∞ over the water, traced in neon on "mãi mãi" (wide, then closer)
//  C  196.10–201.15  the umbrella: she is painted; the neon figure beside her dies on "không bên em"
//  D  201.15–206.20  the face closer, tears bleeding down the silk, neon tears on the beat; the silk starts to split  "nơi nào"
//  E  206.20–227.70  the repeat: the same four scenes torn into strips over the neon street, cut every 2 beats, then every
//                    beat; the last "nơi nào" is the last big hit, then the neon starts to flicker off.
//
// Performance: every silk painting and every neon layer is painted once into a frame-size canvas (S7_cache) and composited
// per frame (camera moves are transforms of the cached canvas); only the brush write-on, tears and strike-on are live.

const S7_T0 = 186.0, S7_END = 227.7;
const S7_B = n => beatT(n);                               // beat 294 = 185.994 = first bridge line
const S7_LY = LY.filter(l => l[0] >= 185.9 && l[0] < S7_END);
const S7_KEYS = ['ánh mắt', 'mãi mãi', 'không bên em', 'nơi nào'];
const S7_HIT = 227.2;                                     // the last big hit ("nào")
const S7_FACE = { x: 1320, y: 560, R: 250 };              // the face (both media)
const S7_ECU = { x: 1199, y: 606, zoom: 2.4 };            // camera for the eyes close-up (painted at this zoom)
const S7_MID = { x: 1050, y: 585, zoom: 1.4 };            // camera for the closer face (tears)
const S7_NOFS = [7, -5];                                  // the neon is traced slightly off the painting (misregistered)

// ---------------------------------------------------------------------------------------------------------------------
// caches: frame-size canvases painted once (deterministic), LRU
// ---------------------------------------------------------------------------------------------------------------------
const S7_CACHE = new Map();
function S7_cache(key, fn) {
  const k = key + '|' + SX;
  let c = S7_CACHE.get(k);
  if (c) { S7_CACHE.delete(k); S7_CACHE.set(k, c); return c; }
  c = mkCanvas(Math.round(W * SX), Math.round(H * SX)); const ctx = c.getContext('2d'), prev = X, T0 = T;
  X = ctx; X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  try { fn(); } finally { X.restore(); X = prev; T = T0; }
  S7_CACHE.set(k, c); while (S7_CACHE.size > 26) S7_CACHE.delete(S7_CACHE.keys().next().value);
  return c;
}
// Draw a cached canvas under a camera ({x, y, zoom, rot, shake} or null = identity).
function S7_put(c, cam, alpha = 1, op = 'source-over') {
  if (alpha <= .003) return;
  if (cam) camBegin(cam); else { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); }
  X.globalAlpha = alpha; X.globalCompositeOperation = op; X.imageSmoothingQuality = 'high'; X.drawImage(c, 0, 0, W, H);
  if (cam) camEnd(); else X.restore();
}
// Keep a camera inside the painting (the cached canvases end at the frame edge).
function S7_cam(c) {
  const z = Math.max(1.015 + Math.abs(c.rot || 0) * 1.8 + (c.shake || 0) / 400, c.zoom ?? 1), m = 8 + (c.shake || 0), hw = W / 2 / z + m / z, hh = H / 2 / z + m / z;
  return { ...c, zoom: z, x: clamp(c.x ?? W / 2, hw, W - hw), y: clamp(c.y ?? H / 2, hh, H - hh) };
}
// A neon strike: dark, sputtering, then lit (0..1).
function S7_strike(t, t0, seed = 1, dur = .32) {
  if (t < t0) return 0; const k = (t - t0) / dur; if (k >= 1) return 1;
  return hash(Math.floor(t * 24) * 1.37 + seed * 7.7) < k ? Math.sqrt(k) : k * .12;
}
// The beat: every tube breathes with the kick.
const S7_pulse = t => .8 + .2 * pulse(t, .5) + .15 * KICK(t);
// The end: after the last hit the tubes start dying one by one (each sputters; some go dark before 227.7).
function S7_die(t, seed) {
  if (t < S7_HIT + .12) return 1;
  const k = (t - S7_HIT - .12) / (S7_END - S7_HIT - .12), th = .25 + hash(seed * 3.7) * .9;
  if (k > th) return hash(Math.floor(t * 30) + seed) < .12 ? .35 : 0;
  return hash(Math.floor(t * 18) * 1.3 + seed * 5.1) < k * .9 ? .12 + .3 * hash(Math.floor(t * 40) + seed) : 1 - k * .3;
}
// A flash on a cut / hit: the light blows out for a few frames.
function S7_flash(t, t0, a = .6, col = '#FFE6F2', dur = .2) {
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.globalAlpha = a * Math.pow(1 - k, 2); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore();
}
// Hard kick on a cut: a pink + cyan misregistered copy of the frame, snapping back.
function S7_jolt(t, t0, s = 1, dur = .16) {
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  const e = Math.pow(1 - k, 2) * s, c = layer('_s7j'); c.x.setTransform(1, 0, 0, 1, 0, 0); c.x.drawImage(X.canvas, 0, 0);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'lighter';
  X.globalAlpha = .28 * e; X.drawImage(c, 22 * SX * e, 0); X.globalAlpha = .18 * e; X.drawImage(c, -16 * SX * e, 6 * SX * e); X.restore();
}

// ---------------------------------------------------------------------------------------------------------------------
// shapes
// ---------------------------------------------------------------------------------------------------------------------
// lemniscate (∞) points
function S7_inf(cx, cy, a, n = 90, t0 = 0, t1 = 1) {
  const out = [];
  for (let i = 0; i <= n; i++) { const u = (t0 + (t1 - t0) * i / n) * TAU + Math.PI / 2, s = Math.sin(u), c = Math.cos(u), d = 1 + s * s; out.push([cx + a * c / d, cy + a * s * c / d * 1.25]); }
  return out;
}
// A standing figure (unit = height, feet at 0), as a closed outline. kind 'her' (áo dài, bob, back view) | 'him'.
function S7_figPts(x, y, h, kind) {
  const P = kind === 'her'
    ? [[0, -1], [.062, -.975], [.078, -.9], [.07, -.84], [.035, -.815], [.1, -.775], [.118, -.7], [.108, -.58], [.075, -.5], [.092, -.38], [.14, -.14], [.1, -.12], [.055, -.1], [.05, 0], [.012, 0], [0, -.2], [-.012, 0], [-.05, 0], [-.055, -.1], [-.1, -.12], [-.14, -.14], [-.092, -.38], [-.075, -.5], [-.108, -.58], [-.118, -.7], [-.1, -.775], [-.035, -.815], [-.07, -.84], [-.078, -.9], [-.062, -.975]]
    : [[0, -1], [.058, -.975], [.068, -.91], [.05, -.85], [.04, -.82], [.13, -.785], [.15, -.7], [.155, -.52], [.14, -.4], [.12, -.4], [.118, -.52], [.1, -.58], [.1, -.44], [.085, 0], [.02, 0], [.008, -.4], [-.008, -.4], [-.02, 0], [-.085, 0], [-.1, -.44], [-.1, -.58], [-.118, -.52], [-.12, -.4], [-.14, -.4], [-.155, -.52], [-.15, -.7], [-.13, -.785], [-.04, -.82], [-.05, -.85], [-.068, -.91], [-.058, -.975]];
  return P.map(p => [x + p[0] * h, y + p[1] * h]);
}
// Torn edge: a ragged line from a to b (world px), deterministic
function S7_ragged(ax, ay, bx, by, seed, amp = 7, step = 14) {
  const L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.ceil(L / step)), nx = -(by - ay) / L, ny = (bx - ax) / L, out = [];
  for (let i = 0; i <= n; i++) { const u = i / n, o = (noise1(u * L / 90 + seed * 7.3) * .7 + noise1(u * L / 17 + seed * 3.1) * .3) * amp; out.push([lerp(ax, bx, u) + nx * o, lerp(ay, by, u) + ny * o]); }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// the paintings (silk) — each painted once under its camera
// ---------------------------------------------------------------------------------------------------------------------
// The room is dark: the painting is lit only in pools (a warm one where the words are written, a cooler one where the
// neon is), multiplied over the finished painting. pools: [x, y, r, colour]; cam: the painting's camera (pools follow it)
const S7_POOLS = {
  face: [[420, 470, 640, '#FFF3E2'], [1320, 540, 720, '#EBD7EC']],
  lake: [[420, 330, 620, '#FFF3E2'], [1210, 360, 700, '#E8D6EE'], [1700, 380, 320, '#FFE6BC']],
  umb: [[380, 420, 620, '#FFF3E2'], [1250, 470, 620, '#FBE3D2']],
};
function S7_room(pools, cam) {
  const R = layer('_s7room'), prev = X; X = R.x;
  X.fillStyle = '#3C3D5C'; X.fillRect(0, 0, W, H); X.globalCompositeOperation = 'lighten';
  for (const [x0, y0, r, c] of pools) {
    let x = x0, y = y0, rr = r;
    if (cam && !(x0 < 800)) { x = W / 2 + (x0 - cam.x) * cam.zoom; y = H / 2 + (y0 - cam.y) * cam.zoom; rr = r * Math.sqrt(cam.zoom); }
    const g = X.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, c); g.addColorStop(.45, skMix(c, '#3C3D5C', .35)); g.addColorStop(1, '#3C3D5C');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  }
  X = prev; X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.drawImage(R, 0, 0); X.restore();
}
function S7_paintFace(cam) {
  const F = S7_FACE;
  skSilk(0);
  if (cam) camBegin(cam);
  skWash(() => X.ellipse(F.x + 20, F.y + 30, 560, 500, -.15, 0, TAU), SK_PAL.indigo, { a: .28, edge: .55, color2: SK_PAL.rose, mix: .45, seed: 71, scale: 3.2, feather: .35 });
  skWash(() => X.ellipse(430, 250, 300, 170, .2, 0, TAU), SK_PAL.ochre, { a: .22, edge: .45, seed: 72, scale: 2.5, feather: .5 });
  skWash(() => X.ellipse(1690, 960, 360, 150, -.1, 0, TAU), SK_PAL.celadon, { a: .25, edge: .5, seed: 73, scale: 2.5 });
  skFacePortrait(F.x, F.y, F.R, 0, { eyes: 'down', mouth: 0, seed: 7 });
  if (cam) camEnd();
  S7_room(S7_POOLS.face, cam);
}
function S7_paintLake() {
  skSilk(0);
  const hz = 690;
  skWash(() => X.rect(-40, -40, W + 80, hz + 40), SK_PAL.indigo, { a: .42, edge: .3, grad: [0, 0, 0, hz], gradTo: .25, seed: 81, scale: 4, rough: .5 });
  skWash(() => X.arc(1640, 190, 74, 0, TAU), SK_PAL.ochre, { a: .55, edge: .8, color2: SK_PAL.sienna, mix: .3, seed: 82 });
  // far shore: a low wooded bank and the little tower on the water
  skWash(() => pathSmooth([[-40, hz + 8], [-40, hz - 40], [200, hz - 70], [420, hz - 52], [640, hz - 30], [900, hz - 22], [1300, hz - 30], [1500, hz - 58], [1750, hz - 44], [1960, hz - 60], [1960, hz + 8]], true), SK_PAL.ink, { a: .55, edge: .6, color2: SK_PAL.indigo, mix: .5, seed: 83, scale: 2 });
  // water
  skWash(() => X.rect(-40, hz, W + 80, H - hz + 40), SK_PAL.indigo, { a: .5, edge: .4, color2: SK_PAL.ink, mix: .35, grad: [0, hz, 0, H], gradTo: .55, seed: 85, scale: 4 });
  const rip = []; for (let i = 0; i < 16; i++) { const y = hz + 22 + Math.pow(i / 16, 1.5) * 360, x = 80 + hash(i * 3.1) * 1600, l = 60 + hash(i * 5.3) * 200 * (1 + i / 12); rip.push([[x, y, .4], [x + l * .5, y + sjit(i, 3)], [x + l, y, .3]]); }
  skInk(rip, { w: 3.5, dry: .6, alpha: .45, color: SK_PAL.inkLt, seed: 86 });
  // willow on the left: trunk and hanging branches
  skInk([[[150, 1100, 1], [185, 820], [150, 560], [230, 300], [330, 90, .5]], [[210, 380, .6], [330, 250], [470, 200, .3]]], { w: 26, dry: .55, seed: 87 });
  const br = []; for (let i = 0; i < 16; i++) { const x0 = 170 + i * 30 + sjit(i, 20), y0 = 90 + hash(i * 2.7) * 260, l = 260 + hash(i * 4.1) * 360; br.push([[x0, y0, .3], [x0 + 40 + i * 2, y0 + l * .35], [x0 + 50 + i * 3, y0 + l * .75], [x0 + 46 + i * 3, y0 + l, .1]]); }
  skInk(br, { w: 4, dry: .5, alpha: .7, tail: .6, seed: 88 });
  skWash(() => { for (let i = 0; i < 7; i++) X.ellipse(260 + i * 60 + sjit(i + 9, 30), 330 + hash(i * 6.1) * 240, 90, 170, .1, 0, TAU); }, SK_PAL.celadon, { a: .35, edge: .6, seed: 89, scale: 1.6, color2: SK_PAL.indigo, mix: .3 });
  // lamp post on the right bank
  skInk([[[1700, hz - 30, .9], [1702, 480], [1700, 400, .7]], [[1670, 400], [1730, 400]]], { w: 9, dry: .3, seed: 90 });
  skBloom(1700, 380, 60, SK_PAL.ochre, 5, 0, { seed: 91 });
  // the ∞, brushed in one stroke over the water
  const inf = S7_inf(1210, 340, 430, 120).map((p, i) => [p[0], p[1], .5 + .5 * Math.abs(Math.sin(i / 120 * TAU * 2 + .6))]);
  S7_room(S7_POOLS.lake);
  skInk([inf.slice(0, 62), inf.slice(60)], { w: 30, dry: .5, dryTail: .6, seed: 92, alpha: .85 });   // two strokes (a closed figure-8 cancels itself)
}
function S7_paintUmb() {
  skSilk(0);
  const fy = 950;
  skWash(() => X.arc(1260, 420, 330, 0, TAU), SK_PAL.ochre, { a: .3, edge: .5, seed: 101, feather: .5, scale: 3 });
  skWash(() => X.rect(-40, 820, W + 80, 300), SK_PAL.indigo, { a: .4, edge: .35, grad: [0, 820, 0, H], gradTo: 1.6, seed: 102, scale: 4, rough: .5 });
  skRainInk(3, { rect: [760, 0, 1160, 1000], n: 70, dots: 18, len: 40 });
  // her reflection in the wet street
  skWash(() => pathSmooth(S7_figPts(1180, fy, 560, 'her').map(p => [p[0], fy + (fy - p[1]) * .35])), SK_PAL.indigo, { a: .18, edge: .3, feather: .8, seed: 103 });
  // the umbrella: a rose canopy with ink ribs
  const ux = 1250, uy = 470, ur = 300, cano = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; cano.push([ux + Math.cos(a) * ur, uy + Math.sin(a) * ur * .55]); }
  const scal = []; for (let i = 8; i >= 0; i--) { const a = Math.PI + i / 8 * Math.PI, x = ux + Math.cos(a) * ur; scal.push([x, uy + 6]); if (i) scal.push([x - ur / 8 * Math.sin(a - Math.PI / 16) * .0 - ur * .12, uy + 26]); }
  skWash(() => pathSmooth([...cano, ...scal.slice(1, -1)], true, .5), SK_PAL.rose, { a: .5, edge: .75, color2: SK_PAL.cinnabar, mix: .3, seed: 104 });
  skInk([cano.map((p, i) => [p[0], p[1], .4 + .6 * Math.sin(i / 8 * Math.PI)])], { w: 7, dry: .35, seed: 105 });
  const ribs = []; for (let i = 0; i <= 8; i++) ribs.push([[ux, uy - ur * .55, .6], [cano[i][0] * .5 + ux * .5, lerp(uy - ur * .55, cano[i][1], .5) - 10], [cano[i][0], cano[i][1] + 4, .3]]);
  skInk(ribs, { w: 3, alpha: .6, dry: .4, seed: 106 });
  skInk([[[ux, uy - ur * .55 - 30, .5], [ux - 20, uy + 60], [ux - 58, 620, .8]], [[ux - 58, 620], [ux - 40, 650, .4]]], { w: 7, dry: .3, seed: 107 });
  // her: a figure in áo dài, seen from behind, painted in indigo with an ink contour
  const her = S7_figPts(1180, fy, 560, 'her');
  skWash(() => pathSmooth(her), SK_PAL.indigo, { a: .62, edge: .8, color2: SK_PAL.ink, mix: .45, seed: 108, feather: .1 });
  skWash(() => X.ellipse(1180, fy - 560 * .905, 560 * .085, 560 * .09, 0, 0, TAU), SK_PAL.ink, { a: .8, edge: .6, seed: 109 });
  skInk([her.slice(4, 14).map((p, i) => [p[0], p[1], .5]), her.slice(17, 27).map(p => [p[0], p[1], .5])], { w: 4, dry: .5, alpha: .6, seed: 110 });
  // two petals from her crown, fallen on the street
  skWash(() => { X.ellipse(1380, 990, 26, 10, .3, 0, TAU); X.ellipse(1470, 1010, 22, 8, -.4, 0, TAU); }, SK_PAL.ochre, { a: .6, edge: .8, seed: 111 });
  S7_room(S7_POOLS.umb);
}

// ---------------------------------------------------------------------------------------------------------------------
// the neon layers (cached, full intensity; composited with 'lighter' at the live intensity)
// ---------------------------------------------------------------------------------------------------------------------
// The face in tubes, split into parts that strike / die separately: 'petal' | 'line' | 'eye'
function S7_neonFacePart(part, cx, cy, R, o = {}) {
  const G = skFaceGeo(R, 0, { sway: 0 }), w = o.w ?? Math.max(2.4, R * .026), base = { t: 0, w, on: 1 };
  X.save(); X.translate(cx, cy);
  if (part === 'petal') {
    skNeon(() => G.back.forEach(p => { X.moveTo(lerp(p.root[0], p.c[0], .9), lerp(p.root[1], p.c[1], .9)); X.lineTo(lerp(p.c[0], p.tip[0], .7), lerp(p.c[1], p.tip[1], .7)); }), SK_PAL.neonPink, { ...base, seed: 11, I: .55, w: w * .8, halo: .8 });
    skNeon(() => G.front.forEach(p => pathSmooth(p.pts)), SK_PAL.neonPink, { ...base, seed: 12, halo: .8 });
  } else if (part === 'line') {
    const H = G.hair, fr = G.fringe.slice(7);
    skNeon(() => { pathSmooth([H[11], H[12], ...H.slice(0, 9)], false, .9); const F = G.face; pathSmooth([F[33], F[34], F[35], ...F.slice(0, 22)], false); X.moveTo(fr[0][0], fr[0][1]); for (let j = 1; j + 1 < fr.length; j += 2) X.quadraticCurveTo(fr[j][0], fr[j][1] + R * .2, fr[j + 1][0], fr[j + 1][1]); }, SK_PAL.neonCyan, { ...base, seed: 13, halo: .8 });
  } else {
    const open = .6;
    skNeon(() => {
      for (const e of G.eyes) { const oy = e.ry * open, cy2 = e.y + (e.ry - oy) * .5; X.moveTo(e.x + e.rx, cy2); X.ellipse(e.x, cy2, e.rx, oy, 0, 0, TAU); const wa = e.sd > 0 ? Math.PI * 1.95 : Math.PI * 1.05; X.moveTo(e.x + Math.cos(wa) * e.rx, cy2 + Math.sin(wa) * oy); X.lineTo(e.x + Math.cos(wa) * e.rx + e.sd * R * .11, cy2 + Math.sin(wa) * oy - R * .09); }
      const [mx, my] = G.mouth; X.moveTo(mx - R * .08, my - R * .01); X.quadraticCurveTo(mx, my + R * .06, mx + R * .08, my - R * .01);
    }, SK_PAL.neonWhite, { ...base, seed: 14, w: w * .85, halo: .8 });
    skNeon(() => {
      for (const e of G.eyes) { const oy = e.ry * open, iy = e.y + (e.ry - oy) * .5 + oy * .3; sparkPath(e.x, iy, Math.min(R * .12, oy * .75), 6, .25, .3, .55); }
      for (const e of G.eyes) for (let k = 0; k < 3; k++) { const bx = e.x + e.sd * R * .06 + (k - 1) * R * .07, by = R * .47; X.moveTo(bx + R * .025, by - R * .03); X.lineTo(bx - R * .025, by + R * .03); }
    }, SK_PAL.neonPink, { ...base, seed: 15, w: w * .6, halo: .7 });
  }
  X.restore();
}
const S7_PARTS = ['petal', 'line', 'eye'];
function S7_neonFace(cam, part, R = S7_FACE.R, dx = S7_NOFS[0], dy = S7_NOFS[1]) {
  return S7_cache(`nf:${part}:${JSON.stringify(cam)}:${R}:${dx}:${dy}`, () => { if (cam) camBegin(cam); S7_neonFacePart(part, S7_FACE.x + dx, S7_FACE.y + dy, R); if (cam) camEnd(); });
}
// Draw the neon face (three parts) with per-part intensity I(part index)
function S7_drawNeonFace(t, cam, camLive, I, o = {}) {
  S7_PARTS.forEach((p, i) => { const a = I(i); if (a > .003) S7_put(S7_neonFace(cam, p, o.R, o.dx, o.dy), camLive, clamp(a, 0, 1.4) * (o.alpha ?? 1), 'lighter'); });
}
// A neon tear: a drop swells at the lower lid, falls, and leaves a fading trail (live, small)
function S7_neonTear(t, t0, x0, y0, R, color = SK_PAL.neonCyan) {
  const age = t - t0; if (age < 0 || age > 1.6) return;
  const fall = age < .2 ? 0 : Math.pow((age - .2) / 1.1, 2) * R * 2.4, yy = y0 + fall, s = R * .075 * (.6 + .4 * clamp(age / .2)), fade = 1 - clamp((age - 1.1) / .5);
  skNeon(() => { X.moveTo(x0, yy - s * 2.2); X.quadraticCurveTo(x0 + s * 1.1, yy - s * .2, x0, yy + s); X.quadraticCurveTo(x0 - s * 1.1, yy - s * .2, x0, yy - s * 2.2); }, color, { t, w: R * .02, I: fade, halo: 1.2, seed: 16 });
  if (fall > s * 2) skNeon(() => { X.moveTo(x0, y0); X.lineTo(x0, yy - s * 2.4); }, color, { t, w: R * .009, I: .45 * fade * (1 - clamp(age / 1.3)), halo: .6, seed: 18 });
}
// the lake: the ∞ traced in pink (write-on 0..1), the horizon line and the lamp, reflected in the water
function S7_neonInf(k, a = 430, cx = 1210, cy = 340, col = SK_PAL.neonPink, refl = true) {
  const pts = S7_inf(cx + 6, cy - 5, a, 160, 0, clamp(k));
  const draw = () => skNeon(() => { X.moveTo(pts[0][0], pts[0][1]); for (const p of pts) X.lineTo(p[0], p[1]); }, col, { t: 0, w: 9, seed: 21 });
  if (refl) skReflect(draw, 690, { a: .5, t: 0, wet: false, fade: 380 });
  draw();
}
function S7_neonLakeExtras() {
  const lamp = () => { skNeon(() => { X.arc(1700, 382, 26, 0, TAU); }, SK_PAL.neonAmber, { t: 0, w: 6, seed: 23 }); skNeon(() => { X.moveTo(1700, 410); X.lineTo(1700, 660); }, SK_PAL.neonAmber, { t: 0, w: 4, seed: 24, I: .7 }); };
  skReflect(lamp, 690, { a: .45, t: 0, wet: false });
  lamp();
  skNeon(() => { X.moveTo(-20, 668); X.bezierCurveTo(500, 640, 1300, 676, 1940, 648); }, SK_PAL.neonCyan, { t: 0, w: 4, seed: 25, I: .8 });
}
// the umbrella rim, and the figure that is no longer there
function S7_neonUmb() {
  const ux = 1250, uy = 470, ur = 300;
  skNeon(() => { for (let i = 8; i >= 0; i--) { const a = Math.PI + i / 8 * Math.PI, x = ux + Math.cos(a) * ur + 6, y = uy + Math.sin(a) * ur * .55 - 4; i === 8 ? X.moveTo(x, y) : X.lineTo(x, y); } }, SK_PAL.neonPink, { t: 0, w: 7, seed: 31 });
  skNeon(() => { X.moveTo(ux + 6, uy - ur * .55 - 34); X.lineTo(ux - 14, uy + 60); X.lineTo(ux - 52, 616); }, SK_PAL.neonPink, { t: 0, w: 5, seed: 32, I: .8 });
}
function S7_neonHim(on = 1) {
  const him = S7_figPts(1470, 950, 600, 'him');
  const draw = () => skNeon(() => { X.moveTo(him[0][0], him[0][1]); for (const p of him) X.lineTo(p[0], p[1]); X.closePath(); }, SK_PAL.neonCyan, { t: 0, w: 7, seed: 33, on });
  skReflect(draw, 950, { a: .35, t: 0, wet: false, stretch: .5, fade: 160 });
  draw();
}
// the neon night street behind the torn silk
function S7_night(kind) {
  return S7_cache('night:' + kind, () => {
    const L = kind === 'lake' ? [{ x: 1210, y: 330, r: 620, color: SK_PAL.neonPink }, { x: 420, y: 300, r: 420, color: SK_PAL.neonCyan }, { x: 1700, y: 420, r: 300, color: SK_PAL.neonAmber }]
      : [{ x: 1320, y: 420, r: 620, color: SK_PAL.neonPink }, { x: 520, y: 300, r: 460, color: SK_PAL.neonCyan }, { x: 1750, y: 260, r: 320, color: SK_PAL.neonAmber, a: .7 }];
    skNight(0, { horizon: 640, lights: L, bokeh: 46 });
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// torn strips: the silk painting cut into ragged strips that jump on the beat, the neon behind
// o: {n, gap, dir 'v'|'h', amp, seed, rot}
// ---------------------------------------------------------------------------------------------------------------------
function S7_strips(t, silk, o = {}) {
  const n = o.n ?? 8, gap = o.gap ?? 20, dir = o.dir || 'v', amp = (o.amp ?? 24) * 1.6, sd = o.seed ?? 1, len = dir === 'v' ? W : H, cross = dir === 'v' ? H : W;
  const b = beatF(t), bi = Math.floor(b), bp = b - bi;
  for (let i = 0; i < n; i++) {
    // cut positions (uneven widths)
    const cut = j => j <= 0 ? -60 : j >= n ? len + 60 : len * (j + sjit(j * 3 + sd, .3)) / n, c0 = cut(i), c1 = cut(i + 1);
    const g = gap * (.4 + 1.3 * hash(i * 5.7 + sd)), g1 = gap * (.4 + 1.3 * hash((i + 1) * 5.7 + sd));
    const a0 = c0 + (i ? g / 2 : 0), a1 = c1 - (i < n - 1 ? g1 / 2 : 0);
    // the jump: every beat each strip snaps to a new offset
    const tg = k => (hash(i * 7.13 + k * 1.31 + sd) - .5) * 2 * amp * (i % 2 ? 1 : -1);
    const off = lerp(tg(bi - 1), tg(bi), expoOut(clamp(bp / .22))) + (o.drop ? o.drop(i) : 0), rot = (o.rot ?? 0) * (hash(i * 2.9 + sd) - .5);
    const e0 = S7_ragged(a0, -60, a0, cross + 60, i * 2 + sd, 6), e1 = S7_ragged(a1, cross + 60, a1, -60, i * 2 + 1 + sd, 6);
    const poly = [...e0, ...e1].map(p => dir === 'v' ? p : [p[1], p[0]]);
    const dx = dir === 'v' ? 0 : off, dy = dir === 'v' ? off : 0, mid = (a0 + a1) / 2, pv = dir === 'v' ? [mid, H / 2] : [W / 2, mid];
    X.save(); X.translate(dx, dy); X.translate(pv[0], pv[1]); X.rotate(rot); X.translate(-pv[0], -pv[1]);
    // a shadow on the neon behind, then the strip
    X.save(); X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 24 * SX; X.shadowOffsetY = 10 * SX; X.fillStyle = '#000'; X.beginPath(); poly.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.fill(); X.restore();
    X.save(); X.beginPath(); poly.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.clip();
    X.translate(-dx * (o.parallax ?? 0), -dy * (o.parallax ?? 0)); X.drawImage(silk, 0, 0, W, H); X.restore();
    // torn lips: silk threads and a neon rim from the light behind
    X.lineJoin = 'round'; X.lineCap = 'round';
    for (const E of [e0, e1]) {
      const pts = E.map(p => dir === 'v' ? p : [p[1], p[0]]), path = () => { X.beginPath(); pts.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); };
      X.globalCompositeOperation = 'lighter'; X.strokeStyle = skRgba(o.rim || SK_PAL.neonPink, .1); X.lineWidth = 22; path(); X.stroke();
      X.strokeStyle = skRgba(o.rim || SK_PAL.neonPink, .18); X.lineWidth = 6; path(); X.stroke();
      X.globalCompositeOperation = 'source-over'; X.strokeStyle = 'rgba(244,236,220,.85)'; X.lineWidth = 1.3; path(); X.stroke();
    }
    X.restore();
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// lyric: pre (small brush) · KEY (big brush, traced in neon, letter by letter on the 16ths) · post (small brush)
// box: {x, y, maxW, big, small, inline, col (neon colour), rot}
// ---------------------------------------------------------------------------------------------------------------------
function S7_split(L, key) {
  const ws = wordTimes(L), kw = key.split(' '), low = ws.map(w => w.w.toLowerCase());
  let j = 0; for (; j <= ws.length - kw.length; j++) if (kw.every((k, i) => low[j + i] === k)) break;
  if (j > ws.length - kw.length) j = 0;
  return { pre: ws.slice(0, j), key: ws.slice(j, j + kw.length), post: ws.slice(j + kw.length) };
}
// write-on 0..1 of a run of words by their sung times (by characters)
function S7_wk(t, ws) {
  if (!ws.length) return 0; const tot = ws.reduce((a, w) => a + w.w.length + 1, -1); let acc = 0;
  for (let i = 0; i < ws.length; i++) { const w = ws[i], p = clamp((t - w.t + .04) / Math.max(.18, Math.min(.3, (w.end - w.t) * .9))); acc += w.w.length * p + (i ? (t >= w.t ? 1 : 0) : 0); if (t < w.t) break; }
  return clamp(acc / tot);
}
// wrap words into lines of at most maxW
function S7_wrap(ws, fnt, maxW) {
  const lines = []; let cur = [];
  for (const w of ws) { const test = [...cur, w].map(q => q.w).join(' '); if (cur.length && textW(test, fnt) > maxW) { lines.push(cur); cur = [w]; } else cur.push(w); }
  if (cur.length) lines.push(cur); return lines;
}
function S7_layout(li, box) {
  const L = S7_LY[li]; if (!L) return null;
  const sp = S7_split(L, S7_KEYS[li % 4]), sm = box.small ?? 50, fs = FONT.vnI(sm), fsB = FONT.vnI(sm);
  const keyStr = sp.key.map(w => w.w).join(' ');
  let big = box.big ?? 210; const kw0 = textW(keyStr, FONT.vnI(big)); if (kw0 > box.maxW) big = Math.floor(big * box.maxW / kw0);
  const fk = FONT.vnI(big), kw = textW(keyStr, fk), rows = [];
  let y = box.y;
  S7_wrap(sp.pre, fs, box.maxW).forEach(r => { rows.push({ ws: r, x: box.x, y, fnt: fs, size: sm }); y += sm * 1.3; });
  const ky = (sp.pre.length ? y - sm * .3 : y) + big * .82;
  if (box.inline) {
    const px = box.x + kw + sm * .8, pw = box.x + box.maxW - px;
    S7_wrap(sp.post, fs, Math.max(200, pw)).forEach((r, i) => rows.push({ ws: r, x: px, y: ky - (i ? -sm * 1.3 * i : 0), fnt: fs, size: sm }));
  } else {
    let py = ky + sm * 1.5;
    S7_wrap(sp.post, fs, box.maxW).forEach(r => { rows.push({ ws: r, x: box.x + (box.indent ?? 0), y: py, fnt: fs, size: sm }); py += sm * 1.3; });
  }
  return { rows, key: sp.key, keyStr, big, fk, kx: box.x, ky, kw, fsB };
}
function S7_neonWordCache(lay, box) {
  return S7_cache(`nw:${lay.keyStr}:${box.x}:${box.y}:${lay.big}:${box.col}:${box.rot || 0}:${box.tx || 0}:${box.ty || 0}`, () => {
    S7_boxT(box); skNeonText(lay.keyStr, lay.kx + 4, lay.ky - 3, { size: lay.big, font: lay.fk, tracking: 0, color: box.col || SK_PAL.neonPink, w: Math.max(3, lay.big * .026), t: 0, on: 1, halo: 1.1 });
  });
}
const S7_boxT = box => { if (box.tx || box.ty || box.rot) { X.translate(box.tx || 0, box.ty || 0); X.rotate(box.rot || 0); } };
function S7_lyric(t, li, box, I = 1) {
  const lay = S7_layout(li, box); if (!lay) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); S7_boxT(box);
  // small brush rows, written on as sung
  for (const r of lay.rows) { const k = S7_wk(t, r.ws); if (k > 0) skBrushText(r.ws.map(w => w.w).join(' '), r.x, r.y, { size: r.size, font: r.fnt, k, dry: .3, hand: .5, color: box.ink || SK_PAL.ink, bleed: .8 }); }
  // the key: brushed big as sung
  const k0 = lay.key[0]?.t ?? 0, kEnd = (lay.key[lay.key.length - 1]?.t ?? k0) + .25, kk = clamp((t - k0 + .03) / Math.max(.3, kEnd - k0));
  if (kk > 0) skBrushText(lay.keyStr, lay.kx, lay.ky, { size: lay.big, font: lay.fk, k: kk, dry: .5, hand: .35, color: box.ink || SK_PAL.ink });
  X.restore();
  // ...then traced in neon, letter by letter on the 16ths
  if (t < k0 + .06) return;
  const c = S7_neonWordCache(lay, box), Lx = layout(lay.keyStr, lay.fk, 0), letters = Lx.map((l, i) => i).filter(i => Lx[i].ch !== ' ');
  const dt = Math.min(BEAT / 4, 1.1 / letters.length), P = S7_pulse(t);
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); S7_boxT(box);
  letters.forEach((i, n) => {
    const l = Lx[i], on = S7_strike(t, k0 + .08 + n * dt, i + li * 13, .22) * P * I * S7_die(t, 40 + i + li * 7);
    if (on <= .003) return;
    const prv = Lx[i - 1], nxt = Lx[i + 1], xa = i ? lay.kx + (prv.x + prv.w + l.x) / 2 : lay.kx - lay.big, xb = nxt ? lay.kx + (l.x + l.w + nxt.x) / 2 : lay.kx + lay.kw + lay.big;
    X.save(); X.beginPath(); X.rect(xa, lay.ky - lay.big * 1.7, xb - xa, lay.big * 2.6); X.clip();
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'lighter'; X.globalAlpha = clamp(on, 0, 1.3); X.drawImage(c, 0, 0); X.restore();
  });
  X.restore();
}
// a torn silk banner across the lower third (the lyric's ground in the escalation)
const S7_BAN = { y0: 742, y1: 1048, rot: -.012 };
function S7_banner(t, seed = 1) {
  const silk = S7_cache('silk0', () => { skSilk(0, { tint: '#F3E3C4', tintA: .25 }); skWash(() => X.rect(-40, 700, W + 80, 400), SK_PAL.ochre, { a: .12, edge: .4, seed: 5, scale: 4, feather: .6 }); });
  const top = S7_ragged(-40, S7_BAN.y0, W + 40, S7_BAN.y0, seed * 3 + 1, 9, 12), bot = S7_ragged(W + 40, S7_BAN.y1, -40, S7_BAN.y1, seed * 3 + 2, 9, 12), poly = [...top, ...bot];
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.translate(W / 2, (S7_BAN.y0 + S7_BAN.y1) / 2); X.rotate(S7_BAN.rot); X.translate(-W / 2, -(S7_BAN.y0 + S7_BAN.y1) / 2);
  X.save(); X.shadowColor = 'rgba(0,0,0,.75)'; X.shadowBlur = 40 * SX; X.shadowOffsetY = 14 * SX; X.fillStyle = '#000'; X.beginPath(); poly.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.fill(); X.restore();
  X.save(); X.beginPath(); poly.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.clip(); X.drawImage(silk, 0, 0, W, H);
  // light from the neon behind leaks through the thin silk at the torn edges
  const g = X.createLinearGradient(0, S7_BAN.y0 - 10, 0, S7_BAN.y0 + 60); g.addColorStop(0, skRgba(SK_PAL.neonPink, .35 * S7_pulse(t))); g.addColorStop(1, skRgba(SK_PAL.neonPink, 0));
  X.globalCompositeOperation = 'multiply'; X.fillStyle = g; X.fillRect(0, S7_BAN.y0 - 20, W, 90); X.restore();
  X.lineJoin = 'round'; X.strokeStyle = 'rgba(244,236,220,.9)'; X.lineWidth = 1.4; for (const E of [top, bot]) { X.beginPath(); E.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke(); }
  X.globalCompositeOperation = 'lighter'; X.strokeStyle = skRgba(SK_PAL.neonPink, .3 * S7_pulse(t)); X.lineWidth = 5; X.beginPath(); top.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
  X.restore();
}
const S7_BANBOX = { x: 110, y: 812, maxW: 1680, big: 180, small: 48, inline: true, tx: W / 2, ty: (S7_BAN.y0 + S7_BAN.y1) / 2, rot: S7_BAN.rot };
function S7_banBox(extra) { const b = { ...S7_BANBOX, ...extra }; b.x -= b.tx; b.y -= b.ty; return b; }

// ---------------------------------------------------------------------------------------------------------------------
// shots
// ---------------------------------------------------------------------------------------------------------------------
const S7_COLBOX = { x: 110, y: 300, maxW: 760, big: 220, small: 50 };
// Face with neon over silk (first half). view: 'wide' | 'ecu' | 'mid'
function S7_faceShot(t, lt, view, o = {}) {
  const cam = view === 'ecu' ? S7_ECU : view === 'mid' ? S7_MID : null;
  const silk = S7_cache('face:' + view, () => S7_paintFace(cam));
  const drift = S7_cam({ x: W / 2 + (o.px ?? -20) * lt, y: H / 2 + (o.py ?? -6) * lt, zoom: 1.02 + (o.zoom ?? .012) * lt + .012 * pulse(t, .4), shake: 2.5 * pulse(t, .3) });
  S7_put(silk, drift);
  // painted tears bleed down the silk
  if (o.tears) {
    camBegin(drift); if (cam) { X.translate(W / 2, H / 2); X.scale(cam.zoom, cam.zoom); X.translate(-cam.x, -cam.y); }
    const G = skFaceGeo(S7_FACE.R, 0, { sway: 0 });
    for (const e of G.eyes) skBleed(S7_FACE.x + e.x + e.sd * e.rx * .35, S7_FACE.y + e.y + e.ry * .85, SK_PAL.indigo, t, 0, { k: clamp(o.tears(t) * (e.sd > 0 ? 1 : .85)), len: S7_FACE.R * .95, w: S7_FACE.R * .07, seed: 7 + e.sd * 7, a: .36, color2: SK_PAL.rose });
    camEnd();
  }
  // the neon traced over the painting
  const I = o.I || (() => S7_pulse(t));
  S7_drawNeonFace(t, cam, drift, i => I(i));
  if (o.tearT) {
    camBegin(drift); if (cam) { X.translate(W / 2, H / 2); X.scale(cam.zoom, cam.zoom); X.translate(-cam.x, -cam.y); }
    const G = skFaceGeo(S7_FACE.R, 0, { sway: 0 });
    for (const tt of o.tearT) G.eyes.forEach(e => S7_neonTear(t, tt + (e.sd > 0 ? 0 : .08), S7_FACE.x + S7_NOFS[0] + e.x + e.sd * e.rx * .35, S7_FACE.y + S7_NOFS[1] + e.y + e.ry * .85, S7_FACE.R));
    camEnd();
  }
}
// Lake with the ∞ (first half)
function S7_lakeShot(t, lt, closer) {
  const silk = S7_cache('lake', S7_paintLake), m1 = S7_LY[1] ? S7_split(S7_LY[1], 'mãi mãi').key : [{ t: 193.1 }, { t: 193.42 }];
  const cam = closer ? S7_cam({ x: 1180 + lt * 8, y: 470, zoom: 1.26 + lt * .02 + .015 * pulse(t, .4), shake: 2 * pulse(t, .3) }) : S7_cam({ x: W / 2 + 30 - lt * 10, y: H / 2, zoom: 1.03 + lt * .01 + .012 * pulse(t, .4), shake: 2 * pulse(t, .3) });
  S7_put(silk, cam);
  const P = S7_pulse(t), ex = S7_cache('nLake', S7_neonLakeExtras);
  S7_put(ex, cam, S7_strike(t, S7_B(302), 5) * P * .9, 'lighter');
  // the ∞ is traced on the first "mãi", and blazes on the second
  const t1 = m1[0].t, t2 = m1[1] ? m1[1].t : t1 + .32, k = clamp((t - t1 + .02) / (t2 - t1));
  if (k > 0 && k < 1) { camBegin(cam); S7_neonInf(easeInOut(k), 430, 1210, 340, SK_PAL.neonPink, false); camEnd(); }
  if (k >= 1) S7_put(S7_cache('nInf', () => S7_neonInf(1)), cam, P * (1 + 1.2 * hit(t, t2, .5)), 'lighter');
  if (t >= t2) S7_put(S7_cache('nInf2', () => S7_neonInf(1, 470, 1210, 340, SK_PAL.neonCyan, true)), cam, S7_strike(t, t2 + BEAT, 9) * P * .7, 'lighter');
  S7_flash(t, t2, .35, '#FFD0EA');
}
// Umbrella (first half)
function S7_umbShot(t, lt, closer) {
  const silk = S7_cache('umb', S7_paintUmb), sp = S7_LY[2] ? S7_split(S7_LY[2], 'không bên em').key : [{ t: 198.78 }, { t: 199.1 }, { t: 199.42 }];
  const cam = closer ? S7_cam({ x: 1330 - lt * 6, y: 640, zoom: 1.32 + lt * .02 + .012 * pulse(t, .4), shake: 2 * pulse(t, .3) }) : S7_cam({ x: W / 2 + lt * 8, y: H / 2 - lt * 3, zoom: 1.03 + lt * .008 + .012 * pulse(t, .4), shake: 2 * pulse(t, .3) });
  S7_put(silk, cam);
  const P = S7_pulse(t);
  S7_put(S7_cache('nUmb', S7_neonUmb), cam, S7_strike(t, S7_B(310), 3) * P, 'lighter');
  // he is there in neon beside her... flickers on "không", "bên", and is gone on "em" (only the dead glass is left)
  const [a, b, c] = sp.map(w => w.t), him = S7_cache('nHim', () => S7_neonHim(1)), glass = S7_cache('nHimOff', () => S7_neonHim(0));
  let I = S7_strike(t, S7_B(310) + .1, 4) * P;
  if (t >= a) I *= hash(Math.floor(t * 20) * 1.7) < .55 ? .15 : .9;
  if (t >= b) I *= hash(Math.floor(t * 30) * 2.3) < .6 ? .05 : .7;
  if (t >= c) I = t < c + .1 ? .9 : 0;
  S7_put(glass, cam, t >= c ? 1 : .4);
  S7_put(him, cam, I, 'lighter');
  if (t >= c) S7_flash(t, c, .25, '#BFF4FF', .15);
}

// ---- escalation: the same scenes torn into strips over the neon street ----
function S7_stripFace(t, lt, view, o = {}) {
  const cam = view === 'ecu' ? S7_ECU : null, silk = S7_cache('face:' + view, () => S7_paintFace(cam));
  const live = S7_cam({ x: W / 2 + (o.px ?? 14) * lt, y: H / 2 + (o.py ?? -8) * lt, zoom: (o.z0 ?? 1.04) + .012 * lt + .02 * pulse(t, .4), rot: o.rot ?? 0, shake: 4 * pulse(t, .3) });
  const P = S7_pulse(t);
  S7_put(S7_night('face'), live);
  S7_drawNeonFace(t, cam, live, i => P * 1.1 * (o.I ? o.I(i) : 1), { dx: 0, dy: 0 });
  camBegin(live); S7_strips(t, silk, { n: o.n ?? 7, gap: o.gap ?? 26, amp: o.amp ?? 26, seed: o.seed ?? 1, rot: o.srot ?? .05, rim: SK_PAL.neonPink }); camEnd();
  S7_drawNeonFace(t, cam, live, i => P * .75 * (o.I ? o.I(i) : 1));
  if (o.tearT) {
    camBegin(live); if (cam) { X.translate(W / 2, H / 2); X.scale(cam.zoom, cam.zoom); X.translate(-cam.x, -cam.y); }
    const G = skFaceGeo(S7_FACE.R, 0, { sway: 0 });
    for (const tt of o.tearT) G.eyes.forEach(e => S7_neonTear(t, tt + (e.sd > 0 ? 0 : .08), S7_FACE.x + S7_NOFS[0] + e.x + e.sd * e.rx * .35, S7_FACE.y + S7_NOFS[1] + e.y + e.ry * .85, S7_FACE.R));
    camEnd();
  }
}
function S7_stripLake(t, lt, o = {}) {
  const silk = S7_cache('lake', S7_paintLake), P = S7_pulse(t);
  const live = S7_cam({ x: W / 2 + (o.px ?? -12) * lt + (o.cx ?? 0), y: H / 2 + (o.cy ?? 0), zoom: (o.z0 ?? 1.05) + .015 * lt + .02 * pulse(t, .4), rot: o.rot ?? 0, shake: 4 * pulse(t, .3) });
  S7_put(S7_night('lake'), live);
  S7_put(S7_cache('nInf', () => S7_neonInf(1)), live, P * 1.1, 'lighter');
  camBegin(live); S7_strips(t, silk, { n: o.n ?? 6, gap: o.gap ?? 30, dir: 'h', amp: o.amp ?? 34, seed: o.seed ?? 3, rot: .02, rim: SK_PAL.neonCyan }); camEnd();
  S7_put(S7_cache('nLake', S7_neonLakeExtras), live, P * .8, 'lighter');
  S7_put(S7_cache('nInf', () => S7_neonInf(1)), live, P * (.8 + (o.hits ? o.hits(t) : 0)), 'lighter');
  S7_put(S7_cache('nInf2', () => S7_neonInf(1, 470, 1210, 340, SK_PAL.neonCyan, true)), live, P * .7, 'lighter');
  if (o.more) S7_put(S7_cache('nInf3', () => { S7_neonInf(1, 560, 1210, 340, SK_PAL.neonAmber, false); S7_neonInf(1, 330, 1210, 340, SK_PAL.neonWhite, false); }), live, S7_strike(t, o.more, 2) * P * .8, 'lighter');
}
function S7_stripUmb(t, lt, o = {}) {
  const silk = S7_cache('umb', S7_paintUmb), P = S7_pulse(t);
  const live = S7_cam({ x: W / 2 + (o.px ?? 10) * lt + (o.cx ?? 0), y: H / 2 + (o.cy ?? 0), zoom: (o.z0 ?? 1.05) + .015 * lt + .02 * pulse(t, .4), rot: o.rot ?? 0, shake: 4 * pulse(t, .3) });
  S7_put(S7_night('face'), live);
  S7_put(S7_cache('nHim', () => S7_neonHim(1)), live, (o.him ? o.him(t) : 1) * P, 'lighter');
  camBegin(live); S7_strips(t, silk, { n: o.n ?? 8, gap: o.gap ?? 30, amp: o.amp ?? 30, seed: o.seed ?? 5, rot: .03, rim: SK_PAL.neonCyan }); camEnd();
  S7_put(S7_cache('nUmb', S7_neonUmb), live, P, 'lighter');
  S7_put(S7_cache('nHimOff', () => S7_neonHim(0)), live, .6);
  S7_put(S7_cache('nHim', () => S7_neonHim(1)), live, (o.him ? o.him(t) : 1) * P * .8, 'lighter');
}

// ---- first half ----
const S7_c0 = S7_COLBOX;
// 186.00–188.52: the neon face strikes on over the backlit painting
shot(S7_T0, S7_B(298), (t, lt) => {
  S7_faceShot(t, lt, 'wide', { I: i => S7_strike(t, S7_T0 + .02 + i * BEAT / 2, i + 1, .4) * S7_pulse(t) });
  S7_lyric(t, 0, S7_c0);
  S7_flash(t, S7_T0, .55, '#FFD9EE', .25);
}, { dark: true });
// 188.52–191.05: the eyes, close
shot(S7_B(298), S7_B(302), (t, lt) => {
  S7_faceShot(t, lt, 'ecu', { px: -10, zoom: .02, tearT: [S7_B(300)] });
  S7_lyric(t, 0, S7_c0);
  S7_jolt(t, S7_B(298));
}, { dark: true });
// 191.05–193.73: the lake, the ∞ brushed over the water
shot(S7_B(302), S7_B(306), (t, lt) => { S7_lakeShot(t, lt, false); S7_lyric(t, 1, { ...S7_c0, y: 170, big: 230, col: SK_PAL.neonPink }); S7_jolt(t, S7_B(302)); }, { dark: true });
shot(S7_B(306), S7_B(310), (t, lt) => { S7_lakeShot(t, lt, true); S7_lyric(t, 1, { ...S7_c0, y: 170, big: 230, col: SK_PAL.neonPink }); S7_jolt(t, S7_B(306)); }, { dark: true });
// 196.10–201.15: the umbrella
const S7_umbBox = { ...S7_c0, x: 90, y: 250, maxW: 700, big: 190 };
shot(S7_B(310), S7_B(314), (t, lt) => { S7_umbShot(t, lt, false); S7_lyric(t, 2, { ...S7_umbBox, col: SK_PAL.neonCyan }); S7_jolt(t, S7_B(310)); }, { dark: true });
shot(S7_B(314), S7_B(318), (t, lt) => { S7_umbShot(t, lt, true); S7_lyric(t, 2, { ...S7_umbBox, col: SK_PAL.neonCyan }); S7_jolt(t, S7_B(314)); }, { dark: true });
// 201.15–206.20: the face closer, crying; on the last beat the silk starts to split
const S7_tearsD = t => easeInOut(clamp((t - S7_B(318)) / 3.2));
const S7_tearBeats = [320, 322, 323, 324].map(S7_B);
shot(S7_B(318), S7_B(322), (t, lt) => { S7_faceShot(t, lt, 'mid', { tears: S7_tearsD, tearT: S7_tearBeats, px: -8, zoom: .01 }); S7_lyric(t, 3, S7_c0); S7_jolt(t, S7_B(318)); }, { dark: true });
shot(S7_B(322), S7_B(325), (t, lt) => { S7_faceShot(t, lt, 'wide', { tears: S7_tearsD, tearT: S7_tearBeats, px: 10, zoom: .015 }); S7_lyric(t, 3, S7_c0); S7_jolt(t, S7_B(322)); }, { dark: true });
shot(S7_B(325), S7_B(326), (t, lt) => {
  // the build: the silk splits into strips, the gaps opening onto the neon street
  const k = clamp(lt / BEAT);
  S7_stripFace(t, lt, 'wide', { gap: 2 + 70 * easeIn(k), amp: 4 + 20 * k, n: 5, z0: 1.02 + .03 * k, tearT: S7_tearBeats });
  S7_lyric(t, 3, S7_c0);
}, { dark: true });

// ---- the repeat: escalation (cuts every 2 beats) ----
const S7_bb = (li) => S7_banBox({ col: li % 2 ? SK_PAL.neonCyan : SK_PAL.neonPink });
function S7_esc(b0, b1, li, fn, jolt = 1) {
  shot(S7_B(b0), S7_B(b1), (t, lt) => { fn(t, lt); S7_banner(t, li + 1); S7_lyric(t, li, S7_bb(li)); S7_jolt(t, S7_B(b0), jolt); S7_flash(t, S7_B(b0), .22 * jolt, '#FFE0F0', .14); }, { dark: true });
}
const S7_tearE = b => [b, b + 1].map(S7_B);
// L52 "ánh mắt"
S7_esc(326, 328, 4, (t, lt) => S7_stripFace(t, lt, 'wide', { n: 5, gap: 80, amp: 26, seed: 1, cy: -60, tearT: S7_tearE(326) }), 1.4);
S7_esc(328, 330, 4, (t, lt) => S7_stripFace(t, lt, 'ecu', { n: 5, gap: 90, amp: 30, seed: 2, px: -16, tearT: S7_tearE(328) }));
S7_esc(330, 332, 4, (t, lt) => S7_stripFace(t, lt, 'wide', { n: 6, gap: 100, amp: 34, seed: 3, rot: -.04, z0: 1.12, px: -20, tearT: S7_tearE(330) }));
S7_esc(332, 334, 4, (t, lt) => S7_stripFace(t, lt, 'ecu', { n: 6, gap: 120, amp: 40, seed: 4, rot: .03, z0: 1.08, tearT: S7_tearE(332) }));
// L53 "mãi mãi"
const S7_m2 = () => (S7_LY[5] ? S7_split(S7_LY[5], 'mãi mãi').key.map(w => w.t) : [213.31, 213.63]);
S7_esc(334, 336, 5, (t, lt) => S7_stripLake(t, lt, { n: 4, gap: 70, amp: 30, seed: 3 }));
S7_esc(336, 338, 5, (t, lt) => S7_stripLake(t, lt, { n: 5, gap: 80, amp: 38, seed: 4, z0: 1.3, cx: 150, cy: -170, px: 10, hits: t => S7_m2().reduce((a, q) => a + 1.4 * hit(t, q, .45), 0), more: S7_m2()[1] }));
S7_esc(338, 340, 5, (t, lt) => S7_stripLake(t, lt, { n: 5, gap: 100, amp: 40, seed: 5, rot: .03, more: S7_B(338) }));
S7_esc(340, 342, 5, (t, lt) => S7_stripFace(t, lt, 'wide', { n: 6, gap: 120, amp: 40, seed: 6, rot: .04, z0: 1.1, tearT: S7_tearE(340) }));
// L54 "không bên em"
const S7_k2 = () => (S7_LY[6] ? S7_split(S7_LY[6], 'không bên em').key.map(w => w.t) : [218.99, 219.31, 219.63]);
const S7_himE = t => { const [a, b, c] = S7_k2(); if (t >= c) return t < c + .08 ? 1 : 0; if (t >= b) return hash(Math.floor(t * 30)) < .6 ? .05 : .8; if (t >= a) return hash(Math.floor(t * 20)) < .5 ? .15 : 1; return 1; };
S7_esc(342, 344, 6, (t, lt) => S7_stripUmb(t, lt, { n: 5, gap: 90, amp: 30, seed: 5 }));
S7_esc(344, 346, 6, (t, lt) => S7_stripUmb(t, lt, { n: 5, gap: 100, amp: 34, seed: 6, z0: 1.35, cx: 290, cy: 60, px: -12 }));
S7_esc(346, 348, 6, (t, lt) => S7_stripUmb(t, lt, { n: 6, gap: 120, amp: 40, seed: 7, rot: -.03, him: S7_himE }));
S7_esc(348, 350, 6, (t, lt) => S7_stripFace(t, lt, 'ecu', { n: 6, gap: 140, amp: 44, seed: 8, rot: .04, tearT: S7_tearE(348) }));
// L55 "nơi nào": every scene, faster, then the last hit
S7_esc(350, 352, 7, (t, lt) => S7_stripFace(t, lt, 'wide', { n: 7, gap: 140, amp: 44, seed: 9, tearT: S7_tearE(350) }));
S7_esc(352, 354, 7, (t, lt) => S7_stripLake(t, lt, { n: 6, gap: 120, amp: 50, seed: 10, more: S7_B(352) }));
S7_esc(354, 356, 7, (t, lt) => S7_stripUmb(t, lt, { n: 7, gap: 150, amp: 50, seed: 11, him: () => 0 }));
S7_esc(356, 357, 7, (t, lt) => S7_stripFace(t, lt, 'ecu', { n: 7, gap: 160, amp: 50, seed: 12, rot: -.04, tearT: [S7_B(356)] }));
S7_esc(357, 358, 7, (t, lt) => S7_stripLake(t, lt, { n: 7, gap: 160, amp: 56, seed: 13, z0: 1.2, more: S7_B(352) }));
// 226.42–227.70: the face, everything lit; "nơi nào" lands, the last big hit, then the tubes begin to die
shot(S7_B(358), S7_END, (t, lt) => {
  const hk = hit(t, S7_HIT, .5), die = i => S7_die(t, 90 + i * 3);
  S7_stripFace(t, lt, 'wide', { n: 7, gap: 130 + 80 * hk, amp: 50 + 60 * hk, seed: 14, z0: 1.06 + .05 * hk, tearT: [S7_B(358), S7_HIT], I: i => die(i) * (1 + 1.5 * hk) });
  S7_banner(t, 8); S7_lyric(t, 7, S7_bb(7), 1 + hk);
  S7_jolt(t, S7_B(358), 1.2); S7_jolt(t, S7_HIT, 2, .25);
  S7_flash(t, S7_HIT, .8, '#FFF0F8', .3);
}, { dark: true });
TESTS.s7perf = () => { window.TEST = null; const out = []; for (const t0 of [186.5, 189.5, 192.5, 193.3, 194.5, 197.5, 199.2, 202.5, 205.8, 207.3, 208.3, 212, 213.5, 217, 219.2, 222, 224, 226.9, 227.5]) { const ms = []; for (let i = 0; i < 4; i++) { const a = performance.now(); drawFrame(t0 + i / 30); X.getImageData(0, 0, 1, 1); ms.push(Math.round(performance.now() - a)); } out.push(t0 + ': ' + ms.join(',')); } console.error('S7 ms ' + out.join(' | ')); };
TESTS.s7perf2 = () => { window.TEST = null; drawFrame(208.3); const tm = (nm, fn) => { const ms = []; for (let i = 0; i < 3; i++) { const a = performance.now(); T = 208.3 + i / 30; fn(T); X.getImageData(0, 0, 1, 1); ms.push(Math.round(performance.now() - a)); } return nm + ':' + ms.join(','); };
  const r = [tm('stripFace', t => S7_stripFace(t, 2, 'ecu', { n: 5, gap: 90, amp: 30, seed: 2 })), tm('strips', t => S7_strips(t, S7_cache('face:ecu', () => 0), { n: 5, gap: 90 })), tm('banner', t => S7_banner(t, 5)), tm('lyric', t => S7_lyric(t, 4, S7_bb(4))), tm('jolt', t => S7_jolt(t, t - .05)), tm('finish', t => skFinish(t, null)), tm('neonface', t => S7_drawNeonFace(t, S7_ECU, null, () => 1)), tm('night', t => S7_put(S7_night('face'), null))];
  console.error('S7 parts ' + r.join(' | ')); };
