// frame.js: shot registry, per-frame driver and the print finish (paper stock, ink speckle, sheet marks, slug clock).
//
// shot(start, end, fn, opts): fn(t, lt, dur) paints the entire frame. lt = t - start. Shots are sorted by start.
// opts: {cap: true (draw lyric caption), marks: false (hide sheet marks), dark: true (light-on-dark marks), seed}

const SHOTS = [];
function shot(start, end, fn, opts = {}) { SHOTS.push({ start, end, fn, ...opts }); SHOTS.sort((a, b) => a.start - b.start); }
function shotAt(t) { let s = null; for (const x of SHOTS) if (t >= x.start && t < x.end) s = x; return s; }

// Hyperbolic clock on the slug line: minutes → days → years → ∞ as the song runs.
const CLOCK0 = Date.UTC(2026, 8, 25, 14, 3);
function clockDays(t) { if (t >= 141.18) return Infinity; const tt = Math.min(t, 137.4); return Math.pow(10, -2.6 + 7.9 * Math.pow(tt / 137.4, 1.35)); }
function clockStr(t) {
  const d = clockDays(t);
  if (!isFinite(d)) return '∞';
  const dt = new Date(CLOCK0 + d * 864e5), y = dt.getUTCFullYear();
  const p = n => String(n).padStart(2, '0');
  return `${y}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())} ${p(dt.getUTCHours())}:${p(dt.getUTCMinutes())}`;
}
function runSpeed(t) { const a = clockDays(t), b = clockDays(t + .1); return isFinite(b) ? (b - a) * 864e5 / 100 : Infinity; }

function sheetMarks(t, sh) {
  if (sh && sh.marks === false) return;
  const dark = sh && sh.dark, col = dark ? 'rgba(242,237,227,.75)' : 'rgba(29,27,32,.7)';
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  X.strokeStyle = col; X.lineWidth = 1.6;
  const m = 26, L = 22;
  for (const [cx, cy] of [[m, m], [W - m, m], [m, H - m], [W - m, H - m]]) {
    X.beginPath(); X.moveTo(cx - L / 2, cy); X.lineTo(cx + L / 2, cy); X.moveTo(cx, cy - L / 2); X.lineTo(cx, cy + L / 2); X.stroke();
    X.beginPath(); X.arc(cx, cy, 6, 0, TAU); X.stroke();
  }
  // slug line
  const idx = SHOTS.indexOf(sh) + 1, sp = runSpeed(t);
  const spd = !isFinite(sp) ? '∞' : sp < 10 ? sp.toFixed(1) : sp < 1e6 ? Math.round(sp).toLocaleString('en-US') : sp.toExponential(1).replace('e+', 'e');
  X.font = FONT.mono(15); X.fillStyle = col; X.textBaseline = 'middle';
  X.fillText(`P(DOOM) · SHEET ${String(idx).padStart(4, '0')} · ${clockStr(t)} · RUN ×${spd}`, m + 24, m);
  X.textAlign = 'right'; X.fillText(`${Math.floor(beatF(Math.max(t, BEAT0)) / 4) + 1}.${(beatN(Math.max(t, BEAT0)) % 4 + 4) % 4 + 1} · 132 BPM`, W - m - 24, m);
  // riso colour check strip
  const cols = [PAL.orange, PAL.pink, PAL.yellow, PAL.blue, PAL.teal, PAL.ink];
  X.globalAlpha = dark ? .8 : .75;
  cols.forEach((c, i) => { X.fillStyle = c; X.fillRect(W - m - 24 - (cols.length - i) * 16, H - m - 6, 12, 12); });
  X.restore();
}

// The print finish: paper stock multiplied over everything, then ink speckle.
function printFinish(t, sh) {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  const cw = X.canvas.width, ch = X.canvas.height;
  const k = Math.floor(t * 6) % 4, ox = (k % 2) * 256, oy = (k >> 1) * 256;
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = sh && sh.paperAlpha !== undefined ? sh.paperAlpha : 1;
  X.drawImage(TEX.paper, ox, oy, 768, 768 * ch / cw, 0, 0, cw, ch);
  X.globalCompositeOperation = 'screen'; X.globalAlpha = sh && sh.dark ? .07 : .12;
  const sk = Math.floor(t * 12) % 7;
  X.drawImage(TEX.speckle, sk * 41, sk * 29, 700, 700 * ch / cw, 0, 0, cw, ch);
  X.restore();
}

