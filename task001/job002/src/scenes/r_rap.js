// r_rap.js: R · Rap (Tyga's verse), 107.5–133.5. LY[33]–LY[44]. The palette turns SILVER: silver leaf on night
// blue-black lacquer, cinnabar accents, a little gold. The silver-leaf Clawd (shades, gold chain) is the visitor.
//   R1  107.5–112.5   the time machine arrives in gold sparks, the gull-wing door opens, the silver Clawd hops out;
//                     LEFT RIGHT BACK FORTH stamped one per beat on cinnabar dance-mat tiles; the mat lights to the bass
//   R2a 112.5–114.0   night river in silver leaf, a gold shooting star: SHOOTING STAR
//   R2b 114.0–117.6   Clawd close-up against a silver moon, the star in his shades: NO FLAWS / SO HARD
//   R3a 117.6–119.5   the race: past the karst river, a lacquer clock spinning: NO TIME
//   R3b 119.5–121.9   over the red arched bridge on the lake (caption)
//   R3c 121.9–123.8   a gold "1" on a cinnabar medal: SECOND TO NONE
//   R3d 123.8–125.5   speeding to the lacquer heart at the finish line (caption)
//   R4a 125.5–127.7   the gold map re-routes: RE-ROUTE
//   R4b 127.7–130.2   the padlock, the gold key, the door opens (caption)
//   R4c 130.2–133.5   the ex, a grey silhouette, crosses the gold line and is SANDED OUT: SCRATCHING HIM OUT

// ---------- small helpers ----------
const R_T0 = 107.5, R_T1 = 133.5;
// word times, squeezed to end inside the line when the estimate runs past it (LY[44] is very dense)
function R_wt(L) {
  const ws = wordTimes(L), a = L[0], lim = L[1] - .12, last = ws[ws.length - 1].t;
  if (last <= lim) return ws;
  const f = (lim - a) / (last - a);
  return ws.map(w => ({ ...w, t: a + (w.t - a) * f, end: a + (w.end - a) * f }));
}
// glint that sweeps across a word right after it lands, then drifts with the panel polish
const R_glint = (t, t0) => t - t0 < .75 ? lerp(-.15, 1.15, (t - t0) / .75) : frac(t * .09 + .2);

// Stamped silver grotesk: a slam (scale 1.45 → 1), a cinnabar lacquer under-print that settles, the silver inlay, dust.
function R_word(str, x, y, t, t0, o = {}) {
  if (t < t0) return 0;
  const size = o.size || 200, font = o.font || FONT.hero(size), k = clamp((t - t0) / (o.dur || .13)), s = lerp(o.from || 1.45, 1, easeOut(k));
  const w = textW(str, font), ax = o.align === 'center' ? w / 2 : o.align === 'right' ? w : 0;
  X.save(); X.translate(x - ax + w / 2, y - size * .36); X.rotate((o.rot || 0) + (1 - k) * .05 * (hash(t0) - .5)); X.scale(s, s); X.translate(-w / 2, size * .36);
  if (o.ghost !== false) {
    const off = size * (.045 + .1 * (1 - k));
    X.save(); X.globalAlpha = clamp(k * 3) * .95; X.font = font; X.fillStyle = o.ghostCol || LQ_PAL.cinnabar; X.fillText(str, off, off * .8); X.restore();
  }
  lqInlayText(str, 0, 0, { font, size, material: o.mat || 'silver', glint: o.glint ?? R_glint(t, t0), glintW: size * 1.2 });
  X.restore();
  // impact dust: silver flakes kicked off the edges
  const dk = (t - t0) / .45;
  if (dk < 1) {
    X.save(); X.fillStyle = o.mat === 'gold' ? LQ_PAL.goldHi : LQ_PAL.silverHi;
    for (let i = 0; i < 18; i++) {
      const a = hash(t0 * 7 + i) * TAU, r = (30 + hash(i * 3.1 + t0) * size * .7) * easeOut(dk), bx = x - ax + hash(i * 5.3 + t0) * w, by = y - size * .35;
      X.globalAlpha = (1 - dk) * .9; const sz = 2 + hash(i * 1.7) * 5;
      X.fillRect(bx + Math.cos(a) * r, by + Math.sin(a) * r * .7, sz, sz * .7);
    }
    X.restore();
  }
  return w;
}
// small eggshell grotesk words that pop on their sung time (x advances); returns the end x
function R_small(ws, x, y, t, o = {}) {
  const size = o.size || 46, font = o.font || FONT.vnSansB(size), sp = textW(' ', font) * 1.1;
  X.save(); X.font = font; X.textBaseline = 'alphabetic';
  for (const w of ws) {
    const str = o.upper === false ? w.w : w.w.toUpperCase(), ww = textW(str, font), k = clamp((t - w.t + .03) / .12);
    if (k > 0) {
      X.globalAlpha = k; X.fillStyle = 'rgba(0,0,0,.6)'; X.fillText(str, x + 3, y + 4 - (1 - k) * 14);
      X.fillStyle = o.color || LQ_PAL.egg; X.fillText(str, x, y - (1 - k) * 14);
    }
    x += ww + sp;
  }
  X.restore();
  return x;
}
// Lacquer caption: eggshell words on a thin black lacquer plate with a gold hairline; the sung word lit silver-white.
function R_cap(t, L, o = {}) {
  const [a, b] = L, k = easeOut((t - a + .05) / .18) * (1 - ease((t - b + .1) / .14));
  if (k <= .01) return;
  const size = o.size || 40, font = FONT.vnSansB(size), y = o.y ?? 996, ws = R_wt(L);
  const sp = textW(' ', font), widths = ws.map(w => textW(w.w, font)), total = widths.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const bw = total + 84, bh = size * 1.9, x0 = W / 2 - bw / 2, y0 = y - bh / 2 + (1 - k) * 24;
  X.save();
  lqLacquer(() => X.roundRect(x0, y0, bw, bh, 6), '#0c0a0b', { lift: 8, rim: 2, bounds: [x0, y0, bw, bh], alpha: k, glint: frac(t * .3) });
  X.globalAlpha = k * .9; X.strokeStyle = LQ_PAL.gold; X.lineWidth = 1.6; X.beginPath(); X.roundRect(x0 + 7, y0 + 7, bw - 14, bh - 14, 3); X.stroke();
  X.font = font; X.textBaseline = 'middle';
  let x = x0 + 42;
  ws.forEach((w, i) => {
    const on = t >= w.t - .02, cur = on && (i === ws.length - 1 || t < ws[i + 1].t - .02);
    X.globalAlpha = k * (on ? 1 : .38);
    X.fillStyle = cur ? LQ_PAL.silverHi : LQ_PAL.egg; X.fillText(w.w, x, y0 + bh / 2 + 2);
    if (cur) { X.fillStyle = LQ_PAL.gold; X.fillRect(x, y0 + bh - 16, widths[i], 3); }
    x += widths[i] + sp;
  });
  X.restore();
}
// Gold-glint cut: a bright diagonal gleam wipes across the new panel and a gold wash fades.
function R_flash(t, t0, dur = .24) {
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  X.fillStyle = `rgba(246,214,140,${.45 * Math.pow(1 - k, 2)})`; X.fillRect(0, 0, W, H);
  const p = lerp(-.25, 1.25, easeOut(k)), g = X.createLinearGradient(0, 0, W, H * .7);
  g.addColorStop(clamp(p - .14), 'rgba(255,240,200,0)'); g.addColorStop(clamp(p), `rgba(255,246,220,${.85 * (1 - k * .6)})`); g.addColorStop(clamp(p + .14), 'rgba(255,240,200,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.restore();
}
// night sky: lacquer ground + silver pin stars that twinkle
function R_night(t, o = {}) {
  lqGround(t, { tone: 'night', camX: o.camX || 0 });
  const n = o.stars ?? 90, yMax = o.yMax ?? 620, dx = o.drift || 0;
  X.save(); X.fillStyle = LQ_PAL.silverHi;
  for (let i = 0; i < n; i++) {
    const x = (((hash(i * 3.7 + 1) * (W + 200) - dx * (.3 + hash(i) * .7)) % (W + 200)) + W + 200) % (W + 200) - 100, y = hash(i * 9.1 + 4) * yMax, tw = .5 + .5 * Math.sin(t * (2 + hash(i) * 4) + i);
    const r = .8 + hash(i * 5.5) * 2.2; X.globalAlpha = .25 + .6 * tw * hash(i * 2.2 + 7);
    X.fillRect(x - r / 2, y - r / 2, r, r);
    if (r > 2.6) { X.globalAlpha *= .6; X.fillRect(x - r * 2, y - .5, r * 4, 1); X.fillRect(x - .5, y - r * 2, 1, r * 4); }
  }
  X.restore();
}
// flat gold sparks flying out of a point (cheap: plain fills)
function R_sparks(x, y, t, t0, o = {}) {
  const k = (t - t0) / (o.dur || .9); if (k < 0 || k > 1) return;
  const n = o.n || 60, R = o.r || 700;
  X.save();
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? 0) + hash(i * 3.3 + t0) * (o.spread ?? TAU), sp = .3 + hash(i * 7.7 + t0) * .7, d = R * sp * easeOut(k);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * (o.flat ?? 1) + k * k * (o.grav ?? 260), sz = (o.size || 16) * (1 - k) * (.4 + hash(i * 2.9));
    if (sz < 1) continue;
    X.globalAlpha = 1 - k * .6; X.fillStyle = hash(i * 4.1) < .75 ? LQ_PAL.goldHi : (o.alt || LQ_PAL.vermilion);
    sparkPath(px, py, sz, 4, .22, k * 5 + i, .5); X.fill();
  }
  X.restore();
}
function R_heartPath(cx, cy, r) {
  X.moveTo(cx, cy + r * .95);
  X.bezierCurveTo(cx - r * 1.35, cy + r * .1, cx - r * 1.05, cy - r * 1.05, cx, cy - r * .42);
  X.bezierCurveTo(cx + r * 1.05, cy - r * 1.05, cx + r * 1.35, cy + r * .1, cx, cy + r * .95);
  X.closePath();
}
function R_ringPath(cx, cy, r0, r1) { X.moveTo(cx + r1, cy); X.arc(cx, cy, r1, 0, TAU); X.moveTo(cx + r0, cy); X.arc(cx, cy, r0, TAU, 0, true); }
// silver speed streaks (plain fills)
function R_speed(t, o = {}) {
  const n = o.n || 46, y0 = o.y0 ?? 0, y1 = o.y1 ?? 880, v = o.v || 3200, a0 = o.alpha ?? 1;
  X.save();
  for (let i = 0; i < n; i++) {
    const len = 120 + hash(i * 2.1) * 520, span = W + len + 200, x = W + 100 - frac(hash(i * 5.3) + t * v * (.6 + hash(i) * .8) / span) * span;
    const y = y0 + hash(i * 8.3 + 2) * (y1 - y0), th = 1 + hash(i * 3.9) * 3;
    const g = X.createLinearGradient(x, 0, x + len, 0); g.addColorStop(0, `rgba(244,246,248,${.55 * a0})`); g.addColorStop(1, 'rgba(244,246,248,0)');
    X.fillStyle = g; X.fillRect(x, y, len, th);
  }
  X.restore();
}
// road: black lacquer band with scrolling silver dashes and a gold kerb line
function R_road(t, y, o = {}) {
  const v = o.v || 2600;
  lqLacquer(() => X.rect(-60, y, W + 120, H - y + 60), '#0b0a0c', { rim: 0, bounds: [0, y, W, H - y], glint: frac(t * .4) });
  X.save(); X.fillStyle = LQ_PAL.gold; X.globalAlpha = .8; X.fillRect(-10, y, W + 20, 3);
  X.fillStyle = LQ_PAL.silver; X.globalAlpha = .75;
  const yd = y + (H - y) * .5;
  for (let i = -1; i < 9; i++) { const x = ((i * 300 - t * v) % 2700 + 2700) % 2700 - 300; X.fillRect(x, yd, 160, 7); }
  X.restore();
}

