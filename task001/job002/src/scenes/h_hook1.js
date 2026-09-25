// h_hook1.js: H · Pre-hook 1 + Hook 1 (63.1–87.9). "My world dey summersault" → "come my way way way".
// H1 63.1–72.29  the wall-of-death drum from above; on "summersault" the whole frame turns 360° and is sanded open
//                onto a new scene each turn: drum → the idol before a turning gold sun → the tender close-up in the nón lá.
// H2 72.29–87.9  THE HOOK on the karst river: the red lacquer disc on black water, cutting between the wide shot and a
//                top-down view where the masked dancers spiral in toward the idol (a sunflower under a gold hat).
//                Every "way" leaves an inlaid gold WAY that sinks back into the lacquer; on "runaway" the ring breaks
//                outward and is pulled back in.

const H_T0 = 63.1, H_HOOK = 72.291, H_END = 87.9;
const H_TURNS = [[67.246, 67.927], [69.564, 70.109]];     // the two summersaults (each ends on a bar / downbeat)
const H_GOLD = LQ_PAL.gold, H_EGG = LQ_PAL.egg;

// ---------- small helpers ----------
const H_up = s => s.toUpperCase().replace(/…/g, '').replace(/[.,]/g, '');
const H_wt = i => (LY[i] ? wordTimes(LY[i]) : []);
// stamp scale of a word that lands at t0 (slams from big to 1, then a tiny settle)
function H_stamp(t, t0, dur = .15) {
  if (t < t0 - .02) return 0;
  const k = clamp((t - t0 + .02) / dur);
  return lerp(1.45, 1, expoOut(k)) - bump(clamp((t - t0 - dur) / .12)) * .025;
}
// darken freshly drawn text (inlay sinking into the lacquer)
function H_sink(str, x, y, fnt, a, align = 'center') {
  if (a <= .01) return;
  X.save(); X.font = fnt; X.textAlign = align; X.textBaseline = 'alphabetic'; X.fillStyle = `rgba(14,9,7,${clamp(a, 0, .92)})`; X.fillText(str, x, y); X.restore();
}
// One or more lines of inlaid words, each word landing on its sung time.
// groups: [[wordIdx…], …]; o: {x, ys, sizes, font(size), material, align 'center'|'left', out (time the whole block leaves), glint, italic}
function H_lines(t, ws, groups, o) {
  const fntF = o.font || FONT.hero, mat = o.material || 'gold';
  if (o.out !== undefined && t > o.out + .12) return;
  const outK = o.out !== undefined ? clamp((t - o.out) / .12) : 0;
  groups.forEach((g, li) => {
    const size = o.sizes[li], fnt = fntF(size), words = g.map(i => ({ ...ws[i], s: o.upper === false ? ws[i].w.replace(/…/g, '') : H_up(ws[i].w) }));
    const sp = textW(' ', fnt) * (o.space ?? 1), widths = words.map(w => textW(w.s, fnt)), tot = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = o.align === 'left' ? o.x : o.x - tot / 2; const y = o.ys[li];
    words.forEach((w, i) => {
      const s = H_stamp(t, w.t) * (1 - outK * .6);
      if (s > 0) {
        const cx = x + widths[i] / 2, gl = o.glint ?? frac((t - w.t) * .55 + .05 + i * .07);
        withT(cx, y - size * .35, 0, s, () => lqInlayText(w.s, 0, size * .35, { font: fnt, align: 'center', material: mat, glint: gl, size }));
        if (outK > 0) H_sink(w.s, cx, y, fnt, outK);
      }
      x += widths[i] + sp;
    });
  });
}
// Echoes of one word: each new landing pushes the older copies back (smaller, deeper, darker) toward a vanishing point.
// o: {x, y, size, vx, vy, shrink, font, material}
function H_echo(t, times, str, o) {
  const fnt0 = o.font || FONT.hero, shrink = o.shrink ?? .6, landed = times.filter(tt => t >= tt - .02);
  for (let i = 0; i < landed.length; i++) {
    let age = 0; for (let j = i + 1; j < landed.length; j++) age += expoOut((t - landed[j]) / .2);
    if (o.drift) age += (t - landed[landed.length - 1]) * o.drift;
    const sc = Math.pow(shrink, age), size = o.size * sc, fnt = fnt0(Math.max(8, size));
    const x = lerp(o.vx, o.x, sc), y = lerp(o.vy, o.y, sc), s = H_stamp(t, landed[i]);
    if (size < 14) continue;
    withT(x, y - size * .35, (o.rot || 0) * (1 - sc), s, () => {
      lqInlayText(str, 0, size * .35, { font: fnt, align: 'center', material: o.material || 'gold', glint: frac((t - landed[i]) * .6 + .05), size });
      H_sink(str, 0, size * .35, fnt, (1 - sc) * 1.1);
    });
  }
}
// A hard-cut flash: a gold glint wiping across the new shot for a few frames (the lacquer catching the light).
function H_glintCut(t, t0, dur = .22) {
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  X.fillStyle = lqBand(easeOut(k), { glintAng: -.5, glintW: 420 }, [[0, 0], [.5, .55 * (1 - k)], [1, 0]], [255, 226, 160]); X.fillRect(0, 0, W, H);
  X.fillStyle = `rgba(246,227,161,${.18 * (1 - k)})`; X.fillRect(0, 0, W, H);
  X.restore();
}
// beat-snapped step: n steps of a counter at the given times, each easing in over `d`
const H_steps = (t, times, d = .22, f = expoOut) => times.reduce((a, tt) => a + f((t - tt) / d), 0);
// dance() with our own pose sequence (one pose per beat, snapped)
function H_dance(t, seq) {
  const b = beatF(t), n = Math.floor(b), p = b - n, at = i => PZ[seq[((i % seq.length) + seq.length) % seq.length]] || PZ.stand;
  const pose = mixPose({ ...POSE0, ...at(n - 1) }, { ...POSE0, ...at(n) }, easeOut(p / .38));
  pose.hy = (pose.hy || 0) + Math.sin(clamp(p / .38) * Math.PI) * .12; return pose;
}

