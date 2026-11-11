// THE SONG — renders every sound from the score into out/music.wav, for the selected episode.
//   EPISODE=2 node song.js     (STEMS=1 also writes out/stem-*.wav, LUFS=-14 sets the loudness)
const path = require('path');
const { spawnSync } = require('child_process');
const { SR, Bus, reverb, pingpong, Saw, SVF } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, DURATION, m, clock, segs } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), uke = bus(), keys = bus(), vox = bus(), animal = bus(), fx = bus();
const verb = bus(), dly = bus();
const beatAt = (t) => 60 / clock.bpmAt(t); // seconds per beat here (the full song slows down at the end)

// ---------- the voice: every phrase from the score, at its bar ----------
function decode(file, filter) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', path.join(__dirname, file), ...(filter ? ['-af', filter] : []), '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`could not decode ${file}: ${r.stderr}`);
  const b = r.stdout, x = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
  let s = 0, n = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.01) { s += x[i] * x[i]; n++; }
  const g = 0.14 / Math.sqrt(s / Math.max(1, n)); // every phrase at the same loudness
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}
const cache = new Map();
const clip = (file, filter) => { const k = file + (filter || ''); if (!cache.has(k)) cache.set(k, decode(file, filter)); return cache.get(k); };
for (const p of sc.vo) {
  const soft = p.type === 'lull' || p.type === 'sleepy';
  const x = clip(p.file);
  vox.addMono(x, p.t, soft ? 0.8 : 1);
  verb.addMono(x, p.t, soft ? 0.22 : 0.07);
}

// ---------- the animals' own sounds, on beat 4 of "hop to the left / right" ----------
const VOICE = require('./voice-data');
function buzz(len = 0.42) {
  const out = new Float32Array(Math.floor(len * SR)), saw = new Saw(), f = new SVF();
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, env = Math.min(1, t / 0.02) * Math.min(1, (len - t) / 0.08);
    out[i] = f.bp(saw.next(196 + 26 * Math.sin(t * 38) + 30 * t), 1500, 1.2) * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 34)) * env;
  }
  return out;
}
for (const s of sc.sounds) {
  const a = sc.ANIMALS[s.animal];
  if (a.sound === 'boing') { animal.addMono(I.boing(), s.t - 0.02, 0.55, s.side * 0.4); animal.addMono(I.thud(90, 0.07), s.t, 0.5); continue; }
  // the animal's word, pitched up like a cartoon
  const x = clip(VOICE[`sfx:${a.sound}`].file, 'asetrate=44100*1.28,aresample=48000');
  animal.addMono(x, s.t, 0.95, s.side * 0.4); verb.addMono(x, s.t, 0.12);
  if (s.animal === 'bee') animal.addMono(buzz(), s.t, 0.5, s.side * 0.4);
  animal.addMono(I.thud(90, 0.07), s.t, 0.4);
}

// ---------- the band ----------
const K = I.kick(), KS = I.kick({ punch: 0.7, tail: 0.25 }), SN = I.snare(), CL = I.clap(), CLB = I.clap({ spread: 1.4 });
const HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18), SH = [I.shaker(1, 15), I.shaker(0.6, 16)];
const kicks = [];
const strum = (c, t, gain, up, dur) => c.notes.forEach((n, i) => {
  const g = I.guitar(n + 12, dur, { bright: 0.55, sustain: 0.992, seed: n + (up ? 7 : 0) });
  uke.addMono(g, t + (up ? c.notes.length - 1 - i : i) * 0.012, gain, (i - 1) * 0.25);
});
for (const s of segs) {
  const party = s.type === 'chorus' || s.type === 'final';
  if (s.type === 'verse' || party) {
    clock.eachStep(s.b0, s.b0 + s.bars, 16, (t, b, st) => {
      const i = b - s.b0, c = sc.chordAt(t), R = c.bass + 12;
      const stop = party && i === 7; // the band stops for "Yay!"
      if (stop) { if (st === 0) { drums.addMono(K, t, 0.95); drums.addMono(CR, t, 0.4); bass.addMono(I.bass(R, 1.2, { sub: 0.8 }), t, 0.6); strum(c, t, 0.5, false, 1.6); } return; }
      // drums
      if (party ? st % 4 === 0 : st % 8 === 0) { drums.addMono(party ? K : KS, t, party ? 0.9 : 0.75); kicks.push(t); }
      if (st % 8 === 4) { drums.addMono(CL, t, party ? 0.55 : 0.32); verb.addMono(CL, t, 0.18); }
      if (st % 2 === 0) drums.addMono(st % 4 === 2 ? HC[0] : SH[(st / 4) % 2 | 0], t, party ? 0.2 : 0.13, st % 4 === 2 ? -0.3 : 0.35);
      else if (party) drums.addMono(SH[1], t, 0.08, 0.35);
      if (s.type === 'verse' && i === 7 && st >= 12) drums.addMono(SN, t, 0.16 + (st - 12) * 0.05, 0.05); // a little roll into the chorus
      // bass
      if (st % 2 === 0) {
        const e = st / 2;
        if (party) bass.addMono(I.bass(e % 2 ? R + 12 : R, beatAt(t) * 0.4, { sub: 0.7 }), t, 0.5);
        else if (e === 0 || e === 3 || e === 4 || e === 6) bass.addMono(I.bass(e === 4 ? R + 7 : R, beatAt(t) * (e % 4 === 0 ? 0.7 : 0.35)), t, 0.5);
      }
      // ukulele
      if (st % 2 === 0) {
        const e = st / 2;
        if (party) strum(c, t, e % 2 ? 0.34 : 0.22, e % 2 === 1, 0.5);
        else if (e % 2 === 1) strum(c, t, 0.3, false, 0.4);
      }
    });
    drums.addMono(CR, s.t0, party ? 0.4 : 0.22, -0.2);
  }
  if (s.type === 'intro' && !sc.LULL) {
    for (let k = 0; k < 4; k++) drums.addMono(I.tom(200 - k * 30, 0.2), s.t1 - (4 - k) * 0.125, 0.3 + k * 0.05, (k - 1.5) * 0.3); // a tumble into the verse
    for (const c of sc.chords.filter((c) => c.t0 < s.t1)) strum(c, c.t0, 0.4, false, 1.5);
  }
  if (['wind', 'sleepy', 'lull', 'tail', 'end'].includes(s.type) || (s.type === 'intro' && sc.LULL)) {
    for (const c of sc.chords.filter((c) => c.t0 >= s.t0 - 1e-6 && c.t0 < s.t1 - 1e-6 && c.t0 >= T(s.b0) - 1e-6)) {
      const len = c.t1 - c.t0;
      for (const n of c.notes) { const { L, R } = I.padNote(n, len, { cutoff: 900, attack: 0.6, release: 1.6 }); pad.addStereo(L, R, c.t0, 0.1); }
      bass.addMono(I.bass(c.bass + 12, len * 0.8, { bright: 0.25, sub: 1 }), c.t0, 0.3);
      if (s.type !== 'end') [...c.notes, c.notes[1] + 12].forEach((n, i) => { // a slow guitar arpeggio
        const t = c.t0 + i * beatAt(c.t0); if (t < c.t1 - 0.05) { const g = I.guitar(n, 1.6, { bright: 0.3, sustain: 0.996, seed: n }); uke.addMono(g, t, 0.26, (i - 1.5) * 0.2); verb.addMono(g, t, 0.1); }
      });
    }
  }
}

