// j_finale.js: J · Outro (141.18–156.65), the loudest part of the song.
// J1 the printed stack explodes into the air → the finale stage with the whole cast doing the point dance.
// J2 a recap montage of earlier sheets cuts in on every beat, then every half beat, quarter, sixteenth,
//    and everything collapses into the spark (white flash at 152.09).
// J3 end card: the title sheet slides out; meter 99.9; "drawn in code by Claude". Fade to paper.

// Paint another moment of the video (any earlier shot) into the current context: the recap.
function J_paintAt(tx) {
  const sh = shotAt(tx); if (!sh || sh.fn === J_montage) return;
  const T0 = T, B0 = BOIL, S0 = SEED;
  T = tx; BOIL = Math.floor(tx * 12);
  X.save(); sheet(); paintShot(sh, tx); X.restore();
  T = T0; BOIL = B0; SEED = S0;
}
// Small cached renders of earlier moments for the flying sheets.
const J_THUMBS = {};
function J_thumb(tx) {
  if (J_THUMBS[tx]) return J_THUMBS[tx];
  const sh = shotAt(tx); if (!sh) return null;
  const L = onLayer('_thumb', () => J_paintAt(tx)), c = mkCanvas(Math.round(480 * SX) || 1, Math.round(270 * SX) || 1);
  c.getContext('2d').drawImage(L, 0, 0, c.width, c.height);
  return (J_THUMBS[tx] = c);
}
// Iconic moments, in song order (one per recap cut).
const J_RECAP = [2.9, 5.3, 15.3, 20.6, 25.4, 27.4, 28.8, 32.4, 34.9, 37.95, 43.9, 47.2, 51.0, 56.2, 61.6, 64.0, 65.5, 67.5, 71.6, 75.3, 80.6, 83.9, 86.5, 92.3, 96.4, 98.2, 99.8, 101.6, 104, 107.2, 111.3, 114.9, 116.4, 118.4, 120.2, 122.6, 124.6, 127.0, 129.1, 131.1, 133.6, 139.2];

// ---------- the finale stage ----------
function J_stage(t, lt) {
  const kick = KICK(t), b = beatF(t);
  camBegin({ zoom: 1.1 + kick * .02 + Math.sin(lt * .8) * .02, x: W / 2 + 60, y: 540, shake: kick * 6, rot: Math.sin(b * Math.PI / 4) * .012 });
  X.fillStyle = '#2A1E3A'; X.fillRect(-500, -500, W + 1000, H + 1000);
  // NEXT, the successor, rises huge behind the upper right: the sun the whole song has been building toward
  nextSun(1480, 250, 250, { crown: true, pulse: kick, eyes: 9, glow: 1, look: [-.6, .5] });
  stageBG2(t);
  // guests at the edges
  shoggoth(170, 860, 150, { mask: 1, wiggle: 1 + kick });
  if (typeof D_basilisk === 'function') try { D_basilisk(t, 1650, 520, .5); } catch (e) { }
  kid(1800, 1040, .42, { look: 1 });
  // the dance line, bigger than any earlier chorus
  danceLine(t, { move: frac(b / 16) < .5 ? 'pdoom' : 'hype', x: 1060, y: 580, s: 33, spread: 380, clawdS: 125, face: { eyes: 'star' } });
  confetti(t, 141.18, { n: 110, seed: 9 });
  camEnd();
  meter(1810, 700, .55, 99.9, { crack: 1, rot: .04 });
  // the chorus hook, stamped on the beats of every bar
  const words = ['I’M', 'UPPING', 'MY', 'P(DOOM)'];
  const bar0 = barN(t), inBar = Math.floor(beatF(t) - (bar0 * 4 + 1));
  words.forEach((w, i) => {
    if (i > inBar) return;
    const t0 = beatT(bar0 * 4 + 1 + i), st = stampK(t, t0 - .02, .12); if (!st) return;
    const f = i === 3 ? FONT.logo(130) : FONT.hero(180);
    withT(90 + (i === 3 ? 0 : i * 26), 270 + i * 185 + (i === 3 ? -20 : 0), -.05, st.s, () => rtext(w, 0, 0, { font: f, color: i === 3 ? PAL.yellow : PAL.paperHi, op: 'source-over', mis: [9, 7, PAL.pink], alpha: st.a }));
  });
}
function stageBG2(t) {
  // a simpler finale floor: glossy dark paper with a halftone reflection of the sun
  const floorY = 800, kick = KICK(t);
  X.fillStyle = '#1B1428'; X.fillRect(-500, floorY, W + 1000, 900);
  htGrad(() => X.rect(-400, floorY, W + 800, 420), PAL.yellow, W / 2, floorY + 380, W / 2, floorY, { step: 14, maxR: 5.5, bounds: [-400, floorY, W + 800, 420], alpha: .55 + .3 * kick, op: 'screen' });
  X.save(); X.globalCompositeOperation = 'screen';
  for (let k = 0; k < 7; k++) {
    const bx = 150 + k * (W - 300) / 6, sw = Math.sin(t * 1.7 + k * 1.3) * .6, ex = bx + Math.sin(sw) * 1200;
    X.fillStyle = ['rgba(255,79,154,.22)', 'rgba(255,210,58,.22)', 'rgba(143,198,232,.22)'][k % 3];
    X.beginPath(); X.moveTo(bx - 12, -60); X.lineTo(bx + 12, -60); X.lineTo(ex + 160, floorY + 60); X.lineTo(ex - 160, floorY + 60); X.closePath(); X.fill();
  }
  X.restore();
}

