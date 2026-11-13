// Synthwave news-flash soundtrack: driving 108 bpm groove from the first beat, a slam on every beat of the countdown,
// a whoosh + ping per fact, a sparkle burst when the gift opens, brass-free outro. Narration: ElevenLabs cache.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, chordAt, L, ev, clock } = sc;
const N = Math.ceil((DURATION + 0.5) * SR), bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), fx = bus(), verb = bus();
const bars = Math.floor((DURATION - 1.5) / (BEAT * 4));
Genre.play('edm', { clock, from: 0, to: bars, chordAt, buses: { drums, bass, pad, keys }, gain: 0.85 });
// countdown slams: sub + snare + crash on frame ~0
ev.ticks.forEach((t, i) => { fx.addMono(I.subBoom(0.9, 70 - i * 6, 30), t, 0.7); drums.addMono(I.kick({ punch: 1.2, tail: 0.5 }), t, 0.7); drums.addMono(I.snare ? I.snare() : I.clap(), t, 0.45); });
fx.addMono(I.subBoom(1.6, 60, 28), 0.02, 0.8); drums.addMono(I.crash(3), 0.02, 0.45);
// a whoosh into every fact + a clean ping when its card lands
['date', 'pc', 'price', 'setting', 'leads', 'preorder', 'cta'].forEach((id) => { const t = L[id].t; fx.addMono(I.noiseSweep(0.45, 400, 5000, { q: 1.3, pink: true }), t - 0.4, 0.14); fx.addMono(I.bell(1760, 0.5, 1.2), t + 0.05, 0.07); });
[ev.consoles, ev.pcx, ev.tag1, ev.tag2, ev.pin, ev.jason, ev.lucia].forEach((t) => fx.addMono(I.pop(1300), t, 0.4));
fx.addMono(I.bell(1320, 0.6, 1.2), ev.star, 0.1); for (let i = 0; i < 4; i++) fx.addMono(I.bell(880 * Math.pow(2, [0, 4, 7, 12][i] / 12), 0.4, 1.0), ev.star + i * 0.06, 0.06);
// gift opens: riser, thud, sparkle shower
fx.addMono(I.noiseSweep(ev.open - L.preorder.t, 300, 7000, { q: 1.1, pink: true, shape: (x) => x * x }), L.preorder.t, 0.12);
fx.addMono(I.subBoom(1.4, 70, 28), ev.open, 0.8); drums.addMono(I.kick({ punch: 1.5, tail: 0.4 }), ev.open, 0.9); fx.addMono(I.pop(900), ev.open, 0.7); fx.addMono(I.noiseSweep(0.12, 9000, 2500, { q: 0.8, shape: (x) => Math.exp(-x * 9) }), ev.open, 0.5); drums.addMono(I.crash(3), ev.open, 0.4); for (let i = 0; i < 10; i++) fx.addMono(I.bell(1046 * Math.pow(2, [0, 4, 7, 12, 16][i % 5] / 12), 0.3, 1.1), ev.open + 0.05 + i * 0.07, 0.05);
// outro
fx.addMono(I.pop(1300), L.cta.t + 1.0, 0.4); drums.addMono(I.crash(3), L.cta.t + 1.0, 0.3);
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
MIX.duck([drums, bass, pad, keys, verb], vo.bus, { depth: 0.5 });
const room = reverb(verb, { room: 0.6, damp: 0.3 });
const mix = MIX.mixdown({ drums, bass, pad, keys, fx, voice: vo.bus, verb: room }, { drums: 1, bass: 1, pad: 1.8, keys: 1.2, fx: 0.9, voice: 2, verb: 0.6 }, {});
MIX.highpass(mix, 28); MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
