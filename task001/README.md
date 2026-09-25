# task001: I'm Upping My P(doom), Riso Idol Cut

A new music video for *I'm Upping My P(doom)* (same audio track as
[JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)). Every frame is painted in canvas-2D JavaScript and
rendered headless: no video generation and no image generation. Claude is a sunflower-crowned K-pop idol in a world made of
risograph-printed paper that keeps printing faster while the singularity approaches.

* **[DIRECTION.md](DIRECTION.md)**: concept, palette, type system, cast and the full shot list with timings.
* **[SCENE_GUIDE.md](SCENE_GUIDE.md)**: the engine's API and style rules for painting scenes.

## What's here

| Path | What it is |
|---|---|
| `studio.html` | The page every frame is painted in (`?t=12.3` shows a still, `?play` previews with audio) |
| `src/core.js` | Time, beat grid, audio envelopes, paper cut-outs, riso ink, halftone, camera |
| `src/type.js` | Fonts, riso text, stamped words, lyric word timing, captions |
| `src/frame.js` | Shot registry, paper transitions (tear, feed, flip, misregistration jolt), print finish, slug clock |
| `src/chars/` | The idol (head + rig), choreography, the Clawd backup dancers, NEXT, the Kid, the shoggoth |
| `src/props.js` | P(doom) meter, xerox headlines, posts, rubber stamps, tape, sticky notes, confetti |
| `src/scenes/` | One file per section, `a_hook.js` … `j_finale.js`, plus the shared stage |
| `src/audio_data.js` | Kick / snare / hat / level / vocal envelopes at 60 Hz (from `tools/analyze_audio.py`) |
| `tools/render.mjs` | Headless Chromium frame painter and ffmpeg encoder |
| `tools/filmstrip.sh`, `tools/contact.py` | Review tools: dense filmstrips and contact sheets |
| `audio/pdoom.mp3` | The song |

## Rendering

Needs Node 18+, Chromium (Playwright's build is picked up from `/opt/pw-browsers`, or pass `--chrome=`) and ffmpeg.

```bash
cd task001
npm install
node tools/render.mjs --frames=0:156.65 --workers=4     # paint every frame into out/frames (resumable)
node tools/render.mjs --encode --out=out/pdoom_riso_idol.mp4
```

Audio analysis and fonts are already checked in. To regenerate them, run `python3 tools/analyze_audio.py` (needs librosa)
and `python3 tools/fetch_fonts.py`.
