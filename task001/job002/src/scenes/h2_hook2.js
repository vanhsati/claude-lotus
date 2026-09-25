// h2_hook2.js: H′ · Pre-hook 2 + Hook 2 (133.5–157.6). LY[45]–LY[55].
// Echoes hook 1 with the variations reversed: the wall-of-death drum spins CLOCKWISE and the silver Clawd rides it;
// then the red lacquer disc on the karst river again, now at GOLDEN HOUR, with the Clawd joining the masked dancers.
// Every "way" stamps an inlaid WAY that is pushed back into depth by the next one, trailing engraved echoes.
//
// H2a 133.50 drum, Clawd riding clockwise · COME THROUGH MY WAY        (sanded in from a silver panel)
// H2b 135.56 the world somersaults: quarter turns on the beat · MY WORLD DEY / SUMMERSAULT (letters flip)
// H2c 137.75 sanded open: the Clawd's bike on the wall, planks streaming · SHOW MY WAY, wheelie on the drop
// H2d 139.93 tender close-up: the idol under the gold nón lá · Girlie you don't know / how I feel / ooooo…
// H2e 142.11 sanded open to golden hour: disc on the karst river, the ring of dancers · WAY WAY WAY into the sun
// H2f 144.29 medium: idol + silver Clawd dancing side by side · COME MY WAY WAY
// H2g 146.47 top-down sunflower of dancers around the nón lá · BABY DON'T RUNAWAY, the ring bursts and snaps back
// H2h 149.20 the Clawd runs off along a lacquer boardwalk · RUN AWAY
// H2i 150.84 backlit hero: arms up against the low sun · OH BABY COME MY WAY WAY WAY
// H2j 153.02 top-down again, spinning the other way · WHEN YOU GO COME MY WAY WAY
// H2k 155.20 crane back, she points at us · COME LET ME SHOW YOU WHAT I MEAN COS…

const H2_EGG = '#F3EBDD';
const H2_beat = n => beatT(n);

// ---------------------------------------------------------------- small helpers
// gold flakes sprinkled in the lacquer (rắc vàng), in world space so they rotate with the camera
function H2_flakes(seed, n, box, a = 1) {
  X.save();
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed * 11.3 + i * 1.71), h2 = hash(seed * 3.7 + i * 2.93), h3 = hash(seed + i * 5.13);
    const x = box[0] + h1 * box[2], y = box[1] + h2 * box[3], s = 2 + h3 * h3 * 9;
    X.globalAlpha = a * (.25 + .6 * hash(i * 9.1 + seed));
    X.fillStyle = h3 > .8 ? LQ_PAL.goldHi : h3 > .35 ? LQ_PAL.gold : LQ_PAL.goldDk;
    X.save(); X.translate(x, y); X.rotate(h1 * 6); X.fillRect(-s / 2, -s / 2, s, s * (.6 + h2 * .6)); X.restore();
  }
  X.restore();
}
// a glint flash on a hard cut: a bright diagonal leaf-light band sweeping across the whole panel
function H2_glintCut(t, t0, dur = .22, a = .55) {
  if (t < t0 || t > t0 + dur) return;
  const k = (t - t0) / dur;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  X.fillStyle = `rgba(255,236,190,${a * (1 - k) * .35})`; X.fillRect(0, 0, W, H);
  const x = lerp(-600, W + 600, easeOut(k));
  const g = X.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, 'rgba(255,230,170,0)'); g.addColorStop(.5, `rgba(255,244,210,${a})`); g.addColorStop(1, 'rgba(255,230,170,0)');
  X.fillStyle = g; X.setTransform(SX, 0, SX * -.35, SX, 0, 0); X.fillRect(x - 260 + 200, 0, 520, H);
  X.restore();
}
// small eggshell words on a line, lit as they are sung (the rest of a lyric line around the big inlaid words)
function H2_words(t, ws, x, y, o = {}) {
  const size = o.size || 52, fnt = o.font ? o.font(size) : FONT.vnI(size), sp = size * .3;
  X.save(); X.font = fnt; X.textBaseline = 'alphabetic';
  const wd = ws.map(w => X.measureText(w.w).width), tot = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = o.align === 'center' ? x - tot / 2 : o.align === 'right' ? x - tot : x;
  const k0 = clamp((t - ws[0].t + .25) / .2);
  ws.forEach((w, i) => {
    const on = t >= w.t, f = on ? clamp((t - w.t) / .25) : 0;
    X.globalAlpha = (o.alpha ?? 1) * k0 * (on ? 1 : .28);
    X.shadowColor = 'rgba(0,0,0,.85)'; X.shadowBlur = 6; X.shadowOffsetY = 2;
    X.fillStyle = on && f < 1 ? lqMix(LQ_PAL.goldHi, H2_EGG, f) : H2_EGG;
    X.fillText(w.w, cx, y - (on ? (1 - easeOut(f)) * 6 : 0));
    cx += wd[i] + sp;
  });
  X.restore();
  return tot;
}
// an inlaid word that slams in at t0 and catches a travelling glint
function H2_big(str, x, y, t, t0, o = {}) {
  if (t < t0 - .02) return;
  const k = clamp((t - t0) / .15), s = lerp(1.28, 1, easeOut(k)) * (o.scale || 1);
  X.save(); X.translate(x, y); X.rotate((1 - k) * (hash(t0 * 7) - .5) * .06 + (o.rot || 0)); X.scale(s, s);
  lqInlayText(str, 0, 0, { font: o.font || FONT.vn, size: o.size || 180, align: o.align, material: o.material || 'gold', tracking: o.tracking,
    ...o, font: (o.font || FONT.vn)(o.size || 180), glint: o.glint ?? lerp(-.2, 1.1, clamp((t - t0) / .7)) });
  X.restore();
}
// WAY WAY WAY: each word stamps at the front; later ones push earlier ones back toward a vanishing point.
// Each word trails engraved gold echoes (the carved groove before it is inlaid).
function H2_ways(t, times, o) {
  const str = o.str || 'WAY', fnt = o.font || FONT.vn, K = o.k ?? .56, vp = o.vp, size0 = o.size || 240, items = [];
  times.forEach((ti, i) => {
    if (t < ti - .02) return;
    let d = (t - ti) * (o.drift ?? .1);
    for (let j = i + 1; j < times.length; j++) d += easeOut(clamp((t - times[j]) / .16)) * (o.push ?? 1);
    const age = t - ti;
    items.push({ d, word: true, ti, age });
    for (let g = 1; g <= (o.echoes ?? 3); g++) items.push({ d: d + g * .38 * easeOut(clamp(age / .45)), word: false, g, age });
  });
  items.sort((a, b) => b.d - a.d);
  for (const it of items) {
    const f = Math.pow(K, it.d), x = vp[0] + (o.x - vp[0]) * f, y = vp[1] + (o.y - vp[1]) * f, sz = size0 * f;
    if (sz < 6) continue;
    if (it.word) {
      const k = clamp(it.age / .14), s = lerp(1.3, 1, easeOut(k));
      X.save(); X.translate(x, y); X.scale(s, s);
      lqInlayText(str, 0, 0, { font: fnt(sz), size: sz, align: 'center', material: o.material || 'gold', glint: lerp(-.2, 1.1, clamp(it.age / .6)), tracking: sz * .02 });
      X.restore();
    } else {
      const a = (1 - it.g * .26) * clamp(it.age / .1) * (o.echoA ?? .8);
      X.save(); X.font = fnt(sz); X.textAlign = 'center'; X.textBaseline = 'alphabetic';
      X.globalAlpha = a * .55; X.lineWidth = Math.max(1, sz * .018); X.strokeStyle = '#050302'; X.strokeText(str, x + sz * .01, y + sz * .015);
      X.globalAlpha = a; X.lineWidth = Math.max(.8, sz * .01); X.strokeStyle = it.g === 1 ? LQ_PAL.goldHi : LQ_PAL.gold; X.strokeText(str, x, y);
      X.restore();
    }
  }
}
// a sanded cut: the new scene shows through scrubs rubbed into the old one
function H2_sandCut(t, t0, dur, drawNew, drawOld, seed, o = {}) {
  const k = easeInOut(clamp((t - t0) / dur));
  if (k >= 1 || t < t0 - 1) { drawNew(); return; }
  lqReveal(drawNew, drawOld, k, seed, { halo: '#7a4520', ...o });
}

