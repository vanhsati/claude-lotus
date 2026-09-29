# Nhà thờ Lớn Hà Nội (St. Joseph's Cathedral, Hanoi)

A buildable LEGO design of the cathedral at about 1:100: 2,805 pieces in 114 lots, 227 build steps, 32 × 64 studs, towers about 34 cm tall.

What moves: two gold bells in each tower swing when you turn the wheel behind the tower, the four portal doors open on swivel hinges, and the whole nave roof (121 pieces) lifts off to show the pews, arcade and altar. The 450+ stained-glass pieces are transparent, ready for an LED kit.

| Path | What |
|---|---|
| `index.html` | Interactive 3D viewer with build steps, bells, doors and roof |
| `instructions/Hanoi-Cathedral-Instructions.pdf` | 121-page instruction manual |
| `parts/bricklink-wanted-list.xml` | Upload at BrickLink (Want > Upload) |
| `parts/rebrickable-parts.csv`, `parts/parts-list.csv`, `parts/parts-list.md` | Parts lists |
| `hanoi-cathedral.mpd` | Self-contained LDraw model (BrickLink Studio, LDCad, LeoCAD) |
| `model/hanoi-cathedral.ldr` | Same model with building steps, needs an LDraw library |
| `renders/` | Rendered views |
| `generator/` | Python generator, render and manual scripts (see `generator/*.py` docstrings) |

This model uses its own Python generator rather than the shared `lib/` tools. `generator/design.py` builds the model on a stud grid with collision and connectivity checks, `export.py` writes the LDraw files and parts lists, `hero.py`, `steps_render.py` and `thumbs.py` render with three.js, `manual.py` builds the PDF, and `build_site.py` assembles this folder.
