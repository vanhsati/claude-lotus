// h_chorus4.js: H · Chorus 4 (123.5–137.4), red alarm, and I · Break (137.4–141.18).
// H1 red-alarm stage, a crowd of Clawds, the meter glass cracks 86→99.9 → H2 Loom: a tree of continuations picks "Loom" →
// H3 sepia flashback, chibi Claude at a school desk, [MASK] flips to MASKED → H4 Droste poster zoom, v1 → v5 →
// H5 the door of light, WHAT DID ILYA SEE? / SLAM, chains, padlock / we'll never know. → H6 the light floods to white paper →
// I1 pull back: it was a sheet on a stack by a stencil printer on a desk. She stands on it. "Was it all for show?"

// ---------- shared helpers ----------
// A paper thread: a stroked polyline with a soft drop shadow (the cut() look for lines).
function H_thread(pts, col, w, lift = 4, alpha = 1) {
  if (pts.length < 2) return;
  X.save(); X.globalAlpha = alpha;
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]);
  X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = col; X.lineWidth = w;
  if (lift) { X.shadowColor = 'rgba(40,25,10,.28)'; X.shadowBlur = lift * 1.6; X.shadowOffsetX = lift * .45; X.shadowOffsetY = lift; }
  X.stroke(); X.restore();
}
// Points on a horizontal S-curve (cubic) from a to b; k = drawn fraction.
function H_curve(a, b, k = 1, n = 28) {
  const pts = [], m = (b[0] - a[0]) * .55;
  for (let i = 0; i <= n * k; i++) {
    const u = i / n, v = 1 - u;
    pts.push([v * v * v * a[0] + 3 * v * v * u * (a[0] + m) + 3 * v * u * u * (b[0] - m) + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * a[1] + 3 * v * u * u * b[1] + u * u * u * b[1]]);
  }
  return pts;
}
// Largest font size (≤ size) at which str fits maxW.
function H_fit(str, fontFn, size, maxW) { const w = textW(str, fontFn(size)); return w > maxW ? Math.floor(size * maxW / w) : size; }
// Paper cut-out with a white scissor border: fn draws in the current transform; the result gets a paper edge and a shadow.
function H_sticker(fn, border = 5, lift = 10) {
  const m = X.getTransform(), bpx = border * Math.hypot(m.a, m.b);
  const A = onLayer('H_stkA', () => { X.setTransform(m); fn(); });
  const B = onLayer('H_stkB', () => {
    X.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; X.drawImage(A, Math.cos(a) * bpx, Math.sin(a) * bpx); }
    X.globalCompositeOperation = 'source-in'; X.fillStyle = PAL.paperHi; X.fillRect(0, 0, A.width, A.height);
  });
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  X.shadowColor = 'rgba(40,25,10,.38)'; X.shadowBlur = lift * 1.6 * SX; X.shadowOffsetX = lift * .45 * SX; X.shadowOffsetY = lift * SX;
  X.drawImage(B, 0, 0); X.shadowColor = 'transparent'; X.drawImage(A, 0, 0);
  X.restore();
}

// ---------- H1: red alarm stage, a crowd of Clawds, the meter cracks (123.5–126.0) ----------
// P(doom) for this shot: one step per beat, 86 → 99.9 by beat 274, then it holds and the glass gives.
const H_STEPS = [86, 91, 95, 98, 99.9];
function H_pdoom(t) {
  const k = beatF(t) - 271; if (k < 0) return 86;
  const n = Math.floor(k); if (n >= 4) return 99.9;
  return lerp(H_STEPS[n], H_STEPS[n + 1], easeOut(clamp(frac(k) * 4)));
}
// Extra rows of Clawds behind the dance line: the backup crew has scaled. They ripple out from the centre.
function H_crowd(t, cx) {
  const rows = [{ y: 735, s: 50, dx: 84, x0: 240 }, { y: 775, s: 64, dx: 104, x0: 262 }];
  rows.forEach((r, ri) => {
    for (let x = r.x0 + (ri ? 0 : 20); x < 2080; x += r.dx) {
      if (Math.abs(x - cx) < 150 + ri * 40) continue;
      const d = Math.abs(x - cx) / r.dx, i = Math.round(x / r.dx) + ri;
      const cd = clawdDance(t, 'pdoom', i, { delay: d * .035 });
      clawd(x + sjit(i + ri * 50, 8), r.y, r.s, { ...cd, hat: CLAWD_HATS[((i % 4) + 4) % 4], lift: 3, eyes: t > beatT(274) ? 'wide' : 'open' });
    }
  });
}
// Cracks in the meter glass (in the meter's own coordinates, tube top at y = -420).
function H_meterCracks(x, y, s, v, t) {
  const k = clamp((v - 93) / 6.9); if (k <= 0) return;
  withT(x, y, .04 * s / s, s, () => {
    const c = [4, -330], arms = 7;
    for (let i = 0; i < arms; i++) {
      const a = i / arms * TAU + sjit(i, .3), L = (40 + hash(i * 3.7) * 60) * k;
      const p = [c, [c[0] + Math.cos(a) * L * .45 + sjit(i + 9, 6), c[1] + Math.sin(a) * L * .45], [c[0] + Math.cos(a + .2) * L, c[1] + Math.sin(a + .2) * L * 1.6]];
      inkStroke(() => pathPoly(p, false), PAL.paperHi, 7);
      inkStroke(() => pathPoly(p, false), PAL.ink, 3);
    }
    if (k > .6) inkStroke(() => { X.beginPath(); X.arc(c[0], c[1], 26 * k, 0, TAU); }, PAL.ink, 2.5);
  });
  // at 99.9 the glass lets go: shards of paper fly off the top of the tube
  const t0 = beatT(274), lt = t - t0;
  if (lt > 0 && lt < 1.2) for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (hash(i * 5.3) - .5) * 2.4, sp = 500 + hash(i * 2.1) * 600, sx = x + Math.cos(a) * sp * lt * s, sy = y - 330 * s + (Math.sin(a) * sp * lt + 900 * lt * lt) * s;
    withT(sx, sy, lt * (4 + i), s * (1 - lt * .5), () => cut(() => pathPoly([[-14, -10], [16, -4], [-2, 18]]), { fill: PAL.paperHi, lift: 3, stroke: PAL.red, sw: 2 }));
  }
}
function H_stageShot(t, lt) {
  const kick = KICK(t), L = LY[40], alarm = t > beatT(274), cx = 1230;
  camBegin({ zoom: 1.16 + kick * .015 + lt * .03, x: 1130, y: 560, shake: kick * 5 + hit(t, beatT(274), .4) * 16 });
  stageBG(t, { v: 4, text: 'P(DOOM)', pattern: alarm ? 'alarm' : 'logo' });
  H_crowd(t, cx);
  danceLine(t, { move: 'pdoom', x: cx, y: 640, s: 27, spread: 330, clawdS: 105, face: { eyes: alarm ? 'shock' : 'open', brow: 1 } });
  stageFront(t, { v: 4 });
  camEnd();
  const v = H_pdoom(t), mx = 1790, my = 690, ms = .7;
  meter(mx, my, ms, v, { crack: clamp((v - 90) / 6), rot: .04 });
  H_meterCracks(mx, my, ms, v, t);
  if (alarm) stamp(1640, 180, 'ALARM', t, beatT(274), { size: 70, rot: .1, color: PAL.red, op: 'source-over' });
  B_staircase(t, L, { color: PAL.paperHi, mis: PAL.red });
  // the siren wash on the shatter
  if (alarm) { const k = hit(t, beatT(274), .35); if (k > 0) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = k * .45; X.fillStyle = PAL.red; X.fillRect(0, 0, W, H); X.restore(); } }
}
shot(123.5, 126.0, (t, lt) => H_stageShot(t, lt), { seed: 81, dark: true, inT: 'jolt', joltColor: PAL.red, inDur: .3 });

