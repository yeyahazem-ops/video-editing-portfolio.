// THE CAST — frog, duck and bee built from the engine's hand-drawn primitives; cat and puppy are the engine's own.
// Every animal: origin at the feet, about 200 units tall at s = 1.
//   Animals.draw(ctx, 'frog', { x, y, s, sx, sy, rot, eyes: 'open'|'happy'|'sleepy'|'closed', mouth: 0..1, look: -1..1, flap: 0..1, float, t })
(function () {
  const G = globalThis.G, Ch = globalThis.Ch;
  const INK = '#2A2320';

  function eye(ctx, x, y, r, mode, look, seed, lid) {
    if (mode === 'closed' || mode === 'happy') {
      const d = mode === 'happy' ? -1 : 1; // ^ ^ when happy, ‿ when asleep
      G.line(ctx, [[x - r * 0.75, y], [x, y + d * r * 0.5], [x + r * 0.75, y]], { lw: 5, seed, step: 8 });
      return;
    }
    G.ellipse(ctx, x, y, r, r, { fill: '#FFFFFF', lw: 3.5, seed });
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + look * r * 0.3, y + (mode === 'sleepy' ? r * 0.25 : 0), r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + look * r * 0.3 - r * 0.16, y - r * 0.18, r * 0.16, 0, Math.PI * 2); ctx.fill();
    if (mode === 'sleepy') { // a heavy eyelid
      ctx.save(); ctx.beginPath(); ctx.rect(x - r - 4, y - r - 4, 2 * r + 8, r + 2); ctx.clip();
      G.ellipse(ctx, x, y, r + 1, r + 1, { fill: lid, lw: 3.5, seed: seed + 1 }); ctx.restore();
      G.line(ctx, [[x - r, y - 2], [x + r, y - 2]], { lw: 4, seed: seed + 2, step: 10 });
    }
  }
  function mouth(ctx, x, y, w, open, seed, tongue = true) {
    if (open > 0.08) {
      G.ellipse(ctx, x, y + open * 8, w * 0.6, 5 + open * w * 0.42, { fill: '#5A1F2A', lw: 4, seed });
      if (tongue) G.ellipse(ctx, x, y + open * (8 + w * 0.22), w * 0.3, 3 + open * w * 0.14, { fill: '#F2788F', lw: 0, seed: seed + 1 });
    } else G.line(ctx, [[x - w, y - 6], [x - w * 0.5, y + 8], [x, y + 12], [x + w * 0.5, y + 8], [x + w, y - 6]], { lw: 5, seed, step: 10 });
  }
  const blush = (ctx, x, y, r) => { ctx.fillStyle = 'rgba(255,120,140,0.45)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); };

  function frog(ctx, o) {
    const c = '#5DBB4A', d = '#3F9A35', seed = 300;
    for (const sd of [-1, 1]) { // back legs
      G.ellipse(ctx, sd * 90, -36, 48, 32, { fill: d, lw: 4.5, seed: seed + sd });
      G.ellipse(ctx, sd * 108, -8, 42, 12, { fill: c, lw: 4, seed: seed + 3 + sd });
    }
    G.ellipse(ctx, 0, -82, 100, 82, { fill: c, lw: 5, seed: seed + 6, hatch: { color: 'rgba(0,60,0,0.12)', gap: 10 } });
    G.ellipse(ctx, 0, -60, 62, 50, { fill: '#D6F2A8', lw: 0, seed: seed + 7 });
    for (const sd of [-1, 1]) { // front legs
      G.limb(ctx, [[sd * 42, -56], [sd * 48, -8]], { color: c, lw: 18, seed: seed + 8 + sd });
      G.ellipse(ctx, sd * 50, -6, 24, 9, { fill: c, lw: 4, seed: seed + 11 + sd });
    }
    for (const sd of [-1, 1]) { // eyes sit on top of the head
      G.ellipse(ctx, sd * 50, -156, 37, 37, { fill: c, lw: 5, seed: seed + 14 + sd });
      eye(ctx, sd * 50, -158, 25, o.eyes, o.look, seed + 17 + sd, c);
    }
    blush(ctx, -72, -100, 16); blush(ctx, 72, -100, 16);
    mouth(ctx, 0, -104, 50, o.mouth, seed + 20);
  }

  function duck(ctx, o) {
    const c = '#FFD23F', d = '#F2B41F', or = '#FF8A2A', seed = 340;
    const flap = o.flap || 0, f = Math.sin(o.t * 26) * flap;
    if (!o.float) for (const sd of [-1, 1]) G.ellipse(ctx, sd * 34, -6, 28, 10, { fill: or, lw: 4, seed: seed + sd });
    for (const sd of [-1, 1]) { // wings
      ctx.save(); ctx.translate(sd * 84, -110); ctx.rotate(sd * -(0.25 + flap * 0.9 + f * 0.5));
      G.ellipse(ctx, 0, 34, 28, 50, { fill: d, lw: 4.5, seed: seed + 3 + sd }); ctx.restore();
    }
    G.ellipse(ctx, 0, -78, 96, 74, { fill: c, lw: 5, seed: seed + 6, hatch: { color: 'rgba(150,90,0,0.1)', gap: 10 } });
    if (o.float) { // sitting in the water
      G.ellipse(ctx, 0, -8, 150, 26, { fill: o.water || '#4FB3D9', lw: 0, seed: seed + 7 });
      for (const k of [0, 1]) G.line(ctx, [[-130 + k * 30, -14 + k * 14], [0, -22 + k * 16], [130 - k * 30, -14 + k * 14]], { color: 'rgba(255,255,255,0.8)', lw: 4, seed: seed + 8 + k });
    }
    for (const k of [-1, 0, 1]) G.line(ctx, [[k * 6, -236], [k * 16, -262 - (k === 0 ? 8 : 0)]], { color: d, lw: 6, seed: seed + 10 + k, step: 8 }); // a tuft
    G.ellipse(ctx, 0, -180, 64, 60, { fill: c, lw: 5, seed: seed + 13 });
    for (const sd of [-1, 1]) eye(ctx, sd * 28, -194, 15, o.eyes, o.look, seed + 14 + sd, c);
    blush(ctx, -46, -168, 13); blush(ctx, 46, -168, 13);
    if (o.mouth > 0.08) G.ellipse(ctx, 0, -158 + o.mouth * 12, 26, 8 + o.mouth * 10, { fill: '#C9601A', lw: 4, seed: seed + 18 });
    G.ellipse(ctx, 0, -168, 36, 14, { fill: or, lw: 4.5, seed: seed + 19 });
  }

  function bee(ctx, o) {
    const c = '#FFC233', seed = 380;
    const f = Math.sin(o.t * 44) * (o.flap ?? 1);
    for (const sd of [-1, 1]) { // wings
      ctx.save(); ctx.translate(sd * 46, -150); ctx.rotate(sd * (0.55 + f * 0.35));
      G.ellipse(ctx, 0, -50, 36, 60, { fill: 'rgba(214,240,255,0.9)', lw: 4, seed: seed + sd }); ctx.restore();
    }
    for (const sd of [-1, 1]) { // antennae
      G.line(ctx, [[sd * 26, -164], [sd * 36, -196], [sd * 50, -212]], { lw: 5, seed: seed + 3 + sd, step: 10 });
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sd * 50, -212, 9, 0, Math.PI * 2); ctx.fill();
    }
    G.poly(ctx, [[-12, -18], [12, -18], [0, 6]], { fill: INK, lw: 3, seed: seed + 6, step: 8 }); // stinger
    const body = G.ellipse(ctx, 0, -92, 88, 80, { fill: c, lw: 5, seed: seed + 7 });
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -92, 86, 78, 0, 0, Math.PI * 2); ctx.clip(); // stripes
    ctx.fillStyle = '#3A2E2A'; ctx.fillRect(-100, -70, 200, 20); ctx.fillRect(-100, -36, 200, 20);
    ctx.restore();
    G.ellipse(ctx, 0, -92, 88, 80, { lw: 5, seed: seed + 7 });
    for (const sd of [-1, 1]) eye(ctx, sd * 30, -126, 17, o.eyes, o.look, seed + 9 + sd, c);
    blush(ctx, -56, -104, 13); blush(ctx, 56, -104, 13);
    mouth(ctx, 0, -100, 22, o.mouth, seed + 12, false);
    return body;
  }

  const DRAW = {
    frog, duck, bee,
    cat: (ctx, o) => Ch.cat(ctx, { x: 0, y: 0, s: 1.25, color: '#F29A4A', t: o.t, look: o.look * 0.8, happy: 1, meow: o.mouth, shadow: false }),
    pup: (ctx, o) => Ch.dog(ctx, { x: 0, y: 0, s: 1.15, color: '#C98A4B', t: o.t, look: o.look * 0.8, happy: o.wag ?? 0.7, bark: o.mouth, shadow: false }),
  };

  function draw(ctx, id, o) {
    const p = { s: 1, sx: 1, sy: 1, rot: 0, eyes: 'open', mouth: 0, look: 0, t: G.t, shadow: true, ...o };
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.shadow) { ctx.fillStyle = 'rgba(20,20,40,0.18)'; ctx.beginPath(); ctx.ellipse(0, (p.ground ?? 0) + 4, 110 * p.s, 14 * p.s, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.rotate(p.rot);
    ctx.scale(p.s * p.sx, p.s * p.sy);
    DRAW[id](ctx, p);
    ctx.restore();
  }

  globalThis.Animals = { draw, eye, ids: Object.keys(DRAW) };
})();
