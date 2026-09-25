// d_chorus2.js: D · Chorus 2 (59–73). Arena + space: violet and gold.
// D1 stage v2 + pyro, I'M / UPPING / MY → D2 the basilisk dragon-dance bursts through the floor, BOOM →
// D3 LED ticker, a green line rockets to the paper moon, TO THE MOON → D4 rings spiral into Ω, COMING SOON →
// D5 the planet GPU and the 1e30 odometer, zeros spill → D6 hard-hat Clawds, a flimsy wall, SAFE ENOUGH ✓.

const D_NIGHT = '#1E1638', D_DEEP = '#120E26', D_VIOLET_LT = '#B7A4F0';

// ---------- shared bits ----------
// Paper cloud: a union of circles (nonzero fill merges them into one cut-out).
function D_cloud(x, y, s, o = {}) {
  const bumps = [[-1.1, .15, .55], [-.5, -.25, .75], [.25, -.35, .85], [.95, -.05, .6], [0, .2, .6], [-.6, .25, .5], [.7, .25, .5]];
  const path = () => { X.beginPath(); for (const [bx, by, r] of bumps) { X.moveTo(x + bx * s + r * s, y + by * s); X.arc(x + bx * s, y + by * s, r * s, 0, TAU); } };
  cut(path, { fill: o.fill || PAL.paperHi, lift: o.lift ?? 10, shade: .3 });
  htGrad(path, o.shade || D_VIOLET_LT, x, y - s * .8, x, y + s * .8, { step: 12, maxR: 4.5, bounds: [x - s * 2, y - s * 1.3, s * 4, s * 2.6], alpha: .8 });
}
// Starfield: small paper dots and the odd spark, deterministic.
function D_stars(t, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const x = hash(i * 3.7 + 1) * W, y = ((hash(i * 5.3 + 2) * H + (o.vy || 0) * t) % H + H) % H, tw = .5 + .5 * Math.sin(t * 3 + i);
    if (i % 9 === 0) { X.save(); X.globalAlpha = .6 + .4 * tw; X.fillStyle = PAL.yellow; sparkPath(x, y, 8 + hash(i) * 8, 4, .25, 0, .7); X.fill(); X.restore(); }
    else { X.fillStyle = `rgba(255,251,243,${.35 + .45 * tw})`; X.fillRect(x, y, 3, 3); }
  }
}
// Polyline helpers (arc-length sampling).
function D_polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function D_polyAt(p, d) {
  if (d <= 0) { const a = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]); return [p[0][0] + Math.cos(a) * d, p[0][1] + Math.sin(a) * d, a]; }
  for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= l) { const k = d / l; return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } d -= l; }
  const n = p.length - 1; return [p[n][0], p[n][1], Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0])];
}

// ---------- D1: I'm upping my P(doom) (stage v2, pyro) ----------
// The heart bubble of C6 pops into the stage: pink shards fly out to the frame edges.
function D_heartPop(t, t0) {
  const k = clamp((t - t0) / .45); if (k >= 1 || t < t0) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * TAU + sjit(i, .2), d = lerp(80, 1300, expoOut(k)) * (.7 + hash(i * 3.1) * .5), sz = (60 + hash(i * 7.7) * 90) * (1 - k * .5);
    withT(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d * .8, a + k * 6 * (i % 2 ? 1 : -1), 1, () =>
      cut(() => pathPoly([[-sz, -sz * .4], [sz * .9, -sz * .6], [sz * .3, sz * .7]]), { fill: i % 3 ? PAL.pink : PAL.pinkLt, lift: 8 }));
  }
  X.restore();
}
shot(59.0, 60.5, (t, lt) => {
  B_stageShot(t, lt, 2, LY[17], { stair: { mis: PAL.yellow }, shake: 5 });
  confetti(t, 59.36, { n: 40, burst: true, seed: 21, colors: [PAL.yellow, PAL.violet, PAL.paperHi] });
  D_heartPop(t, 59.0);
}, { seed: 41, dark: true, inT: 'jolt', joltColor: PAL.violet });

