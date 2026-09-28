// Builds a three.js scene from build/model.json using real LDraw geometry (three.js LDrawLoader).
import * as THREE from 'three';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';

export async function createLibrary(libraryText, ldconfigUrl) {
  const loader = new LDrawLoader();
  loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
  loader.smoothNormals = true;
  await loader.preloadMaterials(ldconfigUrl);
  const cache = loader.partsCache.parseCache;
  const re = /^0 FILE (.+)$/gm;
  let m, blocks = [];
  while ((m = re.exec(libraryText))) blocks.push([m[1].trim(), m.index + m[0].length]);
  for (let i = 0; i < blocks.length; i++) {
    const end = i + 1 < blocks.length ? libraryText.lastIndexOf('0 NOFILE', blocks[i + 1][1]) : libraryText.length;
    cache.setData(blocks[i][0], libraryText.slice(blocks[i][1], end));
  }
  const templates = new Map();
  async function template(part, color) {
    const key = part + '|' + color;
    if (!templates.has(key)) templates.set(key, new Promise((res, rej) =>
      loader.parse(`1 ${color} 0 0 0 1 0 0 0 1 0 0 0 1 ${part}.dat\n`, g => res(g), rej)));
    return templates.get(key);
  }
  return { loader, template };
}

// returns { root, objects[] } ; objects[i] corresponds to model.parts[i]
export async function buildModel(lib, model, { edges = true } = {}) {
  const root = new THREE.Group();
  root.rotation.x = Math.PI; // LDraw y-down -> three y-up
  const objects = [];
  const combos = [...new Set(model.parts.map(p => p.part + '|' + p.color))];
  await Promise.all(combos.map(c => { const [p, col] = c.split('|'); return lib.template(p, col); }));
  for (const p of model.parts) {
    const t = await lib.template(p.part, p.color);
    const o = t.clone();
    const R = p.R, P = p.pos;
    const mat = new THREE.Matrix4().set(R[0], R[1], R[2], P[0], R[3], R[4], R[5], P[1], R[6], R[7], R[8], P[2], 0, 0, 0, 1);
    o.matrixAutoUpdate = false;
    o.matrix.copy(mat);
    o.traverse(c => { if (c.isLineSegments) c.visible = edges; if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    o.userData.part = p;
    root.add(o);
    objects.push(o);
  }
  return { root, objects };
}
