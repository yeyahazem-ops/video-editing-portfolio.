// THE FILM: «ياسين والشباك». A list of shots (Shots.film); every frame is a pure function of t.
// Mouths move with the ElevenLabs voices (out/voice.json); captions are their words.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, Subs = globalThis.Subs, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { T, ev } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  let VO = null, SUBS = [];

  // ---------- the cast ----------
  const CAST = {
    yasin: { outfit: 'tee', shirt: '#E9483B', print: '10', printColor: '#FFFFFF', shorts: '#2B4C7E', skin: '#C68B59', hair: '#2A1C14', hairStyle: 'short', shoes: '#F4F1EA' },
    fathy: { outfit: 'thobe', robe: '#8FA9C4', skin: '#B9835A', hair: '#D9D6D0', hairStyle: 'bald', facialHair: 'mustache', glasses: 'round', build: 'broad', shoes: '#5A3B26' },
    mama: { outfit: 'dress', shirt: '#E77FA0', hairStyle: 'hijab', hijab: '#F2B84B', skin: '#C9925F' },
  };
  globalThis.CAST = CAST;
  const INK = '#2A2320';

  // ---------- helpers ----------
  const mouthOf = (who, t) => { const m = Subs.mouth(VO, t, who); return m.talking ? m : null; };
  const blinkAt = (t, seed) => { const p = (t + seed * 0.37) % 3.3; return p < 0.12 ? 1 : 0; };
  const AR = (ctx, str, x, y, o = {}) => G.text(ctx, str, x, y, { fam: 'Noto Naskh Arabic', weight: 700, lang: 'ar', align: 'center', ...o });
  const pop = (t, t0, d = 0.3, k = 2.4) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / d), k));

  function ball(ctx, x, y, r, spin = 0, squash = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.scale(1 + squash, 1 - squash);
    G.ellipse(ctx, 0, 0, r, r, { fill: '#FBFBF6', lw: Math.max(2.5, r * 0.1), seed: 31, amp: 0.4 });
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2); ctx.clip();
    const pent = (cx, cy, rr) => { const p = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
    ctx.fillStyle = INK;
    for (const [cx, cy, rr] of [[0, 0, 0.36], [0.78, -0.5, 0.3], [-0.78, -0.5, 0.3], [0.55, 0.8, 0.3], [-0.55, 0.8, 0.3]]) { const p = pent(cx * r, cy * r, rr * r); ctx.beginPath(); p.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill(); }
    ctx.restore(); ctx.restore();
  }
  function sky(ctx, t, { top = '#7CC6EC', bottom = '#DDF3FB', sun = [1660, 160] } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
    if (sun) {
      G.rays(ctx, sun[0], sun[1], { n: 14, r0: 90, r1: 170, color: 'rgba(255,214,90,0.7)', lw: 10, seed: 7, spin: t * 0.2 });
      G.ellipse(ctx, sun[0], sun[1], 74, 74, { fill: '#FFD45A', lw: 4, seed: 8 });
    }
    for (let i = 0; i < 4; i++) {
      const x = ((i * 610 + t * 18) % (W + 600)) - 300, y = 90 + (i % 2) * 80;
      for (const [dx, dy, r] of [[0, 0, 60], [60, -22, 70], [125, 0, 56]]) G.ellipse(ctx, x + dx, y + dy, r, r * 0.75, { fill: '#FFFFFF', lw: 3, seed: 40 + i * 3 + dx });
    }
  }
  // a window with green wooden shutters: state 'ok' | 'broken' | 'fixed'
  function windowBox(ctx, x, y, w, h, state, t, seed = 200, { fixT = ev.play } = {}) {
    G.rrect(ctx, x - w * 0.42, y - 6, w * 0.4, h + 12, 6, { fill: '#3E8E6A', lw: 4, seed: seed + 1, hatch: { color: 'rgba(0,0,0,0.14)', gap: 12, angle: 0 } });
    G.rrect(ctx, x + w + w * 0.02, y - 6, w * 0.4, h + 12, 6, { fill: '#3E8E6A', lw: 4, seed: seed + 2, hatch: { color: 'rgba(0,0,0,0.14)', gap: 12, angle: 0 } });
    G.rrect(ctx, x - 10, y - 10, w + 20, h + 20, 8, { fill: '#F4EBDD', lw: 4, seed: seed + 3 });
    if (state === 'broken') {
      G.rrect(ctx, x, y, w, h, 4, { fill: '#2B2B3A', lw: 4, seed: seed + 4 });
      G.poly(ctx, [[x + 4, y + 4], [x + w * 0.45, y + 4], [x + w * 0.2, y + h * 0.3], [x + w * 0.3, y + h * 0.42], [x + 4, y + h * 0.6]], { fill: 'rgba(200,232,246,0.85)', lw: 3, seed: seed + 5, step: 20 });
      G.poly(ctx, [[x + w - 4, y + h - 4], [x + w * 0.5, y + h - 4], [x + w * 0.72, y + h * 0.7], [x + w * 0.62, y + h * 0.55], [x + w - 4, y + h * 0.35]], { fill: 'rgba(200,232,246,0.85)', lw: 3, seed: seed + 6, step: 20 });
    } else {
      G.rrect(ctx, x, y, w, h, 4, { fill: '#A9DCF2', lw: 4, seed: seed + 4 });
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.moveTo(x + w * 0.12, y + h * 0.85); ctx.lineTo(x + w * 0.32, y + h * 0.1); ctx.lineTo(x + w * 0.44, y + h * 0.1); ctx.lineTo(x + w * 0.24, y + h * 0.85); ctx.fill(); ctx.restore();
    }
    G.line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], { color: '#6B4A33', lw: 6, seed: seed + 7 });
    G.line(ctx, [[x, y + h / 2], [x + w, y + h / 2]], { color: '#6B4A33', lw: 6, seed: seed + 8 });
    G.rrect(ctx, x - 22, y + h + 8, w + 44, 22, 6, { fill: '#C98F5E', lw: 4, seed: seed + 9 });
    G.rrect(ctx, x + w - 70, y + h - 30, 56, 40, 8, { fill: '#C4623A', lw: 3.5, seed: seed + 10 }); // a pot of basil
    for (let k = 0; k < 5; k++) G.ellipse(ctx, x + w - 42 + (k - 2) * 12, y + h - 44 - (k % 2) * 12, 14, 10, { fill: '#5BAA4A', lw: 2.5, seed: seed + 11 + k });
    if (state === 'fixed' && t >= fixT - 2.4) {
      const a = t - (fixT - 2.4);
      for (let k = 0; k < 3; k++) { const s = 0.5 + 0.5 * Math.sin(a * 6 + k * 2); G.star(ctx, x + w * (0.2 + k * 0.32), y + h * (0.25 + (k % 2) * 0.4), (14 + 12 * s) * w / 200, { fill: '#FFF3A8', seed: seed + 20 + k, rot: a }); }
    }
  }
  function doorPanel(ctx, x, y, w, h, open, seed = 570) {
    const dw = w * lerp(1, 0.14, ease.inOutQuad(open));
    G.rrect(ctx, x, y, dw, h, 6, { fill: '#8A5A3B', lw: 4, seed: seed + 2, hatch: { color: 'rgba(0,0,0,0.12)', gap: 14, angle: 1.57 } });
    if (dw > w * 0.4) {
      G.rrect(ctx, x + dw * 0.12, y + h * 0.08, dw * 0.76, h * 0.36, 6, { fill: '#7A4D31', lw: 3, seed: seed + 3 });
      G.rrect(ctx, x + dw * 0.12, y + h * 0.52, dw * 0.76, h * 0.38, 6, { fill: '#7A4D31', lw: 3, seed: seed + 4 });
      G.ellipse(ctx, x + dw * 0.84, y + h * 0.5, 10, 10, { fill: '#F2C94C', lw: 3, seed: seed + 5 });
    }
  }
  // the alley (حارة): houses, a lantern, laundry, Uncle Fathy's house on the right.
  // `inside(ctx)` draws whoever stands in the open doorway (before the door panel).
  const HX = 1100, GY = 905;
  const DX = HX + 470, DOORW = 180, DOORY = 430;
  function alley(ctx, t, { win = 'ok', doorOpen = 0, inside } = {}) {
    sky(ctx, t);
    const houses = [[-60, 210, 420, '#F2C57C'], [340, 150, 400, '#BFD8B8'], [720, 250, 380, '#F6E2B3']];
    houses.forEach(([x, y, w, col], i) => {
      G.rrect(ctx, x, y, w, GY - y + 10, 4, { fill: col, lw: 4, seed: 400 + i * 20, hatch: { color: 'rgba(120,70,20,0.10)', gap: 11 } });
      G.rrect(ctx, x - 10, y - 20, w + 20, 26, 4, { fill: Ch.shade(col, 0.78), lw: 3.5, seed: 401 + i * 20 });
      for (let f = 0; f < 2; f++) for (let k = 0; k < 2; k++) {
        const wx = x + 60 + k * (w - 200), wy = y + 60 + f * 230;
        G.rrect(ctx, wx, wy, 80, 120, 6, { fill: '#6C9BB0', lw: 4, seed: 402 + i * 20 + f * 2 + k });
        G.rrect(ctx, wx - 30, wy - 4, 28, 128, 4, { fill: '#3E8E6A', lw: 3, seed: 410 + i * 20 + f * 2 + k });
        G.rrect(ctx, wx + 82, wy - 4, 28, 128, 4, { fill: '#3E8E6A', lw: 3, seed: 415 + i * 20 + f * 2 + k });
      }
    });
    // laundry line across the alley
    G.line(ctx, [[120, 330], [560, 370], [980, 340]], { color: INK, lw: 2.5, seed: 450 });
    ['#E77FA0', '#F2B84B', '#5DADE2', '#F6F0E2', '#E9483B'].forEach((c, k) => { const x = 200 + k * 150, y = 336 + 30 * Math.sin((k / 4) * Math.PI) + Math.sin(t * 2 + k) * 3; G.rrect(ctx, x, y, 60, 70 + (k % 2) * 24, 5, { fill: c, lw: 3, seed: 451 + k }); });
    // a lantern (فانوس) hanging from a balcony
    const lx = 560, ly = 440 + Math.sin(t * 1.6) * 4;
    G.line(ctx, [[lx, 380], [lx, ly - 40]], { color: INK, lw: 2.5, seed: 460 });
    G.poly(ctx, [[lx - 26, ly - 40], [lx + 26, ly - 40], [lx + 34, ly + 30], [lx, ly + 60], [lx - 34, ly + 30]], { fill: '#F2C94C', lw: 3.5, seed: 461, step: 14 });
    G.ellipse(ctx, lx, ly + 6, 12, 18, { fill: '#FFF3C0', lw: 2, seed: 462 });
    // Uncle Fathy's house
    G.rrect(ctx, HX, 180, 860, GY - 170, 4, { fill: '#E9A178', lw: 4, seed: 500, hatch: { color: 'rgba(120,50,20,0.1)', gap: 11 } });
    G.rrect(ctx, HX - 12, 160, 884, 28, 4, { fill: '#C9805B', lw: 3.5, seed: 501 });
    windowBox(ctx, HX + 160, 230, 130, 130, 'ok', t, 510);
    windowBox(ctx, HX + 680, 230, 130, 130, 'ok', t, 530);
    windowBox(ctx, HX + 150, 560, 200, 190, win, t, 550); // THE window
    // the door: frame, the dark inside, whoever is in it, then the panel
    G.rrect(ctx, DX - 16, DOORY - 16, DOORW + 32, GY - DOORY + 16, 10, { fill: '#C98F5E', lw: 4, seed: 570 });
    G.rrect(ctx, DX, DOORY, DOORW, GY - DOORY, 6, { fill: '#2E2430', lw: 4, seed: 571 });
    if (inside) { ctx.save(); ctx.beginPath(); ctx.rect(DX, DOORY, DOORW, GY - DOORY); ctx.clip(); inside(ctx); ctx.restore(); }
    doorPanel(ctx, DX, DOORY, DOORW, GY - DOORY, doorOpen);
    G.rrect(ctx, DX - 30, GY - 14, 230, 22, 4, { fill: '#B9A58A', lw: 3, seed: 575 }); // the step
    G.rrect(ctx, DX + 5, 360, 170, 48, 8, { fill: '#F6F0E2', lw: 3.5, seed: 576 });
    AR(ctx, 'عم فتحي', DX + 90, 395, { size: 30, color: '#7A3B22', boil: 0.4 });
    // the ground: stone tiles
    G.rrect(ctx, -60, GY, W + 120, H - GY + 60, 0, { fill: '#D9C3A0', lw: 4, seed: 590, hatch: { color: 'rgba(110,80,40,0.12)', gap: 16 } });
    for (let k = 0; k < 9; k++) G.line(ctx, [[k * 240 - 40, GY + 10], [k * 240 - 120, H + 20]], { color: 'rgba(110,80,40,0.25)', lw: 2.5, seed: 595 + k });
    // the low wall on the left (the cat sits on it)
    G.rrect(ctx, 60, GY - 170, 330, 175, 6, { fill: '#C9B79C', lw: 4, seed: 600, hatch: { color: 'rgba(90,60,30,0.14)', gap: 12 } });
  }

  // ---------- keepy-uppy ----------
  const YX = 760, YS = 0.78; // Yasin's spot in the street
  const footPos = (i) => [YX + (i % 2 ? 1 : -1) * 46 * YS, GY - 50 * YS];
  function ballState(t) {
    const tc = S.touches;
    if (t < tc[0]) return { x: footPos(0)[0] - 30, y: GY - 24, spin: 0 }; // resting on the ground
    for (let i = 0; i < tc.length; i++) {
      const a = tc[i], b = i + 1 < tc.length ? tc[i + 1] : ev.kick;
      if (t < b) {
        const u = (t - a) / (b - a), p0 = footPos(i), p1 = i + 1 < tc.length ? footPos(i + 1) : [YX + 40, GY - 60];
        const hgt = i + 1 < tc.length ? 230 : 460;
        return { x: lerp(p0[0], p1[0], u), y: lerp(p0[1], p1[1], u) - hgt * 4 * u * (1 - u) - 30, spin: (i + u) * 2.4, i };
      }
    }
    return { x: YX + 40, y: GY - 90, spin: 0 };
  }
  function legLift(t) { // a 'walk' phase that lifts the touching foot
    let best = 1e9, k = -1;
    S.touches.forEach((tc, i) => { if (Math.abs(t - tc) < Math.abs(best)) { best = t - tc; k = i; } });
    const e = Math.max(0, 1 - Math.abs(best) / 0.24);
    if (e <= 0) return null;
    return k % 2 ? 0.5 + 0.25 * e : 0.25 * e;
  }

  // ---------- shots ----------
  function title(ctx, t, s, { end = false } = {}) {
    sky(ctx, t, { top: '#FFB36B', bottom: '#FFE7A8', sun: null });
    G.rays(ctx, 960, 1040, { n: 24, r0: 200, r1: 1500, color: 'rgba(255,255,255,0.35)', lw: 26, seed: 3, spin: t * 0.08 });
    G.ellipse(ctx, 400, 1180, 900, 300, { fill: '#7FC46A', lw: 4, seed: 10 });
    G.ellipse(ctx, 1600, 1210, 900, 320, { fill: '#6AB35A', lw: 4, seed: 11 });
    for (let k = 0; k < 12; k++) { const x = 140 + G.rnd(k, 1) * 1640, y = 80 + G.rnd(k, 2) * 260, tw = 0.6 + 0.4 * Math.sin(t * 3 + k); G.star(ctx, x, y, 16 * tw, { fill: '#FFF7C2', seed: 20 + k, rot: t * 0.3 + k }); }
    const sungT = (end ? S.sung[1] : S.sung[0]).map((n) => n.t);
    const bounce = sungT.reduce((a, st) => a + (t >= st ? Math.exp(-(t - st) * 10) * Math.sin(Math.min(Math.PI, (t - st) * 20)) : 0), 0);
    const p0 = pop(t, end ? ev.end : 0.05, 0.45, 2);
    ctx.save(); ctx.translate(960, end ? 300 : 380); ctx.scale(p0 * (1 + bounce * 0.06), p0 * (1 - bounce * 0.04)); ctx.rotate(Math.sin(t * 1.5) * 0.015);
    AR(ctx, end ? 'وتوتة توتة' : 'حواديت توتة', 0, 40, { size: end ? 170 : 210, color: '#FF6B4A', stroke: INK, strokeW: 16 });
    ctx.restore();
    if (!end) {
      const p1 = pop(t, T(1, 2), 0.4);
      if (p1 > 0) {
        ctx.save(); ctx.translate(960, 600); ctx.scale(p1, p1);
        G.rrect(ctx, -400, -70, 800, 120, 30, { fill: '#FFFFFF', lw: 5, seed: 30 });
        AR(ctx, 'الحلقة ١ : ياسين والشباك', 0, 18, { size: 62, color: '#2B4C7E' });
        ctx.restore();
      }
      Ch.person(ctx, { x: 300, y: 1010, s: 0.9, pose: 'stand', style: CAST.yasin, gesture: 'wave', mouth: 'grin', eyes: 'happy', seed: 900 });
      ball(ctx, 470, 985, 30, 0);
      Ch.cat(ctx, { x: 1640, y: 1000, s: 1.1, t, look: -0.6, happy: 1, seed: 740 });
    } else {
      const p2 = pop(t, T(32), 0.4);
      if (p2 > 0) { ctx.save(); ctx.translate(960, 500); ctx.scale(p2, p2); AR(ctx, 'خلصت الحدوتة!', 0, 0, { size: 110, color: '#FFFFFF', stroke: INK, strokeW: 12 }); ctx.restore(); }
      const p3 = pop(t, ev.sub, 0.4, 3);
      if (p3 > 0) {
        ctx.save(); ctx.translate(960, 690); ctx.scale(p3, p3);
        G.rrect(ctx, -250, -62, 500, 124, 62, { fill: '#E63B2E', lw: 5, seed: 50 });
        AR(ctx, 'اشترك', 40, 24, { size: 70, color: '#FFFFFF' });
        const sw = Math.sin((t - ev.sub) * 14) * Math.exp(-(t - ev.sub) * 2) * 0.5;
        ctx.save(); ctx.translate(-140, 0); ctx.rotate(sw);
        G.poly(ctx, [[-30, 26], [-24, -14], [0, -34], [24, -14], [30, 26]], { fill: '#FFD45A', lw: 4, seed: 51, step: 12 });
        G.ellipse(ctx, 0, 32, 9, 9, { fill: '#FFD45A', lw: 3, seed: 52 });
        ctx.restore();
        ctx.restore();
        const p4 = pop(t, T(33, 2), 0.4);
        if (p4 > 0) { ctx.save(); ctx.translate(960, 850); ctx.scale(p4, p4); AR(ctx, 'واستنونا في حدوتة جديدة!', 0, 0, { size: 56, color: '#2B4C7E', stroke: '#FFFFFF', strokeW: 8 }); ctx.restore(); }
      }
      Ch.person(ctx, { x: 260, y: 1020, s: 0.85, pose: 'stand', style: CAST.yasin, gesture: 'wave', mouth: 'grin', eyes: 'happy', seed: 900 });
      Ch.person(ctx, { x: 1640, y: 1030, s: 1.0, pose: 'stand', style: CAST.fathy, gesture: 'wave', mouth: 'grin', eyes: 'happy', seed: 950 });
      Ch.cat(ctx, { x: 470, y: 1010, s: 0.9, t, look: 0.5, happy: 1, seed: 740 });
    }
  }
  const endCard = (ctx, t, s) => title(ctx, t, s, { end: true });

  function street(ctx, t) {
    const b = ballState(t);
    alley(ctx, t, { win: 'ok' });
    Ch.cat(ctx, { x: 230, y: GY - 170, s: 0.8, t, look: clamp((b.x - 230) / 500, -1, 1), happy: 0.6, seed: 740, shadow: false });
    const lift = legLift(t);
    const ready = t > T(8, 2);
    Ch.person(ctx, { x: YX, y: GY, s: YS, pose: lift !== null ? 'walk' : 'stand', walk: lift || 0, style: CAST.yasin, eyes: 'normal', lookY: clamp((b.y - (GY - 330)) / 250, -1, 1), look: clamp((b.x - YX) / 200, -1, 1), mouth: ready ? 'flat' : 'grin', brows: ready ? 'determined' : 'neutral', blink: blinkAt(t, 1), seed: 900 });
    ball(ctx, b.x, b.y, 24, b.spin);
  }
  // the impact frame: a giant sneaker meets the ball
  function kick(ctx, t) {
    const a = t - ev.kick;
    ctx.fillStyle = '#FFE08A'; ctx.fillRect(-W, -H, W * 3, H * 3);
    G.rays(ctx, 1050, 540, { n: 30, r0: 140, r1: 1500, color: '#FFB347', lw: 16, seed: 3, spin: a * 0.6 });
    const swing = ease.outCubic(clamp(a / 0.12));
    ctx.save(); ctx.translate(lerp(380, 640, swing), lerp(820, 600, swing)); ctx.rotate(lerp(0.55, -0.15, swing));
    G.rrect(ctx, -420, -60, 360, 120, 50, { fill: CAST.yasin.skin, lw: 6, seed: 60 });
    G.rrect(ctx, -560, -85, 170, 170, 40, { fill: CAST.yasin.shorts, lw: 6, seed: 61 });
    G.rrect(ctx, -110, -76, 290, 150, 60, { fill: '#F4F1EA', lw: 6, seed: 62, hatch: { color: 'rgba(0,0,0,0.08)', gap: 9 } });
    G.rrect(ctx, -110, 40, 300, 40, 18, { fill: '#E9483B', lw: 5, seed: 63 });
    for (let k = 0; k < 3; k++) G.line(ctx, [[-50 + k * 46, -60], [-30 + k * 46, 20]], { color: INK, lw: 5, seed: 64 + k });
    ctx.restore();
    const sq = Math.max(0, 0.32 - a * 2);
    ball(ctx, 1000 + a * 1800, 520 - a * 700, 120, a * 14, sq);
    const p = pop(t, ev.kick, 0.16, 2.6);
    ctx.save(); ctx.translate(1330, 280); ctx.rotate(-0.1); ctx.scale(p, p);
    AR(ctx, 'شووووط!', 0, 0, { size: 170, color: '#E9483B', stroke: INK, strokeW: 16 });
    ctx.restore();
  }
  // the ball flies at the window, which breaks
  function flight(ctx, t) {
    alley(ctx, t, { win: t >= ev.crash ? 'broken' : 'ok' });
    const t0 = T(9, 1.5), u = clamp((t - t0) / (ev.crash - t0));
    const wx = HX + 250, wy = 655;
    const path = (q) => [lerp(-80, wx, q), lerp(520, wy, q) - 260 * 4 * q * (1 - q)];
    if (t < ev.crash) {
      for (let k = 1; k <= 4; k++) { const [x, y] = path(Math.max(0, u - k * 0.05)); G.line(ctx, [[x, y], [x - 60, y]], { color: 'rgba(255,255,255,0.8)', lw: 6, seed: 70 + k }); }
      const [x, y] = path(u);
      ball(ctx, x, y, lerp(30, 44, u), t * 16);
    } else {
      const a = t - ev.crash;
      for (let i = 0; i < 18; i++) {
        const vx = (G.rnd(i, 1) - 0.5) * 900, vy = -250 - G.rnd(i, 2) * 400;
        const x = wx + vx * a, y = wy + vy * a + 1300 * a * a;
        if (y > 1000) continue;
        G.poly(ctx, [[x, y - 14], [x + 16, y + 4], [x - 8, y + 14]], { fill: '#D6EEF8', lw: 2.5, seed: 80 + i, step: 8 });
      }
      const p = pop(t, ev.crash, 0.18, 3);
      ctx.save(); ctx.translate(wx, wy - 250); ctx.rotate(0.08); ctx.scale(p, p);
      G.star(ctx, 0, 0, 170, { fill: '#FFF3A8', seed: 90 });
      AR(ctx, 'طاااخ!', 0, 30, { size: 96, color: '#E9483B', stroke: INK, strokeW: 12 });
      ctx.restore();
      if (a < 0.2) { ctx.save(); ctx.globalAlpha = 1 - a / 0.2; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore(); }
    }
  }
  // Yasin, shocked
  function shock(ctx, t) {
    ctx.fillStyle = '#9ED3EE'; ctx.fillRect(-W, -H, W * 3, H * 3);
    G.rays(ctx, 960, 420, { n: 22, r0: 200, r1: 1400, color: 'rgba(255,255,255,0.5)', lw: 18, seed: 5, spin: t * 0.1 });
    const shake = Math.sin(t * 60) * 3;
    Ch.person(ctx, { x: 960 + shake, y: 1560, s: 2.3, pose: 'stand', style: CAST.yasin, handL: [-80, -540], handR: [80, -540], eyes: 'wide', brows: 'worried', mouth: 'o', sweat: 1, seed: 900 });
    for (let k = 0; k < 3; k++) AR(ctx, '!', 1300 + k * 80, 300 - k * 30, { size: 140 + k * 20, color: '#E9483B', stroke: INK, strokeW: 10 });
  }
  // hiding behind the wall corner, with a thought bubble
  function hide(ctx, t) {
    sky(ctx, t, { sun: [1700, 140] });
    G.rrect(ctx, 1150, 300, 900, 700, 4, { fill: '#E9A178', lw: 4, seed: 700 });
    windowBox(ctx, 1420, 520, 180, 170, 'broken', t, 710);
    G.rrect(ctx, -60, 860, W + 120, 300, 0, { fill: '#D9C3A0', lw: 4, seed: 720, hatch: { color: 'rgba(110,80,40,0.12)', gap: 16 } });
    const peek = 0.5 + 0.5 * Math.sin((t - ev.hide) * 2.2);
    Ch.person(ctx, { x: 520 + peek * 70, y: 1000, s: 1.05, pose: 'stand', style: CAST.yasin, gesture: 'think', eyes: 'normal', look: 1, brows: 'worried', mouth: 'wavy', sweat: 0.8, blink: blinkAt(t, 2), seed: 900 });
    G.rrect(ctx, -40, 120, 560, 1000, 6, { fill: '#F2C57C', lw: 5, seed: 730, hatch: { color: 'rgba(120,70,20,0.12)', gap: 12 } });
    for (let k = 0; k < 6; k++) G.line(ctx, [[-40, 260 + k * 140], [520, 260 + k * 140]], { color: 'rgba(120,70,20,0.3)', lw: 3, seed: 740 + k });
    // the thought «محدش شافني... أستخبى؟» (said in his heart, so it is a thought bubble, not lips)
    const l = S.vo.find((q) => q.id === 'hide');
    if (t >= l.at - 0.3) {
      const p = pop(t, l.at - 0.3, 0.35);
      ctx.save(); ctx.translate(1060, 250); ctx.scale(p, p);
      for (const [dx, dy, r] of [[-330, 170, 22], [-280, 120, 32]]) G.ellipse(ctx, dx, dy, r, r, { fill: '#FFFFFF', lw: 4, seed: 750 + r });
      G.ellipse(ctx, 0, 0, 360, 130, { fill: '#FFFFFF', lw: 4, seed: 770 });
      AR(ctx, 'محدش شافني... أستخبى؟', 0, 20, { size: 60, color: INK });
      ctx.restore();
    }
  }
  // the memory of mama
  function think(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFD1DC'); g.addColorStop(1, '#FFF1E0');
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
    for (let k = 0; k < 10; k++) { const a = (t * 0.25 + G.rnd(k, 3)) % 1; G.heart(ctx, 120 + G.rnd(k, 1) * 1700, 1100 - a * 1200, 1.4 + G.rnd(k, 2), { fill: 'rgba(233,90,120,0.35)', seed: 800 + k }); }
    const decided = t >= T(16);
    Ch.person(ctx, { x: 380, y: 1010, s: 1.0, pose: 'stand', style: CAST.yasin, gesture: decided ? 'thumbsUp' : 'think', eyes: decided ? 'happy' : 'normal', look: 0.8, lookY: -0.6, brows: decided ? 'determined' : 'up', mouth: decided ? 'smile' : 'flat', blink: blinkAt(t, 3), seed: 900 });
    const p = pop(t, ev.think + 0.2, 0.5, 1.8);
    if (p > 0) {
      ctx.save(); ctx.translate(1180, 430); ctx.scale(p, p);
      for (const [dx, dy, r] of [[-600, 380, 26], [-540, 300, 38]]) G.ellipse(ctx, dx, dy, r, r, { fill: '#FFFFFF', lw: 4, seed: 810 + r });
      G.rrect(ctx, -500, -330, 1000, 560, 220, { fill: '#FFFFFF', lw: 5, seed: 830 });
      Ch.person(ctx, { x: -260, y: 200, s: 0.8, pose: 'stand', style: CAST.mama, gesture: 'point', eyes: 'happy', mouth: mouthOf('narrator', t) && t > T(15, 1) ? 'smile' : 'smile', seed: 960 });
      G.heart(ctx, -100, -250, 2.4 + 0.3 * Math.sin(t * 6), { fill: '#E95A78', seed: 840 });
      const q = pop(t, T(15, 2), 0.35);
      if (q > 0) {
        ctx.save(); ctx.translate(190, -40); ctx.scale(q, q);
        AR(ctx, 'الصراحة', 0, -10, { size: 96, color: '#D9435F' });
        AR(ctx, 'دايماً أحلى', 0, 110, { size: 84, color: '#2B4C7E' });
        ctx.restore();
      }
      ctx.restore();
    }
    if (decided) { const q = pop(t, T(16), 0.3, 3); ctx.save(); ctx.translate(380, 380); ctx.scale(q, q); G.star(ctx, 0, 0, 60, { fill: '#FFD45A', seed: 850, rot: t }); ctx.restore(); }
  }
  // at the door: walk, knock, the door opens, sorry, uncle smiles
  function atDoor(ctx, t) {
    const open = clamp((t - ev.open) / 0.5);
    const smiling = t >= ev.smile + 0.6;
    const out = clamp((t - T(23, 1)) / 0.6); // uncle steps out of the doorway to put a hand on his shoulder
    const fm = mouthOf('fathy', t);
    const fathy = (c, x) => Ch.person(c, { x, y: GY, s: 0.95, pose: out > 0 && out < 1 ? 'walk' : 'stand', walk: out * 0.5, style: CAST.fathy, handL: out >= 1 ? [-160, -330] : undefined, gesture: out >= 1 ? null : 'akimbo', eyes: smiling ? 'happy' : 'normal', brows: smiling ? 'neutral' : 'up', look: -0.8, mouth: fm || (smiling ? 'smile' : 'flat'), blink: blinkAt(t, 4), seed: 950 });
    const fx = lerp(DX + 90, DX - 20, ease.inOutQuad(out));
    alley(ctx, t, { win: 'broken', doorOpen: open, inside: t >= ev.open && out <= 0 ? (c) => fathy(c, fx) : null });
    if (out > 0) fathy(ctx, fx);
    // Yasin walks up to the door
    const arrive = T(17, 3), x0 = 300, x1 = DX - 200;
    let x = x1, pose = 'stand', walk = 0;
    if (t < arrive) { const w = Ch.walk(t, { x0, speed: (x1 - x0) / (arrive - ev.door), t0: ev.door, stride: 300, s: 0.8 }); x = Math.min(x1, w.x); pose = 'walk'; walk = w.walk; }
    let handR;
    const kn = ev.knock.find((k) => t >= k - 0.1 && t < k + 0.12);
    if (t >= T(17, 3.5) && t < ev.open) handR = kn ? [(DX + 6 - x) / 0.8, -330] : [(DX - 40 - x) / 0.8, -345];
    const ym = mouthOf('yasin', t);
    const happy = t >= T(23, 2);
    Ch.person(ctx, { x, y: GY, s: 0.8, pose, walk, style: CAST.yasin, handR, eyes: happy ? 'happy' : 'normal', lookY: ym ? 0.4 : -0.3, look: 0.8, brows: happy ? 'neutral' : t >= ev.door ? 'worried' : 'neutral', mouth: ym || (happy ? 'grin' : 'wavy'), blush: happy ? 0.8 : 0, blink: blinkAt(t, 1), seed: 900 });
    // «طق طق طق»
    ev.knock.forEach((k, i) => { const p = pop(t, k, 0.15, 3); if (p > 0 && t < ev.open + 0.3) { ctx.save(); ctx.translate(DX + 100 + i * 60, 540 - i * 55); ctx.rotate(-0.15 + i * 0.12); ctx.scale(p, p); AR(ctx, 'طق!', 0, 0, { size: 64, color: '#E9483B', stroke: '#FFFFFF', strokeW: 10 }); ctx.restore(); } });
    if (smiling && out < 1) { const a = t - ev.smile - 0.6; G.star(ctx, DX + 150, 600, 22 + 8 * Math.sin(a * 8), { fill: '#FFF3A8', seed: 880, rot: a }); }
    if (happy) for (let k = 0; k < 5; k++) { const a = t - T(23, 2) - k * 0.4; if (a < 0) continue; G.heart(ctx, x - 120 + k * 30 + Math.sin(a * 3 + k) * 20, 470 - a * 90, 1.5, { fill: '#E95A78', seed: 890 + k }); }
  }
  // fixing the window together
  function fix(ctx, t) {
    ctx.fillStyle = '#E9A178'; ctx.fillRect(-W, -H, W * 3, H * 3);
    G.hatch(ctx, [-W, -H, W * 2, H * 2], { color: 'rgba(120,50,20,0.1)', gap: 14 });
    const glassIn = clamp((t - ev.fix) / (T(25, 2) - ev.fix));
    const done = t >= T(26);
    windowBox(ctx, 700, 230, 520, 470, done ? 'fixed' : 'broken', t, 1000, { fixT: T(26) + 2.4 });
    if (!done) { ctx.save(); ctx.globalAlpha = 0.8; G.rrect(ctx, 700, lerp(-500, 230, ease.outCubic(glassIn)), 520, 470, 4, { fill: '#BFE6F7', lw: 4, seed: 1010 }); ctx.restore(); }
    G.rrect(ctx, -60, 920, W + 120, 300, 0, { fill: '#D9C3A0', lw: 4, seed: 1020 });
    Ch.person(ctx, { x: 1480, y: 1040, s: 1.0, pose: 'stand', style: CAST.fathy, handL: [-240, -400], handR: [-200, -300], eyes: 'happy', look: -0.6, lookY: -0.5, mouth: mouthOf('fathy', t) || 'smile', seed: 950 });
    const tap = S.taps.reduce((a, k) => (t >= k - 0.15 && t < k + 0.15 ? 1 - Math.abs(t - k) / 0.15 : a), 0);
    const hx = 540, hy = 1040, hs = 0.95;
    const hand = [150, -470 - (1 - tap) * 60];
    Ch.person(ctx, { x: hx, y: hy, s: hs, pose: 'stand', style: CAST.yasin, handR: hand, eyes: 'normal', look: 0.8, lookY: -0.5, brows: 'determined', mouth: done ? 'grin' : 'smile', seed: 900 });
    ctx.save(); ctx.translate(hx + hand[0] * hs, hy + hand[1] * hs); ctx.rotate(-0.6 + tap * 0.9);
    G.rrect(ctx, -8, -10, 16, 120, 6, { fill: '#8A5A3B', lw: 3.5, seed: 1030 });
    G.rrect(ctx, -34, -40, 68, 36, 6, { fill: '#9AA3AD', lw: 3.5, seed: 1031 });
    ctx.restore();
    S.taps.forEach((k, i) => { if (t >= k && t < k + 0.3) { ctx.save(); ctx.globalAlpha = 1 - (t - k) / 0.3; AR(ctx, 'طُق', 640, 300 + (i % 3) * 130, { size: 50, color: INK }); ctx.restore(); } });
    if (done) { const p = pop(t, T(26), 0.3, 3); ctx.save(); ctx.translate(960, 150); ctx.scale(p, p); AR(ctx, 'زي الفُل!', 0, 0, { size: 90, color: '#2E8B57', stroke: '#FFFFFF', strokeW: 10 }); ctx.restore(); }
  }
  // playing together: a pass on every beat
  function play(ctx, t) {
    alley(ctx, t, { win: 'fixed', doorOpen: 1 });
    const ax = 640, bx = 1150, ps = S.passes;
    let bxp = ax + 40, byp = GY - 26;
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i], b = i + 1 < ps.length ? ps[i + 1] : ev.moral;
      if (t >= a && t < b) { const u = (t - a) / (b - a); const from = i % 2 ? bx - 40 : ax + 40, to = i % 2 ? ax + 40 : bx - 40; bxp = lerp(from, to, u); byp = GY - 26 - 120 * 4 * u * (1 - u); }
    }
    const near = (k) => ps.some((p, i) => i % 2 === k && Math.abs(t - p) < 0.2);
    Ch.cat(ctx, { x: 230, y: GY - 170, s: 0.8, t, look: clamp((bxp - 230) / 500, -1, 1), happy: 1, seed: 740, shadow: false });
    Ch.person(ctx, { x: ax, y: GY, s: 0.8, pose: near(0) ? 'walk' : 'stand', walk: near(0) ? 0.75 : 0, style: CAST.yasin, eyes: 'happy', mouth: 'grin', look: 0.6, seed: 900 });
    Ch.person(ctx, { x: bx, y: GY, s: 0.95, pose: near(1) ? 'walk' : 'stand', walk: near(1) ? 0.25 : 0, style: CAST.fathy, eyes: 'happy', mouth: 'grin', look: -0.6, seed: 950 });
    ball(ctx, bxp, byp, 24, t * 8);
  }
  // the moral card
  function moral(ctx, t) {
    ctx.fillStyle = '#FFF6E0'; ctx.fillRect(-W, -H, W * 3, H * 3);
    G.hatch(ctx, [-W, -H, W * 2, H * 2], { color: 'rgba(200,150,60,0.08)', gap: 18 });
    G.rrect(ctx, 120, 70, W - 240, H - 210, 40, { fill: null, lw: 8, seed: 1100, color: '#F2B84B' });
    for (let k = 0; k < 8; k++) G.star(ctx, 160 + (k % 4) * ((W - 320) / 3), k < 4 ? 110 : H - 180, 22, { fill: '#F2B84B', seed: 1110 + k, rot: t * 0.5 + k });
    const lines = [['الشاطر مش اللي', '#2B4C7E', 250], ['ما بيغلطش...', '#2B4C7E', 400], ['الشاطر اللي', '#E9483B', 580], ['يعترف بغلطه!', '#E9483B', 740]];
    lines.forEach(([txt, col, y], i) => {
      const st = S.moralStamps[i];
      if (t < st) return;
      const p = ease.outBack(clamp((t - st) / 0.18), 3);
      ctx.save(); ctx.translate(960, y); ctx.scale(lerp(1.6, 1, p), lerp(1.6, 1, p)); ctx.globalAlpha = 1;
      AR(ctx, txt, 0, 0, { size: 120, color: col, stroke: '#FFFFFF', strokeW: 10 });
      ctx.restore();
    });
    Ch.person(ctx, { x: 270, y: 1010, s: 0.62, pose: 'stand', style: CAST.yasin, gesture: t >= S.moralStamps[3] ? 'thumbsUp' : null, eyes: 'happy', mouth: 'grin', seed: 900 });
    Ch.person(ctx, { x: 1650, y: 1010, s: 0.72, pose: 'stand', style: CAST.fathy, gesture: t >= S.moralStamps[3] ? 'thumbsUp' : null, eyes: 'happy', mouth: 'smile', seed: 950 });
  }

  const ramp = (s, d) => ease.inOutQuad(clamp((s.t - s.t0) / d));
  const film = Shots.film([
    { at: 0, draw: title, cam: Shots.push(1, 1.04) },
    { at: ev.street, draw: street, in: { type: 'iris', dur: 0.8 }, cam: Shots.push(1, 1.1) },
    { at: ev.kick, draw: kick, in: 'cut', cam: Shots.shake(24, ev.kick, 6) },
    { at: T(9, 1.5), draw: flight, in: 'cut', cam: (s) => { const z = ramp(s, 1.2), sh = Shots.shake(22, ev.crash, 5)(s); return { zoom: 1 + 0.25 * z, x: 330 * z + sh.x, y: 60 * z + sh.y, rot: sh.rot }; } },
    { at: T(11), draw: shock, in: 'cut', cam: Shots.push(1, 1.06) },
    { at: ev.hide, draw: hide, in: 'whip', cam: Shots.push(1, 1.04) },
    { at: ev.think, draw: think, in: { type: 'dip', dur: 0.5, color: '#FFFFFF' }, cam: Shots.push(1, 1.05) },
    { at: ev.door, draw: atDoor, in: 'whip', cam: (s) => { const z = s.t > ev.open ? ease.inOutQuad(clamp((s.t - ev.open) / 1.2)) : 0; return { zoom: 1 + 0.45 * z, x: 500 * z, y: 170 * z }; } },
    { at: ev.smile, draw: atDoor, in: 'cut', cam: (s) => { const z = ramp(s, 2); return { zoom: lerp(1.5, 1.75, z), x: lerp(480, 440, z), y: lerp(170, 150, z) }; } },
    { at: ev.fix, draw: fix, in: 'whip' },
    { at: ev.play, draw: play, in: 'push', cam: Shots.push(1, 1.05) },
    { at: ev.moral, draw: moral, in: { type: 'iris', dur: 0.8 } },
    { at: ev.end, draw: endCard, in: 'paper', cam: Shots.push(1, 1.03) },
  ]);

  // captions: each voice line split into chunks of up to 6 words (skipped where the words are on screen)
  function buildSubs(vo) {
    const out = [];
    vo.lines.forEach((l, li) => {
      if (['title', 'hide', 'moral', 'tota'].includes(S.vo[li] && S.vo[li].id)) return;
      const ws = l.words; if (!ws.length) return;
      const n = Math.ceil(ws.length / 6), per = Math.ceil(ws.length / n);
      for (let k = 0; k * per < ws.length; k++) {
        const g = ws.slice(k * per, (k + 1) * per);
        const next = ws[(k + 1) * per];
        out.push({ t: g[0].t - 0.05, end: next ? next.t - 0.05 : l.end + 0.2, text: g.map((w) => w.w).join(' ') });
      }
    });
    return out;
  }
  function drawSubs(ctx, t) {
    const c = SUBS.find((s) => t >= s.t && t < s.end);
    if (!c) return;
    const size = 54, w = G.measure(ctx, c.text, size, 'Noto Naskh Arabic', 700, 'ar') + 70, y = SAFE.y + SAFE.h - 40;
    const a = clamp((t - c.t) / 0.12) * clamp((c.end - t) / 0.12);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(25,20,35,0.62)';
    const h = size * 1.6;
    ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, y - h * 0.72, w, h, 22); ctx.fill();
    AR(ctx, c.text, W / 2, y, { size, color: '#FFFFFF', boil: 0 });
    ctx.restore();
  }

  Studio.film({
    post: { vignette: 0.18, grain: 0.04, paper: 0.35 },
    fadeOut: 0.8,
    async init() {
      VO = await Studio.loadJSON('out/voice.json');
      SUBS = buildSubs(VO);
    },
    draw(ctx, t) {
      film(ctx, t);
      drawSubs(ctx, t);
    },
  });
})();
