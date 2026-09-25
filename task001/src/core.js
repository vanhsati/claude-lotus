// core.js: time, audio, math, paper/riso drawing primitives and the camera.
// Every frame is a pure function of song time T. Frames render in parallel and out of order,
// so nothing in here may carry state from one frame to the next.

const W = 1920, H = 1080, FPS = 30;
const BEAT = 0.45454440523533524, BEAT0 = 0.7265692141817615, BAR0 = BEAT0 + BEAT, BAR = BEAT * 4;
const SONG_END = 156.65;

const PAL = {
  paper: '#F2EDE3', paperHi: '#FFFBF3', paperDk: '#E4DCCB', ink: '#1D1B20', ink2: '#3A3640',
  orange: '#E8703A', orangeDk: '#C4552A', orangeLt: '#F6A378', pink: '#FF4F9A', pinkLt: '#FFB3D1',
  yellow: '#FFD23A', blue: '#2E4DA0', blueDk: '#1C2F6B', blueLt: '#9DB2E6', teal: '#138A8A', tealLt: '#8FD1C8',
  red: '#E4322B', sky: '#8FC6E8', skin: '#F8E1CF', skinSh: '#EDBFA5', blush: '#FF8FA8', green: '#2FA35B', violet: '#6A4BC4',
};

let X = null;            // main 2D context (set by studio)
let T = 0;               // current song time
let BOIL = 0;            // 12 fps boil index: hand-made wobble changes 12 times a second
let SEED = 0;            // per-shot seed (set by the timeline)

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, k) => a + (b - a) * k;
const invlerp = (a, b, x) => clamp((x - a) / (b - a));
const frac = x => x - Math.floor(x);
const TAU = Math.PI * 2;
const ease = k => (k = clamp(k), k * k * (3 - 2 * k));
const easeIn = k => (k = clamp(k), k * k * k);
const easeOut = k => (k = clamp(k), 1 - Math.pow(1 - k, 3));
const easeInOut = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const expoOut = k => (k = clamp(k), k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const expoIn = k => (k = clamp(k), k <= 0 ? 0 : Math.pow(2, 10 * k - 10));
const backOut = (k, s = 1.70158) => (k = clamp(k), 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2));
const elasticOut = k => (k = clamp(k), k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * TAU / 3) + 1);
const bump = (k) => Math.sin(clamp(k) * Math.PI);                       // 0 → 1 → 0
const win = (t, a, b, fi = .15, fo = .15) => clamp((t - a) / fi) * clamp((b - t) / fo);   // fade window

function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return n - Math.floor(n); }
function hash2(a, b) { return hash(a * 57.31 + b * 113.97); }
function rng(seed) { let s = (Math.floor(seed * 9973) ^ 0x9e3779b9) >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(i, j), hash2(i + 1, j), ux), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), ux), uy) * 2 - 1;
}
// Boil jitter: a hand-cut edge that re-cuts 12 times a second.
const jit = (k, amp = 1) => (hash(k * 13.17 + BOIL * 7.31 + SEED) * 2 - 1) * amp;
const sjit = (k, amp = 1) => (hash(k * 13.17 + SEED) * 2 - 1) * amp;       // static (no boil)

// ---------- musical time ----------
const beatF = t => (t - BEAT0) / BEAT;                  // continuous beat index
const beatN = t => Math.floor(beatF(t));
const beatP = t => frac(beatF(t));                      // 0..1 phase inside the beat
const barF = t => (t - BAR0) / BAR;
const barN = t => Math.floor(barF(t));
const beatT = n => BEAT0 + n * BEAT;                     // time of beat n
const barT = n => BAR0 + n * BAR;                        // time of bar n downbeat
const qBeat = (t, div = 1) => beatT(Math.round(beatF(t) * div) / div);  // snap to grid
// A decaying hit on every beat (1 at the beat, fading over `len` beats).
const pulse = (t, len = .35, pow = 2) => Math.pow(1 - clamp(beatP(t) / len), pow);
// Hit relative to an event time.
const hit = (t, t0, len = .3) => t < t0 ? 0 : Math.pow(1 - clamp((t - t0) / len), 2);

// ---------- audio features (precomputed at 60 Hz in audio_data.js) ----------
function aud(name, t) {
  const a = AUD[name], x = t * AUD.fps, i = Math.floor(x);
  if (i < 0) return a[0]; if (i + 1 >= a.length) return a[a.length - 1];
  return lerp(a[i], a[i + 1], x - i);
}
const KICK = t => aud('kick', t), SNARE = t => aud('snare', t), HAT = t => aud('hat', t), RMS = t => aud('rms', t), VOX = t => aud('vox', t);

