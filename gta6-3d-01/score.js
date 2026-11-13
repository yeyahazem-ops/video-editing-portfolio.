// Bubbly Tales · 3D · «GTA 6 is 6 days away» — the timeline. Every beat is keyed to the measured narration.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U, MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script') : globalThis.SCRIPT, TIMING = node ? require('./timing') : globalThis.TIMING;
  const { m, makeClock, makeChords } = MU, FPS = 60, FORMAT = '9:16', [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 108, offset: 0 }), { T, BEAT } = clock, L = TIMING.lines;
  const end = L.cta.t - 0.1, DURATION = TIMING.duration;
  const prog = ['Am', 'F', 'C', 'G'], bars = Math.ceil(DURATION / (BEAT * 4)) + 1;
  const { chords, chordAt } = makeChords(clock, { Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' }, C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' } },
    Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const ev = {
    ticks: [0.35, 0.75, 1.15], // the 6 slams in
    consoles: L.date.t + 1.7, pcx: L.pc.t + 1.2, tag1: L.price.t + 1.7, tag2: L.price.t + 4.2,
    pin: L.setting.t + 2.6, jason: L.leads.t + 2.4, lucia: L.lucia.t + 0.1, star: L.lucia.t + 2.3,
    open: L.preorder.t + 2.02, end,
  };
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: 'narrator', voice: L[l.id].voice, text: l.text }));
  const markers = { open: { t: ev.open, sync: 'av' }, end };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, ev, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
