#!/bin/sh
# sh tools/make.sh ep02 — voices, timeline, music, 60 fps video, mux, then copy the result next to the episode
set -e
cd "$(dirname "$0")/.."
node tools/voice.js "$1"
node tools/use.js "$1"
node song.js
node engine/render.js video
node engine/render.js mux
cp out/tota-shorts.mp4 "episodes/$1/$1.mp4"
echo "done: episodes/$1/$1.mp4"
