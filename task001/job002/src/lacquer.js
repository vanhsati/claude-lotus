// lacquer.js: sơn mài materials for job002. A living Vietnamese lacquer painting: black/brown lacquer ground with a
// moving polish sheen, gold and silver leaf (square sheets, seams, crackle, a travelling glint), crushed-eggshell inlay,
// flat cinnabar lacquer, SANDING reveals (a top layer rubbed through in brushy scrubs), inlaid type, a silver-leaf
// Clawd and an unbranded wedge time machine.
//
// Every texture is built once, lazily, from hash/rng (deterministic). Every call is a pure function of its arguments.
//
//   LQ_PAL                                   palette
//   lqGround(t, {tone:'black'|'brown'|'red'|'night', camX, sheen, sheenX, dust})   (the vignette is baked in)
//   lqGold(pathFn, o) / lqSilver(pathFn, o)  o: {scale, ox, oy, rot, glint 0..1 | false, glintW, glintAng, bounds:[x,y,w,h],
//                                                lift, bevel, shade 0..1 (darken), alpha}
//   lqEggshell(pathFn, o)                    o: {scale, ox, oy, lift, bevel, gloss, glint, tint}
//   lqLacquer(pathFn, color, o)              o: {bounds, lift, rim, sheen, glint, mottle}
//   lqSand(k, seed, o) → layer               o: {region:[x,y,w,h], angle, n, from:'left'|'right'|'top'|'bottom'|'center'|null, name}
//   lqReveal(drawBottom, drawTop, k, seed, o)  o: lqSand opts + {halo: colour|null, haloW}
//   lqInlayText(str, x, y, o)                o: {font, size, material:'gold'|'silver'|'egg'|'red', align, base, tracking,
//                                                glint, scale, depth, groove, bounds} → {x0, w}
//   lqClawd(x, y_ground, s, o)               o: clawd opts (squash, lean, arms, step, jump, flip, look) + {material:'silver'|'gold',
//                                                shades (default true), chain (default true), hat colour|null, glint}
//   lqTimeMachine(x, y_ground, s, t, o)      s = length. o: {doors 0..1, spin (rad/s), trail 0..1, glint, flip, lights, circuits 0..1, far}

const LQ_PAL = {
  black: '#120D0B', black2: '#1C1411', ink: '#070504', brown: '#4A2A18', brownDk: '#2A170D', brownLt: '#6E4127',
  cinnabar: '#B3261E', cinnabarDk: '#6E120D', cinnabarLt: '#D8452F', vermilion: '#E8553A',
  gold: '#D9A441', goldDk: '#8E5E1C', goldHi: '#F6E3A1', goldWhite: '#FFF6D8',
  silver: '#C9CCD1', silverDk: '#7D828B', silverHi: '#F4F6F8',
  egg: '#F3EBDD', eggDk: '#D8C9AE', eggWarm: '#E8D6B4',
  jade: '#2F5B4A', night: '#101826',
};

// ---------- small helpers ----------
const LQ_TEX = {};
const lqHex = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
function lqMix(a, b, k, alpha = 1) {
  const A = typeof a === 'string' ? lqHex(a) : a, B = typeof b === 'string' ? lqHex(b) : b;
  return `rgba(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))},${alpha})`;
}
// Periodic value noise (period P lattice cells) so tiles wrap without seams.
function lqPN(x, y, P, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash2(((a % P) + P) % P + s * 31.7, ((b % P) + P) % P + s * 7.3);
  return lerp(lerp(h(i, j), h(i + 1, j), ux), lerp(h(i, j + 1), h(i + 1, j + 1), ux), uy) * 2 - 1;
}
// Piecewise-linear colour ramp → 256-entry LUT.
function lqRamp(stops) {
  const lut = new Uint8Array(256 * 3), S = stops.map(([p, c]) => [p, lqHex(c)]);
  for (let i = 0; i < 256; i++) {
    const v = i / 255; let k = 0; while (k < S.length - 2 && v > S[k + 1][0]) k++;
    const [p0, c0] = S[k], [p1, c1] = S[k + 1], u = clamp((v - p0) / (p1 - p0));
    for (let ch = 0; ch < 3; ch++) lut[i * 3 + ch] = Math.round(lerp(c0[ch], c1[ch], u));
  }
  return lut;
}
const LQ_RAMP = {
  gold: [[0, '#140a04'], [.2, '#3a1f0a'], [.4, '#74461a'], [.52, '#a26c22'], [.62, '#c28a2c'], [.72, '#d6a140'], [.82, '#e4b75c'], [.9, '#efd08a'], [.96, '#f7e6ad'], [1, '#fff8dc']],
  silver: [[0, '#0b0b0d'], [.2, '#2a2b2f'], [.4, '#5a5d63'], [.52, '#85888e'], [.62, '#a3a6ab'], [.72, '#bcbfc3'], [.82, '#d0d3d6'], [.9, '#e2e4e6'], [.96, '#f1f2f3'], [1, '#ffffff']],
};
function lqPat(key, canvas) {
  const k = '_p_' + key; if (!LQ_TEX[k]) LQ_TEX[k] = X.createPattern(canvas, 'repeat'); return LQ_TEX[k];
}
// Fast pattern: a tile pre-scaled to the device scale (cached per quantised scale), placed with an integer device offset,
// so Chrome samples it 1:1 (≈1 ms per full frame instead of ≈8–17 ms for a scaled pattern). Falls back when rotated/skewed.
const LQ_SCALED = new Map();
function lqPatFast(key, canvas, o, base = 1) {
  const m = X.getTransform(), rot = o.rot || 0;
  const sxm = Math.hypot(m.a, m.b), sym = Math.hypot(m.c, m.d);
  if (rot || Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || Math.abs(sxm - sym) > 1e-4 || m.a < 0 || m.d < 0) return lqPatT(lqPat(key, canvas), o, base);
  const f = sxm * base * (o.scale ?? 1), q = Math.max(8, Math.round(canvas.width * f / 8) * 8), ck = key + '@' + q;
  let e = LQ_SCALED.get(ck);
  if (!e) {
    const c = mkCanvas(q, q), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(canvas, 0, 0, q, q);
    e = { c, p: X.createPattern(c, 'repeat') }; LQ_SCALED.set(ck, e);
    if (LQ_SCALED.size > 48) LQ_SCALED.delete(LQ_SCALED.keys().next().value);
  }
  // device position of the texture anchor, snapped to whole pixels; the pattern matrix maps device back to user space
  const ax = m.a * (o.ox || 0) + m.e, ay = m.d * (o.oy || 0) + m.f;
  e.p.setTransform(new DOMMatrix([1 / m.a, 0, 0, 1 / m.d, (Math.round(ax) - m.e) / m.a, (Math.round(ay) - m.f) / m.d]));
  return e.p;
}
function lqPatT(pat, o, base = 1) {
  const m = new DOMMatrix().translate(o.ox || 0, o.oy || 0).rotateSelf(((o.rot || 0) * 180) / Math.PI).scaleSelf(base * (o.scale ?? 1));
  pat.setTransform(m); return pat;
}

// ---------- texture builders ----------
// Gold / silver leaf: rows of slightly skewed square sheets laid overlapping, seams, wrinkles, tears, and crackle.
// Builds a luminance map plus a per-sheet "facet" map (how each sheet catches the light), then colourises.
function lqBuildLeaf() {
  if (LQ_TEX.leaf) return LQ_TEX.leaf;
  const S = 1024, SH = 128, r = rng(41);
  const lc = mkCanvas(S, S), g = lc.getContext('2d'), fc = mkCanvas(S, S), f = fc.getContext('2d');
  const gray = (v, a = 1) => `rgba(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)},${a})`;
  g.fillStyle = gray(.1); g.fillRect(0, 0, S, S); f.fillStyle = gray(0); f.fillRect(0, 0, S, S);
  const wrap = (fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };
  for (let j = 0; j < S / SH; j++) {
    const rowOff = r() * SH, rowY = j * SH + (r() - .5) * 8;
    for (let i = -1; i < S / SH; i++) {
      const x = i * SH + rowOff + (r() - .5) * 8, y = rowY + (r() - .5) * 5, w = SH + 5 + r() * 5, h = SH + 6 + r() * 4;
      const rot = (r() - .5) * .035, tone = .7 + (r() - .5) * .2, phi = r(), gx = (r() - .5) * .12, gy = (r() - .5) * .12;
      const wr = [0, 1, 2].map(() => [r(), r(), r(), r(), r()]);
      // torn edge outline (side index in [2]: 0 top, 1 left → the ridge is drawn on those)
      const edge = [], jag = () => (r() - .5) * 2.4 + (r() < .08 ? (r() - .5) * 7 : 0);
      for (let k = 0; k < 10; k++) edge.push([-w / 2 + w * k / 10, -h / 2 + jag(), 0]);
      for (let k = 0; k < 10; k++) edge.push([w / 2 + jag(), -h / 2 + h * k / 10, 2]);
      for (let k = 0; k < 10; k++) edge.push([w / 2 - w * k / 10, h / 2 + jag(), 3]);
      for (let k = 0; k < 10; k++) edge.push([-w / 2 + jag(), h / 2 - h * k / 10, 1]);
      edge.push([edge[0][0], edge[0][1], 0]);
      wrap((ox, oy) => {
        const cx = x + ox + w / 2, cy = y + oy + h / 2;
        if (cx < -SH || cx > S + SH || cy < -SH || cy > S + SH) return;
        g.save(); g.translate(cx, cy); g.rotate(rot);
        const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        gr.addColorStop(0, gray(clamp(tone + gx))); gr.addColorStop(1, gray(clamp(tone + gy)));
        g.fillStyle = gr; g.beginPath(); edge.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
        // overlap seam: a faint dark hairline under the torn edge and a light ridge just inside (the doubled leaf)
        g.strokeStyle = gray(tone - .2, .45); g.lineWidth = .9; g.stroke();
        g.strokeStyle = gray(tone + .1, .3); g.lineWidth = 2.2;
        g.beginPath(); for (let k = 0; k < edge.length; k++) { const p = edge[k]; if (p[2] > 1) continue; k && edge[k - 1][2] <= 1 ? g.lineTo(p[0] + 1.6, p[1] + 1.6) : g.moveTo(p[0] + 1.6, p[1] + 1.6); } g.stroke();
        // wrinkles: a fold is a light/dark pair
        for (const q of wr) {
          if (q[4] < .45) continue;
          const ax = (q[0] - .5) * w * .8, ay = (q[1] - .5) * h * .8, ang = q[2] * TAU, len = 12 + q[3] * 40;
          const bx = ax + Math.cos(ang) * len, by = ay + Math.sin(ang) * len, mx = (ax + bx) / 2 + Math.sin(ang) * 6, my = (ay + by) / 2 - Math.cos(ang) * 6;
          g.lineWidth = 1.1; g.strokeStyle = gray(tone + .16, .5); g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx, my, bx, by); g.stroke();
          g.strokeStyle = gray(tone - .16, .45); g.beginPath(); g.moveTo(ax + 1.2, ay + 1.2); g.quadraticCurveTo(mx + 1.2, my + 1.2, bx + 1.2, by + 1.2); g.stroke();
        }
        g.restore();
        f.save(); f.translate(cx, cy); f.rotate(rot); f.fillStyle = gray(phi); f.fillRect(-w / 2, -h / 2, w, h); f.restore();
      });
    }
  }
  // tears / pinholes where the leaf did not take (the lacquer shows)
  for (let i = 0; i < 55; i++) {
    const x = r() * S, y = r() * S, rad = .8 + Math.pow(r(), 4) * 6, n = 7, pts = [];
    for (let k = 0; k < n; k++) { const a = k / n * TAU, rr = rad * (.4 + r() * .9); pts.push([Math.cos(a) * rr * 1.5, Math.sin(a) * rr]); }
    const rot = r() * TAU;
    wrap((ox, oy) => { g.save(); g.translate(x + ox, y + oy); g.rotate(rot); g.fillStyle = gray(.12, .95); g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.restore(); });
  }
  // crackle: meandering branching cracks (craquelure under the lacquer coat)
  const cracks = [];
  for (let i = 0; i < 46; i++) {
    let x = r() * S, y = r() * S, a = r() * TAU; const pts = [[x, y]], n = 8 + Math.floor(r() * 26);
    for (let k = 0; k < n; k++) { a += (r() - .5) * 1.1; const st = 4 + r() * 7; x += Math.cos(a) * st; y += Math.sin(a) * st; pts.push([x, y]); }
    cracks.push({ pts, w: .6 + r() * .7 });
    if (r() < .6) { // a branch
      const b = pts[Math.floor(r() * pts.length)], bp = [[b[0], b[1]]]; let bx = b[0], by = b[1], ba = a + (r() < .5 ? 1.3 : -1.3);
      for (let k = 0; k < 6 + r() * 10; k++) { ba += (r() - .5) * 1; bx += Math.cos(ba) * 5; by += Math.sin(ba) * 5; bp.push([bx, by]); }
      cracks.push({ pts: bp, w: .5 + r() * .4 });
    }
  }
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const c of cracks) wrap((ox, oy) => {
    g.beginPath(); c.pts.forEach((p, k) => k ? g.lineTo(p[0] + ox, p[1] + oy) : g.moveTo(p[0] + ox, p[1] + oy));
    g.strokeStyle = gray(.16, .85); g.lineWidth = c.w; g.stroke();
    g.save(); g.translate(.9, .9); g.strokeStyle = gray(.92, .28); g.lineWidth = c.w * .8; g.stroke(); g.restore();
  });
  // pixel pass: grain + wrinkle noise, then colourise (base and lit variants for gold and silver)
  const L = g.getImageData(0, 0, S, S).data, Fd = f.getImageData(0, 0, S, S).data, r2 = rng(97);
  const out = {}, ramps = { gold: lqRamp(LQ_RAMP.gold), silver: lqRamp(LQ_RAMP.silver) };
  const lum = new Float32Array(S * S), lit = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, l = L[i * 4] / 255, on = clamp((l - .2) / .15);
    const n = lqPN(x / 96, y / 96, S / 96, 1) * .05 + lqPN(x / 22, y / 22, Math.round(S / 22), 2) * .035 + lqPN(x / 4, y / 4, S / 4, 3) * .02 + (r2() - .5) * .045;
    const coat = lqPN(x * 6 / S, y * 6 / S, 6, 8) * .5 + lqPN(x * 17 / S, y * 17 / S, 17, 9) * .3;   // uneven amber lacquer coat
    const v = clamp((l + n * on) * (1 - on * (.09 + coat * .09))), ph = Fd[i * 4] / 255;
    lum[i] = v; lit[i] = clamp(v + on * (.08 + .34 * Math.pow(ph, 1.6)));
  }
  for (const kind of ['gold', 'silver']) for (const variant of ['base', 'lit']) {
    const c = mkCanvas(S, S), cx = c.getContext('2d'), id = cx.createImageData(S, S), d = id.data, lut = ramps[kind], src = variant === 'base' ? lum : lit;
    for (let i = 0; i < S * S; i++) { const q = Math.round(src[i] * 255) * 3; d[i * 4] = lut[q]; d[i * 4 + 1] = lut[q + 1]; d[i * 4 + 2] = lut[q + 2]; d[i * 4 + 3] = 255; }
    cx.putImageData(id, 0, 0); out[kind + (variant === 'lit' ? 'Lit' : '')] = c;
  }
  return (LQ_TEX.leaf = out);
}

