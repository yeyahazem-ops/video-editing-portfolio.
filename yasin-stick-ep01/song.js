// THE SONG for «Yasin and the Window»: every sound comes from an event in score.js.
//   node song.js   (STEMS=1 writes stems, LUFS=-14 sets loudness)
// A bouncy F-major marimba/pizzicato groove; Yasin's ball touches PLAY the hook; a riser on the kick,
// glass + a record scratch on the crash and then silence; a tiptoe in D minor while he hides; a music
// box for mama's words; three knocks on the door; warm strings when Uncle Fathy smiles; hammer taps,
// the moral stamped with timpani, and the sung «bub-ble bub-ble» that opens and closes every episode.
// The voices are ElevenLabs speech, cached in out/.vo-cache by tools/eleven.js.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Sing = require('./engine/audio/sing');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, chordAt } = sc;

const N = Math.ceil((DURATION + 0.5) * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), sing = bus(), fx = bus(), verb = bus();

const stereo = (b, x, t, g, pan = 0) => (x.L ? b.addStereo(x.L, x.R, t, g) : b.addMono(x, t, g, pan));

// ---------- the bouncy groove ----------
function groove(from, to, { gain = 1, kick = true } = {}) {
  for (let bar = from; bar < to; bar++) {
    const c = chordAt(T(bar, 0.01)) || chordAt(T(bar, 2.01));
    for (let beat = 0; beat < 4; beat++) {
      const t = T(bar, beat);
      if (kick && beat % 2 === 0) drums.addMono(I.kick({ punch: 0.7, tail: 0.25 }), t, 0.55 * gain);
      if (beat % 2 === 1) { drums.addMono(I.clap({ spread: 0.012 }), t, 0.32 * gain); verb.addMono(I.clap(), t, 0.08 * gain); }
      drums.addMono(I.shaker(1, bar * 8 + beat * 2), t, 0.09 * gain, 0.3);
      drums.addMono(I.shaker(0.6, bar * 8 + beat * 2 + 1), t + BEAT / 2, 0.07 * gain, 0.3);
      const cc = chordAt(t + 0.01) || c;
      if (!cc) continue;
      // pizzicato bass: root on 1, fifth on 3, a pickup on the "and" of 4
      if (beat === 0) bass.addMono(I.pizz(cc.bass + 12), t, 0.5 * gain);
      if (beat === 2) bass.addMono(I.pizz(cc.bass + 19), t, 0.4 * gain);
      if (beat === 3) bass.addMono(I.pizz(cc.bass + 12), t + BEAT / 2, 0.3 * gain);
      // offbeat plucked chords
      for (const n of cc.notes) keys.addMono(I.pluck(n, { decay: 0.12, cutoff: 2600 }), t + BEAT / 2, 0.05 * gain, 0.2);
    }
  }
}
// a soft pad under a span (one note per chord)
function pads(t0, t1, { cutoff = 1200, gain = 0.05, attack = 0.4 } = {}) {
  for (const c of sc.chords) {
    const a = Math.max(c.t0, t0), b = Math.min(c.t1, t1);
    if (b <= a) continue;
    for (const n of c.notes) stereo(pad, I.padNote(n, b - a, { cutoff, attack, release: 0.6, seed: n }), a, gain);
  }
}
function strings(t0, t1, gain = 0.05) {
  for (const c of sc.chords) {
    const a = Math.max(c.t0, t0), b = Math.min(c.t1, t1);
    if (b <= a) continue;
    for (const n of c.notes) stereo(pad, I.strings(n, b - a, { attack: 0.3, release: 0.5, bright: 0.8, seed: n }), a, gain);
    bass.addMono(I.pizz(c.bass + 12), a, 0.35);
  }
}
const melody = (notes, inst, g, tr = 0) => { for (const n of notes) { const x = inst(n.midi + tr); lead.addMono(x, n.t, g); verb.addMono(x, n.t, g * 0.35); } };
const mbox = (midi) => I.musicBox(midi, { decay: 1.2 });
const marim = (midi) => I.marimba(midi, { thock: 0.15 });
// the sung «bub-ble bub-ble!» (alto + soprano, doubled by marimba)
function sungTota(notes) {
  for (const [k, type] of [[0, 'alto'], [1, 'soprano']]) {
    const x = Sing.line('buh-bul buh-bul', notes.map((n) => ({ ...n, t: n.t - notes[0].t, midi: n.midi + (k ? 0.05 : 0) })), { type, vib: 0.1, bright: 1.2, seed: 40 + k });
    sing.addMono(x, notes[0].t - x.lead, 0.32, k ? 0.2 : -0.2);
    verb.addMono(x, notes[0].t - x.lead, 0.1);
  }
  for (const n of notes) lead.addMono(marim(n.midi), n.t, 0.25);
}

