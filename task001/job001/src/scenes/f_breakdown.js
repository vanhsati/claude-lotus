// f_breakdown.js: F · Breakdown (88.45–109.4). No drums: deep blue, pink, jazz. Slow camera, long shots.
// F1 Gato's paw over the void → F2 the quiet chorus on a dim stage → F3 paperclips fill the room → F4 kill switch, OOO →
// F5 the kid in the orange void → F6 the sheet's edge is the fuse → F7 orthogonality thesis blues (riser from 108.4).

// ---------- shared helpers ----------
// Riso type on dark paper: the misregistered second ink is printed opaque (multiply vanishes on dark stock).
function F_txt(str, x, y, o) {
  if (o.mis) rtext(str, x + o.mis[0], y + o.mis[1], { ...o, color: o.mis[2], mis: null, op: 'source-over', alpha: (o.alpha ?? 1) * (o.misA ?? .9) });
  return rtext(str, x, y, { ...o, mis: null, op: o.op || 'source-over' });
}
// Where the idol's hand ends up for a pose (mirrors idolBody's arm maths), relative to the hip point.
function F_hand(P, s, sd) {
  P = { ...POSE0, ...P };
  const neck = seg(0, 0, Math.PI + P.lean, IDOL.torso * s);
  const sh = [neck[0] + sd * IDOL.shW * s * Math.cos(P.lean), neck[1] + s * .25 + sd * IDOL.shW * s * Math.sin(P.lean)];
  const a = sd < 0 ? P.lSh : P.rSh, el = sd < 0 ? P.lEl : P.rEl;
  const e = seg(sh[0], sh[1], a, IDOL.upArm * s), w = seg(e[0], e[1], a + el, IDOL.foreArm * s);
  const g = seg(w[0], w[1], a + el, s * .25);                           // centre of the fist
  return [g[0] + P.hx * s, g[1] + P.hy * s];
}
// Paper scraps drifting slowly upward (deterministic in t). Big ones are cut-outs, the rest plain fills.
function F_scraps(t, n, seed, cols, o = {}) {
  for (let i = 0; i < n; i++) {
    const r = k => hash(i * 23.17 + k * 3.1 + seed);
    const sz = 8 + Math.pow(r(1), 2.2) * 46, sp = (o.speed || 1) * (18 + sz * 1.6);
    const x = r(3) * (W + 200) - 100 + Math.sin(t * .5 + r(4) * 9) * 30 * (o.sway ?? 1);
    const span = H + 300, y = ((r(5) * span - t * sp) % span + span) % span - 150;
    const rot = t * (r(6) - .5) * 1.4 + r(7) * 9, fl = Math.cos(t * (1 + r(8)) + r(9) * 9);
    const col = cols[i % cols.length];
    withT(x, y, rot, 1, () => {
      X.scale(1, .35 + .65 * Math.abs(fl));
      const pts = [[-sz / 2, -sz * .35], [sz / 2 + sjit(i, 3), -sz * .3], [sz * .45, sz * .35], [-sz * .5 + sjit(i + 4, 3), sz * .3]];
      if (sz > 34) cut(() => pathPoly(pts), { fill: col, lift: 4, shade: .35 });
      else { X.globalAlpha = .45 + sz / 60; X.fillStyle = col; pathPoly(pts); X.fill(); }
    });
  }
}