// ---------- paper textures (built once) ----------
const TEX = {};
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function buildTextures() {
  // Paper fibre: low-frequency mottling plus fine fibres. Drawn with multiply over the whole frame.
  const pw = 1024, ph = 1024, pc = mkCanvas(pw, ph), px = pc.getContext('2d'), id = px.createImageData(pw, ph), d = id.data;
  const r = rng(7);
  for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
    const n = noise2(x / 90, y / 90) * .5 + noise2(x / 23, y / 23) * .3 + noise2(x / 5, y / 5) * .2;
    const v = 245 + n * 9 + (r() - .5) * 7;
    const i = (y * pw + x) * 4; d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 4; d[i + 3] = 255;
  }
  px.putImageData(id, 0, 0);
  px.globalAlpha = .06; px.strokeStyle = '#6b5a40'; px.lineWidth = .7;
  for (let k = 0; k < 900; k++) {
    const x = r() * pw, y = r() * ph, a = r() * TAU, l = 6 + r() * 26;
    px.beginPath(); px.moveTo(x, y); px.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); px.stroke();
  }
  TEX.paper = pc;
  // Ink speckle: where riso ink did not take. Light speckles, drawn with 'screen' at low alpha.
  const sc = mkCanvas(1024, 1024), sx = sc.getContext('2d'), sd = sx.createImageData(1024, 1024), s = sd.data;
  for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) {
    const n = noise2(x / 3.1, y / 3.1) * .6 + noise2(x / 17, y / 17) * .4;
    const v = n > .38 ? 255 : n > .3 ? 120 : 0;
    const i = (y * 1024 + x) * 4; s[i] = s[i + 1] = s[i + 2] = 255; s[i + 3] = v;
  }
  sx.putImageData(sd, 0, 0); TEX.speckle = sc;
  // Halftone dot tiles are made on demand (see halftonePattern).
  TEX.ht = {};
}
function halftonePattern(color, size = 12, rad = .35, angle = .26) {
  const key = color + size + rad + angle;
  if (TEX.ht[key]) return TEX.ht[key];
  const s = Math.ceil(size), c = mkCanvas(s, s), x = c.getContext('2d');
  x.fillStyle = color; x.beginPath(); x.arc(s / 2, s / 2, s * rad, 0, TAU); x.fill();
  const p = X.createPattern(c, 'repeat');
  if (p.setTransform) p.setTransform(new DOMMatrix().rotate(angle * 180 / Math.PI));
  return (TEX.ht[key] = p);
}

// ---------- path helpers ----------
// Points are [x, y] arrays. Paths are built on X and then filled or stroked by the caller.
function pathPoly(pts, close = true) {
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]);
  if (close) X.closePath();
}
// Smooth closed curve through points (Catmull-Rom → Bézier).
function pathSmooth(pts, close = true, tension = 1) {
  const n = pts.length; if (n < 3) return pathPoly(pts, close);
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
  const P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = tension / 6;
    X.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (close) X.closePath();
}
// A hand-cut ellipse: points around an ellipse with a little scissor wobble.
function ellPts(cx, cy, rx, ry, n = 28, wob = 1.2, seed = 0) {
  const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const w = 1 + (jit(seed + i, wob) / Math.max(rx, ry)); o.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); } return o;
}
function rectPts(x, y, w, h, wob = 1, seed = 0) {
  const o = [], n = 3;
  for (let i = 0; i < n; i++) o.push([x + w * i / n + jit(seed + i, wob), y + jit(seed + i + 9, wob)]);
  for (let i = 0; i < n; i++) o.push([x + w + jit(seed + i + 19, wob), y + h * i / n + jit(seed + i + 29, wob)]);
  for (let i = 0; i < n; i++) o.push([x + w - w * i / n + jit(seed + i + 39, wob), y + h + jit(seed + i + 49, wob)]);
  for (let i = 0; i < n; i++) o.push([x + jit(seed + i + 59, wob), y + h - h * i / n + jit(seed + i + 69, wob)]);
  return o;
}
function rrect(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }
// The spark: n rounded rays from a centre (the Claude spark / sunflower / NEXT's eye).
function sparkPath(cx, cy, R, n = 6, inner = .22, rot = 0, fat = .5) {
  X.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, w = Math.PI / n * fat;
    const ax = cx + Math.cos(a - w) * R * inner, ay = cy + Math.sin(a - w) * R * inner;
    const tx = cx + Math.cos(a) * R, ty = cy + Math.sin(a) * R;
    const bx = cx + Math.cos(a + w) * R * inner, by = cy + Math.sin(a + w) * R * inner;
    if (i === 0) X.moveTo(ax, ay); else X.lineTo(ax, ay);
    const tw = R * .16 * fat * 2;
    X.quadraticCurveTo(tx + Math.cos(a - Math.PI / 2) * tw, ty + Math.sin(a - Math.PI / 2) * tw, tx + Math.cos(a) * tw * .6, ty + Math.sin(a) * tw * .6);
    X.quadraticCurveTo(tx + Math.cos(a + Math.PI / 2) * tw, ty + Math.sin(a + Math.PI / 2) * tw, bx, by);
  }
  X.closePath();
}

