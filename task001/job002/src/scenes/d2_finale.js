// d2_finale.js: D′ · Post-hook 2 and finale (157.6–196.6). LY[56–72].
// D′1  157.6–159.43  cinnabar panel, I DO NOT GAMBLE / AND E TOO SURE stamped in gold beside the idol's face
//      159.43–162.56 the "come my!" hit sands the panel away to SILVER: the idol and a black-lacquer masked frieze, COME MY! inlaid huge
// D′2  162.56–179.47 the biggest dance, cut on the lines: karst river at golden hour (whole cast, time machine parked, doors open) →
//      gold-sun stamp COME MY… → the pagoda gate at night, the crowd in waves → sun stamp again → tender line over a close-up and an
//      orbiting ring → I CAN NEVER REFUSE build → 177.02 full-frame gold hit, YOU! in cinnabar, sanded back to the jumping cast
// D′3  179.47–196.6  the final call and response: one long pull-back while the panel fills with every motif of the video
//      (old quarter, drum, night river + disc, gate, buffalo, time machine) sanded in around the dancing cast; it settles on the
//      whole finished lacquer panel for the outro's gallery pull-back.

// ---------- small shared helpers ----------
const D2_WTC = {};
function D2_wt(i) { if (!LY[i]) return []; return D2_WTC[i] || (D2_WTC[i] = wordTimes(LY[i])); }
function D2_w(i, j, fb) { const w = D2_wt(i)[j]; return w ? w.t : fb; }
const D2_EGG = '#F3EBDD';

// Lacquer caption: eggshell words on a thin black lacquer plate with a gold hairline, bottom centre, the sung word lit.
function D2_caption(t, i, o = {}) {
  const L = LY[i]; if (!L) return;
  const [a, b] = L, end = o.end ?? b, k = easeOut((t - a + .05) / .18) * (1 - ease((t - end + .12) / .15));
  if (k <= .01) return;
  const size = o.size || 40, fnt = FONT.vnB(size), y = o.y ?? 996;
  const ws = D2_wt(i), sp = textW(' ', fnt), widths = ws.map(w => textW(w.w, fnt));
  const total = widths.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const bw = total + 84, bh = size * 1.9, x0 = W / 2 - bw / 2, y0 = y - bh / 2 + (1 - k) * 14;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = k;
  lqLacquer(() => X.roundRect(x0, y0, bw, bh, 8), LQ_PAL.black, { lift: 6, rim: 1, bounds: [x0, y0, bw, bh], glint: frac(t * .3), mottle: .1 });
  X.strokeStyle = 'rgba(217,164,65,.85)'; X.lineWidth = 1.4; X.beginPath(); X.roundRect(x0 + 6, y0 + 6, bw - 12, bh - 12, 5); X.stroke();
  for (const sd of [-1, 1]) { X.fillStyle = LQ_PAL.gold; X.beginPath(); const cx = W / 2 + sd * (bw / 2 - 22), cy = y0 + bh / 2; X.moveTo(cx, cy - 6); X.lineTo(cx + 5, cy); X.lineTo(cx, cy + 6); X.lineTo(cx - 5, cy); X.fill(); }
  let x = W / 2 - total / 2;
  X.font = fnt; X.textBaseline = 'middle';
  ws.forEach((w, j) => {
    const on = t >= w.t;
    X.fillStyle = on ? D2_EGG : 'rgba(243,235,221,.32)'; X.fillText(w.w, x, y0 + bh / 2 + 2);
    if (on && t < w.t + .3) { X.globalAlpha = k * (1 - (t - w.t) / .3); X.fillStyle = LQ_PAL.goldHi; X.fillText(w.w, x, y0 + bh / 2 + 2); X.globalAlpha = k; }
    x += widths[j] + sp;
  });
  X.restore();
}

// A word slammed into the lacquer as inlay: overshoots in scale, lands on t0, with a gold-flake burst. Returns the width.
function D2_stamp(str, x, y, t, t0, o = {}) {
  const size = o.size || 200, fnt = o.font || FONT.vn(size), w = textW(str, fnt, o.tracking || 0);
  if (t < t0 - .03) return w;
  const k = clamp((t - t0 + .03) / .16), s = lerp(1.55, 1, easeOut(k)), a = clamp(k * 2.5);
  let x0 = x; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w;
  const cx = x0 + w / 2, cy = y - size * .35;
  X.save(); X.globalAlpha = a;
  X.translate(cx, cy); X.scale(s, s); X.rotate((o.rot || 0) + (1 - k) * (o.spin ?? .04)); X.translate(-cx, -cy);
  lqInlayText(str, x0, y, { font: fnt, size, material: o.material || 'gold', glint: o.glint ?? clamp((t - t0) / .7) * .9 + .05, tracking: o.tracking || 0, scale: o.scale });
  X.restore();
  if (o.flakes !== false) D2_flakes(cx, cy, t, t0, { n: o.n || 16, r: w * .55, seed: t0 });
  return w;
}

// Gold-leaf flakes flung out of a hit (flat fills, cheap).
function D2_flakes(x, y, t, t0, o = {}) {
  const lt = t - t0, dur = o.dur || .9; if (lt < 0 || lt > dur) return;
  const n = o.n || 16, R = o.r || 300, sd = o.seed || 0, k = lt / dur;
  X.save();
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 3.1 + sd), h2 = hash(i * 7.7 + sd * 1.3), h3 = hash(i * 1.9 + sd * 2.1);
    const ang = h1 * TAU, sp = R * (.45 + h2 * .8), e = easeOut(k * 1.3);
    const px = x + Math.cos(ang) * sp * e, py = y + Math.sin(ang) * sp * e * .7 + k * k * 260, sz = (5 + h3 * 13) * (1 - k * .5);
    X.globalAlpha = (1 - k) * .95;
    X.fillStyle = h3 < .33 ? LQ_PAL.goldHi : h3 < .66 ? LQ_PAL.gold : (o.silver ? LQ_PAL.silverHi : '#B8812A');
    X.save(); X.translate(px, py); X.rotate(h1 * 9 + lt * (4 + h2 * 8)); X.scale(1, Math.abs(Math.cos(lt * 9 + h2 * 6)) * .8 + .2);
    X.fillRect(-sz / 2, -sz / 2, sz, sz); X.restore();
  }
  X.restore();
}