// ---------- F1: Gato, please don't let me go ----------
const F_REL = beatT(207);        // the claws release on the last beat of the line (94.81)
const F_HANG = { lSh: 2.72, lEl: .3, rSh: -2.72, rEl: -.3, lHip: .1, lKn: .22, rHip: -.06, rKn: .12, skirt: .55, head: -.05 };
function F_catHead(cx, cy, R, t, shock) {
  // ears
  for (const sd of [-1, 1]) {
    const ear = [[cx + sd * R * .25, cy - R * .8], [cx + sd * R * .88, cy - R * 1.35], [cx + sd * R * .95, cy - R * .38]];
    cut(() => pathSmooth(ear, true, .35), { fill: PAL.paperHi, lift: 12 });
    ink(() => pathSmooth([[cx + sd * R * .42, cy - R * .78], [cx + sd * R * .82, cy - R * 1.12], [cx + sd * R * .84, cy - R * .52]], true, .35), PAL.pinkLt);
  }
  // head
  const head = () => pathSmooth([[cx - R * 1.05, cy - R * .1], [cx - R * .7, cy - R * .85], [cx, cy - R * .98], [cx + R * .7, cy - R * .85], [cx + R * 1.05, cy - R * .1], [cx + R * .85, cy + R * .6], [cx, cy + R * .86], [cx - R * .85, cy + R * .6]], true, .9);
  cut(head, { fill: PAL.paperHi, lift: 16, shade: .45 });
  htGrad(head, PAL.blueLt, cx - R * .2, cy - R * .4, cx + R * .9, cy + R * .8, { step: R * .06, maxR: R * .024, bounds: [cx - R * 1.1, cy - R, R * 2.2, R * 1.9], alpha: .9 });
  // tabby stripes in blue ink
  for (let i = -1; i <= 1; i++) ink(() => pathSmooth([[cx + i * R * .2 - R * .05, cy - R * .96], [cx + i * R * .2 + R * .05, cy - R * .96], [cx + i * R * .16 + R * .02, cy - R * .6], [cx + i * R * .16 - R * .01, cy - R * .6]], true, .6), PAL.blue, { alpha: .85 });
  // eyes: big, sad, looking down-left at her
  for (const sd of [-1, 1]) {
    const ex = cx + sd * R * .42, ey = cy + R * .06, er = R * (shock ? .25 : .22);
    cut(() => { X.beginPath(); X.ellipse(ex, ey, er * 1.15, er * (shock ? 1.1 : .95), sd * .12, 0, TAU); }, { fill: PAL.ink, lift: 3 });
    ink(() => { X.beginPath(); X.ellipse(ex - R * .06, ey + R * .05, er * .75, er * .7, 0, 0, TAU); }, PAL.blue, { op: 'source-over' });
    X.fillStyle = PAL.paperHi;
    X.beginPath(); X.arc(ex - R * .02, ey - er * .38, er * .3, 0, TAU); X.fill();
    X.beginPath(); X.arc(ex - R * .13, ey + er * .35, er * .13, 0, TAU); X.fill();
    // a worried brow line
    inkStroke(() => { X.beginPath(); X.moveTo(ex - sd * er * .95, ey - er * 1.95); X.quadraticCurveTo(ex + sd * er * .1, ey - er * 1.75, ex + sd * er * .95, ey - er * 1.35); }, PAL.ink, R * .025);
  }
  // nose, mouth, whiskers
  ink(() => pathSmooth([[cx - R * .09, cy + R * .34], [cx + R * .09, cy + R * .34], [cx, cy + R * .45]], true, .5), PAL.pink, { op: 'source-over' });
  inkStroke(() => { X.beginPath(); X.moveTo(cx, cy + R * .45); X.lineTo(cx, cy + R * .52); X.moveTo(cx - R * .16, cy + R * .54); X.quadraticCurveTo(cx - R * .08, cy + R * .62, cx, cy + R * .52); X.quadraticCurveTo(cx + R * .08, cy + R * .62, cx + R * .16, cy + R * .54); }, PAL.ink, R * .022);
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++)
    inkStroke(() => { X.beginPath(); X.moveTo(cx + sd * R * .38, cy + R * (.42 + k * .07)); X.quadraticCurveTo(cx + sd * R * .9, cy + R * (.3 + k * .12), cx + sd * R * 1.45, cy + R * (.26 + k * .2) + Math.sin(t * 1.3 + k) * 4); }, PAL.paperHi, R * .012);
  // blush
  for (const sd of [-1, 1]) ink(() => { X.beginPath(); X.ellipse(cx + sd * R * .62, cy + R * .4, R * .13, R * .07, 0, 0, TAU); }, PAL.pinkLt, { op: 'source-over', alpha: .8 });
}
// The foreleg reaches down from under the chin; the paw holds her by two claws at (px, py).
function F_catPaw(px, py, R, clawK, t) {
  const sx = px + R * 1.55, sy = py - R * 1.25;
  const leg = () => { X.beginPath(); X.moveTo(sx - R * .55, sy - R * .9); X.quadraticCurveTo(sx - R * .9, sy + R * .2, px - R * .62, py - R * .1); X.lineTo(px + R * .62, py + R * .05); X.quadraticCurveTo(sx + R * .2, sy + R * .15, sx + R * .75, sy - R * .7); X.closePath(); };
  cut(leg, { fill: PAL.paperHi, lift: 14, shade: .4 });
  htGrad(leg, PAL.blueLt, px, py - R * .3, sx + R * .6, sy, { step: R * .09, maxR: R * .035, bounds: [px - R, sy - R, R * 3.2, R * 2.4], alpha: .8 });
  for (let i = 0; i < 3; i++) ink(() => { const u = .35 + i * .18, x0 = lerp(px, sx, u), y0 = lerp(py, sy, u); X.beginPath(); X.ellipse(x0, y0, R * .09, R * .45, -.75, 0, TAU); }, PAL.blue, { alpha: .75 });
  // the paw: a round mitten with toe bumps along the bottom edge
  const paw = () => { X.beginPath(); X.ellipse(px, py, R * .78, R * .56, -.08, 0, TAU); };
  cut(paw, { fill: PAL.paperHi, lift: 12, shade: .4 });
  const toes = [-.52, -.18, .18, .52];
  toes.forEach((u, i) => cut(() => { X.beginPath(); X.ellipse(px + u * R, py + R * .38 - Math.abs(u) * R * .12, R * .2, R * .2, 0, 0, TAU); }, { fill: PAL.paperHi, lift: 4 }));
  toes.forEach((u, i) => inkStroke(() => { X.beginPath(); X.moveTo(px + u * R + (u < 0 ? R * .17 : -R * .17), py + R * .1); X.lineTo(px + u * R + (u < 0 ? R * .17 : -R * .17) * .9, py + R * .42 - Math.abs(u) * R * .12); }, 'rgba(46,77,160,.45)', R * .025));
  // claws: pink-edged paper hooks curling under
  toes.forEach((u, i) => {
    const len = R * .42 * clawK * (i === 1 || i === 2 ? .75 : 1.12); if (len < 2) return;
    const bx = px + u * R, by = py + R * .5 - Math.abs(u) * R * .12;
    cut(() => { X.beginPath(); X.moveTo(bx - R * .07, by); X.quadraticCurveTo(bx - R * .1, by + len * .9, bx + R * .02 * Math.sign(u || 1), by + len); X.quadraticCurveTo(bx + R * .02, by + len * .5, bx + R * .07, by); X.closePath(); }, { fill: PAL.paperHi, lift: 4, stroke: PAL.pink, sw: 3 });
  });
}
function F_gatoType(t) {
  const ws = wordTimes(LY[27]);            // Gato, please don't let me go
  const rows = [
    { w: [0], y: 380, size: 300, x: 110 },
    { w: [1, 2], y: 600, size: 170, x: 150 },
    { w: [3, 4, 5], y: 850, size: 210, x: 130 },
  ];
  const tFloat = [93.15, 93.55, 93.95];
  rows.forEach((row, ri) => {
    const fnt = FONT.serifI(row.size); let x = row.x;
    row.w.forEach(wi => {
      const w = ws[wi], word = w.w, isGo = wi === 5;
      const L = layout(word, fnt, 0);
      L.forEach((l, li) => {
        const a = easeOut((t - w.t + .02 - li * .03) / .45); if (a <= 0) return;
        let dx = 0, dy = (1 - a) * 40, rot = 0, al = a;
        if (!isGo) {                                   // letters float away like the paper scraps
          const t0 = tFloat[ri] + (wi * 3 + li) * .06, k = t - t0;
          if (k > 0) { dy -= k * 70 + k * k * 160; dx += Math.sin(k * 2 + li) * 26 * k; rot = sjit(wi * 11 + li, .9) * k; al *= clamp(1 - k / 1.3); }
        } else if (t > F_REL) {                         // "go" drops with her
          const k = t - F_REL - li * .04; if (k > 0) { dy += 1800 * k * k; rot = sjit(li + 40, .5) * k * 2; }
        }
        if (al <= .01) return;
        withT(x + l.x + l.w / 2 + dx, row.y + dy, rot, 1, () =>
          F_txt(l.ch, 0, 0, { font: fnt, align: 'center', color: isGo ? PAL.pink : PAL.paperHi, mis: [7, 6, isGo ? PAL.blueLt : PAL.pink], misA: .85, alpha: al }));
      });
      x += L.width + row.size * .22;
    });
  });
}
shot(88.45, 95.4, (t, lt) => {
  // the void: deep blue, darker below, faint pink glow where she hangs
  X.fillStyle = PAL.blueDk; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), '#0A0F24', W / 2, 200, W / 2, H, { step: 16, maxR: 9, bounds: [0, 0, W, H], op: 'source-over' });
  htGrad(() => { X.beginPath(); X.arc(1180, 640, 560, 0, TAU); }, PAL.pink, 1180, 640 + 560, 1180, 640, { step: 18, maxR: 4, bounds: [620, 80, 1120, 1120], op: 'source-over', alpha: .35, gamma: 1.6 });
  for (let i = 0; i < 70; i++) { X.fillStyle = `rgba(255,251,243,${.25 + hash(i * 5.3) * .5})`; X.beginPath(); X.arc(hash(i * 7.7) * W, hash(i * 3.1) * H, 1 + hash(i) * 2.2, 0, TAU); X.fill(); }
  F_scraps(t, 46, 3, [PAL.paperHi, PAL.pinkLt, PAL.blueLt, PAL.sky], { speed: .9 });
  camBegin({ zoom: 1.02 + lt * .012, x: 1060, y: 540 - lt * 4 });
  const rel = t - F_REL, clawK = rel > 0 ? 1 - easeOut(rel / .14) : 1;
  const breathe = Math.sin(t * 1.2) * 6;
  F_catHead(1655, 318 + breathe * .5, 235, t, rel > 0);
  // the dangling idol: a slow pendulum from the claws; after the release she falls
  const s = 36, px = 1170, py = 300 + breathe, R = 150;
  const clawY = py + R * .5 - .52 * R * .12 + R * .42 * 1.12 * .78;   // where her fists close on the outer claws
  const sway = Math.sin(t * 1.35) * .07 + Math.sin(t * .6) * .03;
  const P = { ...F_HANG, lKn: F_HANG.lKn + Math.sin(t * 1.35 + .6) * .12, rKn: F_HANG.rKn + Math.sin(t * 1.35 + 1.2) * .1, lHip: F_HANG.lHip - sway * .8, rHip: F_HANG.rHip - sway * .8 };
  const hl = F_hand(P, s, -1), hr = F_hand(P, s, 1), mid = [(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2];
  const fall = rel > 0 ? 2000 * rel * rel : 0;
  withT(px, clawY + fall, sway + (rel > 0 ? rel * .9 : 0), 1, () => {
    const pose = rel > 0 ? mixPose(P, { ...PZ.float, lSh: 2.9, rSh: -2.9 }, easeOut(rel / .3)) : P;
    idolBody(-mid[0], -mid[1], s, pose, { face: { eyes: rel > .05 ? 'closed' : 'open', look: [.4, -.9], brow: -1, mouth: rel > 0 ? 0 : clamp(VOX(t) * 1.3 - .2), mouthShape: 'o', blush: 1, sweat: rel > 0 ? 0 : .35 } });
  });
  F_catPaw(px, py - (rel > 0 ? easeOut(rel / .3) * 40 : 0), R, clawK, t);
  camEnd();
  F_gatoType(t);
}, { seed: 21, dark: true, inT: 'feed', inDur: .5 });

