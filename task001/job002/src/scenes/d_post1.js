// d_post1.js: D · Post-hook 1 (87.9–107.5). LY[23–32].
// D1  87.9–91.93   black lacquer panel, the idol in close-up; I DO NOT / GAMBLE / AND E TOO / SURE stamped as inlay.
//                  89.746 (the big hit): the whole panel is sanded away in one hit to pure gold, COME MY! carved in cinnabar.
// D2  91.93–107.5  the pagoda gate at night, the idol under the gate, 40-odd masked dancers moving in waves.
//     a 91.93  wide gate pull-back, tender "Girl nah only you concern me"   (sanded open from the gold)
//     b 94.11  low angle into the crowd, COME / MY… gold stamps on the sung beats
//     c 96.29  close on the idol with the gate's gold sun-window as a halo, tender "Nah only you fit disturb me"
//     d 99.02  high wide over the courtyard, COME | MY… stamped either side of the gate
//     e 100.66 medium on the idol dancing under the gate, lacquer caption (LY[30])
//     f 102.84 tracking along the crowd rows as the wave runs through them (caption continues)
//     g 105.56 close: "I can never / refuse you!" tender; beat 196 the last COME MY… slams in gold (LY[32], sung 107.67)

const D_BT = n => beatT(n);                 // beat n in song seconds (beat 164 = 89.746, the hit)
const D_HIT = beatT(164);
const D_CUTS = [87.9, beatT(168), beatT(172), beatT(176), beatT(181), beatT(184), beatT(188), beatT(193), 107.5];

