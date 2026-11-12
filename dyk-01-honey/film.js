// Bubbly Tales · Did You Know #1 «Honey never spoils». The claim and the jar are on screen at frame 0.
(function () {
  const K = globalThis.KIT, S = globalThis.SCORE, L = S.L, ev = S.ev;
  const { W, H, TAU, INK, clamp, lerp, io, ramp, pop, rnd, grad, bg, text, label, glow, blob, Cmb, push, bumps, Shots } = K;
  const HONEY = '#FFB627', HONEY2 = '#E8890C';
  function badge(c, t) { const k = 1 + 0.03 * Math.sin(t * 5); c.save(); c.translate(540, 235); c.rotate(-0.03); c.scale(k, k); c.beginPath(); c.roundRect(-300, -62, 600, 124, 62); c.fillStyle = '#FF6B4A'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.restore(); text(c, 'DID YOU KNOW?', 540, 239, 74, '#FFFFFF', { lw: 12, rot: -0.03, scale: k }); }
  function jar(c, x, y, s, t, o = {}) { // an ancient clay jar full of honey
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(-90, -260); c.lineTo(90, -260); c.quadraticCurveTo(80, -220, 150, -170); c.quadraticCurveTo(230, -60, 160, 40); c.quadraticCurveTo(110, 100, 0, 100); c.quadraticCurveTo(-110, 100, -160, 40); c.quadraticCurveTo(-230, -60, -150, -170); c.quadraticCurveTo(-80, -220, -90, -260); c.closePath();
    c.fillStyle = '#C46A3C'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(30, -300, 300, 500); c.strokeStyle = '#8A4424'; c.lineWidth = 8; for (const yy of [-120, -60]) { c.beginPath(); c.moveTo(-220, yy); for (let xx = -220; xx <= 220; xx += 40) c.lineTo(xx, yy + (xx / 40 % 2 ? 14 : -14)); c.stroke(); } c.restore();
    // honey at the lip, dripping
    c.beginPath(); c.ellipse(0, -258, 92, 24, 0, 0, TAU); c.fillStyle = HONEY; c.fill(); c.lineWidth = 8; c.stroke();
    for (let i = 0; i < 3; i++) { const dx = [-60, 10, 70][i], ln = 40 + 30 * Math.sin(t * 1.6 + i * 2) + i * 20; c.beginPath(); c.moveTo(dx - 14, -250); c.lineTo(dx - 12, -250 + ln); c.arc(dx, -250 + ln, 12, Math.PI, 0, true); c.lineTo(dx + 14, -250); c.closePath(); c.fillStyle = HONEY; c.fill(); c.lineWidth = 6; c.stroke(); }
    c.beginPath(); c.ellipse(-30, -268, 30, 8, 0, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
    if (o.label) { c.beginPath(); c.roundRect(-110, -20, 220, 70, 12); c.fillStyle = '#F4E3C1'; c.fill(); c.lineWidth = 6; c.stroke(); c.strokeStyle = '#8A4424'; c.lineWidth = 6; c.beginPath(); c.ellipse(-60, 15, 26, 13, 0, 0, TAU); c.moveTo(-34, 15); c.lineTo(-86, 15); c.stroke(); c.beginPath(); c.arc(-60, 15, 6, 0, TAU); c.fillStyle = '#8A4424'; c.fill(); c.beginPath(); c.ellipse(0, -2, 10, 13, 0, 0, TAU); c.moveTo(0, 11); c.lineTo(0, 40); c.moveTo(-18, 18); c.lineTo(18, 18); c.stroke(); c.beginPath(); c.moveTo(40, 15); for (let i = 1; i <= 4; i++) c.lineTo(40 + i * 12, 15 + (i % 2 ? -10 : 10)); c.stroke(); }
    c.restore();
  }
  function spoon(c, x, y, a, t) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.roundRect(-12, -330, 24, 300, 12); c.fillStyle = '#E0E0E0'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.ellipse(0, 0, 50, 34, 0, 0, TAU); c.fillStyle = '#E0E0E0'; c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 4, 40, 24, 0, 0, TAU); c.fillStyle = HONEY; c.fill(); c.restore(); }
  // 1 · hook
  function hook(c, t) {
    c.fillStyle = grad(c, 0, H, [[0, '#FFE8A3'], [1, '#F2A93B']]); c.fillRect(-300, -300, W + 600, H + 600);
    c.save(); c.translate(540, 900); c.rotate(t * 0.15); for (let i = 0; i < 18; i++) { c.rotate(TAU / 18); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 1400, -0.08, 0.08); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill(); } c.restore();
    glow(c, 540, 950, 520, 'rgba(255,220,120,0.7)');
    jar(c, 540, 1180, 1.25, t, { label: true });
    text(c, '3,000', 540, 545, 210, '#FFD23F', { font: 'Bungee', weight: 400, lw: 26, shadow: '#8A4424', rot: -0.04, scale: 1 + 0.03 * Math.sin(t * 6) });
    text(c, 'YEARS OLD!', 540, 705, 110, '#FFFFFF', { font: 'Bungee', weight: 400, lw: 18, rot: -0.04 });
    const sp = ramp(ev.spoon > t ? t : ev.spoon, ev.spoon - 0.6, 0.6), dip = t >= ev.spoon ? Math.min(1, (t - ev.spoon) / 0.3) : 0;
    spoon(c, lerp(1300, 700, sp) - 30 * dip, lerp(1500, 880, sp) + 20 * dip, 2.5, t);
    if (t >= ev.spoon) label(c, 'STILL TASTY?!', 280, 860, pop(t, ev.spoon + 0.1, 0.3), { bg: '#FFFFFF', size: 52 });
  }
  // 2 · the tomb
  function pyramid(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-300, 0); c.lineTo(0, -280); c.lineTo(300, 0); c.closePath(); c.fillStyle = '#E8B86A'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(0, -280); c.lineTo(80, 0); c.lineTo(300, 0); c.closePath(); c.fillStyle = '#C99545'; c.fill(); c.stroke(); c.restore(); }
  function explorer(c, x, y, s, t, reach) { c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 10; c.strokeStyle = INK; c.lineCap = 'round'; c.beginPath(); c.moveTo(-24, 0); c.lineTo(0, -70); c.lineTo(24, 0); c.moveTo(0, -70); c.lineTo(0, -150); c.moveTo(0, -130); c.lineTo(lerp(40, 120, reach), lerp(-100, -150, reach)); c.moveTo(0, -130); c.lineTo(-50, -170); c.stroke();
    c.beginPath(); c.arc(0, -185, 32, 0, TAU); c.fillStyle = '#FFE0BD'; c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -212, 60, 14, 0, 0, TAU); c.fillStyle = '#C9A15A'; c.fill(); c.stroke(); c.beginPath(); c.arc(0, -214, 32, Math.PI, TAU); c.fill(); c.stroke();
    c.save(); c.translate(-50, -170); c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.lineTo(4, 50); c.lineTo(-4, 50); c.closePath(); c.fillStyle = '#7A4E2D'; c.fill(); blob(c, 0, -14, 20, t * 6, 0.18); c.fillStyle = '#FFB627'; c.fill(); c.restore(); c.restore(); glow(c, x - 50 * s, y - 184 * s, 260, 'rgba(255,180,80,0.6)', 0.8 + 0.2 * Math.sin(t * 13)); }
  function tomb(c, t) {
    const t0 = L.tomb.t; c.fillStyle = grad(c, 0, 760, [[0, '#7CC6FE'], [1, '#FFE3A8']]); c.fillRect(-300, -300, W + 600, 1100);
    c.beginPath(); c.arc(860, 160, 60, 0, TAU); c.fillStyle = '#FFD23F'; c.fill();
    pyramid(c, 330, 760, 1.1); pyramid(c, 820, 760, 0.7);
    c.fillStyle = '#E8C27A'; c.fillRect(-300, 760, W + 600, 70);
    // the tomb chamber below the sand
    c.fillStyle = '#6B4A2E'; c.fillRect(-300, 830, W + 600, H); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-300, 830, W + 600, H);
    c.fillStyle = '#8A6640'; for (let r = 0; r < 8; r++) for (let i = 0; i < 9; i++) { const x = i * 140 - (r % 2) * 70, y = 860 + r * 70; c.fillRect(x, y, 132, 62); }
    glow(c, 450, 1200, 520, 'rgba(255,170,70,0.55)');
    explorer(c, 300, 1340, 1.1, t, ramp(t, ev.found - 0.5, 0.5));
    jar(c, 720, 1340, 0.75, t, { label: true }); jar(c, 920, 1340, 0.5, t + 2);
    if (t >= ev.found) { for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + t, r = 160 + 20 * Math.sin(t * 4 + i); const sx = 720 + Math.cos(a) * r, sy = 1180 + Math.sin(a) * r * 0.8; c.save(); c.translate(sx, sy); c.rotate(t * 2); c.scale(pop(t, ev.found + i * 0.04, 0.3, 3), pop(t, ev.found + i * 0.04, 0.3, 3)); c.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? 8 : 22, an = (j / 8) * TAU; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fillStyle = '#FFF3A8'; c.fill(); c.restore(); } }
    label(c, 'ANCIENT EGYPT', 540, 800, pop(t, t0 + 0.6, 0.3), { bg: '#FFD23F', size: 58 });
    if (t >= ev.good) { c.save(); c.translate(720, 960); c.rotate(-0.12); const k = pop(t, ev.good, 0.3, 3); c.scale(k, k); c.beginPath(); c.roundRect(-220, -60, 440, 120, 20); c.fillStyle = '#3BB273'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.restore(); text(c, 'STILL GOOD! ✓', 720, 964, 62, '#FFFFFF', { lw: 10, rot: -0.12, scale: pop(t, ev.good, 0.3, 3) }); }
  }
  // 3 · why: germs try the honey and give up
  function germ(c, x, y, r, t, i, dead) { c.save(); c.translate(x, y); if (dead > 0) { c.rotate(dead * 1.5); c.scale(1 - 0.5 * dead, 1 - 0.5 * dead); c.globalAlpha = 1 - dead; } blob(c, 0, 0, r, t * 2, 0.12, i); c.fillStyle = '#7BD389'; c.fill(); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + t; c.beginPath(); c.moveTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(Math.cos(a) * (r + 22), Math.sin(a) * (r + 22)); c.lineWidth = 6; c.stroke(); }
    if (dead > 0.05) { c.lineWidth = 7; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * r * 0.35 - 12, -12); c.lineTo(s * r * 0.35 + 12, 12); c.moveTo(s * r * 0.35 + 12, -12); c.lineTo(s * r * 0.35 - 12, 12); c.stroke(); } } else K.eyes(c, 0, -6, r * 0.35, r * 0.28, 1, { look: [-1, 0.3] }); c.restore(); }
  function why(c, t) {
    const t0 = L.why.t; c.fillStyle = grad(c, 0, H, [[0, '#FFF4D6'], [1, '#FFD27A']]); c.fillRect(-300, -300, W + 600, H + 600);
    // a giant honey drop under a magnifier
    const cx = 380, cy = 940; glow(c, cx, cy, 420, 'rgba(255,200,80,0.6)');
    c.beginPath(); c.moveTo(cx, cy - 300); c.bezierCurveTo(cx + 60, cy - 160, cx + 230, cy - 20, cx + 230, cy + 120); c.arc(cx, cy + 120, 230, 0, Math.PI); c.bezierCurveTo(cx - 230, cy - 20, cx - 60, cy - 160, cx, cy - 300); c.closePath(); c.fillStyle = HONEY; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.ellipse(cx - 90, cy + 40, 30, 70, 0.3, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    K.eyes(c, cx, cy + 110, 60, 34, 1, { look: [1, 0] }); c.beginPath(); c.arc(cx, cy + 170, 40, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 9; c.stroke();
    ev.germs.forEach((g, i) => { const y = 760 + i * 230, approach = ramp(t, t0 + 0.3 + i * 0.3, 1.6), dead = ramp(t, g, 0.5); germ(c, lerp(1000, 690, approach) + 30 * dead, y, 64, t, i, dead); if (t >= g && t < g + 0.5) glow(c, 690, y, 140, 'rgba(255,255,255,0.9)', 1 - (t - g) / 0.5); });
    label(c, 'ALMOST NO WATER', 540, 470, pop(t, t0 + 1.0, 0.3), { bg: '#9FD3FF', size: 54 });
    label(c, 'ACIDIC', 540, 1300, pop(t, t0 + 2.2, 0.3), { bg: '#FF6B4A', col: '#FFFFFF', size: 54 });
    if (t >= ev.germs[2]) text(c, 'NOPE!', 820, 620, 100, '#FF3B30', { font: 'Bungee', weight: 400, scale: pop(t, ev.germs[2] + 0.1, 0.25, 3), rot: 0.1, lw: 14 });
  }
  // 4 · never spoils
  function never(c, t) {
    c.fillStyle = grad(c, 0, H, [[0, '#FFE8A3'], [1, '#F2A93B']]); c.fillRect(-300, -300, W + 600, H + 600); glow(c, 540, 900, 600, 'rgba(255,255,255,0.6)');
    jar(c, 540, 1180, 1.1, t, { label: true });
    text(c, '3000 BC', 240, 480, 70, '#8A4424', { lw: 0 }); text(c, 'TODAY', 840, 480, 70, '#8A4424', { lw: 0 }); const k = ramp(t, L.end.t, 0.6); c.beginPath(); c.moveTo(240, 550); c.lineTo(lerp(240, 840, k), 550); c.lineWidth = 12; c.strokeStyle = '#8A4424'; c.lineCap = 'round'; c.stroke();
    if (t >= ev.stamp) { const s = pop(t, ev.stamp, 0.18, 2.2); c.save(); c.translate(540, 730); c.rotate(-0.12); c.scale(2.4 - 1.4 * Math.min(1, s), 2.4 - 1.4 * Math.min(1, s)); c.globalAlpha = clamp(s * 2); c.beginPath(); c.roundRect(-330, -90, 660, 180, 24); c.lineWidth = 16; c.strokeStyle = '#D7263D'; c.stroke(); c.font = '400 96px Bungee'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#D7263D'; c.fillText('NEVER SPOILS', 0, 6); c.restore(); }
  }
  K.run([
    { at: 0, draw: hook, cam: Cmb(push(1.1, 1.0), Shots.shake(20, ev.open, 4)) },
    { at: L.tomb.t - 0.15, draw: tomb, in: 'whip', cam: Cmb(push(1.0, 1.1, -40, 80), bumps([ev.found, ev.good], 0.04)) },
    { at: L.why.t - 0.15, draw: why, in: 'push', cam: Cmb(push(1.05, 1.0), bumps(ev.germs, 0.025)) },
    { at: L.end.t - 0.15, draw: never, in: 'whip', cam: Cmb(push(1.0, 1.06), bumps([ev.stamp], 0.06), Shots.shake(14, ev.stamp, 6)) },
    { at: L.follow.t - 0.1, draw: (c, t) => K.endCard(c, t, ev.logo, 'MORE FACTS!'), in: 'iris', cam: push(1.03, 1.0) },
  ], { over: (c, t) => { if (t < L.follow.t - 0.1) badge(c, t); } });
})();