// ---------- the tune: marimba by day, music box at night ----------
for (const n of sc.melody) {
  const night = ['lull', 'sleepy', 'tail', 'wind', 'end'].includes(n.type) || (n.type === 'intro');
  if (night) {
    const mb = I.musicBox(n.midi + 12);
    keys.addMono(mb, n.t, n.type === 'intro' ? 0.3 : 0.26); verb.addMono(mb, n.t, 0.2); dly.addMono(mb, n.t, 0.06);
  } else {
    const party = n.type !== 'verse';
    const x = I.marimba(n.midi, { thock: 0 });
    keys.addMono(x, n.t, party ? 0.42 : 0.34, -0.15); verb.addMono(x, n.t, 0.1);
    if (party) { const mb = I.musicBox(n.midi + 12); keys.addMono(mb, n.t, 0.16, 0.2); verb.addMono(mb, n.t, 0.1); }
  }
}

// ---------- the actions, each one tied to an event in the score ----------
for (const h of sc.hops) { fx.addMono(I.pop(1 + h.k * 0.18), h.t, 0.5); fx.addMono(I.boing(), h.t - 0.02, 0.22); }
for (const c of sc.claps) { fx.addMono(CLB, c.t, 0.9); verb.addMono(CLB, c.t, 0.3); }
for (const s of sc.stomps) { fx.addMono(I.thud(70, 0.11), s.t, 0.9); fx.addMono(I.tom(95, 0.22), s.t, 0.5); }
for (const y of sc.yays) { fx.addMono(I.fireworkBurst(Math.round(y.t * 10), 0.8), y.t + 0.02, 0.35); fx.addMono(I.subBoom(1.2), y.t, 0.4); }
for (const j of sc.jumps) fx.addMono(I.noiseSweep(j.t1 - j.t0, 500, 2400, { q: 1, pink: true }), j.t0, 0.14); // the whoosh of the jump
if (!sc.LULL) fx.addMono(I.pop(1.2), 0.3, 0.4);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks, { depth: 0.25 });
MIX.duck([keys, uke], vox, { depth: 0.4 }); // the band steps back while the words are said
const stems = {
  drums, bass, pad, uke, keys, vox, animal, fx,
  verb: reverb(verb, { room: 0.8, damp: 0.35 }),
  dly: pingpong(dly, 0.375, 0.3, 3500),
};
const GAIN = sc.LULL
  ? { drums: 0.4, bass: 0.6, pad: 2.6, uke: 2.2, keys: 0.6, vox: 1.9, animal: 1, fx: 0.7, verb: 1, dly: 1 }
  : { drums: 0.38, bass: 0.7, pad: 2.4, uke: 3.0, keys: 0.8, vox: 1.7, animal: 0.95, fx: 0.6, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
require('fs').mkdirSync(out, { recursive: true });
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
MIX.fadeOut(mix, DURATION - (sc.LULL || sc.FULL ? 1.6 : 0.5), DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || (sc.LULL ? '-16' : '-14')) });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`episode ${sc.EPN}: wrote out/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)})`);