// Crushed-eggshell inlay: periodic Voronoi fragments with dark lacquer gaps, per-fragment tone and tilt, sub-cracks.
function lqBuildEgg() {
  if (LQ_TEX.egg) return LQ_TEX.egg;
  const S = 768, G = 28, cs = S / G, r = rng(13), pts = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const q = r(), n = q < .12 ? 0 : q < .72 ? 1 : q < .9 ? 2 : 4;   // big pieces, normal pieces, crushed clusters
    const ccx = i + .2 + r() * .6, ccy = j + .2 + r() * .6;
    for (let k = 0; k < n; k++) {
      const u = r(), tone = u < .6 ? 0 : u < .82 ? 1 : u < .95 ? 2 : 3, sp = n >= 4 ? .42 : 1;
      pts.push({ x: (ccx + (r() - .5) * sp) * cs, y: (ccy + (r() - .5) * sp) * cs, gi: i, gj: j, tone, sh: (r() - .5) * .16, ta: r() * TAU, gap: .45 + Math.pow(r(), 2) * 1.3, vary: (r() - .5) * .07 });
    }
  }
  const grid = []; for (let j = 0; j < G; j++) { grid.push([]); for (let i = 0; i < G; i++) grid[j].push([]); }
  pts.forEach((p, idx) => grid[p.gj][p.gi].push(idx));
  const TONES = [lqHex('#EFE5D2'), lqHex('#F8F3E8'), lqHex('#E4D2B2'), lqHex('#CDB690')], GAP = lqHex('#2a1a10');
  const c = mkCanvas(S, S), cx = c.getContext('2d'), id = cx.createImageData(S, S), d = id.data, r2 = rng(5);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const gi = Math.floor(x / cs), gj = Math.floor(y / cs);
    let d1 = 1e9, d2 = 1e9, b1 = null, b1x = 0, b1y = 0;
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const ii = gi + di, jj = gj + dj, wi = ((ii % G) + G) % G, wj = ((jj % G) + G) % G, ox = (ii - wi) * cs, oy = (jj - wj) * cs;
      for (const idx of grid[wj][wi]) {
        const p = pts[idx], px = p.x + ox, py = p.y + oy, dd = (px - x) * (px - x) + (py - y) * (py - y);
        if (dd < d1) { d2 = d1; d1 = dd; b1 = p; b1x = px; b1y = py; } else if (dd < d2) d2 = dd;
      }
    }
    const e = (Math.sqrt(d2) - Math.sqrt(d1)) * .5 + lqPN(x / 6, y / 6, S / 6, 4) * .35;  // ≈ distance to the cell edge, ragged
    const i4 = (y * S + x) * 4;
    if (e < b1.gap) { const v = .85 + r2() * .3; d[i4] = GAP[0] * v; d[i4 + 1] = GAP[1] * v; d[i4 + 2] = GAP[2] * v; d[i4 + 3] = 255; continue; }
    const T0 = TONES[b1.tone], tilt = ((x - b1x) * Math.cos(b1.ta) + (y - b1y) * Math.sin(b1.ta)) / cs;
    const edge = clamp((e - b1.gap) / 2.2), sh = 1 + b1.sh * .5 + tilt * .07 + b1.vary - (1 - edge) * .16 + (r2() - .5) * .05 + lqPN(x / 3, y / 3, S / 3, 6) * .025;
    d[i4] = clamp(T0[0] * sh, 0, 255); d[i4 + 1] = clamp(T0[1] * sh, 0, 255); d[i4 + 2] = clamp(T0[2] * sh * .99, 0, 255); d[i4 + 3] = 255;
  }
  cx.putImageData(id, 0, 0);
  // hairline sub-cracks inside fragments
  cx.lineCap = 'round';
  for (let i = 0; i < 520; i++) {
    const x = r() * S, y = r() * S, a = r() * TAU, l = 3 + r() * 9;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      if (x + ox < -20 || x + ox > S + 20 || y + oy < -20 || y + oy > S + 20) continue;
      cx.strokeStyle = 'rgba(40,26,18,.55)'; cx.lineWidth = .7; cx.beginPath(); cx.moveTo(x + ox, y + oy); cx.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); cx.stroke();
    }
  }
  return (LQ_TEX.egg = c);
}

// Lacquer ground: low-frequency depth clouds (brown layers under the black), per tone. Full-frame, half resolution.
function lqBuildGround(tone) {
  const key = 'ground_' + tone; if (LQ_TEX[key]) return LQ_TEX[key];
  const w = 960, h = 540, c = mkCanvas(w, h), cx = c.getContext('2d'), id = cx.createImageData(w, h), d = id.data, r = rng(3);
  const ramps = {
    black: [[0, '#070504'], [.45, '#120D0B'], [.7, '#1f140f'], [.88, '#3a2114'], [1, '#4A2A18']],
    brown: [[0, '#1a0e08'], [.4, '#35200f'], [.7, '#4A2A18'], [.9, '#6a3c20'], [1, '#7d4a28']],
    red: [[0, '#3a0907'], [.35, '#6E120D'], [.65, '#961d16'], [.88, '#B3261E'], [1, '#c83a26']],
    night: [[0, '#05070c'], [.45, '#0c111b'], [.75, '#152033'], [1, '#22324a']],
  };
  const lut = lqRamp(ramps[tone] || ramps.black);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = noise2(x / 150 + 3, y / 150) * .5 + noise2(x / 50, y / 50 + 7) * .3 + noise2(x / 14, y / 14) * .12 + noise2(x / 3, y / 3) * .05;
    const cloud = Math.pow(clamp(.5 + n * .75), 1.8);
    const v = clamp(.38 + cloud * .5 + (r() - .5) * .02), q = Math.round(v * 255) * 3, i = (y * w + x) * 4;
    d[i] = lut[q]; d[i + 1] = lut[q + 1]; d[i + 2] = lut[q + 2]; d[i + 3] = 255;
  }
  cx.putImageData(id, 0, 0);
  return (LQ_TEX[key] = c);
}
// Dust and polish scratches (light, transparent). Periodic 1024 tile.
function lqBuildDust() {
  if (LQ_TEX.dust) return LQ_TEX.dust;
  const S = 1024, c = mkCanvas(S, S), g = c.getContext('2d'), r = rng(77);
  g.lineCap = 'round';
  const wrap = fn => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };
  // polishing swirls: short arcs of big circles
  for (let i = 0; i < 520; i++) {
    const x = r() * S, y = r() * S, R = 30 + r() * 260, a0 = r() * TAU, da = (.04 + r() * .18) * (r() < .5 ? 1 : -1), a = .06 + r() * .22, lw = .4 + r() * .7;
    wrap((ox, oy) => { if (x + ox < -300 || x + ox > S + 300 || y + oy < -300 || y + oy > S + 300) return; g.strokeStyle = `rgba(255,244,228,${a})`; g.lineWidth = lw; g.beginPath(); g.arc(x + ox, y + oy, R, a0, a0 + da, da < 0); g.stroke(); });
  }
  // long straight scratches
  for (let i = 0; i < 40; i++) {
    const x = r() * S, y = r() * S, ang = r() * TAU, l = 60 + r() * 260, a = .08 + r() * .2;
    wrap((ox, oy) => { g.strokeStyle = `rgba(255,248,236,${a})`; g.lineWidth = .5; g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(ang) * l, y + oy + Math.sin(ang) * l); g.stroke(); });
  }
  // dust specks
  for (let i = 0; i < 1600; i++) { const x = r() * S, y = r() * S, s = .6 + Math.pow(r(), 4) * 2.6; g.fillStyle = `rgba(255,240,220,${.15 + r() * .5})`; g.fillRect(x, y, s, s * (.6 + r() * .8)); }
  return (LQ_TEX.dust = c);
}
// Soft grey mottling tile (for lacquer fills: layered depth).
function lqBuildMottle() {
  if (LQ_TEX.mottle) return LQ_TEX.mottle;
  const S = 512, c = mkCanvas(S, S), cx = c.getContext('2d'), id = cx.createImageData(S, S), d = id.data, r = rng(19);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = lqPN(x / 64, y / 64, 8, 11) * .55 + lqPN(x / 16, y / 16, 32, 12) * .3 + lqPN(x / 4, y / 4, 128, 13) * .1 + (r() - .5) * .08;
    // alpha-coded: dark clouds are black with alpha, light ones white with alpha (drawn source-over, cheap)
    const i = (y * S + x) * 4, v = clamp(n * .9, -1, 1); d[i] = d[i + 1] = d[i + 2] = v > 0 ? 255 : 0; d[i + 3] = Math.round(Math.abs(v) * 255 * .14);
  }
  cx.putImageData(id, 0, 0); return (LQ_TEX.mottle = c);
}

