// e_verse3.js: E · Verse 3 (73–88.45). The hottest groove: a cut every ~2 beats.
// E1 top-down 3-4-3 formation: FORWARD MLP → / ← BACKWARD / ↻ REPEAT, then a front-view echo →
// E2 chalkboard wall, Erdős checklist ticked on the beat, xerox headlines, VON NEUMANN placard, OBSOLETE stamp →
// E3 top-down paper road, hairpin LEFT with a whip, then NEXT fills the sky: *there you are* →
// E4 the CDR form: empty boxes, donuts, a tumbleweed, 0 FILED, then it all falls away into the breakdown.

// ---------- shared drawing: top-down Clawd, top-down idol, scooter, arrows ----------
// A Clawd seen from above: the body top, a sliver of the front face with its eye slits, and the beanie with a pompom.
// (x, y) = centre, s = body width. o: {hat, squash, step, arms [l, r] 0..1, glow 0..1, rot, eyes}
function E_clawdTop(x, y, s, o = {}) {
  const sq = o.squash || 0, bw = s * (1 + sq * .14), bd = s * .72 * (1 + sq * .1), lift = o.lift ?? s * .13;
  X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot);
  if (o.glow > .02) ink(() => { X.beginPath(); X.arc(0, 0, s * (.62 + .22 * o.glow), 0, TAU); }, o.glowCol || PAL.yellow, { alpha: .7 * o.glow });
  // legs peeking out at the front and back, alternating with the step
  const st = o.step ?? 0;
  [-.34, -.12, .12, .34].forEach((u, i) => {
    const ph = Math.sin(st * Math.PI + i * Math.PI) * .5 + .5;
    cut(() => rrect(u * bw - s * .055, bd * .5 - s * .08 + ph * s * .09, s * .11, s * .14, s * .03), { fill: PAL.orangeDk, lift: lift * .3 });
  });
  // arm nubs
  const arms = o.arms || [0, 0];
  [-1, 1].forEach((sd, i) => {
    const a = arms[i] || 0;
    withT(sd * bw * .48, -bd * .05, sd * a * .7, 1, () => cut(() => rrect(sd > 0 ? -s * .02 : -s * .2 - a * s * .1, -s * .075, s * .22 + a * s * .1, s * .15, s * .05), { fill: PAL.orange, lift: lift * .6 }));
  });
  const body = () => rrect(-bw / 2, -bd / 2, bw, bd, s * .1);
  cut(body, { fill: o.body || PAL.orange, lift });
  htGrad(body, PAL.orangeDk, -bw * .2, -bd / 2, bw * .4, bd / 2, { step: s * .075, maxR: s * .024, bounds: [-bw / 2, -bd / 2, bw, bd], alpha: .7 });
  // front face sliver with eyes
  cut(() => rrect(-bw / 2, bd / 2 - s * .17, bw, s * .17, [0, 0, s * .1, s * .1]), { fill: '#D35F2E', lift: 0 });
  const e = o.eyes || 'open';
  for (const sd of [-1, 1]) {
    const ex = sd * s * .2, ey = bd / 2 - s * .085;
    if (e === 'happy') inkStroke(() => { X.beginPath(); X.moveTo(ex - s * .05, ey + s * .03); X.lineTo(ex, ey - s * .03); X.lineTo(ex + s * .05, ey + s * .03); }, PAL.ink, s * .03);
    else { X.fillStyle = PAL.ink; X.beginPath(); X.roundRect(ex - s * .03, ey - s * .05, s * .06, s * .1, s * .015); X.fill(); }
  }
  // beanie: a dome with ribs, a cuff ring and a pompom
  const hr = s * .27, hy = -bd * .08;
  cut(() => { X.beginPath(); X.arc(0, hy, hr, 0, TAU); }, { fill: o.hat || PAL.pink, lift: lift * .45 });
  X.save(); X.beginPath(); X.arc(0, hy, hr, 0, TAU); X.clip();
  X.strokeStyle = 'rgba(0,0,0,.16)'; X.lineWidth = s * .018;
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; X.beginPath(); X.moveTo(Math.cos(a) * hr * .25, hy + Math.sin(a) * hr * .25); X.lineTo(Math.cos(a) * hr, hy + Math.sin(a) * hr); X.stroke(); }
  X.strokeStyle = 'rgba(255,255,255,.35)'; X.lineWidth = s * .05; X.beginPath(); X.arc(0, hy, hr * .88, 0, TAU); X.stroke();
  X.restore();
  cut(() => { X.beginPath(); X.arc(0, hy, s * .085, 0, TAU); }, { fill: o.pom || PAL.paperHi, lift: 3 });
  X.restore();
}
// The idol seen from above: her spark crown is a sunflower. Front is +y. R = head radius.
// o: {rot, armL, armR (0 = forward, 1 = sideways), baton (bool), lift}
function E_idolTop(x, y, R, o = {}) {
  X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot);
  const lift = o.lift ?? R * .24;
  // boots (toes peek out in front of the skirt)
  for (const sd of [-1, 1]) cut(() => { X.beginPath(); X.ellipse(sd * R * .42, R * 1.62, R * .26, R * .34, 0, 0, TAU); }, { fill: PAL.ink, lift: lift * .4 });
  // pleated skirt
  const sk = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + T * .4, r = R * (i % 2 ? 1.34 : 1.5); sk.push([Math.cos(a) * r, Math.sin(a) * r * .92 + R * .18]); }
  cut(() => pathPoly(sk), { fill: PAL.orange, lift });
  // arms
  const arm = (sd, a, baton) => {
    const sx = sd * R * 1.1, dx = sd * Math.sin(a), dy = Math.cos(a), L = R * 1.5;
    const hx = sx + dx * L, hy2 = R * .1 + dy * L;
    cut(() => limbPath([sx, R * .05], [hx, hy2], R * .34, R * .28), { fill: PAL.paperHi, lift: lift * .8 });
    cut(() => limbPath([sx + dx * L * .82, R * .1 + dy * L * .82], [hx, hy2], R * .3, R * .3), { fill: PAL.orange, lift: 2 });
    if (baton) {
      inkStroke(() => { X.beginPath(); X.moveTo(hx, hy2); X.lineTo(hx + dx * R * 1.6, hy2 + dy * R * 1.6); }, PAL.ink, R * .1);
      withT(hx + dx * R * 1.65, hy2 + dy * R * 1.65, T * 3, 1, () => cut(() => sparkPath(0, 0, R * .34, 6, .25, 0, .6), { fill: PAL.yellow, lift: 3 }));
    }
    cut(() => { X.beginPath(); X.arc(hx, hy2, R * .24, 0, TAU); }, { fill: PAL.skin, lift: 2 });
  };
  arm(-1, o.armL ?? .2, false); arm(1, o.armR ?? .2, o.baton);
  // shoulders: white jacket, orange collar
  cut(() => { X.beginPath(); X.ellipse(0, R * .05, R * 1.3, R * .62, 0, 0, TAU); }, { fill: PAL.paperHi, lift });
  cut(() => pathPoly([[-R * .78, R * .2], [0, R * .82], [R * .78, R * .2], [0, R * .5]]), { fill: PAL.orange, lift: 2 });
  // petal crown: the sunflower seen from above
  const petal = (a, dist, len, wid, fill) => {
    const c = Math.cos(a), s = Math.sin(a), px = c * dist, py = s * dist, pts = [];
    for (let k = 0; k <= 14; k++) { const u = k / 14 * TAU, al = Math.cos(u), sd = Math.sin(u) * (al < 0 ? .55 + .45 * (1 + al) : 1); pts.push([px + c * al * len - s * sd * wid, py + s * al * len + c * sd * wid]); }
    cut(() => pathSmooth(pts), { fill, lift: lift * .6, shade: .22 });
  };
  const sway = Math.sin(T * 2.3) * .04;
  for (let i = 0; i < 12; i++) petal((i + .5) / 12 * TAU + sway, R * 1.2, R * .56, R * .26, PAL.orangeDk);
  for (let i = 0; i < 12; i++) petal(i / 12 * TAU + sway * 1.3, R * 1.12, R * .5, R * .28, PAL.orange);
  // top of the head: the bob with a crown swirl, headset band, spark clip
  cut(() => { X.beginPath(); X.arc(0, 0, R, 0, TAU); }, { fill: PAL.orange, lift: lift * .7 });
  for (let i = 0; i < 9; i++) inkStroke(() => { const a = i / 9 * TAU; X.beginPath(); X.moveTo(-R * .08, -R * .12); X.quadraticCurveTo(Math.cos(a + .5) * R * .5 - R * .08, Math.sin(a + .5) * R * .5 - R * .12, Math.cos(a) * R * .92, Math.sin(a) * R * .92); }, 'rgba(160,62,22,.28)', R * .04);
  inkStroke(() => { X.beginPath(); X.arc(R * .1, -R * .3, R * .55, -2.6, -1.2); }, 'rgba(255,236,210,.85)', R * .1);
  inkStroke(() => { X.beginPath(); X.moveTo(-R * .98, R * .1); X.quadraticCurveTo(-R * .9, R * .75, -R * .35, R * 1.0); }, PAL.ink, R * .05);
  withT(R * .72, -R * .55, T * .8, 1, () => cut(() => sparkPath(0, 0, R * .3, 6, .28, 0, .6), { fill: PAL.yellow, lift: 3 }));
  X.restore();
}
// A kick scooter from above, nose at -y. (x, y) = centre, s = length.
function E_scooterTop(x, y, s, rot, o = {}) {
  withT(x, y, rot, 1, () => {
    cut(() => rrect(-s * .06, -s * .56, s * .12, s * .16, s * .03), { fill: PAL.ink, lift: 4 });
    cut(() => rrect(-s * .06, s * .38, s * .12, s * .16, s * .03), { fill: PAL.ink, lift: 4 });
    cut(() => pathSmooth([[0, -s * .52], [s * .17, -s * .36], [s * .15, s * .42], [0, s * .5], [-s * .15, s * .42], [-s * .17, -s * .36]]), { fill: o.col || PAL.pink, lift: 8 });
    htGrad(() => pathSmooth([[0, -s * .52], [s * .17, -s * .36], [s * .15, s * .42], [0, s * .5], [-s * .15, s * .42], [-s * .17, -s * .36]]), PAL.ink, -s * .1, -s * .5, s * .15, s * .5, { step: s * .04, maxR: s * .012, alpha: .35 });
    cut(() => { X.beginPath(); X.arc(0, -s * .47, s * .06, 0, TAU); }, { fill: PAL.yellow, lift: 2 });
    inkStroke(() => { X.beginPath(); X.moveTo(-s * .3, -s * .33); X.lineTo(s * .3, -s * .33); }, PAL.ink, s * .045);
    E_idolTop(0, s * .02, s * .16, { rot: Math.PI, armL: .35, armR: .35, lift: 6 });
  });
}
// A fat paper arrow pointing along +x (dir = -1 for left). (x, y) = tail centre.
function E_arrow(x, y, len, th, dir, fill, o = {}) {
  withT(x, y, o.rot || 0, 1, () => {
    X.scale(dir, 1);
    const hl = th * 1.25;
    cut(() => pathPoly([[0, -th * .32], [len - hl, -th * .32], [len - hl, -th * .75], [len, 0], [len - hl, th * .75], [len - hl, th * .32], [0, th * .32]]), { fill, lift: o.lift ?? 8, stroke: o.stroke, sw: o.sw });
  });
}
// A ↻ loop arrow (clockwise), centre (x, y), radius r, thickness w, sweep from a0 to a1.
function E_loopArrow(x, y, r, w, a0, a1, fill, o = {}) {
  withT(x, y, o.rot || 0, 1, () => {
    const hw = w * .5, hl = w * 1.5, pts = [], n = 36, aE = a1 - hl / r;
    for (let i = 0; i <= n; i++) { const a = lerp(a0, aE, i / n); pts.push([Math.cos(a) * (r + hw), Math.sin(a) * (r + hw)]); }
    pts.push([Math.cos(aE) * (r + w * 1.05), Math.sin(aE) * (r + w * 1.05)]);
    pts.push([Math.cos(a1) * r, Math.sin(a1) * r]);
    pts.push([Math.cos(aE) * (r - w * 1.05), Math.sin(aE) * (r - w * 1.05)]);
    for (let i = n; i >= 0; i--) { const a = lerp(a0, aE, i / n); pts.push([Math.cos(a) * (r - hw), Math.sin(a) * (r - hw)]); }
    cut(() => pathPoly(pts), { fill, lift: o.lift ?? 10, stroke: o.stroke, sw: o.sw });
  });
}