// ---------- H1 · the drum, the sun, the close-up ----------
function H_spinBegin(spin, zoom = 1) {
  X.save(); X.translate(W / 2, H / 2); X.rotate(spin); X.scale(zoom, zoom); X.translate(-W / 2, -H / 2);
}
function H_sceneDrum(t, spin) {
  lqGround(t, { tone: 'black', sheen: 1.2 });
  const R = 690;
  H_spinBegin(spin, 1 + pulse(t, .3) * .012);
  X.save(); X.translate(W / 2, H / 2); X.rotate(-(t - H_T0) * .1); X.translate(-W / 2, -H / 2);   // the drum turns slowly under the type
  // the rider laps once every two beats, a little surge on each kick
  const a = -beatF(t) * Math.PI - KICK(t) * .15;
  lqDrum(t, { x: W / 2, y: H / 2, r: R, a, speed: .95, glint: frac(t * .12 + .3) });
  // chalked lap marks on the floor, one per beat of the line (the rider's tyre scuffs in gold)
  X.save(); X.globalAlpha = .5; X.strokeStyle = H_GOLD; X.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const rr = R * (.63 - k * .03); X.beginPath(); X.arc(W / 2, H / 2, rr, a + .2 + k * .3, a + 1.4 + k * .4); X.stroke(); }
  X.restore();
  lqLacquer(() => X.arc(W / 2, H / 2, R * .6 * .42, 0, TAU), '#140e0b', { rim: 0, glint: false, bounds: [W / 2 - 150, H / 2 - 150, 300, 300], mottle: .3 });
  X.restore();
  // type: LY12 then LY13 in the black floor (turns with the frame)
  const w12 = H_wt(12), w13 = H_wt(13);
  if (w12.length) H_lines(t, w12, [[0, 1, 2], [3, 4], [5, 6]], { x: W / 2, ys: [430, 590, 800], sizes: [150, 150, 210], out: LY[13][0] - .12 });
  if (w13.length) H_lines(t, w13, [[0, 1, 2, 3], [4, 5, 6], [7]], { x: W / 2, ys: [410, 570, 790], sizes: [150, 150, 215] });
  X.restore();
}
// a gold-leaf sun of rays that turns behind the idol ("my world")
function H_sunburst(cx, cy, R, rot, n = 18, glint) {
  lqGold(() => {
    for (let i = 0; i < n; i++) {
      const a = rot + i / n * TAU, w = Math.PI / n * .55;
      X.moveTo(cx + Math.cos(a - w * .25) * R * .3, cy + Math.sin(a - w * .25) * R * .3);
      X.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
      X.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
      X.lineTo(cx + Math.cos(a + w * .25) * R * .3, cy + Math.sin(a + w * .25) * R * .3); X.closePath();
    }
  }, { scale: .5, glint, bevel: 1.5, lift: 6, bounds: [cx - R, cy - R, R * 2, R * 2] });
  lqLacquer(() => X.arc(cx, cy, R * .34, 0, TAU), LQ_PAL.cinnabarDk, { rim: 2, glint, bounds: [cx - R * .34, cy - R * .34, R * .68, R * .68], lift: 4 });
  inkStroke(() => { X.beginPath(); X.arc(cx, cy, R * .3, 0, TAU); }, H_GOLD, 3);
}
function H_sceneSun(t, spin) {
  lqGround(t, { tone: 'red', sheen: 1.1 });
  H_spinBegin(spin, 1);
  const cx = 1330, cy = 470;
  H_sunburst(cx, cy, 560, t * .35 + beatF(t) * .04, 18, frac(t * .15 + .2));
  // the idol dances in front of the sun, singing
  const s = 56, hipY = 640, P = dance(t, 'groove');
  X.save(); X.fillStyle = 'rgba(20,4,2,.45)'; X.beginPath(); X.ellipse(cx, hipY + s * 4.7, s * 3.2, s * .45, 0, 0, TAU); X.fill(); X.restore();
  idolBody(cx, hipY, s, P, { outfit: 'aodai', palette: { tunic: '#F1E6D2', tunicDk: '#CDBB9C', pants: '#F7F1E6' }, face: { hat: 'nonla', hatMat: 'gold', mouth: clamp(VOX(t) * 1.3 - .2), eyes: 'happy', blush: .8 } });
  const w14 = H_wt(14);
  if (w14.length) H_lines(t, w14, [[0, 1], [2], [3, 4]], { x: 120, align: 'left', ys: [330, 610, 830], sizes: [150, 280, 170] });
  X.restore();
}
function H_sceneTender(t, spin) {
  lqGround(t, { tone: 'black', sheen: .7 });
  H_spinBegin(spin, 1);
  const lt = t - H_TURNS[1][0];
  // a slow push toward her; an eggshell moon behind, gold flakes drifting down
  const push = 1 + clamp(lt / 2.7) * .06;
  X.save(); X.translate(1400, 560); X.scale(push, push); X.translate(-1400, -560);
  lqEggshell(() => X.arc(1440, 420, 330, 0, TAU), { scale: .6, glint: frac(t * .1), gloss: .2, lift: 8, tint: 'rgba(240,215,170,.9)' });
  X.save(); X.globalCompositeOperation = 'multiply'; const mg = X.createRadialGradient(1340, 360, 60, 1440, 420, 340); mg.addColorStop(0, 'rgba(255,255,255,0)'); mg.addColorStop(1, 'rgba(120,80,40,.55)'); X.fillStyle = mg; X.beginPath(); X.arc(1440, 420, 332, 0, TAU); X.fill(); X.restore();
  const w15 = H_wt(15), feel = w15[6] ? w15[6].t : 71.6;
  const eyes = t < feel - .05 ? 'closed' : 'open';
  idolHead(1410, 600, 215, { hat: 'nonla', hatMat: 'gold', hatTilt: -.08 + Math.sin(t * 1.3) * .02, tilt: -.1 + Math.sin(t * 1.1) * .03, turn: -.18, eyes, open: easeOut((t - feel + .05) / .2),
    look: [-.5, .1], mouth: clamp(VOX(t) * 1.25 - .2), mouthShape: 'o', blush: 1, bust: true, brow: -.5 });
  X.restore();
  // gold leaf flakes falling (pure function of t)
  for (let i = 0; i < 26; i++) {
    const sp = 60 + hash(i * 3.1) * 90, y = frac(hash(i * 7.7) + t * sp / 1300) * 1300 - 110, x = hash(i * 1.9) * 1920 + Math.sin(t * 1.2 + i) * 30, r = 5 + hash(i * 5.3) * 12, rot = t * (1 + hash(i)) + i;
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(1, .35 + .65 * Math.abs(Math.sin(t * 2 + i)));
    X.fillStyle = hash(i * 9.9) < .7 ? LQ_PAL.gold : LQ_PAL.goldHi; X.globalAlpha = .75; X.fillRect(-r, -r, r * 2, r * 2); X.restore();
  }
  // TENDER line in eggshell italic
  if (w15.length) H_lines(t, w15, [[0], [1, 2, 3], [4, 5, 6]], { x: 110, align: 'left', ys: [360, 540, 740], sizes: [170, 118, 170], font: FONT.vnI, material: 'egg', upper: false, space: .9 });
  if (w15[7] && t >= w15[7].t) {
    const k = easeOut((t - w15[7].t) / .5);
    X.save(); X.globalAlpha = k; X.font = FONT.vnIR(56); X.fillStyle = 'rgba(243,235,221,.85)'; X.fillText('oooo…', 120 + (1 - k) * 30, 850); X.restore();
  }
  X.restore();
}
function H_sceneAt(i, t, spin) { [H_sceneDrum, H_sceneSun, H_sceneTender][i](t, spin); }
// the previous section's last shot, for sanding into (it keeps running underneath)
function H_prevShot(t) {
  const prev = SHOTS.filter(s => s.start < H_T0 && s.end > H_T0 - .3 && s.fn !== H1_fn).pop();
  if (!prev) { lqGround(t, { tone: 'brown' }); return; }
  const seed = SEED; X.save(); paintShot(prev, t); X.restore(); SEED = seed;
}
function H1_fn(t, lt) {
  // which scene, and the turn angle
  let spin = 0, sc = 0, next = -1, k = 0;
  if (t >= H_TURNS[0][0]) sc = 1;
  if (t >= H_TURNS[1][0]) sc = 2;
  for (let i = 0; i < 2; i++) {
    const [a, b] = H_TURNS[i];
    if (t >= a && t < b) { const u = (t - a) / (b - a); spin = TAU * easeInOut(clamp((u - .08) / .92)); next = i + 1; k = clamp((u - .2) / .72); sc = i; }
  }
  if (next >= 0) {
    const z = 1 - bump(k) * .12;
    lqReveal(() => H_sceneAt(next, t, spin), () => H_sceneAt(sc, t, spin), k, 11 + next, { angle: spin - .4, from: 'center', halo: LQ_PAL.goldDk, haloA: .8 });
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; X.fillStyle = `rgba(246,200,120,${bump(k) * .12})`; X.fillRect(0, 0, W, H); X.restore();
    void z;
  } else H_sceneAt(sc, t, 0);
  // the section opens by sanding the verse away onto the drum
  if (lt < .5) {
    const kk = clamp(lt / .45);
    X.save(); X.setTransform(SX, 0, 0, SX, 0, 0);
    const L = onLayer('_H_open', () => { X.setTransform(SX, 0, 0, SX, 0, 0); H_prevShot(t); });
    const mask = lqSand(easeOut(kk), 21, { name: '_H_openSand', from: 'center', res: .5 });
    L.x.save(); L.x.setTransform(1, 0, 0, 1, 0, 0); L.x.globalCompositeOperation = 'destination-out'; L.x.drawImage(mask, 0, 0, L.width, L.height); L.x.restore();
    blit(L); X.restore();
  }
  H_glintCut(t, H_TURNS[0][1], .3); H_glintCut(t, H_TURNS[1][1], .3);
}
shot(H_T0, H_HOOK, H1_fn, { seed: 631, dark: true });