// Screen-space gold glint sweep (a flash of light raking across the polished panel).
function D2_sweep(t, t0, dur = .3, a = .55) {
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter';
  const x = lerp(-700, W + 700, easeOut(k)), g = X.createLinearGradient(x - 420, 0, x + 420, 200);
  g.addColorStop(0, 'rgba(255,220,150,0)'); g.addColorStop(.5, `rgba(255,226,160,${a * (1 - k * .6)})`); g.addColorStop(1, 'rgba(255,220,150,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.globalAlpha = (1 - k) * a * .35; X.fillStyle = '#FFE7B0'; X.fillRect(0, 0, W, H);
  X.restore();
}

// Gold-leaf sun with rotating rays.
function D2_sun(x, y, R, t, o = {}) {
  const n = o.rays ?? 24, rot = (o.rot ?? 0) + t * (o.spin ?? .08), r1 = R * 1.1, r2 = R * (o.len ?? 1.85), g = o.glint ?? frac(t * .25);
  if (o.halo !== false) {
    X.save(); X.globalCompositeOperation = 'lighter';
    const hg = X.createRadialGradient(x, y, R * .8, x, y, R * 2.6); hg.addColorStop(0, `rgba(246,200,110,${.3 * (o.haloA ?? 1)})`); hg.addColorStop(1, 'rgba(246,200,110,0)');
    X.fillStyle = hg; X.fillRect(x - R * 2.6, y - R * 2.6, R * 5.2, R * 5.2); X.restore();
  }
  if (n) lqGold(() => { for (let i = 0; i < n; i++) { const a = rot + i / n * TAU, w = (i % 2 ? .045 : .075), L = i % 2 ? r2 * .82 : r2; X.moveTo(x + Math.cos(a - w) * r1, y + Math.sin(a - w) * r1); X.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); X.lineTo(x + Math.cos(a + w) * r1, y + Math.sin(a + w) * r1); X.closePath(); } },
    { scale: R / 700, glint: g, bevel: 1.2, alpha: o.rayA ?? .92, bounds: [x - r2, y - r2, r2 * 2, r2 * 2] });
  lqGold(() => X.arc(x, y, R, 0, TAU), { scale: R / 500, glint: frac(g + .15), bevel: 2.5, lift: o.lift ?? 8, bounds: [x - R, y - R, R * 2, R * 2] });
  X.save(); X.globalAlpha = .55; X.strokeStyle = '#8E5E1C'; X.lineWidth = Math.max(1.5, R * .012);
  for (const k of [.82, .64]) { X.beginPath(); X.arc(x, y, R * k, 0, TAU); X.stroke(); }
  X.restore();
}

// The idol in the cinnabar áo dài and a gold nón lá, singing.
function D2_idol(x, hip, s, t, pose, o = {}) {
  idolBody(x, hip, s, pose, { outfit: 'aodai', glint: o.glint, face: { hat: 'nonla', hatMat: 'gold', mouth: o.mouth ?? clamp(VOX(t) * 1.3 - .2), eyes: o.eyes || 'open', blush: .7, look: o.look || [0, 0], ...(o.face || {}) } });
}
function D2_clawd(x, y, s, t, move, o = {}) {
  const c = clawdDance(t, move, 0);
  lqClawd(x, y, s, { ...c, hat: null, glint: o.glint ?? frac(t * .2 + .4), flip: o.flip, jump: (c.jump || 0) * s / 200 + (o.jump || 0), look: o.look });
}
// Arms of a masked dancer: a wave rolling along the line, snapping on the beat; `up` (0..1) forces both arms high.
function D2_arms(t, i, o = {}) {
  const b = beatF(t), n = Math.floor(b), p = easeOut(clamp((b - n) / .35)), ph = (n + p) * Math.PI / 2 - i * (o.lag ?? .6);
  const up = o.up || 0, l = .15 + .75 * (.5 + .5 * Math.sin(ph)), r = .15 + .75 * (.5 + .5 * Math.sin(ph + 1.3));
  return [lerp(l, 1, up), lerp(r, 1, up)];
}
function D2_dancer(x, y, h, t, i, o = {}) {
  const arms = o.arms || D2_arms(t, i, o);
  lqMaskDancer(x, y, h, t, { arms, step: beatF(t) + i * .5, lean: Math.sin(beatF(t) * Math.PI / 2 + i) * .06 + (o.lean || 0), flip: o.flip ?? (i % 2 === 1), mask: o.mask || (i % 5 === 2 ? 'gold' : 'egg'), robe: o.robe, robeDk: o.robeDk, gold: o.gold });
}
// "Come my" call: 1 on the sung words of a call line, decaying — dancers throw both arms up.
function D2_call(t, lines) {
  let v = 0;
  for (const i of lines) for (const w of D2_wt(i)) v = Math.max(v, t >= w.t - .04 ? Math.pow(1 - clamp((t - w.t) / .5), 1.5) : 0);
  return v;
}

// =====================================================================================================================
// D′1 · I do not gamble / and e too sure → the silver hit
// =====================================================================================================================
function D2_panelA(t) {
  const lt = t - 157.6;
  lqLacquer(() => X.rect(0, 0, W, H), LQ_PAL.cinnabar, { bounds: [0, 0, W, H], glint: frac(.2 + lt * .25), mottle: .35, rim: 0 });
  // lacquer vignette, deeper on the left under the type
  X.save(); const vg = X.createRadialGradient(1380, 520, 150, 960, 540, 1250); vg.addColorStop(0, 'rgba(40,5,3,0)'); vg.addColorStop(1, 'rgba(30,4,2,.7)'); X.fillStyle = vg; X.fillRect(0, 0, W, H); X.restore();
  camBegin({ zoom: 1.02 + lt * .025 + KICK(t) * .012, x: 960, y: 540, shake: KICK(t) * 5 });
  // gold-leaf ground line and a wedge of sun rays behind the head
  D2_sun(1540, 500, 150, t, { rays: 20, len: 2.6, spin: .12, rayA: .5, halo: true, haloA: .4 });
  idolHead(1540, 640, 200, { hat: 'nonla', hatMat: 'gold', bust: true, eyes: t > 159.1 ? 'happy' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), look: [-.35, .05], tilt: -.05 + Math.sin(beatF(t) * Math.PI / 2) * .04, blush: .8, brow: .4 });
  camEnd();
  // I DO NOT / GAMBLE / AND E TOO SURE
  let x = 110;
  x += D2_stamp('I', x, 300, t, D2_w(56, 0, 157.66), { size: 170 }) + 50;
  x += D2_stamp('DO', x, 300, t, D2_w(56, 1, 157.79), { size: 170 }) + 50;
  D2_stamp('NOT', x, 300, t, D2_w(56, 2, 158.06), { size: 170 });
  D2_stamp('GAMBLE', 100, 540, t, D2_w(56, 3, 158.2), { size: 200, n: 26 });
  x = 115;
  const eg = { size: 150, material: 'egg', flakes: false, font: FONT.vnI(150) };
  x += D2_stamp('and', x, 760, t, D2_w(57, 0, 158.61), eg) + 40;
  x += D2_stamp('e', x, 760, t, D2_w(57, 1, 158.75), eg) + 40;
  x += D2_stamp('too', x, 760, t, D2_w(57, 2, 159.02), eg) + 40;
  D2_stamp('sure', x, 760, t, D2_w(57, 3, 159.15), { ...eg, flakes: true, n: 10 });
}
shot(157.6, 159.428, (t, lt) => {
  D2_panelA(t);
  D2_sweep(t, 157.6, .32, .7);
}, { seed: 561 });

