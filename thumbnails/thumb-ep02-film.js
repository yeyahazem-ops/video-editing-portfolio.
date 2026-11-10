// THUMBNAILS for ep02 «Yasin and the Sandwich»: t < 1 → vertical 1080×1920, t ≥ 1 → horizontal (top 1080×608).
// Render: copy over tota-shorts/film.js, `node engine/render.js stills 0.5 1.5`, crop, then restore film.js.
(function () {
  const K = globalThis.TK, Studio = globalThis.Studio;
  const { stick, YASIN, LEO, brandBg, brandLetter, sandwich, holdSandwich, star, word, stroke } = K;
  const TAU = Math.PI * 2, COLS = ['#FF4D5E', '#FFC93C', '#4CD964', '#B072FF', '#FF8A00', '#00B4D8', '#FF4D9A', '#FFC93C', '#4CD964', '#B072FF'];
  function title(c, s, x, y, size) { c.font = `700 ${size}px Baloo`; const ws = [...s].map((ch) => (ch === ' ' ? size * 0.3 : c.measureText(ch).width + 8)), tot = ws.reduce((a, b) => a + b, 0); let px = x - tot / 2; [...s].forEach((ch, i) => { if (ch !== ' ') { c.save(); c.translate(px + ws[i] / 2, y + (i % 2 ? 12 : -8)); c.rotate((i % 2 ? 1 : -1) * 0.07); brandLetter(c, ch, 0, 0, size, COLS[i % COLS.length]); c.restore(); } px += ws[i]; }); }
  // Yasin hugging his sandwich (sparkles around it), Leo beside him with big sad eyes
  function pair(c, yx, lx, gy, s) {
    stick(c, { ...LEO, x: lx, gy, s: s * 0.95, eyes: 'wide', look: [-0.9, 0.2], brows: -1, browUp: 1, mouth: 'sad', hands: [[-130, -60], [130, -60]], elbows: [60, 60], tilt: 0.12 }, 0.4);
    const r = stick(c, { ...YASIN, x: yx, gy, s, eyes: 'dot', look: [0.9, 0], brows: -0.6, browUp: 0.8, mouth: 'wavy', sweat: 1, hands: [[-40, -240], [70, -250]], elbows: [70, 70], tilt: -0.05 }, 0.4);
    const hd = r.P([15, -245]); sandwich(c, hd[0], hd[1] - 40, 1.25 * s / 0.95);
    for (let k = 0; k < 5; k++) { const a = k * 1.25 + 0.3; star(c, hd[0] + Math.cos(a) * 190 * s, hd[1] - 40 + Math.sin(a) * 120 * s, 18 + (k % 2) * 8, '#FFF6B0', a); }
  }
  function vertical(c) {
    brandBg(c, 2.0);
    pair(c, 310, 790, 2450, 1.35);
    title(c, 'SHARE IT?', 520, 330, 200);
    c.save(); c.translate(520, 1860); c.rotate(-0.03); c.beginPath(); c.roundRect(-300, -56, 600, 112, 56); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 8); word(c, 'BUBBLY TALES', 0, 4, 52, '#2B4C7E', { sw: 0 }); c.restore();
  }
  function horizontal(c) {
    c.save(); c.beginPath(); c.rect(0, 0, 1080, 608); c.clip();
    brandBg(c, 2.0);
    pair(c, 640, 920, 1090, 0.78);
    title(c, 'SHARE', 250, 210, 150); title(c, 'IT?', 250, 380, 150);
    c.restore();
  }
  Studio.film({ post: { vignette: 0, grain: 0, paper: 0 }, async init() { const f = new FontFace('Baloo', 'url(lib/fonts/baloo-700.woff2)', { weight: '700' }); document.fonts.add(await f.load()); },
    draw(ctx, t) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); if (t < 1) vertical(ctx); else horizontal(ctx); } });
})();