// ---------- H2 · the hook: karst river, red disc, masked dancers ----------
const H_N = 10;   // masked dancers in the ring
// dancer arms / step on the beat (a ripple around the ring)
function H_dancerPose(t, i, amp = 1) {
  const b = beatF(t) - i * .06, n = Math.floor(b), p = b - n, k = easeOut(p / .3);
  const up = v => (((v % 2) + 2) % 2) ? .95 : .15, a0 = lerp(up(n - 1 + i), up(n + i), k);
  return { arms: [a0 * amp, lerp(up(n + i), up(n + 1 + i), k) * amp * .8], step: b * .5 + i * .31, lean: Math.sin(b * Math.PI + i) * .07 };
}
// the karst river, wide. o: {cam:{x,y,zoom}, camX, ring (0..), spin, idolS, pose, face, discY, rx, ry, breakK}
function H_wide(t, o = {}) {
  lqGround(t, { tone: 'black', sheen: .6 });
  const cam = o.cam || {};
  camBegin({ x: cam.x ?? W / 2, y: cam.y ?? H / 2, zoom: cam.zoom ?? 1, rot: cam.rot || 0, shake: KICK(t) * 5 });
  const hz = o.hz ?? 800;
  lqKarstRiver(t, { rect: [-260, -120, W + 520, H + 380], horizon: hz, camX: o.camX ?? 0, sunX: .7, seed: 3 });
  const cx = W / 2, dy = hz + (o.discDy ?? 105), rx = o.rx ?? 600, ry = o.ry ?? 118;
  // ripple rings on the black water, one per beat
  X.save(); X.strokeStyle = H_GOLD; X.lineWidth = 1.6;
  for (let q = 0; q < 3; q++) { const f = frac(beatF(t) / 3 + q / 3); X.globalAlpha = (1 - f) * .45; X.beginPath(); X.ellipse(cx, dy + 18, rx * (1.02 + f * .6), ry * (1.02 + f * .6), 0, 0, TAU); X.stroke(); }
  X.restore();
  lqRedDisc(cx, dy, rx, ry, { glint: frac(t * .1 + .4), thick: 30 });
  // ring of dancers + the idol, depth sorted
  const ring = o.ring ?? .82, spin = o.spin ?? t * .5, items = [];
  for (let i = 0; i < H_N; i++) {
    const th = spin + i / H_N * TAU, r = ring + (o.breakK || 0) * (.5 + hash(i * 3.3) * .4);
    items.push({ z: Math.sin(th), draw: () => {
      const x = cx + Math.cos(th) * rx * r * .86, y = dy + Math.sin(th) * ry * r * .8, h = 205 * (1 + Math.sin(th) * .1), pz = H_dancerPose(t, i, o.armAmp ?? 1);
      lqMaskDancer(x, y, h, t, { ...pz, flip: Math.cos(th) > 0, lean: pz.lean + (o.breakK || 0) * Math.cos(th) * .35, mask: i % 5 === 2 ? 'gold' : 'egg' });
    } });
  }
  const s = o.idolS ?? 30;
  items.push({ z: .001, draw: () => {
    X.save(); X.fillStyle = 'rgba(30,4,2,.5)'; X.beginPath(); X.ellipse(cx, dy + 4, s * 2.6, s * .5, 0, 0, TAU); X.fill(); X.restore();
    idolBody(cx, dy - s * 4.55, s, o.pose || dance(t, 'groove'), { outfit: 'aodai', face: { hat: 'nonla', hatMat: 'gold', mouth: clamp(VOX(t) * 1.3 - .2), eyes: 'open', blush: .8, ...(o.face || {}) } });
  } });
  items.sort((a, b) => a.z - b.z).forEach(it => it.draw());
  camEnd();
}
// the idol from directly above: a sunflower of petals under a gold nón lá, áo dài flaps and sleeves swinging out.
function H_topIdol(x, y, s, t, o = {}) {
  const rot = o.rot || 0, armK = o.arms ?? .5;
  X.save(); X.translate(x, y); X.rotate(rot);
  X.fillStyle = 'rgba(20,2,1,.5)'; X.beginPath(); X.arc(s * .12, s * .18, s * 1.9, 0, TAU); X.fill();
  // áo dài flaps: front and back panels flaring with the spin
  for (const sd of [-1, 1]) {
    const fl = s * (1.9 + .25 * Math.sin(t * 4 + sd)), sw = sd * .25 * Math.sin(t * 3);
    const P = () => { X.save(); X.rotate(sw + (sd > 0 ? 0 : Math.PI)); X.moveTo(-s * .45, 0); X.quadraticCurveTo(-s * .7, fl * .7, -s * .2, fl); X.lineTo(s * .2, fl); X.quadraticCurveTo(s * .7, fl * .7, s * .45, 0); X.closePath(); X.restore(); };
    lqLacquer(P, sd > 0 ? '#1a0f0b' : '#241510', { rim: 1, glint: false, bounds: [-s * 2, -s * 2, s * 4, s * 4], lift: 5 });
    inkStroke(() => { X.beginPath(); P(); }, H_GOLD, 2.5);
  }
  // sleeves (arms out on the beat) with eggshell hands
  for (const sd of [-1, 1]) {
    const a = sd * (Math.PI / 2) + (1 - armK) * sd * .9 - sd * .2, len = s * 1.7;
    const hx = Math.cos(a) * len, hy = Math.sin(a) * len;
    inkStroke(() => { X.beginPath(); X.moveTo(0, 0); X.lineTo(hx, hy); }, '#0f0907', s * .36);
    inkStroke(() => { X.beginPath(); X.moveTo(0, 0); X.lineTo(hx, hy); }, 'rgba(217,164,65,.8)', 2);
    X.fillStyle = '#EFE3CF'; X.beginPath(); X.arc(hx, hy, s * .17, 0, TAU); X.fill();
  }
  // petals: the sunflower crown seen from above
  for (let ring = 0; ring < 2; ring++) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i + ring * .5) / n * TAU + t * .2, L = s * (ring ? 1.55 : 1.8), wd = s * .2;
      X.save(); X.rotate(a);
      X.fillStyle = ring ? PAL.orange : PAL.orangeDk; X.beginPath(); X.moveTo(s * .6, 0); X.quadraticCurveTo(L * .8, -wd, L, 0); X.quadraticCurveTo(L * .8, wd, s * .6, 0); X.fill();
      if (ring) { X.strokeStyle = 'rgba(255,214,170,.5)'; X.lineWidth = 1.5; X.beginPath(); X.moveTo(s * .75, 0); X.lineTo(L * .9, 0); X.stroke(); }
      X.restore();
    }
  }
  // the nón lá from above: gold leaf disc with ribs, rings and the apex catching the light
  const hr = s * 1.18;
  lqGold(() => X.arc(0, 0, hr, 0, TAU), { scale: .35, glint: o.glint ?? frac(t * .3), bevel: 2, lift: 8, bounds: [-hr, -hr, hr * 2, hr * 2] });
  X.save(); X.beginPath(); X.arc(0, 0, hr, 0, TAU); X.clip();
  const sh = X.createLinearGradient(-hr, -hr, hr, hr); sh.addColorStop(0, 'rgba(255,248,220,.3)'); sh.addColorStop(.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(60,30,8,.5)');
  X.fillStyle = sh; X.fillRect(-hr, -hr, hr * 2, hr * 2);
  X.strokeStyle = 'rgba(90,55,18,.55)'; X.lineWidth = 1.4;
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU - rot; X.beginPath(); X.moveTo(Math.cos(a) * hr * .06, Math.sin(a) * hr * .06); X.lineTo(Math.cos(a) * hr, Math.sin(a) * hr); X.stroke(); }
  for (const k of [.3, .55, .78, .94]) { X.beginPath(); X.arc(0, 0, hr * k, 0, TAU); X.stroke(); }
  X.restore();
  X.fillStyle = LQ_PAL.goldWhite; X.beginPath(); X.arc(-hr * .04, -hr * .04, hr * .06, 0, TAU); X.fill();
  X.restore();
}
// the top-down disc: black water with ripples, the red disc, dancers standing in a ring (feet in, heads out) that
// spirals toward the idol. o: {cx, cy, R, ring 0..1.6 (radius of the feet, in disc radii), spin, zoom, rot, h}
function H_top(t, o = {}) {
  lqGround(t, { tone: 'black', sheen: .8 });
  const cx = o.cx ?? 1300, cy = o.cy ?? 540, R = o.R ?? 430;
  camBegin({ x: cx, y: cy, zoom: o.zoom ?? 1, rot: o.rot || 0, shake: KICK(t) * 4 });
    // water: expanding ripple rings, one per beat, and drifting gold flecks
  X.save(); X.strokeStyle = H_GOLD; X.lineCap = 'round';
  for (let q = 0; q < 4; q++) { const f = frac(beatF(t) / 4 + q / 4); X.globalAlpha = (1 - f) * .5; X.lineWidth = 3 * (1 - f) + .8; X.beginPath(); X.arc(cx, cy, R * (1.05 + f * 1.4), 0, TAU); X.stroke(); }
  X.globalAlpha = .55;
  for (let i = 0; i < 40; i++) { const a = hash(i * 2.7) * TAU + t * .05 * (hash(i) - .5), rr = R * (1.15 + hash(i * 5.1) * 1.6); X.fillStyle = hash(i * 3.3) < .6 ? LQ_PAL.goldDk : LQ_PAL.gold; X.save(); X.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); X.rotate(a * 3); X.fillRect(-4, -2, 8, 4); X.restore(); }
  X.restore();
  lqRedDisc(cx, cy, R, R, { topdown: true, glint: frac(t * .12 + .6), rings: [.88, .62, .3] });
  const ring = o.ring ?? .8, spin = o.spin ?? t * .5, h = o.h ?? 230;
  const idolFirst = ring > .55;   // when the ring closes in, the dancers lie over the idol's flaps but never her hat
  if (!idolFirst) H_topIdol(cx, cy, 78, t, { rot: -spin * .6, arms: pulse(t, .5) });
  for (let i = 0; i < H_N; i++) {
    const th = spin + i / H_N * TAU, r = R * Math.max(.2, ring + (o.jag || 0) * (hash(i * 7.1) - .5)), pz = H_dancerPose(t, i, 1);
    const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r;
    withT(x, y, th + Math.PI / 2, 1, () => lqMaskDancer(0, 0, h, t, { ...pz, lean: pz.lean * .5, mask: i % 5 === 2 ? 'gold' : 'egg' }));
  }
  if (idolFirst) H_topIdol(cx, cy, 78, t, { rot: -spin * .6, arms: pulse(t, .5) });
  camEnd();
}
// hook shots -------------------------------------------------------------------------------------------------------
const H_W = [16, 17, 18, 19, 20, 21, 22].reduce((m, i) => (m[i] = H_wt(i), m), {});
const H_wayT = (i, from = 0) => (H_W[i] || []).filter((w, k) => k >= from && /^way/i.test(w.w)).map(w => w.t);

