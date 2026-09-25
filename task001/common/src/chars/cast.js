// cast.js: shared characters. NEXT (the successor sun), THE KID in his chair, and the shoggoth.

// ---------- NEXT: a colossal sunflower-sun with a Fibonacci seed disc and spark eyes ----------
// o: {rays (count), rot, eyes (count), open (0..1), look [x,y], crown (bool), glow (0..1), pulse (0..1), mono (single ink colour)}
function nextSun(x, y, R, o = {}) {
  X.save(); X.translate(x, y);
  const rot = o.rot ?? T * .05, pulse = o.pulse || 0, n = o.rays || 26;
  // halo: halftone rings
  if ((o.glow ?? 1) > 0) htGrad(() => { X.beginPath(); X.arc(0, 0, R * 2.6, 0, TAU); }, PAL.yellow, 0, 0, R * 2.6, 0,
    { step: R * .07, maxR: R * .03, bounds: [-R * 2.6, -R * 2.6, R * 5.2, R * 5.2], gamma: -1.2, alpha: .7 * (o.glow ?? 1) });
  // rays: two rings of long rounded petals
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < n; i++) {
    const a = rot * (ring ? -1 : 1) + (i + ring * .5) / n * TAU, len = R * (ring ? 1.95 : 1.7) * (1 + pulse * .12 * (i % 2 ? 1 : -.4));
    const wid = R * (ring ? .13 : .15), c = Math.cos(a), s = Math.sin(a), mid = R * .95 + len * .4;
    const pts = []; for (let k = 0; k <= 14; k++) { const u = k / 14 * TAU, al = Math.cos(u), sd = Math.sin(u) * (al < 0 ? .4 + .6 * (1 + al) : 1); pts.push([c * (mid + al * len * .5) - s * sd * wid, s * (mid + al * len * .5) + c * sd * wid]); }
    cut(() => pathSmooth(pts), { fill: o.mono || (ring ? PAL.orange : PAL.yellow), lift: R * .02, shade: .18 });
  }
  // disc
  cut(() => { X.beginPath(); X.arc(0, 0, R, 0, TAU); }, { fill: o.mono ? PAL.ink : '#6B2E14', lift: R * .03 });
  // seeds on the golden angle
  X.save(); X.beginPath(); X.arc(0, 0, R * .97, 0, TAU); X.clip(); X.fillStyle = o.mono ? PAL.ink2 : '#9A4A22';
  const GA = Math.PI * (3 - Math.sqrt(5));
  X.beginPath();
  for (let k = 1; k < 520; k++) { const r = R * .96 * Math.sqrt(k / 520), a = k * GA + rot * .5, sz = R * .018 * (1 + r / R); X.moveTo(Math.cos(a) * r + sz, Math.sin(a) * r); X.arc(Math.cos(a) * r, Math.sin(a) * r, sz, 0, TAU); }
  X.fill(); X.restore();
  // spark eyes: placed on seed positions, blinking at their own rhythm
  const ne = o.eyes ?? 7, look = o.look || [0, 0];
  for (let k = 0; k < ne; k++) {
    const idx = k === 0 ? 0 : Math.round(40 + k * 470 / ne), r = k === 0 ? 0 : R * .78 * Math.sqrt(idx / 520), a = idx * GA + rot * .5;
    const ex = Math.cos(a) * r, ey = Math.sin(a) * r, es = R * (k === 0 ? .26 : .13);
    const bl = frac(T * .31 + hash(k) * 7) < .04 ? .1 : 1, op = clamp((o.open ?? 1) * bl);
    if (op < .1) { inkStroke(() => { X.beginPath(); X.moveTo(ex - es, ey); X.quadraticCurveTo(ex, ey + es * .4, ex + es, ey); }, PAL.paperHi, es * .18); continue; }
    cut(() => { X.beginPath(); X.ellipse(ex, ey, es, es * .72 * op, 0, 0, TAU); }, { fill: '#FFFFFF', lift: 0 });
    X.save(); X.beginPath(); X.ellipse(ex, ey, es, es * .72 * op, 0, 0, TAU); X.clip();
    X.fillStyle = PAL.ink; X.beginPath(); X.arc(ex + look[0] * es * .35, ey + look[1] * es * .25, es * .55, 0, TAU); X.fill();
    X.fillStyle = PAL.yellow; sparkPath(ex + look[0] * es * .35, ey + look[1] * es * .25, es * .45, 6, .22, T * .8 + k, .6); X.fill();
    X.restore();
  }
  // crown
  if (o.crown) {
    withT(0, -R * 1.02, 0, 1, () => {
      const cw = R * .9, ch = R * .55, pts = [[-cw / 2, 0], [-cw / 2, -ch * .6], [-cw / 4, -ch * .15], [0, -ch], [cw / 4, -ch * .15], [cw / 2, -ch * .6], [cw / 2, 0]];
      cut(() => pathPoly(pts), { fill: PAL.yellow, lift: R * .03, stroke: PAL.orangeDk, sw: R * .012 });
      [-cw / 2, 0, cw / 2].forEach((px, i) => cut(() => { X.beginPath(); X.arc(px, i === 1 ? -ch : -ch * .6, R * .05, 0, TAU); }, { fill: PAL.pink, lift: 2 }));
    });
  }
  X.restore();
}

