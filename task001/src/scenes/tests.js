// tests.js: development pages (not part of the video). Render with: node tools/render.mjs --test=charsheet
window.TESTS = window.TESTS || {};
TESTS.charsheet = t => {
  T = t; sheet(PAL.paper);
  rtext('CLAUDE / CHARACTER SHEET', 60, 90, { font: FONT.hero(64), color: PAL.ink, mis: [4, 3, PAL.pink] });
  idolHead(330, 420, 150, { bust: true, mouth: 0, eyes: 'open' });
  idolHead(760, 360, 90, { turn: .6, mouth: .7, eyes: 'open', look: [.6, 0] });
  idolHead(760, 660, 90, { turn: -.5, eyes: 'wink', mouthShape: 'grin' });
  idolHead(1000, 360, 70, { eyes: 'star', mouth: .3, mouthShape: 'o' });
  idolHead(1000, 620, 70, { eyes: 'red', brow: 1, mouthShape: 'flat' });
  idolHead(1000, 860, 70, { eyes: 'spiral', mouth: .4, sweat: .5 });
  idolBody(1320, 720, 34, {});
  idolBody(1560, 720, 34, { lSh: 2.6, lEl: .3, rSh: -.6, rEl: -1.2, hL: 'point', lHip: .25, rHip: -.05, rKn: .1, lean: -.08, skirt: .6, turn: .3 });
  for (let i = 0; i < 4; i++) clawd(1230 + i * 150, 1010, 110, { hat: CLAWD_HATS[i], arms: [i % 2, (i + 1) % 2], eyes: ['open', 'happy', 'heart', 'shades'][i], squash: i === 2 ? .4 : 0 });
  clawd(420, 1010, 120, { hardhat: true, eyes: 'happy', arms: [1, 0] });
};
TESTS.cast = t => {
  T = t; sheet(PAL.paper);
  nextSun(420, 480, 190, { crown: true });
  kid(1000, 900, 1.3, {}); kid(1250, 1060, .5, {look: 1});
  shoggoth(1500, 420, 220, { mask: .35 });
  meter(1780, 900, .8, 47);
  headline(1350, 850, 560, 'AI proves finite-time blowup for 3D Navier–Stokes', { kicker: 'sep 8 2026 · lean-verified', big: 44 });
  stamp(700, 180, 'OBSOLETE', t, t - 1, { size: 80 });
};
TESTS.dance = t => {
  T = t; sheet(PAL.paper);
  const ts = [0, .5, 1, 1.5, 2, 2.5];
  const moves = ['pdoom', 'groove', 'hearts', 'hype'];
  moves.forEach((m, j) => ts.forEach((dt, i) => {
    const tt = 23 + j * 4 + i * BEAT * .98;
    withT(0, 0, 0, 1, () => idolBody(150 + i * 300, 210 + j * 260, 13, dance(tt, m), { face: { mouth: .3 } }));
  }));
};