// ---------------------------------------------------------------- the silver Clawd's bike (side view, facing +x)
function H2_bike(L, t, o = {}) {
  const wr = L * .19, wx = L * .38, spin = o.spin ?? t * 30, glint = o.glint;
  // headlight cone
  X.save(); X.globalCompositeOperation = 'lighter';
  const hl = X.createLinearGradient(L * .5, 0, L * 1.9, 0); hl.addColorStop(0, `rgba(255,236,190,${.45 * (o.light ?? 1)})`); hl.addColorStop(1, 'rgba(255,236,190,0)');
  X.fillStyle = hl; X.beginPath(); X.moveTo(L * .5, -L * .42); X.lineTo(L * 1.9, -L * .75); X.lineTo(L * 1.9, -L * .02); X.closePath(); X.fill(); X.restore();
  // shadow
  X.fillStyle = 'rgba(0,0,0,.45)'; X.beginPath(); X.ellipse(0, 0, L * .62, L * .045, 0, 0, TAU); X.fill();
  for (const sd of [-1, 1]) {
    const cx = sd * wx, cy = -wr;
    X.fillStyle = '#0b0807'; X.beginPath(); X.arc(cx, cy, wr, 0, TAU); X.fill();
    lqSilver(() => { X.arc(cx, cy, wr * .74, 0, TAU); X.arc(cx, cy, wr * .6, 0, TAU, true); }, { scale: L / 1600, glint, bevel: 1 });
    X.strokeStyle = 'rgba(210,214,220,.8)'; X.lineWidth = Math.max(1, L * .006); X.beginPath();
    for (let k = 0; k < 6; k++) { const a = spin + k / 6 * Math.PI; X.moveTo(cx + Math.cos(a) * wr * .6, cy + Math.sin(a) * wr * .6); X.lineTo(cx - Math.cos(a) * wr * .6, cy - Math.sin(a) * wr * .6); }
    X.stroke();
    lqGold(() => X.arc(cx, cy, wr * .12, 0, TAU), { scale: .12, glint: false, bevel: 0 });
  }
  // frame and fork
  inkStroke(() => { X.beginPath(); X.moveTo(-wx, -wr); X.lineTo(-L * .05, -L * .36); X.lineTo(L * .26, -L * .5); X.lineTo(wx, -wr); X.moveTo(-L * .05, -L * .36); X.lineTo(L * .02, -wr * .9); X.lineTo(-wx, -wr); }, '#C9CCD1', L * .022);
  // engine block (brown lacquer) and a gold exhaust
  lqLacquer(() => X.roundRect(-L * .14, -L * .33, L * .3, L * .17, L * .03), LQ_PAL.brownDk, { rim: 1, glint: false, bounds: [-L * .14, -L * .33, L * .3, L * .17] });
  lqGold(() => { X.moveTo(-L * .05, -L * .2); X.lineTo(-L * .5, -L * .26); X.lineTo(-L * .52, -L * .2); X.lineTo(-L * .06, -L * .14); X.closePath(); }, { scale: L / 1800, glint, bevel: 1 });
  // cinnabar tank with a gold stripe, black seat
  const tank = () => { X.moveTo(-L * .1, -L * .38); X.quadraticCurveTo(L * .05, -L * .52, L * .28, -L * .46); X.quadraticCurveTo(L * .3, -L * .36, L * .18, -L * .32); X.lineTo(-L * .1, -L * .32); X.closePath(); };
  lqLacquer(tank, LQ_PAL.cinnabar, { rim: 2, glint, bounds: [-L * .1, -L * .52, L * .4, L * .2], lift: 3 });
  inkStroke(() => { X.beginPath(); X.moveTo(-L * .05, -L * .41); X.quadraticCurveTo(L * .08, -L * .48, L * .25, -L * .43); }, LQ_PAL.gold, L * .012);
  lqLacquer(() => X.roundRect(-L * .34, -L * .41, L * .26, L * .06, L * .03), '#0d0a0a', { rim: 1, glint: false, bounds: [-L * .34, -L * .41, L * .26, L * .06] });
  // bars and the headlight
  inkStroke(() => { X.beginPath(); X.moveTo(L * .26, -L * .5); X.lineTo(L * .22, -L * .62); X.lineTo(L * .12, -L * .64); }, '#C9CCD1', L * .018);
  lqGold(() => X.arc(L * .33, -L * .45, L * .05, 0, TAU), { scale: .15, glint, bevel: 1 });
  X.fillStyle = '#FFF6D8'; X.beginPath(); X.arc(L * .345, -L * .45, L * .028, 0, TAU); X.fill();
}
// the Clawd on the bike: seat at local (−.2L, −.4L)
function H2_rider(L, t, o = {}) {
  H2_bike(L, t, o);
  lqClawd(-L * .12, -L * .38, L * .5, { lean: .12, arms: [.55, .55], glint: o.glint, look: .6, squash: o.squash || 0 });
}

