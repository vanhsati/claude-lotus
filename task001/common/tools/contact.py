# Tiles stills into a labelled contact sheet: python3 tools/contact.py out/stills/t_*.jpg -o out/sheet.jpg --cols 4
import sys, argparse
from PIL import Image, ImageDraw, ImageFont
ap = argparse.ArgumentParser(); ap.add_argument('files', nargs='+'); ap.add_argument('-o', default='out/sheet.jpg'); ap.add_argument('--cols', type=int, default=4); ap.add_argument('--w', type=int, default=480)
a = ap.parse_args()
ims = [Image.open(f).convert('RGB') for f in a.files]
w = a.w; h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * w, rows * (h + 22)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, a.files)):
    x, y = (i % a.cols) * w, (i // a.cols) * (h + 22)
    sheet.paste(im.resize((w, h)), (x, y + 22)); d.text((x + 6, y + 4), f.split('/')[-1], fill=(230, 230, 230))
sheet.save(a.o, quality=90); print(a.o)