// ---------- small helpers ----------
// A word/line stamped as inlay: slams from 1.3× to 1× with a glint that runs through it after landing.
function D_stampInlay(str, x, y, t, t0, o = {}) {
  const st = stampK(t, t0, o.dur || .14); if (!st) return null;
  X.save(); X.translate(x, y); X.rotate(st.jolt * .05 * (hash(t0 * 3.1) - .5)); X.scale(st.s, st.s);
  const r = lqInlayText(str, 0, 0, { ...o, glint: o.glint ?? clamp((t - t0) / (o.glintDur || .8)) });
  X.restore(); return r;
}
// Gold flakes and lacquer dust thrown off a stamp or a sanding hit (flat fills: cheap).
function D_flakes(x, y, t, t0, o = {}) {
  const k = (t - t0) / (o.dur || .7); if (k < 0 || k > 1) return;
  const n = o.n || 40, R = o.r || 320, seed = o.seed || t0;
  X.save();
  for (let i = 0; i < n; i++) {
    const a = hash(seed + i * 1.37) * TAU, sp = .4 + hash(seed + i * 2.11) * .6, d = R * sp * expoOut(k);
    const px = x + Math.cos(a) * d * (o.sx || 1), py = y + Math.sin(a) * d * (o.sy || 1) + k * k * 90 * sp, sz = (3 + hash(seed + i * 3.3) * 9) * (o.size || 1);
    X.globalAlpha = (1 - k) * (.6 + hash(i + seed) * .4);
    X.fillStyle = i % 5 === 0 ? LQ_PAL.goldWhite : i % 3 === 0 ? LQ_PAL.goldDk : LQ_PAL.gold;
    X.save(); X.translate(px, py); X.rotate(a + k * 6 * (hash(i) - .5)); X.fillRect(-sz / 2, -sz * .35, sz, sz * .7); X.restore();
  }
  X.restore();
}
// Gold-glint cut: a hot diagonal band sweeps the new frame and a short screen flash (instead of a paper jolt).
function D_glintCut(t, t0, dur = .26) {
  const k = (t - t0) / dur; if (k < 0 || k >= 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  X.fillStyle = `rgba(246,214,150,${.42 * Math.pow(1 - k, 2)})`; X.fillRect(0, 0, W, H);
  lqBandPoly(easeOut(k), -.9, 260, [0, 0, W, H]);
  X.fillStyle = lqBand(easeOut(k), { glintAng: -.9, glintW: 260 }, [[0, 0], [.5, .55 * (1 - k)], [1, 0]], [255, 240, 200]); X.fill();
  X.restore();
}
// Lacquer caption: eggshell italic on a thin black lacquer plate with a gold hairline, the sung word lit in gold.
function D_caption(t, L, o = {}) {
  const [a, b] = L, k = easeOut((t - a + .1) / .2) * (1 - ease((t - b + .1) / .2));
  if (k <= .01) return;
  const size = o.size || 44, fnt = FONT.vnIR(size), y = o.y ?? 988, ws = wordTimes(L);
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.font = fnt;
  const sp = textW(' ', fnt), wd = ws.map(w => textW(w.w, fnt)), tot = wd.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const bw = tot + 110, bh = size * 1.8, x0 = W / 2 - bw / 2;
  X.globalAlpha = k; X.translate(0, (1 - k) * 14);
  X.save(); X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 16; X.shadowOffsetY = 6;
  const g = X.createLinearGradient(0, y - bh / 2, 0, y + bh / 2); g.addColorStop(0, '#2a1d17'); g.addColorStop(.45, '#140d0a'); g.addColorStop(1, '#070403');
  X.fillStyle = g; X.beginPath(); X.roundRect(x0, y - bh / 2, bw, bh, 6); X.fill(); X.restore();
  // polish line + gold hairline + corner lozenges
  X.fillStyle = 'rgba(255,235,210,.06)'; X.fillRect(x0 + 6, y - bh / 2 + 4, bw - 12, bh * .22);
  X.strokeStyle = 'rgba(217,164,65,.85)'; X.lineWidth = 1.6; X.beginPath(); X.roundRect(x0 + 7, y - bh / 2 + 7, bw - 14, bh - 14, 3); X.stroke();
  X.fillStyle = LQ_PAL.gold; for (const sx of [x0 + 7, x0 + bw - 7]) { X.beginPath(); X.moveTo(sx, y - 8); X.lineTo(sx + 6, y); X.lineTo(sx, y + 8); X.lineTo(sx - 6, y); X.closePath(); X.fill(); }
  X.textBaseline = 'middle'; let x = W / 2 - tot / 2;
  ws.forEach((w, i) => {
    const nx = ws[i + 1] ? ws[i + 1].t : b, on = t >= w.t - .04 && t < nx, past = t >= nx;
    X.fillStyle = on ? LQ_PAL.goldHi : LQ_PAL.egg; X.globalAlpha = k * (on || past ? 1 : .38);
    if (on) { X.shadowColor = 'rgba(246,200,110,.7)'; X.shadowBlur = 14; } else X.shadowBlur = 0;
    X.fillText(w.w, x, y + 2); x += wd[i] + sp;
  });
  X.restore();
}
// Word-by-word inlaid row: words of line L from i0..i1, laid out from x (align left/center), each stamped on its time.
function D_row(L, i0, i1, x, y, t, o = {}) {
  const ws = wordTimes(L).slice(i0, i1), fnt = o.font, up = o.upper;
  const txt = w => up ? w.w.toUpperCase() : w.w, sp = textW(' ', fnt) * (o.spK ?? 1);
  const wd = ws.map(w => textW(txt(w), fnt)), tot = wd.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  let cx = o.align === 'center' ? x - tot / 2 : o.align === 'right' ? x - tot : x;
  ws.forEach((w, i) => {
    const t0 = (o.times && o.times[i] !== undefined) ? o.times[i] : w.t - .03;
    D_stampInlay(txt(w), cx, y, t, t0, { font: fnt, material: o.material || 'gold', size: o.size, glintDur: o.glintDur });
    cx += wd[i] + sp;
  });
}

// ---------- the idol ----------
function D_idol(t, x, y, s, move, o = {}) {
  const pose = typeof move === 'string' ? dance(t, move, o.dance || {}) : move;
  idolBody(x, y, s, pose, { outfit: 'aodai', glint: o.glint, face: { hat: 'nonla', hatMat: 'gold', mouth: clamp(VOX(t) * 1.3 - .2), eyes: o.eyes || 'open', blush: .8, look: o.look || [0, 0], ...(o.face || {}) } });
}

// ---------- D1: the stamped panel, then the one-hit sand to gold ----------
function D_panelA(t) {
  const lt = t - 87.9, kick = KICK(t);
  lqGround(t, { tone: 'black', camX: lt * 40 });
  // a cinnabar lacquer field behind the idol, framed by a gold hairline (a panel within the panel)
  camBegin({ x: 960, y: 540, zoom: 1.02 + lt * .02 + kick * .01, shake: kick * 3 });
  const R = [1130, 80, 720, 920];
  lqLacquer(() => X.rect(...R), LQ_PAL.cinnabarDk, { bounds: R, rim: 3, lift: 14, glint: frac(.3 + lt * .18) });
  X.strokeStyle = 'rgba(217,164,65,.8)'; X.lineWidth = 2; X.strokeRect(R[0] + 16, R[1] + 16, R[2] - 32, R[3] - 32);
  D_halo(t, R[0] + R[2] / 2, 470, 300, frac(.2 + lt * .25));
  X.save(); X.beginPath(); X.rect(...R); X.clip();
  const pose = mixPose({ ...POSE0, ...dance(t, 'groove') }, { ...POSE0, ...PZ.mic }, .45);
  D_idol(t, R[0] + R[2] / 2 + 10, 1090, 100, pose, { look: [-.35, 0], face: { tilt: -.05 } });
  X.restore();
  camEnd();
  // type: left column, stamped on the sung words
  const A = LY[23], B = LY[24];
  camBegin({ x: 960, y: 540, zoom: 1 + hit(t, D_BT(162), .3) * .015 });
  D_row(A, 0, 3, 100, 270, t, { font: FONT.vn(150), size: 150, upper: true });
  D_row(A, 3, 4, 90, 480, t, { font: FONT.vn(200), size: 200, upper: true });
  D_row(B, 0, 3, 100, 700, t, { font: FONT.vnI(150), size: 150, material: 'egg' });
  D_row(B, 3, 4, 90, 930, t, { font: FONT.vn(230), size: 230, upper: true });
  camEnd();
  for (const w of [...wordTimes(A), ...wordTimes(B)]) if (w.w.length > 4) D_flakes(520, 420 + (w.w === 'sure' ? 460 : 0), t, w.t, { n: 26, r: 380, sy: .45, seed: w.t });
}
const D_COME = [D_BT(165.5), D_BT(165.75)];      // sung "come", "my" (from the vocal envelope)
function D_panelB(t) {
  const lt = t - D_HIT, sungK = hit(t, D_COME[0], .35) + hit(t, D_COME[1], .35);
  camBegin({ x: 960, y: 560, zoom: 1.04 + lt * .025 + sungK * .025, rot: -.012 + lt * .004, shake: hit(t, D_HIT, .5) * 18 });
  const B = [-200, -150, W + 400, H + 300];
  lqGold(() => X.rect(...B), { bounds: B, scale: 1.1, glint: clamp(lt / 1.8) * 1.1 - .05, glintW: 700, lift: 0, bevel: 0 });
  // faint carved border: the panel frame, sanded to gold too
  X.strokeStyle = 'rgba(90,50,16,.55)'; X.lineWidth = 4; X.strokeRect(70, 60, W - 140, H - 120);
  X.strokeStyle = 'rgba(255,240,200,.35)'; X.lineWidth = 1.5; X.strokeRect(76, 66, W - 152, H - 132);
  // "girl you need to" carved small in black lacquer, word by word
  const ws = wordTimes(LY[25]), small = FONT.vnIR(60);
  X.font = small; const lead = ws.slice(0, 4), tw = lead.map(w => textW(w.w, small)), sp = textW(' ', small), tot = tw.reduce((p, q) => p + q, 0) + sp * 3;
  let x = W / 2 - tot / 2;
  const leadT = [D_HIT, D_HIT + BEAT * .5, D_HIT + BEAT, D_HIT + BEAT * 1.25];
  lead.forEach((w, i) => {
    const k = clamp((t - leadT[i]) / .1);
    if (k > 0) { X.save(); X.globalAlpha = k; X.font = small; X.textBaseline = 'alphabetic';
      X.fillStyle = 'rgba(255,240,200,.55)'; X.fillText(w.w, x + 1.5, 372 + 1.5); X.fillStyle = '#1a0d07'; X.fillText(w.w, x, 372); X.restore(); }
    x += tw[i] + sp;
  });
  // COME MY! carved in cinnabar, huge; each sung word flares
  const fnt = FONT.vn(285), words = ['COME', 'MY!'], wW = words.map(s => textW(s, fnt)), gap = 70, all = wW[0] + wW[1] + gap;
  let cx = W / 2 - all / 2;
  words.forEach((s, i) => {
    const hk = hit(t, D_COME[i], .4);
    withT(cx + wW[i] / 2, 690, 0, 1 + hk * .06, () => {
      lqInlayText(s, -wW[i] / 2, 0, { font: fnt, size: 285, material: 'red', groove: .06 });
      // lacquer gloss: a sheen band and, on the sung word, a hot flare running through it
      X.save(); X.font = fnt; X.globalCompositeOperation = 'screen';
      X.fillStyle = lqBand(frac(lt * .35 + i * .2), { bounds: [-wW[i] / 2, -300, wW[i], 330], glintW: 160 }, [[0, 0], [.5, .35], [1, 0]], [255, 210, 190]); X.fillText(s, -wW[i] / 2, 0);
      if (t > D_COME[i]) { X.fillStyle = lqBand(clamp((t - D_COME[i]) / .45), { bounds: [-wW[i] / 2, -300, wW[i], 330], glintW: 120 }, [[0, 0], [.5, .8], [1, 0]], [255, 236, 200]); X.fillText(s, -wW[i] / 2, 0); }
      X.restore();
    });
    cx += wW[i] + gap;
  });
  // small cinnabar lozenges and a gold-on-gold engraved line under the word
  X.strokeStyle = 'rgba(80,40,12,.6)'; X.lineWidth = 3; X.beginPath(); X.moveTo(W / 2 - all / 2, 800); X.lineTo(W / 2 + all / 2, 800); X.stroke();
  for (const sx of [W / 2 - all / 2 - 40, W / 2 + all / 2 + 40]) lqLacquer(() => { X.moveTo(sx, 780); X.lineTo(sx + 20, 800); X.lineTo(sx, 820); X.lineTo(sx - 20, 800); X.closePath(); }, LQ_PAL.cinnabar, { rim: 1, glint: false });
  camEnd();
  // sanding dust flying off the hit, then off each sung word
  D_flakes(W / 2, H / 2, t, D_HIT, { n: 110, r: 1200, dur: 1.1, size: 1.3, seed: 11 });
  D_flakes(W / 2 - all / 4, 600, t, D_COME[0], { n: 40, r: 600, seed: 12 });
  D_flakes(W / 2 + all / 4, 600, t, D_COME[1], { n: 40, r: 600, seed: 13 });
}
shot(87.9, D_CUTS[1], (t, lt) => {
  if (t < D_HIT) { D_panelA(t); D_glintCut(t, 87.9, .22); return; }
  // one hit: the black panel is rubbed through to gold in ~a third of a second
  const k = easeOut((t - D_HIT) / .34);
  lqReveal(() => D_panelB(t), () => D_panelA(t), k, 9, { from: 'center', angle: -.35, n: 150, halo: '#6a2a14', haloW: 8 });
  if (t < D_HIT + .12) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.fillStyle = `rgba(255,236,190,${.55 * (1 - (t - D_HIT) / .12)})`; X.fillRect(0, 0, W, H); X.restore(); }
}, { seed: 401, dark: true });

