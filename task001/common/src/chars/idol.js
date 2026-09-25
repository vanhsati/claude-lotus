// idol.js: CLAUDE, the lead idol. A spark-crown of petal hair, a blunt bob, spark irises, a white stage jacket,
// an orange pleated skirt, white knee socks, black platform boots and a headset mic.
//
// idolHead(x, y, R, o): the head at any size (R = head radius in px). Used for close-ups and on the body.
// idolBody(x, y, s, pose, o): full body standing at hip (x, y). s = head radius in px. Pose from POSES / dance().
//   o.outfit: 'aodai' (a Vietnamese áo dài over wide silk trousers; o.palette {tunic, tunicDk, pants, pantsSh, gold, shoe}; o.glint)

// ---------- head ----------
// o: {turn -1..1 (3/4 view), tilt (rad), eyes:'open'|'closed'|'happy'|'wink'|'spiral'|'star'|'red'|'heart'|'sad'|'shock',
//     open 0..1, look [x,y] (-1..1), mouth 0..1 (singing), mouthShape:'smile'|'o'|'flat'|'grin'|'frown', blush 0..1,
//     brow -1..1 (worried..determined), crown 1 (petal scale), sway (petal sway), sparkRot, bust (draw shoulders), mic (bool), sweat, lift,
//     hat: 'nonla' (conical leaf hat on the petal crown; hatTilt rad, hatScale, hatMat 'straw'|'gold', strap colour)}
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
  if (o.hat === 'nonla') drawNonLaStrap(R, fx, o);
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
  if (o.hat === 'nonla') drawNonLa(R, fx, lift, o);
  X.restore();
}

