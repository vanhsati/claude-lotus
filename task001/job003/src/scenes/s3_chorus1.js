// s3_chorus1.js: S3 · Chorus 1 (64.7–86.3). The first big reveal: the silk memory tears open onto the neon present.
// S3A 64.70–65.99  silk: the painted face weeps, "Cánh hoa úa tàn" is brushed on; neon light bleeds through the back of
//                  the silk and gathers along a seam.
// S3B 65.99–68.52  bar 26, the peak: the silk TEARS down the middle onto the wet night street; the neon face strikes on
//                  between the parting halves, rain, reflections, neon tears on the beat.
// S3C 68.52–71.05  close-up of the neon face, a tear on every other beat; the lids close on "mi khép".
// S3D 71.05–73.57  wide street, the face turned away, neon rings on the puddles on the beat; blackout on the pickup.
// S3E 73.57–76.10  HOOK 1: KHUÔN MẶT / ĐÁNG THƯƠNG switching on letter by letter, mirrored in the street.
// S3F 76.10–78.63  the face withering: petals go dark one per beat and fall into the puddles; ĐẮNG CAY / EM ĐÃ CHỌN.
// S3G 78.63–81.15  CHÍNH EM / ĐÃ CHỌN slams on, then the sign dies to cold glass.
// S3H 81.15–83.68  the face goes cold (pink → cyan, sputtering): "rời làn hơi ấm"; blackout on the pickup.
// S3I 83.68–86.30  HOOK 2: the title inside a ring of neon petals; on "cánh hoa úa tàn" the petals fall, the title goes
//                  out letter by letter and CÁNH HOA ÚA TÀN lights in its place.
// Small lines are neon captions at the foot of the frame (unlit glass, each word striking on as it is sung).

const S3_T0 = 64.7, S3_B26 = barT(26), S3_END = 86.3;
const S3_TEAR0 = S3_B26 - .05, S3_TEARD = .8;
const S3_P = SK_PAL, S3_PINK = SK_PAL.neonPink, S3_CYAN = SK_PAL.neonCyan, S3_HZ = 600;
const S3_LN = () => LY.filter(l => l[0] >= S3_T0 - .1 && l[0] < S3_END - .5);   // the 9 lines of the chorus
const S3_line = i => S3_LN()[i];
const S3_wt = i => (S3_line(i) ? wordTimes(S3_line(i)) : []);
const S3_nfc = s => s.normalize('NFC');
const S3_hex = (a, b, k) => { const A = skHex(a), B = skHex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };

