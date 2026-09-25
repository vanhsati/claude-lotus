// idol.js: CLAUDE, the lead idol. A spark-crown of petal hair, a blunt bob, spark irises, a white stage jacket,
// an orange pleated skirt, white knee socks, black platform boots and a headset mic.
//
// idolHead(x, y, R, o): the head at any size (R = head radius in px). Used for close-ups and on the body.
// idolBody(x, y, s, pose, o): full body standing at hip (x, y). s = head radius in px. Pose from POSES / dance().

// ---------- head ----------
// o: {turn -1..1 (3/4 view), tilt (rad), eyes:'open'|'closed'|'happy'|'wink'|'spiral'|'star'|'red'|'heart'|'sad'|'shock',
//     open 0..1, look [x,y] (-1..1), mouth 0..1 (singing), mouthShape:'smile'|'o'|'flat'|'grin'|'frown', blush 0..1,
//     brow -1..1 (worried..determined), crown 1 (petal scale), sway (petal sway), sparkRot, bust (draw shoulders), mic (bool), sweat, lift}
function idolHead(x, y, R, o = {}) {
  const turn = o.turn || 0, lift = o.lift ?? Math.max(3, R * .05);
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0);
  const sway = o.sway ?? Math.sin(T * 2.1) * .025, crown = o.crown ?? 1;
  const fx = turn * R * .22;                 // feature shift for 3/4 view
  // ---- spark crown: two rings of rounded sunflower petals; the face is the flower's disc ----
  const petal = (a, dist, len, wid, fill, vein) => {
    const cx = Math.cos(a), sy = Math.sin(a), px = -turn * R * .06 + cx * dist, py = -R * .06 + sy * dist;
    const pts = [];
    for (let k = 0; k <= 16; k++) {                          // teardrop: narrow at the root, round at the tip
      const u = k / 16 * TAU, along = Math.cos(u), side = Math.sin(u) * (along < 0 ? .55 + .45 * (1 + along) : 1);
      pts.push([px + cx * along * len - sy * side * wid, py + sy * along * len + cx * side * wid]);
    }
    cut(() => pathSmooth(pts), { fill, lift: lift * .8, shade: .2 });
    if (vein) inkStroke(() => { X.beginPath(); X.moveTo(px - cx * len * .45, py - sy * len * .45); X.lineTo(px + cx * len * .7, py + sy * len * .7); }, vein, R * .03);
  };
  const N = 12;
  for (let i = 0; i < N; i++) {                              // back ring, darker and longer, offset by half a petal
    const a = -Math.PI / 2 + (i + .5) / N * TAU + sway * 1.4 + Math.sin(T * 1.1 + i * 1.7) * .02;
    if (Math.sin(a) > (o.bust ? .96 : .7)) continue;           // open at the bottom so the neck shows
    petal(a, R * 1.28 * crown, R * .62 * crown, R * .27, PAL.orangeDk, null);
  }
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + i / N * TAU + sway + Math.sin(T * 1.3 + i) * .02;
    if (Math.sin(a) > (o.bust ? .96 : .7)) continue;
    petal(a, R * 1.2 * crown, R * .56 * crown * (i % 2 ? .94 : 1), R * .3, PAL.orange, 'rgba(255,214,170,.55)');
  }
  // ---- shoulders / collar (bust shots) ----
  if (o.bust) {
    const sy = R * 1.3;
    cut(() => limbPath([fx * .3, R * .55], [fx * .3, sy + R * .2], R * .27, R * .3), { fill: PAL.skinSh, lift: 0 });
    // jacket: shoulders slope into the frame edge
    cut(() => pathSmooth([[-R * 2.3, R * 3.4], [-R * 2.0, sy + R * .75], [-R * 1.35, sy + R * .22], [-R * .45, sy + R * .02], [0, sy + R * .5], [R * .45, sy + R * .02], [R * 1.35, sy + R * .22], [R * 2.0, sy + R * .75], [R * 2.3, R * 3.4]], true, .7), { fill: PAL.paperHi, lift });
    htGrad(() => pathSmooth([[-R * 2.3, R * 3.4], [-R * 2.0, sy + R * .75], [-R * 1.35, sy + R * .22], [0, sy], [R * 1.35, sy + R * .22], [R * 2.0, sy + R * .75], [R * 2.3, R * 3.4]], true, .7), PAL.blueLt, 0, sy, -R * 2.2, R * 3.2, { step: R * .09, maxR: R * .03, bounds: [-R * 2.4, sy, R * 4.8, R * 2.2], alpha: .4 });
    // orange sailor collar with a spark pin
    cut(() => pathSmooth([[-R * .5, sy - R * .02], [-R * 1.3, sy + R * .3], [-R * .95, sy + R * 1.05], [-R * .12, sy + R * .78], [0, sy + R * .95], [R * .12, sy + R * .78], [R * .95, sy + R * 1.05], [R * 1.3, sy + R * .3], [R * .5, sy - R * .02], [0, sy + R * .45]], true, .6), { fill: PAL.orange, lift: lift * .6 });
    inkStroke(() => { X.beginPath(); X.moveTo(-R * 1.18, sy + R * .36); X.quadraticCurveTo(-R * 1.0, sy + R * .85, -R * .2, sy + R * .74); X.moveTo(R * 1.18, sy + R * .36); X.quadraticCurveTo(R * 1.0, sy + R * .85, R * .2, sy + R * .74); }, PAL.paperHi, R * .035);
    withT(0, sy + R * .78, T * .5, 1, () => cut(() => sparkPath(0, 0, R * .2, 6, .25, 0, .6), { fill: PAL.yellow, lift: 3 }));
  }
  // ---- back hair: a rounded bob, side locks taper to points below the jaw ----
  cut(() => pathSmooth([[-R * 1.02 - fx * .15, R * .15], [-R * 1.1, -R * .45], [-R * .72, -R * 1.02], [0, -R * 1.16], [R * .72, -R * 1.02], [R * 1.1, -R * .45], [R * 1.02 - fx * .15, R * .15], [R * .98, R * .8], [R * .78, R * .98], [R * .5, R * .7], [-R * .5, R * .7], [-R * .78, R * .98], [-R * .98, R * .8]], true, .9),
    { fill: PAL.orangeDk, lift });
  // ---- face ----
  const face = [];
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * TAU, s = Math.sin(a), c = Math.cos(a);
    const wx = .88 - .2 * Math.pow(Math.max(0, s), 2.2);
    face.push([c * R * wx + fx * .35 * (1 - Math.abs(c)), s * R * (s > 0 ? 1.04 : .96)]);
  }
  cut(() => pathSmooth(face), { fill: PAL.skin, lift: lift * .5, shade: .18 });
  // soft halftone shade along the far edge of the face
  const shSide = turn ? -Math.sign(turn) : -1;
  htGrad(() => pathSmooth(face), PAL.skinSh, shSide * R * .45, 0, shSide * R * .95, R * .1, { step: Math.min(R * .07, 20), maxR: Math.min(R * .032, 9), bounds: [-R * 1.1, -R * .4, R * 2.2, R * 1.5], alpha: .75 });
  // blush
  const bl = o.blush ?? .8;
  if (bl > 0) for (const sd of [-1, 1]) {
    const bx = sd * R * .52 + fx * (sd === Math.sign(turn) ? .6 : 1.2), sq = sd === Math.sign(turn) ? 1 - Math.abs(turn) * .35 : 1;
    X.save(); X.globalAlpha = bl;
    htGrad(() => { X.beginPath(); X.ellipse(bx, R * .44, R * .17 * sq, R * .085, 0, 0, TAU); }, PAL.pink, bx, R * .44 - R * .25, bx, R * .44, { step: Math.min(R * .042, 15), maxR: Math.min(R * .024, 8.5), bounds: [bx - R * .2, R * .32, R * .4, R * .25] });
    ink(() => { X.beginPath(); X.ellipse(bx, R * .44, R * .13 * sq, R * .055, 0, 0, TAU); }, PAL.blush, { alpha: .4 });
    X.restore();
  }
  // ---- eyes ----
  const eyes = o.eyes || 'open', open = clamp(o.open ?? 1), look = o.look || [0, 0];
  for (const sd of [-1, 1]) {
    const far = turn !== 0 && sd === -Math.sign(turn);
    const sq = far ? 1 - Math.abs(turn) * .32 : 1 + Math.abs(turn) * .05;
    const ex = sd * R * .39 + fx * (far ? .7 : 1.25), ey = R * .17;
    let kind = eyes; if (eyes === 'wink') kind = sd === 1 ? 'happy' : 'open';
    drawEye(ex, ey, R * 1.06, sd, sq, kind, open, look, o);
  }
  // brows (mostly hidden under the fringe; they peek when raised)
  const brow = o.brow || 0;
  for (const sd of [-1, 1]) {
    const far = turn !== 0 && sd === -Math.sign(turn), sq = far ? 1 - Math.abs(turn) * .3 : 1;
    const bx = sd * R * .4 + fx * (far ? .7 : 1.25), by = -R * .14 - (eyes === 'shock' ? R * .08 : 0);
    inkStroke(() => { X.beginPath(); X.moveTo(bx - sd * R * .14 * sq, by + brow * R * .06); X.quadraticCurveTo(bx, by - R * .045, bx + sd * R * .14 * sq, by - brow * R * .03 + R * .015); }, PAL.orangeDk, R * .04);
  }
  // nose
  inkStroke(() => { X.beginPath(); X.moveTo(fx * 1.3 + R * .01, R * .4); X.lineTo(fx * 1.3 - R * .02, R * .44); }, PAL.skinSh, Math.min(R * .035, 14));
  drawMouth(fx * 1.25, R * .62, R, o);
  if (o.sweat) {
    const k = o.sweat, sx2 = R * .8, sy2 = -R * .05 + k * R * .25;
    cut(() => { X.beginPath(); X.moveTo(sx2, sy2 - R * .2); X.quadraticCurveTo(sx2 + R * .12, sy2, sx2, sy2 + R * .06); X.quadraticCurveTo(sx2 - R * .12, sy2, sx2, sy2 - R * .2); }, { fill: PAL.sky, lift: 3, stroke: PAL.blue, sw: R * .02 });
  }
  // ---- bangs: anime fringe with pointed strands and gaps that show the forehead ----
  const fr = [];
  const tips = [[-.98, .38], [-.74, -.02], [-.52, -.16], [-.3, .02], [-.08, -.12], [.14, .04], [.36, -.14], [.58, -.02], [.8, -.2], [.98, .38]];
  const valley = [[-.86, -.34], [-.63, -.4], [-.41, -.34], [-.19, -.38], [.03, -.36], [.25, -.38], [.47, -.36], [.69, -.4], [.9, -.3]];
  for (let i = tips.length - 1; i >= 0; i--) {
    fr.push([tips[i][0] * R + fx * .5, tips[i][1] * R]);
    if (i > 0) fr.push([valley[i - 1][0] * R + fx * .5, valley[i - 1][1] * R]);
  }
  const crownPts = [[-R * 1.06 + fx * .1, R * .2], [-R * 1.1, -R * .45], [-R * .7, -R * 1.04], [0, -R * 1.16], [R * .7, -R * 1.04], [R * 1.1, -R * .45], [R * 1.06 + fx * .1, R * .2]];
  // side locks in front of the cheeks
  const lock = sd => [[sd * R * 1.05 + fx * .1, -R * .1], [sd * R * .98 + fx * .1, R * .6], [sd * R * .9 + fx * .1, R * .95], [sd * R * .8 + fx * .1, R * .55], [sd * R * .82 + fx * .1, R * .05]];
  cut(() => pathSmooth(lock(-1)), { fill: PAL.orange, lift: lift * .6, shade: .22 });
  cut(() => pathSmooth(lock(1)), { fill: PAL.orange, lift: lift * .6, shade: .22 });
  cut(() => { pathPoly([...crownPts, ...fr]); }, { fill: PAL.orange, lift: lift * .7, shade: .25 });
  // strand lines and a shine band
  for (let i = 0; i < 5; i++) inkStroke(() => { const u = -.7 + i * .35; X.beginPath(); X.moveTo(u * R * .5 + fx * .3, -R * 1.0); X.quadraticCurveTo(u * R * .8 + fx * .4, -R * .6, u * R + fx * .5, -R * .33); }, 'rgba(170,70,25,.45)', R * .025);
  inkStroke(() => { X.beginPath(); X.arc(fx * .3, -R * .1, R * .78, -Math.PI * .78, -Math.PI * .56); }, 'rgba(255,236,210,.8)', R * .07);
  inkStroke(() => { X.beginPath(); X.arc(fx * .3, -R * .1, R * .78, -Math.PI * .5, -Math.PI * .4); }, 'rgba(255,236,210,.8)', R * .07);
  // spark hair clip
  withT(R * .74 + fx * .2, -R * .56, T * .8, 1, () => cut(() => sparkPath(0, 0, R * .22, 6, .28, 0, .6), { fill: PAL.yellow, lift: 3, stroke: PAL.orangeDk, sw: R * .02 }));
  // headset mic (from under the side lock)
  if (o.mic !== false) {
    const mx = -R * .86 - fx * .1;
    inkStroke(() => { X.beginPath(); X.moveTo(mx, R * .42); X.quadraticCurveTo(mx + R * .12, R * .78, fx * 1.2 - R * .3, R * .7); }, PAL.ink, R * .022);
    cut(() => { X.beginPath(); X.ellipse(fx * 1.2 - R * .3, R * .7, R * .055, R * .04, -.3, 0, TAU); }, { fill: PAL.ink, lift: 2 });
  }
  X.restore();
}