// ---------- bounding boxes and cheap layers ----------
// Device-space box [x, y, w, h] of a user-space rect under the current transform (clamped to the canvas, padded).
function lqDevBox(r, m = X.getTransform(), pad = 6) {
  const cs = [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0], r[1] + r[3]], [r[0] + r[2], r[1] + r[3]]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  return lqClampBox(Math.min(...cs.map(c => c[0])) - pad, Math.min(...cs.map(c => c[1])) - pad, Math.max(...cs.map(c => c[0])) + pad, Math.max(...cs.map(c => c[1])) + pad);
}
function lqClampBox(x0, y0, x1, y1) {
  const cw = Math.round(W * SX), ch = Math.round(H * SX);
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(cw, Math.ceil(x1)); y1 = Math.min(ch, Math.ceil(y1));
  return x1 > x0 && y1 > y0 ? [x0, y0, x1 - x0, y1 - y0] : null;
}
// Device bounds of a path builder, found by running it against a recording proxy (control points count, so it is conservative).
function lqPathBox(pathFn, pad = 6) {
  const real = X, stack = []; let cm = X.getTransform(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const P = (x, y) => { const dx = cm.a * x + cm.c * y + cm.e, dy = cm.b * x + cm.d * y + cm.f; if (dx < x0) x0 = dx; if (dx > x1) x1 = dx; if (dy < y0) y0 = dy; if (dy > y1) y1 = dy; };
  const B = (x, y, rx, ry) => { P(x - rx, y - ry); P(x + rx, y - ry); P(x - rx, y + ry); P(x + rx, y + ry); };
  const rec = {
    beginPath() {}, closePath() {}, moveTo: P, lineTo: P,
    quadraticCurveTo(a, b, c, d) { P(a, b); P(c, d); }, bezierCurveTo(a, b, c, d, e, f) { P(a, b); P(c, d); P(e, f); }, arcTo(a, b, c, d) { P(a, b); P(c, d); },
    arc(x, y, r) { B(x, y, r, r); }, ellipse(x, y, rx, ry) { const r = Math.max(rx, ry); B(x, y, r, r); },
    rect(x, y, w, h) { P(x, y); P(x + w, y); P(x, y + h); P(x + w, y + h); }, roundRect(x, y, w, h) { this.rect(x, y, w, h); },
    save() { stack.push(cm); }, restore() { cm = stack.pop() || cm; }, translate(x, y) { cm = cm.translate(x, y); },
    rotate(a) { cm = cm.rotate(a * 180 / Math.PI); }, scale(a, b) { cm = cm.scale(a, b ?? a); }, getTransform() { return cm; },
  };
  const px = new Proxy(rec, { get: (t, k) => k in t ? t[k] : (typeof real[k] === 'function' ? () => {} : real[k]), set: () => true });
  let ok = true; X = px; try { pathFn(); } catch (e) { ok = false; } finally { X = real; }
  if (!ok || x0 > x1) return lqClampBox(0, 0, 1e9, 1e9);
  return lqClampBox(x0 - pad, y0 - pad, x1 + pad, y1 + pad);
}
// Offscreen layer that only clears the region it last used (so small shapes cost little).
const LQ_LAY = {};
function lqLayer(name, box) {
  const w = Math.round(W * SX), h = Math.round(H * SX); let c = LQ_LAY[name];
  if (!c || c.width !== w || c.height !== h) { c = LQ_LAY[name] = mkCanvas(w, h); c.x = c.getContext('2d'); c.dirty = [0, 0, w, h]; }
  const x = c.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
  if (c.dirty) x.clearRect(c.dirty[0], c.dirty[1], c.dirty[2], c.dirty[3]);
  c.dirty = box; return c;
}
function lqOnLayer(name, box, fn) { const c = lqLayer(name, box), prev = X; X = c.x; X.save(); try { fn(); } finally { X.restore(); X = prev; } return c; }
function lqBlitBox(c, box, alpha = 1, op = 'source-over') {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = alpha; X.globalCompositeOperation = op;
  X.drawImage(c, box[0], box[1], box[2], box[3], box[0], box[1], box[2], box[3]); X.restore();
}

// ---------- the glint / sheen band ----------
// A soft band perpendicular to angle `ang`. With bounds [x,y,w,h] it sweeps across the bounds in the current user space,
// otherwise across the screen. k: 0..1 position. Returns a gradient (caller must draw in the matching space).
function lqBand(k, o = {}, stops = [[0, 0], [.5, 1], [1, 0]], col = [255, 255, 255]) {
  const ang = o.glintAng ?? -.95, dx = Math.cos(ang), dy = Math.sin(ang);
  const b = o.bounds || [0, 0, W, H], cs = [[b[0], b[1]], [b[0] + b[2], b[1]], [b[0], b[1] + b[3]], [b[0] + b[2], b[1] + b[3]]];
  const pr = cs.map(p => p[0] * dx + p[1] * dy), p0 = Math.min(...pr), p1 = Math.max(...pr);
  const bw = o.glintW ?? (p1 - p0) * .22, p = lerp(p0 - bw, p1 + bw, k), cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
  const c0 = cx * dx + cy * dy, ox = cx + dx * (p - c0), oy = cy + dy * (p - c0);
  const gr = X.createLinearGradient(ox - dx * bw, oy - dy * bw, ox + dx * bw, oy + dy * bw);
  for (const [s, a] of stops) gr.addColorStop(s, `rgba(${col[0]},${col[1]},${col[2]},${a})`);
  return gr;
}
const lqDefaultGlint = () => frac(T * .09 + .2);

// ---------- shapes: paths and text share one interface ----------
function lqShapePath(pathFn) {
  return {
    box: pad => lqPathBox(pathFn, pad),
    fill: st => { X.beginPath(); pathFn(); X.fillStyle = st; X.fill(); },
    stroke: (st, lw) => { X.beginPath(); pathFn(); X.strokeStyle = st; X.lineWidth = lw; X.lineJoin = 'round'; X.stroke(); },
    clip: () => { X.beginPath(); pathFn(); X.clip(); },
  };
}
function lqShapeText(str, x0, y, fnt, tracking = 0, base = 'alphabetic') {
  const L = tracking ? layout(str, fnt, tracking) : null;
  const each = fn => { X.font = fnt; X.textBaseline = base; X.textAlign = 'left'; if (!L) fn(str, x0); else for (const l of L) fn(l.ch, x0 + l.x); };
  const tw = L ? L.width : (X.save(), X.font = fnt, X.measureText(str).width + (X.restore(), 0)), sz = parseFloat(fnt.match(/(\d+(?:\.\d+)?)px/)[1]);
  return {
    text: true,
    box: pad => lqDevBox([x0 - sz * .2, y - sz * 1.3, tw + sz * .4, sz * 1.75], X.getTransform(), pad),
    fill: st => { X.fillStyle = st; each((s, x) => X.fillText(s, x, y)); },
    stroke: (st, lw) => { X.strokeStyle = st; X.lineWidth = lw; X.lineJoin = 'round'; each((s, x) => X.strokeText(s, x, y)); },
  };
}
// Raised-edge drop shadow under a shape.
function lqLiftShadow(sh, lift, col = 'rgba(0,0,0,.62)') {
  if (!lift) return;
  X.save(); X.shadowColor = col; X.shadowBlur = lift * 1.6; X.shadowOffsetX = lift * .35; X.shadowOffsetY = lift;
  sh.fill(LQ_PAL.ink); X.restore();
}
// Bevel: light on the upper-left inner edge, dark on the lower-right (paths clip; text uses stroke offsets).
function lqBevel(sh, w, hi = 'rgba(255,248,225,.55)', lo = 'rgba(0,0,0,.5)') {
  if (!w) return;
  X.save();
  if (sh.clip) {
    sh.clip();
    X.translate(w * .7, w * .7); sh.stroke(hi, w); X.translate(-w * 1.4, -w * 1.4); sh.stroke(lo, w * 1.2);
  }
  X.restore();
}

// ---------- leaf (gold / silver) ----------
// fill a shape with leaf. kind 'gold'|'silver'
function lqLeafShape(kind, sh, o = {}) {
  const tex = lqBuildLeaf();
  X.save();
  if (o.alpha !== undefined) X.globalAlpha = o.alpha;
  lqLiftShadow(sh, o.lift);
  sh.fill(lqPatFast(kind, tex[kind], o, .62));
  X.restore();
  // travelling specular glint: the brighter "lit" leaf, masked by a moving band (sheet by sheet it flares)
  const gk = o.glint === undefined ? lqDefaultGlint() : o.glint;
  if (gk !== false && gk !== null) {
    const m = X.getTransform(), bx = sh.box(4);
    if (bx) {
    const Lg = lqOnLayer('_lqGlint', bx, () => {
      X.beginPath(); X.rect(bx[0], bx[1], bx[2], bx[3]); X.clip();
      // only the band can light up: clip to it so the lit fill and the compositing stay small
      const bb = o.bounds || [0, 0, W, H], ang = o.glintAng ?? -.95, ca = Math.cos(ang), sa = Math.sin(ang);
      const pr = [[bb[0], bb[1]], [bb[0] + bb[2], bb[1]], [bb[0], bb[1] + bb[3]], [bb[0] + bb[2], bb[1] + bb[3]]].map(p => p[0] * ca + p[1] * sa);
      const bw = o.glintW ?? (Math.max(...pr) - Math.min(...pr)) * .22;
      if (o.bounds) X.setTransform(m); else X.setTransform(SX, 0, 0, SX, 0, 0);
      lqBandPoly(gk, ang, bw, bb); X.setTransform(1, 0, 0, 1, 0, 0); X.clip();
      X.setTransform(m); sh.fill(lqPatFast(kind + 'Lit', tex[kind + 'Lit'], o, .62));
      X.globalCompositeOperation = 'destination-in';
      if (!o.bounds) X.setTransform(SX, 0, 0, SX, 0, 0);
      X.fillStyle = lqBand(gk, o, [[0, 0], [.3, .35], [.5, 1], [.7, .35], [1, 0]]);
      if (o.bounds) X.fillRect(o.bounds[0] - 4000, o.bounds[1] - 4000, o.bounds[2] + 8000, o.bounds[3] + 8000); else X.fillRect(0, 0, W, H);
      // hot core: a whiter flare in the middle of the band
      X.globalCompositeOperation = 'source-atop'; X.fillStyle = lqBand(gk, { ...o, glintW: (o.glintW ?? 300) * .25 }, [[0, 0], [.5, kind === 'gold' ? .35 : .45], [1, 0]], kind === 'gold' ? [255, 246, 214] : [255, 255, 255]);
      if (o.bounds) X.fillRect(o.bounds[0] - 4000, o.bounds[1] - 4000, o.bounds[2] + 8000, o.bounds[3] + 8000); else X.fillRect(0, 0, W, H);
    });
    lqBlitBox(Lg, bx, (o.alpha ?? 1) * (o.glintA ?? 1));
    }
  }
  if (o.shade) { X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha; X.globalCompositeOperation = 'multiply'; sh.fill(`rgba(60,40,30,${o.shade})`); X.restore(); }
  if (o.bevel !== 0 && sh.clip) { X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha; lqBevel(sh, o.bevel ?? 2.2, kind === 'gold' ? 'rgba(255,244,200,.6)' : 'rgba(255,255,255,.6)', 'rgba(20,10,4,.55)'); X.restore(); }
}
function lqGold(pathFn, o = {}) { lqLeafShape('gold', lqShapePath(pathFn), o); }
function lqSilver(pathFn, o = {}) { lqLeafShape('silver', lqShapePath(pathFn), o); }

// ---------- eggshell ----------
function lqEggShape(sh, o = {}) {
  X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha;
  lqLiftShadow(sh, o.lift);
  sh.fill(lqPatFast('egg', lqBuildEgg(), o, .5));
  if (o.tint) { X.globalCompositeOperation = 'multiply'; sh.fill(o.tint); X.globalCompositeOperation = 'source-over'; }
  // polished lacquer over the shell: a soft gloss band
  const gk = o.glint === undefined ? lqDefaultGlint() : o.glint;
  if (gk !== false && gk !== null) {
    X.globalCompositeOperation = 'screen';
    const stops = [[0, 0], [.5, o.gloss ?? .3], [1, 0]];
    if (o.bounds) sh.fill(lqBand(gk, o, stops));
    else if (sh.clip) { X.save(); sh.clip(); X.setTransform(SX, 0, 0, SX, 0, 0); X.fillStyle = lqBand(gk, o, stops); X.fillRect(0, 0, W, H); X.restore(); }
    X.globalCompositeOperation = 'source-over';
  }
  X.restore();
  if (o.bevel !== 0 && sh.clip) lqBevel(sh, o.bevel ?? 2, 'rgba(255,255,250,.5)', 'rgba(20,10,4,.6)');
}
function lqEggshell(pathFn, o = {}) { lqEggShape(lqShapePath(pathFn), o); }

// ---------- flat glossy lacquer ----------
// Estimate of the visible frame in the current user space (for gradients when no bounds are given).
function lqUserBox() {
  const m = X.getTransform().inverse(), c = [[0, 0], [X.canvas.width, 0], [0, X.canvas.height], [X.canvas.width, X.canvas.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}
function lqLacquer(pathFn, color, o = {}) {
  const sh = lqShapePath(pathFn), b = o.bounds || lqUserBox(), C = lqHex(color);
  X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha;
  lqLiftShadow(sh, o.lift ?? 0);
  // vertical sheen: lighter under the light, deep at the bottom
  const g = X.createLinearGradient(0, b[1], 0, b[1] + b[3]), sn = o.sheen ?? 1;
  g.addColorStop(0, lqMix(C, [255, 236, 214], .16 * sn)); g.addColorStop(.35, lqMix(C, C, 0)); g.addColorStop(1, lqMix(C, [8, 4, 3], .42 * sn));
  sh.fill(g);
  X.save(); sh.clip();
  // layered depth: soft mottling
  if (o.mottle !== 0) { X.globalAlpha *= (o.mottle ?? .22) / .22; X.fillStyle = lqPatFast('mottleA', lqBuildMottle(), o, 1.2); X.fillRect(b[0] - 50, b[1] - 50, b[2] + 100, b[3] + 100); X.globalAlpha = o.alpha ?? 1; }
  // polish: a broad gloss band + a thin mirror line
  const gk = o.glint === undefined ? lqDefaultGlint() : o.glint;
  if (gk !== false && gk !== null) {
    X.globalCompositeOperation = 'screen';
    X.fillStyle = lqBand(gk, { ...o, bounds: b }, [[0, 0], [.5, .16], [1, 0]], [255, 230, 205]); X.fillRect(b[0], b[1], b[2], b[3]);
    X.fillStyle = lqBand(gk, { ...o, bounds: b, glintW: Math.max(b[2], b[3]) * .05 }, [[0, 0], [.5, .12], [1, 0]], [255, 245, 230]); X.fillRect(b[0], b[1], b[2], b[3]);
  }
  X.globalCompositeOperation = 'source-over';
  // thin darker rim, then a hairline highlight on the upper-left edge
  const rim = o.rim ?? 3;
  if (rim) { sh.stroke(lqMix(C, [0, 0, 0], .55, .9), rim * 2); X.translate(1.2, 1.2); sh.stroke(lqMix(C, [255, 240, 220], .45, .35), 1.2); }
  X.restore(); X.restore();
}

// ---------- ground ----------
// Static part of the ground (depth clouds, faint dust, warm reflection pool), baked per tone at output scale with a margin for parallax.
function lqGroundBake(tone) {
  const key = 'gbake_' + tone + '_' + SX; if (LQ_TEX[key]) return LQ_TEX[key];
  const mw = 60, mh = 40, c = mkCanvas(Math.round((W + mw * 2) * SX), Math.round((H + mh * 2) * SX)), prev = X; X = c.getContext('2d');
  try {
    X.setTransform(SX, 0, 0, SX, mw * SX, mh * SX);
    X.drawImage(lqBuildGround(tone), -mw, -mh, W + mw * 2, H + mh * 2);
    X.globalCompositeOperation = 'screen'; X.globalAlpha = .16; const dust = X.createPattern(lqBuildDust(), 'repeat'); X.fillStyle = dust; X.fillRect(-mw, -mh, W + mw * 2, H + mh * 2);
    X.globalAlpha = 1; const warm = tone === 'night' ? '200,220,255' : '255,222,188';
    const pool = X.createRadialGradient(W * .28, -H * .15, 40, W * .28, -H * .15, H * 1.25); pool.addColorStop(0, `rgba(${warm},.09)`); pool.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = pool; X.fillRect(-mw, -mh, W + mw * 2, H + mh * 2);
    X.globalCompositeOperation = 'source-over';   // vignette (baked: it drifts with the small parallax, which reads as the panel moving)
    const v = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); X.fillStyle = v; X.fillRect(-mw, -mh, W + mw * 2, H + mh * 2);
  } finally { X = prev; }
  c.mw = mw; c.mh = mh; return (LQ_TEX[key] = c);
}
// Fill only the strip |(p - c)·d| < bw (a band polygon) in the current user space.
function lqBandPoly(k, ang, bw, box) {
  const dx = Math.cos(ang), dy = Math.sin(ang), cs = [[box[0], box[1]], [box[0] + box[2], box[1]], [box[0], box[1] + box[3]], [box[0] + box[2], box[1] + box[3]]];
  const pr = cs.map(p => p[0] * dx + p[1] * dy), p0 = Math.min(...pr), p1 = Math.max(...pr), p = lerp(p0 - bw, p1 + bw, k), L = 4000;
  const ox = dx * p, oy = dy * p, tx = -dy, ty = dx;
  X.beginPath(); X.moveTo(ox - dx * bw - tx * L, oy - dy * bw - ty * L); X.lineTo(ox + dx * bw - tx * L, oy + dy * bw - ty * L); X.lineTo(ox + dx * bw + tx * L, oy + dy * bw + ty * L); X.lineTo(ox - dx * bw + tx * L, oy - dy * bw + ty * L); X.closePath();
}
function lqGround(t, o = {}) {
  const tone = o.tone || 'black', cam = o.camX || 0, bake = lqGroundBake(tone);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  X.drawImage(bake, Math.round((-bake.mw + Math.sin(cam * .0015) * 40) * SX), Math.round(-bake.mh * SX));
  X.restore();
  // the polish: a broad highlight band that sweeps with t / the camera, and a mirror line inside it
  const sx = o.sheenX ?? ((.5 + .55 * Math.sin(t * .23 + .6)) - cam / W * .6), sk = frac(sx * .8 + .1), sn = o.sheen ?? 1;
  const warm = tone === 'night' ? [200, 220, 255] : [255, 222, 188], ang = -.62, full = [0, 0, W, H];
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  lqBandPoly(sk, ang, 620, full); X.fillStyle = lqBand(sk, { glintAng: ang, glintW: 620 }, [[0, 0], [.25, .025 * sn], [.5, .085 * sn], [.75, .025 * sn], [1, 0]], warm); X.fill();
  lqBandPoly(sk, ang, 90, full); X.fillStyle = lqBand(sk, { glintAng: ang, glintW: 90 }, [[0, 0], [.5, .07 * sn], [1, 0]], [255, 240, 225]); X.fill();
  // polish scratches only where the sheen catches them (nested strips approximate the falloff)
  const dA = o.dust ?? 1;
  if (dA > 0) {
    const dust = lqPat('dust', lqBuildDust()); dust.setTransform(new DOMMatrix().translate(-cam * .9, 0)); X.fillStyle = dust;
    for (const [bw, a] of [[520, .3], [300, .3], [140, .35]]) { X.globalAlpha = a * dA; lqBandPoly(sk, ang, bw, full); X.fill(); }
  }
  X.restore();
}

// ---------- sanding ----------
// Stroke parameters are generated once per (seed, region, n) and cached; drawing is a pure function of k.
const LQ_SANDC = new Map();
function lqSandStrokes(seed, reg, o) {
  const key = [seed, reg.join(','), o.n || 0, o.angle ?? '', o.from || '', o.spread ?? ''].join('|');
  if (LQ_SANDC.has(key)) return LQ_SANDC.get(key);
  const r = rng(seed * 7.31 + 1.7), [rx, ry, rw, rh] = reg, base = Math.sqrt(rw * rh), n = o.n || Math.round(40 + 120 * clamp(rw * rh / (W * H)));
  const ang0 = o.angle ?? -.38, out = [];
  for (let i = 0; i < n; i++) {
    const u = r(), v = r(), jitter = r();
    let ord = r();
    if (o.from === 'left') ord = u * .75 + jitter * .25; else if (o.from === 'right') ord = (1 - u) * .75 + jitter * .25;
    else if (o.from === 'top') ord = v * .75 + jitter * .25; else if (o.from === 'bottom') ord = (1 - v) * .75 + jitter * .25;
    else if (o.from === 'center') ord = Math.hypot(u - .5, v - .5) * 1.25 + jitter * .2;
    const s = { x: rx - rw * .05 + u * rw * 1.1, y: ry - rh * .05 + v * rh * 1.1, ki: ord * .78, a: ang0 + (r() - .5) * .3, L: base * (.26 + r() * .36), Wd: base * (.025 + r() * .04), prof: [], streaks: [], specks: [], scr: [] };
    for (let k = 0; k <= 16; k++) s.prof.push([.72 + r() * .5, .72 + r() * .5]);
    for (let k = 0; k < 16; k++) s.streaks.push({ v: (r() - .5) * 2.5, a: -1.2 + r() * .9, b: .3 + r() * .95, lw: .8 + r() * 3.2, al: .25 + r() * .6, bend: (r() - .5) * .3 });
    for (let k = 0; k < 46; k++) s.specks.push({ u: r() * 2 - 1, side: r() < .5 ? -1 : 1, d: .85 + r() * .9, sz: .7 + r() * 2.2, al: .3 + r() * .7 });
    for (let k = 0; k < 3; k++) s.scr.push({ v: (r() - .5) * 2, a: -1.6 + r(), b: .6 + r(), al: .3 + r() * .5 });
    out.push(s);
  }
  LQ_SANDC.set(key, out); return out;
}
// The sanding mask (white = rubbed away), drawn in screen space. Returns the layer.
// o.res < 1 paints the mask at reduced resolution (the canvas is then smaller than the frame: draw it scaled).
function lqSand(k, seed = 1, o = {}) {
  const reg = o.region || [0, 0, W, H], name = o.name || '_lqSand', dil = o.dilate || 0, res = o.res ?? 1;
  const cw = Math.round(W * SX * res), ch = Math.round(H * SX * res);
  let c = LQ_LAY[name]; if (!c || c.width !== cw || c.height !== ch) { c = LQ_LAY[name] = mkCanvas(cw, ch); c.x = c.getContext('2d'); }
  c.x.setTransform(1, 0, 0, 1, 0, 0); c.x.globalCompositeOperation = 'source-over'; c.x.globalAlpha = 1; c.x.clearRect(0, 0, cw, ch); c.x.setTransform(SX * res, 0, 0, SX * res, 0, 0);
  const prev = X; X = c.x; X.save();
  try { lqSandPaint(k, seed, o, reg, dil); } finally { X.restore(); X = prev; }
  return c;
}
function lqSandPaint(k, seed, o, reg, dil) {
  {
    if (k <= 0) return;
    if (k >= 1) { X.fillStyle = '#fff'; X.fillRect(reg[0], reg[1], reg[2], reg[3]); return; }
    if (o.clip) { X.beginPath(); X.rect(reg[0], reg[1], reg[2], reg[3]); X.clip(); }
    const S = lqSandStrokes(seed, reg, o);
    X.lineCap = 'round'; X.lineJoin = 'round';
    for (const s of S) {
      const g = clamp((k - s.ki) / .26); if (g <= 0) continue;
      const eg = easeOut(g), L = s.L * (.35 + .65 * eg), wd = s.Wd * (.3 + .7 * eg);
      X.save(); X.translate(s.x, s.y); X.rotate(s.a);
      if (dil) X.scale(1 + dil * 2 / L, 1 + dil / Math.max(4, wd * .6));   // dilated copy for the halo: a scaled fill, no wide strokes
      // thinning wash: the top coat worn translucent around the scrub
      X.fillStyle = `rgba(255,255,255,${.16 * g})`; X.beginPath(); X.ellipse(0, 0, L * .58, wd * 1.7, 0, 0, TAU); X.fill();
      // rough-edged core: rubbed through
      X.fillStyle = `rgba(255,255,255,${Math.min(1, .35 + g * .85)})`;
      X.beginPath();
      for (let q = 0; q <= 16; q++) { const u = q / 16 * 2 - 1, hw = wd * Math.pow(Math.max(0, 1 - u * u), .4) * s.prof[q][0]; if (q) X.lineTo(u * L / 2, -hw); else X.moveTo(u * L / 2, -hw); }
      for (let q = 16; q >= 0; q--) { const u = q / 16 * 2 - 1, hw = wd * Math.pow(Math.max(0, 1 - u * u), .4) * s.prof[q][1]; X.lineTo(u * L / 2, hw); }
      X.closePath(); X.fill();
      // scrub streaks along the sanding direction (these make the ragged, brushy edge), batched in 3 alpha buckets
      const sc = wd / 40, ga = Math.min(1, g * 1.6);
      for (let bk = 0; bk < 3; bk++) {
        X.strokeStyle = `rgba(255,255,255,${(.3 + bk * .25) * ga})`; X.lineWidth = (1 + bk * 1.2) * (.6 + eg * .6) * sc; X.beginPath();
        for (let q = bk; q < s.streaks.length; q += 3) { const st = s.streaks[q], a = st.a * L / 2, b = st.b * L / 2, vv = st.v * wd; X.moveTo(a, vv); X.quadraticCurveTo((a + b) / 2, vv + st.bend * wd, b, vv + st.bend * wd * .3); }
        X.stroke();
      }
      if (dil) { X.restore(); continue; }
      // long fine scratches
      X.lineWidth = .8; X.strokeStyle = `rgba(255,255,255,${.5 * g})`; X.beginPath();
      for (const q of s.scr) { X.moveTo(q.a * L / 2, q.v * wd); X.lineTo(q.b * L / 2, q.v * wd + 2); } X.stroke();
      // abrasion speckle around the edge (two alpha buckets)
      for (let bk = 0; bk < 2; bk++) {
        X.fillStyle = `rgba(255,255,255,${(.4 + bk * .45) * g})`; X.beginPath();
        for (let q = bk; q < s.specks.length; q += 2) { const p = s.specks[q], hw = wd * Math.pow(Math.max(0, 1 - p.u * p.u), .4); X.rect(p.u * L / 2, p.side * hw * p.d, p.sz, p.sz * .8); }
        X.fill();
      }
      X.restore();
    }
    // the last scraps go at the very end
    if (k > .9) { X.fillStyle = `rgba(255,255,255,${easeIn((k - .9) / .1)})`; X.fillRect(reg[0], reg[1], reg[2], reg[3]); }
  }
}
// Paint bottom, then top with the sanded holes. The rubbed edge shows a brown under-layer halo (sơn mài layers).
function lqReveal(drawBottom, drawTop, k, seed = 1, o = {}) {
  drawBottom();
  if (k >= 1) return;
  const m = X.getTransform(), sfx = o.name || '';
  const top = onLayer('_lqTop' + sfx, () => { X.setTransform(m); drawTop(); });
  if (k > 0) {
    const res = o.res ?? .5, mask = lqSand(k, seed, { ...o, res, name: '_lqSand' + sfx });
    const tx = top.x, rb = o.region ? lqDevBox(o.region, new DOMMatrix([SX, 0, 0, SX, 0, 0]), 40) : [0, 0, top.width, top.height];
    tx.save(); tx.setTransform(1, 0, 0, 1, 0, 0);
    if (rb) { tx.beginPath(); tx.rect(rb[0], rb[1], rb[2], rb[3]); tx.clip(); }
    if (o.halo !== null) {
      // the rubbed edge: a dilated copy of the scrubs, tinted with the under-layer colour, laid on the top coat
      const hl = lqSand(k, seed, { ...o, res, name: '_lqHalo' + sfx, dilate: o.haloW ?? 6 });
      hl.x.save(); hl.x.setTransform(1, 0, 0, 1, 0, 0); hl.x.globalCompositeOperation = 'source-in'; hl.x.fillStyle = o.halo || '#6a3a1c'; hl.x.fillRect(0, 0, hl.width, hl.height); hl.x.restore();
      tx.globalCompositeOperation = 'source-atop'; tx.globalAlpha = o.haloA ?? .6; tx.drawImage(hl, 0, 0, top.width, top.height);
    }
    tx.globalAlpha = 1; tx.globalCompositeOperation = 'destination-out'; tx.drawImage(mask, 0, 0, top.width, top.height);
    tx.restore();
  }
  blit(top);
}

// ---------- inlaid type ----------
function lqInlayText(str, x, y, o = {}) {
  const size = o.size || 160, fnt = o.font || FONT.vn(size), tr = o.tracking || 0, mat = o.material || 'gold';
  X.save(); X.font = fnt;
  const w = layout(str, fnt, tr).width;
  let x0 = x; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w;
  const sh = lqShapeText(str, x0, y, fnt, tr, o.base || 'alphabetic'), d = o.depth ?? Math.max(1.5, size * .022);
  const bounds = o.bounds || [x0, y - size * .9, w, size * 1.1];
  // carved groove: a lighter lip where the lacquer surface breaks, then the dark cut channel
  if (o.groove !== 0) {
    X.save(); X.translate(d * .5, d * .8); sh.stroke('rgba(120,80,50,.35)', size * .07); X.restore();
    sh.stroke('rgba(4,2,1,.95)', size * (o.groove ?? .05));
  }
  const mo = { scale: o.scale ?? .55, glint: o.glint, glintW: o.glintW, glintAng: o.glintAng, bounds: o.glintScreen ? undefined : bounds, bevel: 0, ox: o.ox ?? x0, oy: o.oy ?? y };
  if (mat === 'egg') lqEggShape(sh, { ...mo, scale: o.scale ?? .45, bounds });
  else if (mat === 'red') { sh.fill(LQ_PAL.cinnabar); }
  else lqLeafShape(mat, sh, mo);
  // inner shadow (top-left, the lacquer lip over the inlay) and bevel highlight (bottom-right)
  const m = X.getTransform();
  const bx = sh.box(8);
  if (bx) {
    const Ls = lqOnLayer('_lqIn', bx, () => { X.setTransform(m); sh.fill('rgba(10,5,2,1)'); X.globalCompositeOperation = 'destination-out'; X.translate(d, d * 1.2); sh.fill('#000'); });
    lqBlitBox(Ls, bx, .55);
    const Lh = lqOnLayer('_lqIn', bx, () => { X.setTransform(m); sh.fill(mat === 'silver' ? '#FFFFFF' : mat === 'egg' ? '#FFFDF6' : LQ_PAL.goldWhite); X.globalCompositeOperation = 'destination-out'; X.translate(-d * .6, -d * .7); sh.fill('#000'); });
    lqBlitBox(Lh, bx, .55);
  }
  X.restore();
  return { x0, w };
}

// ---------- silver-leaf Clawd (the Visitor's crew, rap verse) ----------
function lqClawd(x, y, s, o = {}) {
  const sq = o.squash || 0, bw = s * (1 + sq * .18), bh = s * .62 * (1 - sq * .22), legH = s * .2 * (1 - sq * .4), lift = o.lift ?? Math.max(4, s * .05);
  const mat = o.material || 'silver', leaf = mat === 'gold' ? lqGold : lqSilver, glint = o.glint;
  const leafO = extra => ({ scale: s / 520, glint, bevel: Math.max(1, s * .012), ...extra });
  X.save(); X.translate(x, y - (o.jump || 0)); if (o.flip) X.scale(-1, 1); X.rotate(o.lean || 0);
  const by = -legH - bh;
  // ground shadow
  X.save(); X.fillStyle = 'rgba(0,0,0,.45)'; X.beginPath(); X.ellipse(0, (o.jump || 0) + 2, bw * .55, s * .045, 0, 0, TAU); X.fill(); X.restore();
  [-.36, -.13, .13, .36].forEach((u, i) => {
    const ph = o.step !== undefined ? Math.sin(o.step * Math.PI + i * Math.PI) * .5 + .5 : 0, lh = legH * (1 - ph * .45);
    leaf(() => X.roundRect(u * bw - s * .055, -legH - s * .02, s * .11, lh + s * .02, s * .02), leafO({ shade: .75, lift: lift * .5 }));
  });
  const arms = o.arms || [0, 0];
  [-1, 1].forEach((sd, i) => withT(sd * bw * .5, by + bh * .45, -sd * (arms[i] || 0) * 2.2, 1, () =>
    leaf(() => X.roundRect(sd > 0 ? 0 : -s * .2, -s * .07, s * .2, s * .14, s * .03), leafO({ shade: .15, lift: lift * .6 }))));
  leaf(() => X.roundRect(-bw / 2, by, bw, bh, s * .06), leafO({ lift, bounds: [-bw / 2, by, bw, bh] }));
  // under-edge shade (a soft lacquer shadow at the bottom of the body)
  X.save(); X.beginPath(); X.roundRect(-bw / 2, by, bw, bh, s * .06); X.clip();
  const sg = X.createLinearGradient(0, by + bh * .55, 0, by + bh); sg.addColorStop(0, 'rgba(10,8,12,0)'); sg.addColorStop(1, 'rgba(10,8,12,.45)');
  X.fillStyle = sg; X.fillRect(-bw / 2, by, bw, bh); X.restore();
  const ex = s * .2, ey = by + bh * .32, look = (o.look || 0) * s * .03;
  if (o.shades !== false) {
    // wrap-around black lacquer shades with a gold rim and a mirror glint
    const sp = () => { X.moveTo(-ex - s * .15 + look, ey + s * .02); X.lineTo(ex + s * .15 + look, ey + s * .02); X.lineTo(ex + s * .13 + look, ey + s * .12); X.quadraticCurveTo(ex + look, ey + s * .19, s * .06 + look, ey + s * .12); X.lineTo(-s * .06 + look, ey + s * .12); X.quadraticCurveTo(-ex + look, ey + s * .19, -ex - s * .13 + look, ey + s * .12); X.closePath(); };
    lqLacquer(sp, '#0d0a0a', { lift: 3, rim: 1, bounds: [-ex - s * .15, ey, ex * 2 + s * .3, s * .2], glint: glint === undefined ? undefined : glint });
    inkStroke(() => { X.beginPath(); X.moveTo(-ex - s * .15 + look, ey + s * .02); X.lineTo(ex + s * .15 + look, ey + s * .02); }, LQ_PAL.gold, s * .014);
    inkStroke(() => { X.beginPath(); X.moveTo(-ex - s * .02 + look, ey + s * .05); X.lineTo(-ex + s * .05 + look, ey + s * .05); X.moveTo(ex + s * .02 + look, ey + s * .05); X.lineTo(ex + s * .09 + look, ey + s * .05); }, 'rgba(255,255,255,.75)', s * .012);
  } else {
    for (const sd of [-1, 1]) lqLacquer(() => X.roundRect(sd * ex + look - s * .0375, ey, s * .075, s * .19, s * .015), LQ_PAL.ink, { rim: 0, bounds: [0, ey, 1, s * .19] });
  }
  // gold chain: a sagging loop of links with a spark medallion
  if (o.chain !== false) {
    const cy0 = by + bh * .58, sag = s * .16, n = 13, cw = bw * .62;
    const P = u => [(u - .5) * cw, cy0 + Math.sin(u * Math.PI) * sag];
    lqGold(() => { for (let i = 0; i <= n; i++) { const u = i / n, [px, py] = P(u), [qx, qy] = P(Math.min(1, u + .01)), a = Math.atan2(qy - py, qx - px); X.moveTo(px + Math.cos(a) * s * .026, py + Math.sin(a) * s * .026); X.ellipse(px, py, s * .03, s * (i % 2 ? .011 : .02), a, 0, TAU); X.moveTo(px + Math.cos(a) * s * .014, py + Math.sin(a) * s * .014); X.ellipse(px, py, s * .014, s * (i % 2 ? .003 : .008), a, 0, TAU, true); } },
      { scale: s / 900, glint, bevel: 0, lift: 2 });
    const [mx, my] = P(.5);
    lqGold(() => sparkPath(mx, my + s * .07, s * .075, 6, .3, 0, .7), { scale: s / 900, glint, bevel: Math.max(1, s * .008), lift: 3 });
    lqLacquer(() => { X.arc(mx, my + s * .07, s * .02, 0, TAU); }, LQ_PAL.cinnabar, { rim: 0, glint: false, bounds: [mx - 10, my, 20, 20] });
  }
  if (o.hat) {
    const hw = bw * .62, hh = s * .24;
    lqLacquer(() => { X.moveTo(-hw / 2, by + s * .03); X.quadraticCurveTo(-hw / 2, by - hh, 0, by - hh * 1.05); X.quadraticCurveTo(hw / 2, by - hh, hw / 2, by + s * .03); X.closePath(); }, o.hat, { lift, bounds: [-hw / 2, by - hh, hw, hh] });
  }
  X.restore();
}

// ---------- the time machine: an unbranded wedge coupé with gull-wing doors ----------
function lqTimeMachine(x, y, s, t, o = {}) {
  const u = s, doors = clamp(o.doors || 0), spin = o.spin ?? 0, glint = o.glint, trail = o.trail || 0, circ = o.circuits ?? 1;
  const P = (px, py) => [px * u, py * u];
  X.save(); X.translate(x, y); if (o.flip) X.scale(-1, 1);
  // ---- fire trail and gold sparks behind the wheels ----
  if (trail > 0) {
    X.save(); X.globalCompositeOperation = 'lighter';
    for (const wx of [-.32, .31]) for (let lane = 0; lane < 2; lane++) {
      const x0 = wx * u - u * .06, len = u * (.35 + trail * .9), yy = -u * .012 - lane * u * .012;
      for (let k = 0; k < 7; k++) {
        const ph = hash(k * 7.1 + lane * 3 + wx) * 5, wob = f => Math.sin(f * 13 + t * 21 + ph) * u * .006 * (1 + f * 2);
        X.beginPath(); X.moveTo(x0, yy);
        for (let q = 1; q <= 20; q++) { const f = q / 20; X.lineTo(x0 - f * len * (.55 + hash(k + lane * 9) * .45), yy - f * u * .01 + wob(f)); }
        const g = X.createLinearGradient(x0, 0, x0 - len, 0);
        g.addColorStop(0, `rgba(255,236,170,${.55 * trail})`); g.addColorStop(.25, `rgba(242,160,60,${.45 * trail})`); g.addColorStop(.65, `rgba(179,38,30,${.3 * trail})`); g.addColorStop(1, 'rgba(120,20,10,0)');
        X.strokeStyle = g; X.lineWidth = u * (.004 + hash(k * 3.3 + lane) * .012); X.lineCap = 'round'; X.stroke();
      }
    }
    for (let i = 0; i < 70; i++) {
      const life = frac(t * (.9 + hash(i) * .8) + hash(i * 3.7)), sx = -u * .35 - life * u * (.3 + hash(i * 5.1) * .8) * (.3 + trail),
        sy = -u * .02 - Math.sin(life * Math.PI) * u * (.03 + hash(i * 2.3) * .12) + life * life * u * .04, sz = u * .012 * (1 - life) * (.5 + hash(i * 9.1));
      if (sz < .6) continue;
      X.globalAlpha = trail * (1 - life);
      X.fillStyle = hash(i * 4.4) < .7 ? LQ_PAL.goldHi : LQ_PAL.vermilion;
      sparkPath(sx, sy, sz * 2.4, 4, .22, life * 6 + i, .5); X.fill();
    }
    X.restore();
  }
  // ground shadow
  X.save(); const gs = X.createRadialGradient(0, 0, 0, 0, 0, u * .55); gs.addColorStop(0, 'rgba(0,0,0,.7)'); gs.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = gs; X.scale(1, .08); X.beginPath(); X.arc(0, 0, u * .55, 0, TAU); X.fill(); X.restore();
  // door geometry (side window + panel), hinged on the roof line
  const hingeY = -.292, th = doors * Math.PI * .74, ct = Math.cos(th);
  const door = [[.115, -.2], [.02, -.283], [-.14, -.288], [-.215, -.215], [-.215, -.08], [.11, -.08]];
  // opening, the door rises about the roof hinge; above the roof it leans back and outward like a wing
  const doorAt = pts => pts.map(([px, py]) => { const yy = hingeY + (py - hingeY) * ct, up = Math.max(0, hingeY - yy); return P(px - up * .45 * Math.sin(th) + (px + .05) * .12 * Math.max(0, -ct), yy); });
  const poly = pts => () => { pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); };
  // far-side door (only visible above the roof once open)
  if (doors > .05 && ct < .6) lqSilver(poly(doorAt(door).map(([a, b]) => [a - u * .015, b - u * .005])), { scale: u / 2600, glint, shade: .55, bevel: 1 });
  // body
  const body = () => {
    const pts = [[.5, -.075], [.525, -.118], [.3, -.163], [.13, -.192], [.02, -.285], [-.14, -.292], [-.33, -.214], [-.475, -.198], [-.51, -.182], [-.51, -.09], [-.475, -.062]];
    pts.forEach(([a, b], i) => i ? X.lineTo(a * u, b * u) : X.moveTo(a * u, b * u));
    X.lineTo((-.32 - .112) * u, -.062 * u); X.arc(-.32 * u, -.078 * u, .112 * u, Math.PI, TAU); X.lineTo((.31 - .105) * u, -.062 * u); X.arc(.31 * u, -.078 * u, .105 * u, Math.PI, TAU);
    X.lineTo(.49 * u, -.062 * u); X.closePath();
  };
  const bb = [-.52 * u, -.3 * u, 1.05 * u, .25 * u];
  lqSilver(body, { scale: u / 2600, glint, bounds: bb, lift: u * .01, bevel: Math.max(1.2, u * .003) });
  // lower sill in black lacquer, body crease
  X.save(); X.beginPath(); body(); X.clip();
  lqLacquer(() => X.rect(-.53 * u, -.1 * u, 1.08 * u, .06 * u), '#16100d', { rim: 0, bounds: [-.53 * u, -.1 * u, 1.08 * u, .06 * u], glint });
  inkStroke(() => { X.beginPath(); X.moveTo(.5 * u, -.118 * u); X.lineTo(-.51 * u, -.14 * u); }, 'rgba(20,20,26,.55)', u * .003);
  inkStroke(() => { X.beginPath(); X.moveTo(.5 * u, -.114 * u); X.lineTo(-.51 * u, -.136 * u); }, 'rgba(255,255,255,.35)', u * .0022);
  // rear louvres
  for (let i = 0; i < 6; i++) { const f = (i + .5) / 6; inkStroke(() => { X.beginPath(); X.moveTo(lerp(-.15, -.32, f) * u, lerp(-.286, -.219, f) * u); X.lineTo(lerp(-.15, -.32, f) * u - u * .03, lerp(-.286, -.219, f) * u + u * .004); }, '#0c0a0b', u * .007); }
  X.restore();
  // windshield (dark lacquer glass with a sky sheen)
  lqLacquer(poly([P(.125, -.194), P(.028, -.278), P(.012, -.268), P(.1, -.192)]), '#1a1f2b', { rim: 1, bounds: [.0 * u, -.29 * u, .13 * u, .1 * u], glint });
  // door opening (interior) when open
  if (doors > .02) {
    lqLacquer(poly(door.map(([a, b]) => P(a, b))), LQ_PAL.brownDk, { rim: 2, bounds: [-.22 * u, -.29 * u, .34 * u, .21 * u], glint: false });
    // seat back + a cinnabar dash light inside
    lqLacquer(() => X.roundRect(-.16 * u, -.24 * u, .06 * u, .15 * u, u * .02), LQ_PAL.cinnabarDk, { rim: 1, bounds: [-.16 * u, -.24 * u, .06 * u, .15 * u], glint: false });
  }
  // the door itself: closed it sits flush; opening it swings up about the roof hinge like a wing (outer skin kept in view)
  const dp = doorAt(door);
  const win = doorAt([[.095, -.198], [.018, -.268], [-.132, -.274], [-.195, -.212]]);
  if (doors > .02) {   // gas strut
    const a = P(-.19, -.1), b = doorAt([[-.19, -.16]])[0];
    inkStroke(() => { X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }, '#2a2a30', u * .005);
    inkStroke(() => { X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)); }, '#9a9ea6', u * .003);
  }
  lqSilver(poly(dp), { scale: u / 2600, glint, bounds: bb, bevel: Math.max(1, u * .0025), shade: ct < 0 ? .12 : 0 });
  lqLacquer(poly(win), '#171b25', { rim: 1, bounds: [-.2 * u, -.3 * u, .3 * u, .2 * u], glint });
  if (ct < .98) {       // the door's edge thickness and brown lacquer lining along the hinge
    const e0 = dp[4], e1 = dp[5];
    inkStroke(() => { X.beginPath(); X.moveTo(e0[0], e0[1]); X.lineTo(e1[0], e1[1]); }, LQ_PAL.brown, u * .012 * (1 - Math.abs(ct)));
  }
  inkStroke(poly(dp), 'rgba(10,10,14,.7)', u * .0025);
  // headlight / tail light
  lqLacquer(() => X.rect(.455 * u, -.123 * u, .05 * u, .014 * u), '#fff1c4', { rim: 1, glint: false, bounds: [.455 * u, -.123 * u, .05 * u, .014 * u] });
  lqLacquer(() => X.rect(-.512 * u, -.176 * u, .012 * u, .06 * u), LQ_PAL.cinnabar, { rim: 0, glint: false, bounds: [-.512 * u, -.176 * u, .012 * u, .06 * u] });
  if (o.lights) {
    X.save(); X.globalCompositeOperation = 'lighter'; const lg = X.createLinearGradient(.5 * u, 0, 1.3 * u, 0);
    lg.addColorStop(0, `rgba(255,236,190,${.35 * o.lights})`); lg.addColorStop(1, 'rgba(255,236,190,0)'); X.fillStyle = lg;
    X.beginPath(); X.moveTo(.5 * u, -.125 * u); X.lineTo(1.3 * u, -.2 * u); X.lineTo(1.3 * u, .0); X.lineTo(.5 * u, -.105 * u); X.closePath(); X.fill(); X.restore();
  }
  // time circuits: glowing cinnabar/gold lines with nodes
  if (circ > 0) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; X.lineJoin = 'round';
    const pulseK = .6 + .4 * Math.sin(t * 9);
    const runs = [
      [[.44, -.108], [.2, -.112], [.14, -.128], [-.2, -.132], [-.26, -.118], [-.47, -.122]],
      [[-.2, -.132], [-.2, -.176], [-.27, -.186], [-.45, -.185]],
      [[.2, -.112], [.26, -.14], [.4, -.14]],
    ];
    for (const [col, w, a] of [[LQ_PAL.cinnabar, u * .014, .35], [LQ_PAL.vermilion, u * .006, .8], [LQ_PAL.goldHi, u * .0022, 1]]) {
      X.strokeStyle = col; X.lineWidth = w; X.globalAlpha = a * circ * (col === LQ_PAL.goldHi ? pulseK : 1);
      for (const r0 of runs) { X.beginPath(); r0.forEach(([a1, b1], i) => i ? X.lineTo(a1 * u, b1 * u) : X.moveTo(a1 * u, b1 * u)); X.stroke(); }
    }
    X.globalAlpha = circ;
    for (const [a1, b1] of [[.14, -.128], [-.2, -.132], [-.26, -.118], [-.2, -.176], [.26, -.14], [-.45, -.185]]) {
      X.fillStyle = LQ_PAL.goldHi; X.beginPath(); X.arc(a1 * u, b1 * u, u * .006, 0, TAU); X.fill();
      X.fillStyle = 'rgba(232,85,58,.35)'; X.beginPath(); X.arc(a1 * u, b1 * u, u * .016 * pulseK, 0, TAU); X.fill();
    }
    X.restore();
  }
  // wheels
  for (const [wx, wr] of [[-.32, .086], [.31, .082]]) {
    const cx = wx * u, cy = -.078 * u + (wr - .082) * u * 0, R = wr * u, rot = t * spin;
    X.save(); X.translate(cx, -wr * u);
    lqLacquer(() => X.arc(0, 0, R, 0, TAU), '#0f0c0c', { rim: 2, glint: false, bounds: [-R, -R, R * 2, R * 2] });
    inkStroke(() => { X.beginPath(); X.arc(0, 0, R * .92, 0, TAU); }, 'rgba(255,255,255,.08)', R * .03);
    // tread notches (show the rotation)
    X.save(); X.rotate(rot); X.strokeStyle = 'rgba(70,60,58,.8)'; X.lineWidth = R * .03;
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; X.beginPath(); X.moveTo(Math.cos(a) * R * .8, Math.sin(a) * R * .8); X.lineTo(Math.cos(a) * R * .94, Math.sin(a) * R * .94); X.stroke(); }
    X.restore();
    lqSilver(() => X.arc(0, 0, R * .62, 0, TAU), { scale: u / 3000, glint, bevel: 1.5, bounds: [-R, -R, R * 2, R * 2] });
    X.save(); X.rotate(rot);
    const blur = Math.min(1, Math.abs(spin) / 30);
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * TAU;
      X.fillStyle = `rgba(22,18,18,${.85 - blur * .5})`; X.beginPath(); X.moveTo(Math.cos(a - .2) * R * .2, Math.sin(a - .2) * R * .2); X.lineTo(Math.cos(a - .28) * R * .56, Math.sin(a - .28) * R * .56); X.lineTo(Math.cos(a + .28) * R * .56, Math.sin(a + .28) * R * .56); X.lineTo(Math.cos(a + .2) * R * .2, Math.sin(a + .2) * R * .2); X.closePath(); X.fill();
    }
    if (blur > .2) { X.fillStyle = `rgba(30,24,24,${blur * .35})`; X.beginPath(); X.arc(0, 0, R * .56, 0, TAU); X.arc(0, 0, R * .2, 0, TAU, true); X.fill(); }
    X.restore();
    lqLacquer(() => X.arc(0, 0, R * .16, 0, TAU), LQ_PAL.cinnabar, { rim: 1, glint: false, bounds: [-R * .16, -R * .16, R * .32, R * .32] });
    lqGold(() => X.arc(0, 0, R * .07, 0, TAU), { scale: .2, glint: false, bevel: 0 });
    X.restore();
  }
  X.restore();
}