// ---------- neon type ----------
// per-letter 'on' for words [{s, t}] joined by single spaces: each letter strikes on in turn from its word's time
function S3_onArr(words, t, rate = .04, d = .09) {
  const arr = [];
  words.forEach((w, i) => { [...w.s].forEach((c, j) => arr.push(clamp((t - w.t - j * rate) / d))); if (i < words.length - 1) arr.push(0); });
  return arr;
}
// switch off letter by letter from t1 (reverse order optional)
function S3_offArr(on, t, t1, rate = .03, d = .06) {
  return on.map((v, j) => v * (1 - clamp((t - t1 - j * rate) / d)));
}
// words[a..b) of lyric line i as [{s, t}] (optionally upper-cased)
function S3_words(i, a = 0, b = 99, up = false) {
  return S3_wt(i).slice(a, b).map(w => ({ s: S3_nfc(up ? w.w.toUpperCase() : w.w).replace(/[.,…]/g, ''), t: w.t }));
}
// a petal (teardrop) centred at (x, y), pointing along angle a
function S3_petal(x, y, a, len, wid) {
  const cx = Math.cos(a), sy = Math.sin(a), pts = [];
  for (let k = 0; k < 16; k++) { const u = k / 16 * TAU, al = Math.cos(u), sd = Math.sin(u) * (al < 0 ? .55 + .45 * (1 + al) : 1); pts.push([x + cx * al * len - sy * sd * wid, y + sy * al * len + cx * sd * wid]); }
  return pts;
}
// A big neon title of words. o: {x, y, size, color, align, reflect, flicker, broken, off (time it switches off), I, font, rate}
function S3_neonWords(t, words, o) {
  if (!words.length) return;
  const str = words.map(w => w.s).join(' ');
  let on = S3_onArr(words, t, o.rate ?? .045, o.d ?? .1);
  if (o.off !== undefined) on = S3_offArr(on, t, o.off, o.offRate ?? .03);
  if (t < words[0].t - (o.pre ?? .25) || (o.stop !== undefined && t >= o.stop)) return;   // the unlit glass shows a moment before the first letter strikes
  skNeonText(str, o.x, o.y, { size: o.size, color: o.color, align: o.align || 'center', on, flicker: o.flicker ?? .08, broken: o.broken, t,
    reflect: o.reflect, I: o.I, font: o.font, tracking: o.tracking, seed: o.seed ?? 5, halo: o.halo, w: o.w });
}
// Neon caption at the foot of the frame: the whole line as unlit glass, words striking on as sung; fades at `until`.
function S3_cap(t, i, o = {}) {
  const L = S3_line(i); if (!L) return;
  const words = S3_words(i, o.a ?? 0, o.b ?? 99); if (!words.length) return;
  const t0 = o.from ?? L[0] - .08, t1 = o.until ?? L[1];
  if (t < t0 || t > t1 + .12) return;
  const I = clamp((t - t0) / .1) * (1 - clamp((t - t1) / .12));
  const size = o.size ?? 52, y = o.y ?? 1008;
  // a soft dark bed so the caption reads over bright reflections
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = .55 * I;
  const g = X.createLinearGradient(0, y - size * 2.2, 0, H); g.addColorStop(0, 'rgba(5,6,12,0)'); g.addColorStop(1, 'rgba(5,6,12,.9)'); X.fillStyle = g; X.fillRect(0, y - size * 2.2, W, H - y + size * 2.2);
  X.restore();
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
  S3_neonWords(t, words, { x: o.x ?? W / 2, y, size, color: o.color || S3_CYAN, I, font: FONT.vnSansB(size), rate: .03, d: .07, pre: 1, seed: 21 + i, halo: .8, flicker: .04 });
  X.restore();
}
// all small captions of the section, by time
function S3_caps(t) {
  const L = S3_LN(); if (L.length < 9) return;
  S3_cap(t, 0, { a: 4, from: S3_B26 - .1, until: L[1][0] - .06, color: SK_PAL.neonWhite });   // "bước chân khép màn" (the rest was brushed on the silk)
  S3_cap(t, 1, { until: L[2][0] - .06 });
  S3_cap(t, 2, { until: L[3][0] - .06, color: '#FF7AC4' });
  S3_cap(t, 3, { b: 5, until: barT(29) - .1 });                                        // "Biết đi về chốn đâu" (the hook follows as a title)
  S3_cap(t, 4, { until: L[5][0] - .06, color: '#FF7AC4' });
  S3_cap(t, 6, { until: L[7][0] - .06 });
  S3_cap(t, 7, { b: 5, until: barT(33) - .1, color: '#FF7AC4' });                      // "Biết ai còn nhớ ai"
}