// ---------- 1. title (bars 0-3) ----------
sungTota(sc.sung[0]);
groove(1, 4, { gain: 0.8 });
melody(sc.hook(2), marim, 0.22); melody(sc.hook(2), mbox, 0.1, 12);
pads(T(1), T(4), { cutoff: 1600, gain: 0.03 });
// ---------- 2. the street (bars 4-8): every touch of the ball plays the next hook note ----------
groove(4, 9, { gain: 0.9 });
sc.touches.forEach((t, i) => { lead.addMono(I.marimba(sc.touchNotes[i], { thock: 0.55 }), t, 0.3); verb.addMono(I.marimba(sc.touchNotes[i]), t, 0.08); });
// ---------- 3. the kick (bar 9): no drums, a riser that stops just before the crash ----------
fx.addMono(I.thwack(), ev.kick, 0.55);
fx.addMono(I.thud(110, 0.12), ev.kick, 0.6);
fx.addMono(I.noiseSweep(T(9, 3.6) - ev.kick, 400, 7000, { q: 1.3, pink: true, shape: (x) => x * x }), ev.kick, 0.16);
for (let i = 0; i < 12; i++) lead.addMono(I.pizz(m('C5') + [0, 2, 4, 5, 7, 9, 10, 12, 14, 16, 17, 19][i]), ev.kick + i * BEAT / 3, 0.12 + i * 0.01);
bass.addMono(I.bass(m('C2'), T(10) - ev.kick - 0.05, { bright: 0.2, sub: 1 }), ev.kick, 0.35);
// ---------- 4. CRASH: glass, scratch, silence ----------
fx.addMono(I.glass(4, { size: 1.2 }), ev.crash, 0.9, 0.2);
fx.addMono(I.subBoom(0.8, 90, 40), ev.crash, 0.4);
fx.addMono(I.scratch(0.3), ev.crash + 0.02, 0.35);
fx.addMono(I.bwomp(), T(10, 1), 0.3);
// ---------- 5. hiding (bars 10.5-14.5): tiptoe pizzicato in D minor, a heartbeat ----------
pads(T(10, 2), T(14, 2), { cutoff: 700, gain: 0.05 });
for (let b = T(10, 2); b < T(14, 2) - 0.01; b += BEAT / 2) {
  const c = chordAt(b + 0.01); if (!c) continue;
  const k = Math.round((b - T(10, 2)) / (BEAT / 2));
  lead.addMono(I.pizz(c.notes[[0, 1, 2, 1][k % 4]]), b, k % 2 ? 0.1 : 0.15);
}
for (let k = 0; k < 6; k++) fx.addMono(I.heartbeat(), T(13, k * 0.5), 0.25);
// ---------- 6. mama's words (bars 14.5-18): a music box and a warm pad ----------
pads(T(14, 2), T(18), { cutoff: 1400, gain: 0.05, attack: 0.8 });
melody(sc.hook(15).filter((n) => n.t < T(17)), mbox, 0.16, 12);
// three knocks on the door, and a creak as it opens
pads(T(18), T(19), { cutoff: 600, gain: 0.03 });
for (const k of ev.knock) { fx.addMono(I.thud(150, 0.1), k, 0.8); fx.addMono(I.woodTick(0.55), k, 0.45); }
fx.addMono(I.noiseSweep(0.7, 900, 500, { q: 6 }), ev.open, 0.06);
// ---------- 7. sorry + uncle smiles (bars 19-24): warm strings ----------
strings(T(19), T(24, 2), 0.045);
melody(sc.hook(21).filter((n) => n.t < T(22)), mbox, 0.12, 12);
fx.addMono(I.bell(1760, 0.9, 1.4), ev.smile + 0.6, 0.08); // a twinkle on the smile
// ---------- 8. fixing and playing (bars 24.5-28) ----------
groove(25, 28, { gain: 0.85 });
for (const t of sc.taps) fx.addMono(I.woodTick(1.3), t, 0.22, 0.25);
sc.passes.forEach((t, i) => lead.addMono(I.marimba([m('C5'), m('A4'), m('F5'), m('E5'), m('D5'), m('C5')][i], { thock: 0.55 }), t, 0.3));
// ---------- 9. the moral (bars 28-31): strings, timpani and a stab on every stamp ----------
strings(T(28), T(31), 0.05);
for (const t of sc.moralStamps) {
  const c = chordAt(t + 0.01);
  drums.addMono(I.timpani(c.bass + 12, { decay: 0.9 }), t, 0.55);
  for (const n of c.notes) { const x = I.brassNote(n, BEAT * 0.5, { stab: true, bright: 0.9, seed: n }); keys.addStereo(x.L, x.R, t, 0.06); }
}
// ---------- 10. the ending (bars 31-35) ----------
groove(31, 33, { gain: 0.8 });
melody(sc.hook(31), marim, 0.2); melody(sc.hook(31), mbox, 0.08, 12);
sungTota(sc.sung[1]);
groove(33, 34, { gain: 0.8 });
pads(T(33), T(35), { cutoff: 1800, gain: 0.04 });
for (const n of [m('F4'), m('A4'), m('C5'), m('F5')]) { lead.addMono(I.marimba(n), T(34), 0.2); lead.addMono(mbox(n + 12), T(34), 0.1); }
drums.addMono(I.kick({ punch: 0.8 }), T(34), 0.5);
drums.addMono(I.crash(2), T(34), 0.18);

