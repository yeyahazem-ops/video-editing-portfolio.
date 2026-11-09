// THE FILM: «Yasin and the Window» in the stick-figure comic style (9:16, 60 fps).
// Big round white heads, thick ink outlines, flat tees, stick limbs, huge expressions.
// Every pose is eased between keyframes, so the motion stays smooth; nothing boils or jitters.
(function () {
  const G = globalThis.G, Subs = globalThis.Subs, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE, TAU = Math.PI * 2;
  const INK = '#151515';
  let VO = null, SUBS = [];

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
    else if (m === 'frown') { c.beginPath(); c.moveTo(-R * 0.22, my + R * 0.08); c.quadraticCurveTo(0, my - R * 0.08, R * 0.22, my + R * 0.08); stroke(c, 8 * s); }
    else if (m === 'wavy') { c.beginPath(); for (let i = 0; i <= 6; i++) c.lineTo(-R * 0.24 + i * R * 0.08, my + (i % 2 ? -R * 0.05 : R * 0.03)); stroke(c, 7 * s); }
    else { c.beginPath(); c.moveTo(-R * 0.3, my - R * 0.04); c.quadraticCurveTo(0, my + R * 0.24, R * 0.3, my - R * 0.04); stroke(c, 8 * s); }
    if (o.mustache) for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * R * 0.22, (m === 'laugh' ? -R * 0.06 : my - R * 0.14), R * 0.26, R * 0.09, sd * -0.18, 0, TAU); c.fillStyle = '#E3E1DB'; c.fill(); stroke(c, 5 * s); }
    // tears streaming sideways when laughing
    if (o.tears) for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) {
      const a = ((t * 1.9 + k / 6 + (sd > 0 ? 0.08 : 0) + (o.seed || 0) * 0.13) % 1), x = sd * (R * 0.72 + a * 330 * s), y = ey - 90 * s * a + 360 * s * a * a;
      c.save(); c.globalAlpha = Math.min(1, (1 - a) * 2.2) * o.tears; tearDrop(c, x, y, sd > 0 ? Math.atan2(-90 + 720 * a, 330) : Math.PI - Math.atan2(-90 + 720 * a, 330), s * (1.05 - a * 0.4)); c.restore();
    }
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

  // ---------- 1. title: letters drop, Yasin heads the ball on every beat ----------
  function dropLetters(c, t, str, times, cy, size, w0) {
    const letters = [...str], widths = letters.map((ch) => (ch === ' ' ? w0 * 0.45 : ch === ',' || ch === '!' ? w0 * 0.5 : w0)); let x = W / 2 - 40 - widths.reduce((a, b) => a + b, 0) / 2;
    letters.forEach((ch, i) => { const t0 = times[i]; if (t0 !== null && t >= t0) { const a = t - t0, fy = lerp(-700, 0, clamp(a / 0.22) ** 2), land = a > 0.22 ? Math.exp(-(a - 0.22) * 8) * Math.cos((a - 0.22) * 22) : 0; c.save(); c.translate(x + widths[i] / 2, cy + fy); c.scale(1 + 0.15 * land, 1 - 0.2 * land); c.rotate(Math.sin(t * 2 + i) * 0.04); word(c, ch, 0, 0, size, ['#FF5A4E', '#FFD23F', '#4FC3F7', '#7ED957'][i % 4], { sw: 0.16 }); c.restore(); } x += widths[i]; });
  }
  function title(c, t) {
    bg(c, '#FFCF8A', '#FFF2D8'); sunburst(c, t); ground(c, 1430);
    dropLetters(c, t, S.TITLE, S.letters, 360, 132, 90);
    const p1 = pop(t, T(1, 2), 0.45, 2.6);
    if (p1 > 0) { c.save(); c.translate(W / 2 - 40, 530); c.scale(p1, p1); c.rotate(Math.sin((t - T(1, 2)) * 6) * Math.exp(-(t - T(1, 2)) * 2) * 0.1); c.beginPath(); c.roundRect(-420, -62, 840, 124, 62); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 7); word(c, 'YASIN AND THE WINDOW', 0, 4, 54, '#2B4C7E', { sw: 0 }); c.restore(); }
    // Yasin heads the ball on every beat
    const on = t >= T(1), ph = beatPh(t), hop = on ? Math.sin(Math.PI * ph) : 0;
    const r = stick(c, { ...YASIN, x: 330, gy: 1430, s: 0.62, bob: on ? 26 * hop : 0, lean: -0.04, tilt: -0.12, eyes: 'happy', mouth: 'grin', hands: [[-190, -130 - 30 * hop], [190, -130 - 30 * hop]], elbows: [40, 40], knees: [40 + 26 * (1 - hop), 40 + 26 * (1 - hop)] }, t);
    const headTop = r.head[1] - r.R * 0.95;
    const by = on ? headTop - 36 - 160 * Math.sin(Math.PI * ph) : 1392, bx = on ? r.head[0] - 10 : lerp(600, 380, io(clamp(t / T(1))));
    ball(c, bx, by, 38, t * 5, on ? 0.22 * Math.exp(-ph * 14) : 0);
    if (on) { const n = Math.floor((t - T(1)) / S.BEAT) + 1, k = pop(t, T(1) + (n - 1) * S.BEAT, 0.22, 3); word(c, String(n), 760, 1100, 130 * k, '#FFFFFF', { sw: 0.18 }); word(c, 'HEADERS!', 760, 1210, 42, '#2B4C7E', { sw: 0 }); }
  }

  // ---------- 2. the street: keepy-uppy, each touch a note ----------
  const YX = 260, GY = 1430;
  const footAt = (i) => [YX + (i % 2 ? 50 : -50) * 0.7, GY - 60];
  function ballState(t) {
    const tc = S.touches;
    if (t < tc[0]) return { x: YX - 60, y: GY - 34, spin: 0, sq: 0 };
    for (let i = 0; i < tc.length; i++) {
      const a = tc[i], b = i + 1 < tc.length ? tc[i + 1] : ev.kick;
      if (t < b) { const u = (t - a) / (b - a), p0 = footAt(i), p1 = i + 1 < tc.length ? footAt(i + 1) : [YX + 70, GY - 50]; const h = i + 1 < tc.length ? 330 : 560; return { x: lerp(p0[0], p1[0], u), y: lerp(p0[1], p1[1], u) - h * 4 * u * (1 - u), spin: (i + u) * 2.2, sq: 0.22 * Math.exp(-u * 12) }; }
    }
    return { x: YX + 70, y: GY - 50, spin: 0, sq: 0 };
  }
  function street(c, t) {
    bg(c); house(c, t); ground(c, GY);
    const b = ballState(t), tc = S.touches;
    let near = 0, best = 9; tc.forEach((x, i) => { if (Math.abs(t - x) < best) { best = Math.abs(t - x); near = i; } });
    const k = Math.max(0, 1 - best / 0.26), lift = k * k * (3 - 2 * k), side = near % 2;
    const crouch = ramp(t, T(8, 3), ev.kick - T(8, 3)), ready = t > T(8, 2), playing = t >= tc[0] && !ready;
    stick(c, { ...YASIN, x: YX, gy: GY, s: 0.7, feet: [[-60 - 20 * crouch, side === 0 && playing ? 60 * lift : 0], [60 + 10 * crouch, side === 1 && playing ? 60 * lift : 0]],
      knees: [40 + 30 * crouch + (side === 0 && playing ? 40 * lift : 0), 40 + 30 * crouch + (side === 1 && playing ? 40 * lift : 0)], bob: -50 * crouch + (playing ? 8 * lift : 0), lean: -0.04 - 0.16 * crouch, squash: 0.05 * crouch,
      hands: [[-200, -160 + 28 * Math.sin(t * 3)], [200, -160 - 28 * Math.sin(t * 3)]], elbows: [40, 40], eyes: 'dot', look: [clamp((b.x - YX) / 200, -1, 1), clamp((b.y - (GY - 800)) / 300, -1, 1)], brows: ready ? 0.9 : -0.1, mouth: ready ? 'flat' : 'grin', blink: ready ? 0 : blinkAt(t, 1) }, t);
    tc.forEach((x, i) => { const a = t - x; if (a >= 0 && a < 0.3) { const [fx, fy] = footAt(i); c.save(); c.globalAlpha = 1 - a / 0.3; for (const sd of [-1, 1]) arcs(c, fx + sd * (30 + a * 120), fy, 20, sd, 5); c.restore(); } });
    ball(c, b.x, b.y, 34, b.spin, b.sq);
    const la = t - S.love; if (la > 0 && la < 1.6) for (let q = 0; q < 7; q++) { const ang = -Math.PI / 2 + (q / 6 - 0.5) * 2.2, e = io(clamp(la / 0.6)); c.save(); c.globalAlpha = clamp((1.6 - la) / 0.5); heart(c, YX + Math.cos(ang) * 250 * e, GY - 800 + Math.sin(ang) * 220 * e - la * 50, 1.3 * pop(t, S.love + q * 0.04, 0.3, 3)); c.restore(); }
    if (t > T(8, 3)) { c.save(); c.globalAlpha = ramp(t, T(8, 3), 0.6); speedLines(c, YX, GY - 450, t, 46, 520); c.restore(); }
  }
  // ---------- 3. the kick (impact frame) ----------
  function kick(c, t) {
    const a = t - ev.kick;
    c.fillStyle = '#FFE08A'; c.fillRect(-W, -H, W * 3, H * 3);
    speedLines(c, 560, 860, t, 50, 220, 'rgba(255,255,255,0.9)');
    const sw = io(clamp(a / 0.12));
    c.save(); c.translate(lerp(-60, 260, sw), lerp(1300, 1020, sw)); c.rotate(lerp(0.9, 0.2, sw));
    c.beginPath(); c.moveTo(-500, 0); c.lineTo(-40, 0); stroke(c, 34);
    c.beginPath(); c.ellipse(60, 10, 150, 66, 0, 0, TAU); c.fillStyle = INK; c.fill(); c.beginPath(); c.ellipse(80, -6, 70, 18, 0, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fill();
    c.restore();
    for (let k = 4; k >= 1; k--) { const aa = Math.max(0, a - k * 0.03); c.save(); c.globalAlpha = 0.15 * (5 - k); ball(c, 520 + aa * 1700, 860 - aa * 1100, 150, aa * 12); c.restore(); }
    ball(c, 520 + a * 1700, 860 - a * 1100, 150, a * 12, Math.max(0, 0.3 - a * 2));
    word(c, 'KICK!', 540, 470, 190, '#FF5A4E', { scale: pop(t, ev.kick, 0.2, 3), rot: -0.12 });
  }
  // ---------- 4. the flight and the CRASH ----------
  function flight(c, t) {
    const broke = t >= ev.crash;
    bg(c); const hs = house(c, t, { win: broke ? 'broken' : 'ok' }); ground(c, GY);
    const wx = hs.wx + hs.ww / 2, wy = hs.wy + hs.wh / 2, t0 = T(9, 1.5);
    const path = (u) => [lerp(-120, wx, u), lerp(1150, wy, u) - 420 * Math.sin(Math.PI * u)];
    if (!broke) {
      const u = clamp((t - t0) / (ev.crash - t0));
      for (let k = 6; k >= 1; k--) { const q = Math.max(0, u - k * 0.03), [x, y] = path(q); c.save(); c.globalAlpha = 0.08 * (7 - k); ball(c, x, y, lerp(40, 60, q), 0); c.restore(); }
      const [x, y] = path(u); ball(c, x, y, lerp(40, 60, u), t * 18);
    } else {
      const a = t - ev.crash;
      if (a < 0.7) { c.save(); c.globalAlpha = 1 - a / 0.7; speedLines(c, wx, wy, t, 50, 260, 'rgba(21,21,21,0.25)'); c.restore(); }
      for (let i = 0; i < 26; i++) { const vx = (G.rnd(i, 1) - 0.5) * 1100, vy = -350 - G.rnd(i, 2) * 500, x = wx + vx * a, y = wy + vy * a + 1600 * a * a; if (y > GY) continue; c.save(); c.translate(x, y); c.rotate(a * (G.rnd(i, 3) - 0.5) * 30); c.beginPath(); c.moveTo(0, -18); c.lineTo(20, 6); c.lineTo(-10, 18); c.closePath(); c.fillStyle = '#D6F0FB'; c.fill(); stroke(c, 4); c.restore(); }
      const p = pop(t, ev.crash, 0.2, 3.2); if (p > 0) { c.save(); c.translate(wx + 40, wy - 330); c.rotate(0.08); c.scale(p, p); star(c, 0, 0, 230, '#FFF3A8'); word(c, 'CRASH!', 0, 10, 100, '#FF5A4E', { sw: 0.18 }); c.restore(); }
      if (a < 0.18) { c.save(); c.globalAlpha = 1 - a / 0.18; c.fillStyle = '#FFFFFF'; c.fillRect(-W, -H, W * 3, H * 3); c.restore(); }
    }
  }
  // ---------- 5. the "uh-oh" face ----------
  function shock(c, t) {
    bg(c, '#BFE3F7', '#E6F4FB');
    speedLines(c, W / 2 - 40, 760, t, 44, 520, 'rgba(30,60,110,0.16)');
    const j = Math.max(0, t - S.whoosh.shock), jolt = Math.exp(-j * 6) * Math.cos(j * 20);
    stick(c, { ...YASIN, x: W / 2 - 40, gy: 2300, s: 1.4, bob: 60 * Math.max(0, jolt), squash: -0.05 * jolt, eyes: 'wide', look: [0, 0], brows: -0.9, browUp: 1, mouth: 'o', open: 0.8, sweat: 1, hands: [[-200, -520], [200, -520]], elbows: [50, 50] }, t);
    for (let k = 0; k < 3; k++) word(c, '!', 740 + k * 80, 330 - k * 30, 140 + k * 20, '#FF5A4E', { scale: pop(t, S.whoosh.shock + 0.1 + k * 0.12, 0.25, 3.5), rot: (k - 1) * 0.15 });
  }
  // ---------- 6. hiding behind the wall, thinking ----------
  function hide(c, t) {
    bg(c);
    c.save(); c.translate(500, 760); c.scale(0.5, 0.5); c.translate(-HOUSE.x, -HOUSE.y); house(c, t, { win: 'broken' }); c.restore();
    ground(c, GY);
    const cyc = ((t - ev.hide) * 0.6) % 1, out = cyc < 0.22 ? outBack(cyc / 0.22, 1.6) : cyc < 0.6 ? 1 : 1 - io((cyc - 0.6) / 0.4);
    stick(c, { ...YASIN, x: 140 + 170 * out, gy: GY, s: 0.7, lean: 0.12 * out, eyes: 'dot', look: [1, 0], brows: -0.8, mouth: 'wavy', sweat: 1, hands: [[-60, -330], [120, -380]], elbows: [60, 50], blink: blinkAt(t, 2) }, t);
    c.beginPath(); c.rect(-40, 560, 240, 1000); c.fillStyle = '#E8B97C'; c.fill(); stroke(c, 8);
    for (let r = 0; r < 12; r++) { c.beginPath(); c.moveTo(-40, 620 + r * 80); c.lineTo(200, 620 + r * 80); stroke(c, 4, 'rgba(21,21,21,0.25)'); }
    const l = S.vo.find((q) => q.id === 'hide'), p = pop(t, l.at - 0.3, 0.4, 2.2);
    if (p > 0) {
      const br = 1 + 0.015 * Math.sin(t * 4);
      c.save(); c.translate(520, 400); c.scale(p * br, p * br);
      for (const [dx, dy, r] of [[-260, 300, 22], [-200, 230, 34]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fillStyle = '#fff'; c.fill(); stroke(c, 6); }
      c.beginPath(); c.roundRect(-400, -150, 800, 300, 150); c.fillStyle = '#fff'; c.fill(); stroke(c, 7);
      word(c, 'NOBODY SAW ME...', 0, -40, 54, INK, { sw: 0 }); word(c, 'SHOULD I HIDE?', 0, 50, 62, '#FF5A4E', { sw: 0 });
      c.restore();
    }
  }
  // ---------- 7. remembering Mama ----------
  function think(c, t) {
    bg(c, '#FFD1DC', '#FFF1EA');
    for (let k = 0; k < 10; k++) { const a = (t * 0.22 + G.rnd(k, 3)) % 1; c.save(); c.globalAlpha = 0.35; heart(c, 80 + G.rnd(k, 1) * 860, 1500 - a * 1300, 1.2 + G.rnd(k, 2)); c.restore(); }
    ground(c, GY);
    const ja = t - S.jump, hop = ja > 0 && ja < 0.5 ? Math.sin(Math.PI * ja / 0.5) : 0, land = ja >= 0.5 ? Math.exp(-(ja - 0.5) * 8) * Math.cos((ja - 0.5) * 22) : 0, decided = t >= S.jump;
    stick(c, { ...YASIN, x: 190, gy: GY, s: 0.64, bob: 220 * hop, squash: -0.06 * hop + 0.1 * land, knees: [40 + 60 * hop, 40 + 60 * hop], eyes: decided ? 'happy' : 'dot', look: [0.6, -0.8], brows: decided ? 0.5 : -0.4, mouth: decided ? 'grin' : 'flat', hands: decided ? [[-150, -140], [170, -560]] : [[-150, -100], [40, -330]], elbows: [40, decided ? 30 : 80], blink: blinkAt(t, 3) }, t);
    const p = pop(t, ev.think + 0.2, 0.5, 1.8);
    if (p > 0) {
      c.save(); c.translate(630, 560); c.scale(p * 0.86, p * 0.86);
      for (const [dx, dy, r] of [[-370, 400, 24], [-310, 320, 38]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fillStyle = '#fff'; c.fill(); stroke(c, 6); }
      c.beginPath(); c.roundRect(-360, -520, 720, 780, 200); c.fillStyle = '#fff'; c.fill(); stroke(c, 7);
      stick(c, { ...MAMA, x: -150, gy: 230, s: 0.42, eyes: 'happy', mouth: 'smile', hands: [[-150, -60], [200, -420]], elbows: [40, 30], tilt: 0.05 * Math.sin(t * 2) }, t);
      heart(c, -150, -450, 2.2 + 0.25 * Math.sin(t * 6));
      const q = pop(t, T(15, 2), 0.35);
      if (q > 0) { c.save(); c.translate(150, -150); c.scale(q, q); word(c, 'HONESTY', 0, 0, 66, '#F0506E', { sw: 0.14 }); word(c, 'IS ALWAYS', 0, 85, 42, INK, { sw: 0 }); word(c, 'BEST!', 0, 160, 74, '#2B4C7E', { sw: 0.14 }); c.restore(); }
      c.restore();
    }
    if (decided) star(c, 190, 560 - 220 * hop, 60 * pop(t, S.jump, 0.3, 3), '#FFD23F', t * 2);
  }
  // ---------- 8–9. at the door: walk, knock, sorry, uncle smiles ----------
  function atDoor(c, t) {
    bg(c);
    const open = clamp((t - ev.open) / 0.6), smiling = t >= ev.smile + 0.4, out = ramp(t, T(23, 1), 0.7);
    const fm = talking('fathy', t);
    const fathyO = (x) => ({ ...FATHY, x, gy: GY, s: 0.62, eyes: smiling ? 'happy' : 'dot', look: [-0.8, 0.2], brows: smiling ? -0.2 : 0.7, browUp: smiling ? 0.5 : 0, mouth: fm !== null ? 'talk' : smiling ? 'grin' : 'flat', open: fm ?? 0.5, blink: blinkAt(t, 4),
      hands: out >= 1 ? [[-330, -380], [150, -100]] : [[-130, -40], [130, -40]], elbows: out >= 1 ? [20, 40] : [70, 70], feet: [[-50, 0], [50, 0]], bob: out > 0 && out < 1 ? 10 * Math.sin(out * Math.PI) : 0 });
    const fx = lerp(HOUSE.x + 470 + 110, HOUSE.x + 470 - 40, out);
    const hs = house(c, t, { win: 'broken', doorOpen: open, inside: t >= ev.open && out <= 0 ? (cc) => stick(cc, fathyO(fx), t) : null });
    ground(c, GY);
    if (out > 0) stick(c, fathyO(fx), t);
    const arrive = T(17, 3), x0 = 110, x1 = hs.dx - 190;
    const u = clamp((t - ev.door) / (arrive - ev.door)), walking = t >= ev.door && t < arrive;
    const x = lerp(x0, x1, io(u)), wph = (t - ev.door) * 3.2 * TAU, wk = walking ? Math.sin(Math.PI * u) : 0;
    const ym = talking('yasin', t), happy = t >= S.hug;
    const kn = ev.knock.find((k) => t >= k - 0.12 && t < k + 0.14), knock = kn !== undefined ? Math.sin(clamp((t - (kn - 0.12)) / 0.26) * Math.PI) : 0;
    const knocking = t >= T(17, 3.5) && t < ev.open;
    stick(c, { ...YASIN, x, gy: GY, s: 0.62, bob: walking ? 10 * Math.abs(Math.sin(wph)) * wk : happy ? 10 * Math.sin(Math.PI * beatPh(t)) : 0,
      feet: [[-45 + 40 * Math.sin(wph) * wk, 30 * Math.max(0, Math.sin(wph)) * wk], [45 - 40 * Math.sin(wph) * wk, 30 * Math.max(0, -Math.sin(wph)) * wk]],
      hands: knocking ? [[-150, -80], [lerp(250, 320, knock), -380]] : walking ? [[-150 - 40 * Math.sin(wph) * wk, -80], [150 + 40 * Math.sin(wph) * wk, -80]] : ym !== null ? [[-160, -120], [60, -230]] : happy ? [[-150, -80], [150, -80]] : [[-60, -130], [60, -130]],
      elbows: [50, knocking ? 20 : 50], eyes: happy ? 'happy' : 'dot', look: [0.8, ym !== null ? 0.5 : -0.3], brows: happy ? 0.2 : -0.8, browUp: happy ? 0 : 0.4, mouth: ym !== null ? 'talk' : happy ? 'grin' : 'wavy', open: ym ?? 0.5, blush: happy ? 1 : 0.5, blink: blinkAt(t, 1), lean: walking ? 0.04 : 0 }, t);
    ev.knock.forEach((k, i) => { const p = pop(t, k, 0.15, 3); if (p > 0 && t < ev.open + 0.4) word(c, 'KNOCK!', hs.dx + 110 + (i - 1) * 30, hs.dy + 80 + i * 80, 46, '#FF5A4E', { scale: p, rot: -0.15 + i * 0.12, stroke: '#fff', sw: 0.24 }); });
    const ha = t - S.hug; if (ha > 0 && ha < 1.8) for (let k = 0; k < 8; k++) { const ang = -Math.PI / 2 + (k / 7 - 0.5) * 2.4, e = io(clamp(ha / 0.7)); c.save(); c.globalAlpha = clamp((1.8 - ha) / 0.5); heart(c, (x + fx) / 2 + Math.cos(ang) * 280 * e, 780 + Math.sin(ang) * 220 * e - ha * 50, 1.4 * pop(t, S.hug + k * 0.04, 0.3, 3)); c.restore(); }
  }
  // ---------- 10. fixing the window together ----------
  function fix(c, t) {
    bg(c, '#F6D7B5', '#FBEBDD');
    const done = t >= S.sparkle, wx = 240, wy = 420, ww = 520, wh = 500;
    for (const sd of [-1, 1]) { c.beginPath(); c.rect(sd < 0 ? wx - 150 : wx + ww + 30, wy - 10, 120, wh + 20); c.fillStyle = '#4FA37A'; c.fill(); stroke(c, 7); }
    c.beginPath(); c.rect(wx - 20, wy - 20, ww + 40, wh + 40); c.fillStyle = '#fff'; c.fill(); stroke(c, 8);
    c.beginPath(); c.rect(wx, wy, ww, wh); c.fillStyle = done ? '#BFE6F7' : '#2C2C3A'; c.fill(); stroke(c, 7);
    if (!done) { const g = outBack(clamp((t - ev.fix) / 1.0), 1.4); c.save(); c.globalAlpha = 0.85; c.beginPath(); c.rect(wx, lerp(-600, wy, g), ww, wh); c.fillStyle = '#BFE6F7'; c.fill(); stroke(c, 6); c.restore(); }
    else { const a = t - S.sparkle; for (let k = 0; k < 4; k++) star(c, wx + 80 + k * 120, wy + 120 + (k % 2) * 220, 26 + 10 * Math.sin(a * 6 + k), '#FFF6B0', a + k); }
    c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); stroke(c, 8, '#7A4E33');
    ground(c, GY);
    const tap = S.taps.reduce((a, k) => (t >= k - 0.12 && t < k + 0.12 ? 1 - Math.abs(t - k) / 0.12 : a), 0);
    const hb = done ? 14 * Math.sin(Math.PI * beatPh(t)) : 0, fm = talking('fathy', t);
    stick(c, { ...FATHY, x: 790, gy: GY, s: 0.6, bob: hb, eyes: 'happy', mouth: fm !== null ? 'talk' : 'grin', open: fm ?? 0.5, hands: done ? [[-170, -560], [170, -560]] : [[-210, -330], [-160, -230]], elbows: [30, 40] }, t);
    stick(c, { ...YASIN, x: 210, gy: GY, s: 0.6, bob: hb, eyes: 'dot', look: [1, -1], brows: 0.6, mouth: done ? 'grin' : 'smile', hands: done ? [[-170, -560], [170, -560]] : [[-150, -80], [210, -470 - 60 * (1 - tap)]], elbows: [40, 30],
      holds: [null, done ? null : (cc, hd) => { cc.save(); cc.translate(...hd); cc.rotate(-0.7 + tap * 0.9); cc.beginPath(); cc.rect(-8, -10, 16, 130); cc.fillStyle = '#8A5A3B'; cc.fill(); stroke(cc, 5); cc.beginPath(); cc.roundRect(-40, -46, 80, 40, 8); cc.fillStyle = '#9AA3AD'; cc.fill(); stroke(cc, 5); cc.restore(); }] }, t);
    S.taps.forEach((k, i) => { const a = t - k; if (a >= 0 && a < 0.3) { c.save(); c.globalAlpha = 1 - a / 0.3; word(c, 'TAP!', 430 + (i % 2) * 60, 360 + (i % 3) * 40, 46, '#FFFFFF', { sw: 0.22 }); c.restore(); } });
    if (done) { word(c, 'GOOD AS NEW!', W / 2 - 40, 300, 80, '#7ED957', { scale: pop(t, S.sparkle, 0.35, 3.5), rot: Math.sin(t * 5) * 0.03 }); confetti(c, t, S.sparkle); }
  }
  // ---------- 11. playing together, then the big laugh ----------
  function play(c, t) {
    bg(c); house(c, t, { win: 'fixed', doorOpen: 1 }); ground(c, GY);
    const ps = S.passes, ax = 220, bx = 740, L0 = S.laughs[0][0], laugh = t >= L0;
    let bxp = ax + 70, byp = GY - 34, sq = 0;
    for (let i = 0; i < ps.length; i++) { const a = ps[i], b = i + 1 < ps.length ? ps[i + 1] : ps[i] + S.BEAT; if (t >= a && t < b) { const u = (t - a) / (b - a), from = i % 2 ? bx - 70 : ax + 70, to = i % 2 ? ax + 70 : bx - 70; bxp = lerp(from, to, u); byp = GY - 34 - 220 * Math.sin(Math.PI * u); sq = 0.22 * Math.exp(-u * 12); } }
    if (t >= ps[ps.length - 1] + S.BEAT) { bxp = ax + 90; byp = GY - 34; }
    const kickNear = (side) => { let v = 0; ps.forEach((p, i) => { if (i % 2 === side) v = Math.max(v, Math.max(0, 1 - Math.abs(t - p) / 0.22)); }); return v * v * (3 - 2 * v); };
    const ky = kickNear(0), kf = kickNear(1);
    const yo = laugh ? laughPose(t, { ...YASIN, x: ax, gy: GY, s: 0.6, lean: -0.2, tilt: -0.1, feet: [[-80, 0], [70, 0]] }, 0, L0) : { ...YASIN, x: ax, gy: GY, s: 0.6, eyes: 'happy', mouth: 'grin', bob: 10 * Math.sin(Math.PI * beatPh(t)), feet: [[-55, 0], [55 + 40 * ky, 50 * ky]], knees: [40, 40 + 40 * ky], hands: [[-170, -150], [170, -150]], elbows: [40, 40] };
    const fo = laugh ? laughPose(t, { ...FATHY, x: bx, gy: GY, s: 0.6, lean: 0.1, tilt: 0.06, feet: [[-70, 0], [80, 0]] }, 1.7, L0) : { ...FATHY, x: bx, gy: GY, s: 0.6, eyes: 'happy', mouth: 'grin', bob: 8 * Math.sin(Math.PI * beatPh(t + 0.1)), feet: [[-55 - 40 * kf, 50 * kf], [55, 0]], knees: [40 + 40 * kf, 40], hands: [[-160, -150], [160, -150]], elbows: [40, 40] };
    stick(c, yo, t); stick(c, fo, t);
    if (laugh) { laughShake(c, yo, t, 0); laughShake(c, fo, t, 1.7); word(c, 'HA HA HA!', W / 2 - 40, 320, 110, '#FFD23F', { scale: pop(t, L0 + 0.1, 0.3, 3), rot: -0.06 }); }
    ball(c, bxp, byp, 32, t * 8, sq);
  }
  // ---------- 12. the lesson ----------
  function moral(c, t) {
    bg(c, '#FFE9A8', '#FFF8E2');
    c.beginPath(); c.roundRect(70, 260, W - 220, 900, 50); c.fillStyle = '#FFFFFF'; c.fill(); stroke(c, 9);
    const rows = [400, 520, 720, 850];
    const lines = [['EVERYONE MAKES', '#2B4C7E', 70], ['MISTAKES...', '#2B4C7E', 92], ['BUT BRAVE KIDS', '#FF5A4E', 70], ['TELL THE TRUTH!', '#FF5A4E', 80]];
    lines.forEach(([txt, col, size], i) => { const st = S.moralStamps[i]; if (t < st) return; const p = outBack(clamp((t - st) / 0.18), 3); c.save(); c.translate(W / 2 - 75, rows[i]); c.scale(lerp(1.7, 1, p), lerp(1.7, 1, p)); word(c, txt, 0, 0, size, col, { sw: 0 }); c.restore(); });
    for (let i = 0; i < 4; i++) { const a = t - S.moralStamps[i]; if (a > 0 && a < 0.35) { c.save(); c.globalAlpha = 1 - a / 0.35; c.beginPath(); c.ellipse(W / 2 - 75, rows[i], 300 + a * 600, 50 + a * 100, 0, 0, TAU); stroke(c, 6, '#FFD23F'); c.restore(); } }
    const hop = (tt) => S.moralStamps.reduce((a, st) => a + (tt >= st && tt < st + 0.35 ? 70 * Math.sin(Math.PI * (tt - st) / 0.35) : 0), 0);
    const cheer = ramp(t, S.moralStamps[3], 0.25);
    const arms = [[lerp(-150, -170, cheer), lerp(-60, -560, cheer)], [lerp(150, 170, cheer), lerp(-60, -560, cheer)]];
    stick(c, { ...YASIN, x: 230, gy: 1440, s: 0.42, bob: hop(t), eyes: 'happy', mouth: 'grin', hands: arms, elbows: [30, 30] }, t);
    stick(c, { ...FATHY, x: 720, gy: 1440, s: 0.42, bob: hop(t - 0.07), eyes: 'happy', mouth: 'grin', hands: arms, elbows: [30, 30] }, t);
  }
  // ---------- 13. the ending: TOTA, TOTA! and the laugh loop ----------
  function ending(c, t) {
    bg(c, '#FFCF8A', '#FFF2D8'); sunburst(c, t); ground(c, 1430);
    dropLetters(c, t, S.END_TITLE, S.endLetters, 380, 128, 92);
    word(c, 'OUR STORY IS DONE!', W / 2 - 40, 520, 52, '#2B4C7E', { scale: pop(t, T(32), 0.4), sw: 0 });
    const L1 = S.laughs[1][0], laugh = t >= L1;
    const cheer = { eyes: 'happy', mouth: 'grin', hands: [[-180, -560], [180, -560]], elbows: [30, 30] };
    const yo = laugh ? laughPose(t, { ...YASIN, x: 250, gy: 1430, s: 0.58, lean: -0.22, tilt: -0.1, feet: [[-80, 0], [70, 0]] }, 0, L1) : { ...YASIN, x: 250, gy: 1430, s: 0.58, bob: 18 * Math.sin(Math.PI * beatPh(t)), ...cheer };
    const fo = laugh ? laughPose(t, { ...FATHY, x: 720, gy: 1430, s: 0.58, lean: 0.1, tilt: 0.06, feet: [[-70, 0], [80, 0]] }, 1.7, L1) : { ...FATHY, x: 720, gy: 1430, s: 0.58, bob: 14 * Math.sin(Math.PI * beatPh(t + 0.1)), ...cheer };
    stick(c, yo, t); stick(c, fo, t);
    if (laugh) { laughShake(c, yo, t, 0); laughShake(c, fo, t, 1.7); }
    const p = pop(t, ev.sub, 0.4, 3);
    if (p > 0) { c.save(); c.translate(W / 2 - 40, 660); c.scale(p, p); c.beginPath(); c.roundRect(-290, -66, 580, 132, 66); c.fillStyle = '#E63B2E'; c.fill(); stroke(c, 7); word(c, 'SUBSCRIBE', 40, 4, 56, '#FFFFFF', { sw: 0 }); const sw = Math.sin((t - ev.sub) * 14) * Math.exp(-(t - ev.sub) * 2) * 0.5; c.save(); c.translate(-205, 0); c.rotate(sw); c.beginPath(); c.moveTo(-28, 24); c.lineTo(-22, -14); c.quadraticCurveTo(0, -40, 22, -14); c.lineTo(28, 24); c.closePath(); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 5); c.beginPath(); c.arc(0, 30, 8, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); stroke(c, 4); c.restore(); c.restore(); }
  }

  // ---------- the shots ----------
  const C = Shots.combine;
  const push = (z0, z1, x = 0, y = 0) => (s) => { const k = io(s.u); return { zoom: lerp(z0, z1, k), x: x * k, y: y * k }; };
  const hold = (z0, z1, x, y) => (s) => ({ zoom: lerp(z0, z1, io(s.u)), x, y });
  const bumps = (times, amp = 0.03, d = 9) => (s) => { let z = 1; for (const tt of times) if (s.t >= tt) z += amp * Math.exp(-(s.t - tt) * d); return { zoom: z }; };
  const film = Shots.film([
    { at: 0, draw: title, cam: C(push(1.06, 1), bumps(S.sung[0].map((n) => n.t), 0.035)) },
    { at: ev.street, draw: street, in: { type: 'iris', dur: 0.8 }, cam: push(1, 1.06, -40, 60) },
    { at: T(6, 3), draw: street, in: 'cut', cam: (s) => { const k = io(clamp((s.t - T(8, 3)) / (ev.kick - T(8, 3)))); return { zoom: lerp(1.45, 1.9, k), x: YX + 120 - W / 2, y: lerp(GY - 560, GY - 520, k) - H / 2 }; } },
    { at: ev.kick, draw: kick, in: 'flash', cam: C((s) => ({ zoom: 1 + 0.25 * Math.exp(-(s.t - ev.kick) * 7) }), Shots.shake(26, ev.kick, 6)) },
    { at: T(9, 1.5), draw: flight, in: 'whip', cam: C((s) => { const k = io(clamp((s.t - s.t0) / (ev.crash - s.t0))); return { zoom: 1.15 + (s.t >= ev.crash ? 0.12 * Math.exp(-(s.t - ev.crash) * 5) : 0), x: lerp(-120, 40, k), y: -60 }; }, Shots.shake(30, ev.crash, 5)) },
    { at: T(11), draw: shock, in: 'cut', cam: (s) => ({ zoom: 1 + 0.12 * io(clamp((s.t - s.t0) / 0.35)) }) },
    { at: ev.hide, draw: hide, in: 'whip', cam: push(1, 1.05) },
    { at: ev.think, draw: think, in: { type: 'dip', dur: 0.5, color: '#FFFFFF' }, cam: C(push(1, 1.04), bumps([S.jump + 0.5], 0.05)) },
    { at: ev.door, draw: atDoor, in: 'whip', cam: C(push(1, 1.05, 40, 30), bumps(ev.knock, 0.02, 12)) },
    { at: T(19), draw: atDoor, in: 'cut', cam: hold(1.45, 1.55, 800 - W / 2, 860 - H / 2) },
    { at: ev.smile, draw: atDoor, in: 'cut', cam: hold(1.5, 1.6, 930 - W / 2, 860 - H / 2) },
    { at: T(23, 1), draw: atDoor, in: 'cut', cam: C(hold(1.22, 1.3, 820 - W / 2, 1000 - H / 2), bumps([S.hug], 0.05)) },
    { at: ev.fix, draw: fix, in: 'whip', cam: C(push(1, 1.04), bumps(S.taps, 0.015, 14), bumps([S.sparkle], 0.06)) },
    { at: ev.play, draw: play, in: 'push', cam: C(push(1.05, 1.15, 0, 120), bumps([S.laughs[0][0]], 0.05)) },
    { at: ev.moral, draw: moral, in: { type: 'iris', dur: 0.8 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: ev.end, draw: ending, in: 'paper', cam: C(push(1.04, 1), bumps(S.sung[1].map((n) => n.t), 0.035)) },
  ]);

  // ---------- captions: short punchy chunks, the spoken word lights up ----------
  function buildSubs(vo) {
    const out = [];
    vo.lines.forEach((l, li) => {
      const id = S.vo[li] && S.vo[li].id;
      if (['title', 'hide', 'moral'].includes(id)) return;
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
    const ws = cap.words.map((w) => c.measureText(w.w).width);
    const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const scl = Math.min(1, (SAFE.w - 40) / total), k = pop(t, cap.t, 0.18, 2.4);
    c.translate(SAFE.x + SAFE.w / 2, y); c.scale(scl * k, scl * k);
    let x = -total / 2;
    cap.words.forEach((w, i) => {
      const on = t >= w.t && t < (cap.words[i + 1] ? cap.words[i + 1].t : cap.end);
      c.save(); c.translate(x + ws[i] / 2, 0); if (on) c.scale(1.08, 1.08);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 16; c.strokeStyle = INK; c.strokeText(w.w, 0, 0);
      c.fillStyle = on ? '#FFD23F' : '#FFFFFF'; c.fillText(w.w, 0, 0); c.restore();
      x += ws[i] + gap;
    });
    c.restore();
  }

  Studio.film({
    post: { vignette: 0.08, grain: 0, paper: 0 },
    fadeOut: 0.6,
    async init() { VO = await Studio.loadJSON('out/voice.json'); SUBS = buildSubs(VO); },
    draw(ctx, t) { film(ctx, t); drawSubs(ctx, t); },
  });
})();
