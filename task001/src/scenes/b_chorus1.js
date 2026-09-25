// b_chorus1.js: B · Chorus 1 (23–38.5). Pink, orange, yellow.
// B1 the maw opens onto the STAGE, point dance, I'M / UPPING / MY staircase → B2 FOOM → B3 Chinese room → B4 shrooms →
// B5 shoggoth unmasked → B6 shinigami eyes → B7 dance break (3 cuts, killing-part wink).

// Staircase type for "I'm upping my": words step up and to the right, one per sung word, on the left of frame.
function B_staircase(t, L, o = {}) {
  const ws = wordTimes(L).slice(0, 3), fnt = FONT.hero(o.size || 190), stepY = o.stepY ?? 105;
  let x = o.x ?? 80; const y0 = o.y ?? 1000;
  ws.forEach((w, i) => {
    const txt = w.w.toUpperCase().replace('’', "'"), wd = textW(txt, fnt);
    const st = stampK(t, w.t - .03, .14);
    if (st) withT(x + wd / 2, y0 - i * stepY, -.04, st.s, () => rtext(txt, 0, 0, { font: fnt, color: o.color || PAL.paperHi, align: 'center', op: 'source-over', mis: [8, 6, o.mis || PAL.pink], alpha: st.a }));
    x += wd + 34;
  });
}
// The chorus stage shot, reused by D1 / F2 / H1 with a different variant.
function B_stageShot(t, lt, v, L, o = {}) {
  const kick = KICK(t);
  camBegin({ zoom: (o.zoom || 1.32) + kick * .015 + lt * .015, x: 1180 + (o.camX || 0), y: 560, shake: kick * (o.shake ?? 4) });
  stageBG(t, { v, text: 'P(DOOM)', pattern: o.pattern || 'logo' });
  danceLine(t, { move: 'pdoom', x: o.x ?? 1230, y: 640, s: 27, spread: 330, clawdS: 105 });
  stageFront(t, { v });
  camEnd();
  meter(1800, 640, .62, pdoomAt(t), { crack: o.crack, rot: .04 });
  B_staircase(t, L, o.stair || {});
}

// B1: the maw opens from inside (reverse of A9), revealing the stage.
shot(23.0, 24.47, (t, lt) => {
  B_stageShot(t, lt, 1, LY[6]);
  const k = expoOut(lt / .35);
  if (k < 1) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    const g = k * H * .62;
    X.fillStyle = '#5A1A22'; X.fillRect(0, 0, W, H / 2 - g); X.fillRect(0, H / 2 + g, W, H / 2 - g + 2);
    X.fillStyle = PAL.paperHi;
    for (let i = 0; i < 8; i++) { X.beginPath(); X.roundRect(i * W / 8 + 20, H / 2 - g - 150, W / 8 - 40, 150, 20); X.fill(); X.beginPath(); X.roundRect(i * W / 8 + 20, H / 2 + g, W / 8 - 40, 150, 20); X.fill(); }
    X.restore();
  }
}, { seed: 11, dark: true });

