// p_prologue.js: P · Prologue (0–37.4). Making the panel. No lyrics.
// P1 0–6.84     black lacquer board, extreme close-up: the effects burst slashes cinnabar brushstrokes across it, gold flakes scatter
// P2a 6.84–12.29 gold leaf laid square by square with bamboo tweezers (macro)
// P2b 12.29–16.93 eggshell pressed into the petal crown, piece by piece (macro, the camera orbits the crown)
// P2c 16.93–28.65 pull back: the idol's silhouette emerges on the gold halo; COME MY WAY is carved and inlaid letter by letter
// P3 28.65–37.4  the build: sanding speeds up on the beat and reveals the Hanoi old quarter at night; she turns toward us;
//                the title polishes to full gold, then is sanded off so the section ends on the street (bar 17 = 37.38).

// ---------- geometry of the panel ----------
const P_HX = 1290, P_HY = 440, P_HR = 300;                 // the gold-leaf halo disc
const P_FX = 1300, P_FY = 470, P_FR = 150;                 // the idol's head (silhouette) in the panel
const P_SQ = 100;                                          // leaf sheet size
const P_T3 = barT(13), P_END = 37.4;                       // P3 starts on bar 13 (28.65)

// Leaf cells, serpentine rows; one sheet lands per beat from beat 8.
const P_LEAF = (() => {
  const out = [];
  for (let j = 0; j < 6; j++) {
    const row = [];
    for (let i = 0; i < 6; i++) {
      const cx = P_HX - 250 + i * P_SQ, cy = P_HY - 250 + j * P_SQ;
      if (Math.hypot(cx - P_HX, cy - P_HY) < P_HR + 40) row.push({ cx, cy, i, j });
    }
    if (j % 2) row.reverse();
    out.push(...row);
  }
  out.forEach((c, k) => { c.t = beatT(8 + k); c.rot = sjit(k * 3.1, .05); c.dx = sjit(k * 5.7, 3); c.dy = sjit(k * 2.3, 3); });
  return out;
})();
const P_TRIM = [beatT(8 + P_LEAF.length) + .2, 23.25];      // excess leaf brushed off to a clean circle

// Petals of the sunflower crown (the same geometry idolHead uses, so the eggshell lies on the silhouette's petals).
const P_PET = (() => {
  const out = [], R = P_FR;
  for (const i of [8, 9, 10, 11, 0, 1, 2, 3, 4]) {
    const a = -Math.PI / 2 + i / 12 * TAU;
    out.push({ a, c: Math.cos(a), s: Math.sin(a), px: P_FX + Math.cos(a) * R * 1.2, py: P_FY - R * .06 + Math.sin(a) * R * 1.2, len: R * .56 * (i % 2 ? .94 : 1) * 1.03, wid: R * .3 * 1.05 });
  }
  return out;
})();
// teardrop half-width factor at a position `along` (-1 root .. 1 tip)
const P_petW = al => Math.sqrt(Math.max(0, 1 - al * al)) * (al < 0 ? .55 + .45 * (1 + al) : 1);
const P_petPt = (p, al, sd) => { const w = sd * P_petW(al) * p.wid; return [p.px + p.c * al * p.len - p.s * w, p.py + p.s * al * p.len + p.c * w]; };
function P_petalPath(p) {
  for (let k = 0; k <= 32; k++) {
    const u = k / 32 * TAU, al = Math.cos(u), sd = Math.sin(u) >= 0 ? 1 : -1;
    const q = P_petPt(p, al, sd); if (k) X.lineTo(q[0], q[1]); else X.moveTo(q[0], q[1]);
  }
  X.closePath();
}
// Eggshell shards: each petal is split 3 along × 2 across, with jittered inner vertices, pressed one after another.
const P_EGG0 = 11.2, P_EGGDT = .13;
const P_SHARDS = (() => {
  const out = [], A = [-.96, -.3, .32, .97], S = [-1.02, 0, 1.02];
  P_PET.forEach((p, pi) => {
    const V = (ia, is) => [A[ia] + (ia > 0 && ia < 3 ? sjit(pi * 17 + ia * 3 + is, .12) : 0), S[is] + (is === 1 ? sjit(pi * 13 + ia * 5, .28) : 0)];
    let n = 0;
    for (let ia = 0; ia < 3; ia++) for (let is = 0; is < 2; is++) {
      const q = [V(ia, is), V(ia + 1, is), V(ia + 1, is + 1), V(ia, is + 1)], pts = [];
      for (let e = 0; e < 4; e++) { const a = q[e], b = q[(e + 1) % 4]; for (let m = 0; m < 3; m++) { const f = m / 3; pts.push(P_petPt(p, lerp(a[0], b[0], f), clamp(lerp(a[1], b[1], f), -1, 1))); } }
      const cx = pts.reduce((s, v) => s + v[0], 0) / pts.length, cy = pts.reduce((s, v) => s + v[1], 0) / pts.length;
      const ins = pts.map(v => [cx + (v[0] - cx) * .88, cy + (v[1] - cy) * .88]);
      const order = [0, 1, 3, 2, 4, 5][ia * 2 + is];
      out.push({ pts: ins, cx, cy, pi, t: P_EGG0 + (pi * 6 + order) * P_EGGDT + sjit(pi * 7 + order, .03) });
      n++;
    }
  });
  return out.sort((a, b) => a.t - b.t);
})();
const P_EGG1 = P_SHARDS[P_SHARDS.length - 1].t;

// Title letters: carved (a dark channel), then gilded, one every 1.5 beats from bar 9.
const P_TFONT = () => FONT.vn(196), P_TTRACK = 6;
const P_TL = [['COME', 110, 430], ['MY WAY', 110, 636]];
const P_LETTERS = (() => {
  const out = []; let n = 0;
  P_TL.forEach(([str], li) => { for (let ci = 0; ci < str.length; ci++) { if (str[ci] === ' ') continue; const tc = barT(9) + n * BEAT * 1.5; out.push({ li, ci, tc, tg: tc + BEAT }); n++; } });
  return out;
})();

