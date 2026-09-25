// props.js: shared props: the P(doom) meter, xerox headlines, posts, tape, rubber stamps, sticky notes,
// confetti, spark bursts and paper transitions.

// ---------- P(doom) meter: a paper thermometer. v = 0..100 ----------
function meterColor(v) { return v < 30 ? PAL.orange : v < 60 ? PAL.pink : v < 85 ? PAL.violet : PAL.red; }
function meter(x, y, s, v, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); X.rotate(o.rot || 0);
  const col = meterColor(v), h = 420;
  cut(() => rrect(-46, -h, 92, h + 10, 46), { fill: PAL.paperHi, lift: 8, stroke: PAL.ink, sw: 4 });
  cut(() => { X.beginPath(); X.arc(0, 60, 78, 0, TAU); }, { fill: PAL.paperHi, lift: 8, stroke: PAL.ink, sw: 4 });
  const fh = (h - 40) * clamp(v / 100);
  ink(() => { X.beginPath(); X.arc(0, 60, 62, 0, TAU); }, col, { op: 'source-over' });
  if (fh > 0) ink(() => rrect(-28, 20 - fh, 56, fh + 40, 28), col, { op: 'source-over' });
  htGrad(() => rrect(-28, 20 - fh, 56, fh + 40, 28), PAL.ink, 20, 0, -30, 0, { step: 9, maxR: 4, bounds: [-30, -h, 60, h + 60], alpha: .25 });
  for (let i = 1; i < 10; i++) inkStroke(() => { X.beginPath(); X.moveTo(-46, -i * (h - 40) / 10 + 20); X.lineTo(-24, -i * (h - 40) / 10 + 20); }, PAL.ink, 3);
  if (o.crack) inkStroke(() => { X.beginPath(); X.moveTo(20, -h + 30); X.lineTo(-6, -h + 90); X.lineTo(18, -h + 130); X.lineTo(-10, -h + 200 * o.crack); }, PAL.ink, 3);
  X.fillStyle = PAL.paperHi; X.font = FONT.logo(34); X.textAlign = 'center'; X.textBaseline = 'middle';
  X.fillText(v >= 99.9 ? '99.9' : Math.floor(v), 0, 62);
  X.restore();
  if (o.label !== false) withT(x, y - (h + 40) * s, o.rot || 0, s, () => rtext('P(DOOM)', 0, 0, { font: FONT.logo(40), align: 'center', color: PAL.ink }));
}
// P(doom) value during the four chorus windows (steps up on each beat).
const METER_WIN = [[23, 38.5, 8, 34], [59, 73, 34, 61], [95.4, 109.4, 61, 86], [123.5, 137.4, 86, 99.9]];
function pdoomAt(t) {
  let v = 5;
  for (const [a, b, v0, v1] of METER_WIN) {
    if (t < a) break;
    const n = Math.max(1, Math.round((b - a) / BEAT)), p = clamp((t - a) / (b - a)) * n;
    v = t >= b ? v1 : lerp(v0, v1, (Math.floor(p) + easeOut(clamp(frac(p) * 4))) / n);
  }
  return v;
}

