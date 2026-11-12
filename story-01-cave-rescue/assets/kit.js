// Bubbly Tales · science kit: flat-explainer helpers shared by the science and Did-You-Know shorts.
(function () {
  const G = globalThis.G, S = globalThis.SCORE, Shots = globalThis.Shots, Studio = globalThis.Studio;
  const W = G.W, H = G.H, TAU = Math.PI * 2, INK = '#141414';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
  const io = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const outBack = (k, s = 1.8) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const ramp = (t, t0, d) => io(clamp((t - t0) / d)), lin = (t, t0, d) => clamp((t - t0) / d);
  const pop = (t, t0, d = 0.3, s = 2.2) => (t < t0 ? 0 : outBack(clamp((t - t0) / d), s));
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const grad = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([k, col]) => g.addColorStop(k, col)); return g; };
  const rad = (c, x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([k, col]) => g.addColorStop(k, col)); return g; };
  const bg = (c, col) => { c.fillStyle = col; c.fillRect(-300, -300, W + 600, H + 600); };
  function text(c, s, x, y, size, fill, o = {}) {
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); const k = o.scale ?? 1; if (k <= 0.001) { c.restore(); return; } c.scale(k, k);
    c.font = `${o.weight || 700} ${size}px ${o.font || 'Baloo'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    if (o.maxW) { const w = c.measureText(s).width; if (w > o.maxW) c.scale(o.maxW / w, o.maxW / w); }
    if (o.alpha != null) c.globalAlpha = clamp(o.alpha);
    if (o.shadow) { c.fillStyle = o.shadow; c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.shadow; c.strokeText(s, size * 0.05, size * 0.08); c.fillText(s, size * 0.05, size * 0.08); }
    if (o.lw !== 0) { c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.stroke || INK; c.strokeText(s, 0, 0); }
    c.fillStyle = fill; c.fillText(s, 0, 0); c.restore();
  }
  function label(c, s, x, y, k, o = {}) {
    if (k <= 0.001) return; c.save(); c.font = `700 ${o.size || 46}px Baloo`; const w = c.measureText(s).width + 50, h = (o.size || 46) * 1.45;
    if (o.to) { c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, o.to[0], clamp(k)), lerp(y, o.to[1], clamp(k))); c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.setLineDash([14, 12]); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(o.to[0], o.to[1], 10 * clamp(k), 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); }
    c.translate(x, y); c.scale(k, k); c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, h / 2); c.fillStyle = o.bg || '#FFFFFF'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    c.fillStyle = o.col || INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 3); c.restore();
  }
  function glow(c, x, y, r, col, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = clamp(a); c.globalCompositeOperation = 'lighter'; c.fillStyle = rad(c, x, y, 0, r, [[0, col], [1, 'rgba(0,0,0,0)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
  function blob(c, x, y, r, t, amp = 0.06, seed = 0) { c.beginPath(); for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU, rr = r * (1 + amp * Math.sin(3 * a + t * 2.1 + seed) + amp * 0.6 * Math.sin(5 * a - t * 1.7 + seed * 2)); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); }
  function cloud(c, x, y, s, fill = '#5B6B8C', o = {}) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); for (const [cx, cy, r] of [[-170, 20, 110], [-60, -50, 150], [80, -30, 140], [190, 30, 100], [0, 60, 130]]) { c.moveTo(cx + r, cy); c.arc(cx, cy, r, 0, TAU); } c.fillStyle = fill; c.fill(); if (o.stroke !== false) { c.lineWidth = 8 / s; c.strokeStyle = INK; c.stroke(); c.fill(); } c.restore(); }
  function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.restore(); }
  function zigzag(seed, x0, y0, x1, y1, n = 10, jit = 60) { const pts = [[x0, y0]]; for (let i = 1; i < n; i++) { const k = i / n; pts.push([lerp(x0, x1, k) + (rnd(seed + i) - 0.5) * 2 * jit, lerp(y0, y1, k) + (rnd(seed + i + 50) - 0.5) * jit * 0.4]); } pts.push([x1, y1]); return pts; }
  function bolt(c, pts, k = 1, a = 1, w = 1) { // k: how much of the path is drawn (0..1)
    if (k <= 0 || a <= 0) return; const n = (pts.length - 1) * clamp(k); c.save(); c.globalAlpha = clamp(a); c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => { c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)); c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); } };
    c.globalCompositeOperation = 'lighter'; path(); c.lineWidth = 46 * w; c.strokeStyle = 'rgba(120,170,255,0.25)'; c.stroke(); c.globalCompositeOperation = 'source-over';
    path(); c.lineWidth = 18 * w; c.strokeStyle = '#9FD3FF'; c.stroke(); path(); c.lineWidth = 7 * w; c.strokeStyle = '#FFFFFF'; c.stroke(); c.restore();
  }
  function rainFx(c, t, a = 1, n = 70) { c.save(); c.globalAlpha = 0.5 * a; c.strokeStyle = '#BFD7FF'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i < n; i++) { const sp = 1600 + rnd(i) * 900, y = ((rnd(i + 3) * H + t * sp) % (H + 200)) - 100, x = rnd(i + 7) * (W + 200) - 100 - y * 0.15; c.moveTo(x, y); c.lineTo(x - 12, y + 50); } c.stroke(); c.restore(); }
  function eyes(c, x, y, sep, size, open, o = {}) { for (const s of [-1, 1]) { c.save(); c.translate(x + s * sep, y); if (open < 0.05) { c.beginPath(); c.arc(0, -size * 0.2, size * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = size * 0.22; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); } else { c.beginPath(); c.ellipse(0, 0, size, size * open, 0, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = size * 0.16; c.strokeStyle = INK; c.stroke(); c.save(); c.clip(); c.beginPath(); c.arc((o.look || [0, 0])[0] * size * 0.35, (o.look || [0, 0])[1] * size * 0.35 + size * 0.05, size * 0.5, 0, TAU); c.fillStyle = INK; c.fill(); c.beginPath(); c.arc(-size * 0.12 + (o.look || [0, 0])[0] * size * 0.35, -size * 0.18, size * 0.16, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill(); c.restore(); } c.restore(); } }
  // captions: 3 words a card, the spoken word lights up
  let SUBS = [], LOGO = null;
  function buildSubs(vo) { const out = []; vo.lines.forEach((l, li) => { if (S.vo[li] && S.vo[li].id === 'follow') return; const ws = l.words; if (!ws.length) return; const raw = l.text.split(/\s+/).filter(Boolean), useRaw = raw.length === ws.length; const words = ws.map((w, i) => ({ ...w, w: (useRaw ? raw[i] : w.w).toUpperCase() })); const n = Math.ceil(words.length / 3), per = Math.ceil(words.length / n); for (let k = 0; k * per < words.length; k++) { const g = words.slice(k * per, (k + 1) * per), next = words[(k + 1) * per]; out.push({ t: Math.max(0, g[0].t - 0.04), end: next ? next.t - 0.04 : l.end + 0.15, words: g }); } }); return out; }
  function drawSubs(c, t, y = 1440) {
    const cap = SUBS.find((q) => t >= q.t && t < q.end); if (!cap) return; const size = 74, gap = 40;
    c.save(); c.font = `800 ${size}px Inter`; const ws = cap.words.map((w) => c.measureText(w.w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const scl = Math.min(1, (G.SAFE.w - 40) / total), k = cap.t < 0.05 ? 1 : pop(t, cap.t, 0.18, 2.4); c.translate(G.SAFE.x + G.SAFE.w / 2, y); c.scale(scl * k, scl * k); let x = -total / 2;
    cap.words.forEach((w, i) => { const on = t >= w.t && t < (cap.words[i + 1] ? cap.words[i + 1].t : cap.end); c.save(); c.translate(x + ws[i] / 2, 0); if (on) c.scale(1.1, 1.1); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 18; c.strokeStyle = INK; c.strokeText(w.w, 0, 0); c.fillStyle = on ? '#FFD23F' : '#FFFFFF'; c.fillText(w.w, 0, 0); c.restore(); x += ws[i] + gap; });
    c.restore();
  }
  function endCard(c, t, t0, line2 = 'MORE SCIENCE!') {
    bg(c, '#131C3D');
    for (let i = 0; i < 18; i++) { const p = ((t * 0.12 + rnd(i)) % 1), x = rnd(i + 3) * W + Math.sin(t + i) * 20, y = H + 100 - p * (H + 300); c.beginPath(); c.arc(x, y, 14 + rnd(i + 6) * 30, 0, TAU); c.lineWidth = 5; c.strokeStyle = `rgba(120,200,255,${0.35 * Math.sin(p * Math.PI)})`; c.stroke(); }
    const k = pop(t, t0, 0.5, 1.8); if (LOGO && k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.drawImage(LOGO, -430, -430, 860, 860); c.restore(); }
    text(c, 'FOLLOW FOR', 540, 1210, 80, '#FFFFFF', { scale: pop(t, t0 + 0.5, 0.3), lw: 14 });
    text(c, line2, 540, 1310, 96, '#FFD23F', { scale: pop(t, t0 + 0.7, 0.3) * (1 + 0.03 * Math.sin(t * 6)), lw: 16, shadow: '#FF6B4A', maxW: 900 });
  }
  const Cmb = Shots.combine, push = (z0, z1, x = 0, y = 0) => (s) => { const k = io(s.u); return { zoom: lerp(z0, z1, k), x: x * k, y: y * k }; };
  const bumps = (times, amp = 0.03, d = 9) => (s) => { let z = 1; for (const tt of times) if (s.t >= tt) z += amp * Math.exp(-(s.t - tt) * d); return { zoom: z }; };
  const shakes = (times, amp, decay = 6) => Cmb(...times.map((x, i) => Shots.shake(typeof amp === 'function' ? amp(i) : amp, x, decay)));
  function run(list, o = {}) { const film = Shots.film(list); Studio.film({ post: { vignette: 0.12, grain: 0, paper: 0 }, fadeOut: o.fadeOut ?? 0.4, async init() { await Studio.loadFont('Baloo', 'assets/baloo-700.woff2', 700); LOGO = await Studio.loadImage('assets/logo.png'); SUBS = buildSubs(await Studio.loadJSON('out/voice.json')); }, draw(ctx, t) { film(ctx, t); if (o.over) o.over(ctx, t); drawSubs(ctx, t, o.subY); } }); }
  globalThis.KIT = { W, H, TAU, INK, clamp, lerp, io, outBack, ramp, lin, pop, rnd, grad, rad, bg, text, label, glow, blob, cloud, heart, zigzag, bolt, rainFx, eyes, endCard, Cmb, push, bumps, shakes, run, Shots };
})();
