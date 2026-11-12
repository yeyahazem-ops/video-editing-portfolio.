// Bubbly Tales · Did You Know #1 «Honey never spoils» — the timeline.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U, MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script') : globalThis.SCRIPT, TIMING = node ? require('./timing') : globalThis.TIMING;
  const { m, makeClock, makeChords } = MU, FPS = 60, FORMAT = '9:16', [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 88, offset: 0.0 }), { T, BEAT } = clock, L = TIMING.lines, DURATION = TIMING.duration;
  const bars = Math.ceil(DURATION / (BEAT * 4)) + 1, prog = ['F', 'Dm', 'Bb', 'C'];
  const { chords, chordAt } = makeChords(clock, { F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' } }, Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const ev = { open: 0.05, spoon: L.hook.end - 1.3, found: L.tomb.t + 2.2, good: L.tomb.end - 0.9, germs: [0, 1, 2].map((i) => +(L.why.t + 2.6 + i * 0.45).toFixed(3)), stamp: L.end.t + 0.75, logo: L.follow.t + 0.1 };
  const hits = [[ev.open, 'sting'], [ev.spoon, 'pop'], [L.tomb.t, 'whoosh'], [ev.found, 'sparkle'], [ev.good, 'ding'], [L.why.t, 'whoosh'], ...ev.germs.map((t) => [t, 'zap']), [L.end.t, 'whoosh'], [ev.stamp, 'stamp']];
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: 'narrator', voice: L[l.id].voice, text: l.text }));
  const markers = { open: { t: ev.open, sync: 'av' }, stamp: { t: ev.stamp, sync: 'av' } };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, ev, hits, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