// ---------- the night street ----------
function S3_lights(t, set = 0, amp = 1) {
  const k = 1 + KICK(t) * .35;
  const L = [
    [{ x: 330, y: 250, r: 420 * k, color: S3_PINK, a: .9 * amp }, { x: 1600, y: 280, r: 440 * k, color: S3_CYAN, a: .9 * amp }, { x: 960, y: 470, r: 320, color: '#8A5CFF', a: .45 * amp }],
    [{ x: 1500, y: 320, r: 520 * k, color: S3_PINK, a: .8 * amp }, { x: 300, y: 380, r: 380 * k, color: S3_CYAN, a: .7 * amp }, { x: 900, y: 520, r: 300, color: SK_PAL.neonAmber, a: .35 * amp }],
  ];
  return L[set];
}
// dark buildings along both sides with a few neon signs (drawn under the camera; the camera centre sits on the horizon)
function S3_blocks(t, hz, o = {}) {
  const amp = o.amp ?? 1;
  X.save();
  const B = [[-80, 160, 280], [150, 210, 340], [330, 150, 220], [1540, 170, 260], [1690, 150, 330], [1830, 200, 300], [1400, 170, 170]];
  B.forEach(([x, w, h], i) => {
    const g = X.createLinearGradient(0, hz - h, 0, hz); g.addColorStop(0, '#07080F'); g.addColorStop(1, '#10131F');
    X.fillStyle = g; X.fillRect(x, hz - h, w, h + 2);
    X.fillStyle = 'rgba(255,190,110,.35)';
    for (let r = 0; r < Math.floor(h / 26); r++) for (let c = 0; c < Math.floor(w / 24); c++) {
      const hsh = hash(i * 91 + r * 7.3 + c * 1.9); if (hsh > .16) continue;
      X.globalAlpha = (.4 + .6 * hash(hsh * 9)) * amp; X.fillRect(x + 8 + c * 24, hz - h + 12 + r * 26, 9, 12);
    }
    X.globalAlpha = 1;
  });
  X.restore();
}
function S3_signs(t, hz, amp = 1) {
  const bt = beatN(t), I = amp * (.85 + .15 * pulse(t, .5));
  // a vertical sign of stacked bars, a heart, a spark, a ring: shapes, never words (the words on screen are the lyrics)
  skNeon(() => { X.roundRect(212, hz - 300, 60, 200, 14); for (let k = 0; k < 4; k++) { X.moveTo(226, hz - 270 + k * 42); X.lineTo(258, hz - 270 + k * 42); } }, S3_CYAN, { w: 4, t, seed: 41, I, flicker: .15 });
  skNeon(() => heartPath(420, hz - 190, 34), S3_PINK, { w: 4.5, t, seed: 42, I: I * (bt % 2 ? 1 : .7) });
  skNeon(() => sparkPath(1600, hz - 230, 42, 6, .25, t * .4, .55), SK_PAL.neonAmber, { w: 4, t, seed: 43, I, flicker: .3 });
  skNeon(() => { X.moveTo(1790 + 40, hz - 300); X.arc(1790, hz - 300, 40, 0, TAU); X.moveTo(1790, hz - 260); X.lineTo(1790, hz - 180); }, S3_PINK, { w: 4, t, seed: 44, I, broken: 0, flicker: .5 });
}
function S3_street(t, o = {}) {
  const hz = o.hz ?? S3_HZ, lights = o.lights || S3_lights(t, o.set ?? 0, o.amp ?? 1);
  skNight(t, { horizon: hz, lights, bokeh: o.bokeh ?? 36, hazeA: (o.amp ?? 1) * (1 + KICK(t) * .5) });
  return lights;
}
function S3_rain(t, lights, o = {}) {
  skRainNeon(t, { n: o.n ?? 220, lights, ground: o.hz ?? S3_HZ, angle: .1, speed: 1400, len: o.len ?? 42, alpha: o.alpha ?? 1, splash: o.splash ?? 60, w: o.w });
}
// things standing on the street, mirrored in it (one reflection pass for the whole group), then drawn
function S3_refl(fn, a = .5, hz = S3_HZ) { skReflect(fn, hz, { a, t: T }); fn(); }
// a flash of light on a hard cut (neon catching)
function S3_cutFlash(t, t0, col = '#FFD6F0', a = .35) {
  const k = hit(t, t0, .16); if (k <= .01) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter'; X.globalAlpha = a * k; X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore();
}
// tear times: every n beats inside [a, b)
const S3_beats = (a, b, n = 1, off = 0) => { const out = []; for (let k = Math.ceil(beatF(a) - 1e-3); beatT(k) < b; k += n) out.push(beatT(k) + off); return out; };
// face breathing with the voice
const S3_breath = t => 1 + VOX(t) * .018 + Math.sin(t * 2.2) * .006;