// ---------- tape, stamps, notes ----------
function tape(x, y, w, rot = 0, col = 'rgba(236,220,170,.78)') {
  withT(x, y, rot, 1, () => {
    const h = w * .28, pts = [[-w / 2, -h / 2]]; for (let i = 1; i <= 6; i++) pts.push([-w / 2 + w * i / 6, -h / 2 + sjit(i + x, 1.5)]);
    pts.push([w / 2 + sjit(x, 3), 0]); for (let i = 6; i >= 0; i--) pts.push([-w / 2 + w * i / 6, h / 2 + sjit(i + y, 1.5)]); pts.push([-w / 2 + sjit(y, 3), 0]);
    X.save(); pathPoly(pts); X.fillStyle = col; X.shadowColor = 'rgba(0,0,0,.12)'; X.shadowBlur = 3; X.shadowOffsetY = 1; X.fill(); X.restore();
  });
}
// Rubber stamp: slams down at t0 (scale 1.6 → 1, rotated), rough red ink.
function stamp(x, y, text, t, t0, o = {}) {
  if (t < t0) return;
  const k = clamp((t - t0) / .12), s = lerp(1.7, 1, easeIn(k)) * (o.s || 1), col = o.color || PAL.red, sz = o.size || 90;
  const m = X.getTransform();
  const L = onLayer('_stamp', () => {
    X.setTransform(m);
    withT(x, y, (o.rot ?? -.14), s, () => {
      X.font = o.font || FONT.blk(sz); X.textAlign = 'center'; X.textBaseline = 'middle';
      const lines = String(text).split('\n'), lh = sz * 1.05;
      const w = Math.max(...lines.map(l => X.measureText(l).width)) + sz * .7, h = lh * lines.length + sz * .45;
      X.strokeStyle = col; X.lineWidth = sz * .09; X.beginPath(); X.roundRect(-w / 2, -h / 2, w, h, sz * .18); X.stroke();
      X.lineWidth = sz * .03; X.beginPath(); X.roundRect(-w / 2 + sz * .12, -h / 2 + sz * .12, w - sz * .24, h - sz * .24, sz * .1); X.stroke();
      X.fillStyle = col; lines.forEach((l, i) => X.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + sz * .04));
      // worn rubber: knock speckles out of the ink
      X.globalCompositeOperation = 'destination-out'; X.globalAlpha = .6;
      X.drawImage(TEX.speckle, Math.abs(x * 3) % 300, Math.abs(y * 7) % 300, 260, 260, -w / 2, -h / 2, w, h);
    });
  });
  blit(L, clamp(k * 2) * (o.alpha ?? 1), o.op || 'multiply');
}
function sticky(x, y, lines, o = {}) {
  withT(x, y, o.rot ?? .05, o.s || 1, () => {
    cut(() => pathPoly([[-130, -120], [130, -124], [134, 126], [-128, 122]]), { fill: o.color || '#FFE66B', lift: 6 });
    X.fillStyle = PAL.ink; X.font = font(F.serif, o.size || 40, 400, 'italic'); X.textAlign = 'center'; X.textBaseline = 'middle';
    lines.forEach((l, i) => X.fillText(l, 0, (i - (lines.length - 1) / 2) * (o.size || 40) * 1.15));
    tape(0, -120, 110, -.04);
  });
}