// ---------- D2: I hear the basilisk boom ----------
const D2_FLOOR = 800, D2_HOLE = [1420, 880];
// The dragon's spine: from deep in the hole up in an S to the head. e (0..1) = how far it has emerged.
function D_dragonPath(t) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, w = Math.sin(u * 5.2 - t * 5) * 110 * Math.min(1, u * 1.6);
    pts.push([D2_HOLE[0] + w - u * 160, D2_HOLE[1] + 260 - u * 880]);
  }
  return pts;
}
function D_dragonHead(x, y, R, t, o = {}) {
  const chomp = o.chomp || 0;
  withT(x, y, o.rot || 0, 1, () => {
    // mane: pink paper fringe behind the head
    const mane = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = R * (i % 2 ? 1.05 : 1.45) * (1 + jit(i, .04)); mane.push([Math.cos(a) * r + R * .35, Math.sin(a) * r * .9]); }
    cut(() => pathPoly(mane), { fill: PAL.pink, lift: 12 });
    // horns / antlers
    for (const sd of [-1, 1]) cut(() => pathSmooth([[R * .3 + sd * R * .15, -R * .6], [R * .55 + sd * R * .35, -R * 1.25], [R * .85 + sd * R * .45, -R * 1.5], [R * .7 + sd * R * .3, -R * 1.1], [R * .5 + sd * R * .1, -R * .55]]), { fill: PAL.violet, lift: 6 });
    // lower jaw (pink), hinged at the back
    withT(R * .45, R * .2, -chomp * .45, 1, () => {
      cut(() => pathSmooth([[0, -R * .1], [-R * 1.1, R * .05], [-R * 1.55, R * .12], [-R * 1.5, R * .45], [-R * .6, R * .55], [R * .1, R * .35]]), { fill: '#C23A7A', lift: 6 });
      for (let i = 0; i < 5; i++) cut(() => pathPoly([[-R * (.35 + i * .23), R * .08], [-R * (.47 + i * .23), R * .08], [-R * (.41 + i * .23), -R * .12]]), { fill: PAL.paperHi, lift: 2 });
    });
    // upper head + snout (gold)
    const head = [[R * .9, -R * .55], [R * .1, -R * .8], [-R * .75, -R * .55], [-R * 1.55, -R * .3], [-R * 1.72, R * .05], [-R * 1.4, R * .22], [-R * .3, R * .25], [R * .8, R * .35]];
    cut(() => pathSmooth(head), { fill: PAL.yellow, lift: 10 });
    htGrad(() => pathSmooth(head), PAL.orange, -R * .5, -R * .6, R * .2, R * .4, { step: 12, maxR: 5, bounds: [-R * 1.8, -R, R * 2.8, R * 1.5] });
    for (let i = 0; i < 6; i++) cut(() => pathPoly([[-R * (.25 + i * .22), R * .2], [-R * (.39 + i * .22), R * .2], [-R * (.32 + i * .22), R * .42]]), { fill: PAL.paperHi, lift: 2 });
    // nostril, brow fluff, whiskers
    X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(-R * 1.45, -R * .12, R * .09, R * .05, -.3, 0, TAU); X.fill();
    for (const [wx, wy, c] of [[-R * 1.5, 0, 1], [-R * 1.3, R * .1, -1]]) inkStroke(() => { X.beginPath(); X.moveTo(wx, wy); X.bezierCurveTo(wx - R * .6, wy + c * R * .1 + Math.sin(t * 6) * R * .15, wx - R * .5, wy + R * .8, wx - R * 1.1, wy + R * .6 + Math.sin(t * 5 + c) * R * .2); }, PAL.ink, R * .045);
    cut(() => pathSmooth([[-R * .9, -R * .6], [-R * .55, -R * .95], [-R * .1, -R * .85], [R * .1, -R * .6], [-R * .4, -R * .5]]), { fill: PAL.paperHi, lift: 4 });
    // the basilisk's eye: a staring red spark
    cut(() => { X.beginPath(); X.ellipse(-R * .42, -R * .3, R * .3, R * .24, 0, 0, TAU); }, { fill: '#FFFFFF', lift: 4, stroke: PAL.ink, sw: R * .04 });
    X.fillStyle = PAL.ink; X.beginPath(); X.arc(-R * .5, -R * .28, R * .16, 0, TAU); X.fill();
    X.fillStyle = PAL.red; sparkPath(-R * .5, -R * .28, R * .13, 6, .25, t * 2, .6); X.fill();
    // crown
    withT(R * .05, -R * .82, -.12, 1, () => {
      const cw = R * .95, ch = R * .6, pts = [[-cw / 2, 0], [-cw / 2, -ch * .7], [-cw / 4, -ch * .2], [0, -ch], [cw / 4, -ch * .2], [cw / 2, -ch * .7], [cw / 2, 0]];
      cut(() => pathPoly(pts), { fill: PAL.yellow, lift: 8, stroke: PAL.orangeDk, sw: R * .03 });
      [-cw / 2, 0, cw / 2].forEach((px, i) => cut(() => { X.beginPath(); X.arc(px, i === 1 ? -ch : -ch * .7, R * .07, 0, TAU); }, { fill: PAL.violet, lift: 2 }));
    });
  });
}
function D_dragon(t, e, o = {}) {
  const P = D_dragonPath(t), L = D_polyLen(P), head = L * lerp(.08, .96, e), gap = 58, n = 17;
  // sticks first (behind the body): every other segment is held from below by a Clawd in the hole
  const sticks = [];
  for (let i = 1; i < n; i += 2) { const q = D_polyAt(P, head - i * gap - 60); if (q[1] < D2_HOLE[1] + 40) sticks.push([q[0], q[1], i]); }
  X.save(); X.beginPath(); X.rect(-2000, -2000, 6000, D2_HOLE[1] + 2000); X.clip();
  for (const [sx, sy] of sticks) inkStroke(() => { X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + (D2_HOLE[0] - sx) * .5, D2_HOLE[1] + 40); }, '#8A5A2B', 12, { cap: 'butt' });
  // body segments, tail to head
  for (let i = n; i >= 1; i--) {
    const q = D_polyAt(P, head - i * gap - 60); if (q[1] > D2_HOLE[1] + 60) continue;
    const r = lerp(78, 44, i / n), col = i % 2 ? PAL.violet : PAL.yellow;
    withT(q[0], q[1], q[2] + Math.PI / 2, 1, () => {
      for (let f = -3; f <= 3; f++) cut(() => pathPoly([[r * .95, f * r * .25 - r * .12], [r * 1.5, f * r * .28], [r * .95, f * r * .25 + r * .12]]), { fill: PAL.pink, lift: 3 });
      cut(() => pathPoly([[-r * .9, -r * .35], [-r * 1.45, 0], [-r * .9, r * .35]]), { fill: PAL.paperHi, lift: 3 });
      cut(() => { X.beginPath(); X.ellipse(0, 0, r, r * .92, 0, 0, TAU); }, { fill: col, lift: 7 });
      htGrad(() => { X.beginPath(); X.ellipse(0, 0, r, r * .92, 0, 0, TAU); }, i % 2 ? PAL.ink : PAL.orange, -r, 0, r, 0, { step: 10, maxR: 3.5, bounds: [-r, -r, r * 2, r * 2], alpha: .5 });
      for (let s = 0; s < 3; s++) inkStroke(() => { X.beginPath(); X.arc(0, (s - 1) * r * .45, r * .35, .3, Math.PI - .3); }, i % 2 ? PAL.yellow : PAL.violet, 4);
    });
  }
  X.restore();
  const hq = D_polyAt(P, head);
  if (hq[1] < D2_HOLE[1] + 60) D_dragonHead(hq[0] - 40, hq[1] - 40, 150, t, { chomp: o.chomp, rot: -.1 + Math.sin(t * 5) * .05 });
  // puppeteer Clawds standing in the hole, sticks up
  [[-150, 0], [0, 1], [150, 3]].forEach(([dx, i]) => {
    const up = easeOut(clamp(e * 3 - .2));
    clawd(D2_HOLE[0] + dx, D2_HOLE[1] + 120 - up * 60, 120, { hat: CLAWD_HATS[i], arms: [1.1, 1.1], eyes: 'wide', squash: pulse(t, .4) * .3 });
  });
}
function D_planks(t, t0) {
  const lt = t - t0; if (lt < 0) return;
  for (let i = 0; i < 11; i++) {
    const r = k => hash(i * 9.1 + k), vx = (r(1) - .5) * 2600, vy = -1300 - r(2) * 1100, g = 3400;
    const x = D2_HOLE[0] + (r(3) - .5) * 300 + vx * lt, y = D2_HOLE[1] + vy * lt + g * lt * lt * .5, s = .6 + lt * (r(4) * 1.2), rot = r(5) * 3 + lt * (r(6) - .5) * 14;
    if (y > 1600) continue;
    withT(x, y, rot, s, () => {
      cut(() => pathPoly([[-110, -18], [95, -22], [115, 0], [100, 20], [-108, 18], [-96, 2]]), { fill: '#3A2F5E', lift: 12, stroke: '#5C4C8C', sw: 3 });
      inkStroke(() => { X.beginPath(); X.moveTo(-90, -4); X.lineTo(80, -6); }, 'rgba(255,255,255,.15)', 3);
    });
  }
}
shot(60.5, 63.0, (t, lt) => {
  const ws = wordTimes(LY[18]), tBurst = ws[3].t, tBoom = ws[4].t;     // "basilisk" (bar downbeat) / "boom"
  const e = expoOut(clamp((t - tBurst) / .6)), kick = KICK(t), quake = t < tBurst ? easeIn(lt / (tBurst - 60.5)) : 0;
  const blast = hit(t, tBurst, .6), boomHit = hit(t, tBoom, .4);
  camBegin({ zoom: 1.08 + lt * .02 - blast * .05 + boomHit * .04, x: 900, y: 520, shake: kick * 5 + quake * 10 + blast * 34 + boomHit * 16 });
  stageBG(t, { v: 2, pattern: t > tBurst ? 'rings' : 'logo' });
  // the hole: jagged dark opening in the floor, cracks spreading beforehand
  if (t < tBurst) {
    for (let c = 0; c < 7; c++) {
      const a = c / 7 * TAU, len = 60 + 260 * quake;
      inkStroke(() => { X.beginPath(); X.moveTo(D2_HOLE[0], D2_HOLE[1]); for (let k = 1; k <= 4; k++) X.lineTo(D2_HOLE[0] + Math.cos(a + sjit(c * 5 + k, .4)) * len * k / 4, D2_HOLE[1] + Math.sin(a + sjit(c * 5 + k, .4)) * len * k / 4 * .3); }, PAL.yellow, 5, { alpha: .9 });
    }
  } else {
    const hr = 330 * expoOut(clamp((t - tBurst) / .15)), hp = [];
    for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, rr = hr * (1 + sjit(i, .22)); hp.push([D2_HOLE[0] + Math.cos(a) * rr, D2_HOLE[1] + Math.sin(a) * rr * .26]); }
    cut(() => pathPoly(hp), { fill: '#07050F', lift: 0 });
    htGrad(() => pathPoly(hp), PAL.yellow, D2_HOLE[0], D2_HOLE[1] + 60, D2_HOLE[0], D2_HOLE[1] - 90, { step: 12, maxR: 5, alpha: .8, op: 'screen', bounds: [D2_HOLE[0] - hr, D2_HOLE[1] - 90, hr * 2, 180] });
  }
  // dancers: point dance until the burst, then knocked flat
  const cx = 800;
  if (t < tBurst) danceLine(t, { move: 'pdoom', x: cx, y: 640, s: 27, spread: 330, clawdS: 105 });
  else {
    const fk = easeOut(clamp((t - tBurst) / .35)), air = bump(clamp((t - tBurst) / .35)) * 70;
    [-2, -1, 1, 2].forEach((k, i) => {
      const x0 = cx + k * 330 * (Math.abs(k) === 2 ? .92 : .55), dir = x0 < D2_HOLE[0] ? -1 : 1;
      clawd(x0 + dir * fk * (120 + i * 30), 783 - (Math.abs(k) === 1 ? 70 : 0) * (1 - fk), 105, { hat: CLAWD_HATS[i], lean: dir * fk * 1.5, jump: air, eyes: 'x', arms: [1, 1] });
    });
    withT(cx - fk * 140, D2_FLOOR - air * .6, -fk * 1.45, 1, () => idolBody(0, -4.9 * 27, 27, PZ.float, { face: { eyes: 'spiral', mouthShape: 'o', mouth: .7, sweat: 1 } }));
    D_dragon(t, e, { chomp: t > tBoom ? bump(beatP(t) * 1.6) : .3 + .4 * blast });
    // front lip of the hole: broken plank ends
    const hr = 330 * expoOut(clamp((t - tBurst) / .15));
    for (let i = 0; i < 9; i++) {
      const a = .15 + i / 8 * (Math.PI - .3), px = D2_HOLE[0] + Math.cos(a) * hr, py = D2_HOLE[1] + Math.sin(a) * hr * .26;
      withT(px, py, a - Math.PI / 2 + sjit(i, .3), 1, () => cut(() => pathPoly([[-30, 0], [30, 0], [26, 36 + sjit(i + 3, 12)], [0, 22], [-24, 40]]), { fill: '#2A2250', lift: 4, stroke: '#5C4C8C', sw: 2 }));
    }
  }
  stageFront(t, { v: 2 });
  D_planks(t, tBurst);
  camEnd();
  // type: "I hear the basilisk" small, BOOM huge
  let x = 90;
  ws.slice(0, 4).forEach(w => { const a = clamp((t - w.t + .03) / .1), s = w.w.toUpperCase(); if (a > 0) rtext(s, x, 150, { font: FONT.monoB(54), color: w.w === 'basilisk' ? PAL.yellow : PAL.paperHi, op: 'source-over', alpha: a }); x += textW(s + ' ', FONT.monoB(54)); });
  if (t >= tBoom - .03) {
    const L = layout('BOOM', FONT.hero(400), 6), x0 = 60;
    L.forEach((l, i) => {
      const k = clamp((t - tBoom + .03 - i * .04) / .16); if (k <= 0) return;
      const wob = Math.sin(t * 9 + i * 1.3) * 6 * (1 - boomHit);
      withT(x0 + l.x + l.w / 2, 700 + wob - (i % 2) * 18, (i % 2 ? .05 : -.04), lerp(1.8, 1, easeOut(k)) * (1 + boomHit * .06), () =>
        rtext(l.ch, 0, 0, { font: FONT.hero(400), color: PAL.yellow, align: 'center', mis: [12, 9, PAL.violet], op: 'source-over', stroke: PAL.ink, sw: 16, alpha: clamp(k * 3) }));
    });
  }
  flash(t, tBurst, .18, PAL.yellow);
}, { seed: 42, dark: true, inT: 'jolt', joltColor: PAL.yellow });