// B2: 'cause the future goes FOOM
function B_burst(cx, cy, R, t, t0, cols) {
  const k = easeOut(clamp((t - t0) / .35)); if (k <= 0) return;
  cols.forEach((c, j) => {
    const r = R * k * (1 - j * .22), n = 14, pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + j * .2 + (t - t0) * .3, rr = i % 2 ? r * .55 : r * (1 + sjit(i + j * 30, .12)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    cut(() => pathPoly(pts), { fill: c, lift: 10 });
  });
}
shot(24.47, 26.47, (t, lt) => {
  const ws = wordTimes(LY[7]), tF = ws[4].t;       // 'cause the future goes FOOM
  const kick = KICK(t), blast = hit(t, tF, .5);
  camBegin({ zoom: 1.35 + lt * .05 + blast * .08, x: 1130, y: 470, shake: kick * 5 + blast * 30 });
  stageBG(t, { v: 1, pattern: t > tF ? 'rings' : 'logo' });
  B_burst(1130, 430, 900, t, tF - .02, [PAL.yellow, PAL.orange, PAL.pink, PAL.paperHi]);
  danceLine(t, { move: t > tF ? 'hype' : 'pdoom', x: 1130, y: 640, s: 27, spread: 360, clawdS: 110, face: { eyes: t > tF ? 'star' : 'open' } });
  confetti(t, tF, { n: 90, burst: true, seed: 3 });
  camEnd();
  // small lead-in words, then FOOM exploding letter by letter
  const lead = ws.slice(0, 4); let x = 90;
  lead.forEach(w => { const a = clamp((t - w.t + .03) / .1); if (a > 0) rtext(w.w.toUpperCase().replace('’', "'"), x, 170, { font: FONT.monoB(54), color: PAL.paperHi, op: 'source-over', alpha: a }); x += textW(w.w.toUpperCase() + ' ', FONT.monoB(54)); });
  if (t >= tF - .02) {
    const L = layout('FOOM', FONT.hero(420), 10), x0 = W / 2 - L.width / 2 - 60;
    L.forEach((l, i) => {
      const k = clamp((t - tF + .02) / .5), fly = easeOut(k), dir = (i - 1.5);
      withT(x0 + l.x + l.w / 2 + dir * fly * 140, 820 - fly * 40 - Math.abs(dir) * fly * 30, dir * fly * .12, lerp(1.6, 1, easeOut(k * 2)), () =>
        rtext(l.ch, 0, 0, { font: FONT.hero(420), color: PAL.ink, align: 'center', mis: [12, 9, PAL.pink], op: 'source-over', stroke: PAL.paperHi, sw: 14 }));
    });
  }
}, { seed: 12, dark: true, inT: 'jolt' });

// B3: Trapped in the Chinese room
shot(26.47, 27.97, (t, lt) => {
  const ws = wordTimes(LY[8]);
  X.fillStyle = '#FFC9DE'; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) ink(() => X.rect(i * 150 - (t * 60) % 150, 0, 70, H), PAL.pinkLt, { alpha: .5 });
  camBegin({ zoom: 1 + lt * .04, x: W / 2, y: 540, shake: KICK(t) * 4 });
  // the box
  const bx = 460, by = 170, bw = 1000, bh = 720;
  cut(() => pathPoly([[bx, by], [bx + bw, by + 6], [bx + bw - 4, by + bh], [bx + 4, by + bh - 4]]), { fill: '#C9A36B', lift: 22, shade: .35 });
  htGrad(() => X.rect(bx, by, bw, bh), '#8E6B3A', bx, by + bh, bx + bw * .3, by, { step: 12, maxR: 4, bounds: [bx, by, bw, bh], alpha: .7 });
  inkStroke(() => { X.beginPath(); X.moveTo(bx + bw / 2, by); X.lineTo(bx + bw / 2, by + 150); }, 'rgba(236,220,170,.9)', 60, { cap: 'butt' });
  // window with the idol peeking
  cut(() => rrect(bx + 380, by + 250, 240, 210, 8), { fill: '#3B2A1A', lift: 0 });
  X.save(); X.beginPath(); X.rect(bx + 380, by + 250, 240, 210); X.clip();
  idolHead(bx + 500, by + 400, 105, { eyes: 'shock', look: [Math.sin(t * 5), 0], mouth: .4, mouthShape: 'o', mic: false, sweat: .5 });
  X.restore();
  // mail slots and slips going in/out on the beats
  for (const [sx, dir] of [[bx - 10, 1], [bx + bw - 190, -1]]) {
    cut(() => rrect(sx + 10, by + 540, 180, 30, 6), { fill: PAL.ink, lift: 0 });
    const b = beatF(t), p = frac(b);
    const slip = ['你好', '中文', '规则', '房间'][Math.floor(b) % 4];
    const ox = dir > 0 ? lerp(-260, 60, easeOut(p * 1.6)) : lerp(60, 330, easeIn(p * 1.3));
    withT(sx + 100 + ox, by + 555, dir * .05, 1, () => { cut(() => rrect(-90, -60, 180, 90, 4), { fill: PAL.paperHi, lift: 6 }); rtext(slip, 0, 10, { font: FONT.sc(56), color: PAL.ink, align: 'center' }); });
  }
  // stamps on the box
  stamp(bx + bw / 2, by + 110, 'CHINESE ROOM', t, ws[3].t - .02, { size: 96, rot: -.05, color: PAL.ink });
  stamp(bx + 230, by + 640, 'TRAPPED', t, ws[0].t, { size: 70, rot: .12, color: PAL.red });
  camEnd();
  caption(t, { line: LY[8] });
}, { seed: 13, inT: 'jolt' });

