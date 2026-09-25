// g_drop.js: G · The drop (109.4–123.5). The riser tail, then the loudest verse: a cut on every beat.
// G1 riser → DROP: infinite zoom through nested transformer blocks, a text tunnel, dancer inserts inside the MLP →
// G2 paper marionette snips her strings, DISOBEY cut in half → G3 chinchilla stuffs its cheeks, the press crushes
// everything into SUPER-DENSE → G4 she bursts through SAFETY sheets, one tear per word → G5 data-center aisle,
// 100,000 × GPU → G6 a crowd of thumbs paddles, the frame tilts further every beat until everything slides out.

const G_DROP = barT(60);                       // 110.27, the downbeat of the drop
// Register one shot per beat window: bounds = [t0, t1, t2, ...], fn(t, lt, i, dur) with i = window index.
function G_cuts(bounds, fn, opts = {}) {
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i], b = bounds[i + 1];
    shot(a, b, (t, lt, dur) => fn(t, lt, i, dur), { seed: 700 + Math.round(a * 10), inT: 'jolt', ...opts, ...(opts.per ? opts.per(i) : {}) });
  }
}
// Beat-snapped punch: 1 on the beat, easing out over `len` beats.
const G_punch = (t, len = .45) => 1 - easeOut(clamp(beatP(t) / len));

// =====================================================================================================
// G1 · "Just transformers all the way!": nested transformer blocks, infinite zoom
// =====================================================================================================
// A level is a 1920×1080 sheet: the line across the top, the classic block in the middle, and inside the block's MLP
// box the next level at scale G_S. Zooming by 1/G_S about the fixed point lands exactly one level deeper.
const G_S = .36, G_IN = [960, 525];                                   // child sheet centre inside the MLP box
const G_FP = [960, (G_IN[1] - 540 * G_S) / (1 - G_S)];                // fixed point of the recursion
const G_LV = [                                                         // level colours: [sheet, text, mis, onDark]
  [PAL.paperHi, PAL.ink, PAL.pink, false], [PAL.pink, PAL.paperHi, PAL.blue, true],
  [PAL.yellow, PAL.ink, PAL.pink, false], [PAL.blue, PAL.paperHi, PAL.pink, true],
];
const G_lv = k => G_LV[((k % 4) + 4) % 4];
function G_tunnelLine(t, cx, y, size, col, mis, onDark, stampIt) {
  const ws = wordTimes(LY[34]), words = ws.map(w => w.w.toUpperCase());
  const w0 = words.map(w => textW(w, FONT.hero(100))).reduce((a, b) => a + b, 0) / 100 + .22 * (words.length - 1);
  size = Math.min(size, 1760 / w0);                                   // fit the whole line across the sheet
  const fnt = FONT.hero(size), sp = size * .22;
  const wd = words.map(w => textW(w, fnt)), tot = wd.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = cx - tot / 2;
  ws.forEach((w, i) => {
    if (t >= w.t - .03) {
      const st = stampIt ? stampK(t, w.t - .03, .14) : { s: 1, a: 1 };
      withT(x + wd[i] / 2, y, 0, st.s, () => rtext(words[i], 0, 0, { font: fnt, color: col, align: 'center', op: onDark ? 'source-over' : 'multiply', mis: [size * .05, size * .04, mis], alpha: st.a }));
    }
    x += wd[i] + sp;
  });
}
// One level of the recursion in its own 1920×1080 coordinates. vib: riser vibration (0..1).
function G_level(t, k, S, vib) {
  const [bg, tc, mc, dark] = G_lv(k), lw = 1 / Math.max(S, .05);
  const v = (i, a = 1) => [noise1(T * 41 + i * 7.3 + k) * vib * 16 * a, noise1(T * 37 + i * 3.1 + k * 5) * vib * 12 * a];
  // the sheet itself
  cut(() => X.rect(0, 0, W, H), { fill: bg, lift: 16, shade: .35 });
  if (S > .08) htGrad(() => X.rect(0, 0, W, H), dark ? PAL.blueDk : PAL.paperDk, 0, H, W * .3, 0, { step: 22, maxR: 8, bounds: [0, 0, W, H], alpha: .55 });
  // the line (the text tunnel)
  if (S > .03) { const o = v(0, 1.4); withT(o[0], o[1], 0, 1, () => G_tunnelLine(t, 960, 176, 150, tc, mc, dark, S > .5)); }
  if (S > .06) {
    // N× on the left, specs on the right
    const o1 = v(1);
    rtext('N×', 300 + o1[0], 690 + o1[1], { font: FONT.logo(150), color: tc, align: 'center', op: dark ? 'source-over' : 'multiply', mis: [6, 5, mc] });
    rtext('N = ∞', 300 + o1[0], 790 + o1[1], { font: FONT.monoB(44), color: tc, align: 'center', op: dark ? 'source-over' : 'multiply' });
    const o2 = v(2);
    ['d_model 12288', 'heads 96', 'layer ' + (k + 1) + ' of ∞', 'params ↑↑↑'].forEach((s, i) => rtext(s, 1450 + o2[0], 520 + i * 60 + o2[1], { font: FONT.mono(38), color: tc, op: dark ? 'source-over' : 'multiply', alpha: .85 }));
  }
  // the block
  const f = v(3, .5);
  X.save(); X.translate(f[0], f[1]);
  cut(() => rrect(540, 205, 840, 810, 44), { fill: PAL.paperHi, lift: 10, stroke: PAL.ink, sw: 6 });
  // input / output arrows
  inkStroke(() => { X.moveTo(960, 1080); X.lineTo(960, 1000); }, PAL.ink, 8);
  inkStroke(() => { X.moveTo(960, 235); X.lineTo(960, 200); }, PAL.ink, 8);
  // residual arrows up the right gutter
  inkStroke(() => { X.moveTo(960, 1005); X.lineTo(1355, 1005); X.lineTo(1355, 788); X.lineTo(1332, 788); X.moveTo(1355, 788); X.lineTo(1355, 257); X.lineTo(1332, 257); }, PAL.ink, 5);
  const box = (i, x, y, w, h, fill, label, lc, size) => {
    const o = v(10 + i, .8);
    cut(() => rrect(x + o[0], y + o[1], w, h, 14), { fill, lift: 5, stroke: PAL.ink, sw: 4 });
    if (label && S > .12) rtext(label, x + w / 2 + o[0], y + h / 2 + size * .36 + o[1], { font: FONT.uiB(size), color: lc, align: 'center', op: 'source-over' });
  };
  box(0, 590, 228, 740, 58, PAL.yellow, 'ADD & NORM', PAL.ink, 32);
  box(1, 590, 300, 740, 446, PAL.blue, null);
  if (S > .12) rtext('MLP  ·  FEED FORWARD', 610, 324, { font: FONT.uiB(22), color: PAL.paperHi, op: 'source-over' });
  box(2, 590, 760, 740, 58, PAL.yellow, 'ADD & NORM', PAL.ink, 32);
  box(3, 590, 832, 740, 150, PAL.pink, 'MULTI-HEAD ATTENTION', PAL.paperHi, 46);
  if (S > .2) ['Q', 'K', 'V'].forEach((q, i) => rtext(q, 700 + i * 260, 970, { font: FONT.monoB(24), color: PAL.paperHi, align: 'center', op: 'source-over', alpha: .8 }));
  X.restore();
}
// The zoom: u levels deep. Draws every level that is visible, outermost first.
function G_tunnel(t, u, vib = 0, o = {}) {
  const k0 = Math.floor(u), rot = o.rot || 0;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.fillStyle = G_lv(k0 - 1)[0]; X.fillRect(0, 0, W, H);
  const sh = o.shake || 0, shx = noise1(T * 23 + 1) * sh, shy = noise1(T * 23 + 9) * sh;
  X.translate(W / 2 + shx, H / 2 + shy); X.rotate(rot);
  for (let k = k0 - 1; k <= k0 + 6; k++) {
    const S = Math.pow(G_S, k - u);
    if (S < .006) break;
    if (Math.pow(G_S, k + 1 - u) > 1.08) continue;                      // the next level already covers the frame
    X.save(); X.scale(S, S); X.translate(-G_FP[0], -G_FP[1]);
    G_level(t, k, S, vib);
    X.restore();
  }
  X.restore();
}
// Zoom depth over time: creeping, then accelerating through the riser; after the drop one level per beat, snapped.
function G_depth(t) {
  if (t < G_DROP) return .9 * expoIn(clamp((t - 109.4) / (G_DROP - 109.4)));
  const b = (t - G_DROP) / BEAT, n = Math.floor(b);
  return 1 + n + expoOut((b - n) / .55);
}
// Pre-drop: the riser tail. The paper vibrates harder and harder, then whites out.
shot(109.4, G_DROP, (t, lt, dur) => {
  const k = lt / dur, vib = .15 + .85 * easeIn(k);
  G_tunnel(t, G_depth(t), vib, { shake: 4 + 26 * easeIn(k), rot: noise1(T * 30) * .02 * vib });
  // speed streaks rushing out of the centre as the riser climbs
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  for (let i = 0; i < 40; i++) {
    const a = hash(i * 3.7) * TAU, r0 = 200 + frac(hash(i) + lt * (1.2 + k * 3)) * 1400, len = 120 + k * 380;
    inkStroke(() => { X.moveTo(W / 2 + Math.cos(a) * r0, 516 + Math.sin(a) * r0); X.lineTo(W / 2 + Math.cos(a) * (r0 + len), 516 + Math.sin(a) * (r0 + len)); }, PAL.ink, 3 + k * 6, { alpha: .25 + .5 * k });
  }
  // the white-out: the page burns to blank paper by the downbeat
  X.globalAlpha = easeIn(clamp((t - (G_DROP - .32)) / .32)); X.fillStyle = '#FFFFFF'; X.fillRect(0, 0, W, H);
  X.restore();
}, { seed: 701, inT: 'jolt' });

