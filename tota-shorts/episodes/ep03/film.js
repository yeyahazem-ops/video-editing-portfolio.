// ep03 · Laila and the Shadow. Bedtime, a monster shadow, a flashlight... it's Mishmish the cat.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, LAILA, room, bed, cat, flashlightBeam, holdFlashlight, word, pop, ramp, io, clamp, lerp, heart, talking, blinkAt, laughPose, laughShake, hookText, titleScene, moralScene, endingScene, push, hold, bumps, Cmb, run, W, H } = K;
  const GY = 1430;
  const laila = (t, o = {}) => ({ ...LAILA, x: 330, gy: GY, s: 0.5, blink: blinkAt(t, 4), ...o });
  const yasin = (t, o = {}) => ({ ...YASIN, x: 700, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  // the monster: the cat's shadow, huge, with glowing eyes and wobbly claws
  function monster(c, t, k = 1) {
    if (k <= 0) return; c.save(); c.globalAlpha = 0.85 * k; c.fillStyle = '#0E1030'; const wob = Math.sin(t * 2) * 10;
    c.beginPath(); c.ellipse(560, 640 + wob, 300, 260, 0, 0, Math.PI * 2); c.fill();
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(560 + sd * 150, 480 + wob); c.lineTo(560 + sd * 260, 260 + wob); c.lineTo(560 + sd * 300, 520 + wob); c.fill(); }
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(300 + i * 40, 860); c.lineTo(310 + i * 40, 980 + Math.sin(t * 5 + i) * 20); c.lineTo(330 + i * 40, 860); c.fill(); }
    c.globalAlpha = k; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(560 + sd * 100, 600 + wob, 44, 30, sd * 0.3, 0, Math.PI * 2); c.fillStyle = '#FFE14D'; c.fill(); c.beginPath(); c.ellipse(560 + sd * 100, 600 + wob, 10, 26, 0, 0, Math.PI * 2); c.fillStyle = '#0E1030'; c.fill(); }
    c.restore();
  }
  const dark = (t) => (t >= ev.dark && t < ev.light ? 1 : 0);
  function bedroom(c, t, { lamp = 1 } = {}) { room(c, t, { wall: '#CFE3F5', night: 1 - 0.6 * lamp, wx: 600, wy: 300 }); bed(c, 640, GY, 560); }
  function hook(c, t) { bedroom(c, t, { lamp: 0 }); monster(c, t, 1); stick(c, laila(t, { x: 300, eyes: 'wide', brows: -0.9, browUp: 1, mouth: 'o', sweat: 1, hands: [[-60, -330], [60, -330]], elbows: [60, 60] }), t); hookText(c, t, [["WHAT'S THAT", '#FFFFFF'], ['SHADOW?!', '#FFD23F']]); }
  function bedtime(c, t) {
    const off = t >= ev.dark;
    bedroom(c, t, { lamp: off ? 0 : 1 });
    if (off) { c.save(); c.globalAlpha = 0.5; c.fillStyle = '#0B0D25'; c.fillRect(-W, -H, W * 3, H * 3); c.restore(); }
    const reach = ramp(t, ev.dark - 0.5, 0.4);
    stick(c, laila(t, { x: 300, eyes: off ? 'wide' : 'happy', look: [0.6, 0], mouth: off ? 'o' : 'smile', hands: [[-120, -60], [lerp(120, 240, reach), lerp(-60, -360, reach)]], elbows: [50, 30] }), t);
    c.beginPath(); c.roundRect(480, 760, 40, 70, 8); c.fillStyle = '#fff'; c.fill(); K.stroke(c, 5); c.beginPath(); c.arc(500, 795, 9, 0, Math.PI * 2); c.fillStyle = off ? '#666' : '#FFD23F'; c.fill(); K.stroke(c, 4);
    if (t >= ev.dark && t < ev.dark + 0.5) word(c, 'CLICK!', 600, 680, 70, '#FFFFFF', { scale: pop(t, ev.dark, 0.2, 3) });
  }
  function shadowScene(c, t) {
    bedroom(c, t, { lamp: 0 }); c.save(); c.globalAlpha = 0.5; c.fillStyle = '#0B0D25'; c.fillRect(-W, -H, W * 3, H * 3); c.restore();
    monster(c, t, ramp(t, ev.shadow, 1.0));
    const scared = t >= L.monster.t - 0.2, m = talk('laila', t, { mouth: scared ? 'o' : 'wavy' });
    const shake = scared ? Math.sin(t * 40) * 4 : 0;
    stick(c, laila(t, { x: 260 + shake, eyes: 'wide', look: [0.8, -0.8], brows: -0.9, browUp: 1, ...m, sweat: 1, hands: scared ? [[-60, -330], [60, -330]] : [[-120, -60], [120, -60]], elbows: [60, 60], lean: -0.08 }), t);
    if (t >= L.monster.t) word(c, 'EEEK!', 760, 1100, 90, '#FFD23F', { scale: pop(t, L.monster.t, 0.2, 3.5), rot: 0.1 });
  }
  function together(c, t) {
    const lit = t >= ev.light;
    bedroom(c, t, { lamp: 0 }); c.save(); c.globalAlpha = lit ? 0.35 : 0.5; c.fillStyle = '#0B0D25'; c.fillRect(-W, -H, W * 3, H * 3); c.restore();
    monster(c, t, lit ? 1 - ramp(t, ev.light, 0.25) : 1);
    const ym = talk('yasin', t, { mouth: 'smile' }), breath = ramp(t, L.breath.t + 1.2, 0.8) * (1 - ramp(t, ev.light - 0.3, 0.3));
    const lo = laila(t, { x: 260, eyes: lit ? 'wide' : 'dot', look: [0.8, -0.6], brows: lit ? 0.2 : -0.6, browUp: 0.5, mouth: breath > 0.3 ? 'o' : 'flat', squash: -0.05 * breath, hands: [[-120, -60], [210, -400]], elbows: [50, 30], holds: [null, holdFlashlight(-0.6)] });
    const r = stick(c, lo, t);
    stick(c, yasin(t, { x: 640, eyes: 'dot', look: [-0.6, 0], brows: 0.3, ...ym, hands: [[-200, -200], [130, -80]], elbows: [40, 50] }), t);
    if (lit) { const hd = r.P(lo.hands[1]); flashlightBeam(c, [hd[0] + 60, hd[1] - 40], -0.65, 1000, 0.3, 0.55 * ramp(t, ev.light, 0.15)); word(c, 'CLICK!', 820, 600, 66, '#FFFFFF', { scale: t < ev.light + 0.5 ? pop(t, ev.light, 0.2, 3) : 0 }); }
  }
  function reveal(c, t) {
    bedroom(c, t, { lamp: 0.7 });
    flashlightBeam(c, [300, 960], -0.7, 1100, 0.32, 0.5);
    const hugT = ev.hug, hug = ramp(t, hugT - 0.6, 0.5), laugh = t >= S.laughs[0][0];
    const cx = lerp(780, 470, hug), cy = lerp(1020, GY, hug);
    cat(c, { x: cx, gy: cy, s: 0.8, flip: -1, eyes: t < ev.meow + 0.6 ? 'big' : 'happy', mouth: t >= ev.meow && t < ev.meow + 0.5 ? 'meow' : 'smile', purr: hug }, t);
    if (t >= ev.meow && t < ev.meow + 0.7) word(c, 'MEOW!', 820, 760, 90, '#FFD23F', { scale: pop(t, ev.meow, 0.2, 3.5), rot: 0.08 });
    const lm = talk('laila', t, { mouth: 'grin' });
    const lo = laugh ? laughPose(t, laila(t, { x: 250, lean: -0.12, feet: [[-60, 0], [60, 0]] }), 0, S.laughs[0][0]) : laila(t, { x: 250, eyes: t < L.fluffy.t ? 'wide' : 'happy', ...(t < L.fluffy.t ? { mouth: 'o' } : lm), hands: hug > 0.5 ? [[-80, -200], [160, -200]] : [[-120, -60], [200, -380]], elbows: [50, 40], holds: [null, hug > 0.5 ? null : holdFlashlight(-0.7)] });
    stick(c, lo, t); if (laugh) laughShake(c, lo, t, 0);
    const a = t - hugT; if (a > 0 && a < 1.8) for (let k = 0; k < 7; k++) { const ang = -Math.PI / 2 + (k / 6 - 0.5) * 2.2, e = io(clamp(a / 0.7)); c.save(); c.globalAlpha = clamp((1.8 - a) / 0.5); heart(c, 380 + Math.cos(ang) * 260 * e, 900 + Math.sin(ang) * 200 * e - a * 50, 1.3 * pop(t, hugT + k * 0.04, 0.3, 3)); c.restore(); }
  }
  run([
    { at: 0, draw: hook, cam: Cmb(push(1.1, 1.0), bumps([0.15, 0.4], 0.04)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'laila'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.bed.t - 0.2, draw: bedtime, in: 'whip', cam: Cmb(push(1.05, 1.12, -60, 60), bumps([ev.dark], 0.06)) },
    { at: L.shadow.t, draw: shadowScene, in: 'cut', cam: (s) => ({ zoom: lerp(1.0, 1.15, io(s.u)), y: lerp(-40, 40, io(s.u)) }) },
    { at: L.monster.t, draw: shadowScene, in: 'cut', cam: Cmb(hold(1.6, 1.75, 330 - W / 2, 1000 - H / 2), K.bumps([L.monster.t], 0.08)) },
    { at: L.brave.t, draw: together, in: 'whip', cam: Cmb(push(1.05, 1.12, 0, 80), bumps([ev.light], 0.06)) },
    { at: L.cat.t - 0.1, draw: reveal, in: 'flash', cam: Cmb(push(1.1, 1.02, 60, 60), bumps([ev.meow, ev.hug], 0.05)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
