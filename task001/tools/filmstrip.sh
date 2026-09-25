#!/bin/bash
# Dense filmstrip for reviewing motion: tools/filmstrip.sh START END STEP NAME [COLS]
# Renders stills every STEP seconds at 1/4 scale and tiles them into out/strips/NAME.jpg
set -e
cd "$(dirname "$0")/.."
S=$1; E=$2; STEP=$3; NAME=$4; COLS=${5:-8}
TS=$(python3 -c "import numpy as np; print(','.join(f'{x:.3f}' for x in np.arange($S,$E,$STEP)))")
rm -rf out/strip_$NAME; node tools/render.mjs --stills=$TS --scale=.25 --dir=strip_$NAME 2>&1 | grep -iv "404\|^/home" || true
mkdir -p out/strips; python3 tools/contact.py out/strip_$NAME/t_*.jpg -o out/strips/$NAME.jpg --cols $COLS --w 240