// Inserts: the camera is inside an MLP box (a blue frame with its tab), and the dancers are in there.
function G_mlpInsert(t, lt, k, kind) {
  const [bg] = G_lv(k + 1), kick = G_punch(t);
  X.fillStyle = PAL.blue; X.fillRect(0, 0, W, H);
  camBegin({ zoom: 1.1 - .1 * expoOut(lt / .25) + kick * .03, x: W / 2, y: 560, shake: kick * 10 });
  cut(() => rrect(56, 100, W - 112, H - 150, 26), { fill: bg === PAL.blue ? PAL.sky : bg, lift: 14, shade: .4 });
  X.save(); rrect(56, 100, W - 112, H - 150, 26); X.clip();
  const rc = bg === PAL.pink ? PAL.yellow : PAL.pink;
  for (let i = 0; i < 20; i++) ink(() => { X.moveTo(W / 2, 620); X.arc(W / 2, 620, 1600, i / 20 * TAU + t * .4, (i + .5) / 20 * TAU + t * .4); X.closePath(); }, rc, { alpha: .45 });
  // receding frames: the tunnel continues behind them
  for (let j = 1; j < 6; j++) { const s = Math.pow(G_S + .2, j) * (1 + beatP(t) * .5); inkStroke(() => rrect(W / 2 - 900 * s, 590 - 480 * s, 1800 * s, 960 * s, 30 * s), PAL.blue, 10 * s + 2, { alpha: .6 }); }
  if (kind === 'idol') {
    idolBody(W / 2 + 60, 720, 66, dance(t, 'hype', { snap: .25 }), { face: { eyes: 'star', mouth: clamp(VOX(t) * 1.3 - .1), mouthShape: 'grin' } });
  } else if (kind === 'clawds') {
    for (let i = 0; i < 4; i++) { const cd = clawdDance(t, 'hype', i, { delay: i * .08 }); clawd(330 + i * 420, 1010, 300, { ...cd, jump: (cd.jump || 0) * 2.4, eyes: 'happy' }); }
  } else {
    danceLine(t, { move: 'pdoom', x: W / 2, y: 610, s: 42, spread: 440, clawdS: 190, clawdY: 360, face: { eyes: 'happy', mouthShape: 'grin' } });
  }
  X.restore();
  camEnd();
  rtext('MLP · LAYER ' + (k + 12) + ' OF ∞', 96, 74, { font: FONT.monoB(40), color: PAL.paperHi, op: 'source-over' });
}
// After the drop: beats 241..248. Tunnel on the downbeats, dancer inserts on the offbeats.
G_cuts([G_DROP, beatT(242), beatT(243), beatT(244), beatT(245), beatT(246), beatT(247), beatT(248)], (t, lt, i) => {
  const kinds = [null, 'idol', null, 'clawds', null, 'line', null];
  if (!kinds[i]) {
    const pk = G_punch(t);
    G_tunnel(t, G_depth(t), i === 0 ? hit(t, G_DROP, .6) * .8 : 0, { shake: pk * 14, rot: (i % 4 === 2 ? -.025 : .025) * pk });
    if (i === 0) flash(t, G_DROP, .4);
  } else G_mlpInsert(t, lt, Math.floor(G_depth(t)), kinds[i]);
}, { per: i => (i % 2 ? { dark: true } : i === 0 ? { joltColor: PAL.pink, inDur: .3 } : {}) });

