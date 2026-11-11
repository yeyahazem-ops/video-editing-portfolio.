#!/bin/bash
# tools/look.sh <episode> <cols> <tile-width> t1 t2 ...  -> out/look.png (draft stills of those times, tiled)
set -e
cd "$(dirname "$0")/.."
ep=$1; cols=$2; tw=$3; shift 3
echo "(function(){const E=$ep; if (typeof module!=='undefined') module.exports=E; else globalThis.EPISODE=E;})();" > episode.js
EPISODE=$ep node engine/render.js stills "$@" --draft | grep -v '^still' || true
args=(); n=0
for t in "$@"; do f=$(printf 'out/stills/t_%06.2f.png' "$t"); args+=(-i "$f"); n=$((n+1)); done
rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y "${args[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf '[%d:v]scale=%d:-1[v%d];' $i $tw $i; done)$(for i in $(seq 0 $((n-1))); do printf '[v%d]' $i; done)xstack=inputs=$n:layout=$(for i in $(seq 0 $((n-1))); do c=$((i%cols)); r=$((i/cols)); printf '%s' "$( [ $i -gt 0 ] && echo '|' )"; if [ $c -eq 0 ]; then printf '0'; else printf 'w0'; for k in $(seq 2 $c); do printf '+w0'; done; fi; printf '_'; if [ $r -eq 0 ]; then printf '0'; else printf 'h0'; for k in $(seq 2 $r); do printf '+h0'; done; fi; done):fill=white" -frames:v 1 out/look.png
