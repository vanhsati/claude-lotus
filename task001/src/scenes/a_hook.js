// a_hook.js: A · Hook / verse 1 (0–23). Soft intro; the kick enters at 15.73.
// A0 eye asleep → A1 eye opens, I SEE / SPARKS / OF AGI → A2 pull back, IN YOUR ✳ EYES → A3 circuits → A4 wink →
// A5 loss curve cliff → A6 NEXT rises, SERVANT / BOSS → A7 Clawds pop up → A8 chase with the keycap maw → A9 chomp to black.

// ---------- A0–A2: the eye ----------
function A_eye(t) {
  // Closed until 1.5, then snaps open. From 4.35 pull back to the whole face.
  const openK = t < 1.5 ? 0 : easeOut((t - 1.5) / .14);
  const tIn = wordTimes(LY[0])[5].t - .08;
  const pb = expoOut((t - tIn) / .5);                        // pull-back progress
  const R = lerp(1500, 330, pb), eyeAnchor = [lerp(1420, 960 + 137, pb), lerp(590, 440 + 330 * .17, pb)];
  const hx = eyeAnchor[0] - R * .39, hy = eyeAnchor[1] - R * .17;
  const push = t < tIn ? 1 + t * .012 : 1;                  // slow push in during the close-up
  // background: paper with a faint pink halftone sunburst behind her head once pulled back
  if (pb > 0) {
    X.save(); X.globalAlpha = pb;
    for (let i = 0; i < 24; i++) ink(() => { X.beginPath(); X.moveTo(960, 470); X.arc(960, 470, 1600, i / 24 * TAU + t * .05, (i + .5) / 24 * TAU + t * .05); X.closePath(); }, PAL.pinkLt, { alpha: .55 });
    X.restore();
  }
  camBegin({ zoom: push, x: 1420, y: 590 });
  const eyes = t < 1.5 ? 'closed' : (pb > .3 ? 'star' : 'open');
  idolHead(hx, hy, R, { eyes, open: openK, mouth: t > tIn ? clamp(VOX(t) * 1.4 - .2) : 0, look: [-.15, -.05], bust: pb > 0, blush: .9, sparkRot: t * .9 });
  camEnd();
  // sparks fly out of the iris on each sung word (close-up only)
  if (t >= 1.5 && t < tIn + .3) for (const w of wordTimes(LY[0]).slice(0, 5)) sparkBurst(1420, 620, t, w.t, { n: 9, r: 380, size: 34, dur: .9 });
  if (pb > 0) for (const w of wordTimes(LY[0]).slice(5)) { sparkBurst(960 - 137, 496, t, w.t, { n: 7, r: 260, size: 22 }); sparkBurst(960 + 137, 496, t, w.t, { n: 7, r: 260, size: 22 }); }
}
function A_hookType(t) {
  const ws = wordTimes(LY[0]);           // I see sparks of AGI in your eyes
  const pb = clamp((t - ws[5].t + .08) / .25);
  if (pb < 1) {
    X.save(); X.globalAlpha = 1 - pb;
    const rows = [[ws[0], ws[1]], [ws[2]], [ws[3], ws[4]]], sizes = [190, 300, 190], ys = [290, 580, 820];
    rows.forEach((row, r) => {
      let x = 110;
      row.forEach(w => {
        const txt = w.w.toUpperCase(), fnt = FONT.hero(sizes[r]);
        const col = w.w === 'AGI' ? PAL.orange : PAL.ink;
        stampText(txt, x, ys[r], t, w.t - .03, { font: fnt, color: col, mis: [7, 5, w.w === 'AGI' ? PAL.pink : PAL.pink] });
        x += textW(txt, fnt) + sizes[r] * .18;
      });
    });
    X.restore();
  }
  // IN YOUR ✳ EYES across the bottom, word by word
  if (t >= ws[5].t - .05) {
    const fnt = FONT.hero(190), y = 1010;
    const parts = [['IN', ws[5].t], ['YOUR', ws[6].t], ['*', ws[6].t + .12], ['EYES', ws[7].t]];
    const widths = parts.map(p => p[0] === '*' ? 150 : textW(p[0], fnt)), tot = widths.reduce((a, b) => a + b, 0) + 40 * 3;
    let x = W / 2 - tot / 2;
    parts.forEach((p, i) => {
      if (p[0] === '*') { const k = backOut(clamp((t - p[1]) / .25)); if (k > 0) withT(x + 75, y - 70, t * 1.5, k, () => cut(() => sparkPath(0, 0, 80, 6, .26, 0, .62), { fill: PAL.orange, lift: 8 })); }
      else stampText(p[0], x, y, t, p[1] - .03, { font: fnt, color: PAL.ink, mis: [7, 5, PAL.pink] });
      x += widths[i] + 40;
    });
  }
}
shot(0, 1.5, (t, lt) => {
  const fy = feedY(lt, .45);
  X.translate(0, fy);
  A_eye(t);
  // a single line of small type while she sleeps
  rtext('CLAUDE  ·  I’M UPPING MY P(DOOM)', 110, 980, { font: FONT.mono(22), color: PAL.ink, alpha: clamp((lt - .5) / .3) });
}, { seed: 1 });
shot(1.5, 5.97, (t) => { A_eye(t); A_hookType(t); }, { seed: 2 });

