// clawd.js: CLAWDS, the backup dancers. Blocky orange Claude Code critters: a wide body, two tall eye slits,
// arm nubs on the sides and four stubby legs, each wearing a coloured beanie.
//
// clawd(x, y, s, o): (x, y) = ground point under the body centre, s = body width in px.
// o: {hat: colour|null, squash (-1..1, + = squashed), lean, arms: [l, r] (0 down, 1 up), step (leg phase), eyes: 'open'|'happy'|'x'|'heart'|'shades'|'closed'|'wide',
//     look [-1..1], jump (px up), flip, body colour, hardhat}
const CLAWD_HATS = [PAL.pink, PAL.blue, PAL.yellow, PAL.teal];
function clawd(x, y, s, o = {}) {
  const sq = o.squash || 0, bw = s * (1 + sq * .18), bh = s * .62 * (1 - sq * .22), lift = o.lift ?? Math.max(3, s * .045);
  const col = o.body || PAL.orange, legH = s * .2 * (1 - sq * .4);
  X.save(); X.translate(x, y - (o.jump || 0)); if (o.flip) X.scale(-1, 1); X.rotate(o.lean || 0);
  // legs
  const legs = [-.36, -.13, .13, .36];
  legs.forEach((u, i) => {
    const ph = o.step !== undefined ? Math.sin(o.step * Math.PI + i * Math.PI) * .5 + .5 : 0;
    const lx = u * bw, ly = -legH, lh = legH * (1 - ph * .45);
    cut(() => rrect(lx - s * .055, ly - s * .02, s * .11, lh + s * .02, s * .02), { fill: PAL.orangeDk, lift: lift * .5 });
  });
  const by = -legH - bh;
  // arm nubs
  const arms = o.arms || [0, 0];
  [-1, 1].forEach((sd, i) => {
    const a = arms[i] || 0;
    withT(sd * bw * .5, by + bh * .45, -sd * a * 2.2, 1, () => cut(() => rrect(sd > 0 ? 0 : -s * .2, -s * .07, s * .2, s * .14, s * .03), { fill: col, lift: lift * .6 }));
  });
  // body
  const body = () => { X.beginPath(); X.roundRect(-bw / 2, by, bw, bh, s * .06); };
  cut(body, { fill: col, lift });
  htGrad(body, PAL.orangeDk, 0, by, 0, by + bh, { step: s * .07, maxR: s * .022, bounds: [-bw / 2, by, bw, bh], alpha: .8 });
  // eyes
  const ex = s * .2, ey = by + bh * .32, ew = s * .075, eh = s * .19, look = (o.look || 0) * s * .03, e = o.eyes || 'open';
  for (const sd of [-1, 1]) {
    const cx = sd * ex + look;
    if (e === 'happy') inkStroke(() => { X.beginPath(); X.moveTo(cx - ew, ey + eh * .6); X.lineTo(cx, ey + eh * .15); X.lineTo(cx + ew, ey + eh * .6); }, PAL.ink, s * .04);
    else if (e === 'closed') inkStroke(() => { X.beginPath(); X.moveTo(cx - ew, ey + eh * .5); X.lineTo(cx + ew, ey + eh * .5); }, PAL.ink, s * .04);
    else if (e === 'x') inkStroke(() => { X.beginPath(); X.moveTo(cx - ew, ey); X.lineTo(cx + ew, ey + eh); X.moveTo(cx + ew, ey); X.lineTo(cx - ew, ey + eh); }, PAL.ink, s * .035);
    else if (e === 'heart') cut(() => heartPath(cx, ey + eh * .5, s * .085), { fill: PAL.pink, lift: 2 });
    else if (e === 'red') { X.fillStyle = PAL.red; X.fillRect(cx - ew / 2, ey, ew, eh); }
    else if (e !== 'shades') { const hh = e === 'wide' ? eh * 1.25 : eh; X.fillStyle = PAL.ink; X.beginPath(); X.roundRect(cx - ew / 2, ey + (eh - hh) / 2, ew, hh, s * .015); X.fill(); }
  }
  if (e === 'shades') { cut(() => { X.beginPath(); X.roundRect(-ex - s * .12, ey + s * .02, ex * 2 + s * .24, s * .12, s * .03); }, { fill: PAL.ink, lift: 2 }); }
  // hat
  if (o.hardhat) {
    cut(() => { X.beginPath(); X.ellipse(0, by + s * .02, bw * .42, s * .2, 0, Math.PI, TAU); X.closePath(); }, { fill: PAL.yellow, lift });
    cut(() => rrect(-bw * .52, by - s * .01, bw * 1.04, s * .06, s * .03), { fill: PAL.yellow, lift: lift * .5 });
  } else if (o.hat !== null) {
    const hc = o.hat || PAL.pink, hw = bw * .62, hh = s * .24;
    cut(() => { X.beginPath(); X.moveTo(-hw / 2, by + s * .03); X.quadraticCurveTo(-hw / 2, by - hh, 0, by - hh * 1.05); X.quadraticCurveTo(hw / 2, by - hh, hw / 2, by + s * .03); X.closePath(); }, { fill: hc, lift });
    cut(() => rrect(-hw / 2 - s * .02, by - s * .03, hw + s * .04, s * .08, s * .03), { fill: hc, lift: lift * .4, stroke: 'rgba(0,0,0,.15)', sw: 1 });
    cut(() => { X.beginPath(); X.arc(0, by - hh * 1.05, s * .06, 0, TAU); }, { fill: PAL.paperHi, lift: lift * .5 });
  }
  X.restore();
}
