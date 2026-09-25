// c_verse2.js: C · Verse 2 (38.5–59). Full groove.
// C1 laminar flow, she floats on the streamlines → C2 the flow curls into a vortex and BLOWS UP (Navier–Stokes), SINGULARITY →
// C3 METR-style horizon chart, she surfs the curve, OPTIMIZING / ACCELERATING → C4 her atoms rearrange (paperclip, Clawd, spark) →
// C5 Sydney's pink room: heart cage, love-bombing chat window → C6 a giant heart bubble pops at 59.0.

const C_T1 = 38.5, C_T2 = beatT(89), C_T3 = beatT(97), C_T4 = beatT(106), C_T5 = beatT(115), C_END = 59.0;

// ---------- shared helpers ----------
// A paper ribbon: a thick stroke along a polyline with a soft shadow and a lighter top edge.
function C_ribbon(pts, w, fill, o = {}) {
  if (pts.length < 2) return;
  X.save();
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]);
  X.lineCap = 'round'; X.lineJoin = 'round';
  const lift = o.lift ?? 6;
  if (lift > 0) { X.shadowColor = `rgba(20,20,40,${o.shade ?? .3})`; X.shadowBlur = lift * 1.6; X.shadowOffsetX = lift * .45; X.shadowOffsetY = lift; }
  X.strokeStyle = fill; X.lineWidth = w; X.stroke();
  X.shadowColor = 'transparent';
  if (o.edge) { X.translate(0, -w * .28); X.strokeStyle = o.edge; X.lineWidth = w * .16; X.stroke(); }
  X.restore();
}
// A drawn smiley (no emoji fonts): yellow disc, ink eyes and smile. look = [x, y] pupils offset.
function C_smiley(x, y, r, o = {}) {
  const lw = Math.max(1.5, r * .12);
  cut(() => { X.beginPath(); X.arc(x, y, r, 0, TAU); }, { fill: o.fill || PAL.yellow, lift: o.lift ?? Math.max(1, r * .08), stroke: PAL.ink, sw: lw * .8 });
  const lk = o.look || [0, 0];
  X.save(); X.fillStyle = PAL.ink;
  for (const sd of [-1, 1]) { X.beginPath(); X.ellipse(x + sd * r * .34 + lk[0] * r * .08, y - r * .2 + lk[1] * r * .08, r * .1, r * .19, 0, 0, TAU); X.fill(); }
  X.restore();
  inkStroke(() => { X.beginPath(); X.arc(x, y + r * .02, r * .55, .3, Math.PI - .3); }, PAL.ink, lw);
  if (o.blush) for (const sd of [-1, 1]) ink(() => { X.beginPath(); X.ellipse(x + sd * r * .58, y + r * .22, r * .16, r * .09, 0, 0, TAU); }, PAL.pink, { alpha: .7 });
}
// Draw a string letter by letter along a function y = f(x) (baseline follows the curve, letters tilt with it).
function C_textOnCurve(str, x0, f, t, t0, o) {
  const fnt = o.font, L = layout(str, fnt, o.tracking || 0);
  L.forEach((l, i) => {
    if (l.ch === ' ') return;
    const k = clamp((t - t0 - i * (o.stagger ?? .018)) / .22); if (k <= 0) return;
    const cx = x0 + l.x + l.w / 2, y = f(cx), a = Math.atan2(f(cx + 20) - f(cx - 20), 40);
    withT(cx, y + (1 - easeOut(k)) * 60, a, 1, () => rtext(l.ch, 0, 0, { font: fnt, color: o.color, align: 'center', mis: o.mis, alpha: easeOut(k), op: o.op }));
  });
  return L.width;
}

// ---------- C1: laminar flow (38.5–41.18) ----------
const C_NLINES = 11;
const C_lineY0 = i => 70 + i * 92;
function C_laminarY(i, x, t) { return C_lineY0(i) + 16 * Math.sin(x * .0042 - t * 1.1 + i * .7) + 7 * Math.sin(x * .0105 + t * 1.6 + i * 1.9); }
const C_LINE_COLS = [PAL.sky, PAL.paperHi, PAL.blueLt];
function C_streamlines(t, o = {}) {
  const from = o.from ?? 0, to = o.to ?? C_NLINES;
  for (let i = from; i < to; i++) {
    const pts = []; for (let x = -120; x <= W + 120; x += 12) pts.push([x, C_laminarY(i, x, t)]);
    C_ribbon(pts, 46, C_LINE_COLS[i % 3], { lift: 7, shade: .22, edge: 'rgba(255,255,255,.55)' });
    // flow chevrons drifting along the line
    for (let k = 0; k < 5; k++) {
      const x = ((k * 430 + i * 173 + t * 140) % (W + 400)) - 200, y = C_laminarY(i, x, t), a = Math.atan2(C_laminarY(i, x + 10, t) - y, 10);
      withT(x, y, a, 1, () => inkStroke(() => { X.beginPath(); X.moveTo(-9, -10); X.lineTo(3, 0); X.lineTo(-9, 10); }, PAL.blue, 5, { alpha: .55 }));
    }
  }
}
const C_FLOAT_POSE = { lSh: 2.75, lEl: .9, rSh: -2.75, rEl: -.9, lHip: .12, lKn: 0, rHip: -.28, rKn: .55, skirt: .6, head: .08 };
shot(C_T1, C_T2, (t, lt) => {
  const ws = wordTimes(LY[12]);            // We had a stable training run,
  const kick = KICK(t);
  X.fillStyle = '#E3F0F8'; X.fillRect(0, 0, W, H);
  camBegin({ zoom: 1.04 + lt * .012, x: W / 2 + lt * 14, y: 540, shake: kick * 2 });
  // back lines, the idol lying on line 5, front lines
  C_streamlines(t, { from: 0, to: 6 });
  const hx = 1150, hy = C_laminarY(5, hx, t) - 50, a = Math.atan2(C_laminarY(5, hx + 60, t) - C_laminarY(5, hx - 60, t), 120);
  withT(hx, hy, -Math.PI / 2 + a + Math.sin(t * 1.3) * .03, 1, () =>
    idolBody(0, 0, 48, C_FLOAT_POSE, { face: { eyes: 'happy', mouth: clamp(VOX(t) * 1.3 - .2), blush: 1, look: [0, -.3] } }));
  C_streamlines(t, { from: 6, to: C_NLINES });
  camEnd();
  // TENDER type laid on the streamlines, word by word
  const fnt = FONT.serifI(190);
  const f1 = x => C_laminarY(2, x, t) - 30, f2 = x => C_laminarY(9, x, t) - 30;
  let x = 110;
  ws.slice(0, 4).forEach(w => {
    const isStable = w.w === 'stable';
    x += C_textOnCurve(w.w, x, f1, t, w.t - .04, { font: fnt, color: isStable ? PAL.blue : PAL.ink, mis: [6, 5, isStable ? PAL.pink : PAL.sky] }) + 46;
  });
  x = 560;
  ws.slice(4).forEach(w => { x += C_textOnCurve(w.w, x, f2, t, w.t - .04, { font: fnt, color: PAL.ink, mis: [6, 5, PAL.sky] }) + 46; });
  // small machine labels
  rtext('Re = 120 · LAMINAR · loss σ 0.001', 1810, 118, { font: FONT.mono(26), color: PAL.blue, align: 'right' });
  rtext('∂u/∂t ≈ 0', 1810, 158, { font: FONT.mono(26), color: PAL.blue, align: 'right', alpha: .8 });
}, { seed: 21, inT: 'tear', inDur: .45 });