// The silver panel: idol dancing on silver leaf, a black-lacquer masked frieze, COME MY! inlaid in gold.
function D2_silverPanel(t) {
  const lt = t - 159.428, g = frac(.1 + beatF(t) * .125);
  lqSilver(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H], glint: g, glintW: 600, bevel: 0, scale: 1.1 });
  // a soft cool shade toward the edges so the leaf reads as a polished panel
  X.save(); const vg = X.createRadialGradient(900, 480, 200, 960, 540, 1200); vg.addColorStop(0, 'rgba(20,20,26,0)'); vg.addColorStop(1, 'rgba(20,20,26,.55)'); X.fillStyle = vg; X.fillRect(0, 0, W, H); X.restore();
  camBegin({ zoom: 1.04 - lt * .012 + KICK(t) * .012, x: 960, y: 540, shake: KICK(t) * 6 });
  // black lacquer floor with a gold hairline
  lqLacquer(() => X.rect(-100, 880, W + 200, 400), '#0f0b0a', { bounds: [-100, 880, W + 200, 300], glint: frac(g + .3), rim: 0 });
  X.fillStyle = LQ_PAL.gold; X.fillRect(-100, 878, W + 200, 4);
  // masked frieze, black robes against the silver
  const call = D2_call(t, [58]);
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 110 + (i > 3 ? 230 : 0) - (i > 6 ? 60 : 0), h = 240 + (i % 2) * 36;
    D2_dancer(x, 895 + (i % 2) * 10, h, t, i, { robe: '#1b1311', robeDk: '#0b0706', gold: .9, up: call * .9, mask: i % 3 === 1 ? 'gold' : 'egg' });
  }
  const pose = t < 161.2 ? dance(t, 'break') : { ...PZ.point };
  D2_idol(560, 590, 50, t, pose, { eyes: t > 161.6 ? 'wink' : 'open' });
  camEnd();
  // GIRL YOU NEED TO (small, black lacquer) / COME / MY!
  const fs = FONT.vnSansB(58);
  let x = 1080;
  ['GIRL', 'YOU', 'NEED', 'TO'].forEach((w, j) => {
    const t0 = D2_w(58, j, 159.43 + j * .4), k = easeOut((t - t0) / .12);
    if (k > 0) { X.save(); X.globalAlpha = k; X.font = fs; X.fillStyle = '#120D0B'; X.fillText(w, x, 250 - (1 - k) * 18); X.restore(); }
    x += textW(w + ' ', fs) + 6;
  });
  X.fillStyle = 'rgba(18,13,11,.8)'; X.fillRect(1080, 280, 700 * clamp((t - 159.43) / .4), 5);
  D2_stamp('COME', 1060, 600, t, D2_w(58, 4, 161.2), { size: 250, n: 22 });
  D2_stamp('MY!', 1180, 930, t, D2_w(58, 5, 161.61), { size: 330, n: 30 });
}
shot(159.428, 162.564, (t, lt) => {
  const k = expoOut((t - 159.428) / .42);
  if (k < 1) lqReveal(() => D2_silverPanel(t), () => D2_panelA(t), k, 58, { angle: -.3, from: 'left', halo: '#6a3a1c', haloW: 8 });
  else D2_silverPanel(t);
  D2_flakes(960, 540, t, 159.428, { n: 40, r: 900, silver: true, dur: 1.1, seed: 5 });
  D2_sweep(t, 159.428, .3, .45);
}, { seed: 581 });

// =====================================================================================================================
// D′2 · the biggest dance
// =====================================================================================================================
// The karst river at golden hour: the red disc stage with the whole cast, the time machine parked on the disc with its doors open.
function D2_river(t, o = {}) {
  const cam = o.camX || 0, hz = 560, call = o.call || 0, jump = o.jump || 0;
  lqKarstRiver(t, { rect: [-160, -420, 2240, 1500], horizon: hz, camX: cam * 2, time: 'gold', sunX: .5, glint: frac(t * .08 + .1) });
  // god rays from the sun, over the towers
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * .2 + Math.sin(t * .4 + i) * .02, sx = 960 - cam * .1, sy = 60;
    X.fillStyle = `rgba(246,200,110,${.045 + .03 * KICK(t)})`; X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + Math.cos(a + Math.PI - .05) * -1400, sy - Math.sin(a + Math.PI - .05) * -1400); X.lineTo(sx + Math.cos(a + Math.PI + .05) * -1400, sy - Math.sin(a + Math.PI + .05) * -1400); X.fill();
  }
  X.restore();
  const cx = 960, cy = 790, rx = 650, ry = 118;
  lqRedDisc(cx, cy, rx, ry, { glint: frac(t * .15 + .3), thick: 40 });
  // depth-sorted cast on the disc
  const items = [], N = 14, rot = t * .35;
  for (let i = 0; i < N; i++) {
    const a = rot + i / N * TAU, x = cx + Math.cos(a) * rx * .83, y = cy + Math.sin(a) * ry * .78, d = (Math.sin(a) + 1) / 2;
    if (Math.abs(x - 420) < 190 && Math.sin(a) < .2) continue;   // leave room for the parked car
    items.push([y, () => D2_dancer(x, y, lerp(165, 215, d), t, i, { up: Math.max(call, jump), flip: Math.cos(a) > 0 })]);
  }
  items.push([cy - 30, () => lqTimeMachine(430, cy - 30, 480, t, { doors: 1, glint: frac(t * .2 + .6), spin: 0, lights: 1 })]);
  items.push([cy + 6, () => D2_idol(cx, cy + 6 - 5.5 * 40 - jump * 60 * bump(beatP(t) * 1.2), 40, t, jump ? dance(t, 'hype') : call > .3 ? PZ.point : dance(t, 'groove'))]);
  items.push([cy + 12, () => D2_clawd(1230, cy + 12, 175, t, 'groove', { jump: jump * 40 * bump(beatP(t) * 1.3) })]);
  items.sort((p, q) => p[0] - q[0]).forEach(p => p[1]());
  // foreground crowd at the corners, backlit
  for (let i = 0; i < 4; i++) {
    const x = [-10, 190, 1730, 1930][i], y = 1200 + (i % 2) * 30;
    D2_dancer(x, y, 560, t, i + 3, { robe: '#26160d', robeDk: '#120a05', mask: 'gold', up: Math.max(call, jump) * .9, flip: i > 1 });
  }
}
shot(162.564, 164.473, (t, lt) => {
  camBegin({ zoom: 1.03 + lt * .02 + KICK(t) * .01, x: 960 + lt * 25, y: 560, shake: KICK(t) * 6 });
  D2_river(t, { camX: lt * 40 });
  camEnd();
  D2_sweep(t, 162.564, .25, .45);
  D2_caption(t, 59);
}, { seed: 591 });

