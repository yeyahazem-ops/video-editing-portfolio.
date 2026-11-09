// BUBBLY TALES toolkit: the stick-comic cast, expressions, props, rooms and shared scenes. Every pose is a
// pure function of t, eased between states, so motion stays smooth at 60 fps.
(function () {
  const G = globalThis.G, Subs = globalThis.Subs, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const W = G.W, H = G.H, SAFE = G.SAFE, TAU = Math.PI * 2;
  const INK = '#151515';
  let VO = null;
  // ---------- easing ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const io = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2); // ease in-out cubic
  const outBack = (k, s = 1.8) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const ramp = (t, t0, d) => io(clamp((t - t0) / d));
  const pop = (t, t0, d = 0.3, s = 2.2) => (t < t0 ? 0 : outBack(clamp((t - t0) / d), s));
  const beatPh = (t) => ((((t - S.clock.T(0)) / S.BEAT) % 1) + 1) % 1;

  // ---------- drawing helpers ----------
  const stroke = (c, lw = 8, col = INK) => { c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(clamp(v * k, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  function word(c, txt, x, y, size, col, o = {}) {
    if (o.scale === 0) return;
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.scale !== undefined) c.scale(o.scale, o.scale);
    c.font = `${o.weight || 400} ${size}px ${o.fam || 'Bungee'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if ((o.sw ?? 0.2) > 0) { c.lineJoin = 'round'; c.lineWidth = size * (o.sw ?? 0.2); c.strokeStyle = o.stroke || INK; c.strokeText(txt, 0, 0); }
    c.fillStyle = col; c.fillText(txt, 0, 0); c.restore();
  }
  function bg(c, top = '#D2CEC5', bot = '#EEEAE2') {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.3, bot); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(-W, -H, W * 3, H * 3);
    const v = c.createRadialGradient(W / 2, H * 0.55, 400, W / 2, H * 0.55, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,50,40,0.16)'); c.fillStyle = v; c.fillRect(-W, -H, W * 3, H * 3);
  }
  function ground(c, y) { c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(-W, y, W * 3, H * 2); c.beginPath(); c.moveTo(-W, y); c.lineTo(W * 2, y); stroke(c, 5, 'rgba(21,21,21,0.25)'); }
  function shadow(c, x, y, w) { c.fillStyle = 'rgba(0,0,0,0.10)'; c.beginPath(); c.ellipse(x, y, w, w * 0.12, 0, 0, TAU); c.fill(); }
  function ball(c, x, y, r, spin = 0, squash = 0) {
    c.save(); c.translate(x, y); c.scale(1 + squash, 1 - squash); c.rotate(spin);
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill();
    c.save(); c.clip(); c.fillStyle = INK;
    for (const [px, py, pr] of [[0, 0, 0.34], [0.78, -0.5, 0.26], [-0.78, -0.5, 0.26], [0.5, 0.82, 0.26], [-0.5, 0.82, 0.26], [0, -1.05, 0.26]]) { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; c.lineTo(px * r + Math.cos(a) * pr * r, py * r + Math.sin(a) * pr * r); } c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.10)'; c.beginPath(); c.arc(r * 0.3, r * 0.3, r, 0, TAU); c.fill();
    c.restore(); c.beginPath(); c.arc(0, 0, r, 0, TAU); stroke(c, Math.max(4, r * 0.13)); c.restore();
  }
  function tearDrop(c, x, y, ang, s) { c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(-22 * s, 0); c.quadraticCurveTo(-4 * s, -13 * s, 14 * s, -9 * s); c.arc(14 * s, 0, 9 * s, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-4 * s, 13 * s, -22 * s, 0); c.fillStyle = '#9AD8F5'; c.fill(); stroke(c, 3.5 * s, '#3C7FA6'); c.restore(); }
  function sweatDrop(c, x, y, s) { c.save(); c.translate(x, y); c.beginPath(); c.moveTo(0, -24 * s); c.quadraticCurveTo(16 * s, 4 * s, 0, 14 * s); c.quadraticCurveTo(-16 * s, 4 * s, 0, -24 * s); c.fillStyle = '#9AD8F5'; c.fill(); stroke(c, 3.5 * s, '#3C7FA6'); c.restore(); }
  function heart(c, x, y, s, col = '#F0506E') { if (s <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-30, -8, -18, -34, 0, -18); c.bezierCurveTo(18, -34, 30, -8, 0, 12); c.fillStyle = col; c.fill(); stroke(c, 3.5 / s); c.restore(); }
  function star(c, x, y, r, col = '#FFD23F', a = 0) { if (r <= 0) return; c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, aa = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); c.fillStyle = col; c.fill(); stroke(c, Math.max(3, r * 0.1)); c.restore(); }
  function arcs(c, x, y, r, side, lw = 5) { c.beginPath(); c.arc(x, y, r, side > 0 ? -0.8 : Math.PI - 0.8, side > 0 ? 0.8 : Math.PI + 0.8); stroke(c, lw); }
  function speedLines(c, cx, cy, t, n = 40, r0 = 420, col = 'rgba(21,21,21,0.18)') {
    const f = Math.floor(t * 15); c.save(); c.fillStyle = col;
    for (let k = 0; k < n; k++) { const a = (k / n) * TAU + G.rnd(k, f) * 0.1, w = 0.01 + G.rnd(k, f + 3) * 0.018, r1 = r0 * (0.85 + G.rnd(k, f + 7) * 0.5); c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a - w) * 2600, cy + Math.sin(a - w) * 2600); c.lineTo(cx + Math.cos(a + w) * 2600, cy + Math.sin(a + w) * 2600); c.fill(); }
    c.restore();
  }
  function sunburst(c, t, cy = 700) { c.save(); c.translate(W / 2, cy); c.rotate(t * 0.15); c.fillStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 16; i++) { c.rotate(TAU / 16); c.beginPath(); c.moveTo(0, 0); c.lineTo(1600, -120); c.lineTo(1600, 120); c.fill(); } c.restore(); }
  function confetti(c, t, t0, n = 40) { const a = t - t0; if (a < 0) return; for (let i = 0; i < n; i++) { const x = G.rnd(i, 4) * W, y = -60 + ((a * (300 + G.rnd(i, 5) * 300) + G.rnd(i, 6) * 300) % 1800); c.save(); c.translate(x + Math.sin(a * 3 + i) * 24, y); c.rotate(a * 4 + i); c.fillStyle = ['#FF5A4E', '#FFD23F', '#4FC3F7', '#7ED957', '#F0506E'][i % 5]; c.fillRect(-10, -6, 20, 12); c.restore(); } }

  // ---------- the stick character ----------
  // o: x, gy (ground), s, shirt, bob (px up), lean, tilt (head), feet [[dx, lift], [dx, lift]], knees [l, r],
  // hands [[x, y], [x, y]] in the body frame (origin at the hips, y up negative), elbows [l, r],
  // eyes 'dot'|'wide'|'happy'|'squeeze'|'closed', look [x, y], blink, brows (−1 worried … 1 cross), browUp,
  // mouth 'smile'|'grin'|'talk'|'o'|'flat'|'frown'|'laugh'|'wavy', open (0..1), extras: cap, bald, glasses,
  // mustache, hijab, dress, number, blush, sweat, tears, squash, holds [fn, fn]
  function stick(c, o, t) {
    const s = o.s || 1, legLen = 440 * s;
    const hipX = o.x, hipY = o.gy - legLen - (o.bob || 0);
    const lean = o.lean || 0, sq = o.squash || 0;
    const P = (p) => { const r = rot([p[0] * s * (1 + sq * 0.5), p[1] * s * (1 - sq)], lean); return [hipX + r[0], hipY + r[1]]; };
    shadow(c, o.x, o.gy + 6, 120 * s * (1 - clamp((o.bob || 0) / 400) * 0.5));
    // legs
    const feet = o.feet || [[-60, 0], [60, 0]], knees = o.knees || [40, 40];
    for (let i = 0; i < 2; i++) {
      const sd = i ? 1 : -1, hip = P([sd * 30, -4]), foot = [o.x + feet[i][0] * s, o.gy - (feet[i][1] || 0) * s - (o.bob > 0 && o.air ? o.bob : 0)];
      const mid = [(hip[0] + foot[0]) / 2, (hip[1] + foot[1]) / 2], k = knees[i] * s;
      c.beginPath(); c.moveTo(...hip); c.quadraticCurveTo(mid[0] + sd * k, mid[1] - k * 0.3, foot[0], foot[1] - 12 * s); stroke(c, 12 * s);
      c.save(); c.translate(foot[0] + sd * 22 * s, foot[1] - 6 * s); c.rotate(sd * 0.1); c.beginPath(); c.ellipse(0, 0, 46 * s, 17 * s, 0, 0, TAU); c.fillStyle = INK; c.fill(); c.restore();
    }
    // the tee (or a dress)
    const top = -360, hem = o.dress ? 150 : 40, wd = o.dress ? 1.05 : 0.8;
    const pts = [[-62, top], [-118, top + 22], [-160, top + 110], [-118, top + 138], [-104, top + 112], [o.dress ? -150 : -100, hem], [o.dress ? 150 : 100, hem], [104, top + 112], [118, top + 138], [160, top + 110], [118, top + 22], [62, top], [30, top + 22], [-30, top + 22]].map(([x, y]) => P([x * wd, y]));
    const teePath = () => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p))); c.closePath(); };
    teePath(); c.fillStyle = o.shirt; c.fill();
    c.save(); teePath(); c.clip(); c.beginPath(); [[34, top], [220, top], [220, hem + 10], [46, hem + 10]].map(P).forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p))); c.fillStyle = shade(o.shirt, 0.86); c.fill();
    c.globalAlpha = 0.3; c.beginPath(); c.moveTo(...P([-50, top + 170])); c.lineTo(...P([-28, top + 240])); stroke(c, 4 * s); c.globalAlpha = 1; c.restore();
    teePath(); stroke(c, 7 * s);
    if (o.number) { const p = P([0, top + 200]); c.save(); c.translate(...p); c.rotate(lean); c.font = `900 ${66 * s}px Inter`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8 * s; c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText(o.number, 0, 0); c.fillStyle = '#fff'; c.fillText(o.number, 0, 0); c.restore(); }
    // arms
    const hands = o.hands || [[-150, -60], [150, -60]], elbows = o.elbows || [50, 50];
    for (let i = 0; i < 2; i++) {
      const sd = i ? 1 : -1, sh = P([sd * 104 * wd, top + 110]), hd = P(hands[i]);
      const mid = [(sh[0] + hd[0]) / 2, (sh[1] + hd[1]) / 2], dx = hd[0] - sh[0], dy = hd[1] - sh[1], L = Math.hypot(dx, dy) || 1;
      const e = elbows[i] * s, ctrl = [mid[0] + (-dy / L) * e * -sd, mid[1] + (dx / L) * e * -sd];
      c.beginPath(); c.moveTo(...sh); c.quadraticCurveTo(...ctrl, ...hd); stroke(c, 11 * s);
      c.save(); c.translate(...hd); c.beginPath(); c.ellipse(0, 0, 24 * s, 20 * s, lean, 0, TAU); c.fillStyle = INK; c.fill(); c.restore();
      if (o.holds && o.holds[i]) o.holds[i](c, hd, s);
    }
    // the head
    const tilt = o.tilt || 0, R = 168 * s, neck = P([0, top + 10]);
    const hc = [neck[0] + Math.sin(lean + tilt) * 172 * s, neck[1] - Math.cos(lean + tilt) * 172 * s];
    c.save(); c.translate(...hc); c.rotate(lean + tilt);
    if (o.hijab) { c.beginPath(); c.ellipse(0, R * 0.12, R * 1.16, R * 1.18, 0, 0, TAU); c.fillStyle = o.hijab; c.fill(); stroke(c, 7 * s); }
    if (o.cap) { c.save(); c.rotate(-0.35); c.beginPath(); c.ellipse(-R * 1.02, -R * 0.5, R * 0.62, R * 0.24, -0.35, 0, TAU); c.fillStyle = '#D9342B'; c.fill(); stroke(c, 7 * s); c.restore(); }
    const hg = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.2, 0, 0, R * 1.05); hg.addColorStop(0, '#FFFFFF'); hg.addColorStop(0.7, '#F2F2F0'); hg.addColorStop(1, '#D6D6D3');
    const face = () => { c.beginPath(); if (o.hijab) c.ellipse(0, R * 0.1, R * 0.8, R * 0.86, 0, 0, TAU); else c.ellipse(0, 0, R, R * 0.97, 0, 0, TAU); };
    face(); c.fillStyle = hg; c.fill(); stroke(c, 8 * s);
    if (o.cap) {
      c.save(); face(); c.clip();
      c.beginPath(); c.ellipse(-R * 0.1, -R * 0.62, R * 1.05, R * 0.62, -0.18, Math.PI, TAU); c.lineTo(R, -R * 0.35); c.quadraticCurveTo(0, -R * 0.12, -R * 1.05, -R * 0.42); c.closePath(); c.fillStyle = '#E2453A'; c.fill(); stroke(c, 7 * s);
      c.restore(); c.beginPath(); c.ellipse(0, 0, R, R * 0.97, 0, Math.PI * 1.05, Math.PI * 1.95); stroke(c, 8 * s);
      c.beginPath(); c.ellipse(R * 0.05, -R * 0.42, R * 0.2, R * 0.09, 0, 0, TAU); c.fillStyle = '#F4F1EA'; c.fill(); stroke(c, 5 * s);
    }
    if (o.hair === 'curly') { c.save(); face(); c.clip(); c.fillStyle = '#2A1C14'; c.beginPath(); c.ellipse(0, -R * 0.75, R * 1.1, R * 0.55, 0, 0, TAU); c.fill(); c.restore(); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.1); c.beginPath(); c.arc(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.9, R * 0.17, 0, TAU); c.fillStyle = '#2A1C14'; c.fill(); stroke(c, 5 * s); } }
    if (o.hair === 'pigtails') { for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * R * 1.1, -R * 0.15, R * 0.26, R * 0.36, sd * 0.4, 0, TAU); c.fillStyle = '#3A2418'; c.fill(); stroke(c, 6 * s); c.beginPath(); c.ellipse(sd * R * 0.92, -R * 0.42, R * 0.13, R * 0.09, sd * 0.5, 0, TAU); c.fillStyle = '#FF6FA5'; c.fill(); stroke(c, 5 * s); } c.save(); face(); c.clip(); c.fillStyle = '#3A2418'; c.beginPath(); c.ellipse(0, -R * 0.82, R * 1.05, R * 0.42, 0, 0, TAU); c.fill(); c.restore(); c.beginPath(); c.ellipse(0, 0, R, R * 0.97, 0, Math.PI * 1.1, Math.PI * 1.9); stroke(c, 8 * s); }
    if (o.bald) for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * R * 0.96, R * 0.02, R * 0.13, R * 0.3, 0, 0, TAU); c.fillStyle = '#E3E1DB'; c.fill(); stroke(c, 5 * s); }
    // eyes
    const look = o.look || [0, 0], blink = o.blink || 0, ey = -R * 0.24;
    for (const sd of [-1, 1]) {
      const ex = sd * R * 0.36;
      if (o.eyes === 'squeeze') { c.beginPath(); c.moveTo(sd * R * 0.14, ey + R * 0.04); c.quadraticCurveTo(sd * R * 0.36, ey - R * 0.28, sd * R * 0.66, ey - R * 0.02); stroke(c, 12 * s); for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(sd * R * 0.7, ey + k * R * 0.08); c.lineTo(sd * R * 0.8, ey - R * 0.02 + k * R * 0.13); stroke(c, 4 * s); } }
      else if (o.eyes === 'happy' || o.eyes === 'closed') { c.beginPath(); if (o.eyes === 'happy') c.arc(ex, ey + R * 0.06, R * 0.13, Math.PI * 1.1, Math.PI * 1.9); else c.arc(ex, ey - R * 0.02, R * 0.13, Math.PI * 0.1, Math.PI * 0.9); stroke(c, 10 * s); }
      else if (o.eyes === 'wide') { c.beginPath(); c.ellipse(ex, ey, R * 0.2, Math.max(1, R * 0.24 * (1 - blink)), 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); stroke(c, 6 * s); c.beginPath(); c.ellipse(ex + look[0] * R * 0.06, ey + look[1] * R * 0.06, R * 0.07, Math.max(1, R * 0.08 * (1 - blink)), 0, 0, TAU); c.fillStyle = INK; c.fill(); }
      else { c.beginPath(); c.ellipse(ex + look[0] * R * 0.07, ey + look[1] * R * 0.07, R * 0.075, Math.max(1, R * 0.11 * (1 - blink * 0.92)), 0, 0, TAU); c.fillStyle = INK; c.fill(); if (blink < 0.5) { c.beginPath(); c.arc(ex + look[0] * R * 0.07 + R * 0.025, ey + look[1] * R * 0.07 - R * 0.035, R * 0.022, 0, TAU); c.fillStyle = '#fff'; c.fill(); } }
      if (o.brows !== undefined && o.eyes !== 'squeeze') { const b = o.brows, up = (o.browUp || 0) * R * 0.1; c.beginPath(); c.moveTo(sd * R * 0.2, ey - R * 0.24 - up + b * R * 0.06); c.lineTo(sd * R * 0.52, ey - R * 0.27 - up - b * R * 0.06); stroke(c, 8 * s); }
      if (o.glasses) { c.beginPath(); c.arc(sd * R * 0.38, ey, R * 0.27, 0, TAU); stroke(c, 6 * s); }
    }
    if (o.glasses) { c.beginPath(); c.moveTo(-R * 0.11, ey - R * 0.02); c.quadraticCurveTo(0, ey - R * 0.08, R * 0.11, ey - R * 0.02); stroke(c, 6 * s); }
    if (o.blush) for (const sd of [-1, 1]) { c.fillStyle = `rgba(240,110,120,${0.45 * o.blush})`; c.beginPath(); c.ellipse(sd * R * 0.6, R * 0.16, R * 0.15, R * 0.08, 0, 0, TAU); c.fill(); }
    // mouth
    const m = o.mouth || 'smile', op = clamp(o.open ?? 0.5), my = R * 0.32;
    if (m === 'laugh' || m === 'grin' || m === 'talk') {
      const w = m === 'laugh' ? 0.66 : m === 'grin' ? 0.46 : 0.26 + 0.1 * op, d = m === 'laugh' ? 0.86 : m === 'grin' ? 0.42 : 0.1 + 0.42 * op, y0 = m === 'laugh' ? -R * 0.02 : my - R * 0.08;
      const path = () => { c.beginPath(); c.moveTo(-R * w, y0); c.quadraticCurveTo(0, y0 + R * 0.1, R * w, y0); c.bezierCurveTo(R * w * 0.94, y0 + R * d * 0.74, R * w * 0.4, y0 + R * d, 0, y0 + R * d); c.bezierCurveTo(-R * w * 0.4, y0 + R * d, -R * w * 0.94, y0 + R * d * 0.74, -R * w, y0); c.closePath(); };
      path(); c.fillStyle = '#3B1212'; c.fill(); c.save(); path(); c.clip();
      c.fillStyle = '#fff'; c.fillRect(-R, y0 - R * 0.1, R * 2, R * (m === 'talk' ? 0.08 + 0.05 * op : 0.2));
      c.fillStyle = '#E2505A'; c.beginPath(); c.ellipse(R * 0.04, y0 + R * d, R * w * 0.55, R * d * 0.3, 0, 0, TAU); c.fill(); c.restore();
      path(); stroke(c, 7 * s);
    } else if (m === 'o') { c.beginPath(); c.ellipse(0, my + R * 0.06, R * 0.11 + R * 0.05 * op, R * 0.15 + R * 0.08 * op, 0, 0, TAU); c.fillStyle = '#3B1212'; c.fill(); stroke(c, 7 * s); }
    else if (m === 'flat') { c.beginPath(); c.moveTo(-R * 0.18, my); c.lineTo(R * 0.18, my); stroke(c, 8 * s); }
    else if (m === 'sad') { c.beginPath(); c.moveTo(-R * 0.3, my + R * 0.16); c.quadraticCurveTo(0, my - R * 0.14, R * 0.3, my + R * 0.16); stroke(c, 9 * s); }
    else if (m === 'frown') { c.beginPath(); c.moveTo(-R * 0.22, my + R * 0.08); c.quadraticCurveTo(0, my - R * 0.08, R * 0.22, my + R * 0.08); stroke(c, 8 * s); }
    else if (m === 'wavy') { c.beginPath(); for (let i = 0; i <= 6; i++) c.lineTo(-R * 0.24 + i * R * 0.08, my + (i % 2 ? -R * 0.05 : R * 0.03)); stroke(c, 7 * s); }
    else { c.beginPath(); c.moveTo(-R * 0.3, my - R * 0.04); c.quadraticCurveTo(0, my + R * 0.24, R * 0.3, my - R * 0.04); stroke(c, 8 * s); }
    if (o.mustache) for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * R * 0.22, (m === 'laugh' ? -R * 0.06 : my - R * 0.14), R * 0.26, R * 0.09, sd * -0.18, 0, TAU); c.fillStyle = '#E3E1DB'; c.fill(); stroke(c, 5 * s); }
    // tears streaming sideways when laughing
    if (o.tears) for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) {
      const a = ((t * 1.9 + k / 6 + (sd > 0 ? 0.08 : 0) + (o.seed || 0) * 0.13) % 1), x = sd * (R * 0.72 + a * 330 * s), y = ey - 90 * s * a + 360 * s * a * a;
      c.save(); c.globalAlpha = Math.min(1, (1 - a) * 2.2) * o.tears; tearDrop(c, x, y, sd > 0 ? Math.atan2(-90 + 720 * a, 330) : Math.PI - Math.atan2(-90 + 720 * a, 330), s * (1.05 - a * 0.4)); c.restore();
    }
    if (o.cry) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const a = ((t * 1.4 + k / 3 + (sd > 0 ? 0.5 : 0)) % 1); c.save(); c.globalAlpha = o.cry * (1 - a); c.translate(sd * R * 0.36, ey + R * 0.12 + a * R * 0.9); c.beginPath(); c.moveTo(0, -14 * s); c.quadraticCurveTo(11 * s, 6 * s, 0, 12 * s); c.quadraticCurveTo(-11 * s, 6 * s, 0, -14 * s); c.fillStyle = '#9AD8F5'; c.fill(); stroke(c, 3 * s, '#3C7FA6'); c.restore(); }
    if (o.sweat) { const a = (t * 0.9) % 1; c.save(); c.globalAlpha = o.sweat * (1 - a * 0.7); sweatDrop(c, R * 0.86, -R * 0.4 + a * R * 0.5, s * 1.1); c.restore(); }
    c.restore();
    return { head: hc, R, P };
  }
  // the laugh (as in the reference): fast up-down jolts, rocking back, fists on the belly
  function laughPose(t, base, ph = 0, t0 = 0) {
    const k = ramp(t, t0, 0.25); // ease into the laugh
    const shake = Math.abs(Math.sin(TAU * 4.2 * t + ph)), sway = Math.sin(TAU * 1.1 * t + ph), jig = Math.sin(TAU * 8.4 * t + ph) * 7;
    return { ...base, bob: -24 * (1 - shake) * k, lean: (base.lean || 0) * k + 0.05 * sway * k, tilt: ((base.tilt || 0) + 0.07 * Math.sin(TAU * 2.2 * t + ph)) * k, eyes: 'squeeze', mouth: 'laugh', tears: k,
      knees: [lerp(40, 70 + 34 * (1 - shake), k), lerp(40, 110 + 34 * (1 - shake), k)], hands: [[lerp(-150, -70 + jig * 0.5, k), lerp(-80, -100 + jig, k)], [lerp(150, 140 - jig * 0.5, k), lerp(-80, -95 - jig, k)]], elbows: [60, 60], squash: 0.02 * (1 - shake) * k };
  }
  const laughShake = (c, o, t, ph = 0) => { if (Math.sin(TAU * 4.2 * t + ph) > 0) for (const sd of [-1, 1]) { arcs(c, o.x + sd * 200 * o.s, o.gy - 700 * o.s, 26 * o.s, sd, 5 * o.s); arcs(c, o.x + sd * 150 * o.s, o.gy - 250 * o.s, 24 * o.s, sd, 5 * o.s); } };

  // ---------- the cast (looks) ----------
  const YASIN = { shirt: '#F4C430', number: '10', cap: true, seed: 1 };
  const FATHY = { shirt: '#F28C1E', bald: true, glasses: true, mustache: true, seed: 2 };
  const MAMA = { shirt: '#E77FA0', hijab: '#F7D96B', dress: true, seed: 3 };
  const blinkAt = (t, sd) => { const p = (t + sd * 1.37) % 3.6; return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0; };
  const talking = (who, t) => { const m = Subs.mouth(VO, t, who); return m.talking ? clamp(m.open * 1.4) : null; };

  // ---------- the house (flat, thick outline) ----------
  const HOUSE = { x: 420, y: 420, w: 760, h: 1010 };
  function house(c, t, { win = 'ok', doorOpen = 0, inside } = {}) {
    const { x, y, w, h } = HOUSE;
    c.beginPath(); c.rect(x, y, w, h); c.fillStyle = '#F2D2A9'; c.fill(); stroke(c, 8);
    c.fillStyle = 'rgba(0,0,0,0.05)'; for (let r = 0; r < 20; r++) for (let k = 0; k < 8; k++) c.fillRect(x + 10 + k * 96 + (r % 2) * 48, y + 30 + r * 50, 80, 4);
    c.beginPath(); c.rect(x - 20, y - 40, w + 40, 46); c.fillStyle = '#D9734E'; c.fill(); stroke(c, 8);
    // the window
    const wx = x + 110, wy = y + 300, ww = 260, wh = 260;
    for (const sd of [-1, 1]) { const sx = sd < 0 ? wx - 96 : wx + ww + 16; c.beginPath(); c.rect(sx, wy - 6, 80, wh + 12); c.fillStyle = '#4FA37A'; c.fill(); stroke(c, 6); for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(sx + 6, wy - 6 + k * (wh + 12) / 6); c.lineTo(sx + 74, wy - 6 + k * (wh + 12) / 6); stroke(c, 3, 'rgba(21,21,21,0.4)'); } }
    c.beginPath(); c.rect(wx - 14, wy - 14, ww + 28, wh + 28); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 7);
    if (win === 'broken') {
      c.beginPath(); c.rect(wx, wy, ww, wh); c.fillStyle = '#2C2C3A'; c.fill(); stroke(c, 6);
      c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 120, wy); c.lineTo(wx + 55, wy + 70); c.lineTo(wx + 90, wy + 110); c.lineTo(wx, wy + 165); c.closePath(); c.fillStyle = '#BFE6F7'; c.fill(); stroke(c, 5);
      c.beginPath(); c.moveTo(wx + ww, wy + wh); c.lineTo(wx + 140, wy + wh); c.lineTo(wx + 200, wy + 185); c.lineTo(wx + 170, wy + 145); c.lineTo(wx + ww, wy + 80); c.closePath(); c.fillStyle = '#BFE6F7'; c.fill(); stroke(c, 5);
    } else {
      c.beginPath(); c.rect(wx, wy, ww, wh); c.fillStyle = '#BFE6F7'; c.fill(); stroke(c, 6);
      c.save(); c.globalAlpha = 0.6; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(wx + 30, wy + wh - 30); c.lineTo(wx + 110, wy + 30); c.lineTo(wx + 150, wy + 30); c.lineTo(wx + 70, wy + wh - 30); c.fill(); c.restore();
      if (win === 'fixed') { const a = t - S.sparkle; if (a > 0) for (let k = 0; k < 3; k++) star(c, wx + 60 + k * 85, wy + 70 + (k % 2) * 120, 18 + 8 * Math.sin(a * 6 + k * 2), '#FFF6B0', a + k); }
    }
    c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); stroke(c, 7, '#7A4E33');
    c.beginPath(); c.rect(wx - 30, wy + wh + 14, ww + 60, 26); c.fillStyle = '#C98F5E'; c.fill(); stroke(c, 6);
    c.beginPath(); c.moveTo(wx + ww - 90, wy + wh - 30); c.lineTo(wx + ww - 30, wy + wh - 30); c.lineTo(wx + ww - 40, wy + wh + 14); c.lineTo(wx + ww - 80, wy + wh + 14); c.closePath(); c.fillStyle = '#D9734E'; c.fill(); stroke(c, 5);
    for (const [fx, fy, col] of [[-80, -60, '#F0506E'], [-50, -75, '#FFD23F'], [-30, -55, '#F0506E']]) { c.beginPath(); c.moveTo(wx + ww - 60, wy + wh - 30); c.lineTo(wx + ww + fx + 20, wy + wh + fy); stroke(c, 4, '#3C8A55'); c.beginPath(); c.arc(wx + ww + fx + 20, wy + wh + fy, 13, 0, TAU); c.fillStyle = col; c.fill(); stroke(c, 4); }
    // the door
    const dx = x + 470, dy = y + 290, dw = 230, dh = h - 290;
    c.beginPath(); c.rect(dx - 16, dy - 16, dw + 32, dh + 16); c.fillStyle = '#C98F5E'; c.fill(); stroke(c, 7);
    c.beginPath(); c.rect(dx, dy, dw, dh); c.fillStyle = '#2E2430'; c.fill(); stroke(c, 6);
    if (inside) { c.save(); c.beginPath(); c.rect(dx, dy, dw, dh); c.clip(); inside(c); c.restore(); }
    const open = io(clamp(doorOpen)), pw = dw * lerp(1, 0.12, open);
    c.beginPath(); c.rect(dx, dy, pw, dh); c.fillStyle = '#8A5A3B'; c.fill(); stroke(c, 6);
    if (pw > dw * 0.5) { c.beginPath(); c.rect(dx + pw * 0.14, dy + 40, pw * 0.72, dh * 0.36); c.rect(dx + pw * 0.14, dy + dh * 0.5, pw * 0.72, dh * 0.4); stroke(c, 5); c.beginPath(); c.arc(dx + pw * 0.84, dy + dh * 0.48, 12, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 4); }
    c.beginPath(); c.roundRect(dx + 6, dy - 100, dw - 12, 64, 14); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 6);
    word(c, 'UNCLE FATHY', dx + dw / 2, dy - 67, 26, '#7A3B22', { sw: 0 });
    return { wx, wy, ww, wh, dx, dy, dw, dh };
  }


  function dropLetters(c, t, str, times, cy, size, w0) {
    const letters = [...str], widths = letters.map((ch) => (ch === ' ' ? w0 * 0.45 : ch === ',' || ch === '!' ? w0 * 0.5 : w0)); let x = W / 2 - 40 - widths.reduce((a, b) => a + b, 0) / 2;
    letters.forEach((ch, i) => { const t0 = times[i]; if (t0 !== null && t >= t0) { const a = t - t0, fy = lerp(-700, 0, clamp(a / 0.22) ** 2), land = a > 0.22 ? Math.exp(-(a - 0.22) * 8) * Math.cos((a - 0.22) * 22) : 0; c.save(); c.translate(x + widths[i] / 2, cy + fy); c.scale(1 + 0.15 * land, 1 - 0.2 * land); c.rotate(Math.sin(t * 2 + i) * 0.04); word(c, ch, 0, 0, size, ['#FF5A4E', '#FFD23F', '#4FC3F7', '#7ED957'][i % 4], { sw: 0.16 }); c.restore(); } x += widths[i]; });
  }
  // ---------- more of the cast ----------
  const LAILA = { shirt: '#FF8FB8', hair: 'pigtails', dress: true, seed: 4 };
  const LEO = { shirt: '#4FC3F7', hair: 'curly', number: '7', seed: 5 };
  const CAST = { yasin: YASIN, fathy: FATHY, mama: MAMA, laila: LAILA, leo: LEO };
  const SIZE = { yasin: 0.62, leo: 0.62, laila: 0.5, fathy: 0.62, mama: 0.62 };
  const person = (who, o, t) => stick(c0(), { ...CAST[who], s: SIZE[who], blink: blinkAt(t, CAST[who].seed || 1), ...o }, t);
  let CTX = null; const c0 = () => CTX;

  // ---------- Mishmish the cat ----------
  function cat(c, o, t) {
    const { x, gy, s = 1, eyes = 'dot', mouth = 'smile', wet = 0, bob = 0, flip = 1, look = 0, purr = 0 } = o;
    c.save(); c.translate(x, gy); shadow(c, 0, 4, 120 * s); c.translate(0, -bob); c.scale(s * flip, s);
    const fur = wet ? '#C98A3E' : '#F4A340', sw = Math.sin(t * 3) * 0.5;
    c.beginPath(); c.moveTo(80, -70); c.quadraticCurveTo(190, -60 + sw * 30, 160 + sw * 40, -210); stroke(c, 26); c.beginPath(); c.moveTo(80, -70); c.quadraticCurveTo(190, -60 + sw * 30, 160 + sw * 40, -210); stroke(c, 14, fur);
    for (const lx of [-60, -20, 30, 70]) { c.beginPath(); c.ellipse(lx, -14, 18, 16, 0, 0, TAU); c.fillStyle = fur; c.fill(); stroke(c, 6); }
    const br = 1 + 0.03 * Math.sin(t * 20) * purr;
    c.beginPath(); c.ellipse(10, -80, 120 * br, 74 * br, 0, 0, TAU); c.fillStyle = fur; c.fill(); stroke(c, 7);
    c.save(); c.beginPath(); c.ellipse(10, -80, 120, 74, 0, 0, TAU); c.clip(); for (const sx of [-10, 30, 70]) { c.beginPath(); c.moveTo(sx, -150); c.quadraticCurveTo(sx + 14, -110, sx, -70); stroke(c, 10, '#D9822A'); } c.restore();
    c.save(); c.translate(-80, -180); c.rotate(look * 0.1);
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 30, -60); c.lineTo(sd * 80, -120); c.lineTo(sd * 84, -40); c.closePath(); c.fillStyle = fur; c.fill(); stroke(c, 7); c.beginPath(); c.moveTo(sd * 46, -62); c.lineTo(sd * 74, -100); c.lineTo(sd * 74, -56); c.closePath(); c.fillStyle = '#FFB3C1'; c.fill(); }
    c.beginPath(); c.ellipse(0, 0, 92, 82, 0, 0, TAU); c.fillStyle = fur; c.fill(); stroke(c, 7);
    c.beginPath(); c.ellipse(0, 22, 46, 32, 0, 0, TAU); c.fillStyle = '#FFF1DE'; c.fill();
    for (const sd of [-1, 1]) {
      const ex = sd * 34, ey = -14;
      if (eyes === 'happy') { c.beginPath(); c.arc(ex, ey + 6, 14, Math.PI * 1.1, Math.PI * 1.9); stroke(c, 8); }
      else if (eyes === 'big') { c.beginPath(); c.ellipse(ex, ey, 22, 26, 0, 0, TAU); c.fillStyle = INK; c.fill(); c.beginPath(); c.arc(ex + 7, ey - 9, 8, 0, TAU); c.arc(ex - 6, ey + 8, 4, 0, TAU); c.fillStyle = '#fff'; c.fill(); }
      else if (eyes === 'glow') { c.beginPath(); c.ellipse(ex, ey, 20, 22, 0, 0, TAU); c.fillStyle = '#FFE14D'; c.fill(); c.beginPath(); c.ellipse(ex, ey, 5, 16, 0, 0, TAU); c.fillStyle = INK; c.fill(); }
      else { c.beginPath(); c.ellipse(ex + look * 5, ey, 9, 13, 0, 0, TAU); c.fillStyle = INK; c.fill(); }
      for (const k of [-1, 1]) { c.beginPath(); c.moveTo(sd * 40, 26 + k * 8); c.lineTo(sd * 110, 18 + k * 18); stroke(c, 4); }
    }
    c.beginPath(); c.moveTo(-10, 8); c.lineTo(10, 8); c.lineTo(0, 20); c.closePath(); c.fillStyle = '#FF7A9A'; c.fill(); stroke(c, 4);
    if (mouth === 'meow') { c.beginPath(); c.ellipse(0, 40, 14, 18, 0, 0, TAU); c.fillStyle = '#3B1212'; c.fill(); stroke(c, 5); }
    else { c.beginPath(); c.moveTo(-18, 30); c.quadraticCurveTo(-9, 40, 0, 30); c.quadraticCurveTo(9, 40, 18, 30); stroke(c, 5); }
    c.restore();
    if (wet) for (let k = 0; k < 5; k++) { const a = ((t * 1.3 + k / 5) % 1); c.save(); c.globalAlpha = wet * (1 - a); sweatDrop(c, -120 + k * 60, -120 + a * 120, 0.8); c.restore(); }
    c.restore();
  }

  // ---------- props ----------
  function sandwich(c, x, y, s = 1, rot = 0, half = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); const w = half ? 70 : 140;
    c.beginPath(); c.roundRect(-w / 2, 10, w, 26, 12); c.fillStyle = '#E8B86A'; c.fill(); stroke(c, 5);
    c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(-w / 2 - 6 + (i * (w + 12)) / 8, 4 + (i % 2) * 10); c.lineTo(w / 2 + 6, 14); c.lineTo(-w / 2 - 6, 14); c.closePath(); c.fillStyle = '#7ED957'; c.fill(); stroke(c, 4);
    c.beginPath(); c.roundRect(-w / 2 + 4, -6, w - 8, 12, 4); c.fillStyle = '#FF5A4E'; c.fill(); stroke(c, 4);
    c.beginPath(); c.moveTo(-w / 2, -10); c.lineTo(w / 2, -10); c.lineTo(w / 2 - 10, 2); c.lineTo(-w / 2 + 10, 2); c.closePath(); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 4);
    c.beginPath(); c.roundRect(-w / 2 - 4, -42, w + 8, 34, 16); c.fillStyle = '#F2C27A'; c.fill(); stroke(c, 5);
    c.restore();
  }
  function bowl(c, x, y, s = 1, milk = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, -30, 80, 18, 0, 0, TAU); c.fillStyle = milk ? '#FFFFFF' : '#ccc'; c.fill(); stroke(c, 5); c.beginPath(); c.moveTo(-80, -30); c.quadraticCurveTo(-70, 10, 0, 10); c.quadraticCurveTo(70, 10, 80, -30); c.fillStyle = '#4FC3F7'; c.fill(); stroke(c, 6); c.restore(); }
  function robot(c, x, y, s = 1, { broken = 0, tape = 0, happy = 0 } = {}, t = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const off = (k) => [broken * [-90, 70, -60, 80][k], broken * [-40, -60, 30, 20][k], broken * [-0.5, 0.6, -0.9, 0.7][k]];
    const part = (k, f) => { const [dx, dy, r] = off(k); c.save(); c.translate(dx, dy); c.rotate(r); f(); c.restore(); };
    part(2, () => { c.beginPath(); c.roundRect(-70, -150, 140, 130, 20); c.fillStyle = '#9AD3E8'; c.fill(); stroke(c, 6); c.beginPath(); c.arc(0, -85, 22, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 5); });
    part(0, () => { c.beginPath(); c.moveTo(-70, -130); c.lineTo(-120, -70 + Math.sin(t * 4) * 6 * happy); stroke(c, 12); });
    part(1, () => { c.beginPath(); c.moveTo(70, -130); c.lineTo(120, -70 - Math.sin(t * 4) * 6 * happy); stroke(c, 12); });
    part(3, () => { c.beginPath(); c.roundRect(-55, -250, 110, 90, 18); c.fillStyle = '#B9E4F2'; c.fill(); stroke(c, 6); c.beginPath(); c.moveTo(0, -250); c.lineTo(0, -290); stroke(c, 5); c.beginPath(); c.arc(0, -296, 10, 0, TAU); c.fillStyle = '#FF5A4E'; c.fill(); stroke(c, 4);
      for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 24, -210, 12, 0, TAU); c.fillStyle = broken > 0.5 ? '#888' : '#2B4C7E'; c.fill(); stroke(c, 4); }
      c.beginPath(); if (happy) { c.moveTo(-22, -184); c.quadraticCurveTo(0, -168, 22, -184); } else { c.moveTo(-18, -178); c.lineTo(18, -178); } stroke(c, 5); });
    if (tape) { c.save(); c.globalAlpha = tape; for (const [tx, ty, r] of [[-30, -120, 0.6], [30, -60, -0.5], [0, -200, 0.3]]) { c.save(); c.translate(tx, ty); c.rotate(r); c.fillStyle = 'rgba(240,230,190,0.95)'; c.fillRect(-40, -10, 80, 20); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2; c.strokeRect(-40, -10, 80, 20); c.restore(); } c.restore(); }
    c.restore();
  }
  function sofa(c, x, y, w = 560) { c.beginPath(); c.roundRect(x - w / 2, y - 260, w, 150, 40); c.fillStyle = '#7E6BC4'; c.fill(); stroke(c, 7); c.beginPath(); c.roundRect(x - w / 2 + 30, y - 140, w - 60, 100, 26); c.fillStyle = '#9584D6'; c.fill(); stroke(c, 7); for (const sd of [-1, 1]) { c.beginPath(); c.roundRect(x + sd * (w / 2 - 30) - 50, y - 200, 100, 170, 40); c.fillStyle = '#6A58B2'; c.fill(); stroke(c, 7); c.beginPath(); c.moveTo(x + sd * (w / 2 - 70), y - 30); c.lineTo(x + sd * (w / 2 - 80), y); stroke(c, 10); } }
  function bed(c, x, y, w = 620) { c.beginPath(); c.roundRect(x - w / 2, y - 330, 60, 330, 14); c.fillStyle = '#A0703F'; c.fill(); stroke(c, 7); c.beginPath(); c.roundRect(x - w / 2 + 40, y - 170, w - 40, 110, 20); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 7); c.beginPath(); c.roundRect(x - w / 2 + 40, y - 150, w - 40, 100, 20); c.fillStyle = '#6FA8DC'; c.fill(); stroke(c, 7); c.beginPath(); c.roundRect(x - w / 2 + 60, y - 210, 150, 60, 26); c.fillStyle = '#fff'; c.fill(); stroke(c, 6); for (const lx of [x - w / 2 + 50, x + w / 2 - 20]) { c.beginPath(); c.moveTo(lx, y - 60); c.lineTo(lx, y); stroke(c, 12); } }
  function flowerPot(c, x, y, s = 1, droop = 0, t = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const bend = droop * 1.1, tipX = Math.sin(bend) * 170, tipY = -Math.cos(bend) * 170 - 40;
    c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(0, -150, tipX, tipY); stroke(c, 12); c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(0, -150, tipX, tipY); stroke(c, 6, '#3C8A55');
    c.beginPath(); c.ellipse(-30, -110, 34, 14, -0.5 - droop, 0, TAU); c.fillStyle = '#5BB86A'; c.fill(); stroke(c, 5);
    c.save(); c.translate(tipX, tipY); c.rotate(bend);
    const pc = droop > 0.5 ? '#C9A0A0' : '#FF6FA5';
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t * 0.3 * (1 - droop); c.beginPath(); c.ellipse(Math.cos(a) * 40, Math.sin(a) * 40, 30, 22, a, 0, TAU); c.fillStyle = pc; c.fill(); stroke(c, 5); }
    c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 5);
    for (const sd of [-1, 1]) { c.beginPath(); if (droop > 0.5) { c.moveTo(sd * 12 - 6, -6); c.lineTo(sd * 12 + 6, -2); } else c.arc(sd * 12, -6, 5, 0, TAU); if (droop > 0.5) stroke(c, 4); else { c.fillStyle = INK; c.fill(); } }
    c.beginPath(); if (droop > 0.5) { c.moveTo(-12, 16); c.quadraticCurveTo(0, 6, 12, 16); } else { c.moveTo(-14, 8); c.quadraticCurveTo(0, 22, 14, 8); } stroke(c, 4);
    c.restore();
    c.beginPath(); c.moveTo(-70, -60); c.lineTo(70, -60); c.lineTo(52, 40); c.lineTo(-52, 40); c.closePath(); c.fillStyle = '#D9734E'; c.fill(); stroke(c, 7);
    c.beginPath(); c.roundRect(-80, -76, 160, 26, 8); c.fillStyle = '#C45F3D'; c.fill(); stroke(c, 6);
    c.restore();
  }
  function sink(c, x, y, flow = 0, t = 0) {
    c.beginPath(); c.roundRect(x - 220, y, 440, 70, 20); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 7);
    c.beginPath(); c.moveTo(x - 200, y + 70); c.quadraticCurveTo(x, y + 190, x + 200, y + 70); c.fillStyle = '#F2F2F2'; c.fill(); stroke(c, 7);
    c.beginPath(); c.roundRect(x - 30, y - 150, 60, 150, 14); c.fillStyle = '#C9D3DA'; c.fill(); stroke(c, 6);
    c.beginPath(); c.roundRect(x - 30, y - 170, 140, 50, 20); c.fillStyle = '#C9D3DA'; c.fill(); stroke(c, 6);
    c.beginPath(); c.roundRect(x - 60, y - 210, 60, 30, 10); c.fillStyle = '#FF5A4E'; c.fill(); stroke(c, 5);
    if (flow > 0) { c.save(); c.globalAlpha = flow; c.fillStyle = '#7FD3F7'; c.beginPath(); c.roundRect(x + 82, y - 122, 22 * flow, 160, 10); c.fill(); stroke(c, 4, '#3C7FA6'); for (let k = 0; k < 5; k++) { const a = ((t * 2 + k / 5) % 1); c.beginPath(); c.arc(x + 93 + Math.sin(k * 3) * 30 * a, y + 40 + a * 30, 8 * (1 - a), 0, TAU); c.fill(); } c.restore(); }
    return [x + 93, y - 120];
  }
  function goal(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.save(); c.strokeStyle = 'rgba(21,21,21,0.25)'; c.lineWidth = 3; for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(-200 + i * 40, -300); c.lineTo(-200 + i * 40, 0); c.stroke(); } for (let j = 0; j <= 7; j++) { c.beginPath(); c.moveTo(-200, -300 + j * 43); c.lineTo(200, -300 + j * 43); c.stroke(); } c.restore(); c.beginPath(); c.moveTo(-200, 0); c.lineTo(-200, -300); c.lineTo(200, -300); c.lineTo(200, 0); stroke(c, 16); c.beginPath(); c.moveTo(-200, 0); c.lineTo(-200, -300); c.lineTo(200, -300); c.lineTo(200, 0); stroke(c, 8, '#FFFFFF'); c.restore(); }
  function flashlightBeam(c, from, ang, len = 900, spread = 0.32, alpha = 0.5) { const g = c.createRadialGradient(from[0], from[1], 10, from[0], from[1], len); g.addColorStop(0, `rgba(255,246,190,${alpha})`); g.addColorStop(1, 'rgba(255,246,190,0)'); c.save(); c.fillStyle = g; c.beginPath(); c.moveTo(...from); c.arc(from[0], from[1], len, ang - spread, ang + spread); c.closePath(); c.fill(); c.restore(); }
  const holdFlashlight = (ang) => (c, hd) => { c.save(); c.translate(...hd); c.rotate(ang); c.beginPath(); c.roundRect(-10, -16, 80, 32, 8); c.fillStyle = '#FF5A4E'; c.fill(); stroke(c, 5); c.beginPath(); c.roundRect(64, -22, 26, 44, 6); c.fillStyle = '#FFE58A'; c.fill(); stroke(c, 5); c.restore(); };
  const holdSandwich = (half = 0, rot = 0) => (c, hd) => sandwich(c, hd[0], hd[1] - 30, 0.9, rot, half);
  const holdCup = (c, hd) => { c.save(); c.translate(...hd); c.beginPath(); c.moveTo(-30, -60); c.lineTo(30, -60); c.lineTo(24, 10); c.lineTo(-24, 10); c.closePath(); c.fillStyle = '#4FC3F7'; c.fill(); stroke(c, 5); c.restore(); };

  // ---------- backgrounds ----------
  function room(c, t, { wall = '#F6E3C8', night = 0, rain = 0, window: win = true, floor = '#C9A27A', wx = 560, wy = 330 } = {}) {
    c.fillStyle = wall; c.fillRect(-W, -H, W * 3, H * 3);
    c.fillStyle = 'rgba(0,0,0,0.04)'; for (let i = -10; i < 30; i++) c.fillRect(i * 80, -H, 30, H * 3);
    c.fillStyle = floor; c.fillRect(-W, 1430, W * 3, H); c.beginPath(); c.moveTo(-W, 1430); c.lineTo(W * 2, 1430); stroke(c, 7);
    c.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = -6; i < 20; i++) c.fillRect(i * 120, 1430, 6, H);
    if (win) {
      c.beginPath(); c.rect(wx - 20, wy - 20, 380, 420); c.fillStyle = '#fff'; c.fill(); stroke(c, 7);
      const g = c.createLinearGradient(0, wy, 0, wy + 380); g.addColorStop(0, night ? '#1B2350' : rain ? '#7D8DA0' : '#8FD3F5'); g.addColorStop(1, night ? '#3A3F7A' : rain ? '#A9B5C2' : '#D6F0FB');
      c.beginPath(); c.rect(wx, wy, 340, 380); c.fillStyle = g; c.fill(); stroke(c, 6);
      c.save(); c.beginPath(); c.rect(wx, wy, 340, 380); c.clip();
      if (night) { c.beginPath(); c.arc(wx + 250, wy + 90, 44, 0, TAU); c.fillStyle = '#FFF4C2'; c.fill(); for (let k = 0; k < 8; k++) star(c, wx + 30 + G.rnd(k, 9) * 280, wy + 30 + G.rnd(k, 8) * 300, 8, '#FFF4C2', t + k); }
      if (rain) for (let k = 0; k < 40; k++) { const a = ((t * 1.6 + G.rnd(k, 2)) % 1); const rx = wx + G.rnd(k, 1) * 360 - a * 40, ry = wy - 20 + a * 420; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 10, ry + 34); stroke(c, 4, 'rgba(230,240,255,0.8)'); }
      c.restore();
      c.beginPath(); c.moveTo(wx + 170, wy); c.lineTo(wx + 170, wy + 380); c.moveTo(wx, wy + 190); c.lineTo(wx + 340, wy + 190); stroke(c, 8, '#7A4E33');
      c.beginPath(); c.rect(wx - 40, wy + 380, 420, 30); c.fillStyle = '#C98F5E'; c.fill(); stroke(c, 6);
    }
    if (night) { c.fillStyle = `rgba(20,24,70,${0.55 * night})`; c.fillRect(-W, -H, W * 3, H * 3); }
  }
  function yard(c, t) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9FD9F7'); g.addColorStop(0.6, '#E6F6FD'); c.fillStyle = g; c.fillRect(-W, -H, W * 3, H * 3);
    for (let i = 0; i < 3; i++) { const x = ((i * 420 + t * 20) % (W + 500)) - 250, y = 300 + (i % 2) * 120; for (const [dx, dy, r] of [[0, 0, 60], [60, -24, 72], [125, 0, 56]]) { c.beginPath(); c.ellipse(x + dx, y + dy, r, r * 0.75, 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); stroke(c, 5); } }
    for (let i = -2; i < 14; i++) { c.beginPath(); c.roundRect(i * 90, 1040, 50, 380, 10); c.fillStyle = '#F2D2A9'; c.fill(); stroke(c, 5); }
    c.beginPath(); c.rect(-W, 1100, W * 3, 26); c.fillStyle = '#E0B985'; c.fill(); stroke(c, 5);
    c.fillStyle = '#8DD27A'; c.fillRect(-W, 1430, W * 3, H); c.beginPath(); c.moveTo(-W, 1430); c.lineTo(W * 2, 1430); stroke(c, 7);
  }
  function bathroom(c) { c.fillStyle = '#D9F0F2'; c.fillRect(-W, -H, W * 3, H * 3); c.strokeStyle = 'rgba(21,21,21,0.12)'; c.lineWidth = 3; for (let i = -12; i < 30; i++) { c.beginPath(); c.moveTo(i * 90, -H); c.lineTo(i * 90, H * 2); c.stroke(); c.beginPath(); c.moveTo(-W, i * 90); c.lineTo(W * 2, i * 90); c.stroke(); } c.fillStyle = '#B9C7CC'; c.fillRect(-W, 1430, W * 3, H); c.beginPath(); c.moveTo(-W, 1430); c.lineTo(W * 2, 1430); stroke(c, 7); }


  // ---------- the brand: the logo's look (sticker letters, blue sky, rays, floating bubbles) ----------
  const BRAND = ['#FF4D5E', '#FFC93C', '#4CD964', '#B072FF', '#FF8A00', '#FF4D9A', '#00B4D8'];
  function brandBg(c, t) {
    const g = c.createRadialGradient(W / 2, 760, 120, W / 2, 860, 1500); g.addColorStop(0, '#8FDBFF'); g.addColorStop(1, '#3FA9F5'); c.fillStyle = g; c.fillRect(-W, -H, W * 3, H * 3);
    c.save(); c.translate(W / 2, 760); c.rotate(t * 0.12); c.fillStyle = 'rgba(255,255,255,0.16)'; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2200, (i / 16) * TAU, ((i + 0.5) / 16) * TAU); c.fill(); } c.restore();
    for (let k = 0; k < 16; k++) { const sp = 0.05 + G.rnd(k, 3) * 0.06, a = (t * sp + G.rnd(k, 1)) % 1, r = 16 + G.rnd(k, 2) * 34, x = 60 + G.rnd(k, 4) * 900 + Math.sin(t * 1.3 + k) * 26, y = 1700 - a * 1900;
      c.save(); c.globalAlpha = 0.85; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke(); c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.35, r * 0.22, r * 0.12, -0.7, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.restore(); }
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-W, 1430, W * 3, H); c.beginPath(); c.moveTo(-W, 1430); c.lineTo(W * 2, 1430); stroke(c, 5, 'rgba(255,255,255,0.7)');
  }
  function brandLetter(c, ch, x, y, size, col) {
    c.save(); c.font = `700 ${size}px Baloo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.save(); c.shadowColor = 'rgba(20,40,90,0.45)'; c.shadowBlur = 16; c.shadowOffsetX = 6; c.shadowOffsetY = 10; c.lineWidth = size * 0.26; c.strokeStyle = '#FFFFFF'; c.strokeText(ch, x, y); c.restore();
    c.lineWidth = size * 0.07; c.strokeStyle = '#2A1E4A'; c.strokeText(ch, x, y); c.fillStyle = col; c.fillText(ch, x, y);
    c.globalAlpha = 0.55; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - size * 0.12, y - size * 0.2, size * 0.09, size * 0.045, -0.5, 0, TAU); c.fill(); c.restore();
  }
  // the title, word per line, each letter dropping in at its time and landing with a squash
  function dropTitle(c, t, str, times, y0, size, lineH) {
    c.save(); c.font = `700 ${size}px Baloo`; let gi = 0; const words = str.split(' ');
    words.forEach((wd, li) => {
      const ws = [...wd].map((ch) => c.measureText(ch).width + 6), total = ws.reduce((a, b) => a + b, 0), sc = Math.min(1, 860 / total);
      let x = W / 2 - 40 - (total * sc) / 2;
      [...wd].forEach((ch, i) => {
        const t0 = times[gi + i], cx = x + (ws[i] * sc) / 2, y = y0 + li * lineH;
        if (t0 !== null && t0 !== undefined && t >= t0) { const a = t - t0, fy = lerp(-700, 0, clamp(a / 0.22) ** 2), land = a > 0.22 ? Math.exp(-(a - 0.22) * 8) * Math.cos((a - 0.22) * 22) : 0; c.save(); c.translate(cx, y + fy + Math.sin(t * 2.4 + gi + i) * 6); c.scale(1 + 0.15 * land, 1 - 0.2 * land); c.rotate(((gi + i) % 2 ? 1 : -1) * 0.06); brandLetter(c, ch, 0, 0, size * sc, BRAND[(gi + i) % BRAND.length]); c.restore(); }
        x += ws[i] * sc;
      });
      gi += wd.length + 1;
    });
    c.restore();
  }

  // ---------- shared scenes ----------
  const L = S.L;
  function titleScene(c, t, hero = 'yasin') {
    brandBg(c, t);
    dropTitle(c, t, S.TITLE, S.letters, 300, 150, 150);
    const t0 = L.title.t + 1.0, p1 = pop(t, t0, 0.45, 2.6);
    if (p1 > 0) { c.save(); c.translate(W / 2 - 40, 590); c.scale(p1, p1); c.rotate(Math.sin((t - t0) * 6) * Math.exp(-(t - t0) * 2) * 0.1); c.font = '400 54px Bungee'; const tw = Math.max(560, c.measureText(S.title).width + 90); c.beginPath(); c.roundRect(-tw / 2, -62, tw, 124, 62); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 7); word(c, S.title, 0, 4, S.title.length > 18 ? 46 : 54, '#2B4C7E', { sw: 0 }); c.restore(); }
    const hop = Math.sin(Math.PI * beatPh(t));
    stick(c, { ...CAST[hero], x: 360, gy: 1430, s: SIZE[hero] * 1.05, bob: 20 * hop, eyes: 'happy', mouth: 'grin', hands: [[-180, -560], [180, -560]], elbows: [30, 30], knees: [40 + 20 * (1 - hop), 40 + 20 * (1 - hop)] }, t);
    if (S.cast.includes('cat')) cat(c, { x: 760, gy: 1430, s: 0.7, eyes: 'happy', bob: 24 * Math.sin(Math.PI * beatPh(t + S.BEAT / 2)) }, t);
    else if (S.cast[1]) stick(c, { ...CAST[S.cast[1]], x: 760, gy: 1430, s: SIZE[S.cast[1]] * 1.05, bob: 18 * Math.sin(Math.PI * beatPh(t + 0.15)), eyes: 'happy', mouth: 'grin', hands: [[-180, -560], [180, -560]], elbows: [30, 30] }, t);
  }
  function moralScene(c, t, cast = S.cast) {
    bg(c, '#FFE9A8', '#FFF8E2');
    c.beginPath(); c.roundRect(70, 280, W - 220, 860, 50); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 9);
    const rows = [430, 560, 740, 870];
    S.lesson.forEach(([txt, col], i) => { const st = S.moralStamps[i]; if (t < st) return; const p = outBack(clamp((t - st) / 0.18), 3); c.save(); c.translate(W / 2 - 75, rows[i]); c.scale(lerp(1.7, 1, p), lerp(1.7, 1, p)); word(c, txt, 0, 0, txt.length > 12 ? 62 : 80, col, { sw: 0 }); c.restore(); });
    S.moralStamps.forEach((st, i) => { const a = t - st; if (a > 0 && a < 0.35) { c.save(); c.globalAlpha = 1 - a / 0.35; c.beginPath(); c.ellipse(W / 2 - 75, rows[i], 300 + a * 600, 50 + a * 100, 0, 0, TAU); stroke(c, 6, '#FFD23F'); c.restore(); } });
    const hop = (tt) => S.moralStamps.reduce((a, st) => a + (tt >= st && tt < st + 0.35 ? 70 * Math.sin(Math.PI * (tt - st) / 0.35) : 0), 0);
    const cheer = ramp(t, S.moralStamps[3], 0.25), arms = [[lerp(-150, -170, cheer), lerp(-60, -560, cheer)], [lerp(150, 170, cheer), lerp(-60, -560, cheer)]];
    const people = cast.filter((w) => w !== 'cat');
    people.slice(0, 2).forEach((w, i) => stick(c, { ...CAST[w], x: i ? 720 : 230, gy: 1440, s: SIZE[w] * 0.68, bob: hop(t - i * 0.07), eyes: 'happy', mouth: 'grin', hands: arms, elbows: [30, 30] }, t));
    if (cast.includes('cat')) cat(c, { x: people.length > 1 ? 470 : 720, gy: 1440, s: 0.45, eyes: 'happy', bob: hop(t - 0.12) }, t);
  }
  function endingScene(c, t, cast = S.cast) {
    brandBg(c, t);
    dropTitle(c, t, S.END_TITLE, S.endLetters, 330, 150, 150);
    word(c, 'OUR STORY IS DONE!', W / 2 - 40, 625, 52, '#2B4C7E', { scale: pop(t, L.tota.t + 1.2, 0.4), sw: 0 });
    const [L1] = S.laughs[S.laughs.length - 1], laugh = t >= L1, cheer = { eyes: 'happy', mouth: 'grin', hands: [[-180, -560], [180, -560]], elbows: [30, 30] };
    const people = cast.filter((w) => w !== 'cat').slice(0, 2), xs = people.length > 1 ? [250, 720] : [330];
    people.forEach((w, i) => {
      const base = { ...CAST[w], x: xs[i], gy: 1430, s: SIZE[w] * 0.95 };
      const o = laugh ? laughPose(t, { ...base, lean: i ? 0.1 : -0.2, tilt: i ? 0.06 : -0.1, feet: [[-75, 0], [75, 0]] }, i * 1.7, L1) : { ...base, bob: 16 * Math.sin(Math.PI * beatPh(t + i * 0.1)), ...cheer };
      stick(c, o, t); if (laugh) laughShake(c, o, t, i * 1.7);
    });
    if (cast.includes('cat')) cat(c, { x: people.length > 1 ? 480 : 760, gy: 1430, s: 0.55, eyes: 'happy', mouth: laugh ? 'meow' : 'smile', bob: 22 * Math.sin(Math.PI * beatPh(t + 0.2)) }, t);
    const p = pop(t, L.tota.end - 0.6, 0.4, 3);
    if (p > 0) { c.save(); c.translate(W / 2 - 40, 770); c.scale(p, p); c.beginPath(); c.roundRect(-290, -66, 580, 132, 66); c.fillStyle = '#E63B2E'; c.fill(); stroke(c, 7); word(c, 'SUBSCRIBE', 40, 4, 56, '#FFFFFF', { sw: 0 }); c.save(); c.translate(-205, 0); c.rotate(Math.sin((t - L.tota.end) * 14) * Math.exp(-Math.max(0, t - L.tota.end) * 2) * 0.5); c.beginPath(); c.moveTo(-28, 24); c.lineTo(-22, -14); c.quadraticCurveTo(0, -40, 22, -14); c.lineTo(28, 24); c.closePath(); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 5); c.restore(); c.restore(); }
  }
  // a hook card: the dramatic frame, then a big question pops on top
  function hookText(c, t, lines) { const t0 = 0.15; lines.forEach(([txt, col], i) => word(c, txt, W / 2 - 40, 330 + i * 110, i ? 96 : 70, col, { scale: pop(t, t0 + i * 0.25, 0.3, 3), rot: (i % 2 ? 0.04 : -0.04), sw: 0.2 })); }

  // ---------- cameras ----------
  const Cmb = Shots.combine;
  const push = (z0, z1, x = 0, y = 0) => (s) => { const k = io(s.u); return { zoom: lerp(z0, z1, k), x: x * k, y: y * k }; };
  const hold = (z0, z1, x, y) => (s) => ({ zoom: lerp(z0, z1, io(s.u)), x, y });
  const look = (wx, wy, z0, z1) => (s) => ({ zoom: lerp(z0, z1, io(s.u)), x: wx - W / 2, y: wy - H / 2 });
  const bumps = (times, amp = 0.03, d = 9) => (s) => { let z = 1; for (const tt of times) if (s.t >= tt) z += amp * Math.exp(-(s.t - tt) * d); return { zoom: z }; };

  // ---------- captions ----------
  let SUBS = [];
  function buildSubs(vo) {
    const out = [];
    vo.lines.forEach((l, li) => {
      const id = S.vo[li] && S.vo[li].id; if (['title', 'moral', 'tota'].includes(id)) return;
      const ws = l.words; if (!ws.length) return;
      const raw = l.text.split(/\s+/).filter(Boolean), useRaw = raw.length === ws.length;
      const words = ws.map((w, i) => ({ ...w, w: (useRaw ? raw[i] : w.w).toUpperCase() }));
      const n = Math.ceil(words.length / 4), per = Math.ceil(words.length / n);
      for (let k = 0; k * per < words.length; k++) { const g = words.slice(k * per, (k + 1) * per), next = words[(k + 1) * per]; out.push({ t: g[0].t - 0.04, end: next ? next.t - 0.04 : l.end + 0.15, words: g }); }
    });
    return out;
  }
  function drawSubs(c, t) {
    const cap = SUBS.find((q) => t >= q.t && t < q.end); if (!cap) return;
    const size = 72, y = 1400, gap = 34;
    c.save(); c.font = `800 ${size}px Inter`;
    const ws = cap.words.map((w) => c.measureText(w.w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const scl = Math.min(1, (SAFE.w - 40) / total), k = pop(t, cap.t, 0.18, 2.4);
    c.translate(SAFE.x + SAFE.w / 2, y); c.scale(scl * k, scl * k);
    let x = -total / 2;
    cap.words.forEach((w, i) => { const on = t >= w.t && t < (cap.words[i + 1] ? cap.words[i + 1].t : cap.end); c.save(); c.translate(x + ws[i] / 2, 0); if (on) c.scale(1.08, 1.08); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 16; c.strokeStyle = INK; c.strokeText(w.w, 0, 0); c.fillStyle = on ? '#FFD23F' : '#FFFFFF'; c.fillText(w.w, 0, 0); c.restore(); x += ws[i] + gap; });
    c.restore();
  }
  // the episode hands over its shot list; captions are drawn on top
  function run(shots) {
    const film = Shots.film(shots);
    Studio.film({ post: { vignette: 0.08, grain: 0, paper: 0 }, fadeOut: 0.5, async init() { const f = new FontFace('Baloo', 'url(lib/fonts/baloo-700.woff2)', { weight: '700' }); document.fonts.add(await f.load()); VO = await Studio.loadJSON('out/voice.json'); SUBS = buildSubs(VO); }, draw(ctx, t) { CTX = ctx; film(ctx, t); drawSubs(ctx, t); } });
  }

  globalThis.TK = { clamp, lerp, io, outBack, ramp, pop, beatPh, stroke, shade, word, bg, ground, shadow, ball, tearDrop, sweatDrop, heart, star, arcs, speedLines, sunburst, confetti, stick, laughPose, laughShake, YASIN, FATHY, MAMA, LAILA, LEO, CAST, SIZE, blinkAt, talking, house, HOUSE, dropLetters, cat, sandwich, bowl, robot, sofa, bed, flowerPot, sink, goal, flashlightBeam, holdFlashlight, holdSandwich, holdCup, room, yard, bathroom, brandBg, dropTitle, brandLetter, titleScene, moralScene, endingScene, hookText, Cmb, push, hold, look, bumps, run, INK, W, H, TAU, SAFE };
})();