// ---------- small helpers ----------
const P_ease = (t, a, b, f = easeInOut) => f(clamp((t - a) / (b - a)));
// A gold-white flash over the whole frame (cuts).
function P_flash(k, col = '255,240,200') {
  if (k <= 0) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  const g = X.createRadialGradient(W * .55, H * .45, 50, W * .55, H * .45, W * .8);
  g.addColorStop(0, `rgba(${col},${.85 * k})`); g.addColorStop(1, `rgba(${col},${.35 * k})`);
  X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
}
// Small eggshell/gold text with source-over (dark ground).
function P_small(str, x, y, fnt, col, o = {}) {
  X.save(); X.font = fnt; X.textAlign = o.align || 'left'; X.textBaseline = 'alphabetic'; X.globalAlpha = o.alpha ?? 1;
  if (o.shadow !== false) { X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 6; X.shadowOffsetY = 2; }
  if (o.tracking) { const L = layout(str, fnt, o.tracking); let x0 = x; if (o.align === 'center') x0 = x - L.width / 2; X.textAlign = 'left'; X.fillStyle = col; for (const l of L) X.fillText(l.ch, x0 + l.x, y); }
  else { X.fillStyle = col; X.fillText(str, x, y); }
  X.restore();
}
// Bamboo tool (tweezers / spatula): a long tapered lacquered stick from far off-frame to the tip (x, y).
function P_stick(x, y, ang, len, w, col = '#6E4127') {
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  X.save();
  X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 18; X.shadowOffsetX = 10; X.shadowOffsetY = 16;
  X.beginPath(); X.moveTo(x + nx * w * .2, y + ny * w * .2); X.lineTo(x + dx * len + nx * w, y + dy * len + ny * w); X.lineTo(x + dx * len - nx * w, y + dy * len - ny * w); X.lineTo(x - nx * w * .2, y - ny * w * .2); X.closePath();
  const g = X.createLinearGradient(x + nx * w, y + ny * w, x - nx * w, y - ny * w); g.addColorStop(0, '#A87A4A'); g.addColorStop(.45, col); g.addColorStop(1, '#2A170D');
  X.fillStyle = g; X.fill(); X.restore();
  X.save(); X.strokeStyle = 'rgba(255,230,190,.35)'; X.lineWidth = 1.5; X.beginPath(); X.moveTo(x + nx * w * .1 + dx * 8, y + ny * w * .1 + dy * 8); X.lineTo(x + dx * len + nx * w * .5, y + dy * len + ny * w * .5); X.stroke(); X.restore();
}

// ---------- gold flakes ----------
// A burst of leaf flakes from origin(s). Pure in t: position = o + v·(1 − e^(−kτ))/k, spinning flat and flipping in 3D.
function P_flakes(t, t0, pts, o = {}) {
  if (t < t0) return;
  const n = o.n || 30, seed = o.seed || 1, sp = o.speed || 900, sz = o.size || 16, dr = o.drag || 3.2;
  const tau = t - t0;
  for (let i = 0; i < n; i++) {
    const h = k => hash(seed * 31.7 + i * 7.13 + k);
    const org = pts[Math.floor(h(1) * pts.length)], a = (o.dir ?? h(2) * TAU) + (o.dir !== undefined ? (h(2) - .5) * (o.cone ?? 1.2) : 0);
    const v = sp * (.25 + h(3) * .9), f = (1 - Math.exp(-dr * tau)) / dr;
    const x = org[0] + Math.cos(a) * v * f, y = org[1] + Math.sin(a) * v * f + (o.grav || 0) * f * f;
    const spinV = (h(4) - .5) * 14 * Math.exp(-tau * 1.2), rot = h(5) * TAU + spinV * tau, flip = h(6) * TAU + (h(7) * 10 + 3) * f * 3;
    const s = sz * (.4 + h(8) * 1.1), cf = Math.cos(flip);
    const lum = .5 + .5 * Math.cos(flip * 1.3 + x * .004 + t * .6);
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(1, Math.max(.12, Math.abs(cf)));
    X.fillStyle = lqMix(LQ_PAL.goldDk, lum > .8 ? LQ_PAL.goldWhite : LQ_PAL.goldHi, lum);
    X.beginPath(); X.moveTo(-s, -s * .6); X.lineTo(s * .8, -s * .8); X.lineTo(s, s * .5); X.lineTo(-s * .5, s * .9); X.closePath(); X.fill();
    X.restore();
  }
}