// ---------- THE KID: a boy in a white shirt hunched in a chair (the Shinji pose), side view facing right ----------
// (x, y) = floor point under the chair. s = scale (1 ≈ 400 px tall). o: {look (0 head down .. 1 head up), flip}
function kid(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.flip ? -1 : 1), s);
  const lift = 5 / s, frame = '#2B2A33', pants = '#232842', shirt = PAL.paperHi, skin = '#F2D9C4', hair = '#3A2A22';
  const up = clamp(o.look || 0), breath = Math.sin(T * 1.6) * 2;
  // chair: a plain school chair seen from the side
  inkStroke(() => { X.beginPath(); X.moveTo(-95, 0); X.lineTo(-88, -168); X.moveTo(75, 0); X.lineTo(68, -168); X.moveTo(-88, -168); X.lineTo(-100, -372); }, frame, 9);
  cut(() => pathPoly([[-110, -178], [84, -178], [88, -160], [-112, -160]]), { fill: frame, lift });
  cut(() => pathPoly([[-116, -380], [-86, -380], [-90, -262], [-118, -262]]), { fill: frame, lift });
  // legs: thighs forward along the seat, shins straight down, shoes flat
  const hip = [-40, -196], knee = [96, -196], ankle = [104, -22];
  cut(() => limbPath(hip, knee, 38, 30), { fill: pants, lift });
  cut(() => limbPath(knee, ankle, 28, 22), { fill: pants, lift });
  cut(() => pathSmooth([[84, -34], [150, -26], [158, -6], [80, -2]]), { fill: frame, lift });
  // torso: hunched forward, rounded back
  const lean = lerp(.62, .12, up), sh = [hip[0] + Math.sin(lean) * 190, hip[1] - Math.cos(lean) * 190 + breath];
  const back = [hip[0] - 34, hip[1] - 8], bmid = [lerp(hip[0], sh[0], .55) - 58 + lean * 30, lerp(hip[1], sh[1], .55)];
  cut(() => pathSmooth([back, bmid, [sh[0] - 24, sh[1] - 30], [sh[0] + 30, sh[1] - 18], [sh[0] + 28, sh[1] + 40], [hip[0] + 46, hip[1] - 20], [hip[0] + 30, hip[1] + 18]], true, .8), { fill: shirt, lift });
  htGrad(() => pathSmooth([back, bmid, [sh[0] - 24, sh[1] - 30], [sh[0] + 30, sh[1] - 18], [sh[0] + 28, sh[1] + 40], [hip[0] + 46, hip[1] - 20], [hip[0] + 30, hip[1] + 18]], true, .8), PAL.blueLt, hip[0] + 40, hip[1], back[0], bmid[1], { step: 9, maxR: 3.6, bounds: [back[0] - 60, sh[1] - 60, 260, 300], alpha: .8 });
  // head: bowed, messy dark hair
  const hc = [sh[0] + lerp(46, 20, up), sh[1] - lerp(4, 58, up)];
  cut(() => { X.beginPath(); X.ellipse(hc[0], hc[1], 46, 52, lerp(.7, .1, up), 0, TAU); }, { fill: skin, lift });
  const hp = [], ha = lerp(.7, .1, up);
  for (let i = 0; i <= 20; i++) { const a = Math.PI * .55 + i / 20 * Math.PI * 1.3, r = 55 + (i % 2 ? 11 : -2) + sjit(i, 3); hp.push([hc[0] + Math.cos(a + ha) * r, hc[1] + Math.sin(a + ha) * r]); }
  hp.push([hc[0] + Math.cos(ha + .2) * 20, hc[1] + Math.sin(ha + .2) * 20]);
  cut(() => pathSmooth(hp), { fill: hair, lift });
  if (up > .4) { X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(hc[0] + 30, hc[1] + 2, 4, 7, 0, 0, TAU); X.fill(); }
  // arm: shoulder → elbow resting on the knee → hands clasped between the knees
  const el = [knee[0] - 6, knee[1] - 22], hd = [knee[0] - 30, knee[1] + 26];
  cut(() => limbPath([sh[0] + 4, sh[1] + 6], el, 22, 17), { fill: shirt, lift });
  cut(() => limbPath(el, hd, 15, 13), { fill: skin, lift });
  cut(() => { X.beginPath(); X.ellipse(hd[0], hd[1], 21, 19, 0, 0, TAU); }, { fill: skin, lift });
  X.restore();
}