function drawEye(ex, ey, R, sd, sq, kind, open, look, o) {
  const rx = R * .21 * sq, ry = R * .25;
  X.save(); X.translate(ex, ey);
  const lash = PAL.ink, lw = R * .055;
  if (kind === 'closed' || kind === 'happy' || open < .08) {
    // closed: happy arc (^) or sleepy curve
    inkStroke(() => { X.beginPath(); if (kind === 'happy') { X.moveTo(-rx, R * .04); X.quadraticCurveTo(0, -R * .16, rx, R * .04); } else { X.moveTo(-rx, 0); X.quadraticCurveTo(0, R * .1, rx, 0); } }, lash, lw);
    inkStroke(() => { X.beginPath(); X.moveTo(sd * rx * .9, kind === 'happy' ? R * .02 : 0); X.lineTo(sd * rx * 1.25, -R * .06); }, lash, lw * .7);
    X.restore(); return;
  }
  if (kind === 'heart') {
    cut(() => heartPath(0, 0, R * .26), { fill: PAL.pink, lift: 2, stroke: PAL.ink, sw: R * .02 });
    X.restore(); return;
  }
  const oy = ry * open;
  const sclera = () => { X.beginPath(); X.ellipse(0, (ry - oy) * .5, rx, oy, 0, 0, TAU); };
  cut(sclera, { fill: '#FFFFFF', lift: 0 });
  X.save(); sclera(); X.clip();
  const ix = look[0] * rx * .35, iy = look[1] * ry * .3 + R * .02, ir = R * .18 * (kind === 'shock' ? .55 : 1);
  if (kind === 'spiral') {
    X.fillStyle = PAL.paperHi; X.fillRect(-rx, -ry, rx * 2, ry * 2);
    inkStroke(() => { X.beginPath(); for (let a = 0; a < 16; a += .2) { const r = a / 16 * ir * 1.1; X.lineTo(ix + Math.cos(a + T * 9 * sd) * r, iy + Math.sin(a + T * 9 * sd) * r); } }, PAL.pink, R * .03);
  } else {
    const red = kind === 'red';
    X.fillStyle = red ? '#3a0508' : '#5A2A14'; X.beginPath(); X.arc(ix, iy, ir, 0, TAU); X.fill();
    X.fillStyle = red ? PAL.red : PAL.orangeDk; X.beginPath(); X.arc(ix, iy + ir * .12, ir * .78, 0, TAU); X.fill();
    if (red) {        // shinigami ring
      inkStroke(() => { X.beginPath(); X.arc(ix, iy, ir * .6, 0, TAU); }, '#FFD0C8', R * .012);
      X.fillStyle = '#12000a'; X.beginPath(); X.arc(ix, iy, ir * .3, 0, TAU); X.fill();
    } else if (kind === 'star' || kind === 'open' || kind === 'shock') {
      // the spark iris
      X.fillStyle = PAL.yellow; sparkPath(ix, iy + ir * .05, ir * (kind === 'star' ? .95 : .72), 6, .2, o.sparkRot ?? T * .6, .55); X.fill();
      X.fillStyle = '#2a1008'; X.beginPath(); X.arc(ix, iy + ir * .05, ir * .16, 0, TAU); X.fill();
    }
    // highlights
    X.fillStyle = '#fff'; X.beginPath(); X.arc(ix - ir * .42, iy - ir * .42, ir * .22, 0, TAU); X.fill();
    X.beginPath(); X.arc(ix + ir * .38, iy + ir * .4, ir * .1, 0, TAU); X.fill();
  }
  X.restore();
  // upper lash line with a wing, lower lash hint
  inkStroke(() => { X.beginPath(); X.ellipse(0, (ry - oy) * .5, rx * 1.02, oy * 1.02, 0, Math.PI * 1.08, Math.PI * 1.92); }, lash, lw);
  inkStroke(() => { X.beginPath(); const a = sd > 0 ? Math.PI * 1.92 : Math.PI * 1.08; const px = Math.cos(a) * rx, py = (ry - oy) * .5 + Math.sin(a) * oy; X.moveTo(px, py); X.lineTo(px + sd * R * .09, py - R * .07); }, lash, lw * .8);
  inkStroke(() => { X.beginPath(); X.ellipse(0, (ry - oy) * .5, rx * .9, oy, 0, Math.PI * .3, Math.PI * .7); }, 'rgba(90,40,20,.5)', R * .018);
  X.restore();
}