// ---------- D2: the pagoda gate at night ----------
// World: the gate stands at (960, 760); the courtyard floor runs down from 740; the crowd fills rows either side of a central
// aisle, the idol dances in the passage. Everything is drawn in world space under a camera.
const D_GX = 960, D_GY = 760, D_GS = 640;
const D_ROWS = (() => {
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const y = 820 + r * 70 + r * r * 14, h = 150 + r * 52, gap = 175 + r * 95, sp = h * .5, list = [];
    for (let sd = -1; sd <= 1; sd += 2) for (let i = 0; ; i++) {
      const x = D_GX + sd * (gap + i * sp + (r % 2) * sp * .5); if (x < -260 || x > W + 260) break;
      list.push({ x, y: y + sjit(r * 50 + i * 3 + sd, 6), h: h * (1 + sjit(r * 9 + i + sd * 40, .05)), sd, i, id: r * 40 + i * 2 + (sd > 0 ? 1 : 0) });
    }
    rows.push(list);
  }
  return rows;
})();
// Arm/lean choreography of one dancer: snaps on the beat, delayed by distance from the aisle so waves travel outward.
function D_crowdPose(t, d, o = {}) {
  const ph = beatF(t) - Math.abs(d.x - D_GX) / (o.waveW || 360) * .5 - (o.lag || 0), n = Math.floor(ph), p = ph - n;
  const pat = o.pat || [[1.1, 1.1], [.15, .95], [1.1, 1.1], [.95, .15]];
  const A = pat[((n % pat.length) + pat.length) % pat.length], P = pat[(((n - 1) % pat.length) + pat.length) % pat.length], k = easeOut(p / .35);
  const arms = [lerp(P[0], A[0], k), lerp(P[1], A[1], k)];
  return { arms: d.sd > 0 ? [arms[1], arms[0]] : arms, step: ph, lean: Math.sin(ph * Math.PI) * .07 * d.sd - bump(p / .4) * .02, flip: d.sd > 0 };
}
function D_crowdRow(t, row, o = {}) {
  for (const d of row) {
    if (o.cull && (d.x < o.cull[0] || d.x > o.cull[1])) continue;
    const ps = D_crowdPose(t, d, o), jump = o.jump ? bump(beatP(t - Math.abs(d.x - D_GX) / 2400)) * o.jump * d.h * .12 : 0;
    lqMaskDancer(d.x, d.y - jump, d.h, t, { ...ps, mask: d.id % 7 === 3 ? 'gold' : 'egg' });
  }
}
// hanging lanterns along a string (catenary), swaying on the beat
function D_lanterns(t, x0, y0, x1, y1, n, sag, seed, sc = 1) {
  X.strokeStyle = 'rgba(217,164,65,.55)'; X.lineWidth = 2 * sc; X.beginPath();
  for (let i = 0; i <= 24; i++) { const u = i / 24; X.lineTo(lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag); } X.stroke();
  for (let i = 1; i <= n; i++) {
    const u = i / (n + 1), x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag, sw = Math.sin(t * 2.2 + i * 1.3 + seed) * .08 + pulse(t, .5) * .03;
    withT(x, y, sw, sc, () => {
      X.strokeStyle = 'rgba(217,164,65,.8)'; X.lineWidth = 2; X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 16); X.stroke();
      const g = X.createRadialGradient(0, 52, 0, 0, 52, 110); g.addColorStop(0, 'rgba(255,150,80,.35)'); g.addColorStop(1, 'rgba(255,120,60,0)');
      X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.fillRect(-110, -58, 220, 220); X.restore();
      const body = () => X.ellipse(0, 52, 30, 36, 0, 0, TAU);
      X.beginPath(); body(); const lg = X.createRadialGradient(-8, 44, 4, 0, 52, 38); lg.addColorStop(0, '#FF8A4C'); lg.addColorStop(.55, LQ_PAL.cinnabar); lg.addColorStop(1, LQ_PAL.cinnabarDk); X.fillStyle = lg; X.fill();
      X.strokeStyle = 'rgba(110,18,13,.8)'; X.lineWidth = 1.5; for (const e of [-.55, 0, .55]) { X.beginPath(); X.ellipse(0, 52, 30 * Math.abs(e) + .1, 36, 0, 0, TAU); X.stroke(); }
      X.fillStyle = LQ_PAL.gold; X.fillRect(-14, 12, 28, 7); X.fillRect(-14, 86, 28, 7);
      X.strokeStyle = 'rgba(217,164,65,.8)'; X.beginPath(); for (let k = -2; k <= 2; k++) { X.moveTo(k * 4, 93); X.lineTo(k * 4 + sw * 30, 118); } X.stroke();
    });
  }
}
// sky: stars (flat eggshell dots, twinkling), a gold-leaf moon
function D_sky(t, o = {}) {
  for (let i = 0; i < 90; i++) {
    const x = -600 + hash(i * 3.7) * 3100, y = -900 + hash(i * 5.3) * 1500, tw = .35 + .65 * Math.pow(.5 + .5 * Math.sin(t * (1.5 + hash(i) * 3) + i), 3);
    X.globalAlpha = tw * .8; X.fillStyle = i % 9 ? LQ_PAL.egg : LQ_PAL.goldHi; const r = 1.2 + hash(i * 7.1) * 2.6; X.fillRect(x - r, y - r, r * 2, r * 2);
  }
  X.globalAlpha = 1;
  const mx = o.moonX ?? 1560, my = o.moonY ?? 190, mr = o.moonR ?? 105;
  X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(mx, my, mr * .8, mx, my, mr * 3.2); g.addColorStop(0, 'rgba(246,210,130,.22)'); g.addColorStop(1, 'rgba(246,210,130,0)'); X.fillStyle = g; X.fillRect(mx - mr * 3.2, my - mr * 3.2, mr * 6.4, mr * 6.4); X.restore();
  lqGold(() => X.arc(mx, my, mr, 0, TAU), { scale: .45, glint: frac(t * .08), lift: 0, bevel: 2 });
  // cloud bands in brown lacquer across the moon (a classic sơn mài motif)
  X.save(); X.fillStyle = 'rgba(28,18,16,.92)';
  for (const [dy, w, ph] of [[.35, 2.6, 0], [.75, 2.1, 1.7]]) { const cx = mx + Math.sin(t * .2 + ph) * mr * .4; X.beginPath(); X.ellipse(cx, my + dy * mr, w * mr, mr * .1, 0, 0, TAU); X.fill(); }
  X.strokeStyle = 'rgba(217,164,65,.6)'; X.lineWidth = 2;
  for (const [dy, w, ph] of [[.35, 2.6, 0], [.75, 2.1, 1.7]]) { const cx = mx + Math.sin(t * .2 + ph) * mr * .4; X.beginPath(); X.ellipse(cx, my + dy * mr, w * mr, mr * .1, 0, Math.PI * 1.05, Math.PI * 1.95); X.stroke(); }
  X.restore();
}
// the courtyard: back walls, floor with gold perspective lines, the gate, lanterns
function D_court(t, o = {}) {
  const gl = o.glint ?? frac(t * .07 + .3);
  // back wall either side of the gate
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -700 : D_GX + 300, x1 = sd < 0 ? D_GX - 300 : W + 700;
    lqLacquer(() => X.rect(x0, 560, x1 - x0, 190), '#2a1a14', { bounds: [x0, 560, x1 - x0, 190], rim: 0, glint: gl, mottle: .3 });
    lqLacquer(() => X.rect(x0, 540, x1 - x0, 26), '#171012', { bounds: [x0, 540, x1 - x0, 26], rim: 1, glint: false });
    X.fillStyle = 'rgba(217,164,65,.6)'; X.fillRect(x0, 564, x1 - x0, 2);
    // lattice windows in the wall, gold hairlines
    X.strokeStyle = 'rgba(217,164,65,.28)'; X.lineWidth = 1.5;
    for (let wx = x0 + 60; wx < x1 - 100; wx += 190) { X.strokeRect(wx, 600, 110, 100); X.beginPath(); for (let k = 1; k < 4; k++) { X.moveTo(wx + k * 27.5, 600); X.lineTo(wx + k * 27.5, 700); } X.moveTo(wx, 650); X.lineTo(wx + 110, 650); X.stroke(); }
  }
  // courtyard floor
  const F = [-900, 745, W + 1800, 1200];
  lqLacquer(() => X.rect(...F), '#1b120e', { bounds: F, rim: 0, glint: gl, mottle: .35 });
  X.save(); X.beginPath(); X.rect(...F); X.clip();
  // warm glow pool from the gate
  const pg = X.createRadialGradient(D_GX, 790, 20, D_GX, 790, 900); pg.addColorStop(0, 'rgba(246,190,110,.2)'); pg.addColorStop(1, 'rgba(246,190,110,0)'); X.fillStyle = pg; X.fillRect(F[0], F[1], F[2], F[3]);
  X.strokeStyle = 'rgba(217,164,65,.22)'; X.lineWidth = 1.5; X.beginPath();
  for (let i = -18; i <= 18; i++) { X.moveTo(D_GX + i * 60, 745); X.lineTo(D_GX + i * 420, 1900); }
  for (let j = 0; j < 12; j++) { const y = 745 + Math.pow(j / 11, 1.8) * 1100; X.moveTo(F[0], y); X.lineTo(F[0] + F[2], y); }
  X.stroke(); X.restore();
  if (o.lanterns !== false) {
    if (o.lanterns !== 'right') D_lanterns(t, D_GX - 420, 330, -400, 250, 5, 90, 1);
    D_lanterns(t, D_GX + 420, 330, W + 400, 250, 5, 90, 2);
  }
  lqGate(D_GX, D_GY, D_GS, { glint: gl, lit: .7 + pulse(t, .5) * .3 });
}
// Full world: sky, court, idol in the passage, crowd rows.
function D_world(t, o = {}) {
  D_sky(t, o);
  D_court(t, o);
  const rows = o.rows ?? 5;
  if (o.idol !== false) D_idol(t, D_GX, 668, o.idolS || 26, o.move || 'groove', { glint: frac(t * .1) });
  for (let r = 0; r < rows; r++) D_crowdRow(t, D_ROWS[r], { ...o.crowd, cull: o.cull });
}

