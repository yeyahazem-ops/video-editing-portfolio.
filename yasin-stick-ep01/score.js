// TOTA TALES — Episode 1: «Yasin and the Window» (9:16 stick-figure comic, 60 fps, ~84s, for children 6–10, English).
// Yasin loves football; one big kick breaks Uncle Fathy's window. He wants to hide, remembers what
// mama says ("honesty is always best"), knocks on the door and owns up. Uncle Fathy smiles, they
// fix the window together and become friends. Moral card, then the signature ending
// "Tota, tota, our story is done!". Every voice line, ball touch, knock and stamp is timed here.
// All characters are made up.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords, placeBar } = MU;

  const FPS = 60;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 100, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(35);

  // ---------- the story beats ----------
  const ev = {
    logo: T(0), street: T(4), kick: T(9), crash: T(10), hide: T(11, 2), think: T(14, 2), door: T(16, 2),
    knock: [T(18), T(18, 0.5), T(18, 1)], open: T(18, 3), smile: T(20, 2), fix: T(24, 2), play: T(26, 2),
    moral: T(28), end: T(31), sub: T(33),
  };
  const S = {
    title: [0, ev.street], street: [ev.street, ev.kick], kick: [ev.kick, ev.crash], oops: [ev.crash, ev.hide], hide: [ev.hide, ev.think],
    think: [ev.think, ev.door], door: [ev.door, ev.smile], smile: [ev.smile, ev.fix], fix: [ev.fix, ev.moral], moral: [ev.moral, ev.end], end: [ev.end, DURATION],
  };

  // ---------- harmony (F major) ----------
  const { chords, chordAt } = makeChords(clock, {
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
    C7: { notes: ['E4', 'Bb4', 'C5'], bass: 'C2' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'C'], [2, 0, 4, 'Dm'], [3, 0, 4, 'Bb'],
    [4, 0, 4, 'F'], [5, 0, 4, 'C'], [6, 0, 4, 'Dm'], [7, 0, 4, 'Bb'], [8, 0, 4, 'C7'], [9, 0, 4, 'C'],
    [10, 2, 6, 'Dm'], [12, 0, 4, 'A'], [13, 0, 4, 'Dm'], [14, 0, 2, 'A'],
    [14, 2, 6, 'Bb'], [16, 0, 2, 'F'], [16, 2, 6, 'Gm'], [18, 0, 4, 'C'],
    [19, 0, 4, 'Bb'], [20, 0, 4, 'C'], [21, 0, 4, 'F'], [22, 0, 4, 'Dm'], [23, 0, 4, 'Bb'], [24, 0, 2, 'C'],
    [24, 2, 6, 'F'], [26, 0, 4, 'Dm'], [27, 0, 4, 'Bb'],
    [28, 0, 4, 'Bb'], [29, 0, 4, 'C'], [30, 0, 4, 'F'],
    [31, 0, 4, 'F'], [32, 0, 4, 'C'], [33, 0, 4, 'Bb'], [34, 0, 4, 'F'],
  ]);

  // the hook: "tota tota" (C A C A), answered by a run home to F
  const HOOK_A = [['C5', 0, 1], ['A4', 1, 1], ['C5', 2, 1], ['A4', 3, 1], ['F5', 4, 1], ['E5', 5, 1], ['D5', 6, 2]];
  const HOOK_B = [['Bb4', 0, 1], ['C5', 1, 1], ['D5', 2, 1], ['C5', 3, 1], ['A4', 4, 1], ['G4', 5, 1], ['F4', 6, 2]];
  const hook = (bar, tr = 0) => [...placeBar(clock, HOOK_A, bar, tr), ...placeBar(clock, HOOK_B, bar + 1, tr)];
  // the sung «too-ta too-ta!» at the very start and the very end
  const sungAt = [T(0), T(33)];
  const sung = sungAt.map((t0) => [0, 1, 2, 3].map((i) => ({ t: t0 + i * BEAT / 2, dur: BEAT * 0.45, midi: m(i % 2 ? 'A4' : 'C5') })));

  // ---------- the ball ----------
  // keepy-uppy in the street: one touch per beat, each touch plays the next hook note on the marimba
  const touches = [];
  for (let b = 0; b < 19; b++) touches.push(T(4, 1 + b));
  const hookNotes = [...HOOK_A, ...HOOK_B].map((n) => m(n[0]));
  const touchNotes = touches.map((_, i) => hookNotes[i % hookNotes.length]);
  // after fixing the window: they pass the ball to each other on every beat
  const passes = [];
  for (let b = 0; b < 6; b++) passes.push(T(26, 2 + b));
  // the hammer taps while they fix the window
  const taps = [];
  for (let b = 0; b < 7; b++) taps.push(T(24, 3 + b * 0.5));
  // the moral card: the words stamp in, one group per beat
  const moralStamps = [T(28, 2), T(29), T(29, 2), T(30)];

  // ---------- extra animation hits (each one has a sound in song.js) ----------
  // the title letters drop in one by one on 16th notes (a pop each), the same at the ending
  const TITLE = 'TOTA TALES', END_TITLE = 'TOTA, TOTA!';
  const dropTimes = (str, t0) => { const out = []; let k = 0; for (const ch of str) { out.push(ch === ' ' ? null : t0 + k * BEAT / 4); if (ch !== ' ') k++; } return out; };
  const letters = dropTimes(TITLE, T(0, 0.25));
  const endLetters = dropTimes(END_TITLE, ev.end + 0.05);
  const whoosh = { flight: T(9, 1.5), shock: T(11) }; // the ball flies off · the dramatic zoom on Yasin
  const jump = T(16); // Yasin decides: a jump with a boing
  const love = T(7); // "loved football more than anything": hearts burst around him
  const sparkle = T(26); // "Good as new!"
  const hug = T(23, 2); // uncle's hand on his shoulder: hearts
  // the big laughs (the stick-comic signature): after the game, and under the ending
  const laughs = [[T(27, 1), T(28)], [T(33), T(34, 3)]];

  // ---------- the voice (ElevenLabs, pre-rendered into out/.vo-cache by tools/eleven.js) ----------
  const NARR = 'JBFqnCBsd6RMkjVDRZzb', KID = 'cgSgspJ2msm6clMCkdW9', OLD = 'pqHfZKP75CvOlQylNhV4';
  const V = (id, at, who, voice, text) => ({ id, at, who, voice, text });
  const vo = [
    V('title', T(1), 'narrator', NARR, 'Tota Tales! Today\'s story: Yasin and the Window.'),
    V('once', T(4, 1), 'narrator', NARR, 'Once upon a time, in a sunny little neighborhood, there lived a boy named Yasin.'),
    V('ball', T(6, 3.1), 'narrator', NARR, 'Yasin loved football more than anything!'),
    V('kick', T(8), 'narrator', NARR, 'One day, he kicked the ball really hard...'),
    V('oops', T(10, 1.5), 'narrator', NARR, 'Oh no! The ball smashed Uncle Fathy\'s window!'),
    V('scared', T(12), 'narrator', NARR, 'Yasin was scared. He thought:'),
    V('hide', T(13, 0.5), 'yasin', KID, 'Nobody saw me... should I hide?'),
    V('mama', T(14, 3), 'narrator', NARR, 'But then he remembered what Mama says: honesty is always best.'),
    V('knock', T(17), 'narrator', NARR, 'So he knocked on the door and said:'),
    V('sorry', T(19), 'yasin', KID, 'I\'m sorry, Uncle Fathy... I broke your window.'),
    V('smile', T(20, 3), 'narrator', NARR, 'Uncle Fathy smiled and said:'),
    V('fathy', T(22), 'fathy', OLD, 'You told the truth, so I\'m not angry. Let\'s fix it together!'),
    V('fix', T(25), 'narrator', NARR, 'So they fixed the window together, and became the best of friends.'),
    V('moral', T(28, 2), 'narrator', NARR, 'Everyone makes mistakes... but brave kids tell the truth!'),
    V('tota', T(31, 1), 'narrator', NARR, 'Tota, tota, our story is done! Did you like it? Wasn\'t it fun?'),
  ];

  const markers = {
    kick: { t: ev.kick, sync: 'av' }, // foot meets ball: thock + impact frame
    crash: { t: ev.crash, sync: 'av' }, // the window breaks: glass + flash, the music stops
    knock: ev.knock[0], // knock-knock on Uncle Fathy's door (measured +1 frame, but the small KNOCK! pop is too soft for verify to prove)
    open: ev.open,
    moral: { t: moralStamps[0], sync: 'av' },
    end: ev.end,
    sub: ev.sub,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, hook, sung, sungAt, touches, touchNotes, passes, taps, moralStamps, TITLE, END_TITLE, letters, endLetters, whoosh, jump, love, sparkle, hug, laughs, STYLE: 'flat', markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
