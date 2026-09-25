// v_verse1.js: V · Verse 1 (37.4–63.1), LY[0]–LY[11]. The old quarter at night, painted in lacquer.
// V1 Hanoi old-quarter street in gold ink line; the idol walks toward us: COME NEAR ME NOW inlaid.
// V2 a lacquered window lattice (song cửa) closes into a cage: PRISONER carved into the sill.
// V3 the bass drops out: an eggshell mosaic heart assembles (FORMULA), gold leaf melts (TEQUILA), silver signal bars (CELLULAR).
// V4 a gold-leaf lotus blooms (MEDULLA), then the night market: gifts wrapped in gold leaf stack up on the beats.
// V5 the storm buffalo charges through silver rain; a gold sun breaks through on "shine".

// ---------- shared helpers ----------
const V_S0 = 37.4, V_S1 = 42.019, V_S2 = 46.928, V_S3 = 48.155, V_S4 = 50.609, V_S5 = 53.75, V_S6 = 55.655, V_S7 = 59.2, V_END = 63.1;

// Lacquer caption: eggshell italic on a thin black lacquer plate with a gold hairline; the sung word lights up in gold.
function V_caption(t, L, o = {}) {
  if (!L) return;
  const [a, b] = L, k = easeOut((t - a) / .18) * (1 - ease((t - b + .12) / .12));
  if (k <= .01) return;
  const size = o.size || 42, fnt = FONT.vnI(size), y = o.y ?? 1000;
  const ws = wordTimes(L), sp = textW(' ', fnt), widths = ws.map(w => textW(w.w, fnt));
  const total = widths.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const padX = 46, bw = total + padX * 2, bh = size * 1.62, x0 = (o.x ?? W / 2) - bw / 2, y0 = y - bh / 2;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalAlpha = k;
  X.translate(0, (1 - k) * 14);
  // plate
  X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 18; X.shadowOffsetY = 6;
  const g = X.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, '#231915'); g.addColorStop(.45, '#120D0B'); g.addColorStop(1, '#070504');
  X.fillStyle = g; rrect(x0, y0, bw, bh, 5); X.fill(); X.shadowColor = 'transparent';
  // polish line along the top
  X.fillStyle = 'rgba(255,236,210,.08)'; X.fillRect(x0 + 6, y0 + 3, bw - 12, bh * .22);
  // gold hairline + diamond ends
  X.strokeStyle = 'rgba(217,164,65,.85)'; X.lineWidth = 1.4; rrect(x0 + 6, y0 + 6, bw - 12, bh - 12, 3); X.stroke();
  X.fillStyle = LQ_PAL.gold;
  for (const dx of [x0 + 6, x0 + bw - 6]) { X.beginPath(); X.moveTo(dx, y - 7); X.lineTo(dx + 6, y); X.lineTo(dx, y + 7); X.lineTo(dx - 6, y); X.closePath(); X.fill(); }
  // words
  X.font = fnt; X.textBaseline = 'middle';
  let x = x0 + padX;
  ws.forEach((w, i) => {
    const on = t >= w.t - .03, cur = on && (i === ws.length - 1 || t < ws[i + 1].t - .03);
    X.fillStyle = cur ? LQ_PAL.goldHi : on ? LQ_PAL.egg : 'rgba(243,235,221,.38)';
    X.fillText(w.w, x, y + size * .04 - (cur ? 2 : 0));
    x += widths[i] + sp;
  });
  X.restore();
}

// An inlaid word that lands on its sung time: overshoot scale, a travelling glint, gold dust.
function V_inlay(str, x, y, t, t0, o = {}) {
  if (t < t0 - .02) return null;
  const k = clamp((t - t0 + .02) / .14), s = lerp(o.from ?? 1.22, 1, backOut(k)), al = clamp(k * 2.5);
  const glint = o.glint ?? clamp((t - t0) / .9) * 1.3 - .15;
  const size = o.size || 180, fnt = o.font || FONT.vn(size);
  const w = textW(str, fnt, o.tracking || 0), cx = o.align === 'center' ? x : o.align === 'right' ? x - w / 2 : x + w / 2;
  X.save(); X.globalAlpha *= al;
  withT(cx, y - size * .35, o.rot || 0, s, () => lqInlayText(str, 0, size * .35, { ...o, font: fnt, size, align: 'center', glint }));
  X.restore();
  // gold dust kicked up where it lands
  if (o.dust !== false) V_dust(cx, y - size * .3, w * .55, t, t0, o.dustCol);
  return w;
}
function V_dust(x, y, spread, t, t0, col) {
  const k = (t - t0) / .7; if (k < 0 || k > 1) return;
  X.save(); X.fillStyle = col || LQ_PAL.goldHi;
  for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.1 + t0) * TAU, r = spread * (.5 + hash(i * 7.7 + t0) * .8) * easeOut(k), sz = 3 + hash(i * 1.3) * 6;
    X.globalAlpha = (1 - k) * .9;
    X.save(); X.translate(x + Math.cos(a) * r, y + Math.sin(a) * r * .45 + k * k * 60); X.rotate(a + k * 4); X.fillRect(-sz / 2, -sz / 2, sz, sz * .7); X.restore();
  }
  X.restore();
}
// A small eggshell italic line that writes on word by word.
function V_tender(L, x, y, t, o = {}) {
  const ws = wordTimes(L), fnt = FONT.vnI(o.size || 56); let cx = x;
  const out = o.out ? 1 - clamp((t - o.out) / .2) : 1;
  X.save(); X.font = fnt; X.textBaseline = 'alphabetic';
  const words = o.words ? ws.slice(0, o.words) : ws;
  words.forEach(w => {
    const k = clamp((t - w.t + .04) / .12);
    if (k > 0) {
      X.globalAlpha = k * out; X.fillStyle = 'rgba(0,0,0,.55)'; X.fillText(w.w, cx + 2, y + 3 + (1 - k) * 10);
      X.fillStyle = o.color || LQ_PAL.egg; X.fillText(w.w, cx, y + (1 - k) * 10);
    }
    cx += textW(w.w + ' ', fnt);
  });
  X.restore();
  return cx;
}
// A gold glint across the whole panel on a cut.
function V_glint(t, t0, o = {}) {
  const k = (t - t0) / (o.dur || .32); if (k < 0 || k > 1) return;
  X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen';
  X.globalAlpha = Math.pow(1 - k, 2) * (o.a ?? .35); X.fillStyle = o.col || '#D9A441'; X.fillRect(0, 0, W, H);
  const p = lerp(-600, W + 600, easeOut(k)), g = X.createLinearGradient(p - 380, 0, p + 380, H * .5);
  g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.5, 'rgba(255,240,200,.75)'); g.addColorStop(1, 'rgba(255,240,200,0)');
  X.globalAlpha = 1 - k; X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.restore();
}
// Sanded transition: the new painting shows through scrubs rubbed into the old one.
function V_sandIn(t, t0, dur, prevFn, curFn, seed, o = {}) {
  const k = (t - t0) / dur;
  if (k >= 1 || t < t0) { curFn(t); return; }
  lqReveal(() => curFn(t), () => prevFn(t), easeOut(k) * 1.02, seed, { from: o.from || 'left', angle: o.angle ?? -.38, halo: o.halo, name: 'V' });
}

