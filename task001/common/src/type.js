// type.js: fonts, per-letter layout, riso text, lyric word timing and captions.

const F = {
  hero: 'Anton', logo: 'Unbounded', serif: 'Instrument Serif', mono: 'JetBrains Mono', ui: 'Inter',
  kr: 'Noto Sans KR', jp: 'Noto Sans JP', sc: 'Noto Sans SC', blk: 'Archivo Black',
};
function font(fam, size, weight = 400, style = 'normal') { return `${style} ${weight} ${size}px "${fam}"`; }
const FONT = {
  hero: s => font(F.hero, s), logo: s => font(F.logo, s, 900), logoL: s => font(F.logo, s, 400),
  serif: s => font(F.serif, s), serifI: s => font(F.serif, s, 400, 'italic'),
  mono: s => font(F.mono, s, 400), monoB: s => font(F.mono, s, 800),
  ui: s => font(F.ui, s, 800), uiB: s => font(F.ui, s, 900), uiM: s => font(F.ui, s, 500),
  kr: s => font(F.kr, s, 900), jp: s => font(F.jp, s, 900), sc: s => font(F.sc, s, 900), blk: s => font(F.blk, s),
};

// Letter layout: returns [{ch, x, w}] with x = left edge relative to the start, plus total width.
function layout(str, fnt, tracking = 0) {
  X.save(); X.font = fnt;
  const out = []; let x = 0;
  for (const ch of [...str]) { const w = X.measureText(ch).width; out.push({ ch, x, w }); x += w + tracking; }
  X.restore();
  out.width = Math.max(0, x - tracking); return out;
}
function textW(str, fnt, tracking = 0) { return layout(str, fnt, tracking).width; }

// Riso text: fill in ink colour with multiply, optional misregistered second colour underneath.
// o: {font, color, align ('left'|'center'|'right'), base ('alphabetic'|'middle'|'top'), tracking, mis:[dx,dy,color], op, alpha, sx (horizontal scale), stroke}
function rtext(str, x, y, o = {}) {
  const fnt = o.font || FONT.hero(100), tr = o.tracking || 0;
  X.save(); X.font = fnt; X.textBaseline = o.base || 'alphabetic';
  const L = layout(str, fnt, tr), w = L.width * (o.sx || 1);
  let x0 = x; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w;
  const draw = (col, dx, dy, op) => {
    X.globalCompositeOperation = op; X.fillStyle = col;
    X.save(); X.translate(x0 + dx, y + dy); if (o.sx) X.scale(o.sx, 1);
    if (tr === 0 && !o.perLetter) X.fillText(str, 0, 0); else for (const l of L) X.fillText(l.ch, l.x, 0);
    X.restore();
  };
  X.globalAlpha = o.alpha ?? 1;
  if (o.mis) draw(o.mis[2] || PAL.pink, o.mis[0], o.mis[1], 'multiply');
  if (o.stroke) {
    X.save(); X.translate(x0, y); if (o.sx) X.scale(o.sx, 1); X.strokeStyle = o.stroke; X.lineWidth = o.sw || 4; X.lineJoin = 'round';
    for (const l of L) X.strokeText(l.ch, l.x, 0); X.restore();
  }
  if (o.color !== null) draw(o.color || PAL.ink, 0, 0, o.op || 'multiply');
  X.restore();
  return { x0, w };
}

// A word that stamps down: scales from big to 1 with a little overshoot, a paper jolt and an ink spread.
// k: 0..1 progress since the stamp moment (use hit-style timing). Returns the scale used.
function stampK(t, t0, dur = .16) {
  if (t < t0) return null;
  const k = clamp((t - t0) / dur);
  return { s: lerp(1.35, 1, easeOut(k)) + bump(clamp((t - t0 - dur) / .12)) * -.03, a: clamp(k * 3), jolt: (1 - k) };
}
function stampText(str, x, y, t, t0, o = {}) {
  const st = stampK(t, t0, o.dur || .14); if (!st) return;
  X.save(); X.translate(x, y); X.rotate((o.rot || 0) + st.jolt * .04 * (hash(t0) - .5)); X.scale(st.s, st.s);
  rtext(str, 0, 0, { ...o, alpha: (o.alpha ?? 1) * st.a });
  X.restore();
}