// ---------- F2: I'm upping my P(doom), (the quiet chorus) ----------
function F_beanie(x, y, s, col, rot) {
  withT(x, y, rot, 1, () => {
    cut(() => { X.beginPath(); X.ellipse(0, 0, s, s * .8, 0, Math.PI, TAU); X.closePath(); }, { fill: col, lift: 4 });
    for (let i = -3; i <= 3; i++) inkStroke(() => { X.beginPath(); X.moveTo(i * s * .25, -s * .05); X.lineTo(i * s * .18, -s * .65 * Math.cos(i * .35)); }, 'rgba(0,0,0,.18)', s * .05);
    cut(() => rrect(-s * 1.05, -s * .12, s * 2.1, s * .3, s * .12), { fill: col, lift: 2, stroke: 'rgba(0,0,0,.2)', sw: 2 });
    cut(() => { X.beginPath(); X.arc(0, -s * .85, s * .24, 0, TAU); }, { fill: PAL.paperHi, lift: 3 });
  });
}
shot(95.4, 97.5, (t, lt) => {
  const halfT = BEAT0 + (t - BEAT0) / 2;            // the point dance at half speed: tired, alone
  camBegin({ zoom: 1.36 + lt * .035, x: 960, y: 575 });
  stageBG(t, { v: 3, text: 'P(DOOM)', pattern: 'dim' });
  // one spotlight: a cone from the truss and a pool on the floor
  X.save(); X.globalCompositeOperation = 'screen';
  X.fillStyle = 'rgba(255,240,205,.16)'; X.beginPath(); X.moveTo(930, 120); X.lineTo(990, 120); X.lineTo(1150, 830); X.lineTo(770, 830); X.closePath(); X.fill();
  X.fillStyle = 'rgba(255,240,205,.18)'; X.beginPath(); X.moveTo(945, 120); X.lineTo(975, 120); X.lineTo(1070, 830); X.lineTo(850, 830); X.closePath(); X.fill();
  X.restore();
  ink(() => { X.beginPath(); X.ellipse(960, 830, 250, 46, 0, 0, TAU); }, 'rgba(255,240,205,.5)', { op: 'screen' });
  htGrad(() => { X.beginPath(); X.ellipse(960, 830, 250, 46, 0, 0, TAU); }, PAL.sky, 960, 876, 960, 830, { step: 10, maxR: 3.5, bounds: [700, 780, 520, 100], op: 'screen', alpha: .6 });
  // where the crew stood: four beanies left on the floor
  [[640, 846, .3], [800, 812, -.2], [1120, 812, .15], [1280, 848, -.35]].forEach(([x, y, r], i) => F_beanie(x, y, 26, CLAWD_HATS[i], r));
  idolBody(960, 640, 27, dance(halfT, 'pdoom', { snap: .6 }), { face: { eyes: 'open', look: [0, -.4], brow: -1, mouth: clamp(VOX(t) * 1.3 - .2), blush: .5 } });
  camEnd();
  meter(1770, 760, .62, pdoomAt(t), { rot: .04 });
  caption(t, { line: LY[28] });
}, { seed: 22, dark: true, inT: 'flip', inDur: .5 });