// ---------- xerox inserts (internet brutalism) ----------
// headline(x, y, w, title, o): a crooked photocopied printout taped to the page.
// o: {kicker (small mono line), sub, rot, scale, big (title size), accent colour, t/t0 (slap-on animation), dark}
function headline(x, y, w, title, o = {}) {
  let s = o.scale || 1, a = 1;
  if (o.t !== undefined) { const k = clamp((o.t - o.t0) / .14); if (k <= 0) return; s *= lerp(1.25, 1, easeOut(k)); a = clamp(k * 2.5); }
  withT(x, y, o.rot ?? -.03, s, () => {
    X.globalAlpha = a;
    const big = o.big || 64, lines = wrap(title, FONT.uiB(big), w - 60), h = 80 + lines.length * big * 1.02 + (o.sub ? 60 : 0) + (o.kicker ? 30 : 0);
    cut(() => pathPoly([[-w / 2, -h / 2], [w / 2, -h / 2 + 3], [w / 2 - 2, h / 2], [-w / 2 + 2, h / 2 - 2]]), { fill: o.paper || PAL.paperHi, lift: 10, shade: .3 });
    // xerox grime: toner edge and speckle
    X.save(); pathPoly([[-w / 2, -h / 2], [w / 2, -h / 2 + 3], [w / 2 - 2, h / 2], [-w / 2 + 2, h / 2 - 2]]); X.clip();
    X.globalCompositeOperation = 'multiply'; X.fillStyle = 'rgba(0,0,0,.08)'; X.fillRect(-w / 2, -h / 2, 16, h);
    for (let i = 0; i < 60; i++) { X.fillStyle = `rgba(0,0,0,${.05 + hash(i + x) * .15})`; X.fillRect(-w / 2 + hash(i * 3 + y) * w, -h / 2 + hash(i * 7 + x) * h, 1 + hash(i) * 3, 1 + hash(i * 5) * 2); }
    X.restore();
    let yy = -h / 2 + 40;
    X.textAlign = 'left'; X.textBaseline = 'top';
    if (o.kicker) { X.font = FONT.monoB(20); X.fillStyle = o.accent || PAL.red; X.fillText(o.kicker.toUpperCase(), -w / 2 + 30, yy); yy += 34; }
    X.font = FONT.uiB(big); X.fillStyle = PAL.ink;
    lines.forEach(l => { X.fillText(l, -w / 2 + 30, yy); yy += big * 1.02; });
    if (o.sub) { X.font = FONT.uiM(26); X.fillStyle = PAL.ink2; X.fillText(o.sub, -w / 2 + 30, yy + 14); }
    if (o.underline) inkStroke(() => { X.beginPath(); X.moveTo(-w / 2 + 26, yy + 4); X.lineTo(-w / 2 + 26 + Math.min(w - 60, textW(lines[lines.length - 1], FONT.uiB(big))), yy + 2); }, o.accent || PAL.red, 8);
    tape(-w / 2 + 40, -h / 2 + 4, 90, -.5); tape(w / 2 - 40, -h / 2 + 4, 90, .45);
  });
}
function wrap(text, fnt, maxW) {
  X.save(); X.font = fnt; const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (X.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur); X.restore(); return lines;
}
// A social post printout (anonymous accounts only).
function post(x, y, w, o = {}) {
  let s = o.scale || 1, a = 1;
  if (o.t !== undefined) { const k = clamp((o.t - o.t0) / .14); if (k <= 0) return; s *= lerp(1.2, 1, easeOut(k)); a = clamp(k * 2.5); }
  withT(x, y, o.rot ?? .02, s, () => {
    X.globalAlpha = a;
    const lines = wrap(o.text || '', FONT.uiM(34), w - 70), h = 150 + lines.length * 44;
    cut(() => rrect(-w / 2, -h / 2, w, h, 18), { fill: PAL.paperHi, lift: 10, shade: .3 });
    cut(() => { X.beginPath(); X.arc(-w / 2 + 58, -h / 2 + 58, 28, 0, TAU); }, { fill: o.avatar || PAL.blue, lift: 0 });
    X.textBaseline = 'middle'; X.textAlign = 'left';
    X.font = FONT.ui(28); X.fillStyle = PAL.ink; X.fillText(o.name || 'anon', -w / 2 + 102, -h / 2 + 46);
    X.font = FONT.uiM(24); X.fillStyle = '#7d766c'; X.fillText(o.handle || '@anon · 2m', -w / 2 + 102, -h / 2 + 76);
    X.font = FONT.uiM(34); X.fillStyle = PAL.ink; lines.forEach((l, i) => X.fillText(l, -w / 2 + 34, -h / 2 + 128 + i * 44));
    X.font = FONT.uiM(22); X.fillStyle = '#7d766c'; X.fillText(`♡ ${o.likes || '41.2K'}    ⟲ ${o.rts || '9.8K'}`, -w / 2 + 34, h / 2 - 30);
  });
}

