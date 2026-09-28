const intro = `<h2>A British Shorthair, life size</h2>
<div class="cols"><div>
<p>This sculpture is built from a photograph of a blue-grey tabby British Shorthair: round face, full cheeks, amber eyes, a pink nose and a peach collar with a red buckle. It sits upright with its tail curled round on the floor boards.</p>
<p>The head is about 12 studs (9.6 cm) wide, close to a real cat's. Every voxel is one stud wide and one plate high, so the tabby stripes, the eyes and the white muzzle are coloured into the bricks rather than printed or stickered.</p>
</div><div>
<h3>What this model does</h3>
<ul>
<li><b>Turning head.</b> The head, from the collar up, sits on a 4 × 4 turntable hidden in the neck. The top of the body is finished with smooth tiles, so the head can turn left and right and glance over its shoulder.</li>
<li><b>Hollow build.</b> The body is a two-stud-thick shell around a hidden support column, which keeps it light and saves pieces.</li>
</ul>
<p class="dim">Footprint 24 × 24 studs (19 × 19 cm); height about 23 cm.</p>
</div></div>`;
export default {
  pdfName: 'British-Shorthair-Cat-Instructions.pdf',
  manual: {
    kicker: 'Brick sculpture', h1: 'Mèo Anh lông ngắn', h2: 'British Shorthair Cat',
    dir: [0.45, 0.55, 1],
    stepDir: s => null,
    coverView: { dir: [0.35, 0.3, 1], zoom: 0.8 },
    finishImage: 'turned.png',
    introPages: [['text', intro]],
    async images(r, { model, IMG, all }) {
      await r.page.evaluate(() => window.setMoving && window.setMoving('head', 35));
      await r.save(`${IMG}turned.png`, { ...all, size: [1200, 1000], dir: [0.5, 0.35, 1], zoom: 0.8 });
      await r.page.evaluate(() => window.setMoving && window.setMoving('head', 0));
    },
  },
  renders: {
    'hero-front.png': { size: [2000, 2400], dir: [0.3, 0.25, 1], zoom: 0.72 },
    'three-quarter.png': { size: [2000, 2000], dir: [0.9, 0.35, 1], zoom: 0.75 },
    'side.png': { size: [2000, 2000], dir: [1, 0.15, 0.02], zoom: 0.75 },
    'back.png': { size: [2000, 2000], dir: [-0.6, 0.35, -1], zoom: 0.75 },
    'face-closeup.png': { size: [1800, 1500], dir: [0.1, 0.1, 1], zoom: 0.36, target: [240, 180, 300] },
    'with-edges-instructions-style.png': { bg: '#ffffff', edges: true, size: [1800, 2000], dir: [0.45, 0.4, 1], zoom: 0.75 },
  },
  async extraRenders(r, { out, all }) {
    await r.page.evaluate(() => window.setMoving('head', 35));
    await r.save(out + 'head-turned.png', { ...all, size: [2000, 2000], dir: [0.3, 0.25, 1], zoom: 0.72 });
    await r.page.evaluate(() => window.setMoving('head', 0));
  },
};