// =====================================================================================================================
// Scenery and crowd from the MV's motifs, re-made in lacquer.
//   lqMaskDancer(x, y_ground, h, t, o)   h = figure height. o: {arms 0..1 | [l, r], lean, step (phase), flip, robe, robeDk, mask:'egg'|'gold', gold (rim) 0..1}
//   lqKarstRiver(t, o)                   o: {rect:[x,y,w,h], horizon, camX, time:'night'|'gold', sun, seed, glint, water}
//   lqRedDisc(x, y, rx, ry, o)           o: {topdown, thick, glint, reflect, rings}
//   lqBuffalo(x, y_ground, s, t, o)      s = body length. o: {gait:'walk'|'charge', speed, phase, flip, glint}
//   lqRain(t, o)                         o: {rect, n, angle, speed, len, alpha, color:'silver'|'gold', ground (y for splashes)}
//   lqGate(x, y_ground, s, o)            s = base width. o: {glint, lit 0..1}
//   lqDrum(t, o)                         o: {x, y, r, a (rider angle), speed 0..1 (trail), rider, glint}
// =====================================================================================================================

// ---------- masked dancer ----------
function lqMaskSprite(kind) {
  const key = 'mask_' + kind; if (LQ_TEX[key]) return LQ_TEX[key];
  const w = 120, h = 150, c = mkCanvas(w, h), prev = X; X = c.getContext('2d');
  try {
    const oval = () => { X.ellipse(w / 2, h / 2, w * .4, h * .44, 0, 0, TAU); };
    X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 6; X.shadowOffsetY = 3; X.fillStyle = '#1a110d'; X.beginPath(); oval(); X.fill(); X.restore();
    if (kind === 'gold') lqGold(oval, { scale: .3, glint: false, bevel: 2 }); else lqEggshell(oval, { scale: 1.3, glint: false, bevel: 2.5, ox: 17, oy: 5 });
    // soft volume: a darker lower-right, a pale brow
    X.save(); X.beginPath(); oval(); X.clip();
    const g = X.createRadialGradient(w * .42, h * .36, 5, w * .5, h * .5, w * .55); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,.45)');
    X.fillStyle = g; X.fillRect(0, 0, w, h); X.restore();
    // slit eyes and a faint mouth line
    X.fillStyle = '#0c0706';
    for (const sd of [-1, 1]) { const ex = w / 2 + sd * w * .17, ey = h * .44; X.beginPath(); X.moveTo(ex - w * .14, ey - sd * h * .01); X.quadraticCurveTo(ex, ey - h * .075, ex + w * .14, ey + sd * h * .01); X.quadraticCurveTo(ex, ey + h * .035, ex - w * .14, ey - sd * h * .01); X.fill(); }
    X.strokeStyle = 'rgba(40,24,16,.5)'; X.lineWidth = 2; X.beginPath(); X.moveTo(w * .42, h * .72); X.quadraticCurveTo(w / 2, h * .74, w * .58, h * .72); X.stroke();
    X.strokeStyle = 'rgba(20,10,5,.8)'; X.lineWidth = 2.2; X.beginPath(); oval(); X.stroke();
  } finally { X = prev; }
  return (LQ_TEX[key] = c);
}
function lqMaskDancer(x, y, h, t, o = {}) {
  const u = h / 10, arms = Array.isArray(o.arms) ? o.arms : [o.arms ?? 0, o.arms ?? 0], st = o.step ?? 0, sw = Math.sin(st * Math.PI) * u * .45;
  const robe = o.robe || '#5A3219', robeDk = o.robeDk || '#331a0c', gold = LQ_PAL.gold, ga = o.gold ?? .85;
  X.save(); X.translate(x, y); if (o.flip) X.scale(-1, 1); X.rotate(o.lean || 0);
  X.fillStyle = 'rgba(0,0,0,.45)'; X.beginPath(); X.ellipse(0, 0, u * 2.2, u * .35, 0, 0, TAU); X.fill();
  // feet peek under the hem
  X.fillStyle = '#120b08';
  for (const sd of [-1, 1]) { const lift = Math.max(0, Math.sin(st * Math.PI + (sd > 0 ? 0 : Math.PI))) * u * .35; X.beginPath(); X.ellipse(sd * u * .6 + sw * .4, -lift - u * .1, u * .45, u * .2, 0, 0, TAU); X.fill(); }
  // robe: a long bell from the shoulders to the ground, swinging with the step
  const robeP = () => { X.beginPath(); X.moveTo(-u * 1.25, -u * 7.1); X.quadraticCurveTo(-u * 1.35, -u * 4, -u * 1.9 + sw, -u * .15); X.quadraticCurveTo(sw, u * .15, u * 1.9 + sw, -u * .15); X.quadraticCurveTo(u * 1.35, -u * 4, u * 1.25, -u * 7.1); X.quadraticCurveTo(0, -u * 7.5, -u * 1.25, -u * 7.1); X.closePath(); };
  robeP(); X.fillStyle = robe; X.fill();
  X.save(); robeP(); X.clip();
  X.fillStyle = robeDk; X.beginPath(); X.moveTo(u * .25, -u * 7.4); X.quadraticCurveTo(u * .5 + sw * .5, -u * 3.5, u * .4 + sw, u * .3); X.lineTo(u * 3, u); X.lineTo(u * 3, -u * 8); X.closePath(); X.fill();
  X.strokeStyle = 'rgba(0,0,0,.35)'; X.lineWidth = u * .16;
  for (const f of [-.7, .9]) { X.beginPath(); X.moveTo(f * u * .6, -u * 4.3); X.quadraticCurveTo(f * u + sw * .4, -u * 2, f * u * 1.3 + sw, 0); X.stroke(); }
  X.restore();
  // cinnabar sash with a gold edge
  X.fillStyle = LQ_PAL.cinnabar; X.fillRect(-u * 1.3, -u * 4.6, u * 2.6, u * .45);
  X.globalAlpha = ga; X.strokeStyle = gold; X.lineWidth = u * .08; X.strokeRect(-u * 1.3, -u * 4.6, u * 2.6, u * .45);
  // the gold rim line lacquer figures are outlined with
  X.lineWidth = u * .11; robeP(); X.stroke(); X.globalAlpha = 1;
  // wide sleeves (arms): 0 = down, 1 = raised overhead
  for (const sd of [-1, 1]) {
    const a = arms[sd < 0 ? 0 : 1], ang = -sd * lerp(.18, 2.75, clamp(a));
    X.save(); X.translate(sd * u * 1.15, -u * 6.8); X.rotate(ang);
    X.fillStyle = sd < 0 ? robe : robeDk; X.beginPath(); X.moveTo(-u * .45, 0); X.lineTo(u * .45, 0); X.lineTo(u * .75, u * 3.1); X.quadraticCurveTo(0, u * 3.45, -u * .75, u * 3.1); X.closePath(); X.fill();
    X.globalAlpha = ga; X.strokeStyle = gold; X.lineWidth = u * .09; X.stroke(); X.globalAlpha = 1;
    X.fillStyle = '#E6D8BF'; X.beginPath(); X.arc(0, u * 3.5, u * .32, 0, TAU); X.fill();
    X.restore();
  }
  // hood and mask
  X.fillStyle = robeDk; X.beginPath(); X.ellipse(0, -u * 8.35, u * 1.05, u * 1.3, 0, 0, TAU); X.fill();
  X.globalAlpha = ga; X.strokeStyle = gold; X.lineWidth = u * .08; X.stroke(); X.globalAlpha = 1;
  X.drawImage(lqMaskSprite(o.mask || 'egg'), -u * .8, -u * 9.4, u * 1.6, u * 2);
  X.restore();
}