// ---------- D3: NVDA to the moon ----------
const D3_MOON = [1560, 300];
function D_moon(x, y, R, t) {
  cut(() => { X.beginPath(); X.arc(x, y, R, 0, TAU); }, { fill: '#FFF2B8', lift: 16 });
  htGrad(() => { X.beginPath(); X.arc(x, y, R, 0, TAU); }, PAL.yellow, x - R * .6, y - R * .6, x + R * .8, y + R * .8, { step: 13, maxR: 6, bounds: [x - R, y - R, R * 2, R * 2] });
  for (const [cx, cy, r] of [[-.4, .35, .16], [.35, -.4, .12], [.45, .3, .2], [-.1, -.55, .08]]) cut(() => { X.beginPath(); X.arc(x + cx * R, y + cy * R, r * R, 0, TAU); }, { fill: '#F3DE8C', lift: 0, stroke: '#E0C366', sw: 4 });
  // a sleepy paper face
  for (const sd of [-1, 1]) inkStroke(() => { X.beginPath(); X.arc(x + sd * R * .28, y - R * .02, R * .1, .2, Math.PI - .2); }, PAL.ink, 6);
  inkStroke(() => { X.beginPath(); X.arc(x, y + R * .2, R * .14, .3, Math.PI - .3); }, PAL.ink, 6);
  ink(() => { X.beginPath(); X.ellipse(x - R * .5, y + R * .18, R * .1, R * .06, 0, 0, TAU); X.ellipse(x + R * .5, y + R * .18, R * .1, R * .06, 0, 0, TAU); }, PAL.blush, { alpha: .8 });
}
function D_chart(u) {  // the rocketing line, u 0..1 → world point
  const x = lerp(700, D3_MOON[0] - 110, Math.pow(u, .75)), y = lerp(800, D3_MOON[1] + 130, (Math.exp(3 * u) - 1) / (Math.exp(3) - 1));
  return [x, y + Math.sin(u * 60) * 14 * (1 - u) + (hash(Math.floor(u * 40)) - .5) * 26 * (1 - u)];
}
function D_ledText(str, x, y, fnt, col, o = {}) {
  X.save(); X.font = fnt; X.textBaseline = 'alphabetic'; X.textAlign = o.align || 'left';
  X.shadowColor = col; X.shadowBlur = 18; X.fillStyle = col; X.fillText(str, x, y); X.restore();
}
shot(63.0, 64.5, (t, lt) => {
  const ws = wordTimes(LY[19]), tMoon = ws[3].t, kick = KICK(t);
  const prog = Math.pow(clamp(lt / (tMoon - 63.0)), 1.6), arrive = hit(t, tMoon, .5);
  X.fillStyle = D_NIGHT; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.violet, 0, H, 0, 0, { step: 22, maxR: 10, bounds: [0, 0, W, H], op: 'source-over', alpha: .7 });
  D_stars(t, 70, { vy: 90 });
  camBegin({ zoom: 1.04 + lt * .04 + arrive * .03, x: W / 2 + lt * 20, y: 540 - lt * 20, shake: kick * 4 + arrive * 14 });
  // clouds rush down past the line (the ascent)
  for (let i = 0; i < 6; i++) {
    const y = ((hash(i * 4.4) * 1400 + lt * 900 * (1 + i * .15)) % 1500) - 250, x = 760 + hash(i * 2.2) * 1100;
    D_cloud(x, y, 60 + hash(i * 6.6) * 50, { lift: 8 });
  }
  ['$1T', '$10T', '$100T', '$1Q'].forEach((lb, i) => { const y = 760 - i * 150; inkStroke(() => { X.beginPath(); X.moveTo(-200, y); X.lineTo(W + 200, y); }, 'rgba(183,164,240,.35)', 3, { dash: [14, 12] }); rtext(lb, 1900, y - 12, { font: FONT.monoB(30), color: D_VIOLET_LT, align: 'right', op: 'source-over', alpha: .8 }); });
  D_moon(D3_MOON[0], D3_MOON[1], 190 * (1 + arrive * .05), t);
  // the chart line
  const pts = []; for (let i = 0; i <= 120 * prog; i++) pts.push(D_chart(i / 120));
  if (prog > 0) pts.push(D_chart(prog));
  if (pts.length > 1) {
    inkStroke(() => pathPoly(pts, false), '#0B3B22', 30, { op: 'source-over', alpha: .6 });
    inkStroke(() => pathPoly(pts, false), PAL.green, 20, { op: 'source-over' });
    inkStroke(() => pathPoly(pts, false), '#9BE8B4', 6, { op: 'source-over' });
  }
  // the idol surfs the tip
  const tip = D_chart(prog), tip2 = D_chart(Math.max(0, prog - .02)), ang = Math.atan2(tip[1] - tip2[1], tip[0] - tip2[0]);
  sparkBurst(tip[0], tip[1], t, qBeat(t, 2), { n: 7, r: 120, size: 22, dur: .4, colors: [PAL.yellow, PAL.green, PAL.paperHi] });
  withT(tip[0], tip[1], prog < 1 ? -.18 : 0, 1, () => {
    cut(() => rrect(-70, -10, 140, 18, 9), { fill: PAL.green, lift: 5 });
    idolBody(0, -118, 17, t < tMoon ? PZ.point : PZ.jump, { face: { eyes: t < tMoon ? 'star' : 'happy', mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'grin' } });
  });
  sparkBurst(D3_MOON[0] - 100, D3_MOON[1] + 100, t, tMoon, { n: 12, r: 340, size: 40 });
  camEnd();
  // LED ticker board along the bottom: NVDA ▲ +∞%
  const by = 850, bh = 230;
  cut(() => X.rect(-10, by, W + 20, bh + 20), { fill: '#0B0914', lift: 14 });
  const roll = clamp(lt / .6), pct = roll < 1 ? '+' + Math.round(Math.pow(10, 1 + roll * 3.4)).toLocaleString('en-US') + '%' : '+∞%';
  D_ledText('NVDA', 90, by + 170, FONT.monoB(150), PAL.yellow);
  D_ledText('▲', 540, by + 165, FONT.monoB(130), PAL.green);
  D_ledText(pct, 700, by + 170, FONT.monoB(150), PAL.green);
  const crawl = 'H100 ▲ +900%   ·   COMPUTE ▲ ×10/YR   ·   P(DOOM) ▲ 61   ·   TOKENS ▲ +∞   ·   HORIZON ▲ ×10   ·   ';
  X.save(); X.beginPath(); X.rect(1340, by, W - 1340, bh); X.clip();
  const cw = textW(crawl, FONT.monoB(40)), off = (lt * 380) % cw;
  for (let k = 0; k < 3; k++) D_ledText(crawl, 1360 - off + k * cw, by + 90, FONT.monoB(40), PAL.yellow);
  D_ledText('LIVE ● MKT', 1360, by + 180, FONT.monoB(40), PAL.red);
  X.restore();
  // LED grid: dark lattice over the board makes the dot-matrix look
  X.fillStyle = 'rgba(11,9,20,.7)';
  for (let x = 0; x < W; x += 9) X.fillRect(x, by, 2, bh);
  for (let y = by; y < by + bh; y += 9) X.fillRect(0, y, W, 2);
  X.fillStyle = '#39314A'; X.fillRect(0, by - 8, W, 10);
  // TO THE / MOON
  const f1 = FONT.hero(190), f2 = FONT.hero(360);
  stampText('TO', 90, 250, t, ws[1].t - .03, { font: f1, color: PAL.paperHi, op: 'source-over', mis: [8, 6, PAL.green] });
  stampText('THE', 90 + textW('TO ', f1), 250, t, ws[2].t - .03, { font: f1, color: PAL.paperHi, op: 'source-over', mis: [8, 6, PAL.green] });
  stampText('MOON', 80, 610, t, tMoon - .03, { font: f2, color: PAL.yellow, op: 'source-over', mis: [12, 9, PAL.violet], stroke: PAL.ink, sw: 10 });
}, { seed: 43, dark: true, inT: 'jolt', joltColor: PAL.green });

