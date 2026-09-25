// s2_verse1.js: S2 · Verse 1 (33.2–64.7). LỤA: the memory, painted on a long silk handscroll.
// A  33.20–45.15  the scroll by the lake at night: Hồ Gươm with its little tower → the two of them under a lamp, he a step
//                 behind her ("ở đây ngay phía sau em này") → him alone on the bench under the willow, her a fading ghost.
//                 The camera drifts along the scroll and glides to the next vignette on bar downbeats. Lines as inscriptions.
// B  45.15–48.94  silk portrait close-up of the idol, eyes down; on "nước mắt" (huge, brushed) the painted tears run.
// C  48.94–54.00  rain as ink: the shared umbrella on the embankment, drops blooming on "Hạt mưa rơi" → the camera
//                 glides on along the scroll to the moon in the mist and an empty boat: "Giấc mơ" (huge).
// D  54.00–59.05  the old song sheet: the line is written under the staves, the staves are struck out on "phải đặt",
//                 "dấu chấm hết" is brushed huge and a full stop of ink lands and spreads.
// E  59.05–64.73  the road at the end of the lake; he lets a sky lantern go on the downbeat, the camera tilts up with it
//                 into the night: "điều ước" (huge); the last line is a quiet inscription. The silk ends calm but trembling,
//                 a first breath of neon glowing through it from behind.
// Static paintings are baked once (tiled, on white) and multiplied onto the silk; everything that moves is drawn live.

const S2_T0 = 33.2, S2_END = 64.733;
const S2_CUT = [33.2, 45.154, 48.943, 53.996, 59.049, S2_END];
const S2_LY = (typeof LY !== 'undefined' ? LY : []).filter(l => l[0] >= 34 && l[0] < 64.5);   // 9 lines: 34.4 … 62.6
const S2_ws = i => (S2_LY[i] ? wordTimes(S2_LY[i]) : []);
const S2_P = SK_PAL;

// ---------------------------------------------------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------------------------------------------------
function S2_seeded(s, fn) { const o = SEED; SEED = s; try { fn(); } finally { SEED = o; } }
// camera: world point (cx, cy) at the centre of the frame
function S2_cam(cx, cy, z, rot = 0) { X.translate(W / 2, H / 2); if (rot) X.rotate(rot); X.scale(z, z); X.translate(-cx, -cy); }
// piecewise camera path: keys [t, x, y, z, ease] (ease of the segment arriving at that key: 'l' linear drift, 'g' glide)
function S2_path(t, keys) {
  if (t <= keys[0][0]) return keys[0].slice(1, 4);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t < b[0]) { let k = (t - a[0]) / (b[0] - a[0]); k = b[4] === 'g' ? easeInOut(k) : b[4] === 'o' ? easeOut(k) : k; return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
  }
  return keys[keys.length - 1].slice(1, 4);
}

// Bake a static painting over a world rectangle, on white, in frame-sized tiles (silk.js works in frame-sized layers).
// Neighbouring tiles overlap and are blended with linear ramps that sum to one, so no seams. Returns {c, r}.
const S2_BK = {};
function S2_bake(key, rect, seed, painter) {
  const id = key + '@' + SX; if (S2_BK[id]) return S2_BK[id];
  const [rx, ry, rw, rh] = rect, OV = 240;
  const nx = rw <= W ? 1 : Math.ceil((rw - OV) / (W - OV)), ny = rh <= H ? 1 : Math.ceil((rh - OV) / (H - OV));
  const stx = nx > 1 ? (rw - W) / (nx - 1) : 0, sty = ny > 1 ? (rh - H) / (ny - 1) : 0, ovx = W - stx, ovy = H - sty;
  const C = mkCanvas(Math.round(Math.max(rw, W) * SX), Math.round(Math.max(rh, H) * SX)), cx = C.getContext('2d');
  const T = mkCanvas(Math.round(W * SX), Math.round(H * SX)), tx = T.getContext('2d');
  const prev = X;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const ox = rx + i * stx, oy = ry + j * sty;
    tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-over'; tx.globalAlpha = 1; tx.fillStyle = '#fff'; tx.fillRect(0, 0, T.width, T.height);
    X = tx; X.save(); X.setTransform(SX, 0, 0, SX, -ox * SX, -oy * SX);
    try { S2_seeded(seed, painter); } finally { X.restore(); X = prev; }
    // blend weights: a ramp of width OV centred in each overlap (bands never meet, so the weights always sum to one)
    const ramp = (n, i, st, S, horiz) => {
      if (n < 2) return;
      const g = horiz ? tx.createLinearGradient(0, 0, S, 0) : tx.createLinearGradient(0, 0, 0, S), c1 = (S - st) / 2, c2 = (st + S) / 2, h = OV / 2;
      const stops = [[0, i > 0 ? 0 : 1]];
      if (i > 0) stops.push([(c1 - h) / S, 0], [(c1 + h) / S, 1]);
      if (i < n - 1) stops.push([(c2 - h) / S, 1], [(c2 + h) / S, 0]);
      stops.push([1, i < n - 1 ? 0 : 1]);
      stops.forEach(([o, a]) => g.addColorStop(clamp(o), `rgba(0,0,0,${a})`));
      tx.fillStyle = g; tx.fillRect(0, 0, W, H);
    };
    tx.setTransform(SX, 0, 0, SX, 0, 0); tx.globalCompositeOperation = 'destination-in';
    ramp(nx, i, stx, W, true); ramp(ny, j, sty, H, false);
    cx.globalCompositeOperation = 'lighter'; cx.drawImage(T, (ox - rx) * SX, (oy - ry) * SX);
  }
  return (S2_BK[id] = { c: C, r: [rx, ry, Math.max(rw, W), Math.max(rh, H)] });
}
// multiply a baked painting onto the frame under the current (world) transform
function S2_put(B, alpha = 1) {
  X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = alpha; X.imageSmoothingQuality = 'high';
  X.drawImage(B.c, B.r[0], B.r[1], B.r[2], B.r[3]); X.restore();
}

