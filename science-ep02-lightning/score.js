// Bubbly Tales · Science #2 «How Lightning Works» — the timeline. Cold open: a strike on frame 0.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script') : globalThis.SCRIPT;
  const TIMING = node ? require('./timing') : globalThis.TIMING;
  const { m, makeClock, makeChords } = MU;
  const FPS = 60, FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 96, offset: 0.0 }), { T, BEAT } = clock;
  const L = TIMING.lines, DURATION = TIMING.duration;
  const bars = Math.ceil(DURATION / (BEAT * 4)) + 1, prog = ['Em', 'C', 'G', 'D'];
  const { chords, chordAt } = makeChords(clock, { Em: { notes: ['E4', 'G4', 'B4'], bass: 'E2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' }, G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' }, D: { notes: ['D4', 'F#4', 'A4'], bass: 'D2' } },
    Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const strike = +(L.strike.t + 0.02).toFixed(3);
  const ev = {
    open: 0.05, // the cold-open strike
    crashes: Array.from({ length: 7 }, (_, i) => +(L.ice.t + 0.4 + i * 0.55).toFixed(3)),
    plus: L.charge.t + 2.2, minus: L.charge.t + 4.4, groundUp: L.ground.t + 0.6,
    steps: Array.from({ length: 6 }, (_, i) => +(L.leader.t + 0.3 + i * 0.36).toFixed(3)), up: L.meet.t + 1.0,
    breath: L.meet.end + 0.05, strike,
    hot: L.heat.t + 2.4, boomAir: L.heat.t + 3.4, thunder: L.thunder.t + 0.25,
    flash2: L.count.t + 0.15, ticks: [0, 1, 2].map((i) => +(L.count.t + 2.6 + i * 0.6).toFixed(3)),
    globe: L.twist.t + 0.2, logo: L.follow.t + 0.1,
  };
  ev.boom2 = ev.ticks[2] + 0.6;
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: 'narrator', voice: L[l.id].voice, text: l.text }));
  const markers = { open: { t: ev.open, sync: 'av' }, strike: { t: strike, sync: 'av' }, end: L.follow.t };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, ev, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
