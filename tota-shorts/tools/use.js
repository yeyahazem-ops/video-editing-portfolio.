// node tools/use.js ep02 — make episode ep02 the current one (copies its script, timing, beats and film in).
const fs = require('fs'), path = require('path'), EP = process.argv[2], R = path.join(__dirname, '..'), D = path.join(R, 'episodes', EP);
for (const [from, to] of [['script.js', 'ep-script.js'], ['timing.js', 'ep-timing.js'], ['beats.js', 'ep-beats.js'], ['film.js', 'film.js']]) fs.copyFileSync(path.join(D, from), path.join(R, to));
for (const f of ['voice.json', 'music.wav', 'video.mp4']) fs.rmSync(path.join(R, 'out', f), { force: true });
console.log('current episode:', EP);
