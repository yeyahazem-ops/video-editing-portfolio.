// Soundtrack: rain + a storm-cloud synth pulse, hail ticks, a building arpeggio, a held breath, the CRACK
// (noise blast + sub + crash), the rolling thunder, a driving groove after the strike, a wonder outro.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, chordAt, L, ev, clock } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), verb = bus(), rain = bus();
const barAt = (t) => Math.floor(t / (BEAT * 4));
const stereo = (b, x, t, g) => b.addStereo(x.L, x.R, t, g);
const crack = (t, g = 1) => { fx.addMono(I.noiseSweep(0.35, 9000, 1500, { q: 0.6, pink: false, shape: (x) => Math.exp(-x * 9) }), t, 0.9 * g); fx.addMono(I.scratch(0.08), t, 0.6 * g); fx.addMono(I.subBoom(1.6, 70, 28), t, 0.8 * g); drums.addMono(I.crash(3), t, 0.45 * g); drums.addMono(I.kick({ punch: 1.4, tail: 0.6 }), t, 0.8 * g); };
const thunder = (t, len = 3.2, g = 1) => { fx.addMono(I.subBoom(len, 55, 22), t, 0.7 * g); fx.addMono(I.noiseSweep(len, 700, 90, { q: 0.7, pink: true, shape: (x) => Math.min(1, x * 8) * Math.exp(-x * 2.2) }), t, 0.55 * g); for (let i = 0; i < 4; i++) fx.addMono(I.thud(60 + i * 8, 0.3), t + 0.25 + i * 0.32 + (i % 2) * 0.1, 0.25 * g * (1 - i * 0.2)); };
// rain bed (whole film, ducked a bit during the end card)
for (let t = 0; t < DURATION; t += 4) rain.addMono(I.noiseSweep(4.2, 5200, 5200, { q: 0.4, pink: true, shape: (x) => (x < 0.06 ? x / 0.06 : x > 0.94 ? (1 - x) / 0.06 : 1) }), t, t > L.follow.t ? 0.03 : 0.07);
for (let i = 0; i < 260; i++) { const t = (i * 0.2137) % DURATION; if (t < L.follow.t) rain.addMono(I.woodTick ? I.woodTick() : I.rim(), t + (i % 7) * 0.013, 0.012); }
// cold open: strike + thunder on frame 0
crack(ev.open, 1.1); thunder(ev.open + 0.15, 2.6, 0.9);
// storm pulse: pad + 8th-note synth pulse, brighter as charge builds
for (const c of sc.chords) { if (c.t0 >= ev.breath) continue; for (const n of c.notes) stereo(pad, I.strings(n, Math.min(c.t1, ev.breath) - c.t0, { attack: 0.5, release: 0.3, bright: c.t0 < L.charge.t ? 0.6 : 0.9, seed: n }), c.t0, 0.04); }
for (let t = L.q.t; t < ev.breath; t += BEAT / 2) { const c = chordAt(t + 0.01); if (c) bass.addMono(I.pulse ? I.pulse(c.bass + 12, BEAT * 0.4) : I.pizz(c.bass + 12), t, 0.12 + 0.12 * ((t - L.q.t) / (ev.breath - L.q.t))); }
for (let t = L.charge.t, i = 0; t < ev.breath; t += BEAT / 4, i++) { const c = chordAt(t + 0.01); if (c) keys.addMono(I.pluck(c.notes[[0, 1, 2, 1][i % 4]] + 12), t, 0.03 + 0.04 * ((t - L.charge.t) / (ev.breath - L.charge.t))); }
for (let t = L.ground.t; t < ev.breath; t += BEAT) drums.addMono(I.heartbeat ? I.heartbeat() : I.kick({ punch: 0.5, tail: 0.3 }), t, 0.25);
// hail crashes, charge pops, leader steps
ev.crashes.forEach((t, i) => { fx.addMono(I.glass ? I.glass() : I.ting(), t, 0.06); fx.addMono(I.woodTick(), t, 0.25); });
fx.addMono(I.bell(1320, 0.4, 1.3), ev.plus, 0.08); fx.addMono(I.bell(440, 0.5, 1.1), ev.minus, 0.1); fx.addMono(I.bell(660, 0.4, 1.2), ev.groundUp, 0.08);
ev.steps.forEach((t, i) => fx.addMono(I.noiseSweep(0.09, 6000, 2500, { q: 1.2, shape: (x) => Math.exp(-x * 6) }), t, 0.35 + i * 0.05));
fx.addMono(I.noiseSweep(ev.breath - L.leader.t, 300, 9000, { q: 1.4, pink: true, shape: (x) => x * x }), L.leader.t, 0.14);
fx.addMono(I.noiseSweep(0.6, 1500, 8000, { q: 1.2, shape: (x) => x }), ev.up - 0.3, 0.2);
// THE STRIKE
crack(ev.strike, 1.3); thunder(ev.strike + 0.25, 4.2, 1);
for (const n of [m('E3'), m('B3'), m('E4'), m('G4')]) { const x = I.brassNote(n, 1.8, { bright: 1.2, seed: n }); brass.addStereo(x.L, x.R, ev.strike, 0.1); }
drums.addMono(I.timpani(m('E2'), { decay: 1.6 }), ev.strike, 0.7);
// after the strike: driving orchestral groove
const b0 = barAt(ev.strike) + 1, b1 = barAt(L.count.t);
Genre.play('orchestral', { clock, from: b0, to: b1, chordAt, buses: { drums, bass, pad, keys }, gain: 0.85 });
for (let b = b0; b < b1; b++) for (const beat of [0, 1.5, 3]) { const c = chordAt(T(b, beat) + 0.01); for (const n of c.notes) { const x = I.brassNote(n, BEAT * 0.4, { stab: true, bright: 1.1, seed: n + beat }); brass.addStereo(x.L, x.R, T(b, beat), 0.045); } }
// heat + air explosion + the thunder line
fx.addMono(I.bell(1760, 0.4, 1.4), ev.hot, 0.1); fx.addMono(I.subBoom(1.2, 80, 30), ev.boomAir, 0.5); fx.addMono(I.noiseSweep(1.0, 4000, 200, { q: 0.8, pink: true, shape: (x) => Math.exp(-x * 4) }), ev.boomAir, 0.3);
thunder(ev.thunder, 3, 0.8);
// counting game: a distant flash, three ticks, then a soft far-away boom
fx.addMono(I.noiseSweep(0.2, 8000, 3000, { q: 0.6, shape: (x) => Math.exp(-x * 8) }), ev.flash2, 0.25);
ev.ticks.forEach((t, i) => fx.addMono(I.woodTick(), t, 0.4));
thunder(ev.boom2, 2.4, 0.45);
for (const c of sc.chords) { if (c.t0 < L.count.t - 0.2 || c.t0 > L.follow.t) continue; for (const n of c.notes) stereo(pad, I.strings(n, c.t1 - c.t0, { attack: 0.6, release: 0.6, bright: 0.6, seed: n }), c.t0, 0.045); }
for (let t = L.count.t, i = 0; t < L.follow.t; t += BEAT, i++) { const c = chordAt(t + 0.01); if (c) { keys.addMono(I.musicBox(c.notes[i % 3] + 12), t, 0.06); verb.addMono(I.musicBox(c.notes[i % 3] + 12), t, 0.04); } }
// the twist: a flurry of tiny zaps across the globe
for (let i = 0; i < 26; i++) fx.addMono(I.noiseSweep(0.06, 9000, 4000, { q: 1, shape: (x) => Math.exp(-x * 8) }), ev.globe + 0.6 + i * 0.12, 0.08);
// end card
fx.addMono(I.pop(1600), ev.logo, 0.4); for (const n of [m('E4'), m('G4'), m('B4'), m('E5')]) { const x = I.brassNote(n, 2.2, { bright: 0.9, seed: n }); brass.addStereo(x.L, x.R, ev.logo, 0.06); } drums.addMono(I.timpani(m('E3'), { decay: 1.2 }), ev.logo, 0.5);
for (const t of [L.q.t, L.ice.t, L.charge.t, L.ground.t, L.leader.t, L.heat.t, L.count.t, L.twist.t]) fx.addMono(I.noiseSweep(0.3, 500, 4000, { q: 1.4, pink: true }), t - 0.25, 0.09);
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
const music = [drums, bass, pad, keys, brass];
for (const b of [...music, verb, rain]) MIX.gate(b, ev.breath, ev.strike - 0.004, 0.08);
MIX.duck(music, vo.bus, { depth: 0.45 });
const room = reverb(verb, { room: 0.8, damp: 0.3 });
const stems = { drums, bass, pad, keys, brass, fx, rain, voice: vo.bus, verb: room };
const GAIN = { drums: 1, bass: 1, pad: 2.2, keys: 1.2, brass: 2, fx: 1, rain: 1, voice: 2, verb: 0.6 };
const mix = MIX.mixdown(stems, GAIN, {});
MIX.highpass(mix, 28); MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  strike @ ${ev.strike}`);