// The gold sun shot for "Come my…": a huge rising gold-leaf sun on cinnabar, the cast backlit, COME MY… inlaid in the floor.
function D2_sunShot(t, i, v) {
  const t0 = LY[i] ? LY[i][0] : t, lt = t - t0, call = D2_call(t, [i]), mir = v === 2 ? -1 : 1;
  lqGround(t, { tone: 'red', sheen: 1.2 });
  camBegin({ zoom: 1.02 + lt * .03 + call * .03, x: 960, y: 560, rot: v === 2 ? -.025 : .018, shake: KICK(t) * 7 });
  D2_sun(960 + mir * (v === 2 ? 240 : 0), 780, v === 2 ? 470 : 420, t, { rays: v === 2 ? 32 : 24, spin: mir * .12, len: 1.9 });
  // horizon line of backlit dancers
  for (let k = 0; k < 13; k++) {
    const x = 60 + k * 150, h = 250 + (k % 3) * 22;
    D2_dancer(x, 812, h, t, k, { robe: '#1d110b', robeDk: '#0c0705', mask: 'gold', up: call, lag: .35 });
  }
  // floor
  lqLacquer(() => X.rect(-120, 800, W + 240, 400), '#110b09', { bounds: [-120, 800, W + 240, 280], glint: frac(t * .3), rim: 0 });
  X.fillStyle = LQ_PAL.gold; X.fillRect(-120, 797, W + 240, 4);
  // reflection of the sun in the floor lacquer
  X.save(); X.globalCompositeOperation = 'lighter'; const rg = X.createLinearGradient(0, 800, 0, 1080); rg.addColorStop(0, 'rgba(246,190,90,.28)'); rg.addColorStop(1, 'rgba(246,190,90,0)');
  X.fillStyle = rg; X.fillRect(960 + mir * (v === 2 ? 240 : 0) - 380, 800, 760, 280); X.restore();
  const ix = 960 + mir * 250, cxw = 960 - mir * 330;
  D2_clawd(cxw, 812, 230, t, 'pdoom', { flip: mir < 0, jump: call * 60 });
  const pose = call > .2 ? (v === 2 ? PZ.jump : PZ.point) : dance(t, 'hype');
  D2_idol(ix, 812 - 5.5 * 44 - (v === 2 ? call * 40 : 0), 44, t, pose, { eyes: call > .2 ? 'happy' : 'open' });
  camEnd();
  // COME MY… inlaid in the floor
  const ws = D2_wt(i), fnt = FONT.vn(230), w1 = textW('COME', fnt), w2 = textW('MY…', fnt), gap = 70, x0 = W / 2 - (w1 + w2 + gap) / 2;
  D2_stamp('COME', x0, 1025, t, ws[0] ? ws[0].t : t0, { size: 230, n: 20 });
  D2_stamp('MY…', x0 + w1 + gap, 1025, t, ws[1] ? ws[1].t : t0 + .55, { size: 230, n: 20 });
}
shot(164.473, 165.973, (t) => { D2_sunShot(t, 60, 1); D2_sweep(t, 164.473, .22, .5); }, { seed: 601 });

// The pagoda gate at night: the idol under the gate, the masked crowd in waves, the time machine parked with doors open.
function D2_gateShot(t) {
  const lt = t - 165.973;
  lqGround(t, { tone: 'night', camX: lt * 30 });
  camBegin({ zoom: 1.0 + lt * .03 + KICK(t) * .01, x: 960, y: 560, shake: KICK(t) * 5 });
  lqSilver(() => X.arc(330, 190, 80, 0, TAU), { scale: .3, glint: frac(t * .2), bevel: 1.5, lift: 6 });
  // lantern strings across the night sky
  for (let s = 0; s < 2; s++) {
    const y0 = 110 + s * 90;
    X.strokeStyle = 'rgba(217,164,65,.5)'; X.lineWidth = 2; X.beginPath();
    for (let x = -40; x <= W + 40; x += 20) { const y = y0 + Math.pow((x - 960) / 960, 2) * -60 + 60; x === -40 ? X.moveTo(x, y) : X.lineTo(x, y); } X.stroke();
    for (let k = 0; k < 12; k++) {
      const x = 60 + k * 165 + s * 80, y = y0 + Math.pow((x - 960) / 960, 2) * -60 + 60, sw = Math.sin(t * 2 + k) * .08;
      withT(x, y, sw, 1, () => {
        X.fillStyle = 'rgba(246,190,90,.18)'; X.beginPath(); X.arc(0, 26, 40, 0, TAU); X.fill();
        X.fillStyle = LQ_PAL.cinnabar; X.beginPath(); X.ellipse(0, 26, 17, 22, 0, 0, TAU); X.fill();
        X.fillStyle = 'rgba(255,190,120,.5)'; X.beginPath(); X.ellipse(-4, 22, 7, 12, 0, 0, TAU); X.fill();
        X.fillStyle = LQ_PAL.gold; X.fillRect(-9, 2, 18, 4); X.fillRect(-9, 46, 18, 4);
      });
    }
  }
  lqGate(960, 800, 720, { glint: frac(t * .15 + .2), lit: .6 + .4 * KICK(t) });
  // back crowd
  for (let k = 0; k < 20; k++) D2_dancer(-20 + k * 102, 812 + (k % 2) * 8, 150 + (k % 3) * 8, t, k, { lag: .45 });
  lqTimeMachine(1580, 872, 520, t, { doors: 1, glint: frac(t * .2 + .5), flip: true, lights: 1 });
  D2_clawd(680, 872, 150, t, 'groove');
  D2_idol(960, 880 - 5.5 * 36, 36, t, dance(t, 'hearts'), { eyes: 'happy' });
  // middle and front rows
  for (let k = 0; k < 14; k++) { const x = 20 + k * 140; if (Math.abs(x - 960) < 170) continue; D2_dancer(x, 930 + (k % 2) * 10, 230, t, k + 7, { lag: .45 }); }
  for (let k = 0; k < 6; k++) { const x = 60 + k * 360; D2_dancer(x, 1210, 470, t, k + 2, { robe: '#3a2213', robeDk: '#1e0f07', lag: .45 }); }
  camEnd();
}
shot(165.973, 168.973, (t) => { D2_gateShot(t); D2_sweep(t, 165.973, .22, .45); D2_caption(t, 61); }, { seed: 611 });
shot(168.973, 170.746, (t) => { D2_sunShot(t, 62, 2); D2_sweep(t, 168.973, .22, .5); }, { seed: 621 });

