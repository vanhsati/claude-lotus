// stage.js: THE STAGE, the set every chorus returns to. A paper diorama: an LED wall of paper tiles,
// light beams, a glossy floor. Four variants escalate: v1 party (pink/orange/yellow), v2 arena + pyro (violet/gold),
// v3 dim spotlight (blue), v4 red alarm.
//
// stageBG(t, o): paints the set (call inside camBegin/camEnd). o: {v: 1..4, text: 'P(DOOM)', pattern, floorY}
// stageFront(t, o): paints things in front of the dancers (beam haze, pyro fronts, sirens).

const STAGE_V = {
  1: { wall: '#2A1E3A', on: [PAL.pink, PAL.orange, PAL.yellow], floor: '#231A2E', beam: 'rgba(255,210,58,.22)', back: '#FFB3D1' },
  2: { wall: '#1E1638', on: [PAL.violet, PAL.yellow, PAL.pink], floor: '#171230', beam: 'rgba(255,210,58,.26)', back: '#B7A4F0' },
  3: { wall: '#121A33', on: [PAL.blue, PAL.sky, PAL.paperHi], floor: '#0E1428', beam: 'rgba(200,220,255,.2)', back: '#3A4E86' },
  4: { wall: '#2A0A0C', on: [PAL.red, PAL.yellow, PAL.orange], floor: '#1A0708', beam: 'rgba(228,50,43,.25)', back: '#7A1B1B' },
};
// Rasterise text into a tile mask (cached). Returns {cols, rows, get(i, j) → 0..1}
const _tileCache = {};
function tileMask(text, cols, rows, fnt) {
  const key = text + cols + rows + fnt;
  if (_tileCache[key]) return _tileCache[key];
  const c = mkCanvas(cols, rows), x = c.getContext('2d');
  x.fillStyle = '#000'; x.font = fnt; x.textAlign = 'center'; x.textBaseline = 'middle';
  let size = rows; x.font = fnt.replace(/\d+px/, size + 'px');
  while (x.measureText(text).width > cols * .92 && size > 4) { size--; x.font = fnt.replace(/\d+px/, size + 'px'); }
  x.fillText(text, cols / 2, rows / 2 + 1);
  const d = x.getImageData(0, 0, cols, rows).data;
  return (_tileCache[key] = { cols, rows, get: (i, j) => d[(j * cols + i) * 4 + 3] / 255 });
}
function stageBG(t, o = {}) {
  const v = STAGE_V[o.v || 1], floorY = o.floorY ?? 800;
  // back wall (beyond the LED wall edges)
  X.fillStyle = v.wall; X.fillRect(-2000, -1500, W + 4000, floorY + 1500);
  // LED wall: paper tiles
  const cols = 36, rows = 12, tw = 45, gap = 6, ox = W / 2 - cols * (tw + gap) / 2, oy = floorY - rows * (tw + gap) - 40;
  const mask = tileMask(o.text || 'P(DOOM)', cols, rows, FONT.logo(20));
  const b = beatF(t), pk = pulse(t, .5), pattern = o.pattern || 'logo';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    let on = 0, ci = 0;
    const cx = i - cols / 2 + .5, cy = j - rows / 2 + .5, r = Math.hypot(cx * .8, cy * 1.4);
    if (pattern === 'logo') { on = mask.get(i, j); ci = 0; if (on < .5) { on = (frac(r * .12 - b * .5) < .12 ? .55 : 0) * (o.v === 3 ? .3 : 1); ci = 1; } }
    else if (pattern === 'rings') { on = frac(r * .15 - b * .5) < .3 ? 1 : 0; ci = Math.floor(r * .15 - b * .5) % 3; }
    else if (pattern === 'stripes') { on = frac((i + j * .5) * .08 - b * .25) < .35 ? 1 : 0; ci = Math.floor((i + j * .5) * .08 - b * .25) % 3; }
    else if (pattern === 'alarm') { on = (Math.floor(b * 2) % 2 === (i + j) % 2) ? 1 : .15; ci = 0; }
    else if (pattern === 'dim') { on = hash(i * 31 + j * 7 + Math.floor(b)) < .08 ? .6 : 0; ci = 1; }
    const x = ox + i * (tw + gap), y = oy + j * (tw + gap);
    if (on > .45) {
      X.fillStyle = v.on[((ci % 3) + 3) % 3]; X.globalAlpha = .75 + .25 * pk;
      X.fillRect(x + jit(i * 97 + j, .8), y + jit(j * 89 + i, .8), tw, tw);
      X.globalAlpha = 1;
    } else { X.fillStyle = 'rgba(255,255,255,.06)'; X.fillRect(x, y, tw, tw); }
  }
  // wall frame (paper truss)
  cut(() => { X.beginPath(); X.rect(ox - 30, oy - 40, cols * (tw + gap) + 54, 22); }, { fill: '#39314A', lift: 8 });
  // side towers
  for (const sd of [-1, 1]) {
    const tx = W / 2 + sd * (cols * (tw + gap) / 2 + 110);
    cut(() => rrect(tx - 70, floorY - 640, 140, 640, 10), { fill: '#2F2740', lift: 10 });
    for (let k = 0; k < 5; k++) cut(() => { X.beginPath(); X.arc(tx, floorY - 560 + k * 118, 44, 0, TAU); }, { fill: '#18121F', lift: 3, stroke: '#4A3F5E', sw: 5 });
  }
  // floor: glossy dark paper with halftone reflection and perspective lines
  X.fillStyle = v.floor; X.fillRect(-2000, floorY, W + 4000, 1400);
  X.save(); X.globalAlpha = .5; X.strokeStyle = 'rgba(255,255,255,.12)'; X.lineWidth = 2;
  for (let i = -12; i <= 12; i++) { X.beginPath(); X.moveTo(W / 2 + i * 60, floorY); X.lineTo(W / 2 + i * 260, floorY + 700); X.stroke(); }
  for (let k = 1; k < 6; k++) { const y = floorY + Math.pow(k / 6, 1.6) * 600; X.beginPath(); X.moveTo(-2000, y); X.lineTo(W + 2000, y); X.stroke(); }
  X.restore();
  htGrad(() => X.rect(-400, floorY, W + 800, 500), v.on[0], W / 2, floorY + 400, W / 2, floorY, { step: 14, maxR: 5, bounds: [-400, floorY, W + 800, 420], alpha: .5 * (.6 + .4 * pk), op: 'screen' });
  // beams from the truss
  X.save(); X.globalCompositeOperation = 'screen';
  const nb = o.v === 3 ? 1 : 6;
  for (let k = 0; k < nb; k++) {
    const bx = nb === 1 ? W / 2 : 200 + k * (W - 400) / (nb - 1), sw = Math.sin(t * 1.3 + k * 1.7) * (o.v === 4 ? 1.2 : .45);
    const ex = bx + Math.sin(sw) * 1200, ey = floorY + 60, spread = nb === 1 ? 300 : 150;
    X.fillStyle = v.beam; X.beginPath(); X.moveTo(bx - 14, oy - 30); X.lineTo(bx + 14, oy - 30); X.lineTo(ex + spread, ey); X.lineTo(ex - spread, ey); X.closePath(); X.fill();
  }
  X.restore();
}
function stageFront(t, o = {}) {
  const v = o.v || 1, floorY = o.floorY ?? 800;
  if (v === 2 && o.pyro !== false) {
    // paper pyro jets fire on every downbeat
    const k = hit(t, barT(barN(t)), .9);
    if (k > 0) for (const px of [150, 420, W - 420, W - 150]) {
      const h = 520 * Math.pow(k, .5);
      for (let f = 0; f < 3; f++) {
        const fw = (90 - f * 25), fh = h * (1 - f * .22), col = [PAL.orange, PAL.yellow, PAL.paperHi][f];
        cut(() => { X.beginPath(); X.moveTo(px - fw, floorY); for (let q = 0; q <= 8; q++) { const u = q / 8; X.lineTo(px + (u - .5) * 2 * fw * (1 - u * .8) + jit(q + f * 9 + px, 10), floorY - fh * Math.sin(u * Math.PI) - (q === 4 ? fh * .3 : 0)); } X.lineTo(px + fw, floorY); X.closePath(); }, { fill: col, lift: 6, shade: .2 });
      }
    }
  }
  if (v === 4) {
    // rotating siren beams and a red wash on the beat
    X.save(); X.globalCompositeOperation = 'screen';
    for (const sx of [120, W - 120]) {
      const a = t * 5 + (sx > W / 2 ? Math.PI : 0);
      X.fillStyle = 'rgba(255,40,30,.28)'; X.beginPath(); X.moveTo(sx, 90); X.lineTo(sx + Math.cos(a - .12) * 2600, 90 + Math.sin(a - .12) * 2600); X.lineTo(sx + Math.cos(a + .12) * 2600, 90 + Math.sin(a + .12) * 2600); X.closePath(); X.fill();
    }
    X.restore();
    for (const sx of [120, W - 120]) cut(() => { X.beginPath(); X.arc(sx, 90, 40, Math.PI, TAU); X.closePath(); }, { fill: PAL.red, lift: 6 });
    ink(() => X.rect(-2000, -2000, W + 4000, H + 4000), PAL.red, { alpha: .18 * pulse(t, .6) });
  }
}
// A dance line: the idol in front with four Clawds behind, all on the same choreography.
// o: {move, s (idol head radius), x, y (idol hip), spread, clawdS, face}
function danceLine(t, o = {}) {
  const move = o.move || 'pdoom', y = o.y ?? 800, s = o.s || 30, cs = o.clawdS || s * 3.4, sp = o.spread ?? 330, cx = o.x ?? W / 2;
  const cy = y + (o.clawdY ?? s * 5.3);
  [-2, -1, 1, 2].forEach((k, i) => {
    const cd = clawdDance(t, move, i, { delay: o.canon ? Math.abs(k) * .12 : 0 });
    clawd(cx + k * sp * (Math.abs(k) === 2 ? .92 : .55) + (Math.abs(k) === 2 ? 0 : 0), cy - (Math.abs(k) === 1 ? 70 : 0), cs * (Math.abs(k) === 1 ? .9 : 1), cd);
  });
  const pose = dance(t, move, o);
  const face = { mouth: o.sing === false ? 0 : clamp(VOX(t) * 1.3 - .15), eyes: 'open', ...(o.face || {}) };
  idolBody(cx, y, s, pose, { face });
}