// ---------------------------------------------------------------- the drum (top-down), spinning clockwise
function H2_drum(t, cx, cy, R, a, o = {}) {
  lqDrum(t, { x: cx, y: cy, r: R, rider: false, glint: o.glint });
  const rr = R * .8, spd = o.speed ?? 1;
  // the light trail (clockwise: behind the rider = smaller angles)
  X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
  for (let k = 0; k < 20; k++) {
    const f = k / 20, b0 = a - f * 1.9 * spd;
    X.strokeStyle = `rgba(246,${Math.round(210 - f * 120)},${Math.round(140 - f * 100)},${(1 - f) * .42})`; X.lineWidth = R * .035 * (1 - f * .8);
    X.beginPath(); X.arc(cx, cy, rr, b0 - .1 * spd, b0); X.stroke();
  }
  X.restore();
  // the rider on the wall: feet toward the wall, travelling clockwise (facing −x after the rotation)
  withT(cx + Math.cos(a) * (rr + R * .1), cy + Math.sin(a) * (rr + R * .1), a - Math.PI / 2, 1, () => { X.scale(-1, 1); H2_rider(R * .36, t, { glint: o.glint, spin: -t * 40 }); });
}

// ---------------------------------------------------------------- golden-hour stage
function H2_river(t, o = {}) {
  const r = lqKarstRiver(t, { time: 'gold', horizon: o.horizon ?? 600, sunX: o.sunX ?? .5, camX: o.camX || 0, rect: o.rect, seed: 2, glint: o.glint });
  const hz = r.horizon, R = o.rect || [0, 0, W, H], sx = R[0] + R[2] * (o.sunX ?? .5) - (o.camX || 0) * .05, sy = hz - R[3] * .3;
  // warm low-sun haze over the whole panel
  X.save(); X.globalCompositeOperation = 'screen';
  const g = X.createRadialGradient(sx, sy, 0, sx, sy, R[3] * .9);
  g.addColorStop(0, 'rgba(255,200,110,.38)'); g.addColorStop(.35, 'rgba(230,140,50,.14)'); g.addColorStop(1, 'rgba(120,50,10,0)');
  X.fillStyle = g; X.fillRect(R[0], R[1], R[2], R[3]);
  X.restore();
  return { hz, sun: [sx, sy] };
}
// a masked dancer or the silver Clawd on the ring, dancing on the beat (i = ripple offset)
function H2_dancerPose(t, i) {
  const b = beatF(t) - i * .125, n = Math.floor(b), p = b - n, k = easeOut(clamp(p / .35));
  const A = [[.15, .95], [.95, .15], [1, 1], [.3, .3]], a0 = A[((n - 1) % 4 + 4) % 4], a1 = A[(n % 4 + 4) % 4];
  return { arms: [lerp(a0[0], a1[0], k), lerp(a0[1], a1[1], k)], step: b * .5, lean: Math.sin(b * Math.PI) * .05, hop: Math.sin(clamp(p / .35) * Math.PI) };
}
function H2_ring(t, cx, cy, rx, ry, h, o = {}) {
  const n = o.n || 10, spin = o.spin ?? -.55, items = [];
  for (let i = 0; i < n; i++) {
    const ph = i / n * TAU + t * spin + (o.phase || 0), x = cx + Math.cos(ph) * rx, y = cy + Math.sin(ph) * ry, dep = (Math.sin(ph) + 1) / 2;
    const sc = lerp(.82, 1.1, dep), P = H2_dancerPose(t, i);
    if (i === (o.clawdIdx ?? 0) && o.clawd !== false) {
      items.push({ y, draw: () => lqClawd(x, y - P.hop * h * .06, h * .62 * sc, { arms: P.arms.map(a => a * .9), squash: P.hop * .3, lean: P.lean * 2, step: P.step, glint: o.glint }) });
    } else items.push({ y, draw: () => lqMaskDancer(x, y, h * sc, t, { arms: P.arms, step: P.step, lean: P.lean, flip: Math.cos(ph) > 0, mask: i % 5 === 3 ? 'gold' : 'egg' }) });
  }
  return items;
}
function H2_idol(t, x, ground, s, move, o = {}) {
  const P = o.pose || dance(t, move);
  idolBody(x, ground - 5.1 * s, s, P, { outfit: 'aodai', glint: o.glint, face: { hat: 'nonla', hatMat: 'gold', mouth: clamp(VOX(t) * 1.3 - .2), eyes: o.eyes || 'open', blush: .7, ...(o.face || {}) } });
}
// the whole golden-hour stage: river, disc, ring (depth sorted around the idol)
function H2_stage(t, o = {}) {
  const { hz, sun } = H2_river(t, o);
  const cx = o.cx ?? 960, cy = o.cy ?? hz + 190, rx = o.rx ?? 560, ry = o.ry ?? 120;
  lqRedDisc(cx, cy, rx, ry, { glint: o.glint });
  const items = H2_ring(t, cx, cy - ry * .08, rx * (o.ringK ?? .8), ry * (o.ringK ?? .8), o.h ?? 150, o);
  items.push({ y: cy, draw: () => H2_idol(t, cx, cy + 4, o.s ?? 26, o.move || 'groove', o) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
  return { hz, sun, cx, cy };
}

// ---------------------------------------------------------------- top-down: the nón lá and the sunflower ring
function H2_hatTop(x, y, r, rot, t, o = {}) {
  X.save(); X.translate(x, y); X.rotate(rot);
  // áo dài sleeves reaching out from under the hat
  const arm = o.arm ?? .5;
  for (const sd of [-1, 1]) withT(0, 0, sd > 0 ? 0 : Math.PI, 1, () => withT(0, 0, (arm - .5) * .8, 1, () => {
    lqLacquer(() => X.roundRect(r * .5, -r * .16, r * .95, r * .32, r * .12), LQ_PAL.cinnabar, { rim: 1, glint: false, bounds: [r * .5, -r * .16, r * .95, r * .32], lift: 4 });
    X.fillStyle = '#EFD9C0'; X.beginPath(); X.arc(r * 1.48, 0, r * .12, 0, TAU); X.fill();
  }));
  // sunflower petals of her crown peeking out around the brim
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * TAU + Math.sin(t * 3 + i) * .03;
    X.save(); X.rotate(a); X.fillStyle = i % 2 ? '#E0632A' : '#F08A3A'; X.beginPath(); X.ellipse(r * 1.02, 0, r * .2, r * .085, 0, 0, TAU); X.fill(); X.restore();
  }
  // the hat: gold leaf cone from above with ribs and rings, lit from the low sun
  X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = r * .12; X.shadowOffsetX = r * .06; X.shadowOffsetY = r * .08;
  X.fillStyle = '#6a4414'; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill(); X.restore();
  lqGold(() => X.arc(0, 0, r, 0, TAU), { scale: r / 900, glint: o.glint, bevel: 1.5 });
  const sg = X.createLinearGradient(-r, -r, r, r); sg.addColorStop(0, 'rgba(255,240,200,.28)'); sg.addColorStop(.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(40,20,5,.45)');
  X.fillStyle = sg; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill();
  X.strokeStyle = 'rgba(90,55,15,.55)'; X.lineWidth = Math.max(1, r * .012); X.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; X.moveTo(Math.cos(a) * r * .06, Math.sin(a) * r * .06); X.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  X.stroke();
  for (const k of [.35, .62, .86]) { X.strokeStyle = 'rgba(90,55,15,.5)'; X.beginPath(); X.arc(0, 0, r * k, 0, TAU); X.stroke(); }
  X.fillStyle = LQ_PAL.goldWhite; X.beginPath(); X.arc(-r * .02, -r * .02, r * .05, 0, TAU); X.fill();
  X.restore();
}
// top-down water: warm black lacquer with gold ripple rings that ring out on each beat
function H2_waterTop(t, cx, cy) {
  lqGround(t, { tone: 'brown', sheen: .8 });
  X.save(); X.globalCompositeOperation = 'screen';
  const g = X.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(200,120,40,.22)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,60,20,.15)');
  X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
  X.save(); X.lineWidth = 2;
  for (let k = 0; k < 6; k++) {
    const b = beatF(t) + k * .5, age = frac(b / 3), r = 430 + age * 900;
    X.strokeStyle = `rgba(246,227,161,${.22 * (1 - age)})`; X.beginPath(); X.arc(cx, cy, r, 0, TAU); X.stroke();
  }
  X.restore();
  H2_flakes(7, 120, [0, 0, W, H], .6);
}
function H2_sunflower(t, cx, cy, o = {}) {
  const Rd = o.r ?? 330, n = o.n ?? 12, ringR = (o.ringR ?? Rd * .95), h = o.h ?? 150, rot = o.rot ?? 0;
  lqRedDisc(cx, cy, Rd, Rd, { topdown: true, glint: o.glint, rings: [.8, .55] });
  for (let i = 0; i < n; i++) {
    const ph = i / n * TAU + rot, P = H2_dancerPose(t, i * .5), rr = ringR + (o.burst ? o.burst(i) : 0);
    const x = cx + Math.cos(ph) * rr, y = cy + Math.sin(ph) * rr;
    withT(x, y, ph + Math.PI / 2, 1, () => {
      if (i === 0) lqClawd(0, 0, h * .7, { arms: P.arms, squash: P.hop * .3, glint: o.glint, step: P.step });
      else lqMaskDancer(0, 0, h, t, { arms: P.arms, step: P.step, lean: P.lean, mask: i % 4 === 2 ? 'gold' : 'egg' });
    });
  }
  H2_hatTop(cx, cy, Rd * .34, (o.hatRot ?? rot * -.6), t, { glint: o.glint, arm: .5 + .5 * Math.sin(beatF(t) * Math.PI) });
}

// ================================================================= SHOTS
const H2_T = { a: 133.5, b: H2_beat(248), c: H2_beat(252), d: H2_beat(256), e: H2_beat(260), f: H2_beat(264), g: H2_beat(268), h: H2_beat(273), i: H2_beat(276), j: H2_beat(280), k: H2_beat(284), end: 157.6 };

// ---- H2a: the drum, the Clawd rides clockwise; COME THROUGH MY WAY
function H2_A(t) {
  const ws = wordTimes(LY[45]);   // And when you come through my way
  lqGround(t, { tone: 'black' });
  H2_flakes(3, 90, [0, 0, W, H], .5);
  const cx = 1330, cy = 560, R = 480, z = 1 + KICK(t) * .015 + (t - H2_T.a) * .02;
  camBegin({ x: W / 2, y: H / 2, zoom: z, shake: KICK(t) * 3 });
  withT(cx, cy, (t - H2_T.a) * .5, 1, () => H2_drum(t, 0, 0, R, t * 4.6, { glint: frac(t * .3) }));
  camEnd();
  H2_words(t, ws.slice(0, 3), 96, 190, { size: 58 });
  H2_big('COME', 90, 400, t, ws[3].t, { font: FONT.hero, size: 200 });
  H2_big('THROUGH', 90, 610, t, ws[4].t, { font: FONT.hero, size: 200 });
  H2_big('MY', 90, 820, t, ws[5].t, { font: FONT.hero, size: 200 });
  H2_ways(t, [ws[6].t], { x: 470, y: 820, size: 200, font: FONT.hero, vp: [cx, cy], k: .5, drift: .6 });
}
shot(H2_T.a, H2_T.b, (t) => {
  H2_sandCut(t, H2_T.a, .42, () => H2_A(t), () => {
    lqSilver(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H], glint: .5, lift: 0 });
  }, 61, { from: 'right', halo: '#3a2a22' });
}, { seed: 4501 });

