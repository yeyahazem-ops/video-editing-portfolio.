// TOTA TALES shorts: the shared timeline. The episode's script (ep-script.js), its measured voice timing
// (ep-timing.js) and its hits (ep-beats.js) are copied in by `node tools/use.js epNN`.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./ep-script') : globalThis.SCRIPT;
  const TIMING = node ? require('./ep-timing') : globalThis.TIMING;
  const BEATS = node ? require('./ep-beats') : globalThis.BEATS;
  const { m, makeClock, makeChords } = MU;
  const FPS = 60, FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT), SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 100, offset: 0.3 }), { T, BEAT } = clock;
  const L = TIMING.lines, DURATION = TIMING.duration;
  const bars = Math.ceil((DURATION - 0.3) / (BEAT * 4)) + 1;
  const prog = ['F', 'C', 'Dm', 'Bb'];
  const { chords, chordAt } = makeChords(clock, { F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' } },
    Array.from({ length: bars }, (_, b) => [b, 0, 4, prog[b % 4]]));
  const TITLE = 'TOTA TALES', END_TITLE = 'TOTA, TOTA!';
  const drops = (str, t0) => { const out = []; let k = 0; for (const ch of str) { out.push(ch === ' ' ? null : t0 + k * BEAT / 4); if (ch !== ' ') k++; } return out; };
  const letters = drops(TITLE, L.title.t + 0.05), endLetters = drops(END_TITLE, L.tota.t + 0.05);
  const md = L.moral.end - L.moral.t, moralStamps = [0, 0.25, 0.5, 0.78].map((k) => L.moral.t + k * md);
  const vo = SCRIPT.lines.map((l) => ({ id: l.id, at: L[l.id].t, who: l.who, voice: L[l.id].voice, text: l.text }));
  const B = BEATS(L, { T, BEAT, DURATION });
  const laughs = [...(B.laughs || []), [L.tota.end + 0.15, DURATION - 0.3, SCRIPT.cast || ['yasin']]];
  const markers = { ...(B.markers || {}), moral: L.moral.t, end: L.tota.t };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, m, chords, chordAt, L, vo, TITLE, END_TITLE, letters, endLetters, moralStamps, laughs, markers, STYLE: 'flat',
    title: SCRIPT.title, lesson: SCRIPT.lesson, cast: SCRIPT.cast || ['yasin'], sfx: B.sfx || [], ev: B.ev || {}, music: B.music || {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