// ---------- karst river ----------
function lqKarstTowers(seed) {
  const key = 'karst' + seed; if (LQ_TEX[key]) return LQ_TEX[key];
  const r = rng(seed * 3.1 + 5), layers = [];
  for (const [n, hMin, hMax, wMin, wMax] of [[10, .13, .26, 150, 300], [8, .2, .4, 170, 330], [4, .12, .3, 200, 360]]) {
    const towers = [];
    for (let i = 0; i < n; i++) {
      const bx = (i + .1 + r() * .8) / n * 2400, h = lerp(hMin, hMax, r()), wb = lerp(wMin, wMax, r()), pts = [];
      const p = 2.2 + r() * 2.2, lean = (r() - .5) * .3, twin = r() < .35, tw2 = .45 + r() * .3, bumps = [0, 1, 2, 3, 4, 5].map(() => r());
      for (let k = 0; k <= 32; k++) {
        const f = k / 32, xn = f * 2 - 1;
        let y = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xn), p)), .55);
        if (twin) y = Math.max(y * tw2, Math.pow(Math.max(0, 1 - Math.pow(Math.abs((xn - .35) / .65), p)), .55));
        y *= 1 + Math.sin(f * 17 + bumps[0] * 9) * .025 + Math.sin(f * 41 + bumps[1] * 9) * .012;   // shrubs on the crown
        pts.push([xn * wb / 2 + lean * y * wb * .3, -y]);
      }
      const ridges = [0, 1, 2, 3].map(() => [(r() - .5) * .8, .25 + r() * .5]);
      towers.push({ bx, h, pts, ridges, wb, lean });
    }
    layers.push(towers);
  }
  return (LQ_TEX[key] = layers);
}
function lqKarstRiver(t, o = {}) {
  const R = o.rect || [0, 0, W, H], hz = o.horizon ?? R[1] + R[3] * .62, cam = o.camX || 0, gold = o.time === 'gold', glint = o.glint ?? frac(t * .05 + .3);
  const layers = lqKarstTowers(o.seed || 1), para = [.25, .5, .85], scaleH = R[3];
  X.save(); X.beginPath(); X.rect(R[0], R[1], R[2], R[3]); X.clip();
  // sky: lacquer, warming toward the horizon at golden hour
  const sky = X.createLinearGradient(0, R[1], 0, hz);
  if (gold) { sky.addColorStop(0, '#1a0e08'); sky.addColorStop(.7, '#5a2f12'); sky.addColorStop(1, '#a8651f'); }
  else { sky.addColorStop(0, '#07060a'); sky.addColorStop(.75, '#15100e'); sky.addColorStop(1, '#2a1a10'); }
  X.fillStyle = sky; X.fillRect(R[0], R[1], R[2], hz - R[1]);
  const sunX = R[0] + R[2] * (o.sunX ?? .62) - cam * .05, sunY = hz - R[3] * .3, sunR = R[3] * .09;
  X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = lqBand(frac(glint + .3), { bounds: [R[0], R[1], R[2], hz - R[1]], glintAng: -.62 }, [[0, 0], [.5, .06], [1, 0]], [255, 226, 190]); X.fillRect(R[0], R[1], R[2], hz - R[1]); X.restore();
  if (o.sun !== false) lqGold(() => X.arc(sunX, sunY, sunR, 0, TAU), { scale: .3, glint, bevel: 1.5 });
  // tower paths for one layer (wrapped for panning)
  const towersPath = (li, flip) => () => {
    X.beginPath();
    const P = 2400 * R[2] / W, sc = R[2] / W;
    for (const tw of layers[li]) {
      let bx = R[0] + (((tw.bx * sc - cam * para[li] * sc) % P) + P) % P - 300 * sc;
      for (const ox of [0, P]) {
        const cx = bx + ox; if (cx < R[0] - 400 * sc || cx > R[0] + R[2] + 400 * sc) continue;
        tw.pts.forEach(([px, py], k) => { const X0 = cx + px * sc, Y0 = hz + (flip ? -1 : 1) * py * tw.h * scaleH; k ? X.lineTo(X0, Y0) : X.moveTo(X0, Y0); });
        X.closePath();
      }
    }
  };
  const mist = (a) => { const g = X.createLinearGradient(0, hz - R[3] * .28, 0, hz); g.addColorStop(0, 'rgba(10,6,4,0)'); g.addColorStop(1, gold ? `rgba(120,70,25,${a})` : `rgba(12,8,6,${a})`); X.fillStyle = g; X.fillRect(R[0], hz - R[3] * .28, R[2], R[3] * .28); };
  // far: brown lacquer silhouettes; mid: gold leaf; near: black lacquer with gold rim
  X.save(); towersPath(0)(); X.fillStyle = gold ? '#6e4020' : '#3a2416'; X.fill(); X.restore(); mist(.85);
  lqGold(() => towersPath(1)(), { scale: .5 * R[2] / W, glint, bevel: 0, bounds: [R[0], hz - R[3] * .6, R[2], R[3] * .6] });
  X.save(); towersPath(1)(); X.clip();
  const sh = X.createLinearGradient(0, hz - R[3] * .55, 0, hz); sh.addColorStop(0, 'rgba(20,10,4,0)'); sh.addColorStop(.55, 'rgba(20,10,4,.08)'); sh.addColorStop(1, 'rgba(10,6,4,.8)');
  X.fillStyle = sh; X.fillRect(R[0], hz - R[3], R[2], R[3]);
  X.strokeStyle = 'rgba(40,20,8,.55)'; X.lineWidth = 2 * R[2] / W;   // vertical rain-carved striations
  for (const tw of layers[1]) for (const [dx, len] of tw.ridges) { const P = 2400 * R[2] / W, sc = R[2] / W, cx = R[0] + (((tw.bx * sc - cam * para[1] * sc) % P) + P) % P - 300 * sc; X.beginPath(); const top = Math.pow(Math.max(0, 1 - Math.abs(dx * 2)), .5) * .9; X.moveTo(cx + dx * tw.wb * sc, hz - tw.h * scaleH * top); X.quadraticCurveTo(cx + dx * tw.wb * sc * 1.15, hz - tw.h * scaleH * (top - len / 2), cx + dx * tw.wb * sc * 1.05, hz - tw.h * scaleH * (top - len)); X.stroke(); }
  X.restore(); mist(.7);
  X.save(); towersPath(2)(); X.fillStyle = gold ? '#24140a' : '#0f0a08'; X.fill(); X.strokeStyle = LQ_PAL.gold; X.globalAlpha = .75; X.lineWidth = 2.2 * R[2] / W; X.stroke(); X.restore(); mist(.4);
  // water: black mirror with the reflection broken by ripples
  if (o.water !== false) {
    const wg = X.createLinearGradient(0, hz, 0, R[1] + R[3]); wg.addColorStop(0, gold ? '#2a160a' : '#0d0a09'); wg.addColorStop(1, '#050303');
    X.fillStyle = wg; X.fillRect(R[0], hz, R[2], R[1] + R[3] - hz);
    X.save(); X.globalAlpha = .38; towersPath(0, true)(); X.fillStyle = gold ? '#6e4020' : '#3a2416'; X.fill();
    const rg = X.createLinearGradient(0, hz, 0, hz + R[3] * .5); rg.addColorStop(0, gold ? '#e2a64a' : '#a47628'); rg.addColorStop(.6, '#2a1a0c'); rg.addColorStop(1, '#120c08');
    X.globalAlpha = .3; towersPath(1, true)(); X.fillStyle = rg; X.fill();
    X.globalAlpha = .8; towersPath(2, true)(); X.fillStyle = '#080605'; X.fill(); X.restore();
    if (o.sun !== false) { X.save(); X.globalAlpha = .35; const cg = X.createLinearGradient(0, hz, 0, hz + R[3] * .35); cg.addColorStop(0, LQ_PAL.goldHi); cg.addColorStop(1, 'rgba(217,164,65,0)'); X.fillStyle = cg; X.fillRect(sunX - sunR * .9, hz, sunR * 1.8, R[3] * .35); X.restore(); }
    // ripples: dark water lines break the reflection; light glints catch the sun
    const rn = 140;
    for (let i = 0; i < rn; i++) {
      const f = Math.pow(hash(i * 3.7) , 1.6), yy = hz + f * (R[1] + R[3] - hz), len = (30 + hash(i * 1.3) * 160) * (.4 + f) * R[2] / W, xx = R[0] + frac(hash(i * 9.1) + t * .02 * (hash(i) - .5)) * R[2];
      X.fillStyle = `rgba(8,5,4,${.5 + hash(i * 5) * .4})`; X.fillRect(xx - len, yy, len * 2, (1 + f * 3) * R[3] / H);
      X.fillStyle = gold ? `rgba(246,227,161,${.25 + .35 * hash(i * 7)})` : `rgba(210,200,190,${.12 + .25 * hash(i * 7)})`;
      X.fillRect(xx - len * .3 + Math.sin(t * 1.5 + i) * 6, yy + 2, len * .6, 1.3 * R[3] / H);
    }
    X.fillStyle = gold ? 'rgba(246,227,161,.5)' : 'rgba(217,164,65,.45)'; X.fillRect(R[0], hz - 1, R[2], 2 * R[3] / H);
  }
  X.restore();
  return { horizon: hz };
}