// ---------- E1: the 3-4-3 formation, top down ----------
const E_LAYERS = [[620, [442, 627, 812]], [1000, [350, 535, 720, 905]], [1380, [442, 627, 812]]];
// Step direction on each beat: forward (+x) for 4, back for 4, then forward/back on every beat.
const E_stepDir = n => n < 163 ? 1 : n < 167 ? -1 : (n % 2 ? 1 : -1);
function E_formOff(t) {
  let o = 0;
  for (let n = 159; n <= 170; n++) { const tn = beatT(n); if (t < tn) break; o += E_stepDir(n) * 44 * easeOut(clamp((t - tn) / (BEAT * .32))); }
  return o;
}
// Pulses: one wave per beat in the step direction (half-beat waves once it repeats).
function E_waves() {
  const w = [];
  for (let n = 158; n <= 170; n++) {
    if (n < 167) w.push({ t0: beatT(n), dur: BEAT, dir: E_stepDir(n) });
    else for (let h = 0; h < 2; h++) w.push({ t0: beatT(n) + h * BEAT / 2, dur: BEAT / 2, dir: h ? -1 : 1 });
  }
  return w;
}
const E_WAVES = E_waves();
function E_nodePos(t, l, k) {
  const L = E_LAYERS[l], dl = E_stepDir(beatN(t)) > 0 ? l : 2 - l;   // ripple: the leading layer moves first
  return [L[0] + E_formOff(t - dl * BEAT * .07), L[1][k]];
}
function E_formation(t, o = {}) {
  const fl = o.floor || '#FFF1C2';
  // stage floor: paper boards seen from above
  X.fillStyle = fl; X.fillRect(-1600, -1600, W + 3200, H + 3200);
  X.save(); X.strokeStyle = 'rgba(80,50,20,.09)'; X.lineWidth = 3;
  for (let y = -1600; y < H + 1600; y += 92) { X.beginPath(); X.moveTo(-1600, y); X.lineTo(W + 1600, y); X.stroke(); }
  for (let y = -1600, r = 0; y < H + 1600; y += 92, r++) for (let x = -1600 + (r % 3) * 270; x < W + 1600; x += 820) { X.beginPath(); X.moveTo(x, y); X.lineTo(x, y + 92); X.stroke(); }
  X.restore();
  if (o.dots !== null) htGrad(() => X.rect(-1600, -1600, W + 3200, H + 3200), o.dots || PAL.yellow, 1000, 620, 1000 + 1300, 620 + 700, { step: 26, maxR: 10, bounds: [-400, -300, W + 800, H + 600], alpha: .5, gamma: .8 });
  // ink edges between layers
  const P = E_LAYERS.map((L, l) => L[1].map((_, k) => E_nodePos(t, l, k)));
  for (let l = 0; l < 2; l++) for (const a of P[l]) for (const b of P[l + 1]) inkStroke(() => { X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }, PAL.ink, 5, { alpha: .8 });
  // travelling pulses (comets along every edge), and the arrival glow per layer
  const glow = [0, 0, 0], gcol = [PAL.yellow, PAL.yellow, PAL.yellow];
  for (const w of E_WAVES) {
    const p = (t - w.t0) / w.dur; if (p < -.01 || p > 1.6) continue;
    const col = w.dir > 0 ? PAL.yellow : PAL.pink;
    for (let seg = 0; seg < 2; seg++) {
      const u = clamp(p * 2 - seg);
      if (u <= 0 || u >= 1) continue;
      const l = w.dir > 0 ? seg : 1 - seg, from = w.dir > 0 ? l : l + 1, to = w.dir > 0 ? l + 1 : l;
      for (const a of P[from]) for (const b of P[to]) {
        const hx = lerp(a[0], b[0], u), hy = lerp(a[1], b[1], u), u0 = Math.max(0, u - .3), tx = lerp(a[0], b[0], u0), ty = lerp(a[1], b[1], u0);
        inkStroke(() => { X.beginPath(); X.moveTo(tx, ty); X.lineTo(hx, hy); }, col, 12, { op: 'source-over' });
        cut(() => { X.beginPath(); X.arc(hx, hy, 13, 0, TAU); }, { fill: col, lift: 3, stroke: PAL.ink, sw: 3 });
      }
    }
    for (let s = 0; s < 3; s++) { const l = w.dir > 0 ? s : 2 - s, ta = w.t0 + s * w.dur / 2, g = hit(t, ta, .3); if (g > glow[l]) { glow[l] = g; gcol[l] = col; } }
  }
  // the dancers
  let i = 0;
  E_LAYERS.forEach((L, l) => L[1].forEach((y, k) => {
    const [x] = P[l][k], hk = pulse(t, .3), idx = i++;
    E_clawdTop(x, y, 128, { hat: CLAWD_HATS[idx % 4], squash: hk * .5 * (glow[l] > .1 ? 1.4 : 1), step: beatF(t) * 2 + idx * .5, arms: glow[l] > .2 ? [1, 1] : [.2, .2], glow: glow[l], glowCol: gcol[l], eyes: glow[l] > .25 ? 'happy' : 'open' });
  }));
  // the idol conducts at the output side, facing the formation
  if (o.idol !== false) {
    const b = beatF(t), sw = Math.sin(b * Math.PI);
    E_idolTop(1720 + E_formOff(t) * .3, 627, 68, { rot: Math.PI / 2, armR: .25 + .75 * Math.abs(sw), armL: .9 - .5 * Math.abs(sw), baton: true });
  }
}
// Small MACHINE counter, bottom left (the epochs tick with the beat).
function E_epoch(t, col = PAL.ink) {
  const ep = Math.max(1, beatN(t) - 157);
  rtext(`EPOCH ${String(ep).padStart(3, '0')}  ·  loss ${(2.3 / ep).toFixed(4)}`, 90, 1030, { font: FONT.monoB(30), color: col, op: 'source-over' });
}
// E1a: FORWARD MLP →
shot(73.0, beatT(163), (t, lt) => {
  const ws = wordTimes(LY[23]), kick = KICK(t);
  camBegin({ zoom: 1 + lt * .03 + kick * .012, x: 1040, y: 550, shake: kick * 4 });
  E_formation(t, { floor: '#FFF1C2', dots: PAL.yellow });
  camEnd();
  const f = FONT.hero(220), wF = textW('FORWARD', f);
  stampText('FORWARD', 90, 240, t, ws[0].t, { font: f, color: PAL.ink, mis: [8, 6, PAL.pink] });
  const tM = ws[1].t - .03, st = stampK(t, tM, .14);
  if (st) withT(90 + wF + 70 + 170, 160, -.05, st.s, () => {
    cut(() => pathPoly([[-170, -86], [170, -92], [176, 84], [-168, 90]]), { fill: PAL.pink, lift: 10 });
    rtext('MLP', 0, 58, { font: FONT.logo(150), color: PAL.paperHi, align: 'center', op: 'source-over', alpha: st.a });
  });
  const ak = easeOut(clamp((t - tM - .12) / .25));
  if (ak > 0) E_arrow(90 + wF + 480, 158, 300 * ak + 40 * pulse(t, .4), 110, 1, PAL.orange, { lift: 10 });
  E_epoch(t);
}, { seed: 51, inT: 'tear', inDur: .45 });
// E1b: ← BACKWARD
shot(beatT(163), beatT(165), (t, lt) => {
  const ws = wordTimes(LY[23]), kick = KICK(t);
  camBegin({ zoom: 1.1 - lt * .04 + kick * .012, x: 1000, y: 585, rot: -.03, shake: kick * 4 });
  E_formation(t, { floor: '#FFD9E6', dots: PAL.pink });
  camEnd();
  const tB = ws[2].t - .03, ak = easeOut(clamp((t - tB) / .2));
  if (ak > 0) E_arrow(90 + 330, 158, 330 * ak, 110, -1, PAL.blue, { lift: 10 });
  stampText('BACKWARD', 470, 240, t, tB, { font: FONT.hero(220), color: PAL.ink, mis: [8, 6, PAL.blue] });
  E_epoch(t);
}, { seed: 52, inT: 'jolt' });
// E1c: ↻ REPEAT: the formation snaps round a quarter turn on every 8th note
shot(beatT(165), beatT(167), (t, lt) => {
  const ws = wordTimes(LY[23]), kick = KICK(t), tR = ws[3].t - .03;
  const h = Math.max(0, (t - tR) / (BEAT / 2)), n = Math.floor(h), rot = t < tR ? 0 : (Math.PI / 2) * (n + easeOut(clamp((h - n) / .55)));
  X.fillStyle = '#FFE7A0'; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.orange, 1330, 560, 1330 - 1100, 560 + 600, { step: 26, maxR: 10, bounds: [0, 0, W, H], alpha: .45 });
  camBegin({ shake: kick * 5 });
  withT(1330, 560, rot, .8 + kick * .01, () => { X.translate(-1080, -627); E_formation(t, { floor: 'rgba(0,0,0,0)', dots: null, idol: false }); });
  camEnd();
  const k = backOut(clamp((t - tR) / .25));
  if (k > 0) withT(270, 360, (t - tR) * 2.2, k, () => E_loopArrow(0, 0, 130, 70, -Math.PI * .45, Math.PI * 1.25, PAL.pink, { lift: 12 }));
  stampText('REPEAT', 90, 800, t, tR, { font: FONT.hero(280), color: PAL.ink, mis: [9, 7, PAL.pink], stroke: PAL.paperHi, sw: 16, op: 'source-over' });
  E_epoch(t);
}, { seed: 53, inT: 'jolt' });
// E1d: front view: the same moves from the audience, the idol conducting, the loop behind them
shot(beatT(167), 77.5, (t, lt) => {
  const kick = KICK(t);
  X.fillStyle = PAL.yellow; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) ink(() => { X.beginPath(); X.moveTo(W / 2, 520); X.arc(W / 2, 520, 2200, i / 16 * TAU + t * .4, (i + .5) / 16 * TAU + t * .4); X.closePath(); }, PAL.orangeLt, { alpha: .55 });
  camBegin({ zoom: 1.05 + lt * .06 + kick * .015, x: W / 2, y: 560, shake: kick * 5 });
  E_loopArrow(W / 2, 470, 380, 90, -Math.PI * .5 + t * 2.5, Math.PI * 1.15 + t * 2.5, PAL.pink, { lift: 16 });
  cut(() => { X.beginPath(); X.moveTo(-400, 820); X.lineTo(W + 400, 820); X.lineTo(W + 400, 1500); X.lineTo(-400, 1500); X.closePath(); }, { fill: '#F6E3B0', lift: 10 });
  for (let i = 0; i < 5; i++) {
    const n = beatN(t), dir = E_stepDir(n), sc = 1 + dir * .08 * easeOut(clamp(beatP(t) / .3)) * (i % 2 ? -1 : 1), cd = clawdDance(t, 'fwdbwd', i);
    clawd(260 + i * 350, 900 + (sc - 1) * 300, 190 * sc, { ...cd, hat: CLAWD_HATS[i % 4], eyes: pulse(t, .3) > .5 ? 'happy' : 'open', arms: [.5 + .5 * pulse(t, .3), .5 + .5 * pulse(t, .3)] });
  }
  idolBody(W / 2, 700, 30, dance(t, 'pdoom'), { face: { eyes: 'wink', mouthShape: 'grin', mouth: clamp(VOX(t) * 1.3 - .2) } });
  camEnd();
  rtext('for epoch in range(∞):', 90, 110, { font: FONT.monoB(44), color: PAL.ink, op: 'source-over' });
  E_epoch(t);
}, { seed: 54, inT: 'jolt' });