// ---------- F3: as paperclips fill the room. ----------
function F_clip(L, w) {
  const a = L / 2, R1 = w * .5, R2 = w * .4, R3 = w * .25;
  X.beginPath();
  X.moveTo(a * .5, -R1); X.lineTo(-a + R1, -R1);
  X.arc(-a + R1, 0, R1, -Math.PI / 2, Math.PI / 2, true);
  X.lineTo(a - R2, R1);
  X.arc(a - R2, w * .1, R2, Math.PI / 2, -Math.PI / 2, true);
  X.lineTo(-a * .6, -w * .3);
  X.arc(-a * .6, -w * .05, R3, -Math.PI / 2, Math.PI / 2, true);
  X.lineTo(a * .6, w * .2);
}
const F_NCLIP = 460;
shot(97.5, 99.0, (t, lt) => {
  X.fillStyle = '#F7E3EC'; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) ink(() => X.rect(0, i * 96, W, 48), PAL.pinkLt, { alpha: .35 });
  camBegin({ zoom: 1.04 + lt * .03, x: W / 2, y: 540 });
  // the idol, sinking as the pile rises around her
  const fillK = clamp(lt / 1.35);
  idolHead(W / 2, 560 + easeIn(fillK) * 120, 210, { bust: true, eyes: fillK > .55 ? 'spiral' : 'shock', look: [0, -.6], mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'o', sweat: .7, blush: .8 });
  // clips: spawn times spread over the shot, each falls onto a pile that rises from the bottom
  const cols = [PAL.blue, PAL.ink2, PAL.pink, PAL.blue];
  X.lineCap = 'round'; X.lineJoin = 'round';
  for (let i = 0; i < F_NCLIP; i++) {
    const r = k => hash(i * 9.13 + k * 1.7 + 5);
    const u = i / F_NCLIP, ts = 97.45 + Math.pow(u, .85) * 1.3 + r(1) * .12;
    const dt = t - ts; if (dt < 0) continue;
    const L = 120 + r(2) * 90, w = L * .3, restY = H + 60 - u * (H + 180) + sjit(i, 50);
    const x = r(3) * (W + 120) - 60, y0 = -140 - r(4) * 200;
    const y = Math.min(restY, y0 + 700 * dt + 3200 * dt * dt), landed = y >= restY;
    const rot = landed ? r(5) * TAU : r(5) * TAU + (restY - y) * .004 * (r(6) - .5);
    const col = cols[i % cols.length];
    X.save(); X.translate(x, y); X.rotate(rot);
    F_clip(L, w);
    X.translate(3, 5); X.strokeStyle = 'rgba(40,25,30,.28)'; X.lineWidth = 8; X.stroke();
    X.translate(-3, -5); X.strokeStyle = col; X.lineWidth = 7; X.stroke();
    X.strokeStyle = 'rgba(255,251,243,.75)'; X.lineWidth = 2; X.translate(-1.5, -1.5); X.stroke();
    X.restore();
  }
  camEnd();
  // counter
  const n = Math.floor(Math.pow(10, 3 + lt * 5.2));
  withT(80, 110, -.02, 1, () => {
    cut(() => rrect(-16, -48, 620, 72, 6), { fill: PAL.paperHi, lift: 5 });
    rtext('PAPERCLIPS  ' + n.toLocaleString('en-US'), 0, 0, { font: FONT.monoB(38), color: PAL.ink });
  });
  caption(t, { line: LY[29] });
}, { seed: 23 });