// ---------- the new animation hits ----------
// each title letter lands with a pop, climbing the F major scale
const scale = [m('F5'), m('G5'), m('A5'), m('Bb5'), m('C6'), m('D6'), m('E6'), m('F6'), m('G6'), m('A6')];
sc.letters.filter((x) => x !== null).forEach((t, i) => { fx.addMono(I.pop(1400 + i * 120, 70 + i), t + 0.22, 0.25); lead.addMono(I.marimba(scale[i % scale.length], { thock: 0.1 }), t + 0.22, 0.07); });
sc.endLetters.filter((x) => x !== null).forEach((t, i) => { fx.addMono(I.pop(1400 + i * 110, 90 + i), t + 0.22, 0.22); lead.addMono(I.marimba(scale[i % scale.length], { thock: 0.1 }), t + 0.22, 0.06); });
// the ball takes off for the window, and the dramatic zoom
fx.addMono(I.launchWhistle(ev.crash - sc.whoosh.flight - 0.15, 31), sc.whoosh.flight, 0.12);
fx.addMono(I.noiseSweep(0.35, 600, 5000, { q: 1.5, pink: true }), sc.whoosh.shock - 0.05, 0.18);
fx.addMono(I.subBoom(0.4, 120, 60), sc.whoosh.shock, 0.25);
// the decision jump
fx.addMono(I.boing(), sc.jump, 0.22);
fx.addMono(I.thud(120, 0.08), sc.jump + 0.5, 0.35);
// the hug: a little harp of bells
[m('C6'), m('E6'), m('G6'), m('C7')].forEach((n, i) => fx.addMono(I.bell(440 * Math.pow(2, (n - 69) / 12), 0.6, 1.2), sc.hug + i * 0.06, 0.06));
// "Good as new!": a sparkle run
for (let i = 0; i < 8; i++) fx.addMono(I.bell(1046 * Math.pow(2, [0, 4, 7, 12, 16, 19, 24, 28][i] / 12), 0.5, 1.1), sc.sparkle + i * 0.04, 0.05, (i % 2 ? 0.3 : -0.3));

// the big laughs: bursts of "ha" from Yasin (high) and Uncle Fathy (low), falling in pitch like a real laugh
const laughVox = bus();
sc.laughs.forEach(([t0, t1], li) => {
  for (const [who, base, type, pan, gain] of [['yasin', m('A4'), 'alto', -0.35, 0.16], ['fathy', m('D3'), 'tenor', 0.35, 0.18]]) {
    let t = t0 + (who === 'fathy' ? 0.07 : 0), k = 0;
    while (t < t1 - 0.2) {
      const n = 4 + ((k + li) % 3); // a burst of 4–6 "ha"s, then a breath
      for (let i = 0; i < n && t < t1 - 0.15; i++) {
        const pitch = base + 5 - i * 1.2 + ((k * 7 + i * 3) % 5) * 0.3;
        laughVox.addMono(I.voice(pitch, 0.1, { syl: 'a', type, seed: 300 + k * 10 + i, breath: 0.45, glide: -2, vib: 0, shout: 1.2 }), t, gain, pan);
        t += 0.16;
      }
      t += 0.28; k++;
    }
  }
});

// ---------- the voice ----------
const vo = Voice.speak(sc.vo, { engine: 'none', out: path.join(__dirname, 'out'), length: N / SR });
// ---------- mix ----------
const music = [drums, bass, pad, keys, lead, sing];
for (const b of [...music, verb]) MIX.gate(b, ev.crash - 0.004, T(10, 2), 0.01); // silence after the crash
MIX.gate(pad, ev.knock[0] - 0.05, ev.knock[2] + 0.4, 0.05);
MIX.duck(music, vo.bus, { depth: 0.5 });
const room = reverb(verb, { room: 0.7, damp: 0.35 });
const stems = { drums, bass, pad, keys, lead, sing, fx, laugh: laughVox, voice: vo.bus, verb: room };
const GAIN = { drums: 1, bass: 1, pad: 2.5, keys: 1.3, lead: 1, sing: 3, fx: 1, laugh: 3, voice: 2, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 30);
MIX.fadeOut(mix, DURATION - 0.8, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);