// S1 72.29–73.93  wide: sanded open from the close-up. WHEN YOU GO (small) · COME MY (big)
shot(H_HOOK, 73.928, (t, lt) => {
  const bottom = () => {
    H_wide(t, { cam: { zoom: 1.02 + lt * .025, y: 560 }, camX: lt * 40, spin: t * .45 });
    const w = H_W[16]; if (!w.length) return;
    H_lines(t, w, [[0, 1, 2]], { x: W / 2, ys: [120], sizes: [60], font: FONT.vnSans, material: 'egg', space: 1.1 });
    H_lines(t, w, [[3, 4]], { x: W / 2, ys: [345], sizes: [250] });
  };
  if (lt < .5) lqReveal(bottom, () => H_sceneTender(t, 0), easeOut(lt / .45), 31, { from: 'center', angle: -.5, halo: LQ_PAL.goldDk, haloA: .9 });
  else bottom();
  H_glintCut(t, H_HOOK, .35);
}, { seed: 723, dark: true });

// the WAY stack on the left panel of a top-down shot
function H_wayStack(t, times, o = {}) {
  H_echo(t, times, 'WAY', { x: o.x ?? 390, y: o.y ?? 960, size: o.size ?? 330, vx: o.vx ?? 390, vy: o.vy ?? 110, shrink: o.shrink ?? .6, rot: o.rot ?? 0 });
}
// S2 73.93–75.29  top-down: WAY WAY WAY, the dancers step in on each one
shot(73.928, 75.291, (t, lt) => {
  const ways = H_wayT(16), n = H_steps(t, ways, .25, backOut);
  H_top(t, { ring: 1.0 - n * .14, spin: .3 + H_steps(t, ways, .3) * .5 + lt * .15, zoom: 1 + lt * .02 });
  H_wayStack(t, ways);
  H_glintCut(t, 73.928);
}, { seed: 739, dark: true });