// ---------- E2: the chalkboard wall. Math is getting eaten ----------
const E_EQ = ['|p − q| = 1', 'u(n) ≤ n^(1+c/log log n)', 'e^(iπ) + 1 = 0', '∑ 1/p = ∞', 'R(5,5) ≤ 46', 'χ(ℝ²) ∈ {5,6,7}', '4/n = 1/a + 1/b + 1/c',
  '∀ε > 0 ∃N', 'Θ(n^(4/3))', 'lim sup = ∞', 'r₃(N) = o(N)', '∑ 1/aₙ = ∞ ⇒ AP?', 'x² + y² = 1', 'O(n log n)', '∫ f dμ', 'P(n) ~ ?', '∃k: 2ᵏ + 1', 'd(x, y) = 1', 'n → ∞', '1946'];
function E_board(t, seed = 0) {
  X.fillStyle = PAL.blueDk; X.fillRect(-800, -800, W + 1600, H + 1600);
  htGrad(() => X.rect(-800, -800, W + 1600, H + 1600), PAL.paperHi, 300, 200, 1600, 1000, { step: 22, maxR: 4, bounds: [-200, -200, W + 400, H + 400], alpha: .12, op: 'source-over' });
  // erased chalk smudges
  for (let i = 0; i < 7; i++) ink(() => { X.beginPath(); X.ellipse(hash(i * 3 + seed) * W, hash(i * 7 + seed) * H, 260, 70, sjit(i, .4), 0, TAU); }, PAL.paperHi, { alpha: .05, op: 'source-over' });
  // equations everywhere
  for (let i = 0; i < 34; i++) {
    const cx = (i % 6) * 340 + 40 + hash(i * 5.3 + seed) * 120, cy = Math.floor(i / 6) * 175 + 110 + hash(i * 2.1 + seed) * 60;
    const s = E_EQ[(i * 7 + seed) % E_EQ.length], f = i % 3 ? FONT.serifI(46) : FONT.mono(34);
    withT(cx, cy, sjit(i + seed, .05), 1, () => rtext(s, 0, 0, { font: f, color: '#E9E6DA', op: 'source-over', alpha: .3 + hash(i + seed) * .2 }));
  }
}
// Tick times for the Erdős checklist: every beat, then every 8th after "obsolete", then 16ths.
const E_TICKS = (() => { const o = []; for (let n = 169; n < 173; n++) o.push(beatT(n)); for (let q = 173 * 2; q < 175 * 2; q++) o.push(beatT(q / 2)); for (let q = 175 * 4; q < 177.5 * 4; q++) o.push(beatT(q / 4)); return o; })();
function E_checklist(t, x, y) {
  const n = E_TICKS.filter(v => v <= t).length, rows = 10, rh = 62;
  const scroll = Math.max(0, n - 7);
  withT(x, y, -.035, 1, () => {
    cut(() => pathPoly([[-210, -400], [214, -396], [210, 402], [-206, 398]]), { fill: PAL.paperHi, lift: 14 });
    tape(0, -398, 120, .03);
    rtext('ERDŐS', -180, -300, { font: FONT.hero(96), color: PAL.ink });
    rtext('PROBLEMS', -180, -236, { font: FONT.monoB(40), color: PAL.ink });
    rtext(`solved: ${n}`, 180, -236, { font: FONT.monoB(26), color: PAL.red, align: 'right' });
    X.save(); X.beginPath(); X.rect(-205, -205, 410, rows * rh + 4); X.clip();
    for (let r = 0; r < rows + 1; r++) {
      const idx = scroll + r, yy = -170 + r * rh, done = idx < n, tk = done ? E_TICKS[idx] : 0;
      rtext(`#${idx + 1}`, -180, yy + 14, { font: FONT.monoB(34), color: PAL.ink });
      inkStroke(() => { X.beginPath(); X.moveTo(-70, yy + 12); X.lineTo(100, yy + 12); }, PAL.ink, 3, { dash: [4, 9], alpha: .5 });
      inkStroke(() => rrect(120, yy - 20, 44, 44, 4), PAL.ink, 4);
      if (done) {
        const k = clamp((t - tk) / .1), s = lerp(1.7, 1, easeOut(k));
        withT(142, yy + 2, -.1, s, () => ink(() => pathPoly([[-26, -2], [-14, -12], [-4, 4], [26, -34], [34, -22], [-4, 26]]), PAL.red, { alpha: clamp(k * 3), op: 'multiply' }));
      }
    }
    X.restore();
    // the rubber stamp doing the ticking: presses on each tick, hops to the next row
    if (n > 0 && n < E_TICKS.length + 1) {
      const last = E_TICKS[n - 1], nxt = E_TICKS[n] ?? last + BEAT, p = clamp((t - last) / Math.max(.05, nxt - last));
      const r0 = n - 1 - scroll, r1 = n - scroll, ry = lerp(-170 + r0 * rh, -170 + r1 * rh, easeInOut(p)), up = Math.sin(p * Math.PI) * 60 + (1 - hit(t, last, .08)) * 10;
      withT(160, ry - 40 - up, .15, 1, () => {
        cut(() => rrect(-40, -12, 80, 30, 6), { fill: PAL.red, lift: 12 });
        cut(() => rrect(-14, -80, 28, 70, 6), { fill: '#8A5A34', lift: 12 });
        cut(() => { X.beginPath(); X.arc(0, -92, 26, 0, TAU); }, { fill: '#6A3F22', lift: 12 });
      });
    }
  });
}
function E_placard(x, y, s = 1) {
  withT(x, y, .01, s, () => {
    cut(() => rrect(-330, -200, 660, 400, 6), { fill: '#EFE6D2', lift: 16, stroke: '#C9B98E', sw: 6 });
    for (const [px, py] of [[-305, -175], [305, -175], [-305, 175], [305, 175]]) cut(() => { X.beginPath(); X.arc(px, py, 9, 0, TAU); }, { fill: PAL.yellow, lift: 2, stroke: PAL.orangeDk, sw: 2 });
    rtext('GALLERY 3 · EARLY COMPUTING', -290, -148, { font: FONT.mono(20), color: PAL.ink2 });
    rtext('VON NEUMANN', -290, -84, { font: FONT.uiB(56), color: PAL.ink });
    rtext('ARCHITECTURE, 1945', -290, -24, { font: FONT.uiB(46), color: PAL.ink });
    rtext('the stored-program computer. ink on paper.', -290, 22, { font: FONT.serifI(30), color: PAL.ink2 });
    // a tiny block diagram: CPU ⇄ MEMORY, I/O
    const box = (bx, label, w) => { inkStroke(() => rrect(bx, 60, w, 80, 6), PAL.ink, 4); rtext(label, bx + w / 2, 110, { font: FONT.monoB(24), color: PAL.ink, align: 'center' }); };
    box(-290, 'CPU', 140); box(-60, 'MEMORY', 170); box(200, 'I/O', 90);
    inkStroke(() => { X.beginPath(); X.moveTo(-150, 100); X.lineTo(-60, 100); X.moveTo(110, 100); X.lineTo(200, 100); }, PAL.ink, 4);
    rtext('⇄', -105, 92, { font: FONT.mono(26), color: PAL.ink, align: 'center' }); rtext('⇄', 155, 92, { font: FONT.mono(26), color: PAL.ink, align: 'center' });
  });
}
const E_HEADS = [
  { t: beatT(169), x: 1590, y: 290, w: 560, title: 'AI DISPROVES ERDŐS UNIT DISTANCE CONJECTURE (1946)', kicker: 'may 20 2026', sub: '125-page disproof', big: 44, rot: -.04 },
  { t: beatT(171), x: 1560, y: 610, w: 520, title: 'ERDŐS PROBLEMS KEEP FALLING', kicker: '2026 · one after another', big: 54, rot: .035 },
  { t: beatT(172), x: 1620, y: 880, w: 500, title: 'MATH IS GETTING EATEN', kicker: 'opinion', big: 50, rot: -.02 },
  { t: beatT(175), x: 1480, y: 450, w: 480, title: 'ANOTHER ERDŐS PROBLEM FALLS', kicker: 'this week', big: 48, rot: .06 },
  { t: beatT(176), x: 1650, y: 760, w: 460, title: 'AND ANOTHER', kicker: 'same week', big: 60, rot: -.07 },
  { t: beatT(177), x: 1520, y: 200, w: 520, title: 'WHO CHECKS THE PROOFS?', kicker: 'erdős problems · 2026', big: 48, rot: .03 },
];
function E_wall(t, o = {}) {
  const ws = wordTimes(LY[24]);
  E_board(t, 0);
  // the lyric in chalk: now von Neumann’s (OBSOLETE is the stamp)
  const f = FONT.serifI(150); let x = 560, y = 210;
  ws.slice(0, 3).forEach((w, i) => {
    const txt = w.w.replace("'", '’'), a = clamp((t - w.t + .03) / .1);
    if (i === 2) { x = 600; y = 380; }
    if (a > 0) rtext(txt, x, y + (1 - a) * 12, { font: f, color: '#F4F1E8', op: 'source-over', alpha: a * (.9 + jit(x, .06)) });
    x += textW(txt + ' ', f);
  });
  E_checklist(t, 300, 600);
  E_placard(960, 680, 1);
  for (const h of E_HEADS) if (!o.maxHead || h.t < o.maxHead) headline(h.x, h.y, h.w, h.title, { kicker: h.kicker, sub: h.sub, big: h.big, rot: h.rot, t, t0: h.t });
  stamp(960, 680, 'OBSOLETE', t, ws[3].t - .03, { size: 150, rot: -.17, color: PAL.red, op: 'source-over' });
}
// E2a: wide: the wall, the checklist starts ticking, the headlines slap on
shot(77.5, 79.22, (t, lt) => {
  const kick = KICK(t);
  camBegin({ zoom: 1.02 + lt * .03 + kick * .012, x: W / 2, y: 545, shake: kick * 4 });
  E_wall(t, { maxHead: beatT(174) });
  camEnd();
}, { seed: 55, dark: true, inT: 'jolt' });
// E2b: punch in: OBSOLETE slams across the placard
shot(79.22, beatT(175), (t, lt) => {
  const ws = wordTimes(LY[24]), tO = ws[3].t - .03, kick = KICK(t), slam = hit(t, tO, .35);
  camBegin({ zoom: 1.75 + lt * .05 - slam * .06, x: 960, y: 640, rot: -.02, shake: kick * 4 + slam * 26 });
  E_wall(t, { maxHead: beatT(174) });
  // chalk dust puff from the slam
  if (t > tO) for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.1) * TAU, d = easeOut(clamp((t - tO) / .5)) * (160 + hash(i) * 260), r = (1 - clamp((t - tO) / .7)) * (6 + hash(i * 5) * 10);
    if (r > .5) ink(() => { X.beginPath(); X.arc(960 + Math.cos(a) * (240 + d), 680 + Math.sin(a) * (120 + d * .6), r, 0, TAU); }, PAL.paperHi, { op: 'source-over', alpha: .8 });
  }
  camEnd();
}, { seed: 56, dark: true, inT: 'jolt', joltColor: PAL.red });
// E2c: pull back: the checklist runs away, headlines pile up, chalk pages tear off and fly
shot(beatT(175), 81.4, (t, lt) => {
  const kick = KICK(t);
  camBegin({ zoom: .96 - lt * .03 + kick * .012, x: W / 2, y: 540, rot: .015, shake: kick * 5 });
  E_wall(t);
  // torn chalk pages fly across and away (math getting eaten)
  [[beatT(175) + .05, 300, -.3], [beatT(176), 640, .25], [beatT(177), 180, -.15], [beatT(177.5), 820, .35]].forEach(([t0, y0, sp], i) => {
    const k = (t - t0) / .7; if (k < 0 || k > 1) return;
    const px = lerp(-300, W + 500, easeIn(k)), py = y0 - k * 220 + Math.sin(k * 6 + i) * 40;
    withT(px, py, sp + k * 2.4 * (i % 2 ? -1 : 1), 1 - k * .3, () => {
      cut(() => pathPoly([[-190, -130], [190, -126], [184, 128], [30, 118], [-10, 134], [-190, 126]]), { fill: PAL.blueDk, lift: 22, stroke: '#E9E6DA', sw: 3 });
      for (let j = 0; j < 3; j++) rtext(E_EQ[(i * 5 + j * 3) % E_EQ.length], -160, -60 + j * 64, { font: FONT.serifI(40), color: '#E9E6DA', op: 'source-over', alpha: .8 });
    });
  });
  camEnd();
}, { seed: 57, dark: true, inT: 'jolt' });