// --- a: wide gate pull-back; tender LY[26] in eggshell on the left sky ---
function D_shotA(t) {
  const t0 = D_CUTS[1], lt = t - t0, k = easeOut(lt / 2.1);
  lqGround(t, { tone: 'night', camX: -lt * 60 });
  camBegin({ x: lerp(760, 700, k), y: lerp(640, 560, k), zoom: lerp(1.28, 1.0, k), shake: KICK(t) * 3 });
  D_world(t, { move: 'groove', rows: 5, lanterns: 'right' });
  camEnd();
  const L = LY[26];
  D_row(L, 0, 2, 90, 250, t, { font: FONT.vnI(150), size: 150, material: 'egg' });
  D_row(L, 2, 4, 90, 420, t, { font: FONT.vnI(150), size: 150, material: 'egg' });
  D_row(L, 4, 6, 110, 590, t, { font: FONT.vnI(150), size: 150, material: 'gold' });
}
shot(D_CUTS[1], D_CUTS[2], (t, lt) => {
  // sanded open out of the gold panel on the bar line
  const k = (t - D_CUTS[1]) / .5;
  if (k < 1) lqReveal(() => D_shotA(t), () => D_panelB(t), easeOut(k), 21, { from: 'left', angle: -.3, n: 120, halo: '#6a3a1c' });
  else D_shotA(t);
}, { seed: 402, dark: true });