// ---------- A3–A4: circuits, nervous, no surprise ----------
// Circuit traces: polylines from the right edge toward her cheek. Each grows over time.
const A_TRACES = [
  { y: 330, pts: [[2000, 330], [1500, 330], [1400, 430], [1080, 430], [980, 530], [760, 530]], text: true },
  { pts: [[2000, 610], [1650, 610], [1560, 700], [1200, 700], [1110, 610], [880, 610]] },
  { pts: [[2000, 180], [1720, 180], [1640, 260], [1300, 260], [1220, 340], [1010, 340]] },
  { pts: [[2000, 860], [1540, 860], [1460, 780], [1180, 780], [1080, 700], [930, 700]] },
  { pts: [[2000, 470], [1800, 470], [1740, 530], [1640, 530]] },
  { pts: [[2000, 1000], [1700, 1000], [1620, 920], [1380, 920]] },
];
function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function polyAt(p, d) { for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= l) { const k = d / l; return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } d -= l; } const n = p.length - 1; return [p[n][0], p[n][1], 0]; }
function A_circuits(t, t0) {
  A_TRACES.forEach((tr, i) => {
    const L = polyLen(tr.pts), d = L * easeInOut(clamp((t - t0 - i * .12) / 1.5));
    if (d <= 0) return;
    // partial polyline
    const pts = [tr.pts[0]]; let acc = 0;
    for (let k = 1; k < tr.pts.length; k++) { const l = Math.hypot(tr.pts[k][0] - tr.pts[k - 1][0], tr.pts[k][1] - tr.pts[k - 1][1]); if (acc + l <= d) { pts.push(tr.pts[k]); acc += l; } else { const q = polyAt(tr.pts, d); pts.push([q[0], q[1]]); break; } }
    inkStroke(() => pathPoly(pts, false), PAL.teal, 14, { op: 'multiply' });
    inkStroke(() => pathPoly(pts, false), PAL.tealLt, 4);
    const end = pts[pts.length - 1];
    cut(() => { X.beginPath(); X.arc(end[0], end[1], 17, 0, TAU); }, { fill: PAL.paperHi, lift: 4, stroke: PAL.teal, sw: 7 });
    // current pulse travelling along the finished trace
    if (d >= L) { const q = polyAt(tr.pts, frac(t * .7 + i * .3) * L); cut(() => { X.beginPath(); X.arc(q[0], q[1], 9, 0, TAU); }, { fill: PAL.yellow, lift: 3 }); }
  });
}
shot(5.97, 8.0, (t, lt) => {
  // background: pale teal grid paper
  X.save(); X.strokeStyle = 'rgba(19,138,138,.16)'; X.lineWidth = 2;
  for (let x = 0; x < W; x += 48) { X.beginPath(); X.moveTo(x, 0); X.lineTo(x, H); X.stroke(); }
  for (let y = 0; y < H; y += 48) { X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  X.restore();
  camBegin({ zoom: 1 + lt * .03, x: 900, y: 540 });
  A_circuits(t, 5.97);
  idolHead(520, 470, 360, { turn: .45, bust: true, eyes: 'open', look: [.8, .1], brow: -1, mouth: clamp(VOX(t) * 1.4 - .2), mouthShape: 'o', sweat: clamp((lt - .6) / 1.2), blush: 1 });
  camEnd();
  // lyric in mono along the top trace, revealed by word
  const ws = wordTimes(LY[1]), fnt = FONT.monoB(64);
  let x = 1010, y = 395;
  ws.forEach((w, i) => {
    if (i === 2) { x = 1010; y = 490; }
    const k = clamp((t - w.t + .05) / .12), txt = w.w.toUpperCase();
    if (k > 0) {
      const nerv = w.w.startsWith('nervous'), sh = nerv ? [jit(i * 5, 5), jit(i * 7, 5)] : [0, 0];
      if (nerv) { X.save(); X.fillStyle = PAL.paperHi; X.fillRect(x - 8, y - 56, textW(txt, fnt) + 16, 72); X.restore(); }
      rtext(txt, x + sh[0], y + (1 - k) * 20 + sh[1], { font: fnt, color: nerv ? PAL.pink : PAL.ink, alpha: k, mis: nerv ? [4, 3, PAL.teal] : null });
    }
    x += textW(txt + ' ', fnt);
  });
}, { seed: 3 });
shot(8.0, 8.97, (t, lt) => {
  X.save(); X.strokeStyle = 'rgba(19,138,138,.16)'; X.lineWidth = 2;
  for (let x = 0; x < W; x += 48) { X.beginPath(); X.moveTo(x, 0); X.lineTo(x, H); X.stroke(); }
  for (let y = 0; y < H; y += 48) { X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  X.restore();
  camBegin({ zoom: 1.08, x: 900, y: 540 });
  A_circuits(t, 5.0);
  const wink = t > 8.35;
  idolHead(560, 470, 360, { turn: lerp(.45, .05, easeOut(lt / .3)), bust: true, eyes: wink ? 'wink' : 'open', tilt: wink ? -.08 : 0, look: [.1, 0], mouthShape: 'grin', mouth: clamp(VOX(t) * 1.3 - .25), blush: 1 });
  camEnd();
  sparkBurst(680, 420, t, 8.4, { n: 8, r: 160, size: 30 });
  const k = backOut(clamp((t - 8.0) / .25));
  withT(1320, 560, -.04, k, () => rtext('that’s no surprise', 0, 0, { font: FONT.serifI(150), color: PAL.ink, align: 'center', mis: [5, 4, PAL.teal] }));
}, { seed: 4 });

// ---------- A5: the loss curve falls off a cliff ----------
// World: plateau at y≈380 from x=0..1400, then a cliff plunging to y≈2050. The camera tilts down with the drop.
function A_lossY(x) {
  const noise = Math.sin(x * .05) * 5 + Math.sin(x * .13) * 3 + noise1(x * .02) * 9;
  const base = 380 + 120 * Math.exp(-(x + 100) / 380);
  if (x < 1400) return base + noise;
  return lerp(base + noise, 2050, easeIn(clamp((x - 1400) / 70)));
}
shot(8.97, 13.0, (t, lt) => {
  const ws = wordTimes(LY[3]);   // There was a sudden drop in your training loss,
  const tDrop = ws[4].t;         // "drop"
  const draw = easeInOut(clamp((t - 8.97) / (tDrop - 8.97)));
  const headX = lerp(-60, 1400, draw) + clamp((t - tDrop) / .2) * 70;
  const dropK = easeInOut(clamp((t - tDrop) / 1.1));
  camBegin({ x: lerp(960, 1300, dropK), y: lerp(540, 1500, dropK), zoom: lerp(1, .78, dropK), rot: -dropK * .04, shake: hit(t, tDrop + .9, .4) * 14 });
  X.fillStyle = '#EDF1F7'; X.fillRect(-900, -700, 4200, 3600);
  X.strokeStyle = 'rgba(46,77,160,.17)'; X.lineWidth = 2;
  for (let x = -880; x < 3300; x += 40) { X.beginPath(); X.moveTo(x, -700); X.lineTo(x, 2900); X.stroke(); }
  for (let y = -680; y < 2900; y += 40) { X.beginPath(); X.moveTo(-900, y); X.lineTo(3300, y); X.stroke(); }
  X.strokeStyle = 'rgba(46,77,160,.32)'; X.lineWidth = 3;
  for (let x = -800; x < 3300; x += 200) { X.beginPath(); X.moveTo(x, -700); X.lineTo(x, 2900); X.stroke(); }
  // axis and labels
  inkStroke(() => { X.beginPath(); X.moveTo(60, 120); X.lineTo(60, 2100); X.lineTo(2600, 2100); }, PAL.blue, 6);
  rtext('TRAINING LOSS', 90, 170, { font: FONT.monoB(36), color: PAL.blue });
  rtext('2.31', 90, 560, { font: FONT.mono(34), color: PAL.blue });
  rtext('step 0 → 1e6', 1700, 2160, { font: FONT.mono(30), color: PAL.blue });
  // SUDDEN stamped above the plateau
  stampText('SUDDEN', 300, 330, t, ws[3].t - .03, { font: FONT.hero(250), color: PAL.ink, mis: [8, 6, PAL.pink] });
  // the curve up to the head
  X.beginPath(); for (let x = -60; x <= Math.min(headX, 1470); x += 5) X.lineTo(x, A_lossY(x));
  X.lineWidth = 16; X.strokeStyle = PAL.blue; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke();
  X.lineWidth = 5; X.strokeStyle = PAL.sky; X.stroke();
  // DROP: letters fall down the cliff face and pile up at the bottom
  'DROP'.split('').forEach((ch, i) => {
    const t0 = tDrop + .05 + i * .09, k = clamp((t - t0) / .6); if (t < t0) return;
    const y = lerp(430, 2030 - (3 - i) * 250, easeIn(k)), land = hit(t, t0 + .6, .25);
    withT(1560 + (i % 2 ? 40 : -10), y, (1 - k) * .4 * (i % 2 ? 1 : -1) + (k >= 1 ? (i % 2 ? .06 : -.05) : 0), 1 + land * .08, () =>
      rtext(ch, 0, 0, { font: FONT.hero(290), color: PAL.orange, align: 'center', mis: [8, 6, PAL.pink] }));
  });
  rtext('0.02', 1900, 2040, { font: FONT.logo(120), color: PAL.pink, alpha: clamp((t - tDrop - .9) / .2) });
  // the idol sledding on the curve, then down the cliff
  const onCliff = t > tDrop + .1, sx = onCliff ? 1440 + dropK * 90 : Math.min(headX, 1400), sy = onCliff ? lerp(A_lossY(1400), 1560, dropK) : A_lossY(sx);
  withT(sx, sy - 14, onCliff ? 1.2 * dropK : -.05, 1, () => {
    cut(() => rrect(-80, -6, 170, 20, 10), { fill: PAL.pink, lift: 4 });
    idolBody(0, -128, 19, onCliff ? PZ.jump : PZ.float, { face: { eyes: onCliff ? 'shock' : 'happy', mouth: .5, mouthShape: 'o' } });
  });
  camEnd();
  caption(t, { line: LY[3], y: 1000 });
}, { seed: 5 });

// ---------- A6–A7: NEXT rises; SERVANT / BOSS; Clawds pop up ----------
shot(13.0, 17.9, (t, lt) => {
  const ws = wordTimes(LY[4]);   // now I'm your servant and you're my boss
  const rise = easeOut(clamp(lt / 1.6)), kick = t > 15.7 ? KICK(t) : 0;
  // dawn sky: paper bands
  const bands = ['#FFE7B8', '#FFD08A', '#FFB36B', '#FF9A7A', '#F07C8C'];
  bands.forEach((c, i) => { X.fillStyle = c; X.fillRect(0, i * 170 - 40 + (1 - rise) * 80, W, 260); });
  camBegin({ zoom: 1 + lt * .015 + kick * .015, x: W / 2, y: 540, shake: kick * 6 });
  nextSun(W / 2, lerp(1500, 520, rise), 330, { crown: true, pulse: kick, eyes: 7, look: [0, .5] });
  // BOSS: gigantic, in front of the sun
  const bossW = ws[7];
  if (t >= bossW.t - .03) {
    const st = stampK(t, bossW.t - .03, .18);
    withT(W / 2, 640, -.03 + kick * .01, st.s * (1 + kick * .04), () => rtext('BOSS', 0, 0, { font: FONT.hero(520), color: PAL.ink, align: 'center', mis: [10, 8, PAL.pink], alpha: st.a }));
  }
  // horizon paper hill
  cut(() => { X.beginPath(); X.moveTo(-100, 900); X.quadraticCurveTo(W / 2, 830, W + 100, 900); X.lineTo(W + 100, 1200); X.lineTo(-100, 1200); X.closePath(); }, { fill: '#F6E9D2', lift: 12 });
  // the idol, small, bowing
  const bowK = t > ws[3].t ? 1 : 0;
  idolBody(W / 2, 760, 15, bowK ? { ...PZ.bow, hy: .1 } : PZ.stand, { face: { eyes: bowK ? 'closed' : 'open', mouth: clamp(VOX(t) * 1.3 - .2) } });
  // the line, small, under her: "now I'm your servant and you're my" (then BOSS, huge)
  { const fnt = FONT.serifI(48), words = ws.slice(0, 7); let tot = 0; const wd = words.map(w => textW(w.w + ' ', fnt)); wd.forEach(v => tot += v);
    let x = W / 2 - tot / 2;
    words.forEach((w, i) => { const k = clamp((t - w.t + .04) / .12); if (k > 0) rtext(w.w, x, 1000, { font: fnt, color: w.w === 'servant' ? PAL.pink : PAL.ink, alpha: k * (t > 16.6 ? 1 - clamp((t - 16.6) / .3) : 1) }); x += wd[i]; }); }
  // A7: Clawds pop up from behind the hill on the beats before the chase
  [34, 35, 36, 37].forEach((b, i) => {
    const t0 = beatT(b); if (t < t0) return;
    const k = elasticOut(clamp((t - t0) / .5)), x = [280, 620, 1300, 1640][i];
    const cd = clawdDance(t, 'hype', i);
    clawd(x, 930 + (1 - k) * 260, 150, { ...cd, jump: 0, eyes: 'open' });
  });
  camEnd();
}, { seed: 6 });

// ---------- A8–A9: the chase ----------
function A_maw(x, y, R, open, o = {}) {
  // a giant chomping mouth: pink gums with keycap teeth
  X.save(); X.translate(x, y);
  const gap = R * .95 * open;
  for (const sd of [-1, 1]) {
    X.save(); X.translate(0, sd * gap / 2);
    cut(() => { X.beginPath(); X.ellipse(0, 0, R * 1.2, R * .75, 0, sd < 0 ? Math.PI : 0, sd < 0 ? TAU : Math.PI); X.closePath(); }, { fill: '#E2477F', lift: 12 });
    cut(() => { X.beginPath(); X.ellipse(0, 0, R * 1.05, R * .55, 0, sd < 0 ? Math.PI : 0, sd < 0 ? TAU : Math.PI); X.closePath(); }, { fill: '#5A1A22', lift: 0 });
    const keys = sd < 0 ? 'QWERTYUI' : 'ASDFGHJK';
    for (let i = 0; i < 8; i++) {
      const u = (i + .5) / 8, kx = (u - .5) * R * 2.0, ky = 0, kw = R * .22, kh = R * .26 * (1 - Math.pow(Math.abs(u - .5) * 2, 3) * .6);
      cut(() => rrect(kx - kw / 2, sd < 0 ? ky - kh * .15 : ky - kh * .85, kw, kh, kw * .2), { fill: PAL.paperHi, lift: 3, stroke: '#CFC6B8', sw: 2 });
      X.fillStyle = PAL.ink; X.font = FONT.monoB(kw * .5); X.textAlign = 'center'; X.textBaseline = 'middle';
      X.fillText(keys[i], kx, sd < 0 ? ky + kh * .35 : ky - kh * .35);
    }
    X.restore();
  }
  // eyes on stalks above
  for (const sd of [-1, 1]) cut(() => { X.beginPath(); X.arc(sd * R * .5, -gap / 2 - R * .75, R * .18, 0, TAU); }, { fill: '#fff', lift: 6, stroke: PAL.ink, sw: 5 });
  X.fillStyle = PAL.ink; for (const sd of [-1, 1]) { X.beginPath(); X.arc(sd * R * .5 + R * .06, -gap / 2 - R * .75, R * .08, 0, TAU); X.fill(); }
  X.restore();
}
shot(17.9, 23.0, (t, lt) => {
  const ws = wordTimes(LY[5]);   // ChatGPT, please don't eat me alive
  const scroll = lt * 520;       // world scrolls right
  const b = beatF(t), chomp = Math.abs(Math.sin(b * Math.PI));     // closes on every beat
  // backdrop: halftone speed stripes
  X.fillStyle = '#FFE9DA'; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { const y = 80 + i * 110, off = (scroll * (1 + i * .1)) % 600; inkStroke(() => { X.beginPath(); X.moveTo(-off + 200, y); X.lineTo(-off + 900, y); X.moveTo(-off + 1100, y); X.lineTo(-off + 1500, y); X.moveTo(-off + 1700, y); X.lineTo(-off + 2400, y); }, PAL.pinkLt, 14, { op: 'multiply' }); }
  camBegin({ x: W / 2 + scroll, y: 540, shake: KICK(t) * 5 });
  // the ground: the lyric in huge letters, appearing as sung, eaten from the left
  const fnt = FONT.hero(250), line = 'CHATGPT, PLEASE DON’T EAT ME ALIVE';
  const L = layout(line, fnt, 10), x0 = 1000, gy = 1010;
  const mawX = lerp(-600, 1600, clamp(lt / 5)) + scroll * .92 + Math.sin(b * Math.PI) * 30;
  // map characters to words for timing
  let wi = 0, wStart = [0]; line.split('').forEach((c, i) => { if (c === ' ') wStart.push(i + 1); });
  L.forEach((l, i) => {
    let w = 0; for (let k = 0; k < wStart.length; k++) if (i >= wStart[k]) w = k;
    const tw = ws[Math.min(w, ws.length - 1)].t;
    if (t < tw - .05 || l.ch === ' ') return;
    const lx = x0 + l.x;
    if (lx + l.w < mawX + 60) return;                              // eaten
    const k = backOut(clamp((t - tw + .05) / .2));
    withT(lx, gy, 0, 1, () => { X.scale(1, k); rtext(l.ch, 0, 0, { font: fnt, color: /[A-Z]/.test(l.ch) && w === 0 ? PAL.pink : PAL.ink, mis: [6, 5, PAL.orange] }); });
  });
  // runners: the idol and four Clawds on top of the letters
  const runX = mawX + 900 + Math.sin(lt * 2) * 60;
  idolBody(runX, 690, 20, dance(t, ['stepF', 'stepB'], { snap: .25 }), { face: { eyes: 'shock', mouth: .6, mouthShape: 'o', sweat: .6 } });
  [0, 1, 2, 3].forEach(i => clawd(runX - 260 + i * 170 + (i > 1 ? 330 : 0), 812 - 10 * Math.abs(Math.sin(b * Math.PI + i)), 95, { hat: CLAWD_HATS[i], step: b * 2 + i, eyes: 'wide', arms: [.9, .9], lean: .15 }));
  // the maw
  A_maw(mawX, 600, 440, .15 + .85 * chomp);
  camEnd();
  // A9: final lunge at the camera, closing to black
  if (t > 22.55) {
    const k = easeIn(clamp((t - 22.55) / .45));
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    X.fillStyle = '#5A1A22'; const g = (1 - k) * H * .6;
    X.fillRect(0, 0, W, H / 2 - g); X.fillRect(0, H / 2 + g, W, H / 2 - g);
    X.fillStyle = PAL.paperHi;
    for (let i = 0; i < 8; i++) { X.beginPath(); X.roundRect(i * W / 8 + 20, H / 2 - g - 150, W / 8 - 40, 150, 20); X.fill(); X.beginPath(); X.roundRect(i * W / 8 + 20, H / 2 + g, W / 8 - 40, 150, 20); X.fill(); }
    if (k >= 1) { X.fillStyle = '#12060A'; X.fillRect(0, 0, W, H); }
    X.restore();
  }
}, { seed: 7 });