// Kick-driven misregistration jolt: a pink offset copy of the frame. strength 0..1
function misreg(strength, dx = 8, dy = 4, col = PAL.pink) {
  if (strength < .02) return;
  const c = layer('_mis'); c.x.setTransform(1, 0, 0, 1, 0, 0); c.x.drawImage(X.canvas, 0, 0);
  c.x.globalCompositeOperation = 'source-in'; c.x.fillStyle = col; c.x.fillRect(0, 0, c.width, c.height);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.globalAlpha = .35 * strength;
  X.drawImage(c, dx * SX * strength, dy * SX * strength); X.restore();
}

// Paint one shot (and its caption) with X as the current context.
function paintShot(sh, t) {
  SEED = sh.seed ?? Math.round(sh.start * 10);
  X.save(); sh.fn(t, t - sh.start, sh.end - sh.start); X.restore();
  X.setTransform(SX, 0, 0, SX, 0, 0);
  if (sh.cap) caption(t, sh.capOpts || {});
}
// Incoming transitions, declared on the shot: {inT: 'tear'|'tearL'|'feed'|'flip'|'jolt', inDur}
// The previous shot keeps running underneath (it is a pure function of t).
function paintWithTransition(sh, t) {
  const lt = t - sh.start, dur = sh.inDur || (sh.inT === 'jolt' ? .2 : .4), prev = SHOTS[SHOTS.indexOf(sh) - 1];
  if (!sh.inT || !prev || lt >= dur || sh.inT === 'jolt') {
    paintShot(sh, t);
    if (sh.inT === 'jolt' && lt < dur) misreg(1 - lt / dur, 18, 9, sh.joltColor || PAL.pink);
    return;
  }
  const k = lt / dur;
  if (sh.inT === 'feed') {
    const L = onLayer('_prev', () => { sheet(); paintShot(prev, t); });
    blit(L);
    const y = feedY(lt, dur);
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.translate(0, y);
    X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 40; X.shadowOffsetY = 18; X.fillStyle = PAL.paper; X.fillRect(0, 0, W, H); X.shadowColor = 'transparent';
    X.beginPath(); X.rect(0, 0, W, H); X.clip(); paintShot(sh, t); X.restore();
  } else if (sh.inT === 'tear' || sh.inT === 'tearL') {
    const dir = sh.inT === 'tear' ? 1 : -1, ek = easeInOut(k);
    const L = onLayer('_prev', () => { sheet(); paintShot(prev, t); });
    paintShot(sh, t);
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); tearClip(ek, dir); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(L, 0, 0); X.restore();
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); tearEdge(ek, dir); X.restore();
  } else if (sh.inT === 'flip') {
    // page turn: the old sheet folds over its left edge, revealing the new one underneath
    const L = onLayer('_prev', () => { sheet(); paintShot(prev, t); });
    paintShot(sh, t);
    const ek = easeIn(k), w = Math.cos(ek * Math.PI / 2);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowBlur = 50 * SX; X.shadowOffsetX = 20 * SX;
    X.drawImage(L, 0, 0, L.width * w, L.height);
    X.shadowColor = 'transparent'; X.globalAlpha = ek * .5; X.fillStyle = '#000'; X.fillRect(0, 0, L.width * w, L.height);
    X.restore();
  }
}
function drawFrame(t) {
  T = t; BOIL = Math.floor(t * 12);
  X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  const sh = shotAt(t);
  SEED = sh ? (sh.seed ?? Math.round(sh.start * 10)) : 0;
  sheet(PAL.paper);
  if (window.TEST) window.TEST(t);
  else if (sh) paintWithTransition(sh, t);
  X.setTransform(SX, 0, 0, SX, 0, 0);
  if (!window.TEST || window.TEST_FINISH) { printFinish(t, sh); sheetMarks(t, sh); }
}