// S3 75.29–76.66  wide, lower and closer: COME MY · WAY WAY receding toward her
shot(75.291, 76.655, (t, lt) => {
  H_wide(t, { cam: { zoom: 1.55 + lt * .05, y: 700, x: 960 }, camX: 300 + lt * 60, spin: 1.4 + t * .5, ring: .8 });
  const w = H_W[17]; if (!w.length) return;
  H_lines(t, w, [[0, 1]], { x: W / 2, ys: [250], sizes: [210] });
  H_echo(t, H_wayT(17), 'WAY', { x: W / 2, y: 520, size: 280, vx: W / 2, vy: 640, shrink: .55 });
  H_glintCut(t, 75.291);
}, { seed: 753, dark: true });

// S4 76.66–79.79  top-down: BABY DON'T · RUNAWAY (the ring breaks outward) · WAY WAY (pulled back in)
shot(76.655, 79.791, (t, lt) => {
  const w = H_W[18], run = w[2] ? w[2].t : 77.609, ways = H_wayT(18);
  const brk = backOut(clamp((t - run) / .32), 2.2), back = H_steps(t, ways, .22, backOut);
  const ring = .62 + brk * .75 - back * .47;
  const spin = 2 + lt * .4 - brk * .9 + back * .6;
  H_top(t, { ring, spin, jag: brk * (1 - back / 2) * .5, zoom: 1 - brk * .1 + back * .05, rot: -brk * .06 * (1 - back / 2) });
  if (!w.length) return;
  H_lines(t, w, [[0, 1]], { x: 90, align: 'left', ys: [215], sizes: [160] });
  // RUNAWAY: letters fly apart with the ring, then snap back together on the ways
  if (t >= run - .02) {
    const s = H_stamp(t, run), fnt = FONT.hero(200), str = 'RUNAWAY', L = layout(str, fnt), spread = brk * (1 - back / 2) * 34;
    L.forEach((c, i) => {
      const u = i - (str.length - 1) / 2, x = 430 - L.width / 2 + c.x + c.w / 2 + u * spread, y = 520 + (hash(i * 3.1) - .5) * spread * 1.4, rr = (hash(i * 5.7) - .5) * spread * .01;
      withT(x, y - 70, rr, s, () => lqInlayText(c.ch, 0, 70, { font: fnt, align: 'center', glint: frac((t - run) * .5 + i * .05), size: 200 }));
    });
  }
  H_wayStack(t, ways, { y: 900, size: 280, vy: 600, vx: 700 });
  H_glintCut(t, 76.655);
}, { seed: 766, dark: true });

