// THE SCORE — the single source of truth for music AND picture, for whichever episode of the week is selected.
// Every visual beat is an event here, and song.js renders sound for the very same events.
// The episode comes from EPISODE=<n> (Node) or episode.js (browser, written by make.js).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const L = node ? require('./lyrics') : globalThis.LYRICS;
  const VOICE = node ? require('./voice-data') : globalThis.VOICE;
  const { m, makeClock, placeBar, makeChords } = MU;

  const EPN = node ? parseInt(process.env.EPISODE || require('./episode'), 10) : globalThis.EPISODE;
  const EP = L.EPISODES[EPN];
  if (!EP) throw new Error(`unknown episode ${EPN}`);
  const LULL = EP.kind === 'lullaby';
  const FULL = !LULL && EP.animals.length > 1;

  const FPS = 30;
  const FORMAT = U.pickFormat(EP.format);
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;

  // ---------- the plan: segments, in bars ----------
  const segs = [];
  let bar = 0;
  const seg = (type, bars, animal) => { const s = { type, animal: animal || null, b0: bar, bars, i: segs.length }; segs.push(s); bar += bars; return s; };
  if (LULL) {
    seg('intro', 1);
    for (const st of L.LULLABY) seg('lull', 4, st.animal).lines = st.lines;
    seg('tail', 2, 'all');
  } else {
    seg('intro', FULL ? 2 : 1);
    for (const a of EP.animals) { seg('verse', 8, a); seg('chorus', 8, a); }
    if (FULL) { seg('final', 8, 'all'); seg('wind', 1, 'frog'); seg('sleepy', 4, 'frog').lines = L.SLEEPY; seg('tail', 2, 'frog'); }
    else seg('end', 1, EP.animals[0]);
  }
  const BARS = bar;
  const wind = segs.find((s) => s.type === 'wind');
  // the full song slows down into its goodnight ending
  const clock = makeClock(LULL ? { bpm: 80, offset: 0.5 } : wind ? { bpm: 120, offset: 0.5, tempo: [[0, 120], [wind.b0, 120], [wind.b0 + 1, 80], [BARS, 80]] } : { bpm: 120, offset: 0.5 });
  const { T } = clock;
  for (const s of segs) { s.t0 = T(s.b0); s.t1 = T(s.b0 + s.bars); }
  segs[0].t0 = 0;
  const DURATION = T(BARS) + (LULL || FULL ? 1.5 : 0.6);
  segs[segs.length - 1].t1 = DURATION;
  const segAt = (t) => segs.find((s) => t < s.t1) || segs[segs.length - 1];
  const multi = EP.animals.length > 1;
  const S = {};
  for (const s of segs) S[`${s.type}${multi && s.animal && s.animal !== 'all' && ['verse', 'chorus', 'lull'].includes(s.type) ? '-' + s.animal : ''}${s.type === 'lull' && s.animal === 'all' ? '-all' : ''}`] = [s.t0, s.t1];

  // ---------- harmony ----------
  const table = {
    F: { notes: ['A3', 'C4', 'F4'], bass: 'F2' }, C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' },
    Dm: { notes: ['A3', 'D4', 'F4'], bass: 'D2' }, Bb: { notes: ['Bb3', 'D4', 'F4'], bass: 'Bb1' },
    Fmaj9: { notes: ['A3', 'C4', 'E4', 'G4'], bass: 'F1' },
  };
  const PROG = {
    intro: ['F', 'C'], verse: ['F', 'F', 'Bb', 'F', 'C', 'C', ['Bb', 'C'], 'F'], chorus: ['F', 'C', 'Dm', 'Bb', 'F', 'C', ['Bb', 'C'], 'F'],
    wind: ['Fmaj9'], sleepy: ['F', 'Bb', 'C', 'F'], lull: ['F', 'Bb', 'C', 'F'], tail: ['Fmaj9', 'Fmaj9'], end: ['F'],
  };
  PROG.final = PROG.chorus;
  const rows = [];
  for (const s of segs) for (let i = 0; i < s.bars; i++) {
    const c = PROG[s.type][i % PROG[s.type].length];
    if (Array.isArray(c)) { rows.push([s.b0 + i, 0, 2, c[0]]); rows.push([s.b0 + i, 2, 2, c[1]]); } else rows.push([s.b0 + i, 0, 4, c]);
  }
  const { chords, chordAt } = makeChords(clock, table, rows);

  // ---------- the tune (8th-note grid: [note, start8th, dur8ths]) ----------
  const TUNE = {
    verse: [
      [['A4', 0, 1], ['A4', 1, 1], ['C5', 2, 2], ['A4', 4, 1], ['A4', 5, 1], ['C5', 6, 2]],
      [['D5', 0, 1], ['D5', 1, 1], ['C5', 2, 1], ['A4', 3, 1], ['F4', 4, 4]],
      [['D5', 0, 1], ['Bb4', 1, 1], ['D5', 2, 1], ['Bb4', 3, 1], ['D5', 4, 1], ['Bb4', 5, 1]],
      [['C5', 0, 1], ['C5', 1, 1], ['A4', 2, 1], ['A4', 3, 1], ['F4', 4, 3]],
      [['G4', 0, 1], ['G4', 1, 1], ['G4', 2, 1], ['C5', 3, 3]],
      [['G4', 0, 1], ['G4', 1, 1], ['G4', 2, 1], ['E5', 3, 3]],
      [['D5', 0, 1], ['Bb4', 1, 1], ['D5', 2, 1], ['Bb4', 3, 1], ['E5', 4, 1], ['C5', 5, 1]],
      [['F5', 0, 2], ['C5', 2, 1], ['A4', 3, 1], ['F4', 4, 4]],
    ],
    chorus: [
      [['C5', 0, 1], ['C5', 1, 1], ['C5', 2, 1], ['C5', 3, 1], ['F5', 4, 4]],
      [['E5', 0, 2], ['E5', 2, 2], ['E5', 4, 4]],
      [['D5', 0, 1], ['D5', 1, 1], ['D5', 2, 1], ['D5', 3, 1], ['F5', 4, 4]],
      [['D5', 0, 2], ['D5', 2, 2], ['D5', 4, 4]],
      [['C5', 0, 1], ['A4', 1, 1], ['C5', 2, 2]],
      [['E5', 0, 1], ['C5', 1, 1], ['E5', 2, 1], ['G5', 3, 2]],
      [['D5', 0, 1], ['D5', 1, 1], ['Bb4', 2, 1], ['D5', 3, 1], ['E5', 4, 1], ['C5', 5, 1], ['E5', 6, 2]],
      [['F5', 0, 4]],
    ],
    intro: [[['C5', 0, 1], ['F5', 1, 1], ['A5', 2, 2], ['C5', 4, 1], ['F5', 5, 1], ['A5', 6, 2]], [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 2], ['E5', 4, 1], ['G5', 5, 1], ['C6', 6, 2]]],
    lull: [
      [['A4', 0, 2], ['C5', 2, 2], ['A4', 4, 2], ['C5', 6, 2]],
      [['D5', 0, 2], ['Bb4', 2, 2], ['G4', 4, 4]],
      [['G4', 0, 2], ['Bb4', 2, 2], ['G4', 4, 2], ['E4', 6, 2]],
      [['F4', 0, 2], ['A4', 2, 2], ['F4', 4, 4]],
    ],
    wind: [[['F5', 0, 2], ['C5', 2, 2], ['A4', 4, 4]]], tail: [[['F5', 0, 8]], []], end: [[['F5', 0, 2]]],
  };
  TUNE.final = TUNE.chorus; TUNE.sleepy = TUNE.lull;
  const melody = [];
  for (const s of segs) for (let i = 0; i < s.bars; i++) {
    const row = TUNE[s.type][i % TUNE[s.type].length];
    for (const n of placeBar(clock, row, s.b0 + i)) melody.push({ ...n, seg: s.i, type: s.type });
  }

  // ---------- the words: every phrase sits on the downbeat of its bar ----------
  const vo = [];
  const say = (s, i, text, mode) => {
    if (!text) return;
    const v = VOICE[`${mode}:${text}`];
    if (!v) throw new Error(`no voice for "${mode}:${text}" — run node tools/voice.js`);
    const t = T(s.b0 + i) - v.words[0].t;
    vo.push({ t, end: t + v.dur, text, file: v.file, seg: s.i, type: s.type, animal: s.animal, bar: i, words: v.words.map((w) => ({ w: w.w, t: t + w.t, end: t + w.end })) });
  };
  // ---------- the action ----------
  const jumps = [], hops = [], claps = [], stomps = [], sounds = [], yays = [], wiggles = [], cuts = [];
  for (const s of segs) {
    const a = L.ANIMALS[s.animal];
    const B = (i, beat = 0) => T(s.b0 + i, beat);
    if (s.type === 'verse') {
      a.verse.forEach((x, i) => say(s, i, x, 'song'));
      jumps.push({ t0: B(4, 2), t1: B(4, 3), from: 0, to: -1, seg: s.i }, { t0: B(5, 2), t1: B(5, 3), from: -1, to: 1, seg: s.i });
      sounds.push({ t: B(4, 3), animal: s.animal, side: -1 }, { t: B(5, 3), animal: s.animal, side: 1 });
      cuts.push({ t: s.t0, kind: 'verse', animal: s.animal });
    } else if (s.type === 'chorus' || s.type === 'final') {
      (s.type === 'final' ? L.FINAL : a.chorus).forEach((x, i) => say(s, i, x, 'song'));
      for (const i of s.type === 'final' ? [1] : [1, 3]) for (let k = 0; k < 3; k++) hops.push({ t: B(i, k), seg: s.i, k });
      claps.push({ t: B(4, 2), seg: s.i }, { t: B(4, 3), seg: s.i });
      stomps.push({ t: B(5, 3), seg: s.i }, { t: B(5, 3.5), seg: s.i });
      yays.push({ t: B(7, 0), seg: s.i });
      cuts.push({ t: s.t0, kind: s.type, animal: s.animal });
    } else if (s.type === 'sleepy' || s.type === 'lull') {
      s.lines.forEach((x, i) => say(s, i, x, 'soft'));
      if (s.type === 'lull' && s.i > 1) cuts.push({ t: s.t0, kind: 'lull', animal: s.animal });
    }
  }
  // a wiggle on every "wiggle", "waddle", "zoom", "waggle" as it is spoken
  for (const p of vo) for (const w of p.words) if (/^(wiggle|waddle|zoom|zooming|waggle)/i.test(w.w)) wiggles.push({ t: w.t, seg: p.seg });

  const subtitles = vo.map((p, i) => ({ t: p.t - 0.05, end: Math.min(p.end + 0.7, vo[i + 1] ? vo[i + 1].t - 0.12 : DURATION), text: p.text, type: p.type, words: p.words.map((w) => ({ w: w.w, t: w.t, end: w.end })) }));

  // twinkling stars for the night scenes: one per melody note
  const rnd = U.mulberry32(77 + EPN);
  const stars = melody.filter((n) => ['lull', 'sleepy', 'tail', 'wind'].includes(n.type)).map((n, i) => ({ t: n.t, i, x: 0.06 + 0.88 * rnd(), y: 0.06 + 0.34 * rnd(), r: 0.6 + rnd() * 0.8, midi: n.midi }));
  const bgStars = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd() * 0.5, r: 0.3 + rnd() * 0.5, ph: rnd() * 6 }));

  // ---------- named moments ----------
  const markers = {};
  for (const c of cuts) if (c.kind !== 'lull') markers[`${c.kind}${multi && c.animal !== 'all' ? '-' + c.animal : ''}`] = { t: c.t, sync: 'av' };
  if (yays.length) markers.yay = { t: yays[yays.length - 1].t, sync: 'av' };
  if (wind) markers.goodnight = wind.t0;

  const SCORE = { EPN, EP, LULL, FULL, FPS, FORMAT, W, H, SAFE, WIDE, DURATION, BARS, clock, T, S, m, segs, segAt, chords, chordAt, melody, vo, subtitles, jumps, hops, claps, stomps, sounds, yays, wiggles, cuts, stars, bgStars, markers, ANIMALS: L.ANIMALS };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
