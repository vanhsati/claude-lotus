# task003: LEGO models

Custom LEGO models, each designed in code from real LDraw part geometry. Open [`index.html`](index.html) for the gallery (online: https://vanhsati.github.io/claude-lotus/task003/).

| Model | Pieces | What moves |
|---|---:|---|
| [Chùa Một Cột (One-Pillar Pagoda)](pagoda/) | 1,366 | Crank turns the Quan Âm statue; door opens; roof lifts off |
| [Mèo Anh lông ngắn (British Shorthair Cat)](cat/) | 1,829 | Head turns on a hidden turntable |
| [Nhà thờ Lớn Hà Nội (St. Joseph's Cathedral)](cathedral/) | 2,805 | Bells swing; four portal doors open; nave roof lifts off |

The pagoda and the cat share the layout below; the cathedral was made with its own Python generator and describes its folder in [`cathedral/README.md`](cathedral/README.md). Shared-tool layout: `model/` (generator), `project.mjs` (manual text, render angles), `build/` (model JSON, LDraw MPD, check report), `parts/` (BrickLink XML, Rebrickable CSV, parts list), `renders/`, `instructions/` (PDF), `viewer.template.html` and `index.html` (interactive 3D).

## Shared tools

| Path | Purpose |
|---|---|
| `lib/builder.mjs` | Places parts on the stud grid, greedy plate and brick fills, build steps and sub-models |
| `lib/voxel.mjs` | Voxel sculpture to bricks (used by the cat), with overhang-aware plate placement |
| `lib/ldraw.mjs`, `lib/output.mjs`, `lib/catalog.mjs` | LDraw geometry reader, MPD/JSON writer, BrickLink and LEGO colour names |
| `tools/fetch_ldraw.mjs` | Downloads part geometry from the LDraw library mirror into `ldraw/` (git-ignored) |
| `tools/check.mjs` | Collision and connectivity check |
| `tools/bom.mjs`, `tools/render.mjs`, `tools/manual.mjs`, `tools/bundle-viewer.mjs` | Parts lists, renders, PDF manual, self-contained 3D viewer |
| `tools/gallery.mjs` | Regenerates this folder's `index.html` |

Every tool works on one model, chosen with `PROJECT=<folder>` (default `pagoda`):

```sh
cd task003 && npm install
PROJECT=cat node tools/check.mjs -v
node tools/gallery.mjs
```