// ================================================================================================================
// R1 · the arrival (107.5–112.5)
// ================================================================================================================
const R1_ARRIVE = 107.76, R1_HOP = [108.02, 108.32];
const R1_ARROW = [Math.PI, 0, Math.PI / 2, -Math.PI / 2];   // left, right, back (down), forth (up)
function R1_arrowPath(cx, cy, s, a) {
  const P = [[-.46, -.14], [.08, -.14], [.08, -.42], [.5, 0], [.08, .42], [.08, .14], [-.46, .14]];
  const c = Math.cos(a), sn = Math.sin(a);
  P.forEach(([x, y], i) => { const px = cx + (x * c - y * sn) * s, py = cy + (x * sn + y * c) * s; i ? X.lineTo(px, py) : X.moveTo(px, py); });
  X.closePath();
}
function R1_scene(t) {
  R_night(t, { yMax: 700 });
  const ws = R_wt(LY[33]), w34 = R_wt(LY[34]);
  const shake = KICK(t) * 5 + hit(t, R1_ARRIVE, .45) * 28;
  camBegin({ zoom: 1.02 + (t - R_T0) * .006, x: 960, y: 560, shake });
  // floor: black lacquer stage with a gold horizon hairline and silver reflections
  lqLacquer(() => X.rect(-200, 880, W + 400, 400), '#0a0c12', { rim: 0, bounds: [0, 880, W, 200], glint: frac(t * .15 + .4) });
  X.save(); X.fillStyle = LQ_PAL.gold; X.globalAlpha = .55; X.fillRect(-200, 879, W + 400, 2); X.restore();
  // bass rings on the floor (the dance floor answers the kick)
  X.save(); X.strokeStyle = LQ_PAL.silver;
  for (let j = 0; j < 3; j++) { const bt = beatT(beatN(t) - j), k = (t - bt) / (BEAT * 3); if (t < R1_ARRIVE) break; X.globalAlpha = (1 - k) * .45; X.lineWidth = 2; X.beginPath(); X.ellipse(1030, 905, 120 + k * 700, (120 + k * 700) * .1, 0, 0, TAU); X.stroke(); }
  X.restore();
  // the time machine skids in from the left
  const ka = clamp((t - R_T0) / (R1_ARRIVE - R_T0)), cx = t < R1_ARRIVE ? lerp(-700, 1600, expoOut(ka * 1.0)) : 1600 + Math.sin((t - R1_ARRIVE) * 30) * 8 * Math.exp(-(t - R1_ARRIVE) * 6);
  const trail = t < R1_ARRIVE ? 1 : 1 - clamp((t - R1_ARRIVE) / .7), doors = backOut(clamp((t - 107.9) / .3));
  const spin = (cx + 700) / (.084 * 760) / Math.max(.01, t) ;
  lqTimeMachine(cx, 900, 760, t, { doors, spin, trail, lights: t < R1_ARRIVE ? 1 : .6 + .4 * pulse(t), glint: frac(t * .35 + .1) });
  R_sparks(cx - 280, 850, t, R1_ARRIVE, { n: 70, r: 900, size: 22, dur: 1.1, grav: 400 });
  R_sparks(cx + 300, 860, t, R1_ARRIVE, { n: 30, r: 500, size: 14, dur: .8, a0: -Math.PI, spread: Math.PI });
  // the silver Clawd hops out of the door and lands in front
  if (t >= R1_HOP[0]) {
    const p = clamp((t - R1_HOP[0]) / (R1_HOP[1] - R1_HOP[0])), landed = t >= R1_HOP[1];
    let x = lerp(cx - 60, 1030, easeInOut(p)), jump = Math.sin(p * Math.PI) * 260, s = lerp(.5, 1, easeOut(p)) * 370;
    let o = { glint: frac(t * .3 + .5), step: landed ? beatF(t) : 0, arms: [.8, .8], squash: landed ? hit(t, R1_HOP[1], .25) * .6 : -.1 };
    if (landed) {
      let i = -1; ws.forEach((w, j) => { if (t >= w.t) i = j; });
      const h = i >= 0 ? easeOut((t - ws[i].t) / .12) : 0;
      if (t < w34[0].t) {
        if (i === 0) Object.assign(o, { lean: -.3 * h, look: -1, arms: [1.1, 0] });
        if (i === 1) Object.assign(o, { lean: .3 * h, look: 1, arms: [0, 1.1] });
        if (i === 2) Object.assign(o, { squash: .55 * h, arms: [.2, .2], look: 0 });
        if (i === 3) Object.assign(o, { jump: bump((t - ws[3].t) / .5) * 90, arms: [1.3, 1.3], squash: -.15 });
      } else {
        o = { ...o, ...clawdDance(t, 'groove'), hat: null, glint: o.glint };
        if (t >= w34[6].t) Object.assign(o, { arms: [1.35, 1.35], jump: pulse(t, .5) * 30 });   // hands on the wall
      }
    }
    lqClawd(x, 900, s, { ...o, jump: (o.jump || 0) + jump });
  }
  camEnd();
  // dance-mat tiles with the stamped words, one per beat (camera-free: the type is inlaid in the panel)
  ['LEFT', 'RIGHT', 'BACK', 'FORTH'].forEach((str, i) => {
    const w = ws[i], cy = 200 + i * 196, tx = 88, ts = 158;
    if (t < w.t) return;
    const k = clamp((t - w.t) / .13), s = lerp(1.4, 1, easeOut(k));
    const lit = t >= w34[0].t ? ((beatN(t) % 4) + 4) % 4 === i : t < (ws[i + 1] ? ws[i + 1].t : w34[0].t);
    const hk = lit ? (t >= w34[0].t ? pulse(t, .6, 1) : hit(t, w.t, .5)) : 0;
    withT(tx + ts / 2, cy, 0, s, () => {
      lqLacquer(() => X.roundRect(-ts / 2, -ts / 2, ts, ts, 14), lit ? LQ_PAL.cinnabarLt : LQ_PAL.cinnabarDk, { lift: 8, rim: 3, bounds: [-ts / 2, -ts / 2, ts, ts], glint: frac(t * .5 + i * .2) });
      X.save(); X.strokeStyle = LQ_PAL.gold; X.lineWidth = 2; X.globalAlpha = .8; X.beginPath(); X.roundRect(-ts / 2 + 9, -ts / 2 + 9, ts - 18, ts - 18, 8); X.stroke(); X.restore();
      (lit ? lqGold : lqSilver)(() => R1_arrowPath(0, 0, ts * .78, R1_ARROW[i]), { lift: 5, scale: .3, glint: frac(t * .6 + i * .25), bounds: [-ts / 2, -ts / 2, ts, ts] });
      if (hk > 0) { X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(0, 0, 10, 0, 0, ts * 1.2); g.addColorStop(0, `rgba(246,214,140,${.55 * hk})`); g.addColorStop(1, 'rgba(246,214,140,0)'); X.fillStyle = g; X.fillRect(-ts * 1.3, -ts * 1.3, ts * 2.6, ts * 2.6); X.restore(); }
    });
    R_word(str, tx + ts + 40, cy + 63, t, w.t, { size: 174 });
  });
  R_cap(t, LY[34]);
}

