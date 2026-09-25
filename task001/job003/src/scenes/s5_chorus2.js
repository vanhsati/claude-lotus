// s5_chorus2.js: S5 · Chorus 2 (125.3–146.2). The neon world, bigger: a rainy crossroads at night, the idol's neon face
// repeated on blade signs, shopfronts and billboards, reflections in every puddle, and the porcelain mask that cracks on
// the peak (bar 50, 126.63) and a little more on every bar until it shatters at 145.57 and the neon starts to die.
//
// S5a 125.30–126.63  the verse tears open (skTear, neon rim) onto the dark crossroads; the signs strike on the pickup
// S5b 126.63–129.15  PEAK: the mask, huge; it cracks on the downbeat (light bursts through), camera kick
// S5c 129.15–131.68  the crossroads, wide: blade signs with the neon face, a far billboard, the mask floating over the crossing
// S5d 131.68–134.20  the giant neon face on a wall, eyes down, neon tears on every beat
// S5e 134.20–136.73  HOOK 1: KHUÔN MẶT / ĐÁNG THƯƠNG on a rooftop billboard with chasing marquee bulbs, pull back
// S5f 136.73–139.26  the mask above a puddle, its reflection broken by neon ripples on the beat
// S5g 139.26–141.78  a row of shopfronts, the face in every window, chasing on and off on the 8ths
// S5h 141.78–144.31  extreme close-up: the mask's eye, light pouring through the cracks
// S5i 144.31–146.20  HOOK 2: the title around the mask; the mask shatters (145.57), shards fall, the neon sputters out
//
// Lyrics: every line is a small neon caption at the bottom (words strike on as sung), except the two hook phrases, which
// are the huge neon titles of S5e / S5i (the rest of those two lines stays in the caption).

const S5_T0 = 125.3, S5_END = 146.2;
const S5_BAR = n => barT(n);                                    // bar 50 = 126.63 (the peak)
const S5_SHATTER = barT(57) + 2 * BEAT;                         // 145.57: the mask breaks
const S5_DARK = 145.8;                                          // the neon starts to die
const S5_LINES = LY.filter(l => l[0] >= S5_T0 - .1 && l[0] < S5_END);
const S5_P = SK_PAL;
const S5_HZ = 600;                                              // skNight's horizon (the baked street); the vanishing point is (960, 600)

// ---------------------------------------------------------------------------------------------------------------------
// timing helpers
// ---------------------------------------------------------------------------------------------------------------------
// the mask cracks a step on every bar from the peak
const S5_CRK = [[barT(50), .3], [barT(51), .42], [barT(52), .52], [barT(53), .6], [barT(54), .68], [barT(55), .76], [barT(56), .86], [barT(57), .93], [S5_SHATTER, 1]];
function S5_crack(t) { let c = 0, p = 0; for (const [tt, v] of S5_CRK) { c += (v - p) * expoOut((t - tt) / .14); p = v; } return c; }
const S5_crackHit = t => { let h = 0; for (const [tt] of S5_CRK) h = Math.max(h, hit(t, tt, .35)); return h; };
// neon power: groups strike on the pickup (before the peak), then everything burns until the end, when it sputters out.
function S5_on(t, k = 0) {
  if (t < barT(50)) { const t0 = [125.36, 125.68, 126.0, 126.31][k & 3]; return t < t0 ? 0 : Math.min(.97, .25 + (t - t0) * 1.6); }
  if (t > S5_DARK) { const t1 = S5_DARK + hash(k * 3.7 + 1) * .3; return t < t1 ? .97 : Math.max(0, .9 - (t - t1) * 3.2); }
  return 1;
}
const S5_flick = t => .04 + .5 * clamp((t - 145.2) / .6);
const S5_kI = t => .86 + .14 * KICK(t);   // tubes swell on the kick
const S5_up = s => s.toUpperCase().normalize('NFC');

// ---------------------------------------------------------------------------------------------------------------------
// camera: zoom about the street's vanishing point so the baked street (screen space) stays under the world
// ---------------------------------------------------------------------------------------------------------------------
function S5_camM(t, o = {}) {
  const z = o.z ?? 1, sh = o.shake ?? 0, sx = sh ? noise1(t * 23 + 1) * sh : 0, sy = sh ? noise1(t * 23 + 9) * sh : 0, cx = o.cx ?? 960, cy = o.cy ?? S5_HZ;
  return new DOMMatrix().scale(SX, SX).translate(cx + sx + (o.x || 0), cy + sy + (o.y || 0)).rotate((o.rot || 0) * 180 / Math.PI).scale(z, z).translate(-cx, -cy);
}
const S5_set = m => X.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
const S5_pt = (m, x, y) => [(m.a * x + m.c * y + m.e) / SX, (m.b * x + m.d * y + m.f) / SX];
// lights for skNight (screen space) from world lights
const S5_lights = (m, Ls, pw = 1) => Ls.map(L => { const [x, y] = S5_pt(m, L.x, L.y); return { ...L, x, y, r: L.r * Math.abs(m.a) / SX, a: (L.a ?? 1) * pw }; });
// a cut: a white-hot kick and a zoom punch over the first frames of a shot
const S5_punch = (lt, amt = .05) => 1 + amt * Math.pow(1 - clamp(lt / .28), 3);
function S5_flash(lt, col = S5_P.neonPink, a = .5) {
  const k = lt / .16; if (k < 0 || k >= 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter';
  X.fillStyle = skRgba(col, a * .35 * (1 - k)); X.fillRect(0, 0, W, H); X.fillStyle = `rgba(255,255,255,${a * .3 * Math.pow(1 - k, 2)})`; X.fillRect(0, 0, W, H);
  X.restore();
}

// ---------------------------------------------------------------------------------------------------------------------
// layers: neon painted once on a layer, blitted with 'lighter' and mirrored into the wet street (no second paint)
// ---------------------------------------------------------------------------------------------------------------------
function S5_layer(name, m, fn) { return skOn(skLay(name), m, null, fn); }
function S5_blit(L, op = 'lighter', a = 1) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a; X.globalCompositeOperation = op; X.drawImage(L, 0, 0); X.restore(); }
// mirror layer L below the world line y (under matrix m) into the wet street: rippled strips, faded, puddles only.
// Runs at half resolution, only below the mirror line.
function S5_reflect(L, m, y, o = {}) {
  const cw = L.width, ch = L.height, sc = skScale(m), gy = Math.max(0, Math.round(m.d * y + m.f)), st = o.stretch ?? 1.2, fade = (o.fade ?? 380) * sc, t = o.t ?? T;
  if (gy >= ch - 2) return;
  const Q = skLay('S5_rq', .5), q = Q.x, qw = Q.width, qh = Q.height, hs = Math.max(2, Math.round(4 * SX)), amp = (o.ripple ?? 1) * 2.4 * sc;
  q.clearRect(0, Math.floor(gy * .5) - 2, qw, qh);
  for (let sy = gy; sy < ch; sy += hs) {
    const d = sy - gy, a = (o.a ?? .7) * Math.exp(-d / fade); if (a < .01) break;
    const src = gy - d / st; if (src < hs) break;
    const dist = d / sc, dx = (noise1(dist / 14 + t * 1.3) * .65 + noise1(dist / 4.5 - t * 2.1) * .35) * amp * (1 + dist * .012) + (o.wave ? o.wave(dist) * sc : 0);
    q.globalAlpha = a; q.drawImage(L, 0, src - hs / st, cw, hs / st, dx * .5, sy * .5, qw, hs * .5 + .5);
  }
  q.globalAlpha = 1;
  if (o.wet !== false) { const b = skNightBake(S5_HZ); q.globalCompositeOperation = 'destination-in'; q.drawImage(b.wet, 0, gy, b.wet.width, b.wet.height - gy, 0, gy * .5, qw, qh - gy * .5); q.globalCompositeOperation = 'source-over'; }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = o.op || 'lighter'; X.drawImage(Q, 0, gy * .5, qw, qh - gy * .5, 0, gy, cw, ch - gy); X.restore();
}

