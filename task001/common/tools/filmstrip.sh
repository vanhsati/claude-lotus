#!/bin/bash
# Dense filmstrip for reviewing motion: common/tools/filmstrip.sh JOB START END STEP NAME [COLS]
# Renders stills every STEP seconds at 1/4 scale and tiles them into JOB/out/strips/NAME.jpg
set -e
T="$(cd "$(dirname "$0")" && pwd)"
JOB=$1; S=$2; E=$3; STEP=$4; NAME=$5; COLS=${6:-8}
cd "$T/../../$JOB"
TS=$(python3 -c "import numpy as np; print(','.join(f'{x:.3f}' for x in np.arange($S,$E,$STEP)))")
rm -rf out/strip_$NAME; node $T/render.mjs --job=$JOB --stills=$TS --scale=.25 --dir=strip_$NAME 2>&1 | grep -iv "404\|^/home" || true
mkdir -p out/strips; python3 $T/contact.py out/strip_$NAME/t_*.jpg -o out/strips/$NAME.jpg --cols $COLS --w 240