// ---------- the red lacquer disc stage ----------
function lqRedDisc(x, y, rx, ry, o = {}) {
  const td = !!o.topdown; if (td) ry = rx;
  const th = td ? 0 : (o.thick ?? rx * .07), glint = o.glint;
  if (!td && o.reflect !== false) {
    X.save(); X.globalAlpha = .45; const g = X.createLinearGradient(0, y + th, 0, y + th + ry * 1.2); g.addColorStop(0, LQ_PAL.cinnabarDk); g.addColorStop(1, 'rgba(60,8,6,0)');
    X.fillStyle = g; X.beginPath(); X.ellipse(x, y + th * 2, rx, ry, 0, 0, TAU); X.fill(); X.restore();
  }
  if (th) {
    lqLacquer(() => { X.ellipse(x, y, rx, ry, 0, 0, Math.PI); X.lineTo(x - rx, y + th); X.ellipse(x, y + th, rx, ry, 0, Math.PI, 0, true); X.closePath(); }, LQ_PAL.cinnabarDk, { rim: 1, glint: false, bounds: [x - rx, y, rx * 2, ry + th], lift: rx * .02 });
    inkStroke(() => { X.beginPath(); X.ellipse(x, y + th, rx, ry, 0, Math.PI * .05, Math.PI * .95); }, LQ_PAL.gold, Math.max(1.5, rx * .006));
  }
  lqLacquer(() => X.ellipse(x, y, rx, ry, 0, 0, TAU), LQ_PAL.cinnabar, { rim: 2, glint, bounds: [x - rx, y - ry, rx * 2, ry * 2], lift: td ? rx * .03 : 0 });
  // inlaid gold rings and a centre spark
  X.save(); X.globalAlpha = .8;
  for (const k of (o.rings || [.88, .62, .3])) inkStroke(() => { X.beginPath(); X.ellipse(x, y, rx * k, ry * k, 0, 0, TAU); }, LQ_PAL.gold, Math.max(1, rx * (k > .8 ? .008 : .004)));
  X.restore();
  lqGold(() => { X.ellipse(x, y, rx, ry, 0, 0, TAU); X.ellipse(x, y, rx * .965, ry * .965, 0, 0, TAU, true); }, { scale: rx / 900, glint, bevel: 0 });
  withT(x, y, 0, 1, () => { X.scale(1, ry / rx); lqGold(() => sparkPath(0, 0, rx * .16, 6, .26, 0, .6), { scale: rx / 1200, glint, bevel: 1 }); });
}

