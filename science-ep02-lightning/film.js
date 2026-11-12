// Bubbly Tales · Science #2 «How Lightning Works». Cold open: the strike is already on screen at frame 0.
(function () {
  const K = globalThis.KIT, S = globalThis.SCORE, L = S.L, ev = S.ev;
  const { W, H, TAU, INK, clamp, lerp, io, ramp, lin, pop, rnd, grad, bg, text, label, glow, cloud, zigzag, bolt, rainFx, eyes, Cmb, push, bumps, shakes, Shots } = K;
  const night = (c, top = '#0B1026', bot = '#2A3566') => { c.fillStyle = grad(c, 0, H, [[0, top], [1, bot]]); c.fillRect(-300, -300, W + 600, H + 600); };
  const flashA = (t, t0, d = 0.5) => (t < t0 ? 0 : Math.exp(-(t - t0) / d * 3) * (0.7 + 0.3 * Math.cos((t - t0) * 40)));
  function ground(c, y, col = '#1C2A3A') { c.beginPath(); c.moveTo(-300, y); for (let x = -300; x <= W + 300; x += 60) c.lineTo(x, y + 14 * Math.sin(x * 0.01)); c.lineTo(W + 300, H + 300); c.lineTo(-300, H + 300); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); }
  function house(c, x, y, s, lit = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-60, -90, 120, 90); c.fillStyle = '#3B4A63'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(-78, -86); c.lineTo(0, -150); c.lineTo(78, -86); c.closePath(); c.fillStyle = '#7A3B3B'; c.fill(); c.stroke(); c.fillStyle = lit ? '#FFD23F' : '#223'; c.fillRect(-36, -64, 26, 26); c.fillRect(10, -64, 26, 26); c.restore(); }
  function tree(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#3B2A20'; c.fillRect(-10, -70, 20, 70); c.beginPath(); c.arc(0, -100, 52, 0, TAU); c.fillStyle = '#1F4D3A'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.restore(); }
  function tower(c, x, y, h) { c.lineWidth = 8; c.strokeStyle = INK; c.beginPath(); c.moveTo(x - 50, y); c.lineTo(x, y - h); c.lineTo(x + 50, y); for (let i = 1; i < 5; i++) { const yy = y - (h * i) / 5, w = 50 * (1 - i / 5); c.moveTo(x - w, yy); c.lineTo(x + w, yy); } c.stroke(); c.beginPath(); c.arc(x, y - h, 9, 0, TAU); c.fillStyle = '#FF3B30'; c.fill(); }
  function person(c, x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 9; c.strokeStyle = '#FFFFFF'; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, 0); c.lineTo(0, -60); c.lineTo(22, 0); c.moveTo(0, -60); c.lineTo(0, -130); if (o.ears) { c.moveTo(0, -115); c.lineTo(-34, -150); c.lineTo(-24, -168); c.moveTo(0, -115); c.lineTo(34, -150); c.lineTo(24, -168); } else if (o.count) { c.moveTo(0, -115); c.lineTo(-30, -90); c.moveTo(0, -115); c.lineTo(40, -150); c.lineTo(50, -190); } else { c.moveTo(-30, -90); c.lineTo(0, -115); c.lineTo(30, -90); } c.stroke(); c.beginPath(); c.arc(0, -160, 28, 0, TAU); c.fillStyle = '#2A3566'; c.fill(); c.stroke(); if (o.hair) { c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * 9, -186); c.lineTo(i * 14 + Math.sin(t * 30 + i) * 3, -222 - (i % 2 ? 0 : 8)); } c.stroke(); } c.restore(); }
  const SUN = (c, x, y, r, t) => { c.save(); c.translate(x, y); c.rotate(t * 0.4); for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(r * 1.1, -10); c.lineTo(r * 1.45, 0); c.lineTo(r * 1.1, 10); c.fillStyle = '#FFB627'; c.fill(); } c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.restore(); };
  // 1 · cold open: a bolt on frame 0 and the claim, big
  const OPEN = zigzag(11, 560, 300, 470, 1330, 12, 70);
  function open(c, t) {
    night(c); glow(c, 520, 900, 900, 'rgba(140,180,255,0.6)', flashA(t, ev.open, 0.6) + 0.15);
    cloud(c, 300, 260, 1.3, '#2C3654'); cloud(c, 820, 230, 1.2, '#36405F'); ground(c, 1330); house(c, 860, 1330, 0.8); tree(c, 170, 1330, 0.9);
    const br = zigzag(41, OPEN[5][0], OPEN[5][1], OPEN[5][0] + 220, OPEN[5][1] + 300, 6, 40), br2 = zigzag(77, OPEN[3][0], OPEN[3][1], OPEN[3][0] - 230, OPEN[3][1] + 260, 6, 40);
    const on = clamp(1 - lin(t, 0.9, 0.5)) + (t > 1.6 && t < 1.75 ? 0.9 : 0); bolt(c, OPEN, 1, on, 1.2); bolt(c, br, 1, on * 0.8, 0.6); bolt(c, br2, 1, on * 0.8, 0.6);
    rainFx(c, t);
    text(c, '5X HOTTER', 540, 560, 150, '#FFD23F', { font: 'Bungee', weight: 400, rot: -0.05, lw: 22, shadow: '#7A0F1E', scale: 1 + 0.04 * Math.sin(t * 7) });
    text(c, 'THAN THE SUN', 540, 710, 92, '#FFFFFF', { font: 'Bungee', weight: 400, rot: -0.05, lw: 16 });
    SUN(c, 880, 860, 60 * pop(t, 0.9, 0.4), t);
    c.fillStyle = `rgba(255,255,255,${0.85 * flashA(t, ev.open, 0.3)})`; c.fillRect(-300, -300, W + 600, H + 600);
  }
  // 2 · inside the cloud: ice and hail smash together
  function inside(c, t) {
    night(c, '#141B33', '#3A4670'); rainFx(c, t, 0.4);
    cloud(c, 540, 820, 2.3, '#55658A');
    text(c, '?', 860, 400, 160, '#FFD23F', { scale: pop(t, L.q.t + 0.6, 0.3, 3) * (t < L.ice.t ? 1 : 0), lw: 18 });
    if (t < L.ice.t - 0.1) { eyes(c, 470, 820, 70, 34, 1, { look: [0.4, -0.6] }); return; }
    // particles drifting up/down; at each crash a pair meets in the middle with a spark
    for (let i = 0; i < 18; i++) { const big = i % 3 === 0, ph = t * (big ? -0.25 : 0.35) + rnd(i), y = 520 + ((ph % 1 + 1) % 1) * 600, x = 200 + rnd(i + 4) * 680 + Math.sin(t * 2 + i) * 20; c.save(); c.translate(x, y); if (big) { c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fillStyle = '#E8F4FF'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); } else { c.rotate(t + i); c.beginPath(); for (let j = 0; j < 3; j++) { c.rotate(Math.PI / 3); c.moveTo(-18, 0); c.lineTo(18, 0); } c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.lineCap = 'round'; c.stroke(); } c.restore(); }
    ev.crashes.forEach((x0, i) => { const a = t - x0, px = 300 + rnd(i + 20) * 480, py = 640 + rnd(i + 30) * 340; if (a > -0.4 && a < 0) { const k = 1 + a / 0.4; c.beginPath(); c.arc(px - 120 * (1 - k), py + 40 * (1 - k), 28, 0, TAU); c.fillStyle = '#E8F4FF'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.arc(px + 120 * (1 - k), py - 40 * (1 - k), 18, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.stroke(); }
      if (a >= 0 && a < 0.45) { glow(c, px, py, 160, 'rgba(255,240,140,0.9)', 1 - a / 0.45); for (let j = 0; j < 8; j++) { const an = (j / 8) * TAU, r0 = 30 + a * 300; c.beginPath(); c.moveTo(px + Math.cos(an) * r0, py + Math.sin(an) * r0); c.lineTo(px + Math.cos(an) * (r0 + 40), py + Math.sin(an) * (r0 + 40)); c.lineWidth = 7; c.strokeStyle = '#FFD23F'; c.lineCap = 'round'; c.stroke(); } } });
    label(c, 'ICE', 250, 470, pop(t, L.ice.t + 1.4, 0.3), { size: 50 }); label(c, 'HAIL', 830, 1160, pop(t, L.ice.t + 2.0, 0.3), { size: 50, bg: '#E8F4FF' });
    if (t >= ev.crashes[0]) text(c, 'SMASH!', 540, 330, 120, '#FFD23F', { font: 'Bungee', weight: 400, scale: pop(t, ev.crashes[0], 0.25, 3), rot: -0.06, lw: 18, shadow: '#2B4C7E' });
  }
  // 3 · the cloud sorts its charge: + on top, − at the bottom
  function charge(c, t) {
    night(c, '#141B33', '#3A4670'); rainFx(c, t, 0.4); cloud(c, 540, 820, 2.3, '#55658A');
    const kp = ramp(t, ev.plus - 0.3, 0.8), km = ramp(t, ev.minus - 0.3, 0.8);
    glow(c, 540, 600, 500, 'rgba(255,90,90,0.45)', kp); glow(c, 540, 1040, 500, 'rgba(80,150,255,0.5)', km);
    for (let i = 0; i < 9; i++) { const x = 230 + i * 78, y1 = 590 + Math.sin(i * 1.7) * 40, y2 = 1040 + Math.sin(i * 2.3) * 40; const pp = pop(t, ev.plus - 0.2 + i * 0.06, 0.25, 3), pm = pop(t, ev.minus - 0.2 + i * 0.06, 0.25, 3); text(c, '+', x, y1 + 4 * Math.sin(t * 6 + i), 92, '#FF5A5A', { scale: pp, lw: 14 }); text(c, '−', x, y2 + 4 * Math.sin(t * 6 + i), 110, '#5AA9FF', { scale: pm, lw: 14 }); }
    label(c, 'POSITIVE', 540, 420, pop(t, ev.plus + 0.2, 0.3), { bg: '#FF5A5A', col: '#FFFFFF', size: 54 });
    label(c, 'NEGATIVE', 540, 1240, pop(t, ev.minus + 0.2, 0.3), { bg: '#5AA9FF', col: '#FFFFFF', size: 54 });
  }
  // 4 · the ground charges up; tension; the hidden spark steps down; the ground answers
  const LEAD = zigzag(5, 520, 560, 700, 1050, 7, 70), BRANCH = zigzag(9, LEAD[3][0], LEAD[3][1], LEAD[3][0] - 210, LEAD[3][1] + 220, 4, 40), TOW = { x: 760, y: 1330, h: 270 };
  function field(c, t, o = {}) {
    night(c); rainFx(c, t, 0.6); cloud(c, 540, 380, 1.9, '#3C4870');
    for (let i = 0; i < 8; i++) text(c, '−', 250 + i * 82, 560 + Math.sin(i * 2.3) * 16, 70, '#5AA9FF', { lw: 10 });
    ground(c, 1330); house(c, 230, 1330, 0.8); tree(c, 420, 1330, 0.85); tower(c, TOW.x, TOW.y, TOW.h); person(c, 560, 1330, 0.75, t, { hair: o.tension > 0.3 });
    const kg = o.ground || 0; for (let i = 0; i < 9; i++) text(c, '+', 110 + i * 110, 1368 + Math.sin(i) * 6, 50, '#FF5A5A', { scale: pop(t, ev.groundUp + i * 0.07, 0.25, 3) * kg, lw: 10 });
    const ten = o.tension || 0; if (ten > 0) for (let i = 0; i < 6; i++) { const x = 180 + i * 150, p = (t * 3 + rnd(i)) % 1; if (p > 0.25) continue; const pts = zigzag(i * 13 + Math.floor(t * 3), x, 640, x + 30, 760, 4, 18); bolt(c, pts, 1, ten * 0.7, 0.3); }
  }
  function groundScene(c, t) { field(c, t, { ground: 1, tension: ramp(t, L.ground.t + 2, 1.5) }); label(c, 'THE GROUND', 540, 1560 - 120, 0, {}); }
  function leader(c, t) {
    const held = t >= ev.breath; field(c, t, { ground: 1, tension: held ? 0 : 0.6 });
    const k = ev.steps.reduce((a, x, i) => (t >= x ? (i + 1) / ev.steps.length : a), 0) * (held ? 1 : 1);
    bolt(c, LEAD, k, 0.55, 0.55); bolt(c, BRANCH, clamp((k - 0.5) * 2), 0.45, 0.4);
    const ku = ramp(t, ev.up - 0.4, 0.5); if (ku > 0) bolt(c, [[TOW.x, TOW.y - TOW.h], [TOW.x - 20, TOW.y - TOW.h - 120], [700, 1050]], ku, 0.55, 0.5);
    label(c, 'INVISIBLE SPARK', 280, 760, pop(t, L.leader.t + 1.0, 0.3) * (t < L.meet.t ? 1 : 0), { size: 44, bg: '#9FD3FF', to: [LEAD[2][0] - 20, LEAD[2][1]] });
    if (held) { c.fillStyle = `rgba(0,0,0,${0.45 * ramp(t, ev.breath, 0.25)})`; c.fillRect(-300, -300, W + 600, H + 600); }
  }
  // 5 · CRACK
  function strike(c, t) {
    const a = t - ev.strike; field(c, t, { ground: 1 }); glow(c, 600, 900, 1100, 'rgba(160,200,255,0.8)', 0.6 + 0.4 * flashA(t, ev.strike, 0.5));
    const full = [...LEAD, [TOW.x - 20, TOW.y - TOW.h - 120], [TOW.x, TOW.y - TOW.h]]; const on = a < 1.6 ? 1 : (Math.sin(t * 25) > 0.2 ? 1 : 0.4);
    bolt(c, full, 1, on, 1.5); bolt(c, BRANCH, 1, 0.8, 0.7);
    text(c, 'CRACK!', 540, 300, 210, '#FFF06A', { font: 'Bungee', weight: 400, rot: -0.07, scale: pop(t, ev.strike + 0.02, 0.25, 3.4) * (1 + 0.03 * Math.sin(t * 40)), shadow: '#2B4C7E', lw: 24 });
    label(c, 'IN 0.0001 SECONDS', 540, 1180, pop(t, ev.strike + 1.8, 0.3), { bg: '#FFD23F', size: 50 });
    c.fillStyle = `rgba(255,255,255,${0.95 * flashA(t, ev.strike, 0.35)})`; c.fillRect(-300, -300, W + 600, H + 600);
  }
  // 6 · heat: the thermometer races past the Sun, then the air bursts
  function heat(c, t) {
    const t0 = L.heat.t; night(c, '#1A0F2E', '#3B1A3A'); const BX = 540, pts = zigzag(3, BX, -50, BX - 20, 1500, 14, 50); bolt(c, pts, 1, 0.9 + 0.1 * Math.sin(t * 30), 1.4);
    const k = ramp(t, t0 + 0.3, ev.hot - t0 - 0.3), bx = 120, by0 = 1180, bh = 760;
    c.beginPath(); c.roundRect(bx, by0 - bh, 90, bh, 45); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.roundRect(bx + 18, by0 - bh * k, 54, bh * k - 10, 27); c.fillStyle = k > 0.25 ? '#FF3B30' : '#FFB627'; c.fill();
    const sunY = by0 - bh * (5500 / 30000); c.beginPath(); c.moveTo(bx + 90, sunY); c.lineTo(bx + 150, sunY); c.lineWidth = 6; c.stroke(); SUN(c, bx + 200, sunY, 34, t); text(c, 'SUN', bx + 320, sunY, 50, '#FFD23F', { lw: 10, align: 'left' });
    text(c, `${Math.round(30000 * k).toLocaleString('en-US')}°C`, 760, 330, 110, k > 0.99 ? '#FFD23F' : '#FFFFFF', { lw: 18, scale: pop(t, t0 + 0.3, 0.3) * (1 + (t >= ev.hot ? 0.25 * Math.exp(-(t - ev.hot) * 6) : 0)), maxW: 560 });
    const ab = t - ev.boomAir; if (ab > 0) { for (let r = 0; r < 4; r++) { const rr = (ab - r * 0.12) * 900; if (rr <= 0) continue; c.beginPath(); c.ellipse(BX, 800, rr, rr * 1.1, 0, 0, TAU); c.lineWidth = 16 * Math.max(0, 1 - ab / 1.5); c.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.8 - ab * 0.5)})`; c.stroke(); } text(c, 'WHOOSH!', 720, 1020, 110, '#9FD3FF', { font: 'Bungee', weight: 400, scale: pop(t, ev.boomAir, 0.25, 3), rot: 0.06, lw: 16 }); }
  }
  // 7 · thunder: sound waves roll out to a listener
  function thunderScene(c, t) {
    night(c); rainFx(c, t, 0.5); cloud(c, 300, 300, 1.4, '#3C4870'); ground(c, 1330); house(c, 880, 1330, 0.8);
    const pts = zigzag(21, 280, 400, 240, 1330, 10, 50); bolt(c, pts, 1, t < ev.thunder + 0.3 ? 1 : 0.15, 1);
    const a = t - ev.thunder; for (let r = 0; r < 7; r++) { const rr = ((a * 520 - r * 120) % 1000 + 1000) % 1000; if (a < 0 || rr < 30) continue; c.beginPath(); c.arc(260, 900, rr, -0.7, 0.7); c.lineWidth = 12; c.strokeStyle = `rgba(255,214,90,${0.9 * (1 - rr / 1000)})`; c.lineCap = 'round'; c.stroke(); }
    person(c, 760, 1330, 1, t, { ears: a > 0.4 }); text(c, 'BOOM!', 640, 640, 170, '#FFD23F', { font: 'Bungee', weight: 400, scale: pop(t, ev.thunder + 0.1, 0.3, 3) * (1 + 0.04 * Math.sin(t * 30)), rot: -0.06, lw: 20, shadow: '#7A0F1E' });
  }
  // 8 · counting game
  function count(c, t) {
    const t0 = L.count.t; night(c, '#141B33', '#4A3270'); ground(c, 1330, '#1E2E26');
    const fl = flashA(t, ev.flash2, 0.4); glow(c, 190, 900, 500, 'rgba(160,200,255,0.8)', fl); cloud(c, 190, 760, 0.6, '#3C4870'); bolt(c, zigzag(31, 190, 800, 170, 1320, 6, 20), 1, t > ev.flash2 && t < ev.flash2 + 0.4 ? 1 : 0, 0.5);
    person(c, 880, 1330, 1, t, { count: true });
    const n = ev.ticks.reduce((a, x, i) => (t >= x ? i + 1 : a), 0);
    if (n > 0) text(c, String(n), 880, 900, 220, '#FFD23F', { font: 'Bungee', weight: 400, scale: pop(t, ev.ticks[n - 1], 0.2, 3), lw: 22 });
    label(c, 'FLASH', 190, 560, pop(t, ev.flash2 + 0.2, 0.3), { bg: '#9FD3FF', size: 48 });
    const kb = ramp(t, ev.boom2, 0.6); if (kb > 0) { c.beginPath(); c.moveTo(220, 1450 - 110); c.lineTo(lerp(220, 860, kb), 1450 - 110); c.lineWidth = 10; c.strokeStyle = '#FFFFFF'; c.lineCap = 'round'; c.stroke(); label(c, '3 SEC = 1 KM', 540, 1210, pop(t, ev.boom2 + 0.3, 0.3), { bg: '#FFD23F', size: 64 }); }
    text(c, 'COUNT!', 540, 320, 130, '#FFFFFF', { font: 'Bungee', weight: 400, scale: pop(t, t0 + 0.3, 0.3, 2.6), lw: 18, shadow: '#5AA9FF' });
  }
  // 9 · the twist: Earth with lightning everywhere
  function twist(c, t) {
    const t0 = L.twist.t; night(c, '#05081A', '#101A3A'); for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(rnd(i) * W, rnd(i + 60) * H, 2 + rnd(i + 2) * 2, 0, TAU); c.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t + i))})`; c.fill(); }
    const R = 360 * pop(t, ev.globe - 0.2, 0.6, 1.4), cx = 540, cy = 820; if (R <= 1) return;
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fillStyle = '#2B6CB0'; c.fill(); c.clip();
    c.fillStyle = '#3E8E6A'; for (let i = 0; i < 7; i++) { const x = cx + ((((rnd(i) * 2 - 1) * R + t * 60 + i * 180) % (2.6 * R)) + 2.6 * R) % (2.6 * R) - 1.3 * R, y = cy + (rnd(i + 9) - 0.5) * R * 1.4; c.beginPath(); c.ellipse(x, y, 60 + rnd(i + 3) * 90, 40 + rnd(i + 5) * 60, rnd(i) * 3, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(cx + R * 0.45, cy + R * 0.2, R, 0, TAU); c.fill(); c.restore();
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.lineWidth = 10; c.strokeStyle = INK; c.stroke();
    for (let i = 0; i < 40; i++) { const tt = ev.globe + 0.6 + i * 0.12, a = t - tt; if (a < 0 || a > 0.35) continue; const an = rnd(i + 40) * TAU, rr = Math.sqrt(rnd(i + 80)) * R * 0.9, x = cx + Math.cos(an) * rr, y = cy + Math.sin(an) * rr; glow(c, x, y, 90, 'rgba(200,230,255,0.9)', 1 - a / 0.35); bolt(c, zigzag(i, x, y - 50, x, y + 30, 3, 14), 1, 1 - a / 0.35, 0.35); }
    text(c, '40', 540, 330, 200, '#FFD23F', { font: 'Bungee', weight: 400, scale: pop(t, L.twist.t + 2.6, 0.3, 3), lw: 22, shadow: '#7A0F1E' });
    text(c, 'EVERY SECOND!', 540, 1280, 100, '#FFFFFF', { scale: pop(t, L.twist.end - 0.9, 0.3, 3), lw: 16, shadow: '#5AA9FF' });
  }
  K.run([
    { at: 0, draw: open, cam: Cmb(push(1.12, 1.0), Shots.shake(26, ev.open, 3)) },
    { at: L.q.t - 0.15, draw: inside, in: 'whip', cam: Cmb(push(1.0, 1.1), bumps(ev.crashes, 0.025)) },
    { at: L.charge.t - 0.15, draw: charge, in: 'push', cam: Cmb(push(1.05, 1.0), bumps([ev.plus, ev.minus], 0.04)) },
    { at: L.ground.t - 0.15, draw: groundScene, in: 'dip', cam: push(1.0, 1.08, 0, 60) },
    { at: L.leader.t - 0.1, draw: leader, in: 'cut', cam: Cmb(push(1.08, 1.2, 60, 0), shakes(ev.steps, 5, 9)) },
    { at: ev.strike, draw: strike, in: 'cut', cam: Cmb(push(1.15, 1.0), Shots.shake(40, ev.strike, 3)) },
    { at: L.heat.t - 0.15, draw: heat, in: 'flash', cam: Cmb(push(1.0, 1.08), bumps([ev.hot, ev.boomAir], 0.05), Shots.shake(18, ev.boomAir, 5)) },
    { at: L.thunder.t - 0.1, draw: thunderScene, in: 'whip', cam: Cmb(push(1.05, 1.0), Shots.shake(16, ev.thunder, 3)) },
    { at: L.count.t - 0.15, draw: count, in: 'dip', cam: Cmb(push(1.0, 1.06), bumps(ev.ticks, 0.03), Shots.shake(6, ev.boom2, 3)) },
    { at: L.twist.t - 0.15, draw: twist, in: 'iris', cam: push(1.0, 1.1) },
    { at: L.follow.t - 0.15, draw: (c, t) => K.endCard(c, t, ev.logo), in: 'iris', cam: push(1.03, 1.0) },
  ]);
})();