function drawMouth(mx, my, R, o) {
  const m = clamp(o.mouth || 0), shape = o.mouthShape || 'smile';
  X.save(); X.translate(mx, my);
  if (m > .06) {
    const w = R * (.07 + .07 * m), h = R * (.035 + .13 * m) * (shape === 'o' ? 1.2 : 1);
    const mp = () => { X.beginPath(); X.moveTo(-w, -h * .25); X.quadraticCurveTo(0, -h * .55, w, -h * .25); X.quadraticCurveTo(w * .9, h, 0, h); X.quadraticCurveTo(-w * .9, h, -w, -h * .25); };
    cut(mp, { fill: '#5A1A22', lift: 0 });
    X.save(); mp(); X.clip(); X.fillStyle = '#FF7A95'; X.beginPath(); X.ellipse(0, h * .95, w * .7, h * .45, 0, 0, TAU); X.fill();
    X.fillStyle = '#fff'; X.fillRect(-w * .7, -h * .5, w * 1.4, h * .22); X.restore();
  } else if (shape === 'frown' || shape === 'flat') {
    inkStroke(() => { X.beginPath(); X.moveTo(-R * .07, shape === 'flat' ? 0 : R * .03); X.quadraticCurveTo(0, shape === 'flat' ? 0 : -R * .03, R * .07, shape === 'flat' ? 0 : R * .03); }, '#7A2A22', R * .03);
  } else {
    const g = shape === 'grin' ? 1.6 : 1;
    inkStroke(() => { X.beginPath(); X.moveTo(-R * .08 * g, -R * .01); X.quadraticCurveTo(0, R * .07 * g, R * .08 * g, -R * .01); }, '#7A2A22', R * .032);
  }
  X.restore();
}