// ---------- water buffalo ----------
function lqBuffalo(x, y, s, t, o = {}) {
  const u = s, charge = o.gait === 'charge', sp = o.speed ?? (charge ? 2.1 : .9), ph = t * sp + (o.phase || 0), glint = o.glint;
  const legL = u * .36, bob = charge ? Math.sin(ph * TAU * 2) * u * .025 : -Math.abs(Math.sin(ph * TAU)) * u * .012, pitch = charge ? Math.sin(ph * TAU) * .04 : 0;
  X.save(); X.translate(x, y); if (o.flip) X.scale(-1, 1);
  X.fillStyle = 'rgba(0,0,0,.45)'; X.beginPath(); X.ellipse(0, 0, u * .55, u * .04, 0, 0, TAU); X.fill();
  X.translate(0, -legL + bob); X.rotate(pitch);
  // legs: [hip x, phase offset, far?]
  const offs = charge ? [[.3, 0, 0], [.22, .12, 1], [-.36, .5, 0], [-.44, .62, 1]] : [[.3, .25, 0], [.22, .75, 1], [-.36, 0, 0], [-.44, .5, 1]];
  const leg = ([hx, off, far]) => {
    const p = (ph + off) * TAU, amp = charge ? .62 : .34, a1 = Math.sin(p) * amp, lift = Math.max(0, Math.cos(p));
    const hip = [hx * u, -u * .02], knee = [hip[0] - Math.sin(a1) * legL * .5, hip[1] + Math.cos(a1) * legL * .5];
    const a2 = a1 + (hx > 0 ? -1 : 1) * lift * (charge ? 1.1 : .7), foot = [knee[0] - Math.sin(a2) * legL * .55, knee[1] + Math.cos(a2) * legL * .55];
    X.fillStyle = far ? '#0a0706' : '#15100d';
    X.beginPath(); X.moveTo(hip[0] - u * .07, hip[1] - u * .05); X.lineTo(hip[0] + u * .07, hip[1] - u * .05); X.lineTo(knee[0] + u * .04, knee[1]); X.lineTo(foot[0] + u * .028, foot[1]); X.lineTo(foot[0] - u * .028, foot[1]); X.lineTo(knee[0] - u * .042, knee[1]); X.closePath(); X.fill();
    if (!far) { X.strokeStyle = LQ_PAL.gold; X.globalAlpha = .7; X.lineWidth = Math.max(1, u * .004); X.stroke(); X.globalAlpha = 1; }
    lqGold(() => X.ellipse(foot[0], foot[1] - u * .005, u * .03, u * .018, 0, 0, TAU), { scale: .15, glint: false, bevel: 0, shade: far ? .5 : 0 });
  };
  offs.filter(l => l[2]).forEach(leg);
  // body: barrel with a shoulder hump, neck dropping to a low head
  const head = charge ? [u * .6, u * .04] : [u * .6, -u * .06];
  const body = () => {
    X.moveTo(-u * .5, -u * .2); X.quadraticCurveTo(-u * .53, -u * .4, -u * .3, -u * .42); X.quadraticCurveTo(0, -u * .43, u * .18, -u * .5);
    X.quadraticCurveTo(u * .34, -u * .56, u * .43, -u * .4);                                   // shoulder hump
    X.quadraticCurveTo(u * .5, -u * .3, head[0] - u * .02, head[1] - u * .16);                // neck to poll
    X.quadraticCurveTo(head[0] + u * .08, head[1] - u * .17, head[0] + u * .13, head[1] - u * .06); // forehead
    X.quadraticCurveTo(head[0] + u * .17, head[1] + u * .02, head[0] + u * .15, head[1] + u * .07); // broad muzzle
    X.quadraticCurveTo(head[0] + u * .1, head[1] + u * .11, head[0] + u * .03, head[1] + u * .08);  // jaw
    X.quadraticCurveTo(u * .5, head[1] + u * .06, u * .4, u * .03);                              // dewlap
    X.quadraticCurveTo(u * .1, u * .1, -u * .2, u * .04); X.quadraticCurveTo(-u * .45, 0, -u * .5, -u * .2); X.closePath();
  };
  lqLacquer(body, '#17110e', { rim: 0, glint, bounds: [-u * .55, -u * .52, u * 1.3, u * .62], lift: u * .01 });
  // gold-leaf light along the back and the belly, and the outline
  X.save(); X.beginPath(); body(); X.clip();
  lqGold(() => { X.moveTo(-u * .48, -u * .26); X.quadraticCurveTo(-u * .4, -u * .41, -u * .2, -u * .41); X.quadraticCurveTo(u * .1, -u * .43, u * .22, -u * .49); X.quadraticCurveTo(u * .05, -u * .38, -u * .2, -u * .36); X.quadraticCurveTo(-u * .38, -u * .35, -u * .48, -u * .26); X.closePath(); }, { scale: u / 1400, glint, bevel: 0 });
  X.restore();
  inkStroke(() => { X.beginPath(); body(); }, LQ_PAL.gold, Math.max(1.2, u * .005));
  inkStroke(() => { X.beginPath(); X.moveTo(u * .05, -u * .02); X.quadraticCurveTo(u * .2, -u * .18, u * .18, -u * .38); }, 'rgba(217,164,65,.45)', Math.max(1, u * .004));
  // ear, eye and nostril
  lqLacquer(() => { X.moveTo(head[0] - u * .03, head[1] - u * .12); X.quadraticCurveTo(head[0] - u * .12, head[1] - u * .1, head[0] - u * .14, head[1] - u * .05); X.quadraticCurveTo(head[0] - u * .07, head[1] - u * .06, head[0] - u * .02, head[1] - u * .09); X.closePath(); }, '#1f1712', { rim: 0, glint: false, bounds: [head[0] - u * .15, head[1] - u * .13, u * .14, u * .1] });
  inkStroke(() => { X.beginPath(); X.moveTo(head[0] - u * .03, head[1] - u * .12); X.quadraticCurveTo(head[0] - u * .12, head[1] - u * .1, head[0] - u * .14, head[1] - u * .05); }, LQ_PAL.gold, Math.max(1, u * .003));
  lqGold(() => X.arc(head[0] + u * .04, head[1] - u * .07, u * .013, 0, TAU), { scale: .1, glint: false, bevel: 0 });
  inkStroke(() => { X.beginPath(); X.arc(head[0] + u * .13, head[1] + u * .03, u * .012, 0, TAU); }, 'rgba(217,164,65,.7)', Math.max(1, u * .003));
  // horns: two eggshell crescents sweeping back
  const horn = (dx, dy, sc) => () => { const hx = head[0] + u * .01 + dx, hy = head[1] - u * .15 + dy; X.moveTo(hx, hy); X.bezierCurveTo(hx + u * .1 * sc, hy - u * .12 * sc, hx - u * .06 * sc, hy - u * .24 * sc, hx - u * .22 * sc, hy - u * .2 * sc); X.bezierCurveTo(hx - u * .08 * sc, hy - u * .19 * sc, hx + u * .02 * sc, hy - u * .1 * sc, hx - u * .04, hy + u * .01); X.closePath(); };
  lqEggshell(horn(-u * .03, u * .01, .9), { scale: Math.max(.35, u / 1300), glint: false, bevel: 1, tint: 'rgba(150,120,90,.6)' });
  lqEggshell(horn(0, 0, 1), { scale: Math.max(.35, u / 1300), glint: false, bevel: 1.2, lift: 2 });
  // tail
  const tw = Math.sin(ph * TAU * 1.3) * u * .04;
  inkStroke(() => { X.beginPath(); X.moveTo(-u * .5, -u * .3); X.quadraticCurveTo(-u * .6, -u * .2, -u * .56 + tw, -u * .05); }, '#15100d', u * .015);
  lqGold(() => X.ellipse(-u * .56 + tw, -u * .04, u * .018, u * .035, .2, 0, TAU), { scale: .15, glint: false, bevel: 0 });
  offs.filter(l => !l[2]).forEach(leg);
  X.restore();
}

// ---------- silver-leaf rain ----------
function lqRain(t, o = {}) {
  const R = o.rect || [0, 0, W, H], n = o.n ?? 220, ang = o.angle ?? .22, spd = o.speed ?? 1500, len0 = o.len ?? 90, a0 = o.alpha ?? 1;
  const dx = Math.sin(ang), dy = Math.cos(ang), col = o.color === 'gold' ? [246, 227, 161] : [225, 230, 236];
  X.save(); X.beginPath(); X.rect(R[0], R[1], R[2], R[3]); X.clip(); X.lineCap = 'round';
  const buckets = [[], [], []];
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 1.37 + 3), h2 = hash(i * 7.91 + 1), h3 = hash(i * 3.3 + 9), v = spd * (.75 + h3 * .5), span = R[3] + len0 * 2;
    const d = frac(h2 + t * v / span) * span - len0, x0 = R[0] + h1 * (R[2] + R[3] * dx) - R[3] * dx * .5;
    buckets[i % 3].push([x0 + dx * d, R[1] + dy * d, len0 * (.5 + h3)]);
  }
  buckets.forEach((b, k) => {
    X.strokeStyle = `rgba(${col},${(.18 + k * .14) * a0})`; X.lineWidth = .8 + k * .7; X.beginPath();
    for (const [x, y, l] of b) { X.moveTo(x, y); X.lineTo(x - dx * l, y - dy * l); } X.stroke();
    X.strokeStyle = `rgba(255,255,255,${(.35 + k * .2) * a0})`; X.lineWidth = 1 + k * .8; X.beginPath();
    for (const [x, y, l] of b) { X.moveTo(x, y); X.lineTo(x - dx * l * .18, y - dy * l * .18); } X.stroke();
  });
  if (o.ground !== undefined) {   // splashes
    X.strokeStyle = `rgba(${col},${.5 * a0})`; X.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) { const k = frac(t * 3 + hash(i * 2.2)), sx = R[0] + hash(i * 5.5 + Math.floor(t * 3 + hash(i * 2.2))) * R[2], r = 4 + k * 14; X.globalAlpha = 1 - k; X.beginPath(); X.ellipse(sx, o.ground, r, r * .25, 0, Math.PI, TAU); X.stroke(); }
  }
  X.restore();
}