// ---------- S3A · silk ----------
// an irregular wash shape (a loose brushed blob)
function S3_blob(cx, cy, rx, ry, sd) {
  const pts = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 1 + noise1(a * 1.3 + sd * 7) * .16 + noise1(a * 4 + sd) * .06; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  pathSmooth(pts);
}
// A painting layer drawn once (per worker and scale) on a transparent canvas, then laid on the silk with multiply
// (pigment on silk), so the backlit silk underneath can change every frame at no cost to the painting.
const S3_CACHE = {};
function S3_painted(key, fn) {
  const k = key + '@' + SX; let c = S3_CACHE[k];
  if (!c) {
    c = mkCanvas(Math.round(W * SX), Math.round(H * SX)); const prev = X; X = c.getContext('2d');
    try { X.setTransform(SX, 0, 0, SX, 0, 0); fn(); } finally { X = prev; }
    S3_CACHE[k] = c;
  }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.drawImage(c, 0, 0, X.canvas.width, X.canvas.height); X.restore();
}
function S3_silk(t) {
  const lt = t - S3_T0, ramp = easeIn(clamp(lt / 1.3)), seam = easeIn(clamp((t - (S3_TEAR0 - .7)) / .7));
  const kk = KICK(t);
  const lights = [[380, 300, 280, S3_PINK], [1560, 260, 320, S3_CYAN], [980, 820, 240, SK_PAL.neonAmber],
    ...[120, 360, 600, 840, 1040].map((y, i) => [960 + noise1(i * 1.7) * 60, y, 60 + 150 * seam * (1 + kk * .4), i % 2 ? S3_PINK : '#FFB0DD'])];
  skSilk(t, { backlight: .02 + .45 * ramp + kk * .12 * ramp + seam * .2, dim: .55, lights });
  // the memory: an indigo night wash, a rose pool where the tears fall, the weeping face (painted once)
  S3_painted('face', () => {
    skWash(() => S3_blob(W / 2, 170, 1150, 330, 3), SK_PAL.indigo, { a: .5, edge: .5, grad: [0, -60, 0, 520], gradTo: .05, feather: .6, rough: .7, seed: 31, scale: 3, color2: SK_PAL.cobalt, mix: .3 });
    skWash(() => S3_blob(1370, 760, 300, 200, 5), SK_PAL.rose, { a: .34, edge: .55, feather: .45, rough: .6, seed: 32, scale: 3, color2: SK_PAL.indigo, mix: .25 });
    skFacePortrait(1370, 470, 215, S3_T0, { tears: .9, eyes: 'down', mouth: 0 });
    skSeal(650, 830, 46, 'LỤA', {});
  });
  // "Cánh hoa úa tàn" brushed on as sung (the rest of the line comes in neon after the tear)
  const ws = S3_words(0, 0, 4);
  const rows = [[0, 1, 150, 600], [2, 3, 250, 790]];
  for (const [a, b, x0, y] of rows) {
    let x = x0;
    for (let i = a; i <= b; i++) {
      if (!ws[i]) continue;
      const fnt = FONT.vnI(170), wd = textW(ws[i].s, fnt), k = clamp((t - ws[i].t) / .28), xx = x;
      const draw = () => skBrushText(ws[i].s, xx, y, { size: 170, k, seed: 7 + i, color: i >= 2 ? '#3A2A40' : S3_P.ink });
      if (k >= 1) S3_painted('w' + i + ws[i].s, draw); else draw();
      x += wd + 48;
    }
  }
  skInk([[150, 650, .5], [360, 662], [560, 648, .3]], { w: 7, k: clamp((t - (ws[1] ? ws[1].t : t)) / .4), dry: .6, alpha: .6, seed: 9 });
}

// ---------- S3B · the reveal ----------
function S3_reveal(t) {
  const lt = t - S3_B26, pull = expoOut(clamp((lt + .05) / 1.2));
  const lights = S3_street(t, { set: 0, amp: .6 + .4 * clamp(lt / .4) });
  camBegin({ x: W / 2, y: S3_HZ, zoom: lerp(1.1, 1, pull) + pulse(t, .3) * .006, shake: KICK(t) * 5 });
  S3_blocks(t, S3_HZ, { amp: clamp(lt / .6) });
  const on = clamp((lt + .02) / .5), R = 205 * S3_breath(t);
  S3_refl(() => { S3_signs(t, S3_HZ, clamp(lt / .6)); skFaceNeon(960, 330, R, t, { on: on >= 1 ? 1 : on * .9, flicker: .05, tearT: S3_beats(S3_B26 + .02, 68.6, 2), eyes: 'down' }); });
  // the tears land on the street as rings
  for (const tt of S3_beats(S3_B26 + .02, 68.6, 2)) { skRipple(960 - 50, 700, t, tt + .95, { neon: S3_CYAN, r: 90, flat: .22, n: 2, dur: 1.4 }); skRipple(960 + 50, 712, t, tt + .98, { neon: S3_CYAN, r: 80, flat: .22, n: 2, dur: 1.4 }); }
  camEnd();
  S3_rain(t, lights);
  S3_caps(t);
}
function S3_shotA(t) { S3_silk(t); }
function S3_shotB(t, lt) {
  const k = (t - S3_TEAR0) / S3_TEARD;
  if (k < 1) {
    skTear(clamp(k), 26, () => S3_reveal(t), () => S3_silk(t), { rim: S3_PINK, fray: 1.3, gap: 1.6 });
    // light floods out of the gap as the silk splits
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'lighter';
    const f = bump(clamp(k / .45)) * .45, g = X.createRadialGradient(960, 540, 0, 960, 540, 900);
    g.addColorStop(0, skRgba('#FF9AD6', f)); g.addColorStop(1, skRgba(S3_PINK, 0)); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
  } else S3_reveal(t);
}