// ---------- V1: the old-quarter street (gold ink line on black lacquer) ----------
const V_F = 1000, V_HY = 650, V_SW = 4.2;
// Tube houses down both sides: [side, z0, z1, height, floors, seed]
const V_HOUSES = (() => {
  const out = [];
  for (const sd of [-1, 1]) {
    let z = 1.5 + (sd > 0 ? 1.3 : 0), i = 0;
    while (z < 82) { const w = 3.4 + hash(i * 3.7 + sd * 11) * 2.2, h = 9 + hash(i * 5.3 + sd * 7) * 6; out.push({ sd, z0: z, z1: z + w, h, fl: Math.max(2, Math.floor((h - 3.9) / 3.1)), s: i * 13.1 + sd * 5 }); z += w + .06; i++; }
  }
  return out;
})();
function V_proj(x, y, z, C) { const d = Math.max(.05, z - C.z); return [960 + (x - C.x) * V_F / d, V_HY - (y - C.y) * V_F / d, V_F / d]; }
function V_quad(pts, C) { const P = pts.map(p => V_proj(p[0], p[1], p[2], C)); X.beginPath(); X.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) X.lineTo(P[i][0], P[i][1]); X.closePath(); }
function V_line(a, b, C) { const A = V_proj(a[0], a[1], a[2], C), B = V_proj(b[0], b[1], b[2], C); X.moveTo(A[0], A[1]); X.lineTo(B[0], B[1]); }
function V_house(hs, C, dim) {
  const zn = C.z + .4, z0 = Math.max(hs.z0, zn), z1 = hs.z1; if (z1 <= zn) return;
  const sd = hs.sd, xs = sd * V_SW, h = hs.h, s = hs.s, d = (z0 + z1) / 2 - C.z, lw = clamp(26 / d, .7, 3.2);
  const gold = `rgba(217,164,65,${.9 * dim})`, goldF = `rgba(217,164,65,${.55 * dim})`;
  // facade
  const tone = hash(s + .3); X.fillStyle = tone < .18 ? '#2a110d' : tone < .6 ? '#150e0b' : '#1c130f';
  V_quad([[xs, 0, z0], [xs, h, z0], [xs, h, z1], [xs, 0, z1]], C); X.fill();
  X.strokeStyle = gold; X.lineWidth = lw; X.stroke();
  const zz = u => lerp(hs.z0, hs.z1, u), cz = u => Math.max(zn, zz(u));
  // shopfront: glowing opening, folding-gate lines, a cinnabar signboard
  if (hs.z1 > zn + .3) {
    X.fillStyle = `rgba(233,170,70,${.22 * dim})`; V_quad([[xs, 0, cz(.1)], [xs, 2.7, cz(.1)], [xs, 2.7, cz(.9)], [xs, 0, cz(.9)]], C); X.fill(); X.strokeStyle = gold; X.stroke();
    X.beginPath(); for (let u = .2; u < .85; u += .12) if (zz(u) > zn) V_line([xs, 0, zz(u)], [xs, 2.7, zz(u)], C); X.strokeStyle = goldF; X.lineWidth = lw * .5; X.stroke();
    V_quad([[xs, 2.9, cz(.06)], [xs, 3.6, cz(.06)], [xs, 3.6, cz(.94)], [xs, 2.9, cz(.94)]], C); X.fillStyle = hash(s + 1.7) < .5 ? '#8a1c15' : '#5a130e'; X.fill(); X.strokeStyle = gold; X.lineWidth = lw; X.stroke();
    X.beginPath(); for (let u = .16; u < .84; u += .09) if (zz(u) > zn) V_line([xs, 3.25, zz(u)], [xs, 3.25, zz(u + .05)], C); X.strokeStyle = `rgba(246,227,161,${.85 * dim})`; X.lineWidth = lw * 1.6; X.stroke();
  }
  // upper floors: tall shuttered windows, some lit; balconies with balusters
  for (let f = 0; f < hs.fl; f++) {
    const yb = 3.9 + f * 3.1;
    for (const [u0, u1] of [[.14, .42], [.58, .86]]) {
      if (zz(u1) <= zn) continue;
      const lit = hash(s + f * 3.3 + u0 * 9) < .4;
      V_quad([[xs, yb + .45, cz(u0)], [xs, yb + 2.35, cz(u0)], [xs, yb + 2.35, cz(u1)], [xs, yb + .45, cz(u1)]], C);
      X.fillStyle = lit ? `rgba(246,196,100,${.5 * dim})` : '#0a0706'; X.fill(); X.strokeStyle = gold; X.lineWidth = lw * .8; X.stroke();
      X.beginPath(); const um = (u0 + u1) / 2; if (zz(um) > zn) V_line([xs, yb + .45, zz(um)], [xs, yb + 2.35, zz(um)], C); V_line([xs, yb + 1.9, cz(u0)], [xs, yb + 1.9, cz(u1)], C);
      X.strokeStyle = goldF; X.lineWidth = lw * .6; X.stroke();
    }
    if (hash(s + f * 1.9) < .6) {   // balcony
      const xp = xs - sd * .85, za = cz(.06), zb = cz(.94);
      if (zb > za + .1) {
        X.fillStyle = `rgba(10,7,6,${.55})`; V_quad([[xp, yb, za], [xp, yb + 1.05, za], [xp, yb + 1.05, zb], [xp, yb, zb]], C); X.fill();
        X.beginPath(); V_line([xp, yb + 1.05, za], [xp, yb + 1.05, zb], C); V_line([xp, yb, za], [xp, yb, zb], C); V_line([xs, yb, za], [xp, yb, za], C); V_line([xs, yb + 1.05, zb], [xp, yb + 1.05, zb], C); V_line([xs, yb, zb], [xp, yb, zb], C);
        X.strokeStyle = gold; X.lineWidth = lw; X.stroke();
        X.beginPath(); for (let zq = za + .3; zq < zb; zq += .32) V_line([xp, yb, zq], [xp, yb + 1.05, zq], C); X.strokeStyle = goldF; X.lineWidth = lw * .45; X.stroke();
        if (hash(s + f * 4.1) < .5) { const P = V_proj(xp, yb + 1.25, lerp(za, zb, .3), C); X.fillStyle = `rgba(47,91,74,${.9 * dim})`; X.beginPath(); X.arc(P[0], P[1], .32 * P[2], 0, TAU); X.fill(); X.strokeStyle = goldF; X.lineWidth = lw * .5; X.stroke(); }
      }
    }
  }
  // parapet with a small gable
  if (zz(.5) > zn) { V_quad([[xs, h, cz(.25)], [xs, h + 1, zz(.5)], [xs, h, cz(.75)]], C); X.fillStyle = '#120c0a'; X.fill(); X.strokeStyle = gold; X.lineWidth = lw; X.stroke(); }
  // hanging vertical sign
  if (hash(s + 8.8) < .45 && zz(.5) > zn + .3) {
    const zq = zz(.5), xo = xs - sd * 1.15;
    V_quad([[xs - sd * .15, 4.1, zq], [xo, 4.1, zq], [xo, 6.6, zq], [xs - sd * .15, 6.6, zq]], C); X.fillStyle = '#9b2019'; X.fill(); X.strokeStyle = `rgba(246,227,161,${dim})`; X.lineWidth = lw; X.stroke();
    X.beginPath(); for (let yy = 4.45; yy < 6.3; yy += .45) V_line([lerp(xs, xo, .35), yy, zq], [lerp(xs, xo, .75), yy, zq], C); X.strokeStyle = `rgba(246,227,161,${.9 * dim})`; X.lineWidth = lw * 1.4; X.stroke();
  }
}
function V_lanterns(z, C, t, i, dim) {
  const d = z - C.z; if (d < .5) return;
  const y0 = 6.4 + hash(i * 2.1) * .8, lw = clamp(22 / d, .6, 3);
  // the string
  X.beginPath(); for (let q = 0; q <= 16; q++) { const u = q / 16, P = V_proj(lerp(-V_SW, V_SW, u), y0 - Math.sin(u * Math.PI) * .7, z, C); q ? X.lineTo(P[0], P[1]) : X.moveTo(P[0], P[1]); }
  X.strokeStyle = `rgba(217,164,65,${.7 * dim})`; X.lineWidth = lw * .6; X.stroke();
  for (let q = 1; q < 8; q++) {
    const u = q / 8, sw = Math.sin(t * 1.7 + i * 1.3 + q) * .12, P = V_proj(lerp(-V_SW, V_SW, u) + sw, y0 - Math.sin(u * Math.PI) * .7 - .55, z, C), r = .3 * P[2];
    const red = (q + i) % 3 !== 0, fl = .85 + .15 * Math.sin(t * 9 + q * 3 + i);
    const g = X.createRadialGradient(P[0], P[1], 0, P[0], P[1], r * 3.2); g.addColorStop(0, red ? `rgba(232,85,58,${.35 * fl * dim})` : `rgba(246,200,110,${.35 * fl * dim})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.fillRect(P[0] - r * 3.2, P[1] - r * 3.2, r * 6.4, r * 6.4);
    X.fillStyle = red ? LQ_PAL.cinnabarLt : LQ_PAL.gold; X.globalAlpha = dim; X.beginPath(); X.ellipse(P[0], P[1], r, r * 1.15, 0, 0, TAU); X.fill();
    X.fillStyle = 'rgba(255,240,200,.35)'; X.beginPath(); X.ellipse(P[0] - r * .3, P[1] - r * .3, r * .35, r * .5, 0, 0, TAU); X.fill();
    X.strokeStyle = LQ_PAL.goldHi; X.lineWidth = Math.max(.5, r * .08); X.beginPath(); X.moveTo(P[0] - r * .5, P[1] - r * 1.1); X.lineTo(P[0] + r * .5, P[1] - r * 1.1); X.moveTo(P[0] - r * .5, P[1] + r * 1.1); X.lineTo(P[0] + r * .5, P[1] + r * 1.1); X.moveTo(P[0], P[1] + r * 1.1); X.lineTo(P[0], P[1] + r * 1.6); X.stroke();
    X.globalAlpha = 1;
  }
}
function V_wires(z, C, i, dim) {
  const d = z - C.z; if (d < .6) return;
  X.beginPath();
  for (let j = 0; j < 5; j++) {
    const ya = 7.6 + j * .28 + hash(i + j) * .3, yb = 7.2 + j * .35, sag = .6 + hash(i * 3 + j) * .9;
    for (let q = 0; q <= 14; q++) { const u = q / 14, P = V_proj(lerp(-V_SW, V_SW, u), lerp(ya, yb, u) - Math.sin(u * Math.PI) * sag, z + u * 1.8, C); q ? X.lineTo(P[0], P[1]) : X.moveTo(P[0], P[1]); }
  }
  X.strokeStyle = `rgba(0,0,0,.85)`; X.lineWidth = clamp(30 / d, 1, 4); X.stroke();
  X.strokeStyle = `rgba(217,164,65,${.35 * dim})`; X.lineWidth = clamp(10 / d, .5, 1.5); X.stroke();
}
// The whole street. C: camera {x, y, z}. idol: {x, z, draw(P)} inserted by depth. dim: line brightness.
function V_street(t, C, idol, dim = 1) {
  lqGround(t, { tone: 'black', sheen: .6 });
  // the moon at the far end, and the far building closing the vista
  lqGold(() => X.arc(1010 - C.x * 6, 250, 64, 0, TAU), { scale: .25, glint: .45, bevel: 1 });
  X.fillStyle = 'rgba(217,164,65,.07)'; X.beginPath(); X.arc(1010 - C.x * 6, 250, 120, 0, TAU); X.fill();
  const zf = 84;
  V_quad([[-V_SW, 0, zf], [-V_SW, 13, zf], [V_SW, 13, zf], [V_SW, 0, zf]], C); X.fillStyle = '#140d0a'; X.fill(); X.strokeStyle = 'rgba(217,164,65,.8)'; X.lineWidth = .8; X.stroke();
  X.fillStyle = 'rgba(246,196,100,.5)'; for (let f = 0; f < 3; f++) for (let k = 0; k < 4; k++) { V_quad([[-3 + k * 1.7, 4 + f * 3, zf], [-2.2 + k * 1.7, 4 + f * 3, zf], [-2.2 + k * 1.7, 5.8 + f * 3, zf], [-3 + k * 1.7, 5.8 + f * 3, zf]], C); X.fill(); }
  // street floor: kerbs, gutters, and reflections of the lanterns
  V_quad([[-V_SW, 0, C.z + .3], [-V_SW, 0, zf], [V_SW, 0, zf], [V_SW, 0, C.z + .3]], C); X.fillStyle = '#0d0908'; X.fill();
  X.beginPath(); for (const xk of [-3.3, 3.3]) V_line([xk, 0, C.z + .3], [xk, 0, zf], C); X.strokeStyle = `rgba(217,164,65,${.6 * dim})`; X.lineWidth = 1.6; X.stroke();
  X.beginPath(); for (let zq = Math.ceil(C.z / 2.4) * 2.4 + 1; zq < 60; zq += 2.4) V_line([-.12, 0, zq], [.12, 0, zq + .9], C); X.strokeStyle = 'rgba(217,164,65,.22)'; X.lineWidth = 1.2; X.stroke();
  X.save(); X.globalCompositeOperation = 'screen';
  for (let k = 0; k < 12; k++) { const zq = 6 + k * 5.5; if (zq - C.z < 1) continue; const P = V_proj(Math.sin(k * 2.3) * 2, 0, zq, C), r = 2.2 * P[2]; const g = X.createRadialGradient(P[0], P[1], 0, P[0], P[1], r); g.addColorStop(0, 'rgba(232,110,60,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.save(); X.translate(P[0], P[1]); X.scale(1, .25); X.translate(-P[0], -P[1]); X.fillRect(P[0] - r, P[1] - r, r * 2, r * 2); X.restore(); }
  X.restore();
  // depth-sorted items: houses, wires, lantern strings, the idol
  const items = [];
  for (const hs of V_HOUSES) items.push([hs.z1, () => V_house(hs, C, dim)]);
  for (let k = 0; k < 12; k++) { const zq = 5 + k * 5.5; items.push([zq - .01, () => V_lanterns(zq, C, t, k, dim)]); }
  for (let k = 0; k < 8; k++) { const zq = 8.5 + k * 8.7; items.push([zq + 1.8, () => V_wires(zq, C, k, dim)]); }
  if (idol) items.push([idol.z, () => idol.draw(V_proj(idol.x, 0, idol.z, C))]);
  items.sort((a, b) => b[0] - a[0]);
  for (const it of items) if (it[0] > C.z + .3) it[1]();
}
// A frontal walk: one step per beat.
const V_WALK_A = { lHip: .1, lKn: -.3, rHip: -.03, rKn: .05, lSh: .05, lEl: -.25, rSh: -.32, rEl: -.2, hy: -.12, lean: .02, skirt: .5 };
function V_mirror(P) { return { ...P, lSh: -(P.rSh ?? -.18), lEl: -(P.rEl ?? -.05), rSh: -(P.lSh ?? .18), rEl: -(P.lEl ?? .05), lHip: -(P.rHip ?? -.08), lKn: -(P.rKn ?? 0), rHip: -(P.lHip ?? .08), rKn: -(P.lKn ?? 0), lean: -(P.lean || 0), hx: -(P.hx || 0), turn: -(P.turn || 0), head: -(P.head || 0), hL: P.hR, hR: P.hL }; }
function V_walk(t) {
  const b = beatF(t), n = Math.floor(b), p = b - n, A = n % 2 ? V_WALK_A : V_mirror(V_WALK_A), B = n % 2 ? V_mirror(V_WALK_A) : V_WALK_A;
  const P = mixPose({ ...POSE0, ...A }, { ...POSE0, ...B }, easeInOut(p));
  P.hy = -.14 * Math.abs(Math.sin(p * Math.PI)); return P;
}
function V_idolFace(t, extra = {}) { return { hat: 'nonla', hatMat: 'gold', mouth: clamp(VOX(t) * 1.3 - .2), blush: .8, ...extra }; }

function V1_paint(t) {
  const lt = t - V_S0, ws0 = wordTimes(LY[0]);
  const C = { x: -.35 + Math.sin(lt * .6) * .15, y: 1.75 + Math.sin(beatF(t) * Math.PI) * .012, z: lt * .55 };
  const dist = lerp(15.5, 5.6, easeOut(lt / 4.8)), iz = C.z + dist, ix = lerp(1.0, .55, lt / 4.6);
  // reach out toward us on "come near me now"
  const reach = clamp((t - ws0[1].t + .1) / .2) * (1 - clamp((t - 39.9) / .3));
  const idol = { x: ix, z: iz, draw: P => {
    const s = .3 * P[2], pose = mixPose(V_walk(t), { ...POSE0, ...V_WALK_A, rSh: -1.35, rEl: -.2, hR: 'open', lSh: .2, lEl: -.3, head: .06 }, reach * .85);
    X.save(); X.fillStyle = 'rgba(0,0,0,.5)'; X.beginPath(); X.ellipse(P[0], P[1], s * 2.2, s * .35, 0, 0, TAU); X.fill(); X.restore();
    idolBody(P[0], P[1] - 4.7 * s, s, pose, { outfit: 'aodai', face: V_idolFace(t, { eyes: t > 40.6 && t < 41.2 ? 'happy' : 'open', look: [0, .1] }) });
  } };
  const typeK = 1 - clamp((t - 39.7) / .3);
  V_street(t, C, idol, lerp(1, .55, clamp((t - ws0[0].t + .3) / .3) * typeK));
  // LY[0] Baby, COME NEAR ME NOW
  if (t > ws0[0].t - .3 && typeK > 0) {
    X.save(); X.globalAlpha = typeK;
    const g = X.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, 'rgba(7,5,4,.72)'); g.addColorStop(.8, 'rgba(7,5,4,.5)'); g.addColorStop(1, 'rgba(7,5,4,0)');
    X.fillStyle = g; X.fillRect(0, 0, W, 560);
    V_tender([ws0[0].t, ws0[1].t, 'Baby,'], 120, 118, t, { size: 96 });
    const f = FONT.vn(200), sp = textW(' ', f), wC = textW('COME', f), wM = textW('ME', f), wN = textW('NOW', f);
    V_inlay('COME', 100, 318, t, ws0[1].t, { size: 200, from: 1.3 });
    V_inlay('NEAR', 100 + wC + sp, 318, t, ws0[2].t, { size: 200, from: 1.3 });
    V_inlay('ME', 1820 - wN - sp - wM, 520, t, ws0[3].t, { size: 200, from: 1.3 });
    V_inlay('NOW', 1820 - wN, 520, t, ws0[4].t, { size: 200, from: 1.3 });
    X.restore();
  }
  V_caption(t, LY[1]);
}
shot(V_S0, V_S1, (t) => V1_paint(t), { seed: 371 });

// ---------- V2: the window lattice cage ----------
const V2_BARS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => 960 + (i + .5) * 118);
function V2_paint(t) {
  const lt = t - V_S1, ws2 = wordTimes(LY[2]), ws3 = wordTimes(LY[3]), tP = ws2[3].t;
  const push = 1 + lt * .018 + hit(t, tP, .3) * .03;
  lqGround(t, { tone: 'brown', sheen: .7 });
  camBegin({ zoom: push, x: 960, y: 560, shake: KICK(t) * 3 + hit(t, tP, .25) * 14 });
  // gold-leaf moon window behind her
  lqGold(() => X.arc(960, 470, 330, 0, TAU), { scale: .45, glint: .3 + lt * .08, bevel: 2, lift: 6 });
  X.strokeStyle = 'rgba(80,40,14,.8)'; X.lineWidth = 3; for (const r of [290, 250]) { X.beginPath(); X.arc(960, 470, r, 0, TAU); X.stroke(); }
  // the idol, smiling, hands up on the bars after "prisoner"
  const hold = clamp((t - tP) / .2), heartK = clamp((t - ws3[4].t + .1) / .2) * (1 - clamp((t - ws3[6].t) / .25));
  let pose = dance(t, 'groove'); pose = mixPose(pose, { ...POSE0, lSh: 1.25, lEl: -1.55, rSh: -1.25, rEl: 1.55, hL: 'fist', hR: 'fist', head: .08 * Math.sin(t * 3) }, hold * .9);
  pose = mixPose(pose, { ...POSE0, ...PZ.fheart }, heartK);
  idolBody(960, 845, 64, pose, { outfit: 'aodai', face: V_idolFace(t, { eyes: t > tP + .1 ? (heartK > .5 ? 'heart' : 'happy') : 'open', mouthShape: 'smile', blush: 1, look: [0, .05] }) });
  // lattice bars slide in from both sides, one per 16th, and slam shut on "prisoner"
  const t0 = ws2[0].t;
  const barPos = V2_BARS.map((bx, i) => {
    const order = i < 5 ? i : 9 - i, ta = t0 + order * (tP - t0) / 5.5, k = clamp((t - ta) / .2);
    return lerp(i < 5 ? -140 - (4 - i) * 60 : W + 140 + (i - 5) * 60, bx, expoOut(k));
  });
  const bars = () => { for (const bx of barPos) X.rect(bx - 12, 150, 24, 720); for (const yy of [330, 610]) { const L = Math.min(...barPos), R = Math.max(...barPos); if (R - L > 40) X.rect(L - 12, yy - 8, R - L + 24, 16); } };
  lqLacquer(bars, '#5b3219', { lift: 10, rim: 2, bounds: [0, 150, W, 720], glint: .4 + lt * .05 });
  X.strokeStyle = 'rgba(217,164,65,.75)'; X.lineWidth = 2; X.beginPath(); for (const bx of barPos) { X.moveTo(bx, 160); X.lineTo(bx, 860); } X.stroke();
  // song cửa fretwork in the corners
  const shut = clamp((t - tP + .05) / .15);
  for (const [cx, sx] of [[0, 1], [W, -1]]) {
    const fret = () => { X.moveTo(cx, 150); X.lineTo(cx + sx * 340, 150); X.lineTo(cx, 150 + 340); X.closePath(); X.moveTo(cx, 870); X.lineTo(cx + sx * 340, 870); X.lineTo(cx, 870 - 340); X.closePath(); };
    lqLacquer(fret, '#3d2012', { rim: 2, bounds: [0, 150, W, 720], glint: .5 });
    X.save(); X.beginPath(); fret(); X.clip(); X.strokeStyle = 'rgba(217,164,65,.8)'; X.lineWidth = 2.2; X.beginPath();
    for (let q = -700; q < 700; q += 38) { X.moveTo(cx + q, 150); X.lineTo(cx + q + 720, 870); X.moveTo(cx + q, 870); X.lineTo(cx + q + 720, 150); } X.stroke(); X.restore();
  }
  // lintel and sill
  lqLacquer(() => X.rect(-40, -40, W + 80, 190), '#3a1f10', { lift: 14, rim: 3, bounds: [0, 0, W, 150], glint: .55 });
  lqLacquer(() => X.rect(-40, 870, W + 80, 260), LQ_PAL.cinnabarDk, { lift: 18, rim: 3, bounds: [0, 870, W, 210], glint: .35 + lt * .06 });
  X.strokeStyle = 'rgba(217,164,65,.9)'; X.lineWidth = 3; X.beginPath(); X.moveTo(0, 136); X.lineTo(W, 136); X.moveTo(0, 888); X.lineTo(W, 888); X.stroke();
  X.lineWidth = 1.5; X.beginPath(); X.moveTo(0, 126); X.lineTo(W, 126); X.moveTo(0, 898); X.lineTo(W, 898); X.stroke();
  // "Call me your" carved small into the lintel, PRISONER inlaid in the sill
  V_tender([ws2[0].t, ws2[3].t, 'Call me your'], 960 - textW('Call me your', FONT.vnI(62)) / 2, 92, t, { size: 62, color: LQ_PAL.goldHi });
  V_inlay('PRISONER', 960, 1052, t, tP, { size: 196, align: 'center', tracking: 14, from: 1.5 });
  camEnd();
  V_glint(t, tP, { a: .3, dur: .4 });
  V_caption(t, LY[3], { y: 812 });
}
shot(V_S1, V_S2, (t) => V_sandIn(t, V_S1, .26, V1_paint, V2_paint, 42, { from: 'right' }), { seed: 372 });

// ---------- V3: formula / Tequila / cellular (the bass drops out) ----------
// V3a: an eggshell mosaic heart assembles, the heart curve written in gold.
const V3_HC = [1300, 560], V3_HR = 250;
const V3_TILES = (() => {
  const out = [], st = 34, [cx, cy] = V3_HC, R = V3_HR;
  // inside test for heartPath(cx, cy, R) via its parametric cousin
  const inside = (x, y) => { const u = (x - cx) / (R * 1.02), v = -(y - cy - R * .1) / (R * 1.0); const a = u * u + v * v - 1; return a * a * a - u * u * v * v * v < 0; };
  for (let y = cy - R * 1.2; y < cy + R * 1.1; y += st) for (let x = cx - R * 1.4; x < cx + R * 1.4; x += st) {
    const i = out.length, jx = sjit(i * 1.1, 4) * 0, px = x + (Math.floor((y - cy) / st) % 2 ? st / 2 : 0);
    if (!inside(px + st / 2, y + st / 2)) continue;
    const pts = [[0, 0], [st, 0], [st, st], [0, st]].map(([a, b], q) => [px + a + (hash(i * 4 + q) - .5) * 8, y + b + (hash(i * 4 + q + 99) - .5) * 8]);
    const ang = hash(i * 7.3) * TAU, far = 700 + hash(i * 2.9) * 600;
    out.push({ pts, c: [px + st / 2, y + st / 2], off: [Math.cos(ang) * far, Math.sin(ang) * far * .7], rot: (hash(i * 5.1) - .5) * 6, ord: 1 - (y - (cy - R * 1.2)) / (R * 2.3) * .7 - hash(i * 3.3) * .3 + .3 });
  }
  return out;
})();
function V3a_paint(t) {
  const lt = t - V_S2, ws = wordTimes(LY[4]);
  lqGround(t, { tone: 'black', sheen: .8 });
  camBegin({ zoom: 1.02 + lt * .025, x: 960, y: 540 });
  // gold ink: grid of the graph, and the heart curve formula writing on
  X.save(); X.strokeStyle = 'rgba(217,164,65,.18)'; X.lineWidth = 1.2; X.beginPath();
  for (let x = 900; x <= 1720; x += 68) { X.moveTo(x, 200); X.lineTo(x, 920); } for (let y = 200; y <= 920; y += 68) { X.moveTo(900, y); X.lineTo(1720, y); } X.stroke();
  X.strokeStyle = 'rgba(217,164,65,.6)'; X.lineWidth = 2; X.beginPath(); X.moveTo(880, V3_HC[1] + 25); X.lineTo(1740, V3_HC[1] + 25); X.moveTo(V3_HC[0], 180); X.lineTo(V3_HC[0], 940); X.stroke(); X.restore();
  const T1 = V_S2, dur = ws[6].t - T1 - .05;
  const P = () => { for (const tl of V3_TILES) { const k = easeOut(clamp((t - T1 - (1 - tl.ord) * dur * .7) / (dur * .35))); const dx = tl.off[0] * (1 - k), dy = tl.off[1] * (1 - k), r = tl.rot * (1 - k), cs = Math.cos(r), sn = Math.sin(r);
    tl.pts.forEach(([x, y], q) => { const ux = x - tl.c[0], uy = y - tl.c[1], px = tl.c[0] + dx + ux * cs - uy * sn, py = tl.c[1] + dy + ux * sn + uy * cs; q ? X.lineTo(px, py) : X.moveTo(px, py); }); X.closePath(); } };
  lqEggshell(P, { scale: .5, lift: 3, glint: .3 + lt * .2, bevel: 1 });
  // grout lines once assembled + a gold outline pulse on "formula"
  const done = clamp((t - ws[6].t + .05) / .15);
  if (done > 0) { X.save(); X.globalAlpha = done; heartPath(V3_HC[0], V3_HC[1] + 10, V3_HR * 1.02); X.strokeStyle = LQ_PAL.gold; X.lineWidth = 6 + hit(t, ws[6].t, .4) * 10; X.stroke(); X.restore(); }
  // the formula
  const fk = clamp((t - T1 - .1) / 1.0), fstr = '(x² + y² − 1)³ = x²y³', ff = FONT.vnI(54);
  X.save(); X.beginPath(); X.rect(1300 - 330, 930, 660 * fk, 90); X.clip(); X.font = ff; X.textAlign = 'center'; X.fillStyle = LQ_PAL.goldHi; X.fillText(fstr, 1300, 995); X.restore();
  X.save(); X.font = FONT.vnIR(40); X.fillStyle = 'rgba(246,227,161,.7)';
  [['♥ = ∫ you · dt', 1600, 240, .2], ['∑ girl → ∞', 930, 250, .45], ['e^{iπ} + ♥ = 0', 1590, 860, .65]].forEach(([s, x, y, d]) => { const k = clamp((t - T1 - d) / .25); X.globalAlpha = k * .8; X.fillText(s, x, y + (1 - k) * 12); });
  X.restore();
  camEnd();
  V_tender(LY[4], 110, 330, t, { size: 60, words: 6 });
  V_inlay('FORMULA', 90, 560, t, ws[6].t, { size: 190, material: 'egg', from: 1.35, dustCol: LQ_PAL.egg });
}
shot(V_S2, V_S3, (t) => { V_sandIn(t, V_S2, .3, V2_paint, V3a_paint, 46, { from: 'center', halo: '#8a5a2a' }); }, { seed: 373 });

// V3b: gold leaf melts like liquor.
const V3_DRIPS = Array.from({ length: 18 }, (_, i) => ({ x: 40 + i * 108 + sjit(i + 40, 30), w: 16 + hash(i * 3.3) * 26, d: hash(i * 5.5) * .9, v: 180 + hash(i * 7.1) * 260 }));
function V3b_paint(t) {
  const lt = t - V_S3, ws = wordTimes(LY[5]), tq = ws[6].t, high = clamp((t - ws[2].t) / .3);
  lqGround(t, { tone: 'brown', sheen: .8 });
  camBegin({ zoom: 1.04, rot: Math.sin(lt * 2.2) * .025 * high, x: 960, y: 540 });
  // the gold-leaf ceiling melting into drips
  lqGold(() => { X.moveTo(-60, -60); X.lineTo(W + 60, -60); X.lineTo(W + 60, 60); for (let i = V3_DRIPS.length - 1; i >= 0; i--) { const d = V3_DRIPS[i], L = Math.max(0, lt - d.d) * d.v * (1 + Math.max(0, lt - d.d) * .6); X.lineTo(d.x + d.w, 60); X.lineTo(d.x + d.w * .8, 60 + L); X.arc(d.x + d.w / 2, 60 + L, d.w * .52, 0, Math.PI); X.lineTo(d.x + d.w * .2, 60 + L); X.lineTo(d.x, 60); } X.lineTo(-60, 60); X.closePath(); }, { scale: .45, glint: frac(lt * .4 + .2), bevel: 2, lift: 5 });
  // the pool rising at the bottom
  const lev = 1080 - 40 - lt * 38;
  lqGold(() => { X.moveTo(-60, 1140); X.lineTo(-60, lev); for (let x = -60; x <= W + 60; x += 40) X.lineTo(x, lev + Math.sin(x * .012 + t * 4) * 9 + Math.sin(x * .03 - t * 6) * 4); X.lineTo(W + 60, 1140); X.closePath(); }, { scale: .45, glint: frac(lt * .3 + .6), bevel: 2 });
  // her head, tipsy
  idolHead(1420, 560, 190, { hat: 'nonla', hatMat: 'gold', tilt: Math.sin(lt * 2.2 + .5) * .12 * high - .04, eyes: t > tq ? 'star' : high > .5 ? 'happy' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), blush: 1 + high * .4, bust: true, look: [-.2, 0], sway: Math.sin(t * 3) });
  camEnd();
  V_tender(LY[5], 110, 330, t, { size: 60, words: 6 });
  // TEQUILA with its own drips from the baseline
  if (t > tq - .02) {
    const fnt = FONT.vn(210), w = textW('TEQUILA', fnt), x0 = 90, y = 600;
    const lk = Math.max(0, t - tq - .15);
    lqGold(() => { for (let i = 0; i < 7; i++) { const dx = x0 + (i + .5) * w / 7 + sjit(i + 70, 20), dw = 12 + hash(i * 2.2) * 16, L = lk * (120 + hash(i * 4.4) * 200) * (1 + lk); if (L < 2) continue; X.moveTo(dx - dw / 2, y - 10); X.lineTo(dx + dw / 2, y - 10); X.lineTo(dx + dw * .35, y + L); X.arc(dx, y + L, dw * .5, 0, Math.PI); X.closePath(); } }, { scale: .3, glint: .5, bevel: 1 });
    withT(0, 0, 0, 1, () => { X.save(); X.translate(x0 + w / 2, y); X.rotate(Math.sin(lt * 2.2) * .02); X.translate(-(x0 + w / 2), -y); V_inlay('TEQUILA', x0, y, t, tq, { size: 210, from: 1.35 }); X.restore(); });
  }
}
shot(V_S3, V_S4, (t) => { V3b_paint(t); V_glint(t, V_S3); }, { seed: 374 });

// V3c: three silver signal bars, one per beat; CELLULAR.
function V3c_paint(t) {
  const lt = t - V_S4, ws = wordTimes(LY[6]), tc = ws[3].t, beats = [beatT(93), beatT(94), beatT(95)];
  lqGround(t, { tone: 'night', sheen: .9 });
  camBegin({ zoom: 1 + lt * .02, x: 960, y: 540 });
  const bx = [1180, 1380, 1580], bh = [230, 400, 570], by = 860, bw = 150;
  // radio arcs above the bars, pulsing out on each lit beat
  for (let i = 0; i < 3; i++) {
    const k = (t - beats[i]) / .9; if (k < 0) continue;
    for (let j = 0; j < 3; j++) { const kk = frac(k * .8 - j * .33); X.strokeStyle = `rgba(225,230,236,${.5 * (1 - kk)})`; X.lineWidth = 3; X.beginPath(); X.arc(1380, by - 640, 80 + kk * 460, -2.4, -.74); X.stroke(); }
  }
  bx.forEach((x, i) => {
    const lit = t >= beats[i] - .01, r = [x - bw / 2, by - bh[i], bw, bh[i]];
    // recessed slot
    X.fillStyle = '#070606'; X.fillRect(r[0] - 8, r[1] - 8, r[2] + 16, r[3] + 16);
    X.strokeStyle = 'rgba(201,204,209,.55)'; X.lineWidth = 2; X.strokeRect(r[0] - 8, r[1] - 8, r[2] + 16, r[3] + 16);
    if (lit) {
      const h = hit(t, beats[i], .35), all = hit(t, tc, .5);
      lqSilver(() => X.rect(r[0], r[1], r[2], r[3]), { bounds: r, glint: clamp((t - beats[i]) / .6), bevel: 2, lift: 4 });
      if (h + all > 0) { X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = (h + all) * .6; X.fillStyle = '#ffffff'; X.fillRect(r[0], r[1], r[2], r[3]); X.restore(); }
      X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(x, r[1] + r[3] / 2, 20, x, r[1] + r[3] / 2, bh[i] * .8); g.addColorStop(0, 'rgba(210,220,235,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(x - 400, r[1] - 300, 800, r[3] + 600); X.restore();
    } else {
      lqLacquer(() => X.rect(r[0], r[1], r[2], r[3]), '#1a1820', { bounds: r, rim: 1, glint: .5 });
    }
  });
  camEnd();
  V_tender(LY[6], 110, 520, t, { size: 60, words: 3 });
  V_inlay('CELLULAR', 90, 760, t, tc, { size: 190, material: 'silver', from: 1.35, dustCol: LQ_PAL.silverHi });
}
shot(V_S4, V_S5, (t) => { V3c_paint(t); V_glint(t, V_S4, { col: '#C9CCD1' }); }, { seed: 375 });

// ---------- V4: medulla (a gold lotus blooms), then the night market ----------
function V_lotus(x, y, R, k, t) {
  // five rings of petals opening one per beat; the seed-pod swirls like a brain
  const n = [0, 1, 2, 3].map(i => easeOut(clamp(k * 4 - i)));
  for (let ring = 3; ring >= 0; ring--) {
    const kk = n[ring]; if (kk <= 0) continue;
    const np = 6 + ring * 2, pr = R * (.45 + ring * .2) * backOut(kk);
    lqGold(() => { for (let i = 0; i < np; i++) { const a = -Math.PI / 2 + (i - (np - 1) / 2) * (Math.PI * .9 / np) * (1 + ring * .15), tipx = x + Math.cos(a) * pr, tipy = y + Math.sin(a) * pr * .95; const nx = -Math.sin(a) * pr * .22, ny = Math.cos(a) * pr * .22;
      X.moveTo(x, y); X.quadraticCurveTo(x + (tipx - x) * .5 + nx, y + (tipy - y) * .5 + ny, tipx, tipy); X.quadraticCurveTo(x + (tipx - x) * .5 - nx, y + (tipy - y) * .5 - ny, x, y); X.closePath(); } },
    { scale: .35, glint: frac(t * .3 + ring * .2), bevel: 1.5, lift: 5, shade: ring * .12 });
  }
  if (n[0] > 0) {
    lqEggshell(() => X.ellipse(x, y - R * .08, R * .3 * n[0], R * .2 * n[0], 0, 0, TAU), { scale: .3, lift: 3, bevel: 1, glint: .5 });
    X.save(); X.strokeStyle = 'rgba(142,94,28,.9)'; X.lineWidth = 3; X.beginPath();
    for (let i = 0; i < 5; i++) { const yy = y - R * .2 + i * R * .06; X.moveTo(x - R * .22 * n[0], yy); for (let q = 1; q <= 8; q++) X.lineTo(x - R * .22 * n[0] + q * R * .055 * n[0], yy + Math.sin(q * 1.7 + i) * 6); }
    X.stroke(); X.restore();
  }
}
function V4a_paint(t) {
  const lt = t - V_S5, ws = wordTimes(LY[7]), tm = ws[3].t;
  lqGround(t, { tone: 'red', sheen: .8 });
  camBegin({ zoom: 1.03 + lt * .03, x: 960, y: 540, shake: KICK(t) * 3 });
  // halo rings
  X.save(); X.strokeStyle = 'rgba(217,164,65,.35)'; X.lineWidth = 2; for (let i = 0; i < 5; i++) { X.beginPath(); X.arc(640, 560, 260 + i * 70 + (lt * 40) % 70, 0, TAU); X.stroke(); } X.restore();
  V_lotus(640, 640, 380, clamp((t - ws[1].t) / (BEAT * 3.6)), t);
  idolHead(1440, 560, 210, { hat: 'nonla', hatMat: 'gold', turn: -.55, look: [-.8, -.2], eyes: t > tm ? 'happy' : 'open', mouth: clamp(VOX(t) * 1.3 - .2), blush: 1, bust: true, tilt: -.05 });
  camEnd();
  V_tender(LY[7], 120, 150, t, { size: 60, words: 3 });
  V_inlay('MEDULLA', 640, 1010, t, tm, { size: 180, align: 'center', from: 1.35 });
}
shot(V_S5, V_S6, (t) => V_sandIn(t, V_S5, .28, V3c_paint, V4a_paint, 54, { from: 'left' }), { seed: 376 });

// V4b: night market, gifts wrapped in gold leaf stacking up on the beats.
const V4_BOXES = [[1250, 0, 250, 170], [1510, 0, 220, 190], [1370, 1, 230, 150], [1620, 1, 150, 130], [1300, 2, 170, 140], [1480, 2, 200, 120], [1420, 3, 160, 160]];
function V4_stall(x, y, w, h, t, i) {
  // counter, posts, striped awning, a lantern row, goods drawn in gold line
  lqLacquer(() => X.rect(x, y - 120, w, 120), i % 2 ? '#3a1f10' : '#2b1710', { rim: 2, glint: .5, bounds: [x, y - 120, w, 120] });
  X.strokeStyle = 'rgba(217,164,65,.85)'; X.lineWidth = 2; X.strokeRect(x, y - 120, w, 120);
  X.fillStyle = '#1a110d'; X.fillRect(x + 10, y - h, 14, h - 120); X.fillRect(x + w - 24, y - h, 14, h - 120);
  const aw = () => { X.moveTo(x - 30, y - h); X.lineTo(x + w + 30, y - h); X.lineTo(x + w + 50, y - h + 90); X.lineTo(x - 50, y - h + 90); X.closePath(); };
  lqLacquer(aw, LQ_PAL.cinnabar, { rim: 2, glint: .4, bounds: [x - 50, y - h, w + 100, 90] });
  X.save(); X.beginPath(); aw(); X.clip(); X.fillStyle = 'rgba(18,13,11,.8)'; for (let q = 0; q < 12; q++) { const u0 = q / 12, u1 = (q + .5) / 12; X.beginPath(); X.moveTo(lerp(x - 30, x + w + 30, u0), y - h); X.lineTo(lerp(x - 30, x + w + 30, u1), y - h); X.lineTo(lerp(x - 50, x + w + 50, u1), y - h + 90); X.lineTo(lerp(x - 50, x + w + 50, u0), y - h + 90); X.fill(); } X.restore();
  // scalloped edge
  X.fillStyle = LQ_PAL.cinnabarDk; X.beginPath(); for (let q = 0; q < 10; q++) { const cx = lerp(x - 50, x + w + 50, (q + .5) / 10); X.moveTo(cx - (w + 100) / 20, y - h + 90); X.arc(cx, y - h + 90, (w + 100) / 20, 0, Math.PI); } X.fill();
  X.strokeStyle = 'rgba(217,164,65,.9)'; X.lineWidth = 2; X.beginPath(); aw(); X.stroke();
  // goods: jars and fruit piles in gold line
  X.strokeStyle = 'rgba(246,227,161,.7)'; X.lineWidth = 2; X.beginPath();
  for (let q = 0; q < 5; q++) { const gx = x + 40 + q * (w - 80) / 4, gy = y - 120; if (q % 2) { X.moveTo(gx + 22, gy); X.arc(gx, gy, 22, 0, Math.PI, true); } else { X.rect(gx - 16, gy - 46, 32, 46); X.moveTo(gx - 10, gy - 52); X.lineTo(gx + 10, gy - 52); } }
  X.stroke();
  // lanterns along the awning
  for (let q = 0; q < 5; q++) { const lx = lerp(x, x + w, (q + .5) / 5), ly = y - h + 120 + Math.sin(t * 2 + q + i) * 4; const g = X.createRadialGradient(lx, ly, 0, lx, ly, 50); g.addColorStop(0, 'rgba(246,190,90,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(lx - 50, ly - 50, 100, 100); X.fillStyle = (q + i) % 2 ? LQ_PAL.gold : LQ_PAL.cinnabarLt; X.beginPath(); X.ellipse(lx, ly, 13, 16, 0, 0, TAU); X.fill(); }
}
function V4b_paint(t) {
  const lt = t - V_S6, ws9 = wordTimes(LY[9]);
  lqGround(t, { tone: 'black', sheen: .7, camX: lt * 60 });
  camBegin({ zoom: 1.02 + lt * .012, x: 940 + lt * 14, y: 540, shake: KICK(t) * 3 });
  // string of lights across the top
  X.strokeStyle = 'rgba(217,164,65,.6)'; X.lineWidth = 2; X.beginPath(); X.moveTo(-40, 90); X.quadraticCurveTo(960, 230, W + 40, 90); X.stroke();
  for (let q = 0; q < 22; q++) { const u = q / 21, lx = lerp(-40, W + 40, u), ly = lerp(90, 90, u) + 2 * u * (1 - u) * 140 + 14; const on = (q + beatN(t)) % 3 !== 0; X.fillStyle = on ? LQ_PAL.goldHi : LQ_PAL.goldDk; X.beginPath(); X.arc(lx, ly, 7, 0, TAU); X.fill(); }
  // stalls
  V4_stall(40, 760, 420, 470, t, 0); V4_stall(560, 740, 380, 450, t, 1); V4_stall(1040, 760, 420, 470, t, 2); V4_stall(1560, 740, 380, 450, t, 3);
  // ground
  lqLacquer(() => X.rect(-60, 760, W + 120, 400), '#1c120d', { rim: 0, glint: .5, bounds: [0, 760, W, 320] });
  X.strokeStyle = 'rgba(217,164,65,.35)'; X.lineWidth = 1.5; X.beginPath(); for (let q = 0; q < 8; q++) { X.moveTo(-60, 790 + q * q * 6); X.lineTo(W + 60, 790 + q * q * 6); } X.stroke();
  // the idol offering gifts
  const give = clamp((t - wordTimes(LY[8])[4].t + .1) / .2);
  let pose = dance(t, 'groove'); pose = mixPose(pose, { ...POSE0, ...PZ.armsOut, rSh: -1.2, rEl: -.3, lSh: 1.2, lEl: .3, head: .08 }, give * .8);
  if (t > ws9[4].t - .1) pose = mixPose(pose, { ...POSE0, ...PZ.heart }, clamp((t - ws9[4].t + .1) / .2));
  idolBody(760, 640, 46, pose, { outfit: 'aodai', face: V_idolFace(t, { eyes: 'happy', look: [.4, 0] }) });
  // gifts drop on the beats and stack
  const drops = V4_BOXES.map((b, i) => beatT(102 + i * .5 + (i > 3 ? (i - 3) * .5 : 0)));
  const base = 900, boxes = [];
  const lvlH = [0, 180, 330, 470];
  V4_BOXES.forEach(([x, lv, w, h], i) => { const t0 = drops[i]; if (t < t0 - .25) return; const k = clamp((t - t0 + .25) / .25), yb = base - lvlH[lv] - (1 - easeIn(k)) * 900, sq = hit(t, t0, .2); boxes.push({ x, yb, w: w * (1 + sq * .08), h: h * (1 - sq * .12), i }); });
  boxes.forEach(b => {
    const r = [b.x - b.w / 2, b.yb - b.h, b.w, b.h];
    lqGold(() => X.rect(...r), { scale: .3, glint: frac(t * .3 + b.i * .15), bevel: 2, lift: 8, bounds: r });
    X.fillStyle = b.i % 2 ? LQ_PAL.cinnabar : '#7a1a14'; X.fillRect(b.x - 12, r[1], 24, r[3]); X.fillRect(r[0], r[1] + r[3] * .45, r[2], 20);
    X.fillStyle = LQ_PAL.cinnabarLt; X.beginPath(); X.ellipse(b.x - 26, r[1] - 12, 28, 15, -.4, 0, TAU); X.ellipse(b.x + 26, r[1] - 12, 28, 15, .4, 0, TAU); X.fill();
    X.strokeStyle = LQ_PAL.cinnabarDk; X.lineWidth = 2; X.stroke();
  });
  // on "love": a heart-shaped gift crowns the pile
  const th = ws9[4].t;
  if (t > th - .2) { const k = clamp((t - th + .2) / .2), y = 900 - 470 - 190 - (1 - easeIn(k)) * 800; withT(1420, y, Math.sin(t * 3) * .05, 1 + hit(t, th, .3) * .2, () => lqGold(() => heartPath(0, 0, 80), { scale: .3, glint: .5, bevel: 2, lift: 8 })); }
  camEnd();
  V_caption(t, LY[8]); V_caption(t, LY[9]);
}
shot(V_S6, V_S7, (t) => { V4b_paint(t); V_glint(t, V_S6); }, { seed: 377 });

// ---------- V5: the storm buffalo, then the sun ----------
function V5_paint(t) {
  const lt = t - V_S7, ws = wordTimes(LY[11]), tsh = ws[4].t, sun = easeOut(clamp((t - tsh + .1) / .35)), storm = 1 - sun * .85;
  lqGround(t, { tone: 'night', sheen: .5 + sun * .6 });
  // warm light flooding in with the sun
  if (sun > 0) { X.save(); X.setTransform(SX, 0, 0, SX, 0, 0); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(1560, 300, 50, 1560, 300, 1400); g.addColorStop(0, `rgba(246,200,110,${.45 * sun})`); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore(); }
  camBegin({ zoom: 1.03, x: 960, y: 540, shake: KICK(t) * 5 + hit(t, V_S7, .3) * 10 });
  // the sun and its rays
  if (sun > 0) {
    withT(1560, 300, t * .15, sun, () => lqGold(() => sparkPath(0, 0, 330, 16, .55, 0, .4), { scale: .35, glint: .5, bevel: 1, alpha: .8 }));
    withT(1560, 300, 0, backOut(sun), () => lqGold(() => X.arc(0, 0, 180, 0, TAU), { scale: .35, glint: frac(t * .5), bevel: 2, lift: 6 }));
  }
  // storm clouds parting
  const part = sun * 700;
  lqLacquer(() => { X.moveTo(-100, -100); X.lineTo(1100 - part, -100); for (let q = 0; q <= 8; q++) { const u = q / 8; X.lineTo(1100 - part - Math.sin(u * 9 + t) * 30 - u * 200, -100 + u * 380); } X.lineTo(-100, 280); X.closePath(); }, '#24262e', { rim: 2, glint: .5, bounds: [0, 0, W, 300], alpha: .92 });
  lqLacquer(() => { X.moveTo(W + 100, -100); X.lineTo(1300 + part, -100); for (let q = 0; q <= 8; q++) { const u = q / 8; X.lineTo(1300 + part + Math.sin(u * 7 - t) * 30 + u * 260, -100 + u * 330); } X.lineTo(W + 100, 230); X.closePath(); }, '#1e2027', { rim: 2, glint: .6, bounds: [0, 0, W, 300], alpha: .92 });
  // lightning on the first downbeat and at bar 55
  for (const tl of [V_S7 + .02, barT(28) + BEAT * 2]) { const k = hit(t, tl, .25); if (k > 0) { X.save(); X.strokeStyle = `rgba(244,246,248,${k})`; X.lineWidth = 6; X.beginPath(); let x = 300 + hash(tl) * 400, y = -20; X.moveTo(x, y); for (let q = 0; q < 9; q++) { x += (hash(tl + q) - .5) * 120; y += 60; X.lineTo(x, y); } X.stroke(); X.restore(); } }
  // far hills (parallax) and the ground scrolling under the charge
  const scroll = lt * 900;
  lqLacquer(() => { X.moveTo(-100, 1200); for (let x = -100; x <= W + 100; x += 60) X.lineTo(x, 700 + Math.sin((x + scroll * .2) * .006) * 50 + Math.sin((x + scroll * .2) * .017) * 20); X.lineTo(W + 100, 1200); X.closePath(); }, '#161519', { rim: 0, glint: .5, bounds: [0, 620, W, 460] });
  lqLacquer(() => { X.moveTo(-100, 1200); X.lineTo(-100, 930); X.quadraticCurveTo(960, 900, W + 100, 940); X.lineTo(W + 100, 1200); X.closePath(); }, LQ_PAL.brownDk, { rim: 0, glint: .45, bounds: [0, 900, W, 180] });
  X.save(); X.strokeStyle = 'rgba(217,164,65,.45)'; X.lineWidth = 2; X.beginPath(); for (let q = 0; q < 14; q++) { const x = ((q * 190 - scroll) % 2660 + 2660) % 2660 - 370, y = 960 + (q % 3) * 35; X.moveTo(x, y); X.lineTo(x + 90, y - 4); } X.stroke(); X.restore();
  lqRain(t, { rect: [0, 0, W, H], n: 240, ground: 950, angle: .3, alpha: storm });
  lqBuffalo(820, 1000, 640, t, { gait: 'charge', glint: frac(t * .4), speed: 2.2 });
  lqRain(t + 7, { rect: [0, 0, W, H], n: 70, angle: .3, len: 150, alpha: .85 * storm });
  camEnd();
  // gold dust in the sunbeam
  if (sun > 0) { X.save(); X.fillStyle = LQ_PAL.goldHi; for (let i = 0; i < 60; i++) { const px = 1100 + hash(i * 3.1) * 820, py = frac(hash(i * 1.7) - t * .1) * 1080; X.globalAlpha = sun * .7 * hash(i * 5.3); X.fillRect(px, py, 3, 3); } X.restore(); }
  V_caption(t, LY[10]);
  // LY[11]: COME RAIN (silver), OR THE SHINE (gold), I gotchya
  if (t > ws[0].t - .05) {
    X.save(); const g = X.createLinearGradient(0, 0, 0, 480); g.addColorStop(0, 'rgba(7,5,4,.55)'); g.addColorStop(1, 'rgba(7,5,4,0)'); X.fillStyle = g; X.globalAlpha = clamp((t - ws[0].t + .05) / .1); X.fillRect(0, 0, 1400, 480); X.restore();
    V_inlay('COME RAIN', 90, 200, t, ws[0].t, { size: 160, material: 'silver', from: 1.3, dustCol: LQ_PAL.silverHi });
    V_inlay('OR THE SHINE', 90, 380, t, tsh, { size: 160, from: 1.4 });
    V_tender([ws[5].t, LY[11][1], 'I gotchya'], 100, 480, t, { size: 60 });
  }
}
shot(V_S7, V_END, (t) => V_sandIn(t, V_S7, .3, V4b_paint, V5_paint, 59, { from: 'right', halo: '#3a3d46' }), { seed: 378 });