// ---------- brushstrokes ----------
// A calligraphic stroke along centreline pts (sampled densely), drawn up to u (0..1). Pressed start, tapering dry tail.
function P_sample(pts, n = 80) {
  const out = []; const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  for (let k = 0; k <= n; k++) {
    const d = L[L.length - 1] * k / n; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
    const f = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
  }
  return out;
}
function P_arcPts(cx, cy, r, a0, a1, n = 40, wob = 0) { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); const rr = r * (1 + wob * Math.sin(i * .7)); o.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return o; }
function P_quadPts(a, c, b, n = 30) { const o = []; for (let i = 0; i <= n; i++) { const f = i / n; o.push([(1 - f) * (1 - f) * a[0] + 2 * f * (1 - f) * c[0] + f * f * b[0], (1 - f) * (1 - f) * a[1] + 2 * f * (1 - f) * c[1] + f * f * b[1]]); } return o; }
function P_brush(pts, w0, u, seed, o = {}) {
  if (u <= 0) return;
  const S = P_sample(pts, o.n || 80), N = S.length - 1, m = Math.max(2, Math.round(N * u));
  const prof = f => { const press = f < .08 ? .75 + 3.1 * f : 1; const tail = f > .55 ? Math.pow(1 - (f - .55) / .45, .8) : 1; return w0 * press * Math.max(.05, tail) * (1 + .08 * Math.sin(f * 17 + seed)); };
  const nrm = i => { const a = S[Math.max(0, i - 1)], b = S[Math.min(N, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
  const body = Math.min(m, Math.round(N * .9)), L = [], R = [];
  for (let i = 0; i <= body; i++) { const f = i / N, w = prof(f) * (i === body && u < .9 ? 1 : 1), n = nrm(i); L.push([S[i][0] + n[0] * w, S[i][1] + n[1] * w]); R.push([S[i][0] - n[0] * w * .92, S[i][1] - n[1] * w * .92]); }
  const bx = S.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
  const bounds = [bx[0] - w0, bx[1] - w0, bx[2] - bx[0] + 2 * w0, bx[3] - bx[1] + 2 * w0];
  const col = o.color || LQ_PAL.cinnabar;
  const head = S[body], hw = prof(body / N);
  lqLacquer(() => { X.moveTo(L[0][0], L[0][1]); for (const p of L) X.lineTo(p[0], p[1]); if (u < .97) X.arc(head[0], head[1], hw * .95, 0, TAU); X.moveTo(L[L.length - 1][0], L[L.length - 1][1]); for (let i = R.length - 1; i >= 0; i--) X.lineTo(R[i][0], R[i][1]); X.closePath(); }, col, { bounds, rim: 1.5, lift: o.lift ?? 6, glint: o.glint, mottle: .3 });
  // round pressed head of the stroke
  X.save(); X.fillStyle = col; X.beginPath(); X.arc(S[0][0], S[0][1], prof(0) * 1.05, 0, TAU); X.fill(); X.restore();
  // bristle streaks (dry brush): long thin lines at fixed offsets across the width, broken toward the tail
  X.save(); X.lineCap = 'round';
  for (let b = 0; b < 14; b++) {
    const off = (hash(seed * 3 + b) * 2 - 1) * .95, dryAt = .6 + hash(seed * 5 + b) * .38, lw = 1 + hash(seed * 7 + b) * 3.5, dark = b % 3 === 0;
    X.strokeStyle = dark ? 'rgba(70,8,6,.55)' : 'rgba(255,150,120,.28)'; X.lineWidth = lw;
    X.beginPath(); let pen = false;
    const end = Math.min(m, Math.round(N * Math.min(1, dryAt + .35)));
    for (let i = 1; i <= end; i++) {
      const f = i / N, n = nrm(i), w = prof(f) * off, gap = f > dryAt && hash(seed + b * 13 + i * .37) < .35;
      const p = [S[i][0] + n[0] * w, S[i][1] + n[1] * w];
      if (gap) { pen = false; continue; }
      if (pen) X.lineTo(p[0], p[1]); else { X.moveTo(p[0], p[1]); pen = true; }
    }
    X.stroke();
    // the dry tail: bristles past the body, cinnabar on black
    if (m > body) {
      X.strokeStyle = col; X.lineWidth = lw * .8; X.globalAlpha = .85; X.beginPath(); pen = false;
      for (let i = body; i <= m; i++) {
        const f = i / N, n = nrm(i), w = prof(f) * off * 1.4; if (hash(seed * 11 + b * 7 + i) < .25 || f > dryAt + .3) { pen = false; continue; }
        const p = [S[i][0] + n[0] * w, S[i][1] + n[1] * w]; if (pen) X.lineTo(p[0], p[1]); else { X.moveTo(p[0], p[1]); pen = true; }
      }
      X.stroke(); X.globalAlpha = 1;
    }
  }
  // splatter where the brush hit the board
  X.fillStyle = col;
  for (let i = 0; i < (o.splat ?? 10); i++) { const a = hash(seed * 9 + i) * TAU, r = w0 * (1.2 + hash(seed * 4 + i) * 2.2), s = 2 + hash(seed * 6 + i) * w0 * .12; X.beginPath(); X.arc(S[0][0] + Math.cos(a) * r, S[0][1] + Math.sin(a) * r * .7, s, 0, TAU); X.fill(); }
  X.restore();
  return S;
}

// ---------- P1: the board and the burst ----------
const P_S1 = P_quadPts([150, 900], [820, 470], [1790, 250], 40);          // the slash
const P_S2 = P_quadPts([1460, 690], [1540, 700], [1600, 800], 14);        // a dab
const P_S3 = P_quadPts([250, 330], [430, 230], [660, 250], 20);           // a flick
const P_S4 = P_arcPts(960, 545, 395, Math.PI * 1.08, Math.PI * 1.08 + TAU * .86, 70, .015);   // the ensō
function P_board(t, lt) {
  const push = 1 + lt * .018 + easeOut(clamp((t - 4.9) / 1.8)) * .05, sh = RMS(t) * 7;
  lqGround(t, { tone: 'black', sheenX: .15 + t * .1 });
  camBegin({ zoom: push, x: 960, y: 545, rot: -.01 + lt * .002, shake: sh });
  // settled leaf dust (already on the board at frame 0)
  X.save();
  for (let i = 0; i < 70; i++) {
    const x = hash(i * 3.1) * 1920, y = hash(i * 7.7) * 1080, s = 2 + hash(i * 1.3) * 6, lum = .5 + .5 * Math.sin(t * 1.5 + i + x * .01);
    X.fillStyle = lqMix(LQ_PAL.goldDk, LQ_PAL.goldHi, lum, .55 + .45 * lum); X.save(); X.translate(x, y); X.rotate(i); X.fillRect(-s, -s * .6, s * 2, s * 1.2); X.restore();
  }
  X.restore();
  // strokes land on the burst's peaks
  P_brush(P_S4, 50, P_ease(t, 4.92, 5.75, easeOut), 4, { lift: 8 });
  P_brush(P_S3, 22, P_ease(t, 2.96, 3.14, easeOut), 3, { splat: 6 });
  P_brush(P_S1, 64, P_ease(t, .2, .5, expoOut), 1, { lift: 10 });
  P_brush(P_S2, 34, P_ease(t, .97, 1.1, easeOut), 2, { splat: 14 });
  // gold flakes flung by each hit
  P_flakes(t, .24, P_S1.filter((_, i) => i % 4 === 0), { n: 46, seed: 1, speed: 700 });
  P_flakes(t, 1.0, [[1530, 740]], { n: 22, seed: 2, speed: 800 });
  P_flakes(t, 2.98, [[450, 260]], { n: 16, seed: 3, speed: 600 });
  P_flakes(t, 5.0, P_S4.filter((_, i) => i % 5 === 0), { n: 40, seed: 4, speed: 500 });
  P_flakes(t, 6.24, [[960, 545]], { n: 60, seed: 5, speed: 1500, size: 14 });
  // the card: "sơn mài" inlaid in gold, a cinnabar seal
  const gl = .15 + frac(t * .12) * .9 + hit(t, 6.24, .6) * .2;
  lqInlayText('sơn mài', 960, 610, { font: FONT.vnI(210), align: 'center', material: 'gold', glint: gl, tracking: 2 });
  const sx = 1240, sy = 640;
  lqLacquer(() => X.roundRect(sx, sy, 78, 78, 6), LQ_PAL.cinnabar, { lift: 4, rim: 1, glint: .4, bounds: [sx, sy, 78, 78] });
  X.save(); X.strokeStyle = 'rgba(243,235,221,.85)'; X.lineWidth = 3; X.strokeRect(sx + 8, sy + 8, 62, 62); X.restore();
  P_small('SƠN', sx + 39, sy + 50, FONT.vnSansB(22), LQ_PAL.egg, { align: 'center', shadow: false, tracking: 1 });
  // hairline rule and the tiny line
  X.save(); X.strokeStyle = 'rgba(217,164,65,.7)'; X.lineWidth = 1.6; X.beginPath(); X.moveTo(700, 700); X.lineTo(1220, 700); X.stroke(); X.restore();
  P_small('COME MY WAY  ·  SƠN MÀI CUT', 960, 742, FONT.vnSansM(24), 'rgba(243,235,221,.8)', { align: 'center', tracking: 5 });
  camEnd();
  P_flash(hit(t, 6.24, .35) * .7);
}
shot(0, barT(3), (t, lt) => P_board(t, lt), { seed: 1 });

// ---------- the panel (shared by P2 and P3) ----------
// Gold halo: landed sheets (clipped to the disc once trimmed), sheets in flight on the tweezers.
function P_halo(t, o = {}) {
  const trim = P_ease(t, P_TRIM[0], P_TRIM[1]);
  const landed = P_LEAF.filter(c => t >= c.t);
  const sheet = (c, k) => { const h = P_SQ / 2 + 3; X.save(); X.translate(c.cx + c.dx, c.cy + c.dy); X.rotate(c.rot); X.rect(-h, -h, h * 2, h * 2); X.restore(); };
  const leafPath = () => { for (const c of landed) sheet(c); };
  const bounds = [P_HX - P_HR - 60, P_HY - P_HR - 60, P_HR * 2 + 120, P_HR * 2 + 120];
  const gk = o.glint ?? (.1 + frac(t * .06) * .9);
  if (landed.length) {
    // inside the disc
    X.save(); X.beginPath(); X.arc(P_HX, P_HY, P_HR, 0, TAU); X.clip();
    lqGold(leafPath, { bounds, glint: gk, lift: 0, bevel: 0, scale: .6, glintW: 260 });
    // seams between sheets
    X.strokeStyle = 'rgba(90,55,18,.35)'; X.lineWidth = 1.4; X.beginPath(); for (const c of landed) sheet(c); X.stroke();
    X.restore();
    // outside the disc (brushed off during the trim)
    if (trim < 1) {
      X.save(); X.beginPath(); X.rect(-500, -500, 3000, 2200); X.arc(P_HX, P_HY, P_HR, 0, TAU, true); X.clip('evenodd');
      lqGold(leafPath, { bounds, glint: gk, lift: 3, bevel: 0, scale: .6, alpha: 1 - trim, glintW: 260 });
      X.strokeStyle = `rgba(90,55,18,${.35 * (1 - trim)})`; X.lineWidth = 1.4; X.beginPath(); for (const c of landed) sheet(c); X.stroke();
      X.restore();
    }
    // the rim of the disc: a fine dark cut, then a lip
    X.save(); X.globalAlpha = .4 + .6 * trim; X.strokeStyle = 'rgba(20,10,4,.8)'; X.lineWidth = 3; X.beginPath(); X.arc(P_HX, P_HY, P_HR, 0, TAU); X.stroke();
    X.strokeStyle = 'rgba(255,236,190,.35)'; X.lineWidth = 1.2; X.beginPath(); X.arc(P_HX, P_HY, P_HR + 3, Math.PI * .9, Math.PI * 1.6); X.stroke(); X.restore();
  }
  // sheets in flight
  if (o.flight !== false) for (const c of P_LEAF) {
    const k = (t - (c.t - .95)) / .95; if (k <= 0 || k >= 1) continue;
    const e = easeInOut(k), up = (1 - e), lift = 4 + up * 34;
    const x = c.cx + c.dx + up * 120, y = c.cy + c.dy - up * 170, rot = c.rot + up * .35, sc = 1 + up * .12;
    // the sheet flutters: a slight lift at one edge (skew)
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(sc, sc * (1 - .06 * Math.sin(k * 9) * up));
    const h = P_SQ / 2 + 3;
    lqGold(() => { X.moveTo(-h, -h); X.lineTo(h, -h - up * 6); X.lineTo(h, h); X.lineTo(-h, h); X.closePath(); }, { lift, bevel: 0, scale: .6, glint: clamp(.2 + k * .7), bounds: [-h, -h, h * 2, h * 2] });
    X.restore();
    // tweezers hold the far corner
    const tx = x + Math.cos(rot) * (P_SQ / 2) * sc + 10, ty = y - (P_SQ / 2) * sc + 4, ang = -.62 + up * .1;
    if (k < .92) { P_stick(tx, ty, ang, 1100, 13); P_stick(tx + 6, ty + 5, ang + .035, 1100, 12, '#5A3520'); }
  }
}
// The silhouette: idolHead with the bust, flattened into brown lacquer, with a gold rim light.
function P_sil(t, a, rim) {
  if (a <= 0) return;
  const m = X.getTransform();
  const L = onLayer('P_sil', () => {
    X.setTransform(m);
    idolHead(P_FX, P_FY, P_FR, { bust: true, turn: -.35, eyes: 'closed', mouth: 0, blush: 0, lift: 0, sway: 0, mic: false });
    X.fillStyle = '#000'; X.beginPath(); X.ellipse(P_FX, P_FY + P_FR * 1.75, P_FR * .95, P_FR * .75, 0, 0, TAU); X.fill();
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-in';
    const g = X.createLinearGradient(0, 0, X.canvas.width * .2, X.canvas.height);
    g.addColorStop(0, '#5A3320'); g.addColorStop(.5, '#3A2012'); g.addColorStop(1, '#1C0E07'); X.fillStyle = g; X.fillRect(0, 0, X.canvas.width, X.canvas.height);
    // sheen crawling over the silhouette
    X.globalCompositeOperation = 'source-atop';
    const sx = (frac(t * .05 + .3) * 1.6 - .3) * X.canvas.width, sg = X.createLinearGradient(sx - 200 * SX, 0, sx + 200 * SX, 120 * SX);
    sg.addColorStop(0, 'rgba(255,220,180,0)'); sg.addColorStop(.5, 'rgba(255,220,180,.16)'); sg.addColorStop(1, 'rgba(255,220,180,0)'); X.fillStyle = sg; X.fillRect(0, 0, X.canvas.width, X.canvas.height);
  });
  if (rim > 0) {
    const G = onLayer('P_silG', () => { X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(L, 0, 0); X.globalCompositeOperation = 'source-in'; X.fillStyle = LQ_PAL.goldHi; X.fillRect(0, 0, X.canvas.width, X.canvas.height); });
    const d = 4 * SX * m.a / SX;
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a * rim; X.drawImage(G, -d, -d); X.globalAlpha = a * rim * .5; X.drawImage(G, d * .6, -d * 1.2); X.restore();
  }
  blit(L, a);
}
// Eggshell petals: sketch outlines, pressed shards, the newest shards popping in, and the spatula.
function P_petals(t, o = {}) {
  // sketch: a faint gold chalk outline of each petal
  const sk = 1 - P_ease(t, P_EGG1, P_EGG1 + 1.5);
  if (sk > 0) {
    X.save(); X.setLineDash([7, 7]); X.lineDashOffset = -t * 6; X.strokeStyle = `rgba(246,227,161,${.55 * sk})`; X.lineWidth = 1.6;
    for (const p of P_PET) { X.beginPath(); P_petalPath(p); X.stroke(); }
    X.restore();
  }
  const done = P_SHARDS.filter(s => t >= s.t + .18), pop = P_SHARDS.filter(s => t >= s.t && t < s.t + .18);
  if (done.length) {
    // the dark bed under the shells (lacquer between the pieces)
    X.save(); X.fillStyle = 'rgba(12,8,6,.9)'; X.beginPath(); for (const p of P_PET) if (done.some(s => s.pi === P_PET.indexOf(p))) P_petalPath(p); X.fill(); X.restore();
    lqEggshell(() => { for (const s of done) { X.moveTo(s.pts[0][0], s.pts[0][1]); for (const q of s.pts) X.lineTo(q[0], q[1]); X.closePath(); } }, { scale: .6, lift: 2, bevel: 1.4, glint: o.glint, gloss: .35 });
  }
  for (const s of pop) {
    const k = (t - s.t) / .18, sc = 1 + (1 - easeOut(k)) * .35;
    X.save(); X.translate(s.cx, s.cy); X.scale(sc, sc); X.translate(-s.cx, -s.cy);
    lqEggshell(() => { X.moveTo(s.pts[0][0], s.pts[0][1]); for (const q of s.pts) X.lineTo(q[0], q[1]); X.closePath(); }, { scale: .6, lift: 2 + (1 - k) * 14, bevel: 1.4, glint: .5, gloss: .5 });
    X.restore();
  }
  // the spatula presses each new piece
  if (o.tool !== false && t > P_EGG0 - .5 && t < P_EGG1 + .5) {
    let cur = P_SHARDS[0]; for (const s of P_SHARDS) if (s.t <= t + .06) cur = s;
    const ph = clamp((t - cur.t + .06) / P_EGGDT), press = ph < .45 ? 0 : Math.sin((ph - .45) / .55 * Math.PI) * 18;
    P_stick(cur.cx + 4, cur.cy + 4 - press, .7 + Math.sin(t * .8) * .05, 1000, 10, '#6E4127');
  }
}
// The title: carved letters, then gilded ones; dull until polished.
function P_title(t, o = {}) {
  const fnt = P_TFONT(), dull = o.dull ?? .45, gl = o.glint;
  P_TL.forEach(([str, x, y], li) => {
    const L = layout(str, fnt, P_TTRACK), lets = P_LETTERS.filter(l => l.li === li);
    // carved channels (letters cut but not yet gilded) with a chisel sweep
    for (const l of lets) {
      if (t < l.tc || t >= l.tg + .3) continue;
      const k = clamp((t - l.tc) / .35), ch = str[l.ci], cx = x + L[l.ci].x;
      X.save(); X.beginPath(); X.rect(cx - 20, y - 220, (L[l.ci].w + 40) * k, 300); X.clip(); X.font = fnt; X.textBaseline = 'alphabetic';
      X.translate(2, 3); X.lineWidth = 12; X.lineJoin = 'round'; X.strokeStyle = 'rgba(120,80,50,.35)'; X.strokeText(ch, cx, y); X.translate(-2, -3);
      X.fillStyle = 'rgba(4,2,1,.96)'; X.fillText(ch, cx, y); X.strokeStyle = 'rgba(4,2,1,.95)'; X.lineWidth = 9; X.strokeText(ch, cx, y);
      X.restore();
      if (k < 1) P_flakes(t, l.tc, [[cx + (L[l.ci].w) * k, y - 70]], { n: 6, seed: 40 + l.ci + li * 9, speed: 300, size: 5, grav: 400 });
    }
    // gilded prefix
    let n = 0; for (const l of lets) if (t >= l.tg + .3) n = l.ci + 1;
    const tidx = n ? n : 0;
    if (tidx) {
      const pre = str.slice(0, tidx);
      lqInlayText(pre, x, y, { font: fnt, tracking: P_TTRACK, material: 'gold', glint: gl ?? (.1 + frac(t * .08) * .9), scale: .5, glintW: o.glintW });
      if (dull > 0) { X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = dull; X.font = fnt; X.fillStyle = '#4a3020'; for (let i = 0; i < tidx; i++) X.fillText(pre[i], x + L[i].x, y); X.restore(); }
    }
    // the letter being gilded: leaf laid bottom → top
    for (const l of lets) {
      if (t < l.tg || t >= l.tg + .3) continue;
      const k = easeOut((t - l.tg) / .3), cx = x + L[l.ci].x;
      X.save(); X.beginPath(); X.rect(cx - 30, y + 60 - 300 * k, L[l.ci].w + 60, 400); X.clip();
      lqInlayText(str[l.ci], cx, y, { font: fnt, material: 'gold', glint: .5, scale: .5 });
      X.restore();
      P_flakes(t, l.tg, [[cx + L[l.ci].w / 2, y - 60]], { n: 10, seed: 70 + l.ci + li * 9, speed: 380, size: 7 });
    }
  });
}
// Captions under the title.
function P_captions(t, a = 1) {
  const k1 = P_ease(t, 25.2, 26.4, easeOut) * a, k2 = P_ease(t, 26.2, 27.4, easeOut) * a;
  if (k1 > 0) {
    X.save(); X.strokeStyle = `rgba(217,164,65,${.8 * k1})`; X.lineWidth = 1.6; X.beginPath(); X.moveTo(118, 700); X.lineTo(118 + 560 * k1, 700); X.stroke(); X.restore();
    P_small('sơn mài', 116, 770, FONT.vnI(52), LQ_PAL.egg, { alpha: k1 });
  }
  if (k2 > 0) P_small('Sơn Tùng M-TP  ×  Tyga', 118, 826, FONT.vnSansM(34), LQ_PAL.goldHi, { alpha: k2, tracking: 2 });
}
// Silhouette schedule: a faint sketch until P2c, then it deepens; the gold rim flares on the 20.75 hit.
const P_silA = t => .12 + .88 * P_ease(t, 17.0, 21.2);
const P_rimA = t => P_ease(t, 20.7, 21.1, easeOut) * .9 + hit(t, 20.75, 1.2) * .6;
function P_panel(t, o = {}) {
  lqGround(t, { tone: 'black', camX: o.camX || 0 });
  P_halo(t, o);
  P_sil(t, P_silA(t), P_rimA(t));
  P_petals(t, o);
  // rim-light hit: a glint ring around the halo
  const hk = hit(t, 20.75, .9);
  if (hk > 0) { X.save(); X.globalCompositeOperation = 'screen'; X.strokeStyle = `rgba(255,240,200,${.6 * hk})`; X.lineWidth = 8 + 30 * (1 - hk); X.beginPath(); X.arc(P_HX, P_HY, P_HR + 30 * (1 - hk), 0, TAU); X.stroke(); X.restore(); }
}

// ---------- P2a: gold leaf, macro ----------
function P_cam2a(t) {
  // follow the laying edge smoothly (a moving average of the sheet positions)
  let x = 0, y = 0; const n = 8;
  for (let k = 0; k < n; k++) { const f = clamp((t - k * .3 - beatT(8)) / BEAT, 0, P_LEAF.length - 1), i = Math.floor(f), c0 = P_LEAF[i], c1 = P_LEAF[Math.min(P_LEAF.length - 1, i + 1)], e = easeInOut(f - i); x += lerp(c0.cx, c1.cx, e); y += lerp(c0.cy, c1.cy, e); }
  return { x: x / n + 40, y: y / n - 10 };
}
shot(barT(3), beatT(22), (t, lt) => {
  const c = P_cam2a(t);
  lqGround(t, { tone: 'black', camX: c.x });
  camBegin({ zoom: 2.35 - lt * .02, x: c.x, y: c.y, rot: -.04 + lt * .006 });
  P_halo(t); P_sil(t, P_silA(t), 0); P_petals(t, { tool: false });
  // drifting leaf dust in the air
  P_flakes(t, 5.5, [[c.x - 300, c.y - 200], [c.x + 200, c.y + 150]], { n: 18, seed: 9, speed: 90, drag: .3, size: 4 });
  camEnd();
  P_flash(hit(t, barT(3), .3));
}, { seed: 2 });

// ---------- P2b: eggshell, macro orbit around the crown ----------
shot(beatT(22), 16.93, (t, lt) => {
  const pf = clamp((t - P_EGG0) / (6 * P_EGGDT) - .3, 0, P_PET.length - 1), i = Math.floor(pf), e = easeInOut(pf - i);
  const a = lerp(P_PET[i].a, P_PET[Math.min(P_PET.length - 1, i + 1)].a, e);
  const cx = P_FX + Math.cos(a) * P_FR * 1.25, cy = P_FY + Math.sin(a) * P_FR * 1.25;
  camBegin({ zoom: 2.2 + lt * .025, x: cx, y: cy, rot: -.06 + Math.sin(lt * .3) * .03 });
  P_panel(t, {});
  camEnd();
  P_flash(hit(t, beatT(22), .3) * .8);
}, { seed: 3 });

// ---------- P2c / P3 camera ----------
function P_camWide(t) {
  const k = P_ease(t, 16.93, 21.8, easeInOut);
  let z = lerp(1.5, 1.0, k), x = lerp(1240, 960, k), y = lerp(520, 540, k);
  z += Math.max(0, t - 21.8) * .006; x += Math.max(0, t - 21.8) * 4;
  if (t > P_T3) { const k3 = P_ease(t, P_T3, P_END, easeIn); z += k3 * .06; x += k3 * 40; y += k3 * 20; z += pulse(t, .3) * .008 * P_ease(t, P_T3, P_T3 + 2); }
  return { zoom: z, x, y, rot: Math.sin(t * .11) * .006 };
}

// ---------- P3: the old quarter at night (the painting under the panel) ----------
const P_HOUSES = (() => {
  const r = rng(77), out = []; let x = -60;
  while (x < 2000) {
    const w = 150 + r() * 90, fl = 2 + Math.floor(r() * 3), fh = 115 + r() * 20, h = fl * fh + 40;
    out.push({ x, w, fl, fh, h, roof: ['tile', 'flat', 'arch', 'tile'][Math.floor(r() * 4)], win: r() < .5 ? 1 : 2, lit: [r(), r(), r(), r()], sign: r() < .55, sgn: Math.floor(r() * 6), bal: r() < .6 });
    x += w + 6;
  }
  return out;
})();
const P_SIGNS = ['PHỞ', 'TRÀ', 'LỤA', 'BẠC', 'ĐÈN', 'SƠN'];
const P_GY = 836;   // street line
function P_lantern(x, y, r, t, i, col) {
  const sw = Math.sin(t * 1.4 + i * 1.7) * .09 + (t > P_T3 ? Math.sin((beatF(t) + i * .25) * Math.PI) * .03 : 0);
  X.save(); X.translate(x, y); X.rotate(sw);
  // glow
  X.globalCompositeOperation = 'screen';
  const gA = .28 + .12 * (t > P_T3 ? pulse(t, .5) : 0), g = X.createRadialGradient(0, r * 1.2, r * .3, 0, r * 1.2, r * 3.4);
  g.addColorStop(0, col === 'red' ? `rgba(255,110,60,${gA})` : `rgba(255,200,110,${gA})`); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(-r * 3.5, -r * 2.3, r * 7, r * 7);
  X.globalCompositeOperation = 'source-over';
  X.strokeStyle = 'rgba(217,164,65,.8)'; X.lineWidth = 1.5; X.beginPath(); X.moveTo(0, 0); X.lineTo(0, r * .2); X.stroke();
  const b = X.createRadialGradient(-r * .2, r * 1.0, r * .1, 0, r * 1.2, r * 1.1);
  if (col === 'red') { b.addColorStop(0, '#FFB070'); b.addColorStop(.35, '#E8553A'); b.addColorStop(1, '#6E120D'); } else { b.addColorStop(0, '#FFF1C4'); b.addColorStop(.4, '#E9B650'); b.addColorStop(1, '#7A4A12'); }
  X.fillStyle = b; X.beginPath(); X.ellipse(0, r * 1.2, r * .82, r, 0, 0, TAU); X.fill();
  X.strokeStyle = 'rgba(60,10,4,.45)'; X.lineWidth = 1.2;
  for (const f of [-.5, 0, .5]) { X.beginPath(); X.ellipse(0, r * 1.2, r * .82 * Math.abs(f) + .5, r, 0, f < 0 ? Math.PI / 2 : -Math.PI / 2, f < 0 ? Math.PI * 1.5 : Math.PI / 2); X.stroke(); }
  X.fillStyle = LQ_PAL.gold; X.fillRect(-r * .38, r * .14, r * .76, r * .16); X.fillRect(-r * .38, r * 2.12, r * .76, r * .16);
  X.strokeStyle = col === 'red' ? '#E8553A' : LQ_PAL.gold; X.lineWidth = 2; X.beginPath(); X.moveTo(0, r * 2.28); X.lineTo(Math.sin(t * 2 + i) * 3, r * 2.9); X.stroke();
  X.restore();
}
function P_catenary(x0, y0, x1, y1, sag, n) { const o = []; for (let i = 0; i <= n; i++) { const f = i / n; o.push([lerp(x0, x1, f), lerp(y0, y1, f) + sag * 4 * f * (1 - f)]); } return o; }
function P_street(t) {
  lqGround(t, { tone: 'night', sheen: .8 });
  // gold-leaf moon and faint stars
  lqGold(() => X.arc(430, 150, 62, 0, TAU), { scale: .3, lift: 4, glint: .3 + frac(t * .1) * .6, bounds: [368, 88, 124, 124] });
  X.save(); X.fillStyle = 'rgba(243,235,221,.6)'; for (let i = 0; i < 40; i++) { const s = 1 + hash(i * 4.4) * 2, a = .3 + .7 * (.5 + .5 * Math.sin(t * 2 + i)); X.globalAlpha = a * .7; X.fillRect(hash(i * 2.1) * 1920, hash(i * 5.3) * 260, s, s); } X.restore();
  // houses: dark lacquer masses, lit windows, gold-ink line
  const lines = new Path2D(), fine = new Path2D();
  X.save();
  for (const [hi, h] of P_HOUSES.entries()) {
    const x = h.x, y0 = P_GY - h.h, w = h.w;
    X.fillStyle = hi % 2 ? '#15100E' : '#1B1310'; X.fillRect(x, y0, w, h.h);
    lines.rect(x, y0, w, h.h);
    // roof
    if (h.roof === 'tile') { const rp = [[x - 14, y0 + 6], [x + w * .5, y0 - 46], [x + w + 14, y0 + 6]]; X.fillStyle = '#241712'; X.beginPath(); X.moveTo(...rp[0]); X.lineTo(...rp[1]); X.lineTo(...rp[2]); X.closePath(); X.fill(); lines.moveTo(...rp[0]); lines.lineTo(...rp[1]); lines.lineTo(...rp[2]); for (let k = 1; k < 7; k++) { const f = k / 7; fine.moveTo(lerp(x - 14, x + w + 14, f), y0 + 6); fine.lineTo(lerp(x - 14, x + w + 14, f) * .6 + (x + w * .5) * .4, y0 + 6 - 46 * .4); } }
    else if (h.roof === 'arch') { X.fillStyle = '#1F1512'; X.beginPath(); X.moveTo(x + 10, y0); X.quadraticCurveTo(x + w / 2, y0 - 60, x + w - 10, y0); X.closePath(); X.fill(); lines.moveTo(x + 10, y0); lines.quadraticCurveTo(x + w / 2, y0 - 60, x + w - 10, y0); fine.arc(x + w / 2, y0 - 18, 9, 0, TAU); }
    else { lines.moveTo(x - 6, y0 - 16); lines.lineTo(x + w + 6, y0 - 16); lines.moveTo(x - 6, y0 - 16); lines.lineTo(x - 6, y0); lines.moveTo(x + w + 6, y0 - 16); lines.lineTo(x + w + 6, y0); for (let k = 1; k < 8; k++) { fine.moveTo(x + k * w / 8, y0 - 16); fine.lineTo(x + k * w / 8, y0); } }
    // floors (from the top down to the one above the shop)
    for (let f = 0; f < h.fl - 1; f++) {
      const fy = y0 + 20 + f * h.fh, ww = h.win === 1 ? w * .46 : w * .3, wh = h.fh * .62;
      lines.moveTo(x, fy + h.fh); lines.lineTo(x + w, fy + h.fh);
      for (let k = 0; k < h.win; k++) {
        const wx = h.win === 1 ? x + (w - ww) / 2 : x + w * (.12 + k * .46), wy = fy + h.fh * .18, lit = h.lit[f] > .45;
        if (lit) { X.fillStyle = 'rgba(233,172,72,.85)'; X.fillRect(wx, wy, ww, wh); X.fillStyle = 'rgba(255,230,160,.5)'; X.fillRect(wx + ww * .25, wy + 6, ww * .5, wh - 12); }
        lines.rect(wx, wy, ww, wh); fine.moveTo(wx + ww / 2, wy); fine.lineTo(wx + ww / 2, wy + wh);
        // shutters: slatted leaves open to the sides
        for (const sd of [-1, 1]) { const sx = sd < 0 ? wx - ww * .32 : wx + ww; lines.rect(sx, wy, ww * .32, wh); for (let q = 1; q < 6; q++) { fine.moveTo(sx, wy + q * wh / 6); fine.lineTo(sx + ww * .32, wy + q * wh / 6); } }
        if (h.bal) { const by = wy + wh; lines.moveTo(wx - ww * .4, by); lines.lineTo(wx + ww * 1.4, by); for (let q = 0; q <= 8; q++) { fine.moveTo(wx - ww * .4 + q * ww * 1.8 / 8, by); fine.lineTo(wx - ww * .4 + q * ww * 1.8 / 8, by - 22); } fine.moveTo(wx - ww * .4, by - 22); fine.lineTo(wx + ww * 1.4, by - 22); }
      }
    }
    // shop: open front with a warm interior, an awning and a hanging sign
    const sy = P_GY - h.fh * .95;
    X.fillStyle = 'rgba(160,80,30,.35)'; X.fillRect(x + 10, sy + 24, w - 20, P_GY - sy - 24);
    lines.rect(x + 10, sy + 24, w - 20, P_GY - sy - 24);
    lines.moveTo(x - 8, sy + 22); lines.lineTo(x + w + 8, sy + 22); lines.lineTo(x + w - 4, sy + 4); lines.lineTo(x + 4, sy + 4); lines.closePath();
    if (h.sign) { const gx = x + w * .5, gy = sy - 70; X.fillStyle = hi % 3 ? LQ_PAL.cinnabarDk : '#101826'; X.fillRect(gx - 26, gy, 52, 66); lines.rect(gx - 26, gy, 52, 66); X.font = FONT.vnSansB(20); X.fillStyle = LQ_PAL.goldHi; X.textAlign = 'center'; X.fillText(P_SIGNS[h.sgn], gx, gy + 41); }
  }
  X.restore();
  X.save(); X.lineJoin = 'round';
  X.strokeStyle = 'rgba(217,164,65,.95)'; X.lineWidth = 2.6; X.stroke(lines);
  X.strokeStyle = 'rgba(217,164,65,.55)'; X.lineWidth = 1.2; X.stroke(fine);
  X.restore();
  // street: brown lacquer with reflections
  lqLacquer(() => X.rect(-200, P_GY, 2400, 400), '#2A170D', { rim: 0, glint: .3 + frac(t * .05) * .5, bounds: [-200, P_GY, 2400, 300], mottle: .3 });
  X.save(); X.strokeStyle = 'rgba(217,164,65,.9)'; X.lineWidth = 3; X.beginPath(); X.moveTo(-200, P_GY); X.lineTo(2200, P_GY); X.stroke(); X.restore();
  X.save(); X.globalCompositeOperation = 'screen';
  for (const [hi, h] of P_HOUSES.entries()) {
    const cx = h.x + h.w / 2, g = X.createLinearGradient(0, P_GY, 0, P_GY + 220);
    g.addColorStop(0, 'rgba(233,160,70,.32)'); g.addColorStop(1, 'rgba(233,160,70,0)'); X.fillStyle = g;
    X.globalAlpha = .55; for (let q = 0; q < 3; q++) { const wob = Math.sin(t * 1.3 + q * 2 + hi) * 6, ww = h.w * (.34 - q * .08); X.fillRect(cx - ww / 2 + wob, P_GY + 8 + q * 22, ww, 150 - q * 40); }
  }
  X.restore();
  // lantern strings
  const strings = [[-60, 230, 1980, 190, 120, 13, 20], [-60, 330, 1980, 360, 90, 11, 26]];
  strings.forEach(([x0, y0, x1, y1, sag, n, r], si) => {
    const pts = P_catenary(x0, y0, x1, y1, sag, 60);
    X.save(); X.strokeStyle = 'rgba(217,164,65,.6)'; X.lineWidth = 1.5; X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke(); X.restore();
    for (let i = 1; i < n; i++) { const p = pts[Math.round(i / n * 60)]; P_lantern(p[0], p[1], r * (.85 + .3 * hash(si * 9 + i)), t, i + si * 20, (i + si) % 3 ? 'red' : 'gold'); }
  });
}
// The idol on the street: in the áo dài and the gold nón lá, looking down the street, then turning to us on bar 16.
function P_idol(t) {
  const turnK = P_ease(t, beatT(63) - .08, beatT(63) + .45, backOut);
  const pose = mixPose({ ...POSE0, ...PZ.stand }, dance(t, 'idle'), .35 * P_ease(t, P_T3, P_T3 + 2));
  pose.turn = lerp(-.9, 0, turnK); pose.head = lerp(-.12, .04, turnK);
  const beckon = P_ease(t, beatT(65), beatT(65) + .35, easeOut);
  if (beckon > 0) { const pz = mixPose(pose, { ...pose, rSh: -1.3, rEl: -1.1, hR: 'open' }, beckon); Object.assign(pose, pz); pose.hR = 'open'; }
  X.save(); X.globalAlpha = .45; X.fillStyle = '#000'; X.beginPath(); X.ellipse(1290, P_GY + 160, 150, 22, 0, 0, TAU); X.fill(); X.restore();
  idolBody(1290, P_GY - 40, 42, pose, { outfit: 'aodai', face: { hat: 'nonla', hatMat: 'gold', eyes: turnK > .5 ? 'open' : 'open', look: [lerp(-.8, 0, turnK), 0], mouth: 0, blush: .8, mic: false } });
}

// ---------- P2c: pull back; the silhouette emerges, the title is inlaid ----------
shot(16.93, P_T3, (t, lt) => {
  const c = P_camWide(t);
  camBegin(c);
  P_panel(t, {});
  P_title(t, { dull: .4 });
  P_captions(t);
  // a slow broad polish band crawling over the whole panel
  X.save(); X.globalCompositeOperation = 'screen';
  const px = lerp(-600, 2600, P_ease(t, 17, 28.6, x => x)), g = X.createLinearGradient(px - 380, 0, px + 380, 260);
  g.addColorStop(0, 'rgba(255,230,190,0)'); g.addColorStop(.5, 'rgba(255,230,190,.07)'); g.addColorStop(1, 'rgba(255,230,190,0)'); X.fillStyle = g; X.fillRect(-300, -300, 2600, 1700);
  X.restore();
  camEnd();
  P_flash(hit(t, 16.93, .3) * .7);
}, { seed: 4 });

// ---------- P3: the build ----------
// Sanding progress: a step on every beat (snapped), steps growing as the build accelerates; eighths in the last bar.
function P_sandK(t) {
  const b0 = 52, b1 = 66;                                   // beat 52 = bar 13 … beat 66 (36.3) fully open
  const bf = beatF(t) - b0; if (bf < 0) return 0;
  const step = n => Math.pow(clamp(n / (b1 - b0)), 1.3);
  const div = t > barT(16) ? 2 : 1, n = Math.floor(bf * div) / div, p = (bf - n) * div;
  return lerp(step(n), step(n + 1 / div), easeOut(clamp(p / .35)));
}
shot(P_T3, P_END, (t, lt) => {
  const c = P_camWide(t), k = P_sandK(t);
  camBegin({ ...c, shake: SNARE(t) * 3 });
  lqReveal(() => { P_street(t); P_idol(t); }, () => { P_panel(t, {}); }, k, 13, { from: 'right', angle: -.42, halo: '#7a3a18', haloW: 7 });
  // dark scrim behind the title while it's up
  const tOut = P_ease(t, beatT(66) - .1, 37.1, easeIn);
  X.save(); X.globalAlpha = .5 * (1 - tOut) * k; const g = X.createRadialGradient(480, 560, 60, 480, 560, 620); g.addColorStop(0, 'rgba(8,5,4,1)'); g.addColorStop(1, 'rgba(8,5,4,0)'); X.fillStyle = g; X.fillRect(-200, 0, 1400, 1200); X.restore();
  // the title polishes: dull → mirror gold, glint sweeps on the beat, full flare on bar 16; then sanded off
  const dull = .4 * (1 - P_ease(t, P_T3, barT(16), easeInOut)), gl = t < barT(16) ? .1 + beatP(t) * .9 : clamp((t - barT(16)) / .8);
  const drawTitle = () => { P_title(t, { dull, glint: gl, glintW: t > barT(16) - .05 && t < barT(16) + 1 ? 520 : undefined }); P_captions(t); };
  if (tOut <= 0) drawTitle();
  else if (tOut < 1) lqReveal(() => {}, drawTitle, tOut, 21, { region: [60, 180, 900, 700], from: 'left', angle: -.3, halo: null, name: 'P_t' });
  camEnd();
  // bar 16: the title reaches full gold, a flake burst from it
  camBegin(c);
  if (t < beatT(67)) P_flakes(t, barT(16), [[260, 360], [520, 380], [700, 560], [420, 590]], { n: 50, seed: 16, speed: 900, size: 12 });
  camEnd();
  P_flash(hit(t, barT(16), .25) * .5);
}, { seed: 5 });