// ---------- S3C · close-up ----------
function S3_shotC(t, lt) {
  const lights = [{ x: 420, y: 200, r: 560, color: S3_PINK, a: .9 }, { x: 1560, y: 300, r: 520, color: S3_CYAN, a: .8 }, { x: 960, y: 760, r: 300, color: '#8A5CFF', a: .4 }];
  skNight(t, { horizon: 860, lights, bokeh: 50, hazeA: 1.2 + KICK(t) * .5 });
  const shut = t >= S3_wt(2)[2]?.t && t < barT(28) + .05;   // lids close on "mi khép"
  camBegin({ x: W / 2, y: 520, zoom: 1 + lt * .025 + pulse(t, .3) * .008, rot: lerp(-.025, .02, lt / 2.53), shake: KICK(t) * 3 });
  skFaceNeon(960, 560, 390 * S3_breath(t), t, { tearT: S3_beats(barT(27) - BEAT * 2, barT(28), 2, .02), eyes: shut ? 'closed' : 'down', flicker: .04 });
  camEnd();
  S3_rain(t, lights, { n: 140, len: 70, hz: 860, w: 2.2, splash: 0 });
  S3_caps(t);
  S3_cutFlash(t, barT(27));
}

// ---------- S3D · wide street, the face turned away ----------
function S3_shotD(t, lt) {
  const dark = clamp((t - (barT(29) - BEAT * .5)) / .06);   // blackout on the last half beat before the hook
  const amp = 1 - dark * .9, lights = S3_street(t, { set: 1, amp });
  camBegin({ x: lerp(900, 1020, lt / 2.53), y: S3_HZ, zoom: 1.04, shake: KICK(t) * 4 });
  S3_blocks(t, S3_HZ, { amp });
  S3_refl(() => { S3_signs(t, S3_HZ, amp); skFaceNeon(1300, 320, 170 * S3_breath(t), t, { turn: .5, eyes: 'down', on: amp < .5 ? 0 : 1, tearT: S3_beats(barT(28), barT(29), 2) }); }, .45);
  // rings on the puddles on every beat
  S3_beats(barT(28) - BEAT, barT(29)).forEach((tt, j) => skRipple(300 + hash(j * 3.7) * 1300, 660 + hash(j * 5.1) * 330, t, tt, { neon: j % 2 ? S3_PINK : S3_CYAN, r: 110 + hash(j) * 60, flat: .2, n: 2, dur: 1.3, alpha: amp }));
  camEnd();
  S3_rain(t, lights, { alpha: amp });
  S3_caps(t);
  S3_cutFlash(t, barT(28), '#BFF3FF', .25);
}

// ---------- S3E · HOOK 1 ----------
function S3_hookTitle(t, o = {}) {
  const ws = S3_words(3, 5, 9, true); if (ws.length < 4) return;
  S3_neonWords(t, ws.slice(0, 2), { x: W / 2, y: o.y1 ?? 330, size: o.size ?? 195, color: o.c1 || S3_PINK, off: o.off, flicker: .06, seed: 51, pre: .15 });
  S3_neonWords(t, ws.slice(2, 4), { x: W / 2, y: o.y2 ?? 560, size: o.size ?? 195, color: o.c2 || S3_CYAN, off: o.off !== undefined ? o.off + .25 : undefined, broken: 6, flicker: .1, seed: 57, pre: .15 });
}
function S3_shotE(t, lt) {
  const lights = S3_street(t, { set: 0, amp: .35 + .65 * easeOut(clamp(lt / .6)) });
  camBegin({ x: W / 2, y: S3_HZ, zoom: 1.0 + lt * .018 + pulse(t, .25) * .01, shake: KICK(t) * 6 });
  S3_blocks(t, S3_HZ, { amp: .5 + .5 * clamp(lt / .8) });
  S3_refl(() => { S3_signs(t, S3_HZ, .5 + .5 * clamp(lt / .8)); S3_hookTitle(t); }, .55);
  camEnd();
  S3_rain(t, lights, { n: 180 });
  S3_caps(t);
  S3_cutFlash(t, barT(29), '#FFD6F0', .5);
}