// ---------- E3: the sharp left turn ----------
// The road: straight up x=960, a hairpin to the left around (760, 420), then straight down x=560.
const E_R1 = 1280, E_RH = Math.PI * 200;
function E_roadAt(s) {
  if (s < E_R1) return [960, 1700 - s, -Math.PI / 2];
  if (s < E_R1 + E_RH) { const a = -(s - E_R1) / 200; return [760 + Math.cos(a) * 200, 420 + Math.sin(a) * 200, a - Math.PI / 2]; }
  return [560, 420 + (s - E_R1 - E_RH), -3 * Math.PI / 2];
}
function E_roadS(t) {
  const K = [[81.4, 380], [82.2, E_R1 - 20], [82.6, E_R1 + E_RH + 30], [83.05, E_R1 + E_RH + 620]];
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
  return K[K.length - 1][1] + (t - K[K.length - 1][0]) * 1300;
}
function E_roadPath(off) {
  X.beginPath(); X.moveTo(960 + off, 2400); X.lineTo(960 + off, 420); X.arc(760, 420, 200 + off, 0, -Math.PI, true); X.lineTo(560 - off, 2400);
}
shot(81.4, beatT(181), (t, lt) => {
  const ws = wordTimes(LY[25]), kick = KICK(t), s = E_roadS(t), [px, py, hd] = E_roadAt(s);
  const [cx, cy, ch] = E_roadAt(E_roadS(t - .09)), whip = clamp((t - 82.1) / .5), whipV = bump(whip);
  const rot = -(ch + Math.PI / 2) * .42;
  X.fillStyle = '#F7E3A1'; X.fillRect(0, 0, W, H);
  camBegin({ x: cx + Math.cos(ch) * 160 - 120, y: cy + Math.sin(ch) * 160, zoom: 1.05 - whipV * .12, rot, shake: kick * 4 + whipV * 10 });
  X.fillStyle = '#F7E3A1'; X.fillRect(-1400, -1400, 4200, 4600);
  htGrad(() => X.rect(-1400, -1400, 4200, 4600), PAL.yellow, 760, 420, 1900, 1400, { step: 30, maxR: 11, bounds: [-600, -700, 2600, 3200], alpha: .7 });
  // paper stones and reflector posts
  for (let i = 0; i < 26; i++) { const x = -400 + hash(i * 3.7) * 2600, y = -600 + hash(i * 9.1) * 3000; if (Math.abs(x - 760) < 420 && y > 150) continue; cut(() => pathPoly(ellPts(x, y, 30 + hash(i) * 40, 20 + hash(i * 2) * 26, 9, 2, i)), { fill: '#E4D3A8', lift: 5 }); }
  // the road
  X.save(); E_roadPath(0); X.lineWidth = 300; X.strokeStyle = 'rgba(40,25,10,.3)'; X.lineJoin = 'round'; X.translate(8, 16); X.stroke(); X.restore();
  inkStroke(() => E_roadPath(0), PAL.ink2, 290, { cap: 'butt' });
  inkStroke(() => E_roadPath(128), PAL.paperHi, 8, { cap: 'butt' });
  inkStroke(() => E_roadPath(-128), PAL.paperHi, 8, { cap: 'butt' });
  inkStroke(() => E_roadPath(0), PAL.yellow, 10, { cap: 'butt', dash: [50, 46] });
  // skid marks from the hairpin to where she is now
  const sk0 = E_R1 - 60;
  if (s > sk0) for (const side of [-1, 1]) {
    X.save(); X.beginPath();
    for (let q = sk0; q <= s; q += 12) {
      const [x, y, h] = E_roadAt(q), drift = 26 * bump(clamp((q - sk0) / (E_RH + 120))) + 12;
      const ox = x - Math.cos(h) * drift * .8 + Math.cos(h + Math.PI / 2) * side * 22 - Math.sin(h) * 0, oy = y - Math.sin(h) * drift * .8 + Math.sin(h + Math.PI / 2) * side * 22;
      if (q === sk0) X.moveTo(ox, oy); else X.lineTo(ox, oy);
    }
    X.globalCompositeOperation = 'multiply'; X.strokeStyle = 'rgba(20,16,22,.75)'; X.lineWidth = 13; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); X.restore();
  }
  // the ↰ sign pops up at the corner on "left"
  const sk = backOut(clamp((t - ws[1].t + .02) / .25));
  if (sk > 0) withT(1190, 330, -rot, sk, () => {
    cut(() => rrect(-8, 0, 16, 140, 4), { fill: PAL.ink2, lift: 10 });
    cut(() => pathPoly([[0, -120], [120, 0], [0, 120], [-120, 0]]), { fill: PAL.yellow, lift: 16, stroke: PAL.ink, sw: 8 });
    inkStroke(() => { X.beginPath(); X.moveTo(22, 62); X.lineTo(22, -22); X.lineTo(-28, -22); }, PAL.ink, 22, { cap: 'butt' });
    ink(() => pathPoly([[-62, -22], [-24, -56], [-24, 12]]), PAL.ink, { op: 'source-over' });
  });
  // smoke puffs off the back wheel through the turn
  for (let i = 0; i < 14; i++) {
    const tq = 82.15 + i * .04; if (t < tq || t > tq + .7) continue;
    const [x, y, h] = E_roadAt(E_roadS(tq)), k = (t - tq) / .7, r = 20 + k * 70;
    ink(() => { X.beginPath(); X.arc(x - Math.cos(h) * 90 + sjit(i, 30), y - Math.sin(h) * 90 + sjit(i + 5, 30), r, 0, TAU); }, PAL.paperHi, { op: 'source-over', alpha: .75 * (1 - k) });
  }
  // her, on the scooter; the tail slides out through the hairpin
  const drift = s > E_R1 - 40 && s < E_R1 + E_RH + 60 ? .55 * bump(clamp((s - E_R1 + 40) / (E_RH + 100))) : 0;
  E_scooterTop(px, py, 210, hd + Math.PI / 2 - drift, {});
  camEnd();
  // whip-pan streaks
  if (whipV > .05) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); for (let i = 0; i < 40; i++) { const y = hash(i * 3.3) * H, x = hash(i * 7.7) * W, l = 300 + hash(i) * 600; X.globalAlpha = whipV * .5; X.fillStyle = i % 3 ? PAL.paperHi : PAL.ink2; X.fillRect(x - l / 2, y, l, 4 + hash(i * 2) * 8); } X.restore(); }
  // SHARP / LEFT / TURN stacked on the left
  const f = FONT.hero(230), o = { font: f, color: PAL.ink, mis: [8, 6, PAL.pink], stroke: PAL.paperHi, sw: 16, op: 'source-over' };
  stampText('SHARP', 80, 290, t, ws[0].t, o);
  stampText('LEFT', 80, 530, t, ws[1].t - .03, { ...o, color: PAL.pink, mis: [8, 6, PAL.ink] });
  stampText('TURN', 80, 770, t, ws[2].t - .03, { ...o, rot: -.06 });
  if (t > ws[3].t) rtext('and…', 90, 860, { font: FONT.serifI(60), color: PAL.ink, op: 'source-over', alpha: clamp((t - ws[3].t) / .1), stroke: PAL.paperHi, sw: 8 });
}, { seed: 58, inT: 'jolt' });
// E3b: tilt up from the road: NEXT fills the sky, looking at her. *there you are*
shot(beatT(181), 85.0, (t, lt) => {
  const ws = wordTimes(LY[25]), kick = KICK(t), tilt = expoOut(clamp((t - 83.03) / .5)), rise = easeOut(clamp((t - ws[4].t + .05) / .6));
  const bands = ['#FFE7B8', '#FFD08A', '#FFB36B', '#FF9A7A', '#F07C8C'];
  bands.forEach((c, i) => { X.fillStyle = c; X.fillRect(0, i * 180 - 60, W, 260); });
  camBegin({ zoom: 1.02 + lt * .025, x: W / 2, y: lerp(900, 540, tilt), shake: kick * 3 });
  nextSun(W / 2, lerp(780, 470, rise), 290 + rise * 25, { crown: true, pulse: kick, eyes: 9, look: [.55, .8], glow: 1 });
  // the ground: a paper hill with the road running to the horizon
  cut(() => { X.beginPath(); X.moveTo(-300, 860); X.quadraticCurveTo(W / 2, 800, W + 300, 860); X.lineTo(W + 300, 1600); X.lineTo(-300, 1600); X.closePath(); }, { fill: '#F6E9D2', lift: 14 });
  htGrad(() => { X.beginPath(); X.rect(-300, 820, W + 600, 800); }, PAL.orange, W / 2, 840, W / 2, 1300, { step: 18, maxR: 7, bounds: [-300, 820, W + 600, 500], alpha: .5 });
  cut(() => pathPoly([[1270, 836], [1330, 836], [1760, 1600], [1080, 1600]]), { fill: PAL.ink2, lift: 4 });
  inkStroke(() => { X.beginPath(); X.moveTo(1300, 840); X.lineTo(1420, 1600); }, PAL.yellow, 8, { dash: [30, 30] });
  // her, stopped on the road, looking up at it
  withT(1420, 1010, 0, 1, () => {
    for (const wx of [40, 170]) cut(() => { X.beginPath(); X.arc(wx, 34, 16, 0, TAU); }, { fill: PAL.ink, lift: 4 });
    cut(() => rrect(20, 6, 170, 24, 12), { fill: PAL.pink, lift: 6 });
    inkStroke(() => { X.beginPath(); X.moveTo(172, 16); X.lineTo(196, -120); X.moveTo(170, -120); X.lineTo(222, -118); }, PAL.ink, 9);
    idolBody(-40, -70, 17, { ...PZ.stand, head: -.25, lSh: .5, lEl: -.8, rSh: -.5, rEl: .6 }, { face: { eyes: t > ws[5].t ? 'star' : 'open', look: [0, -1], mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'o', blush: 1.2 } });
  });
  camEnd();
  // TENDER: there you are
  const f = FONT.serifI(190); let x = 110;
  ws.slice(4).forEach(w => {
    const a = clamp((t - w.t + .03) / .14);
    if (a > 0) rtext(w.w, x, 1010 - (1 - easeOut(a)) * 24, { font: f, color: PAL.ink, mis: [6, 5, PAL.pink], alpha: a });
    x += textW(w.w + ' ', f);
  });
}, { seed: 59, inT: 'jolt', joltColor: PAL.orange });