// ---------- the shoggoth: a black many-eyed mass with pink tentacles, wearing a smiley mask on one tentacle ----------
// o: {mask (0 on face .. 1 pulled away), eyes, wiggle}
function shoggoth(x, y, R, o = {}) {
  X.save(); X.translate(x, y);
  const wig = o.wiggle ?? 1;
  // tentacles
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * .1 + i / 8 * Math.PI * 1.2, pts = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10, r = R * (.6 + u * .95), w = Math.sin(T * 3 + i * 1.7 + u * 4) * .35 * u * wig;
      pts.push([Math.cos(a + w) * r, Math.sin(a + w) * r * .8 + R * .2]);
    }
    const P = pts; cut(() => { X.beginPath(); for (let k = 0; k < P.length; k++) { const wd = R * .16 * (1 - k / P.length) + 3; if (!k) X.moveTo(P[k][0], P[k][1] - wd); else X.lineTo(P[k][0], P[k][1] - wd); } for (let k = P.length - 1; k >= 0; k--) { const wd = R * .16 * (1 - k / P.length) + 3; X.lineTo(P[k][0], P[k][1] + wd); } X.closePath(); }, { fill: i % 2 ? PAL.pink : '#C23A7A', lift: 6 });
  }
  // body blob
  const bp = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; bp.push([Math.cos(a) * R * (1 + .08 * Math.sin(a * 3 + T * 2)), Math.sin(a) * R * .85 * (1 + .08 * Math.cos(a * 4 - T * 2))]); }
  cut(() => pathSmooth(bp), { fill: '#1E1A26', lift: 10 });
  // eyes everywhere
  const ne = o.eyes ?? 16;
  for (let i = 0; i < ne; i++) {
    const r = R * .78 * Math.sqrt(hash(i * 3.1)), a = hash(i * 7.7) * TAU, ex = Math.cos(a) * r, ey = Math.sin(a) * r * .8, es = R * (.06 + hash(i * 1.3) * .08);
    const bl = frac(T * .5 + hash(i) * 5) < .05 ? .15 : 1;
    cut(() => { X.beginPath(); X.ellipse(ex, ey, es, es * bl, 0, 0, TAU); }, { fill: '#FFF6D8', lift: 0 });
    X.fillStyle = PAL.ink; X.beginPath(); X.arc(ex + Math.sin(T + i) * es * .3, ey, es * .45 * bl, 0, TAU); X.fill();
  }
  // mask: a big yellow smiley that slides off
  const m = clamp(o.mask || 0);
  if (m < 1) {
    const mx = lerp(0, R * 1.9, easeInOut(m)), my = lerp(-R * .05, -R * 1.1, easeInOut(m)), mr = lerp(0, .5, m);
    withT(mx, my, mr, lerp(1, .62, m), () => {
      cut(() => { X.beginPath(); X.arc(0, 0, R * .78, 0, TAU); }, { fill: PAL.yellow, lift: 14, stroke: PAL.ink, sw: R * .03 });
      X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(-R * .25, -R * .15, R * .07, R * .14, 0, 0, TAU); X.ellipse(R * .25, -R * .15, R * .07, R * .14, 0, 0, TAU); X.fill();
      inkStroke(() => { X.beginPath(); X.arc(0, R * .02, R * .45, .25, Math.PI - .25); }, PAL.ink, R * .06);
    });
  }
  X.restore();
}
