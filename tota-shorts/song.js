// TOTA TALES shorts: the shared soundtrack. A bouncy F-major groove (kick, claps, pizzicato, offbeat
// plucks), every sound hit from score.sfx, letter pops on the titles, timpani on the lesson stamps, a
// sung "too-ta too-ta" and real-sounding "ha ha" bursts on the laughs. Voices: ElevenLabs (out/.vo-cache).
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Sing = require('./engine/audio/sing');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, chordAt, L } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), sing = bus(), fx = bus(), laugh = bus(), verb = bus();
const quiet = sc.music.quiet || []; // [t0, t1] spans with no groove (tension, sad, spooky)
const isQuiet = (t) => quiet.some(([a, b]) => t >= a && t < b);
const lastBar = Math.floor((DURATION - 0.3) / (BEAT * 4));
for (let bar = 0; bar <= lastBar; bar++) for (let beat = 0; beat < 4; beat++) {
  const t = T(bar, beat); if (t > DURATION - 0.8 || isQuiet(t)) continue;
  const lesson = t >= L.moral.t - 0.2 && t < L.moral.end + 0.3;
  const g = lesson ? 0.5 : 1;
  if (beat % 2 === 0) drums.addMono(I.kick({ punch: 0.7, tail: 0.25 }), t, 0.5 * g);
  if (beat % 2 === 1) { drums.addMono(I.clap({ spread: 0.012 }), t, 0.28 * g); verb.addMono(I.clap(), t, 0.06 * g); }
  drums.addMono(I.shaker(1, bar * 8 + beat * 2), t, 0.08 * g, 0.3); drums.addMono(I.shaker(0.6, bar * 8 + beat * 2 + 1), t + BEAT / 2, 0.06 * g, 0.3);
  const c = chordAt(t + 0.01); if (!c) continue;
  if (beat === 0) bass.addMono(I.pizz(c.bass + 12), t, 0.5); if (beat === 2) bass.addMono(I.pizz(c.bass + 19), t, 0.4); if (beat === 3) bass.addMono(I.pizz(c.bass + 12), t + BEAT / 2, 0.3);
  for (const n of c.notes) keys.addMono(I.pluck(n, { decay: 0.12, cutoff: 2600 }), t + BEAT / 2, 0.045 * g, 0.2);
  if (beat === 0) for (const n of c.notes) { const x = I.padNote(n, BEAT * 4, { cutoff: lesson ? 1800 : 1200, attack: 0.4, release: 0.6, seed: n }); pad.addStereo(x.L, x.R, t, lesson ? 0.07 : 0.035); }
}
// quiet spans get a soft, low pad so the silence is tense rather than empty
for (const [a, b] of quiet) for (const n of [m('D3'), m('A3')]) { const x = I.padNote(n, b - a, { cutoff: 600, attack: 0.5, release: 0.8, seed: n }); pad.addStereo(x.L, x.R, a, 0.06); }
// titles: a pop + a marimba note per letter
const scale = [m('F5'), m('G5'), m('A5'), m('Bb5'), m('C6'), m('D6'), m('E6'), m('F6'), m('G6'), m('A6')];
for (const list of [sc.letters, sc.endLetters]) list.filter((x) => x !== null).forEach((t, i) => { fx.addMono(I.pop(1400 + i * 120, 70 + i), t + 0.22, 0.22); lead.addMono(I.marimba(scale[i % scale.length], { thock: 0.1 }), t + 0.22, 0.07); });
// the lesson: a timpani + brass stab on each stamp
for (const t of sc.moralStamps) { const c = chordAt(t + 0.01) || chordAt(T(0)); drums.addMono(I.timpani(c.bass + 12, { decay: 0.9 }), t, 0.5); for (const n of c.notes) { const x = I.brassNote(n, BEAT * 0.5, { stab: true, bright: 0.9, seed: n }); keys.addStereo(x.L, x.R, t, 0.05); } }
// the sung "too-ta too-ta" right after the last line
{ const t0 = L.tota.end + 0.1, notes = [0, 1, 2, 3].map((i) => ({ t: i * BEAT / 2, dur: BEAT * 0.45, midi: m(i % 2 ? 'A4' : 'C5') }));
  for (const [k, type] of [[0, 'alto'], [1, 'soprano']]) { const x = Sing.line('too-ta too-ta', notes, { type, vib: 0.1, bright: 1.2, seed: 40 + k }); sing.addMono(x, t0 - x.lead, 0.3, k ? 0.2 : -0.2); verb.addMono(x, t0 - x.lead, 0.08); }
  notes.forEach((n) => lead.addMono(I.marimba(n.midi), t0 + n.t, 0.22)); }