// Tender line: a close-up, then (on the beat) the cast orbiting on the disc; the eggshell words stay put across the cut.
function D2_tenderText(t) {
  const ws = D2_wt(63), fnt = FONT.vnI(140), lines = [[0, 1, 2], [3, 4, 5]], ys = [210, 380];
  if (!ws.length) return;
  lines.forEach((row, r) => {
    let x = 110 + r * 70;
    row.forEach(j => {
      const w = ws[j]; if (!w) return;
      const k = easeOut((t - w.t + .04) / .22), wd = textW(w.w, fnt);
      if (k > 0) { X.save(); X.globalAlpha = k; X.translate(0, (1 - k) * 22); lqInlayText(w.w, x, ys[r], { font: fnt, size: 140, material: 'egg', glint: frac(t * .2 + j * .1) }); X.restore(); }
      x += wd + 44;
    });
  });
}
shot(170.746, 175.655, (t, lt) => {
  const tc = beatT(317);   // 173.20: cut on the beat
  if (t < tc) {
    lqGround(t, { tone: 'brown', sheen: 1.3 });
    // drifting gold flakes
    X.save(); for (let i = 0; i < 40; i++) { const x = frac(hash(i * 3.3) + t * .01 * (hash(i) - .5)) * W, y = frac(hash(i * 5.1) + t * (.03 + hash(i * 2) * .04)) * (H + 100) - 50, s = 4 + hash(i * 7) * 10; X.globalAlpha = .35 + hash(i * 9) * .4; X.fillStyle = i % 3 ? LQ_PAL.gold : LQ_PAL.goldHi; withT(x, y, t * (1 + hash(i)) + i, 1, () => X.fillRect(-s / 2, -s / 2, s, s * .7)); } X.restore();
    camBegin({ zoom: 1.0 + lt * .03, x: 1300, y: 600, shake: KICK(t) * 2 });
    D2_sun(1580, 520, 140, t, { rays: 16, len: 3.4, spin: .05, rayA: .45 });
    idolHead(1580, 720, 205, { hat: 'nonla', hatMat: 'gold', bust: true, eyes: t > 172.2 ? 'happy' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), look: [-.25, 0], tilt: .06 + Math.sin(t * 1.4) * .03, blush: 1 });
    camEnd();
  } else {
    const l2 = t - tc;
    lqGround(t, { tone: 'black' });
    camBegin({ zoom: 1.06 - l2 * .02, x: 1080, y: 580, shake: KICK(t) * 4 });
    D2_sun(1400, 470, 210, t, { rays: 24, spin: -.1, len: 1.6 });
    const cx = 1330, cy = 900, rx = 560, ry = 105;
    lqRedDisc(cx, cy, rx, ry, { glint: frac(t * .2), thick: 36 });
    const items = [], N = 12, rot = -l2 * 1.1;
    for (let i = 0; i < N; i++) { const a = rot + i / N * TAU, x = cx + Math.cos(a) * rx * .8, y = cy + Math.sin(a) * ry * .75, d = (Math.sin(a) + 1) / 2; items.push([y, () => D2_dancer(x, y, lerp(170, 240, d), t, i, { flip: Math.cos(a) < 0 })]); }
    items.push([cy, () => D2_idol(cx, cy - 5.5 * 42, 42, t, dance(t, 'groove'), { eyes: 'happy' })]);
    items.sort((p, q) => p[0] - q[0]).forEach(p => p[1]());
    camEnd();
    D2_sweep(t, tc, .22, .4);
  }
  D2_tenderText(t);
  D2_sweep(t, 170.746, .22, .45);
}, { seed: 631 });

// I CAN NEVER REFUSE: the build to the loudest bar. Gold rays grow word by word, the cast crouches and springs.
shot(175.655, beatT(324), (t, lt) => {
  const ws = D2_wt(64), k = clamp(lt / 1.35);
  lqGround(t, { tone: 'black', sheen: 1.4 });
  const zp = ws.slice(0, 4).reduce((p, w) => p + .035 * hit(t, w.t, .3), 0);
  camBegin({ zoom: 1.0 + k * .08 + zp, x: 1100, y: 560, shake: KICK(t) * 8 + k * 6 });
  D2_sun(1560, 470, 120 + k * 130, t, { rays: 28, len: 2.4 + k * 1.6, spin: .4, rayA: .6 + k * .35 });
  for (let i = 0; i < 12; i++) D2_dancer(-40 + i * 175, 1130 + (i % 2) * 20, 420, t, i, { robe: '#2a180d', robeDk: '#140b05', up: k * .8, lag: .3 });
  D2_clawd(1800, 905, 150, t, 'pdoom');
  D2_idol(1590, 900 - 5.5 * 46, 46, t, lt < .9 ? dance(t, 'hype') : PZ.crouch, { eyes: 'open', face: { brow: .8 } });
  camEnd();
  D2_stamp('I CAN', 110, 330, t, D2_w(64, 0, 175.66), { size: 180 });
  D2_stamp('NEVER', 100, 600, t, D2_w(64, 2, 176.2), { size: 250, n: 22 });
  D2_stamp('REFUSE', 90, 900, t, D2_w(64, 3, 176.61), { size: 260, n: 28 });
  D2_sweep(t, 175.655, .22, .45);
}, { seed: 641 });

// 177.02, the loudest bar: a full-frame gold hit, YOU! in cinnabar, sanded back to the whole cast jumping on the river.
function D2_goldPanel(t) {
  const t0 = beatT(324), lt = t - t0;
  lqGold(() => X.rect(0, 0, W, H), { bounds: [0, 0, W, H], glint: clamp(lt / .6) * 1.1 - .05, glintW: 700, bevel: 0, scale: 1.3 });
  X.save(); const vg = X.createRadialGradient(960, 540, 300, 960, 540, 1200); vg.addColorStop(0, 'rgba(60,30,5,0)'); vg.addColorStop(1, 'rgba(60,30,5,.5)'); X.fillStyle = vg; X.fillRect(0, 0, W, H); X.restore();
  const tw = D2_w(64, 4, 177.15);
  D2_stamp('YOU!', W / 2, 770, t, tw, { size: 560, align: 'center', material: 'red', n: 36, spin: .02 });
}
shot(beatT(324), 179.473, (t, lt) => {
  const t0 = beatT(324), ts = beatT(325), k = expoOut((t - ts) / .5);
  const bottom = () => { camBegin({ zoom: 1.08 - clamp((t - ts) / 1.6) * .06, x: 960, y: 560, shake: KICK(t) * 10 + hit(t, ts, .6) * 14 }); D2_river(t, { camX: 80 + lt * 30, jump: 1 }); camEnd(); };
  if (k <= 0) D2_goldPanel(t);
  else if (k < 1) lqReveal(bottom, () => D2_goldPanel(t), k, 65, { from: 'center', angle: -.5, halo: '#8a4a1a', haloW: 10 });
  else bottom();
  // white-gold flash on the hit
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter'; X.globalAlpha = hit(t, t0, .35) * .85; X.fillStyle = '#FFE9B8'; X.fillRect(0, 0, W, H); X.restore();
  D2_flakes(960, 540, t, t0, { n: 60, r: 1100, dur: 1.2, seed: 9 });
  if (k > 0) D2_flakes(960, 420, t, ts, { n: 40, r: 900, dur: 1.0, seed: 11 });
  // COME MY... over the sky
  const ws = D2_wt(65), fnt = FONT.vn(220), w1 = textW('COME', fnt), w2 = textW('MY...', fnt), gap = 70, x0 = W / 2 - (w1 + w2 + gap) / 2;
  D2_stamp('COME', x0, 300, t, ws[0] ? ws[0].t : 177.7, { size: 220, n: 20 });
  D2_stamp('MY...', x0 + w1 + gap, 300, t, ws[1] ? ws[1].t : 178.25, { size: 220, n: 20 });
}, { seed: 651 });