// ================================================================================================================
// R2 · shooting star over the silver river (112.5–117.6)
// ================================================================================================================
// karst silhouettes (static, from hash): lower on the left where the type sits
const R2_KARST = (() => {
  const out = [];
  for (let i = 0; i < 16; i++) {
    const x = -60 + i * 135 + (hash(i * 3.1) - .5) * 60, near = i % 2, hgt = (150 + hash(i * 7.3) * 230) * (x < 820 ? .45 : 1) * (near ? .5 : 1.25), w = 130 + hash(i * 1.9) * 110;
    const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10, a = u * Math.PI; pts.push([x + (u - .5) * w * (1 + .15 * Math.sin(a * 3 + i)), -Math.pow(Math.sin(a), .55) * hgt * (1 + .06 * Math.sin(u * 17 + i))]); }
    out.push({ near, pts });
  }
  return out;
})();
const R2_HZ = 650;
function R2_river(t, y0 = R2_HZ, o = {}) {
  o = { cx: 1060, w: 430, ...o };
  // a silver-leaf ribbon from a thread at the horizon to the whole foreground
  const U = y => (y - y0) / (H + 60 - y0), cxy = y => o.cx + Math.sin(U(y) * 3.4 + .5) * 300 * Math.pow(U(y), .8) - U(y) * 120, hw = y => 6 + Math.pow(U(y), 1.45) * o.w;
  const path = () => { for (let y = y0; y <= H + 60; y += 20) X.lineTo(cxy(y) - hw(y), y); for (let y = H + 60; y >= y0; y -= 20) X.lineTo(cxy(y) + hw(y), y); X.closePath(); };
  lqSilver(path, { scale: .45, glint: frac(t * .22 + .2), bounds: [0, y0, W, H - y0], bevel: 0, lift: 0, shade: .2 });
  // current: dark ripple dashes drifting downstream, bright moon glints
  X.save(); X.beginPath(); path(); X.clip();
  for (let i = 0; i < 70; i++) {
    const f = frac(hash(i * 2.7) + t * .06 * (.6 + hash(i))), y = y0 + Math.pow(f, 1.4) * (H - y0 + 40), len = (10 + hash(i * 3.3) * 50) * (1 + (y - y0) / 120), x = cxy(y) + (hash(i * 4.9) - .5) * hw(y) * 1.6;
    X.fillStyle = `rgba(16,20,30,${.35 + hash(i) * .3})`; X.fillRect(x - len, y, len * 2, 1 + (y - y0) / 160);
    X.fillStyle = `rgba(255,255,255,${.3 + .4 * hash(i * 6.1)})`; X.fillRect(x - len * .3 + Math.sin(t * 2 + i) * 5, y - 2, len * .5, 1 + (y - y0) / 300);
  }
  X.restore();
  inkStroke(() => { X.beginPath(); for (let y = y0; y <= H + 60; y += 20) X.lineTo(cxy(y) - hw(y), y); }, 'rgba(217,164,65,.55)', 2, { op: 'source-over' });
  inkStroke(() => { X.beginPath(); for (let y = y0; y <= H + 60; y += 20) X.lineTo(cxy(y) + hw(y), y); }, 'rgba(217,164,65,.55)', 2, { op: 'source-over' });
}
function R2_karst(front) {
  const path = () => { for (const k of R2_KARST) if (!!k.near === front) { k.pts.forEach(([x, y], i) => i ? X.lineTo(x, R2_HZ + y) : X.moveTo(x, R2_HZ + y)); X.closePath(); } };
  if (!front) {
    // far towers in dim silver leaf, fading into the river mist
    lqSilver(path, { lift: 0, scale: .4, glint: frac(T * .1 + .5), bevel: 0, shade: .55, bounds: [0, R2_HZ - 460, W, 460] });
    X.save(); const g = X.createLinearGradient(0, R2_HZ - 200, 0, R2_HZ); g.addColorStop(0, 'rgba(10,14,22,0)'); g.addColorStop(1, 'rgba(10,14,22,.85)'); X.fillStyle = g; X.fillRect(0, R2_HZ - 200, W, 200); X.restore();
  } else {
    X.save(); X.beginPath(); path(); X.fillStyle = '#06070b'; X.fill(); X.strokeStyle = 'rgba(217,164,65,.75)'; X.lineWidth = 2; X.stroke(); X.restore();
  }
}
function R2_star(t, t0, x0, y0, x1, y1, dur) {
  const k = (t - t0) / dur; if (k < 0 || k > 1.3) return;
  const e = clamp(k), hx = lerp(x0, x1, e), hy = lerp(y0, y1, e) + Math.sin(e * Math.PI) * -30, a = 1 - clamp((k - 1) / .3);
  X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = a;
  const tx = lerp(x0, x1, Math.max(0, e - .45)), ty = lerp(y0, y1, Math.max(0, e - .45));
  const g = X.createLinearGradient(hx, hy, tx, ty); g.addColorStop(0, 'rgba(255,240,190,.95)'); g.addColorStop(.3, 'rgba(217,164,65,.55)'); g.addColorStop(1, 'rgba(179,38,30,0)');
  X.strokeStyle = g; X.lineCap = 'round';
  for (const [lw, dy] of [[14, 0], [5, -9], [4, 10]]) { X.lineWidth = lw; X.beginPath(); X.moveTo(hx, hy + dy * .3); X.lineTo(tx, ty + dy); X.stroke(); }
  const gl = X.createRadialGradient(hx, hy, 0, hx, hy, 120); gl.addColorStop(0, 'rgba(255,236,180,.8)'); gl.addColorStop(1, 'rgba(255,236,180,0)'); X.fillStyle = gl; X.fillRect(hx - 120, hy - 120, 240, 240);
  X.restore();
  X.save(); X.globalAlpha = a; lqGold(() => sparkPath(hx, hy, 44, 4, .2, t * 4, .6), { lift: 0, scale: .25, glint: .5, bevel: 0 }); X.restore();
  // shed sparks along the tail
  X.save(); X.globalAlpha = a;
  for (let i = 0; i < 16; i++) { const u = hash(i * 3.7), f = Math.max(0, e - u * .4), px = lerp(x0, x1, f), py = lerp(y0, y1, f) + (e - f) * 200 * hash(i); X.fillStyle = LQ_PAL.goldHi; X.fillRect(px, py, 4, 4); }
  X.restore();
}
function R2a_scene(t) {
  const lt = t - 112.5, ws = R_wt(LY[35]);
  R_night(t, { yMax: 640, drift: lt * 30 });
  camBegin({ zoom: 1 + lt * .025, x: 960, y: 620 });
  // moon in silver leaf with a cool halo
  X.save(); X.globalCompositeOperation = 'screen'; const hg = X.createRadialGradient(1560, 250, 60, 1560, 250, 420); hg.addColorStop(0, 'rgba(200,215,240,.3)'); hg.addColorStop(1, 'rgba(200,215,240,0)'); X.fillStyle = hg; X.fillRect(1100, -200, 900, 900); X.restore();
  lqSilver(() => X.arc(1560, 250, 118, 0, TAU), { lift: 0, scale: .3, glint: frac(t * .2 + .3), bevel: 1.5 });
  R2_karst(false); R2_river(t); R2_karst(true);
  // the watchers on the right bank: the idol points at the star, the silver Clawd beside her
  const bank = () => { X.moveTo(1320, H + 40); X.quadraticCurveTo(1400, 950, 1920 + 40, 900); X.lineTo(1960, H + 40); X.closePath(); };
  lqLacquer(bank, '#07080c', { rim: 2, bounds: [1300, 900, 660, 220], glint: false });
  lqClawd(1450, 1010, 190, { look: -1, arms: [0, .9], glint: frac(t * .3), step: 0, squash: pulse(t) * .2 });
  idolBody(1700, 830, 27, dance(t, 'point', { snap: .5 }), { outfit: 'aodai', face: { hat: 'nonla', hatMat: 'gold', eyes: 'happy', mouth: 0, look: [-.6, -.6], blush: .7 } });
  camEnd();
  // gold shooting star across the sky toward the type
  R2_star(t, 113.2, 2050, 70, 820, 420, .75);
  // type
  R_small(ws.slice(0, 7), 90, 170, t, { size: 50 });
  R_word('SHOOTING', 84, 400, t, ws[7].t, { size: 230 });
  R_word('STAR', 84, 640, t, ws[8].t, { size: 230, mat: 'gold', ghostCol: LQ_PAL.cinnabarDk });
}
function R2b_scene(t) {
  const lt = t - 114.02, ws = R_wt(LY[36]);
  R_night(t, { yMax: 1080, stars: 120, drift: lt * 20 });
  camBegin({ zoom: 1.04 + lt * .012, x: 1100, y: 600, shake: KICK(t) * 4 });
  // a great silver moon behind him
  X.save(); X.globalCompositeOperation = 'screen'; const hg = X.createRadialGradient(1400, 560, 200, 1400, 560, 700); hg.addColorStop(0, 'rgba(200,215,240,.22)'); hg.addColorStop(1, 'rgba(200,215,240,0)'); X.fillStyle = hg; X.fillRect(600, -200, 1600, 1500); X.restore();
  lqSilver(() => X.arc(1400, 560, 430, 0, TAU), { lift: 0, scale: .6, glint: frac(t * .15 + .6), bevel: 2, shade: .35 });
  lqLacquer(() => R_ringPath(1400, 560, 440, 452), LQ_PAL.gold, { rim: 0, glint: false, bounds: [960, 110, 900, 900] });
  // the river at his feet
  R2_river(t, 930);
  // the Clawd: bounces on the beat; the glint sweeps his leaf on "flaws"; jumps on "hard"
  const gFl = t >= ws[4].t && t < ws[4].t + .7 ? lerp(-.1, 1.1, (t - ws[4].t) / .7) : frac(t * .25 + .3);
  const jmp = bump((t - ws[9].t) / .45) * 110, s = 800, gy = 1160;
  const o = { glint: gFl, squash: pulse(t, .3) * .28 + hit(t, ws[9].t + .45, .25) * .5, arms: t > ws[9].t ? [1.2, 1.2] : [.25 + .25 * pulse(t), .5], step: beatF(t) * .5, look: -.4, jump: jmp };
  lqClawd(1480, gy, s, o);
  // the gold star caught in his shades
  { const sq = o.squash, bw = s * (1 + sq * .18), bh = s * .62 * (1 - sq * .22), legH = s * .2 * (1 - sq * .4), by = -legH - bh, ey = gy - jmp + by + bh * .32, ex = s * .2, lk = -.4 * s * .03;
    for (const sd of [-1, 1]) { const px = 1480 + sd * ex + lk + s * .02, py = ey + s * .07, tw = .7 + .3 * Math.sin(t * 9 + sd);
      lqGold(() => sparkPath(px, py, s * .03 * tw, 4, .18, .3, .6), { lift: 0, scale: .2, glint: false, bevel: 0 }); } }
  camEnd();
  // type on the calm left
  R_small(ws.slice(0, 3), 92, 250, t, { size: 52 });
  let x = 84; x += R_word('NO', x, 480, t, ws[3].t, { size: 210 }) + 44; R_word('FLAWS', x, 480, t, ws[4].t, { size: 210 });
  R_small(ws.slice(5, 8), 92, 640, t, { size: 52 });
  x = 84; x += R_word('SO', x, 870, t, ws[8].t, { size: 210 }) + 44; x += R_word('HARD', x, 870, t, ws[9].t, { size: 210 });
  R_small([ws[10]], x + 30, 870, t, { size: 52, color: LQ_PAL.cinnabarLt });
}