// --- b: low angle into the crowd, COME / MY… stamped in gold on the sung beats ---
const D_CALL1 = [D_BT(173), D_BT(173.5)], D_CALL2 = [D_BT(181), D_BT(181.5)];
function D_callStamp(t, times, x, y, size, o = {}) {
  const words = o.words || ['COME', 'MY…'], fnt = FONT.vn(size), gap = size * .28, wW = words.map(s => textW(s, fnt));
  const all = wW.reduce((p, q) => p + q, 0) + gap * (words.length - 1); let cx = o.align === 'left' ? x : x - all / 2;
  words.forEach((s, i) => {
    D_stampInlay(s, cx, y, t, times[i], { font: fnt, size, material: 'gold', glintDur: .6 });
    D_flakes(cx + wW[i] / 2, y - size * .35, t, times[i], { n: 34, r: size * 1.6, sy: .5, seed: times[i] });
    cx += wW[i] + gap;
  });
}
shot(D_CUTS[2], D_CUTS[3], (t, lt) => {
  const kick = KICK(t);
  lqGround(t, { tone: 'night', camX: lt * 80 });
  // looking up from among the dancers: the gate small and high, the front row huge
  camBegin({ x: 960 + lt * 30, y: 540, zoom: 1 + lt * .02, rot: .03, shake: kick * 5 });
  X.save(); X.translate(0, -60);
  D_sky(t, { moonX: 1500, moonY: 160, moonR: 80 });
  X.save(); X.translate(960, 820); X.scale(.62, .62); X.translate(-960, -760);
  D_court(t, { lanterns: false });
  D_idol(t, D_GX, 668, 26, 'hype');
  for (let r = 0; r < 3; r++) D_crowdRow(t, D_ROWS[r], { pat: [[1.2, 1.2], [.1, .1], [1.2, 1.2], [.6, .6]] });
  X.restore();
  D_lanterns(t, -200, 60, 900, 180, 3, 60, 4, 1.4);
  D_lanterns(t, 1100, 170, 2200, 50, 3, 60, 5, 1.4);
  X.restore();
  // foreground giants: a row of dancers seen from knee height
  const fg = [[-40, 1.0], [330, .92], [1590, .92], [1960, 1.0], [700, .8], [1220, .8]];
  fg.sort((a, b) => a[1] - b[1]).forEach(([x, s], i) => {
    const d = { x, sd: x < 960 ? -1 : 1 };
    const ps = D_crowdPose(t, d, { waveW: 900, pat: [[1.25, 1.25], [.1, .1], [1.25, 1.25], [.6, .6]] });
    lqMaskDancer(x, 1320 + (1 - s) * 60, 980 * s, t, { ...ps, mask: i === 2 ? 'gold' : 'egg', lean: ps.lean * 1.5 });
  });
  camEnd();
  D_callStamp(t, D_CALL1, 960, 330, 290);
  D_glintCut(t, D_CUTS[2]);
}, { seed: 403, dark: true });