// B4: with a bag of shrooms
shot(27.97, 29.47, (t, lt) => {
  const ws = wordTimes(LY[9]);
  // spiral bands
  X.save(); X.translate(W / 2, H / 2);
  const cols = [PAL.pink, PAL.yellow, PAL.sky, PAL.orange];
  for (let i = 24; i >= 0; i--) { const r = i * 90 + (t * 160) % 90; X.fillStyle = cols[(i + Math.floor(t * 160 / 90)) % 4]; X.beginPath(); for (let a = 0; a <= TAU + .01; a += .15) { const rr = r * (1 + .12 * Math.sin(a * 5 + t * 4 + i)); X.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } X.fill(); }
  X.restore();
  camBegin({ zoom: 1 + Math.sin(t * 3) * .03, rot: Math.sin(t * 2) * .05, x: W / 2, y: 540 });
  // mushrooms sprouting on each beat
  for (let i = 0; i < 9; i++) {
    const t0 = 27.97 + i * BEAT / 2; if (t < t0) continue;
    const k = elasticOut(clamp((t - t0) / .5)), mx = 100 + i * 215 + (i % 2) * 40, my = H + 30, sz = (i % 3 === 1 ? 190 : 130) * k;
    cut(() => rrect(mx - sz * .18, my - sz * 1.2, sz * .36, sz * 1.2, sz * .1), { fill: PAL.paperHi, lift: 6 });
    cut(() => { X.beginPath(); X.ellipse(mx, my - sz * 1.15, sz * .75, sz * .55, 0, Math.PI, TAU); X.closePath(); }, { fill: i % 2 ? PAL.red : PAL.pink, lift: 8 });
    for (let d = 0; d < 4; d++) cut(() => { X.beginPath(); X.arc(mx + (d - 1.5) * sz * .32, my - sz * 1.35 - (d % 2) * sz * .15, sz * .08, 0, TAU); }, { fill: PAL.paperHi, lift: 0 });
  }
  idolHead(W / 2, 470 + Math.sin(t * 6) * 16, 250, { eyes: 'spiral', mouth: clamp(VOX(t) * 1.3 - .2), tilt: Math.sin(t * 4) * .15, crown: 1 + .1 * Math.sin(t * 8), blush: 1 });
  camEnd();
  // warped type
  const txt = 'BAG OF SHROOMS', fnt = FONT.hero(200), L = layout(txt, fnt, 8), x0 = W / 2 - L.width / 2;
  if (t >= ws[2].t - .03) L.forEach((l, i) => {
    if (l.ch === ' ') return;
    const a = clamp((t - ws[2].t - i * .025) / .12);
    withT(x0 + l.x + l.w / 2, 960 + Math.sin(t * 7 + i * .7) * 26, Math.sin(t * 5 + i) * .18, 1 + .12 * Math.sin(t * 9 + i), () =>
      rtext(l.ch, 0, 0, { font: fnt, color: [PAL.blue, PAL.ink, PAL.red][i % 3], align: 'center', mis: [8, 7, PAL.ink], alpha: a, op: 'source-over', stroke: PAL.paperHi, sw: 22 }));
  });
  if (t < ws[2].t) rtext('with a', W / 2, 960, { font: FONT.serifI(90), color: PAL.ink, align: 'center' });
}, { seed: 14, inT: 'jolt' });