// ================================================================================================================
// R3 · the race (117.6–125.5)
// ================================================================================================================
const R3_CAR = 700;
function R3_car(t, x, y, o = {}) {
  const bob = Math.sin(t * 31) * 2 + KICK(t) * 4;
  lqTimeMachine(x, y - bob, o.s || R3_CAR, t, { spin: o.spin ?? 40, trail: o.trail ?? .9, lights: 1, glint: frac(t * .6), doors: 0 });
}
function R3a_scene(t) {
  const lt = t - 117.56, ws = R_wt(LY[37]);
  R_night(t, { yMax: 380, stars: 60, drift: t * 300 });
  lqKarstRiver(t, { rect: [0, 330, W, 600], horizon: 330 + 600 * .8, camX: t * 1500, sun: false, seed: 3 });
  X.save(); const sg = X.createLinearGradient(0, 300, 0, 420); sg.addColorStop(0, 'rgba(16,24,38,1)'); sg.addColorStop(1, 'rgba(7,6,10,0)'); X.fillStyle = sg; X.fillRect(0, 300, W, 120); X.restore();
  R_road(t, 900);
  R_speed(t, { y0: 380, y1: 900, n: 36, alpha: .8 });
  R3_car(t, 720 + Math.sin(lt * 3) * 30, 1000);
  // the lacquer clock: black dial, gold ring, silver hands ticking a quarter turn per beat
  const cx = 1500, cy = 250, r = 205, sc = 1 + pulse(t, .15) * .02;
  withT(cx, cy, 0, sc, () => {
    lqLacquer(() => X.arc(0, 0, r, 0, TAU), '#0d0b0c', { lift: 12, rim: 3, bounds: [-r, -r, r * 2, r * 2], glint: frac(t * .3) });
    lqGold(() => R_ringPath(0, 0, r * .9, r * 1.02), { lift: 0, scale: .3, glint: frac(t * .5 + .2), bevel: 1.5, bounds: [-r, -r, r * 2, r * 2] });
    X.save(); X.fillStyle = LQ_PAL.gold;
    for (let i = 0; i < 12; i++) { X.save(); X.rotate(i / 12 * TAU); X.fillRect(-3, -r * .86, 6, i % 3 ? r * .08 : r * .15); X.restore(); }
    X.font = FONT.vnB(38); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = LQ_PAL.goldHi;
    [['XII', 0, -1], ['III', 1, 0], ['VI', 0, 1], ['IX', -1, 0]].forEach(([s, a, b]) => X.fillText(s, a * r * .6, b * r * .6));
    X.restore();
    const bf = beatF(t), tick = Math.floor(bf) + easeOut(clamp(frac(bf) / .15));
    const hand = (ang, len, wd, col) => { X.save(); X.rotate(ang); lqSilver(() => { X.moveTo(-wd, r * .12); X.lineTo(0, -len); X.lineTo(wd, r * .12); X.closePath(); }, { lift: 4, scale: .2, glint: frac(t * .7), bevel: 1, bounds: [-wd, -len, wd * 2, len] }); X.restore(); };
    hand(tick * TAU / 12, r * .5, 12, 0); hand(tick * TAU / 4, r * .78, 8, 0);
    X.save(); X.rotate(t * TAU * 1.5); X.fillStyle = LQ_PAL.cinnabarLt; X.fillRect(-2, -r * .82, 4, r * .95); X.restore();
    lqGold(() => X.arc(0, 0, 14, 0, TAU), { lift: 2, scale: .2, glint: false, bevel: 1 });
  });
  // type
  R_small(ws.slice(0, 4), 92, 110, t, { size: 50 });
  const w = R_word('NO', 84, 330, t, ws[4].t, { size: 220 });
  R_word('TIME', 84 + w + 46, 330, t, ws[5].t, { size: 220 });
  R_small(ws.slice(6), 84 + w + 46 + textW('TIME', FONT.hero(220)) + 40, 330, t, { size: 50 });
}
// Thê Húc-style red arched bridge on the lake; the camera tracks the car over the arch
const R3B = { x0: 380, x1: 2900, base: 860, A: 250 };
const R3b_deck = x => x < R3B.x0 || x > R3B.x1 ? R3B.base : R3B.base - R3B.A * Math.sin(Math.PI * (x - R3B.x0) / (R3B.x1 - R3B.x0));
function R3b_bridge(t, refl) {
  const d = [], rail = [];
  for (let x = -600; x <= 3600; x += 30) { d.push([x, R3b_deck(x)]); }
  const path = () => { d.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); for (let i = d.length - 1; i >= 0; i--) X.lineTo(d[i][0], d[i][1] + 44); X.closePath(); };
  lqLacquer(path, LQ_PAL.cinnabar, { rim: 3, bounds: [-600, 560, 4200, 360], glint: frac(t * .5 + .1), lift: refl ? 0 : 10 });
  X.save();
  // posts and the top rail
  X.fillStyle = LQ_PAL.cinnabarDk;
  for (let x = -600; x <= 3600; x += 110) { const y = R3b_deck(x); X.fillRect(x - 7, y - 78, 14, 78); }
  X.strokeStyle = LQ_PAL.cinnabarLt; X.lineWidth = 12; X.lineJoin = 'round'; X.beginPath(); d.forEach(([x, y], i) => i ? X.lineTo(x, y - 76) : X.moveTo(x, y - 76)); X.stroke();
  X.strokeStyle = LQ_PAL.gold; X.lineWidth = 2.5; X.beginPath(); d.forEach(([x, y], i) => i ? X.lineTo(x, y - 82) : X.moveTo(x, y - 82)); X.stroke();
  X.beginPath(); d.forEach(([x, y], i) => i ? X.lineTo(x, y + 2) : X.moveTo(x, y + 2)); X.stroke();
  // piers
  X.fillStyle = '#3a0c08'; for (let x = 600; x < 2800; x += 440) { const y = R3b_deck(x) + 44; X.fillRect(x - 16, y, 32, R3B.base + 40 - y + 60); }
  X.restore();
}
function R3b_scene(t) {
  const lt = t - 119.47, ws = R_wt(LY[38]), dur = 121.93 - 119.47;
  const carX = lerp(-150, 3350, lt / dur), camX = carX - 820;
  R_night(t, { yMax: 560, stars: 80, drift: camX * .6 });
  // moon and a tiny gold tower on the lake (parallax)
  lqSilver(() => X.arc(1500 - camX * .05, 190, 80, 0, TAU), { lift: 0, scale: .3, glint: .6, bevel: 1 });
  // far shore: black trees with silver rim
  X.save(); X.beginPath(); X.moveTo(-10, 760);
  for (let x = -10; x <= W + 20; x += 24) { const wx = x + camX * .25; X.lineTo(x, 700 - 30 * noise1(wx * .01) - 25 * Math.abs(Math.sin(wx * .03))); }
  X.lineTo(W + 20, 780); X.closePath(); X.fillStyle = '#07080c'; X.fill(); X.strokeStyle = 'rgba(201,204,209,.35)'; X.lineWidth = 1.5; X.stroke(); X.restore();
  { const tx = ((1400 - camX * .3) % 2600 + 2600) % 2600 - 300; lqGold(() => { X.rect(tx - 40, 640, 80, 70); X.moveTo(tx - 70, 645); X.lineTo(tx, 610); X.lineTo(tx + 70, 645); X.closePath(); X.rect(tx - 28, 580, 56, 34); X.moveTo(tx - 50, 585); X.lineTo(tx, 552); X.lineTo(tx + 50, 585); X.closePath(); }, { lift: 0, scale: .25, glint: .4, bevel: 1 }); }
  // lake
  const lg = X.createLinearGradient(0, 760, 0, H); lg.addColorStop(0, '#0e131d'); lg.addColorStop(1, '#040507'); X.fillStyle = lg; X.fillRect(0, 760, W, H - 760);
  X.save(); X.fillStyle = 'rgba(0,0,0,0)';
  for (let i = 0; i < 60; i++) { const y = 770 + Math.pow(hash(i * 1.3), 1.3) * 320, x = ((hash(i * 7.7) * 2400 - camX * (.4 + (y - 760) / 500)) % 2400 + 2400) % 2400 - 240, l = 30 + hash(i) * 120; X.fillStyle = `rgba(210,214,222,${.12 + .25 * hash(i * 3)})`; X.fillRect(x, y, l, 2); }
  X.restore();
  camBegin({ x: camX + 960, y: 600, zoom: 1, rot: 0, shake: KICK(t) * 3 });
  // reflection of the bridge in the lake
  X.save(); X.globalAlpha = .28; X.translate(0, (R3B.base + 44) * 2 + 10); X.scale(1, -1); R3b_bridge(t, true); X.restore();
  // the car on the deck (behind the near rail? no: the deck is its road; drawn after the bridge body)
  R3b_bridge(t, false);
  const cy = R3b_deck(carX), slope = Math.atan2(R3b_deck(carX + 40) - R3b_deck(carX - 40), 80);
  const sq = bump((t - ws[6].t) / .35);   // squeeze
  withT(carX, cy + 4, slope, 1, () => { X.scale(1 - sq * .12, 1 + sq * .14); R3_car(t, 0, 0, { s: 640 }); });
  camEnd();
  R_speed(t, { y0: 60, y1: 700, n: 22, alpha: .5, v: 2400 });
  R_cap(t, LY[38]);
}
function R3c_scene(t) {
  const lt = t - 121.93, ws = R_wt(LY[39]);
  lqGround(t, { tone: 'night' });
  R_speed(t, { y0: 40, y1: 860, n: 60, alpha: .9, v: 3600 });
  R_road(t, 880, { v: 3600 });
  // the car flashes past below
  R3_car(t, lerp(-500, 2400, lt / 1.9), 990, { s: 620 });
  // cinnabar medal with the inlaid gold 1
  const k = backOut(clamp((t - ws[0].t) / .22)), mx = 420, my = 440;
  withT(mx, my, (1 - k) * -.4 + Math.sin(t * 2) * .02, .4 + .6 * k, () => {
    // ribbon tails
    lqLacquer(() => { X.moveTo(-150, 180); X.lineTo(-60, 450); X.lineTo(-110, 420); X.lineTo(-170, 470); X.lineTo(-240, 210); X.closePath(); X.moveTo(150, 180); X.lineTo(60, 450); X.lineTo(110, 420); X.lineTo(170, 470); X.lineTo(240, 210); X.closePath(); }, LQ_PAL.cinnabarDk, { lift: 8, rim: 2, bounds: [-250, 180, 500, 300], glint: .3 });
    lqGold(() => X.arc(0, 0, 330, 0, TAU), { lift: 16, scale: .45, glint: frac(t * .4 + .1), bevel: 3, bounds: [-330, -330, 660, 660] });
    lqLacquer(() => X.arc(0, 0, 290, 0, TAU), LQ_PAL.cinnabar, { rim: 3, bounds: [-290, -290, 580, 580], glint: frac(t * .3 + .5) });
    // eggshell dots around the rim
    X.save(); X.fillStyle = LQ_PAL.egg; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + t * .3; X.beginPath(); X.arc(Math.cos(a) * 262, Math.sin(a) * 262, 6, 0, TAU); X.fill(); } X.restore();
    lqInlayText('1', 0, 190, { font: FONT.vn(520), size: 520, material: 'gold', align: 'center', glint: R_glint(t, ws[0].t + .1), glintW: 400 });
  });
  R_sparks(mx, my, t, ws[0].t, { n: 50, r: 700, size: 20, dur: .9, grav: 200 });
  // type on the right
  R_word('SECOND', 860, 330, t, ws[0].t, { size: 200 });
  R_word('TO NONE', 860, 560, t, ws[1].t, { size: 200 });
  R_small(ws.slice(3), 866, 670, t, { size: 52 });
}
function R3d_scene(t) {
  const lt = t - 123.84, ws = R_wt(LY[40]), tr = ws[8].t;   // "race": the car crosses the line
  lqGround(t, { tone: 'night' });
  R_speed(t, { y0: 40, y1: 860, n: 70, alpha: 1, v: 4200 });
  R_road(t, 880, { v: 4200 });
  // the finish: a silver/black chequered gate under a cinnabar lacquer heart
  const fx = 1480, hs = 1 + pulse(t, .4) * .06 + hit(t, tr, .3) * .25, burst = t >= tr;
  X.save();
  for (let j = 0; j < 12; j++) for (let i = 0; i < 2; i++) { X.fillStyle = (i + j) % 2 ? '#0d0d10' : LQ_PAL.silver; X.fillRect(fx - 24 + i * 24, 880 + j * 17, 24, 17); }
  X.restore();
  lqSilver(() => { X.rect(fx - 220, 520, 18, 360); X.rect(fx + 202, 520, 18, 360); }, { lift: 6, scale: .3, glint: frac(t * .5) });
  withT(fx, 430, 0, hs, () => {
    lqGold(() => R_heartPath(0, 0, 250), { lift: 16, scale: .4, glint: frac(t * .5 + .3), bevel: 3, bounds: [-330, -330, 660, 620] });
    lqLacquer(() => R_heartPath(0, 8, 212), LQ_PAL.cinnabar, { rim: 3, bounds: [-280, -230, 560, 470], glint: frac(t * .4 + .6) });
    X.save(); X.fillStyle = LQ_PAL.egg; X.globalAlpha = .9; for (let i = 0; i < 9; i++) { X.beginPath(); X.arc(-90 + i * 8 - 30, -110 + i * 6, 5 + i * .4, 0, TAU); X.fill(); } X.restore();
  });
  if (burst) { R_sparks(fx, 430, t, tr, { n: 90, r: 1100, size: 26, dur: 1, grav: 300 }); }
  // the car: accelerates from the left, crosses the line on "race"
  const cx = t < tr ? lerp(-420, fx - 250, Math.pow(clamp(lt / (tr - 123.84)), 1.6)) : fx - 250 + (t - tr) * 2600;
  R3_car(t, cx, 990, { s: 700, trail: 1 });
  R_cap(t, LY[40]);
}

