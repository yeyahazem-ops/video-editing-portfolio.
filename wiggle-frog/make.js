// THE WEEK — builds every episode: music, frames, the final MP4 and its sync check.
//   node make.js            all seven        node make.js 2 5        only those
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lyrics');
const eps = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(L.EPISODES);
fs.mkdirSync(path.join(__dirname, 'videos'), { recursive: true });
const run = (args, env) => execFileSync('node', args, { cwd: __dirname, stdio: 'inherit', env: { ...process.env, ...env } });
for (const n of eps) {
  const ep = L.EPISODES[n], env = { EPISODE: String(n) };
  console.log(`\n=== day ${n}: ${ep.slug} ===`);
  fs.writeFileSync(path.join(__dirname, 'episode.js'), `(function(){const E=${n}; if (typeof module!=='undefined') module.exports=E; else globalThis.EPISODE=E;})();\n`);
  run(['song.js'], env);
  run(['engine/render.js', 'video'], env);
  run(['engine/render.js', 'mux', ep.slug], env);
  try { run(['engine/render.js', 'verify', ep.slug], env); } catch (e) { console.log(`!! verify failed for ${ep.slug}`); }
  fs.copyFileSync(path.join(__dirname, 'out', `${ep.slug}.mp4`), path.join(__dirname, 'videos', `${ep.slug}.mp4`));
}