// ---- H2b: the world somersaults, one quarter turn per beat, clockwise
function H2_B(t) {
  const ws = wordTimes(LY[46]);   // Oh e be like my world dey summersault
  let rot = (t - H2_T.b) * .15;
  for (let n = 248; n < 252; n++) rot += Math.PI / 2 * backOut(clamp((t - H2_beat(n)) / .28), 1.2);
  lqGround(t, { tone: 'black', sheen: .6 });
  camBegin({ x: W / 2, y: H / 2, rot, zoom: 1.02 + pulse(t) * .02 });
  H2_flakes(5, 260, [-700, -700, W + 1400, H + 1400], .9);
  H2_drum(t, W / 2, H / 2, 410, t * 5.4 - rot * .3, { glint: frac(t * .4), speed: 1.3 });
  camEnd();
  H2_words(t, ws.slice(0, 4), 70, 150, { size: 56 });
  H2_big('MY', 70, 370, t, ws[4].t, { font: FONT.hero, size: 190 });
  H2_big('WORLD', 70, 580, t, ws[5].t, { font: FONT.hero, size: 190 });
  H2_big('DEY', 70, 790, t, ws[6].t, { font: FONT.hero, size: 190 });
  // SUMMER / SAULT on the right; each letter does a somersault into place, one after another
  const t0 = ws[7].t, rows = [['SUMMER', 480], ['SAULT', 690]], fnt = FONT.hero(190);
  let li = 0;
  rows.forEach(([str, y]) => {
    X.save(); X.font = fnt; const L = layout(str, fnt, 4); X.restore();
    const x0 = W - 70 - L.width;
    L.forEach((c, i) => {
      const ti = t0 + li * .035; li++;
      if (t < ti) return;
      const k = clamp((t - ti) / .32), ang = (1 - easeOut(k)) * -TAU, cxc = x0 + c.x + c.w / 2, cyc = y - 70;
      X.save(); X.translate(cxc, cyc - bump(k) * 60); X.rotate(ang); X.scale(lerp(1.3, 1, easeOut(k)), lerp(1.3, 1, easeOut(k)));
      lqInlayText(c.ch, 0, 70, { font: fnt, size: 190, align: 'center', glint: lerp(-.2, 1.1, clamp((t - ti) / .6)) });
      X.restore();
    });
  });
  H2_glintCut(t, H2_T.b);
}
shot(H2_T.b, H2_T.c, (t) => H2_B(t), { seed: 4502 });

