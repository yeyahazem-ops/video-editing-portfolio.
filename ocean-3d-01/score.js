// Bubbly Tales · 3D · «How Deep Is the Ocean?» — the timeline. No narration: big on-screen text, music and SFX.
// One continuous descent; a new landmark every 6 beats. Depths: commonly cited figures (see stations).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U, MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU, FPS = 60, FORMAT = '9:16', [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 96, offset: 0 }), { T, BEAT } = clock;
  const ST = [ // id, depth (m), title, subtitle
    ['diver', 40, 'SCUBA DIVERS', 'most stop at 40 m'],
    ['whale', 100, 'BLUE WHALE', 'the biggest animal ever'],
    ['twilight', 200, 'SUNLIGHT ENDS HERE', 'welcome to the Twilight Zone'],
    ['record', 332, 'DEEPEST SCUBA DIVE', '332 m · world record'],
    ['burj', 828, 'BURJ KHALIFA', 'the tallest building, upside down'],
    ['angler', 1000, 'THE MIDNIGHT ZONE', 'no sunlight. ever.'],
    ['sperm', 2250, 'SPERM WHALE', 'hunting giant squid in the dark'],
    ['titanic', 3800, 'THE TITANIC', 'resting here since 1912'],
    ['hadal', 6000, 'THE HADAL ZONE', 'pressure: 600× the surface'],
    ['everest', 8849, 'MOUNT EVEREST', 'upside down… and still not the bottom'],
  ].map(([id, depth, title, sub], i) => ({ id, depth, title, sub, t: T(0, 6 + i * 6) }));
  const ev = { dive: T(0, 1.5), land: T(0, 66), twist: T(0, 72), end: T(0, 78) };
  const DURATION = ev.end + 4.4, BOTTOM = 10935;
  const prog = ['Dm', 'Bb', 'Gm', 'A'], bars = Math.ceil(DURATION / (BEAT * 6)) + 1;
  const { chords, chordAt } = makeChords(clock, { Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' } },
    Array.from({ length: bars }, (_, b) => [0, b * 6, 6, prog[b % 4]]));
  // narration: each line lands about a second before its landmark; long lines start earlier so none overlap
  const TIMING = node ? require('./timing') : globalThis.TIMING, TL = TIMING.lines, dur = (id) => TL[id].end - TL[id].t;
  const want = { hook: 0.15, ...Object.fromEntries(ST.map((s, i) => [s.id, s.t - (i ? 1.0 : 0.4)])), land: ev.land + 0.25, twist: ev.twist + 0.15 };
  const ids = Object.keys(TL), at = {}; for (let i = ids.length - 1; i >= 0; i--) { const id = ids[i], nx = ids[i + 1]; at[id] = Math.min(want[id], nx ? at[nx] - 0.08 - dur(id) : Infinity); }
  const vo = ids.map((id) => ({ id, at: +at[id].toFixed(3), who: 'narrator', voice: TL[id].voice, text: TL[id].text }));
  const markers = { land: { t: ev.land, sync: 'av' }, twist: ev.twist, end: ev.end };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, ST, ev, BOTTOM, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