// ---------- particles ----------
// Paper confetti falling through a region. Deterministic in t.
function confetti(t, t0, o = {}) {
  const n = o.n || 80, cols = o.colors || [PAL.pink, PAL.yellow, PAL.orange, PAL.blue, PAL.teal], lt = t - t0;
  if (lt < 0) return;
  for (let i = 0; i < n; i++) {
    const r = k => hash(i * 17.3 + k + (o.seed || 0));
    const x0 = (o.x ?? 0) + r(1) * (o.w ?? W), vy = 220 + r(2) * 260, y = (o.y ?? -60) + lt * vy - r(3) * 400 + (o.burst ? -Math.max(0, 900 - lt * 1800) * r(4) : 0);
    if (y < -80 || y > H + 80) continue;
    const x = x0 + Math.sin(lt * (2 + r(5) * 3) + r(6) * 9) * 40, rot = lt * (3 + r(7) * 6) + r(8) * 9, fl = Math.cos(lt * (5 + r(9) * 5));
    withT(x, y, rot, 1, () => { X.scale(1, fl); cut(() => X.rect(-9, -5, 18, 10), { fill: cols[i % cols.length], lift: 3, shade: .2 }); });
  }
}
// A burst of little sparks from (x, y) starting at t0.
function sparkBurst(x, y, t, t0, o = {}) {
  const lt = t - t0, n = o.n || 10, dur = o.dur || .8; if (lt < 0 || lt > dur) return;
  const k = lt / dur;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i + t0) * .5, d = (o.r || 200) * easeOut(k) * (.6 + hash(i * 3 + t0) * .6);
    const sz = (o.size || 26) * (1 - k) * (.6 + hash(i * 7 + t0) * .8);
    if (sz < 1) continue;
    withT(x + Math.cos(a) * d, y + Math.sin(a) * d, lt * 4 + i, 1, () => cut(() => sparkPath(0, 0, sz, 6, .25, 0, .6), { fill: (o.colors || [PAL.yellow, PAL.orange, PAL.pink])[i % 3], lift: 3 }));
  }
}

// ---------- transitions ----------
// White flash that decays after t0.
function flash(t, t0, dur = .25, col = '#FFFFFF') { const k = hit(t, t0, dur); if (k <= 0) return; X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = k; X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); }
// Sheet feed: the new shot slides in from the top like paper out of a printer. Returns y offset for the new sheet.
function feedY(lt, dur = .28) { return -H * (1 - expoOut(lt / dur)); }
// Paper tear reveal: draws `under` fully, then `over` clipped to a torn region that shrinks off to one side.
function tearClip(k, dir = 1) {
  // returns a path covering the part of the frame NOT yet torn away (k: 0 intact → 1 gone)
  const x0 = lerp(-200, W + 200, dir > 0 ? k : 1 - k);
  X.beginPath();
  if (dir > 0) { X.moveTo(x0, -20); for (let i = 0; i <= 20; i++) X.lineTo(x0 + sjit(i * 3.3, 34) + Math.sin(i * 1.3) * 18, i * H / 20); X.lineTo(W + 20, H + 20); X.lineTo(W + 20, -20); }
  else { X.moveTo(x0, -20); for (let i = 0; i <= 20; i++) X.lineTo(x0 + sjit(i * 3.3, 34) + Math.sin(i * 1.3) * 18, i * H / 20); X.lineTo(-20, H + 20); X.lineTo(-20, -20); }
  X.closePath();
}
// Draw a torn paper edge band (the white fibrous edge) along the tear line.
function tearEdge(k, dir = 1) {
  const x0 = lerp(-200, W + 200, dir > 0 ? k : 1 - k);
  X.save(); X.beginPath();
  for (let i = 0; i <= 20; i++) X.lineTo(x0 + sjit(i * 3.3, 34) + Math.sin(i * 1.3) * 18, i * H / 20);
  X.strokeStyle = PAL.paperHi; X.lineWidth = 14; X.shadowColor = 'rgba(0,0,0,.35)'; X.shadowBlur = 16; X.shadowOffsetX = dir * 6; X.stroke(); X.restore();
}
// Run a transition between two shot painters: `a` (outgoing) torn away to reveal `b`.
function tearTransition(k, drawA, drawB, dir = 1) {
  drawB();
  if (k >= 1) return;
  const L = onLayer('_tearA', () => { sheet(); drawA(); });
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); tearClip(k, dir); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(L, 0, 0); X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); tearEdge(k, dir); X.restore();
}