// --- c: close on the idol, the gate's gold sun-window as a halo; tender LY[28] ---
function D_halo(t, x, y, R, gl) {
  lqGold(() => { X.arc(x, y, R, 0, TAU); X.arc(x, y, R * .86, 0, TAU, true); }, { scale: .6, glint: gl, lift: 8, bevel: 2 });
  lqGold(() => { for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + t * .05; X.moveTo(x + Math.cos(a - .045) * R * .22, y + Math.sin(a - .045) * R * .22); X.lineTo(x + Math.cos(a) * R * .84, y + Math.sin(a) * R * .84); X.lineTo(x + Math.cos(a + .045) * R * .22, y + Math.sin(a + .045) * R * .22); X.closePath(); } }, { scale: .6, glint: gl, lift: 4, bevel: 1 });
}
shot(D_CUTS[3], D_CUTS[4], (t, lt) => {
  lqGround(t, { tone: 'red', camX: lt * 50 });
  camBegin({ x: 960, y: 540, zoom: 1.0 + lt * .03, shake: KICK(t) * 2 });
  // the cinnabar pavilion wall with gold lattice either side
  X.strokeStyle = 'rgba(217,164,65,.35)'; X.lineWidth = 3;
  for (const x0 of [1010, 1760]) { X.strokeRect(x0, 90, 150, 900); X.beginPath(); for (let k = 1; k < 4; k++) { X.moveTo(x0 + k * 37.5, 90); X.lineTo(x0 + k * 37.5, 990); } for (let j = 1; j < 12; j++) { X.moveTo(x0, 90 + j * 75); X.lineTo(x0 + 150, 90 + j * 75); } X.stroke(); }
  X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(1390, 390, 60, 1390, 390, 600); g.addColorStop(0, 'rgba(255,170,90,.25)'); g.addColorStop(1, 'rgba(255,170,90,0)'); X.fillStyle = g; X.fillRect(700, -300, 1400, 1400); X.restore();
  D_halo(t, 1390, 400, 380, frac(.15 + lt * .22));
  const pose = mixPose({ ...POSE0, ...dance(t, 'groove') }, { ...POSE0, ...PZ.fheart }, clamp((t - D_BT(179)) / .2) * (1 - clamp((t - D_BT(180.7)) / .2)));
  D_idol(t, 1390, 1180, 118, pose, { look: [-.3, .05], face: { tilt: .04 } });
  camEnd();
  const L = LY[28];
  D_row(L, 0, 3, 90, 380, t, { font: FONT.vnI(150), size: 150, material: 'egg' });
  D_row(L, 3, 5, 90, 560, t, { font: FONT.vnI(150), size: 150, material: 'egg' });
  D_row(L, 5, 6, 110, 740, t, { font: FONT.vnI(170), size: 170, material: 'gold' });
  D_glintCut(t, D_CUTS[3]);
}, { seed: 404, dark: true });