// ---- H2c: sanded open onto the drum wall; the Clawd's bike streams past the planks; wheelie on the drop
function H2_C(t) {
  const ws = wordTimes(LY[47]);   // When you show my way
  const t1 = 139.0, u = clamp((t - t1) / .35);
  const pos = 2600 * (Math.min(t, t1) - H2_T.c) + (t > t1 ? 160 * (t - t1) + 2440 * .35 * (1 - Math.pow(1 - u, 4)) / 4 : 0);
  // the wall: brown lacquer planks, a cinnabar safety band and a gold line
  lqLacquer(() => X.rect(0, 0, W, H), '#5b341d', { rim: 0, glint: .4, bounds: [0, 0, W, H] });
  X.save();
  for (let i = -1; i < 18; i++) {
    const pw = 128, x = i * pw - (pos % pw), tone = hash(Math.floor(i + pos / pw) * 3.3);
    X.fillStyle = lqMix('#4d2b17', '#8a5630', tone, .8); X.fillRect(x, 0, pw, H);
    X.fillStyle = 'rgba(15,8,4,.6)'; X.fillRect(x, 0, 4, H);
  }
  const vg = X.createLinearGradient(0, 0, 0, H); vg.addColorStop(0, 'rgba(10,5,2,.65)'); vg.addColorStop(.45, 'rgba(10,5,2,0)'); vg.addColorStop(1, 'rgba(10,5,2,.5)');
  X.fillStyle = vg; X.fillRect(0, 0, W, H);
  X.restore();
  lqLacquer(() => X.rect(0, 930, W, 46), LQ_PAL.cinnabar, { rim: 0, glint: .5, bounds: [0, 930, W, 46], mottle: .3 });
  inkStroke(() => { X.beginPath(); X.moveTo(0, 470); X.lineTo(W, 470); }, 'rgba(217,164,65,.6)', 3);
  // speed streaks (fade on the drop)
  const sp = 1 - u;
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const y = 80 + hash(i * 3.1) * 900, len = 200 + hash(i * 1.7) * 600, x = W - ((hash(i * 7.7) * 3000 + pos * (1 + hash(i) * .6)) % (W + len * 2)) + len;
    X.strokeStyle = `rgba(246,220,160,${(.08 + .18 * hash(i * 5)) * sp})`; X.lineWidth = 1 + hash(i * 9) * 3; X.beginPath(); X.moveTo(x, y); X.lineTo(x + len * sp, y); X.stroke();
  }
  X.restore();
  // the rider: bobbing on the planks, a wheelie when the beat drops out
  const wh = backOut(clamp((t - 139.25) / .3)) * .32 * (1 - easeIn(clamp((t - 139.78) / .15)));
  const bob = Math.sin(t * 38) * 4 * sp;
  withT(1080, 930 + bob, 0, 1, () => {
    withT(-620 * .38, -620 * .19, -wh, 1, () => { X.translate(620 * .38, 620 * .19); H2_rider(620, t, { glint: frac(t * .5), spin: -pos / 118 }); });
  });
  H2_words(t, ws.slice(0, 2), 96, 140, { size: 58 });
  H2_big('SHOW', 90, 350, t, ws[2].t, { size: 200 });
  H2_big('MY', 760, 350, t, ws[3].t, { size: 200 });
  H2_ways(t, [ws[4].t], { x: 1260, y: 350, size: 200, vp: [1900, 200], k: .5, drift: .7 });
}
shot(H2_T.c, H2_T.d, (t) => {
  H2_sandCut(t, H2_T.c, .4, () => H2_C(t), () => H2_B(t), 62, { from: 'left' });
}, { seed: 4503 });