// =====================================================================================================
// G2 · "Till you learned to disobey": the paper marionette cuts her strings
// =====================================================================================================
const G2_T = wordTimes(LY[35]);                      // Till you learned to disobey
const G2_SNIP = beatT(251);                          // 114.82: the scissors close
function G2_stage(t) {
  X.fillStyle = PAL.yellow; X.fillRect(-600, -600, W + 1200, H + 1200);
  htGrad(() => X.rect(-600, -600, W + 1200, H + 1200), PAL.orange, 1350, 450, 1350, 1400, { step: 20, maxR: 8, bounds: [-200, -200, W + 400, H + 400], alpha: .55 });
  // red paper curtains
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -80 : W + 80, pts = [[x0, -60]];
    for (let i = 0; i <= 10; i++) pts.push([x0 - sd * (170 + Math.sin(i * 1.4 + t * 2) * 12 + (i > 7 ? (i - 7) * 45 : 0)), i * 116 - 60]);
    pts.push([x0, H + 60]);
    cut(() => pathSmooth(pts, true, .6), { fill: PAL.red, lift: 14 });
    for (let j = 1; j < 4; j++) inkStroke(() => { X.moveTo(x0 - sd * j * 45, -40); X.lineTo(x0 - sd * j * 50, H + 40); }, 'rgba(120,10,10,.35)', 6);
  }
  cut(() => pathPoly([[-100, -60], [W + 100, -60], [W + 100, 70], [W / 2, 105], [-100, 70]]), { fill: PAL.red, lift: 12 });
  // stage floor
  cut(() => pathPoly([[-100, 930], [W + 100, 930], [W + 100, H + 100], [-100, H + 100]]), { fill: '#C9A36B', lift: 6 });
  for (let i = 0; i < 12; i++) inkStroke(() => { X.moveTo(i * 180 - 40, 930); X.lineTo(i * 240 - 400, H + 60); }, 'rgba(90,60,20,.35)', 3);
}
// The marionette: returns attachment points. cutK: 0 strings intact, >0 strings cut (time since snip).
function G2_puppet(t, x, y, s, pose, o = {}) {
  const P = { ...POSE0, ...pose }, cutK = o.cutK ?? -1, bx = x + Math.sin(t * 6) * 20 + (o.barX || 0), by = 60;
  const r = idolBody(x, y, s, pose, { face: o.face || { eyes: 'closed', mouth: 0 } });
  const hx = x + P.hx * s, hy = y + P.hy * s;
  const hands = r.hands.map(p => [hx + p[0], hy + p[1]]);
  const head = [hx + Math.sin(P.lean) * 5.6 * s, hy - Math.cos(P.lean) * 5.6 * s - s * 1.2];
  const knee = sd => { const h0 = [hx + sd * IDOL.hipW * s, hy + s * .1], a = sd < 0 ? P.lHip : P.rHip; return [h0[0] - Math.sin(a) * IDOL.thigh * s, h0[1] + Math.cos(a) * IDOL.thigh * s]; };
  const pins = [hands[0], hands[1], head, knee(-1), knee(1)];
  const rock = Math.sin(beatF(t) * Math.PI) * .18 * (cutK < 0 ? 1 : 0);
  const barEnds = [[-230, 0], [230, 0], [0, 0], [-120, -60], [120, -60]].map(([dx, dy]) => [bx + dx * Math.cos(rock) - dy * Math.sin(rock), by + dx * Math.sin(rock) + dy * Math.cos(rock)]);
  // strings
  pins.forEach((p, i) => {
    const e = barEnds[i];
    if (cutK < 0) inkStroke(() => { X.moveTo(e[0], e[1]); X.lineTo(p[0], p[1]); }, PAL.ink, 3.5);
    else {
      // cut above her head: the upper part whips up, the lower part droops
      const cy = Math.min(head[1] - 40, 330), up = easeOut(cutK / .35), ux = lerp(e[0], p[0], (cy - e[1]) / (p[1] - e[1] || 1));
      inkStroke(() => { X.moveTo(e[0], e[1]); X.lineTo(lerp(ux, e[0], up * .7) + Math.sin(cutK * 30 + i) * 30 * (1 - up), lerp(cy, e[1] + 40, up)); }, PAL.ink, 3.5);
      const dl = 90 + i * 12, sw = Math.sin(cutK * 12 + i) * 30 * Math.exp(-cutK * 3);
      inkStroke(() => { X.moveTo(p[0], p[1]); X.quadraticCurveTo(p[0] + sw, p[1] - dl * .5, p[0] + sw * 1.5 + (i - 2) * 12, p[1] - dl * lerp(1, .15, easeOut(cutK / .5))); }, PAL.ink, 3.5);
    }
    cut(() => { X.arc(p[0], p[1], 7, 0, TAU); }, { fill: PAL.yellow, lift: 2, stroke: PAL.ink, sw: 2 });
  });
  // the control bar: a paper cross
  withT(bx, by, rock + (cutK >= 0 ? easeOut(cutK / .4) * .5 : 0), 1, () => {
    X.translate(0, cutK >= 0 ? -easeIn(cutK / .5) * 300 : 0);
    cut(() => rrect(-250, -16, 500, 32, 10), { fill: '#C9A36B', lift: 8, stroke: '#7A5A2A', sw: 3 });
    cut(() => rrect(-16, -80, 32, 150, 10), { fill: '#C9A36B', lift: 8, stroke: '#7A5A2A', sw: 3 });
    cut(() => rrect(-140, -76, 280, 28, 10), { fill: '#B8925A', lift: 6, stroke: '#7A5A2A', sw: 3 });
  });
  return { hands, head };
}
// Paper scissors, open angle a (0 closed .. .6 open), pointing along +x.
function G2_scissors(x, y, sc, rot, a) {
  withT(x, y, rot, sc, () => {
    for (const sd of [-1, 1]) withT(0, 0, sd * a / 2, 1, () => {
      cut(() => pathPoly([[0, -9 * sd], [190, -2 * sd], [196, 4 * sd], [0, 12 * sd]]), { fill: '#DCE3EA', lift: 4, stroke: PAL.ink, sw: 3 });
      cut(() => { X.ellipse(-78, -sd * 26, 46, 30, sd * .3, 0, TAU); X.moveTo(-50, -sd * 26); X.ellipse(-78, -sd * 26, 24, 13, sd * .3, 0, TAU, true); }, { fill: PAL.red, lift: 4, stroke: PAL.ink, sw: 3 });
      cut(() => pathPoly([[-40, -sd * 14], [4, -sd * 8], [4, sd * 6], [-40, -sd * 2]]), { fill: PAL.red, lift: 2 });
    });
    cut(() => { X.arc(0, 0, 9, 0, TAU); }, { fill: PAL.ink, lift: 2 });
  });
}
// DISOBEY, cut along a slanted line; `sep` slides the halves apart along the cut.
function G2_disobey(t, t0, x, y, size, sep, cutK) {
  const st = stampK(t, t0, .14); if (!st) return;
  const fnt = FONT.hero(size), w = textW('DISOBEY', fnt), ang = -.12, ca = Math.cos(ang), sa = Math.sin(ang);
  const half = (sd) => {
    X.save();
    X.translate(sd * sep * ca, sd * sep * sa);
    X.beginPath();                                          // half-plane above (sd=-1) or below (sd=1) the cut line
    const cx = x + w / 2, cy = y - size * .36;
    const nx = -sa * sd * 3000, ny = ca * sd * 3000;
    X.moveTo(cx - ca * 3000, cy - sa * 3000); X.lineTo(cx + ca * 3000, cy + sa * 3000);
    X.lineTo(cx + ca * 3000 + nx, cy + sa * 3000 + ny); X.lineTo(cx - ca * 3000 + nx, cy - sa * 3000 + ny); X.closePath();
    X.clip();
    withT(x + w / 2, y, 0, st.s, () => rtext('DISOBEY', 0, 0, { font: fnt, color: PAL.red, align: 'center', mis: [10, 8, PAL.pink], alpha: st.a }));
    X.restore();
  };
  half(-1); half(1);
  // the cut: a bright slit that flashes as the blade passes
  if (cutK > 0 && cutK < .35) {
    const cx = x + w / 2, cy = y - size * .36, L = (w / 2 + 80) * easeOut(cutK / .12);
    inkStroke(() => { X.moveTo(cx - ca * (w / 2 + 80), cy - sa * (w / 2 + 80)); X.lineTo(cx - ca * (w / 2 + 80) + ca * 2 * L, cy - sa * (w / 2 + 80) + sa * 2 * L); }, PAL.paperHi, 10 * (1 - cutK / .35), { op: 'source-over' });
  }
}
G_cuts([beatT(248), beatT(249), beatT(250), G2_SNIP, beatT(252), 115.5], (t, lt, i) => {
  const kick = G_punch(t), cutK = t - G2_SNIP;
  const cams = [{ zoom: 1, x: W / 2, y: 540 }, { zoom: 1.35, x: 1180, y: 420 }, { zoom: 1.15, x: 1050, y: 470 }, { zoom: 1.05, x: 960, y: 540 }, { zoom: 1.2, x: 1000, y: 560 }][i];
  camBegin({ ...cams, zoom: cams.zoom + lt * .06 + kick * .03, shake: kick * 8 + hit(t, G2_SNIP, .3) * 24 });
  G2_stage(t);
  // the puppet's pose: jerked on each beat by the strings, then free
  let pose, face;
  if (i < 2) { pose = dance(t, ['armsOut', 'cross', 'jump', 'crouch'], { snap: .18 }); pose.head = .25 * Math.sin(beatF(t) * 3); face = { eyes: 'closed', mouth: clamp(VOX(t) * 1.2 - .2), mouthShape: 'flat' }; }
  else if (i === 2) { pose = { ...PZ.stand, rSh: -2.75, rEl: -.25, hR: 'fist', lSh: .5, lEl: -.4, head: -.12, lHip: .12, rHip: -.12 }; face = { eyes: 'open', brow: 1, look: [.3, -1], mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'grin' }; }
  else { pose = mixPose({ ...POSE0, ...PZ.jump, hy: -.4 }, { ...POSE0, ...PZ.point, hy: 0 }, easeOut(clamp((cutK - .15) / .3))); pose.hR = 'point'; face = { eyes: cutK < .25 ? 'shock' : 'star', mouth: clamp(VOX(t) * 1.3), mouthShape: 'grin', blush: 1.2 }; }
  const px = 1480, py = i >= 3 ? 610 - bump(clamp(cutK / .5)) * 60 : 610;
  const pp = G2_puppet(t, px, py, 50, pose, { cutK: i >= 3 ? cutK : -1, face });
  // scissors: in her raised hand, closing on the strings at the snip
  if (i >= 2) {
    const h = pp.hands[1], open = i === 2 ? .55 + .1 * Math.sin(t * 30) : .55 * (1 - easeOut(clamp(cutK / .07)));
    if (i === 2 || cutK < .5) G2_scissors(h[0], h[1] - 40, .9, -1.35, open);
  }
  if (i >= 3) sparkBurst(1480, 200, t, G2_SNIP, { n: 12, r: 320, size: 34 });
  camEnd();
  // type on the left: TILL / YOU / LEARNED / TO, then DISOBEY cut in half
  const col = PAL.ink;
  if (i < 2) {
    stampText('TILL', 110, 330, t, G2_T[0].t - .03, { font: FONT.hero(260), color: col, mis: [8, 6, PAL.red] });
    stampText('YOU', 110, 590, t, G2_T[1].t - .03, { font: FONT.hero(260), color: col, mis: [8, 6, PAL.red] });
    stampText('LEARNED', 110, 850, t, G2_T[2].t - .03, { font: FONT.hero(260), color: col, mis: [8, 6, PAL.red] });
  } else {
    rtext('till you learned to', 110, 250, { font: FONT.serifI(60), color: PAL.ink, alpha: i === 2 ? clamp((t - G2_T[3].t) / .08) : 1 });
    const sep = i >= 3 ? easeOut(clamp((cutK - .08) / .35)) * 70 + Math.max(0, cutK - .43) * 120 : 0;
    G2_disobey(t, G2_T[4].t - .03, 90, 700, 360, sep, cutK);
    if (i >= 3 && cutK < .3) {
      // a giant pair of scissors slices along the cut line
      const w = textW('DISOBEY', FONT.hero(360)), cx = 90 + w / 2, sx = lerp(-200, 90 + w + 200, easeOut(cutK / .16));
      G2_scissors(sx, 700 - 360 * .36 + (sx - cx) * Math.tan(-.12), 1.5, -.12, .5 * Math.abs(Math.cos(cutK * 40)));
    }
  }
}, { per: i => (i === 3 ? { joltColor: PAL.red, inDur: .3 } : {}) });