// ---------- S3F · the face withers ----------
// petals of the crown: which fall (one per beat from t0), each falling as a dimming neon petal into the street
function S3_fallingPetals(x, y, R, t, times, o = {}) {
  const G = skFaceGeo(R, t, { turn: o.turn || 0 }), fr = G.front, n = times.filter(tt => t >= tt).length;
  times.forEach((tt, j) => {
    const age = t - tt; if (age < 0 || age > 2.4) return;
    const p = fr[fr.length - 1 - j]; if (!p) return;
    const fall = Math.pow(age, 2) * (o.g ?? 260) , sway = Math.sin(age * 4 + j) * 30 * age, rot = age * (hash(j * 3.1) - .5) * 3;
    const ground = o.ground ?? S3_HZ + 150, cy = y + p.c[1] + fall, landed = cy > ground;
    const I = (1 - clamp(age / 2.4)) * (landed ? .4 : 1);
    if (landed) { skRipple(x + p.c[0] + sway, ground, t, tt + Math.sqrt((ground - y - p.c[1]) / (o.g ?? 260)), { neon: o.col || S3_PINK, r: 90, flat: .22, n: 2, dur: 1.2 }); return; }
    X.save(); X.translate(x + p.c[0] + sway, cy); X.rotate(rot); X.translate(-p.c[0], -p.c[1]);
    skNeon(() => pathSmooth(p.pts), o.col || S3_PINK, { w: Math.max(2.2, R * .028), I, t, seed: 60 + j, halo: .8, flicker: .2 });
    X.restore();
  });
  return n;
}
function S3_shotF(t, lt) {
  const lights = S3_street(t, { set: 1 });
  const fx = 1560, fy = 350, R = 190 * S3_breath(t), times = S3_beats(barT(30) + BEAT, barT(31), 1, .02);
  const lost = times.filter(tt => t >= tt).length;
  camBegin({ x: lerp(1000, 940, lt / 2.53), y: S3_HZ, zoom: 1.03 + lt * .01, shake: KICK(t) * 4 });
  S3_blocks(t, S3_HZ);
  const ws = S3_words(5, 0, 5, true);
  S3_refl(() => {
    skFaceNeon(fx, fy, R, t, { turn: -.35, eyes: 'down', lost, tearT: S3_beats(barT(30), barT(31), 2), flicker: .05 });
    // ĐẮNG CAY / EM ĐÃ CHỌN
    if (ws.length === 5) {
      S3_neonWords(t, ws.slice(0, 2), { x: 100, y: 290, size: 140, align: 'left', color: SK_PAL.neonAmber, seed: 71, pre: .3 });
      S3_neonWords(t, ws.slice(2, 5), { x: 100, y: 470, size: 140, align: 'left', color: S3_PINK, seed: 74, pre: .3 });
    }
  }, .45);
  S3_fallingPetals(fx, fy, R, t, times, { turn: -.35, ground: 720 });
  camEnd();
  S3_rain(t, lights);
  S3_caps(t);
  S3_cutFlash(t, barT(30), '#FFE2B0', .25);
}

// ---------- S3G · CHÍNH EM / ĐÃ CHỌN, then the sign dies ----------
function S3_shotG(t, lt) {
  const lights = S3_street(t, { set: 0, amp: 1 - .45 * clamp((t - 80.1) / .8) });
  camBegin({ x: W / 2, y: S3_HZ, zoom: 1.08 - expoOut(clamp(lt / .5)) * .06 + lt * .012, shake: KICK(t) * 7 });
  S3_blocks(t, S3_HZ, { amp: 1 - .5 * clamp((t - 80.1) / .8) });
  const ws = S3_words(5, 5, 9, true), off = 80.15, fo = clamp((t - 80.5) / .5);
  S3_refl(() => {
  S3_signs(t, S3_HZ, 1 - .5 * clamp((t - 80.1) / .8));
  if (ws.length === 4) {
    S3_neonWords(t, ws.slice(0, 2), { x: W / 2, y: 330, size: 230, color: S3_PINK, seed: 81, pre: .05, off, offRate: .05, flicker: .1 });
    S3_neonWords(t, ws.slice(2, 4), { x: W / 2, y: 565, size: 230, color: S3_CYAN, seed: 84, pre: .05, off: off + .3, offRate: .05, broken: 1, flicker: .15 });
  }
  // after the sign dies, the face appears far down the street, small and cold
  if (fo > 0) skFaceNeon(960, 470, 95, t, { on: fo >= 1 ? 1 : fo * .8, eyes: 'down', colors: { petal: '#7FA8FF' }, tearT: S3_beats(80.6, barT(32), 2) });
  }, .55);
  camEnd();
  S3_rain(t, lights, { n: 260 });
  S3_caps(t);
  S3_cutFlash(t, barT(31), '#FFD6F0', .4);
}

