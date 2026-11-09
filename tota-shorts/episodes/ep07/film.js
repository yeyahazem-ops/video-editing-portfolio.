// ep07 · Laila's Robot. A sofa jump, a crunch, tears, sorry, glue and tape, and a hug.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, LAILA, room, sofa, robot, word, pop, ramp, io, clamp, lerp, heart, talking, blinkAt, laughPose, laughShake, speedLines, hookText, titleScene, moralScene, endingScene, push, hold, bumps, Cmb, run, W, H } = K;
  const GY = 1430;
  const yasin = (t, o = {}) => ({ ...YASIN, x: 560, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const laila = (t, o = {}) => ({ ...LAILA, x: 230, gy: GY, s: 0.5, blink: blinkAt(t, 4), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  function living(c, t) { room(c, t, { wall: '#E8F0D8', wx: 560, wy: 280 }); sofa(c, 600, GY, 600); }
  function hook(c, t) { living(c, t); const a = t - ev.hookCrunch; speedLines(c, 600, 1150, t, 44, 260, 'rgba(21,21,21,0.18)'); robot(c, 600, 1200, 0.9, { broken: 1 }, t); word(c, 'CRUNCH!', 600, 860, 130, '#FF5A4E', { scale: pop(t, ev.hookCrunch, 0.2, 3.5), rot: -0.1 }); hookText(c, t, [['OH NO...', '#FFFFFF'], ['WHAT DID HE DO?', '#FFD23F']]); }
  // bouncing on the sofa... onto the robot
  function jump(c, t) {
    living(c, t);
    const broke = t >= ev.crunch;
    robot(c, 640, GY - 150, 0.55, { broken: broke ? ramp(t, ev.crunch, 0.15) : 0 }, t);
    const up = (x0, d) => Math.max(0, Math.sin(Math.PI * clamp((t - x0) / d)));
    const b1 = up(ev.bounce - 0.5, 0.6), b2 = up(ev.bounce + 0.2, 0.7), b3 = t >= ev.crunch - 0.7 && t < ev.crunch ? up(ev.crunch - 0.7, 0.7) : 0;
    const air = Math.max(b1, b2, b3), x = t >= ev.crunch - 0.7 ? lerp(420, 640, clamp((t - (ev.crunch - 0.7)) / 0.7)) : 420;
    stick(c, yasin(t, { x, gy: GY - 150, bob: 260 * air, eyes: broke ? 'wide' : 'happy', brows: broke ? -0.9 : 0, browUp: broke ? 1 : 0, mouth: broke ? 'o' : 'grin', hands: broke ? [[-60, -330], [60, -330]] : [[-180, -560 * (0.5 + air / 2)], [180, -560 * (0.5 + air / 2)]], elbows: [30, 30], knees: [40 + 60 * air, 40 + 60 * air], squash: air > 0 ? -0.05 : 0.04 }), t);
    stick(c, laila(t, { x: 180, eyes: broke ? 'wide' : 'dot', look: [1, 0], mouth: broke ? 'o' : 'smile', hands: [[-120, -60], [120, -60]], elbows: [50, 50] }), t);
    if (broke) { word(c, 'CRUNCH!', 640, 900, 120, '#FF5A4E', { scale: pop(t, ev.crunch, 0.2, 3.5), rot: -0.1 }); }
    if (t >= ev.bounce - 0.5 && !broke) word(c, 'BOING!', 820, 620, 60, '#FFFFFF', { scale: pop(t, ev.bounce, 0.2, 3), rot: 0.1 });
  }
  // Laila's tears
  function tears(c, t) {
    living(c, t); robot(c, 620, GY, 0.55, { broken: 1 }, t);
    const m = talk('laila', t, { mouth: 'sad' });
    stick(c, laila(t, { x: 330, eyes: 'closed', brows: -1, browUp: 0.8, ...m, cry: 1, hands: [[-60, -300], [60, -300]], elbows: [60, 60], tilt: 0.06 * Math.sin(t * 6) }), t);
    stick(c, yasin(t, { x: 820, eyes: 'dot', look: [-1, 0.4], brows: -0.9, browUp: 0.6, mouth: 'wavy', sweat: 1, hands: [[-150, -80], [150, -80]], elbows: [50, 50] }), t);
  }
  // sorry, then glue and tape
  function fixing(c, t) {
    living(c, t);
    const tape = ramp(t, ev.fixTaps[0], 1.6), fixed = t >= ev.fixed;
    robot(c, 560, GY, 0.6, { broken: 1 - ramp(t, L.fix.t + 0.3, 1.4), tape, happy: fixed ? 1 : 0 }, t);
    const ym = talk('yasin', t, { mouth: fixed ? 'grin' : 'flat' });
    const tap = ev.fixTaps.reduce((a, x) => Math.max(a, t >= x && t < x + 0.25 ? 1 - (t - x) / 0.25 : 0), 0);
    stick(c, yasin(t, { x: 820, eyes: fixed ? 'happy' : 'dot', look: [-1, 0.6], brows: t < L.fix.t ? -0.8 : 0.6, browUp: t < L.fix.t ? 0.6 : 0, ...ym, hands: t < L.fix.t ? [[-60, -300], [60, -300]] : [[-300, -230 - 40 * tap], [-150, -100]], elbows: [30, 50] }), t);
    stick(c, laila(t, { x: 230, eyes: fixed ? 'wide' : 'dot', look: [1, 0.4], brows: fixed ? 0.3 : -0.8, mouth: fixed ? 'o' : 'sad', cry: fixed ? 0 : 0.6, hands: [[-120, -60], [120, -60]], elbows: [50, 50] }), t);
    ev.fixTaps.forEach((x, i) => { if (t >= x && t < x + 0.4) word(c, i < 2 ? 'TAPE!' : 'GLUE!', 560 + (i - 1) * 120, 900 - i * 40, 54, '#FFFFFF', { scale: pop(t, x, 0.15, 3) }); });
    if (fixed) for (let k = 0; k < 4; k++) K.star(c, 460 + k * 70, 940 + (k % 2) * 60, 24 + 8 * Math.sin((t - ev.fixed) * 6 + k), '#FFF6B0', t + k);
  }
  // forgiven: a hug and a big laugh
  function forgive(c, t) {
    living(c, t); robot(c, 560, GY, 0.55, { tape: 1, happy: 1 }, t);
    const lm = talk('laila', t, { mouth: 'grin' }), hug = ramp(t, ev.hug - 0.4, 0.4), laugh = t >= S.laughs[0][0];
    const lo = laugh ? laughPose(t, laila(t, { x: 260, lean: -0.12, feet: [[-60, 0], [60, 0]] }), 0, S.laughs[0][0]) : laila(t, { x: lerp(230, 330, hug), eyes: 'happy', ...lm, bob: 12 * Math.abs(Math.sin(t * 6)), hands: hug > 0.5 ? [[-120, -300], [220, -300]] : [[-170, -560], [170, -560]], elbows: [30, 30] });
    const yo = laugh ? laughPose(t, yasin(t, { x: 760, lean: 0.1, feet: [[-70, 0], [80, 0]] }), 1.7, S.laughs[0][0]) : yasin(t, { x: lerp(820, 640, hug), eyes: 'happy', mouth: 'grin', blush: 1, hands: hug > 0.5 ? [[-260, -300], [150, -80]] : [[-150, -80], [150, -80]], elbows: [30, 50] });
    stick(c, lo, t); stick(c, yo, t);
    if (laugh) { laughShake(c, lo, t, 0); laughShake(c, yo, t, 1.7); }
    if (t >= L.forgive.t) word(c, 'EVEN BETTER!', W / 2 - 40, 460, 84, '#FFD23F', { scale: pop(t, L.forgive.t + 0.2, 0.3, 3), rot: -0.05 });
    const a = t - ev.hug; if (a > 0 && a < 1.8) for (let k = 0; k < 8; k++) { const ang = -Math.PI / 2 + (k / 7 - 0.5) * 2.4, e = io(clamp(a / 0.7)); c.save(); c.globalAlpha = clamp((1.8 - a) / 0.5); heart(c, 480 + Math.cos(ang) * 280 * e, 820 + Math.sin(ang) * 220 * e - a * 50, 1.4 * pop(t, ev.hug + k * 0.04, 0.3, 3)); c.restore(); }
  }
  run([
    { at: 0, draw: hook, cam: Cmb(push(1.15, 1.0, 0, 120), bumps([ev.hookCrunch], 0.08), K.bumps([], 0)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'yasin'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.jump.t - 0.2, draw: jump, in: 'whip', cam: Cmb(push(1.05, 1.12, 40, 40), bumps([ev.crunch], 0.08)) },
    { at: L.broken.t - 0.1, draw: tears, in: 'cut', cam: hold(1.45, 1.6, 400 - W / 2, 1000 - H / 2) },
    { at: L.sorry.t - 0.2, draw: fixing, in: 'whip', cam: Cmb(push(1.05, 1.12, 40, 80), bumps(ev.fixTaps, 0.02, 12), bumps([ev.fixed], 0.05)) },
    { at: L.forgive.t - 0.1, draw: forgive, in: 'push', cam: Cmb(push(1.1, 1.18, 0, 100), bumps([ev.hug, S.laughs[0][0]], 0.05)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
