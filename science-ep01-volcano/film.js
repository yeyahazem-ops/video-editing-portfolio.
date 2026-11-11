// Bubbly Tales · Science · «How a Volcano Erupts» — flat explainer, one comic-action beat at the BOOM.
// Every frame is a pure function of t; all times come from score.js (measured narration).
(function () {
  const G = globalThis.G, S = globalThis.SCORE, Shots = globalThis.Shots, Studio = globalThis.Studio, U = globalThis.U;
  const W = G.W, H = G.H, L = S.L, ev = S.ev, TAU = Math.PI * 2, INK = '#141414';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
  const io = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const outBack = (k, s = 1.8) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const ramp = (t, t0, d) => io(clamp((t - t0) / d)), lin = (t, t0, d) => clamp((t - t0) / d);
  const pop = (t, t0, d = 0.3, s = 2.2) => (t < t0 ? 0 : outBack(clamp((t - t0) / d), s));
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let VO = null, SUBS = [], LOGO = null;
  // ---------- drawing helpers ----------
  const grad = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([k, col]) => g.addColorStop(k, col)); return g; };
  const rad = (c, x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([k, col]) => g.addColorStop(k, col)); return g; };
  function text(c, s, x, y, size, fill, o = {}) {
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); const k = o.scale ?? 1; if (k <= 0.001) { c.restore(); return; } c.scale(k, k);
    c.font = `${o.weight || 700} ${size}px ${o.font || 'Baloo'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    if (o.alpha != null) c.globalAlpha = o.alpha;
    if (o.shadow) { c.fillStyle = o.shadow; c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.shadow; c.strokeText(s, size * 0.05, size * 0.08); c.fillText(s, size * 0.05, size * 0.08); }
    if (o.lw !== 0) { c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.stroke || INK; c.strokeText(s, 0, 0); }
    c.fillStyle = fill; c.fillText(s, 0, 0); c.restore();
  }
  function label(c, s, x, y, k, o = {}) { // a pill label with an optional pointer
    if (k <= 0.001) return; c.save(); c.font = `700 ${o.size || 46}px Baloo`; const w = c.measureText(s).width + 50, h = (o.size || 46) * 1.45;
    if (o.to) { c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, o.to[0], clamp(k)), lerp(y, o.to[1], clamp(k))); c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.setLineDash([14, 12]); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(o.to[0], o.to[1], 10 * clamp(k), 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); }
    c.translate(x, y); c.scale(k, k); c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, h / 2); c.fillStyle = o.bg || '#FFFFFF'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    c.fillStyle = o.col || INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 3); c.restore();
  }
  function blob(c, x, y, r, t, amp = 0.06, seed = 0) {
    c.beginPath(); for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU, rr = r * (1 + amp * Math.sin(3 * a + t * 2.1 + seed) + amp * 0.6 * Math.sin(5 * a - t * 1.7 + seed * 2)); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath();
  }
  const magmaFill = (c, x, y, r) => rad(c, x, y - r * 0.2, r * 0.05, r * 1.1, [[0, '#FFF3A8'], [0.35, '#FFB627'], [0.7, '#FF6B35'], [1, '#C9184A']]);
  function glow(c, x, y, r, col, a = 1) { c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter'; c.fillStyle = rad(c, x, y, 0, r, [[0, col], [1, 'rgba(0,0,0,0)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
  function eyes(c, x, y, sep, size, open, t, o = {}) { // open: 0 closed (sleepy arcs) .. 1 wide open
    for (const s of [-1, 1]) {
      const ex = x + s * sep; c.save(); c.translate(ex, y);
      if (open < 0.05) { c.beginPath(); c.arc(0, -size * 0.2, size * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = size * 0.22; c.strokeStyle = o.ink || INK; c.lineCap = 'round'; c.stroke(); }
      else {
        if (o.glow) glow(c, 0, 0, size * 3, 'rgba(255,140,40,0.55)', open);
        c.beginPath(); c.ellipse(0, 0, size, size * open, 0, 0, TAU); c.fillStyle = o.white || '#FFFFFF'; c.fill(); c.lineWidth = size * 0.16; c.strokeStyle = INK; c.stroke();
        c.save(); c.clip(); c.beginPath(); c.ellipse((o.look || 0) * size * 0.3, size * 0.1, size * (o.slit ? 0.3 : 0.5), size * 0.6, 0, 0, TAU); c.fillStyle = INK; c.fill(); c.beginPath(); c.arc(-size * 0.15, -size * 0.2, size * 0.16, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.restore();
        if (o.brow) { c.beginPath(); c.moveTo(-size * 1.1, -size * (1.2 + 0.3 * s * -1 * 0)); c.lineTo(size * 1.0, -size * 1.0 - s * size * 0.35 * -1); c.lineWidth = size * 0.26; c.lineCap = 'round'; c.strokeStyle = INK; c.stroke(); }
      }
      c.restore();
    }
  }
  function zzz(c, x, y, t, t0, a = 1) { for (let i = 0; i < 3; i++) { const p = ((t - t0) * 0.5 + i / 3) % 1; text(c, 'Z', x + p * 90 + Math.sin(p * 6) * 14, y - p * 200, 40 + p * 50, '#FFFFFF', { alpha: a * Math.sin(p * Math.PI), lw: 8 }); } }
  // ---------- the cross-section (scenes 1, 3, 4, 6) ----------
  const SURF = 640, CH = { x: 540, y: 1150, rx: 330, ry: 150 }, PEAK = { x: 540, y: 310 };
  function sky(c, t) {
    c.fillStyle = grad(c, 0, SURF, [[0, '#5FB8FF'], [1, '#CDEBFF']]); c.fillRect(-200, -200, W + 400, SURF + 200);
    c.save(); c.globalAlpha = 0.9; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 3; i++) { const x = ((i * 430 + t * 18) % 1500) - 200, y = 160 + i * 90; c.beginPath(); c.ellipse(x, y, 90, 34, 0, 0, TAU); c.ellipse(x + 60, y - 22, 60, 36, 0, 0, TAU); c.ellipse(x - 55, y - 12, 46, 28, 0, 0, TAU); c.fill(); } c.restore();
    c.beginPath(); c.arc(900, 140, 60, 0, TAU); c.fillStyle = '#FFD23F'; c.fill();
  }
  function mountainPath(c, b = 0, sx = 0) { // b: bulge 0..1
    const py = PEAK.y - 40 * b; c.beginPath(); c.moveTo(80 - 30 * b, SURF);
    c.quadraticCurveTo(300 - 40 * b, 470 - 40 * b, PEAK.x - 70 + sx, py); c.lineTo(PEAK.x - 34, py + 26); c.lineTo(PEAK.x + 34, py + 26); c.lineTo(PEAK.x + 70 + sx, py);
    c.quadraticCurveTo(780 + 40 * b, 470 - 40 * b, 1000 + 30 * b, SURF); c.closePath();
  }
  function section(c, t, o = {}) {
    sky(c, t);
    // ground layers
    const bands = [[SURF, '#A9744F'], [SURF + 110, '#86563D'], [SURF + 360, '#6A4231'], [SURF + 700, '#4E2E25']];
    bands.forEach(([y, col], i) => { c.beginPath(); c.moveTo(-200, y); for (let x = -200; x <= W + 200; x += 40) c.lineTo(x, y + (i ? 14 * Math.sin(x * 0.012 + i * 2) : 0)); c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fillStyle = col; c.fill(); });
    c.save(); c.globalAlpha = 0.18; c.fillStyle = '#000000'; for (let i = 0; i < 60; i++) { const x = rnd(i) * W, y = SURF + 140 + rnd(i + 99) * 1100; c.beginPath(); c.ellipse(x, y, 16 + rnd(i + 7) * 26, 9 + rnd(i + 3) * 12, rnd(i) * 3, 0, TAU); c.fill(); } c.restore();
    c.fillStyle = '#4CAF50'; c.fillRect(-200, SURF - 14, W + 400, 22);
    if (o.mountain) {
      mountainPath(c, o.bulge || 0); c.fillStyle = '#8A6248'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
      c.save(); mountainPath(c, o.bulge || 0); c.clip(); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(PEAK.x, 0, 600, SURF); c.restore();
      (o.cracks || []).forEach((k, i) => { if (k <= 0) return; const sd = i % 2 ? 1 : -1, x0 = PEAK.x + sd * (90 + i * 60), y0 = 360 + i * 70; c.beginPath(); c.moveTo(x0, y0); for (let j = 1; j <= 5 * k; j++) c.lineTo(x0 + sd * j * 26 + (j % 2 ? 14 : -14), y0 + j * 34); c.lineWidth = 12; c.strokeStyle = '#FF6B35'; c.lineCap = 'round'; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#FFE066'; c.stroke(); glow(c, x0, y0 + 80, 160, 'rgba(255,120,40,0.6)', k); });
    }
    // the chamber and the pipe
    const fill = o.chamber ?? 0, pipe = o.pipe ?? 0, pulse = o.pulse || 0;
    if (o.mountain || o.chamberShow) {
      c.beginPath(); c.moveTo(PEAK.x - 24, PEAK.y + 30 - 40 * (o.bulge || 0)); c.bezierCurveTo(PEAK.x - 70, 650, PEAK.x + 40, 850, PEAK.x - 24, CH.y - CH.ry + 20); c.lineTo(PEAK.x + 24, CH.y - CH.ry + 20); c.bezierCurveTo(PEAK.x + 88, 850, PEAK.x - 22, 650, PEAK.x + 24, PEAK.y + 30 - 40 * (o.bulge || 0)); c.closePath();
      c.fillStyle = '#3A2420'; c.fill(); c.save(); c.clip(); const top = lerp(CH.y - CH.ry + 20, PEAK.y + 20, pipe); c.fillStyle = magmaFill(c, PEAK.x, top + 200, 500); c.fillRect(0, top, W, 2000); c.restore();
      c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    }
    if (fill > 0 || o.chamberShow) {
      glow(c, CH.x, CH.y, 520 + 60 * pulse, 'rgba(255,110,40,0.5)', clamp(fill) * (0.6 + 0.4 * pulse));
      c.save(); c.beginPath(); c.ellipse(CH.x, CH.y, CH.rx, CH.ry, 0, 0, TAU); c.fillStyle = '#3A2420'; c.fill(); c.clip();
      const lvl = CH.y + CH.ry - 2 * CH.ry * fill; c.beginPath(); c.moveTo(0, lvl); for (let x = 0; x <= W; x += 20) c.lineTo(x, lvl + 8 * Math.sin(x * 0.03 + t * 4)); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fillStyle = magmaFill(c, CH.x, CH.y + 40, 380); c.fill();
      for (let i = 0; i < 14; i++) { const p = (t * 0.6 + rnd(i)) % 1, bx = CH.x - 280 + rnd(i + 5) * 560, by = CH.y + CH.ry - p * 2 * CH.ry * fill; if (by < lvl) continue; c.beginPath(); c.arc(bx, by, 6 + rnd(i + 2) * 10, 0, TAU); c.fillStyle = 'rgba(255,240,170,0.7)'; c.fill(); }
      c.restore(); c.beginPath(); c.ellipse(CH.x, CH.y, CH.rx, CH.ry, 0, 0, TAU); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
    }
  }
  function house(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-60, -90, 120, 90); c.fillStyle = '#FFF4E0'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(-78, -86); c.lineTo(0, -150); c.lineTo(78, -86); c.closePath(); c.fillStyle = '#FF6B4A'; c.fill(); c.stroke(); c.beginPath(); c.rect(-18, -50, 36, 50); c.fillStyle = '#2B4C7E'; c.fill(); c.stroke(); c.restore(); }
  function tree(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7A4E2D'; c.fillRect(-10, -70, 20, 70); c.beginPath(); c.arc(0, -100, 52, 0, TAU); c.fillStyle = '#3E8E6A'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.restore(); }
  function person(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 9; c.strokeStyle = INK; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, 0); c.lineTo(0, -60); c.lineTo(22, 0); c.moveTo(0, -60); c.lineTo(0, -130); c.moveTo(-30, -95 + 6 * Math.sin(t * 5)); c.lineTo(0, -115); c.lineTo(30, -95 - 6 * Math.sin(t * 5)); c.stroke(); c.beginPath(); c.arc(0, -160, 28, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.stroke(); c.restore(); }
  // ---------- scenes ----------
  function hook(c, t) {
    section(c, t, {}); house(c, 220, SURF - 6, 1.1); tree(c, 860, SURF - 6, 1.1); person(c, 560, SURF - 6, 0.9, t);
    label(c, 'YOU', 560, 420, pop(t, 0.5), { to: [560, SURF - 190], bg: '#FFD23F' });
    const r = 230 * pop(t, 0.15, 0.6, 1.4), y = CH.y - 20;
    glow(c, CH.x, y, r * 2.4, 'rgba(255,100,30,0.55)', 0.8 + 0.2 * Math.sin(t * 3));
    blob(c, CH.x, y, r * (1 + 0.03 * Math.sin(t * 2.5)), t, 0.07); c.fillStyle = magmaFill(c, CH.x, y, r); c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    if (r > 50) { eyes(c, CH.x, y - 30, 80, 42, 0, t); c.beginPath(); c.arc(CH.x, y + 60, 26, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 9; c.stroke(); zzz(c, CH.x + 160, y - 120, t, 0); }
  }
  function magma(c, t) {
    const t0 = L.magma.t; c.fillStyle = grad(c, 0, H, [[0, '#2A0E12'], [1, '#5A1414']]); c.fillRect(-200, -200, W + 400, H + 400);
    // the bubbling pool
    const lvl = 980; glow(c, 420, lvl + 200, 800, 'rgba(255,90,30,0.45)');
    c.beginPath(); c.moveTo(-200, lvl); for (let x = -200; x <= W + 200; x += 20) c.lineTo(x, lvl + 18 * Math.sin(x * 0.02 + t * 3) + 10 * Math.sin(x * 0.047 - t * 4)); c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fillStyle = magmaFill(c, 420, lvl + 260, 900); c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    for (let i = 0; i < 10; i++) { const per = 1.1 + rnd(i) * 0.8, p = ((t + rnd(i + 9) * 3) % per) / per, x = 80 + rnd(i + 4) * 600, rr = 20 + 50 * p; c.save(); c.globalAlpha = 1 - p * p; c.beginPath(); c.arc(x, lvl + 10 - rr * 0.4, rr, Math.PI, TAU); c.lineWidth = 7; c.strokeStyle = '#FFE066'; c.stroke(); c.restore(); }
    for (let i = 0; i < 16; i++) { const p = ((t * 0.35 + rnd(i)) % 1), x = 60 + rnd(i + 30) * 640 + Math.sin(t * 2 + i) * 20; c.beginPath(); c.arc(x, lvl - p * 700, 6 * (1 - p), 0, TAU); c.fillStyle = `rgba(255,200,80,${0.8 * (1 - p)})`; c.fill(); }
    text(c, 'MAGMA', 380, 420, 150, '#FFD23F', { scale: pop(t, t0 + 0.25, 0.4, 2.4), shadow: '#C9184A', lw: 18 });
    text(c, '= MELTED ROCK', 380, 560, 66, '#FFFFFF', { scale: pop(t, t0 + 0.9, 0.35) });
    // thermometer
    const tx = 880, top = 300, bot = 1120, k = ramp(t, t0 + 1.0, ev.hot - t0 - 1.0), sc = pop(t, t0 + 0.4, 0.4, 1.6);
    c.save(); c.translate(tx, bot); c.scale(sc, sc); c.translate(-tx, -bot);
    c.beginPath(); c.roundRect(tx - 40, top, 80, bot - top, 40); c.arc(tx, bot + 30, 72, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
    const my = lerp(bot, top + 50, k); c.beginPath(); c.roundRect(tx - 20, my, 40, bot - my + 10, 20); c.arc(tx, bot + 30, 50, 0, TAU); c.fillStyle = k > 0.95 ? '#FF3B30' : '#FF6B35'; c.fill();
    for (const [v, s] of [[250, 'OVEN 250°'], [1200, '']]) { const y = lerp(bot, top + 50, v / 1200); c.beginPath(); c.moveTo(tx - 40, y); c.lineTo(tx - 70, y); c.lineWidth = 6; c.stroke(); if (s) text(c, s, tx - 180, y, 40, '#FFFFFF', { alpha: clamp(k * 6), lw: 8 }); }
    c.restore();
    text(c, `${Math.round(1200 * k).toLocaleString('en-US')}°C`, tx - 90, top - 70, 92, k > 0.99 ? '#FFD23F' : '#FFFFFF', { scale: sc * (1 + 0.25 * Math.exp(-Math.max(0, t - ev.hot) * 6) * (t >= ev.hot ? 1 : 0)), lw: 16 });
    if (t >= ev.hot) glow(c, tx, top, 300, 'rgba(255,220,120,0.8)', Math.exp(-(t - ev.hot) * 3));
  }
  function chamber(c, t) {
    section(c, t, { mountain: true, chamber: 0.12 + 0.83 * ramp(t, L.chamber.t + 0.2, 2.8) });
    for (let i = 0; i < 5; i++) { const p = ((t - L.chamber.t) * 0.7 + i / 5) % 1, x = CH.x - 220 + i * 110, y = lerp(1820, CH.y + CH.ry - 30, io(p)); blob(c, x, y, 26 * (1 - 0.3 * p), t, 0.1, i); c.fillStyle = magmaFill(c, x, y, 30); c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); }
    label(c, 'MAGMA CHAMBER', 540, 830, pop(t, L.chamber.t + 1.1, 0.35), { bg: '#FFD23F', to: [430, CH.y - 40], size: 50 });
  }
  function rises(c, t) {
    const t0 = L.rises.t; section(c, t, { mountain: true, chamber: 0.95, pulse: 0.5 + 0.5 * Math.sin(t * 3) });
    for (let i = 0; i < 4; i++) { const p = ((t - t0) * 0.32 + i / 4) % 1, x = [250, 830, 360, 720][i] + Math.sin(p * 5 + i) * 30, y = lerp(CH.y - 40, SURF + 120, io(p)); c.save(); c.globalAlpha = Math.sin(p * Math.PI) * 1.4; blob(c, x, y, 48, t, 0.1, i); c.fillStyle = magmaFill(c, x, y, 52); c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(x, y - 64); c.lineTo(x, y - 120); c.moveTo(x - 18, y - 100); c.lineTo(x, y - 122); c.lineTo(x + 18, y - 100); c.lineWidth = 8; c.strokeStyle = '#FFFFFF'; c.lineCap = 'round'; c.stroke(); c.restore(); }
    label(c, 'LIGHTER ↑', 260, 720, pop(t, t0 + 1.2, 0.3), { bg: '#FFD23F', size: 50 });
    label(c, 'HEAVY ROCK ↓', 540, 1350, pop(t, t0 + 0.4, 0.3), { size: 44 });
  }
  function gas(c, t) {
    const t0 = L.gas.t, cap = ev.cap; c.fillStyle = grad(c, 0, H, [[0, '#2EC4B6'], [1, '#14213D']]); c.fillRect(-200, -200, W + 400, H + 400);
    c.save(); c.globalAlpha = 0.12; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(rnd(i) * W, (rnd(i + 5) * H - t * 60 * (0.5 + rnd(i))) % H + H * (rnd(i) > 0.5 ? 0 : 0.3), 30 + rnd(i + 2) * 60, 0, TAU); c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.stroke(); } c.restore();
    const shake = t < cap ? ramp(t, t0 + 0.3, 1.2) : Math.exp(-(t - cap) * 4), ang = 0.28 * shake * Math.sin(t * 26), cx = 540, by = 1220;
    c.save(); c.translate(cx, by); c.rotate(ang);
    c.beginPath(); c.moveTo(-120, 0); c.lineTo(-120, -380); c.quadraticCurveTo(-120, -470, -42, -540); c.lineTo(-42, -620); c.lineTo(42, -620); c.lineTo(42, -540); c.quadraticCurveTo(120, -470, 120, -380); c.lineTo(120, 0); c.quadraticCurveTo(120, 30, 90, 30); c.lineTo(-90, 30); c.quadraticCurveTo(-120, 30, -120, 0); c.closePath();
    c.fillStyle = 'rgba(120,230,170,0.85)'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    c.save(); c.clip(); c.fillStyle = '#8B4A1C'; c.fillRect(-140, -420, 280, 460); const nb = 8 + Math.round(40 * shake); for (let i = 0; i < nb; i++) { const p = ((t * (0.6 + rnd(i)) + rnd(i + 3)) % 1); c.beginPath(); c.arc(-100 + rnd(i + 8) * 200, -p * 420 + 20, 5 + rnd(i) * 9, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill(); } c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-90, -400, 26, 380); c.restore();
    c.beginPath(); c.roundRect(-118, -300, 236, 120, 10); c.fillStyle = '#FF6B4A'; c.fill(); c.lineWidth = 6; c.stroke(); text(c, 'FIZZ', 0, -240, 64, '#FFFFFF', { lw: 10 });
    if (t < cap) { c.beginPath(); c.roundRect(-52, -660, 104, 50, 10); c.fillStyle = '#FFD23F'; c.fill(); c.lineWidth = 6; c.stroke(); }
    c.restore();
    if (shake > 0.2 && t < cap) for (const s of [-1, 1]) for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(cx, by - 300, 200 + j * 40, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); c.lineWidth = 7; c.strokeStyle = `rgba(255,255,255,${0.6 * shake})`; c.stroke(); }
    if (t >= cap) { const a = t - cap; const cy = by - 640 - 900 * a + 900 * a * a; c.save(); c.translate(cx + 120 * a, cy); c.rotate(a * 12); c.beginPath(); c.roundRect(-52, -25, 104, 50, 10); c.fillStyle = '#FFD23F'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.restore();
      for (let i = 0; i < 60; i++) { const sp = 700 + rnd(i) * 900, an = -Math.PI / 2 + (rnd(i + 1) - 0.5) * 0.9, x = cx + Math.cos(an) * sp * a, y = by - 640 + Math.sin(an) * sp * a + 900 * a * a; c.beginPath(); c.arc(x, y, 10 + rnd(i + 2) * 16, 0, TAU); c.fillStyle = i % 3 ? '#FFFFFF' : '#FFE9B0'; c.fill(); }
      text(c, 'POP!', 540, 420, 200, '#FFD23F', { font: 'Bungee', weight: 400, scale: pop(t, cap, 0.25, 3), rot: -0.1, shadow: '#FF6B4A', lw: 20 }); }
    else label(c, 'GAS BUBBLES', 540, 380, pop(t, t0 + 0.8, 0.3), { bg: '#FFFFFF' });
  }
  function gauge(c, x, y, r, k, t) {
    c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
    [['#4CAF50', 0, 0.45], ['#FFD23F', 0.45, 0.75], ['#FF3B30', 0.75, 1]].forEach(([col, a, b]) => { c.beginPath(); c.arc(0, 0, r * 0.74, Math.PI * (0.75 + 1.5 * a), Math.PI * (0.75 + 1.5 * b)); c.lineWidth = r * 0.2; c.strokeStyle = col; c.stroke(); });
    const ang = Math.PI * (0.75 + 1.5 * k) + (k > 0.9 ? 0.05 * Math.sin(t * 60) : 0); c.rotate(ang); c.beginPath(); c.moveTo(-10, 0); c.lineTo(r * 0.8, 0); c.lineWidth = 10; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.rotate(-ang); c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fillStyle = INK; c.fill(); c.restore();
  }
  function pressure(c, t) {
    const t0 = L.pressure.t, k = ramp(t, t0, ev.breath - t0), held = t >= ev.breath;
    const rum = ev.rumbles.reduce((a, x) => a + (t >= x ? Math.exp(-(t - x) * 8) : 0), 0);
    section(c, t, { mountain: true, chamber: 1, pipe: 0.15 + 0.8 * k, bulge: k, pulse: clamp(rum), cracks: ev.cracks.map((x) => ramp(t, x, 0.25)) });
    gauge(c, 260, 420, 110, k, t); text(c, 'PRESSURE', 260, 570, 44, '#FFFFFF', { lw: 10, scale: pop(t, t0 + 0.2, 0.3) });
    if (k > 0.75 && !held) text(c, '!', 340, 300, 110, '#FF3B30', { scale: 0.9 + 0.2 * Math.sin(t * 20), lw: 14 });
    if (held) { c.fillStyle = `rgba(0,0,0,${0.35 * ramp(t, ev.breath, 0.2)})`; c.fillRect(-200, -200, W + 400, H + 400); glow(c, PEAK.x, PEAK.y + 30, 260, 'rgba(255,220,120,0.9)', ramp(t, ev.breath, ev.boom - ev.breath)); }
  }
  function boom(c, t) {
    const a = t - ev.boom, cx = 540, cy = 1180;
    c.fillStyle = '#FFB627'; c.fillRect(-300, -300, W + 600, H + 600);
    c.save(); c.translate(cx, cy - 300); c.rotate(a * 0.3); for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2400, (i / 24) * TAU, ((i + 0.5) / 24) * TAU); c.closePath(); c.fillStyle = i % 2 ? '#FF6B35' : '#FF3B30'; c.fill(); } c.restore();
    c.save(); c.globalAlpha = 0.25; c.fillStyle = '#7A0F1E'; for (let y = 0; y < H; y += 36) for (let x = (y / 36) % 2 ? 18 : 0; x < W; x += 36) { const d = Math.hypot(x - cx, y - cy + 300) / 1100; c.beginPath(); c.arc(x, y, 3 + 10 * clamp(d), 0, TAU); c.fill(); } c.restore();
    // lava bombs + spray
    for (let i = 0; i < 26; i++) { const an = -Math.PI / 2 + (rnd(i) - 0.5) * 2.2, sp = 1300 + rnd(i + 4) * 1300, x = cx + Math.cos(an) * sp * a, y = cy - 200 + Math.sin(an) * sp * a + 1500 * a * a, r = 18 + rnd(i + 2) * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(an) * 120, y - Math.sin(an) * 120 + 60); c.lineWidth = r * 0.9; c.strokeStyle = 'rgba(255,230,120,0.8)'; c.lineCap = 'round'; c.stroke(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#C9184A'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); }
    // volcano silhouette with the fountain
    c.beginPath(); c.moveTo(-200, H + 200); c.lineTo(-200, 1700); c.lineTo(cx - 120, cy - 180); c.lineTo(cx + 120, cy - 180); c.lineTo(W + 200, 1700); c.lineTo(W + 200, H + 200); c.closePath(); c.fillStyle = '#2A1A22'; c.fill(); c.lineWidth = 12; c.strokeStyle = INK; c.stroke();
    const fh = 700 * pop(t, ev.boom, 0.25, 1.3); blob(c, cx, cy - 200 - fh * 0.5, fh * 0.4 + 40, t * 3, 0.12); c.fillStyle = magmaFill(c, cx, cy - 200 - fh * 0.5, fh * 0.5 + 60); c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    text(c, 'BOOM!', 540, 520, 230, '#FFF06A', { font: 'Bungee', weight: 400, rot: -0.08, scale: pop(t, ev.boom + 0.03, 0.3, 3.2) * (1 + 0.03 * Math.sin(t * 40)), shadow: '#7A0F1E', lw: 26 });
    if (a < 0.12) { c.fillStyle = `rgba(255,255,255,${1 - a / 0.12})`; c.fillRect(-300, -300, W + 600, H + 600); }
  }
  const VPK = { x: 540, y: 860 };
  function volcanoOut(c, t, o = {}) {
    c.fillStyle = grad(c, 0, 1300, [[0, '#1E1B3A'], [0.55, '#6A2C5A'], [1, '#FF7A45']]); c.fillRect(-200, -200, W + 400, 1600);
    c.beginPath(); c.moveTo(-200, 1320); c.lineTo(VPK.x - 90, VPK.y); c.lineTo(VPK.x + 90, VPK.y); c.lineTo(W + 200, 1320); c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fillStyle = '#3E3440'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.moveTo(VPK.x, VPK.y); c.lineTo(W + 200, 1320); c.lineTo(W + 200, VPK.y); c.fill(); c.restore();
    c.fillStyle = '#231C26'; c.fillRect(-200, 1320, W + 400, H); c.lineWidth = 10; c.strokeStyle = INK; c.beginPath(); c.moveTo(-200, 1320); c.lineTo(W + 200, 1320); c.stroke();
  }
  function lava(c, t) {
    const t0 = L.lava.t; volcanoOut(c, t);
    // ash column (older puffs drawn first, higher)
    for (let i = 0; i < 46; i++) { const tb = t0 - 2.4 + i * 0.12, a = t - tb; if (a < 0) continue; const y = VPK.y - 40 - a * 300, x = VPK.x + Math.sin(i * 1.7) * 30 * a + a * a * 6, r = 70 + a * 48; if (y < -400) continue; c.beginPath(); c.arc(x, y, r, 0, TAU); const g = 90 + Math.round(rnd(i) * 40); c.fillStyle = `rgb(${g},${g - 6},${g + 4})`; c.fill(); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); }
    glow(c, VPK.x, VPK.y, 360, 'rgba(255,140,40,0.7)', 0.8 + 0.2 * Math.sin(t * 9));
    // fountain
    for (let i = 0; i < 30; i++) { const per = 0.9, p = ((t + rnd(i) * per) % per) / per, an = -Math.PI / 2 + (rnd(i + 3) - 0.5) * 1.1, sp = 600 + rnd(i + 9) * 300, x = VPK.x + Math.cos(an) * sp * p, y = VPK.y + Math.sin(an) * sp * p + 700 * p * p; c.beginPath(); c.arc(x, y, 10 + rnd(i) * 12, 0, TAU); c.fillStyle = p < 0.5 ? '#FFE066' : '#FF6B35'; c.fill(); }
    // lava rivers
    const paths = [[[0, 0], [-60, 120], [-30, 230], [-120, 340], [-160, 460]], [[20, 0], [90, 140], [70, 260], [170, 380], [240, 460]], [[-10, 0], [10, 160], [-20, 300], [30, 460]]];
    paths.forEach((p, j) => { const k = ramp(t, t0 + 0.1 + j * 0.3, 2.6), n = (p.length - 1) * k; c.beginPath(); c.moveTo(VPK.x + p[0][0], VPK.y + p[0][1]); for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)); c.lineTo(VPK.x + lerp(p[i - 1][0], p[i][0], f), VPK.y + lerp(p[i - 1][1], p[i][1], f)); }
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 44; c.strokeStyle = INK; c.stroke(); c.lineWidth = 32; c.strokeStyle = '#FF6B35'; c.stroke(); c.lineWidth = 12; c.strokeStyle = '#FFE066'; c.stroke(); });
    c.beginPath(); c.ellipse(VPK.x, VPK.y + 4, 92, 22, 0, 0, TAU); c.fillStyle = '#FFB627'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
    // scale ruler + plane
    const rk = ramp(t, t0 + 2.0, 0.6), rx = 960, ry0 = VPK.y - 40, ry1 = lerp(ry0, 260, rk);
    if (rk > 0) { c.beginPath(); c.moveTo(rx, ry0); c.lineTo(rx, ry1); for (let y = ry0; y > ry1; y -= 60) { c.moveTo(rx - 16, y); c.lineTo(rx + 16, y); } c.lineWidth = 7; c.strokeStyle = '#FFFFFF'; c.stroke(); }
    label(c, '10+ KM', 850, 220, pop(t, t0 + 2.4, 0.3), { bg: '#FFD23F', size: 52 });
    const px = -150 + (t - t0) * 260; c.save(); c.translate(px, 380); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 0, 50, 11, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(-30, -34); c.lineTo(6, 0); c.moveTo(-36, 0); c.lineTo(-50, -20); c.lineTo(-30, 0); c.fill(); c.restore();
  }
  function build(c, t) {
    const t0 = L.build.t, SEA = 930, FLOOR = 1380, LH = 58, NL = 9;
    c.fillStyle = grad(c, 0, SEA, [[0, '#7CC6FE'], [1, '#DDF3FF']]); c.fillRect(-200, -200, W + 400, SEA + 200);
    c.fillStyle = grad(c, SEA, H, [[0, '#2E86DE'], [1, '#0B2E63']]); c.fillRect(-200, SEA, W + 400, H);
    c.beginPath(); c.moveTo(-200, FLOOR); for (let x = -200; x <= W + 200; x += 40) c.lineTo(x, FLOOR + 10 * Math.sin(x * 0.02)); c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fillStyle = '#C2A26B'; c.fill();
    const hw = (y) => 440 - (FLOOR - y) * 0.62, tl = (i) => t0 + 0.35 + i * (ev.island - t0 - 0.35) / (NL - 1);
    const cols = ['#6B4F3F', '#7E5F4C', '#5C4335'];
    for (let i = 0; i < NL; i++) { const k = ramp(t, tl(i), 0.35); if (k <= 0) continue; const yb = FLOOR - i * LH, yt = yb - LH * k; c.beginPath(); c.moveTo(540 - hw(yb), yb); c.lineTo(540 - hw(yt), yt); c.lineTo(540 + hw(yt), yt); c.lineTo(540 + hw(yb), yb); c.closePath(); c.fillStyle = cols[i % 3]; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
      const hot = 1 - lin(t, tl(i) + 0.2, 0.8); if (hot > 0) { c.beginPath(); c.moveTo(540 - hw(yt), yt); c.lineTo(540 + hw(yt), yt); c.lineWidth = 12; c.strokeStyle = `rgba(255,140,40,${hot})`; c.stroke(); } }
    const island = t >= ev.island;
    if (island) { const k = pop(t, ev.island, 0.4, 2); const yt = FLOOR - NL * LH; c.save(); c.translate(540, yt); c.scale(k, k); c.beginPath(); c.ellipse(0, 4, hw(yt) + 30, 26, 0, Math.PI, TAU); c.fillStyle = '#F4D58D'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.ellipse(0, -4, hw(yt) - 30, 18, 0, Math.PI, TAU); c.fillStyle = '#4CAF50'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(40, -10); c.quadraticCurveTo(60, -90, 30, -170); c.lineWidth = 14; c.strokeStyle = '#7A4E2D'; c.stroke(); for (let j = 0; j < 5; j++) { const an = -Math.PI + j * Math.PI / 4; c.beginPath(); c.moveTo(30, -170); c.quadraticCurveTo(30 + Math.cos(an) * 60, -200 + Math.sin(an) * 40, 30 + Math.cos(an) * 110, -160 + Math.sin(an) * 40 + 30); c.lineWidth = 16; c.strokeStyle = '#2E8B57'; c.stroke(); } c.restore();
      text(c, 'ISLAND!', 540, 640, 130, '#FFD23F', { scale: pop(t, ev.island + 0.15, 0.3, 3), rot: -0.06, shadow: '#2B4C7E', lw: 16 }); }
    c.fillStyle = 'rgba(40,120,220,0.28)'; c.fillRect(-200, SEA, W + 400, FLOOR - SEA + 40);
    c.beginPath(); c.moveTo(-200, SEA); for (let x = -200; x <= W + 200; x += 20) c.lineTo(x, SEA + 6 * Math.sin(x * 0.03 + t * 3)); c.lineWidth = 8; c.strokeStyle = '#FFFFFF'; c.stroke();
    for (let i = 0; i < 2; i++) { const x = ((t - t0) * (140 + i * 60) + i * 500) % 1400 - 160, y = 1120 + i * 150; c.save(); c.translate(x, y); c.beginPath(); c.ellipse(0, 0, 36, 18, 0, 0, TAU); c.moveTo(-30, 0); c.lineTo(-58, -16); c.lineTo(-58, 16); c.closePath(); c.fillStyle = i ? '#FFD23F' : '#FF6B4A'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.restore(); }
    const yrs = Math.round(10000 * ramp(t, t0 + 0.2, ev.island - t0 - 0.2) / 100) * 100;
    label(c, `${yrs.toLocaleString('en-US')} YEARS`, 540, 340, pop(t, t0 + 0.1, 0.3), { bg: '#FFFFFF', size: 64 });
  }
  function sleeping(c, t) {
    const t0 = L.sleeping.t, woke = t >= ev.eyes;
    c.fillStyle = grad(c, 0, 1250, [[0, '#1B1740'], [0.6, '#4A3270'], [1, '#F2A65A']]); c.fillRect(-200, -200, W + 400, 1500);
    for (let i = 0; i < 40; i++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rnd(i)) + i)); c.beginPath(); c.arc(rnd(i) * W, rnd(i + 40) * 600, 2 + rnd(i + 2) * 3, 0, TAU); c.fillStyle = `rgba(255,255,255,${a})`; c.fill(); }
    c.beginPath(); c.arc(860, 220, 54, 0, TAU); c.fillStyle = '#FFF4D6'; c.fill();
    const pk = { x: 540, y: 600 }; c.beginPath(); c.moveTo(-100, 1260); c.quadraticCurveTo(300, 900, pk.x - 60, pk.y); c.lineTo(pk.x + 60, pk.y); c.quadraticCurveTo(780, 900, 1180, 1260); c.closePath(); c.fillStyle = '#4B5D67'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    c.save(); c.clip(); c.beginPath(); c.moveTo(pk.x - 160, pk.y + 160); c.lineTo(pk.x - 90, pk.y + 120); c.lineTo(pk.x - 30, pk.y + 170); c.lineTo(pk.x + 40, pk.y + 120); c.lineTo(pk.x + 110, pk.y + 170); c.lineTo(pk.x + 170, pk.y + 150); c.lineTo(pk.x + 170, 0); c.lineTo(pk.x - 170, 0); c.closePath(); c.fillStyle = '#F4F8FF'; c.fill(); c.lineWidth = 6; c.stroke(); c.restore();
    c.fillStyle = '#2F4F3A'; c.beginPath(); c.moveTo(-200, 1240); c.quadraticCurveTo(300, 1180, 600, 1250); c.quadraticCurveTo(900, 1200, W + 200, 1240); c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fill();
    [[160, 1250], [300, 1262], [820, 1250]].forEach(([x, y], i) => { house(c, x, y, 0.6); c.fillStyle = '#FFD23F'; c.fillRect(x - 6, y - 42, 12, 12); });
    const open = woke ? pop(t, ev.eyes, 0.25, 2) : 0;
    if (!woke) { eyes(c, pk.x, 900, 110, 44, 0, t, { ink: '#1E262B' }); zzz(c, pk.x + 90, pk.y - 40, t, t0); }
    else { glow(c, pk.x, 900, 520, 'rgba(255,120,30,0.5)', open); eyes(c, pk.x, 900, 110, 56, clamp(open, 0, 1.15), t, { glow: true, white: '#FFD23F', slit: true }); glow(c, pk.x, pk.y, 220, 'rgba(255,120,40,0.8)', open * (0.7 + 0.3 * Math.sin(t * 8))); text(c, '!', pk.x + 260, 560, 150, '#FF3B30', { scale: pop(t, ev.eyes + 0.1, 0.25, 3), lw: 16 }); }
  }
  function endCard(c, t) {
    c.fillStyle = '#131C3D'; c.fillRect(-300, -300, W + 600, H + 600);
    for (let i = 0; i < 18; i++) { const p = ((t * 0.12 + rnd(i)) % 1), x = rnd(i + 3) * W + Math.sin(t + i) * 20, y = H + 100 - p * (H + 300); c.beginPath(); c.arc(x, y, 14 + rnd(i + 6) * 30, 0, TAU); c.lineWidth = 5; c.strokeStyle = `rgba(120,200,255,${0.35 * Math.sin(p * Math.PI)})`; c.stroke(); }
    const k = pop(t, ev.logo, 0.5, 1.8); if (LOGO && k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); const s = 860; c.drawImage(LOGO, -s / 2, -s / 2, s, s); c.restore(); }
    text(c, 'FOLLOW FOR', 540, 1210, 80, '#FFFFFF', { scale: pop(t, ev.logo + 0.6, 0.3), lw: 14 });
    text(c, 'MORE SCIENCE!', 540, 1310, 96, '#FFD23F', { scale: pop(t, ev.logo + 0.8, 0.3) * (1 + 0.03 * Math.sin(t * 6)), lw: 16, shadow: '#FF6B4A' });
  }
  // ---------- captions (the spoken word lights up) ----------
  function buildSubs(vo) { const out = []; vo.lines.forEach((l, li) => { if (S.vo[li] && S.vo[li].id === 'follow') return; const ws = l.words; if (!ws.length) return; const raw = l.text.split(/\s+/).filter(Boolean), useRaw = raw.length === ws.length; const words = ws.map((w, i) => ({ ...w, w: (useRaw ? raw[i] : w.w).toUpperCase() })); const n = Math.ceil(words.length / 3), per = Math.ceil(words.length / n); for (let k = 0; k * per < words.length; k++) { const g = words.slice(k * per, (k + 1) * per), next = words[(k + 1) * per]; out.push({ t: g[0].t - 0.04, end: next ? next.t - 0.04 : l.end + 0.15, words: g }); } }); return out; }
  function drawSubs(c, t) {
    const cap = SUBS.find((q) => t >= q.t && t < q.end); if (!cap) return; const size = 74, y = 1440, gap = 40;
    c.save(); c.font = `800 ${size}px Inter`; const ws = cap.words.map((w) => c.measureText(w.w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const scl = Math.min(1, (G.SAFE.w - 40) / total), k = pop(t, cap.t, 0.18, 2.4); c.translate(G.SAFE.x + G.SAFE.w / 2, y); c.scale(scl * k, scl * k); let x = -total / 2;
    cap.words.forEach((w, i) => { const on = t >= w.t && t < (cap.words[i + 1] ? cap.words[i + 1].t : cap.end); c.save(); c.translate(x + ws[i] / 2, 0); if (on) c.scale(1.1, 1.1); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 18; c.strokeStyle = INK; c.strokeText(w.w, 0, 0); c.fillStyle = on ? '#FFD23F' : '#FFFFFF'; c.fillText(w.w, 0, 0); c.restore(); x += ws[i] + gap; });
    c.restore();
  }
  // ---------- camera ----------
  const Cmb = Shots.combine, push = (z0, z1, x = 0, y = 0) => (s) => { const k = io(s.u); return { zoom: lerp(z0, z1, k), x: x * k, y: y * k }; };
  const bumps = (times, amp = 0.03, d = 9) => (s) => { let z = 1; for (const tt of times) if (s.t >= tt) z += amp * Math.exp(-(s.t - tt) * d); return { zoom: z }; };
  const shakes = (times, amp, decay = 6) => Cmb(...times.map((x, i) => Shots.shake(typeof amp === 'function' ? amp(i) : amp, x, decay)));
  const shots = Shots.film([
    { at: 0, draw: hook, cam: push(1.0, 1.12, 0, 160) },
    { at: L.magma.t - 0.15, draw: magma, in: 'whip', cam: Cmb(push(1.04, 1.1), bumps([ev.hot], 0.05)) },
    { at: L.chamber.t - 0.15, draw: chamber, in: 'push', cam: push(1.08, 1.0, 0, 60) },
    { at: L.rises.t - 0.1, draw: rises, in: 'dip', cam: push(1.0, 1.08, 0, -80) },
    { at: L.gas.t - 0.15, draw: gas, in: 'whip', cam: Cmb(push(1.02, 1.1), bumps([ev.cap], 0.08), Shots.shake(18, ev.cap, 6)) },
    { at: L.pressure.t - 0.1, draw: pressure, in: 'iris', cam: Cmb(push(1.0, 1.14, 0, -160), shakes(ev.rumbles, (i) => 6 + i * 3, 7), shakes(ev.cracks, 16, 6)) },
    { at: ev.boom, draw: boom, in: 'cut', cam: Cmb(push(1.08, 1.0), Shots.shake(40, ev.boom, 3)) },
    { at: L.lava.t - 0.1, draw: lava, in: 'flash', cam: Cmb(push(1.12, 1.0, 0, -60), Shots.shake(10, L.lava.t, 1.2)) },
    { at: L.build.t - 0.2, draw: build, in: 'dip', cam: Cmb(push(1.0, 1.08, 0, -40), bumps([ev.island], 0.05)) },
    { at: L.sleeping.t - 0.2, draw: sleeping, in: 'dip', cam: Cmb(push(1.0, 1.15, 0, -80), bumps([ev.eyes], 0.08), Shots.shake(14, ev.eyes, 5)) },
    { at: L.follow.t - 0.15, draw: endCard, in: 'iris', cam: push(1.03, 1.0) },
  ]);
  Studio.film({ post: { vignette: 0.12, grain: 0, paper: 0 }, fadeOut: 0.4, async init() { await Studio.loadFont('Baloo', 'assets/baloo-700.woff2', 700); LOGO = await Studio.loadImage('assets/logo.png'); VO = await Studio.loadJSON('out/voice.json'); SUBS = buildSubs(VO); }, draw(ctx, t) { shots(ctx, t); drawSubs(ctx, t); } });
})();
