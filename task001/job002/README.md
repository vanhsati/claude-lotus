# job002: COME MY WAY, Sơn Mài Cut

A new animated video for *Come My Way* (Sơn Tùng M-TP × Tyga), for internal use, on the original MV's audio track.
Every frame is drawn in canvas code on the shared engine in [`../common`](../common). The whole video is a Vietnamese
lacquer painting (*sơn mài*) that comes alive: black and cinnabar lacquer, gold and silver leaf, eggshell inlay. Scenes
change by being **sanded** open, the way real sơn mài is made.

* **[DIRECTION.md](DIRECTION.md)**: concept, palette, audio map (110 BPM) and the shot list.
* `video/come_my_way_son_mai.mp4`: the finished video, 1080p30, 3:54.6.

## What's here

| Path | What it is |
|---|---|
| `job.json` | Audio, duration, pinned beat grid (110 BPM, beat 0 at 0.291 s) and the lyrics file |
| `studio.html` | The page every frame is painted in |
| `src/job.js` | Engine settings: no riso sheet marks, the lacquer finish, áo dài shoulders for idol close-ups |
| `src/lacquer.js` | The sơn mài library: materials (lacquer, gold/silver leaf, eggshell), sanding reveal, inlaid type, and assets (time machine, silver Clawd, masked dancers, karst river and red disc, buffalo, pagoda gate, wall-of-death drum) |
| `src/lyrics.js` | Loads `window.LY_LOCAL` from `src/lyrics.local.js` (generated, not in the repo) |
| `tools/make_lyrics.py` | Generates `src/lyrics.local.js` from the uploaded lyrics file, snapping each line to the vocal onset |
| `src/scenes/` | `p_prologue` · `v_verse1` · `h_hook1` · `d_post1` · `r_rap` · `h2_hook2` · `d2_finale` · `o_outro` |
| `source/` | The uploaded MV (4 parts + `join.sh`), MP3 and lyrics |
| `audio/song.m4a` | The MV's AAC audio track (used for the video) |

## Rendering

```bash
cd task001/common && npm install
python3 ../job002/tools/make_lyrics.py                                     # lyrics timing (needs librosa)
node tools/render.mjs --job=job002 --frames=0:234.61 --workers=4          # paint into job002/out/frames
node tools/render.mjs --job=job002 --encode --out=out/come_my_way.mp4
```

The characters are original designs: the sunflower-crowned Claude idol from job001 in an áo dài and nón lá, a silver-leaf
Clawd for the rap, and masked dancers. No real people are drawn.
