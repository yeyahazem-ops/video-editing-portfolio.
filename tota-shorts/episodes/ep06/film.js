// ep06 · The Dripping Tap. The tap runs, Uncle Fathy notices, Yasin turns it off and waters the thirsty flower.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, FATHY, bathroom, room, sink, flowerPot, holdCup, word, pop, ramp, io, clamp, lerp, heart, talking, blinkAt, laughPose, laughShake, hookText, titleScene, moralScene, endingScene, push, hold, bumps, Cmb, run, W, H } = K;
  const GY = 1430;
  const yasin = (t, o = {}) => ({ ...YASIN, x: 260, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const fathy = (t, o = {}) => ({ ...FATHY, x: 760, gy: GY, s: 0.62, blink: blinkAt(t, 4), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  const flowing = (t) => (t >= ev.run && t < ev.off ? 1 : 0);
  function drips(c, t, x, y) { ev.drips.forEach((d) => { const a = t - d; if (a >= 0 && a < 0.6) { c.beginPath(); c.arc(x, y + a * a * 1600, 12, 0, Math.PI * 2); c.fillStyle = '#7FD3F7'; c.fill(); K.stroke(c, 4, '#3C7FA6'); if (a > 0.3) word(c, 'DRIP!', x + 140, y + 160, 54, '#FFFFFF', { scale: pop(t, d + 0.3, 0.15, 3) }); } }); }
  function hook(c, t) { bathroom(c); sink(c, 480, 980, 0, t); drips(c, t, 573, 860); hookText(c, t, [['DRIP... DRIP...', '#FFFFFF'], ["WHAT'S THAT?", '#FFD23F']]); }
  function brushing(c, t) {
    bathroom(c); const f = flowing(t), tap = sink(c, 560, 980, f, t);
    c.beginPath(); c.roundRect(380, 420, 360, 300, 20); c.fillStyle = '#BFE6F7'; c.fill(); K.stroke(c, 8);
    const done = t >= ev.run, walk = ramp(t, ev.run + 0.2, 1.2);
    stick(c, yasin(t, { x: lerp(330, 120, walk), eyes: done ? 'happy' : 'dot', mouth: done ? 'grin' : 'o', hands: done ? [[-150, -80], [150, -80]] : [[-150, -80], [120, -420 + 20 * Math.sin(t * 18)]], elbows: [50, 30], holds: [null, done ? null : (c2, hd) => { c2.save(); c2.translate(...hd); c2.rotate(-1.2); c2.beginPath(); c2.roundRect(-6, -10, 12, 80, 6); c2.fillStyle = '#4FC3F7'; c2.fill(); K.stroke(c2, 4); c2.beginPath(); c2.roundRect(-10, -26, 20, 20, 4); c2.fillStyle = '#fff'; c2.fill(); K.stroke(c2, 4); c2.restore(); }] }), t);
    if (!done) for (let k = 0; k < 4; k++) { const a = ((t * 1.5 + k / 4) % 1); c.save(); c.globalAlpha = 1 - a; c.beginPath(); c.arc(390 + Math.sin(k * 2) * 30, 640 - a * 80, 10, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); K.stroke(c, 3); c.restore(); }
    if (f) { const a = t - ev.run; word(c, 'SPLASH!', 820, 760, 64, '#7FD3F7', { scale: a < 0.6 ? pop(t, ev.run, 0.2, 3) : 1, rot: 0.08 }); }
  }
  // the water keeps running: a counter of wasted drops climbs
  function waste(c, t) {
    bathroom(c); sink(c, 540, 980, flowing(t), t);
    const n = Math.floor(Math.max(0, t - L.waste.t) * 30);
    word(c, `${n} DROPS!`, W / 2 - 40, 520, 96, '#FF5A4E', { scale: pop(t, L.waste.t + 0.2, 0.25, 3) });
    for (let k = 0; k < 10; k++) { const a = ((t * 1.3 + k / 10) % 1); c.save(); c.globalAlpha = 1 - a; c.beginPath(); c.arc(633 + Math.sin(k * 7) * 80 * a, 1060 + a * 200, 9, 0, Math.PI * 2); c.fillStyle = '#7FD3F7'; c.fill(); c.restore(); }
  }
  // Uncle Fathy at the door, Yasin runs back and turns it off
  function precious(c, t) {
    bathroom(c); const f = flowing(t); sink(c, 420, 980, f, t);
    const fm = talk('fathy', t, { mouth: t >= ev.off ? 'grin' : 'flat' }), ym = talk('yasin', t, { mouth: t >= ev.off ? 'grin' : 'o' });
    stick(c, fathy(t, { x: 830, eyes: t >= ev.off ? 'happy' : 'dot', look: [-1, 0], brows: t >= ev.off ? -0.2 : 0.8, ...fm, hands: t < L.oops.t ? [[-260, -380], [140, -60]] : [[-150, -60], [150, -60]], elbows: [20, 60] }), t);
    const reach = ramp(t, ev.off - 0.4, 0.3);
    stick(c, yasin(t, { x: 260, eyes: t >= ev.off ? 'happy' : 'wide', brows: t >= ev.off ? 0 : -0.8, browUp: 0.8, ...ym, sweat: t < ev.off ? 1 : 0, hands: [[-150, -80], [lerp(150, 230, reach), lerp(-80, -560, reach)]], elbows: [50, 30] }), t);
    if (t >= ev.off && t < ev.off + 0.6) word(c, 'OFF!', 420, 700, 90, '#7ED957', { scale: pop(t, ev.off, 0.2, 3.5) });
  }
  // the thirsty flower drinks and smiles
  function flower(c, t) {
    room(c, t, { wall: '#FFF1D6', wx: 560, wy: 300 });
    c.beginPath(); c.roundRect(560, GY - 300, 380, 300, 14); c.fillStyle = '#C98F5E'; c.fill(); K.stroke(c, 7);
    const drink = ramp(t, ev.pour + 0.3, 1.0), laugh = t >= S.laughs[0][0];
    flowerPot(c, 750, GY - 340, 1, 1 - drink, t);
    const pour = ramp(t, ev.pour - 0.4, 0.4) * (1 - ramp(t, ev.pour + 1.2, 0.4));
    const yo = laugh ? laughPose(t, yasin(t, { x: 300, lean: -0.15, feet: [[-75, 0], [70, 0]] }), 0, S.laughs[0][0]) : yasin(t, { x: 300, eyes: drink > 0.5 ? 'happy' : 'dot', look: [1, -0.5], mouth: 'grin', hands: [[-150, -80], [lerp(150, 330, pour), lerp(-80, -520, pour)]], elbows: [50, 30], holds: [null, pour > 0.1 ? (c2, hd) => { c2.save(); c2.translate(...hd); c2.rotate(pour * 1.8); holdCup(c2, [0, 0]); c2.restore(); } : null] });
    stick(c, yo, t); if (laugh) laughShake(c, yo, t, 0);
    if (pour > 0.6) for (let k = 0; k < 6; k++) { const a = ((t * 2 + k / 6) % 1); c.beginPath(); c.arc(700 + a * 30, 800 + a * 300, 9, 0, Math.PI * 2); c.fillStyle = '#7FD3F7'; c.fill(); }
    if (t >= ev.bloom) word(c, 'THANK YOU!', 760, 560, 60, '#FF6FA5', { scale: pop(t, ev.bloom, 0.25, 3), rot: 0.06 });
    const a = t - ev.love; if (a > 0 && a < 1.6) for (let k = 0; k < 6; k++) { const ang = -Math.PI / 2 + (k / 5 - 0.5) * 2.2, e = io(clamp(a / 0.6)); c.save(); c.globalAlpha = clamp((1.6 - a) / 0.5); heart(c, 750 + Math.cos(ang) * 220 * e, 760 + Math.sin(ang) * 160 * e - a * 40, 1.2 * pop(t, ev.love + k * 0.04, 0.3, 3)); c.restore(); }
  }
  run([
    { at: 0, draw: hook, cam: Cmb(hold(1.6, 1.45, 560 - W / 2, 900 - H / 2), bumps(ev.drips, 0.03)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'yasin'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.left.t - 0.2, draw: brushing, in: 'whip', cam: Cmb(push(1.05, 1.1, 0, 60), bumps([ev.run], 0.05)) },
    { at: L.waste.t, draw: waste, in: 'cut', cam: hold(1.3, 1.5, 600 - W / 2, 1020 - H / 2) },
    { at: L.precious.t - 0.1, draw: precious, in: 'whip', cam: Cmb(push(1.05, 1.12, 0, 80), bumps([ev.off], 0.06)) },
    { at: L.plant.t, draw: flower, in: 'push', cam: Cmb(push(1.05, 1.12, 120, 60), bumps([ev.bloom, S.laughs[0][0]], 0.05)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