// ---------------------------------------------------------------------------------------------------------------------
// the caption: one small neon line at the bottom, words striking on as sung (hook phrases excluded: they are titles)
// ---------------------------------------------------------------------------------------------------------------------
function S5_capWords(L) {
  const ws = wordTimes(L), i = ws.findIndex((w, j) => j + 3 < ws.length && /^khuôn$/i.test(w.w) && /^thương$/i.test(ws[j + 3].w));
  return i >= 0 ? ws.slice(0, i) : ws;
}
function S5_caption(t, o = {}) {
  const L = S5_LINES.find(l => t >= l[0] - .02 && t < l[1] + (l[1] >= S5_END - .01 ? .5 : 0)); if (!L) return;
  const ws = S5_capWords(L); if (!ws.length) return;
  const str = ws.map(w => w.w).join(' '), size = o.size ?? 50, fnt = FONT.vnSansB(size), tr = size * .03;
  const Ls = layout(str, fnt, tr), on = []; let wi = 0, ci = 0;
  for (const l of Ls) { if (l.ch === ' ') { on.push(0); wi++; ci = 0; continue; } const w = ws[wi]; const t0 = w.t - .02 + (ci++) * .02; on.push((t < t0 ? 0 : Math.min(1, .35 + (t - t0) * 6)) * S5_on(t, 5 + wi)); }
  const y = o.y ?? 1012;
  // a dark soft band keeps the caption legible over the reflections
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'source-over';
  const g = X.createLinearGradient(0, y - 90, 0, y + 40); g.addColorStop(0, 'rgba(6,7,12,0)'); g.addColorStop(.6, 'rgba(6,7,12,.45)'); g.addColorStop(1, 'rgba(6,7,12,.3)');
  X.fillStyle = g; X.fillRect(0, y - 90, W, 160); X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  skNeonText(str, W / 2, y, { size, font: fnt, tracking: tr, align: 'center', color: o.color || S5_P.neonCyan, on, flicker: S5_flick(t), seed: 71, w: 2.6, halo: .7, I: .95, t });
  X.restore();
}

