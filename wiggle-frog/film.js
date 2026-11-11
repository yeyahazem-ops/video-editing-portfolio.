// THE FILM — draws frame t of the selected episode. Everything is a pure function of t and the score.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio, A = globalThis.Animals;
  const { clock, T, EP } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, WIDE = S.WIDE, SAFE = G.SAFE;
  const CX = WIDE ? W / 2 : SAFE.x + SAFE.w / 2;
  const GROUND = Math.round(WIDE ? H * 0.8 : H * 0.685);
  const SIDE = WIDE ? W * 0.27 : SAFE.w * 0.3;
  const CAPY = WIDE ? H * 0.16 : SAFE.y + 210;
  const SA = WIDE ? 1.45 : 1.7; // animal scale in a verse
  const INK = '#2B2350';
  const BURST = { frog: 'BOING!', duck: 'QUACK!', bee: 'BZZZ!', cat: 'MEOW!', pup: 'WOOF!' };
  const PARTY = { frog: ['#FF8A5C', '#FF7043'], duck: ['#5CC8F2', '#3DB3E6'], bee: ['#FF9DBB', '#FF7FA6'], cat: ['#A98BEA', '#9474DC'], pup: ['#6FD8AC', '#52C795'], all: ['#FFD23F', '#FF9DBB'] };

  const beatSquash = (t) => Math.max(0, 1 - clock.phase(t) * 3.5); // 1 right on the beat
  const inSeg = (list, s) => list.filter((e) => e.seg === s.i);
  // how wide the mouth is: open while a word of this segment is being said
  function talk(t, s) {
    for (const p of S.vo) if (p.seg === s.i && t >= p.t && t <= p.end) for (const w of p.words) if (t >= w.t && t <= w.end) return 0.35 + 0.65 * Math.abs(Math.sin((t - w.t) * 16));
    return 0;
  }
  const wiggleRot = (t, s) => { let r = 0; for (const w of inSeg(S.wiggles, s)) { const d = t - w.t; if (d >= 0 && d < 0.45) r += Math.sin(d * Math.PI * 2 * 6) * 0.2 * (1 - d / 0.45); } return r; };

  // ---------- scenery ----------
  function sky(ctx, c0, c1) { const g = ctx.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function sun(ctx, t, x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.25);
    const k = 1 + 0.08 * beatSquash(t);
    ctx.fillStyle = '#FFE07A';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.12) * r * 1.15, Math.sin(a - 0.12) * r * 1.15); ctx.lineTo(Math.cos(a) * r * 1.75 * k, Math.sin(a) * r * 1.75 * k); ctx.lineTo(Math.cos(a + 0.12) * r * 1.15, Math.sin(a + 0.12) * r * 1.15); ctx.fill(); }
    ctx.restore();
    G.ellipse(ctx, x, y, r, r, { fill: '#FFD23F', lw: 5, seed: 21 });
    A.eye(ctx, x - r * 0.35, y - r * 0.1, r * 0.14, 'happy', 0, 22); A.eye(ctx, x + r * 0.35, y - r * 0.1, r * 0.14, 'happy', 0, 23);
    G.line(ctx, [[x - r * 0.3, y + r * 0.3], [x, y + r * 0.48], [x + r * 0.3, y + r * 0.3]], { lw: 4.5, seed: 24, step: 10 });
  }
  function cloud(ctx, t, x, y, s, seed) {
    const xx = ((x + t * 14 * s + W * 0.2) % (W * 1.4)) - W * 0.2;
    for (const [dx, dy, r] of [[-60, 10, 44], [0, -12, 60], [64, 8, 46], [0, 22, 70]]) G.ellipse(ctx, xx + dx * s, y + dy * s, r * s * 1.2, r * s * 0.8, { fill: '#FFFFFF', lw: 0, seed: seed + dx });
  }
  const hills = (ctx, y, color, seed, amp = 80) => G.poly(ctx, [[-60, y], [W * 0.18, y - amp], [W * 0.42, y - amp * 0.3], [W * 0.7, y - amp * 1.1], [W + 60, y - amp * 0.4], [W + 60, H + 60], [-60, H + 60]], { fill: color, lw: 5, seed, hatch: { color: 'rgba(0,0,0,0.08)', gap: 12 } });
  const ground = (ctx, y, color, seed) => G.poly(ctx, [[-60, y], [W + 60, y], [W + 60, H + 60], [-60, H + 60]], { fill: color, lw: 5, seed, hatch: { color: 'rgba(0,0,0,0.07)', gap: 11 } });
  function ripples(ctx, t, color = 'rgba(255,255,255,0.55)') {
    for (let i = 0; i < 9; i++) {
      const y = GROUND + 30 + i * (H - GROUND) / 9, x = (U.hash(i, 5) * W + t * (10 + i * 3)) % (W + 300) - 150, w = 80 + U.hash(i, 6) * 120;
      G.line(ctx, [[x, y], [x + w / 2, y - 6], [x + w, y]], { color, lw: 4, seed: 40 + i, step: 30 });
    }
  }
  function reeds(ctx, t, x, y, n, seed) {
    for (let i = 0; i < n; i++) {
      const bx = x + i * 26, h = 150 + U.hash(seed, i) * 110, sway = Math.sin(t * 1.3 + i) * 10;
      G.line(ctx, [[bx, y], [bx + sway * 0.4, y - h * 0.5], [bx + sway, y - h]], { color: '#3E8E45', lw: 7, seed: seed + i, step: 30 });
      G.ellipse(ctx, bx + sway, y - h - 22, 9, 26, { fill: '#8A5A33', lw: 3, seed: seed + 9 + i });
    }
  }
  function lilypad(ctx, x, y, seed, flower) {
    G.ellipse(ctx, x, y, 150, 36, { fill: '#58B368', lw: 4.5, seed, hatch: { color: 'rgba(0,70,0,0.14)', gap: 10 } });
    G.line(ctx, [[x, y], [x + 60, y + 30]], { color: '#2F7D45', lw: 4, seed: seed + 1 });
    if (flower) { for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; G.ellipse(ctx, x + 96 + Math.cos(a) * 13, y - 16 + Math.sin(a) * 9, 11, 8, { fill: '#FF9DBB', lw: 2.5, seed: seed + 2 + i }); } G.ellipse(ctx, x + 96, y - 16, 6, 5, { fill: '#FFE07A', lw: 2, seed: seed + 8 }); }
  }
  function log(ctx, x, y) {
    G.rrect(ctx, x - 215, y - 8, 430, 84, 40, { fill: '#9A6A3E', lw: 5, seed: 60, hatch: { color: 'rgba(60,30,0,0.2)', gap: 9, angle: 0.05 } });
    G.ellipse(ctx, x + 196, y + 34, 22, 40, { fill: '#D9B07A', lw: 4.5, seed: 61 });
    G.ellipse(ctx, x + 196, y + 34, 9, 18, { fill: '#B98A55', lw: 3, seed: 62 });
  }
  function flower(ctx, t, x, y, h, petal, seed, sleepy) {
    const sway = Math.sin(t * 1.5 + seed) * 8;
    G.line(ctx, [[x, y + 20], [x + sway * 0.4, y - h * 0.5], [x + sway, y - h]], { color: '#3E8E45', lw: 12, seed, step: 40 });
    G.ellipse(ctx, x + 38, y - h * 0.4, 40, 14, { fill: '#58B368', lw: 4, seed: seed + 1 });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + (sleepy ? 0 : t * 0.2); G.ellipse(ctx, x + sway + Math.cos(a) * 54, y - h + Math.sin(a) * 24, 36, 18, { fill: petal, lw: 4, seed: seed + 2 + i }); }
    G.ellipse(ctx, x + sway, y - h, 46, 20, { fill: '#FFE07A', lw: 4, seed: seed + 11 });
  }
  function fence(ctx, y) {
    for (let x = -20; x < W + 60; x += 92) G.poly(ctx, [[x, y], [x, y - 150], [x + 30, y - 185], [x + 60, y - 150], [x + 60, y]], { fill: '#FFFFFF', lw: 4.5, seed: 70 + x, step: 40 });
    G.rrect(ctx, -30, y - 118, W + 60, 22, 8, { fill: '#FFFFFF', lw: 4, seed: 79 });
  }

  // the home of each animal; its three spots are CX - SIDE, CX and CX + SIDE on the GROUND line
  const HOME = {
    frog(ctx, t) {
      sky(ctx, '#8FD3F4', '#FFF0D0'); sun(ctx, t, WIDE ? W * 0.925 : W * 0.2, WIDE ? H * 0.34 : H * 0.36, 62);
      cloud(ctx, t, W * 0.1, H * 0.3, 1, 30); cloud(ctx, t, W * 0.7, H * 0.38, 0.8, 31);
      hills(ctx, GROUND - 90, '#8FD67A', 32); ground(ctx, GROUND - 50, '#57BCE0', 33); ripples(ctx, t);
      reeds(ctx, t, WIDE ? 60 : 20, GROUND - 30, 3, 34); reeds(ctx, t, W - (WIDE ? 150 : 120), GROUND - 36, 3, 35);
      lilypad(ctx, CX - SIDE, GROUND + 14, 36, true); lilypad(ctx, CX + SIDE, GROUND + 14, 37, true); log(ctx, CX, GROUND);
    },
    duck(ctx, t) {
      sky(ctx, '#9ADCF7', '#EAF8FF'); sun(ctx, t, WIDE ? W * 0.925 : W * 0.2, WIDE ? H * 0.34 : H * 0.36, 62);
      cloud(ctx, t, W * 0.5, H * 0.3, 1, 30); cloud(ctx, t, W * 0.9, H * 0.4, 0.8, 31);
      hills(ctx, GROUND - 120, '#8FD67A', 42, 60); reeds(ctx, t, WIDE ? 90 : 16, GROUND - 60, 4, 44); reeds(ctx, t, W - (WIDE ? 220 : 150), GROUND - 64, 4, 45);
      ground(ctx, GROUND - 80, '#57BCE0', 43); ripples(ctx, t);
      lilypad(ctx, WIDE ? W * 0.1 : W * 0.16, GROUND + 190, 46, true); lilypad(ctx, W * 0.86, GROUND + 150, 47, false);
    },
    bee(ctx, t) {
      sky(ctx, '#A6E3FF', '#FFF6CC'); sun(ctx, t, WIDE ? W * 0.925 : W * 0.2, WIDE ? H * 0.34 : H * 0.36, 62);
      cloud(ctx, t, W * 0.2, H * 0.3, 1, 30); cloud(ctx, t, W * 0.6, H * 0.4, 0.8, 31);
      hills(ctx, GROUND + 20, '#A3DD82', 52, 70); ground(ctx, GROUND + 90, '#7FCB62', 53);
      for (let i = 0; i < 9; i++) flower(ctx, t, U.hash(i, 3) * W, GROUND + 170 + U.hash(i, 4) * (H - GROUND - 150), 70, i % 2 ? '#FFFFFF' : '#FFC6DA', 90 + i * 13);
      flower(ctx, t, CX - SIDE, GROUND + 100, 190, '#FF8FB1', 54); flower(ctx, t, CX, GROUND + 100, 190, '#B79CFF', 55); flower(ctx, t, CX + SIDE, GROUND + 100, 190, '#FF9E5E', 56);
    },
    cat(ctx, t) {
      sky(ctx, '#FFD3A0', '#FFF3DE'); sun(ctx, t, WIDE ? W * 0.925 : W * 0.2, WIDE ? H * 0.34 : H * 0.36, 62);
      cloud(ctx, t, W * 0.55, H * 0.3, 1, 30);
      hills(ctx, GROUND - 90, '#B5DE8A', 62, 60); fence(ctx, GROUND - 30); ground(ctx, GROUND - 40, '#93CF72', 63);
      G.rrect(ctx, CX - 190, GROUND - 22, 380, 56, 26, { fill: '#F2617A', lw: 5, seed: 64 }); // the mat
      for (let i = 0; i < 5; i++) G.line(ctx, [[CX - 150 + i * 75, GROUND - 16], [CX - 150 + i * 75, GROUND + 28]], { color: '#FFD9E0', lw: 8, seed: 65 + i });
      G.ellipse(ctx, CX - SIDE - 130, GROUND + 6, 46, 44, { fill: '#6FB7F2', lw: 4.5, seed: 66 }); // a ball of yarn
      for (let i = 0; i < 3; i++) G.line(ctx, [[CX - SIDE - 168, GROUND - 14 + i * 16], [CX - SIDE - 130, GROUND - 6 + i * 16], [CX - SIDE - 92, GROUND - 14 + i * 16]], { color: '#3F8FD0', lw: 3.5, seed: 67 + i });
      const bx = CX + SIDE + 110 + Math.sin(t * 2) * 20, by = GROUND - 250 + Math.sin(t * 3.1) * 26, f = Math.abs(Math.sin(t * 14)); // a butterfly
      for (const sd of [-1, 1]) G.ellipse(ctx, bx + sd * 16 * f, by, 16 * f + 3, 22, { fill: '#B79CFF', lw: 3, seed: 68 + sd });
    },
    pup(ctx, t) {
      sky(ctx, '#9AD8FF', '#EEF9FF'); sun(ctx, t, WIDE ? W * 0.925 : W * 0.2, WIDE ? H * 0.34 : H * 0.36, 62);
      cloud(ctx, t, W * 0.15, H * 0.3, 1, 30); cloud(ctx, t, W * 0.62, H * 0.4, 0.8, 31);
      hills(ctx, GROUND - 100, '#A3DD82', 72, 60); fence(ctx, GROUND - 30); ground(ctx, GROUND - 40, '#7FCB62', 73);
      const bx = CX - SIDE - 150, by = GROUND + 22; // a bone
      G.rrect(ctx, bx - 40, by - 10, 80, 20, 10, { fill: '#FFF6E5', lw: 4, seed: 74 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) G.ellipse(ctx, bx + sx * 42, by + sy * 9, 13, 12, { fill: '#FFF6E5', lw: 4, seed: 75 + sx + sy * 2 });
      G.ellipse(ctx, CX + SIDE + 150, GROUND + 4, 40, 40, { fill: '#FF6B6B', lw: 4.5, seed: 78 }); // a ball
      G.line(ctx, [[CX + SIDE + 114, GROUND - 6], [CX + SIDE + 150, GROUND + 8], [CX + SIDE + 186, GROUND - 6]], { color: '#FFFFFF', lw: 6, seed: 79 });
    },
  };
  const TALL = { frog: 200, duck: 285, bee: 280, cat: 218, pup: 232 };
  const BASE = { frog: 0, duck: 26, bee: -150, cat: 0, pup: 0 }; // where each animal's feet rest (the bee hovers)

  // ---------- big bouncy words ----------
  function fitSize(ctx, str, size, maxW) { const w = G.measure(ctx, str, size, 'Bungee', 400); return w > maxW ? size * maxW / w : size; }
  function burst(ctx, text, x, y, t, t0, { size = 90, color = '#FFFFFF', rot = 0, hold = 0.55, stroke = INK } = {}) {
    const d = t - t0;
    if (d < 0 || d > hold + 0.2) return;
    const k = ease.outBack(clamp(d / 0.14), 2.6), a = 1 - clamp((d - hold) / 0.2);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    G.text(ctx, text, 0, 0, { size, fam: 'Bungee', weight: 400, color, align: 'center', baseline: 'middle', stroke, strokeW: size * 0.22, boil: 0, alpha: a });
    ctx.restore();
  }
  // the sing-along line: every word is on screen, and each one lights up as it is said
  function lyrics(ctx, t) {
    const line = S.subtitles.find((l) => t >= l.t && t < l.end);
    if (!line) return;
    const soft = line.type === 'lull' || line.type === 'sleepy';
    const fam = soft ? 'Gochi Hand' : 'Bungee', maxW = WIDE ? W * 0.84 : SAFE.w - 30;
    let size = soft ? (WIDE ? 104 : 96) : (WIDE ? 92 : 80);
    const words = line.words.map((w) => ({ ...w, text: soft ? w.w : w.w.toUpperCase() }));
    const sp = size * 0.32, meas = (x, sz) => G.measure(ctx, x, sz, fam, 400);
    let rows;
    const wrap = () => { rows = [[]]; let x = 0; for (const w of words) { const ww = meas(w.text, size); if (x + ww > maxW && rows[rows.length - 1].length) { rows.push([]); x = 0; } rows[rows.length - 1].push({ ...w, ww }); x += ww + sp; } };
    wrap();
    if (rows.length > (WIDE ? 1 : 2)) { size *= 0.82; wrap(); }
    const a = clamp((t - line.t) / 0.1) * clamp((line.end - t) / 0.15);
    rows.forEach((row, r) => {
      const tot = row.reduce((s, w) => s + w.ww, 0) + sp * (row.length - 1);
      let x = CX - tot / 2;
      const y = CAPY + (r - (rows.length - 1) / 2) * size * 1.15;
      for (const w of row) {
        const said = t >= w.t, now = said && t < w.end + 0.12;
        const k = 1 + (now ? 0.16 * Math.max(0, 1 - (t - w.t) / 0.18) + 0.04 : 0);
        ctx.save(); ctx.translate(x + w.ww / 2, y); ctx.scale(k, k); ctx.rotate(now ? -0.03 : 0);
        G.text(ctx, w.text, 0, 0, { size, fam, weight: 400, color: said ? '#FFE14D' : '#FFFFFF', align: 'center', baseline: 'middle', stroke: INK, strokeW: size * 0.24, boil: 0, alpha: a });
        ctx.restore();
        x += w.ww + sp;
      }
    });
  }

  // ---------- a verse: the animal at home, hopping left and right ----------
  function versePose(t, s, id) {
    const o = { xn: 0, y: 0, sx: 1, sy: 1, rot: wiggleRot(t, s), look: 0, flap: 0, air: false, mouth: talk(t, s) };
    for (const j of inSeg(S.jumps, s)) {
      if (t >= j.t1) { o.xn = j.to; const p = pulse(t, j.t1, 9); o.sy -= 0.26 * p; o.sx += 0.2 * p; o.look = 0; if (t < j.t1 + 0.45) o.mouth = Math.max(o.mouth, 1 - (t - j.t1) / 0.45); }
      else if (t >= j.t0) { const u = (t - j.t0) / (j.t1 - j.t0); o.xn = lerp(j.from, j.to, ease.inOutQuad(u)); o.y = -Math.sin(Math.PI * u) * (150 + 70 * Math.abs(j.to - j.from)); o.sy = 1.12; o.sx = 0.92; o.air = true; o.flap = 1; o.look = Math.sign(j.to - j.from); o.rot += Math.sign(j.to - j.from) * 0.18 * Math.sin(Math.PI * u); }
      else if (t >= j.t0 - 0.5) { const u = (t - (j.t0 - 0.5)) / 0.5; o.sy = 1 - 0.16 * u; o.sx = 1 + 0.1 * u; o.look = Math.sign(j.to - j.from); }
    }
    if (!o.air) { const b = beatSquash(t); o.sy -= 0.05 * b; o.sx += 0.04 * b; }
    if (id === 'bee') o.y += Math.sin(t * 5) * 12;
    if (id === 'duck' && !o.air) o.y += Math.sin(t * 2.4) * 5;
    return o;
  }
  function impact(ctx, t, x, y, id) {
    for (const snd of S.sounds) {
      const d = t - snd.t;
      if (d < 0 || d > 0.8 || snd.animal !== id) continue;
      const sx = CX + snd.side * SIDE;
      for (let i = 0; i < 10; i++) { // little lines (or drops of water) flying out
        const a = Math.PI + (i / 9) * Math.PI, r0 = 130 + d * 260, r1 = r0 + 40 * (1 - d / 0.5);
        if (d < 0.5) G.line(ctx, [[sx + Math.cos(a) * r0, GROUND + BASE[id] - 30 + Math.sin(a) * r0 * 0.5], [sx + Math.cos(a) * r1, GROUND + BASE[id] - 30 + Math.sin(a) * r1 * 0.5]], { color: id === 'duck' ? '#FFFFFF' : INK, lw: id === 'duck' ? 9 : 6, seed: 200 + i, alpha: 1 - d / 0.5 });
      }
      burst(ctx, BURST[id], clamp(sx, SAFE.x + 190, SAFE.x + SAFE.w - 190), GROUND + BASE[id] - TALL[id] * SA - 70, t, snd.t, { size: WIDE ? 100 : 92, color: '#FFE14D', rot: snd.side * 0.1, hold: 0.6 });
    }
  }
  function verse(ctx, t, s) {
    const id = s.animal, o = versePose(t, s, id);
    HOME[id](ctx, t);
    const x = CX + o.xn * SIDE, y = GROUND + BASE[id] + o.y;
    if (id === 'bee' && t > s.t0) for (const j of inSeg(S.jumps, s)) if (t >= j.t0 && t < j.t1 + 0.3) { // the flight path
      const u1 = clamp((t - j.t0) / (j.t1 - j.t0)), pts = [];
      for (let k = 0; k <= 12; k++) { const u = (k / 12) * u1; pts.push([CX + lerp(j.from, j.to, ease.inOutQuad(u)) * SIDE, GROUND + BASE.bee - 120 - Math.sin(Math.PI * u) * (150 + 70 * Math.abs(j.to - j.from))]); }
      ctx.save(); ctx.setLineDash([14, 16]); ctx.strokeStyle = 'rgba(43,35,80,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
    }
    A.draw(ctx, id, { x, y, s: SA, sx: o.sx, sy: o.sy, rot: o.rot, look: o.look, mouth: o.mouth, flap: id === 'bee' ? 1 : o.flap, float: id === 'duck' && !o.air, eyes: o.air ? 'happy' : 'open', shadow: id !== 'duck', ground: id === 'bee' ? (150 - o.y) / SA : -o.y / SA, wag: 1 });
    impact(ctx, t, x, y, id);
  }

  // ---------- a chorus: a sunburst party ----------
  function partyBg(ctx, t, id, t0) {
    const [c0, c1] = PARTY[id];
    ctx.fillStyle = c0; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(CX, GROUND - 160); ctx.rotate((t - t0) * 0.22);
    const R = Math.hypot(W, H);
    for (let i = 0; i < 20; i += 2) { const a0 = (i / 20) * Math.PI * 2, a1 = ((i + 1) / 20) * Math.PI * 2; ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.fill(); }
    ctx.restore();
    G.ellipse(ctx, CX, GROUND + H * 0.42, W * 0.95, H * 0.44, { fill: '#7FCB62', lw: 6, seed: 110, hatch: { color: 'rgba(0,60,0,0.1)', gap: 12 } });
  }
  function hands(ctx, x, y, gap, seed) { // a pair of clapping mittens
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(x + sd * (gap + 40), y); ctx.rotate(sd * -0.25);
      G.rrect(ctx, -38, -62, 76, 124, 34, { fill: '#FFD9B8', lw: 5, seed: seed + sd });
      G.ellipse(ctx, sd * -34, 18, 18, 30, { fill: '#FFD9B8', lw: 4.5, seed: seed + 3 + sd });
      ctx.restore();
    }
  }
  function boots(ctx, x, y, lift, seed) {
    for (const sd of [-1, 1]) {
      const yy = y - (sd < 0 ? lift : 0);
      G.rrect(ctx, x + sd * 62 - 36, yy - 110, 64, 100, 18, { fill: '#F2617A', lw: 5, seed: seed + sd });
      G.rrect(ctx, x + sd * 62 - 40, yy - 34, 104, 44, 20, { fill: '#F2617A', lw: 5, seed: seed + 3 + sd });
    }
  }
  function chorus(ctx, t, s) {
    const all = s.type === 'final' || s.type === 'end2';
    const ids = all ? EP.animals : [s.animal];
    const B = (i, b = 0) => T(s.b0 + i, b);
    const yay = inSeg(S.yays, s)[0];
    let shake = 0;
    for (const st of inSeg(S.stomps, s)) shake += 16 * pulse(t, st.t, 9) * (t >= st.t ? 1 : 0);
    if (yay && t >= yay.t) shake += 14 * Math.exp(-(t - yay.t) * 5);
    ctx.save(); ctx.translate(U.noise1(t * 30, 1) * shake, U.noise1(t * 30, 2) * shake);
    partyBg(ctx, t, all ? 'all' : s.animal, s.t0);
    // the pose (shared by everyone on stage)
    let y = 0, sx = 1, sy = 1, air = false;
    for (const h of inSeg(S.hops, s)) { const u = (t - h.t) / 0.42; if (u >= 0 && u < 1) { y = -Math.sin(Math.PI * u) * 130; air = true; } }
    if (yay) { const u = (t - yay.t) / 0.7; if (u >= 0 && u < 1) { y = -Math.sin(Math.PI * u) * 240; air = true; } }
    if (!air) { const b = beatSquash(t); sy -= 0.1 * b; sx += 0.08 * b; } else { sy = 1.1; sx = 0.93; }
    for (const c of inSeg(S.claps, s)) { const p = t >= c.t ? pulse(t, c.t, 10) : 0; sx += 0.1 * p; }
    const rot = Math.sin(Math.PI * clock.beatPos(t)) * 0.07 + wiggleRot(t, s);
    const mouth = Math.max(talk(t, s), yay && t >= yay.t && t < yay.t + 0.9 ? 1 : 0);
    const sc = all ? (WIDE ? 1.25 : 0.95) : (WIDE ? 1.7 : 2.0);
    ids.forEach((id, i) => {
      const off = all ? (i - (ids.length - 1) / 2) * (WIDE ? W * 0.27 : SAFE.w * 0.33) : 0;
      const lag = all ? i * 0.06 : 0; // a little ripple through the line
      const hov = id === 'bee' ? -60 + Math.sin(t * 5 + i) * 10 : 0;
      A.draw(ctx, id, { x: CX + off, y: GROUND + y + hov, s: sc, sx, sy, rot: rot * (i % 2 ? -1 : 1) + lag * 0, mouth, eyes: air || (yay && t >= yay.t) ? 'happy' : 'open', flap: id === 'bee' ? 1 : air ? 1 : 0.15, ground: (-y - hov) / sc, wag: 1 });
    });
    ctx.restore();
    // the animal's words fly out as they are said (bars 0 and 2; the whole first line of the last chorus)
    const tall = Math.max(...ids.map((id) => TALL[id] + (id === 'bee' ? 60 / sc : 0))) * sc;
    const top = GROUND - tall - 80;
    for (const p of S.vo) if (p.seg === s.i && (p.bar === 0 || p.bar === 2 || (all && p.bar === 1)) && s.type !== 'end') p.words.forEach((w, i) => {
      const n = p.bar * 3 + i, side = n % 2 ? 1 : -1, spread = WIDE ? W * 0.3 : SAFE.w * 0.27;
      burst(ctx, w.w.replace(/[^A-Za-z]/g, '').toUpperCase() + '!', CX + side * spread, (all || !WIDE ? top - 10 : top + 90) + (i % 2) * 36, t, w.t, { size: WIDE ? 92 : 78, color: '#FFFFFF', rot: side * 0.14, hold: Math.max(0.45, p.end - w.t + 0.1) });
    });
    // clap, clap! stomp, stomp!
    const ix = all ? (WIDE ? W * 0.135 : SAFE.w * 0.165) : WIDE ? W * 0.3 : SAFE.w * 0.3, iy = all || !WIDE ? top - 50 : GROUND - 250;
    if (t >= B(4) && t < B(5)) {
      const a = clamp((t - B(4)) / 0.15) * clamp((B(5) - t) / 0.12);
      let gap = 46;
      for (const c of inSeg(S.claps, s)) { const d = t - c.t; if (d >= -0.12 && d < 0) gap = lerp(46, 0, (d + 0.12) / 0.12); else if (d >= 0 && d < 0.2) gap = lerp(0, 46, d / 0.2); }
      ctx.save(); ctx.globalAlpha = a; for (const sd of [-1, 1]) hands(ctx, CX + sd * ix, iy, gap, 130 + sd); ctx.restore();
      for (const [k, c] of inSeg(S.claps, s).entries()) for (const sd of [-1, 1]) burst(ctx, 'CLAP!', CX + sd * ix, iy - 112, t, c.t, { size: WIDE ? 70 : 60, color: '#FFE14D', rot: sd * 0.1 * (k ? 1 : -1), hold: 0.28 });
    }
    if (t >= B(5) && t < B(6)) {
      const a = clamp((t - B(5)) / 0.15) * clamp((B(6) - t) / 0.12);
      let lift = 0;
      for (const st of inSeg(S.stomps, s)) { const d = t - st.t; if (d >= -0.2 && d < 0) lift = 70 * Math.sin(Math.PI * (d + 0.2) / 0.2); }
      ctx.save(); ctx.globalAlpha = a; for (const sd of [-1, 1]) boots(ctx, CX + sd * ix, iy + 70, lift, 140 + sd); ctx.restore();
      for (const [k, st] of inSeg(S.stomps, s).entries()) for (const sd of [-1, 1]) burst(ctx, 'STOMP!', CX + sd * ix, iy - 110, t, st.t, { size: WIDE ? 66 : 56, color: '#FFE14D', rot: sd * 0.1 * (k ? 1 : -1), hold: 0.2 });
    }
    if (yay && t >= yay.t) { G.confetti(ctx, t, yay.t, { n: 170, seed: 7 + s.i, spawn: 1.6, fall: 420 }); const f = 0.75 * Math.exp(-(t - yay.t) * 10); if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }
  }

  // ---------- the title card, and the ending of a short ----------
  function title(ctx, t, s) {
    const id = EP.animals[0];
    partyBg(ctx, t, id, 0);
    const words = EP.title.toUpperCase().split(' '), rows = WIDE ? [words] : [words.slice(0, 2), words.slice(2)];
    const step = (s.t1 - 0.9) / (words.length + 2);
    let size = WIDE ? 150 : 124;
    for (const r of rows) size = Math.min(size, fitSize(ctx, r.join(' '), size, WIDE ? W * 0.9 : SAFE.w - 20));
    const y0 = WIDE ? H * 0.26 : SAFE.y + 250;
    let n = 0;
    rows.forEach((row, r) => {
      const sp = size * 0.3, ws = row.map((w) => G.measure(ctx, w, size, 'Bungee', 400)), tot = ws.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
      let x = CX - tot / 2;
      row.forEach((w, i) => {
        const t0 = 0.3 + n * step, d = t - t0; n++;
        if (d >= 0) {
          const k = ease.outBack(clamp(d / 0.2), 2.4), bob = Math.sin(t * 4 + n) * 6;
          ctx.save(); ctx.translate(x + ws[i] / 2, y0 + r * size * 1.12 + bob); ctx.scale(k, k); ctx.rotate((n % 2 ? 1 : -1) * 0.03);
          G.text(ctx, w, 0, 0, { size, fam: 'Bungee', weight: 400, color: n % 2 ? '#FFFFFF' : '#FFE14D', align: 'center', baseline: 'middle', stroke: INK, strokeW: size * 0.2, boil: 0 });
          ctx.restore();
        }
        x += ws[i] + sp;
      });
    });
    const ts = 0.3 + words.length * step, a = clamp((t - ts) / 0.2);
    if (a > 0) G.text(ctx, EP.sub, CX, y0 + rows.length * size * 1.12 + (WIDE ? 10 : 20), { size: WIDE ? 64 : 62, fam: 'Gochi Hand', weight: 400, color: INK, align: 'center', baseline: 'middle', boil: 0, alpha: a });
    const ids = EP.animals, sc = ids.length > 1 ? (WIDE ? 1.2 : 0.95) : (WIDE ? 1.5 : 1.7);
    ids.forEach((an, i) => {
      const off = (i - (ids.length - 1) / 2) * (WIDE ? W * 0.27 : SAFE.w * 0.33), u = clamp((t - 0.25 - i * 0.2) / 0.45);
      const y = GROUND + (1 - ease.outBack(u, 1.6)) * (H - GROUND + 420) - Math.abs(Math.sin(Math.PI * clock.beatPos(t))) * 26 * (u >= 1 ? 1 : 0) + (an === 'bee' ? -60 : 0);
      A.draw(ctx, an, { x: CX + off, y, s: sc, eyes: 'happy', mouth: 0.5, flap: 1, wag: 1, ground: (GROUND - y) / sc, rot: Math.sin(t * 5 + i) * 0.05 });
    });
  }
  function ending(ctx, t, s) {
    const id = s.animal;
    partyBg(ctx, t, id, S.segs[s.i - 1].t0);
    const hop = Math.abs(Math.sin(Math.PI * clock.beatPos(t))) * 60, sc = WIDE ? 1.7 : 2.0;
    A.draw(ctx, id, { x: CX, y: GROUND - hop + (id === 'bee' ? -60 : 0), s: sc, eyes: 'happy', mouth: 0.7, flap: 1, wag: 1, ground: (hop + (id === 'bee' ? 60 : 0)) / sc, rot: Math.sin(t * 6) * 0.06 });
    G.confetti(ctx, t, S.yays[S.yays.length - 1].t, { n: 170, seed: 7 + s.i - 1, spawn: 1.6, fall: 420 });
    const size = fitSize(ctx, 'SING IT AGAIN!', WIDE ? 130 : 110, WIDE ? W * 0.8 : SAFE.w - 20);
    burst(ctx, 'SING IT AGAIN!', CX, CAPY + 20, t, s.t0, { size, color: '#FFE14D', rot: -0.04, hold: 10 });
  }

  // ---------- night: the goodnight ending and the lullaby ----------
  const NIGHT = { frog: [CX, GROUND], duck: [CX - SIDE * (WIDE ? 0.98 : 0.95), GROUND + (WIDE ? 120 : 250)], bee: [CX + SIDE * (WIDE ? 1.25 : 0.9), GROUND - 96] };
  function zzz(ctx, t, x, y, k = 1) {
    for (let i = 0; i < 3; i++) { const p = (t * 0.35 + i / 3) % 1; G.text(ctx, 'Z', x + p * 70 * k, y - p * 130 * k, { size: (30 + p * 40) * k, fam: 'Bungee', weight: 400, color: '#FFF3C9', align: 'center', alpha: Math.sin(Math.PI * p), boil: 0 }); }
  }
  // sleep: 0 awake, 1 sleepy, 2 asleep (per animal)
  function night(ctx, t, sleep, show) {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#141B4D'); g.addColorStop(1, '#4A4E9C'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const b of S.bgStars) { ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * 1.4 + b.ph)})`; ctx.beginPath(); ctx.arc(b.x * W, b.y * H, 2.5 + b.r * 3, 0, Math.PI * 2); ctx.fill(); }
    const mx = WIDE ? W * 0.84 : W * 0.72, my = WIDE ? H * 0.2 : H * 0.36;
    const gl = ctx.createRadialGradient(mx, my, 40, mx, my, 300); gl.addColorStop(0, 'rgba(255,243,201,0.35)'); gl.addColorStop(1, 'rgba(255,243,201,0)'); ctx.fillStyle = gl; ctx.fillRect(mx - 300, my - 300, 600, 600);
    G.ellipse(ctx, mx, my, 84, 84, { fill: '#FFF3C9', lw: 4, seed: 150 });
    for (const [dx, dy, r] of [[-26, -20, 16], [24, 18, 12], [10, -36, 8]]) G.ellipse(ctx, mx + dx, my + dy, r, r, { fill: '#F0DFA6', lw: 0, seed: 151 + r });
    // every note of the tune lights a star
    for (const st of S.stars) {
      const d = t - st.t; if (d < 0) continue;
      const r = (14 + st.r * 10) * (ease.outBack(clamp(d / 0.3), 3) + 0.25 * Math.max(0, 1 - d / 0.6)) * (0.9 + 0.1 * Math.sin(t * 3 + st.i));
      const x = st.x * W, y = st.y * H;
      if (Math.hypot(x - mx, y - my) < 150 || (Math.abs(y - CAPY) < 110 && Math.abs(x - CX) < (WIDE ? W * 0.4 : W * 0.5))) continue; // not behind the moon or the words
      if (d < 0.6) { const h = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5); h.addColorStop(0, `rgba(255,236,170,${0.6 * (1 - d / 0.6)})`); h.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = h; ctx.fillRect(x - r * 3.5, y - r * 3.5, r * 7, r * 7); }
      G.star(ctx, x, y, r, { fill: st.i % 3 ? '#FFE9A8' : '#FFFFFF', seed: 160 + st.i, rot: Math.sin(t + st.i) * 0.2, lw: 2.5 });
    }
    hills(ctx, GROUND - 90, '#2F5F6E', 32); ground(ctx, GROUND - 50, '#27407F', 33); ripples(ctx, t * 0.5, 'rgba(200,215,255,0.35)');
    ctx.fillStyle = 'rgba(255,243,201,0.16)'; ctx.beginPath(); ctx.ellipse(mx, GROUND + (H - GROUND) * 0.55, 70, (H - GROUND) * 0.36, 0, 0, Math.PI * 2); ctx.fill(); // the moon on the water
    reeds(ctx, t * 0.5, WIDE ? 60 : 20, GROUND - 30, 3, 34);
    const eyes = (k) => ['open', 'sleepy', 'closed'][k], br = 1 + Math.sin(t * 1.6) * 0.02;
    if (show.bee) { const [x, y] = NIGHT.bee; flower(ctx, t * 0.4, x, y + 190 + (WIDE ? 60 : 110), 190 + (WIDE ? 60 : 110), '#C9A8F5', 55, true); A.draw(ctx, 'bee', { x: x + Math.sin(t * 0.6 + 55) * 8, y: y + 16, s: 1.0, sy: br, eyes: eyes(sleep.bee), flap: sleep.bee > 1 ? 0.05 : 0.3, shadow: false }); if (sleep.bee > 1) zzz(ctx, t + 0.3, x + 80, y - 200, 0.8); }
    if (show.frog) { const [x, y] = NIGHT.frog; lilypad(ctx, x - SIDE * (WIDE ? 0.2 : 0.1), y + 150, 36, false); log(ctx, x, y); A.draw(ctx, 'frog', { x, y, s: SA, sy: br, eyes: eyes(sleep.frog), mouth: 0, shadow: false }); if (sleep.frog > 1) zzz(ctx, t, x + 130, y - 300); }
    if (show.duck) { const [x, y] = NIGHT.duck; A.draw(ctx, 'duck', { x, y: y + Math.sin(t * 1.2) * 5, s: 1.15, sy: br, eyes: eyes(sleep.duck), float: true, water: '#27407F', shadow: false }); if (sleep.duck > 1) zzz(ctx, t + 0.6, x + 90, y - 300, 0.9); }
    ctx.fillStyle = 'rgba(20,27,77,0.14)'; ctx.fillRect(0, 0, W, H);
  }
  // which phrase of a night segment we are in → who is how sleepy
  function nightState(t, s) {
    const i = clamp(Math.floor(clock.beatPos(t) / 4) - s.b0, 0, 99);
    const k = s.type === 'tail' ? 2 : i >= 2 ? 2 : 1;
    if (S.LULL) {
      if (s.type === 'tail') return { sleep: { frog: 2, duck: 2, bee: 2 }, show: { frog: 1, duck: 1, bee: 1 }, focus: 'all' };
      if (s.type === 'intro') return { sleep: { frog: 1, duck: 1, bee: 1 }, show: { frog: 1, duck: 1, bee: 1 }, focus: 'all' };
      if (s.animal === 'all') return { sleep: { frog: i >= 0 ? 2 : 1, duck: i >= 1 ? 2 : 1, bee: i >= 2 ? 2 : 1 }, show: { frog: 1, duck: 1, bee: 1 }, focus: 'all' };
      return { sleep: { frog: k, duck: k, bee: k }, show: { frog: 1, duck: 1, bee: 1 }, focus: s.animal };
    }
    return { sleep: { frog: k }, show: { frog: 1 }, focus: 'all' };
  }
  let off = null;
  function layer(ctx, alpha, drawFn) { // draw a whole picture, then lay it over the frame at this opacity
    if (alpha >= 1) return drawFn(ctx);
    if (!off) off = G.makeCanvas(ctx.canvas.width, ctx.canvas.height);
    const o = off.getContext('2d');
    o.setTransform(ctx.getTransform()); o.clearRect(0, 0, W, H);
    drawFn(o);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(off, 0, 0); ctx.restore();
  }
  function nightShot(ctx, t, s) {
    const st = nightState(t, s);
    ctx.save();
    if (st.focus !== 'all') { // move in on the one who is being sung to sleep
      const [fx, fy] = NIGHT[st.focus], z = WIDE ? 1.45 : 1.3, u = clamp((t - s.t0) / (s.t1 - s.t0)), zz = z * (1 + 0.05 * u);
      const tx = clamp(CX - fx * zz, W - W * zz, 0), ty = clamp((WIDE ? H * 0.62 : H * 0.6) - (fy - 110) * zz, H - H * zz, 0);
      ctx.translate(tx, ty); ctx.scale(zz, zz);
    }
    night(ctx, t, st.sleep, st.show);
    ctx.restore();
  }

  function scene(ctx, t, s) {
    if (s.type === 'intro') return S.LULL ? nightShot(ctx, t, s) : title(ctx, t, s);
    if (s.type === 'verse') return verse(ctx, t, s);
    if (s.type === 'chorus' || s.type === 'final') return chorus(ctx, t, s);
    if (s.type === 'end') return ending(ctx, t, s);
    if (s.type === 'wind') { // the sun goes down on the pond
      HOME.frog(ctx, t);
      A.draw(ctx, 'frog', { x: CX, y: GROUND, s: SA, eyes: clock.beatPos(t) / 4 - s.b0 > 0.5 ? 'sleepy' : 'open', mouth: 0, shadow: false });
      const u = ease.inOutQuad(clamp((t - s.t0) / (s.t1 - s.t0)));
      return layer(ctx, u, (c) => night(c, t, { frog: 1 }, { frog: 1 }));
    }
    return nightShot(ctx, t, s);
  }

  Studio.film({
    draw(ctx, t) {
      const s = S.segAt(t);
      scene(ctx, t, s);
      // the lullaby dissolves from one sleeper to the next
      if (S.LULL && s.i > 0 && t - s.t0 < 0.8 && s.type !== 'tail') { const p = S.segs[s.i - 1]; layer(ctx, 1 - (t - s.t0) / 0.8, (c) => nightShot(c, t, p)); }
      if (S.LULL && s.type === 'tail' && t - s.t0 < 1.2) { const p = S.segs[s.i - 1]; layer(ctx, 1 - (t - s.t0) / 1.2, (c) => nightShot(c, t, p)); }
      for (const c of S.cuts) if (c.kind !== 'lull') { const f = t >= c.t ? 0.6 * Math.exp(-(t - c.t) * 14) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }
      lyrics(ctx, t);
      if (s.type === 'tail') {
        const a = clamp((t - s.t0 - (S.LULL ? 1.2 : 0.4)) / 1.2);
        if (a > 0) G.text(ctx, S.LULL ? 'Sweet dreams...' : 'Night-night!', CX, CAPY, { size: WIDE ? 120 : 104, fam: 'Gochi Hand', weight: 400, color: '#FFF3C9', align: 'center', baseline: 'middle', stroke: '#141B4D', strokeW: 22, boil: 0, alpha: a });
      }
    },
    post: { paper: 0.3, vignette: 0.18, grain: 0.03 },
    fadeOut: S.LULL || S.FULL ? 1.6 : 0.01,
  });
})();