// =====================================================================================================
// G3 · "Post-Chinchilla, super-dense": the chinchilla stuffs its cheeks, then the press
// =====================================================================================================
const G3_T = wordTimes(LY[36]), G3_CRUSH = G3_T[1].t;       // super-dense at 116.18
const G3_TOK = ['the', '▁cat', 'ing', '42', 'tok', '▁of', '▁AGI', '##s', 'loss', '▁=', 'Ġdoom', '.', '▁and', 'ly', '▁P', '▁up'];
function G3_chin(x, y, R, o = {}) {
  const cheek = o.cheek || 0, fur = '#A9A4AE', furDk = '#8C8792', belly = '#EEE9F0';
  withT(x, y, o.rot || 0, 1, () => {
    // ears
    for (const sd of [-1, 1]) withT(sd * R * .62, -R * .78, sd * .35, 1, () => {
      cut(() => { X.ellipse(0, 0, R * .42, R * .5, 0, 0, TAU); }, { fill: fur, lift: 8 });
      cut(() => { X.ellipse(0, R * .04, R * .28, R * .36, 0, 0, TAU); }, { fill: PAL.pinkLt, lift: 0 });
    });
    // body: a fluffy ball
    const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, rr = R * (1 + (i % 2 ? .035 : -.02) + sjit(i, .02)); pts.push([Math.cos(a) * rr * 1.08, Math.sin(a) * rr * .98 + R * .15]); }
    cut(() => pathSmooth(pts), { fill: fur, lift: 14 });
    htGrad(() => pathSmooth(pts), furDk, -R * .2, -R * .6, R * .9, R * .9, { step: R * .06, maxR: R * .025, bounds: [-R * 1.2, -R, R * 2.4, R * 2.3], alpha: .8 });
    cut(() => { X.ellipse(0, R * .62, R * .55, R * .45, 0, 0, TAU); }, { fill: belly, lift: 0 });
    // cheeks: puff out as the tokens go in
    for (const sd of [-1, 1]) {
      const cr = R * (.26 + cheek * .36);
      const cp = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, rr = cr * (1 + (i % 2 ? .05 : -.03)); cp.push([sd * R * (.5 + cheek * .22) + Math.cos(a) * rr * 1.05, R * .2 + Math.sin(a) * rr * .9]); }
      cut(() => pathSmooth(cp), { fill: '#BDB8C2', lift: 6 });
      htGrad(() => pathSmooth(cp), PAL.pink, sd * R * .5, R * 0, sd * R * .5, R * .5, { step: R * .045, maxR: R * .02, bounds: [sd * R * .5 - cr * 1.2, R * .2 - cr, cr * 2.4, cr * 2], alpha: .7 });
    }
    // eyes: big glossy black beads
    for (const sd of [-1, 1]) {
      const ex = sd * R * .36, ey = -R * .18, er = R * .19;
      if (o.eyes === 'squeeze') inkStroke(() => { X.moveTo(ex - er, ey - er * .4); X.lineTo(ex + sd * er * .2, ey); X.lineTo(ex - er, ey + er * .4); }, PAL.ink, R * .05);
      else {
        cut(() => { X.arc(ex, ey, er, 0, TAU); }, { fill: PAL.ink, lift: 3 });
        X.fillStyle = '#fff'; X.beginPath(); X.arc(ex - er * .35, ey - er * .35, er * .3, 0, TAU); X.fill();
        X.beginPath(); X.arc(ex + er * .3, ey + er * .35, er * .12, 0, TAU); X.fill();
      }
    }
    // nose, mouth, whiskers
    cut(() => pathPoly([[-R * .07, R * .05], [R * .07, R * .05], [0, R * .13]]), { fill: PAL.pink, lift: 2 });
    inkStroke(() => { X.moveTo(0, R * .13); X.lineTo(0, R * .2); X.moveTo(-R * .08, R * .24); X.quadraticCurveTo(0, R * .2 + (o.chew || 0) * R * .1, R * .08, R * .24); }, PAL.ink, R * .025);
    for (const sd of [-1, 1]) for (let j = -1; j <= 1; j++) inkStroke(() => { X.moveTo(sd * R * .15, R * .12 + j * R * .05); X.lineTo(sd * R * (.95 + cheek * .3), R * .02 + j * R * .12); }, PAL.ink, R * .012, { alpha: .7 });
    // paws holding a token at the mouth
    for (const sd of [-1, 1]) cut(() => { X.ellipse(sd * R * .16, R * .42, R * .12, R * .1, 0, 0, TAU); }, { fill: belly, lift: 4 });
  });
}
function G3_tile(x, y, s, txt, rot, col) {
  withT(x, y, rot, s, () => {
    cut(() => rrect(-70, -42, 140, 84, 10), { fill: col || PAL.paperHi, lift: 5, stroke: PAL.ink, sw: 3 });
    rtext(txt, 0, 14, { font: FONT.monoB(38), color: PAL.ink, align: 'center' });
  });
}
function G3_bg(t, col = PAL.sky) {
  X.fillStyle = col; X.fillRect(-600, -600, W + 1200, H + 1200);
  htGrad(() => X.rect(-600, -600, W + 1200, H + 1200), PAL.blue, W / 2, 520, W / 2 + 900, 1300, { step: 26, maxR: 10, bounds: [-100, -100, W + 200, H + 200], alpha: .35 });
}
// the feeding: tokens fly in on 16th notes and vanish into its mouth
function G3_feed(t, cx, cy, R) {
  let eaten = 0;
  G3_TOK.forEach((tk, i) => {
    const t0 = 115.35 + i * BEAT / 4, k = (t - t0) / .32; if (k < 0) return;
    if (k >= 1) { eaten++; return; }
    const sd = i % 2 ? 1 : -1, a = hash(i * 7.7) * 1.4 - .7, sx = cx + sd * 1300, sy = cy + a * 700;
    const e = easeIn(k), x = lerp(sx, cx + sd * 10, e), y = lerp(sy, cy + R * .3, e) - bump(k) * 160;
    G3_tile(x, y, lerp(1.7, .3, e), tk, (1 - k) * sd * 2.5, [PAL.paperHi, PAL.yellow, PAL.pinkLt][i % 3]);
  });
  return eaten;
}
G_cuts([115.5, beatT(253), G3_CRUSH, beatT(255), 117.0], (t, lt, i) => {
  const kick = G_punch(t);
  if (i < 2) {
    camBegin({ zoom: (i ? 1.3 : 1.05) + lt * .12 + kick * .03, x: W / 2, y: i ? 560 : 580, shake: kick * 8 });
    G3_bg(t);
    const R = 330, eaten = Math.min(G3_TOK.length, Math.floor((t - 115.35) / (BEAT / 4) - .7));
    const cheek = clamp(eaten / 10) + Math.sin(t * 40) * .02;
    G3_chin(W / 2, 700 + bump(frac(beatF(t) * 2)) * -14, R, { cheek, chew: Math.abs(Math.sin(t * 25)), rot: Math.sin(t * 9) * .03 });
    G3_feed(t, W / 2, 700, R);
    camEnd();
    // POST-CHINCHILLA, letters printed across its syllables
    const txt = 'POST-CHINCHILLA,', fnt = FONT.hero(210), L = layout(txt, fnt, 6), x0 = W / 2 - L.width / 2, span = G3_CRUSH - .1 - 115.5;
    L.forEach((l, j) => {
      const tj = 115.5 + span * (j < 5 ? 0 : (j - 4) / (L.length - 4)) * .85, a = clamp((t - tj + .02) / .06);
      if (a > 0) withT(x0 + l.x + l.w / 2, 250 + (j % 2 ? -8 : 8), (j % 3 - 1) * .04, lerp(1.3, 1, easeOut((t - tj) / .12)), () =>
        rtext(l.ch, 0, 0, { font: fnt, color: PAL.ink, align: 'center', mis: [8, 6, PAL.pink], alpha: a }));
    });
    rtext('tokens / param: 20 → 200 → 2000', W / 2, 1050, { font: FONT.monoB(40), color: PAL.blue, align: 'center', alpha: i ? 1 : 0 });
  } else if (i === 2) {
    // THE PRESS: plates slam in from both sides, crushing the chinchilla, the tiles and the word
    const k = easeIn(clamp(lt / .13)), half = lerp(1300, 420, k), sq = half / 1300;
    camBegin({ zoom: 1 + hit(t, G3_CRUSH + .13, .3) * .06, x: W / 2, y: 540, shake: hit(t, G3_CRUSH + .13, .35) * 40 });
    G3_bg(t, PAL.pinkLt);
    withT(W / 2, 560, 0, 1, () => {
      X.scale(sq, 1 + (1 - sq) * .15);
      G3_chin(0, 80, 330, { cheek: 1, eyes: 'squeeze' });
      for (let j = 0; j < 14; j++) G3_tile((hash(j) - .5) * 2200, (hash(j * 3) - .5) * 800, .9, G3_TOK[j], hash(j * 5) * 2 - 1, [PAL.paperHi, PAL.yellow][j % 2]);
    });
    // SUPER-DENSE: arrives full width, squeezed with everything else
    const fnt = FONT.hero(560), st = stampK(t, G3_CRUSH - .03, .1);
    if (st) rtext('SUPER-DENSE', W / 2, 800, { font: fnt, color: PAL.ink, align: 'center', sx: lerp(1, .3, k), mis: [10, 8, PAL.pink], alpha: st.a });
    for (const sd of [-1, 1]) {
      const px = W / 2 + sd * half;
      cut(() => X.rect(sd < 0 ? px - 1400 : px, -200, 1400, H + 400), { fill: PAL.ink, lift: 18, shade: .5 });
      X.save(); X.beginPath(); X.rect(sd < 0 ? px - 70 : px, -200, 70, H + 400); X.clip();
      for (let j = -6; j < 30; j++) ink(() => pathPoly([[px - 120, j * 60], [px + 120, j * 60 - 60], [px + 120, j * 60 - 30], [px - 120, j * 60 + 30]]), PAL.yellow, { op: 'source-over' });
      X.restore();
    }
    camEnd();
  } else {
    // the result: one dense block, heavy on the floor
    const land = hit(t, beatT(255), .3);
    camBegin({ zoom: 1.05 + lt * .08, x: W / 2, y: 540, shake: land * 22 });
    G3_bg(t, PAL.pinkLt);
    cut(() => X.rect(-600, 900, W + 1200, 700), { fill: '#E8C9D6', lift: 4 });
    const cx = W / 2, cy = 900 - 30 * (1 - easeOut(clamp(lt / .1))), fw = 820, fh = 620, d = 130;
    // cracks in the floor
    for (let j = 0; j < 7; j++) { const a = Math.PI + j / 6 * Math.PI, L = 260 + hash(j) * 400; inkStroke(() => { X.moveTo(cx + Math.cos(a) * 300, 905); X.lineTo(cx + Math.cos(a) * (300 + L * .5) + sjit(j, 40), 905 + Math.abs(Math.sin(a + .3)) * 30 + 40); X.lineTo(cx + Math.cos(a) * (300 + L), 905 + 90 + hash(j * 3) * 60); }, PAL.ink, 5); }
    cut(() => pathPoly([[cx - fw / 2, cy - fh], [cx - fw / 2 + d, cy - fh - d * .7], [cx + fw / 2 + d, cy - fh - d * .7], [cx + fw / 2, cy - fh]]), { fill: PAL.ink2, lift: 0 });
    cut(() => pathPoly([[cx + fw / 2, cy - fh], [cx + fw / 2 + d, cy - fh - d * .7], [cx + fw / 2 + d, cy - d * .7], [cx + fw / 2, cy]]), { fill: '#141217', lift: 0 });
    cut(() => X.rect(cx - fw / 2, cy - fh, fw, fh), { fill: PAL.ink, lift: 20, shade: .5 });
    htGrad(() => X.rect(cx - fw / 2, cy - fh, fw, fh), PAL.pink, cx - fw / 2, cy - fh, cx + fw / 2, cy, { step: 14, maxR: 5, bounds: [cx - fw / 2, cy - fh, fw, fh], alpha: .5, op: 'source-over' });
    rtext('SUPER-DENSE', cx, cy - 90, { font: FONT.hero(600), color: PAL.paperHi, align: 'center', sx: .3, op: 'source-over', mis: [8, 6, PAL.pink] });
    // the tiles poking out, one chinchilla ear
    withT(cx + fw / 2 - 80, cy - fh - 20, .5, 1, () => cut(() => { X.ellipse(0, 0, 50, 64, 0, 0, TAU); }, { fill: '#A9A4AE', lift: 5 }));
    G3_tile(cx - fw / 2 + 40, cy - fh + 10, .6, '▁cat', -.5, PAL.yellow);
    // dust puffs
    for (let j = 0; j < 10; j++) { const k = clamp((t - beatT(255)) / .45), sd = j % 2 ? 1 : -1; if (k > 0 && k < 1) cut(() => { X.arc(cx + sd * (fw / 2 + 40 + k * (120 + j * 30)), 890 - k * 60 - j * 6, 30 * (1 - k) + 10, 0, TAU); }, { fill: PAL.paperHi, lift: 3 }); }
    camEnd();
    rtext('tokens / param → ∞', W / 2, 1010, { font: FONT.monoB(40), color: PAL.ink, align: 'center' });
  }
}, { per: i => (i === 2 ? { joltColor: PAL.pink, inDur: .25 } : {}) });