// ---------- F4: Killswitch guys on PTO, ----------
function F_chair(x, y, s, spin) {
  withT(x, y, 0, s, () => {
    const c = Math.cos(spin), sn = Math.sin(spin);
    // star base with five wheels
    for (let i = 0; i < 5; i++) {
      const a = spin + i / 5 * TAU, ex = Math.cos(a) * 130, ey = Math.sin(a) * 26;
      inkStroke(() => { X.beginPath(); X.moveTo(0, -30); X.lineTo(ex, -8 + ey); }, PAL.ink, 14);
      cut(() => { X.beginPath(); X.arc(ex, 6 + ey, 13, 0, TAU); }, { fill: PAL.ink2, lift: 3 });
    }
    cut(() => rrect(-11, -250, 22, 225, 6), { fill: '#5B5663', lift: 4 });
    // seat and backrest (the backrest swings around with the spin)
    cut(() => rrect(-150, -300, 300, 64, 28), { fill: PAL.ink2, lift: 8 });
    const bw = 250 * Math.max(.25, Math.abs(c)), bx = sn * 90;
    inkStroke(() => { X.beginPath(); X.moveTo(bx * .4, -260); X.lineTo(bx, -390); }, PAL.ink, 16);
    cut(() => rrect(bx - bw / 2, -690, bw, 320, 50), { fill: c > 0 ? PAL.ink2 : '#2A2730', lift: 10 });
    htGrad(() => rrect(bx - bw / 2, -690, bw, 320, 50), PAL.blueLt, bx, -690, bx + bw / 2, -370, { step: 12, maxR: 3.5, bounds: [bx - bw / 2, -690, bw, 320], alpha: .5, op: 'screen' });
  });
}
function F_killSwitch(x, y, t) {
  // housing with hazard stripes
  const hw = 420, hh = 170;
  cut(() => rrect(x - hw / 2, y - hh, hw, hh, 16), { fill: PAL.yellow, lift: 14 });
  X.save(); rrect(x - hw / 2, y - hh, hw, hh, 16); X.clip();
  for (let i = -8; i < 12; i++) ink(() => pathPoly([[x - hw / 2 + i * 60, y], [x - hw / 2 + i * 60 + 30, y], [x - hw / 2 + i * 60 + 120, y - hh], [x - hw / 2 + i * 60 + 90, y - hh]]), PAL.ink);
  X.restore();
  cut(() => rrect(x - 170, y - 118, 340, 70, 8), { fill: PAL.yellow, lift: 3, stroke: PAL.ink, sw: 4 });
  rtext('KILL SWITCH', x, y - 68, { font: FONT.blk(44), color: PAL.ink, align: 'center' });
  // the big red dome, glowing faintly as if waiting
  const glow = .5 + .5 * Math.sin(t * 3);
  htGrad(() => { X.beginPath(); X.arc(x, y - hh - 60, 260, 0, TAU); }, PAL.red, x, y - hh - 60 + 260, x, y - hh - 60, { step: 16, maxR: 5, bounds: [x - 260, y - hh - 320, 520, 520], alpha: .25 + glow * .2, gamma: 2 });
  cut(() => rrect(x - 150, y - hh - 30, 300, 36, 10), { fill: PAL.ink2, lift: 5 });
  const dome = () => { X.beginPath(); X.ellipse(x, y - hh - 30, 130, 120, 0, Math.PI, TAU); X.closePath(); };
  cut(dome, { fill: PAL.red, lift: 10 });
  htGrad(dome, '#8E1A16', x - 60, y - hh - 120, x + 120, y - hh - 30, { step: 11, maxR: 5, bounds: [x - 130, y - hh - 150, 260, 120] });
  inkStroke(() => { X.beginPath(); X.ellipse(x - 20, y - hh - 60, 80, 70, 0, -Math.PI * .92, -Math.PI * .6); }, 'rgba(255,251,243,.8)', 12);
  // flip-up safety cover, standing open, and a cobweb across the gap
  inkStroke(() => { X.beginPath(); X.moveTo(x + 150, y - hh - 20); X.lineTo(x + 205, y - hh - 330); X.lineTo(x + 30, y - hh - 360); X.lineTo(x - 20, y - hh - 170); }, 'rgba(157,178,230,.9)', 6);
  ink(() => pathPoly([[x + 150, y - hh - 20], [x + 205, y - hh - 330], [x + 30, y - hh - 360], [x - 20, y - hh - 170]]), 'rgba(157,178,230,.18)');
  const wc = [x + 150, y - hh - 20], sp = [[x + 205, y - hh - 330], [x + 90, y - hh - 340], [x + 60, y - hh - 140], [x + 115, y - hh - 95]];
  inkStroke(() => { X.beginPath(); sp.forEach(p => { X.moveTo(wc[0], wc[1]); X.lineTo(p[0], p[1]); }); }, 'rgba(255,255,255,.75)', 1.6);
  for (let k = 1; k <= 4; k++) inkStroke(() => { X.beginPath(); sp.forEach((p, i) => { const q = [lerp(wc[0], p[0], k / 5), lerp(wc[1], p[1], k / 5)]; if (i === 0) X.moveTo(q[0], q[1]); else X.quadraticCurveTo(lerp(wc[0], (p[0] + sp[i - 1][0]) / 2, k / 5 * .8), lerp(wc[1], (p[1] + sp[i - 1][1]) / 2, k / 5 * .8), q[0], q[1]); }); }, 'rgba(255,255,255,.6)', 1.2);
}
shot(99.0, 100.5, (t, lt) => {
  // a quiet office after hours: blue wall, paper desk
  X.fillStyle = '#AFC0E8'; X.fillRect(0, 0, W, H);
  for (let i = 0; i < 24; i++) ink(() => X.rect(i * 90, 0, 40, H), PAL.blueLt, { alpha: .35 });
  camBegin({ zoom: 1.0 + easeInOut(lt / 1.5) * .09, x: 900, y: 520 });
  X.fillStyle = '#8397CC'; X.fillRect(-200, 820, W + 400, 600);
  htGrad(() => X.rect(-200, 820, W + 400, 600), PAL.blue, 900, 820, 900, 1200, { step: 14, maxR: 6, bounds: [-200, 820, W + 400, 400], alpha: .6 });
  // wall clock, stopped at 5:00
  cut(() => { X.beginPath(); X.arc(290, 230, 110, 0, TAU); }, { fill: PAL.paperHi, lift: 10, stroke: PAL.ink, sw: 10 });
  for (let i = 0; i < 12; i++) inkStroke(() => { const a = i / 12 * TAU; X.beginPath(); X.moveTo(290 + Math.cos(a) * 82, 230 + Math.sin(a) * 82); X.lineTo(290 + Math.cos(a) * 94, 230 + Math.sin(a) * 94); }, PAL.ink, 5);
  inkStroke(() => { X.beginPath(); X.moveTo(290, 230); X.lineTo(290, 150); X.moveTo(290, 230); X.lineTo(290 + Math.cos(TAU * 5 / 12 - Math.PI / 2) * 55, 230 + Math.sin(TAU * 5 / 12 - Math.PI / 2) * 55); }, PAL.ink, 9);
  inkStroke(() => { const a = (t * .9) % TAU - Math.PI / 2; X.beginPath(); X.moveTo(290, 230); X.lineTo(290 + Math.cos(a) * 85, 230 + Math.sin(a) * 85); }, PAL.red, 3);
  // the desk
  cut(() => rrect(180, 640, 1260, 46, 6), { fill: PAL.paperHi, lift: 14 });
  cut(() => X.rect(220, 686, 26, 200), { fill: PAL.ink2, lift: 6 });
  cut(() => X.rect(1374, 686, 26, 200), { fill: PAL.ink2, lift: 6 });
  cut(() => rrect(1040, 686, 320, 180, 4), { fill: '#E4DCCB', lift: 8, stroke: 'rgba(0,0,0,.15)', sw: 2 });
  for (let k = 0; k < 2; k++) inkStroke(() => { X.beginPath(); X.moveTo(1170, 740 + k * 80); X.lineTo(1230, 740 + k * 80); }, PAL.ink, 6);
  // a coffee mug gone cold
  cut(() => rrect(1170, 560, 90, 82, 10), { fill: PAL.paperHi, lift: 6, stroke: PAL.ink, sw: 4 });
  inkStroke(() => { X.beginPath(); X.arc(1262, 598, 22, -Math.PI / 2, Math.PI / 2); }, PAL.ink, 6);
  F_killSwitch(640, 640, t);
  // the sticky note on the wall
  const sk = backOut(clamp((t - 99.36) / .3));
  if (sk > 0) sticky(1110, 330, ['OOO —', 'back monday'], { rot: .07, s: 1.15 * sk, size: 44 });
  // the empty chair drifting in a slow half turn
  F_chair(1560, 1010, .95, .9 + lt * .5);
  camEnd();
  caption(t, { line: LY[30] });
}, { seed: 24, inT: 'feed', inDur: .35 });

