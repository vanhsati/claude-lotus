#!/usr/bin/env bash
# Ghép lại file gốc. Chạy: bash join.sh [dest]
set -euo pipefail
cd "$(dirname "$0")"
dest="${1:-YTSave_YouTube_Media_SlQR9iu09bQ_SON-TUNG-M-TP-x-TYGA-COME-MY-WAY-OFFICIAL-MUSIC-VIDEO_001_1080p.mp4}"
cat "YTSave_YouTube_Media_SlQR9iu09bQ_SON-TUNG-M-TP-x-TYGA-COME-MY-WAY-OFFICIAL-MUSIC-VIDEO_001_1080p.mp4".part_* > "$dest"
echo "ghép xong -> $dest"
have=$(shasum -a 256 "$dest" | awk '{print $1}')
if [ "$have" = "26d91f90289514afd7623997896c402b49fbef0f69cc43c5307dfbeea854fd25" ]; then echo "sha256 OK"; else echo "SHA256 LỆCH! mong đợi 26d91f90289514afd7623997896c402b49fbef0f69cc43c5307dfbeea854fd25, nhận $have" >&2; exit 1; fi
