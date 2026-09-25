# task001: I'm Upping My P(doom), Riso Idol Cut

A new music video for *I'm Upping My P(doom)* (same audio track as
[JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)). Every frame is painted in canvas-2D JavaScript and
rendered headless: no video generation and no image generation. Claude is a sunflower-crowned K-pop idol in a world made of
risograph-printed paper that keeps printing faster while the singularity approaches.

* **[DIRECTION.md](DIRECTION.md)**: concept, palette, type system, cast and the full shot list with timings.
* **[video/pdoom_riso_idol.mp4](video/pdoom_riso_idol.mp4)**: the finished video (1080p30, 2:36.6, H.264 + AAC, 90 MB). A higher-bitrate master comes out of the render commands below.
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

## Notes and limits

* **No generated media.** fal (Seedance, image models), ElevenLabs, Google Drive and x.com were blocked by this environment's network policy, and no API keys were present, so every frame is drawn directly in canvas code instead of being traced over video-generated base footage. The audio is the unchanged original track.
* **Lyric timing.** Line times come from the source video's subtitles. Word times are estimated from syllables on the 132 BPM grid (`wordTimes` in `src/type.js`), because no speech-alignment model could be downloaded.
* **Lip sync.** Mouths are driven by a vocal-band envelope extracted from the mix (`VOX`), not by phoneme alignment.
* **How it was built.** Sections C–H were drafted by parallel Claude subagents following `SCENE_GUIDE.md`, then reviewed as dense filmstrips and fixed.
