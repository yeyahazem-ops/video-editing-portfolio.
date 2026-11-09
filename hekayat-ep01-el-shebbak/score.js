// حواديت توتة — الحلقة 1: «ياسين والشباك» (16:9, ~84s, for children 6–10).
// Yasin loves football; one big kick breaks Uncle Fathy's window. He wants to hide, remembers what
// mama said ("honesty is always better"), knocks on the door and owns up. Uncle Fathy smiles, they
// fix the window together and become friends. Moral card, then the classic Egyptian ending
// "وتوتة توتة خلصت الحدوتة". Every voice line, ball touch, knock and stamp is timed here.
// All characters are made up.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords, placeBar } = MU;

  const FPS = 30;
  const FORMAT = '16:9';
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

  // the hook: «توتة توتة» (C A C A), answered by a run home to F
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

  // ---------- the voice (ElevenLabs, pre-rendered into out/.vo-cache by tools/eleven.js) ----------
  const NARR = 'JBFqnCBsd6RMkjVDRZzb', KID = 'cgSgspJ2msm6clMCkdW9', OLD = 'pqHfZKP75CvOlQylNhV4';
  const V = (id, at, who, voice, text) => ({ id, at, who, voice, text });
  const vo = [
    V('title', T(1), 'narrator', NARR, 'حواديت توتة! النهاردة حدوتة: ياسين والشباك.'),
    V('once', T(4, 1), 'narrator', NARR, 'كان يا ما كان، في حارة صغيرة وجميلة، كان فيه ولد شاطر اسمه ياسين.'),
    V('ball', T(6, 3.1), 'narrator', NARR, 'ياسين كان بيحب الكورة أوي أوي!'),
    V('kick', T(8), 'narrator', NARR, 'وفي يوم، شاط الكورة جامد...'),
    V('oops', T(10, 1.5), 'narrator', NARR, 'يا خبر! الكورة كسرت شباك عم فتحي!'),
    V('scared', T(12), 'narrator', NARR, 'ياسين خاف، وقال في سره:'),
    V('hide', T(13, 0.5), 'yasin', KID, 'محدش شافني... أستخبى؟'),
    V('mama', T(14, 3), 'narrator', NARR, 'بس افتكر كلام ماما: الصراحة دايماً أحلى.'),
    V('knock', T(17), 'narrator', NARR, 'راح خبط على الباب، وقال:'),
    V('sorry', T(19), 'yasin', KID, 'أنا آسف يا عمو... أنا اللي كسرت الشباك.'),
    V('smile', T(20, 3), 'narrator', NARR, 'عم فتحي ابتسم وقال:'),
    V('fathy', T(22), 'fathy', OLD, 'علشان قلت الحقيقة، أنا مش زعلان منك. تعالى نصلحه سوا!'),
    V('fix', T(25), 'narrator', NARR, 'وصلحوا الشباك مع بعض، وبقوا أحلى أصحاب.'),
    V('moral', T(28, 2), 'narrator', NARR, 'الشاطر مش اللي ما بيغلطش... الشاطر اللي يعترف بغلطه!'),
    V('tota', T(31, 1), 'narrator', NARR, 'وتوتة توتة، خلصت الحدوتة! حلوة ولا ملتوتة؟'),
  ];

  const markers = {
    kick: { t: ev.kick, sync: 'av' }, // foot meets ball: thock + impact frame
    crash: { t: ev.crash, sync: 'av' }, // the window breaks: glass + flash, the music stops
    knock: { t: ev.knock[0], sync: 'av' }, // knock-knock on Uncle Fathy's door
    open: ev.open,
    moral: { t: moralStamps[0], sync: 'av' },
    end: ev.end,
    sub: ev.sub,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, hook, sung, sungAt, touches, touchNotes, passes, taps, moralStamps, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