// S5 79.79–81.29  wide: RUN AWAY, the ring flees to the rim of the disc and comes back on WAY
shot(79.791, 81.291, (t, lt) => {
  const w = H_W[19], wy = H_wayT(19), br = w[1] ? w[1].t : 80.064;
  const out = expoOut((t - br) / .3) * (1 - H_steps(t, wy, .25, backOut));
  H_wide(t, { cam: { zoom: 1.1 - out * .05, y: 600 }, camX: 700 - lt * 50, spin: 3 - out * .4 + lt * .3, ring: .75, breakK: out * 1.25, armAmp: 1 });
  if (!w.length) return;
  H_lines(t, w, [[0, 1]], { x: W / 2, ys: [290], sizes: [260] });
  H_echo(t, wy, 'WAY', { x: W / 2, y: 520, size: 230, vx: W / 2, vy: 660 });
  H_glintCut(t, 79.791);
}, { seed: 797, dark: true });

// S6 81.29–82.52  wide again, pushing in: OH BABY (small) COME MY (big)
shot(81.291, 82.519, (t, lt) => {
  H_wide(t, { cam: { zoom: 1.0 + lt * .12, y: 580 }, camX: -200 + lt * 80, spin: t * .6 });
  const w = H_W[20]; if (!w.length) return;
  H_lines(t, w, [[0, 1]], { x: W / 2, ys: [120], sizes: [60], font: FONT.vnSans, material: 'egg' });
  H_lines(t, w, [[2, 3]], { x: W / 2, ys: [345], sizes: [250] });
  H_glintCut(t, 81.291);
}, { seed: 813, dark: true });

