# common: the shared paper/riso video engine

Everything reusable across music-video jobs. Each job is a sibling folder (`../job001`, `../job002`, …) holding its
own audio, lyrics, settings and scenes, and loading this engine from `../common`.

| Path | What it is |
|---|---|
| `src/core.js` | Time, beat grid (from the job's audio analysis), audio envelopes, paper cut-outs, riso ink, halftone, camera |
| `src/type.js` | Fonts, riso text, stamped words, lyric word timing, captions |
| `src/frame.js` | Shot registry, paper transitions (tear, feed, flip, misregistration jolt), print finish, slug clock (`window.JOB`) |
| `src/props.js` | Xerox headlines, posts, rubber stamps, tape, sticky notes, confetti, spark bursts |
| `src/chars/` | The Claude idol (head + rig), choreography, the Clawd dancers, NEXT, the Kid, the shoggoth |
| `fonts/` | Local Google Fonts (`tools/fetch_fonts.py`) |
| `tools/render.mjs` | Headless Chromium frame painter and ffmpeg encoder (`--job=<folder>`) |
| `tools/analyze_audio.py` | Writes `<job>/src/audio_data.js` from `<job>/job.json` |
| `tools/filmstrip.sh`, `tools/contact.py` | Review tools |
| `SCENE_GUIDE.md` | API and style rules for writing a job's scenes |

## A new job

1. Create `task001/jobNNN/` with `job.json` (`{"title", "audio", "dur"}`, plus optional `beat`, `offset`, `bar_phase` to pin the grid) and the audio file.
2. `python3 common/tools/analyze_audio.py jobNNN` writes `jobNNN/src/audio_data.js`.
3. Copy `job001/studio.html`, then write `src/job.js`, `src/lyrics.js` and `src/scenes/manifest.js` plus the scene files.
4. `cd common && npm install && node tools/render.mjs --job=jobNNN --frames=0:<dur>`, then `--encode`.