// ---------- S3H · the face goes cold ----------
function S3_shotH(t, lt) {
  const dark = clamp((t - (barT(33) - BEAT * .5)) / .06), amp = 1 - dark * .92;
  const cold = easeInOut(clamp(lt / 2.0));
  const lights = [{ x: 500, y: 260, r: 460, color: S3_PINK, a: .7 * (1 - cold * .7) * amp }, { x: 1450, y: 280, r: 520, color: S3_CYAN, a: .9 * amp }, { x: 960, y: 520, r: 260, color: '#6A7CFF', a: .4 * amp }];
  skNight(t, { horizon: S3_HZ, lights, bokeh: 44, hazeA: amp, haze: '#223066' });
  camBegin({ x: W / 2, y: S3_HZ, zoom: 1.06 + lt * .03, shake: KICK(t) * 3 });
  S3_blocks(t, S3_HZ, { amp, signs: 0 });
  const R = 250 * S3_breath(t);
  S3_refl(() => skFaceNeon(960, 330, R, t, { eyes: 'down', on: amp < .5 ? 0 : 1, flicker: .1 + cold * .5, colors: { petal: S3_hex(S3_PINK, '#9FE8FF', cold) },
    tearT: S3_beats(barT(32), barT(33) - BEAT, 2) }));
  camEnd();
  S3_rain(t, lights, { n: 300, alpha: amp, len: 50 });
  S3_caps(t);
  S3_cutFlash(t, barT(32), '#BFF3FF', .3);
}

// ---------- S3I · HOOK 2 and "cánh hoa úa tàn" ----------
function S3_shotI(t, lt) {
  const lights = S3_street(t, { set: 0, amp: .4 + .6 * easeOut(clamp(lt / .5)) });
  const L20 = S3_line(8), fallT0 = L20 ? L20[0] : 84.94;
  camBegin({ x: W / 2, y: S3_HZ, zoom: 1.0 + lt * .02 + pulse(t, .25) * .01, shake: KICK(t) * 6 });
  // a garland of neon petals around the title (the crown, opened out to frame the words)
  const cx = W / 2, cy = 455, N = 24, wc0 = S3_words(8, 0, 4, true);
  const ringOn = j => clamp((t - barT(33) - j * .025) / .12);
  const fallAt = j => (wc0[j % 4] ? wc0[j % 4].t : fallT0 + (j % 4) * .3) + Math.floor(j / 4) * .05 + hash(j * 3.3) * .03;
  for (let j = 0; j < N; j++) {
    const u = (j + .5) / N * TAU - Math.PI / 2, ex = Math.cos(u) * 840, ey = Math.sin(u) * 360, a = Math.atan2(ey * 840 / 360, ex * 360 / 840);
    const col = j % 3 === 1 ? SK_PAL.neonAmber : S3_PINK, age = t - fallAt(j);
    const pts = S3_petal(0, 0, a, 88, 34);
    if (age < 0) { withT(cx + ex, cy + ey, 0, 1, () => skNeon(() => pathSmooth(pts), col, { w: 4.5, t, seed: 91 + j, on: ringOn(j), flicker: .05, halo: .8 })); continue; }
    // withered: the petal drops, turning, dimming, and lands in the street with a ring
    const px = cx + ex, py = cy + ey, g = 900, v0 = -120, ground = 700 + hash(j * 2.3) * 260;
    const tl = (-v0 + Math.sqrt(v0 * v0 + 2 * g * Math.max(0, ground - py))) / g;
    if (py > ground - 20 || age > tl) { skRipple(px + Math.sin(tl * 3 + j) * 30 * tl, ground, t, fallAt(j) + tl, { neon: col, r: 110, flat: .2, n: 2, dur: 1.2 }); continue; }
    const fall = v0 * age + .5 * g * age * age;
    withT(px + Math.sin(age * 3 + j) * 30 * age, py + fall, age * (hash(j * 7.1) - .5) * 5, 1, () => skNeon(() => pathSmooth(pts), col, { w: 4.5, t, seed: 91 + j, I: 1 - clamp(age / 1.4) * .5, flicker: .35, halo: .8 }));
  }
  // KHUÔN MẶT / ĐÁNG THƯƠNG, then it goes out letter by letter and CÁNH HOA ÚA TÀN lights in its place
  const ws = S3_words(7, 5, 9, true), wc = S3_words(8, 0, 4, true);
  S3_refl(() => {
  if (ws.length === 4) {
    S3_neonWords(t, ws.slice(0, 2), { x: cx, y: 360, size: 190, color: S3_CYAN, off: fallT0 - .34, offRate: .016, stop: fallT0 - .02, seed: 95, pre: .12 });
    S3_neonWords(t, ws.slice(2, 4), { x: cx, y: 565, size: 190, color: SK_PAL.neonWhite, off: fallT0 - .24, offRate: .016, stop: fallT0 - .02, seed: 97, pre: .12, broken: 3 });
  }
  if (wc.length === 4) {
    S3_neonWords(t, wc.slice(0, 2), { x: cx, y: 360, size: 205, color: S3_PINK, seed: 101, pre: .05, rate: .05 });
    S3_neonWords(t, wc.slice(2, 4), { x: cx, y: 580, size: 205, color: S3_PINK, seed: 104, pre: .05, rate: .05, broken: 1, flicker: .15 });
  }
  }, .5);
  camEnd();
  S3_rain(t, lights, { n: 220 });
  S3_caps(t);
  S3_cutFlash(t, barT(33), '#FFD6F0', .5);
}