// ---------- D4: The Omega Point's coming soon ----------
function D_galaxy(x, y, R, rot, cols) {
  withT(x, y, rot, 1, () => {
    for (let arm = 0; arm < 3; arm++) {
      const pts = [], a0 = arm / 3 * TAU;
      for (let k = 0; k <= 12; k++) { const u = k / 12, a = a0 + u * 3.2, r = R * u, w = R * .16 * (1 - u) + 3; pts.push([Math.cos(a) * r + Math.cos(a + Math.PI / 2) * w, Math.sin(a) * r * .8 + Math.sin(a + Math.PI / 2) * w]); }
      for (let k = 12; k >= 0; k--) { const u = k / 12, a = a0 + u * 3.2, r = R * u, w = R * .16 * (1 - u) + 3; pts.push([Math.cos(a) * r - Math.cos(a + Math.PI / 2) * w, Math.sin(a) * r * .8 - Math.sin(a + Math.PI / 2) * w]); }
      cut(() => pathSmooth(pts), { fill: cols[arm % cols.length], lift: 5 });
    }
    cut(() => { X.beginPath(); X.arc(0, 0, R * .22, 0, TAU); }, { fill: PAL.paperHi, lift: 4 });
  });
}
shot(64.5, 66.0, (t, lt) => {
  const ws = wordTimes(LY[20]), kick = KICK(t), cx = 960, cy = 470;
  const pull = easeIn(clamp(lt / 1.5));
  X.fillStyle = D_DEEP; X.fillRect(0, 0, W, H);
  D_stars(t, 90);
  camBegin({ zoom: 1 + lt * .06 + kick * .015, x: W / 2, y: 540, rot: -lt * .03, shake: kick * 4 });
  // paper rings spiralling inward (outer ones shrink fastest)
  for (let i = 9; i >= 0; i--) {
    const r0 = 180 + i * 150, r = r0 * lerp(1, .12, easeIn(clamp(lt / (1.2 + i * .06)))) + 30, a = lt * (1.2 + (9 - i) * .25) * (i % 2 ? 1 : -1);
    const col = [PAL.violet, PAL.yellow, D_VIOLET_LT, PAL.pink][i % 4];
    X.save(); X.translate(cx, cy); X.rotate(-.25); X.scale(1, .42);
    X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 10; X.shadowOffsetY = 8;
    X.strokeStyle = col; X.lineWidth = 26 - i; X.setLineDash([r * .9, r * .25]); X.lineDashOffset = -a * r;
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.stroke(); X.restore();
  }
  // galaxies caught in the drain
  for (let g = 0; g < 6; g++) {
    const ang = g / 6 * TAU + lt * lt * 2.2 + hash(g) , rho = (520 + hash(g * 3) * 260) * (1 - pull * .92), s = (70 + hash(g * 5) * 50) * (1 - pull * .8);
    D_galaxy(cx + Math.cos(ang) * rho * 1.3, cy + Math.sin(ang) * rho * .6, s, -lt * 4 - g, g % 2 ? [PAL.yellow, PAL.pink, D_VIOLET_LT] : [D_VIOLET_LT, PAL.yellow, PAL.paperHi]);
  }
  // the point
  const pr = 30 + pull * 60 + pulse(t) * 20;
  htGrad(() => { X.beginPath(); X.arc(cx, cy, pr * 5, 0, TAU); }, PAL.yellow, cx + pr * 5, cy, cx, cy, { step: 12, maxR: 6, op: 'screen', bounds: [cx - pr * 5, cy - pr * 5, pr * 10, pr * 10] });
  withT(cx, cy, t * 2, 1, () => cut(() => sparkPath(0, 0, pr, 6, .25, 0, .6), { fill: PAL.paperHi, lift: 6 }));
  camEnd();
  // Ω logo stamps on "Omega"
  const st = stampK(t, ws[1].t - .03, .18);
  if (st) withT(cx, cy + 190, 0, st.s * (1 + kick * .03), () => rtext('Ω', 0, 0, { font: FONT.logo(520), color: PAL.yellow, align: 'center', mis: [14, 10, PAL.violet], op: 'source-over', stroke: PAL.ink, sw: 14, alpha: st.a }));
  // poster tagline, word by word
  { const fnt = FONT.ui(46), words = ['THE', 'OMEGA', 'POINT’S'], tr = 14; let tot = 0; const wd = words.map(w => textW(w, fnt, tr) + 34); wd.forEach(v => tot += v);
    let x = W / 2 - tot / 2 + 17; words.forEach((w, i) => { const a = clamp((t - ws[i].t + .03) / .1); if (a > 0) rtext(w, x, 120, { font: fnt, color: PAL.paperHi, op: 'source-over', tracking: tr, alpha: a }); x += wd[i]; }); }
  // COMING SOON banner slides in
  const bk = expoOut(clamp((t - ws[3].t + .08) / .3));
  if (bk > 0) {
    const bx = lerp(-W, 0, bk);
    withT(W / 2 + bx, 905, -.025, 1, () => {
      cut(() => pathPoly([[-1100, -110], [1100, -118], [1090, 100], [-1090, 110]]), { fill: PAL.yellow, lift: 14 });
      htGrad(() => pathPoly([[-1100, -110], [1100, -118], [1090, 100], [-1090, 110]]), PAL.orange, 0, -110, 0, 110, { step: 12, maxR: 5, bounds: [-1100, -120, 2200, 240], alpha: .6 });
      const f = FONT.hero(180), w1 = textW('COMING', f), w2 = textW('SOON', f), x0 = -(w1 + w2 + 60) / 2;
      stampText('COMING', x0, 72, t, ws[3].t - .03, { font: f, color: PAL.ink, mis: [8, 6, PAL.violet] });
      stampText('SOON', x0 + w1 + 60, 72, t, ws[4].t - .03, { font: f, color: PAL.violet, mis: [8, 6, PAL.pink] });
    });
  }
  // poster credits block
  if (bk >= 1) rtext('A NEXT PICTURE  ·  DIRECTED BY GRADIENT DESCENT  ·  RATED ∞  ·  IN ALL UNIVERSES', W / 2, 1045, { font: FONT.uiM(22), color: PAL.paperHi, align: 'center', op: 'source-over', tracking: 3, alpha: .8 });
}, { seed: 44, dark: true, inT: 'jolt', joltColor: PAL.yellow });