// --- d: high wide over the courtyard; COME | MY… stamped either side of the gate ---
shot(D_CUTS[4], D_CUTS[5], (t, lt) => {
  lqGround(t, { tone: 'night', camX: -lt * 70 });
  camBegin({ x: 960 - lt * 20, y: 600, zoom: .78 + lt * .02, rot: -.015, shake: KICK(t) * 4 });
  D_world(t, { move: 'hype', rows: 5, crowd: { jump: 1, pat: [[1.2, 1.2], [.2, .2], [1.2, 1.2], [.2, .2]], waveW: 500 } });
  camEnd();
  const [a, b] = D_CALL2;
  D_stampInlay('COME', 50, 250, t, a, { font: FONT.vn(185), size: 185 });
  D_flakes(330, 180, t, a, { n: 34, r: 360, sy: .5, seed: 31 });
  const w = textW('MY…', FONT.vn(185));
  D_stampInlay('MY…', W - 60 - w, 250, t, b, { font: FONT.vn(185), size: 185 });
  D_flakes(W - 60 - w / 2, 180, t, b, { n: 34, r: 360, sy: .5, seed: 32 });
  D_glintCut(t, D_CUTS[4]);
}, { seed: 405, dark: true });

// --- e: medium on the idol under the gate, crowd flanking; caption LY[30] ---
shot(D_CUTS[5], D_CUTS[6], (t, lt) => {
  lqGround(t, { tone: 'night', camX: lt * 90 });
  const k = easeInOut(lt / 2.2);
  camBegin({ x: lerp(900, 1020, k), y: 640, zoom: 2.0 - k * .1, shake: KICK(t) * 3 });
  D_world(t, { move: 'break', rows: 3, idolS: 26, cull: [500, 1420] });
  camEnd();
  D_caption(t, LY[30]);
  D_glintCut(t, D_CUTS[5]);
}, { seed: 406, dark: true });

