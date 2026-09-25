// o_outro.js: O · Outro (196.6–234.61). The MV's quiet outro ambience.
// One continuous camera over a dark gallery wall (wall space: the painting occupies [0,0,1920,1080]):
// O1 pull back from the finale painting until it hangs on the wall in a thin gold frame under a warm spot →
// O2 an eggshell paper-cut cloth polishes the last dull corner, a glint crosses the panel, the idol in it winks →
// O3 pan to a black lacquer plaque, credits sanded open in gold / eggshell inlay →
// O4 the lights go down to near-black lacquer, one last glint.

const O_T0 = 196.6, O_T1 = 234.62;
const O_BAR = n => barT(n);                         // bar 90 = 196.65 … bar 107 = 233.74
const O_HIP = [960, 652], O_S = 46;                   // the idol in the painting (panel space)
const O_HEAD = [960, O_HIP[1] - 4.55 * O_S];
const O_PLQ = [2520, 60, 1720, 990];                   // credits plaque (wall space)
const O_PLC = [O_PLQ[0] + O_PLQ[2] / 2, O_PLQ[1] + O_PLQ[3] / 2];
const O_HAZE = [1300, 660, 620, 420];                  // the unpolished corner (panel space)
const O_POL0 = barT(95) + BEAT, O_PASS = BEAT * 2, O_NPASS = 4;   // polishing passes: 208.1 → 212.47
const O_WINK = barT(98) + BEAT * 2;                    // 215.2, in the hush

// ---------- camera ----------
// Keyframes [t, x, y, zoom, ease of the segment that ENDS here]. Zoom interpolates in log space.
const O_KEYS = [
  [O_T0, 960, 560, 1.32],
  [barT(94), 960, 610, .5, 'out'],
  [barT(95), 985, 630, .465, 'lin'],
  [barT(96), 1520, 850, .96, 'io'],
  [O_POL0 + O_PASS * O_NPASS, 1480, 830, 1.05, 'lin'],
  [O_WINK - .3, O_HEAD[0], O_HEAD[1] + 30, 2.7, 'io'],
  [barT(99), O_HEAD[0], O_HEAD[1] + 26, 2.95, 'lin'],
  [barT(100) + .45, O_PLC[0], O_PLC[1], 1.0, 'io'],
  [barT(105), O_PLC[0] + 10, O_PLC[1] - 6, 1.07, 'lin'],
  [O_T1, O_PLC[0] + 14, O_PLC[1] - 10, 1.16, 'lin'],
];
function O_cam(t) {
  const K = O_KEYS; let i = 1; while (i < K.length - 1 && t > K[i][0]) i++;
  const a = K[i - 1], b = K[i], u = clamp((t - a[0]) / (b[0] - a[0])), e = b[4];
  const s = e === 'lin' ? u : e === 'out' ? .45 * u + .55 * ease(u) : easeInOut(u);
  const z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), s));
  // pan in "screen-anchored" space so zoom moves do not swing wide
  const x = lerp(a[1], b[1], s), y = lerp(a[2], b[2], s);
  return { x, y, zoom: z };
}

