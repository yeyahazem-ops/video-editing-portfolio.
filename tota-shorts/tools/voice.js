// node tools/voice.js ep02 — renders every line of an episode with ElevenLabs (cached in out/.vo-cache under
// the engine's 'none' key, so Voice.speak({ engine: 'none' }) picks it up with real word timings), then lays
// the lines out one after another and writes episodes/<ep>/timing.js (line start/end times, duration).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const Voice = require('../engine/audio/voice');
const EP = process.argv[2];
const SCRIPT = require(`../episodes/${EP}/script`);
const VOICES = { narrator: 'JBFqnCBsd6RMkjVDRZzb', yasin: 'cgSgspJ2msm6clMCkdW9', fathy: 'pqHfZKP75CvOlQylNhV4', laila: 'FGY2WhTYpPnrIDTdsKH5', leo: 'TX3LPaxmHKxFdv7VOQHJ' };
const CACHE = path.join(__dirname, '..', 'out', '.vo-cache'); fs.mkdirSync(CACHE, { recursive: true });
const clean = (s) => String(s).replace(/\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim();
const key = (voice, text) => crypto.createHash('sha1').update(JSON.stringify(['none', voice, 0, clean(text)])).digest('hex').slice(0, 16);
let t = 0.25; const lines = {};
for (const l of SCRIPT.lines) {
  const voice = VOICES[l.who], k = key(voice, l.text);
  if (!fs.existsSync(path.join(CACHE, k + '.f32'))) {
    const tmp = path.join(CACHE, k + '.req.json');
    fs.writeFileSync(tmp, JSON.stringify({ text: l.text, model_id: 'eleven_multilingual_v2', language_code: 'en', voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 } }));
    const d = JSON.parse(execFileSync('curl', ['-sS', '-X', 'POST', `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, '-H', 'xi-api-key: proxy-injected', '-H', 'Content-Type: application/json', '--data-binary', '@' + tmp], { maxBuffer: 1 << 28 }).toString());
    fs.rmSync(tmp);
    if (!d.audio_base64) throw new Error(`${l.id}: ${JSON.stringify(d.detail || d)}`);
    const mp3 = path.join(CACHE, k + '.mp3'); fs.writeFileSync(mp3, Buffer.from(d.audio_base64, 'base64'));
    const audio = Voice.decode(mp3), a = d.alignment, words = []; let cur = null;
    a.characters.forEach((ch, i) => { if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; } if (!cur) cur = { w: '', t: a.character_start_times_seconds[i], end: 0 }; cur.w += ch; cur.end = a.character_end_times_seconds[i]; });
    if (cur) words.push(cur);
    const ws = words.filter((w) => /[\p{L}\p{N}]/u.test(w.w)).map((w) => ({ w: w.w.replace(/[^\p{L}\p{N}']+$/u, '').replace(/^[^\p{L}\p{N}]+/u, ''), t: +w.t.toFixed(3), end: +w.end.toFixed(3) }));
    fs.writeFileSync(path.join(CACHE, k + '.f32'), Buffer.from(audio.buffer, audio.byteOffset, audio.byteLength));
    fs.writeFileSync(path.join(CACHE, k + '.json'), JSON.stringify({ words: ws, silent: false }));
  }
  const dur = fs.statSync(path.join(CACHE, k + '.f32')).size / 4 / 48000;
  t += l.gap ?? 0;
  lines[l.id] = { t: +t.toFixed(3), end: +(t + dur).toFixed(3), who: l.who, voice, text: l.text };
  t += dur;
}
const TIMING = { lines, duration: +(t + 3.2).toFixed(3) };
fs.writeFileSync(path.join(__dirname, '..', 'episodes', EP, 'timing.js'), `(function () {\n  const TIMING = ${JSON.stringify(TIMING)};\n  if (typeof module !== 'undefined') module.exports = TIMING; else globalThis.TIMING = TIMING;\n})();\n`);
console.log(EP, 'duration', TIMING.duration.toFixed(1), Object.entries(lines).map(([id, l]) => `${id}@${l.t.toFixed(1)}`).join(' '));