// S7 82.52–83.61  top-down, rotating, tighter: WAY WAY WAY while the ring closes into a flower
shot(82.519, 83.609, (t, lt) => {
  const ways = H_wayT(20), n = H_steps(t, ways, .22, backOut);
  H_top(t, { ring: .95 - n * .18, spin: 4 + n * .7 + lt * .2, zoom: 1.05 + n * .04, rot: .12 * n });
  H_wayStack(t, ways, { rot: .25 });
  H_glintCut(t, 82.519);
}, { seed: 825, dark: true });

// S8 83.61–85.25  close on the idol singing on the disc: WHEN YOU GO COME MY · WAY WAY
shot(83.609, 85.246, (t, lt) => {
  lqGround(t, { tone: 'black' });
  camBegin({ x: 960, y: 540, zoom: 1 + lt * .03, shake: KICK(t) * 4 });
  lqKarstRiver(t, { rect: [-100, -60, W + 200, H + 200], horizon: 820, camX: 1200 + lt * 70, sunX: .78, seed: 5 });
  lqRedDisc(1350, 1060, 900, 170, { glint: frac(t * .1), thick: 40 });
  // dancers crossing behind her, left to right
  for (let i = 0; i < 4; i++) { const x = 900 + ((i * 330 + lt * 260) % 1320), pz = H_dancerPose(t, i, 1); lqMaskDancer(x, 1010, 300, t, { ...pz, flip: false }); }
  idolHead(1370, 590, 175, { hat: 'nonla', hatMat: 'gold', bust: true, eyes: 'open', look: [-.4, 0], mouth: clamp(VOX(t) * 1.3 - .2), blush: .8, tilt: Math.sin(beatF(t) * Math.PI) * .05, turn: -.15 });
  camEnd();
  const w = H_W[21]; if (!w.length) return;
  H_lines(t, w, [[0, 1, 2]], { x: 110, align: 'left', ys: [180], sizes: [60], font: FONT.vnSans, material: 'egg' });
  H_lines(t, w, [[3, 4]], { x: 100, align: 'left', ys: [420], sizes: [230] });
  H_echo(t, H_wayT(21), 'WAY', { x: 330, y: 790, size: 290, vx: 700, vy: 560, shrink: .58 });
  H_glintCut(t, 83.609);
}, { seed: 836, dark: true });

