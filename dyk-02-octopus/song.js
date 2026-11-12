// Did-You-Know soundtrack: a playful, curious lofi groove from frame 0, a sting on the hook, and one sound per
// visual hit (sc.hits: [time, kind]). Narration: ElevenLabs cache. Shared by every DYK short.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, chordAt, L, clock } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), fx = bus(), verb = bus();
const bars = Math.floor(L.follow.t / (BEAT * 4));
Genre.play('lofi', { clock, from: 0, to: bars, chordAt, buses: { drums, bass, pad, keys }, gain: 0.9 });
for (let t = 0, i = 0; t < L.follow.t; t += BEAT / 2, i++) { const c = chordAt(t + 0.01); if (c && i % 3 !== 2) keys.addMono(I.marimba(c.notes[[0, 2, 1, 2][i % 4]] + 12, { thock: 0.05 }), t, 0.05); }
const SFX = {
  sting: (t) => { fx.addMono(I.subBoom(0.8, 90, 40), t, 0.5); drums.addMono(I.crash(2), t, 0.35); fx.addMono(I.bell(1320, 0.5, 1.3), t, 0.12); fx.addMono(I.noiseSweep(0.5, 5000, 900, { q: 0.8, pink: true, shape: (x) => Math.exp(-x * 5) }), t, 0.2); },
  pop: (t) => fx.addMono(I.pop(1400), t, 0.45), boing: (t) => fx.addMono(I.boing(), t, 0.3), whoosh: (t) => fx.addMono(I.noiseSweep(0.3, 500, 4000, { q: 1.4, pink: true }), t - 0.2, 0.12),
  ding: (t) => { fx.addMono(I.bell(1760, 0.5, 1.4), t, 0.12); fx.addMono(I.bell(2637, 0.4, 1.2), t + 0.08, 0.08); },
  stamp: (t) => { fx.addMono(I.thud(80, 0.2), t, 0.7); drums.addMono(I.kick({ punch: 1.2, tail: 0.4 }), t, 0.6); fx.addMono(I.scratch(0.06), t, 0.3); },
  zap: (t) => fx.addMono(I.noiseSweep(0.12, 7000, 2500, { q: 1.2, shape: (x) => Math.exp(-x * 6) }), t, 0.3),
  sparkle: (t) => { for (let i = 0; i < 5; i++) fx.addMono(I.bell(1320 * Math.pow(2, [0, 4, 7, 12, 16][i] / 12), 0.3, 1.2), t + i * 0.05, 0.05); },
  squish: (t) => fx.addMono(I.bwomp ? I.bwomp() : I.boing(), t, 0.25), beat: (t) => drums.addMono(I.heartbeat(), t, 0.5),
};
for (const [t, kind] of sc.hits) SFX[kind](t);
fx.addMono(I.pop(1600), sc.ev.logo, 0.4); const fc = chordAt(L.follow.t); for (const n of fc.notes) keys.addMono(I.musicBox(n + 12), sc.ev.logo, 0.08);
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
const music = [drums, bass, pad, keys];
MIX.duck(music, vo.bus, { depth: 0.5 });
const room = reverb(verb, { room: 0.7, damp: 0.3 });
const mix = MIX.mixdown({ drums, bass, pad, keys, fx, voice: vo.bus, verb: room }, { drums: 1, bass: 1, pad: 1.6, keys: 1.2, fx: 1, voice: 2, verb: 0.5 }, {});
MIX.highpass(mix, 28); MIX.fadeOut(mix, DURATION - 0.7, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
