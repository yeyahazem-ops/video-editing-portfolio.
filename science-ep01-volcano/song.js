// The soundtrack: a low cinematic drone and pulse that tightens with the pressure, a riser, one beat of
// silence, then the BOOM (sub drop, timpani, crash, brass), full orchestra under the eruption, a calm
// "wonder" section for the islands, and a final chord. Narration: ElevenLabs (out/.vo-cache).
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, chordAt, L, ev, clock } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), verb = bus();
const barAt = (t) => Math.floor(t / (BEAT * 4));
const stereo = (b, x, t, g) => b.addStereo(x.L, x.R, t, g);
// 1 · underground: a dark drone with a slow heartbeat-like pulse
for (const n of [m('D2'), m('A2'), m('D3')]) stereo(pad, I.padNote(n, ev.breath, { cutoff: 700, attack: 1.5, release: 0.3, seed: n }), 0, 0.06);
for (let t = 0.2; t < L.pressure.t; t += BEAT * 2) { drums.addMono(I.kick({ punch: 0.6, tail: 0.5 }), t, 0.35); drums.addMono(I.kick({ punch: 0.4, tail: 0.4 }), t + 0.28, 0.18); }
// strings on the chords from the chamber onward, getting brighter
for (const c of sc.chords) { if (c.t0 < L.chamber.t - 0.1 || c.t0 >= ev.breath) continue; const g = c.t0 < L.pressure.t ? 0.035 : 0.05; for (const n of c.notes) stereo(pad, I.strings(n, Math.min(c.t1, ev.breath) - c.t0, { attack: 0.4, release: 0.3, bright: 0.8, seed: n }), c.t0, g); }
// marimba ticks for the "science" sections (magma, chamber, rises, gas)
for (let t = L.magma.t; t < L.pressure.t; t += BEAT / 2) { const c = chordAt(t + 0.01); if (!c) continue; const k = Math.round((t - L.magma.t) / (BEAT / 2)); keys.addMono(I.marimba(c.notes[[0, 2, 1, 2][k % 4]] + 12, { thock: 0.05 }), t, 0.06); }
// 2 · pressure: rumbles on a quickening grid, an ostinato and a riser into the held breath
ev.rumbles.forEach((t, i) => { fx.addMono(I.subBoom(0.6, 70 - i * 2, 35), t, 0.18 + i * 0.03); drums.addMono(I.timpani(m('D3'), { decay: 0.6 }), t, 0.18 + i * 0.04); });
for (let t = L.pressure.t, i = 0; t < ev.breath; t += BEAT / 4, i++) bass.addMono(I.pizz(m('D3') + (i % 4 === 3 ? 1 : 0)), t, 0.18 + 0.2 * ((t - L.pressure.t) / (ev.breath - L.pressure.t)));
fx.addMono(I.noiseSweep(ev.breath - L.pressure.t, 200, 7000, { q: 1.2, pink: true, shape: (x) => x * x }), L.pressure.t, 0.16);
ev.cracks.forEach((t) => { fx.addMono(I.scratch(0.12), t, 0.25); fx.addMono(I.thud(90, 0.1), t, 0.4); });
// 3 · BOOM: sub drop, timpani, crash, a brass chord, and a long rumble tail
fx.addMono(I.subBoom(2.4, 60, 25), ev.boom, 0.9); drums.addMono(I.kick({ punch: 1.4, tail: 0.6 }), ev.boom, 0.9); drums.addMono(I.crash(4), ev.boom, 0.6); drums.addMono(I.timpani(m('D2'), { decay: 1.6 }), ev.boom, 0.8);
for (const n of [m('D3'), m('A3'), m('D4'), m('F4')]) { const x = I.brassNote(n, 1.6, { bright: 1.2, seed: n }); brass.addStereo(x.L, x.R, ev.boom, 0.1); }
fx.addMono(I.noiseSweep(3.5, 900, 120, { q: 0.8, pink: true, shape: (x) => Math.exp(-x * 3) }), ev.boom, 0.3);
// the eruption: full orchestral groove
const b0 = barAt(ev.boom) + 1, b1 = barAt(L.build.t);
Genre.play('orchestral', { clock, from: b0, to: b1, chordAt, buses: { drums, bass, pad, keys }, gain: 0.9 });
for (let b = b0; b < b1; b++) for (const beat of [0, 1.5, 3]) { const c = chordAt(T(b, beat) + 0.01); for (const n of c.notes) { const x = I.brassNote(n, BEAT * 0.4, { stab: true, bright: 1.1, seed: n + beat }); brass.addStereo(x.L, x.R, T(b, beat), 0.05); } }
// 4 · wonder: islands rising — soft strings and a music box
for (const c of sc.chords) { if (c.t0 < L.build.t - 0.2 || c.t0 > L.sleeping.end) continue; for (const n of c.notes) stereo(pad, I.strings(n, c.t1 - c.t0, { attack: 0.6, release: 0.6, bright: 0.6, seed: n }), c.t0, 0.05); }
for (let t = L.build.t, i = 0; t < L.sleeping.end; t += BEAT, i++) { const c = chordAt(t + 0.01); if (c) { keys.addMono(I.musicBox(c.notes[i % 3] + 12), t, 0.07); verb.addMono(I.musicBox(c.notes[i % 3] + 12), t, 0.04); } }
for (let i = 0; i < 6; i++) fx.addMono(I.bell(880 * Math.pow(2, [0, 4, 7, 12, 16, 19][i] / 12), 0.5, 1.1), ev.island + i * 0.05, 0.05);
// 5 · the twist and the end card
fx.addMono(I.boing(), ev.eyes, 0.25); fx.addMono(I.subBoom(0.6, 80, 40), ev.eyes, 0.2);
fx.addMono(I.pop(1600), ev.logo, 0.4); for (const n of [m('D4'), m('F4'), m('A4'), m('D5')]) { const x = I.brassNote(n, 2.2, { bright: 0.9, seed: n }); brass.addStereo(x.L, x.R, ev.logo, 0.06); } drums.addMono(I.timpani(m('D3'), { decay: 1.2 }), ev.logo, 0.5);
// small hits: the thermometer, the soda cap
fx.addMono(I.bell(1760, 0.4, 1.4), ev.hot, 0.1); fx.addMono(I.pop(2200), ev.cap, 0.5); fx.addMono(I.noiseSweep(0.5, 3000, 8000, { q: 0.8, pink: true }), ev.cap, 0.1);
// scene whooshes
for (const t of [L.magma.t, L.chamber.t, L.gas.t, L.lava.t, L.build.t, L.sleeping.t]) fx.addMono(I.noiseSweep(0.3, 500, 4000, { q: 1.4, pink: true }), t - 0.25, 0.1);
// voice + mix
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
const music = [drums, bass, pad, keys, brass];
for (const b of [...music, verb]) MIX.gate(b, ev.breath, ev.boom - 0.004, 0.08); // the held breath before the boom
MIX.duck(music, vo.bus, { depth: 0.45 });
const room = reverb(verb, { room: 0.8, damp: 0.3 });
const stems = { drums, bass, pad, keys, brass, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 1, bass: 1, pad: 2.2, keys: 1.2, brass: 2, fx: 1, voice: 2, verb: 0.6 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28); MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  boom @ ${ev.boom}`);