// ---------------------------------------------------------------------------------------------------------------------
// the mask: painted onto a layer (so it can be lit by the neon and broken into shards), with neon light on the glaze
// ---------------------------------------------------------------------------------------------------------------------
const S5_MASK_AT = [-.32, -.62];
// The porcelain itself is cached per (shot, crack step): skMask is painted once at the shot's reference camera `ref`
// (a full-frame canvas) and re-placed every frame with the live camera (a few % of zoom / a small roll). Deterministic.
const S5_MC = new Map();
function S5_maskCached(key, ref, x, y, R, crack, glow) {
  const cq = Math.round(crack * 100) / 100, k = [key, cq, glow, SX, x, y, R, ref.a, ref.e, ref.f].join('|');
  let c = S5_MC.get(k); if (c) { S5_MC.delete(k); S5_MC.set(k, c); return c; }
  c = mkCanvas(Math.round(W * SX), Math.round(H * SX));
  const prev = X; X = c.getContext('2d'); X.setTransform(ref.a, ref.b, ref.c, ref.d, ref.e, ref.f);
  try { skMask(x, y, R, { crack: cq, glow, ground: 'dark', at: S5_MASK_AT }); } finally { X = prev; }
  S5_MC.set(k, c); while (S5_MC.size > 6) S5_MC.delete(S5_MC.keys().next().value);
  return c;
}
function S5_maskLayer(t, m, x, y, R, o = {}) {
  const crack = o.crack ?? S5_crack(t), glow = o.glow ?? S5_P.neonPink, ref = o.ref || m;
  const C = S5_maskCached(o.key || 'm', ref, x, y, R, crack, glow);
  const rel = m.multiply(new DOMMatrix().translate(x + (o.dx || 0), y + (o.dy || 0)).rotate((o.rot || 0) * 180 / Math.PI).translate(-x, -y)).multiply(ref.inverse());
  return S5_layer(o.layer || 'S5_mk', m, () => {
    X.save(); X.setTransform(rel.a, rel.b, rel.c, rel.d, rel.e, rel.f); X.imageSmoothingQuality = 'high'; X.drawImage(C, 0, 0); X.restore();
    // the neon lights the porcelain: pink from the left, cyan from the right, a white-hot bloom on the crack hits
    X.save(); X.globalCompositeOperation = 'source-atop';
    const gl = X.createLinearGradient(x - R, y, x + R, y);
    gl.addColorStop(0, skRgba(o.left || S5_P.neonPink, .42)); gl.addColorStop(.42, skRgba(o.left || S5_P.neonPink, 0)); gl.addColorStop(.62, skRgba(o.right || S5_P.neonCyan, 0)); gl.addColorStop(1, skRgba(o.right || S5_P.neonCyan, .38));
    X.fillStyle = gl; X.fillRect(x - R * 1.5, y - R * 1.6, R * 3, R * 3.2);
    const hk = (o.hitK ?? S5_crackHit(t)) * .6;
    if (hk > .01) { const ix = x + S5_MASK_AT[0] * R, iy = y + S5_MASK_AT[1] * R, g = X.createRadialGradient(ix, iy, 0, ix, iy, R * 1.6); g.addColorStop(0, `rgba(255,235,250,${hk})`); g.addColorStop(1, 'rgba(255,62,165,0)'); X.fillStyle = g; X.fillRect(x - R * 1.5, y - R * 1.6, R * 3, R * 3.2); }
    X.restore();
  });
}
// shards of the mask (unit coords around the impact point): wedges from the impact, split by two rings
const S5_SHARDS = (() => {
  const r = rng(505), n = 9, out = [], as = []; for (let i = 0; i < n; i++) as.push(i / n * TAU + (r() - .5) * .45);
  const rings = [0, .32, .8, 3];
  for (let i = 0; i < n; i++) for (let j = 0; j < rings.length - 1; j++) {
    const a0 = as[i], a1 = as[(i + 1) % n] + (i + 1 === n ? TAU : 0), r0 = rings[j], r1 = rings[j + 1], pts = [];
    const P = (a, rr) => [S5_MASK_AT[0] + Math.cos(a) * rr, S5_MASK_AT[1] + Math.sin(a) * rr];
    const wob = (rr, k) => rr * (1 + (hash(i * 7.1 + j * 3.3 + k) - .5) * .25);
    if (r0 === 0) pts.push(P(0, 0)); else for (let k = 0; k <= 3; k++) pts.push(P(lerp(a1, a0, k / 3), wob(r0, k + 11)));
    for (let k = 0; k <= 3; k++) pts.push(P(lerp(a0, a1, k / 3), wob(r1, k + (j === 2 ? 0 : 5))));
    const am = (a0 + a1) / 2, rm = r0 === 0 ? r1 * .5 : Math.min((r0 + r1) / 2, .9);
    out.push({ pts, c: P(am, rm), dir: [Math.cos(am), Math.sin(am)], sp: .35 + r() * .5, spin: (r() - .5) * 5, delay: r() * .08 + j * .03 });
  }
  return out;
})();
// draw the mask layer whole, or (after `t0`) broken into falling shards. Mask centre (x, y), radius R, in world coords of m.
function S5_maskDraw(L, m, t, x, y, R, t0 = S5_SHATTER) {
  const age = t - t0;
  if (age < 0) { S5_blit(L, 'source-over'); return; }
  const mi = m.inverse();
  X.save();
  for (const s of S5_SHARDS) {
    const a = Math.max(0, age - s.delay), cx = x + s.c[0] * R, cy = y + s.c[1] * R;
    const dx = s.dir[0] * s.sp * R * a * 2.2, dy = s.dir[1] * s.sp * R * a * 1.4 + 2600 * a * a * (R / 300), rot = s.spin * a;
    X.save(); S5_set(m); X.translate(cx + dx, cy + dy); X.rotate(rot); X.translate(-cx, -cy);
    pathPoly(s.pts.map(p => [x + p[0] * R, y + p[1] * R])); X.clip();
    X.transform(mi.a, mi.b, mi.c, mi.d, mi.e, mi.f); X.drawImage(L, 0, 0);
    X.restore();
  }
  X.restore();
  // the breath of light where the mask was
  const k = hit(t, t0, .5);
  if (k > .01) {
    X.save(); S5_set(m); X.globalCompositeOperation = 'lighter';
    const g = X.createRadialGradient(x, y, 0, x, y, R * 1.8); g.addColorStop(0, `rgba(255,220,245,${.7 * k})`); g.addColorStop(.4, skRgba(S5_P.neonPink, .35 * k)); g.addColorStop(1, skRgba(S5_P.neonPink, 0));
    X.fillStyle = g; X.fillRect(x - R * 2, y - R * 2, R * 4, R * 4); X.restore();
  }
}
// small porcelain chips thrown from the impact on every crack step
function S5_chips(t, x, y, R) {
  for (let si = 0; si < S5_CRK.length - 1; si++) {
    const t0 = S5_CRK[si][0], a = t - t0; if (a < 0 || a > 1.1) continue;
    const ix = x + S5_MASK_AT[0] * R, iy = y + S5_MASK_AT[1] * R;
    for (let i = 0; i < 9; i++) {
      const h = hash(si * 31 + i * 3.7), an = -Math.PI * .5 + (h - .5) * 3.4, sp = R * (.9 + hash(i * 1.3 + si) * 1.6);
      const px = ix + Math.cos(an) * sp * a, py = iy + Math.sin(an) * sp * a + 1500 * a * a * (R / 300), s = R * (.012 + hash(i * 5.1 + si) * .02);
      X.save(); X.translate(px, py); X.rotate(a * 9 * (h - .5)); X.globalAlpha = 1 - clamp((a - .7) / .4);
      X.fillStyle = S5_P.glaze; X.strokeStyle = 'rgba(90,100,130,.9)'; X.lineWidth = 1;
      X.beginPath(); X.moveTo(-s, 0); X.lineTo(0, -s * .8); X.lineTo(s * .9, s * .3); X.lineTo(-s * .2, s * .7); X.closePath(); X.fill(); X.stroke(); X.restore();
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// the crossroads (world coords; vanishing point (960, 600))
// ---------------------------------------------------------------------------------------------------------------------
const S5_VP = [960, S5_HZ];
const S5_topL = x => lerp(-120, S5_HZ, x / 960), S5_botL = x => lerp(840, S5_HZ, x / 960);   // left facades: roof and base lines
const S5_depth = x => Math.abs(960 - x) / 960;                                                 // 1 at the frame edge, 0 at the VP
// a facade block on the left (x0 < x1 < 960) or the right (mirrored)
function S5_facade(x0, x1, side, col, t, seed) {
  const f = x => side < 0 ? x : 1920 - x, top = x => S5_topL(x) + (seed % 2) * 40 * S5_depth(x), bot = S5_botL;
  X.fillStyle = col; X.beginPath(); X.moveTo(f(x0), top(x0)); X.lineTo(f(x1), top(x1)); X.lineTo(f(x1), bot(x1)); X.lineTo(f(x0), bot(x0)); X.closePath(); X.fill();
  // the block's end wall (facing the viewer) where the cross street cuts it
  X.fillStyle = skMix(col, '#000000', .35); X.beginPath(); X.moveTo(f(x1), top(x1)); X.lineTo(f(x1 + 14 * S5_depth(x1)), top(x1) + 6); X.lineTo(f(x1 + 14 * S5_depth(x1)), bot(x1)); X.lineTo(f(x1), bot(x1)); X.closePath(); X.fill();
  // windows: a grid on the wall plane, a few lit (dim amber / cold blue), a few flickering TV-blue
  const cols = 7, rows = 9;
  for (let i = 0; i < cols; i++) for (let j = 1; j < rows; j++) {
    const h = hash(seed * 17 + i * 3.1 + j * 7.7); if (h > .42) continue;
    const u0 = lerp(x0, x1, (i + .25) / cols), u1 = lerp(x0, x1, (i + .7) / cols), v0 = (j + .2) / rows, v1 = (j + .62) / rows;
    const Y = (x, v) => lerp(top(x), bot(x), v);
    const tv = h < .06, fl = tv ? .6 + .4 * noise1(t * 6 + i + j) : 1;
    X.fillStyle = tv ? `rgba(80,140,255,${.35 * fl})` : h < .2 ? 'rgba(201,161,91,.3)' : 'rgba(120,130,170,.12)';
    X.beginPath(); X.moveTo(f(u0), Y(u0, v0)); X.lineTo(f(u1), Y(u1, v0)); X.lineTo(f(u1), Y(u1, v1)); X.lineTo(f(u0), Y(u0, v1)); X.closePath(); X.fill();
  }
}
// a frontal blade sign hanging off a facade at x (world), s = its depth scale. Returns its panel rect.
function S5_bladeRect(side, xa, v, w, h) {
  const s = S5_depth(xa), top = lerp(S5_topL(xa), S5_botL(xa), v), x = side < 0 ? xa : 1920 - xa;
  return side < 0 ? [x, top, w * s, h * s, s] : [x - w * s, top, w * s, h * s, s];
}
const S5_SIGNS = [
  { side: -1, xa: 30, v: .3, w: 300, h: 330, kind: 'face', c: { line: '#35E0FF', petal: '#FF3EA5' }, k: 0 },
  { side: -1, xa: 330, v: .5, w: 250, h: 88, kind: 'text', str: 'CÀ PHÊ', col: '#FFB547', k: 1 },
  { side: -1, xa: 600, v: .3, w: 280, h: 300, kind: 'face', c: { line: '#FF3EA5', petal: '#FFB547' }, k: 2 },
  { side: 1, xa: 20, v: .64, w: 380, h: 92, kind: 'text', str: 'KARAOKE', col: '#FF3EA5', k: 3 },
  { side: 1, xa: 330, v: .22, w: 290, h: 320, kind: 'face', c: { line: '#FFB547', petal: '#35E0FF' }, k: 1 },
  { side: 1, xa: 640, v: .5, w: 230, h: 84, kind: 'text', str: 'HOA TƯƠI', col: '#35E0FF', k: 2 },
];
// sign panels (opaque, dark) — on X
function S5_signPanels() {
  for (const S of S5_SIGNS) {
    const [x, y, w, h, s] = S5_bladeRect(S.side, S.xa, S.v, S.w, S.h);
    X.fillStyle = '#07080D'; X.fillRect(x, y, w, h);
    X.fillStyle = '#1B1F2E'; const bx = S.side < 0 ? x - 6 * s : x + w; X.fillRect(bx, y + h * .15, 6 * s, 5 * s); X.fillRect(bx, y + h * .8, 6 * s, 5 * s);
  }
}
// sign neon — on the neon layer
function S5_signNeon(t, pw = k => S5_on(t, k)) {
  S5_SIGNS.forEach((S, i) => {
    const [x, y, w, h, s] = S5_bladeRect(S.side, S.xa, S.v, S.w, S.h), on = pw(S.k), I = S5_kI(t);
    skNeon(() => X.rect(x + 6 * s, y + 6 * s, w - 12 * s, h - 12 * s), S.kind === 'face' ? S.c.petal : S.col, { w: 2.2 * s + .8, on, flicker: S5_flick(t), seed: 40 + i, I: .6 * I, halo: .6, t });
    if (S.kind === 'face') {
      const R = Math.min(w, h) / 4.1, bt = beatN(t);
      skFaceNeon(x + w / 2, y + h / 2 + R * .15, R, t + i, { colors: S.c, on, flicker: S5_flick(t), w: Math.max(1.6, R * .035), eyes: 'down', tearT: [0, 1, 2].map(j => beatT(bt - j - ((bt - j + i) & 1))).filter(tt => tt > S5_T0) });
    } else {
      skNeonText(S.str, x + w / 2, y + h * .72, { size: h * .56, align: 'center', color: S.col, on, flicker: Math.max(S5_flick(t), i === 3 ? .5 : 0), broken: i === 3 ? 2 : undefined, seed: 50 + i, I, w: Math.max(1.6, h * .03), halo: .7, t });
    }
  });
}
// the far billboard at the end of the street (frontal): the big neon face
function S5_farBoard(t, pw, onX) {
  const x = 790, y = 196, w = 340, h = 226;
  if (!onX) { X.fillStyle = '#06070B'; X.fillRect(x, y, w, h); X.fillStyle = '#10131D'; X.fillRect(x + 60, y + h, 8, S5_HZ - y - h + 20); X.fillRect(x + w - 68, y + h, 8, S5_HZ - y - h + 20); return; }
  skNeon(() => X.rect(x + 5, y + 5, w - 10, h - 10), S5_P.neonCyan, { w: 2.4, on: pw, flicker: S5_flick(t), seed: 61, I: .7 * S5_kI(t), halo: .7, t });
  skFaceNeon(x + w / 2, y + h / 2 + 8, 54, t, { on: pw, flicker: S5_flick(t), w: 2.2, eyes: 'down', tearT: [beatT(beatN(t)), beatT(beatN(t) - 2)] });
}
// festoon wires strung across the street, bulbs chasing on the 8ths (drawn on the neon layer)
function S5_festoon(t, pw) {
  const e8 = Math.floor(beatF(t) * 2), C = [S5_P.neonPink, S5_P.neonAmber, S5_P.neonCyan];
  X.save();
  [[120, 90, .92, 58], [420, 330, .56, 34], [640, 452, .33, 20]].forEach(([xa, yy, s, n], wi) => {
    const x0 = xa, x1 = 1920 - xa, sag = 90 * s, P = u => [lerp(x0, x1, u), yy + Math.sin(u * Math.PI) * sag];
    X.globalCompositeOperation = 'source-over'; X.strokeStyle = 'rgba(20,22,32,.9)'; X.lineWidth = 2 * s; X.beginPath();
    for (let i = 0; i <= 24; i++) { const [x, y] = P(i / 24); i ? X.lineTo(x, y) : X.moveTo(x, y); } X.stroke();
    X.globalCompositeOperation = 'lighter';
    for (let i = 1; i < n; i++) {
      const [x, y] = P(i / n), c = C[(i + wi) % 3], lit = (((i + e8 + wi) % 3) ? .45 : 1) * pw, r = 9 * s, cy = y + r * .6;
      const g = X.createRadialGradient(x, cy, 0, x, cy, r * 2.4); g.addColorStop(0, `rgba(255,248,240,${lit})`); g.addColorStop(.13, `rgba(255,248,240,${.8 * lit})`); g.addColorStop(.24, skRgba(c, .55 * lit)); g.addColorStop(1, skRgba(c, 0));
      X.fillStyle = g; X.fillRect(x - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
    }
  });
  X.restore();
}
// the crossing stripes (zebra) in perspective, wet and pale
function S5_zebra(t) {
  const y0 = 820, y1 = 1000, n = 12;
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const xn0 = lerp(-500, 2420, (i + .1) / n), xn1 = lerp(-500, 2420, (i + .6) / n);
    const at = (xn, y) => lerp(S5_VP[0], xn, (y - S5_VP[1]) / (1080 - S5_VP[1]));
    X.fillStyle = 'rgba(150,160,190,.09)';
    X.beginPath(); X.moveTo(at(xn0, y0), y0); X.lineTo(at(xn1, y0), y0); X.lineTo(at(xn1, y1), y1); X.lineTo(at(xn0, y1), y1); X.closePath(); X.fill();
  }
  X.restore();
}
// a traffic light pole on the right corner: the red lamp pulses on the kick
function S5_signal(t, pw) {
  const x = 250, y = 560;
  X.fillStyle = '#0A0C12'; X.fillRect(x - 7, y, 14, 600); X.fillRect(x - 34, y - 20, 68, 170);
  const on = clamp(pw);
  for (let i = 0; i < 3; i++) {
    const cy = y + 12 + i * 48, lit = i === 0, c = lit ? '#FF3A4A' : i === 1 ? '#FFB547' : '#3CFFB0', a = lit ? on * (.7 + .3 * KICK(t)) : .06;
    X.fillStyle = skRgba(c, a * .9 + .08); X.beginPath(); X.arc(x, cy, 16, 0, TAU); X.fill();
    if (lit && a > .05) { X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(x, cy, 0, x, cy, 120); g.addColorStop(0, skRgba(c, .5 * a)); g.addColorStop(1, skRgba(c, 0)); X.fillStyle = g; X.fillRect(x - 120, cy - 120, 240, 240); X.restore(); }
  }
}
const S5_STREET_LIGHTS = [
  { x: 180, y: 380, r: 420, color: S5_P.neonPink, gy: 820 }, { x: 1760, y: 360, r: 420, color: S5_P.neonCyan, gy: 820 },
  { x: 960, y: 420, r: 300, color: S5_P.neonCyan, gy: 640 }, { x: 560, y: 520, r: 200, color: S5_P.neonAmber, a: .6, gy: 680 },
  { x: 1500, y: 520, r: 220, color: S5_P.neonPink, a: .7, gy: 690 },
];
// The whole crossroads frame. o: {z, x, y, shake, mask: {x, y, R} | null, pw (0..1 street light), maskFn}
function S5_street(t, o = {}) {
  const m = S5_camM(t, o), pw = o.pw ?? 1;
  skNight(t, { horizon: S5_HZ, lights: S5_lights(m, S5_STREET_LIGHTS, pw), bokeh: 34, haze: '#4A2A6A', hazeA: .6 + .4 * pw });
  X.save(); S5_set(m);
  X.fillStyle = '#05060A'; X.fillRect(740, 360, 440, 260);   // the far block closing the street
  S5_farBoard(t, pw, false);
  S5_facade(560, 800, -1, '#0B0C14', t, 3); S5_facade(560, 800, 1, '#0B0D15', t, 4);
  S5_facade(-40, 470, -1, '#0D0E17', t, 1); S5_facade(-40, 470, 1, '#0C0E18', t, 2);
  S5_signPanels(); S5_zebra(t); S5_signal(t, pw);
  X.restore();
  const N = S5_layer('S5_neon', m, () => { S5_signNeon(t, k => S5_on(t, k) * (o.signPw ? o.signPw(k) : 1)); S5_farBoard(t, S5_on(t, 3), true); S5_festoon(t, S5_on(t, 2)); if (o.neonExtra) o.neonExtra(); });
  S5_reflect(N, m, S5_HZ + 30, { a: .6, stretch: 1.1, fade: 420, t });
  S5_blit(N);
  if (o.mask) {
    const M = o.mask, ML = S5_maskLayer(t, m, M.x, M.y, M.R, { rot: M.rot, key: 'st', ref: S5_camM(0, { z: 1.06 }) });
    S5_reflect(ML, m, M.y + M.R * 1.3 + 90, { a: .35, stretch: 1, fade: 260, t, op: 'screen' });
    S5_maskDraw(ML, m, t, M.x, M.y, M.R);
  }
  X.save(); S5_set(m); skRainNeon(t, { rect: [-100, -50, 2120, 1180], n: 190, lights: S5_STREET_LIGHTS.slice(0, 3), ground: 700, splash: 60, alpha: .8 }); X.restore();
  return m;
}

// ---------------------------------------------------------------------------------------------------------------------
// a close-up ground: out-of-focus neon, the wet street far below, rain in front
// ---------------------------------------------------------------------------------------------------------------------
function S5_bokehBG(t, o = {}) {
  const Ls = o.lights || [{ x: 260, y: 300, r: 620, color: S5_P.neonPink }, { x: 1680, y: 360, r: 600, color: S5_P.neonCyan }, { x: 980, y: 140, r: 380, color: S5_P.neonAmber, a: .45 }];
  skNight(t, { horizon: S5_HZ, lights: Ls, bokeh: o.bokeh ?? 46, haze: '#5A2A70' });
  // big soft discs drifting (city lights far out of focus)
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter';
  const C = [S5_P.neonPink, S5_P.neonCyan, S5_P.neonAmber, '#8A7CFF'];
  for (let i = 0; i < 14; i++) {
    const bx = frac(hash(i * 4.1) + t * .012 * (hash(i) - .5)) * 2100 - 90, by = 80 + hash(i * 2.3) * 520, r = 50 + hash(i * 6.7) * 90, c = C[i % 4], a = .06 + .07 * hash(i * 9.1) + .05 * KICK(t);
    const g = X.createRadialGradient(bx, by, r * .7, bx, by, r); g.addColorStop(0, skRgba(c, a)); g.addColorStop(.85, skRgba(c, a * 1.4)); g.addColorStop(1, skRgba(c, 0));
    X.fillStyle = g; X.beginPath(); X.arc(bx, by, r, 0, TAU); X.fill();
  }
  X.restore();
  return Ls;
}

// ---------------------------------------------------------------------------------------------------------------------
// big neon titles: letters strike on in sung order (a word's letters 30 ms apart), then burn; sputter out at the end
// ---------------------------------------------------------------------------------------------------------------------
function S5_titleOn(t, str, wts, seedK = 0) {
  const on = []; let wi = 0, ci = 0;
  for (const ch of [...str]) {
    if (ch === ' ') { on.push(0); wi++; ci = 0; continue; }
    const t0 = (wts[wi] ?? 1e9) + ci * .03; ci++;
    let v = t < t0 ? 0 : Math.min(1, .3 + (t - t0) * 6);
    if (t > S5_DARK) { const t1 = S5_DARK + hash(on.length * 1.7 + seedK) * .38; if (t > t1) v = Math.max(0, .9 - (t - t1) * 3.5); }
    on.push(v);
  }
  return on;
}
const S5_hookWT = (t0) => { const L = S5_LINES.find(l => Math.abs(l[1] - t0) < 3 && /khuôn mặt đáng thương/i.test(l[2]) && l[0] < t0 && l[1] > t0); const ws = L ? wordTimes(L) : []; const i = ws.findIndex(w => /^khuôn$/i.test(w.w)); return i >= 0 ? ws.slice(i, i + 4).map(w => w.t) : [t0, t0 + .2, t0 + .5, t0 + .7]; };

// ---------------------------------------------------------------------------------------------------------------------
// SHOTS
// ---------------------------------------------------------------------------------------------------------------------
// S5a · the verse tears open onto the dark crossroads; the signs strike on the pickup beats
function S5_a(t, lt) {
  const under = () => {
    S5_street(t, { z: 1.08 - .05 * easeOut(lt / 1.3), pw: .25 + .75 * clamp((t - 125.4) / 1.1), mask: { x: 960, y: 600, R: 58 } });
  };
  const prev = shotAt(S5_T0 - .01);
  const over = () => {
    if (prev && prev.fn !== S5_a) { const sd = SEED; SEED = prev.seed ?? Math.round(prev.start * 10); X.save(); prev.fn(t, t - prev.start, prev.end - prev.start); X.restore(); SEED = sd; }
    else { skSilk(t, { backlight: .7, lights: [[400, 380, 300, S5_P.neonPink], [1500, 330, 320, S5_P.neonCyan]] }); skWash(() => X.ellipse(960, 520, 640, 380, -.1, 0, TAU), S5_P.indigo, { a: .3, seed: 5, scale: 3 }); }
  };
  const k = ease(clamp(lt / .62));
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  skTear(k, 12, under, over, { rim: S5_P.neonPink, pos: .52 });
  X.restore();
  S5_caption(t);
}
// S5b · PEAK: the mask, huge; it cracks on the downbeat
function S5_b(t, lt, dur) {
  const t0 = barT(50);
  S5_bokehBG(t);
  const m = S5_camM(t, { z: S5_punch(lt, .08) * (1 + lt * .018), shake: 10 * hit(t, t0, .5) + KICK(t) * 3, cy: 540 });
  const x = 960, y = 520, R = 290, rot = -.04 + .02 * Math.sin(lt * .9);
  const ML = S5_maskLayer(t, m, x, y, R, { rot, key: 'b', ref: S5_camM(0, { z: 1.06, cy: 540 }) });
  S5_maskDraw(ML, m, t, x, y, R);
  X.save(); S5_set(m); S5_chips(t, x, y, R); X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 150, len: 60, speed: 1500, lights: [{ x: 260, y: 300, r: 620, color: S5_P.neonPink }, { x: 1680, y: 360, r: 600, color: S5_P.neonCyan }] }); X.restore();
  S5_flash(lt, S5_P.neonPink, 1);
  S5_caption(t);
}
// S5c · the crossroads wide: the signs burn, the far billboard, the mask floating over the crossing
function S5_c(t, lt) {
  S5_street(t, { z: S5_punch(lt, .05) * (1.0 + lt * .014), x: -lt * 6, shake: KICK(t) * 3, mask: { x: 960, y: 600 + Math.sin(lt * 1.6) * 6, R: 58, rot: Math.sin(lt) * .03 } });
  S5_flash(lt, S5_P.neonCyan, .6);
  S5_caption(t);
}
// S5d · the giant neon face on a wall, eyes down, neon tears on every beat
function S5_d(t, lt) {
  const m = S5_camM(t, { z: S5_punch(lt, .05) * (1.02 + lt * .012), shake: KICK(t) * 3 });
  const fx = 1230, fy = 330, R = 190;
  skNight(t, { horizon: S5_HZ, lights: S5_lights(m, [{ x: fx, y: fy, r: 700, color: S5_P.neonPink, gy: 780 }, { x: 300, y: 300, r: 420, color: S5_P.neonCyan, gy: 780 }, { x: 420, y: 560, r: 240, color: S5_P.neonAmber, a: .6 }]), bokeh: 26, haze: '#5A2A70' });
  X.save(); S5_set(m);
  // the wall: a dark building face with the sign mounted on it; a narrow tower on the left with stacked shop boards
  X.fillStyle = '#0A0B12'; X.fillRect(820, -60, 1200, 820);
  X.fillStyle = '#06070B'; X.fillRect(fx - R * 2.05, fy - R * 2.05, R * 4.1, R * 3.9);
  X.fillStyle = '#0C0D16'; X.fillRect(120, -60, 460, 780);
  for (let j = 0; j < 3; j++) { X.fillStyle = '#05060A'; X.fillRect(170, 90 + j * 190, 360, 120); }
  X.restore();
  const bt = beatN(t), tears = [0, 1, 2].map(j => beatT(bt - j));
  const N = S5_layer('S5_neon', m, () => {
    skNeon(() => X.rect(fx - R * 2, fy - R * 2, R * 4, R * 3.8), S5_P.neonAmber, { w: 3, on: S5_on(t, 1), flicker: S5_flick(t), seed: 81, I: .55 * S5_kI(t), halo: .7, t });
    skFaceNeon(fx, fy, R, t, { on: S5_on(t, 0), flicker: S5_flick(t), eyes: 'down', tearT: tears, w: 5 });
    [['CÀ PHÊ', S5_P.neonCyan], ['KARAOKE', S5_P.neonPink], ['HOA TƯƠI', S5_P.neonAmber]].forEach(([s, c], j) =>
      skNeonText(s, 350, 175 + j * 190, { size: 62, align: 'center', color: c, on: S5_on(t, j + 1), flicker: j === 1 ? .45 : S5_flick(t), broken: j === 1 ? 4 : undefined, seed: 90 + j, I: S5_kI(t), w: 2.4, halo: .7, t }));
  });
  S5_reflect(N, m, 770, { a: .65, stretch: 1.05, fade: 380, t });
  S5_blit(N);
  X.save(); S5_set(m); X.fillStyle = 'rgba(4,5,8,.9)'; X.fillRect(-100, 758, 2120, 8); X.restore();   // the kerb line
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 170, lights: [{ x: fx, y: fy, r: 700, color: S5_P.neonPink }, { x: 300, y: 300, r: 420, color: S5_P.neonCyan }], ground: 790, splash: 50 }); X.restore();
  S5_flash(lt, S5_P.neonPink, .6);
  S5_caption(t);
}
// big billboard title (hook 1)
function S5_e(t, lt) {
  const wts = S5_hookWT(134.2), m = S5_camM(t, { z: S5_punch(lt, .06) * (1.1 - .08 * easeOut(lt / 2.4)), cy: 480, shake: KICK(t) * 4 });
  skNight(t, { horizon: S5_HZ, lights: S5_lights(m, [{ x: 960, y: 420, r: 900, color: S5_P.neonPink, gy: 900 }, { x: 960, y: 680, r: 500, color: S5_P.neonCyan, a: .7, gy: 900 }]), bokeh: 40, haze: '#5A2A70' });
  const bx = 140, by = 130, bw = 1640, bh = 640;
  X.save(); S5_set(m);
  // the rooftop and the billboard's steel: legs, a catwalk, the dark face of the board
  X.fillStyle = '#07080D'; X.fillRect(-200, 840, 2320, 400);
  X.fillStyle = '#0D0F18'; for (const lx of [360, 820, 1100, 1560]) X.fillRect(lx, by + bh, 22, 840 - by - bh);
  X.strokeStyle = '#141826'; X.lineWidth = 6; X.beginPath(); for (let i = 0; i < 8; i++) { X.moveTo(360 + i * 170, by + bh); X.lineTo(360 + (i + 1) * 170, 840); } X.stroke();
  X.fillStyle = '#10131D'; X.fillRect(bx - 20, by + bh, bw + 40, 16);
  X.fillStyle = '#05060A'; X.fillRect(bx, by, bw, bh);
  X.restore();
  const on1 = S5_titleOn(t, 'KHUÔN MẶT', wts.slice(0, 2)), on2 = S5_titleOn(t, S5_up('Đáng Thương'), wts.slice(2, 4), 5);
  const N = S5_layer('S5_neon', m, () => {
    // marquee bulbs chasing round the board on the 8ths
    const n = 64, ph = Math.floor(beatF(t) * 2);
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const u = i / n, per = 2 * (bw + bh), d = u * per, px = d < bw ? bx + d : d < bw + bh ? bx + bw : d < 2 * bw + bh ? bx + bw - (d - bw - bh) : bx, py = d < bw ? by : d < bw + bh ? by + (d - bw) : d < 2 * bw + bh ? by + bh : by + bh - (d - 2 * bw - bh);
      const lit = ((i + ph) % 4) < 2 ? 1 : .25, g = X.createRadialGradient(px, py, 0, px, py, 26);
      g.addColorStop(0, `rgba(255,236,200,${.95 * lit})`); g.addColorStop(.25, skRgba(S5_P.neonAmber, .6 * lit)); g.addColorStop(1, skRgba(S5_P.neonAmber, 0));
      X.fillStyle = g; X.fillRect(px - 26, py - 26, 52, 52);
    }
    X.restore();
    skNeon(() => X.rect(bx + 34, by + 34, bw - 68, bh - 68), S5_P.neonCyan, { w: 3, on: 1, seed: 101, I: .5, halo: .6, t });
    skNeonText('KHUÔN MẶT', 960, by + 285, { size: 215, align: 'center', color: S5_P.neonPink, on: on1, flicker: .05, seed: 111, I: S5_kI(t), w: 7, t });
    skNeonText(S5_up('Đáng Thương'), 960, by + 530, { size: 178, align: 'center', color: S5_P.neonCyan, on: on2, flicker: .05, seed: 121, I: S5_kI(t), w: 6.5, t });
  });
  S5_reflect(N, m, 850, { a: .5, stretch: 1, fade: 300, t, wet: false, ripple: 1.6 });
  S5_blit(N);
  // two small neon faces watching from the ends of the catwalk
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 150, lights: [{ x: 960, y: 420, r: 900, color: S5_P.neonPink }], ground: 860, splash: 40 }); X.restore();
  S5_flash(lt, S5_P.neonPink, .9);
  S5_caption(t);
}
// S5f · the mask above a puddle, its reflection broken by neon ripples on the beat
function S5_f(t, lt) {
  const m = S5_camM(t, { z: S5_punch(lt, .05) * (1.0 + lt * .016), y: -lt * 4, shake: KICK(t) * 2, cy: 540 });
  S5_bokehBG(t, { lights: [{ x: 300, y: 260, r: 600, color: S5_P.neonCyan }, { x: 1620, y: 300, r: 620, color: S5_P.neonPink }, { x: 960, y: 900, r: 420, color: S5_P.neonPink, a: .5 }], bokeh: 40 });
  const x = 960, y = 360, R = 180, rot = .05 + .03 * Math.sin(lt * .8);
  const ML = S5_maskLayer(t, m, x, y, R, { rot, key: 'f', ref: S5_camM(0, { z: 1.03, cy: 540 }), glow: S5_P.neonCyan, left: S5_P.neonCyan, right: S5_P.neonPink });
  // ripples on each beat disturb the reflection (a wave that runs outward)
  const bt = beatN(t), rip = [0, 1, 2].map(j => beatT(bt - j));
  const wave = d => rip.reduce((s, tt) => { const a = t - tt, r = a * 520; return s + Math.sin((d - r) / 9) * 14 * Math.exp(-Math.abs(d - r) / 40) * Math.exp(-a * 1.5); }, 0);
  S5_reflect(ML, m, y + R * 1.25 + 60, { a: .55, stretch: 1, fade: 520, t, wave, ripple: 2 });
  S5_maskDraw(ML, m, t, x, y, R);
  X.save(); S5_set(m); S5_chips(t, x, y, R);
  for (const tt of rip) skRipple(x, y + R * 1.25 + 60 + 180, t, tt, { neon: S5_P.neonCyan, r: 260, flat: .16, n: 3, dur: 1.6 });
  X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 140, lights: [{ x: 300, y: 260, r: 600, color: S5_P.neonCyan }, { x: 1620, y: 300, r: 620, color: S5_P.neonPink }], ground: 700, splash: 50 }); X.restore();
  S5_flash(lt, S5_P.neonCyan, .6);
  S5_caption(t);
}
// S5g · a row of shopfronts, the face in every window, chasing on and off on the 8ths
function S5_g(t, lt) {
  const m = S5_camM(t, { z: S5_punch(lt, .05) * 1.04, x: 60 - lt * 40, shake: KICK(t) * 3 });
  const Ls = [{ x: 300, y: 380, r: 420, color: S5_P.neonPink, gy: 820 }, { x: 960, y: 380, r: 420, color: S5_P.neonCyan, gy: 820 }, { x: 1620, y: 380, r: 420, color: S5_P.neonAmber, a: .7, gy: 820 }];
  skNight(t, { horizon: S5_HZ, lights: S5_lights(m, Ls), bokeh: 20, haze: '#5A2A70' });
  X.save(); S5_set(m);
  X.fillStyle = '#0A0B12'; X.fillRect(-300, -60, 2520, 850);
  const shops = [[-120, 'HOA'], [330, 'CÀ PHÊ'], [780, 'KARAOKE'], [1230, 'BÁNH MÌ'], [1680, 'HOA TƯƠI']];
  for (const [sx] of shops) { X.fillStyle = '#040508'; X.fillRect(sx, 280, 380, 420); X.fillStyle = '#12151F'; X.fillRect(sx - 12, 700, 404, 14); X.fillStyle = '#06070C'; X.fillRect(sx, 130, 380, 110); }
  X.restore();
  const e8 = Math.floor(beatF(t) * 2), cols = [[S5_P.neonCyan, S5_P.neonPink], [S5_P.neonPink, S5_P.neonAmber], [S5_P.neonAmber, S5_P.neonCyan], [S5_P.neonWhite, S5_P.neonPink], [S5_P.neonCyan, S5_P.neonAmber]];
  const N = S5_layer('S5_neon', m, () => {
    shops.forEach(([sx, name], i) => {
      const chase = ((e8 + i) % 5) === 0 ? .15 : 1, on = S5_on(t, i) * chase;
      skNeon(() => X.rect(sx + 8, 288, 364, 404), cols[i][1], { w: 2.4, on: S5_on(t, i), flicker: S5_flick(t), seed: 130 + i, I: .45, halo: .6, t });
      skFaceNeon(sx + 190, 490, 64, t + i * .7, { on: on >= .99 ? 1 : on, flicker: S5_flick(t), colors: { line: cols[i][0], petal: cols[i][1] }, w: 2.6, eyes: i % 2 ? 'down' : 'open', tearT: [beatT(beatN(t) - (i % 2)), beatT(beatN(t) - 2 - (i % 2))] });
      skNeonText(name, sx + 190, 212, { size: 58, align: 'center', color: cols[i][0], on: S5_on(t, i + 1), flicker: i === 3 ? .5 : S5_flick(t), broken: i === 3 ? 1 : undefined, seed: 140 + i, I: S5_kI(t), w: 2.4, halo: .7, t });
    });
  });
  S5_reflect(N, m, 720, { a: .6, stretch: 1.05, fade: 360, t });
  S5_blit(N);
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 170, lights: S5_lights(m, Ls), ground: 760, splash: 60 }); X.restore();
  S5_flash(lt, S5_P.neonAmber, .6);
  S5_caption(t);
}
// S5h · extreme close-up on the mask's eye, light pouring through the cracks
function S5_h(t, lt) {
  S5_bokehBG(t, { bokeh: 30 });
  const m = S5_camM(t, { z: S5_punch(lt, .06) * (1 + lt * .02), cx: 720, cy: 420, x: 240, y: 120, shake: 8 * hit(t, barT(56), .4) + KICK(t) * 3 });
  const x = 960, y = 640, R = 560;
  const ML = S5_maskLayer(t, m, x, y, R, { rot: .08, key: 'h', ref: S5_camM(0, { z: 1, cx: 720, cy: 420, x: 240, y: 120 }) });
  S5_maskDraw(ML, m, t, x, y, R);
  // god-rays: the light behind the mask leaks through the cracks as soft beams
  X.save(); S5_set(m); X.globalCompositeOperation = 'lighter';
  const ix = x + S5_MASK_AT[0] * R, iy = y + S5_MASK_AT[1] * R;
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * .5 + (hash(i * 3.3) - .5) * 2.8 + Math.sin(t * .5 + i) * .05, L = R * (1.2 + hash(i) * .8), w = .05 + hash(i * 7.1) * .06, al = (.08 + .06 * hash(i * 2.2)) * (.7 + .3 * KICK(t));
    const g = X.createRadialGradient(ix, iy, 0, ix, iy, L); g.addColorStop(0, skRgba(S5_P.neonPink, al)); g.addColorStop(1, skRgba(S5_P.neonPink, 0));
    X.fillStyle = g; X.beginPath(); X.moveTo(ix, iy); X.arc(ix, iy, L, a - w, a + w); X.closePath(); X.fill();
  }
  S5_chips(t, x, y, R);
  X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 110, len: 70, speed: 1600, lights: [{ x: 260, y: 300, r: 620, color: S5_P.neonPink }, { x: 1680, y: 360, r: 600, color: S5_P.neonCyan }] }); X.restore();
  S5_flash(lt, S5_P.neonPink, .7);
  S5_caption(t);
}
// S5i · HOOK 2: the title around the mask; the mask shatters, the neon sputters out
function S5_i(t, lt) {
  const wts = S5_hookWT(144.5), dk = clamp((t - S5_DARK) / .4);
  const m = S5_camM(t, { z: S5_punch(lt, .06) * (1.0 + lt * .025), shake: KICK(t) * 4 + 12 * hit(t, S5_SHATTER, .45), cy: 560 });
  skNight(t, { horizon: S5_HZ, lights: S5_lights(m, [{ x: 960, y: 250, r: 800, color: S5_P.neonPink, gy: 950 }, { x: 960, y: 900, r: 700, color: S5_P.neonCyan, gy: 950 }], 1 - dk * .8), bokeh: 40, haze: '#5A2A70', hazeA: 1 - dk * .7 });
  const on1 = S5_titleOn(t, 'KHUÔN MẶT', wts.slice(0, 2), 11), on2 = S5_titleOn(t, S5_up('Đáng Thương'), wts.slice(2, 4), 23);
  const N = S5_layer('S5_neon', m, () => {
    skNeonText('KHUÔN MẶT', 960, 290, { size: 235, align: 'center', color: S5_P.neonPink, on: on1, flicker: S5_flick(t), seed: 151, I: S5_kI(t), w: 7.5, t });
    skNeonText(S5_up('Đáng Thương'), 960, 905, { size: 188, align: 'center', color: S5_P.neonCyan, on: on2, flicker: S5_flick(t), broken: 7, seed: 161, I: S5_kI(t), w: 7, t });
  });
  S5_blit(N);
  const x = 960, y = 590, R = 128;
  const ML = S5_maskLayer(t, m, x, y, R, { rot: -.03, key: 'i', ref: S5_camM(0, { z: 1.04, cy: 560 }) });
  S5_maskDraw(ML, m, t, x, y, R);
  X.save(); S5_set(m); S5_chips(t, x, y, R); X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); skRainNeon(t, { n: 170, lights: [{ x: 960, y: 250, r: 800, color: S5_P.neonPink, a: 1 - dk }, { x: 960, y: 900, r: 700, color: S5_P.neonCyan, a: 1 - dk }], ground: 960, splash: 30 }); X.restore();
  S5_flash(lt, S5_P.neonCyan, .9);
  S5_flash(t - S5_SHATTER, '#FFFFFF', .8);
  S5_caption(t);
  // the dark closes in
  if (dk > 0) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.fillStyle = `rgba(3,3,6,${dk * .45})`; X.fillRect(0, 0, W, H); X.restore(); }
}

shot(S5_T0, barT(50), S5_a, { seed: 501 });
shot(barT(50), barT(51), S5_b, { seed: 502 });
shot(barT(51), barT(52), S5_c, { seed: 503 });
shot(barT(52), barT(53), S5_d, { seed: 504 });
shot(barT(53), barT(54), S5_e, { seed: 505 });
shot(barT(54), barT(55), S5_f, { seed: 506 });
shot(barT(55), barT(56), S5_g, { seed: 507 });
shot(barT(56), barT(57), S5_h, { seed: 508 });
shot(barT(57), S5_END, S5_i, { seed: 509 });