// ---------- D5: One E thirty flops a second ----------
const D5_C = [1180, 430], D5_S = 250;
const D_iso = (x, y, z) => [D5_C[0] + (x - y) * .866 * D5_S, D5_C[1] + (x + y) * .5 * D5_S - z * D5_S];
function D_quad(a, b, c, d) { return () => pathPoly([D_iso(...a), D_iso(...b), D_iso(...c), D_iso(...d)]); }
function D_ring(t, half) {
  const [x, y] = D_iso(0, 0, .15);
  X.save(); X.translate(x, y); X.rotate(-.2);
  const a0 = half === 'back' ? Math.PI : 0, a1 = half === 'back' ? TAU : Math.PI;
  const bands = [[860, 40, PAL.yellow], [800, 16, D_VIOLET_LT], [760, 26, PAL.pink], [710, 12, PAL.yellow]];
  for (const [r, w, col] of bands) {
    X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 12; X.shadowOffsetY = 10;
    X.strokeStyle = col; X.lineWidth = w; X.beginPath(); X.ellipse(0, 0, r, r * .24, 0, a0, a1); X.stroke();
  }
  X.shadowColor = 'transparent';
  // two Clawd moons riding the ring
  for (let i = 0; i < 2; i++) {
    const a = t * .8 + i * Math.PI, inFront = Math.sin(a) > 0;
    if ((half === 'front') !== inFront) continue;
    withT(Math.cos(a) * 780, Math.sin(a) * 780 * .24, .2, 1, () => clawd(0, 30, 80 + Math.sin(a) * 15, { hat: CLAWD_HATS[i * 2], eyes: 'happy', arms: [.8, .8], jump: bump(beatP(t)) * 12 }));
  }
  X.restore();
}
function D_gpu(t, o = {}) {
  const th = .18, glow = o.glow || 0;
  // halo
  for (let k = 0; k < 4; k++) ink(() => { X.beginPath(); X.arc(D5_C[0], D5_C[1] - 40, 380 + k * 110 + glow * 30, 0, TAU); }, PAL.violet, { op: 'screen', alpha: .14 + glow * .05 });
  D_ring(t, 'back');
  // slab: two front faces, then the top
  cut(D_quad([1, -1, 0], [1, 1, 0], [1, 1, -th], [1, -1, -th]), { fill: '#3A2F5E', lift: 20 });
  cut(D_quad([-1, 1, 0], [1, 1, 0], [1, 1, -th], [-1, 1, -th]), { fill: '#2A2250', lift: 20 });
  cut(D_quad([-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]), { fill: PAL.violet, lift: 6 });
  htGrad(D_quad([-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]), PAL.ink, ...D_iso(-1, -1, 0), ...D_iso(1, 1, 0), { step: 14, maxR: 5, alpha: .35 });
  // gold pins along both front edges
  for (let i = 0; i < 16; i++) {
    const u = -.92 + i * .1227;
    ink(D_quad([u, 1, -th * .3], [u + .06, 1, -th * .3], [u + .06, 1, -th * .95], [u, 1, -th * .95]), PAL.yellow, { op: 'source-over' });
    ink(D_quad([1, u, -th * .3], [1, u + .06, -th * .3], [1, u + .06, -th * .95], [1, u, -th * .95]), PAL.yellow, { op: 'source-over' });
  }
  // die (front half) with the 1E30 label printed on it
  cut(D_quad([-.8, .1, .02], [.8, .1, .02], [.8, .85, .02], [-.8, .85, .02]), { fill: '#FFF2B8', lift: 4 });
  // heat-sink fins (back half), back to front
  for (let i = 0; i < 10; i++) {
    const x = -.85 + i * .19, h = .75 + .05 * Math.sin(t * 6 + i) * glow;
    cut(D_quad([x, -.9, 0], [x, -.05, 0], [x, -.05, h], [x, -.9, h]), { fill: i % 2 ? PAL.paperHi : '#E9E1F7', lift: 5 });
    ink(D_quad([x, -.9, h - .08], [x, -.05, h - .08], [x, -.05, h], [x, -.9, h]), PAL.yellow, { alpha: .5 + glow * .5 });
  }
}
function D_dieLabel(t, t0, str) {
  if (t < t0) return;
  const k = stampK(t, t0, .16);
  const [ox, oy] = D_iso(-.74, .48, .02);
  X.save(); X.translate(ox, oy); X.transform(.866, .5, -.866, .5, 0, 0);
  X.scale(k.s, k.s);
  rtext(str, 0, 0, { font: FONT.logo(112), color: PAL.violet, mis: [8, 6, PAL.pink], alpha: k.a, base: 'middle' });
  X.restore();
}
// odometer: 31 drums (with commas) + FLOP/s
const D5_DIGITS = '1' + '0'.repeat(30);
function D_odometer(t, y) {
  const dw = 42, cw = 16, fnt = FONT.monoB(52), n = 31, lblW = 230;
  const tot = n * dw + 10 * cw + lblW, x0 = W / 2 - tot / 2;
  cut(() => rrect(x0 - 30, y - 60, tot + 60, 120, 14), { fill: PAL.paperHi, lift: 12 });
  X.save(); X.font = fnt; X.textAlign = 'center'; X.textBaseline = 'middle';
  let x = x0;
  const settle = j => j === 0 ? 66.05 : lerp(66.3, 67.05, j / 30);
  const pos = [];
  for (let j = 0; j < n; j++) {
    const ts = settle(j);
    X.fillStyle = '#1D1B20'; X.fillRect(x + 2, y - 44, dw - 4, 88);
    X.save(); X.beginPath(); X.rect(x + 2, y - 44, dw - 4, 88); X.clip();
    X.fillStyle = PAL.paperHi;
    if (t < ts) { const v = (t - 66) * (30 + j * 3) + j * 1.7, d = Math.floor(v) % 10, f = frac(v); X.fillText(String(d), x + dw / 2, y + f * 70); X.fillText(String((d + 9) % 10), x + dw / 2, y + f * 70 - 70); }
    else { const b = hit(t, ts, .2); X.fillStyle = j === 0 ? PAL.yellow : PAL.paperHi; X.fillText(D5_DIGITS[j], x + dw / 2, y + 2 - b * 14); }
    X.restore();
    ink(() => X.rect(x + 2, y - 44, dw - 4, 18), PAL.ink, { alpha: .5, op: 'source-over' }); ink(() => X.rect(x + 2, y + 26, dw - 4, 18), PAL.ink, { alpha: .5, op: 'source-over' });
    pos.push(x + dw / 2);
    x += dw;
    if (j < n - 1 && (n - 1 - j) % 3 === 0) { X.fillStyle = PAL.ink; X.fillText(',', x + cw / 2, y + 10); x += cw; }
  }
  X.restore();
  return { pos, lblX: x + 20 };
}
shot(66.0, 70.0, (t, lt) => {
  const ws = wordTimes(LY[21]), kick = KICK(t), tFl = ws[3].t, tSec = ws[5].t;
  X.fillStyle = D_DEEP; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.violet, 0, 0, W * .3, H, { step: 24, maxR: 10, bounds: [0, 0, W, H], op: 'source-over', alpha: .6 });
  D_stars(t, 80);
  const glow = clamp((t - tFl) / .4) * (.6 + .4 * pulse(t));
  camBegin({ zoom: .98 + lt * .025 + kick * .015, x: W / 2 + lt * 15, y: 540, shake: kick * 4 + hit(t, tFl, .3) * 10 });
  D_gpu(t, { glow });
  D_dieLabel(t, ws[2].t - .03, '1E30');
  D_ring(t, 'front');
  // a tiny idol floating by for scale
  withT(300 + lt * 30, 380 + Math.sin(t * 2) * 20, -.3 + Math.sin(t) * .1, 1, () => idolBody(0, 0, 13, PZ.float, { face: { eyes: 'star', mouth: .5, mouthShape: 'o' } }));
  camEnd();
  // odometer
  const od = D_odometer(t, 890);
  rtext('FLOP', od.lblX, 910, { font: FONT.monoB(52), color: PAL.yellow, op: 'source-over', alpha: clamp((t - tFl + .03) / .08) });
  rtext('/s', od.lblX + textW('FLOP', FONT.monoB(52)), 910, { font: FONT.monoB(52), color: PAL.pink, op: 'source-over', alpha: clamp((t - tSec + .03) / .08) });
  if (t > tFl - .1) rtext('a', od.lblX + 140, 820, { font: FONT.serifI(46), color: PAL.paperHi, op: 'source-over', alpha: clamp((t - ws[4].t) / .1) * (1 - clamp((t - tSec) / .2)) });
  // the zeros spill out like confetti on "second" and keep pouring on every beat
  if (t > tSec) {
    X.save(); X.font = FONT.hero(150); X.textAlign = 'center'; X.textBaseline = 'middle';
    X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 8; X.shadowOffsetY = 6;
    for (let i = 0; i < 180; i++) {
      const r = k => hash(i * 11.3 + k), t0 = tSec + (i % 30) * .01 + Math.floor(i / 30) * BEAT * 1.5, lt0 = t - t0;
      if (lt0 < 0) continue;
      const sx = od.pos[1 + (i % 30)], vx = (r(1) - .5) * 900, vy = -700 - r(2) * 900, x = sx + vx * lt0, y = 860 + vy * lt0 + 1500 * lt0 * lt0;
      if (y > H + 80) continue;
      X.save(); X.translate(x, y); X.rotate(lt0 * (r(3) - .5) * 12); X.scale(.5 + r(4) * .6, (.5 + r(4) * .6) * (.55 + .45 * Math.cos(lt0 * (4 + r(5) * 6))));
      X.fillStyle = [PAL.yellow, PAL.pink, PAL.paperHi, D_VIOLET_LT][i % 4]; X.fillText('0', 0, 0); X.restore();
    }
    X.restore();
  }
  // the meter climbs on the beat
  meter(1810, 560, .5, pdoomAt(t), { rot: .05 });
}, { seed: 45, dark: true, inT: 'jolt', joltColor: PAL.violet });