function heartPath(cx, cy, r) {
  X.beginPath(); X.moveTo(cx, cy + r * .9);
  X.bezierCurveTo(cx - r * 1.5, cy - r * .1, cx - r * .8, cy - r * 1.2, cx, cy - r * .45);
  X.bezierCurveTo(cx + r * .8, cy - r * 1.2, cx + r * 1.5, cy - r * .1, cx, cy + r * .9); X.closePath();
}

// ---------- body ----------
// Units: s = head radius in px. Hip at (x, y). Angles in radians; limbs measured from straight down, + = toward the viewer's right.
const IDOL = { torso: 3.0, neck: .55, upArm: 1.75, foreArm: 1.6, thigh: 2.35, shin: 2.25, shW: 1.08, hipW: .55 };
const POSE0 = { lean: 0, head: 0, hx: 0, hy: 0, lSh: .18, lEl: .05, rSh: -.18, rEl: -.05, lHip: .08, lKn: 0, rHip: -.08, rKn: 0, hL: 'open', hR: 'open', turn: 0, skirt: 0 };
// Note: 'l' is the idol's right side on screen-left (she faces us). lSh > 0 swings the left arm outward (to the left).
function mixPose(a, b, k) {
  const o = {}; for (const key in POSE0) { const va = a[key] ?? POSE0[key], vb = b[key] ?? POSE0[key]; o[key] = typeof va === 'number' ? lerp(va, vb, k) : (k < .5 ? va : vb); } return o;
}
function seg(x, y, ang, len) { return [x - Math.sin(ang) * len, y + Math.cos(ang) * len]; }
// capsule strip between two points with widths w0 → w1
function limbPath(p0, p1, w0, w1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  X.beginPath();
  X.moveTo(p0[0] + nx * w0, p0[1] + ny * w0); X.lineTo(p1[0] + nx * w1, p1[1] + ny * w1);
  X.arc(p1[0], p1[1], w1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI);
  X.lineTo(p0[0] - nx * w0, p0[1] - ny * w0);
  X.arc(p0[0], p0[1], w0, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI);
  X.closePath();
}
function idolBody(x, y, s, P, o = {}) {
  P = { ...POSE0, ...P };
  const lift = o.lift ?? Math.max(3, s * .08);
  X.save(); X.translate(x + P.hx * s, y + P.hy * s); if (o.scaleX) X.scale(o.scaleX, 1);
  const hip = [0, 0];
  const neck = seg(0, 0, Math.PI + P.lean, IDOL.torso * s);        // up the spine
  const shoulder = sd => [neck[0] + sd * IDOL.shW * s * Math.cos(P.lean) , neck[1] + s * .25 + sd * IDOL.shW * s * Math.sin(P.lean)];
  const hipJ = sd => [sd * IDOL.hipW * s, s * .1];
  // legs (drawn first)
  const leg = (sd, a, kn) => {
    const h0 = hipJ(sd), k = seg(h0[0], h0[1], a, IDOL.thigh * s), f = seg(k[0], k[1], a + kn, IDOL.shin * s);
    cut(() => limbPath(h0, k, s * .42, s * .3), { fill: PAL.skin, lift });
    // sock (white) from mid-shin, boot below
    const sk = [lerp(k[0], f[0], .12), lerp(k[1], f[1], .12)];
    cut(() => limbPath(sk, f, s * .31, s * .27), { fill: PAL.paperHi, lift: lift * .5 });
    inkStroke(() => { X.beginPath(); const n = [-(f[1] - k[1]), f[0] - k[0]], L = Math.hypot(n[0], n[1]); X.moveTo(sk[0] + n[0] / L * s * .3, sk[1] + n[1] / L * s * .3); X.lineTo(sk[0] - n[0] / L * s * .3, sk[1] - n[1] / L * s * .3); }, PAL.orange, s * .08, { cap: 'butt' });
    // platform boot
    const bootA = a + kn, bx = f[0], by = f[1];
    withT(bx, by, bootA * .5, 1, () => {
      cut(() => { rrect(-s * .42 + sd * s * .12, -s * .55, s * .84, s * .95, s * .22); }, { fill: PAL.ink, lift });
      cut(() => { rrect(-s * .5 + sd * s * .18, s * .3, s * 1.0, s * .38, s * .1); }, { fill: '#2C2A30', lift: lift * .3 });
      inkStroke(() => { X.beginPath(); X.moveTo(-s * .45 + sd * s * .18, s * .5); X.lineTo(s * .45 + sd * s * .18, s * .5); }, PAL.orange, s * .06);
    });
  };
  leg(-1, P.lHip, P.lKn); leg(1, P.rHip, P.rKn);
  // skirt: orange pleats, flares with P.skirt
  const fl = 1 + (P.skirt || 0) * .35, sw = Math.sin(T * 5) * .03;
  const waistY = -s * .7, hemY = s * 1.45;
  withT(0, 0, P.lean * .5, 1, () => {
    const pts = [[-s * 1.0, waistY], [s * 1.0, waistY], [s * 1.55 * fl + sw * s * 10, hemY], [-s * 1.55 * fl + sw * s * 10, hemY]];
    cut(() => pathPoly(pts), { fill: PAL.orange, lift });
    for (let i = -3; i <= 3; i++) inkStroke(() => { X.beginPath(); X.moveTo(i * s * .28, waistY + s * .15); X.lineTo(i * s * .45 * fl + sw * s * 10, hemY - s * .05); }, 'rgba(150,50,15,.5)', s * .05);
    htGrad(() => pathPoly(pts), PAL.orangeDk, 0, waistY, 0, hemY, { step: s * .25, maxR: s * .09, bounds: [-s * 1.7, waistY, s * 3.4, hemY - waistY], alpha: .6 });
  });
  // torso: white cropped jacket
  const sL = shoulder(-1), sR = shoulder(1);
  withT(0, 0, 0, 1, () => {
    const pts = [[-s * .95, waistY + s * .1], [sL[0] - s * .1, sL[1] + s * .1], [neck[0] - s * .35, neck[1] + s * .05], [neck[0] + s * .35, neck[1] + s * .05], [sR[0] + s * .1, sR[1] + s * .1], [s * .95, waistY + s * .1]];
    cut(() => pathSmooth(pts, true, .5), { fill: PAL.paperHi, lift });
    // zipper / placket and hem
    inkStroke(() => { X.beginPath(); X.moveTo(neck[0] * .6, neck[1] + s * .6); X.lineTo(0, waistY + s * .1); }, 'rgba(29,27,32,.55)', s * .05);
    inkStroke(() => { X.beginPath(); X.moveTo(-s * .95, waistY + s * .05); X.lineTo(s * .95, waistY + s * .05); }, PAL.ink, s * .14, { cap: 'butt' });
    htGrad(() => pathSmooth(pts, true, .5), PAL.blueLt, -s, 0, s * .2, neck[1], { step: s * .22, maxR: s * .07, bounds: [-s * 1.5, neck[1], s * 3, -neck[1]], alpha: .5 });
    // orange collar and spark pin
    cut(() => pathPoly([[neck[0] - s * .55, neck[1] + s * .1], [neck[0] - s * .2, neck[1] + s * 1.0], [neck[0], neck[1] + s * .55], [neck[0] + s * .2, neck[1] + s * 1.0], [neck[0] + s * .55, neck[1] + s * .1]]), { fill: PAL.orange, lift: lift * .5 });
    withT(neck[0] + s * .45, neck[1] + s * 1.2, T, 1, () => cut(() => sparkPath(0, 0, s * .22, 6, .28), { fill: PAL.yellow, lift: 2 }));
  });
  // arms: white sleeves, orange cuffs, skin hands
  const arm = (sd, a, el, hand) => {
    const sh = shoulder(sd), e = seg(sh[0], sh[1], a, IDOL.upArm * s), w = seg(e[0], e[1], a + el, IDOL.foreArm * s);
    cut(() => limbPath(sh, e, s * .38, s * .3), { fill: PAL.paperHi, lift });
    cut(() => limbPath(e, w, s * .3, s * .27), { fill: PAL.paperHi, lift });
    const cf = [lerp(e[0], w[0], .82), lerp(e[1], w[1], .82)];
    cut(() => limbPath(cf, w, s * .3, s * .3), { fill: PAL.orange, lift: lift * .3 });
    drawHand(w[0], w[1], a + el, s, hand, sd, lift);
    return w;
  };
  const wl = arm(-1, P.lSh, P.lEl, P.hL), wr = arm(1, P.rSh, P.rEl, P.hR);
  // neck + head
  cut(() => limbPath([neck[0], neck[1] + s * .2], [neck[0] + Math.sin(P.lean) * s * .5, neck[1] - s * .45], s * .22, s * .22), { fill: PAL.skinSh, lift: 0 });
  const hc = seg(neck[0], neck[1], Math.PI + P.lean + P.head * .5, (IDOL.neck + 1.0) * s);
  idolHead(hc[0], hc[1], s * 1.15, { mic: true, crown: .85, ...o.face, tilt: P.lean + P.head, turn: P.turn, lift: lift * .6 });
  X.restore();
  return { hands: [wl, wr] };
}
function drawHand(x, y, ang, s, kind, sd, lift) {
  withT(x, y, ang, 1, () => {
    const r = s * .3;
    if (kind === 'point') {
      cut(() => limbPath([0, 0], [0, s * .9], s * .1, s * .09), { fill: PAL.skin, lift: lift * .4 });
    } else if (kind === 'peace') {
      cut(() => limbPath([0, 0], [-s * .18, s * .8], s * .09, s * .08), { fill: PAL.skin, lift: lift * .4 });
      cut(() => limbPath([0, 0], [s * .18, s * .8], s * .09, s * .08), { fill: PAL.skin, lift: lift * .4 });
    }
    cut(() => { X.beginPath(); X.ellipse(0, s * .22, r, r * 1.1, 0, 0, TAU); }, { fill: PAL.skin, lift: lift * .5 });
    if (kind === 'heart') withT(0, s * 1.0, -ang, 1, () => cut(() => heartPath(0, 0, s * .32), { fill: PAL.pink, lift: 3 }));
  });
}