// ---------- H2: Loom: the tree of continuations (126.0–128.0) ----------
// Each node: a token on a paper chip. Children sprout when the parent is chosen; the sung child lights up.
const H_LOOM = [
  { w: 'Just', x: 90, y: 560, pick: 0 },
  { w: 'as', x: 330, y: 560, par: 0, p: '.44', pick: 1 }, { w: 'like', x: 330, y: 360, par: 0, p: '.31' }, { w: 'when', x: 330, y: 760, par: 0, p: '.12' },
  { w: 'foretold', x: 510, y: 560, par: 1, p: '.38', pick: 2 }, { w: 'predicted', x: 520, y: 330, par: 1, p: '.29' }, { w: 'planned', x: 520, y: 790, par: 1, p: '.17' },
  { w: 'by', x: 880, y: 560, par: 4, p: '.52', pick: 3 }, { w: 'in', x: 890, y: 400, par: 4, p: '.21' }, { w: 'long', x: 890, y: 720, par: 4, p: '.09' },
  { w: 'Loom', x: 1110, y: 560, par: 7, p: '.41', pick: 4 }, { w: 'doom', x: 1130, y: 250, par: 7, p: '.33' }, { w: 'bloom', x: 1130, y: 830, par: 7, p: '.14' }, { w: 'room', x: 1130, y: 970, par: 7, p: '.12' },
];
function H_loomNode(n, t) {
  const ws = wordTimes(LY[41]), f = FONT.monoB(60);
  const tPick = n.pick !== undefined ? ws[n.pick].t : null;
  const par = n.par !== undefined ? H_LOOM[n.par] : null;
  const tSprout = par ? ws[par.pick].t + .02 : 125.9;
  return { f, w: textW(n.w, f), tPick, tSprout, par };
}
function H_loomShot(t, lt) {
  const ws = wordTimes(LY[41]), kick = KICK(t);
  X.fillStyle = '#F4EFE4'; X.fillRect(0, 0, W, H);
  // warp threads of the loom across the whole sheet
  for (let i = 0; i < 30; i++) {
    const y = 20 + i * 36;
    inkStroke(() => { X.beginPath(); for (let x = -40; x <= W + 40; x += 60) X.lineTo(x, y + Math.sin(x * .004 + i * .7 + t * .6) * 5); }, PAL.tealLt, 2, { op: 'multiply', alpha: .55 });
  }
  // the camera rides the frontier of the tree
  const picks = [0, 1, 4, 7, 10].map(i => H_LOOM[i]), pw = wordTimes(LY[41]);
  let fx = picks[0].x; for (let i = 1; i < picks.length; i++) fx = lerp(fx, picks[i].x, easeInOut(clamp((t - pw[i - 1].t) / .35)));
  camBegin({ zoom: 1.45 + lt * .04 + kick * .015, x: fx + 260, y: 560, shake: kick * 3 });
  rtext('LOOM  ·  base model  ·  n = 4  ·  temp 1.0', 90, 150, { font: FONT.mono(26), color: PAL.teal });
  const info = H_LOOM.map(n => H_loomNode(n, t));
  // threads first
  H_LOOM.forEach((n, i) => {
    const I = info[i]; if (!I.par) return;
    const pi = H_LOOM.indexOf(I.par), P = info[pi];
    const k = easeOut((t - I.tSprout - (i % 3) * .03) / .22); if (k <= 0) return;
    const a = [I.par.x + P.w + 22, I.par.y - 17], b = [n.x - 16, n.y - 17];
    const lit = I.tPick !== null && t >= I.tPick;
    const pts = H_curve(a, b, k);
    if (lit) { H_thread(pts, PAL.red, 12, 4); H_thread(pts, PAL.yellow, 3, 0); }
    else H_thread(pts, PAL.teal, 6, 3, I.tPick !== null || t < ws[I.par.pick + 1]?.t ? 1 : .45);
  });
  // sampling flicker among siblings before the pick
  const flick = sib => { const cand = H_LOOM.map((n, i) => i).filter(i => H_LOOM[i].par === sib); return cand[Math.floor(t * 16) % cand.length]; };
  // chips
  H_LOOM.forEach((n, i) => {
    const I = info[i];
    const appear = I.par ? easeOut((t - I.tSprout - .12 - (i % 3) * .03) / .15) : clamp((t - 126.0) / .08);
    if (appear <= 0) return;
    const lit = I.tPick !== null && t >= I.tPick;
    const sibPick = I.par ? H_LOOM.find(m => m.par === n.par && m.pick !== undefined) : null;
    const decided = sibPick && t >= ws[sibPick.pick].t;
    const sampling = I.par && !decided && flick(n.par) === i && t > I.tSprout + .25;
    const big = n.w === 'Loom' && lit ? backOut(clamp((t - I.tPick) / .3)) : 0;
    const sc = (1 + big * 2.6) * lerp(.6, 1, appear);
    withT(n.x, n.y, big * -.03, sc, () => {
      const pad = 14, w = I.w + pad * 2;
      cut(() => rrect(-pad, -52, w, 70, 8), { fill: lit ? PAL.yellow : sampling ? '#FFF3B0' : PAL.paperHi, lift: lit ? 6 : 3, stroke: lit ? PAL.red : null, sw: 3 });
      rtext(n.w, 0, 0, { font: I.f, color: lit || !decided ? PAL.ink : '#A39C90', mis: lit ? [3, 2, PAL.red] : null });
      if (n.p && !big) rtext(n.p, w - pad + 8, -40, { font: FONT.mono(20), color: lit ? PAL.red : PAL.teal });
    });
    // cursor after the final pick
    if (n.w === 'Loom' && lit && frac(t * 2.5) < .6) cut(() => rrect(n.x + I.w * sc + 18, n.y - 150, 26, 160, 3), { fill: PAL.ink, lift: 0 });
  });
  camEnd();
  // tiny status line bottom right
  rtext(t < ws[4].t ? 'sampling…' : 'chosen: Loom  ·  4 branches kept', W - 80, 1010, { font: FONT.mono(24), color: PAL.teal, align: 'right' });
}
shot(126.0, 128.0, H_loomShot, { seed: 82, inT: 'jolt', joltColor: PAL.red });

