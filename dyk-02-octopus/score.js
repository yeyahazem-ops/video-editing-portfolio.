// Bubbly Tales · Did You Know #2 «Three hearts, blue blood» — the timeline.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U, MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script') : globalThis.SCRIPT, TIMING = node ? require('./timing') : globalThis.TIMING;
  const { m, makeClock, makeChords } = MU, FPS = 60, FORMAT = '9:16', [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 88, offset: 0.0 }), { T, BEAT } = clock, L = TIMING.lines, DURATION = TIMING.duration;
  const bars = Math.ceil(DURATION / (BEAT * 4)) + 1, prog = ['Dm', 'Bb', 'F', 'C'];
  const { chords, chordAt } = makeChords(clock, { F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' } }, Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const ev = { open: 0.05, beats: [0.9, 1.5, 2.1], gill: L.gills.t + 1.0, main: L.gills.t + 3.4, red: L.blue.t + 0.9, blue: L.blue.t + 2.6, bluehit: L.blue.end - 0.9, swim: L.stop.t + 0.2, sbeats: [L.stop.t + 0.5, L.stop.t + 1.1], stop: L.stop.t + 2.27, logo: L.follow.t + 0.1 };
  const hits = [[ev.open, 'sting'], ...ev.beats.map((t) => [t, 'beat']), [L.gills.t, 'whoosh'], [ev.gill, 'pop'], [ev.gill + 0.15, 'pop'], [ev.main, 'pop'], [L.blue.t, 'whoosh'], [ev.red, 'pop'], [ev.blue, 'pop'], [ev.bluehit, 'ding'], [L.stop.t, 'whoosh'], ...ev.sbeats.map((t) => [t, 'beat']), [ev.stop, 'stamp']];
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: 'narrator', voice: L[l.id].voice, text: l.text }));
  const markers = { open: { t: ev.open, sync: 'av' }, stop: { t: ev.stop, sync: 'av' } };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, ev, hits, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