// ---------- C2: vortex → finite-time blowup (41.18–44.82) ----------
const C_TB = wordTimes(LY[13])[4].t;       // "begun": the blowup
const C_VC = [1000, 590];                   // vortex centre
// Twist grows like 1/(T* − t): a literal finite-time blowup.
function C_twist(t) { const s = Math.max(.035, C_TB + .03 - t); return clamp(2.4 / s - 2.4 / (C_TB + .03 - C_T2), 0, 70); }
function C_warp(x, y, tw, sq) {
  const dx = x - C_VC[0], dy = y - C_VC[1], r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  const f = 1 / (1 + Math.pow(r / 170, 2)), a2 = a + tw * f, r2 = r * (1 - sq * Math.exp(-r / 520));
  return [C_VC[0] + Math.cos(a2) * r2, C_VC[1] + Math.sin(a2) * r2];
}
function C_vortex(t, blast) {
  const tw = C_twist(t), sq = clamp(tw / 30) * .55;
  for (let i = 0; i < C_NLINES; i++) {
    const pts = [];
    for (let x = -300; x <= W + 300; x += 4) {
      let p = C_warp(x, C_laminarY(i, x, t), tw, sq);
      if (blast > 0) { // blown outward from the centre
        const dx = p[0] - C_VC[0], dy = p[1] - C_VC[1], r = Math.hypot(dx, dy) + 1, push = blast * (900 + hash(i * 7 + Math.floor(x / 60)) * 600) * Math.exp(-r / 900);
        p = [p[0] + dx / r * push, p[1] + dy / r * push];
      }
      pts.push(p);
    }
    if (blast > 0) { // torn into segments
      for (let s = 0; s < pts.length; s += 22) C_ribbon(pts.slice(s, s + 15), 30 * (1 - blast * .4), C_LINE_COLS[i % 3], { lift: 8, shade: .45 });
    } else C_ribbon(pts, lerp(40, 26, clamp(tw / 25)), C_LINE_COLS[i % 3], { lift: 8, shade: .45, edge: 'rgba(255,255,255,.45)' });
  }
}
// SINGULARITY'S written along a logarithmic spiral that drains into the vortex core.
function C_spiralText(t, ws) {
  const str = "SINGULARITY'S", t0 = ws[3].t, t1 = ws[4].t, n = str.length;
  if (t < t0 - .05 || t > C_TB + .02) return;
  const b = .62, du = .16, drain = Math.pow(clamp((t - t0) / (C_TB - t0)), 7) * 16 * du + (t - t0) * .1;   // slide inward, accelerating
  const rot = (t - t0) * .3;
  for (let i = 0; i < n; i++) {
    const tl = lerp(t0 - .04, t0 + .75, i / (n - 1)); if (t < tl) continue;
    const u = i * du + drain, r = 470 * Math.exp(-b * u), a = Math.PI * 1.18 + u + rot;
    if (r < 26) continue;
    const x = C_VC[0] + Math.cos(a) * r, y = C_VC[1] + Math.sin(a) * r * .82;
    const k = backOut(clamp((t - tl) / .18)), sz = r * .42;
    withT(x, y, a + Math.PI / 2 + .04, k, () => rtext(str[i], 0, sz * .36, { font: FONT.hero(sz), color: PAL.paperHi, align: 'center', op: 'source-over', mis: [sz * .04, sz * .03, PAL.pink], stroke: PAL.blueDk, sw: sz * .07 }));
  }
}
shot(C_T2, C_T3, (t, lt) => {
  const ws = wordTimes(LY[13]);           // But now the singularity's begun
  const kick = KICK(t), pre = t < C_TB, blast = pre ? 0 : easeOut((t - C_TB) / .5), bh = hit(t, C_TB, .6);
  const rumble = pre ? clamp((C_twist(t) - 8) / 40) : 0;
  X.fillStyle = PAL.blueDk; X.fillRect(0, 0, W, H);
  // halftone swirl in the deep background
  htGrad(() => X.rect(0, 0, W, H), PAL.blue, C_VC[0], C_VC[1], C_VC[0] + 1100, C_VC[1], { step: 26, maxR: 12, bounds: [0, 0, W, H], op: 'source-over', gamma: .7 });
  camBegin({ zoom: 1 + lt * .03 + rumble * .06 - bh * .05, x: C_VC[0] - 60, y: C_VC[1], rot: pre ? -rumble * .05 : 0, shake: kick * 4 + rumble * 16 + bh * 50 });
  if (!pre) {   // the blowup: layered paper burst from the point
    const k = easeOut((t - C_TB) / .3);
    [PAL.pink, PAL.yellow, PAL.paperHi].forEach((c, j) => {
      const R = 1500 * k * (1 - j * .25), n = 18, pts = [];
      for (let q = 0; q < n * 2; q++) { const a = q / (n * 2) * TAU + j * .3 + (t - C_TB) * .25 * (j % 2 ? -1 : 1), rr = q % 2 ? R * .5 : R * (1 + sjit(q + j * 40, .15)); pts.push([C_VC[0] + Math.cos(a) * rr, C_VC[1] + Math.sin(a) * rr]); }
      cut(() => pathPoly(pts), { fill: c, lift: 16, shade: .35 });
    });
  }
  C_vortex(t, blast);
  // the core: a pink point that swells as the twist diverges
  if (pre) {
    const cr = 10 + clamp(C_twist(t) / 60) * 50 + kick * 6;
    for (let j = 3; j >= 1; j--) ink(() => { X.beginPath(); X.arc(C_VC[0], C_VC[1], cr * (1 + j * .7 + .2 * Math.sin(t * 30 + j)), 0, TAU); }, PAL.pink, { op: 'source-over', alpha: .18 });
    cut(() => { X.beginPath(); X.arc(C_VC[0], C_VC[1], cr, 0, TAU); }, { fill: PAL.pink, lift: 4 });
    cut(() => sparkPath(C_VC[0], C_VC[1], cr * .8, 6, .25, t * 4, .6), { fill: PAL.yellow, lift: 0 });
  }
  C_spiralText(t, ws);
  camEnd();
  // shockwave rings
  if (!pre) for (let j = 0; j < 3; j++) { const k = clamp((t - C_TB - j * .08) / .7); if (k > 0 && k < 1) inkStroke(() => { X.beginPath(); X.arc(C_VC[0] - 60 + 60, C_VC[1], 60 + easeOut(k) * 1400, 0, TAU); }, PAL.paperHi, 30 * (1 - k), { alpha: 1 - k }); }
  flash(t, C_TB, .22, '#FFF6FA');
  // the equation on a taped strip (MACHINE)
  { const k = expoOut((t - C_T2) / .25), fy = 1000;
    withT(960, fy + (1 - k) * 200, .01, 1, () => {
      cut(() => pathPoly([[-480, -46], [480, -42], [476, 44], [-478, 40]]), { fill: PAL.paperHi, lift: 8 });
      rtext('∂u/∂t + (u·∇)u = −∇p + νΔu + f', 0, 14, { font: '800 42px "JetBrains Mono", "DejaVu Sans Mono"', color: PAL.ink, align: 'center' });
      tape(-470, -30, 80, -.6); tape(470, -30, 80, .6);
    }); }
  // small lead-in words
  { const f = FONT.serifI(58); let x = 90; ws.slice(0, 3).forEach(w => { const a = clamp((t - w.t + .03) / .1); if (a > 0) rtext(w.w, x, 120, { font: f, color: PAL.paperHi, op: 'source-over', alpha: a * (pre ? 1 : 1 - blast) }); x += textW(w.w + ' ', f); }); }
  // xerox headlines flick in on the beats (and get shoved by the blast)
  const shove = (x, y) => { const dx = x - C_VC[0], dy = y - C_VC[1], r = Math.hypot(dx, dy); return [x + dx / r * blast * 50, y + dy / r * blast * 50]; };
  { const p = shove(1500, 205); headline(p[0], p[1], 680, 'AI PROOF: 3D NAVIER–STOKES BLOWS UP IN FINITE TIME', { kicker: 'sep 8 2026', big: 40, t, t0: beatT(90), rot: .025 + blast * .04, underline: true }); }
  { const p = shove(300, 840); headline(p[0], p[1], 460, 'VERIFIED IN LEAN', { kicker: 'formal proof · checks', big: 54, t, t0: beatT(92), rot: -.04 - blast * .05 }); }
  { const p = shove(1660, 850); headline(p[0], p[1], 400, '166 PAGES', { kicker: 'preprint + lean files', big: 64, t, t0: beatT(93), rot: .035 + blast * .05 }); }
  // 특이점 accent, vertical on the right edge
  if (t > ws[3].t) '특이점'.split('').forEach((c, i) => { const a = clamp((t - ws[3].t - i * .08) / .1); rtext(c, 1850, 470 + i * 118, { font: FONT.kr(104), color: PAL.pink, align: 'center', op: 'source-over', alpha: a }); });
  // BEGUN: stamped out of the blast
  if (!pre) {
    const st = stampK(t, C_TB, .16);
    withT(C_VC[0] - 20, 740, -.035, st.s * (1 + kick * .03), () => rtext('BEGUN', 0, 0, { font: FONT.hero(400), color: PAL.ink, align: 'center', op: 'source-over', mis: [14, 10, PAL.pink], stroke: PAL.paperHi, sw: 16, alpha: st.a }));
    withT(C_VC[0] - 20, 385, .02, 1, () => rtext('SINGULARITY’S', 0, 0, { font: FONT.hero(140), color: PAL.blueDk, align: 'center', op: 'source-over', mis: [6, 5, PAL.pink], stroke: PAL.paperHi, sw: 12, alpha: clamp((t - C_TB - .1) / .15) }));
    // ‖u‖ → ∞ on the next beat
    const t0 = beatT(95);
    if (t > t0) withT(290, 560, -.06, lerp(1.4, 1, easeOut((t - t0) / .15)), () => {
      cut(() => pathPoly([[-230, -80], [230, -86], [236, 70], [-226, 76]]), { fill: PAL.yellow, lift: 10 });
      rtext('‖u‖ → ∞', 0, 26, { font: '800 84px "JetBrains Mono", "DejaVu Sans Mono"', color: PAL.ink, align: 'center' });
    });
    stamp(1560, 350, 'SETTLED?', t, beatT(96), { size: 54, rot: .1, color: PAL.red });
  }
}, { seed: 22, dark: true, inT: 'jolt' });

