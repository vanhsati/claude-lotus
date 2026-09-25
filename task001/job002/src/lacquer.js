// lacquer.js: sơn mài materials for job002. A living Vietnamese lacquer painting: black/brown lacquer ground with a
// moving polish sheen, gold and silver leaf (square sheets, seams, crackle, a travelling glint), crushed-eggshell inlay,
// flat cinnabar lacquer, SANDING reveals (a top layer rubbed through in brushy scrubs), inlaid type, a silver-leaf
// Clawd and an unbranded wedge time machine.
//
// Every texture is built once, lazily, from hash/rng (deterministic). Every call is a pure function of its arguments.
//
//   LQ_PAL                                   palette
//   lqGround(t, {tone:'black'|'brown'|'red', camX, sheen, sheenX, dust, vignette})
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
      pts.push({ x: clamp(ccx + (r() - .5) * sp, i, i + .999) * cs, y: clamp(ccy + (r() - .5) * sp, j, j + .999) * cs, gi: i, gj: j, tone, sh: (r() - .5) * .16, ta: r() * TAU, gap: .45 + Math.pow(r(), 2) * 1.3, vary: (r() - .5) * .07 });
    }
  }
  const grid = []; for (let j = 0; j < G; j++) { grid.push([]); for (let i = 0; i < G; i++) grid[j].push([]); }
  pts.forEach((p, idx) => grid[p.gj][p.gi].push(idx));
  const TONES = [lqHex('#EFE5D2'), lqHex('#F8F3E8'), lqHex('#E4D2B2'), lqHex('#CDB690')], GAP = lqHex('#23150e');
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
    const v = clamp(128 + n * 110, 0, 255), i = (y * S + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  cx.putImageData(id, 0, 0); return (LQ_TEX.mottle = c);
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
    fill: st => { X.beginPath(); pathFn(); X.fillStyle = st; X.fill(); },
    stroke: (st, lw) => { X.beginPath(); pathFn(); X.strokeStyle = st; X.lineWidth = lw; X.lineJoin = 'round'; X.stroke(); },
    clip: () => { X.beginPath(); pathFn(); X.clip(); },
  };
}
function lqShapeText(str, x0, y, fnt, tracking = 0, base = 'alphabetic') {
  const L = tracking ? layout(str, fnt, tracking) : null;
  const each = fn => { X.font = fnt; X.textBaseline = base; X.textAlign = 'left'; if (!L) fn(str, x0); else for (const l of L) fn(l.ch, x0 + l.x); };
  return {
    text: true,
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
  const tex = lqBuildLeaf(), base = lqPat(kind, tex[kind]);
  X.save();
  if (o.alpha !== undefined) X.globalAlpha = o.alpha;
  lqLiftShadow(sh, o.lift);
  sh.fill(lqPatT(base, o, .62));
  if (o.shade) { X.globalCompositeOperation = 'multiply'; sh.fill(`rgba(60,40,30,${o.shade})`); X.globalCompositeOperation = 'source-over'; }
  X.restore();
  // travelling specular glint: the brighter "lit" leaf, masked by a moving band (sheet by sheet it flares)
  const gk = o.glint === undefined ? lqDefaultGlint() : o.glint;
  if (gk !== false && gk !== null) {
    const m = X.getTransform(), lit = lqPat(kind + 'Lit', tex[kind + 'Lit']);
    const Lg = onLayer('_lqGlint', () => {
      X.setTransform(m); sh.fill(lqPatT(lit, o, .62));
      X.globalCompositeOperation = 'destination-in';
      if (!o.bounds) X.setTransform(SX, 0, 0, SX, 0, 0);
      X.fillStyle = lqBand(gk, o, [[0, 0], [.3, .35], [.5, 1], [.7, .35], [1, 0]]);
      if (o.bounds) X.fillRect(o.bounds[0] - 4000, o.bounds[1] - 4000, o.bounds[2] + 8000, o.bounds[3] + 8000); else X.fillRect(0, 0, W, H);
      // hot core: a whiter flare in the middle of the band
      X.globalCompositeOperation = 'source-atop'; X.fillStyle = lqBand(gk, { ...o, glintW: (o.glintW ?? 300) * .25 }, [[0, 0], [.5, kind === 'gold' ? .35 : .45], [1, 0]], kind === 'gold' ? [255, 246, 214] : [255, 255, 255]);
      if (o.bounds) X.fillRect(o.bounds[0] - 4000, o.bounds[1] - 4000, o.bounds[2] + 8000, o.bounds[3] + 8000); else X.fillRect(0, 0, W, H);
    });
    blit(Lg, (o.alpha ?? 1) * (o.glintA ?? 1));
  }
  if (o.bevel !== 0 && sh.clip) { X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha; lqBevel(sh, o.bevel ?? 2.2, kind === 'gold' ? 'rgba(255,244,200,.6)' : 'rgba(255,255,255,.6)', 'rgba(20,10,4,.55)'); X.restore(); }
}
function lqGold(pathFn, o = {}) { lqLeafShape('gold', lqShapePath(pathFn), o); }
function lqSilver(pathFn, o = {}) { lqLeafShape('silver', lqShapePath(pathFn), o); }

// ---------- eggshell ----------
function lqEggShape(sh, o = {}) {
  const pat = lqPat('egg', lqBuildEgg());
  X.save(); if (o.alpha !== undefined) X.globalAlpha = o.alpha;
  lqLiftShadow(sh, o.lift);
  sh.fill(lqPatT(pat, o, .5));
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
  if (o.mottle !== 0) { X.globalCompositeOperation = 'overlay'; X.globalAlpha *= o.mottle ?? .22; X.fillStyle = lqPatT(lqPat('mottle', lqBuildMottle()), o, 1.2); X.fillRect(b[0] - 50, b[1] - 50, b[2] + 100, b[3] + 100); X.globalAlpha = o.alpha ?? 1; }
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
function lqGround(t, o = {}) {
  const tone = o.tone || 'black', tex = lqBuildGround(tone), cam = o.camX || 0;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  const px = -60 + Math.sin(cam * .0015) * 40;   // slight parallax against the camera
  X.drawImage(tex, px, -40, W + 120, H + 80);
  // the polish: a broad highlight band that sweeps with t / the camera, a mirror line inside it, and a warm reflection pool
  const sx = o.sheenX ?? ((.5 + .55 * Math.sin(t * .23 + .6)) - cam / W * .6), sk = frac(sx * .8 + .1), sn = o.sheen ?? 1;
  const warm = tone === 'night' ? [200, 220, 255] : [255, 222, 188];
  X.globalCompositeOperation = 'screen';
  X.fillStyle = lqBand(sk, { glintAng: -.62, glintW: 620 }, [[0, 0], [.25, .025 * sn], [.5, .085 * sn], [.75, .025 * sn], [1, 0]], warm); X.fillRect(0, 0, W, H);
  X.fillStyle = lqBand(sk, { glintAng: -.62, glintW: 90 }, [[0, 0], [.5, .07 * sn], [1, 0]], [255, 240, 225]); X.fillRect(0, 0, W, H);
  const pool = X.createRadialGradient(W * .28, -H * .15, 40, W * .28, -H * .15, H * 1.25);
  pool.addColorStop(0, `rgba(${warm},${.09 * sn})`); pool.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = pool; X.fillRect(0, 0, W, H);
  X.restore();
  // dust everywhere (faint), polish scratches only where the sheen catches them
  const dust = lqPat('dust', lqBuildDust()), dA = o.dust ?? 1;
  if (dA > 0) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.globalAlpha = .16 * dA;
    dust.setTransform(new DOMMatrix().translate(-cam * .9, 0)); X.fillStyle = dust; X.fillRect(0, 0, W, H); X.restore();
    const Ld = onLayer('_lqDust', () => {
      dust.setTransform(new DOMMatrix().translate(-cam * .9, 0)); X.fillStyle = dust; X.fillRect(0, 0, W, H);
      X.globalCompositeOperation = 'destination-in'; X.fillStyle = lqBand(sk, { glintAng: -.62, glintW: 520 }, [[0, 0], [.5, 1], [1, 0]]); X.fillRect(0, 0, W, H);
    });
    blit(Ld, .9 * dA, 'screen');
  }
  // vignette: the panel's edges fall into deep black
  if (o.vignette !== 0) {
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    const v = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${.6 * (o.vignette ?? 1)})`); X.fillStyle = v; X.fillRect(0, 0, W, H); X.restore();
  }
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
function lqSand(k, seed = 1, o = {}) {
  const reg = o.region || [0, 0, W, H], name = o.name || '_lqSand';
  return onLayer(name, () => {
    if (k <= 0) return;
    if (k >= 1) { X.fillStyle = '#fff'; X.fillRect(reg[0], reg[1], reg[2], reg[3]); return; }
    if (o.clip) { X.beginPath(); X.rect(reg[0], reg[1], reg[2], reg[3]); X.clip(); }
    const S = lqSandStrokes(seed, reg, o);
    X.lineCap = 'round'; X.lineJoin = 'round';
    for (const s of S) {
      const g = clamp((k - s.ki) / .26); if (g <= 0) continue;
      const eg = easeOut(g), L = s.L * (.35 + .65 * eg), wd = s.Wd * (.3 + .7 * eg);
      X.save(); X.translate(s.x, s.y); X.rotate(s.a);
      // thinning wash: the top coat worn translucent around the scrub
      X.fillStyle = `rgba(255,255,255,${.16 * g})`; X.beginPath(); X.ellipse(0, 0, L * .58, wd * 1.7, 0, 0, TAU); X.fill();
      // rough-edged core: rubbed through
      X.fillStyle = `rgba(255,255,255,${Math.min(1, .35 + g * .85)})`;
      X.beginPath();
      for (let q = 0; q <= 16; q++) { const u = q / 16 * 2 - 1, hw = wd * Math.pow(Math.max(0, 1 - u * u), .4) * s.prof[q][0]; if (q) X.lineTo(u * L / 2, -hw); else X.moveTo(u * L / 2, -hw); }
      for (let q = 16; q >= 0; q--) { const u = q / 16 * 2 - 1, hw = wd * Math.pow(Math.max(0, 1 - u * u), .4) * s.prof[q][1]; X.lineTo(u * L / 2, hw); }
      X.closePath(); X.fill();
      // scrub streaks along the sanding direction (these make the ragged, brushy edge)
      for (const st of s.streaks) {
        X.strokeStyle = `rgba(255,255,255,${st.al * Math.min(1, g * 1.6)})`; X.lineWidth = st.lw * (.6 + eg * .6) * (wd / 40);
        const a = st.a * L / 2, b = st.b * L / 2, vv = st.v * wd;
        X.beginPath(); X.moveTo(a, vv); X.quadraticCurveTo((a + b) / 2, vv + st.bend * wd, b, vv + st.bend * wd * .3); X.stroke();
      }
      // long fine scratches
      X.lineWidth = .8;
      for (const sc of s.scr) { X.strokeStyle = `rgba(255,255,255,${sc.al * g})`; X.beginPath(); X.moveTo(sc.a * L / 2, sc.v * wd); X.lineTo(sc.b * L / 2, sc.v * wd + 2); X.stroke(); }
      // abrasion speckle around the edge
      for (const p of s.specks) {
        const hw = wd * Math.pow(Math.max(0, 1 - p.u * p.u), .4);
        X.fillStyle = `rgba(255,255,255,${p.al * g})`; X.fillRect(p.u * L / 2, p.side * hw * p.d, p.sz, p.sz * .8);
      }
      X.restore();
    }
    // the last scraps go at the very end
    if (k > .9) { X.fillStyle = `rgba(255,255,255,${easeIn((k - .9) / .1)})`; X.fillRect(reg[0], reg[1], reg[2], reg[3]); }
  });
}
// Paint bottom, then top with the sanded holes. The rubbed edge shows a brown under-layer halo (sơn mài layers).
function lqReveal(drawBottom, drawTop, k, seed = 1, o = {}) {
  drawBottom();
  if (k >= 1) return;
  const m = X.getTransform(), sfx = o.name || '';
  const top = onLayer('_lqTop' + sfx, () => { X.setTransform(m); drawTop(); });
  if (k > 0) {
    const mask = lqSand(k, seed, { ...o, name: '_lqSand' + sfx });
    const tx = top.x;
    tx.save(); tx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.halo !== null) {
      const tint = layer('_lqTint' + sfx); tint.x.setTransform(1, 0, 0, 1, 0, 0);
      tint.x.drawImage(mask, 0, 0); tint.x.globalCompositeOperation = 'source-in'; tint.x.fillStyle = o.halo || '#6a3a1c'; tint.x.fillRect(0, 0, tint.width, tint.height);
      tx.globalCompositeOperation = 'source-atop'; const hw = (o.haloW ?? 5) * SX;
      tx.globalAlpha = .38; for (const [dx, dy] of [[-hw, 0], [hw, 0], [0, -hw], [0, hw]]) tx.drawImage(tint, dx, dy);
      tx.globalAlpha = .25; for (const [dx, dy] of [[-hw * 2, -hw], [hw * 2, hw], [hw, -hw * 2], [-hw, hw * 2]]) tx.drawImage(tint, dx, dy);
    }
    tx.globalAlpha = 1; tx.globalCompositeOperation = 'destination-out'; tx.drawImage(mask, 0, 0);
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
  const Ls = onLayer('_lqIn', () => { X.setTransform(m); sh.fill('rgba(10,5,2,1)'); X.globalCompositeOperation = 'destination-out'; X.translate(d, d * 1.2); sh.fill('#000'); });
  blit(Ls, .55);
  const Lh = onLayer('_lqIn', () => { X.setTransform(m); sh.fill(mat === 'silver' ? '#FFFFFF' : mat === 'egg' ? '#FFFDF6' : LQ_PAL.goldWhite); X.globalCompositeOperation = 'destination-out'; X.translate(-d * .6, -d * .7); sh.fill('#000'); });
  blit(Lh, .55);
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
  const hingeY = -.292, th = doors * Math.PI * .86, ct = Math.cos(th);
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
