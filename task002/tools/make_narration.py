"""Records the narration with a neural Vietnamese voice (edge-tts) into narration/.

The page picks up narration/manifest.json automatically and uses the recordings instead of the
device voice. Usage, from task002/:
    node tools/export_cues.mjs
    python3 -m pip install edge-tts mutagen
    python3 tools/make_narration.py [--voice vi-VN-HoaiMyNeural] [--rate -6%]
Needs network access to speech.platform.bing.com. Durations are read with mutagen, or ffmpeg when mutagen is missing.
Set SSL_CERT_FILE when HTTPS goes through a proxy with its own CA.
"""
import argparse, asyncio, glob, json, os, re, shutil, ssl, subprocess
import edge_tts
import edge_tts.communicate

# edge-tts pins certifi's CA list; honour SSL_CERT_FILE so it works behind a TLS-inspecting proxy.
if os.environ.get("SSL_CERT_FILE"):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])
FFMPEG = shutil.which("ffmpeg") or next(iter(glob.glob("/opt/pw-browsers/ffmpeg-*/ffmpeg-linux")), "ffmpeg")

ap = argparse.ArgumentParser()
ap.add_argument("--voice", default="vi-VN-HoaiMyNeural")
ap.add_argument("--rate", default="-6%")
args = ap.parse_args()

cues = json.load(open("tools/cues.json", encoding="utf-8"))
os.makedirs("narration", exist_ok=True)

def duration(path):
    try:
        from mutagen.mp3 import MP3  # python3 -m pip install mutagen
        return round(MP3(path).info.length, 2)
    except ImportError:
        pass
    out = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    return round(int(h) * 3600 + int(m) * 60 + float(sec), 2)

async def main():
    manifest = {"voice": args.voice, "cues": []}
    for c in cues:
        path = f"narration/{c['i']:03d}.mp3"
        if not os.path.exists(path) or os.path.getsize(path) == 0:
            await edge_tts.Communicate(c["text"], args.voice, rate=args.rate, proxy=os.environ.get("HTTPS_PROXY")).save(path)
        manifest["cues"].append({"text": c["text"], "file": path, "dur": duration(path)})
        print(path, manifest["cues"][-1]["dur"])
    json.dump(manifest, open("narration/manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

asyncio.run(main())