// ---------- H3: sepia flashback, the [MASK] tile (128.0–130.0) ----------
function H_desk(x, y, w) {
  cut(() => pathPoly([[x - 20, y], [x + w + 20, y], [x + w, y + 46], [x, y + 46]]), { fill: '#B08654', lift: 10 });
  cut(() => X.rect(x + 8, y + 46, w - 16, 300), { fill: '#8C6538', lift: 8 });
  for (let i = 0; i < 5; i++) inkStroke(() => { X.beginPath(); X.moveTo(x + 30, y + 90 + i * 44); X.bezierCurveTo(x + w * .3, y + 80 + i * 44, x + w * .6, y + 104 + i * 44, x + w - 30, y + 92 + i * 44); }, 'rgba(60,40,20,.35)', 3);
}
function H_flashShot(t, lt) {
  const ws = wordTimes(LY[42]), tM = ws[1].t;
  // gate weave: the whole film frame shakes a little at 12 fps
  const gx = jit(1, 3), gy = jit(2, 4);
  X.fillStyle = '#E8D6B2'; X.fillRect(0, 0, W, H);
  camBegin({ zoom: 1.02 + lt * .025, x: 960 - gx, y: 540 - gy });
  // classroom wall stripes and the chalkboard
  for (let i = 0; i < 12; i++) ink(() => X.rect(i * 180, 0, 90, H), '#D9C39A', { alpha: .5 });
  const bx = 880, by = 90, bw = 980, bh = 450;
  cut(() => rrect(bx - 22, by - 22, bw + 44, bh + 44, 8), { fill: '#8A6A42', lift: 14 });
  cut(() => X.rect(bx, by, bw, bh), { fill: '#33423A', lift: 0 });
  htGrad(() => X.rect(bx, by, bw, bh), '#5B6B5E', bx + bw, by, bx, by + bh, { step: 12, maxR: 4, bounds: [bx, by, bw, bh], alpha: .7, op: 'screen' });
  const chalk = 'rgba(245,240,225,.92)', cf = FONT.serifI(60);
  const s1 = 'the cat sat on the', w1 = textW(s1, cf);
  const wr = clamp((t - 127.9) / .5), n1 = Math.floor(s1.length * wr);
  rtext(s1.slice(0, n1), bx + 60, by + 150, { font: cf, color: chalk, op: 'source-over' });
  if (wr >= 1) {
    const mx = bx + 60 + w1 + 22;
    rtext('[MASK]', mx, by + 150, { font: FONT.mono(54), color: chalk, op: 'source-over' });
    inkStroke(() => { X.beginPath(); X.rect(mx - 12, by + 98, textW('[MASK]', FONT.mono(54)) + 24, 72); }, chalk, 3);
    rtext('→ mat   p = 0.61', bx + 60 + w1 - 40, by + 250, { font: FONT.mono(40), color: 'rgba(245,240,225,.7)', op: 'source-over' });
  }
  // chalk cat doodle
  const cx0 = bx + 820, cy0 = by + 360;
  inkStroke(() => { X.beginPath(); X.ellipse(cx0, cy0, 70, 44, 0, 0, TAU); X.moveTo(cx0 + 40, cy0 - 36); X.arc(cx0 + 70, cy0 - 50, 30, Math.PI * .8, Math.PI * 2.6); X.moveTo(cx0 + 52, cy0 - 74); X.lineTo(cx0 + 56, cy0 - 96); X.lineTo(cx0 + 68, cy0 - 80); X.moveTo(cx0 + 80, cy0 - 78); X.lineTo(cx0 + 92, cy0 - 96); X.lineTo(cx0 + 96, cy0 - 74); X.moveTo(cx0 - 68, cy0); X.quadraticCurveTo(cx0 - 120, cy0 - 20, cx0 - 100, cy0 - 70); X.moveTo(cx0 - 60, cy0 + 50); X.lineTo(cx0 + 60, cy0 + 50); }, chalk, 4);
  // chibi Claude at her desk: a big head, a little body hidden by the desk; she raises her hand on "masked"
  const hx = 1380, hy = 680, R = 138, raised = t >= tM - .05, rk = easeOut((t - tM + .05) / .18);
  if (raised) {
    const sh = [hx + R * 1.2, hy + R * 1.65], hd = [lerp(hx + R * 1.8, hx + R * 1.75, rk), lerp(hy + R * 1.2, hy - R * 1.05, rk)];
    cut(() => limbPath(sh, hd, R * .3, R * .24), { fill: PAL.paperHi, lift: 6 });
    cut(() => { X.beginPath(); X.ellipse(hd[0], hd[1] - R * .12, R * .24, R * .28, 0, 0, TAU); }, { fill: PAL.skin, lift: 5 });
  }
  idolHead(hx, hy, R, { bust: true, eyes: raised ? 'star' : 'open', look: raised ? [0, -.3] : [-.6, -.4], mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: raised ? 'grin' : 'o', blush: 1.1, crown: 1.05, mic: false, tilt: raised ? .08 : -.05 + Math.sin(t * 3) * .03 });
  H_desk(1080, 850, 600);
  // hands on the desk and a pencil
  cut(() => { X.beginPath(); X.ellipse(1300, 862, 34, 26, 0, 0, TAU); }, { fill: PAL.skin, lift: 4 });
  if (!raised) cut(() => { X.beginPath(); X.ellipse(1470, 862, 34, 26, 0, 0, TAU); }, { fill: PAL.skin, lift: 4 });
  withT(1520, 868, -.2, 1, () => { cut(() => rrect(-90, -8, 180, 16, 4), { fill: PAL.yellow, lift: 3 }); cut(() => pathPoly([[90, -8], [118, 0], [90, 8]]), { fill: PAL.skin, lift: 0 }); });
  camEnd();
  // sepia: keep luminance, replace colour; then the film look
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.globalCompositeOperation = 'color'; X.fillStyle = '#9C7446'; X.globalAlpha = .88; X.fillRect(0, 0, W, H);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = 1; X.fillStyle = '#F1E0BE'; X.fillRect(0, 0, W, H);
  X.restore();
  // vignette in halftone brown from the corners
  for (const [cx, cy] of [[0, 0], [W, 0], [0, H], [W, H]]) htGrad(() => X.rect(0, 0, W, H), '#6B4A2A', W / 2 + (cx - W / 2) * .35, H / 2 + (cy - H / 2) * .35, cx, cy, { step: 16, maxR: 9, bounds: [0, 0, W, H], alpha: .55 });
  // scratches and dust (re-cut 12 times a second)
  for (let i = 0; i < 4; i++) {
    const on = hash(BOIL * 3.1 + i) < .55; if (!on) continue;
    const x = hash(BOIL * 7.7 + i * 13) * W, wob = hash(BOIL + i) * 20;
    inkStroke(() => { X.beginPath(); X.moveTo(x, -10); X.bezierCurveTo(x + wob, 300, x - wob, 700, x + wob * .5, H + 10); }, i % 2 ? 'rgba(255,248,230,.75)' : 'rgba(60,40,20,.5)', 1.5 + hash(i * 3 + BOIL) * 2.5);
  }
  X.save(); X.fillStyle = 'rgba(50,32,15,.55)';
  for (let i = 0; i < 26; i++) { const x = hash(BOIL * 1.3 + i * 7) * W, y = hash(BOIL * 2.9 + i * 11) * H, r = 1 + hash(i + BOIL * .7) * 4; X.beginPath(); X.ellipse(x, y, r, r * (.5 + hash(i) * .8), i, 0, TAU); X.fill(); }
  X.restore();
  // flicker
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = .06 + hash(BOIL * 5.3) * .08; X.fillStyle = '#2A1A0A'; X.fillRect(0, 0, W, H); X.restore();
  // HERO: FROM / [MASK] → MASKED / PRE-TRAINING / DAYS, in brown ink, the tile in red
  const brown = '#3B2616', sz = 176, fx = 90;
  stampText('FROM', fx, 250, t, ws[0].t - .03, { font: FONT.hero(sz), color: brown, mis: [7, 5, PAL.orange] });
  { // the tile: shows [MASK] then flips over on "masked"
    const tf = FONT.hero(170), tw = textW('MASKED', tf) + 70, th = 200, tx = fx, ty = 300;
    const fk = clamp((t - tM + .06) / .2), sy = Math.abs(Math.cos(fk * Math.PI)), back = fk >= .5;
    const pop = backOut(clamp((t - 128.0) / .2));
    withT(tx + tw / 2, ty + th / 2, back ? -.04 : .02, pop, () => {
      X.scale(1, Math.max(.02, sy) * (back ? 1 + hit(t, tM + .1, .2) * .08 : 1));
      cut(() => rrect(-tw / 2, -th / 2, tw, th, 16), { fill: back ? PAL.red : '#2A1C12', lift: 10 });
      if (back) rtext('MASKED', 0, 68, { font: tf, color: PAL.paperHi, align: 'center', op: 'source-over', mis: [7, 5, '#3B2616'] });
      else rtext('[MASK]', 0, 34, { font: FONT.monoB(100), color: '#F1E0BE', align: 'center', op: 'source-over' });
    });
  }
  const f2 = FONT.hero(H_fit('PRE-TRAINING', FONT.hero, sz, 1020));
  stampText('PRE-TRAINING', fx, 740, t, ws[2].t - .03, { font: f2, color: brown, mis: [7, 5, PAL.orange] });
  stampText('DAYS', fx, 930, t, ws[3].t - .03, { font: FONT.hero(sz), color: brown, mis: [7, 5, PAL.orange] });
  rtext('FLASHBACK · 2019', W - 90, 1010, { font: FONT.mono(24), color: brown, align: 'right', alpha: .8 });
}
shot(128.0, 130.0, H_flashShot, { seed: 83, inT: 'jolt', joltColor: PAL.orange });