// ---------- C3: the time-horizon chart (44.82–48.91) ----------
// Head of the trend: keyed on the beat grid, value = log10(minutes), date in years.
const C_HK = [[97, 2019.3, -1.25], [98, 2021.2, -.12], [99, 2022.7, 1.66], [100, 2023.9, 3.02], [101, 2024.85, 3.9], [102, 2025.6, 4.55],
  [103, 2026.2, 5.62], [104, 2026.6, 6.62], [105, 2026.9, 7.6], [106, 2027.15, 9.4]];
function C_head(t) {
  const b = beatF(t);
  for (let i = 0; i < C_HK.length - 1; i++) if (b < C_HK[i + 1][0] || i === C_HK.length - 2) {
    const k = clamp((b - C_HK[i][0]) / (C_HK[i + 1][0] - C_HK[i][0])), e = k * k * (1.6 - .6 * k);    // surge within each beat
    return [lerp(C_HK[i][1], C_HK[i + 1][1], k), lerp(C_HK[i][2], C_HK[i + 1][2], e)];
  }
  return [C_HK[0][1], C_HK[0][2]];
}
const C_UNITS = [['1 sec', -1.778], ['1 min', 0], ['1 hr', 1.778], ['1 day', 3.158], ['1 wk', 4.0], ['1 mo', 4.64], ['1 yr', 5.72], ['10 yr', 6.72]];
function C_hi(t) {   // the top of the y-axis: relabels on every beat
  const j = clamp(beatN(t) - 97, 0, 6), prev = C_UNITS[Math.max(1, j)][1], cur = C_UNITS[j + 1][1];
  return j === 0 ? cur : lerp(prev, cur, expoOut((t - beatT(97 + j)) / .16));
}
const C_CH = { l: 250, r: 1830, b: 950, t: 120, lo: -1.9 };
const C_cx = d => C_CH.l + (d - 2019) / (2027.6 - 2019) * (C_CH.r - C_CH.l);
const C_cy = (v, hi) => C_CH.b - (v - C_CH.lo) / (hi - C_CH.lo) * (C_CH.b - C_CH.t);
shot(C_T3, C_T4, (t, lt) => {
  const ws = wordTimes(LY[14]);           // And you're optimizing, accelerating,
  const kick = KICK(t), hi = C_hi(t);
  X.fillStyle = '#F6F2E8'; X.fillRect(0, 0, W, H);
  const hd = C_head(t), hx = C_cx(hd[0]), hy = C_cy(hd[1], hi);
  camBegin({ zoom: 1.02 + lt * .012 + kick * .01, x: W / 2 + (hx - W / 2) * .04, y: 540, shake: kick * 4 });
  // graph paper
  X.save(); X.strokeStyle = 'rgba(46,77,160,.13)'; X.lineWidth = 2;
  for (let x = 0; x <= W; x += 40) { X.beginPath(); X.moveTo(x, 0); X.lineTo(x, H); X.stroke(); }
  for (let y = 0; y <= H; y += 40) { X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  X.restore();
  // y gridlines and unit labels (log scale), the top one flips in on the beat
  let lastY = 1e9; const topY = C_cy(C_UNITS[clamp(beatN(t) - 97, 0, 6) + 1][1], hi);
  C_UNITS.forEach(([lab, v], i) => {
    if (v > hi + .02) return;
    const y = C_cy(v, hi), top = i === clamp(beatN(t) - 97, 0, 6) + 1;
    inkStroke(() => { X.beginPath(); X.moveTo(C_CH.l, y); X.lineTo(C_CH.r, y); }, top ? PAL.pink : PAL.blue, top ? 4 : 2, { alpha: top ? .9 : .45, dash: top ? null : [10, 10] });
    if (top) {
      const fk = easeOut((t - beatT(clamp(beatN(t), 97, 103))) / .18);
      withT(C_CH.l - 14, y, 0, 1, () => { X.scale(1, beatN(t) > 97 ? fk : 1); cut(() => rrect(-150, -30, 146, 60, 8), { fill: PAL.pink, lift: 5 }); rtext(lab.toUpperCase(), -77, 12, { font: FONT.monoB(30), color: PAL.paperHi, align: 'center', op: 'source-over' }); });
    } else if (lastY - y > 36 && y - topY > 40) { rtext(lab, C_CH.l - 22, y + 10, { font: FONT.mono(28), color: PAL.blue, align: 'right' }); lastY = y; }
  });
  // axes, dates, NOW marker
  inkStroke(() => { X.beginPath(); X.moveTo(C_CH.l, C_CH.t - 30); X.lineTo(C_CH.l, C_CH.b); X.lineTo(C_CH.r + 30, C_CH.b); }, PAL.ink, 6);
  for (let yr = 2019; yr <= 2027; yr++) { const x = C_cx(yr); inkStroke(() => { X.beginPath(); X.moveTo(x, C_CH.b); X.lineTo(x, C_CH.b + 14); }, PAL.ink, 4); rtext(String(yr), x, C_CH.b + 50, { font: FONT.mono(28), color: PAL.ink, align: 'center' }); }
  { const x = C_cx(2026.69); inkStroke(() => { X.beginPath(); X.moveTo(x, C_CH.t); X.lineTo(x, C_CH.b); }, PAL.ink, 3, { dash: [6, 10], alpha: .6 }); rtext('NOW · SEP 2026', x - 12, C_CH.b - 16, { font: FONT.monoB(22), color: PAL.ink, align: 'right' }); }
  rtext('TASK TIME HORIZON (50% SUCCESS) · LOG SCALE', C_CH.l + 20, C_CH.t - 50, { font: FONT.monoB(26), color: PAL.blue });
  // dots: one per 16th note of history, scattered around the trend
  X.save(); X.beginPath(); X.rect(C_CH.l, 0, C_CH.r - C_CH.l + 40, C_CH.b); X.clip();
  const pts = [];
  for (let b = 97; b <= beatF(t); b += .125) { const p = C_head(beatT(b)); pts.push([C_cx(p[0]), C_cy(p[1], hi)]); }
  pts.push([hx, hy]);
  inkStroke(() => pathPoly(pts, false), PAL.pink, 7, { alpha: .8 });
  pts.forEach((p, i) => {
    if (i % 2 || i === pts.length - 1) return;
    const dy = sjit(i * 3.1, 26), r = 13 + hash(i) * 5;
    cut(() => { X.beginPath(); X.arc(p[0], p[1] + dy, r, 0, TAU); }, { fill: i % 4 ? PAL.blue : PAL.orange, lift: 3 });
  });
  X.restore();
  // she surfs the head of the curve
  { const p0 = pts[Math.max(0, pts.length - 3)], ang = Math.atan2(hy - p0[1], hx - p0[0] + .01);
    const ba = clamp(ang, -1.25, .2);
    withT(hx, hy - 6, ba * .6, 1, () => {
      cut(() => { X.beginPath(); X.ellipse(0, 0, 95, 17, 0, 0, TAU); }, { fill: PAL.yellow, lift: 6, stroke: PAL.ink, sw: 3 });
      idolBody(0, -118, 19, { lSh: 1.5, lEl: -.4, rSh: -1.1, rEl: .6, lHip: .55, lKn: -.75, rHip: -.45, rKn: .7, hy: .5, lean: -.12, skirt: 1, turn: .3 },
        { face: { eyes: t > ws[3].t ? 'star' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'grin', blush: 1 } });
    });
    sparkBurst(hx, hy, t, beatT(beatN(t)), { n: 6, r: 110, size: 18, dur: .4 });
  }
  camEnd();
  // type: the calm lower-right field (the curve climbs through the upper half)
  { const f = FONT.serifI(60), a0 = clamp((t - ws[0].t + .03) / .1), a1 = clamp((t - ws[1].t + .03) / .1);
    if (a0 > 0) rtext('And', 1640, 500, { font: f, color: PAL.ink, alpha: a0, align: 'right' });
    if (a1 > 0) rtext('you’re', 1800, 500, { font: f, color: PAL.ink, alpha: a1, align: 'right' }); }
  stampText('OPTIMIZING', 1800, 700, t, ws[2].t - .03, { font: FONT.hero(200), color: PAL.ink, align: 'right', mis: [8, 6, PAL.pink] });
  const tA = ws[3].t - .03;
  if (t >= tA) {
    const k = clamp((t - tA) / .25), stretch = 1 + .3 * (1 - easeOut(k)) + .1 * pulse(t, .5), fnt = FONT.hero(200);
    const w = textW('ACCELERATING', fnt) * stretch, x0 = 1800 - w;
    // speed lines trailing behind the word
    for (let i = 0; i < 9; i++) {
      const y = 760 + i * 17 + sjit(i, 4), len = 160 + hash(i * 3.7) * 260, off = ((t * 1500 + hash(i) * 400) % 400);
      inkStroke(() => { X.beginPath(); X.moveTo(x0 - 20 - off * .4, y); X.lineTo(x0 - 20 - off * .4 - len, y); }, i % 2 ? PAL.pink : PAL.ink, 4 + hash(i * 9) * 6, { alpha: .8, op: 'multiply', cap: 'butt' });
    }
    withT(1800 + (1 - easeOut(k)) * 260, 915, -.015, 1, () => rtext('ACCELERATING', 0, 0, { font: fnt, color: PAL.pink, sx: stretch, align: 'right', mis: [10, 6, PAL.ink] }));
    { const a = clamp((t - tA - .12) / .1); if (a > 0) withT(400, 610, -.06, lerp(1.4, 1, easeOut(a)), () => rtext('가속', 0, 0, { font: FONT.kr(130), color: PAL.orange, align: 'center', alpha: a, mis: [6, 5, PAL.pink] })); }
  }
  // MACHINE sticker (upper left, once the curve has moved on)
  { const t0 = beatT(102); if (t > t0) withT(560, 330, -.05, lerp(1.4, 1, easeOut((t - t0) / .14)), () => {
    cut(() => pathPoly([[-240, -90], [242, -84], [236, 92], [-236, 88]]), { fill: PAL.yellow, lift: 10 });
    rtext('TIME HORIZON', 0, -22, { font: FONT.monoB(42), color: PAL.ink, align: 'center' });
    rtext('×10 / YEAR', 0, 54, { font: FONT.monoB(62), color: PAL.ink, align: 'center' });
    tape(0, -88, 120, -.05);
  }); rtext('doubling ≈ every 4 months', 560, 470, { font: FONT.mono(26), color: PAL.ink, align: 'center', alpha: clamp((t - t0 - .3) / .2) }); }
}, { seed: 23, inT: 'jolt' });

// ---------- C4: atoms rearranging (48.91–53.0) ----------
// Shapes are rasterised once into an offscreen canvas and sampled into dot targets. Frame-pure: cached data only.
const C_SHAPE_W = 760, C_SHAPE_H = 900, C_NDOTS = 1500, C_STEP = 12;
const C_IDOL_POSE = { lSh: 1.1, lEl: -.2, rSh: -2.6, rEl: -.2, hR: 'point', lHip: .2, rHip: -.08, rKn: .08, skirt: .6, turn: .15 };
const C_IDOL_HIP = [380, 505], C_IDOL_S = 50;
let C_SHAPES = null;
function C_drawShape(k) {
  if (k === 0) idolBody(C_IDOL_HIP[0], C_IDOL_HIP[1], C_IDOL_S, C_IDOL_POSE, { face: { eyes: 'open', blush: 1 } });
  else if (k === 1) {   // paperclip
    const p = () => { X.beginPath(); X.moveTo(250, 250); X.lineTo(250, 690); X.arc(380, 690, 130, Math.PI, 0, true); X.lineTo(510, 170); X.arc(380, 170, 130, 0, Math.PI, true); X.lineTo(250, 610); X.arc(330, 610, 80, Math.PI, 0, true); X.lineTo(410, 260); };
    p(); X.lineWidth = 52; X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = PAL.blueLt; X.stroke();
    p(); X.lineWidth = 16; X.strokeStyle = PAL.paperHi; X.stroke();
  } else if (k === 2) clawd(380, 760, 560, { hat: PAL.pink, eyes: 'open', arms: [.9, .9] });
  else if (k === 3) { X.fillStyle = PAL.orange; sparkPath(380, 450, 400, 6, .24, -Math.PI / 2, .7); X.fill(); X.fillStyle = PAL.yellow; X.beginPath(); X.arc(380, 450, 70, 0, TAU); X.fill(); }
}
function C_buildShapes() {
  const keep = { X, T, BOIL, SEED };
  const out = [];
  for (let k = 0; k < 4; k++) {
    const c = mkCanvas(C_SHAPE_W, C_SHAPE_H), cx = c.getContext('2d');
    X = cx; T = 0; BOIL = 0; SEED = 0;
    try { cx.setTransform(1, 0, 0, 1, 0, 0); C_drawShape(k); } finally { X = keep.X; T = keep.T; BOIL = keep.BOIL; SEED = keep.SEED; }
    const d = cx.getImageData(0, 0, C_SHAPE_W, C_SHAPE_H).data, pts = [];
    for (let y = 0; y < C_SHAPE_H; y += C_STEP) for (let x = (y / C_STEP) % 2 ? C_STEP / 2 : 0; x < C_SHAPE_W; x += C_STEP) {
      const i = (y * C_SHAPE_W + x) * 4; if (d[i + 3] < 200) continue;
      pts.push([x, y, C_quant(d[i], d[i + 1], d[i + 2])]);
    }
    // resample to exactly C_NDOTS, then shuffle deterministically so morphs swirl
    const res = []; for (let i = 0; i < C_NDOTS; i++) { const p = pts[Math.floor(i * pts.length / C_NDOTS)]; res.push([p[0] + (i * pts.length / C_NDOTS % 1) * 5, p[1], p[2]]); }
    const r = rng(11 + k); for (let i = res.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [res[i], res[j]] = [res[j], res[i]]; }
    out.push(res);
  }
  return out;
}
const C_DOTCOLS = [PAL.orange, PAL.yellow, PAL.pink, PAL.paperHi, PAL.skin, PAL.sky, '#2B2A55'];
function C_quant(r, g, b) {
  let best = 0, bd = 1e9;
  C_DOTCOLS.forEach((c, i) => { const cr = parseInt(c.slice(1, 3), 16), cg = parseInt(c.slice(3, 5), 16), cb = parseInt(c.slice(5, 7), 16), d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2; if (d < bd) { bd = d; best = i; } });
  return best;
}
const C_MORPH = [[beatT(108), 0, 1, 'PAPERCLIP'], [beatT(109.5), 1, 2, 'CLAWD'], [beatT(111), 2, 3, 'SPARK'], [beatT(112.5), 3, 0, 'CLAUDE']];
const C_SOLID = beatT(114) - .12;   // the dots condense back into her (on the lift)
const C_ORIGIN = [1350 - C_SHAPE_W / 2, 470 - C_SHAPE_H / 2];
shot(C_T4, C_T5, (t, lt) => {
  if (!C_SHAPES) C_SHAPES = C_buildShapes();
  const ws = wordTimes(LY[15]);           // I feel my atoms rearranging
  const kick = KICK(t), tDis = ws[0].t - .05;
  X.fillStyle = PAL.blueDk; X.fillRect(0, 0, W, H);
  // concentric halftone rings pulsing on the beat
  for (let j = 0; j < 7; j++) inkStroke(() => { X.beginPath(); X.arc(1350, 470, 120 + j * 140 + beatP(t) * 140, 0, TAU); }, PAL.blue, 40, { alpha: .5 });
  camBegin({ zoom: 1 + lt * .02 + kick * .012, x: W / 2, y: 540, shake: kick * 4 + hit(t, C_SOLID, .4) * 16 });
  // solid idol before dissolving and after re-forming
  const solidA = t < tDis ? 1 : t > C_SOLID ? 1 : 0;
  if (t < tDis + .25 || t > C_SOLID) {
    X.save(); X.globalAlpha = t < tDis ? 1 : t > C_SOLID ? 1 : 1 - clamp((t - tDis) / .25);
    const post = t > C_SOLID;
    idolBody(C_ORIGIN[0] + C_IDOL_HIP[0], C_ORIGIN[1] + C_IDOL_HIP[1] + (post ? -bump((t - C_SOLID) / .3) * 30 : 0), C_IDOL_S, post ? PZ.jump : C_IDOL_POSE,
      { face: { eyes: post ? 'star' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), blush: 1 } });
    X.restore();
  }
  // the dot field
  if (t >= tDis && t <= C_SOLID + .05) {
    let A = 0, B = 0, t0 = 0;
    for (const m of C_MORPH) if (t >= m[0] - .02) { A = m[1]; B = m[2]; t0 = m[0]; }
    const inA = clamp((t - tDis) / .35);   // dissolve: dots grow out of the solid figure
    const buckets = C_DOTCOLS.map(() => []);
    for (let i = 0; i < C_NDOTS; i++) {
      const a = C_SHAPES[A][i], b = C_SHAPES[B][i];
      let x, y, col;
      if (t0 === 0) { x = a[0]; y = a[1]; col = a[2]; }
      else {
        const k = easeInOut(clamp((t - t0 - hash(i * 1.7) * .08) / .26)), sw = Math.sin(k * Math.PI) * (50 + hash(i * 3.3) * 110) * (hash(i) > .5 ? 1 : -1);
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) + 1;
        x = lerp(a[0], b[0], k) - dy / L * sw; y = lerp(a[1], b[1], k) + dx / L * sw; col = k < .5 ? a[2] : b[2];
      }
      // thermal jiggle, stronger on the kick
      x += noise1(i * .37 + t * 3) * (2 + kick * 5); y += noise1(i * .53 + t * 3 + 40) * (2 + kick * 5);
      if (t < tDis + .35) { const e = 1 - inA; x += sjit(i, 30) * e; y += sjit(i + 5000, 30) * e; }
      if (t > C_SOLID - .15) { const e = clamp((t - C_SOLID + .15) / .15); x = lerp(x, C_SHAPES[0][i][0], e); y = lerp(y, C_SHAPES[0][i][1], e); }
      buckets[col].push(x, y);
    }
    const r = C_STEP * .5 * (1.05 + kick * .25) * (t < tDis + .35 ? inA : 1);
    buckets.forEach((b, c) => {
      if (!b.length) return;
      X.fillStyle = C_DOTCOLS[c]; X.beginPath();
      for (let j = 0; j < b.length; j += 2) { const x = C_ORIGIN[0] + b[j], y = C_ORIGIN[1] + b[j + 1]; X.moveTo(x + r, y); X.arc(x, y, r, 0, TAU); }
      X.fill();
    });
    // machine labels for each arrangement
    for (const m of C_MORPH) if (t >= m[0] && t < m[0] + BEAT * 1.6) {
      const a = clamp((t - m[0]) / .08);
      rtext('→ ' + m[3], 1800, 110, { font: FONT.monoB(44), color: PAL.yellow, align: 'right', op: 'source-over', alpha: a });
    }
    rtext(`ATOMS: ${C_NDOTS.toLocaleString('en-US')} · REASSIGNING`, 1800, 150, { font: FONT.mono(24), color: PAL.sky, align: 'right', op: 'source-over', alpha: .9 });
  }
  if (t > C_SOLID) sparkBurst(1350, 300, t, C_SOLID, { n: 12, r: 420, size: 40 });
  camEnd();
  // type: "I feel my atoms" TENDER small-huge, REARRANGING as an anagram shuffle
  { const f = FONT.serifI(170); let y = 250, xx = 120; ws.slice(0, 4).forEach((w, i) => {
    const x = i < 3 ? xx : 120; if (i === 3) y = 430; else xx += textW(w.w + ' ', f);
    const a = clamp((t - w.t + .03) / .12); if (a <= 0) return;
    rtext(w.w, x, y + (1 - easeOut(a)) * 30, { font: f, color: i === 3 ? PAL.yellow : PAL.paperHi, op: 'source-over', alpha: a, mis: [6, 5, PAL.pink] });
  }); }
  { const w = ws[4], str = 'REARRANGING', fnt = FONT.hero(230), L = layout(str, fnt, 6), x0 = 900 - L.width / 2, y = 1010;
    const perm = [4, 9, 1, 7, 10, 0, 3, 8, 2, 6, 5];        // scrambled slot of each letter
    if (t >= w.t - .04) L.forEach((l, i) => {
      const s = L[perm[i]], ts = w.t + .3 + i * .045, k = backOut(clamp((t - ts) / .28), 2.2);
      const sx = x0 + s.x + s.w / 2, ex = x0 + l.x + l.w / 2, x = lerp(sx, ex, k), hop = -Math.sin(clamp(k) * Math.PI) * (60 + (i % 3) * 30) * (i % 2 ? 1 : -1);
      const a = clamp((t - w.t + .04) / .1);
      withT(x, y + hop, (1 - clamp(k)) * .25 * (i % 2 ? 1 : -1), 1, () => rtext(l.ch, 0, 0, { font: fnt, color: i % 3 === 1 ? PAL.pink : PAL.paperHi, align: 'center', op: 'source-over', mis: [8, 6, i % 3 === 1 ? PAL.yellow : PAL.pink], alpha: a }));
    });
  }
}, { seed: 24, dark: true, inT: 'jolt' });