// Brush-write words [a, b) of a sung line as one line of calligraphy, each word written on as it is sung.
function S2_write(t, ws, a, b, x, y, size, o = {}) {
  if (!ws.length || b <= a || !ws[a] || t < ws[a].t - .02) return null;
  const fnt = o.font || (o.big ? FONT.vnI(size) : FONT.vnIR(size)), words = ws.slice(a, b), str = words.map(w => w.w).join(' ');
  const full = layout(str, fnt).width;
  let front = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i]; if (t < w.t - .02) break;
    const xs = i ? layout(words.slice(0, i).map(q => q.w).join(' ') + ' ', fnt).width : 0, xe = layout(words.slice(0, i + 1).map(q => q.w).join(' '), fnt).width;
    const next = words[i + 1] ? words[i + 1].t : w.t + .5, d = clamp(next - w.t, .14, o.dur ?? .38);
    front = lerp(xs, xe, easeOut(clamp((t - w.t + .02) / d)));
  }
  const x0 = o.align === 'center' ? x - full / 2 : o.align === 'right' ? x - full : x;
  const done = front >= full - .5, k = done ? 1 : clamp((front + size * .45 + size * .4) / (full + size * .5));
  skBrushText(str, x0, y, { size, font: fnt, k, color: o.color || S2_P.ink, alpha: o.alpha ?? .95, dry: o.dry ?? (o.big ? .5 : .3), bleed: o.bleed ?? 1, seed: o.seed });
  return { x0, w: full, done, last: words[words.length - 1] };
}
// A scroll inscription: a sung line split into short brushed lines (a column in the painting's empty sky).
// split: word counts per line. o: {size, gap, color, seal: [dx, dy] (a seal once the line is finished)}
function S2_inscribe(t, i, x, y, split, o = {}) {
  const ws = S2_ws(i); if (!ws.length) return;
  const size = o.size || 50, gap = o.gap || size * 1.34; let a = 0, r = null;
  split.forEach((n, li) => { const rr = S2_write(t, ws, a, a + n, x + (o.indent || 0) * li, y + li * gap, size, { color: o.color, seed: i * 7 + li, dry: .25 }); if (rr) r = rr; a += n; });
  if (o.seal && r && r.done && ws.length && t > ws[ws.length - 1].t + .3) {
    const k = easeOut(clamp((t - ws[ws.length - 1].t - .3) / .25));
    X.save(); X.globalAlpha = k; skSeal(x + o.seal[0], y + o.seal[1], size * .72, o.sealTxt || 'LỤA', { alpha: .8 * k, rot: -.04 }); X.restore();
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// painted things (world units; used inside bakes)
// ---------------------------------------------------------------------------------------------------------------------
// a lobed / wobbly blob path
function S2_blob(x, y, rx, ry, s = 0, n = 26, amp = .14) {
  const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, r = 1 + noise1(a * 1.7 + s * 5.1) * amp + noise1(a * 5 + s * 2.3) * amp * .35; pts.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); }
  pathSmooth(pts);
}
// light reserved out of the night washes (the bare silk shows as light): screen a warm white radial
function S2_light(x, y, r, a = .85, col = [255, 246, 226], sy = 1) {
  X.save(); X.globalCompositeOperation = 'screen'; X.translate(x, y); X.scale(1, sy);
  const g = X.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(${col},${a * .5})`); g.addColorStop(1, `rgba(${col},0)`);
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill(); X.restore();
}
// a lamp post with a lantern head; glow = the lamplight halo in ochre washes; refl: y of water/ground for its reflection
function S2_lampPost(x, yb, h, s = 1, seed = 0) {
  const ty = yb - h;
  skInk([[[x, yb, 1], [x + 1, yb - h * .5, .9], [x, ty + 18 * s, .8]]], { w: 7 * s, dry: .45, seed, alpha: .9 });
  skInk([[[x - 16 * s, ty + 20 * s], [x + 16 * s, ty + 20 * s]], [[x - 12 * s, ty - 26 * s], [x, ty - 36 * s], [x + 12 * s, ty - 26 * s]], [[x - 14 * s, ty + 18 * s], [x - 11 * s, ty - 24 * s]], [[x + 14 * s, ty + 18 * s], [x + 11 * s, ty - 24 * s]]], { w: 3.2 * s, dry: .3, seed: seed + 1, alpha: .85 });
  skInk([[[x - 20 * s, yb, .6], [x + 20 * s, yb, .6]]], { w: 6 * s, dry: .5, seed: seed + 2 });
}
function S2_lampGlow(x, y, s = 1, seed = 0) {
  S2_light(x, y, 260 * s, .9);
  skWash(() => S2_blob(x, y + 10 * s, 190 * s, 170 * s, seed, 28, .1), S2_P.ochre, { a: .13, edge: .04, feather: 1, spread: 90 * s, blur: 18 * s, gran: .2, seed: seed + 3, color2: S2_P.rose, mix: .25 });
  skWash(() => S2_blob(x, y, 62 * s, 58 * s, seed + 2, 20, .1), S2_P.ochre, { a: .2, edge: .25, feather: .9, seed: seed + 4 });
}
// water ripple marks: short horizontal brush strokes, longer near the viewer
function S2_ripples(x0, x1, y0, y1, n, seed, o = {}) {
  const st = [], r = rng(seed);
  for (let i = 0; i < n; i++) {
    const u = Math.pow(r(), .8), y = lerp(y0, y1, u), x = lerp(x0, x1, r()), L = (18 + 110 * u) * (.5 + r()) * (o.len ?? 1);
    st.push([[x, y, .3], [x + L * .5, y + (r() - .5) * 3, 1], [x + L, y, .2]]);
  }
  skInk(st, { w: o.w ?? 2.6, alpha: o.alpha ?? .5, dry: .55, color: o.color || S2_P.indigo, seed, tail: .5, bleed: .5 });
}
// a willow: trunk, branches and hanging strands; lean > 0 leans right
function S2_willow(x, y, s, seed, lean = 1, o = {}) {
  const r = rng(seed), top = [x + lean * 150 * s, y - 520 * s];
  skInk([[[x, y, 1], [x + lean * 30 * s, y - 180 * s, 1], [x + lean * 70 * s, y - 360 * s, .85], [top[0], top[1], .6]]], { w: 30 * s, dry: .6, dryTail: .6, seed, alpha: .9 });
  const br = [];
  for (let i = 0; i < 5; i++) {
    const u = .45 + i * .12, bx = lerp(x + lean * 40 * s, top[0], u), by = lerp(y - 200 * s, top[1], u), d = (i % 2 ? 1 : -1) * (i === 4 ? lean : 1);
    br.push([[bx, by, .8], [bx + d * 110 * s, by - 70 * s], [bx + d * 230 * s, by - 50 * s, .3]]);
  }
  skInk(br, { w: 9 * s, dry: .5, seed: seed + 1, alpha: .85 });
  // foliage mass washes, then strands
  const anchors = [];
  br.forEach(b => { for (let k = 0; k < 7; k++) { const u = k / 6; anchors.push([lerp(b[0][0], b[2][0], u) + (r() - .5) * 30 * s, lerp(lerp(b[0][1], b[1][1], u), b[2][1], u) + (r() - .5) * 20 * s]); } });
  for (let k = 0; k < 10; k++) anchors.push([top[0] + (r() - .5) * 260 * s, top[1] + (r() - .3) * 60 * s]);
  skWash(() => anchors.forEach((p, i) => { if (i % 3) return; const L = (200 + r() * 260) * s * (o.len ?? 1); S2_blob(p[0], p[1] + L * .45, 34 * s, L * .5, seed + i, 18, .2); }), S2_P.celadon, { a: .38, edge: .5, feather: .35, color2: S2_P.indigo, mix: .45, seed: seed + 2 });
  const strands = anchors.map((p, i) => { const L = (220 + r() * 330) * s * (o.len ?? 1), sw = (r() - .5) * 40 * s + (o.wind || 0) * 60 * s; return [[p[0], p[1], .7], [p[0] + sw * .3, p[1] + L * .4], [p[0] + sw * .7, p[1] + L * .78], [p[0] + sw, p[1] + L, .1]]; });
  skInk(strands, { w: 2.6 * s, dry: .4, seed: seed + 3, alpha: .7, tail: .6, color: o.strand || S2_P.ink });
}
// the little tower on its islet (Hồ Gươm-like), base on the waterline yb
function S2_tower(x, yb, s, seed = 0) {
  // islet and its trees
  skWash(() => S2_blob(x - 20 * s, yb - 4 * s, 170 * s, 26 * s, seed, 22, .12), S2_P.celadon, { a: .5, edge: .7, color2: S2_P.ink, mix: .4, seed: seed + 1 });
  skWash(() => { S2_blob(x - 125 * s, yb - 60 * s, 55 * s, 62 * s, seed + 2, 20, .22); S2_blob(x - 80 * s, yb - 44 * s, 44 * s, 42 * s, seed + 3, 20, .22); S2_blob(x + 105 * s, yb - 30 * s, 36 * s, 30 * s, seed + 4, 18, .22); }, S2_P.indigo, { a: .55, edge: .7, color2: S2_P.celadon, mix: .5, seed: seed + 5 });
  const tiers = [[55, 12, 82], [42, 82, 132], [30, 132, 172]];
  const body = () => { tiers.forEach(([w, a, b]) => { X.moveTo(x - w * s, yb - a * s); X.lineTo(x + w * s, yb - a * s); X.lineTo(x + w * s * .96, yb - b * s); X.lineTo(x - w * s * .96, yb - b * s); X.closePath(); }); };
  skWash(body, S2_P.ochre, { a: .32, edge: .6, color2: S2_P.sienna, mix: .4, seed: seed + 6, rough: .2 });
  skWash(() => tiers.forEach(([w, a, b]) => { X.moveTo(x + w * s * .2, yb - a * s); X.lineTo(x + w * s, yb - a * s); X.lineTo(x + w * s * .96, yb - b * s); X.lineTo(x + w * s * .2, yb - b * s); X.closePath(); }), S2_P.indigo, { a: .4, edge: .4, seed: seed + 7, feather: .3 });
  // roof pavilion with upturned eaves
  const roof = () => { X.moveTo(x - 40 * s, yb - 176 * s); X.quadraticCurveTo(x - 20 * s, yb - 184 * s, x, yb - 206 * s); X.quadraticCurveTo(x + 20 * s, yb - 184 * s, x + 40 * s, yb - 176 * s); X.quadraticCurveTo(x, yb - 182 * s, x - 40 * s, yb - 176 * s); };
  skWash(roof, S2_P.sienna, { a: .5, edge: .6, seed: seed + 8 });
  const ink = [];
  tiers.forEach(([w, a, b]) => { ink.push([[x - w * s, yb - a * s], [x - w * s * .96, yb - b * s], [x + w * s * .96, yb - b * s], [x + w * s, yb - a * s]]); ink.push([[x - (w + 6) * s, yb - b * s, .6], [x + (w + 6) * s, yb - b * s, .6]]); });
  ink.push([[x - 42 * s, yb - 174 * s], [x - 20 * s, yb - 184 * s], [x, yb - 208 * s], [x + 20 * s, yb - 184 * s], [x + 42 * s, yb - 174 * s]]);
  skInk(ink, { w: 3 * s, dry: .5, seed: seed + 9, alpha: .8 });
  // arched openings
  const archP = () => {
    [[-30, 22, 3], [0, 22, 3], [30, 22, 3]].forEach(([dx]) => { const cx = x + dx * s, by = yb - 22 * s, w = 9 * s, h = 34 * s; X.moveTo(cx - w, by); X.lineTo(cx - w, by - h + w); X.arc(cx, by - h + w, w, Math.PI, 0); X.lineTo(cx + w, by); X.closePath(); });
    [[-17], [17]].forEach(([dx]) => { const cx = x + dx * s, by = yb - 92 * s, w = 7 * s, h = 28 * s; X.moveTo(cx - w, by); X.lineTo(cx - w, by - h + w); X.arc(cx, by - h + w, w, Math.PI, 0); X.lineTo(cx + w, by); X.closePath(); });
    { const cx = x, by = yb - 140 * s, w = 6 * s, h = 24 * s; X.moveTo(cx - w, by); X.lineTo(cx - w, by - h + w); X.arc(cx, by - h + w, w, Math.PI, 0); X.lineTo(cx + w, by); X.closePath(); }
  };
  skWash(archP, S2_P.ink, { a: .75, edge: .5, seed: seed + 10, rough: .1, blur: 2, spread: 4 });
  // reflection, broken by the water
  X.save(); X.translate(0, yb * 2 + 6 * s); X.scale(1, -1);
  skWash(() => { body(); roof(); }, S2_P.indigo, { a: .2, edge: .3, feather: .5, seed: seed + 11, color2: S2_P.ochre, mix: .5 });
  X.restore();
}
// a tapered limb: polyline pts [[u, v], ...] with half-widths ws, as a closed outline (unit coords)
function S2_strip(pts, ws) {
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    L.push([p[0] + nx * ws[i], p[1] + ny * ws[i]]); R.push([p[0] - nx * ws[i], p[1] - ny * ws[i]]);
  });
  return [...L, ...R.reverse()];
}
// Small painted people. (x, y) = feet, h = standing height. o: {who 'her'|'him', pose 'walk'|'back'|'sit', dir 1|-1, alpha, reach, ghost, arm: [[u, v]...]}
function S2_person(x, y, h, o = {}) {
  const d = o.dir ?? 1, P = pts => pts.map(([u, v]) => [x + d * u * h, y + v * h]), her = o.who === 'her', pose = o.pose || 'walk', A = o.alpha ?? 1;
  const sd = (o.seed ?? 0) + (her ? 50 : 10), ns = h / 400;
  const wash = (fn, c, a, opt = {}) => skWash(fn, c, { a: a * A, edge: .7, seed: sd + (opt.k || 0), scale: ns, blur: 2.5 * ns + 1, spread: 7 * ns + 2, color2: opt.c2, mix: opt.mix ?? .5, feather: opt.feather ?? .1, rough: .25 });
  let head, top, flaps = [], legs = [], arms = [], hair;
  if (pose === 'sit') {
    head = [.045, -.705, her ? .054 : .058];
    top = her ? [[-.03, -.64], [.04, -.64], [.065, -.58], [.055, -.46], [.06, -.3], [-.07, -.28], [-.07, -.46], [-.06, -.58]]
      : [[-.05, -.645], [.05, -.645], [.085, -.58], [.075, -.42], [.06, -.28], [-.08, -.27], [-.085, -.45], [-.075, -.58]];
    legs = [S2_strip([[0, -.285], [.12, -.29], [.24, -.29]], [.06, .055, .045]), S2_strip([[.24, -.29], [.245, -.15], [.25, -.02]], [.04, .035, .03])];
    if (her) flaps = [[[.0, -.33], [.22, -.34], [.26, -.28], [.2, -.24], [.0, -.25]]];
    arms = [S2_strip([[.02, -.6], [.08, -.46], [.17, -.36]], [.03, .026, .022])];
    hair = her ? [[-.05, -.72], [.0, -.765], [.07, -.74], [.08, -.7], [.04, -.72], [.0, -.66], [-.04, -.5], [-.08, -.46], [-.08, -.6], [-.07, -.69]]
      : [[-.02, -.72], [.03, -.765], [.09, -.745], [.1, -.71], [.06, -.72], [.0, -.69], [-.02, -.68]];
  } else if (pose === 'back') {
    head = [0, -.93, her ? .058 : .064];
    if (her) {
      top = [[-.03, -.86], [-.1, -.83], [-.095, -.75], [-.07, -.62], [.07, -.62], [.095, -.75], [.1, -.83], [.03, -.86]];
      flaps = [[[-.07, -.625], [-.085, -.45], [-.1, -.26], [.1, -.26], [.085, -.45], [.07, -.625]]];
      legs = [S2_strip([[-.035, -.32], [-.04, -.15], [-.045, -.01]], [.04, .042, .045]), S2_strip([[.035, -.32], [.04, -.15], [.045, -.01]], [.04, .042, .045])];
      hair = [[-.062, -.95], [-.03, -.995], [.03, -.995], [.062, -.95], [.07, -.88], [.055, -.8], [.06, -.7], [.05, -.6], [.02, -.56], [-.02, -.555], [-.05, -.6], [-.06, -.7], [-.055, -.8], [-.07, -.88]];
      arms = [S2_strip([[-.095, -.81], [-.11, -.68], [-.1, -.56]], [.028, .024, .02])];
    } else {
      top = [[-.04, -.86], [-.135, -.825], [-.13, -.7], [-.11, -.52], [.11, -.52], [.13, -.7], [.135, -.825], [.04, -.86]];
      legs = [S2_strip([[-.055, -.53], [-.055, -.26], [-.055, -.01]], [.055, .048, .044]), S2_strip([[.055, -.53], [.055, -.26], [.055, -.01]], [.055, .048, .044])];
      hair = [[-.066, -.92], [-.06, -.97], [0, -.998], [.06, -.97], [.066, -.92], [.06, -.875], [0, -.868], [-.06, -.875]];
      arms = [S2_strip(o.arm || [[.125, -.8], [.14, -.66], [.125, -.54]], [.034, .03, .026])];
    }
  } else {   // walking, side view facing dir
    head = [.015, -.927, her ? .056 : .06];
    if (her) {
      top = [[-.035, -.86], [.035, -.86], [.06, -.8], [.055, -.7], [.04, -.62], [-.045, -.62], [-.06, -.72], [-.065, -.8]];
      flaps = [[[.04, -.63], [.075, -.45], [.085, -.27], [.03, -.27], [.0, -.62]], [[-.045, -.63], [-.0, -.62], [-.06, -.29], [-.17, -.31], [-.09, -.46]]];
      legs = [S2_strip([[.01, -.6], [.05, -.3], [.09, -.02]], [.035, .033, .03]), S2_strip([[-.01, -.6], [-.04, -.3], [-.085, -.02]], [.035, .033, .03])];
      hair = [[-.055, -.94], [-.03, -.985], [.03, -.985], [.065, -.95], [.06, -.9], [.02, -.93], [-.02, -.9], [-.04, -.8], [-.05, -.68], [-.09, -.6], [-.1, -.64], [-.085, -.78], [-.07, -.88]];
      arms = [S2_strip([[0, -.83], [.02, -.7], [.0, -.6]], [.024, .021, .018])];
    } else {
      top = [[-.05, -.86], [.04, -.86], [.075, -.8], [.08, -.64], [.07, -.5], [-.07, -.5], [-.08, -.66], [-.075, -.8]];
      legs = [S2_strip([[-.01, -.51], [-.04, -.27], [-.1, -.03], [-.06, -.005]], [.05, .042, .034, .03]), S2_strip([[.02, -.51], [.07, -.27], [.12, -.03], [.16, -.01]], [.05, .042, .034, .03])];
      hair = [[-.06, -.93], [-.05, -.975], [0, -.99], [.05, -.975], [.07, -.94], [.03, -.95], [-.02, -.93], [-.05, -.88], [-.065, -.89]];
      arms = [S2_strip(o.reach ? [[.02, -.82], [.12, -.74], [.22, -.71]] : [[0, -.82], [.03, -.68], [.04, -.56]], [.03, .026, .022])];
    }
  }
  const hx = x + d * head[0] * h, hy = y + head[1] * h, hr = head[2] * h;
  // crown of petals (the idol's sunflower), behind the head
  if (her && o.crown !== false) {
    wash(() => { for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * .33; const px = hx + Math.cos(a) * hr * 1.3, py = hy + Math.sin(a) * hr * 1.3; X.moveTo(px + Math.cos(a) * hr * .5, py + Math.sin(a) * hr * .5); X.ellipse(px, py, hr * .52, hr * .22, a, 0, TAU); } }, S2_P.ochre, .6, { k: 1, c2: S2_P.sienna, mix: .5 });
  }
  wash(() => legs.forEach(l => pathSmooth(P(l), true, .4)), her ? S2_P.celadon : S2_P.ink, her ? .28 : .6, { k: 2, c2: her ? S2_P.silkDk : S2_P.indigo, mix: .5 });
  if (flaps.length) wash(() => flaps.forEach(f => pathSmooth(P(f), true, .5)), S2_P.rose, .52, { k: 3, c2: S2_P.cinnabar, mix: .35 });
  wash(() => pathSmooth(P(top), true, .5), her ? S2_P.rose : S2_P.indigo, her ? .6 : .66, { k: 4, c2: her ? S2_P.cinnabar : S2_P.cobalt, mix: .4 });
  wash(() => arms.forEach(a => pathSmooth(P(a), true, .4)), her ? S2_P.rose : S2_P.indigo, her ? .62 : .74, { k: 8, c2: her ? S2_P.cinnabar : S2_P.cobalt, mix: .4 });
  wash(() => X.arc(hx, hy, hr, 0, TAU), S2_P.skin, .5, { k: 5, c2: S2_P.rose, mix: .3 });
  wash(() => pathSmooth(P(hair), true, .6), S2_P.ink, .8, { k: 6, c2: S2_P.sienna, mix: .25 });
  if (!o.ghost) {
    const lw = Math.max(1.3, h * .005), T = P(top);
    skInk([T.slice(0, 4).map((p, i) => [...p, .4 + i * .2])], { w: lw, alpha: .5 * A, dry: .5, seed: sd + 7 });
  }
}
// an oil-paper umbrella: apex (x, y), half width w (dome down to its rim)
function S2_umbrella(x, y, w, seed = 0) {
  const n = 10, hd = w * .42, yr = y + hd, rim = [];
  for (let i = 0; i <= n; i++) rim.push([x - w + 2 * w * i / n, yr + Math.sin(i / n * Math.PI) * w * .02]);
  const arcP = k => { const a = Math.PI + k * Math.PI; return [x + Math.cos(a) * w, yr + Math.sin(a) * hd]; };
  const canopy = () => { for (let i = 0; i <= 40; i++) { const p = arcP(i / 40); if (i) X.lineTo(p[0], p[1]); else X.moveTo(p[0], p[1]); } for (let i = n; i > 0; i--) { const a = rim[i], b = rim[i - 1]; X.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - w * .05, b[0], b[1]); } };
  skWash(canopy, S2_P.cinnabar, { a: .52, edge: .8, color2: S2_P.rose, mix: .55, seed, rough: .25 });
  skWash(canopy, S2_P.ochre, { a: .3, edge: .3, feather: .5, seed: seed + 1, grad: [x, y, x, yr], gradTo: .2 });
  const ribs = rim.map((p, i) => { const k = i / n, q = arcP(k), m = [lerp(x, q[0], .5), lerp(y, q[1], .5) - hd * .08]; return [[x, y + 2, .4], m, [p[0], p[1], .8]]; });
  skInk(ribs.slice(1, -1), { w: 2.2, alpha: .5, dry: .4, seed: seed + 2 });
  skInk([Array.from({ length: 21 }, (_, i) => { const p = arcP(i / 20); return [p[0], p[1], .5 + .5 * Math.sin(i / 20 * Math.PI)]; })], { w: 4.5, dry: .45, seed: seed + 3, alpha: .85 });
  skInk([[[x, y - 18], [x, y + 2]]], { w: 5, seed: seed + 4 });
}
// night sky over [x0, x1], graded, with a bare-silk moon hole; horizon y
function S2_sky(x0, x1, y0, yh, moon, o = {}) {
  skWash(() => { X.rect(x0, y0, x1 - x0, yh - y0 + 30); if (moon) { X.moveTo(moon[0] + moon[2], moon[1]); X.arc(moon[0], moon[1], moon[2], 0, TAU); } }, S2_P.indigo,
    { a: o.a ?? .55, edge: .25, feather: .3, color2: S2_P.cobalt, mix: .35, grad: [0, y0, 0, yh], gradTo: o.gradTo ?? .3, seed: o.seed ?? 1, scale: 4, rule: 'evenodd', rough: .15, mottle: .5 });
  if (moon) {
    S2_light(moon[0], moon[1], moon[2] * 3.2, .55);
    skWash(() => X.arc(moon[0], moon[1], moon[2] * .98, 0, TAU), S2_P.ochre, { a: .1, edge: .5, feather: .3, seed: (o.seed ?? 1) + 7 });
    skWash(() => S2_blob(moon[0] + moon[2] * .25, moon[1] - moon[2] * .1, moon[2] * .35, moon[2] * .25, 3), S2_P.ochre, { a: .08, edge: .2, feather: .8, seed: (o.seed ?? 1) + 8 });
  }
}
// far shore at yh: tree line, roofs, little lights and their reflections
function S2_farShore(x0, x1, yh, seed) {
  const r = rng(seed), pts = [[x0, yh + 8]];
  for (let x = x0; x <= x1; x += 40) pts.push([x, yh - 12 - Math.abs(noise1(x / 90 + seed)) * 38 - Math.abs(noise1(x / 23 + seed * 2)) * 12]);
  pts.push([x1, yh + 8]);
  skWash(() => pathPoly(pts), S2_P.indigo, { a: .55, edge: .6, color2: S2_P.ink, mix: .4, seed, scale: 2 });
  skInk([[[x0, yh + 6, .5], [lerp(x0, x1, .33), yh + 4], [lerp(x0, x1, .66), yh + 7], [x1, yh + 5, .5]]], { w: 3, alpha: .6, dry: .6, seed: seed + 1 });
  const lights = []; for (let i = 0; i < (x1 - x0) / 55; i++) lights.push([x0 + r() * (x1 - x0), yh - 6 - r() * 22, 3 + r() * 5]);
  lights.forEach(([x, y, s]) => S2_light(x, y, s * 5, .8));
  skWash(() => lights.forEach(([x, y, s]) => { X.moveTo(x + s, y); X.arc(x, y, s, 0, TAU); X.moveTo(x + s * .5, y + 20); X.ellipse(x, y + 20 + s, s * .5, s * 1.8, 0, 0, TAU); }), S2_P.ochre, { a: .5, edge: .6, seed: seed + 2, blur: 2, spread: 5 });
}
function S2_water(pts, seed, o = {}) {
  skWash(() => pathPoly(pts), S2_P.indigo, { a: o.a ?? .5, edge: .3, feather: .25, color2: S2_P.ink, mix: .25, grad: [0, o.y1 ?? 1080, 0, o.y0 ?? 540], gradTo: o.gradTo ?? .45, seed, scale: 3, rough: .12 });
}
// a walkway lit by the lamps (faint ochre) and a low railing at y
function S2_walk(x0, x1, y, seed) {
  skWash(() => X.rect(x0, y + 4, x1 - x0, 1200 - y), S2_P.sienna, { a: .16, edge: .2, feather: .4, seed, scale: 3, grad: [0, 1080, 0, y], gradTo: .3 });
  const posts = []; for (let x = x0 + 20; x < x1; x += 96) posts.push([[x, y - 4, .8], [x, y + 34, .6]]);
  skInk([[[x0, y - 2, .7], [lerp(x0, x1, .5), y + 1], [x1, y - 1, .7]], [[x0, y + 16, .5], [x1, y + 16, .5]], ...posts], { w: 3.4, dry: .5, seed: seed + 1, alpha: .75 });
}

// ---------------------------------------------------------------------------------------------------------------------
// A · the lakeside scroll
// ---------------------------------------------------------------------------------------------------------------------
const S2A_RECT = [-160, 0, 6060, 1080], S2A_HZ = 520;
function S2A_paint() {
  const [x0, , w] = S2A_RECT, x1 = x0 + w;
  S2_sky(x0 - 40, x1 + 40, -40, S2A_HZ, [430, 215, 78], { a: .72, seed: 2, gradTo: .32 });
  // mist bands over the far shore
  for (const [yy, a] of [[455, .5], [490, .35]]) { X.save(); X.globalCompositeOperation = 'screen'; const g = X.createLinearGradient(0, yy - 40, 0, yy + 40); g.addColorStop(0, 'rgba(240,232,215,0)'); g.addColorStop(.5, `rgba(240,232,215,${a})`); g.addColorStop(1, 'rgba(240,232,215,0)'); X.fillStyle = g; X.fillRect(x0, yy - 40, w, 80); X.restore(); }
  S2_farShore(x0 - 40, x1 + 40, S2A_HZ, 5);
  // water: all the way down in the wide view, then behind the embankment of the promenade
  S2_water([[x0 - 40, S2A_HZ], [x1 + 40, S2A_HZ], [x1 + 40, 832], [2050, 832], [1920, 870], [1760, 1000], [1600, 1140], [x0 - 40, 1140]], 7, { y0: S2A_HZ, y1: 1080, a: .6 });
  // near bank under the willow (V1 lower right) and the embankment face of the promenade
  skWash(() => pathSmooth([[1420, 1140], [1560, 1020], [1760, 960], [1940, 890], [2040, 862], [2100, 1140]], true, .6), S2_P.celadon, { a: .45, edge: .6, color2: S2_P.ink, mix: .45, seed: 9, scale: 2 });
  S2_walk(2060, x1 + 40, 832, 11);
  // the lamps (glow first, then the posts over it)
  const lamps = [[2610, 832, 470, 1], [5230, 832, 480, 1], [3900, 832, 440, .95]];
  lamps.forEach(([x, yb, h, s], i) => S2_lampGlow(x, yb - h, s, 20 + i));
  S2_light(1150, 590, 200, .35);
  S2_tower(1150, 612, 1.05, 40);
  S2_ripples(x0, x1, S2A_HZ + 14, 1060, 260, 13);
  // V1: the willow on the right bank
  S2_willow(1840, 1030, 1.05, 50, -1, { wind: -.3 });
  lamps.forEach(([x, yb, h, s], i) => S2_lampPost(x, yb, h, s, 60 + i));
  // V2: he walks a step behind her
  S2_person(2440, 950, 380, { who: 'him', pose: 'walk', dir: 1, reach: true, seed: 1 });
  S2_person(2860, 935, 360, { who: 'her', pose: 'walk', dir: 1, seed: 2 });
  // V3: the bench under the big willow; him alone, her a ghost fading from the seat beside him
  S2_willow(4270, 836, 1.3, 70, 1, { len: 1.1 });
  skInk([[[4450, 918, .6], [4780, 918], [4800, 918, .5]], [[4470, 918], [4470, 960]], [[4780, 918], [4780, 960]], [[4455, 880, .5], [4790, 876, .5]]], { w: 5, dry: .5, seed: 80, alpha: .85 });
  S2_person(4520, 960, 360, { who: 'him', pose: 'sit', dir: 1, seed: 3 });
  S2_person(4700, 960, 345, { who: 'her', pose: 'sit', dir: -1, seed: 4, alpha: .32, ghost: true });
}
function S2A_scene(t) {
  S2_seeded(332, () => {
    skSilk(t);
    const B = S2_bake('A', S2A_RECT, 332, S2A_paint);
    const [cx, cy, z] = S2_path(t, [[33.2, 900, 560, 1.07], [38.206, 1210, 548, 1.05, 'l'], [39.469, 2760, 548, 1.05, 'g'], [40.732, 2900, 552, 1.06, 'l'], [42.0, 4580, 540, 1.05, 'g'], [45.8, 4800, 548, 1.08, 'l']]);
    X.save(); S2_cam(cx, cy, z);
    S2_put(B);
    // live: the lamp flames breathe, ripples wander under the tower
    for (const [x, y] of [[2610, 362], [5230, 352], [3900, 392]]) S2_light(x, y, 60 + Math.sin(t * 2.3 + x) * 6, .35 + .08 * Math.sin(t * 3.1 + x));
    for (let j = 0; j < 3; j++) { const P = 2.9, ph = j / 3, c = Math.floor(t / P + ph), t0 = (c - ph) * P; skRipple(900 + hash(c * 3.1 + j) * 700, 640 + hash(c * 1.7 + j) * 300, t, t0, { r: 60, n: 2, flat: .22, dur: 2.6, alpha: .7 }); }
    // inscriptions
    S2_inscribe(t, 0, 640, 150, [4, 3, 4], { size: 50, seal: [370, 60] });
    S2_inscribe(t, 1, 2080, 180, [5, 3], { size: 50 });
    S2_inscribe(t, 2, 4930, 170, [5, 4, 4], { size: 50, seal: [400, 120] });
    X.restore();
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// B · the portrait: "nước mắt"
// ---------------------------------------------------------------------------------------------------------------------
const S2B_F = [1380, 520, 236];   // face centre and radius
function S2B_paint() {
  const [fx, fy, R] = S2B_F;
  skWash(() => S2_blob(fx, fy + 10, 520, 470, 4, 30, .1), S2_P.indigo, { a: .42, edge: .75, color2: S2_P.rose, mix: .35, seed: 4, scale: 4 });
  skWash(() => S2_blob(560, 250, 360, 230, 8, 24, .16), S2_P.ochre, { a: .2, edge: .15, feather: .9, spread: 90, blur: 14, seed: 5, scale: 3 });
  // willow strands hanging in from the top right
  const st = []; for (let i = 0; i < 16; i++) { const x = 1640 + i * 22 + hash(i) * 20, L = 180 + hash(i * 3) * 300; st.push([[x, -20, .5], [x - 10, L * .5], [x - 26, L, .1]]); }
  skInk(st, { w: 2.4, alpha: .45, dry: .5, seed: 9, tail: .6 });
  skFacePortrait(fx, fy, R, 0, { eyes: 'down', mouth: 0, tears: 0, seed: 7 });
}
function S2B_scene(t) {
  S2_seeded(452, () => {
    skSilk(t);
    const B = S2_bake('B', [0, 0, W, H], 452, S2B_paint), lt = t - S2_CUT[1];
    const z = 1.0 + easeOut(clamp(lt / 4.2)) * .055, [fx, fy, R] = S2B_F;
    X.save(); S2_cam(lerp(960, 1010, clamp(lt / 4)), 540 + lt * 4, z);
    S2_put(B);
    const ws = S2_ws(3), tn = ws[10] ? ws[10].t : 47.84;
    // painted tears: gathered at the lids on "nước", running down the cheeks on "mắt"
    for (const sd of [-1, 1]) {
      const rx = R * 1.06 * .21, ry = R * 1.06 * .25, ex = fx + sd * R * .39 + sd * rx * .35, ey = fy + R * .17 + ry * .85;
      skBleed(ex, ey, S2_P.indigo, t, 0, { k: clamp((t - tn + .1) / 2.6) * (sd > 0 ? 1 : .85), len: R * 1.05, w: R * .075, seed: 7 + sd * 7, a: .38, color2: S2_P.rose });
    }
    // type: the small lines, then "nước mắt" huge, then "đắng cay"
    S2_write(t, ws, 0, 6, 120, 250, 54, { seed: 1 });
    S2_write(t, ws, 6, 10, 120, 330, 54, { seed: 2 });
    const big = S2_write(t, ws, 10, 12, 150, 600, 196, { big: true, seed: 3, dur: .3 });
    S2_write(t, ws, 12, 14, 610, 720, 54, { seed: 4 });
    // ink runs down from the big word once it is written
    if (big && ws[11]) skBleed(150 + big.w * .88, 612, S2_P.ink, t, ws[11].t + .25, { len: 190, w: 14, dur: 1.6, seed: 5, a: .5, color2: S2_P.indigo });
    X.restore();
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// C · rain and the shared umbrella → the moon in the mist: "Giấc mơ"
// ---------------------------------------------------------------------------------------------------------------------
const S2C_RECT = [-140, 0, 4100, 1080], S2C_HZ = 600;
function S2C_paint() {
  const [x0, , w] = S2C_RECT, x1 = x0 + w;
  S2_sky(x0 - 40, x1 + 40, -40, S2C_HZ, [3140, 300, 150], { a: .62, seed: 12, gradTo: .35 });
  // clouds and mist around the moon
  skWash(() => { S2_blob(2700, 380, 420, 70, 3, 26, .2); S2_blob(3500, 200, 360, 60, 5, 26, .2); S2_blob(3000, 470, 520, 50, 7, 26, .2); }, S2_P.indigo, { a: .3, edge: .45, feather: .7, color2: S2_P.celadon, mix: .5, seed: 14, scale: 3 });
  for (const [yy, a, xa, xb] of [[520, .5, 1900, 4000], [430, .35, 2200, 3900], [560, .45, x0, 1900]]) { X.save(); X.globalCompositeOperation = 'screen'; const g = X.createLinearGradient(0, yy - 50, 0, yy + 50); g.addColorStop(0, 'rgba(240,232,215,0)'); g.addColorStop(.5, `rgba(240,232,215,${a})`); g.addColorStop(1, 'rgba(240,232,215,0)'); X.fillStyle = g; X.fillRect(xa, yy - 50, xb - xa, 100); X.restore(); }
  S2_farShore(x0 - 40, 2300, S2C_HZ, 15);
  S2_water([[x0 - 40, S2C_HZ], [x1 + 40, S2C_HZ - 10], [x1 + 40, 1140], [2100, 1140], [1950, 900], [x0 - 40, 900]], 16, { y0: S2C_HZ, y1: 1080, a: .55 });
  // the moon's reflection, broken into strokes
  skWash(() => { for (let i = 0; i < 14; i++) { const u = i / 14, yy = 640 + u * 380, ww = (50 + 80 * u) * (.5 + hash(i * 2.7) * .8); X.moveTo(3140 - ww, yy); X.ellipse(3140 + (hash(i * 5.1) - .5) * 40, yy, ww, 5 + 7 * u, 0, 0, TAU); } }, S2_P.ochre, { a: .4, edge: .6, seed: 17, feather: .2 });
  for (let i = 0; i < 14; i++) S2_light(3140 + (hash(i * 5.1) - .5) * 40, 640 + i / 14 * 380, 70 + i * 6, .4, [255, 246, 226], .12);
  S2_tower(1450, 640, .7, 18);
  S2_ripples(x0, x1, S2C_HZ + 10, 1060, 240, 19);
  // an empty boat drifting on the dream water
  skWash(() => { X.moveTo(2560, 790); X.quadraticCurveTo(2700, 830, 2860, 782); X.lineTo(2830, 806); X.quadraticCurveTo(2700, 846, 2590, 808); X.closePath(); }, S2_P.sienna, { a: .6, edge: .7, color2: S2_P.ink, mix: .5, seed: 20 });
  skInk([[[2556, 788, .6], [2700, 828], [2862, 780, .5]], [[2600, 808, .4], [2700, 842], [2830, 805, .4]]], { w: 4, dry: .4, seed: 21 });
  skWash(() => { X.moveTo(2550, 830); X.quadraticCurveTo(2700, 860, 2870, 826); X.quadraticCurveTo(2700, 880, 2550, 830); }, S2_P.indigo, { a: .25, edge: .3, feather: .6, seed: 22 });
  // embankment of V4, the lamp, the couple under one umbrella (from behind)
  S2_walk(x0 - 40, 2000, 880, 23);
  S2_lampGlow(260, 380, 1, 24);
  S2_lampPost(260, 880, 500, 1, 26);
  S2_person(820, 1045, 440, { who: 'her', pose: 'back', seed: 5 });
  S2_person(985, 1050, 470, { who: 'him', pose: 'back', seed: 6, arm: [[-.125, -.8], [-.15, -.9], [-.12, -.98]] });
  S2_umbrella(930, 478, 255, 27);
  skInk([[[930, 480], [930, 590], [932, 628, .6]]], { w: 5, seed: 28, alpha: .9 });
}
function S2C_scene(t) {
  S2_seeded(489, () => {
    skSilk(t);
    const B = S2_bake('C', S2C_RECT, 489, S2C_paint);
    const [cx, cy, z] = S2_path(t, [[48.6, 880, 560, 1.06], [51.47, 1020, 548, 1.04, 'l'], [52.5, 2800, 520, 1.05, 'g'], [54.6, 2940, 510, 1.07, 'l']]);
    const far = clamp((cx - 1100) / 1500);
    X.save(); S2_cam(cx, cy, z);
    S2_put(B);
    S2_light(260, 362, 60 + Math.sin(t * 2.3) * 6, .35);
    // rain rings on the water
    for (let j = 0; j < 7; j++) { const P = 1.7, ph = j / 7, c = Math.floor(t / P + ph), t0 = (c - ph) * P; skRipple(-100 + hash(c * 3.1 + j * 7) * 3600, 640 + hash(c * 1.7 + j) * 230, t, t0, { r: 34 + hash(c + j) * 30, n: 2, flat: .22, dur: 1.5, alpha: .8 * (1 - far * .5) }); }
    // "Hạt mưa rơi": big drops land and bloom on the silk on the first three words
    const w6 = S2_ws(4);
    [[560, 318, 30], [700, 412, 40], [470, 452, 24]].forEach(([x, y, r], i) => { if (w6[i]) skBloom(x, y, r, S2_P.indigo, t, w6[i].t, { dur: 1.3, seed: 40 + i, a: .4 }); });
    S2_inscribe(t, 4, 110, 170, [3, 3], { size: 56 });
    // "Giấc mơ" huge in the sky by the moon; the rest small beneath
    const w7 = S2_ws(5);
    S2_write(t, w7, 0, 2, 2010, 440, 210, { big: true, seed: 6, dur: .34 });
    S2_write(t, w7, 2, 8, 2040, 540, 52, { seed: 7 });
    X.restore();
    // the rain itself, in the frame (lighter as we reach the dream)
    skRainInk(t, { n: 130, angle: .13, speed: 950, len: 50, dots: 26, w: 2, alpha: lerp(1.5, .5, far) });
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// D · the old song sheet
// ---------------------------------------------------------------------------------------------------------------------
const S2D_SHEET = [960, 548, 1540, 900, -.035];   // centre, size, rotation
function S2D_bg() {
  skWash(() => X.rect(-60, -60, W + 120, H + 120), S2_P.indigo, { a: .5, edge: .2, feather: .3, color2: S2_P.ink, mix: .3, seed: 31, scale: 4, grad: [W, H, 0, 0], gradTo: .5 });
  S2_light(260, 140, 520, .6);
  skWash(() => S2_blob(300, 170, 420, 300, 9, 24, .15), S2_P.ochre, { a: .25, edge: .5, feather: .7, seed: 32, spread: 50, scale: 3 });
}
function S2D_ink() {
  // staves of the old song (faded sepia), inside the sheet's local frame
  const st = [], notes = [], r = rng(33);
  for (let s = 0; s < 3; s++) {
    const y0 = -330 + s * 130;
    for (let l = 0; l < 5; l++) st.push([[-690, y0 + l * 13, .6], [0, y0 + l * 13 + sjit(s * 5 + l, 1.5)], [690, y0 + l * 13, .6]]);
    st.push([[-690, y0], [-690, y0 + 52]], [[690, y0], [690, y0 + 52]]);
    for (let b = 1; b < 4; b++) st.push([[-690 + b * 345, y0], [-690 + b * 345, y0 + 52]]);
    for (let n = 0; n < 15; n++) { const x = -640 + n * 90 + r() * 20, p = Math.floor(r() * 9), y = y0 + 52 - p * 6.5; notes.push([x, y, r() < .3]); }
  }
  skInk(st, { w: 1.8, alpha: .55, dry: .4, color: S2_P.sienna, seed: 34, bleed: .4 });
  skWash(() => notes.forEach(([x, y, open]) => { X.moveTo(x + 9, y); X.ellipse(x, y, 9.5, 6.5, -.35, 0, TAU); }), S2_P.ink, { a: .55, edge: .6, seed: 35, color2: S2_P.sienna, mix: .6, blur: 1.5, spread: 3 });
  skInk(notes.map(([x, y]) => [[x + 8, y - 2, .6], [x + 8, y - 44, .4]]), { w: 2, alpha: .55, color: S2_P.sienna, seed: 36, bleed: .4 });
}
function S2D_scene(t) {
  S2_seeded(540, () => {
    skSilk(t);
    const lt = t - S2_CUT[3];
    const bg = S2_bake('Dbg', [0, 0, W, H], 540, S2D_bg), ink = S2_bake('Dink', [0, 0, W, H], 541, () => { X.translate(S2D_SHEET[0], S2D_SHEET[1]); X.rotate(S2D_SHEET[4]); S2D_ink(); });
    const z = 1.0 + easeInOut(clamp(lt / 5.2)) * .075;
    X.save(); S2_cam(lerp(960, 1030, clamp(lt / 5)), lerp(540, 600, clamp(lt / 5)), z, lerp(.006, -.004, clamp(lt / 5)));
    S2_put(bg);
    // the sheet: pale silk laid on the dark desk
    const [sx, sy, sw, sh, rot] = S2D_SHEET;
    X.save(); X.translate(sx, sy); X.rotate(rot);
    X.save(); X.globalCompositeOperation = 'multiply'; X.filter = `blur(${18 * SX}px)`; X.fillStyle = 'rgba(30,30,50,.55)'; X.fillRect(-sw / 2 + 14, -sh / 2 + 22, sw, sh); X.restore();
    X.fillStyle = '#F4EDE0'; X.fillRect(-sw / 2, -sh / 2, sw, sh);
    X.restore();
    S2_put(ink);
    X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = .55; X.translate(sx, sy); X.rotate(rot); X.beginPath(); X.rect(-sw / 2, -sh / 2, sw, sh); X.clip(); X.rotate(-rot); X.translate(-sx, -sy); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(skSilkBake(), 0, 0); X.restore();
    // writing, in the sheet's frame
    X.save(); X.translate(sx, sy); X.rotate(rot);
    const ws = S2_ws(6);
    S2_write(t, ws, 0, 6, -690, 140, 58, { seed: 1 });
    S2_write(t, ws, 6, 10, -690, 222, 58, { seed: 2 });
    // struck out on "phải đặt"
    const cs = [[ws[8], [[-720, -350, .7], [-200, -220], [300, -120], [720, -40, .4]]], [ws[9], [[-700, -40, .8], [-150, -150], [350, -260], [715, -345, .3]]]];
    cs.forEach(([w, pts], i) => { if (w && t > w.t) skInk([pts], { w: 30, k: easeOut(clamp((t - w.t) / .32)), dry: .55, dryTail: .7, seed: 60 + i, alpha: .92 }); });
    const big = S2_write(t, ws, 10, 13, -700, 400, 172, { big: true, seed: 3, dur: .3 });
    // the full stop: a drop of ink lands and spreads into the silk
    const tDot = ws[12] ? ws[12].t + .28 : 58.38;
    if (big) {
      const dx = -700 + big.w + 60, dy = 380;
      if (t >= tDot) {
        const k = easeOut(clamp((t - tDot) / .12));
        skBloom(dx, dy, 52, S2_P.ink, t, tDot, { dur: 1.8, seed: 70, a: .75, edge: .9, color2: S2_P.indigo, mix: .4 });
        skWash(() => X.arc(dx, dy, 30 * k, 0, TAU), S2_P.ink, { a: .95, edge: .6, seed: 71, blur: 2, spread: 6, rough: .3 });
      }
      S2_write(t, ws, 13, 14, dx + 110, 400, 58, { seed: 4 });
    }
    X.restore();
    X.restore();
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// E · the road at the end, the lantern, the wish
// ---------------------------------------------------------------------------------------------------------------------
const S2E_RECT = [0, -840, 1920, 1940], S2E_VP = [905, 648];
const S2E_REL = 60.944;   // the lantern lets go on the downbeat of bar 24
function S2E_road(u, side) {   // point along a road edge, u = 0 (near) … 1 (vanishing point)
  const a = side < 0 ? [-80, 1120] : [1340, 1120]; return [lerp(a[0], S2E_VP[0] + side * 8, u), lerp(a[1], S2E_VP[1], u)];
}
function S2E_paint() {
  const [x0, y0, w, h] = S2E_RECT, x1 = x0 + w, yh = S2E_VP[1];
  // sky: deep at the top, a crescent moon, stars reserved out of the wash
  skWash(() => { X.rect(x0 - 40, y0 - 40, w + 80, yh - y0 + 60); X.moveTo(1650 + 64, -600); X.arc(1650, -600, 64, 0, TAU); }, S2_P.indigo, { a: .66, edge: .25, feather: .3, color2: S2_P.cobalt, mix: .4, grad: [0, y0, 0, yh], gradTo: .22, seed: 41, scale: 5, rule: 'evenodd', rough: .15 });
  skWash(() => X.arc(1672, -612, 60, 0, TAU), S2_P.indigo, { a: .6, edge: .5, color2: S2_P.cobalt, mix: .4, seed: 42, blur: 2, spread: 5 });
  S2_light(1650, -600, 230, .45);
  const r = rng(43);
  for (let i = 0; i < 70; i++) { const x = x0 + r() * w, y = y0 + r() * (yh - y0 - 160), s = r(); S2_light(x, y, 4 + s * 9, .5 + s * .4); }
  skWash(() => { for (let i = 0; i < 16; i++) { const x = x0 + r() * w, y = y0 + 40 + r() * 900, s = 2 + r() * 3; X.moveTo(x + s, y); X.arc(x, y, s, 0, TAU); } }, S2_P.ochre, { a: .5, edge: .6, seed: 44, blur: 1.5, spread: 3 });
  // night clouds drifting across the stars
  skWash(() => { S2_blob(420, -330, 360, 42, 2, 24, .25); S2_blob(1250, -150, 420, 38, 4, 24, .25); S2_blob(900, -680, 300, 34, 6, 24, .25); S2_blob(1500, 180, 380, 34, 8, 24, .25); }, S2_P.indigo, { a: .32, edge: .4, feather: .6, color2: S2_P.celadon, mix: .45, seed: 52, scale: 3 });
  // mist over the horizon
  X.save(); X.globalCompositeOperation = 'screen'; const g = X.createLinearGradient(0, yh - 120, 0, yh + 20); g.addColorStop(0, 'rgba(240,232,215,0)'); g.addColorStop(.7, 'rgba(240,232,215,.45)'); g.addColorStop(1, 'rgba(240,232,215,0)'); X.fillStyle = g; X.fillRect(x0, yh - 120, w, 140); X.restore();
  S2_farShore(x0 - 40, x1 + 40, yh - 4, 45);
  // the lake on the right of the road
  S2_water([[S2E_VP[0], yh], [x1 + 40, yh - 4], [x1 + 40, 1140], [1340, 1140]], 46, { y0: yh, y1: 1080, a: .5 });
  S2_ripples(1000, x1, yh + 8, 1060, 90, 47);
  // the road: pale, lamplit; its edges in ink
  skWash(() => { const a = S2E_road(0, -1), b = S2E_road(0, 1); X.moveTo(a[0], a[1]); X.lineTo(S2E_VP[0] - 8, yh); X.lineTo(S2E_VP[0] + 8, yh); X.lineTo(b[0], b[1]); X.closePath(); }, S2_P.ochre, { a: .18, edge: .35, feather: .4, seed: 48, grad: [0, 1080, 0, yh], gradTo: .6, color2: S2_P.sienna, mix: .4 });
  // left verge: grass bank
  skWash(() => { const a = S2E_road(0, -1); X.moveTo(x0 - 40, 1140); X.lineTo(a[0], a[1]); X.lineTo(S2E_VP[0] - 8, yh); X.lineTo(x0 - 40, yh - 10); X.closePath(); }, S2_P.celadon, { a: .42, edge: .5, color2: S2_P.indigo, mix: .55, seed: 49, scale: 3, grad: [0, 1080, 0, yh], gradTo: .7 });
  skInk([[S2E_road(0, -1), S2E_road(.5, -1), S2E_road(1, -1)].map((p, i) => [p[0], p[1], 1 - i * .45]), [S2E_road(0, 1), S2E_road(.5, 1), S2E_road(1, 1)].map((p, i) => [p[0], p[1], 1 - i * .45])], { w: 5, dry: .5, seed: 50, alpha: .7 });
  // railing along the lake side
  { const rail = [], a = S2E_road(0, 1); for (let u = .04; u < .97; u += .06 * (1 - u * .6)) { const p = S2E_road(u, 1), s = 1 - u; rail.push([[p[0] + 10 * s, p[1], .6], [p[0] + 10 * s, p[1] - 44 * s]]); }
    rail.push([[a[0] + 10, a[1] - 44], [S2E_VP[0] + 9, yh - 1]]); skInk(rail, { w: 3, dry: .5, seed: 51, alpha: .7 }); }
  // lamps and willows along the left, diminishing
  const lamps = [.2, .45, .62, .74, .82, .875, .91].map(u => { const p = S2E_road(u, -1), s = 1 - u; return [p[0] - 30 * s, p[1], 560 * s, s]; });
  lamps.forEach(([x, yb, hh, s], i) => S2_lampGlow(x, yb - hh, s * 1.1, 90 + i));
  [[.05, 1.3], [.36, .8], [.58, .55], [.72, .38], [.82, .25]].forEach(([u, s], i) => { const p = S2E_road(u, -1); S2_willow(p[0] - 260 * s, p[1] - 10 * s, s, 110 + i, 1, { len: .9 }); });
  lamps.forEach(([x, yb, hh, s], i) => S2_lampPost(x, yb, hh, Math.max(.2, s * 1.1), 120 + i));
  // him, at the end of the road, arms up to let the lantern go
  S2_person(S2E_VP[0] + 2, S2E_VP[1] + 36, 92, { who: 'him', pose: 'back', seed: 8 });
}
// the lantern's flight (after it is let go on the downbeat)
function S2E_lantern(t) {
  const k = Math.max(0, t - S2E_REL), u = 1 - Math.exp(-k / 2.3);
  return { x: S2E_VP[0] + 2 + Math.sin(k * .9) * 18 * u + 230 * u, y: 588 - 960 * u, s: 2.1 - .8 * u, k };
}
function S2E_scene(t) {
  S2_seeded(590, () => {
    const lt = t - S2_CUT[4], end = clamp((t - 63.9) / .83);
    // a first breath of the neon world behind the silk at the very end (the chorus is coming)
    const bk = end * .22;
    skSilk(t, bk > 0 ? { backlight: bk, dim: .75, lights: [[520, 300, 420, S2_P.neonPink], [1450, 420, 460, S2_P.neonCyan]] } : {});
    const B = S2_bake('E', S2E_RECT, 590, S2E_paint);
    const L = S2E_lantern(t);
    let [cx, cy, z] = S2_path(t, [[58.7, 930, 560, 1.04], [S2E_REL, 920, 520, 1.09, 'l'], [62.3, 900, -120, 1.05, 'g'], [65, 900, -210, 1.05, 'l']]);
    // trembling: the silk shivers a little before it tears
    cx += noise1(t * 23) * 3.2 * end + noise1(t * 41 + 7) * 1.5 * end; cy += noise1(t * 19 + 3) * 2.4 * end;
    X.save(); S2_cam(cx, cy, z, noise1(t * 17 + 1) * .0025 * end);
    S2_put(B);
    // the lantern: paper glowing from inside, a warm halo reserved out of the night, embers trailing
    const fl = .85 + .15 * noise1(t * 9) + .1 * end * noise1(t * 31);
    { const g = X.createRadialGradient(L.x, L.y, 0, L.x, L.y, 110 * L.s); g.addColorStop(0, skRgba(S2_P.ochre, .0)); g.addColorStop(.25, skRgba(S2_P.ochre, .28 * fl)); g.addColorStop(1, skRgba(S2_P.ochre, 0)); X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = g; X.beginPath(); X.arc(L.x, L.y, 110 * L.s, 0, TAU); X.fill(); X.restore(); }
    S2_light(L.x, L.y, 170 * L.s * fl, .7);
    S2_light(L.x, L.y, 50 * L.s, .95);
    withT(L.x, L.y, Math.sin(L.k * 1.3) * .06, L.s, () => {
      skWash(() => { X.moveTo(-13, -20); X.quadraticCurveTo(-19, 0, -11, 17); X.lineTo(11, 17); X.quadraticCurveTo(19, 0, 13, -20); X.quadraticCurveTo(0, -24, -13, -20); }, S2_P.ochre, { a: .45, edge: .8, color2: S2_P.cinnabar, mix: .4, seed: 91, blur: 1.2, spread: 3, memo: true });
      skInk([[[-13, -20], [0, -23], [13, -20]], [[-11, 17], [11, 17]]], { w: 1.6, alpha: .6, bleed: .3 });
    });
    for (let i = 0; i < 6; i++) { const d = .25 + i * .22, P = S2E_lantern(t - d); if (P.k <= 0) continue; X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = skRgba(S2_P.cinnabar, .35 * (1 - i / 6)); X.beginPath(); X.arc(P.x + Math.sin(t * 3 + i) * 5, P.y + 16, 2.2 * (1 - i / 8), 0, TAU); X.fill(); X.restore(); }
    // words
    S2_inscribe(t, 7, 110, 190, [3], { size: 54 });
    const w9 = S2_ws(7);
    if (w9.length) S2_write(t, w9, 3, 6, 110, 262, 54, { seed: 5 });
    S2_write(t, w9, 6, 8, 110, -150, 224, { big: true, seed: 6, dur: .3 });
    S2_inscribe(t, 8, 1200, -470, [3, 4], { size: 50, seal: [390, 36] });
    X.restore();
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// shots (watercolour dissolves between the vignettes; the first one blooms out of the intro's last silk shot)
// ---------------------------------------------------------------------------------------------------------------------
const S2_SCENES = [S2A_scene, S2B_scene, S2C_scene, S2D_scene, S2E_scene];
const S2_DIS = [.8, .55, .6, .5, .6];
function S2_prev(t) {
  const prev = SHOTS.filter(s => s.start < S2_T0 && s.end > S2_T0 - .3 && !s.S2).pop();
  if (!prev) { skSilk(t); return; }
  const seed = SEED; X.save(); prev.fn(t, t - prev.start, prev.end - prev.start); X.restore(); SEED = seed;
}
function S2_shot(i, t) {
  const lt = t - S2_CUT[i], d = S2_DIS[i];
  if (lt < d) {
    const A = i ? () => S2_SCENES[i - 1](t) : () => S2_prev(t);
    skDissolve(easeInOut(clamp(lt / d)), 17 + i * 3, A, () => S2_SCENES[i](t), { n: 26, rimA: .45 });
  } else S2_SCENES[i](t);
}
S2_SCENES.forEach((fn, i) => shot(S2_CUT[i], S2_CUT[i + 1], t => S2_shot(i, t), { seed: 3320 + i, S2: true }));
