// Pre-renders every voice line in score.js with ElevenLabs (text-to-speech with timestamps) and writes
// it into the engine's voice cache (out/.vo-cache) under the 'none' engine key, so song.js's
// Voice.speak(..., { engine: 'none' }) picks up real Arabic speech with real word timings.
//   node tools/eleven.js        (only lines not yet cached are requested)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const Voice = require('../engine/audio/voice');
const sc = require('../score');
const OUT = path.join(__dirname, '..', 'out'), CACHE = path.join(OUT, '.vo-cache');
fs.mkdirSync(CACHE, { recursive: true });
const clean = (s) => String(s).replace(/\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim();
const key = (l) => crypto.createHash('sha1').update(JSON.stringify(['none', l.voice || '', l.rate || 0, clean(l.text)])).digest('hex').slice(0, 16);

(async () => {
  for (const l of sc.vo) {
    const k = key(l);
    if (fs.existsSync(path.join(CACHE, k + '.f32'))) continue;
    const body = { text: l.say || l.text, model_id: 'eleven_multilingual_v2', language_code: l.lang || 'en', voice_settings: { stability: 0.5, similarity_boost: 0.75 } };
    const tmp = path.join(CACHE, k + '.req.json');
    fs.writeFileSync(tmp, JSON.stringify(body));
    const res = execFileSync('curl', ['-sS', '-X', 'POST', `https://api.elevenlabs.io/v1/text-to-speech/${l.voice}/with-timestamps?output_format=mp3_44100_128`,
      '-H', 'xi-api-key: proxy-injected', '-H', 'Content-Type: application/json', '--data-binary', '@' + tmp], { maxBuffer: 1 << 28 });
    fs.rmSync(tmp);
    const d = JSON.parse(res.toString());
    if (!d.audio_base64) throw new Error(`${l.text}: ${JSON.stringify(d.detail || d)}`);
    const mp3 = path.join(CACHE, k + '.mp3');
    fs.writeFileSync(mp3, Buffer.from(d.audio_base64, 'base64'));
    const audio = Voice.decode(mp3);
    // words from the character alignment (only when the spoken text is the displayed text)
    const a = d.alignment, words = [];
    if (!l.say) {
      let cur = null;
      a.characters.forEach((c, i) => {
        if (/\s/.test(c)) { if (cur) { words.push(cur); cur = null; } return; }
        if (!cur) cur = { w: '', t: a.character_start_times_seconds[i], end: 0 };
        cur.w += c; cur.end = a.character_end_times_seconds[i];
      });
      if (cur) words.push(cur);
    }
    const ws = words.filter((w) => /[\p{L}\p{N}]/u.test(w.w)).map((w) => ({ w: w.w.replace(/[^\p{L}\p{N}\p{M}]+$/u, '').replace(/^[^\p{L}\p{N}]+/u, ''), t: +w.t.toFixed(3), end: +w.end.toFixed(3) }));
    fs.writeFileSync(path.join(CACHE, k + '.f32'), Buffer.from(audio.buffer, audio.byteOffset, audio.byteLength));
    fs.writeFileSync(path.join(CACHE, k + '.json'), JSON.stringify({ words: ws, silent: false }));
    console.log(`${(audio.length / 48000).toFixed(2)}s  ${l.who}  ${l.text}`);
  }
  // durations of every line, for laying out the score
  for (const l of sc.vo) { const b = fs.statSync(path.join(CACHE, key(l) + '.f32')).size / 4 / 48000; console.log(`${l.id || ''}\tat ${l.at.toFixed(2)}\tdur ${b.toFixed(2)}\tends ${(l.at + b).toFixed(2)}`); }
})().catch((e) => { console.error(e.message); process.exit(1); });
