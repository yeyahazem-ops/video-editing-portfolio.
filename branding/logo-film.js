// LOGOS: three channel-logo concepts drawn with the series' own cast. Each second of "time" is one logo,
// drawn in the top 1080×1080 of the frame (cropped to a square afterwards).
(function () {
  const K = globalThis.TK, Studio = globalThis.Studio;
  const { stick, cat, YASIN, LAILA, LEO, word, stroke, star, heart, INK } = K;
  const TAU = Math.PI * 2, C = 540;
  function burst(c, cols, n = 18, spin = 0) { c.save(); c.translate(C, C); c.rotate(spin); for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 1000, (i / n) * TAU, ((i + 1) / n) * TAU); c.fill(); } c.restore(); }
  function ring(c, col = '#FFFFFF', w = 26) { c.beginPath(); c.arc(C, C, 520, 0, TAU); c.lineWidth = w; c.strokeStyle = col; c.stroke(); c.beginPath(); c.arc(C, C, 532, 0, TAU); stroke(c, 10); }
  // letters along an arc (top: concave down; bottom: concave up)
  function arcText(c, str, r, a0, size, cols, bottom = false) {
    c.save(); c.translate(C, C); c.font = `400 ${size}px Bungee`;
    const ws = [...str].map((ch) => c.measureText(ch).width + 4), total = ws.reduce((a, b) => a + b, 0), span = total / r;
    let a = a0 - (bottom ? -span / 2 : span / 2);
    [...str].forEach((ch, i) => { const w = ws[i] / r; const mid = bottom ? a - w / 2 : a + w / 2;
      c.save(); c.rotate(mid); c.translate(0, bottom ? r : -r); if (bottom) c.rotate(Math.PI); c.rotate(bottom ? Math.PI : 0);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = size * 0.22; c.strokeStyle = INK; c.strokeText(ch, 0, 0); c.fillStyle = cols[i % cols.length]; c.fillText(ch, 0, 0); c.restore();
      a += bottom ? -w : w; });
    c.restore();
  }
  const COLS = ['#FF5A4E', '#FFD23F', '#4FC3F7', '#7ED957'];
  // 1 · TOTA TALES: Yasin's grinning head in a sunburst, the name curved over and under
  function logo1(c) {
    burst(c, ['#FFB347', '#FFCF6E'], 20);
    c.fillStyle = 'rgba(255,255,255,0.0)';
    stick(c, { ...YASIN, x: C, gy: 1790, s: 1.3, eyes: 'happy', mouth: 'grin', tilt: -0.06, hands: [[-180, -560], [180, -560]], elbows: [30, 30] }, 0.3);
    arcText(c, 'TOTA', 430, 0, 130, COLS);
    c.save(); c.translate(C, 905); c.rotate(-0.04); c.beginPath(); c.roundRect(-330, -80, 660, 150, 75); c.fillStyle = '#2B4C7E'; c.fill(); stroke(c, 10); word(c, 'TALES', 0, -4, 120, '#FFFFFF', { sw: 0.16 }); c.restore();
    for (const [x, y, r] of [[190, 360, 34], [880, 330, 28], [860, 640, 22]]) star(c, x, y, r, '#FFF6B0', 0.3);
    ring(c);
  }
  // 2 · GIGGLE STREET: Yasin and Laila laughing on a street sign
  function logo2(c) {
    const g = c.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#6EC6F5'); g.addColorStop(1, '#C8ECFB'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1080);
    burst(c, ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)'], 24);
    stick(c, { ...YASIN, x: 380, gy: 1440, s: 0.95, eyes: 'squeeze', mouth: 'laugh', tears: 1, lean: -0.15, tilt: -0.1, hands: [[-70, -100], [140, -95]], elbows: [60, 60] }, 0.25);
    stick(c, { ...LAILA, x: 740, gy: 1400, s: 0.8, eyes: 'squeeze', mouth: 'laugh', tears: 1, lean: 0.12, tilt: 0.08, hands: [[-70, -100], [140, -95]], elbows: [60, 60] }, 0.55);
    c.save(); c.translate(C, 905); c.rotate(-0.05);
    c.beginPath(); c.moveTo(0, 60); c.lineTo(0, 400); stroke(c, 26); c.beginPath(); c.moveTo(0, 60); c.lineTo(0, 400); stroke(c, 14, '#9AA3AD');
    c.beginPath(); c.roundRect(-400, -110, 800, 200, 30); c.fillStyle = '#2E9E5B'; c.fill(); stroke(c, 10); c.beginPath(); c.roundRect(-380, -92, 760, 164, 22); c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.stroke();
    word(c, 'GIGGLE', 0, -38, 92, '#FFFFFF', { sw: 0 }); word(c, 'STREET', 0, 42, 64, '#FFD23F', { sw: 0 });
    c.restore();
    ring(c, '#FFD23F');
  }
  // 3 · YASIN & FRIENDS: the whole gang under a ribbon
  function logo3(c) {
    burst(c, ['#FF8FB8', '#FFB3D0'], 20);
    stick(c, { ...LEO, x: 270, gy: 1560, s: 0.9, eyes: 'happy', mouth: 'grin', tilt: -0.1, hands: [[-180, -560], [180, -560]], elbows: [30, 30] }, 0.4);
    stick(c, { ...LAILA, x: 820, gy: 1520, s: 0.78, eyes: 'happy', mouth: 'grin', tilt: 0.1, hands: [[-180, -560], [180, -560]], elbows: [30, 30] }, 0.6);
    stick(c, { ...YASIN, x: C, gy: 1700, s: 1.1, eyes: 'happy', mouth: 'grin', hands: [[-180, -560], [180, -560]], elbows: [30, 30] }, 0.2);
    cat(c, { x: 690, gy: 1060, s: 0.5, eyes: 'happy' }, 0.3);
    c.save(); c.translate(C, 250);
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 330, -40); c.lineTo(sd * 460, -40); c.lineTo(sd * 420, 20); c.lineTo(sd * 460, 80); c.lineTo(sd * 330, 80); c.closePath(); c.fillStyle = '#C23A44'; c.fill(); stroke(c, 8); }
    c.beginPath(); c.roundRect(-360, -80, 720, 170, 20); c.fillStyle = '#FF5A4E'; c.fill(); stroke(c, 10);
    word(c, 'YASIN', 0, -22, 96, '#FFFFFF', { sw: 0 }); word(c, '& FRIENDS', 0, 54, 50, '#FFD23F', { sw: 0 });
    c.restore();
    for (const [x, y] of [[140, 560], [940, 560]]) heart(c, x, y, 2.2);
    ring(c);
  }
  const LOGOS = [logo1, logo2, logo3];
  Studio.film({ post: { vignette: 0, grain: 0, paper: 0 }, draw(ctx, t) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1080, 1920);
    const f = LOGOS[Math.min(2, Math.floor(t))]; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1080); ctx.clip(); f(ctx); ctx.restore();
  } });
})();
