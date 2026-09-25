// pdoom.js: job001-only props: the P(doom) meter and its chorus schedule.

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