// ---------- F5: Now there's nowhere left to go. ----------
const F_NEWS = [
  ['evals saturated', 330, 250, 'mono', 44], ['Navier–Stokes: settled', 1400, 190, 'ui', 44], ['Erdős ✓ ✓ ✓', 390, 560, 'ui', 50],
  ['26% of R&D', 1530, 440, 'monoB', 52], ['RSI', 820, 170, 'monoB', 60], ['×10 / yr', 1420, 620, 'mono', 48],
  ['it’s so over', 250, 820, 'uiM', 40], ['we’re so back', 1660, 820, 'uiM', 40],
];
shot(100.5, 102.5, (t, lt) => {
  // an endless orange evening: paper bands to the horizon, a wet mirror floor
  const bands = ['#C4552A', '#D5602F', '#E8703A', '#EE8448', '#F6A378', '#FFC66B'];
  bands.forEach((c, i) => { X.fillStyle = c; X.fillRect(0, i * 110 - 20, W, 130); });
  htGrad(() => X.rect(0, 0, W, 700), PAL.red, W / 2, 700, W / 2, 0, { step: 18, maxR: 7, bounds: [0, 0, W, 700], alpha: .45 });
  camBegin({ zoom: lerp(1.3, 1.0, easeOut(lt / 2)), x: W / 2, y: 690 });
  // a low paper sun sinking behind him
  cut(() => { X.beginPath(); X.arc(W / 2 + 30, 700, 250, Math.PI, TAU); X.closePath(); }, { fill: PAL.yellow, lift: 0 });
  htGrad(() => { X.beginPath(); X.arc(W / 2 + 30, 700, 250, Math.PI, TAU); X.closePath(); }, PAL.orange, W / 2 + 30, 450, W / 2 + 30, 700, { step: 14, maxR: 6, bounds: [W / 2 - 230, 440, 520, 270], gamma: 2.2 });
  X.fillStyle = PAL.yellow; X.fillRect(-600, 690, W + 1200, 14);
  X.fillStyle = '#E8703A'; X.fillRect(-600, 704, W + 1200, 900);
  htGrad(() => X.rect(-600, 704, W + 1200, 900), PAL.orangeDk, W / 2, 704, W / 2, 1200, { step: 16, maxR: 5, bounds: [-600, 704, W + 1200, 600], alpha: .7 });
  for (let k = 0; k < 7; k++) inkStroke(() => { const y = 730 + k * k * 9; X.beginPath(); X.moveTo(W / 2 - 700 + k * 30, y); X.lineTo(W / 2 + 700 - k * 50, y); }, 'rgba(255,210,58,.5)', 3);
  // the kid: small, hunched, with a long shadow and a faint reflection
  ink(() => { X.beginPath(); X.ellipse(W / 2 + 280, 766, 360, 16, 0, 0, TAU); }, 'rgba(90,30,15,.45)');
  kid(W / 2 - 20, 764, .6, { look: clamp((t - 101.9) / .5) * .35 });
  camEnd();
  // the news drifts past him, tiny
  F_NEWS.forEach(([s, x, y, f, sz], i) => {
    const t0 = 100.55 + i * .16, a = clamp((t - t0) / .5); if (a <= 0) return;
    const dx = (x < W / 2 ? -1 : 1) * (t - t0) * 14 + Math.sin(t * .7 + i) * 8, dy = Math.sin(t * .9 + i * 2) * 10 - (t - t0) * 6;
    rtext(s, x + dx, y + dy, { font: FONT[f](sz), color: i === 4 ? PAL.paperHi : PAL.ink, align: 'center', alpha: a * .9, op: 'source-over', mis: i === 4 ? [3, 2, PAL.red] : null });
  });
  // the line, small and tender, under him
  const ws = wordTimes(LY[31]), fnt = FONT.serifI(56), sp = textW(' ', fnt), wd = ws.map(w => textW(w.w, fnt)), tot = wd.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  let x = W / 2 - tot / 2;
  ws.forEach((w, i) => { const a = easeOut((t - w.t + .03) / .3); if (a > 0) rtext(w.w, x, 935 + (1 - a) * 14, { font: fnt, color: PAL.ink, alpha: a }); x += wd[i] + sp; });
}, { seed: 25, inT: 'tear', inDur: .5 });

