// ep02 · Yasin and the Sandwich. Scenes in the school yard; the stick cast from lib/toolkit.js.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, LEO, yard, ground, sandwich, holdSandwich, word, pop, ramp, io, clamp, lerp, heart, star, talking, blinkAt, beatPh, laughPose, laughShake, hookText, titleScene, moralScene, endingScene, push, hold, look, bumps, Cmb, run, W, H, TAU } = K;
  const GY = 1430, YX = 300, LX = 760;
  const yasin = (t, o = {}) => ({ ...YASIN, x: YX, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const leo = (t, o = {}) => ({ ...LEO, x: LX, gy: GY, s: 0.62, blink: blinkAt(t, 5), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  function bench(c, x) { c.beginPath(); c.roundRect(x - 200, GY - 150, 400, 34, 10); c.fillStyle = '#C98F5E'; c.fill(); K.stroke(c, 7); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * 170, GY - 116); c.lineTo(x + sd * 170, GY); K.stroke(c, 12); } }
  function lunchbox(c, x, y, open) { c.beginPath(); c.roundRect(x - 70, y - 70, 140, 70, 12); c.fillStyle = '#FF8FB8'; c.fill(); K.stroke(c, 6); c.save(); c.translate(x - 70, y - 70); c.rotate(open ? -1.9 : 0); c.beginPath(); c.roundRect(0, -24, 140, 24, 10); c.fillStyle = '#F06292'; c.fill(); K.stroke(c, 6); c.restore(); if (open) { c.beginPath(); c.roundRect(x - 58, y - 62, 116, 54, 8); c.fillStyle = '#5A3A4A'; c.fill(); } }
  // 1 · hook: Yasin hugs his sandwich, a big question pops
  function hook(c, t) {
    yard(c, t);
    stick(c, yasin(t, { x: W / 2 - 40, gy: 2100, s: 1.15, eyes: 'happy', mouth: 'grin', hands: [[-60, -330], [60, -330]], elbows: [70, 70], holds: [null, holdSandwich(0, 0.05)] }), t);
    for (let k = 0; k < 5; k++) { const a = t * 2 + k * 1.3; star(c, W / 2 - 40 + Math.cos(a) * 260, 1350 + Math.sin(a) * 80, 16 + 6 * Math.sin(a * 3), '#FFF6B0', a); }
    hookText(c, t, [['WOULD YOU SHARE', '#FFFFFF'], ['YOUR SANDWICH?', '#FFD23F']]);
  }
  // 3 · lunchtime: yum!
  function lunch(c, t) {
    yard(c, t); bench(c, 640);
    const yum = t >= ev.yum, bite = yum ? Math.sin(clamp((t - ev.yum) / 0.35) * Math.PI) : 0;
    stick(c, yasin(t, { x: 420, eyes: yum ? 'happy' : 'dot', look: [0.4, -0.6], mouth: yum ? 'grin' : 'smile', bob: 10 * Math.sin(Math.PI * beatPh(t)), hands: [[-150, -80], [lerp(120, 60, bite), lerp(-300, -470, bite)]], elbows: [50, 50], holds: [null, holdSandwich()] }), t);
    if (yum) word(c, 'YUM!', 720, 560, 140, '#FFD23F', { scale: pop(t, ev.yum, 0.25, 3.5), rot: 0.1 });
    for (let k = 0; k < 6; k++) { const a = ((t * 0.5 + k / 6) % 1); c.save(); c.globalAlpha = Math.sin(a * Math.PI); heart(c, 300 + k * 60, 900 - a * 300, 1 + (k % 2) * 0.4); c.restore(); }
  }
  // 4–5 · Leo alone, with an empty lunch box
  function leoAlone(c, t) {
    yard(c, t); bench(c, 640);
    lunchbox(c, 560, GY - 150, true);
    const m = talk('leo', t, { mouth: 'sad' });
    stick(c, leo(t, { x: 760, eyes: 'dot', look: [-0.6, 0.6], brows: -0.9, browUp: 0.5, ...m, hands: [[-120, -40], [120, -40]], elbows: [60, 60], lean: 0.05, tilt: 0.1 }), t);
    if (t >= ev.sad) { const a = t - ev.sad; for (let k = 0; k < 3; k++) word(c, '?', 480 + k * 60, 1170 - k * 30 - a * 30, 60, '#FFFFFF', { scale: pop(t, ev.sad + k * 0.12, 0.25, 3) }); }
    stick(c, yasin(t, { x: 150, eyes: 'dot', look: [1, 0], brows: -0.3, mouth: 'flat', hands: [[-150, -80], [120, -300]], elbows: [50, 50], holds: [null, holdSandwich()] }), t);
  }
  // 6 · "but it's MY sandwich..."
  function mine(c, t) {
    yard(c, t);
    const m = talk('yasin', t, { mouth: 'frown' });
    stick(c, yasin(t, { x: W / 2 - 40, gy: 2050, s: 1.05, eyes: 'dot', look: [-0.5, 0], brows: 0.7, ...m, hands: [[-40, -300], [80, -330]], elbows: [70, 70], lean: -0.05, holds: [null, holdSandwich(0, -0.1)] }), t);
  }
  // 7 · sandwich... Leo... sandwich: his eyes dart, the camera follows
  function glance(c, t) {
    yard(c, t); bench(c, 640); lunchbox(c, 560, GY - 150, true);
    const g = ev.glances, n = g.filter((x) => t >= x).length, dir = n % 2 ? 1 : -1;
    stick(c, leo(t, { eyes: 'big' === 'x' ? 'dot' : 'dot', look: [-0.8, 0.2], brows: -0.7, mouth: 'sad', hands: [[-120, -40], [120, -40]], elbows: [60, 60] }), t);
    stick(c, yasin(t, { eyes: 'wide', look: [dir, dir < 0 ? 0.6 : 0], brows: -0.4, browUp: 0.6, mouth: 'wavy', sweat: 1, hands: [[-150, -80], [-60, -330]], elbows: [50, 80], holds: [null, holdSandwich()] , tilt: 0.12 * dir }), t);
    g.forEach((x, i) => { const a = t - x; if (a > 0 && a < 0.35) word(c, i % 2 ? 'LEO...' : 'SANDWICH...', i % 2 ? 760 : 300, 700, 64, '#FFFFFF', { scale: pop(t, x, 0.2, 3) }); });
  }
  // 8 · he splits it: a stretchy cheese string between the halves
  function share(c, t) {
    yard(c, t); bench(c, 640);
    const split = clamp((t - ev.split) / 0.6), gave = ramp(t, ev.split + 0.9, 0.6);
    const m = talk('yasin', t, { mouth: 'grin' });
    const yo = yasin(t, { x: 360, eyes: 'happy', ...m, hands: [[lerp(40, -80, io(split)), -330], [lerp(80, 260 + 120 * gave, io(split)), -330]], elbows: [60, 40] });
    const r = stick(c, yo, t);
    stick(c, leo(t, { x: 780, eyes: t > ev.split ? 'wide' : 'dot', look: [-0.8, 0], mouth: t > ev.split ? 'o' : 'sad', hands: [[-150 - 120 * gave, -300], [120, -40]], elbows: [30, 60] }), t);
    const hL = r.P(yo.hands[0]), hR = r.P(yo.hands[1]);
    if (split < 0.02) sandwich(c, (hL[0] + hR[0]) / 2, hL[1] - 30, 0.95);
    else { sandwich(c, hL[0], hL[1] - 30, 0.9, -0.2, 1); sandwich(c, hR[0], hR[1] - 30, 0.9, 0.2, 1);
      if (split < 1 || gave < 0.5) { c.beginPath(); c.moveTo(hL[0] + 30, hL[1] - 34); c.quadraticCurveTo((hL[0] + hR[0]) / 2, hL[1] + 10 + 30 * split, hR[0] - 30, hR[1] - 34); K.stroke(c, 10); c.beginPath(); c.moveTo(hL[0] + 30, hL[1] - 34); c.quadraticCurveTo((hL[0] + hR[0]) / 2, hL[1] + 10 + 30 * split, hR[0] - 30, hR[1] - 34); K.stroke(c, 6, '#FFD23F'); } }
    if (t >= ev.split) word(c, 'HALF FOR YOU!', W / 2 - 40, 520, 76, '#FFD23F', { scale: pop(t, ev.split, 0.25, 3), rot: -0.05 });
  }
  // 9–10 · thank you, and two new friends eating side by side
  function friends(c, t) {
    yard(c, t); bench(c, 520);
    const laugh = t >= S.laughs[0][0], bite = (who, ph) => Math.max(0, Math.sin(t * 3 + ph));
    const yo = laugh ? laughPose(t, yasin(t, { x: 300, lean: -0.15, feet: [[-75, 0], [70, 0]] }), 0, S.laughs[0][0]) : yasin(t, { x: 300, eyes: 'happy', mouth: bite('y', 0) > 0.8 ? 'o' : 'grin', hands: [[-150, -80], [100, -380 - 60 * bite('y', 0)]], elbows: [50, 40], holds: [null, (c2, hd) => sandwich(c2, hd[0], hd[1] - 20, 0.85, 0.2, 1)] });
    const lm = talk('leo', t, { mouth: bite('l', 1.5) > 0.8 ? 'o' : 'grin' });
    const lo = laugh ? laughPose(t, leo(t, { x: 740, lean: 0.1, feet: [[-70, 0], [80, 0]] }), 1.7, S.laughs[0][0]) : leo(t, { x: 740, eyes: 'happy', ...lm, hands: [[-100, -380 - 60 * bite('l', 1.5)], [150, -80]], elbows: [40, 50], holds: [(c2, hd) => sandwich(c2, hd[0], hd[1] - 20, 0.85, -0.2, 1), null] });
    stick(c, yo, t); stick(c, lo, t);
    if (laugh) { laughShake(c, yo, t, 0); laughShake(c, lo, t, 1.7); }
    for (const t0 of [ev.love, ev.friends]) { const a = t - t0; if (a > 0 && a < 1.8) for (let k = 0; k < 8; k++) { const ang = -Math.PI / 2 + (k / 7 - 0.5) * 2.4, e = io(clamp(a / 0.7)); c.save(); c.globalAlpha = clamp((1.8 - a) / 0.5); heart(c, 520 + Math.cos(ang) * 300 * e, 760 + Math.sin(ang) * 230 * e - a * 50, 1.4 * pop(t, t0 + k * 0.04, 0.3, 3)); c.restore(); } }
    if (t >= ev.friends) word(c, 'NEW FRIENDS!', W / 2 - 40, 400, 84, '#FF5A4E', { scale: pop(t, ev.friends, 0.3, 3), rot: -0.05 });
  }
  run([
    { at: 0, draw: hook, cam: Cmb(push(1.08, 1.0), bumps([0.15, 0.4], 0.04)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'yasin'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.lunch.t - 0.2, draw: lunch, in: 'whip', cam: Cmb(push(1, 1.08, -60, 60), bumps([ev.yum], 0.05)) },
    { at: L.sees.t, draw: leoAlone, in: 'push', cam: push(1.05, 1.15, 120, 120) },
    { at: L.forgot.t, draw: leoAlone, in: 'cut', cam: hold(1.7, 1.8, 760 - W / 2, 840 - H / 2) },
    { at: L.mine.t, draw: mine, in: 'cut', cam: push(1, 1.06) },
    { at: L.looks.t, draw: glance, in: 'whip', cam: Cmb((s) => { const g = ev.glances, n = g.filter((x) => s.t >= x).length, k = io(clamp((s.t - (g[n - 1] || s.t0)) / 0.35)); const from = n === 0 ? 0 : (n % 2 ? -120 : 120), to = n % 2 ? 120 : -120; return { zoom: 1.25, x: n ? lerp(from, to, k) : 0, y: 100 }; }) },
    { at: L.share.t, draw: share, in: 'cut', cam: Cmb(push(1.1, 1.2, 60, 140), bumps([ev.split], 0.06)) },
    { at: L.thanks.t, draw: friends, in: 'cut', cam: Cmb(push(1.15, 1.05, 0, 120), bumps([ev.love, ev.friends, S.laughs[0][0]], 0.04)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
