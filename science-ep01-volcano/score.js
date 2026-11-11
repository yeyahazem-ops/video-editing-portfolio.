// Bubbly Tales · Science · «How a Volcano Erupts» — the timeline (single source of truth for picture and sound).
// Line times come from the measured narration (timing.js, written by tools/voice.js).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script') : globalThis.SCRIPT;
  const TIMING = node ? require('./timing') : globalThis.TIMING;
  const { m, makeClock, makeChords } = MU;
  const FPS = 60, FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 90, offset: 0.0 }), { T, BEAT } = clock;
  const L = TIMING.lines, DURATION = TIMING.duration;
  const bars = Math.ceil(DURATION / (BEAT * 4)) + 1, prog = ['Dm', 'Bb', 'F', 'C'];
  const { chords, chordAt } = makeChords(clock, { Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, F: { notes: ['C4', 'F4', 'A4'], bass: 'F2' }, C: { notes: ['C4', 'E4', 'G4'], bass: 'C2' } },
    Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const boom = +(L.hold.end + 0.55).toFixed(3);
  const ev = {
    boom, breath: L.hold.end + 0.05, // the held breath: silence from here to the boom
    hot: L.magma.t + 2.6, // the thermometer hits 1,200
    cap: L.gas.t + 2.1, // the soda cap pops
    rumbles: Array.from({ length: 8 }, (_, i) => +(L.pressure.t + i * ((L.hold.end - L.pressure.t) / 8)).toFixed(3)),
    cracks: [L.hold.t + 0.25, L.hold.t + 0.9, L.hold.t + 1.4],
    island: L.build.end - 1.6, eyes: L.sleeping.end + 0.05, logo: L.follow.t + 0.1,
  };
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: 'narrator', voice: L[l.id].voice, text: l.text }));
  const markers = { boom: { t: boom, sync: 'av' }, lava: L.lava.t, build: L.build.t, end: L.follow.t };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, ev, vo, markers, STYLE: 'flat' };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