// ---------- montage driver: decides, per moment, whether we see the stage or a recap sheet ----------
const J_M0 = barT(79), J_M1 = barT(81), J_M2 = barT(81) + BAR, J_M3 = barT(82) + BAR / 2, J_END = barT(83);
function J_cutIndex(t) {
  // returns {recap: index or -1, k: progress in the cut, len}
  if (t < J_M0) return { recap: -1 };
  let len, base, n;
  if (t < J_M1) { len = BEAT; n = Math.floor((t - J_M0) / len); return (n % 2) ? { recap: n >> 1, k: frac((t - J_M0) / len), len } : { recap: -1 }; }
  if (t < J_M2) { len = BEAT / 2; base = 4; n = Math.floor((t - J_M1) / len); return { recap: base + n, k: frac((t - J_M1) / len), len }; }
  if (t < J_M3) { len = BEAT / 4; base = 12; n = Math.floor((t - J_M2) / len); return { recap: base + n, k: frac((t - J_M2) / len), len }; }
  len = BEAT / 4; base = 20; n = Math.floor((t - J_M3) / len); return { recap: base + n, k: frac((t - J_M3) / len), len, collapse: clamp((t - J_M3) / (J_END - J_M3)) };
}
function J_montage(t, lt) {
  const c = J_cutIndex(t);
  if (c.recap < 0) { J_stage(t, lt); return; }
  // pick recap moments spread across the whole song in order
  const idx = Math.min(J_RECAP.length - 1, Math.floor(c.recap * J_RECAP.length / 26));
  const tx = J_RECAP[idx] + c.k * c.len * .5;
  const L = onLayer('_recap', () => J_paintAt(tx));
  const col = c.collapse || 0;
  // the recap sheet: full frame, slightly rotated, shrinking toward the centre during the collapse
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.fillStyle = '#12060A'; X.fillRect(0, 0, W, H);
  const s = lerp(1, .12, easeIn(col)), rot = (hash(c.recap) - .5) * .08 * (1 + col * 4);
  X.translate(W / 2, H / 2); X.rotate(rot); X.scale(s, s);
  X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 30; X.shadowOffsetY = 12;
  X.fillStyle = PAL.paper; X.fillRect(-W / 2, -H / 2, W, H); X.shadowColor = 'transparent';
  X.drawImage(L, -W / 2, -H / 2, W, H);
  X.restore();
  // misregistration kick on each cut
  misreg(1 - c.k, 16, 8, [PAL.pink, PAL.blue, PAL.orange][c.recap % 3]);
  if (col > 0) {
    // the spark grows from the centre and swallows everything
    const R = lerp(30, 1500, easeIn(col));
    withT(W / 2, H / 2, t * 3, 1, () => cut(() => sparkPath(0, 0, R, 6, .24, 0, .6), { fill: PAL.orange, lift: 20 }));
    withT(W / 2, H / 2, -t * 2, 1, () => cut(() => sparkPath(0, 0, R * .6, 6, .24, 0, .6), { fill: PAL.yellow, lift: 10 }));
  }
}
// J1: the stack explodes; sheets fly outward revealing the finale stage
shot(141.18, J_M0, (t, lt) => {
  J_stage(t, lt);
  const k = lt / .9;
  if (k < 1) for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.7) * TAU, d = easeOut(k) * (900 + hash(i) * 900), rot = (hash(i * 5.1) - .5) * 6 * k;
    const sw = 520 * (1 - k * .5), sh2 = sw * .5625;
    withT(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d * .7, rot, 1, () => {
      cut(() => X.rect(-sw / 2, -sh2 / 2, sw, sh2), { fill: PAL.paperHi, lift: 14 });
      const th = J_thumb(J_RECAP[(i * 7) % J_RECAP.length]);
      if (th) X.drawImage(th, -sw / 2 + 12, -sh2 / 2 + 12, sw - 24, sh2 - 24);
    });
  }
  flash(t, 141.18, .2);
}, { seed: 91, dark: true });
shot(J_M0, J_END, J_montage, { seed: 92, dark: true });