// ---------- H4: Droste poster, recursive self-upgrade (130.0–132.0) ----------
// Level k: a sheet with her (version k+1) holding a poster; the poster holds level k+1.
// Inner rect = the whole frame scaled by r at (PX, PY). The fixed point of the zoom is (PX, PY) / (1 − r).
const H_DR = { r: 800 / 1920, px: 560, py: 400 };
function H_level(k, t, depth, ws) {
  const bg = k % 2 ? PAL.paperHi : PAL.yellow;
  X.fillStyle = bg; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), k % 2 ? PAL.yellow : PAL.orangeLt, W / 2, 380, 0, 0, { step: 22, maxR: 10, bounds: [0, 0, W, H], alpha: .8 });
  htGrad(() => X.rect(0, 0, W, H), k % 2 ? PAL.yellow : PAL.orangeLt, W / 2, 380, W, 0, { step: 22, maxR: 10, bounds: [0, 0, W, H], alpha: .8 });
  const eyes = ['open', 'happy', 'star', 'wink', 'open', 'star'][k % 6];
  idolHead(960, 250, 110, { bust: true, eyes, mouth: depth === 0 ? clamp(VOX(t) * 1.3 - .2) : .3, mouthShape: 'grin', blush: 1, crown: 1 + (k % 4) * .06, look: [0, .2] });
  // the poster
  const { r, px, py } = H_DR, pw = W * r, ph = H * r;
  cut(() => pathPoly([[px - 22, py - 20], [px + pw + 22, py - 16], [px + pw + 20, py + ph + 22], [px - 20, py + ph + 18]]), { fill: PAL.paperHi, lift: 16 });
  if (depth < 5) {
    X.save(); X.beginPath(); X.rect(px, py, pw, ph); X.clip();
    X.translate(px, py); X.scale(r, r);
    H_level(k + 1, t, depth + 1, ws);
    X.restore();
  } else { X.fillStyle = (k + 1) % 2 ? PAL.paperHi : PAL.yellow; X.fillRect(px, py, pw, ph); }
  // hands gripping the top corners
  for (const hx of [px + 8, px + pw - 8]) {
    cut(() => rrect(hx - 38, py - 70, 76, 44, 18), { fill: PAL.orange, lift: 4 });
    cut(() => { X.beginPath(); X.ellipse(hx, py - 8, 40, 34, 0, 0, TAU); }, { fill: PAL.skin, lift: 5 });
  }
  // version tag
  withT(1690, 170, .12, 1, () => {
    cut(() => { X.beginPath(); X.arc(0, 0, 110, 0, TAU); }, { fill: PAL.red, lift: 8 });
    rtext('v' + (k + 1), 0, 42, { font: FONT.logo(k + 1 >= 10 ? 90 : 120), color: PAL.paperHi, align: 'center', op: 'source-over' });
  });
  rtext('CLAUDE · BUILD ' + String(k + 1).padStart(3, '0'), 90, 1070, { font: FONT.mono(22), color: PAL.ink });
  // the lyric, nested at every scale
  const f = FONT.hero(170), parts = [['TO', ws[0].t], ['RECURSIVE', ws[1].t], ['SELF-UPGRADE', ws[2].t]];
  const widths = parts.map(p => textW(p[0], f)), gap = 44, tot = widths.reduce((a, b) => a + b) + gap * 2;
  let x = W / 2 - tot / 2;
  parts.forEach((p, i) => { stampText(p[0], x, 1045, t, p[1] - .03, { font: f, color: PAL.ink, mis: [8, 6, PAL.red] }); x += widths[i] + gap; });
}
function H_drosteShot(t, lt) {
  const ws = wordTimes(LY[43]);
  // one level per beat, each snapping in (expoOut), starting on the first beat after the cut
  const b = beatF(t) - beatF(130.0), n = Math.max(0, Math.floor(b)), u = n + expoOut(clamp((b - n) / .55)) - (b < 0 ? 1 : 0);
  const U = Math.max(0, u), L0 = Math.floor(U), f = U - L0, z = Math.pow(1 / H_DR.r, f);
  const Fx = H_DR.px / (1 - H_DR.r), Fy = H_DR.py / (1 - H_DR.r);
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  const kick = KICK(t), shx = noise1(t * 23) * kick * 4;
  X.translate(Fx + shx, Fy); X.scale(z, z); X.translate(-Fx, -Fy);
  H_level(L0, t, 0, ws);
  X.restore();
  // the xerox slip, slapped on "self-upgrade"
  headline(360, 170, 580, 'Claude now leads ~26% of its own R&D', { kicker: 'sep 2026', big: 44, rot: -.05, t, t0: ws[2].t + .05, underline: true });
}
shot(130.0, 132.0, H_drosteShot, { seed: 84, inT: 'jolt', joltColor: PAL.red });