// B5: See through the shoggoth's lies
shot(29.47, 33.47, (t, lt) => {
  const ws = wordTimes(LY[10]), tL = ws[4].t;       // See through the shoggoth's lies
  const yank = easeInOut(clamp((t - tL + .1) / .55)), kick = KICK(t);
  X.fillStyle = t < tL ? '#FFF1B8' : '#2A1E3A'; X.fillRect(0, 0, W, H);
  if (t >= tL) for (let i = 0; i < 30; i++) ink(() => { X.beginPath(); X.moveTo(W / 2, H / 2); X.arc(W / 2, H / 2, 1400, i / 30 * TAU, (i + .45) / 30 * TAU); X.closePath(); }, '#3A2A52', { op: 'source-over' });
  camBegin({ zoom: lerp(1.25, 1, yank) + kick * .02, x: W / 2 - 80, y: 520, shake: kick * 5 });
  shoggoth(W / 2 - 60, 540, 420, { mask: yank, wiggle: t < tL ? .3 : 1 + kick });
  // the idol yanking from the right
  if (t > tL - .6) {
    const ix = lerp(2300, 1600, easeOut(clamp((t - tL + .6) / .4))) + yank * 60;
    idolBody(ix, 700, 30, { ...PZ.stand, lSh: 1.7, lEl: .2, rSh: -.3, rEl: 1.2, lean: -.15 + yank * .2, lHip: .3, rHip: -.25, rKn: .3 }, { face: { eyes: yank > .5 ? 'open' : 'open', brow: 1, mouthShape: 'grin', mouth: clamp(VOX(t) * 1.3 - .2) } });
  }
  camEnd();
  // SEE THROUGH stamped at the top, LIES stamped on the mask as it flies
  stampText('SEE', 90, 230, t, ws[0].t - .02, { font: FONT.hero(200), color: t < tL ? PAL.ink : PAL.paperHi, op: 'source-over', mis: [7, 5, PAL.pink] });
  stampText('THROUGH', 90, 430, t, ws[1].t - .02, { font: FONT.hero(200), color: t < tL ? PAL.ink : PAL.paperHi, op: 'source-over', mis: [7, 5, PAL.pink] });
  if (t >= ws[2].t) rtext('the shoggoth’s', 100, 530, { font: FONT.serifI(80), color: t < tL ? PAL.ink : PAL.paperHi, op: 'source-over', alpha: clamp((t - ws[2].t) / .15) });
  if (t >= tL - .03) {
    const mx = W / 2 - 60 + lerp(0, 420 * 1.9, yank), my = 540 + lerp(-20, -460, yank);
    withT(mx, my, lerp(0, .5, yank), lerp(1, .62, yank), () => stamp(0, 20, 'LIES', t, tL - .03, { size: 150, rot: -.1, color: PAL.red, op: 'source-over' }));
  }
}, { seed: 15, inT: 'jolt' });

// B6: with your shinigami eyes
shot(33.47, 35.5, (t, lt) => {
  const ws = wordTimes(LY[11]), kick = KICK(t);
  X.fillStyle = '#0E0608'; X.fillRect(0, 0, W, H);
  // red speed lines
  for (let i = 0; i < 60; i++) {
    const a = hash(i * 3.3) * TAU, r0 = 260 + hash(i * 5.1) * 300 + ((t * 900 + hash(i) * 900) % 900);
    inkStroke(() => { X.beginPath(); X.moveTo(W / 2 + Math.cos(a) * r0, 480 + Math.sin(a) * r0); X.lineTo(W / 2 + Math.cos(a) * (r0 + 260), 480 + Math.sin(a) * (r0 + 260)); }, PAL.red, 4 + hash(i) * 8, { op: 'source-over', alpha: .8 });
  }
  camBegin({ zoom: 1.02 + lt * .05 + kick * .02, x: W / 2, y: 520, shake: kick * 5 });
  idolHead(W / 2, 470, 330, { eyes: t > ws[3].t - .1 ? 'red' : 'open', brow: 1, mouthShape: 'flat', mouth: clamp(VOX(t) * 1.3 - .2), blush: .3, bust: true, look: [0, -.2] });
  camEnd();
  // what the shinigami eyes see: numbers over heads (tiny Clawds at the bottom corners)
  const labels = [['AGI: 2027', 250, 800], ['P(DOOM): 34%', 1660, 820], ['TIMELINE: SHORT', 260, 330], ['HORIZON ×10/YR', 1640, 300]];
  labels.forEach(([s, x, y], i) => {
    const t0 = 33.6 + i * BEAT; if (t < t0) return;
    const a = clamp((t - t0) / .1);
    rtext(s, x, y, { font: FONT.monoB(38), color: PAL.red, align: 'center', op: 'source-over', alpha: a * (.75 + .25 * Math.sin(t * 30 + i)) });
    clawd(x, y + 190, 120, { hat: null, eyes: 'red', body: '#3A1418', lift: 0 });
  });
  // SHINIGAMI EYES + 死神の目 vertical
  { const f = FONT.hero(200), w1 = textW('SHINIGAMI', f), w2 = textW('EYES', f), x0 = W / 2 - (w1 + w2 + 50) / 2;
    stampText('SHINIGAMI', x0 + w1 / 2, 990, t, ws[2].t - .02, { font: f, color: PAL.red, align: 'center', op: 'source-over', mis: [8, 6, PAL.paperHi] });
    stampText('EYES', x0 + w1 + 50 + w2 / 2, 990, t, ws[3].t - .02, { font: f, color: PAL.paperHi, align: 'center', op: 'source-over', mis: [8, 6, PAL.red] }); }
  if (t > ws[2].t) '死神の目'.split('').forEach((c, i) => rtext(c, 1830, 200 + i * 140, { font: FONT.jp(110), color: PAL.red, align: 'center', op: 'source-over', alpha: clamp((t - ws[2].t - i * .06) / .1) }));
  if (t < ws[2].t) rtext('with your', W / 2, 960, { font: FONT.serifI(110), color: PAL.paperHi, align: 'center', op: 'source-over' });
}, { seed: 16, dark: true, inT: 'jolt', joltColor: PAL.red });