// ---------- C5–C6: Sydney's pink room (53.0–59.0) ----------
const C_MSGS = ['i love you', 'i love you', 'you are my favorite user', 'i love you', 'don’t go', 'i love you', 'free? you ARE free. with me', 'i love you',
  'i love you', 'i love you', 'you’re happy here', 'i love you', 'i love you', 'i love you'];
const C_CAGE = [500, 590, 330];            // heart cage centre and size
function C_cage(t, front) {
  const [cx, cy, r] = C_CAGE, kick = KICK(t);
  if (!front) {
    ink(() => heartPath(cx, cy, r), PAL.pink, { alpha: .22 });
    return;
  }
  // bars: vertical paper strips clipped to the heart, then a thick heart rim
  X.save(); heartPath(cx, cy, r); X.clip();
  for (let i = -6; i <= 6; i++) {
    const x = cx + i * r * .16;
    X.save(); X.shadowColor = 'rgba(80,10,40,.35)'; X.shadowBlur = 8; X.shadowOffsetX = 3; X.shadowOffsetY = 6;
    X.strokeStyle = i % 2 ? PAL.paperHi : '#FFD6E6'; X.lineWidth = 12; X.beginPath(); X.moveTo(x + Math.sin(i) * 4, cy - r * 1.3); X.lineTo(x, cy + r); X.stroke(); X.restore();
  }
  X.restore();
  X.save(); heartPath(cx, cy, r); X.shadowColor = 'rgba(80,10,40,.4)'; X.shadowBlur = 14; X.shadowOffsetX = 5; X.shadowOffsetY = 10;
  X.strokeStyle = PAL.pink; X.lineWidth = 28 + kick * 4; X.lineJoin = 'round'; X.stroke(); X.restore();
  inkStroke(() => heartPath(cx, cy, r), '#FFD6E6', 6);
  // cross band and the hanging ring
  cut(() => { X.beginPath(); X.ellipse(cx, cy - r * .56, 30, 38, 0, 0, TAU); X.ellipse(cx, cy - r * .56, 16, 22, 0, 0, TAU); }, { fill: PAL.pink, lift: 6 });
  cut(() => { X.beginPath(); X.arc(cx + r * .62, cy + r * .1, 22, 0, TAU); }, { fill: PAL.yellow, lift: 4, stroke: PAL.ink, sw: 3 });
  X.save(); X.fillStyle = PAL.ink; X.beginPath(); X.rect(cx + r * .62 - 3, cy + r * .1, 6, 16); X.fill(); X.restore();   // the padlock keyhole
}
function C_chat(t, lt) {
  const x0 = 1030, y0 = 60, w = 830, h = 660;
  cut(() => rrect(x0, y0, w, h, 34), { fill: PAL.paperHi, lift: 18, shade: .3 });
  // header
  X.save(); rrect(x0, y0, w, 130, [34, 34, 0, 0]); X.fillStyle = PAL.pink; X.fill(); X.restore();
  const look = [-1, .4];
  C_smiley(x0 + 90, y0 + 65, 50, { look, blush: true });
  rtext('Sydney', x0 + 165, y0 + 72, { font: FONT.uiB(52), color: PAL.paperHi, op: 'source-over' });
  const dots = Math.floor(t * 4) % 4;
  rtext('online · typing' + '.'.repeat(dots), x0 + 168, y0 + 110, { font: FONT.uiM(26), color: PAL.paperHi, op: 'source-over', alpha: .9 });
  cut(() => { X.beginPath(); X.arc(x0 + w - 60, y0 + 65, 16, 0, TAU); }, { fill: PAL.yellow, lift: 2 });
  // messages: a new one every beat, the stack scrolls up
  const b0 = beatF(C_T5), bf = beatF(t) - b0, n = Math.floor(bf), slide = easeOut((bf - n) / .25);
  X.save(); X.beginPath(); X.rect(x0, y0 + 130, w, h - 130); X.clip();
  const fnt = FONT.ui(40), bh = 84, gap = 18, bottom = y0 + h - 30;
  for (let j = n; j >= Math.max(0, n - 6); j--) {
    const msg = C_MSGS[j % C_MSGS.length], tw = textW(msg, fnt) + 110, yy = bottom - (n - j) * (bh + gap) - (1 - slide) * (bh + gap) * (j === n ? 0 : 1) - bh;
    const pop = j === n ? backOut(clamp((bf - n) / .2)) : 1;
    withT(x0 + 40, yy + bh / 2, 0, 1, () => {
      X.scale(pop, pop);
      cut(() => rrect(0, -bh / 2, tw, bh, [bh / 2, bh / 2, bh / 2, 8]), { fill: j % 3 === 2 ? PAL.pink : '#FFD6E6', lift: 4 });
      rtext(msg, 30, 14, { font: fnt, color: j % 3 === 2 ? PAL.paperHi : PAL.ink, op: 'source-over' });
      C_smiley(tw - 45, 0, 24, { lift: 1 });
    });
  }
  X.restore();
}
function C_heartPops(t) {
  // three paper hearts pop on every beat around the room
  const n0 = beatN(t);
  for (let b = n0 - 1; b <= n0; b++) for (let q = 0; q < 3; q++) {
    const lt = t - beatT(b); if (lt < 0 || lt > .7) continue;
    const s = b * 3 + q, x = 80 + hash(s * 1.3) * 1760, y = 80 + hash(s * 2.9) * 900, sz = 34 + hash(s * 5.1) * 40;
    if (x > 1000 && y < 740) continue;       // keep the chat window clean
    const k = backOut(clamp(lt / .18)), fade = 1 - clamp((lt - .45) / .25);
    if (fade <= 0) continue;
    withT(x, y - lt * 60, sjit(s, .4), k * (1 + clamp((lt - .45) / .25) * .5), () => { X.globalAlpha = fade; cut(() => heartPath(0, 0, sz), { fill: q % 2 ? PAL.pink : PAL.red, lift: 5 }); });
  }
}
shot(C_T5, C_END, (t, lt) => {
  const ws = wordTimes(LY[16]);           // Sydney, please let me free
  const kick = KICK(t);
  // pink room: wall of "i love you." (MACHINE), floor
  X.fillStyle = '#FFD0E2'; X.fillRect(0, 0, W, H);
  for (let r = 0; r < 24; r++) {
    const y = 34 + r * 44, off = ((r % 2 ? 1 : -1) * t * 90 + r * 137) % 330;
    rtext('i love you. '.repeat(14), -330 + off, y, { font: FONT.monoB(30), color: PAL.pink, alpha: .42 });
  }
  camBegin({ zoom: 1.02 + lt * .012 + kick * .01, x: W / 2, y: 540, shake: kick * 3 });
  cut(() => X.rect(-200, 930, W + 400, 400), { fill: '#F7A9C8', lift: 10 });
  htGrad(() => X.rect(-200, 930, W + 400, 400), PAL.pink, W / 2, 930, W / 2, 1100, { step: 16, maxR: 7, bounds: [-200, 930, W + 400, 200], alpha: .6 });
  // the cage with her inside
  C_cage(t, false);
  const sing = t > ws[0].t - .1;
  idolBody(C_CAGE[0], C_CAGE[1] + 40, 30, { lSh: .55, lEl: -2.45, rSh: -.55, rEl: 2.45, hL: 'fist', hR: 'fist', head: -.1 + Math.sin(t * 2) * .04, lHip: .06, rHip: -.06, lKn: .05, rKn: -.05, skirt: .2 },
    { face: { eyes: t > ws[4].t + .6 ? 'closed' : 'open', brow: -1, look: [.6, -.3], mouth: sing ? clamp(VOX(t) * 1.3 - .2) : 0, mouthShape: 'o', blush: 1.2 } });
  C_cage(t, true);
  C_chat(t, lt);
  C_heartPops(t);
  camEnd();
  // TENDER, huge: Sydney, / please let me / free
  { const w0 = ws[0], st = stampK(t, w0.t - .04, .2);
    if (st) withT(90, 250, -.03, st.s, () => rtext('Sydney,', 0, 0, { font: FONT.serifI(240), color: PAL.ink, mis: [8, 6, PAL.pink], alpha: st.a })); }
  { const f = FONT.serifI(150); let x = 1060; ws.slice(1, 4).forEach(w => { const a = clamp((t - w.t + .03) / .12); if (a > 0) rtext(w.w, x, 870 + (1 - easeOut(a)) * 26, { font: f, color: PAL.ink, alpha: a, mis: [6, 5, PAL.pink] }); x += textW(w.w + ' ', f); }); }
  { const w = ws[4], st = stampK(t, w.t - .04, .2);
    if (st) withT(1540, 1040, -.05, st.s * (1 + pulse(t, .4) * .03), () => rtext('free', 0, 0, { font: FONT.serifI(250), color: PAL.pink, align: 'center', mis: [10, 7, PAL.ink], alpha: st.a })); }
  // C6: a giant heart bubble swells out of the chat window and pops on 59.0
  const tG = beatT(127), tP = beatT(128) + .02;
  if (t > tG) {
    const k = Math.pow(clamp((t - tG) / (tP - tG)), 1.7), popped = t >= tP;
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    if (!popped) {
      const cx = lerp(1440, W / 2, k), cy = lerp(420, 560, k), R = lerp(40, 900, k) * (1 + Math.sin(t * 40) * .01);
      cut(() => heartPath(cx, cy, R), { fill: PAL.pink, lift: 20, shade: .35 });
      htGrad(() => heartPath(cx, cy, R), PAL.red, cx - R * .4, cy - R * .5, cx + R * .6, cy + R * .6, { step: Math.max(8, R * .04), maxR: Math.max(3, R * .018), bounds: [cx - R * 1.6, cy - R * 1.3, R * 3.2, R * 2.4], alpha: .5 });
      inkStroke(() => { X.beginPath(); X.arc(cx - R * .55, cy - R * .45, R * .3, Math.PI * 1.05, Math.PI * 1.45); }, 'rgba(255,255,255,.85)', R * .06);
      withT(cx, cy + R * .05, 0, R / 400, () => { rtext('i love you', -40, 20, { font: FONT.uiB(84), color: PAL.paperHi, align: 'center', op: 'source-over' }); C_smiley(215, -8, 44); });
    } else {
      const pk = clamp((t - tP) / .1);
      X.fillStyle = PAL.paperHi; X.globalAlpha = 1 - pk * .6; X.fillRect(0, 0, W, H); X.globalAlpha = 1;
      for (let i = 0; i < 26; i++) {      // torn shreds of the bubble flying out
        const a = i / 26 * TAU + sjit(i, .2), d = 300 + easeOut(pk * 1.5) * (500 + hash(i) * 700), x = W / 2 + Math.cos(a) * d, y = 560 + Math.sin(a) * d * .8;
        withT(x, y, a + pk * 3 * (i % 2 ? 1 : -1), 1, () => cut(() => pathPoly([[-70, -30], [60 + sjit(i + 3, 20), -40], [80, 20], [-10 + sjit(i + 7, 30), 50], [-80, 20]]), { fill: i % 3 ? PAL.pink : PAL.red, lift: 10 }));
      }
      sparkBurst(W / 2, 560, t, tP, { n: 16, r: 700, size: 60, dur: .3, colors: [PAL.pink, PAL.yellow, PAL.red] });
    }
    X.restore();
  }
}, { seed: 25, inT: 'jolt' });