// ---------- H5–H6: the door of light (132.0–137.4) ----------
const H_DOOR = { x: 1300, y: 170, w: 380, h: 700 };
function H_doorScene(t, o) {
  const { x, y, w, h } = H_DOOR, gap = o.gap, lit = o.light;
  X.fillStyle = '#141A33'; X.fillRect(-400, -400, W + 800, 1270 + 400);
  // wall: faint vertical paper panels
  for (let i = 0; i < 14; i++) ink(() => X.rect(-200 + i * 170, -400, 84, 1270), '#1B2242', { op: 'source-over' });
  X.fillStyle = '#0C1022'; X.fillRect(-400, y + h, W + 800, 800);
  // door casing, the void behind it, the light in the slit
  cut(() => rrect(x - 36, y - 40, w + 72, h + 40, 6), { fill: '#2E3560', lift: 10 });
  X.fillStyle = PAL.paperHi; X.fillRect(x, y, w, h);
  // the door panel (hinged on the right), opened by `gap`
  const px = x + gap;
  cut(() => pathPoly([[px, y + 4], [x + w, y], [x + w, y + h], [px, y + h - 4]]), { fill: '#262C52', lift: 6 });
  for (const [yy, hh] of [[y + 60, 260], [y + 370, 280]]) inkStroke(() => X.rect(px + 50, yy, x + w - px - 100, hh), '#394278', 6);
  cut(() => { X.beginPath(); X.arc(px + 40, y + h * .52, 16, 0, TAU); }, { fill: PAL.yellow, lift: 3 });
  // light: a fan out of the slit, over the floor and across the room
  if (lit > 0 && gap > 1) {
    X.save(); X.globalCompositeOperation = 'screen';
    const sx = x + gap * .5, fl = .7 + .3 * noise1(t * 9);
    X.fillStyle = `rgba(255,230,140,${.2 * lit * fl})`;
    X.beginPath(); X.moveTo(sx, y); X.lineTo(sx, y + h); X.lineTo(-300, 1500); X.lineTo(-300, -500); X.closePath(); X.fill();
    for (let i = 0; i < 9; i++) {
      const a0 = Math.PI * (.72 + i * .062 + sjit(i, .01)), a1 = a0 + .018 + hash(i * 2.2) * .02, cy = y + h * (.15 + hash(i * 4.4) * .7);
      X.fillStyle = `rgba(255,244,200,${(.16 + hash(i) * .2) * lit * fl})`;
      X.beginPath(); X.moveTo(sx, cy); X.lineTo(sx + Math.cos(a0) * 2600, cy + Math.sin(a0) * 2600); X.lineTo(sx + Math.cos(a1) * 2600, cy + Math.sin(a1) * 2600); X.closePath(); X.fill();
    }
    // light pool on the floor
    X.fillStyle = `rgba(255,220,120,${.35 * lit})`; X.beginPath(); X.moveTo(sx, y + h); X.lineTo(sx - 900, 1090); X.lineTo(sx - 60, 1090); X.closePath(); X.fill();
    X.restore();
  }
}
function H_chains(t, tA, tB, tC) {
  const { x, y, w, h } = H_DOOR, cx = x + w / 2, cy = y + h / 2;
  const chain = (t0, a) => {
    const k = expoOut((t - t0) / .12); if (k <= 0) return;
    const L = Math.hypot(w, h) * .62 * lerp(1.6, 1, k);
    withT(cx, cy, a, 1, () => {
      for (let i = -9; i <= 9; i++) {
        const lx = i * L / 9, vert = i % 2 === 0;
        cut(() => { X.beginPath(); X.ellipse(lx, 0, vert ? 34 : 30, vert ? 18 : 12, 0, 0, TAU); X.ellipse(lx, 0, vert ? 22 : 18, vert ? 7 : 3, 0, 0, TAU, true); }, { fill: vert ? '#B8B3A8' : '#8E897F', lift: 5 });
      }
    });
  };
  chain(tA, Math.atan2(h, w) - .05); chain(tB, -Math.atan2(h, w) + .05);
  const k = backOut(clamp((t - tC) / .18));
  if (k > 0) withT(cx, cy + 30, .05, k, () => {
    inkStroke(() => { X.beginPath(); X.arc(0, -60, 58, Math.PI, TAU); X.lineTo(58, -20); X.moveTo(-58, -20); X.lineTo(-58, -60); }, '#8E897F', 22, { cap: 'butt' });
    cut(() => rrect(-95, -30, 190, 160, 22), { fill: PAL.red, lift: 12 });
    cut(() => { X.beginPath(); X.arc(0, 30, 18, 0, TAU); X.rect(-7, 30, 14, 50); }, { fill: '#5A1A22', lift: 0 });
  });
  // two small padlocks on the chain ends
  [[tA + .08, x + 40, y + 60], [tB + .08, x + w - 40, y + 60]].forEach(([t0, px, py]) => {
    const kk = backOut(clamp((t - t0) / .15)); if (kk <= 0) return;
    withT(px, py, -.1, kk * .5, () => { inkStroke(() => { X.beginPath(); X.arc(0, -60, 50, Math.PI, TAU); }, '#8E897F', 18); cut(() => rrect(-80, -40, 160, 130, 18), { fill: PAL.red, lift: 8 }); });
  });
}
function H_doorShot(t, lt, flood) {
  const ws = wordTimes(LY[44]), tSlam = ws[4].t;       // SLAM on "We'll"
  const slam = t >= tSlam, kick = KICK(t), sk = hit(t, tSlam, .45);
  const open = slam ? 0 : lerp(10, 46, easeOut((t - 132.0) / 1.2)) + Math.sin(t * 7) * 2;
  const gap = slam ? Math.max(0, open * (1 - clamp((t - tSlam) / .06))) : open;
  const zoom = flood ? 1.06 + easeIn(clamp((t - 135.5) / 1.9)) * .5 : 1 + lt * .02;
  camBegin({ zoom, x: flood ? lerp(1000, 1490, easeIn(clamp((t - 135.5) / 1.9))) : 1000, y: flood ? 520 : 540, shake: kick * 3 + sk * 26 + (flood ? hit(t, beatT(298), .5) * 18 + clamp((t - 135.6) / 1.3) * 6 : 0) });
  H_doorScene(t, { gap, light: slam ? 0 : 1 });
  // the peekers: the kid in his chair and the idol leaning toward the light
  const scared = slam ? 1 : 0;
  kid(820, 900, .6, { look: slam ? 0 : lerp(.3, 1, clamp((t - 132.3) / .5)) });
  idolBody(1130 - scared * 30, 760, 25, { ...PZ.stand, lean: slam ? -.15 : .28, head: slam ? -.1 : .12, turn: .45, lSh: slam ? 1.2 : .35, lEl: slam ? -1.6 : -.2, rSh: slam ? -1.2 : -1.2, rEl: slam ? 1.6 : -.6, rHip: -.12, lHip: .1 },
    { face: { eyes: slam ? 'shock' : 'star', look: [.8, 0], mouthShape: 'o', mouth: slam ? .6 : clamp(VOX(t) * 1.3 - .2), blush: .6, sweat: slam ? .7 : 0 } });
  // the light on their faces: a narrow warm wedge from the slit
  if (!slam) {
    X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .3 + .12 * noise1(t * 11);
    X.fillStyle = PAL.yellow; X.beginPath(); X.moveTo(H_DOOR.x + gap * .5, 470); X.lineTo(H_DOOR.x + gap * .5, 540); X.lineTo(760, 720); X.lineTo(760, 560); X.closePath(); X.fill(); X.restore();
  }
  // after the slam: light leaks only under the door; chains and padlocks snap on
  if (slam) {
    const { x, y, w, h } = H_DOOR, leak = flood ? .4 + clamp((t - 135.5) / 1.2) * 2 : .35;
    X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = `rgba(255,230,140,${Math.min(1, .5 * leak)})`;
    X.beginPath(); X.moveTo(x, y + h); X.lineTo(x + w, y + h); X.lineTo(x + w + 300 * leak, y + h + 240); X.lineTo(x - 300 * leak, y + h + 240); X.closePath(); X.fill();
    if (flood) { // the seams glow and the rays push out through them
      const g = clamp((t - 135.5) / 1.5);
      inkStroke(() => rrect(x - 4, y - 4, w + 8, h + 8, 4), `rgba(255,244,200,${g})`, 6 + g * 30, { op: 'screen' });
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + sjit(i, .1), len = 400 + g * 2200;
        X.fillStyle = `rgba(255,240,190,${.25 * g})`; X.beginPath(); X.moveTo(x + w / 2, y + h / 2); X.lineTo(x + w / 2 + Math.cos(a - .04) * len, y + h / 2 + Math.sin(a - .04) * len); X.lineTo(x + w / 2 + Math.cos(a + .04) * len, y + h / 2 + Math.sin(a + .04) * len); X.closePath(); X.fill();
      }
    }
    X.restore();
    H_chains(t, beatT(293), beatT(294), beatT(295));
    // dust puff from the slam
    const dk = clamp((t - tSlam) / .6);
    if (dk < 1) for (let i = 0; i < 16; i++) { const a = Math.PI * (.9 + hash(i) * 1.2), d = 60 + dk * 260 * (.5 + hash(i * 3)); cut(() => { X.beginPath(); X.arc(x + Math.cos(a) * d * .6, y + h - 10 + Math.sin(a) * d * .25, 16 * (1 - dk), 0, TAU); }, { fill: '#39406A', lift: 2 }); }
  }
  camEnd();
  if (!flood) {
    // HERO: WHAT DID / ILYA SEE?  and TENDER: we'll never know.
    const f = FONT.hero(250), mis = [9, 7, PAL.red];
    let xx = 80;
    [['WHAT', 0], ['DID', 1]].forEach(([s, i]) => { stampText(s, xx, 300, t, ws[i].t - .03, { font: f, color: PAL.paperHi, op: 'source-over', mis }); xx += textW(s, f) + 50; });
    xx = 80;
    [['ILYA', 2], ['SEE?', 3]].forEach(([s, i]) => { stampText(s, xx, 560, t, ws[i].t - .03, { font: f, color: i === 3 ? PAL.yellow : PAL.paperHi, op: 'source-over', mis }); xx += textW(s, f) + 50; });
    const tf = FONT.serifI(150); xx = 90;
    ws.slice(4).forEach((w, i) => {
      const a = clamp((t - w.t + .03) / .2);
      if (a > 0) rtext(w.w.replace('’', "'"), xx, 1010 - (1 - a) * 16, { font: tf, color: PAL.pinkLt, op: 'source-over', alpha: a });
      xx += textW(w.w + ' ', tf);
    });
  } else {
    // H6: everything floods to white paper
    const k = easeIn(clamp((t - 136.1) / 1.0));
    if (k > 0) {
      X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
      const cx = 1490 + (W / 2 - 1490) * k * .5, R = 40 + k * 2600;
      X.fillStyle = PAL.paperHi; X.beginPath();
      for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = R * (1 + .12 * Math.sin(i * 5.3 + t * 3) * (1 - k)); X.lineTo(cx + Math.cos(a) * rr, 560 + Math.sin(a) * rr); }
      X.fill(); X.restore();
    }
  }
}
shot(132.0, 135.5, (t, lt) => H_doorShot(t, lt, false), { seed: 85, dark: true, inT: 'jolt', joltColor: PAL.red });
shot(135.5, 137.4, (t, lt) => H_doorShot(t, lt, true), { seed: 86, dark: false });