// ================================================================================================================
// R4 · re-route, the key, the ex (125.5–133.5)
// ================================================================================================================
// the gold map: a lacquer panel (local 1240×940) with gold streets, a silver river, eggshell parks
const R4_G = (i, j) => [60 + i * 150, 70 + j * 135];
const R4_ROUTE_A = [[0, 6], [5, 6], [5, 0], [7, 0]].map(p => R4_G(...p));
const R4_ROUTE_B = [[2, 6], [2, 3], [4, 3], [4, 1], [7, 1], [7, 0]].map(p => R4_G(...p));
function R4_polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function R4_polyAt(p, d) { for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= l) { const k = d / l; return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } d -= l; } const n = p.length - 1; return [p[n][0], p[n][1], Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0])]; }
function R4_polyPart(p, d) { const out = [p[0]]; let acc = 0; for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + l <= d) { out.push(p[i]); acc += l; } else { const q = R4_polyAt(p, d); out.push([q[0], q[1]]); break; } } return out; }
function R4_mapPanel(t) {
  const PW = 1240, PH = 940;
  lqGold(() => X.rect(-22, -22, PW + 44, PH + 44), { lift: 18, scale: .4, glint: frac(t * .2 + .1), bevel: 2, bounds: [-22, -22, PW + 44, PH + 44] });
  lqLacquer(() => X.rect(0, 0, PW, PH), '#0c0b0d', { rim: 3, bounds: [0, 0, PW, PH], glint: frac(t * .15 + .5) });
  X.save(); X.beginPath(); X.rect(0, 0, PW, PH); X.clip();
  // parks in eggshell, blocks of brown lacquer
  lqEggshell(() => { X.rect(R4_G(1, 1)[0] + 14, R4_G(1, 1)[1] + 14, 122, 107); X.rect(R4_G(6, 4)[0] + 14, R4_G(6, 4)[1] + 14, 122, 107); X.rect(R4_G(3, 5)[0] + 14, R4_G(3, 5)[1] + 14, 122, 107); }, { lift: 0, scale: .3, glint: .5, bevel: 1 });
  X.save(); X.fillStyle = 'rgba(110,65,39,.55)';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 7; j++) if (hash(i * 7 + j * 13) < .35) { const [x, y] = R4_G(i, j); X.fillRect(x + 18, y + 18, 114, 99); }
  X.restore();
  // river: a silver band with a slow glint
  lqSilver(() => { X.moveTo(-20, 700); X.bezierCurveTo(300, 610, 700, 820, 1260, 520); X.lineTo(1260, 590); X.bezierCurveTo(700, 890, 300, 680, -20, 770); X.closePath(); }, { lift: 0, scale: .3, glint: frac(t * .3), bevel: 1, bounds: [0, 500, PW, 400] });
  // gold streets in one leaf pass (grid + a diagonal avenue)
  lqGold(() => {
    for (let i = 0; i < 9; i++) { const [x] = R4_G(i, 0); X.rect(x - 5, -10, 10, PH + 20); }
    for (let j = 0; j < 8; j++) { const [, y] = R4_G(0, j); X.rect(-10, y - 5, PW + 20, 10); }
    X.moveTo(0, 900); X.lineTo(10, 912); X.lineTo(1250, 40); X.lineTo(1240, 28); X.closePath();
  }, { lift: 2, scale: .3, glint: frac(t * .25 + .4), bevel: 0, bounds: [0, 0, PW, PH] });
  X.restore();
}
function R4_route(p, d, col, w, o = {}) {
  if (d <= 0) return; const q = R4_polyPart(p, d);
  X.save(); X.lineJoin = 'round'; X.lineCap = 'round';
  if (o.dash) X.setLineDash(o.dash);
  X.globalAlpha = o.alpha ?? 1;
  X.strokeStyle = 'rgba(0,0,0,.55)'; X.lineWidth = w + 8; X.beginPath(); q.forEach(([x, y], i) => i ? X.lineTo(x + 3, y + 4) : X.moveTo(x + 3, y + 4)); X.stroke();
  X.strokeStyle = col; X.lineWidth = w; X.beginPath(); q.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.stroke();
  if (!o.dash) { X.strokeStyle = 'rgba(255,240,200,.7)'; X.lineWidth = 2; X.beginPath(); q.forEach(([x, y], i) => i ? X.lineTo(x - 2, y - 3) : X.moveTo(x - 2, y - 3)); X.stroke(); }
  X.restore();
}
function R4a_scene(t) {
  const lt = t - 125.47, ws = R_wt(LY[41]), tRe = ws[4].t;
  R_night(t, { stars: 50 });
  const LA = R4_polyLen(R4_ROUTE_A), LB = R4_polyLen(R4_ROUTE_B), dA0 = R4_polyLen(R4_ROUTE_A.slice(0, 1).concat([R4_G(2, 6)]));
  // camera on the map panel
  const rot = -.03 + lt * .006, z = .86 + lt * .025;
  X.save(); X.translate(1270, 555); X.rotate(rot); X.scale(z, z); X.translate(-620, -470);
  R4_mapPanel(t);
  // destination: a cinnabar heart that runs hot on "hot"
  const [hx, hy] = R4_G(7, 0), hot = t >= ws[2].t ? .5 + .5 * pulse(t, .5, 1) : 0;
  if (hot > 0) { X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(hx, hy, 10, hx, hy, 160); g.addColorStop(0, `rgba(232,85,58,${.6 * hot})`); g.addColorStop(1, 'rgba(232,85,58,0)'); X.fillStyle = g; X.fillRect(hx - 160, hy - 160, 320, 320); X.restore(); }
  withT(hx, hy - 6, 0, 1 + hot * .12, () => { lqGold(() => R_heartPath(0, 0, 50), { lift: 6, scale: .2, glint: .5, bevel: 1.5 }); lqLacquer(() => R_heartPath(0, 3, 40), LQ_PAL.cinnabar, { rim: 1, bounds: [-50, -50, 100, 100], glint: .5 }); });
  // route A draws, the car follows; on "re-route" A goes dead (dashed grey) and B snaps in, gold
  const dDraw = LA * easeOut(clamp(lt / .5)), carD = Math.min(dA0, dA0 * clamp((lt - .2) / (tRe - 125.67)));
  if (t < tRe) R4_route(R4_ROUTE_A, dDraw, LQ_PAL.cinnabarLt, 22);
  else {
    R4_route(R4_ROUTE_A, LA, '#6b6f78', 10, { dash: [16, 16], alpha: .8 });
    // a cinnabar cross stamped on the dead road
    const [xx, xy] = R4_G(5, 3), xk = backOut(clamp((t - tRe) / .15));
    withT(xx, xy, .1, xk, () => lqLacquer(() => { X.rect(-40, -9, 80, 18); X.moveTo(-9, -40); X.rect(-9, -40, 18, 80); }, LQ_PAL.cinnabar, { rim: 1, bounds: [-40, -40, 80, 80], glint: false }));
    R4_route(R4_ROUTE_B, LB * expoOut(clamp((t - tRe) / .35)), LQ_PAL.cinnabarLt, 22);
  }
  const onB = t >= tRe + .12, dB = LB * clamp((t - tRe - .12) / (127.66 - tRe - .12)) * .96;
  const [px, py, pa] = onB ? R4_polyAt(R4_ROUTE_B, dB) : R4_polyAt(R4_ROUTE_A, carD);
  withT(px, py, pa, 1 + pulse(t) * .1, () => {
    lqSilver(() => { X.moveTo(34, 0); X.lineTo(-22, -24); X.lineTo(-10, 0); X.lineTo(-22, 24); X.closePath(); }, { lift: 6, scale: .2, glint: frac(t), bevel: 1.2 });
  });
  X.restore();
  R_flash(t, tRe, .2);
  // type on the left
  R_small(ws.slice(0, 3), 80, 250, t, { size: 56 });
  R_small(ws.slice(3, 4), 80, 330, t, { size: 56 });
  R_word('RE-', 72, 590, t, tRe, { size: 250 });
  R_word('ROUTE', 72, 850, t, tRe + BEAT / 4, { size: 250 });
}
// the key: a gold key with a cinnabar tassel (tip at the origin, pointing +x, length ~L)
function R4_key(L, turn, t) {
  const sy = Math.cos(turn);   // rotating about its own axis foreshortens it
  X.save(); X.scale(1, Math.max(.12, Math.abs(sy)));
  lqGold(() => {
    X.moveTo(-L + 150, 0); X.arc(-L + 80, 0, 80, 0, TAU); X.moveTo(-L + 115, 0); X.arc(-L + 80, 0, 35, TAU, 0, true);   // bow with hole
    X.rect(-L + 150, -14, L - 150, 28);                                            // shaft
    X.rect(-100, 10, 26, 46); X.rect(-58, 10, 20, 34); X.rect(-24, 10, 24, 52);    // teeth
    X.rect(-L + 170, -22, 18, 44);                                                 // collar
  }, { lift: 10, scale: .35, glint: frac(t * .8), bevel: 2.5 });
  X.restore();
  // tassel from the bow
  X.save(); X.strokeStyle = LQ_PAL.cinnabar; X.lineCap = 'round';
  const bx = -L + 10, by = 40;
  for (let i = 0; i < 9; i++) { const sw = Math.sin(t * 6 + i * .5) * 12; X.lineWidth = 5; X.beginPath(); X.moveTo(bx, by); X.quadraticCurveTo(bx - 30 + i * 4 + sw, by + 80, bx - 50 + i * 9 + sw * 1.6, by + 170); X.stroke(); }
  lqGold(() => X.arc(bx, by + 10, 14, 0, TAU), { lift: 2, scale: .2, glint: false, bevel: 1 });
  X.restore();
}
function R4b_scene(t) {
  const lt = t - 127.66, ws = R_wt(LY[42]), tLock = ws[2].t, tKey = ws[6].t, tHouse = ws[9].t;
  R_night(t, { stars: 60, yMax: 500 });
  camBegin({ zoom: 1 + lt * .02, x: 1060, y: 560, shake: KICK(t) * 3 + hit(t, tLock, .25) * 10 });
  // floor
  lqLacquer(() => X.rect(-200, 960, W + 400, 300), '#0a0c12', { rim: 0, bounds: [0, 960, W, 120], glint: .4 });
  // tube-house facade: gold tile roof, brown wall, eggshell side panels, cinnabar double door
  const fx0 = 1000, fx1 = 1720, dx0 = 1170, dx1 = 1550, dy0 = 420, dy1 = 960;
  lqLacquer(() => X.rect(fx0, 240, fx1 - fx0, 720), LQ_PAL.brown, { lift: 16, rim: 3, bounds: [fx0, 240, fx1 - fx0, 720], glint: frac(t * .2) });
  lqEggshell(() => { X.rect(fx0 + 30, 460, 110, 440); X.rect(fx1 - 140, 460, 110, 440); }, { lift: 2, scale: .35, glint: .5, bevel: 1 });
  lqGold(() => { X.moveTo(fx0 - 90, 260); X.quadraticCurveTo(1360, 230, fx1 + 90, 260); X.lineTo(fx1 + 40, 150); X.quadraticCurveTo(1360, 120, fx0 - 40, 150); X.closePath(); }, { lift: 12, scale: .35, glint: frac(t * .3 + .2), bevel: 2, bounds: [fx0 - 90, 120, fx1 - fx0 + 180, 150] });
  X.save(); X.strokeStyle = 'rgba(80,45,15,.6)'; X.lineWidth = 3; for (let i = 0; i < 16; i++) { const x = fx0 - 60 + i * 55; X.beginPath(); X.moveTo(x, 152); X.lineTo(x - 8, 256); X.stroke(); } X.restore();
  // hanging lantern
  const lsw = Math.sin(t * 2.2) * .08;
  withT(fx0 + 85, 300, lsw, 1, () => { X.fillStyle = LQ_PAL.gold; X.fillRect(-1.5, 0, 3, 50); lqLacquer(() => X.ellipse(0, 100, 40, 52, 0, 0, TAU), LQ_PAL.cinnabar, { rim: 2, bounds: [-40, 48, 80, 104], glint: .4 }); X.fillStyle = LQ_PAL.gold; X.fillRect(-20, 48, 40, 6); X.fillRect(-20, 146, 40, 6); });
  // doorway: gold light behind the leaves
  const open = easeOut(clamp((t - tHouse) / .35));
  if (open > 0) {
    lqGold(() => X.rect(dx0, dy0, dx1 - dx0, dy1 - dy0), { lift: 0, scale: .4, glint: frac(t * .8), bevel: 0, bounds: [dx0, dy0, dx1 - dx0, dy1 - dy0] });
    X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(1360, 700, 40, 1360, 700, 700); g.addColorStop(0, `rgba(255,236,180,${.55 * open})`); g.addColorStop(1, 'rgba(255,236,180,0)'); X.fillStyle = g; X.fillRect(600, 0, 1500, 1100); X.restore();
  }
  const mid = (dx0 + dx1) / 2, lw = (mid - dx0) * Math.cos(open * Math.PI * .47);
  const leaf = (x0, w) => lqLacquer(() => X.rect(x0, dy0, w, dy1 - dy0), LQ_PAL.cinnabar, { rim: 3, bounds: [dx0, dy0, dx1 - dx0, dy1 - dy0], glint: frac(t * .3 + .5) });
  leaf(dx0, lw); leaf(dx1 - lw, lw);
  X.save(); X.fillStyle = LQ_PAL.gold;
  for (const [x0, sgn] of [[dx0, 1], [dx1, -1]]) for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { const u = (i + .5) / 3; X.beginPath(); X.arc(x0 + sgn * lw * u, dy0 + 60 + j * 100, 7, 0, TAU); X.fill(); }
  X.restore();
  lqGold(() => X.rect(dx0 - 18, dy0 - 18, dx1 - dx0 + 36, 18), { lift: 4, scale: .3, glint: .3, bevel: 1 });
  // the gold padlock: shackle clicks shut on "locked-in", pops and drops once the key turns
  const lx = mid, ly = 690, tTurn = tKey + .18, pop = clamp((t - tTurn - .12) / .5);
  const shY = t < tLock ? -38 : t < tTurn + .12 ? 0 : -38 * easeOut(clamp((t - tTurn - .12) / .1));
  withT(lx + pop * 60, ly + pop * pop * 500, pop * 1.2, 1, () => {
    X.save(); X.globalAlpha = 1 - clamp((pop - .7) / .3);
    lqSilver(() => { X.moveTo(-44, shY); X.arc(0, shY - 40, 44, Math.PI, 0); X.lineTo(44, shY + 10); X.lineTo(26, shY + 10); X.lineTo(26, shY - 40); X.arc(0, shY - 40, 26, 0, Math.PI, true); X.lineTo(-26, 10); X.lineTo(-44, 10); X.closePath(); }, { lift: 5, scale: .2, glint: frac(t * .7), bevel: 1.5 });
    lqGold(() => X.roundRect(-66, 0, 132, 118, 14), { lift: 8, scale: .25, glint: frac(t * .6 + .3), bevel: 2 });
    lqLacquer(() => { X.arc(0, 46, 14, 0, TAU); X.moveTo(-7, 50); X.rect(-7, 50, 14, 36); }, '#0a0706', { rim: 0, bounds: [-14, 30, 28, 60], glint: false });
    X.restore();
  });
  if (t >= tLock) R_sparks(lx, ly - 10, t, tLock, { n: 24, r: 260, size: 12, dur: .5, grav: 100 });
  // the key: thrown by the Clawd, it flies in and seats in the lock, turns on "keys"
  const tThrow = ws[4].t - .1, fly = clamp((t - tThrow) / (tKey - tThrow - .05));
  const cl = { arms: [.2, t > tThrow && t < tThrow + .4 ? 1.4 : .3], look: 1, glint: frac(t * .4), step: beatF(t) * .5, squash: pulse(t) * .2 };
  lqClawd(430, 960, 300, cl);
  if (t >= tThrow) {
    const e = easeOut(fly), kx = lerp(560, lx + 4, e), ky = lerp(700, ly + 46, e) - Math.sin(e * Math.PI) * 220, spin = (1 - e) * 5;
    const turn = t < tTurn ? 0 : easeInOut(clamp((t - tTurn) / .2)) * Math.PI * .5;
    withT(kx + pop * 60, ky + pop * pop * 500, spin * .6 + pop * 1.2, 1 - pop * .0, () => { X.globalAlpha = 1 - clamp((pop - .7) / .3); R4_key(470, turn, t); });
  }
  camEnd();
  R_flash(t, tHouse, .3);
  R_cap(t, LY[42]);
}
// the ex: a generic grey lacquer silhouette (no face)
function R4_exPath(x, y, h, step) {
  const s = h / 520, st = Math.sin(step) * 18 * s;
  X.moveTo(x + 44 * s, y - 470 * s); X.arc(x, y - 470 * s, 44 * s, 0, TAU);   // head
  X.moveTo(x - 90 * s, y - 380 * s);
  X.quadraticCurveTo(x, y - 410 * s, x + 90 * s, y - 380 * s);                  // shoulders
  X.lineTo(x + 100 * s, y - 180 * s); X.lineTo(x + 70 * s, y - 180 * s);       // arm / pocket
  X.lineTo(x + 62 * s, y - 250 * s); X.lineTo(x + 58 * s, y - 200 * s);
  X.lineTo(x + 50 * s + st, y); X.lineTo(x + 14 * s + st, y); X.lineTo(x, y - 170 * s);
  X.lineTo(x - 14 * s - st, y); X.lineTo(x - 50 * s - st, y); X.lineTo(x - 58 * s, y - 200 * s);
  X.lineTo(x - 62 * s, y - 250 * s); X.lineTo(x - 70 * s, y - 180 * s); X.lineTo(x - 100 * s, y - 180 * s); X.closePath();
}
function R4c_scene(t) {
  const lt = t - 130.25, w43 = R_wt(LY[43]), ws = R_wt(LY[44]);
  const tCross = ws[2].t, tLine = ws[4].t, tScr = ws[7].t, tEnd = R_T1 - .04;
  // ex walks in on "ex", strolls, then steps over the gold line on "cross … line"
  const exX = t < tCross ? lerp(1900, 1500, easeOut(clamp((t - w43[1].t + .1) / .6))) : lerp(1500, 1190, easeInOut(clamp((t - tCross) / (tLine - tCross + .1))));
  const exStep = t < tCross ? clamp((t - w43[1].t) / .6) * 6 : 6 + clamp((t - tCross) / .3) * 4;
  const scene = () => {
    R_night(t, { stars: 70, yMax: 700 });
    // the panel's floor and the gold line
    lqLacquer(() => X.rect(-50, 840, W + 100, 300), LQ_PAL.brownDk, { rim: 0, bounds: [0, 840, W, 240], glint: frac(t * .2 + .6) });
    X.save(); X.fillStyle = LQ_PAL.gold; X.globalAlpha = .6; X.fillRect(-10, 838, W + 20, 3); X.restore();
    const lineHit = hit(t, tLine, .3);
    lqGold(() => { X.moveTo(1150, 840); X.lineTo(1172, 840); X.lineTo(1146, H + 10); X.lineTo(1112, H + 10); X.closePath(); }, { lift: 3, scale: .3, glint: t >= tCross ? lerp(0, 1, clamp((t - tCross) / .5)) : .3, bevel: 1, bounds: [1100, 840, 80, 240] });
    if (lineHit > 0) { X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = `rgba(246,214,140,${.5 * lineHit})`; X.beginPath(); X.moveTo(1140, 840); X.lineTo(1182, 840); X.lineTo(1156, H); X.lineTo(1102, H); X.fill(); X.restore(); }
    // the couple: the idol (unimpressed, then a wink) and the silver Clawd pointing at the ex
    const idP = t < w43[1].t ? dance(t, 'idle') : t < tScr ? dance(t, 'shrug', { snap: .6 }) : dance(t, 'peace', { snap: .4 });
    idolBody(390, 658, 36, idP, { outfit: 'aodai', face: { hat: 'nonla', hatMat: 'gold', eyes: t < w43[1].t ? 'happy' : t < tScr ? 'closed' : 'wink', mouth: 0, mouthShape: t < tScr ? 'flat' : 'smile', look: [.6, 0], blush: .6 } });
    const point = t >= w43[1].t;
    lqClawd(760, 900, 270, { arms: [.2, point ? 1.0 : .2 + .2 * pulse(t)], look: 1, glint: frac(t * .35), squash: pulse(t, .3) * .2 + hit(t, tScr, .3) * .5, step: point ? 0 : beatF(t) * .5, lean: point ? .08 : 0 });
    // "what is that about?": a cinnabar question mark pops over his head
    const qk = backOut(clamp((t - w43[6].t) / .2)) * (1 - clamp((t - tCross) / .2));
    if (qk > 0) withT(1500 + 70, 360, .1, qk, () => lqInlayText('?', 0, 0, { font: FONT.vn(180), size: 180, material: 'red', align: 'center', glint: false }));
  };
  const exFn = () => lqLacquer(() => R4_exPath(exX, 900, 470, exStep), '#6e727b', { lift: 10, rim: 3, bounds: [exX - 110, 400, 220, 500], glint: frac(t * .3 + .2), mottle: .5 });
  const sandK = clamp((t - tScr + .02) / (tEnd - tScr));
  if (t < w43[1].t - .1) scene();
  else lqReveal(scene, exFn, sandK, 11, { region: [exX - 150, 380, 300, 540], name: 'R4ex', from: 'top', angle: -.5, n: 40, halo: '#8a8f99', haloW: 8 });
  if (sandK > 0) R_sparks(exX, 640, t, tScr, { n: 40, r: 380, size: 10, dur: .45, grav: 400, alt: LQ_PAL.silver });
  // type
  R_cap(t, LY[43]);
  if (t >= ws[0].t - .05) {
    R_small(ws.slice(0, 7), 960 - textW('IF HE CROSS THE LINE, THEN WE', FONT.vnSansB(46)) / 2 - 20, 110, t, { size: 46 });
    const f = FONT.hero(180), gap = 44, wsS = textW('SCRATCHING', f), wH = textW('HIM', f), wO = textW('OUT', f), x0 = 960 - (wsS + wH + wO + gap * 2) / 2;
    R_word('SCRATCHING', x0, 300, t, ws[7].t, { size: 180 });
    R_word('HIM', x0 + wsS + gap, 300, t, ws[8].t, { size: 180 });
    R_word('OUT', x0 + wsS + wH + gap * 2, 300, t, ws[9].t, { size: 180, mat: 'gold' });
  }
}

