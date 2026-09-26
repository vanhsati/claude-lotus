# job003: KHUÔN MẶT ĐÁNG THƯƠNG, Lụa & Neon

A new animated video for *Khuôn Mặt Đáng Thương* (Sơn Tùng M-TP, 2015), for internal use, on the uploaded audio.
Every frame is drawn in canvas code on the shared engine in [`../common`](../common). Two textures fight: **lụa**
(silk painting: the memory, verses) and **neon** (a wet night street: the present, choruses). The silk tears, dissolves
and drips into neon and back.

* **[DIRECTION.md](DIRECTION.md)**: concept, palette, audio map (95 BPM) and the shot sketch.
* `video/khuon_mat_dang_thuong_lua_neon.mp4`: the finished video, 1080p30, 4:14.8.

## What's here

| Path | What it is |
|---|---|
| `job.json` | Audio, duration, pinned beat grid (95 BPM, beat 0 at 0.310 s) |
| `studio.html` | The page every frame is painted in |
| `src/job.js` | Engine settings: no riso sheet marks, the silk/neon finish |
| `src/silk.js` | The material library: silk, watercolour washes, ink, brushed type, neon tubes and type, wet reflections, rain, tear/dissolve/drip transitions, the silk and neon idol face, the porcelain mask, the shedding flower |
| `src/hooks.js` | When "khuôn mặt đáng thương" and "cánh hoa úa tàn" are sung (the big title moments) and the vocal ranges |
| `src/lyrics.js` | Loads `window.LY_LOCAL` from `src/lyrics.local.js` (generated, not in the repo) |
| `tools/make_lyrics.py` | Generates `src/lyrics.local.js` from `source/lyrics.local.txt` (the correct lyrics, one line per row, not in the repo), timing lines on the bar grid and snapping them to vocal onsets |
| `src/scenes/` | `s1_intro` · `s2_verse1` · `s3_chorus1` · `s4_verse2` · `s5_chorus2` · `s6_breakdown` · `s7_drop` · `s8_outro` |

## Sections

| Time | Section | Look |
|---|---|---|
| 0–33.2 | Intro | A silk scroll unrolls; the idol's face is painted in ink, a tear blooms; neon bleeds through the back of the silk |
| 33.2–64.7 | Verse 1 | Watercolour lakeside at night, lamplight, a shared umbrella; lyrics inscribed in the margins |
| 64.7–86.3 | Chorus 1 | The silk tears open onto the neon street; the face in neon tubes; KHUÔN MẶT ĐÁNG THƯƠNG in neon |
| 86.3–125.3 | Verse 2 | Neon drips back into silk; split screen of memory and present; the fast middle as brushed fragments |
| 125.3–146.2 | Chorus 2 | A rainy neon street with shop signs; the porcelain mask cracks and shatters |
| 146.2–186.0 | Breakdown | "Cánh hoa úa tàn": one silk-painted lotus sheds petals into water |
| 186.0–227.7 | Final drop | Neon over silk: the face in both media, the infinity sign, the couple under the umbrella |
| 227.7–254.8 | Outro | The neon switches off; the silk face returns; credits |

## Rendering

```bash
cd task001/common && npm install
python3 ../job003/tools/make_lyrics.py                                   # needs source/lyrics.local.txt + librosa
node tools/render.mjs --job=job003 --frames=0:254.82 --workers=3 --recycle=300
node tools/render.mjs --job=job003 --encode --out=out/khuon_mat_dang_thuong.mp4
```

The idol is the original sunflower-crowned character from job001/job002. No real people are drawn.