// ---------- E4: without a single CDR ----------
// The form lies on dusty ground, seen from above. Form centre (960, 560), size 760 × 980.
function E_form(t, o = {}) {
  withT(960, 560, .035, 1, () => {
    cut(() => pathPoly([[-380, -490], [382, -486], [378, 490], [-376, 486]]), { fill: PAL.paperHi, lift: 18 });
    X.save(); pathPoly([[-380, -490], [382, -486], [378, 490], [-376, 486]]); X.clip();
    X.fillStyle = 'rgba(0,0,0,.06)'; X.fillRect(-380, -490, 18, 980);
    rtext('CDR', -320, -300, { font: FONT.logo(170), color: PAL.ink, mis: [6, 4, PAL.orange] });
    rtext('FORM CDR-1 · REV 0', 330, -392, { font: FONT.monoB(24), color: PAL.ink, align: 'right' });
    rtext('file before deployment', 330, -356, { font: FONT.mono(22), color: PAL.ink2, align: 'right' });
    inkStroke(() => { X.beginPath(); X.moveTo(-320, -250); X.lineTo(330, -250); }, PAL.ink, 6);
    ['CAPABILITY EVALS', 'RED-TEAM RESULTS', 'RISK ASSESSMENT', 'MITIGATIONS', 'SIGN-OFF'].forEach((lab, i) => {
      const y = -150 + i * 120;
      inkStroke(() => rrect(-320, y - 34, 56, 56, 6), PAL.ink, 5);
      rtext(lab, -240, y + 6, { font: FONT.ui(34), color: PAL.ink });
      inkStroke(() => { X.beginPath(); X.moveTo(-240, y + 36); X.lineTo(330, y + 36); }, PAL.ink, 2, { alpha: .5 });
    });
    rtext('SIGNATURE ____________   DATE ______', -320, 460, { font: FONT.mono(24), color: PAL.ink2 });
    // skid-mark donuts: one old one, one being laid now
    const donut = (dx, dy, r, a0, a1, al) => { for (const dr of [-16, 16]) inkStroke(() => { X.beginPath(); X.arc(dx, dy, r + dr, a0, a1, true); }, 'rgba(20,16,22,.7)', 11, { op: 'multiply', alpha: al }); };
    donut(-170, 330, 120, 0, -TAU, .55);
    const a = o.donutA ?? TAU * 1.2;
    donut(200, 200, 170, -.3, -.3 - Math.min(TAU, a), .8);
    if (a > TAU) donut(215, 190, 160, -.3, -.3 - Math.min(TAU, a - TAU), .8);
    X.restore();
    if (o.stampT !== undefined) stamp(40, -20, '0 FILED', t, o.stampT, { size: 140, rot: -.2, color: PAL.red });
  });
}
function E_ground() {
  X.fillStyle = '#F3DDA0'; X.fillRect(-1400, -1400, W + 2800, H + 2800);
  htGrad(() => X.rect(-1400, -1400, W + 2800, H + 2800), PAL.orange, 960, 540, 2200, 1500, { step: 26, maxR: 9, bounds: [-500, -400, W + 1000, H + 800], alpha: .45 });
  for (let i = 0; i < 18; i++) { const x = hash(i * 4.1 + 2) * (W + 600) - 300, y = hash(i * 8.3 + 1) * (H + 400) - 200; if (Math.abs(x - 960) < 460 && Math.abs(y - 560) < 560) continue; cut(() => pathPoly(ellPts(x, y, 26 + hash(i) * 30, 16 + hash(i * 2) * 20, 9, 2, i)), { fill: '#E2C98C', lift: 4 }); }
}
// A tumbleweed seen from above: a scribbled ball rolling, with a bounce. (x, y) = centre.
function E_tumble(x, y, r, spin, bounce = 0) {
  ink(() => { X.beginPath(); X.ellipse(x + 20 + bounce * 30, y + 30 + bounce * 40, r * (1 - bounce * .15), r * .5 * (1 - bounce * .15), 0, 0, TAU); }, 'rgba(90,60,20,.35)');
  withT(x, y - bounce * 10, spin, 1 + bounce * .18, () => {
    cut(() => { X.beginPath(); X.arc(0, 0, r, 0, TAU); }, { fill: 'rgba(200,150,80,.25)', lift: 0 });
    X.save(); X.strokeStyle = '#8A5A2B'; X.lineWidth = 5; X.lineCap = 'round';
    for (let i = 0; i < 16; i++) { X.beginPath(); const a = hash(i * 2.3) * TAU, b = a + 1.5 + hash(i) * 2.5, rr = r * (.4 + hash(i * 5) * .6); X.arc(sjit(i, r * .2), sjit(i + 9, r * .2), rr, a, b); X.stroke(); }
    X.restore();
  });
}
// E4a: top down: she laps donuts on the unfiled form; a tumbleweed rolls through
shot(85.0, beatT(188), (t, lt) => {
  const kick = KICK(t);
  camBegin({ zoom: .98 + lt * .03 + kick * .01, x: W / 2, y: 545, rot: -.01, shake: kick * 4 });
  E_ground();
  const a = (t - 84.8) / (BEAT * 2) * TAU;
  E_form(t, { donutA: a });
  // the scooter orbiting the donut centre (form coords 200, 200 → world, rotated .035)
  const c = [960 + 200 * Math.cos(.035) - 200 * Math.sin(.035), 560 + 200 * Math.sin(.035) + 200 * Math.cos(.035)], ang = -.3 - a + .035;
  const sx = c[0] + Math.cos(ang) * 170, sy = c[1] + Math.sin(ang) * 170;
  for (let i = 1; i < 8; i++) { const aa = ang + i * .25, k = i / 8; ink(() => { X.beginPath(); X.arc(c[0] + Math.cos(aa) * 175 + Math.cos(aa) * i * 8, c[1] + Math.sin(aa) * 175 + Math.sin(aa) * i * 8, 24 + i * 9, 0, TAU); }, PAL.paperHi, { op: 'source-over', alpha: .75 * (1 - k) }); }
  E_scooterTop(sx, sy, 190, ang - Math.PI + .55, {});
  const tx = lerp(-160, W + 200, (t - 85.0) / 1.5), bn = Math.abs(Math.sin((t - 85) * 9));
  E_tumble(tx, 900 - bn * 20, 70, (t - 85) * 7, bn);
  camEnd();
  caption(t, { line: LY[26] });
}, { seed: 60, inT: 'jolt' });
// E4b: push in on the empty boxes; 0 FILED; then the form falls away and the drums drop out
shot(beatT(188), 88.45, (t, lt) => {
  const kick = t < 88.2 ? KICK(t) : 0, fall = easeIn(clamp((t - 87.85) / .6)), quiet = clamp((t - 88.0) / .45);
  X.fillStyle = '#F3DDA0'; X.fillRect(0, 0, W, H);
  camBegin({ zoom: lerp(1.3 + lt * .05, 1.0, easeInOut(quiet)), x: lerp(880, 960, quiet), y: lerp(430, 540, quiet), rot: .01, shake: kick * 4 });
  E_ground();
  withT(960, 560, fall * .5, 1 - fall * .75, () => { X.translate(-960, -560 + fall * 120); X.globalAlpha = 1 - fall * .6; E_form(t, { donutA: TAU * 2, stampT: beatT(190) - .02 }); });
  X.globalAlpha = 1;
  // the tumbleweed rolls across the form and away
  const tq = (t - 86.6) / 1.4;
  if (tq > 0 && tq < 1) { const bn = Math.abs(Math.sin(tq * 14)); E_tumble(lerp(-150, W + 250, tq), 780 - bn * 30, 90, tq * 12, bn * (1 - tq)); }
  // paper scraps drift up as it all goes quiet
  if (t > 87.9) for (let i = 0; i < 14; i++) {
    const k = clamp((t - 87.9 - hash(i) * .2) / .6), x = 300 + hash(i * 3.3) * 1300 + Math.sin(k * 4 + i) * 40, y = 900 - k * (300 + hash(i * 5) * 400);
    if (k > 0) withT(x, y, k * 3 + i, 1, () => cut(() => X.rect(-14, -9, 28, 18), { fill: i % 3 ? PAL.paperHi : '#E2C98C', lift: 6 }));
  }
  camEnd();
  caption(t, { line: LY[26] });
}, { seed: 61, inT: 'jolt' });