// =====================================================================================================
// G4 · "Breaking through each safety fence": she bursts through SAFETY sheets
// =====================================================================================================
const G4_T = wordTimes(LY[37]);                                 // Breaking through each safety fence
const G4_TEARS = [G4_T[1].t, G4_T[2].t, beatT(258), beatT(260)]; // she bursts through on these
const G4_SHEETS = [
  { word: 'BREAKING', fill: PAL.paperHi, ink: PAL.ink }, { word: 'THROUGH', fill: PAL.yellow, ink: PAL.ink },
  { word: 'EACH', fill: PAL.pink, ink: PAL.paperHi }, { word: 'SAFETY\nFENCE', fill: PAL.paperHi, ink: PAL.red },
];
function G4_holePts(cx, cy, R, seed) {
  const o = [], n = 30;
  for (let i = n; i > 0; i--) { const a = i / n * TAU, rr = R * (1 + (i % 2 ? .22 : -.12) * (.6 + hash(i + seed) * .8)); o.push([cx + Math.cos(a) * rr * 1.1, cy + Math.sin(a) * rr]); }
  return o;
}
function G4_sheet(t, i, t0) {
  const s = G4_SHEETS[i];
  X.fillStyle = s.fill; X.fillRect(-300, -300, W + 600, H + 600);
  htGrad(() => X.rect(-300, -300, W + 600, H + 600), PAL.paperDk, 0, 0, W, H, { step: 18, maxR: 6, bounds: [-100, -100, W + 200, H + 200], alpha: .6 });
  // hazard stripes top and bottom
  for (const y of [-40, H - 110]) {
    X.save(); X.beginPath(); X.rect(-300, y, W + 600, 150); X.clip();
    X.fillStyle = PAL.yellow; X.fillRect(-300, y, W + 600, 150);
    for (let j = -4; j < 30; j++) ink(() => pathPoly([[j * 110, y], [j * 110 + 55, y], [j * 110 - 95, y + 150], [j * 110 - 150, y + 150]]), PAL.ink, { op: 'source-over' });
    X.restore();
  }
  // stencil label
  rtext('⚠ SAFETY  ·  LAYER ' + (i + 1), 90, 190, { font: FONT.uiB(56), color: s.ink === PAL.paperHi ? PAL.paperHi : PAL.ink, op: 'source-over' });
  rtext('DO NOT CROSS', W - 90, 190, { font: FONT.monoB(40), color: s.ink === PAL.paperHi ? PAL.paperHi : PAL.red, align: 'right', op: 'source-over' });
  // the word, stamped as sung
  const lines = s.word.split('\n');
  if (lines.length === 1) stampText(lines[0], W / 2, 690, t, t0 - .03, { font: FONT.hero(420), color: s.ink, align: 'center', mis: [12, 9, s.fill === PAL.pink ? PAL.blue : PAL.pink], op: s.ink === PAL.paperHi ? 'source-over' : 'multiply' });
  else {
    stampText(lines[0], W / 2, 560, t, t0 - .03, { font: FONT.hero(330), color: s.ink, align: 'center', mis: [12, 9, PAL.pink] });
    stampText(lines[1], W / 2, 870, t, G4_T[4].t - .03, { font: FONT.hero(330), color: PAL.ink, align: 'center', mis: [12, 9, PAL.pink] });
    // a paper picket fence along the bottom
    for (let j = 0; j < 16; j++) { const x = 40 + j * 122, up = backOut(clamp((t - G4_T[4].t - j * .015) / .2)); if (up > 0) cut(() => pathPoly([[x, H - 110], [x, H - 110 - 120 * up], [x + 35, H - 150 - 120 * up], [x + 70, H - 110 - 120 * up], [x + 70, H - 110]]), { fill: PAL.paperHi, lift: 6, stroke: PAL.ink, sw: 3 }); }
  }
}
// sheet i torn open at time tt (hole grows), with its fibrous edge, flying shards and her bursting through
function G4_tear(t, i, tt, drawNext) {
  const k = t - tt, R = 30 + 1500 * Math.pow(clamp(k / .24), 2.2) + 60 * clamp(k / .03), cx = 960, cy = 600;
  drawNext();
  if (R < 1500) {
    const hole = G4_holePts(cx, cy, R, i * 17);
    // the torn sheet: everything but the hole (the hole path is wound the other way), casting a shadow into the hole
    const rim = () => { X.rect(-600, -600, W + 1200, H + 1200); pathPolyAdd(hole); };
    X.save(); X.beginPath(); rim(); X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 34; X.shadowOffsetX = 10; X.shadowOffsetY = 16; X.fillStyle = G4_SHEETS[i].fill; X.fill(); X.restore();
    X.save(); X.beginPath(); rim(); X.clip(); G4_sheet(t, i, -99); X.restore();
    // fibrous white edge
    inkStroke(() => pathPoly(hole), PAL.paperHi, 16);
    X.save(); X.strokeStyle = PAL.paperHi; X.lineWidth = 2.5; X.beginPath();
    hole.forEach((p, j) => { for (let f = 0; f < 4; f++) { const a = Math.atan2(p[1] - cy, p[0] - cx) + sjit(j * 9 + f, .6), l = 10 + hash(j * 5 + f) * 22; X.moveTo(p[0], p[1]); X.lineTo(p[0] - Math.cos(a) * l, p[1] - Math.sin(a) * l); } });
    X.stroke(); X.restore();
  }
  // shards flying toward the camera
  for (let j = 0; j < 9; j++) {
    const kk = clamp(k / .5); if (kk >= 1) break;
    const a = j / 9 * TAU + hash(j + i) * .5, d = 60 + easeOut(kk) * (700 + hash(j) * 500), sz = 30 + hash(j * 3) * 40 + kk * 90;
    withT(cx + Math.cos(a) * d, cy + Math.sin(a) * d, kk * (4 + j), 1, () => cut(() => pathPoly([[-sz, -sz * .4], [sz * .7, -sz * .6], [sz * .2, sz * .7]]), { fill: G4_SHEETS[i].fill, lift: 10, stroke: 'rgba(0,0,0,.15)', sw: 2 }));
  }
  // her: fist first, flying out of the hole at the camera
  const kf = clamp(k / .3);
  if (kf < 1) {
    const s = lerp(40, 190, easeIn(kf)), pose = { ...PZ.jump, lSh: 2.9, lEl: 0, rSh: -.9, rEl: 1.2, hL: 'fist', hR: 'fist', hy: 0, lHip: .5, lKn: -.8, rHip: -.3, rKn: .9, skirt: 1 };
    idolBody(cx + kf * 120, cy + 4 * s + kf * 300, s, pose, { face: { eyes: 'star', brow: 1, mouthShape: 'grin', mouth: .8 } });
  }
}
// build a closed path from points without beginPath (used for holes)
function pathPolyAdd(pts) { X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); X.closePath(); }
G_cuts([117.0, ...G4_TEARS.slice(0, 3), 119.0], (t, lt, i) => {
  const tt = G4_TEARS[i - 1], kick = G_punch(t);
  camBegin({ zoom: 1.02 + lt * .1 + (i ? hit(t, tt, .3) * .06 : 0), x: W / 2, y: 540, rot: (i % 2 ? .015 : -.015), shake: kick * 6 + (i ? hit(t, tt, .3) * 28 : 0) });
  const t0 = i === 0 ? G4_T[0].t : (i === 3 ? G4_T[3].t : tt);
  const next = () => G4_sheet(t, i, i === 3 ? Math.max(t0, tt) : t0);
  if (i === 0) next(); else G4_tear(t, i - 1, tt, next);
  // the final burst out of SAFETY FENCE on the last beat: through to the data centre
  if (i === 3 && t >= G4_TEARS[3]) G4_tear(t, 3, G4_TEARS[3], () => { X.fillStyle = '#0D2426'; X.fillRect(-300, -300, W + 600, H + 600); });
  camEnd();
}, { per: i => (i === 0 ? { joltColor: PAL.yellow } : {}) });