// ---------- Khuê Văn Các-style gate ----------
function lqGate(x, y, s, o = {}) {
  const u = s, glint = o.glint, lit = o.lit ?? 0;
  X.save(); X.translate(x, y);
  X.fillStyle = 'rgba(0,0,0,.5)'; X.beginPath(); X.ellipse(0, 0, u * .7, u * .05, 0, 0, TAU); X.fill();
  // four square pillars (the back pair darker, seen between the front ones) on a stone plinth
  lqLacquer(() => X.rect(-u * .62, -u * .04, u * 1.24, u * .04), LQ_PAL.brownDk, { rim: 1, glint, bounds: [-u * .62, -u * .04, u * 1.24, u * .04] });
  for (const px of [-.24, .24]) lqLacquer(() => X.rect(px * u - u * .06, -u * .44, u * .12, u * .4), '#241510', { rim: 1, glint: false, bounds: [px * u - u * .06, -u * .44, u * .12, u * .4] });
  for (const px of [-.46, .46]) {
    lqEggshell(() => X.rect(px * u - u * .085, -u * .45, u * .17, u * .41), { scale: Math.max(.6, u / 500), glint, bevel: 1.5, lift: 4, ox: px * 300 });
    lqGold(() => X.rect(px * u - u * .1, -u * .47, u * .2, u * .03), { scale: u / 3000, glint, bevel: 1 });
    lqGold(() => X.rect(px * u - u * .1, -u * .06, u * .2, u * .025), { scale: u / 3000, glint, bevel: 1 });
  }
  // a roof tier: sloped tiles, upturned corners, gold edge
  const roof = (yb, wb, wt, h, curl) => {
    const P = () => { X.moveTo(-wt / 2, yb - h); X.lineTo(wt / 2, yb - h); X.quadraticCurveTo(wb * .42, yb - h * .35, wb / 2 + curl * .4, yb - curl); X.quadraticCurveTo(wb * .45, yb + h * .08, 0, yb + h * .05); X.quadraticCurveTo(-wb * .45, yb + h * .08, -wb / 2 - curl * .4, yb - curl); X.quadraticCurveTo(-wb * .42, yb - h * .35, -wt / 2, yb - h); X.closePath(); };
    lqLacquer(P, '#171012', { rim: 2, glint, bounds: [-wb / 2, yb - h, wb, h * 1.1], lift: 6 });
    X.save(); X.beginPath(); P(); X.clip(); X.strokeStyle = 'rgba(217,164,65,.35)'; X.lineWidth = Math.max(1, u * .003);
    for (let i = -14; i <= 14; i++) { X.beginPath(); X.moveTo(i / 14 * wt / 2, yb - h); X.lineTo(i / 14 * wb / 2 * .95, yb + h * .1); X.stroke(); }
    X.restore();
    lqGold(() => { X.moveTo(-wb / 2 - curl * .4, yb - curl); X.quadraticCurveTo(-wb * .45, yb + h * .08, 0, yb + h * .05); X.quadraticCurveTo(wb * .45, yb + h * .08, wb / 2 + curl * .4, yb - curl); X.lineTo(wb / 2 + curl * .4 - u * .01, yb - curl + u * .018); X.quadraticCurveTo(wb * .44, yb + h * .08 + u * .014, 0, yb + h * .05 + u * .016); X.quadraticCurveTo(-wb * .44, yb + h * .08 + u * .014, -wb / 2 - curl * .4 + u * .01, yb - curl + u * .018); X.closePath(); }, { scale: u / 3000, glint, bevel: 0 });
    for (const sd of [-1, 1]) lqGold(() => { const cx = sd * (wb / 2 + curl * .4), cy = yb - curl; X.arc(cx - sd * u * .012, cy - u * .012, u * .018, 0, TAU); X.moveTo(cx - sd * u * .012 + u * .008, cy - u * .012); X.arc(cx - sd * u * .012, cy - u * .012, u * .008, 0, TAU, true); }, { scale: u / 3000, glint, bevel: 0 });
  };
  roof(-u * .44, u * 1.3, u * .72, u * .1, u * .06);
  // pavilion body with lattice walls and the round sun window
  const bx = -u * .33, by = -u * .8, bw = u * .66, bh = u * .28;
  lqLacquer(() => X.rect(bx, by, bw, bh), LQ_PAL.cinnabar, { rim: 2, glint, bounds: [bx, by, bw, bh], lift: 4 });
  X.save(); X.strokeStyle = 'rgba(217,164,65,.7)'; X.lineWidth = Math.max(1, u * .003);
  for (const sx of [bx + u * .03, bx + bw - u * .15]) { X.strokeRect(sx, by + u * .04, u * .12, bh - u * .08); for (let i = 1; i < 4; i++) { X.beginPath(); X.moveTo(sx + i * u * .03, by + u * .04); X.lineTo(sx + i * u * .03, by + bh - u * .04); X.stroke(); } for (let j = 1; j < 5; j++) { X.beginPath(); X.moveTo(sx, by + u * .04 + j * (bh - u * .08) / 5); X.lineTo(sx + u * .12, by + u * .04 + j * (bh - u * .08) / 5); X.stroke(); } }
  X.restore();
  const wr = u * .105, wcy = by + bh / 2;
  lqLacquer(() => X.arc(0, wcy, wr, 0, TAU), '#0c0908', { rim: 1, glint: false, bounds: [-wr, wcy - wr, wr * 2, wr * 2] });
  if (lit > 0) { X.save(); X.globalCompositeOperation = 'lighter'; const lg = X.createRadialGradient(0, wcy, 0, 0, wcy, wr * 2.4); lg.addColorStop(0, `rgba(246,200,110,${.55 * lit})`); lg.addColorStop(1, 'rgba(246,200,110,0)'); X.fillStyle = lg; X.beginPath(); X.arc(0, wcy, wr * 2.4, 0, TAU); X.fill(); X.restore(); }
  lqGold(() => { X.arc(0, wcy, wr, 0, TAU); X.arc(0, wcy, wr * .84, 0, TAU, true); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; X.moveTo(Math.cos(a - .05) * wr * .2, wcy + Math.sin(a - .05) * wr * .2); X.lineTo(Math.cos(a) * wr * .86, wcy + Math.sin(a) * wr * .86); X.lineTo(Math.cos(a + .05) * wr * .2, wcy + Math.sin(a + .05) * wr * .2); X.closePath(); } X.moveTo(wr * .22, wcy); X.arc(0, wcy, wr * .22, 0, TAU); }, { scale: u / 3000, glint, bevel: 1, lift: 2 });
  // upper roof tier, ridge and finial
  roof(by + u * .01, u * 1.02, u * .34, u * .14, u * .07);
  const ry = by + u * .01 - u * .14;
  lqGold(() => X.rect(-u * .19, ry - u * .022, u * .38, u * .022), { scale: u / 3000, glint, bevel: 1 });
  for (const sd of [-1, 1]) lqGold(() => { const cx = sd * u * .19, cy = ry - u * .02; X.moveTo(cx, cy + u * .02); X.quadraticCurveTo(cx + sd * u * .02, cy - u * .05, cx + sd * u * .05, cy - u * .035); X.quadraticCurveTo(cx + sd * u * .02, cy - u * .02, cx + sd * u * .01, cy + u * .02); X.closePath(); }, { scale: u / 3000, glint, bevel: 1 });
  lqGold(() => { X.moveTo(0, ry - u * .09); X.quadraticCurveTo(u * .03, ry - u * .05, 0, ry - u * .02); X.quadraticCurveTo(-u * .03, ry - u * .05, 0, ry - u * .09); X.closePath(); X.moveTo(u * .02, ry - u * .03); X.arc(0, ry - u * .03, u * .02, 0, TAU); }, { scale: u / 3000, glint, bevel: 1, lift: 2 });
  X.restore();
}

// ---------- wall-of-death drum (top-down) ----------
function lqDrum(t, o = {}) {
  const cx = o.x ?? W / 2, cy = o.y ?? H / 2, R = o.r ?? 460, rf = R * .6, a = o.a ?? t * 3, spd = o.speed ?? .8, glint = o.glint;
  X.save();
  X.fillStyle = 'rgba(0,0,0,.6)'; X.beginPath(); X.arc(cx + R * .02, cy + R * .04, R * 1.07, 0, TAU); X.fill();
  // the inner wall: 72 planks as annular sectors, darker toward the floor
  const N = 72;
  for (let i = 0; i < N; i++) {
    const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, tone = hash(i * 3.3);
    X.fillStyle = lqMix('#5b341d', '#86532c', tone); X.beginPath(); X.arc(cx, cy, R, a0, a1); X.arc(cx, cy, rf, a1, a0, true); X.closePath(); X.fill();
  }
  X.save(); X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.arc(cx, cy, rf, 0, TAU, true); X.clip();
  X.strokeStyle = 'rgba(20,10,5,.55)'; X.lineWidth = Math.max(1, R * .003);
  for (let i = 0; i < N; i++) { const a0 = i / N * TAU; X.beginPath(); X.moveTo(cx + Math.cos(a0) * rf, cy + Math.sin(a0) * rf); X.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); X.stroke(); }
  X.strokeStyle = 'rgba(30,15,6,.18)';           // grain
  for (let k = 0; k < 14; k++) { const rr = lerp(rf, R, hash(k * 4.1)); X.beginPath(); X.arc(cx, cy, rr, hash(k) * TAU, hash(k) * TAU + 1 + hash(k * 2) * 3); X.stroke(); }
  const dg = X.createRadialGradient(cx, cy, rf, cx, cy, R); dg.addColorStop(0, 'rgba(10,5,2,.7)'); dg.addColorStop(.5, 'rgba(10,5,2,.15)'); dg.addColorStop(1, 'rgba(255,220,170,.08)');
  X.fillStyle = dg; X.fillRect(cx - R, cy - R, R * 2, R * 2);
  X.restore();
  // painted safety stripe (cinnabar) and a gold line
  lqLacquer(() => { X.arc(cx, cy, R * .9, 0, TAU); X.arc(cx, cy, R * .86, 0, TAU, true); }, LQ_PAL.cinnabar, { rim: 0, glint, bounds: [cx - R, cy - R, R * 2, R * 2], mottle: .3 });
  inkStroke(() => { X.beginPath(); X.arc(cx, cy, R * .7, 0, TAU); }, 'rgba(217,164,65,.6)', Math.max(1, R * .004));
  // floor: black lacquer with tyre scuffs and an inlaid spark
  lqLacquer(() => X.arc(cx, cy, rf, 0, TAU), '#140e0b', { rim: 3, glint, bounds: [cx - rf, cy - rf, rf * 2, rf * 2] });
  X.strokeStyle = 'rgba(120,80,50,.18)'; X.lineWidth = 2;
  for (let k = 0; k < 10; k++) { const rr = rf * (.55 + hash(k * 7.7) * .4), s0 = hash(k * 1.9) * TAU; X.beginPath(); X.arc(cx, cy, rr, s0, s0 + 1.5 + hash(k) * 2); X.stroke(); }
  lqGold(() => sparkPath(cx, cy, rf * .32, 6, .24, .2, .6), { scale: R / 1400, glint, bevel: 1.5 });
  // rim: gold leaf band with bolts
  lqGold(() => { X.arc(cx, cy, R * 1.05, 0, TAU); X.arc(cx, cy, R, 0, TAU, true); }, { scale: R / 1400, glint, bevel: 1.5, lift: 6 });
  X.fillStyle = 'rgba(60,35,10,.8)'; for (let i = 0; i < 36; i++) { const b = i / 36 * TAU; X.beginPath(); X.arc(cx + Math.cos(b) * R * 1.025, cy + Math.sin(b) * R * 1.025, R * .005, 0, TAU); X.fill(); }
  // rider on the wall at angle a (moving anticlockwise), with a light trail
  if (o.rider !== false) {
    const rr = R * .8, dir = -1;
    if (spd > 0) {
      X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
      for (let k = 0; k < 18; k++) { const f = k / 18, b0 = a - dir * f * 1.4 * spd; X.strokeStyle = `rgba(246,${Math.round(200 - f * 120)},${Math.round(120 - f * 90)},${(1 - f) * .35})`; X.lineWidth = R * .02 * (1 - f); X.beginPath(); X.arc(cx, cy, rr, Math.min(b0, b0 + dir * .1), Math.max(b0, b0 + dir * .1)); X.stroke(); }
      X.restore();
    }
    withT(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, a + dir * Math.PI / 2 + (dir < 0 ? Math.PI : 0), 1, () => {
      const L = R * .22;   // bike points along +x (direction of travel), leaning toward the wall
      X.save(); X.globalCompositeOperation = 'lighter'; const hl = X.createLinearGradient(L * .5, 0, L * 2.4, 0); hl.addColorStop(0, 'rgba(255,236,190,.4)'); hl.addColorStop(1, 'rgba(255,236,190,0)'); X.fillStyle = hl;
      X.beginPath(); X.moveTo(L * .5, 0); X.lineTo(L * 2.4, -L * .45); X.lineTo(L * 2.4, L * .45); X.closePath(); X.fill(); X.restore();
      X.fillStyle = 'rgba(0,0,0,.5)'; X.beginPath(); X.ellipse(-L * .02, L * .1, L * .58, L * .16, 0, 0, TAU); X.fill();
      X.fillStyle = '#0d0a0a'; X.beginPath(); X.roundRect(-L * .55, -L * .07, L * 1.1, L * .14, L * .07); X.fill();
      lqSilver(() => X.ellipse(L * .12, 0, L * .2, L * .09, 0, 0, TAU), { scale: .12, glint, bevel: 1 });
      inkStroke(() => { X.beginPath(); X.moveTo(L * .38, -L * .22); X.lineTo(L * .38, L * .22); }, '#c9ccd1', L * .04);
      lqLacquer(() => X.ellipse(-L * .12, 0, L * .2, L * .17, 0, 0, TAU), LQ_PAL.brownDk, { rim: 1, glint: false, bounds: [-L * .3, -L * .2, L * .4, L * .4] });
      inkStroke(() => { X.beginPath(); X.moveTo(-L * .05, -L * .14); X.lineTo(L * .36, -L * .2); X.moveTo(-L * .05, L * .14); X.lineTo(L * .36, L * .2); }, LQ_PAL.brownDk, L * .06);
      lqLacquer(() => X.arc(-L * .08, 0, L * .12, 0, TAU), LQ_PAL.cinnabar, { rim: 1, glint, bounds: [-L * .2, -L * .12, L * .24, L * .24] });
      lqGold(() => X.rect(-L * .2, -L * .025, L * .24, L * .05), { scale: .1, glint: false, bevel: 0 });
    });
  }
  X.restore();
}

// ---------- frame finish (replaces common's paper print finish; see src/job.js) ----------
// A lacquer panel under gallery light: fine dust grain, a slow diagonal polish sheen, a soft vignette.
let LQ_VIG = null;
function lqFinish(t, sh) {
  X.setTransform(1, 0, 0, 1, 0, 0);
  const cw = X.canvas.width, ch = X.canvas.height;
  if (!LQ_VIG || LQ_VIG.width !== cw) {
    LQ_VIG = mkCanvas(cw, ch); const v = LQ_VIG.getContext('2d');
    const g = v.createRadialGradient(cw / 2, ch / 2, ch * .35, cw / 2, ch / 2, ch * .95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); v.fillStyle = g; v.fillRect(0, 0, cw, ch);
  }
  X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; X.drawImage(LQ_VIG, 0, 0);
  const sk = Math.floor(t * 12) % 7;
  X.globalCompositeOperation = 'screen'; X.globalAlpha = .045;
  X.drawImage(TEX.speckle, sk * 41, sk * 29, 700, 700 * ch / cw, 0, 0, cw, ch);
  // polish sheen: a broad soft band drifting across the panel
  const x = ((t * .035) % 1.6 - .3) * cw, g = X.createLinearGradient(x - cw * .25, 0, x + cw * .25, ch * .6);
  g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(.5, 'rgba(255,240,210,.07)'); g.addColorStop(1, 'rgba(255,240,210,0)');
  X.globalAlpha = 1; X.fillStyle = g; X.fillRect(0, 0, cw, ch);
  X.globalCompositeOperation = 'source-over';
}
