# job003: Khuôn Mặt Đáng Thương, Lụa & Neon (in progress)

Same engine as job001/job002 ([`../common`](../common)). See [DIRECTION.md](DIRECTION.md) for the concept
(silk painting vs neon), the audio map (95 BPM) and the shot sketch.

* `source/`: uploaded audio and lyrics. The uploaded lyrics file is an auto-generated transcript, so its **timestamps**
  are used but its text is not shown on screen until the correct lyrics are supplied as `source/lyrics.txt`
  ("mm:ss line" per line); `tools/make_lyrics.py` then generates `src/lyrics.local.js` (gitignored).
* `src/silk.js`: the silk + neon material library.