// Nón lá chin strap: a silk ribbon from under the side locks, tied under the chin (drawn before the hair in front).
function drawNonLaStrap(R, fx, o) {
  const strap = o.strap || '#B3261E';
  inkStroke(() => { X.beginPath(); X.moveTo(-R * .84 + fx * .2, R * .42); X.quadraticCurveTo(-R * .72 + fx * .3, R * 1.02, fx * .9, R * 1.1); X.quadraticCurveTo(R * .72 + fx * .3, R * 1.02, R * .84 + fx * .2, R * .42); }, strap, R * .03);
  inkStroke(() => { X.beginPath(); X.moveTo(-R * .84 + fx * .2, -R * .1); X.quadraticCurveTo(-R * .6 + fx * .3, R * .86, fx * .9, R * 1.05); }, 'rgba(255,220,200,.4)', R * .012);
  // the knot
  cut(() => { X.beginPath(); X.ellipse(fx * .9, R * 1.1, R * .06, R * .04, 0, 0, TAU); }, { fill: strap, lift: 2 });
}
// Nón lá: a conical palm-leaf hat seen front-on, sitting on the petal crown, with ribs, rings and a silk chin strap.
function drawNonLa(R, fx, lift, o) {
  const B = R * 2.05 * (o.hatScale || 1), Hh = B * .62, ry = B * .1, gold = o.hatMat === 'gold' && typeof lqGold === 'function';
  withT(fx * .25, -R * 1.0, o.hatTilt || 0, 1, () => {
    const cone = () => { X.beginPath(); X.moveTo(0, -Hh); X.quadraticCurveTo(-B * .42, -Hh * .42, -B, 0); X.ellipse(0, 0, B, ry, 0, Math.PI, 0, true); X.quadraticCurveTo(B * .42, -Hh * .42, 0, -Hh); X.closePath(); };
    // soft shadow of the brim on the hair
    X.save(); X.globalAlpha = .28; X.fillStyle = '#2a1206'; X.beginPath(); X.ellipse(R * .05, ry * 1.6, B * .9, ry * 1.4, 0, 0, TAU); X.fill(); X.restore();
    if (gold) lqGold(() => { cone(); X.closePath(); }, { scale: R / 300, lift, bevel: 0 });
    else cut(cone, { fill: '#E9D5A2', lift });
    X.save(); cone(); X.clip();
    // light from the upper left: the right flank of the cone falls into shade
    const g = X.createLinearGradient(-B, 0, B, 0);
    g.addColorStop(0, 'rgba(255,250,230,.35)'); g.addColorStop(.42, 'rgba(255,250,230,0)'); g.addColorStop(.6, 'rgba(90,55,20,.05)'); g.addColorStop(1, 'rgba(90,55,20,.42)');
    X.fillStyle = g; X.fillRect(-B, -Hh, B * 2, Hh + ry);
    // rings (the leaf layers, bound on bamboo hoops) and ribs radiating from the apex
    const col = gold ? 'rgba(80,45,10,.55)' : 'rgba(140,100,45,.55)', hi = 'rgba(255,248,225,.5)';
    for (let j = 1; j <= 9; j++) {
      const f = Math.pow(j / 10, .9), cy = -Hh * (1 - f), rx = B * f, ryy = ry * f;
      X.lineWidth = Math.max(1, R * .012); X.strokeStyle = col; X.beginPath(); X.ellipse(0, cy, rx, ryy, 0, 0, Math.PI); X.stroke();
      X.strokeStyle = hi; X.lineWidth = Math.max(.6, R * .006); X.beginPath(); X.ellipse(0, cy - R * .018, rx, ryy, 0, Math.PI * .08, Math.PI * .6); X.stroke();
    }
    X.strokeStyle = col; X.lineWidth = Math.max(.7, R * .007);
    for (let i = 1; i < 18; i++) { const ph = Math.PI * i / 18; X.beginPath(); X.moveTo(0, -Hh); X.lineTo(-Math.cos(ph) * B, Math.sin(ph) * ry); X.stroke(); }
    X.restore();
    // bound brim: a darker rim along the front edge
    inkStroke(() => { X.beginPath(); X.ellipse(0, 0, B, ry, 0, 0, Math.PI); }, gold ? '#6b4414' : '#9A7440', R * .035);
    inkStroke(() => { X.beginPath(); X.ellipse(0, -R * .012, B * .995, ry, 0, Math.PI * .1, Math.PI * .5); }, 'rgba(255,248,225,.6)', R * .012);
  });
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
  const ad = o.outfit === 'aodai';
  const AP = ad ? { tunic: '#B3261E', tunicDk: '#6E120D', pants: '#F1EADC', pantsSh: '#D3C6B0', gold: '#D9A441', shoe: '#1D1512', ...(o.palette || {}) } : null;
  if (ad) aoDaiPanel(s, P, AP, 'back', lift, o);
  const leg = (sd, a, kn) => {
    const h0 = hipJ(sd), k = seg(h0[0], h0[1], a, IDOL.thigh * s), f = seg(k[0], k[1], a + kn, IDOL.shin * s);
    if (ad) {
      // wide white silk trousers that flare over the foot, then a small lacquer slipper
      const bootA = a + kn;
      withT(f[0], f[1], bootA * .5, 1, () => cut(() => { X.beginPath(); X.ellipse(sd * s * .15, s * .45, s * .42, s * .2, 0, 0, TAU); }, { fill: AP.shoe, lift }));
      const d = [f[0] - k[0], f[1] - k[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L];
      const hem = [f[0] + d[0] / L * s * .3, f[1] + d[1] / L * s * .3];
      const pts = [[h0[0] - s * .55, h0[1] - s * .3], [h0[0] + s * .55, h0[1] - s * .3], [k[0] + n[0] * s * .5, k[1] + n[1] * s * .5], [hem[0] + n[0] * s * .68, hem[1] + n[1] * s * .68], [hem[0] - n[0] * s * .68, hem[1] - n[1] * s * .68], [k[0] - n[0] * s * .5, k[1] - n[1] * s * .5]];
      cut(() => pathSmooth(pts, true, .35), { fill: AP.pants, lift });
      inkStroke(() => { X.beginPath(); X.moveTo(k[0] + n[0] * s * .1, k[1] + n[1] * s * .1); X.quadraticCurveTo(lerp(k[0], hem[0], .5) - n[0] * s * .1, lerp(k[1], hem[1], .5), hem[0] + n[0] * s * .15, hem[1] + n[1] * s * .15); }, AP.pantsSh, s * .07);
      inkStroke(() => { X.beginPath(); X.moveTo(hem[0] + n[0] * s * .66, hem[1] + n[1] * s * .66); X.lineTo(hem[0] - n[0] * s * .66, hem[1] - n[1] * s * .66); }, AP.pantsSh, s * .05);
      return;
    }
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
  if (!ad) withT(0, 0, P.lean * .5, 1, () => {
    const pts = [[-s * 1.0, waistY], [s * 1.0, waistY], [s * 1.55 * fl + sw * s * 10, hemY], [-s * 1.55 * fl + sw * s * 10, hemY]];
    cut(() => pathPoly(pts), { fill: PAL.orange, lift });
    for (let i = -3; i <= 3; i++) inkStroke(() => { X.beginPath(); X.moveTo(i * s * .28, waistY + s * .15); X.lineTo(i * s * .45 * fl + sw * s * 10, hemY - s * .05); }, 'rgba(150,50,15,.5)', s * .05);
    htGrad(() => pathPoly(pts), PAL.orangeDk, 0, waistY, 0, hemY, { step: s * .25, maxR: s * .09, bounds: [-s * 1.7, waistY, s * 3.4, hemY - waistY], alpha: .6 });
  });
  // torso: white cropped jacket
  const sL = shoulder(-1), sR = shoulder(1);
  if (ad) { aoDaiPanel(s, P, AP, 'front', lift, o); aoDaiTorso(s, neck, sL, sR, waistY, AP, lift, o); }
  else withT(0, 0, 0, 1, () => {
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
    if (ad) {
      // long fitted áo dài sleeves to the wrist, a thin gold cuff
      aoDaiFill(() => aoDaiLimb(sh, e, s * .34, s * .27), AP.tunic, lift, s, o);
      aoDaiFill(() => aoDaiLimb(e, w, s * .27, s * .22), AP.tunic, lift, s, o);
      const cf = [lerp(e[0], w[0], .88), lerp(e[1], w[1], .88)];
      aoDaiGold(() => aoDaiLimb(cf, w, s * .235, s * .235), s, o);
    } else {
    cut(() => limbPath(sh, e, s * .38, s * .3), { fill: PAL.paperHi, lift });
    cut(() => limbPath(e, w, s * .3, s * .27), { fill: PAL.paperHi, lift });
    const cf = [lerp(e[0], w[0], .82), lerp(e[1], w[1], .82)];
    cut(() => limbPath(cf, w, s * .3, s * .3), { fill: PAL.orange, lift: lift * .3 });
    }
    drawHand(w[0], w[1], a + el, s, hand, sd, lift);
    return w;
  };
  const wl = arm(-1, P.lSh, P.lEl, P.hL), wr = arm(1, P.rSh, P.rEl, P.hR);
  // neck + head
  cut(() => limbPath([neck[0], neck[1] + s * .2], [neck[0] + Math.sin(P.lean) * s * .5, neck[1] - s * .45], s * .22, s * .22), { fill: PAL.skinSh, lift: 0 });
  if (ad) aoDaiCollar(s, neck, P, AP, lift, o);
  const hc = seg(neck[0], neck[1], Math.PI + P.lean + P.head * .5, (IDOL.neck + 1.0) * s);
  idolHead(hc[0], hc[1], s * 1.15, { mic: true, crown: .85, ...o.face, tilt: P.lean + P.head, turn: P.turn, lift: lift * .6 });
  X.restore();
  return { hands: [wl, wr] };
}
// ---------- áo dài pieces (used when idolBody gets {outfit: 'aodai'}) ----------
// A capsule with convex round ends (limbPath's caps are concave, which only paper backgrounds hide).
function aoDaiLimb(p0, p1, w0, w1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, a = Math.atan2(ny, nx);
  X.beginPath(); X.moveTo(p0[0] + nx * w0, p0[1] + ny * w0); X.lineTo(p1[0] + nx * w1, p1[1] + ny * w1);
  X.arc(p1[0], p1[1], w1, a, a + Math.PI, true); X.lineTo(p0[0] - nx * w0, p0[1] - ny * w0);
  X.arc(p0[0], p0[1], w0, a + Math.PI, a + TAU, true); X.closePath();
}
// Fills use the job's lacquer materials when they are loaded (lqLacquer / lqGold), else flat paper and ink.
function aoDaiFill(pf, col, lift, s, o, bounds) {
  cut(pf, { fill: col, lift });
  if (typeof lqLacquer === 'function') lqLacquer(pf, col, { rim: bounds ? Math.max(1, s * .03) : 0, glint: o.glint ?? false, mottle: .18, bounds, sheen: bounds ? .8 : 0 });
}
function aoDaiGold(pf, s, o) {
  if (typeof lqGold === 'function') lqGold(pf, { scale: Math.max(.08, s / 260), glint: o.glint ?? false, bevel: 0 });
  else ink(pf, (o.palette && o.palette.gold) || '#D9A441', { op: 'source-over' });
}
// A front or back panel: hangs from the waist slits to below the knee and swings / flows with the pose and time.
function aoDaiPanel(s, P, AP, which, lift, o) {
  const front = which === 'front', waistY = -s * .55, hemY = s * (front ? 3.55 : 3.75);
  const avgHip = ((P.lHip || 0) + (P.rHip || 0)) / 2, flow = .55 + Math.abs(P.skirt || 0) * 1.2;
  const ph = T * 2.7 + (front ? 0 : 1.3);
  const hemDx = -Math.sin(avgHip) * s * 2.1 * (front ? 1 : .6) + Math.sin(ph) * s * .28 * flow + (front ? 1 : -1) * (P.skirt || 0) * s * .35 - P.lean * s * 2.5;
  const wW = s * (front ? .78 : .95), hW = s * (front ? 1.12 : 1.5) * (1 + Math.abs(P.skirt || 0) * .25);
  const pts = [];
  pts.push([-wW, waistY]); pts.push([wW, waistY]);
  pts.push([wW * 1.05 + hemDx * .35, lerp(waistY, hemY, .45)]);
  const n = 7;
  for (let i = 0; i <= n; i++) {        // the hem: a travelling ripple
    const u = 1 - i / n, x = lerp(-hW, hW, u) + hemDx, y = hemY + Math.sin(ph * 1.6 + u * 5.5) * s * .12 * flow + (u - .5) * hemDx * .12;
    pts.push([x, y]);
  }
  pts.push([-wW * 1.05 + hemDx * .35, lerp(waistY, hemY, .45)]);
  const pf = () => pathSmooth(pts, true, .7), b = [-s * 2, -s * 4.2, s * 4, s * 7.75];
  aoDaiFill(pf, front ? AP.tunic : AP.tunicDk, lift, s, o, b);
  // silk folds: long soft lines from the waist toward the hem
  for (let i = -2; i <= 2; i++) inkStroke(() => { X.beginPath(); X.moveTo(i * wW * .35, waistY + s * .4); X.quadraticCurveTo(i * wW * .45 + hemDx * .4, lerp(waistY, hemY, .55), i * hW * .5 + hemDx * .95, hemY - s * .15); }, front ? 'rgba(90,10,6,.28)' : 'rgba(0,0,0,.22)', s * .06);
  if (!front) return;
  // gold embroidery: a vine of small spark flowers climbing to a lotus near the hem
  const at = v => [lerp(0, hemDx * .9, Math.pow(v, 1.4)) + Math.sin(v * 7) * s * .22, lerp(waistY + s * .5, hemY - s * .6, v)];
  inkStroke(() => { X.beginPath(); for (let i = 0; i <= 20; i++) { const [x, y] = at(i / 20 * .8); i ? X.lineTo(x, y) : X.moveTo(x, y); } }, 'rgba(217,164,65,.8)', s * .05);
  aoDaiGold(() => {
    for (const v of [.08, .24, .4, .56]) { const [x, y] = at(v), side = Math.sin(v * 7) > 0 ? -1 : 1; sparkPathAdd(x + side * s * .28, y, s * .2, 6, .3, v * 3); X.moveTo(x + side * s * .1, y - s * .05); X.ellipse(x + side * s * .1, y - s * .05, s * .12, s * .05, side * .6, 0, TAU); }
    const [lx, ly] = at(.86); lotusPathAdd(lx, ly, s * .62);
  }, s, o);
}
function sparkPathAdd(cx, cy, R, n, inner, rot) {
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, w = Math.PI / n * .6;
    X.moveTo(cx + Math.cos(a - w) * R * inner, cy + Math.sin(a - w) * R * inner);
    X.quadraticCurveTo(cx + Math.cos(a) * R * 1.2, cy + Math.sin(a) * R * 1.2, cx + Math.cos(a + w) * R * inner, cy + Math.sin(a + w) * R * inner);
    X.closePath();
  }
  X.moveTo(cx + R * .3, cy); X.arc(cx, cy, R * .3, 0, TAU);
}
function lotusPathAdd(cx, cy, R) {
  // five pointed petals fanned upward over a flat base leaf
  for (const [a, l, w] of [[0, 1, .34], [-.55, .88, .3], [.55, .88, .3], [-1.1, .7, .26], [1.1, .7, .26]]) {
    const tx = cx + Math.sin(a) * R * l, ty = cy - Math.cos(a) * R * l, nx = Math.cos(a) * R * w, ny = Math.sin(a) * R * w;
    X.moveTo(cx, cy); X.quadraticCurveTo(cx + (tx - cx) * .5 - nx, cy + (ty - cy) * .5 - ny, tx, ty); X.quadraticCurveTo(cx + (tx - cx) * .5 + nx, cy + (ty - cy) * .5 + ny, cx, cy); X.closePath();
  }
  X.moveTo(cx - R * .8, cy + R * .1); X.quadraticCurveTo(cx, cy - R * .12, cx + R * .8, cy + R * .1); X.quadraticCurveTo(cx, cy + R * .3, cx - R * .8, cy + R * .1); X.closePath();
}
function aoDaiTorso(s, neck, sL, sR, waistY, AP, lift, o) {
  const pts = [[-s * .8, waistY + s * .45], [-s * .72, (sL[1] + waistY) / 2 + s * .3], [sL[0] - s * .05, sL[1] + s * .1], [neck[0] - s * .32, neck[1] + s * .05], [neck[0] + s * .32, neck[1] + s * .05], [sR[0] + s * .05, sR[1] + s * .1], [s * .72, (sR[1] + waistY) / 2 + s * .3], [s * .8, waistY + s * .45]];
  cut(() => pathSmooth(pts, true, .5), { fill: AP.tunic, lift: 0 });
  if (typeof lqLacquer === 'function') lqLacquer(() => pathSmooth(pts, true, .5), AP.tunic, { rim: 0, glint: o.glint ?? false, mottle: .18, bounds: [-s * 2, neck[1], s * 4, s * 3.55 - neck[1]], sheen: .8 });
  // side seams: a soft shade down each flank, a fitted waist
  inkStroke(() => { X.beginPath(); X.moveTo(sL[0] + s * .15, sL[1] + s * .5); X.quadraticCurveTo(-s * .62, (sL[1] + waistY) / 2 + s * .3, -s * .8, waistY + s * .3); }, 'rgba(60,4,2,.35)', s * .12);
  inkStroke(() => { X.beginPath(); X.moveTo(sR[0] - s * .15, sR[1] + s * .5); X.quadraticCurveTo(s * .62, (sR[1] + waistY) / 2 + s * .3, s * .8, waistY + s * .3); }, 'rgba(60,4,2,.35)', s * .12);
  // the diagonal raglan closure from the collar to under the right arm, with gold knot buttons
  const c0 = [neck[0] + s * .22, neck[1] + s * .3], c1 = [sR[0] - s * .15, sR[1] + s * .75];
  inkStroke(() => { X.beginPath(); X.moveTo(c0[0], c0[1]); X.quadraticCurveTo(c1[0] - s * .05, c0[1] + s * .1, c1[0], c1[1]); }, 'rgba(60,6,4,.6)', s * .05);
  aoDaiGold(() => { for (const u of [.15, .5, .85]) { const x = lerp(c0[0], c1[0], u) - s * .02, y = lerp(c0[1], c1[1], u * u) + s * .02; X.moveTo(x + s * .07, y); X.arc(x, y, s * .07, 0, TAU); } }, s, o);
  // a chest flower
  aoDaiGold(() => sparkPathAdd(neck[0] - s * .5, neck[1] + s * 1.3, s * .28, 6, .3, .3), s, o);
}
function aoDaiCollar(s, neck, P, AP, lift, o) {
  // mandarin collar: a short standing band around the throat with gold edging
  const cx = neck[0] + Math.sin(P.lean) * s * .1, cy = neck[1] - s * .05;
  const pf = () => { X.moveTo(cx - s * .3, cy + s * .22); X.lineTo(cx - s * .28, cy - s * .2); X.quadraticCurveTo(cx, cy - s * .1, cx + s * .28, cy - s * .2); X.lineTo(cx + s * .3, cy + s * .22); X.quadraticCurveTo(cx, cy + s * .34, cx - s * .3, cy + s * .22); X.closePath(); };
  aoDaiFill(pf, AP.tunic, lift * .5, s, o, [cx - s * .3, cy - s * .2, s * .6, s * .5]);
  aoDaiGold(() => { X.moveTo(cx - s * .28, cy - s * .2); X.quadraticCurveTo(cx, cy - s * .1, cx + s * .28, cy - s * .2); X.lineTo(cx + s * .28, cy - s * .12); X.quadraticCurveTo(cx, cy - s * .02, cx - s * .28, cy - s * .12); X.closePath(); }, s, o);
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