// J3: end card
shot(J_END, 156.7, (t, lt) => {
  const k = expoOut(lt / .6);
  // white flash out of the spark
  X.fillStyle = PAL.paper; X.fillRect(0, 0, W, H);
  // the title sheet slides up from the bottom
  X.save(); X.translate(0, (1 - k) * H * .9);
  X.fillStyle = PAL.orange; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.orangeDk, 0, H, W * .5, 0, { step: 20, maxR: 9, bounds: [0, 0, W, H], alpha: .6 });
  // the spark crown motif behind the title
  withT(1480, 520, t * .15, 1, () => cut(() => sparkPath(0, 0, 420, 12, .3, 0, .55), { fill: PAL.yellow, lift: 16 }));
  idolHead(1480, 520, 190, { eyes: lt > 1.6 && lt < 1.95 ? 'wink' : 'open', mouthShape: 'grin', blush: 1, look: [-.4, 0] });
  const f1 = FONT.hero(210), f2 = FONT.logo(190);
  rtext('I’M UPPING MY', 110, 380, { font: f1, color: PAL.paperHi, op: 'source-over', mis: [9, 7, PAL.pink] });
  rtext('P(DOOM)', 105, 590, { font: f2, color: PAL.ink, op: 'source-over', mis: [9, 7, PAL.pink] });
  rtext('RISO IDOL CUT', 120, 690, { font: FONT.monoB(40), color: PAL.paperHi, op: 'source-over' });
  rtext('every frame drawn in code by Claude', 120, 920, { font: FONT.serifI(56), color: PAL.ink, op: 'source-over', alpha: clamp((lt - .8) / .4) });
  rtext('P(doom) 99.9%   ·   time: ∞', 120, 985, { font: FONT.mono(30), color: PAL.ink, op: 'source-over', alpha: clamp((lt - 1.1) / .4) });
  X.restore();
  // fade to paper at the very end
  const f = clamp((t - 155.4) / 1.1);
  if (f > 0) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = f; X.fillStyle = PAL.paper; X.fillRect(0, 0, W, H); X.restore(); }
  flash(t, J_END, .35);
}, { seed: 93 });