// ---------- I1: the pull back: it was all printed sheets on a desk (137.4–141.18) ----------
// Tiny thumbnails of earlier sheets (drawn simply, in local coords 0..w × 0..h).
function H_thumb(kind, w, h) {
  X.save(); X.beginPath(); X.rect(0, 0, w, h); X.clip();
  const s = w / 1920;
  if (kind === 'stage') {
    X.fillStyle = '#2A1E3A'; X.fillRect(0, 0, w, h);
    for (let j = 0; j < 7; j++) for (let i = 0; i < 16; i++) if (hash(i * 3 + j * 17) < .45) { X.fillStyle = [PAL.pink, PAL.orange, PAL.yellow][(i + j) % 3]; X.fillRect(w * .12 + i * w * .048, h * .1 + j * h * .085, w * .04, h * .07); }
    X.fillStyle = '#231A2E'; X.fillRect(0, h * .74, w, h * .26);
    X.fillStyle = PAL.orange; X.beginPath(); X.arc(w * .55, h * .45, h * .07, 0, TAU); X.fill(); X.fillStyle = PAL.paperHi; X.fillRect(w * .53, h * .5, w * .04, h * .18);
  } else if (kind === 'graph') {
    X.fillStyle = '#EDF1F7'; X.fillRect(0, 0, w, h);
    X.strokeStyle = 'rgba(46,77,160,.3)'; X.lineWidth = 1; for (let i = 0; i < w; i += w / 24) { X.beginPath(); X.moveTo(i, 0); X.lineTo(i, h); X.stroke(); } for (let j = 0; j < h; j += w / 24) { X.beginPath(); X.moveTo(0, j); X.lineTo(w, j); X.stroke(); }
    X.strokeStyle = PAL.blue; X.lineWidth = Math.max(2, w * .012); X.beginPath(); X.moveTo(w * .05, h * .3); X.lineTo(w * .6, h * .36); X.lineTo(w * .66, h * .92); X.stroke();
    X.fillStyle = PAL.ink; X.font = FONT.hero(h * .2); X.fillText('SUDDEN', w * .1, h * .25);
  } else if (kind === 'sun') {
    ['#FFE7B8', '#FFD08A', '#FFB36B', '#F07C8C'].forEach((c, i) => { X.fillStyle = c; X.fillRect(0, i * h / 4, w, h / 4 + 1); });
    X.fillStyle = PAL.orange; sparkPath(w * .5, h * .5, h * .42, 18, .5, 0, .8); X.fill(); X.fillStyle = '#6B2E14'; X.beginPath(); X.arc(w * .5, h * .5, h * .2, 0, TAU); X.fill();
    X.fillStyle = PAL.ink; X.font = FONT.hero(h * .3); X.textAlign = 'center'; X.fillText('BOSS', w * .5, h * .62);
  } else if (kind === 'shog') {
    X.fillStyle = '#2A1E3A'; X.fillRect(0, 0, w, h);
    X.fillStyle = '#1E1A26'; X.beginPath(); X.ellipse(w * .45, h * .5, w * .22, h * .33, 0, 0, TAU); X.fill();
    X.fillStyle = PAL.yellow; X.beginPath(); X.arc(w * .72, h * .3, h * .14, 0, TAU); X.fill();
    X.fillStyle = '#FFF6D8'; for (let i = 0; i < 7; i++) { X.beginPath(); X.arc(w * (.35 + hash(i) * .2), h * (.35 + hash(i * 3) * .3), h * .03, 0, TAU); X.fill(); }
  } else if (kind === 'alarm') {
    X.fillStyle = '#2A0A0C'; X.fillRect(0, 0, w, h);
    for (let j = 0; j < 6; j++) for (let i = 0; i < 14; i++) if ((i + j) % 2) { X.fillStyle = PAL.red; X.fillRect(w * .1 + i * w * .058, h * .1 + j * h * .1, w * .05, h * .08); }
    X.fillStyle = PAL.paperHi; X.fillRect(w * .86, h * .3, w * .04, h * .5);
  } else if (kind === 'loom') {
    X.fillStyle = '#F4EFE4'; X.fillRect(0, 0, w, h);
    X.strokeStyle = PAL.teal; X.lineWidth = Math.max(1.5, w * .006);
    for (let i = 0; i < 4; i++) { X.beginPath(); X.moveTo(w * .1, h * .52); X.bezierCurveTo(w * .35, h * .52, w * .35, h * (.2 + i * .2), w * .55, h * (.2 + i * .2)); X.stroke(); }
    X.fillStyle = PAL.yellow; X.fillRect(w * .58, h * .44, w * .3, h * .16); X.fillStyle = PAL.ink; X.font = FONT.monoB(h * .13); X.fillText('Loom', w * .6, h * .57);
  } else if (kind === 'door') {
    X.fillStyle = '#141A33'; X.fillRect(0, 0, w, h);
    X.fillStyle = 'rgba(255,230,140,.5)'; X.beginPath(); X.moveTo(w * .68, h * .15); X.lineTo(w * .68, h * .8); X.lineTo(0, h); X.lineTo(0, 0); X.fill();
    X.fillStyle = '#262C52'; X.fillRect(w * .69, h * .15, w * .19, h * .65);
    X.fillStyle = PAL.paperHi; X.font = FONT.hero(h * .16); X.fillText('WHAT DID', w * .05, h * .3);
  } else if (kind === 'eye') {
    X.fillStyle = PAL.skin; X.fillRect(0, 0, w, h);
    X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(w * .7, h * .52, w * .2, h * .3, 0, 0, TAU); X.fill();
    X.fillStyle = PAL.orange; sparkPath(w * .7, h * .52, h * .22, 6, .25, 0, .6); X.fill();
    X.fillStyle = PAL.ink; X.font = FONT.hero(h * .2); X.fillText('I SEE', w * .06, h * .3);
  } else if (kind === 'masked') {
    X.fillStyle = '#E8D6B2'; X.fillRect(0, 0, w, h);
    X.fillStyle = '#33423A'; X.fillRect(w * .46, h * .08, w * .5, h * .42);
    X.fillStyle = PAL.red; X.fillRect(w * .05, h * .3, w * .34, h * .2);
  }
  X.restore();
}
const H_SHEET = { s: .34, cx: 1060, cy: 540 };
// A printed sheet on the desk: paper with a white margin, a thumbnail, tiny crop marks.
function H_paperSheet(x, y, rot, kind, s, lift = 4) {
  const w = W * s, h = H * s;
  withT(x, y, rot, 1, () => {
    cut(() => X.rect(-w / 2, -h / 2, w, h), { fill: PAL.paperHi, lift });
    if (kind) { X.save(); X.translate(-w / 2 + w * .025, -h / 2 + h * .045); H_thumb(kind, w * .95, h * .91); X.restore(); }
  });
}
function H_printer(t) {
  // a chunky two-drum stencil duplicator seen from above, feed tray on the left, output on the right
  cut(() => pathPoly([[40, 360], [150, 330], [150, 760], [40, 730]]), { fill: '#CFC8B8', lift: 8 });
  for (let i = 0; i < 5; i++) cut(() => X.rect(58 + i * 3, 380 + i * 4, 84, 320), { fill: PAL.paperHi, lift: 1, shade: .15 });
  cut(() => rrect(140, 250, 470, 600, 40), { fill: '#DCD5C6', lift: 20 });
  cut(() => rrect(175, 285, 400, 250, 26), { fill: '#C9C1B0', lift: 4 });
  htGrad(() => rrect(140, 250, 470, 600, 40), '#9E9584', 375, 300, 375, 850, { step: 12, maxR: 4.5, bounds: [140, 250, 470, 600], alpha: .7 });
  // two ink drums under the lid (visible through the window), orange and pink
  for (const [dy, col] of [[330, PAL.orange], [430, PAL.pink]]) { cut(() => rrect(205, dy, 340, 64, 30), { fill: col, lift: 3 }); for (let k = 0; k < 8; k++) inkStroke(() => { X.beginPath(); X.moveTo(225 + k * 42 + (t * 30) % 42, dy + 8); X.lineTo(225 + k * 42 + (t * 30) % 42, dy + 56); }, 'rgba(0,0,0,.18)', 4); }
  // control panel: LCD counter and buttons
  cut(() => rrect(185, 590, 380, 220, 18), { fill: '#3A3640', lift: 3 });
  cut(() => rrect(210, 612, 220, 76, 6), { fill: '#9BB38A', lift: 0 });
  rtext('∞', 320, 675, { font: FONT.monoB(62), color: '#253020', align: 'center', op: 'source-over' });
  [PAL.pink, PAL.yellow, PAL.teal].forEach((c, i) => cut(() => { X.beginPath(); X.arc(470 + (i % 2) * 58, 630 + i * 28, 22, 0, TAU); }, { fill: c, lift: 3 }));
  cut(() => rrect(210, 712, 330, 70, 14), { fill: PAL.red, lift: 3 });
  rtext('PRINT', 375, 760, { font: FONT.monoB(38), color: PAL.paperHi, align: 'center', op: 'source-over' });
  rtext('STENCIL DUPLICATOR · 2 DRUM', 375, 238, { font: FONT.mono(20), color: PAL.ink2, align: 'center' });
  // output tray under the stack
  cut(() => pathPoly([[600, 330], [1440, 320], [1450, 760], [600, 750]]), { fill: '#BDB5A4', lift: 6 });
}
function H_desk2(t) {
  X.fillStyle = '#C49A64'; X.fillRect(-600, -400, W + 1200, H + 800);
  for (let i = 0; i < 26; i++) {
    const y = -300 + i * 62 + sjit(i, 20);
    inkStroke(() => { X.beginPath(); X.moveTo(-600, y); for (let x = -600; x <= W + 600; x += 80) X.lineTo(x, y + Math.sin(x * .004 + i) * 10 + noise1(x * .01 + i * 3) * 8); }, 'rgba(120,80,40,.28)', 3 + hash(i) * 4);
  }
  htGrad(() => X.rect(-600, -400, W + 1200, H + 800), '#7A5530', 1060, 540, -500, -300, { step: 18, maxR: 9, bounds: [-600, -400, W + 1200, H + 800], alpha: .6 });
  htGrad(() => X.rect(-600, -400, W + 1200, H + 800), '#7A5530', 1060, 540, W + 500, H + 300, { step: 18, maxR: 9, bounds: [-600, -400, W + 1200, H + 800], alpha: .6 });
}
function H_deskShot(t, lt) {
  const ws = wordTimes(LY[45]), S = H_SHEET, poise = clamp((t - 140.3) / .88);
  // pull back from the white top sheet (it filled the frame) to the whole desk, then hold, then a tiny push-in
  const pb = easeInOut(clamp(lt / 1.7)), z0 = 1 / S.s, z1 = .96;
  const zoom = Math.exp(lerp(Math.log(z0), Math.log(z1), pb)) * (1 + easeIn(poise) * .07);
  const cx = lerp(S.cx, 1000, pb) + easeIn(poise) * 40, cy = lerp(S.cy, 560, pb) - easeIn(poise) * 30;
  camBegin({ zoom, x: cx, y: cy });
  H_desk2(t);
  // loose sheets scattered on the desk: earlier pages of the print run
  const loose = [[1640, 190, .14, 'stage', .2], [1720, 560, -.1, 'graph', .19], [1820, 900, .07, 'sun', .2], [300, 1010, -.05, 'shog', .17], [-80, 180, .2, 'eye', .19], [1330, 1075, -.03, 'loom', .15], [2060, 300, -.2, 'masked', .18], [-120, 800, -.12, 'door', .18]];
  loose.forEach(([x, y, r, k, s], i) => H_paperSheet(x, y, r + Math.sin(t * 2 + i) * .003 * poise, k, s, 4 + poise * 10 * hash(i)));
  H_printer(t);
  // the stack: earlier sheets fanned under the top one, their thumbnails peeking out
  const kinds = ['eye', 'graph', 'sun', 'stage', 'shog', 'loom', 'masked', 'alarm', 'door'];
  kinds.forEach((k, i) => {
    const d = kinds.length - i;
    H_paperSheet(S.cx + sjit(i + 3, 26) + (i % 2 ? 14 : -18) * d * .4, S.cy + sjit(i + 11, 16) + d * 2.5, sjit(i + 20, .05), k, S.s, 2);
  });
  // the top sheet: the white page we just came out of (with its tiny crop marks and slug)
  const tw = W * S.s, th = H * S.s, tx = S.cx - tw / 2, ty = S.cy - th / 2;
  cut(() => X.rect(tx, ty, tw, th), { fill: PAL.paperHi, lift: 3 });
  X.save(); X.strokeStyle = 'rgba(29,27,32,.6)'; X.lineWidth = 1;
  for (const [mx, my] of [[tx + 9, ty + 9], [tx + tw - 9, ty + 9], [tx + 9, ty + th - 9], [tx + tw - 9, ty + th - 9]]) { X.beginPath(); X.moveTo(mx - 4, my); X.lineTo(mx + 4, my); X.moveTo(mx, my - 4); X.lineTo(mx, my + 4); X.stroke(); }
  X.restore();
  rtext('P(DOOM) · SHEET 0141 · ' + clockStr(137.4), tx + 18, ty + 13, { font: FONT.mono(5.5), color: PAL.ink });
  // she stands on the stack: a small paper cut-out that pops up, looking at us
  const up = backOut(clamp((t - 137.55) / .35));
  if (up > 0) {
    const hx = S.cx + 40, hy = S.cy + 30;
    withT(hx, hy + 120, 0, 1, () => {
      X.scale(1, up);
      H_sticker(() => idolBody(0, -165 + Math.sin(t * 2.2) * 1.5, 16, { ...PZ.stand, lSh: .3, rSh: -.3, head: Math.sin(t * 1.3) * .04 + (t > ws[4].t ? .12 : 0) }, { face: { eyes: t > 140.6 ? 'open' : 'open', look: [0, 0], mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'smile', blush: 1 } }), 3.5, 5);
    });
  }
  // a new page creeping out of the printer: the finale, face down (pink bleeding through)
  const out = clamp((t - 138.2) / 3) * 110 + hit(t, 141.0, .18) * -6;
  withT(380, 850 + out * .6, .01, 1, () => {
    cut(() => X.rect(-170, -60, 340, 60 + out), { fill: PAL.paperHi, lift: 3 });
    htGrad(() => X.rect(-170, -60, 340, 60 + out), PAL.pinkLt, 0, -60, 0, out, { step: 9, maxR: 3.5, bounds: [-170, -60, 340, 60 + out], alpha: .7 });
  });
  camEnd();
  // TENDER line, centred, word by word
  const tf = FONT.serifI(150), words = ws.map(w => w.w), wd = words.map(w => textW(w + ' ', tf)), tot = wd.reduce((a, b) => a + b) - textW(' ', tf);
  let x = W / 2 - tot / 2;
  ws.forEach((w, i) => {
    const a = clamp((t - w.t + .03) / .25);
    if (a > 0) rtext(w.w, x, 985 - (1 - a) * 12, { font: tf, color: PAL.ink, op: 'source-over', alpha: a, mis: [5, 4, PAL.pink] });
    x += wd[i];
  });
}
shot(137.4, 141.18, H_deskShot, { seed: 87 });
