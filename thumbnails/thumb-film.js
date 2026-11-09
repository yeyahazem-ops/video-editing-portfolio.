// THUMBNAILS for ep01 «Yasin and the Window», drawn with the series toolkit.
// t < 1 → vertical 1080×1920 (Shorts/Reels/TikTok cover), t ≥ 1 → horizontal, in the top 1080×608 (YouTube 16:9).
// Render: copy over tota-shorts/film.js, `node engine/render.js stills 0.5 1.5`, crop, then restore film.js.
(function () {
  const K = globalThis.TK, Studio = globalThis.Studio, G = globalThis.G;
  const { stick, YASIN, house, HOUSE, brandBg, brandLetter, ball, word, stroke } = K;
  const TAU = Math.PI * 2, COLS = ['#FF4D5E', '#FFC93C', '#4CD964', '#B072FF', '#FF8A00'];
  function shards(c, cx, cy, n, spread, seed) { for (let i = 0; i < n; i++) { const a = G.rnd(i, seed) * TAU, d = spread * (0.3 + G.rnd(i, seed + 1) * 0.9); c.save(); c.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8); c.rotate(G.rnd(i, seed + 2) * 6); c.beginPath(); c.moveTo(0, -22); c.lineTo(26, 8); c.lineTo(-12, 22); c.closePath(); c.fillStyle = '#D6F0FB'; c.fill(); stroke(c, 4); c.restore(); } }
  function burst(c, cx, cy, r0, r1, n, col) { c.save(); c.fillStyle = col; c.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r0 : r1, a = (i / (n * 2)) * TAU; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fill(); stroke(c, 8); c.restore(); }
  function oops(c, x, y, size) { const s = 'OOPS!'; c.font = `700 ${size}px Baloo`; const ws = [...s].map((ch) => c.measureText(ch).width + 8), tot = ws.reduce((a, b) => a + b, 0); let px = x - tot / 2; [...s].forEach((ch, i) => { c.save(); c.translate(px + ws[i] / 2, y + (i % 2 ? 14 : -10)); c.rotate((i % 2 ? 1 : -1) * 0.08); brandLetter(c, ch, 0, 0, size, COLS[i]); c.restore(); px += ws[i]; }); }
  function face(c, x, gy, s) { stick(c, { ...YASIN, x, gy, s, eyes: 'wide', look: [0.6, -0.3], brows: -1, browUp: 1.2, mouth: 'o', open: 1, sweat: 1, hands: [[-170, -560], [170, -560]], elbows: [60, 60], tilt: -0.08 }, 0.4); }
  const win = (c, cx, cy, sc) => { c.save(); c.translate(cx, cy); c.scale(sc, sc); c.translate(-(HOUSE.x + 110 + 130), -(HOUSE.y + 300 + 130)); house(c, 0, { win: 'broken' }); c.restore(); };
  function vertical(c) {
    brandBg(c, 2.0);
    win(c, 560, 820, 0.85);
    burst(c, 560, 800, 160, 250, 14, '#FFF3A8'); word(c, 'CRASH!', 560, 800, 84, '#FF4D5E', { sw: 0.2, rot: -0.08 });
    shards(c, 560, 820, 16, 380, 7); ball(c, 760, 690, 52, 0.6);
    face(c, 520, 2860, 1.35);
    oops(c, 520, 300, 230);
    c.save(); c.translate(520, 1850); c.rotate(-0.03); c.beginPath(); c.roundRect(-300, -56, 600, 112, 56); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 8); word(c, 'BUBBLY TALES', 0, 4, 52, '#2B4C7E', { sw: 0 }); c.restore();
  }
  function horizontal(c) {
    c.save(); c.beginPath(); c.rect(0, 0, 1080, 608); c.clip();
    brandBg(c, 2.0);
    win(c, 800, 360, 0.55);
    burst(c, 800, 330, 100, 160, 14, '#FFF3A8'); word(c, 'CRASH!', 800, 330, 54, '#FF4D5E', { sw: 0.2, rot: -0.08 });
    shards(c, 800, 340, 12, 240, 9); ball(c, 940, 250, 34, 0.6);
    face(c, 270, 1290, 0.95);
    oops(c, 300, 95, 140);
    c.restore();
  }
  Studio.film({ post: { vignette: 0, grain: 0, paper: 0 }, async init() { const f = new FontFace('Baloo', 'url(lib/fonts/baloo-700.woff2)', { weight: '700' }); document.fonts.add(await f.load()); },
    draw(ctx, t) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); if (t < 1) vertical(ctx); else horizontal(ctx); } });
})();