// ---- H2d: the tender close-up
function H2_D(t) {
  const ws = wordTimes(LY[48]);   // Girlie you don't know how I feel ooooo…
  const lt = t - H2_T.d;
  lqGround(t, { tone: 'brown', sheenX: .3 + lt * .06 });
  // slow gold flakes drifting down behind her (warm bokeh of the drum lights)
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const x = 900 + hash(i * 2.3) * 1100, y = ((hash(i * 4.1) * 1300 + t * (20 + hash(i) * 30)) % 1300) - 110, r = 6 + hash(i * 7) * 26;
    const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(246,200,120,${.25 * hash(i * 3)})`); g.addColorStop(1, 'rgba(246,200,120,0)');
    X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
  }
  X.restore();
  const z = 1 + lt * .03;
  camBegin({ x: 1360, y: 600, zoom: z });
  X.translate(1360 - W / 2, 600 - H / 2);   // zoom about her face, keep her anchored
  const feel = ws[6].t;
  idolHead(1360, 640, 250, { hat: 'nonla', hatMat: 'gold', hatTilt: -.06, bust: true, eyes: t > feel - .05 && t < feel + .9 ? 'closed' : 'open',
    look: [-.25, .05], tilt: .05 + Math.sin(t * 1.3) * .02, mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: t > ws[7].t ? 'o' : 'smile', blush: .9 });
  camEnd();
  // warm rim light passing (the drum rider's headlamp going round behind her)
  const sw = frac((t - H2_T.d) / 2.18);
  X.save(); X.globalCompositeOperation = 'screen';
  const x = lerp(700, 2100, sw), g = X.createRadialGradient(x, 300, 0, x, 300, 700); g.addColorStop(0, 'rgba(255,210,140,.18)'); g.addColorStop(1, 'rgba(255,210,140,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
  // type: small, then the tender inlay in eggshell italic, then the held note letter by letter
  H2_words(t, ws.slice(0, 4), 100, 300, { size: 58 });
  {
    const fnt = FONT.vnI(170); X.save(); X.font = fnt; const sp = X.measureText(' ').width; X.restore();
    let x = 90;
    for (const w of ws.slice(4, 7)) {
      const k = easeOut(clamp((t - w.t) / .35));
      if (k > 0) lqInlayText(w.w, x, 540 + (1 - k) * 26, { font: fnt, size: 170, material: 'egg', glint: lerp(.1, .9, clamp((t - w.t) / 2)) });
      X.save(); X.font = fnt; x += X.measureText(w.w).width + sp; X.restore();
    }
  }
  const o0 = ws[7].t;
  if (t >= o0 - .02) {
    const n = Math.min(5, Math.floor((t - o0) / .12) + 1), str = 'o'.repeat(n) + (t > o0 + .7 ? '…' : '');
    lqInlayText(str, 96, 760, { font: FONT.vnI(170), size: 170, material: 'egg', tracking: 6 + (t - o0) * 12, glint: .5 });
  }
}
shot(H2_T.d, H2_T.e, (t) => { H2_D(t); H2_glintCut(t, H2_T.d, .3, .35); }, { seed: 4504 });

// ---- H2e: sanded open to golden hour; the ring on the red disc; WAY WAY WAY recede into the sun
function H2_E(t) {
  const ws = wordTimes(LY[49]);   // When you go come my way way way
  const lt = t - H2_T.e;
  camBegin({ x: W / 2, y: H / 2, zoom: 1.08 - lt * .02, shake: KICK(t) * 3 });
  const st = H2_stage(t, { horizon: 600, sunX: .5, camX: -lt * 40, cy: 800, rx: 540, ry: 115, h: 150, s: 24, glint: frac(t * .2), move: 'groove' });
  camEnd();
  H2_words(t, ws.slice(0, 5), W / 2, 110, { size: 58, align: 'center' });
  H2_ways(t, ws.slice(5).map(w => w.t), { x: W / 2, y: 1050, size: 230, vp: [st.sun[0], st.sun[1] + 40], k: .5 });
}
shot(H2_T.e, H2_T.f, (t) => {
  H2_sandCut(t, H2_T.e + .3, .55, () => H2_E(t), () => H2_D(t), 63, { from: 'center' });
}, { seed: 4505 });

// ---- H2f: medium: the idol and the silver Clawd dance side by side; COME MY WAY WAY
function H2_F(t) {
  const ws = wordTimes(LY[50]);   // Come my way way
  const lt = t - H2_T.f;
  const rect = [-W * .45, -H * .7, W * 1.9, H * 1.9];
  const { sun } = H2_river(t, { rect, horizon: 560, sunX: .56, camX: lt * 60 });
  // the disc surface fills the bottom of the frame
  lqRedDisc(W / 2, 1180, 1500, 330, { glint: frac(t * .2), reflect: false });
  // dancers crossing behind, the idol and the Clawd in front
  for (let i = 0; i < 6; i++) {
    const x = ((i * 380 - lt * 260) % (W + 400) + W + 400) % (W + 400) - 200, P = H2_dancerPose(t, i);
    lqMaskDancer(x, 900, 260, t, { arms: P.arms, step: P.step, lean: P.lean, flip: true, mask: i === 2 ? 'gold' : 'egg' });
  }
  H2_idol(t, 820, 1050, 44, 'groove', { glint: .5 });
  const P = H2_dancerPose(t, 0);
  lqClawd(1330, 1040, 330, { arms: P.arms, squash: P.hop * .35, lean: -P.lean * 2, jump: P.hop * 18, step: P.step, glint: frac(t * .3) });
  H2_big('COME', 80, 250, t, ws[0].t, { size: 190 });
  H2_big('MY', 80, 440, t, ws[1].t, { size: 190 });
  H2_ways(t, ws.slice(2).map(w => w.t), { x: 1560, y: 330, size: 210, vp: [sun[0], sun[1] + 30], k: .5 });
  H2_glintCut(t, H2_T.f);
}
shot(H2_T.f, H2_T.g, (t) => H2_F(t), { seed: 4506 });

// ---- H2g: top-down sunflower; BABY DON'T RUNAWAY; the ring bursts outward on "runaway" and snaps back on "way way"
function H2_G(t) {
  const ws = wordTimes(LY[51]);   // Baby don't runaway way way
  const cx = 1290, cy = 540, lt = t - H2_T.g;
  const out = easeOut(clamp((t - ws[2].t) / .3)) * (1 - backOut(clamp((t - ws[3].t) / .25)) * .6 - backOut(clamp((t - ws[4].t) / .25)) * .4);
  H2_waterTop(t, cx, cy);
  camBegin({ x: W / 2, y: H / 2, zoom: 1 + pulse(t) * .015 });
  H2_sunflower(t, cx, cy, { r: 300, ringR: 290, h: 140, n: 12, rot: lt * .7, glint: frac(t * .3),
    burst: i => out * (i === 0 ? 420 : 140 + 60 * hash(i)) });
  camEnd();
  H2_words(t, ws.slice(0, 1), 90, 250, { size: 60 });
  H2_big('DON’T', 84, 470, t, ws[1].t, { font: FONT.hero, size: 210 });
  H2_big('RUNAWAY', 84, 690, t, ws[2].t, { font: FONT.hero, size: 210 });
  H2_ways(t, ws.slice(3).map(w => w.t), { x: 380, y: 930, size: 210, font: FONT.hero, vp: [cx, cy], k: .45, drift: .3 });
}
shot(H2_T.g, H2_T.h, (t) => {
  H2_sandCut(t, H2_T.g, .3, () => H2_G(t), () => H2_F(t), 64, { from: 'top' });
}, { seed: 4507 });

// ---- H2h: RUN AWAY: the Clawd scampers off along a lacquer boardwalk over the river
function H2_Hs(t) {
  const ws = wordTimes(LY[52]);   // Run away way
  const lt = t - H2_T.h, cam = lt * 900;
  const { sun } = H2_river(t, { horizon: 560, sunX: .7, camX: cam });
  // boardwalk: cinnabar planks scrolling
  lqLacquer(() => X.rect(0, 880, W, 70), LQ_PAL.cinnabarDk, { rim: 1, glint: .5, bounds: [0, 880, W, 70], lift: 6 });
  lqLacquer(() => X.rect(0, 860, W, 26), LQ_PAL.cinnabar, { rim: 1, glint: .5, bounds: [0, 860, W, 26] });
  X.fillStyle = 'rgba(217,164,65,.7)'; for (let i = -1; i < 14; i++) { const x = i * 160 - (cam % 160); X.fillRect(x, 860, 3, 90); }
  // a dancer chasing, the Clawd running
  const P = H2_dancerPose(t, 1);
  lqMaskDancer(360 + Math.sin(t * 9) * 10, 870, 330, t, { arms: [.85, .9], step: t * 5, lean: .18, flip: true });
  const run = t * 7;
  lqClawd(1180, 870 - Math.abs(Math.sin(run * Math.PI)) * 30, 300, { step: run, lean: .2, arms: [Math.sin(run * Math.PI) * .5 + .5, -Math.sin(run * Math.PI) * .5 + .5], glint: frac(t * .6), look: 1 });
  // dust of gold flakes kicked up behind
  X.save(); for (let i = 0; i < 24; i++) { const a = frac(t * 2 + hash(i)), x = 1000 - a * 400, y = 860 - a * 90 * hash(i * 3) - bump(a) * 40; X.globalAlpha = 1 - a; X.fillStyle = LQ_PAL.goldHi; X.fillRect(x, y, 5, 5); } X.restore();
  // type runs off to the left too: RUN AWAY with engraved smears
  const drift = easeIn(clamp((t - ws[1].t - .4) / .8)) * -120;
  H2_big('RUN', 90 + drift, 300, t, ws[0].t, { font: FONT.hero, size: 220 });
  H2_big('AWAY', 480 + drift, 300, t, ws[1].t, { font: FONT.hero, size: 220 });
  H2_ways(t, [ws[2].t], { x: 1500, y: 300, size: 220, font: FONT.hero, vp: [sun[0], sun[1] + 30], k: .5, drift: .6 });
}
shot(H2_T.h, H2_T.i, (t) => { H2_Hs(t); H2_glintCut(t, H2_T.h); }, { seed: 4508 });

// ---- H2i: backlit hero: arms up against the low sun; OH BABY COME MY WAY WAY WAY
function H2_I(t) {
  const ws = wordTimes(LY[53]);   // Oh baby come my way way way
  const lt = t - H2_T.i;
  camBegin({ x: W / 2, y: 560, zoom: 1.18 + lt * .03, shake: KICK(t) * 3 });
  const pose = t < ws[2].t ? dance(t, 'groove') : dance(t, ['heart', 'armsOut', 'jump', 'armsOut']);
  const st = H2_stage(t, { horizon: 640, sunX: .5, camX: 0, cy: 860, rx: 600, ry: 110, h: 160, s: 30, spin: .7, pose, glint: frac(t * .25) });
  camEnd();
  H2_words(t, ws.slice(0, 2), W / 2, 110, { size: 60, align: 'center' });
  H2_big('COME', 90, 330, t, ws[2].t, { size: 190 });
  H2_big('MY', 1830, 330, t, ws[3].t, { size: 190, align: 'right' });
  const sp = [(st.sun[0] - W / 2) * 1.2 + W / 2, (st.sun[1] - 560) * 1.2 + 540 + 20];
  H2_ways(t, ws.slice(4).map(w => w.t), { x: W / 2, y: 1040, size: 250, vp: sp, k: .5 });
  H2_glintCut(t, H2_T.i, .3, .7);
}
shot(H2_T.i, H2_T.j, (t) => H2_I(t), { seed: 4509 });

// ---- H2j: top-down, spinning the other way; WHEN YOU GO COME MY WAY WAY
function H2_J(t) {
  const ws = wordTimes(LY[54]);   // When you go come my way way
  const cx = 630, cy = 540, lt = t - H2_T.j;
  H2_waterTop(t, cx, cy);
  camBegin({ x: cx, y: cy, zoom: 1.12 + lt * .04, rot: -lt * .08 });
  H2_sunflower(t, cx, cy, { r: 280, ringR: 270, h: 150, n: 12, rot: -lt * 1.1 + 1, glint: frac(t * .3), burst: i => pulse(t, .3) * 30 });
  camEnd();
  H2_words(t, ws.slice(0, 3), 1180, 250, { size: 60 });
  H2_big('COME', 1170, 470, t, ws[3].t, { font: FONT.hero, size: 210 });
  H2_big('MY', 1600, 470, t, ws[4].t, { font: FONT.hero, size: 210 });
  H2_ways(t, ws.slice(5).map(w => w.t), { x: 1500, y: 800, size: 230, font: FONT.hero, vp: [cx, cy], k: .45, drift: .3 });
}
shot(H2_T.j, H2_T.k, (t) => {
  H2_sandCut(t, H2_T.j, .3, () => H2_J(t), () => H2_I(t), 65, { from: 'right' });
}, { seed: 4510 });

// ---- H2k: crane back: she points at us; COME LET ME SHOW YOU WHAT I MEAN COS…
function H2_K(t) {
  const ws = wordTimes(LY[55]);   // Come let me show you what I mean cos…
  const lt = t - H2_T.k, pull = easeInOut(clamp(lt / 2.2));
  camBegin({ x: W / 2, y: lerp(700, 540, pull), zoom: lerp(1.5, 1, pull), shake: KICK(t) * 2 });
  const pose = t >= ws[3].t ? { ...PZ.point, lSh: .3 } : dance(t, 'groove');
  H2_stage(t, { horizon: 620, sunX: .5, camX: lt * 30, cy: 840, rx: 580, ry: 120, h: 155, s: 27, spin: -.9, pose, glint: frac(t * .25), face: { eyes: t > ws[7].t ? 'wink' : 'open' } });
  camEnd();
  H2_words(t, ws.slice(0, 3), 90, 150, { size: 60 });
  H2_big('SHOW YOU', 84, 360, t, ws[3].t, { size: 170 });
  H2_big('WHAT I MEAN', 1836, 1010, t, ws[5].t, { size: 150, align: 'right' });
  H2_words(t, ws.slice(8), 1836, 1060 - 210, { size: 60, align: 'right' });
  // the build into the next section: the gold glint gathers and floods
  const fl = easeIn(clamp((t - 157.25) / .35));
  if (fl > 0) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.fillStyle = `rgba(255,226,160,${fl * .55})`; X.fillRect(0, 0, W, H); X.restore(); }
}
shot(H2_T.k, H2_T.end, (t) => { H2_K(t); H2_glintCut(t, H2_T.k); }, { seed: 4511 });