// ---------- F6: Too late now, we lit the fuse. ----------
const F_FM = 64, F_FP = 2 * ((W - 2 * F_FM) + (H - 2 * F_FM));
function F_fusePos(d) {
  // the frame border as a path, clockwise from the bottom-left corner: up, across the top, down, back along the bottom
  const w = W - 2 * F_FM, h = H - 2 * F_FM, m = F_FM;
  d = ((d % F_FP) + F_FP) % F_FP;
  if (d < h) return [m, H - m - d, -Math.PI / 2];
  d -= h; if (d < w) return [m + d, m, 0];
  d -= w; if (d < h) return [W - m, m + d, Math.PI / 2];
  d -= h; return [W - m - d, H - m, Math.PI];
}
// A radial halftone glow: dots shrink away from the centre (screened onto the dark sheet).
function F_glow(x, y, R, col, t) {
  X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = col; X.beginPath();
  const st = 15;
  for (let gy = Math.floor((y - R) / st) * st; gy <= y + R; gy += st) for (let gx = Math.floor((x - R) / st) * st; gx <= x + R; gx += st) {
    const k = 1 - Math.hypot(gx - x, gy - y) / R; if (k <= 0) continue;
    const r = 6.5 * k * k; if (r < .5) continue; X.moveTo(gx + r, gy); X.arc(gx, gy, r, 0, TAU);
  }
  X.globalAlpha = .7; X.fill(); X.restore();
}
const F_fuseD = t => { const k = clamp((t - 102.62) / 2.66); return F_FP * (k * .45 + k * k * .55); };
function F_fusePath(d0, d1) {
  X.beginPath(); const st = 24;
  for (let d = d0; d <= d1; d += st) { const p = F_fusePos(Math.min(d, F_FP - .01)); if (d === d0) X.moveTo(p[0], p[1]); else X.lineTo(p[0], p[1]); }
  const p = F_fusePos(Math.min(d1, F_FP - .01)); X.lineTo(p[0], p[1]);
}
shot(102.5, 105.4, (t, lt) => {
  X.fillStyle = '#16224F'; X.fillRect(0, 0, W, H);
  htGrad(() => X.rect(0, 0, W, H), PAL.blue, W / 2, H / 2, W / 2, -200, { step: 20, maxR: 8, bounds: [0, 0, W, H], op: 'source-over', alpha: .6 });
  const d = F_fuseD(t), sp = F_fusePos(d);
  // spark light on the page
  F_glow(sp[0], sp[1], 300, PAL.orange, t);
  // the unburnt fuse: a twisted paper cord
  if (d < F_FP) {
    X.save(); X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 8; X.shadowOffsetY = 5;
    F_fusePath(d, F_FP); X.strokeStyle = '#E4DCCB'; X.lineWidth = 18; X.lineJoin = 'round'; X.stroke(); X.restore();
    F_fusePath(d, F_FP); X.save(); X.strokeStyle = PAL.orangeDk; X.lineWidth = 18; X.setLineDash([5, 13]); X.stroke(); X.restore();
  }
  // the burnt trail: black char with an ember glow just behind the spark
  if (d > 0) {
    F_fusePath(0, d); X.save(); X.strokeStyle = '#0D0B10'; X.lineWidth = 10; X.lineJoin = 'round'; X.stroke(); X.strokeStyle = 'rgba(190,180,170,.55)'; X.lineWidth = 4; X.setLineDash([3, 9]); X.stroke(); X.restore();
    F_fusePath(Math.max(0, d - 260), d); X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 7; X.globalAlpha = .9; X.stroke(); X.restore();
    F_fusePath(Math.max(0, d - 90), d); X.save(); X.strokeStyle = PAL.yellow; X.lineWidth = 5; X.stroke(); X.restore();
  }
  // a spent match where it was lit
  withT(F_FM + 80, H - F_FM - 40, -.5, 1, () => {
    cut(() => rrect(-8, -150, 16, 150, 4), { fill: '#E4DCCB', lift: 4 });
    cut(() => { X.beginPath(); X.ellipse(0, -154, 13, 19, 0, 0, TAU); }, { fill: PAL.ink, lift: 3 });
  });
  for (let k = 0; k < 3; k++) inkStroke(() => { const y0 = H - F_FM - 230 - k * 60; X.beginPath(); X.moveTo(F_FM + 150 + Math.sin(t * 2 + k) * 14, y0); X.quadraticCurveTo(F_FM + 180 + Math.sin(t * 2.4 + k) * 24, y0 - 40, F_FM + 160, y0 - 80); }, 'rgba(242,237,227,.25)', 6);
  // sparks shed from the fuse: emitted every 30 ms, flying off and falling
  const e0 = Math.floor(t / .03);
  for (let e = e0; e > e0 - 26; e--) {
    const te = e * .03, age = t - te; if (te < 102.62 || age < 0) continue;
    const p = F_fusePos(F_fuseD(te)), a = hash(e * 1.7) * TAU, v = 160 + hash(e * 3.3) * 420;
    const x = p[0] + Math.cos(a) * v * age, y = p[1] + Math.sin(a) * v * age + 900 * age * age, sz = 16 * (1 - age / .78) * (.5 + hash(e) * .8);
    if (sz < 1.5) continue;
    withT(x, y, age * 9 + e, 1, () => { X.fillStyle = [PAL.yellow, PAL.orange, PAL.paperHi][e % 3]; sparkPath(0, 0, sz, 6, .28, 0, .6); X.fill(); });
  }
  // the spark itself: the six-ray asterisk, spinning
  const pulseK = .85 + .15 * Math.sin(t * 40);
  withT(sp[0], sp[1], t * 9, pulseK, () => {
    cut(() => sparkPath(0, 0, 66, 6, .24, 0, .6), { fill: PAL.orange, lift: 5 });
    cut(() => sparkPath(0, 0, 40, 6, .28, .5, .7), { fill: PAL.yellow, lift: 3 });
    X.fillStyle = PAL.paperHi; X.beginPath(); X.arc(0, 0, 9, 0, TAU); X.fill();
  });
  if (d >= F_FP) sparkBurst(F_FM, H - F_FM, t, 105.28, { n: 12, r: 260, size: 34 });
  // handwritten-feeling type, written on letter by letter as sung
  const ws = wordTimes(LY[32]);             // Too late now, we lit the fuse.
  const rows = [[0, 1, 2], [3, 4, 5, 6]], ys = [420, 700], sizes = [190, 190];
  camBegin({ zoom: 1 + lt * .012, x: W / 2, y: 540, rot: -.03 });
  rows.forEach((row, ri) => {
    const fnt = FONT.serifI(sizes[ri]), words = row.map(i => ws[i].w), sp2 = sizes[ri] * .24;
    const wds = words.map(w => textW(w, fnt)), tot = wds.reduce((p, q) => p + q, 0) + sp2 * (words.length - 1);
    let x = W / 2 - tot / 2 + (ri ? 60 : -60);
    row.forEach((wi, j) => {
      const w = ws[wi], L = layout(w.w, fnt, 0), dur = Math.max(.18, (w.end - w.t) * .9), fuse = wi === 6;
      L.forEach((l, li) => {
        const k = clamp((t - w.t - li / L.length * dur) / .08); if (k <= 0) return;
        const bl = sjit(wi * 13 + li, 7) + Math.sin(li * 1.3 + wi) * 4, rr = sjit(wi * 7 + li + 3, .06);
        withT(x + l.x + l.w / 2, ys[ri] + bl, rr, lerp(.8, 1, k), () =>
          F_txt(l.ch, 0, 0, { font: fnt, align: 'center', color: fuse ? PAL.yellow : PAL.paperHi, mis: [6, 5, fuse ? PAL.red : PAL.orange], alpha: k }));
      });
      if (fuse) {                                   // a wavy underline drawn after "fuse."
        const k = easeOut((t - w.t - dur) / .45);
        if (k > 0) inkStroke(() => { X.beginPath(); for (let q = 0; q <= 40 * k; q++) { const u = q / 40; X.lineTo(x - 10 + u * (wds[j] + 20), ys[ri] + 40 + Math.sin(u * 14) * 7 + sjit(q, 2)); } }, PAL.orange, 9);
      }
      x += wds[j] + sp2;
    });
  });
  camEnd();
}, { seed: 26, dark: true });