// S9 85.25–87.9  the widest: the idol beckons; COME LET ME SHOW YOU · WHAT I MEAN · cos…
shot(85.246, H_END, (t, lt) => {
  const w = H_W[22];
  H_wide(t, { cam: { zoom: .96 + easeInOut(lt / 2.65) * .12, y: 600 }, camX: -500 + lt * 40, spin: t * .4, ring: .85 + Math.sin(lt * 2) * .03,
    pose: H_dance(t, ['wave', 'point', 'wave', 'heart']), face: { eyes: 'happy', mouthShape: 'smile' } });
  if (!w.length) return;
  H_lines(t, w, [[0, 1, 2, 3, 4]], { x: W / 2, ys: [200], sizes: [160] });
  H_lines(t, w, [[5, 6, 7]], { x: W / 2, ys: [420], sizes: [220] });
  if (w[8] && t >= w[8].t) { const k = easeOut((t - w[8].t) / .3); X.save(); X.globalAlpha = k; X.font = FONT.vnIR(58); X.fillStyle = 'rgba(243,235,221,.9)'; const wm = textW('WHAT I MEAN', FONT.hero(220)); X.fillText('cos…', W / 2 + wm / 2 + 24 + (1 - k) * 20, 420); X.restore(); }
  H_glintCut(t, 85.246);
}, { seed: 852, dark: true });

// dev page: time a few frames of each shot (node tools/render.mjs --job=job002 --test=H_perf --scale=1 --dir=H)
window.TESTS = window.TESTS || {};
TESTS.H_perf = () => {
  const flush = () => X.getImageData(0, 0, 1, 1), out = [];
  for (const t of [64.5, 67.6, 68.9, 69.8, 71.2, 72.5, 74.5, 75.9, 77.9, 80.3, 82.0, 83.2, 84.5, 86.8]) {
    const sh = shotAt(t); if (!sh) continue; T = t; BOIL = Math.floor(t * 12);
    const ms = []; for (let i = 0; i < 3; i++) { const a = performance.now(); X.setTransform(SX, 0, 0, SX, 0, 0); paintShot(sh, t + i * .01); flush(); ms.push(Math.round(performance.now() - a)); }
    out.push(`${t}: ${ms.join('/')}`);
  }
  console.error('H perf ms · ' + out.join(' · '));
};