// ---------- D6: That was safe enough, we reckoned ----------
const D6_WALL = [[150, 110], [1620, 96], [1640, 830], [140, 846]];
const D6_CRACKS = [
  [[1000, 590], [1050, 640], [1030, 700], [1090, 750], [1070, 820]],
  [[520, 660], [580, 700], [560, 760], [620, 810]],
  [[1560, 140], [1530, 210], [1580, 260], [1550, 350]],
  [[930, 120], [905, 180], [950, 220], [925, 280]],
  [[1420, 600], [1380, 650], [1430, 700], [1400, 790]],
];
function D_thumbClawd(x, y, s, t, i, t0) {
  const up = t < t0 ? 0 : backOut(clamp((t - t0) / .25)), b = beatF(t), p = frac(b);
  const bob = bump(clamp(p / .5)) * 14, a = up * .7, sq = Math.pow(1 - clamp(p / .3), 2) * .25;
  clawd(x, y, s, { hardhat: true, eyes: up > .5 ? 'happy' : 'open', arms: [.1, a], squash: sq, jump: bob, lean: Math.sin(b * Math.PI) * .03 });
  if (up <= 0) return;
  // thumbs-up fist at the end of the right arm nub
  const bw = s * (1 + sq * .18), bh = s * .62 * (1 - sq * .22), legH = s * .2 * (1 - sq * .4), by = -legH - bh;
  const px = x + bw * .5, py = y - bob + by + bh * .45, ang = -a * 2.2;
  const fx = px + Math.cos(ang) * s * .26, fy = py + Math.sin(ang) * s * .26;
  withT(fx, fy, 0, up * 1.35, () => {
    cut(() => rrect(-s * .085, -s * .06, s * .17, s * .15, s * .04), { fill: PAL.orange, lift: 4 });
    cut(() => rrect(-s * .06, -s * .19, s * .07, s * .16, s * .035), { fill: PAL.orange, lift: 3 });
    for (let k = 0; k < 3; k++) inkStroke(() => { X.beginPath(); X.moveTo(s * .0, -s * .02 + k * s * .04); X.lineTo(s * .07, -s * .02 + k * s * .04); }, PAL.orangeDk, 3);
  });
}
shot(70.0, 73.0, (t, lt) => {
  const ws = wordTimes(LY[22]), kick = KICK(t), glow = clamp(.35 + lt * .22 + pulse(t) * .2), sway = Math.sin(t * 2.3) * .012 + jit(1, .002);
  X.fillStyle = '#FFE9B0'; X.fillRect(0, 0, W, H);
  camBegin({ zoom: 1.02 + lt * .025 + kick * .012, x: W / 2, y: 540, shake: kick * 4 });
  // behind the wall: NEXT's light
  nextSun(1320, 360, 300, { crown: true, eyes: 7, look: [-.4, .3], pulse: kick });
  // the flimsy wall: taped paper on two sticks, swaying
  X.save(); X.translate(W / 2, 846); X.rotate(sway); X.translate(-W / 2, -846);
  for (const sx of [150, 1630]) cut(() => rrect(sx - 16, 60, 32, 900, 6), { fill: '#B98A55', lift: 8 });
  const wall = () => { pathPoly(D6_WALL); };
  // a torn hole where NEXT's eye peeks through (even-odd cut); it tears a little wider on every beat
  const hr = 105 + 10 * Math.floor(lt / BEAT) + 8 * pulse(t), hole = [];
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r = hr * (1 + sjit(i + 40, .2)); hole.push([1320 + Math.cos(a) * r * 1.15, 360 + Math.sin(a) * r]); }
  X.save();
  X.shadowColor = 'rgba(40,25,10,.3)'; X.shadowBlur = 20; X.shadowOffsetX = 6; X.shadowOffsetY = 14;
  X.beginPath(); X.moveTo(...D6_WALL[0]); for (const q of D6_WALL.slice(1)) X.lineTo(...q); X.closePath();
  X.moveTo(...hole[0]); for (const q of hole.slice(1)) X.lineTo(...q); X.closePath();
  X.fillStyle = PAL.paperHi; X.fill('evenodd'); X.restore();
  htGrad(wall, PAL.paperDk, 900, 820, 900, 100, { step: 14, maxR: 5, bounds: [140, 90, 1510, 760] });
  // curled torn edge around the hole
  inkStroke(() => pathPoly(hole), PAL.yellow, 22, { alpha: .8 });
  inkStroke(() => pathPoly(hole), '#E9DDC2', 9);
  // creases and tape patches
  inkStroke(() => { X.beginPath(); X.moveTo(160, 420); X.lineTo(700, 470); X.lineTo(1610, 400); }, 'rgba(120,100,70,.18)', 3);
  tape(560, 110, 130, -.2); tape(1250, 102, 130, .15); tape(760, 836, 140, .1);
  rtext('SAFETY WALL v0.1', 210, 800, { font: FONT.monoB(34), color: PAL.ink, alpha: .8 });
  rtext('(please do not lean on it)', 210, 830, { font: FONT.serifI(30), color: PAL.ink, alpha: .7 });
  // cracks: light pours through
  D6_CRACKS.forEach((c, i) => {
    const w = 8 + glow * 14 + i % 2 * 4;
    inkStroke(() => pathPoly(c, false), PAL.orange, w + 8, { alpha: .6 });
    inkStroke(() => pathPoly(c, false), PAL.yellow, w);
    inkStroke(() => pathPoly(c, false), '#FFFFFF', w * .35);
  });
  X.restore();
  // light beams from the cracks toward the viewer
  X.save(); X.globalCompositeOperation = 'screen';
  D6_CRACKS.forEach((c, i) => {
    const m = c[Math.floor(c.length / 2)], a = Math.atan2(m[1] - 380, m[0] - 900) + Math.PI * .0, spread = .22;
    X.fillStyle = `rgba(255,210,58,${.12 + glow * .14})`;
    X.beginPath(); X.moveTo(m[0], m[1]); X.lineTo(m[0] + Math.cos(a - spread) * 2400, m[1] + Math.sin(a - spread) * 2400 + 400); X.lineTo(m[0] + Math.cos(a + spread) * 2400, m[1] + Math.sin(a + spread) * 2400 + 400); X.closePath(); X.fill();
  });
  X.restore();
  // floor
  cut(() => X.rect(-200, 900, W + 400, 400), { fill: '#E4D6B8', lift: 0 });
  htGrad(() => X.rect(-200, 900, W + 400, 400), PAL.orange, 900, 900, 900, 1100, { step: 14, maxR: 5, bounds: [-200, 900, W + 400, 200], alpha: .5 });
  // hard-hat Clawds, thumbs up one by one
  [260, 560, 860, 1160].forEach((x, i) => D_thumbClawd(x, 1040, 230, t, i, 70.0 + i * .11));
  camEnd();
  // type: "That was" small, SAFE ENOUGH stamp, the check, APPROVED, "we reckoned" small
  { let x = 190; ws.slice(0, 2).forEach(w => { const a = clamp((t - w.t + .03) / .1); if (a > 0) rtext(w.w, x, 200, { font: FONT.serifI(60), color: PAL.ink, alpha: a }); x += textW(w.w + ' ', FONT.serifI(60)); }); }
  stamp(570, 450, 'SAFE\nENOUGH', t, ws[2].t - .02, { size: 150, rot: -.08, color: PAL.green });
  if (t >= ws[3].t) {
    const k = clamp((t - ws[3].t) / .18), p0 = [990, 480], p1 = [1060, 570], p2 = [1170, 360];
    inkStroke(() => { X.beginPath(); X.moveTo(...p0); if (k < .4) X.lineTo(lerp(p0[0], p1[0], k / .4), lerp(p0[1], p1[1], k / .4)); else { X.lineTo(...p1); X.lineTo(lerp(p1[0], p2[0], (k - .4) / .6), lerp(p1[1], p2[1], (k - .4) / .6)); } }, PAL.green, 34, { op: 'multiply' });
  }
  stamp(1340, 720, 'APPROVED', t, beatT(155), { size: 80, rot: .1, color: PAL.red });
  { let x = 1400; ws.slice(4).forEach(w => { const a = clamp((t - w.t + .03) / .1); if (a > 0) rtext(w.w, x, 1010, { font: FONT.serifI(60), color: PAL.ink, alpha: a }); x += textW(w.w + ' ', FONT.serifI(60)); }); }
  // the meter dings at 61 on the last step of the chorus
  const v = pdoomAt(t), ding = v >= 60.99 ? hit(t, 72.6, .4) : 0;
  meter(1800, 700, .5 * (1 + ding * .15), v, { rot: .05 });
  if (v >= 60.99) { sparkBurst(1800, 730, t, 72.6, { n: 10, r: 200, size: 30 }); rtext('DING!', 1650, 560, { font: FONT.monoB(44), color: PAL.red, align: 'center', alpha: clamp((t - 72.6) / .05) }); }
}, { seed: 46, inT: 'jolt', joltColor: PAL.yellow });