shot(S3_T0, S3_B26, S3_shotA, { seed: 301 });
shot(S3_B26, barT(27), S3_shotB, { seed: 302, dark: true });
shot(barT(27), barT(28), S3_shotC, { seed: 303, dark: true });
shot(barT(28), barT(29), S3_shotD, { seed: 304, dark: true });
shot(barT(29), barT(30), S3_shotE, { seed: 305, dark: true });
shot(barT(30), barT(31), S3_shotF, { seed: 306, dark: true });
shot(barT(31), barT(32), S3_shotG, { seed: 307, dark: true });
shot(barT(32), barT(33), S3_shotH, { seed: 308, dark: true });
shot(barT(33), S3_END, S3_shotI, { seed: 309, dark: true });
// S3PERF-TEMP
window.TESTS = window.TESTS || {};
TESTS.S3perf = () => {
  const flush = () => X.getImageData(0, 0, 1, 1), out = [];
  for (const tt of [64.9, 65.6, 66.2, 66.5, 67.5, 69.0, 72.0, 74.5, 77.5, 79.0, 82.0, 84.3, 85.4, 86.1]) {
    const ms = []; for (let i = 0; i < 3; i++) { const a = performance.now(); drawFrameReal(tt + i * .033); flush(); ms.push(Math.round(performance.now() - a)); }
    out.push(tt + ': ' + ms.join('/'));
  }
  const tm = (nm, fn) => { const ms = []; for (let i = 0; i < 3; i++) { const a = performance.now(); X.setTransform(SX, 0, 0, SX, 0, 0); T = 65.2 + i * .033; fn(T); flush(); ms.push(Math.round(performance.now() - a)); } out.push(nm + ': ' + ms.join('/')); };
  tm('silkBL', t => skSilk(t, { backlight: .4, dim: .55 }));
  tm('silk', t => skSilk(t));
  tm('wash', t => { skWash(() => S3_blob(W / 2, 170, 1150, 330, 3), SK_PAL.indigo, { a: .5, edge: .5, grad: [0, -60, 0, 520], gradTo: .05, feather: .6, rough: .7, seed: 31, scale: 3, color2: SK_PAL.cobalt, mix: .3 }); });
  tm('face', t => skFacePortrait(1370, 470, 215, t, { tears: lerp(.45, 1, clamp((t - 64.7) / 1.2)), eyes: 'down', mouth: 0 }));
  tm('faceStatic', t => skFacePortrait(1370, 470, 215, t, { tears: .8, eyes: 'down', mouth: 0 }));
  tm('brush', t => skBrushText('Cánh', 150, 600, { size: 170, k: .5 }));
  tm('fin', t => skFinish(t, null));
  tm('night', t => S3_street(t));
  tm('blocks', t => S3_blocks(t, 600));
  tm('faceNeon', t => skFaceNeon(960, 330, 205, t, { eyes: 'down', reflect: { y: 600, a: .5 } }));
  tm('faceNeonNoRef', t => skFaceNeon(960, 330, 205, t, { eyes: 'down' }));
  tm('rain', t => S3_rain(t, S3_lights(t)));
  tm('cap', t => S3_cap(66.5, 0, { a: 4 }));
  console.error('S3 ms · ' + out.join(' · '));
};
function drawFrameReal(t) { T = t; BOIL = Math.floor(t * 12); X.setTransform(SX, 0, 0, SX, 0, 0); const sh = shotAt(t); SEED = sh.seed; paintWithTransition(sh, t); X.save(); skFinish(t, sh); X.restore(); }
