// Soundtrack (no narration): a deep ambient pad that darkens with depth, a slow pulse, a sonar ping on every
// landmark, whale calls, bubbles, the landing thud, and a big swell on the final fact.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { BEAT, DURATION, m, chordAt, ST, ev } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), verb = bus();
const st = (b, x, t, g) => b.addStereo(x.L, x.R, t, g);
// splash + dive
fx.addMono(I.noiseSweep(1.4, 6000, 400, { q: 0.7, pink: true, shape: (x) => Math.exp(-x * 3) }), 0.02, 0.5); fx.addMono(I.subBoom(1.0, 90, 40), 0.02, 0.5); drums.addMono(I.crash(2), 0.02, 0.25);
// pad: one chord per landmark, cutoff falls with depth
for (const c of sc.chords) { if (c.t0 >= ev.end) continue; const k = Math.min(1, c.t0 / ev.land), len = c.t1 - c.t0 + 0.4; for (const n of c.notes) { st(pad, I.padNote(n - 12, len, { cutoff: 1800 - 1200 * k, attack: 0.8, release: 0.8, seed: n }), c.t0, 0.07); st(pad, I.strings(n, len, { attack: 1.0, release: 0.8, bright: 0.7 - 0.4 * k, seed: n + 1 }), c.t0, 0.03); } bass.addMono(I.bass ? I.pizz(c.bass + 12) : I.pizz(c.bass + 12), c.t0, 0.3); fx.addMono(I.subBoom(2.2, 50 - 12 * k, 30), c.t0, 0.18 + 0.2 * k); }
// pulse: heartbeat that tightens near the bottom
for (let t = ev.dive; t < ev.land; t += BEAT * (t > ST[7].t ? 1 : 2)) { drums.addMono(I.kick({ punch: 0.5, tail: 0.5 }), t, 0.3); drums.addMono(I.kick({ punch: 0.3, tail: 0.4 }), t + 0.22, 0.14); }
for (let t = ST[4].t, i = 0; t < ev.land - 1; t += BEAT / 2, i++) drums.addMono(I.hat ? I.hat() : I.rim(), t, 0.03 + 0.03 * (i % 2));
// arpeggio: music box up high in the sunlight, lower and sparser below
for (let t = ev.dive, i = 0; t < ev.land; t += BEAT, i++) { const c = chordAt(t + 0.01); if (!c) continue; const deep = t > ST[5].t; if (deep && i % 2) continue; const n = c.notes[[0, 2, 1, 2, 0, 1][i % 6]] + (deep ? 0 : 12); keys.addMono(I.musicBox(n), t, 0.06); verb.addMono(I.musicBox(n), t, 0.05); }
// sonar ping + whoosh on every landmark
ST.forEach((s, i) => { for (const b of [fx, verb]) { b.addMono(I.bell(1568, 0.9, 1.0), s.t, 0.1); b.addMono(I.bell(1568, 0.7, 1.0), s.t + 0.32, 0.035); } fx.addMono(I.noiseSweep(0.5, 400, 3000, { q: 1.3, pink: true }), s.t - 0.75, 0.08); });
// whale calls (blue whale, sperm whale): slow falling tones into the reverb
const call = (t, f) => { for (let i = 0; i < 3; i++) { const b = I.bell(f * (1 - i * 0.12), 1.4, 0.35); verb.addMono(b, t + i * 0.45, 0.18); fx.addMono(b, t + i * 0.45, 0.06); } };
call(ST[1].t - 0.3, 196); call(ST[6].t - 0.3, 147);
// anglerfish sting, Titanic bell, Everest rumble
fx.addMono(I.scratch(0.2), ST[5].t + 0.5, 0.15); verb.addMono(I.bell(523, 2.0, 0.6), ST[7].t + 0.4, 0.14); fx.addMono(I.subBoom(3, 45, 25), ST[9].t, 0.5);
// riser into the landing, then the thud
fx.addMono(I.noiseSweep(2.4, 200, 5000, { q: 1.2, pink: true, shape: (x) => x * x }), ev.land - 2.5, 0.14);
fx.addMono(I.subBoom(2.6, 60, 24), ev.land, 0.95); fx.addMono(I.thud(70, 0.3), ev.land, 0.9); drums.addMono(I.kick({ punch: 1.4, tail: 0.6 }), ev.land, 0.85); drums.addMono(I.timpani(m('D2'), { decay: 1.8 }), ev.land, 0.6); fx.addMono(I.noiseSweep(1.6, 1500, 150, { q: 0.8, pink: true, shape: (x) => Math.exp(-x * 3) }), ev.land, 0.3);
for (const n of [m('D3'), m('A3'), m('D4')]) st(pad, I.strings(n, ev.twist - ev.land, { attack: 0.3, release: 0.6, bright: 0.5, seed: n }), ev.land, 0.05);
// the final fact: brass swell + timpani
for (const n of [m('D3'), m('A3'), m('D4'), m('F4'), m('A4')]) { st(brass, I.brassNote(n, 3.2, { bright: 1.0, seed: n }), ev.twist, 0.07); st(pad, I.strings(n + 12, 3.6, { attack: 0.2, release: 0.8, bright: 0.9, seed: n }), ev.twist, 0.04); }
drums.addMono(I.timpani(m('D2'), { decay: 2 }), ev.twist, 0.7); drums.addMono(I.crash(4), ev.twist, 0.4); fx.addMono(I.subBoom(2, 55, 28), ev.twist, 0.6);
[0.7, 1.2].forEach((d) => fx.addMono(I.thud(90, 0.12), ev.twist + d, 0.4)); fx.addMono(I.bell(1568, 0.9, 1.0), ev.twist + 2.2, 0.08);
// end card
fx.addMono(I.pop(1600), ev.end + 0.1, 0.4); for (const n of [m('D4'), m('F4'), m('A4'), m('D5')]) { keys.addMono(I.musicBox(n + 12), ev.end + 0.1, 0.07); st(brass, I.brassNote(n, 2.0, { bright: 0.8, seed: n }), ev.end + 0.1, 0.04); }
const Voice = require('./engine/audio/voice');
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
MIX.duck([drums, bass, pad, keys, brass, verb], vo.bus, { depth: 0.5 });
const room = reverb(verb, { room: 0.92, damp: 0.25 });
const mix = MIX.mixdown({ drums, bass, pad, keys, brass, fx, voice: vo.bus, verb: room }, { drums: 1, bass: 1, pad: 2.4, keys: 1.3, brass: 2, fx: 0.8, voice: 2, verb: 1.1 }, {});
MIX.highpass(mix, 26); MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
