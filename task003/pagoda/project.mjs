// Project settings for the shared tools (manual, renders, viewer bundle).
const intro = `<h2>The lotus rising from the pond</h2>
<div class="cols"><div>
<p>In 1049 Emperor <b>Lý Thái Tông</b> dreamed that the bodhisattva <b>Quan Âm</b> (Avalokiteśvara), seated on a lotus, handed him a baby son. On the advice of the monk Thiền Tuệ he raised a single stone pillar in the middle of a lotus pond and set a small wooden shrine on top, so that the whole building would look like a lotus flower growing out of the water.</p>
<p>The shrine, <b>Liên Hoa Đài</b> ("Lotus Platform"), is about 3 × 3 m. It rests on a stone pillar 1.2 m across that stands about 4 m above the <b>Linh Chiểu</b> pond; eight curved beams spread from the pillar like petals. Thirteen steps lead up from the bank. On the ridge of the roof, two dragons face the moon — <i>lưỡng long chầu nguyệt</i>.</p>
<p>French Union forces blew the pagoda up on 11 September 1954; it was rebuilt in 1955 to the traditional design. The bodhi tree in the garden grew from a cutting of the tree at Bodh Gaya, a gift from India's President Rajendra Prasad (1958–59).</p>
</div><div>
<h3>What this model does</h3>
<ul>
<li><b>Turning Quan Âm.</b> Turn the crank wheel on the right side of the base. A worm gear hidden under the pond drives a 16-stud axle that runs up through the hollow stone pillar and turns the gilded statue on her lotus throne — 24 turns of the crank for one full turn of the statue, and the worm holds her in place when you let go.</li>
<li><b>Opening door.</b> The front door swings inwards on real hinges.</li>
<li><b>Lift-off roof.</b> The roof is a separate module; lift it off to look into the shrine.</li>
<li><b>Glazed balustrade, lotus pond and courtyard</b> paved with Bát Tràng-style terracotta, with a bodhi tree, a frangipani in flower, stone lanterns and an incense urn.</li>
</ul>
<p class="dim">Scale about 1:37 (minifigure scale). Footprint 32 × 40 studs (25.6 × 32 cm); height about 35 cm.</p>
</div></div>`;
const how = `<h2>How it works</h2><div class="cols"><div><img class="figure" src="img/mechanism.png"><p class="dim">Crank → worm → 24-tooth gear → axle through the pillar → lotus throne.</p></div>
<div><img class="figure" src="img/roof-off.png"><p class="dim">Roof lifted off: the statue turns inside the shrine.</p></div></div>
<h3>Before you start</h3><ul><li>Sort the pieces by bag. The parts list at the back gives BrickLink numbers and colours.</li>
<li>Bag 1 builds the drive. The long black axle stands up out of the base until the pillar is built around it — build carefully around it.</li>
<li>Faded parts in the pictures were placed in earlier steps; parts in full colour are new in this step.</li></ul>`;

const mechanismHidden = model => model.parts.map((p, i) =>
  (p.moving === 'crank' || p.moving === 'drive' || p.moving === 'statue' || model.steps[p.step].bag === 1) ? null : i).filter(i => i !== null);

export default {
  pdfName: 'One-Pillar-Pagoda-Instructions.pdf',
  manual: {
    kicker: 'Hà Nội · 1049', h1: 'Chùa Một Cột', h2: 'One-Pillar Pagoda',
    dir: [-0.7, 0.8, 1.2],
    stepDir: s => s.sub === 'Roof' ? [-0.6, 1.1, 1] : s.sub ? null : s.bag === 1 ? [-0.9, 1.0, 0.8] : s.bag === 7 ? [-0.6, 0.9, 1.0] : null,
    coverView: { dir: [-0.75, 0.55, 1.1], zoom: 0.78 },
    finishImage: 'back.png',
    introPages: [['text', intro], ['text', how]],
    async images(r, { model, IMG, all }) {
      await r.save(`${IMG}back.png`, { ...all, size: [1200, 1000], dir: [0.8, 0.6, -1], zoom: 0.8 });
      await r.save(`${IMG}roof-off.png`, { ...all, size: [1200, 1000], dir: [-0.4, 1.3, 1], zoom: 0.42, target: [320, 380, 300], hideMoving: ['roof'] });
      await r.page.evaluate(ids => { window.__hide = new Set(ids); }, mechanismHidden(model));
      await r.save(`${IMG}mechanism.png`, { ...all, size: [1200, 1000], dir: [-1, 0.5, 0.7], zoom: 0.6, onlyMechanism: true });
    },
  },
  renders: {
    'hero-front.png': { size: [2400, 1800], dir: [-0.75, 0.5, 1.1], zoom: 0.72 },
    'front-elevation.png': { size: [1800, 2000], dir: [0, 0.12, 1], zoom: 0.7, fov: 18 },
    'back-left.png': { size: [2000, 1500], dir: [0.9, 0.55, -0.9], zoom: 0.75 },
    'shrine-closeup.png': { size: [1800, 1500], dir: [-0.5, 0.35, 1], zoom: 0.33, target: [320, 470, 300] },
    'roof-ridge-dragons.png': { size: [1800, 1100], dir: [0.1, 0.45, 1], zoom: 0.16, target: [320, 690, 300] },
    'roof-lifted.png': { size: [1800, 1500], dir: [-0.4, 1.2, 1], zoom: 0.42, target: [320, 380, 300], hideMoving: ['roof'] },
    'top-down.png': { size: [1800, 2100], dir: [0.001, 1, 0.02], zoom: 0.66, fov: 20 },
    'with-edges-instructions-style.png': { bg: '#ffffff', edges: true, size: [2000, 1500], dir: [-0.75, 0.55, 1.1], zoom: 0.75 },
  },
  async extraRenders(r, { model, out, all }) {
    await r.page.evaluate(ids => { window.__hide = new Set(ids); }, mechanismHidden(model));
    await r.save(out + 'drive-mechanism.png', { ...all, edges: true, size: [1800, 1400], dir: [-1, 0.5, 0.7], zoom: 0.55, onlyMechanism: true });
  },
};
