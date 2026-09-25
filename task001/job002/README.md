# job002: SON TUNG M-TP x TYGA, "Come My Way" (waiting for its source)

This job uses the same engine as job001 ([`../common`](../common)).

Source: https://www.youtube.com/watch?v=SlQR9iu09bQ (official music video).

**Status:** blocked on the source video. Neither the Google Drive copy nor YouTube can be downloaded from this environment:
the network policy blocks `drive.google.com`, `drive.usercontent.google.com`, `youtube.com` and `googlevideo.com` (proxy 403).

To start, put the source (MP4 or its audio) into `job002/source/` in this branch, or give a GitHub-hosted link
(GitHub is reachable). Then:

```bash
ffmpeg -i source/<video>.mp4 -vn -c:a libmp3lame -q:a 0 audio/song.mp3   # the exact audio track
# job.json: {"title": "...", "audio": "audio/song.mp3", "dur": <seconds>}
python3 ../common/tools/analyze_audio.py .
```