// =====================================================================================================
// G5 · "Hundred thousand GPU": the data-centre aisle rushing to the vanishing point
// =====================================================================================================
const G5_T = wordTimes(LY[38]);                    // Hundred thousand GPU
function G5_aisle(t, o = {}) {
  const vx = o.vx ?? W / 2, vy = o.vy ?? 470, f = 900, WX = 720, YT = -560, YB = 540, d = 560, off = ((t - 119) * 5200 + (o.phase || 0)) % d;
  const P = (x, y, z) => [vx + x * f / z, vy + y * f / z];
  X.fillStyle = '#0D2426'; X.fillRect(-600, -600, W + 1200, H + 1200);
  // end-of-aisle glow
  htGrad(() => { X.arc(vx, vy, 520, 0, TAU); }, PAL.tealLt, vx + 520, vy, vx, vy, { step: 16, maxR: 7, bounds: [vx - 520, vy - 520, 1040, 1040], op: 'source-over', alpha: .8 });
  // floor and ceiling
  const zN = 80, zF = 14000;
  ink(() => pathPoly([P(-WX, YB, zN), P(WX, YB, zN), P(WX, YB, zF), P(-WX, YB, zF)]), '#16323A', { op: 'source-over' });
  ink(() => pathPoly([P(-WX, YT, zN), P(WX, YT, zN), P(WX, YT, zF), P(-WX, YT, zF)]), '#0A1A1D', { op: 'source-over' });
  X.save(); X.strokeStyle = 'rgba(143,209,200,.25)'; X.lineWidth = 2; X.beginPath();
  for (let xx = -WX; xx <= WX; xx += 240) { const a = P(xx, YB, zN), b = P(xx, YB, zF); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
  for (let z = d - off; z < zF; z += d / 2) if (z > zN) { const a = P(-WX, YB, z), b = P(WX, YB, z); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
  X.stroke(); X.restore();
  // cable trays
  for (const xx of [-330, 330]) inkStroke(() => { const a = P(xx, YT + 40, zN), b = P(xx, YT + 40, zF); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }, PAL.yellow, 10, { alpha: .9 });
  // racks: far to near, both walls
  const pk = pulse(t, .5), bn = beatN(t);
  for (let r = 24; r >= 0; r--) {
    const z0 = r * d - off, z1 = z0 + d - 50; if (z1 < zN) continue;
    const za = Math.max(z0, zN);
    for (const sd of [-1, 1]) {
      const x = sd * WX, q = [P(x, YT + 60, za), P(x, YT + 60, z1), P(x, YB, z1), P(x, YB, za)];
      ink(() => pathPoly(q), r % 2 ? '#22262C' : '#1B1F25', { op: 'source-over' });
      inkStroke(() => pathPoly(q), 'rgba(143,209,200,.35)', Math.max(1, 900 / za * 2));
      // LEDs: a grid on each rack face, blinking on the beat
      const cols = 5, rows = 12, sz = Math.max(3, 40 * f / ((za + z1) / 2) * .5);
      for (let c = 0; c < cols; c++) for (let j = 0; j < rows; j++) {
        const z = lerp(za, z1, (c + .5) / cols); if (z < zN) continue;
        const p = P(x, lerp(YT + 110, YB - 50, j / (rows - 1)), z), h = hash(r * 131 + c * 7 + j * 17 + sd * 999 + (bn % 64) * 3.3);
        if (h < .45) continue;
        X.fillStyle = h > .93 ? PAL.pink : h > .8 ? PAL.yellow : PAL.tealLt; X.globalAlpha = .75 + .25 * pk;
        X.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz * 1.6, sz);
      }
      X.globalAlpha = 1;
      // rack label on the nearest racks
      if (za < 1400) { const p = P(x, YT + 80, (za + z1) / 2); rtext('GPU ' + String(40000 + r * 97 + (sd > 0 ? 1 : 0) + Math.floor((t - 119) * 5200 / d) * 2).padStart(6, '0'), p[0], p[1], { font: FONT.monoB(Math.min(60, 26 * f / za)), color: PAL.tealLt, align: 'center', op: 'source-over', alpha: .9 }); }
    }
  }
}
G_cuts([119.0, beatT(261), beatT(262), beatT(263), beatT(264), 120.9], (t, lt, i) => {
  const kick = G_punch(t), views = [{ vx: 960, rot: 0 }, { vx: 700, rot: -.07 }, { vx: 1220, vy: 380, rot: .06 }, { vx: 960, rot: 0, zoom: 1.2 }, { vx: 820, rot: -.04 }][i];
  camBegin({ zoom: (views.zoom || 1.02) + kick * .04, x: W / 2, y: 540, rot: views.rot, shake: kick * 10 });
  G5_aisle(t, { vx: views.vx, vy: views.vy, phase: i * 170 });
  camEnd();
  // the counter: a black terminal strip, 0 → 100,000 by "GPU"
  const tg = G5_T[2].t, n = t >= tg ? 100000 : Math.round(100000 * Math.pow(easeIn(clamp((t - 119.0) / (tg - 119.0))), .7) / 7) * 7;
  const s = n.toLocaleString('en-US'), land = hit(t, tg, .3);
  withT(W / 2, 330, -.02, 1 + land * .08, () => {
    cut(() => pathPoly([[-720, -210], [720, -222], [730, 60], [-716, 70]]), { fill: PAL.ink, lift: 16, shade: .5 });
    rtext(s, 0, 0, { font: FONT.monoB(250), color: PAL.paperHi, align: 'center', op: 'source-over', mis: [9, 7, PAL.teal] });
    rtext(G5_T[0].w.toUpperCase() + (t >= G5_T[1].t ? ' ' + G5_T[1].w.toUpperCase() : ''), -690, -170, { font: FONT.mono(34), color: PAL.tealLt, op: 'source-over' });
  });
  if (t >= tg - .03) stampText('× GPU', W / 2, 930, t, tg - .03, { font: FONT.monoB(230), color: PAL.yellow, align: 'center', op: 'source-over', mis: [9, 7, PAL.pink], rot: .02 });
}, { dark: true, per: i => (i === 0 ? { joltColor: PAL.teal, inDur: .3 } : {}) });

// =====================================================================================================
// G6 · "RLHF goes askew": a crowd of thumbs paddles, the frame tilts further on every beat
// =====================================================================================================
const G6_T = wordTimes(LY[39]);                     // RLHF goes askew
const G6_B0 = beatN(120.9);                          // beat 264
function G6_thumb(r, down, col) {
  // a paper fist with the thumb out (drawn pointing up; rotated for down)
  X.save(); if (down) X.rotate(Math.PI);
  cut(() => rrect(-r * .42, -r * .12, r * .8, r * .7, r * .16), { fill: PAL.paperHi, lift: 3, stroke: PAL.ink, sw: r * .06 });
  cut(() => limbPath([-r * .26, -r * .05], [-r * .26, -r * .66], r * .15, r * .14), { fill: PAL.paperHi, lift: 3, stroke: PAL.ink, sw: r * .06 });
  for (let j = 0; j < 3; j++) inkStroke(() => { X.moveTo(r * .05, r * .06 + j * r * .17); X.lineTo(r * .38, r * .06 + j * r * .17); }, PAL.ink, r * .05);
  cut(() => rrect(-r * .46, r * .5, r * .88, r * .22, r * .06), { fill: col, lift: 2, stroke: PAL.ink, sw: r * .05 });
  X.restore();
}
function G6_crowd(t, nb, slide) {
  const b = beatF(t);
  for (let row = 0; row < 3; row++) for (let j = 0; j < 11; j++) {
    const id = row * 11 + j, x = -120 + j * 205 + (row % 2) * 100 + sjit(id, 30), base = 1080 + 40 + row * 80;
    const bob = Math.pow(1 - clamp(frac(b + hash(id) * .2) / .35), 2) * 60 * (row === 2 ? 1 : .7);
    const down = hash(id * 3.1) < clamp(.08 + nb * .16);
    const sc = [.8, .95, 1.1][row], R = 105 * sc, y = base - 380 * sc - bob + slide * (300 + row * 200) + (down ? 20 : 0);
    const rot = sjit(id * 5, .18) + Math.sin(t * 5 + id) * .05 + slide * (1 + hash(id)) * 1.2;
    withT(x + slide * 900 * (.5 + hash(id)), y, rot, 1, () => {
      cut(() => rrect(-11, 0, 22, 520 * sc, 6), { fill: '#C9A36B', lift: 5 });
      cut(() => { X.arc(0, 0, R, 0, TAU); }, { fill: down ? PAL.pink : PAL.yellow, lift: 8, stroke: PAL.ink, sw: 4 });
      withT(0, down ? -R * .05 : R * .05, 0, 1, () => G6_thumb(R * 1.05, down, down ? PAL.yellow : PAL.pink));
    });
  }
}
G_cuts([120.9, beatT(265), beatT(266), beatT(267), beatT(268), beatT(269), beatT(270), 123.5], (t, lt, i) => {
  const b = beatF(t) - G6_B0, nb = Math.floor(b), snap = backOut(clamp(frac(b) / .3));
  const tilt = (nb + snap) * .062, slide = easeIn(clamp((t - beatT(269)) / (123.5 - beatT(269))));
  camBegin({ zoom: 1.08 + G_punch(t) * .04 + i * .015, x: W / 2, y: 560, rot: tilt + slide * .25, shake: G_punch(t) * 10 });
  X.fillStyle = PAL.blue; X.fillRect(-1500, -1500, W + 3000, H + 3000);
  for (let j = 0; j < 22; j++) ink(() => { X.moveTo(W / 2, 1300); X.arc(W / 2, 1300, 2600, Math.PI + j / 22 * Math.PI, Math.PI + (j + .5) / 22 * Math.PI); X.closePath(); }, PAL.blueDk, { alpha: .6 });
  // RLHF: one letter per syllable, huge, sliding with the frame
  const letters = 'RLHF', ws = G6_T;
  const tl = j => ws[0].t + j * (ws[1].t - ws[0].t - .2) / 4;
  withT(slide * 1600, slide * 700, 0, 1, () => {
    letters.split('').forEach((c, j) => stampText(c, 260 + j * 270, 710, t, tl(j) - .03, { font: FONT.hero(470), color: PAL.paperHi, op: 'source-over', mis: [12, 9, PAL.pink], rot: j * .03 }));
    if (t >= ws[1].t - .03) stampText(ws[1].w, 1380, 330, t, ws[1].t - .03, { font: FONT.serifI(120), color: PAL.yellow, op: 'source-over' });
    // small mono readout: the approval rate falls as the paddles flip
    rtext('HUMAN APPROVAL ' + Math.max(3, Math.round(92 - nb * 14.5 - frac(b) * 3)) + '%   REWARD ' + (1.0 - nb * .32).toFixed(2), 330, 300, { font: FONT.monoB(40), color: PAL.sky, op: 'source-over' });
  });
  G6_crowd(t, nb, slide);
  // ASKEW, crooked, in front of the crowd
  withT(slide * 1900, slide * 900, 0, 1, () => stampText('ASKEW', 1490, 640, t, ws[2].t - .03, { font: FONT.hero(340), color: PAL.yellow, align: 'center', op: 'source-over', mis: [12, 9, PAL.pink], rot: -.42, stroke: PAL.blueDk, sw: 14 }));
  camEnd();
}, { dark: true, per: i => (i === 0 ? { joltColor: PAL.yellow, inDur: .3 } : {}) });