// ---------- the gallery wall ----------
function O_wall(t, cam) {
  const vb = lqUserBox();
  X.fillStyle = '#0d0a09'; X.fillRect(vb[0] - 10, vb[1] - 10, vb[2] + 20, vb[3] + 20);
  // plaster: faint lacquer mottle
  X.save(); X.globalAlpha = .5; X.fillStyle = lqPatFast('mottleA', lqBuildMottle(), { scale: 2.2 }, 1.2); X.fillRect(vb[0] - 10, vb[1] - 10, vb[2] + 20, vb[3] + 20); X.restore();
  // warm spot pools on the panel and on the plaque (the plaque's light comes up as we pan to it)
  const dim = O_dim(t);
  const pool = (cx, cy, r, a) => {
    const g = X.createRadialGradient(cx, cy, r * .05, cx, cy, r);
    g.addColorStop(0, `rgba(255,214,160,${a})`); g.addColorStop(.45, `rgba(200,140,80,${a * .45})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  X.save(); X.globalCompositeOperation = 'screen';
  pool(960, 420, 1650, .2 * (1 - dim));
  pool(O_PLC[0], O_PLC[1] - 120, 1450, .17 * clamp((t - 216) / 3) * (1 - dim * .8));
  // the beam from the ceiling spot: a soft cone
  const beam = (x, a) => {
    const g = X.createLinearGradient(0, -1400, 0, 1300); g.addColorStop(0, `rgba(255,226,180,${a})`); g.addColorStop(1, 'rgba(255,226,180,0)');
    X.fillStyle = g; X.beginPath(); X.moveTo(x - 90, -1400); X.lineTo(x + 90, -1400); X.lineTo(x + 1250, 1300); X.lineTo(x - 1250, 1300); X.closePath(); X.fill();
  };
  beam(960, .06 * (1 - dim)); beam(O_PLC[0], .05 * clamp((t - 217) / 3) * (1 - dim));
  // dust motes turning in the light
  X.fillStyle = 'rgba(255,236,200,.55)';
  for (let i = 0; i < 70; i++) {
    const bx = (i % 2 ? O_PLC[0] : 960) + (hash(i * 3.1) - .5) * 1900, by = -300 + hash(i * 7.7) * 1700;
    const x = bx + Math.sin(t * (.1 + hash(i) * .2) + i) * 60, y = by + frac(hash(i * 2.2) + t * .012 * (.5 + hash(i * 5))) * 300 - 150;
    const r = 1.2 + hash(i * 9.3) * 2.4, tw = .4 + .6 * Math.sin(t * 1.3 + i * 2.1) ** 2;
    X.globalAlpha = tw * (1 - dim); X.fillRect(x, y, r, r);
  }
  X.restore();
  // a baseboard far below
  X.fillStyle = '#070504'; X.fillRect(vb[0] - 10, 1780, vb[2] + 20, 800);
  X.fillStyle = 'rgba(217,164,65,.18)'; X.fillRect(vb[0] - 10, 1778, vb[2] + 20, 3);
}
// house lights going down at the end (0..1)
const O_dim = t => easeInOut((t - (barT(106) - .3)) / 2.45);

// ---------- the painting in the panel ----------
function O_idolPose(t) {
  const fin = { lSh: .22, lEl: .15, rSh: -2.45, rEl: -1.25, hR: 'open', lHip: .1, rHip: -.12, rKn: .12, lean: -.03, head: .1, turn: .12, skirt: .35 };
  const k = ease((t - O_T0) / 3.8), P = mixPose({ ...POSE0, ...dance(t, 'groove') }, { ...POSE0, ...fin }, k);
  P.lean += Math.sin(t * .9) * .015 * k; P.hy = (P.hy || 0) * (1 - k) + Math.sin(t * 1.1) * .03 * k;
  // she turns to camera for the wink
  const w = bump((t - (O_WINK - .9)) / 2.2);
  P.turn = lerp(P.turn, 0, clamp((t - (O_WINK - 1.2)) / .6)); P.head += w * .08;
  if (k < .5) { P.hL = P.hL || 'open'; P.hR = P.hR || 'open'; } else { P.hL = 'open'; P.hR = 'open'; }
  return P;
}
function O_painting(t, gk) {
  X.save(); X.beginPath(); X.rect(0, 0, W, H); X.clip();
  const settle = ease((t - O_T0) / 3.8);
  const { horizon } = lqKarstRiver(t, { rect: [0, 0, W, H], camX: 260 + t * 4, sunX: .74, seed: 3, glint: gk });
  // time machine parked on the near bank, silver Clawd on the disc
  lqTimeMachine(290, 1030, 470, t, { doors: .35, glint: gk, circuits: .6 });
  lqRedDisc(960, 872, 560, 118, { glint: gk });
  // masked dancers circling the disc: back row, the idol, front row
  const dancer = (i, front) => {
    const n = 7, a = (i + .5) / n * Math.PI + (1 - settle) * (t - O_T0) * .25, u = Math.cos(a);
    const x = 960 + u * 470 * (front ? .95 : .82), y = 872 + (front ? 1 : -1) * Math.sin(a) * 88 - 6, h = front ? 210 : 175;
    if (Math.abs(x - 960) < 170 && !front) return;
    const live = 1 - settle, arms = [(.5 + .5 * Math.sin(beatF(t) * Math.PI + i)) * live + (.25 + .55 * (i % 2)) * settle, (.5 + .5 * Math.sin(beatF(t) * Math.PI + i + 1.3)) * live + (.25 + .55 * ((i + 1) % 2)) * settle];
    lqMaskDancer(x, y, h, t, { arms, step: live * beatF(t) + i * .3 + Math.sin(t * .5 + i) * .05, lean: Math.sin(t * .7 + i) * .03 + live * Math.sin(beatF(t) * Math.PI) * .06, flip: u > 0, mask: i === 3 ? 'gold' : 'egg' });
  };
  for (let i = 0; i < 7; i++) dancer(i, false);
  lqClawd(1330, 900, 120, { arms: [.3 + .6 * (1 - settle) * pulse(t), 1.1], glint: gk, lean: -.05 + Math.sin(t * .8) * .02 });
  // the idol
  const P = O_idolPose(t), wk = t > O_WINK && t < O_WINK + .5;
  const mouth = t < O_T0 + 2 ? clamp(VOX(t) * 1.3 - .2) * (1 - (t - O_T0) / 2) : 0;
  idolBody(O_HIP[0], O_HIP[1], O_S, P, { outfit: 'aodai', glint: gk, face: { hat: 'nonla', hatMat: 'gold', mic: false, eyes: wk ? 'wink' : 'open', mouth, mouthShape: wk ? 'grin' : 'smile', blush: .6 + .4 * bump((t - O_WINK + .2) / 1.2), look: [0, 0] } });
  for (let i = 0; i < 7; i++) if (i % 2) dancer(i + .5, true);
  X.restore();
  return horizon;
}

// ---------- the dull corner and the polishing cloth ----------
function O_passPt(i, u) {
  // pass i sweeps across the corner (alternating direction) in small circular rubs
  const dir = i % 2 ? -1 : 1, x0 = O_HAZE[0] + 60, x1 = W - 40, y = O_HAZE[1] + 80 + i * 100;
  const bx = dir > 0 ? lerp(x0, x1, u) : lerp(x1, x0, u), ang = u * TAU * 3.2 * dir + i;
  return [bx + Math.cos(ang) * 62, y + Math.sin(ang) * 44 + (u - .5) * 30];
}
function O_clothPos(t) {
  const lt = t - O_POL0, i = Math.floor(lt / O_PASS);
  if (lt < 0) { const k = easeOut(clamp((t - (O_POL0 - .9)) / .9)); const p = O_passPt(0, 0); return [lerp(W + 320, p[0], k), lerp(H + 260, p[1], k), 1 - k]; }
  if (i >= O_NPASS) { const k = easeIn(clamp((lt - O_PASS * O_NPASS) / .8)); const p = O_passPt(O_NPASS - 1, 1); return [lerp(p[0], W + 380, k), lerp(p[1], H + 300, k), -k]; }
  const p = O_passPt(i, ease(frac(lt / O_PASS) * 1.02)); return [p[0], p[1], 0];
}
function O_haze(t) {
  const end = O_POL0 + O_PASS * O_NPASS, fade = 1 - ease((t - end + .1) / .6);
  if (fade <= 0) return;
  const m = X.getTransform();
  const L = onLayer('O_haze', () => {
    X.setTransform(m);
    // milky, dusty film fading in toward the corner
    const [hx, hy, hw, hh] = O_HAZE, g = X.createRadialGradient(W, H, 0, W, H, Math.hypot(hw, hh) * 1.05);
    g.addColorStop(0, 'rgba(206,192,172,.64)'); g.addColorStop(.55, 'rgba(190,176,156,.5)'); g.addColorStop(.8, 'rgba(190,176,156,.2)'); g.addColorStop(1, 'rgba(190,176,156,0)');
    X.beginPath(); X.rect(0, 0, W, H); X.fillStyle = g; X.fill();
    X.globalAlpha = .55; X.fillStyle = lqPat('dust', lqBuildDust()); X.fill(); X.globalAlpha = 1;
    // old swirl marks in the film
    X.strokeStyle = 'rgba(240,230,210,.18)'; X.lineWidth = 3;
    for (let k = 0; k < 9; k++) { X.beginPath(); X.ellipse(hx + 120 + hash(k * 3) * hw * .8, hy + 90 + hash(k * 5) * hh * .75, 50 + hash(k) * 60, 30 + hash(k * 2) * 30, hash(k * 7) * 3, 0, 5); X.stroke(); }
    // what the cloth has wiped: its sampled path, a soft wide stroke and a firm core
    const lt = t - O_POL0; if (lt <= 0) return;
    X.globalCompositeOperation = 'destination-out'; X.lineCap = 'round'; X.lineJoin = 'round';
    for (const [lw, a] of [[190, .35], [150, .6], [110, 1]]) {
      X.strokeStyle = `rgba(0,0,0,${a})`; X.lineWidth = lw;
      for (let i = 0; i < O_NPASS; i++) {
        const up = clamp(lt / O_PASS - i); if (up <= 0) break;
        X.beginPath(); const n = Math.ceil(80 * up);
        for (let q = 0; q <= n; q++) { const p = O_passPt(i, ease(q / 80 * 1.02)); q ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]); }
        X.stroke();
      }
    }
  });
  blit(L, fade);
  // fresh polish: the wake behind the cloth flashes bright
  const lt = t - O_POL0;
  if (lt > 0 && lt < O_PASS * O_NPASS + .5) {
    X.save(); X.globalCompositeOperation = 'screen'; X.lineCap = 'round'; X.lineJoin = 'round';
    const i = Math.min(O_NPASS - 1, Math.floor(lt / O_PASS)), up = clamp(lt / O_PASS - i), u0 = Math.max(0, up - .35);
    X.beginPath();
    for (let q = 0; q <= 24; q++) { const p = O_passPt(i, ease(lerp(u0, up, q / 24) * 1.02)); q ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]); }
    X.strokeStyle = 'rgba(255,236,200,.16)'; X.lineWidth = 120; X.stroke();
    X.strokeStyle = 'rgba(255,248,230,.22)'; X.lineWidth = 16; X.stroke();
    X.restore();
  }
}
function O_cloth(t) {
  const [x, y, out] = O_clothPos(t); if (Math.abs(out) >= 1) return;
  const lt = t - O_POL0, rub = Math.sin(lt * TAU * 3.2 / O_PASS * 1.02);
  X.save(); X.translate(x, y); X.rotate(-.35 + rub * .12 + out * .4); X.scale(1 + rub * .05, 1 - rub * .05);
  // a folded paper-cut rag: a lumpy pad (the bunched cloth under the hand) and a long tail hanging off it
  const pad = [];
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r = 1 + (hash(k * 4.1) - .5) * .22; pad.push([Math.cos(a) * 125 * r, Math.sin(a) * 78 * r]); }
  const sway = Math.sin(lt * 5.3) * 14 + rub * 10;
  const tail = [[40, 30], [120, 40], [150 + sway * .5, 140], [120 + sway, 250], [70 + sway, 262], [58 + sway * .6, 160], [-10, 60]];
  const sh = fn => { X.save(); X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 28; X.shadowOffsetX = 10; X.shadowOffsetY = 20; fn(); X.fillStyle = LQ_PAL.eggDk; X.fill(); X.restore(); };
  const shade = (fn, c0, c1) => { X.save(); fn(); X.clip(); const g = X.createLinearGradient(-120, -90, 140, 220); g.addColorStop(0, c0); g.addColorStop(1, c1); X.fillStyle = g; X.fillRect(-300, -300, 600, 700); X.restore(); };
  sh(() => pathSmooth(tail, true)); shade(() => pathSmooth(tail, true), '#E9DEC9', '#C9B89A');
  X.strokeStyle = 'rgba(130,100,70,.45)'; X.lineWidth = 3; X.lineCap = 'round';
  for (const f of [.35, .65]) { X.beginPath(); X.moveTo(lerp(40, 120, f), 45); X.quadraticCurveTo(lerp(80, 150, f) + sway * .4, 150, lerp(60, 120, f) + sway, 250); X.stroke(); }
  sh(() => pathSmooth(pad, true)); shade(() => pathSmooth(pad, true), '#FFFBF2', LQ_PAL.eggDk);
  X.save(); pathSmooth(pad, true); X.clip();
  X.strokeStyle = 'rgba(150,120,90,.5)'; X.lineWidth = 3.5;
  for (const [a, b, c, d] of [[-95, -25, 10, 22], [-50, 45, 70, 18], [15, -62, 95, -8], [-100, 20, -35, 62]]) { X.beginPath(); X.moveTo(a, b); X.quadraticCurveTo((a + c) / 2 + 15, (b + d) / 2 - 12, c, d); X.stroke(); }
  X.strokeStyle = 'rgba(255,255,255,.75)'; X.lineWidth = 2.2;
  for (const [a, b, c, d] of [[-93, -31, 8, 16], [-48, 39, 68, 12]]) { X.beginPath(); X.moveTo(a, b); X.quadraticCurveTo((a + c) / 2 + 15, (b + d) / 2 - 16, c, d); X.stroke(); }
  X.restore();
  X.strokeStyle = 'rgba(120,90,60,.5)'; X.lineWidth = 2; pathSmooth(pad, true); X.stroke();
  X.restore();
}

// ---------- the panel on the wall ----------
function O_panel(t) {
  // painting glint: slow drift, then the big sweep once the polish is done, then again near the wink
  const sweepA = O_POL0 + O_PASS * O_NPASS + .15, sw = clamp((t - sweepA) / 1.3);
  const gk = sw > 0 && sw < 1 ? sw : frac(t * .045 + .15);
  // frame shadow on the wall, gold frame, black lip
  const fw = 34;
  X.save(); X.shadowColor = 'rgba(0,0,0,.8)'; X.shadowBlur = 70; X.shadowOffsetY = 45; X.shadowOffsetX = 12; X.fillStyle = '#000'; X.fillRect(-fw, -fw, W + fw * 2, H + fw * 2); X.restore();
  lqGold(() => { X.rect(-fw, -fw, W + fw * 2, H + fw * 2); X.rect(W + 6, -6, -W - 12, H + 12); }, { scale: .45, glint: frac(t * .06 + .5), bounds: [-fw, -fw, W + fw * 2, H + fw * 2], bevel: 3 });
  X.strokeStyle = 'rgba(255,240,200,.55)'; X.lineWidth = 2; X.strokeRect(-fw + 9, -fw + 9, W + fw * 2 - 18, H + fw * 2 - 18);
  X.fillStyle = '#050302'; X.fillRect(-6, -6, W + 12, H + 12);
  O_painting(t, gk);
  O_haze(t);
  // the gloss sweep across the whole panel after the last pass, with a star glint in the corner
  if (sw > 0 && sw < 1) {
    X.save(); X.beginPath(); X.rect(0, 0, W, H); X.clip(); X.globalCompositeOperation = 'screen';
    X.fillStyle = lqBand(sw, { bounds: [0, 0, W, H], glintAng: -.8, glintW: 380 }, [[0, 0], [.5, .22], [1, 0]], [255, 236, 200]); X.fillRect(0, 0, W, H);
    X.fillStyle = lqBand(sw, { bounds: [0, 0, W, H], glintAng: -.8, glintW: 40 }, [[0, 0], [.5, .35], [1, 0]], [255, 250, 235]); X.fillRect(0, 0, W, H);
    X.restore();
  }
  O_star(W - 70, H - 60, t, O_POL0 + O_PASS * O_NPASS + .05, 70);
  // the panel's gloss (always): a thin mirror line on the varnish
  X.save(); X.beginPath(); X.rect(0, 0, W, H); X.clip(); X.globalCompositeOperation = 'screen';
  X.fillStyle = lqBand(frac(t * .03 + .55), { bounds: [0, 0, W, H], glintAng: -.9, glintW: 160 }, [[0, 0], [.5, .06], [1, 0]], [255, 240, 220]); X.fillRect(0, 0, W, H);
  X.restore();
  O_cloth(t);
  // wink sparkle
  O_star(O_HEAD[0] + 26, O_HEAD[1] - 12, t, O_WINK + .03, 30);
  // the gallery label card
  withT(W + 150, H - 130, 0, 1, () => {
    X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 16; X.shadowOffsetY = 8; X.fillStyle = LQ_PAL.egg; X.fillRect(0, 0, 330, 170); X.restore();
    X.fillStyle = 'rgba(217,164,65,.8)'; X.fillRect(22, 22, 4, 126);
    X.textBaseline = 'alphabetic'; X.fillStyle = '#1a120d';
    X.font = FONT.vnI(34); X.fillText('Come My Way', 42, 62);
    X.font = FONT.vnSansM(18); X.fillStyle = '#3a2a1e'; X.fillText('Sơn Mài Cut, 2026', 42, 94);
    X.font = FONT.vnIR(18); X.fillText('sơn mài trên gỗ', 42, 122);
    X.fillText('sơn ta, vàng lá, vỏ trứng', 42, 146);
  });
}
// four-point gold star glint (backOut in, spins, fades)
function O_star(x, y, t, t0, R) {
  const k = (t - t0) / .9; if (k <= 0 || k >= 1) return;
  const s = backOut(clamp(k / .3)) * (1 - easeIn(clamp((k - .5) / .5)));
  X.save(); X.translate(x, y); X.rotate(k * 1.2); X.scale(s, s); X.globalCompositeOperation = 'screen';
  const g = X.createRadialGradient(0, 0, 0, 0, 0, R * 1.6); g.addColorStop(0, 'rgba(255,240,200,.7)'); g.addColorStop(1, 'rgba(255,200,120,0)');
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, R * 1.6, 0, TAU); X.fill();
  X.fillStyle = '#FFF6D8'; X.beginPath(); sparkPath(0, 0, R, 4, .12, 0, .5); X.fill();
  X.restore();
}

// ---------- the credits plaque ----------
const O_CREDITS = [
  { t: barT(100), str: 'COME MY WAY', y: 470, font: () => FONT.vn(186), mat: 'gold', tr: 10, n: 34 },
  { t: barT(100) + BEAT * 2, str: 'Sơn Mài Cut', y: 640, font: () => FONT.vnI(118), mat: 'egg', tr: 0, n: 22 },
  { t: barT(101), str: 'Music: Sơn Tùng M-TP × Tyga', y: 800, font: () => FONT.vnSansB(46), mat: 'gold', tr: 3, n: 16 },
  { t: barT(101) + BEAT * 2, str: 'Animation drawn in code by Claude', y: 876, font: () => FONT.vnSansB(46), mat: 'gold', tr: 3, n: 16 },
];
function O_plaque(t) {
  const [px, py, pw, ph] = O_PLQ, dim = O_dim(t), end = barT(105) + BEAT * 2, lit = clamp((t - 216.3) / 2.6);
  lqLacquer(() => X.rect(px, py, pw, ph), '#18110e', { lift: 40, rim: 3, bounds: O_PLQ, glint: frac(t * .05 + .1), mottle: .3 });
  // gold hairline and corner sparks
  lqGold(() => { X.rect(px + 34, py + 34, pw - 68, ph - 68); X.rect(px + pw - 38, py + 38, -(pw - 76), ph - 76); }, { scale: .4, bounds: O_PLQ, glint: frac(t * .07 + .3), bevel: 0, alpha: .15 + .85 * lit });
  for (const [cx, cy] of [[px + 36, py + 36], [px + pw - 36, py + 36], [px + 36, py + ph - 36], [px + pw - 36, py + ph - 36]]) lqGold(() => sparkPath(cx, cy, 20, 4, .22, 0, .5), { scale: .3, glint: false, bevel: 1, alpha: .15 + .85 * lit });
  // small rule and spark between title and subtitle
  const cx = O_PLC[0], ruleK = easeOut(clamp((t - O_CREDITS[1].t + .2) / .8));
  if (ruleK > 0) {
    lqGold(() => { X.rect(cx - 330 * ruleK, 528, 290 * ruleK, 3); X.rect(cx + 40, 528, 290 * ruleK, 3); }, { scale: .3, glint: false, bevel: 0 });
    withT(cx, 529.5, t * .4, ruleK, () => lqGold(() => sparkPath(0, 0, 18, 6, .3, 0, .6), { scale: .3, glint: false, bevel: 1 }));
  }
  const m = X.getTransform();
  O_CREDITS.forEach((c, i) => {
    const k = clamp((t - c.t) / 1.25); if (k <= 0) return;
    // the last glint: a sweep along the type at bar 106
    const lg = clamp((t - end - i * .12) / 1.1), g = lg > 0 && lg < 1 ? lg : frac((t - c.t) * .12 + .15);
    const draw = () => { X.setTransform(m); lqInlayText(c.str, cx, c.y, { font: c.font(), material: c.mat, align: 'center', tracking: c.tr, glint: g, scale: c.mat === 'egg' ? .35 : .5 }); };
    if (k >= 1) { draw(); return; }
    // sanded open: the inlay shows through the scrubs of a sanding mask painted in plaque space
    const fnt = c.font(); X.save(); X.font = fnt; const w = layout(c.str, fnt, c.tr).width; X.restore();
    const sz = parseFloat(fnt.match(/(\d+(?:\.\d+)?)px/)[1]), box = [cx - w / 2 - sz * .3, c.y - sz * 1.05, w + sz * .6, sz * 1.45];
    const M = onLayer('O_crMask', () => { X.setTransform(m); lqSandPaint(k, 11 + i, { n: c.n, angle: -.3, from: 'left' }, box, 0); });
    const L = onLayer('O_cr', () => { draw(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'destination-in'; X.drawImage(M, 0, 0); });
    blit(L);
    // gold dust thrown off the sanding edge
    X.save(); X.globalCompositeOperation = 'screen';
    for (let q = 0; q < 26; q++) {
      const f = clamp(k * 1.25 - hash(q * 3.3) * .25); if (f <= 0 || f >= 1) continue;
      const x = box[0] + f * box[2] + (hash(q * 7.1) - .5) * 40, y = box[1] + hash(q * 1.9) * box[3] - bump(f) * 30;
      X.fillStyle = `rgba(246,227,161,${.8 * (1 - k)})`; X.fillRect(x, y, 3, 3);
    }
    X.restore();
  });
}

// ---------- frame ----------
function O_frame(t) {
  const c = O_cam(t), dim = O_dim(t);
  camBegin({ x: c.x, y: c.y, zoom: c.zoom });
  O_wall(t, c);
  // draw only what the camera can see
  const vb = lqUserBox();
  if (vb[0] < W + 520) O_panel(t);
  if (vb[0] + vb[2] > O_PLQ[0] - 60) O_plaque(t);
  // gold dust drifting through the plaque's light (keeps the long credit hold alive)
  if (t > 217) {
    X.save(); X.globalCompositeOperation = 'screen';
    for (let i = 0; i < 46; i++) {
      const x = O_PLQ[0] + frac(hash(i * 2.9) + t * .006 * (hash(i * 4.4) - .3)) * O_PLQ[2], y = O_PLQ[1] + frac(hash(i * 6.1) - t * .018 * (.4 + hash(i))) * O_PLQ[3];
      const r = 1.5 + hash(i * 8.8) * 3, tw = Math.sin(t * (.8 + hash(i) * 1.4) + i * 1.7) ** 2;
      X.fillStyle = `rgba(246,227,161,${.5 * tw * clamp((t - 217) / 2) * (1 - O_dim(t))})`; X.fillRect(x, y, r, r);
    }
    X.restore();
  }
  camEnd();
  // the lights go down: near-black lacquer, its polish sheen still moving
  if (dim > 0) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    X.fillStyle = `rgba(8,5,4,${.93 * dim})`; X.fillRect(0, 0, W, H);
    X.restore();
    if (dim > .5) { X.save(); X.globalAlpha = (dim - .5) * 2 * .9; lqGround(t, { tone: 'black', sheen: .8, dust: .6 }); X.restore(); }
    // the last glint crosses the dark board
    const g = clamp((t - (barT(107) - .6)) / 1.4);
    if (g > 0 && g < 1) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.fillStyle = lqBand(g, { glintAng: -.7, glintW: 90 }, [[0, 0], [.5, .2], [1, 0]], [255, 226, 170]); X.fillRect(0, 0, W, H); X.restore(); }
    O_endStar(t);
  }
}
function O_endStar(t) {
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); O_star(W / 2, H / 2, t, barT(107) + .1, 38); X.restore();
}

// Enter by sanding away the finale's last frame (its whole-mural framing) in the first 0.6 s.
function O_enter(t) {
  const lt = t - O_T0;
  if (lt >= .6) return O_frame(t);
  const prev = shotAt(O_T0 - .001);
  lqReveal(() => O_frame(t), () => { if (prev) { const sd = SEED; X.save(); paintShot(prev, Math.min(t, O_T0 - .001)); X.restore(); SEED = sd; } },
    easeOut(lt / .6) * 1.02, 96, { from: 'center', name: 'O_in', halo: '#5a3a24', res: .4 });
}
shot(O_T0, barT(96), (t) => O_enter(t), { seed: 901 });
shot(barT(96), barT(100), (t) => O_frame(t), { seed: 902 });
shot(barT(100), barT(105), (t) => O_frame(t), { seed: 903 });
shot(barT(105), O_T1 + 1, (t) => O_frame(t), { seed: 904 });