// every sound effect the episode asks for
const SFX = {
  pop: (t) => fx.addMono(I.pop(1600), t, 0.4), boing: (t) => fx.addMono(I.boing(), t, 0.25), thud: (t) => fx.addMono(I.thud(110, 0.12), t, 0.6),
  whoosh: (t) => fx.addMono(I.noiseSweep(0.35, 600, 5000, { q: 1.5, pink: true }), t - 0.25, 0.18), glass: (t) => fx.addMono(I.glass(4, { size: 1.1 }), t, 0.8),
  crunch: (t) => { fx.addMono(I.thud(80, 0.15), t, 0.7); fx.addMono(I.glass(7, { size: 0.5 }), t, 0.35); fx.addMono(I.scratch(0.2), t, 0.2); },
  scratch: (t) => fx.addMono(I.scratch(0.3), t, 0.35), sad: (t) => fx.addMono(I.bwomp(), t, 0.35), kick: (t) => { fx.addMono(I.thwack(), t, 0.5); fx.addMono(I.thud(110, 0.1), t, 0.5); },
  knock: (t) => { fx.addMono(I.thud(150, 0.1), t, 0.7); fx.addMono(I.woodTick(0.55), t, 0.4); }, tap: (t) => fx.addMono(I.woodTick(1.3), t, 0.3, 0.3),
  click: (t) => fx.addMono(I.tvClick(), t, 0.5), whistle: (t) => fx.addMono(I.whistle(0.5), t, 0.3),
  drip: (t) => { fx.addMono(I.pop(900, 11), t, 0.35); fx.addMono(I.bell(1320, 0.25, 1.1), t, 0.04); },
  sparkle: (t) => { for (let i = 0; i < 8; i++) fx.addMono(I.bell(1046 * Math.pow(2, [0, 4, 7, 12, 16, 19, 24, 28][i] / 12), 0.5, 1.1), t + i * 0.04, 0.05, i % 2 ? 0.3 : -0.3); },
  hearts: (t) => { [72, 76, 79, 84].forEach((n, i) => fx.addMono(I.bell(440 * Math.pow(2, (n - 69) / 12), 0.6, 1.2), t + i * 0.06, 0.06)); },
  meow: (t) => fx.addMono(I.voice(m('A5'), 0.45, { syl: 'e', type: 'alto', glide: -5, vib: 0.3, breath: 0.2, seed: 9 }), t, 0.35, 0.2),
  gasp: (t) => fx.addMono(I.noiseSweep(0.3, 800, 3000, { q: 1, pink: true }), t, 0.12),
  cheer: (t) => { for (let i = 0; i < 14; i++) fx.addMono(I.voice(m('A4') + (i % 8), 0.4 + (i % 3) * 0.1, { syl: i % 2 ? 'a' : 'e', type: 'alto', seed: 70 + i, glide: 3, breath: 0.2, shout: 1.3 }), t + (i % 7) * 0.08, 0.05, ((i % 5) - 2) * 0.3); },
  rain: (t, d = 4) => fx.addMono(I.noiseSweep(d, 2500, 2500, { q: 0.5, pink: true, shape: (x) => Math.min(1, x * 8, (1 - x) * 8) }), t, 0.12),
  spooky: (t, d = 2) => { const x = I.padNote(m('C3'), d, { cutoff: 500, attack: 0.3, release: 0.6, seed: 3 }); pad.addStereo(x.L, x.R, t, 0.12); fx.addMono(I.noiseSweep(d, 300, 900, { q: 3, pink: true }), t, 0.08); },
};
for (const [kind, t, d] of sc.sfx) { if (!SFX[kind]) throw new Error('unknown sfx ' + kind); SFX[kind](t, d); }
// laughs: bursts of "ha", falling in pitch, per character
const LAUGH = { yasin: [m('A4'), 'alto', -0.35], leo: [m('F4'), 'alto', 0.35], laila: [m('D5'), 'alto', -0.2], fathy: [m('D3'), 'tenor', 0.35], cat: null };
sc.laughs.forEach(([t0, t1, who], li) => (who || ['yasin']).forEach((w, wi) => {
  const v = LAUGH[w]; if (!v) return; let t = t0 + wi * 0.07, k = 0;
  while (t < t1 - 0.2) { const n = 4 + ((k + li + wi) % 3); for (let i = 0; i < n && t < t1 - 0.15; i++) { laugh.addMono(I.voice(v[0] + 5 - i * 1.2 + ((k * 7 + i * 3) % 5) * 0.3, 0.1, { syl: 'a', type: v[1], seed: 300 + k * 10 + i + wi * 100, breath: 0.45, glide: -2, vib: 0, shout: 1.2 }), t, 0.17, v[2]); t += 0.16; } t += 0.28; k++; }
}));
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
const music = [drums, bass, pad, keys, lead, sing];
MIX.duck(music, vo.bus, { depth: 0.5 });
const room = reverb(verb, { room: 0.7, damp: 0.35 });
const stems = { drums, bass, pad, keys, lead, sing, fx, laugh, voice: vo.bus, verb: room };
const GAIN = { drums: 1, bass: 1, pad: 2.5, keys: 1.3, lead: 1, sing: 3, fx: 1, laugh: 3, voice: 2, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 30); MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