// =====================================================================================================================
// D′3 · the final call and response: the whole panel, filled with every motif of the video
// =====================================================================================================================
// Mural layout (world = the 1920×1080 panel). Six inset paintings in two columns around the live stage in the centre.
const D2_INS = [
  { key: 'karst', r: [40, 380, 460, 320], label: 'Sông đêm', at: 0 },
  { key: 'drum', r: [1420, 380, 460, 320], label: 'Vòng tử thần', at: 1 },
  { key: 'quarter', r: [40, 40, 460, 320], label: 'Phố cổ Hà Nội', at: 2 },
  { key: 'gate', r: [1420, 40, 460, 320], label: 'Khuê Văn Các', at: 3 },
  { key: 'buffalo', r: [40, 720, 460, 320], label: 'Trâu trong bão', at: 4 },
  { key: 'machine', r: [1420, 720, 460, 320], label: 'Cỗ máy thời gian', at: 5 },
];
const D2_STAGE = [520, 40, 880, 1000];
const D2_T3 = 179.473, D2_TEND = 196.6;
const D2_insT = i => barT(84) + i * BEAT * 2;   // 183.56, then every two beats

// The Hanoi old quarter at night: tube houses in gold line on black lacquer, red lanterns.
function D2_quarter(w, h) {
  lqLacquer(() => X.rect(0, 0, w, h), '#140e0b', { bounds: [0, 0, w, h], glint: false, rim: 0 });
  lqEggshell(() => X.arc(w * .82, h * .2, h * .09, 0, TAU), { scale: .25, glint: false, bevel: 1 });
  const r = rng(77); let x = -6;
  X.lineJoin = 'round';
  while (x < w) {
    const hw = 46 + r() * 34, hh = h * (.42 + r() * .3), y0 = h * .9 - hh, tone = r();
    X.fillStyle = lqMix('#24160f', '#3a2416', tone); X.fillRect(x, y0, hw, hh);
    X.strokeStyle = LQ_PAL.gold; X.lineWidth = 1.6; X.strokeRect(x, y0, hw, hh);
    // pitched tile roof
    X.fillStyle = '#0d0907'; X.beginPath(); X.moveTo(x - 5, y0 + 2); X.lineTo(x + hw * .5, y0 - 16 - r() * 8); X.lineTo(x + hw + 5, y0 + 2); X.closePath(); X.fill(); X.stroke();
    // windows and balconies
    const rows = Math.floor(hh / 46);
    for (let j = 0; j < rows - 1; j++) {
      const wy = y0 + 14 + j * 46, lit = r() < .55;
      X.fillStyle = lit ? 'rgba(246,200,110,.75)' : '#0b0806'; X.fillRect(x + hw * .22, wy, hw * .56, 22);
      X.strokeStyle = LQ_PAL.gold; X.lineWidth = 1; X.strokeRect(x + hw * .22, wy, hw * .56, 22);
      X.beginPath(); X.moveTo(x + hw * .5, wy); X.lineTo(x + hw * .5, wy + 22); X.stroke();
      X.beginPath(); X.moveTo(x + 3, wy + 30); X.lineTo(x + hw - 3, wy + 30); X.stroke();
    }
    x += hw + 2;
  }
  // street and lantern string
  X.fillStyle = '#0b0706'; X.fillRect(0, h * .9, w, h * .1); X.fillStyle = LQ_PAL.gold; X.fillRect(0, h * .9, w, 2);
  X.strokeStyle = 'rgba(217,164,65,.6)'; X.lineWidth = 1.2; X.beginPath(); X.moveTo(0, h * .42); X.quadraticCurveTo(w / 2, h * .55, w, h * .4); X.stroke();
  for (let k = 0; k < 9; k++) {
    const u = (k + .5) / 9, lx = u * w, ly = lerp(lerp(h * .42, h * .485, u * 2), lerp(h * .485, h * .4, u * 2 - 1), u > .5 ? 1 : 0) + 4;
    const g = X.createRadialGradient(lx, ly + 10, 2, lx, ly + 10, 26); g.addColorStop(0, 'rgba(246,170,90,.45)'); g.addColorStop(1, 'rgba(246,170,90,0)'); X.fillStyle = g; X.fillRect(lx - 26, ly - 16, 52, 52);
    X.fillStyle = LQ_PAL.cinnabar; X.beginPath(); X.ellipse(lx, ly + 10, 8, 11, 0, 0, TAU); X.fill();
    X.fillStyle = LQ_PAL.gold; X.fillRect(lx - 4, ly - 2, 8, 2);
  }
}
function D2_insetDraw(key, w, h) {
  const G = .42;
  if (key === 'quarter') return D2_quarter(w, h);
  if (key === 'karst') {
    const { horizon } = lqKarstRiver(3, { rect: [0, 0, w, h], time: 'night', sunX: .72, glint: G, camX: 200 });
    lqRedDisc(w * .5, horizon + h * .2, w * .3, h * .07, { glint: G, thick: 8 });
    for (let i = 0; i < 7; i++) { const u = (i - 3) / 3.4; lqMaskDancer(w * .5 + u * w * .24, horizon + h * .2 + Math.cos(u * 1.3) * 5 - 3, h * .2, 0, { arms: [(i % 3) * .45, ((i + 1) % 3) * .45], step: i * .3, flip: i > 3 }); }
    return;
  }
  if (key === 'drum') {
    lqLacquer(() => X.rect(0, 0, w, h), '#2A170D', { bounds: [0, 0, w, h], glint: false, rim: 0 });
    lqDrum(0, { x: w * .5, y: h * .5, r: h * .42, a: 2.2, speed: .9, glint: G });
    return;
  }
  if (key === 'gate') {
    lqLacquer(() => X.rect(0, 0, w, h), '#0f0c12', { bounds: [0, 0, w, h], glint: false, rim: 0 });
    lqSilver(() => X.arc(w * .16, h * .2, h * .07, 0, TAU), { scale: .2, glint: G, bevel: 1 });
    lqGate(w * .5, h * .9, h * .8, { glint: G, lit: 1 });
    for (let i = 0; i < 14; i++) lqMaskDancer(10 + i * (w - 20) / 13, h * .98 + (i % 2) * 4, h * .24, 0, { arms: .3 + .6 * hash(i * 2.3), step: i * .5, flip: i % 2 === 1 });
    return;
  }
  if (key === 'buffalo') {
    lqLacquer(() => X.rect(0, 0, w, h), '#1b1310', { bounds: [0, 0, w, h], glint: false, rim: 0 });
    lqGold(() => X.arc(w * .76, h * .26, h * .14, 0, TAU), { glint: G, scale: .25, bevel: 1.2 });
    lqLacquer(() => { X.moveTo(0, h * .8); X.quadraticCurveTo(w * .5, h * .75, w, h * .82); X.lineTo(w, h); X.lineTo(0, h); X.closePath(); }, LQ_PAL.brown, { rim: 0, glint: false, bounds: [0, h * .75, w, h * .25] });
    lqRain(1.3, { rect: [0, 0, w, h], n: 140, angle: .28, len: 40 });
    lqBuffalo(w * .47, h * .86, w * .6, 1.3, { gait: 'charge', glint: G });
    return;
  }
  if (key === 'machine') {
    lqLacquer(() => X.rect(0, 0, w, h), '#0e0c10', { bounds: [0, 0, w, h], glint: false, rim: 0 });
    lqSilver(() => X.arc(w * .82, h * .2, h * .08, 0, TAU), { scale: .2, glint: G, bevel: 1 });
    X.fillStyle = '#0a0808'; X.fillRect(0, h * .86, w, h * .14); X.fillStyle = 'rgba(217,164,65,.8)'; X.fillRect(0, h * .86, w, 2);
    lqTimeMachine(w * .6, h * .86, w * .66, 2, { doors: 1, trail: .3, glint: G, spin: 0 });
    lqClawd(w * .14, h * .88, w * .17, { arms: [1, .2], glint: G });
  }
}
// Each inset painting is baked once per output scale (a pure function of its key), then drawn with a live glint.
const D2_INSC = {};
function D2_insetCanvas(key, w, h) {
  const q = SX * 2, ck = key + '@' + q;
  if (D2_INSC[ck]) return D2_INSC[ck];
  const c = mkCanvas(Math.round(w * q), Math.round(h * q)), prevX = X, prevT = T;
  X = c.getContext('2d'); T = 0;
  try { X.setTransform(q, 0, 0, q, 0, 0); X.save(); X.beginPath(); X.rect(0, 0, w, h); X.clip(); D2_insetDraw(key, w, h); X.restore(); }
  finally { X = prevX; T = prevT; }
  return (D2_INSC[ck] = c);
}
function D2_insetPaint(ins, t) {
  const [x, y, w, h] = ins.r;
  X.drawImage(D2_insetCanvas(ins.key, w, h), x, y, w, h);
  // live polish glint across the inset
  X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip(); X.globalCompositeOperation = 'lighter';
  X.fillStyle = lqBand(frac(t * .18 + ins.at * .17), { bounds: [x, y, w, h], glintAng: -.8, glintW: w * .3 }, [[0, 0], [.5, .14], [1, 0]], [255, 230, 190]);
  X.fillRect(x, y, w, h); X.restore();
  X.save(); X.font = FONT.vnSansM(15); X.fillStyle = 'rgba(246,227,161,.9)'; X.fillText(ins.label, x + 14, y + h - 14); X.restore();
}
function D2_emptyPanel(r, t) {
  lqLacquer(() => X.rect(r[0], r[1], r[2], r[3]), '#150f0c', { bounds: r, glint: false, rim: 0, mottle: 0 });
  X.strokeStyle = 'rgba(217,164,65,.35)'; X.lineWidth = 1.5; X.strokeRect(r[0] + 12, r[1] + 12, r[2] - 24, r[3] - 24);
}
// Gold frame and dividers of the whole panel.
function D2_frame(t) {
  const g = frac(t * .1 + .3);
  lqGold(() => { X.rect(0, 0, W, H); X.moveTo(22, 22); X.lineTo(22, H - 22); X.lineTo(W - 22, H - 22); X.lineTo(W - 22, 22); X.closePath(); }, { bounds: [0, 0, W, H], glint: g, bevel: 2, lift: 0, scale: .8 });
  lqGold(() => {
    X.rect(505, 22, 10, H - 44); X.rect(1405, 22, 10, H - 44);
    for (const x of [22, 1415]) { X.rect(x, 365, 483, 10); X.rect(x, 705, 483, 10); }
  }, { bounds: [0, 0, W, H], glint: false, bevel: 1, lift: 0, scale: .8 });
}
// The live stage in the centre: a gold sun, the red disc, the idol, the Clawd and a ring of masked dancers.
function D2_stage(t, call) {
  const S = D2_STAGE;
  X.save(); X.beginPath(); X.rect(S[0], S[1], S[2], S[3]); X.clip();
  lqLacquer(() => X.rect(S[0], S[1], S[2], S[3]), '#1a0e0a', { bounds: S, glint: frac(t * .1), rim: 0, mottle: .3 });
  // far karst silhouettes along the horizon
  X.fillStyle = '#2c1a10';
  X.beginPath(); X.moveTo(S[0], 760); for (let i = 0; i <= 22; i++) { const x = S[0] + i / 22 * S[2], hh = 60 + 90 * Math.pow(Math.abs(Math.sin(i * 1.7)), 3); X.lineTo(x, 760 - hh); } X.lineTo(S[0] + S[2], 800); X.lineTo(S[0], 800); X.fill();
  D2_sun(960, 380, 250, t, { rays: 26, spin: .08, len: 1.75, lift: 6 });
  X.fillStyle = '#0c0807'; X.fillRect(S[0], 790, S[2], 260); X.fillStyle = 'rgba(217,164,65,.7)'; X.fillRect(S[0], 788, S[2], 3);
  const cx = 960, cy = 905, rx = 410, ry = 76;
  lqRedDisc(cx, cy, rx, ry, { glint: frac(t * .2 + .1), thick: 26 });
  const items = [], N = 11, rot = (t - D2_T3) * .45;
  for (let i = 0; i < N; i++) { const a = rot + i / N * TAU, x = cx + Math.cos(a) * rx * .82, y = cy + Math.sin(a) * ry * .75, d = (Math.sin(a) + 1) / 2; if (Math.abs(x - 1170) < 70 && Math.sin(a) > -.3) continue; items.push([y, () => D2_dancer(x, y, lerp(120, 165, d), t, i, { up: call, flip: Math.cos(a) < 0 })]); }
  items.push([cy + 2, () => D2_idol(cx, cy + 2 - 5.5 * 34, 34, t, call > .25 ? PZ.point : dance(t, t > 192.3 ? 'hype' : 'groove'), { eyes: call > .25 ? 'happy' : 'open' })]);
  items.push([cy + 10, () => D2_clawd(1175, cy + 10, 120, t, 'groove', { jump: call * 30 })]);
  items.sort((p, q) => p[0] - q[0]).forEach(p => p[1]());
  X.restore();
}
// Black lacquer cartouche with gold edge, for the big call words over the busy panel.
function D2_cartouche(cx, cy, w, h, k, t) {
  if (k <= 0) return;
  X.save(); X.globalAlpha = k; X.translate(cx, cy); X.scale(lerp(.85, 1, easeOut(k)), 1);
  lqLacquer(() => X.roundRect(-w / 2, -h / 2, w, h, h * .12), '#0e0a09', { bounds: [-w / 2, -h / 2, w, h], lift: 14, rim: 2, glint: frac(t * .3) });
  X.strokeStyle = LQ_PAL.gold; X.lineWidth = 3; X.beginPath(); X.roundRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, h * .09); X.stroke();
  X.lineWidth = 1; X.beginPath(); X.roundRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, h * .07); X.stroke();
  X.restore();
}
function D2_callWords(t, i, words, y, size, o = {}) {
  const ws = D2_wt(i); if (!ws.length) return;
  const a = ws[0].t, end = o.end ?? LY[i][1] + .25, fnt = FONT.vn(size), gap = size * .28;
  const widths = words.map(w => textW(w, fnt)), tot = widths.reduce((p, q) => p + q, 0) + gap * (words.length - 1);
  const kin = easeOut((t - a + .06) / .14), kout = 1 - easeIn((t - end) / .2), k = Math.min(kin, kout);
  if (k <= 0) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  D2_cartouche(W / 2, y - size * .33, tot + size * .9, size * 1.35, k, t);
  X.globalAlpha = kout;
  let x = W / 2 - tot / 2;
  words.forEach((w, j) => { D2_stamp(w, x, y, t, ws[Math.min(j, ws.length - 1)].t, { size, n: o.n || 18, flakes: o.flakes }); x += widths[j] + gap; });
  X.restore();
}
function D2_muralZoom(t) {
  const u = clamp((t - D2_T3) / (196.25 - D2_T3)), e = ease(u);
  let z = 2.25 * Math.pow(.935 / 2.25, e);
  for (const i of [67, 69, 72]) for (const w of D2_wt(i)) z *= 1 + .045 * hit(t, w.t, .45);
  for (const w of D2_wt(71)) z *= 1 + .02 * hit(t, w.t, .3);
  return z;
}
shot(D2_T3, D2_TEND, (t, lt) => {
  const z = D2_muralZoom(t), u = ease(clamp((t - D2_T3) / (196.25 - D2_T3)));
  const cx = 960, cy = lerp(650, 540, u);
  const call = D2_call(t, [67, 69, 72]), settle = clamp((t - 195.9) / .7);
  // the gallery wall beyond the panel's edge
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); const wg = X.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#15100d'); wg.addColorStop(1, '#0a0706'); X.fillStyle = wg; X.fillRect(0, 0, W, H); X.restore();
  camBegin({ zoom: z, x: cx, y: cy, shake: KICK(t) * 5 * (1 - settle) });
  X.save(); X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 40; X.shadowOffsetY = 18; X.fillStyle = '#0d0907'; X.fillRect(0, 0, W, H); X.restore();
  lqLacquer(() => X.rect(0, 0, W, H), '#100b09', { bounds: [0, 0, W, H], glint: false, rim: 0, mottle: .3 });
  // screen box of a world rect under the current camera (for the sanding region)
  const scr = r => [(r[0] - cx) * z + W / 2, (r[1] - cy) * z + H / 2, r[2] * z, r[3] * z];
  D2_INS.forEach((ins, i) => {
    const t0 = D2_insT(ins.at), k = clamp((t - t0) / .85);
    const vis = scr(ins.r);
    if (vis[0] > W || vis[0] + vis[2] < 0 || vis[1] > H || vis[1] + vis[3] < 0) return;
    if (k <= 0) D2_emptyPanel(ins.r, t);
    else if (k >= 1) D2_insetPaint(ins, t);
    else lqReveal(() => D2_insetPaint(ins, t), () => D2_emptyPanel(ins.r, t), expoOut(k), 70 + i, { region: vis, angle: -.35, from: i % 2 ? 'right' : 'left', halo: '#6a3a1c', haloW: 6, name: 'D2i' + (i % 2) });
    // a glint flash across the inset as it is revealed
    if (k > 0 && k < 1) { X.save(); X.beginPath(); X.rect(...ins.r); X.clip(); X.globalCompositeOperation = 'lighter'; X.fillStyle = lqBand(k, { bounds: ins.r, glintAng: -.6, glintW: 160 }, [[0, 0], [.5, .5], [1, 0]], [255, 226, 160]); X.fillRect(...ins.r); X.restore(); }
  });
  D2_stage(t, call);
  D2_frame(t);
  camEnd();
  // falling gold flakes, screen space
  if (settle < 1) { X.save(); X.globalAlpha = 1 - settle; for (let i = 0; i < 30; i++) { const x = frac(hash(i * 3.3) + t * .01 * (hash(i) - .5)) * W, y = frac(hash(i * 5.1) + t * (.04 + hash(i * 2) * .05)) * (H + 100) - 50, s = 4 + hash(i * 7) * 9; X.globalAlpha = (.35 + hash(i * 9) * .45) * (1 - settle); X.fillStyle = i % 3 ? LQ_PAL.gold : LQ_PAL.goldHi; withT(x, y, t * (1 + hash(i)) + i, 1, () => X.fillRect(-s / 2, -s / 2, s, s * .7)); } X.restore(); }
  // text: captions on the quiet lines, cartouche stamps on the calls
  D2_caption(t, 66); D2_caption(t, 68); D2_caption(t, 70);
  D2_callWords(t, 67, ['COME', 'MY…'], 1000, 170);
  D2_callWords(t, 69, ['COME', 'MY…'], 1000, 170);
  const r71 = D2_wt(71);
  if (r71.length) {
    const a = r71[0].t, end = LY[71][1] + .15, kin = easeOut((t - a + .06) / .14), kout = 1 - easeIn((t - end) / .2), k = Math.min(kin, kout);
    if (k > 0) {
      X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
      D2_cartouche(W / 2, 250, 1500, 400, k, t); X.globalAlpha = kout;
      const f1 = FONT.vn(150), wI = textW('I', f1), wC = textW('CAN', f1), wN = textW('NEVER', f1), g = 44, x0 = W / 2 - (wI + wC + wN + g * 2) / 2;
      D2_stamp('I', x0, 225, t, r71[0].t, { size: 150, n: 8 });
      D2_stamp('CAN', x0 + wI + g, 225, t, r71[1].t, { size: 150, n: 10 });
      D2_stamp('NEVER', x0 + wI + wC + g * 2, 225, t, r71[2].t, { size: 150, n: 14 });
      const f2 = FONT.vn(150), wR = textW('REFUSE', f2), wY = textW('YOU!', f2), x1 = W / 2 - (wR + wY + g) / 2;
      D2_stamp('REFUSE', x1, 395, t, r71[3].t, { size: 150, n: 16 });
      D2_stamp('YOU!', x1 + wR + g, 395, t, r71[4].t, { size: 150, n: 18 });
      X.restore();
    }
  }
  D2_callWords(t, 72, ['COME', 'MY...'], 250, 200, { end: 999, n: 30 });
  D2_sweep(t, D2_T3, .25, .45);
  D2_sweep(t, D2_w(72, 0, 194.75), .5, .35);
}, { seed: 661 });
TESTS.d2perf = t => {
  const flush = () => X.getImageData(0, 0, 1, 1), out = [];
  for (const tt of [157.9, 159.6, 160.8, 163.3, 164.8, 166.8, 172, 174, 176.5, 177.3, 177.8, 178.6, 180.5, 184, 186.5, 189.5, 193.9, 196.3]) {
    const sh = shotAt(tt); const ms = [];
    for (let i = 0; i < 3; i++) { const a = performance.now(); T = tt + i * .033; X.setTransform(SX, 0, 0, SX, 0, 0); paintShot(sh, tt + i * .033); flush(); ms.push(Math.round(performance.now() - a)); }
    out.push(tt + ':' + ms.join('/'));
  }
  console.error('d2perf ' + out.join('  '));
};