// --- f: tracking along the crowd rows as the wave runs through them (caption continues) ---
shot(D_CUTS[6], D_CUTS[7], (t, lt) => {
  lqGround(t, { tone: 'night', camX: lt * 200 });
  const k = lt / 2.73;
  camBegin({ x: lerp(330, 1000, k), y: 780, zoom: 1.3, rot: .02, shake: KICK(t) * 3 });
  X.save(); X.translate(0, -40);
  D_sky(t, {});
  D_court(t, {});
  D_idol(t, D_GX, 668, 26, 'groove');
  X.restore();
  for (let r = 0; r < 5; r++) D_crowdRow(t, D_ROWS[r], { waveW: 220, cull: [-300, 1800], pat: [[1.2, .1], [.1, 1.2], [1.2, 1.2], [.1, .1]] });
  camEnd();
  D_caption(t, LY[30]);
  D_glintCut(t, D_CUTS[6]);
}, { seed: 407, dark: true });

// --- g: close, "I can never / refuse you!"; beat 196: the last COME MY… slams in gold (LY[32]) ---
shot(D_CUTS[7], D_CUTS[8], (t, lt) => {
  const last = D_BT(196);
  lqGround(t, { tone: 'night', camX: lt * 60 });
  camBegin({ x: 960, y: 540, zoom: 1.02 + lt * .04 + hit(t, last, .4) * .05, shake: KICK(t) * 3 + hit(t, last, .5) * 14 });
  // behind her: the gate's lit sun-window, crowd silhouettes in the dark below
  X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(560, 420, 60, 560, 420, 700); g.addColorStop(0, 'rgba(255,170,90,.22)'); g.addColorStop(1, 'rgba(255,170,90,0)'); X.fillStyle = g; X.fillRect(-200, -300, 1500, 1400); X.restore();
  D_halo(t, 560, 420, 360, frac(.5 + lt * .3));
  for (let i = 0; i < 7; i++) { const d = { x: -120 + i * 210, sd: i < 3 ? -1 : 1 }; if (i === 2 || i === 3) continue; lqMaskDancer(d.x, 1260, 560, t, { ...D_crowdPose(t, d, { waveW: 400 }), mask: 'egg' }); }
  const pose = t < D_BT(194) ? dance(t, 'groove') : dance(t, 'hearts');
  D_idol(t, 560, 1170, 112, pose, { look: [.3, 0], eyes: t > D_BT(195) && t < last ? 'happy' : 'open' });
  camEnd();
  const L = LY[31];
  D_row(L, 0, 3, 1850, 400, t, { font: FONT.vnI(150), size: 150, material: 'egg', align: 'right' });
  D_row(L, 3, 5, 1850, 600, t, { font: FONT.vnI(170), size: 170, material: 'gold', align: 'right' });
  // the last call: a gold plate slams across the frame with COME MY… carved in it
  if (t >= last) {
    const k = backOut(clamp((t - last) / .16));
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.translate(W / 2 + 180, 930); X.scale(lerp(1.3, 1, k), lerp(1.3, 1, k)); X.rotate(-.02);
    const P = [-760, -130, 1520, 220];
    lqGold(() => X.rect(...P), { bounds: P, scale: .8, glint: clamp((t - last) / .3), lift: 22, bevel: 3 });
    lqInlayText('COME MY…', 0, 55, { font: FONT.vn(180), size: 180, material: 'red', align: 'center' });
    X.restore();
    D_flakes(W / 2 + 180, 930, t, last, { n: 70, r: 1000, sy: .4, seed: 51 });
  }
  D_glintCut(t, D_CUTS[7]);
}, { seed: 408, dark: true });