// ---------- F7: Orthogonality thesis blues. (riser from 108.4 into the drop) ----------
function F_mic(x, y, s, floorY) {
  // a vintage ribbon mic on a stand
  inkStroke(() => { X.beginPath(); X.moveTo(x, y + s * .9); X.lineTo(x + s * .15, floorY - 10); }, PAL.ink, s * .09);
  cut(() => { X.beginPath(); X.ellipse(x + s * .15, floorY - 4, s * .7, s * .13, 0, 0, TAU); }, { fill: PAL.ink, lift: 4 });
  inkStroke(() => { X.beginPath(); X.arc(x, y, s * .72, Math.PI * .15, Math.PI * .85); }, PAL.ink, s * .08);
  const body = () => rrect(x - s * .45, y - s * .75, s * .9, s * 1.5, s * .45);
  cut(body, { fill: PAL.paperHi, lift: 6, stroke: PAL.ink, sw: s * .06 });
  htGrad(body, PAL.blueLt, x - s * .4, y, x + s * .45, y, { step: s * .12, maxR: s * .045, bounds: [x - s * .5, y - s * .8, s, s * 1.6] });
  X.save(); body(); X.clip();
  for (let k = -5; k <= 5; k++) inkStroke(() => { X.beginPath(); X.moveTo(x - s * .5, y + k * s * .13); X.lineTo(x + s * .5, y + k * s * .13); }, 'rgba(29,27,32,.55)', s * .03);
  X.restore();
  cut(() => rrect(x - s * .5, y - s * .08, s, s * .16, s * .05), { fill: PAL.ink2, lift: 2 });
}
shot(105.4, 109.4, (t, lt) => {
  const rk = clamp((t - 108.4) / 1.0), rise = easeIn(rk);      // the riser
  const vib = k => jit(k, rise * 9);                              // paper vibration for type
  // the club: near-black blue with a faint brick halftone
  X.fillStyle = '#0B1128'; X.fillRect(0, 0, W, H);
  X.save(); X.globalAlpha = .5;
  for (let j = 0; j < 20; j++) for (let i = 0; i < 18; i++) { X.fillStyle = hash(i * 7 + j * 13) < .5 ? '#121B3C' : '#0F1734'; X.fillRect(i * 120 + (j % 2) * 60 - 60, j * 56, 112, 50); }
  X.restore();
  const ox = 1400, oy = 770;                                      // where the axes cross
  camBegin({ zoom: 1.02 + lt * .012 + rise * .16, x: lerp(W / 2, ox - 200, rise * .5), y: lerp(540, oy - 120, rise * .5), shake: rise * 16, rot: jit(1, rise * .012) });
  // spotlight fixtures
  cut(() => rrect(ox - 70, -40, 140, 90, 20), { fill: PAL.ink2, lift: 8 });
  cut(() => rrect(-40, oy - 70, 90, 140, 20), { fill: PAL.ink2, lift: 8 });
  // the two beams are paper cut-outs of light: GOALS ↑ (vertical) and INTELLIGENCE → (horizontal)
  const nar = 1 - rise * .35, flick = .92 + .08 * Math.sin(t * 17) * rise;
  const vBeam = () => pathPoly([[ox - 80 * nar, 40], [ox + 80 * nar, 40], [ox + 240 * nar, 880], [ox - 240 * nar, 880]]);
  const hBeam = () => pathPoly([[40, oy - 170 * nar], [W + 60, oy - 200 * nar], [W + 60, oy + 170 * nar], [40, oy + 125 * nar]]);
  X.save(); X.globalAlpha = .82 * flick; cut(vBeam, { fill: '#DCE6FF', lift: 0 }); X.restore();
  htGrad(vBeam, PAL.blue, ox, 880, ox, 40, { step: 13, maxR: 5, bounds: [ox - 260, 40, 520, 840], alpha: .55 });
  X.save(); X.globalAlpha = .9 * flick; cut(hBeam, { fill: '#FFF4DE', lift: 0 }); X.restore();
  htGrad(hBeam, PAL.pinkLt, W, oy, 40, oy, { step: 13, maxR: 5, bounds: [40, oy - 200, W, 380], alpha: .8 });
  ink(() => { X.beginPath(); X.ellipse(ox, oy, 250 * nar, 150 * nar, 0, 0, TAU); }, 'rgba(255,251,243,.55)', { op: 'source-over' });
  // floor line and axis ticks
  X.fillStyle = '#070A18'; X.fillRect(-300, 880, W + 600, 500);
  ink(() => { X.beginPath(); X.ellipse(ox, 884, 300, 30, 0, 0, TAU); }, 'rgba(220,230,255,.35)', { op: 'source-over' });
  for (let i = 1; i < 12; i++) inkStroke(() => { X.beginPath(); X.moveTo(ox + i * 44, oy + 10); X.lineTo(ox + i * 44, oy - 10); }, 'rgba(29,27,32,.55)', 3);
  for (let i = 1; i < 14; i++) inkStroke(() => { X.beginPath(); X.moveTo(ox - 10, oy - i * 50); X.lineTo(ox + 10, oy - i * 50); }, 'rgba(29,27,32,.4)', 3);
  inkStroke(() => { X.beginPath(); X.moveTo(W - 90, oy - 26); X.lineTo(W - 50, oy); X.lineTo(W - 90, oy + 26); }, PAL.ink, 6);
  inkStroke(() => { X.beginPath(); X.moveTo(ox - 26, 118); X.lineTo(ox, 78); X.lineTo(ox + 26, 118); }, PAL.ink, 6);
  rtext('INTELLIGENCE', W - 110, oy - 105, { font: FONT.monoB(34), color: PAL.ink, align: 'right' });
  rtext('GOALS', ox, 175, { font: FONT.monoB(34), color: PAL.ink, align: 'center' });
  // the idol at the origin, singing into the vintage mic
  const s = 38, hip = oy - 100, eyesOpen = t > 108.4;
  const pose = { ...PZ.mic, lean: Math.sin(t * 1.1) * .04, head: -.05 + Math.sin(t * .9) * .04, hy: Math.sin(t * 2.2) * .04 };
  idolBody(ox, hip, s, pose, { face: { eyes: eyesOpen ? 'open' : 'closed', look: [-.3, 0], brow: -1, mouth: clamp(VOX(t) * 1.3 - .2), mouthShape: 'o', blush: .9, mic: false } });
  F_mic(ox - 64, hip - s * 3.9, 44, 880);
  camEnd();
  // TENDER: Orthogonality / thesis on the dark, blues in blue ink on the light beam
  const ws = wordTimes(LY[33]);
  { const w = ws[0], fnt = FONT.serifI(200), L = layout('Orthogonality', fnt, 0);
    L.forEach((l, i) => { const k = easeOut((t - w.t - .2 - i * .15) / .35); if (k <= 0) return;
      withT(90 + l.x + l.w / 2 + vib(i), 300 + (1 - k) * 30 + vib(i + 50), 0, 1, () => F_txt(l.ch, 0, 0, { font: fnt, align: 'center', color: PAL.paperHi, mis: [7, 6, PAL.blue], misA: 1, alpha: k })); }); }
  { const w = ws[1], fnt = FONT.serifI(170), L = layout('thesis', fnt, 0);
    L.forEach((l, i) => { const k = easeOut((t - w.t - i * .05) / .3); if (k <= 0) return;
      withT(430 + l.x + l.w / 2 + vib(i + 20), 500 + (1 - k) * 30 + vib(i + 70), 0, 1, () => F_txt(l.ch, 0, 0, { font: fnt, align: 'center', color: PAL.paperHi, mis: [6, 5, PAL.blue], misA: 1, alpha: k })); }); }
  { const w = ws[2], fnt = FONT.serifI(330), L = layout('blues.', fnt, 0);
    L.forEach((l, i) => { const k = easeOut((t - w.t - i * .04) / .3); if (k <= 0) return;
      withT(140 + l.x + l.w / 2 + vib(i + 90), oy + 95 + (1 - k) * 40 + vib(i + 99), (1 - k) * .1, 1, () => rtext(l.ch, 0, 0, { font: fnt, align: 'center', color: PAL.blue, mis: [8, 6, PAL.pink], alpha: k })); }); }
  // the riser: the sheet tightens, misregisters and buzzes toward the drop
  if (rk > 0) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    const g = rise * 90;
    X.fillStyle = '#05070F'; X.fillRect(0, 0, W, g * .6); X.fillRect(0, H - g * .6, W, g * .6);
    X.restore();
    misreg(rise, 16, 8, PAL.pink);
  }
}, { seed: 27, dark: true, inT: 'flip', inDur: .5 });