// ---------- lyric word timing ----------
// Syllable estimate for English words (good enough to spread words across a sung line).
function syl(w) {
  w = w.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (/^\d+$/.test(w)) return w.length;
  const special = { agi: 3, chatgpt: 4, 'pdoom': 2, nvda: 4, mlp: 3, cdr: 3, pto: 3, rlhf: 4, gpu: 3, ilya: 3, sydney: 2, gato: 2, foom: 1, shoggoths: 2, shinigami: 4, von: 1, neumanns: 2, orthogonality: 6, chinchilla: 3, loom: 1, doom: 1, killswitch: 2, transformers: 3, the: 1, fire: 1 };
  if (special[w] !== undefined) return special[w];
  let m = w.replace(/e$/, '').match(/[aeiouy]+/g); return Math.max(1, m ? m.length : 1);
}
// Words of line L with estimated sung start times: syllables on an 8th-note grid, compressed to fit.
function wordTimes(L) {
  const [a, b, txt] = L, words = txt.split(/\s+/).filter(Boolean);
  const sy = words.map(syl), tot = sy.reduce((p, q) => p + Math.max(1, q), 0);
  // syllables spread over ~85% of the line, between a 16th and a quarter note each, snapped to the 16th grid
  const step = clamp((b - a) * .85 / tot, BEAT / 4, BEAT);
  let acc = 0; return words.map((w, i) => { const t0 = Math.max(a, qBeat(a + acc * step, 4)); acc += Math.max(1, sy[i]); return { w, t: i === 0 ? a : t0, end: a + acc * step }; });
}
function lineAt(t) { return LY.find(l => t >= l[0] && t < l[1]); }
function lineIdx(t) { return LY.findIndex(l => t >= l[0] && t < l[1]); }

// ---------- caption: small paper-tape label at lower centre with the sung word highlighted ----------
function caption(t, o = {}) {
  const L = o.line || lineAt(t); if (!L) return;
  const [a, b, txt] = L, k = easeOut((t - a) / .2) * (1 - ease((t - b + .15) / .15));
  if (k <= .01) return;
  const size = o.size || 40, fnt = FONT.ui(size), y = o.y ?? 990;
  const ws = wordTimes(L), sp = textW(' ', fnt), widths = ws.map(w => textW(w.w, fnt));
  const total = widths.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const padX = 34, bw = (total + padX * 2), bh = size * 1.75, x0 = W / 2 - bw / 2;
  X.save(); X.globalAlpha = k;
  X.translate(W / 2, y); X.rotate(o.rot ?? -.012); X.translate(-W / 2, -y);
  // tape
  cut(() => pathPoly([[x0 - 8, y - bh / 2 + 2], [x0 + bw / 2, y - bh / 2 - 3], [x0 + bw + 8, y - bh / 2 + 1], [x0 + bw + 2, y + bh / 2], [x0 + bw / 2, y + bh / 2 + 3], [x0 - 4, y + bh / 2 - 1]]),
    { fill: o.bg || PAL.paperHi, lift: 5, shade: .25 });
  let x = W / 2 - total / 2;
  X.font = fnt; X.textBaseline = 'middle';
  ws.forEach((w, i) => {
    const on = t >= w.t;
    X.fillStyle = on ? (o.hi || PAL.ink) : (o.lo || '#B9B0A2');
    X.fillText(w.w, x, y + 2);
    if (on && t < w.t + .25) { X.globalAlpha = k * (1 - (t - w.t) / .25); X.fillStyle = o.flash || PAL.pink; X.fillText(w.w, x, y + 2); X.globalAlpha = k; }
    x += widths[i] + sp;
  });
  X.restore();
}
