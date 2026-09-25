// dance.js: choreography. Poses are keyframed on the beat grid: each move lists poses per beat,
// the body snaps into each pose just after the beat (ease-out over ~0.35 beat) and holds, like K-pop hits.
//
// dance(t, move, o) → pose for idolBody().   clawdDance(t, move, i) → options for clawd().

const PZ = {
  stand:   { lSh: .15, lEl: .05, rSh: -.15, rEl: -.05, lHip: .07, rHip: -.07 },
  // the P(doom) point dance: pump, pump, pump, point to the sky
  pump1:   { lSh: .5, lEl: -1.9, rSh: -.5, rEl: 1.9, hL: 'fist', hR: 'fist', hy: .25, lKn: .15, rKn: -.15, lHip: .15, rHip: -.15, skirt: .2 },
  pump2:   { lSh: 1.6, lEl: -1.2, rSh: -1.6, rEl: 1.2, hL: 'fist', hR: 'fist', hy: .1, lHip: .12, rHip: -.12, skirt: .3 },
  pump3:   { lSh: 2.4, lEl: -.5, rSh: -2.4, rEl: .5, hL: 'fist', hR: 'fist', hy: -.1, lHip: .1, rHip: -.1, skirt: .5 },
  point:   { lSh: .35, lEl: -.2, rSh: -2.95, rEl: -.05, hR: 'point', hy: -.15, lean: .06, head: .1, lHip: .22, rHip: -.02, rKn: .05, skirt: .7, turn: .25 },
  // hip sway / groove
  swayL:   { lean: -.08, hx: -.25, lSh: .5, lEl: -1.4, rSh: -.3, rEl: .3, lHip: .2, rHip: -.02, rKn: .25, skirt: .3, turn: -.2, head: -.08 },
  swayR:   { lean: .08, hx: .25, lSh: .3, lEl: -.3, rSh: -.5, rEl: 1.4, lHip: .02, rHip: -.2, lKn: -.25, skirt: .3, turn: .2, head: .08 },
  // hands and hearts
  heart:   { lSh: 2.5, lEl: -1.35, rSh: -2.5, rEl: 1.35, hL: 'open', hR: 'open', head: .12, lHip: .1, rHip: -.1, skirt: .2 },
  fheart:  { lSh: .7, lEl: -2.2, rSh: -.25, rEl: -.05, hL: 'heart', head: .15, lean: -.04, lHip: .12, rHip: -.12, turn: -.2 },
  peace:   { lSh: .3, lEl: -.1, rSh: -1.2, rEl: 2.3, hR: 'peace', head: -.12, lean: .05, lHip: .1, rHip: -.14, turn: .3 },
  wave:    { lSh: .2, lEl: 0, rSh: -2.6, rEl: .4, hR: 'open', lHip: .08, rHip: -.08 },
  // big moves
  jump:    { lSh: 2.8, lEl: .1, rSh: -2.8, rEl: -.1, hy: -1.4, lHip: .4, lKn: -.6, rHip: -.4, rKn: .6, skirt: 1 },
  crouch:  { lSh: .9, lEl: -1.6, rSh: -.9, rEl: 1.6, hy: 1.0, lHip: 1.0, lKn: -1.7, rHip: -1.0, rKn: 1.7, lean: .05, skirt: .4 },
  armsOut: { lSh: 1.55, lEl: 0, rSh: -1.55, rEl: 0, lHip: .18, rHip: -.18, skirt: .4 },
  cross:   { lSh: -.6, lEl: -1.9, rSh: .6, rEl: 1.9, head: -.1, lHip: .05, rHip: -.05 },
  bow:     { lean: .5, head: .3, lSh: -.3, lEl: -.2, rSh: .3, rEl: .2, lHip: -.2, rHip: .2, hy: .15 },
  stepF:   { lHip: -.3, lKn: .1, rHip: .12, rKn: .25, lSh: -.6, lEl: -.6, rSh: -.6, rEl: .6, lean: -.03 },
  stepB:   { lHip: .3, lKn: -.25, rHip: -.12, rKn: -.1, lSh: .6, lEl: -.4, rSh: .6, rEl: .4, lean: .03 },
  shrug:   { lSh: .9, lEl: -2.2, rSh: -.9, rEl: 2.2, hL: 'open', hR: 'open', head: .15, hy: .05 },
  mic:     { lSh: .3, lEl: -2.5, rSh: -.3, rEl: .2, hL: 'fist', head: -.05, lHip: .1, rHip: -.1, turn: -.15 },
  float:   { lSh: 1.9, lEl: .2, rSh: -1.9, rEl: -.2, lHip: .35, lKn: .5, rHip: -.1, rKn: .3, skirt: .8 },
};
// Moves: arrays of pose names, one per beat (cycled). 'hold' repeats the previous pose.
const MOVES = {
  pdoom:  ['pump1', 'pump2', 'pump3', 'point'],
  groove: ['swayL', 'swayR', 'swayL', 'swayR'],
  hearts: ['heart', 'fheart', 'heart', 'peace'],
  hype:   ['jump', 'crouch', 'armsOut', 'point'],
  fwdbwd: ['stepF', 'stepF', 'stepB', 'stepB'],
  idle:   ['stand', 'swayL', 'stand', 'swayR'],
  break:  ['armsOut', 'cross', 'peace', 'fheart', 'jump', 'crouch', 'swayL', 'point'],
};
// o: {offset (beats), snap (beats to reach the pose), delay (beats, for ripple/canon between dancers)}
function dance(t, move, o = {}) {
  const seq = MOVES[move] || [move], b = beatF(t) - (o.delay || 0) + (o.offset || 0);
  const n = Math.floor(b), p = b - n, snap = o.snap || .38;
  const name = i => { let k = ((i % seq.length) + seq.length) % seq.length; while (seq[k] === 'hold' && k > 0) k--; return seq[k]; };
  const cur = PZ[name(n)] || PZ.stand, prev = PZ[name(n - 1)] || PZ.stand;
  const k = easeOut(p / snap);
  const pose = mixPose({ ...POSE0, ...prev }, { ...POSE0, ...cur }, k);
  pose.hy = (pose.hy || 0) + Math.sin(clamp(p / snap) * Math.PI) * .12;   // a small bounce on every hit
  if (k < .5) { pose.hL = prev.hL || 'open'; pose.hR = prev.hR || 'open'; } else { pose.hL = cur.hL || 'open'; pose.hR = cur.hR || 'open'; }
  return pose;
}
// Clawd choreography: arms, squash, jump, lean driven by the same beat grid.
function clawdDance(t, move, i = 0, o = {}) {
  const b = beatF(t) - (o.delay || 0), n = Math.floor(b), p = b - n, hitK = Math.pow(1 - clamp(p / .3), 2);
  const r = { hat: CLAWD_HATS[i % 4], squash: hitK * .45 - clamp((p - .15) / .3) * (1 - clamp((p - .45) / .3)) * .15 };
  if (move === 'pdoom') { const s = ((n % 4) + 4) % 4; r.arms = s < 3 ? [s / 2.2, s / 2.2] : [0, 1.3]; r.jump = s === 3 ? bump(p) * 40 : 0; r.lean = s === 3 ? .12 : 0; }
  else if (move === 'groove') { const s = n % 2 ? 1 : -1; r.lean = s * .12; r.arms = [s > 0 ? .9 : .1, s > 0 ? .1 : .9]; r.step = b; }
  else if (move === 'hype') { r.jump = bump(p) * 70; r.arms = [1.2, 1.2]; r.eyes = 'happy'; }
  else if (move === 'fwdbwd') { r.step = b; r.arms = [.4, .4]; }
  else { r.step = b * .5; r.arms = [.2 + .2 * Math.sin(b * Math.PI), .2 - .2 * Math.sin(b * Math.PI)]; }
  return r;
}
