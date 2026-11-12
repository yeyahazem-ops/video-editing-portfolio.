// Bubbly Tales · Did You Know #2 «Three hearts, blue blood». The claim and the octopus are on screen at frame 0.
(function () {
  const K = globalThis.KIT, S = globalThis.SCORE, L = S.L, ev = S.ev;
  const { W, H, TAU, INK, clamp, lerp, io, ramp, pop, rnd, grad, text, label, glow, heart, Cmb, push, bumps, Shots } = K;
  const SKIN = '#FF6B8A', SKIN2 = '#E04870';
  function badge(c, t) { const k = 1 + 0.03 * Math.sin(t * 5); c.save(); c.translate(540, 235); c.rotate(-0.03); c.scale(k, k); c.beginPath(); c.roundRect(-300, -62, 600, 124, 62); c.fillStyle = '#FF6B4A'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.restore(); text(c, 'DID YOU KNOW?', 540, 239, 74, '#FFFFFF', { lw: 12, rot: -0.03, scale: k }); }
  function sea(c, t) { c.fillStyle = grad(c, 0, H, [[0, '#2E86DE'], [1, '#0B1F4D']]); c.fillRect(-300, -300, W + 600, H + 600); c.save(); c.globalAlpha = 0.12; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(100 + i * 180 + Math.sin(t + i) * 30, -100); c.lineTo(20 + i * 180, H); c.lineTo(140 + i * 180, H); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); } c.restore(); for (let i = 0; i < 16; i++) { const p = (t * (0.08 + rnd(i) * 0.1) + rnd(i + 2)) % 1; c.beginPath(); c.arc(rnd(i + 5) * W + Math.sin(t * 2 + i) * 14, H - p * (H + 100), 6 + rnd(i) * 12, 0, TAU); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke(); } }
  function octopus(c, x, y, s, t, o = {}) { // o.xray: 0..1 see-through body; o.swim: 0..1 tentacles stream back
    c.save(); c.translate(x, y); c.scale(s, s); const sw = o.swim || 0, col = o.col || SKIN;
    for (let i = 0; i < 8; i++) { const a0 = lerp(-1.25, 1.25, i / 7), len = 330; c.beginPath(); c.moveTo(Math.sin(a0) * 120, 60); for (let j = 1; j <= 12; j++) { const k = j / 12, wav = Math.sin(t * 3 + i + k * 5) * 40 * k * (1 - sw * 0.7); const ang = lerp(a0 * 1.1, a0 * 0.15, sw) + wav * 0.01; c.lineTo(Math.sin(a0) * 120 + Math.sin(ang) * len * k + wav, 60 + Math.cos(ang) * len * k * lerp(1, 1.4, sw) + (sw ? 0 : 40 * k * k * Math.sin(i))); }
      c.lineWidth = 56 * 1; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke(); c.lineWidth = 42; c.strokeStyle = col; c.stroke(); }
    c.beginPath(); c.ellipse(0, -120, 200, 230, 0, 0, TAU); c.fillStyle = col; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    if (!o.xray) { c.fillStyle = SKIN2; for (const [sx, sy, r] of [[-90, -230, 26], [60, -260, 20], [110, -160, 16], [-120, -120, 14]]) { c.beginPath(); c.arc(sx, sy, r, 0, TAU); c.fill(); } }
    else { c.save(); c.beginPath(); c.ellipse(0, -120, 188, 218, 0, 0, TAU); c.clip(); c.fillStyle = `rgba(20,30,70,${0.75 * o.xray})`; c.fill(); c.restore(); }
    K.eyes(c, 0, 10, 70, 44, 1, { look: o.look || [0, 0] }); c.beginPath(); c.arc(0, 70, 26, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 9; c.strokeStyle = INK; c.stroke();
    c.restore();
  }
  const beatK = (t, times, d = 0.25) => times.reduce((a, x) => Math.max(a, t >= x && t < x + d ? Math.sin(((t - x) / d) * Math.PI) : 0), 0);
  // 1 · hook
  function hook(c, t) {
    sea(c, t); glow(c, 540, 1100, 560, 'rgba(255,120,160,0.4)'); octopus(c, 540, 1180, 0.95, t, { look: [0, -0.5] });
    const b = beatK(t, ev.beats); [[360, 820], [540, 775], [720, 820]].forEach(([x, y], i) => heart(c, x, y + 6 * Math.sin(t * 3 + i), 1.6 * (1 + 0.25 * b), '#FF3B5C'));
    text(c, '3 HEARTS', 540, 440, 150, '#FFD23F', { font: 'Bungee', weight: 400, lw: 22, shadow: '#7A0F1E', rot: -0.04, scale: 1 + 0.03 * Math.sin(t * 6) });
    text(c, '+ BLUE BLOOD!', 540, 590, 92, '#5AC8FF', { font: 'Bungee', weight: 400, lw: 16, rot: -0.04 });
  }
  // 2 · x-ray: two gill hearts and one main heart
  function gills(c, t) {
    sea(c, t); const ox = 540, oy = 1120, s = 1.15; octopus(c, ox, oy, s, t, { xray: 1 });
    const G1 = [ox - 110 * s, oy - 110 * s], G2 = [ox + 110 * s, oy - 110 * s], M = [ox, oy - 200 * s];
    // gills
    for (const [gx, gy] of [G1, G2]) { c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(gx - 40 + i * 20, gy - 60); c.quadraticCurveTo(gx - 50 + i * 20 + 10 * Math.sin(t * 3 + i), gy - 100, gx - 40 + i * 20, gy - 140); } c.lineWidth = 9; c.strokeStyle = '#7FDBFF'; c.lineCap = 'round'; c.stroke(); }
    // blood loop dots
    const loop = [G1, M, G2]; for (let i = 0; i < 18; i++) { const p = (t * 0.4 + i / 18) % 1, seg = Math.floor(p * 3), f = p * 3 - seg, A = loop[seg], B = loop[(seg + 1) % 3]; c.beginPath(); c.arc(lerp(A[0], B[0], f), lerp(A[1], B[1], f) - 40 * Math.sin(f * Math.PI), 9, 0, TAU); c.fillStyle = '#5AC8FF'; c.fill(); }
    const bt = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => L.gills.t + 0.5 + i * 0.6), b = beatK(t, bt, 0.3);
    heart(c, G1[0], G1[1], 1.0 * pop(t, ev.gill, 0.3, 3) * (1 + 0.2 * b), '#FF3B5C'); heart(c, G2[0], G2[1], 1.0 * pop(t, ev.gill + 0.15, 0.3, 3) * (1 + 0.2 * b), '#FF3B5C');
    heart(c, M[0], M[1], 1.7 * pop(t, ev.main, 0.3, 3) * (1 + 0.15 * b), '#FF3B5C');
    label(c, 'GILL HEART ×2', 300, 520, pop(t, ev.gill + 0.3, 0.3), { bg: '#7FDBFF', size: 50, to: [G1[0], G1[1] - 30] });
    label(c, 'MAIN HEART', 780, 600, pop(t, ev.main + 0.3, 0.3), { bg: '#FFD23F', size: 50, to: [M[0] + 50, M[1] - 30] });
  }
  // 3 · copper vs iron
  function drop(c, x, y, s, col, sym) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -170); c.bezierCurveTo(40, -90, 130, -20, 130, 60); c.arc(0, 60, 130, 0, Math.PI); c.bezierCurveTo(-130, -20, -40, -90, 0, -170); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.ellipse(-50, 30, 18, 40, 0.3, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill(); c.restore(); text(c, sym, x, y + 66 * s, 100 * s, '#FFFFFF', { lw: 14 * s }); }
  function blue(c, t) {
    sea(c, t); const kr = pop(t, ev.red, 0.35, 2.2), kb = pop(t, ev.blue, 0.35, 2.2);
    if (kr > 0) { drop(c, 290, 820, kr, '#E5383B', 'Fe'); text(c, 'IRON', 290, 1110, 64, '#FFFFFF', { scale: kr, lw: 12 }); text(c, 'US 🫵', 290, 560, 1, '#FFFFFF', { scale: 0 }); label(c, 'HUMANS', 290, 560, kr, { bg: '#FFFFFF', size: 48 }); }
    if (kb > 0) { glow(c, 790, 820, 360, 'rgba(90,200,255,0.6)', kb); drop(c, 790, 820, kb * 1.1, '#2F80ED', 'Cu'); text(c, 'COPPER', 790, 1130, 64, '#FFFFFF', { scale: kb, lw: 12 }); label(c, 'OCTOPUS', 790, 540, kb, { bg: '#FF6B8A', col: '#FFFFFF', size: 48 }); }
    if (t < ev.red) { const p = ramp(t, L.blue.t - 0.1, 0.5); text(c, 'Fe  vs  Cu', 540, 820, 140, '#FFFFFF', { lw: 18, alpha: p }); }
    if (t >= ev.bluehit) { c.save(); c.translate(540, 1270); c.rotate(-0.08); const k = pop(t, ev.bluehit, 0.3, 3); c.scale(k, k); c.beginPath(); c.roundRect(-250, -62, 500, 124, 22); c.fillStyle = '#2F80ED'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.restore(); text(c, 'BLUE BLOOD!', 540, 1274, 74, '#FFFFFF', { lw: 12, rot: -0.08, scale: pop(t, ev.bluehit, 0.3, 3) }); }
  }
  // 4 · swimming stops the main heart
  function swim(c, t) {
    sea(c, t); const t0 = L.stop.t, k = ramp(t, ev.swim, 0.5), y = 1150 - 260 * k - 30 * Math.sin(t * 4) * k;
    for (let i = 0; i < 10; i++) { const p = ((t - ev.swim) * 1.5 + i / 10) % 1; if (t < ev.swim) break; c.beginPath(); c.arc(540 + (rnd(i) - 0.5) * 160, y + 300 + p * 500, 8 + rnd(i + 1) * 12, 0, TAU); c.lineWidth = 5; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - p)})`; c.stroke(); }
    octopus(c, 540, y, 0.8, t, { swim: k, look: [0, -1] });
    // the ECG monitor
    const mx = 540, my = 470, mw = 760, mh = 230, stopped = t >= ev.stop; c.beginPath(); c.roundRect(mx - mw / 2, my - mh / 2, mw, mh, 24); c.fillStyle = '#0B1A12'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    c.save(); c.beginPath(); c.rect(mx - mw / 2 + 20, my - mh / 2 + 10, mw - 40, mh - 20); c.clip(); c.beginPath(); for (let x = 0; x <= mw - 40; x += 4) { const tt = t - (mw - 40 - x) / 400; let v = 0; if (tt < ev.stop) { const ph = ((tt * 1.6) % 1 + 1) % 1; v = ph > 0.4 && ph < 0.46 ? -80 : ph > 0.46 && ph < 0.52 ? 60 : 0; } c.lineTo(mx - mw / 2 + 20 + x, my + v); } c.lineWidth = 8; c.strokeStyle = stopped ? '#FF5A5A' : '#3BFF8A'; c.stroke(); c.restore();
    heart(c, mx + mw / 2 - 70, my - 60, 0.7 * (stopped ? 1 : 1 + 0.25 * beatK(t, ev.sbeats)), stopped ? '#7A7A7A' : '#FF3B5C');
    if (stopped) text(c, 'IT STOPS!', 540, 1230, 120, '#FF5A5A', { font: 'Bungee', weight: 400, scale: pop(t, ev.stop, 0.25, 3), lw: 18, rot: -0.06 });
    label(c, 'SWIMMING...', 540, 1280, pop(t, ev.swim + 0.2, 0.3) * (stopped ? 0 : 1), { bg: '#7FDBFF', size: 50 });
  }
  K.run([
    { at: 0, draw: hook, cam: Cmb(push(1.1, 1.0), Shots.shake(16, ev.open, 4), bumps(ev.beats, 0.03)) },
    { at: L.gills.t - 0.15, draw: gills, in: 'whip', cam: Cmb(push(1.0, 1.08, 0, -40), bumps([ev.gill, ev.main], 0.04)) },
    { at: L.blue.t - 0.15, draw: blue, in: 'push', cam: Cmb(push(1.05, 1.0), bumps([ev.red, ev.blue, ev.bluehit], 0.04)) },
    { at: L.stop.t - 0.15, draw: swim, in: 'whip', cam: Cmb(push(1.0, 1.06), bumps([ev.stop], 0.06), Shots.shake(14, ev.stop, 6)) },
    { at: L.follow.t - 0.1, draw: (c, t) => K.endCard(c, t, ev.logo, 'MORE FACTS!'), in: 'iris', cam: push(1.03, 1.0) },
  ], { over: (c, t) => { if (t < L.follow.t - 0.1) badge(c, t); } });
})();