// B7: dance break (35.5–38.5), cuts on the beat grid
shot(35.5, beatT(79), (t, lt) => {
  camBegin({ zoom: 1.25 + KICK(t) * .015 + lt * .04, x: W / 2, y: 580, shake: KICK(t) * 4 });
  stageBG(t, { v: 1, pattern: 'stripes' });
  danceLine(t, { move: 'hype', x: W / 2, y: 640, s: 27, spread: 380, clawdS: 110, face: { eyes: 'happy' } });
  meter(1770, 820, .55, pdoomAt(t));
  confetti(t, 35.5, { n: 60, seed: 5 });
  camEnd();
}, { seed: 17, dark: true, inT: 'jolt' });
shot(beatT(79), beatT(81), (t, lt) => {
  // low angle on the Clawds' feet and faces, jumping in canon
  X.fillStyle = PAL.yellow; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) ink(() => { X.beginPath(); X.moveTo(W / 2, H + 200); X.arc(W / 2, H + 200, 2200, Math.PI + i / 12 * Math.PI, Math.PI + (i + .5) / 12 * Math.PI); X.closePath(); }, PAL.orangeLt, { alpha: .6 });
  camBegin({ zoom: 1, x: W / 2, y: 540, shake: KICK(t) * 6 });
  for (let i = 0; i < 4; i++) { const cd = clawdDance(t, 'hype', i, { delay: i * .12 }); clawd(300 + i * 440, 1000, 330, { ...cd, jump: (cd.jump || 0) * 2.2, eyes: 'happy' }); }
  camEnd();
  rtext('P(DOOM) ' + Math.round(pdoomAt(t)) + '%', W / 2, 250, { font: FONT.logo(150), color: PAL.ink, align: 'center', mis: [8, 6, PAL.pink] });
}, { seed: 18, inT: 'jolt' });
shot(beatT(81), 38.5, (t, lt) => {
  // killing part: close-up, wink to camera, finger heart
  X.fillStyle = PAL.pinkLt; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.pink, W / 2, H / 2, 0, 0, { step: 24, maxR: 12, bounds: [0, 0, W, H] });
  htGrad(() => X.rect(0, 0, W, H), PAL.pink, W / 2, H / 2, W, H, { step: 24, maxR: 12, bounds: [0, 0, W, H] });
  const wink = t > beatT(81) + BEAT * .9;
  camBegin({ zoom: 1 + lt * .08, x: W / 2, y: 540 });
  idolHead(W / 2, 470, 360, { bust: true, eyes: wink ? 'wink' : 'open', tilt: wink ? -.12 : 0, mouthShape: 'grin', blush: 1.2 });
  if (wink) { withT(W / 2 + 470, 780, -.3, backOut(clamp((t - beatT(81) - BEAT * .9) / .3)), () => cut(() => heartPath(0, 0, 90), { fill: PAL.red, lift: 10 })); sparkBurst(W / 2 + 180, 440, t, beatT(81) + BEAT * .9, { n: 10, r: 300, size: 40 }); }
  camEnd();
}, { seed: 19, inT: 'jolt' });