// ================================================================================================================
// timeline
// ================================================================================================================
// {t0, fn, sand: incoming sanding duration (the previous scene rubbed through) | flash: gold-glint cut}
const R_SC = [
  { t0: R_T0, fn: R1_scene, sand: .42, from: 'left' },
  { t0: 112.5, fn: R2a_scene, sand: .36, from: 'right' },
  { t0: 114.02, fn: R2b_scene, flash: true },
  { t0: 117.56, fn: R3a_scene, sand: .3, from: 'left' },
  { t0: 119.47, fn: R3b_scene, flash: true },
  { t0: 121.93, fn: R3c_scene, flash: true },
  { t0: 123.84, fn: R3d_scene, flash: true },
  { t0: 125.47, fn: R4a_scene, sand: .36, from: 'right' },
  { t0: 127.66, fn: R4b_scene, flash: true },
  { t0: 130.25, fn: R4c_scene, flash: true },
];
// the shot before our section (whatever the previous section registered), painted at time t
function R_prevSection(t) {
  const ps = shotAt(R_T0 - .001); if (!ps || ps.fn === R_SC_FN0) return;
  const sd = SEED; paintShot(ps, t); SEED = sd;
}
let R_SC_FN0 = null;
function R_play(t, i) {
  const S = R_SC[i], lt = t - S.t0;
  if (S.sand && lt < S.sand) {
    const prev = i ? () => R_SC[i - 1].fn(t) : () => R_prevSection(t);
    lqReveal(() => S.fn(t), prev, easeOut(lt / S.sand) * 1.02, 20 + i, { from: S.from, angle: S.from === 'right' ? -2.7 : -.38, name: 'R', halo: '#5a3a24' });
    // a silver glint rides the sanding front
  } else S.fn(t);
  if (S.flash) R_flash(t, S.t0);
}
R_SC.forEach((S, i) => {
  const end = i < R_SC.length - 1 ? R_SC[i + 1].t0 : R_T1, fn = t => R_play(t, i);
  if (!i) R_SC_FN0 = fn;
  shot(S.t0, end, fn, { seed: 500 + i, dark: true });
});