// ---------- paper and ink ----------
// cut(): an opaque paper cut-out lifted off the page with a soft shadow (the diorama look).
// o: {fill, lift (shadow distance), blur, shade (0..1 shadow strength), stroke, sw}
function cut(buildPath, o = {}) {
  const lift = o.lift ?? 6, blur = o.blur ?? lift * 1.6, shade = o.shade ?? .28;
  X.save();
  X.beginPath(); buildPath();
  if (lift > 0 && shade > 0) {
    X.shadowColor = `rgba(40,25,10,${shade})`; X.shadowBlur = blur; X.shadowOffsetX = lift * .45; X.shadowOffsetY = lift;
  }
  X.fillStyle = o.fill || PAL.paperHi; X.fill();
  X.shadowColor = 'transparent';
  if (o.ht) { X.save(); X.clip(); X.globalCompositeOperation = 'multiply'; X.fillStyle = halftonePattern(o.ht, o.htSize || 10, o.htRad || .3); X.globalAlpha = o.htAlpha ?? 1; X.fill(); X.restore(); X.beginPath(); buildPath(); }
  if (o.stroke) { X.strokeStyle = o.stroke; X.lineWidth = o.sw || 3; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); }
  X.restore();
}
// ink(): riso ink printed straight onto whatever is below: multiply, no shadow.
function ink(buildPath, color, o = {}) {
  X.save(); X.beginPath(); buildPath();
  X.globalCompositeOperation = o.op || 'multiply'; X.globalAlpha = o.alpha ?? 1; X.fillStyle = color; X.fill();
  X.restore();
}
function inkStroke(buildPath, color, w = 3, o = {}) {
  X.save(); X.beginPath(); buildPath();
  X.globalCompositeOperation = o.op || 'source-over'; X.globalAlpha = o.alpha ?? 1;
  X.strokeStyle = color; X.lineWidth = w; X.lineCap = o.cap || 'round'; X.lineJoin = 'round';
  if (o.dash) X.setLineDash(o.dash);
  X.stroke(); X.restore();
}
// A halftone gradient: dots that grow from 0 at (x0,y0) to full at (x1,y1), clipped to a path.
function htGrad(buildPath, color, x0, y0, x1, y1, o = {}) {
  const step = o.step || 11, maxR = o.maxR || step * .55, ang = o.angle ?? .26, ca = Math.cos(ang), sa = Math.sin(ang);
  X.save(); X.beginPath(); buildPath(); X.clip();
  X.globalCompositeOperation = o.op || 'multiply'; X.fillStyle = color; X.globalAlpha = o.alpha ?? 1;
  const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
  const bx = o.bounds || [Math.min(x0, x1) - 400, Math.min(y0, y1) - 400, Math.abs(dx) + 800, Math.abs(dy) + 800];
  X.beginPath();
  for (let v = -bx[3]; v < bx[3] * 2; v += step) for (let u = -bx[2]; u < bx[2] * 2; u += step) {
    const px = bx[0] + u * ca - v * sa, py = bx[1] + u * sa + v * ca;
    if (px < bx[0] - step || px > bx[0] + bx[2] + step || py < bx[1] - step || py > bx[1] + bx[3] + step) continue;
    const k = clamp(((px - x0) * dx + (py - y0) * dy) / L2), r = maxR * Math.pow(k, o.gamma || 1);
    if (r > .4) { X.moveTo(px + r, py); X.arc(px, py, r, 0, TAU); }
  }
  X.fill(); X.restore();
}
// Fill the whole frame with paper colour (a new sheet).
function sheet(color = PAL.paper) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.fillStyle = color; X.fillRect(0, 0, W, H); X.restore(); }

// ---------- camera ----------
// Scenes draw in a 1920x1080 world. cam() centres a transform on (cx,cy) with zoom and roll.
let SX = 1;  // output scale (0.5 for previews)
function camBegin(c = {}) {
  const zx = c.zoom ?? 1, r = c.rot ?? 0, cx = c.x ?? W / 2, cy = c.y ?? H / 2, sh = c.shake ?? 0;
  const shx = sh ? noise1(T * 23 + 1) * sh : 0, shy = sh ? noise1(T * 23 + 9) * sh : 0;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.translate(W / 2 + shx, H / 2 + shy); X.rotate(r); X.scale(zx, zx); X.translate(-cx, -cy);
}
function camEnd() { X.restore(); }
function withT(x, y, rot, s, fn) { X.save(); X.translate(x, y); if (rot) X.rotate(rot); if (s !== undefined && s !== 1) X.scale(s, s); fn(); X.restore(); }

// Draw into an offscreen layer then composite (for masks and wipes).
const LAYERS = {};
function layer(name) {
  let c = LAYERS[name];
  if (!c) { c = LAYERS[name] = mkCanvas(Math.round(W * SX), Math.round(H * SX)); c.x = c.getContext('2d'); }
  c.x.setTransform(1, 0, 0, 1, 0, 0); c.x.globalCompositeOperation = 'source-over'; c.x.globalAlpha = 1; c.x.clearRect(0, 0, c.width, c.height);
  c.x.setTransform(SX, 0, 0, SX, 0, 0);
  return c;
}
// Run fn with X pointing at a layer; returns the layer.
function onLayer(name, fn) { const c = layer(name), prev = X; X = c.x; try { fn(); } finally { X = prev; } return c; }
function blit(c, alpha = 1, op = 'source-over') { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = alpha; X.globalCompositeOperation = op; X.drawImage(c, 0, 0); X.restore(); }
