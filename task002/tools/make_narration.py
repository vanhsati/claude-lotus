"""Records the narration with a neural Vietnamese voice (edge-tts) into narration/.

The page picks up narration/manifest.json automatically and uses the recordings instead of the
device voice. Usage, from task002/:
    node tools/export_cues.mjs
    python3 -m pip install edge-tts
    python3 tools/make_narration.py [--voice vi-VN-HoaiMyNeural] [--rate -6%]
Needs network access to speech.platform.bing.com. Durations are read with ffprobe.
"""
import argparse, asyncio, json, os, subprocess
import edge_tts

ap = argparse.ArgumentParser()
ap.add_argument("--voice", default="vi-VN-HoaiMyNeural")
ap.add_argument("--rate", default="-6%")
args = ap.parse_args()

cues = json.load(open("tools/cues.json", encoding="utf-8"))
os.makedirs("narration", exist_ok=True)

def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 2)

async def main():
    manifest = {"voice": args.voice, "cues": []}
    for c in cues:
        path = f"narration/{c['i']:03d}.mp3"
        if not os.path.exists(path):
            await edge_tts.Communicate(c["text"], args.voice, rate=args.rate).save(path)
        manifest["cues"].append({"text": c["text"], "file": path, "dur": duration(path)})
        print(path, manifest["cues"][-1]["dur"])
    json.dump(manifest, open("narration/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

asyncio.run(main())
