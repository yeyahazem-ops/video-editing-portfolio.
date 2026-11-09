// ep05 · The Big Match. Leo scores, Yasin sulks... then shakes hands.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, LEO, yard, goal, ball, word, pop, ramp, io, clamp, lerp, heart, talking, blinkAt, beatPh, laughPose, laughShake, speedLines, confetti, hookText, titleScene, moralScene, endingScene, push, hold, bumps, Cmb, run, W, H } = K;
  const GY = 1430;
  const yasin = (t, o = {}) => ({ ...YASIN, x: 680, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const leo = (t, o = {}) => ({ ...LEO, x: 260, gy: GY, s: 0.62, blink: blinkAt(t, 5), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  function field(c, t) { yard(c, t); goal(c, 760, GY, 0.95); }
  function hook(c, t) { field(c, t); stick(c, yasin(t, { x: W / 2 - 40, gy: 2000, s: 1.05, eyes: 'dot', brows: 0.9, mouth: 'frown', hands: [[-60, -200], [60, -200]], elbows: [80, 80], lean: 0 }), t); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(W / 2 - 40 + sd * 120, 560); c.lineTo(W / 2 - 40 + sd * 170, 500); K.stroke(c, 8, '#FF5A4E'); } hookText(c, t, [['WHAT DO YOU DO', '#FFFFFF'], ['WHEN YOU LOSE?', '#FFD23F']]); }
  // the match: Leo dribbles, shoots, GOAL
  function match(c, t) {
    field(c, t);
    const run1 = clamp((t - ev.start) / (ev.kick - ev.start - 0.1)), wph = (t - ev.start) * 3.4 * Math.PI * 2, scored = t >= ev.goal;
    const lx = lerp(120, 380, io(run1)), wk = t < ev.kick - 0.1 && t > ev.start ? 1 : 0;
    const kick = t >= ev.kick - 0.15 && t < ev.kick + 0.3 ? Math.sin(clamp((t - (ev.kick - 0.15)) / 0.45) * Math.PI) : 0;
    stick(c, leo(t, { x: lx, eyes: scored ? 'happy' : 'dot', look: [1, 0.5], brows: 0.6, mouth: scored ? 'grin' : 'flat', bob: scored ? 30 * Math.sin(Math.PI * beatPh(t)) : 10 * Math.abs(Math.sin(wph)) * wk, feet: [[-45 + 40 * Math.sin(wph) * wk, 30 * Math.max(0, Math.sin(wph)) * wk], [45 - 40 * Math.sin(wph) * wk + 60 * kick, 30 * Math.max(0, -Math.sin(wph)) * wk + 80 * kick]], hands: scored ? [[-170, -560], [170, -560]] : [[-150, -100], [150, -100]], elbows: [40, 40] }), t);
    stick(c, yasin(t, { x: 760, eyes: scored ? 'wide' : 'dot', look: [-1, 0.4], brows: scored ? -0.8 : 0.8, mouth: scored ? 'o' : 'flat', hands: [[-180, -240], [180, -240]], elbows: [30, 30], feet: [[-80, 0], [80, 0]], knees: [70, 70], bob: -30 }), t);
    let bx, by;
    if (t < ev.kick) { bx = lx + 70; by = GY - 34 - 30 * Math.abs(Math.sin(wph)); }
    else { const u = clamp((t - ev.kick) / (ev.goal - ev.kick)); bx = lerp(lx + 70, 900, u); by = lerp(GY - 40, 1180, u) - 160 * Math.sin(Math.PI * u); }
    ball(c, bx, by, 34, t * 10);
    if (scored) { const a = t - ev.goal; if (a < 0.6) { c.save(); c.globalAlpha = 1 - a / 0.6; speedLines(c, 900, 1180, t, 50, 200, 'rgba(21,21,21,0.2)'); c.restore(); } word(c, 'GOAL!', W / 2 - 40, 520, 190, '#FFD23F', { scale: pop(t, ev.goal, 0.25, 3.5), rot: -0.08 }); confetti(c, t, ev.goal, 50); }
  }
  // Yasin sulks, arms crossed, a storm cloud over him... then a light bulb
  function grumpy(c, t) {
    yard(c, t);
    const m = talk('yasin', t, { mouth: t >= ev.think ? 'smile' : 'frown' }), idea = t >= ev.think;
    stick(c, yasin(t, { x: W / 2 - 40, gy: 1900, s: 0.95, eyes: idea ? 'wide' : 'dot', look: [0, idea ? -1 : 0.3], brows: idea ? -0.2 : 1, browUp: idea ? 1 : 0, ...m, hands: idea ? [[-80, -200], [160, -520]] : [[60, -210], [-60, -190]], elbows: idea ? [60, 30] : [80, 80], lean: idea ? 0 : 0.04 * Math.sin(t * 4) }), t);
    if (!idea) { const cx = W / 2 - 40, cy = 330 + Math.sin(t * 2) * 10; c.save(); c.fillStyle = '#6B7A8F'; for (const [dx, dy, r] of [[-90, 10, 70], [0, -20, 90], [90, 10, 70]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); c.fill(); } c.restore(); for (let k = 0; k < 6; k++) { const a = ((t * 2 + k / 6) % 1); c.beginPath(); c.moveTo(cx - 100 + k * 40, cy + 70 + a * 120); c.lineTo(cx - 106 + k * 40, cy + 100 + a * 120); K.stroke(c, 5, '#7FB6E0'); } }
    else { const p = pop(t, ev.think, 0.3, 3); c.save(); c.translate(W / 2 - 40, 320); c.scale(p, p); c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fillStyle = '#FFE14D'; c.fill(); K.stroke(c, 7); c.beginPath(); c.roundRect(-34, 60, 68, 44, 8); c.fillStyle = '#B9C7CC'; c.fill(); K.stroke(c, 6); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(a) * 100, Math.sin(a) * 100); c.lineTo(Math.cos(a) * 140, Math.sin(a) * 140); K.stroke(c, 7, '#FFD23F'); } c.restore(); word(c, "IT'S JUST A GAME!", W / 2 - 40, 520, 64, '#FFFFFF', { scale: pop(t, ev.think + 0.3, 0.3, 3) }); }
  }
  // handshake, and two friends laughing
  function handshake(c, t) {
    field(c, t);
    const shake = ramp(t, ev.shake, 0.4), wob = shake * Math.sin((t - ev.shake) * 14) * 20, laugh = t >= S.laughs[0][0];
    const ym = talk('yasin', t, { mouth: 'grin' }), lm = talk('leo', t, { mouth: 'grin' });
    const yo = laugh ? laughPose(t, yasin(t, { x: 640, lean: 0.1, feet: [[-70, 0], [80, 0]] }), 0, S.laughs[0][0]) : yasin(t, { x: 640, eyes: 'happy', ...ym, hands: [[lerp(-150, -300, shake), lerp(-80, -330 + wob, shake)], [150, -80]], elbows: [30, 50] });
    const lo = laugh ? laughPose(t, leo(t, { x: 300, lean: -0.15, feet: [[-75, 0], [70, 0]] }), 1.7, S.laughs[0][0]) : leo(t, { x: 300, eyes: 'happy', ...lm, hands: [[-150, -80], [lerp(150, 300, shake), lerp(-80, -330 + wob, shake)]], elbows: [50, 30] });
    stick(c, lo, t); stick(c, yo, t);
    if (laugh) { laughShake(c, yo, t, 0); laughShake(c, lo, t, 1.7); }
    if (t >= ev.shake) word(c, 'GOOD GAME!', W / 2 - 40, 460, 96, '#FFD23F', { scale: pop(t, ev.shake, 0.3, 3), rot: -0.05 });
    const a = t - ev.friends; if (a > 0 && a < 1.8) for (let k = 0; k < 7; k++) { const ang = -Math.PI / 2 + (k / 6 - 0.5) * 2.2, e = io(clamp(a / 0.7)); c.save(); c.globalAlpha = clamp((1.8 - a) / 0.5); heart(c, 470 + Math.cos(ang) * 260 * e, 760 + Math.sin(ang) * 200 * e - a * 50, 1.3 * pop(t, ev.friends + k * 0.04, 0.3, 3)); c.restore(); }
  }
  run([
    { at: 0, draw: hook, cam: Cmb(push(1.1, 1.0), bumps([0.15, 0.4], 0.04)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'yasin'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.match.t - 0.2, draw: match, in: 'whip', cam: Cmb((s) => { const k = io(clamp((s.t - L.goal.t) / 1.5)); return { zoom: lerp(1.05, 1.2, k), x: lerp(-60, 120, k), y: 120 }; }, bumps([ev.kick, ev.goal], 0.06), K.bumps([], 0)) },
    { at: L.unfair.t - 0.2, draw: grumpy, in: 'cut', cam: Cmb(push(1, 1.06), bumps([ev.think], 0.06)) },
    { at: L.goodgame.t - 0.1, draw: handshake, in: 'whip', cam: Cmb(push(1.1, 1.18, 0, 120), bumps([ev.shake, S.laughs[0][0]], 0.05)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
