// ep04 · The Hungry Cat. A wet kitten at the window; a towel, warm milk, and a new shadow that follows Yasin.
(function () {
  const K = globalThis.TK, S = globalThis.SCORE, { L, ev } = S;
  const { stick, YASIN, room, cat, bowl, word, pop, ramp, io, clamp, lerp, heart, talking, blinkAt, beatPh, hookText, titleScene, moralScene, endingScene, push, hold, bumps, Cmb, run, W, H } = K;
  const GY = 1430;
  const yasin = (t, o = {}) => ({ ...YASIN, x: 300, gy: GY, s: 0.62, blink: blinkAt(t, 1), ...o });
  const talk = (who, t, other) => { const m = talking(who, t); return m !== null ? { mouth: 'talk', open: m } : other; };
  const tapNow = (t) => ev.taps.reduce((a, x) => Math.max(a, t >= x && t < x + 0.2 ? 1 - (t - x) / 0.2 : 0), 0);
  // the window seen from inside, with the kitten pressed against the rainy glass
  function windowCat(c, t, close = false) {
    room(c, t, { wall: '#F6E3C8', rain: 1, wx: 360, wy: 360 });
    const k = tapNow(t);
    c.save(); c.beginPath(); c.rect(360, 360, 340, 380); c.clip();
    cat(c, { x: 530, gy: 760, s: 0.75, eyes: 'big', mouth: t >= ev.meow && t < ev.meow + 0.5 ? 'meow' : 'smile', wet: 1, bob: 10 * k }, t);
    c.restore();
    c.save(); c.globalAlpha = 0.25; c.fillStyle = '#9FB6C8'; c.fillRect(360, 360, 340, 380); c.restore();
    ev.taps.forEach((x) => { if (t >= x && t < x + 0.35) word(c, 'TAP!', 760, 520, 60, '#FFFFFF', { scale: pop(t, x, 0.15, 3), rot: 0.1 }); });
  }
  function hook(c, t) { windowCat(c, t); hookText(c, t, [['WHO IS TAPPING', '#FFFFFF'], ['ON THE WINDOW?', '#FFD23F']]); }
  function rainy(c, t) { windowCat(c, t); stick(c, yasin(t, { x: 820, eyes: 'dot', look: [-1, -0.6], brows: -0.3, mouth: 'flat', hands: [[-150, -80], [150, -80]], elbows: [50, 50] }), t); }
  function poor(c, t) {
    windowCat(c, t);
    const m = talk('yasin', t, { mouth: 'o' });
    stick(c, yasin(t, { x: 820, eyes: 'wide', look: [-1, -0.6], brows: -0.9, browUp: 0.8, ...m, hands: [[-60, -330], [60, -330]], elbows: [60, 60] }), t);
  }
  // inside: towel and warm milk
  function care(c, t) {
    room(c, t, { wall: '#F6E3C8', rain: 1, wx: 600, wy: 300 });
    const dry = ramp(t, L.brings.t + 0.6, 1.2), drink = t >= L.safe.t;
    cat(c, { x: 640, gy: GY, s: 0.75, flip: -1, eyes: drink ? 'happy' : 'big', wet: 1 - dry, purr: drink ? 1 : 0, bob: drink ? 4 * Math.abs(Math.sin(t * 6)) : 0 }, t);
    if (!drink) { c.save(); c.translate(640, GY - 210); c.rotate(-0.1); c.beginPath(); c.roundRect(-150, -60, 300, 120, 30); c.fillStyle = '#7ED3F7'; c.fill(); K.stroke(c, 6); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 6; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 50, -50); c.lineTo(i * 50, 50); c.stroke(); } c.restore(); }
    bowl(c, 860, GY, 0.9);
    for (let k = 0; k < 3; k++) { const a = ((t * 0.7 + k / 3) % 1); c.save(); c.globalAlpha = Math.sin(a * Math.PI) * 0.7; c.beginPath(); c.moveTo(830 + k * 30, GY - 60 - a * 140); c.quadraticCurveTo(850 + k * 30, GY - 100 - a * 140, 830 + k * 30, GY - 130 - a * 140); K.stroke(c, 5, '#FFFFFF'); c.restore(); }
    const m = talk('yasin', t, { mouth: 'grin' });
    stick(c, yasin(t, { x: 270, eyes: drink ? 'happy' : 'dot', look: [1, 0.6], ...m, hands: drink ? [[-150, -80], [200, -200]] : [[-150, -80], [260, -220]], elbows: [50, 30] }), t);
    if (drink) for (let k = 0; k < 4; k++) word(c, 'PURR', 560 + k * 40, 1000 - k * 40, 34, '#FFFFFF', { scale: pop(t, L.safe.t + 0.3 + k * 0.3, 0.2, 3) });
  }
  // and now it follows him everywhere: walking together, then it hops onto his head
  function follows(c, t) {
    room(c, t, { wall: '#FFE7C2', window: false });
    const u = clamp((t - L.follows.t) / (ev.hop - L.follows.t)), wph = (t - L.follows.t) * 3.2 * Math.PI * 2, walking = t < ev.hop - 0.2;
    const x = lerp(200, 640, io(u)), wk = walking ? 1 : 0;
    const r = stick(c, yasin(t, { x, eyes: 'happy', mouth: 'grin', bob: 10 * Math.abs(Math.sin(wph)) * wk, feet: [[-45 + 40 * Math.sin(wph) * wk, 30 * Math.max(0, Math.sin(wph)) * wk], [45 - 40 * Math.sin(wph) * wk, 30 * Math.max(0, -Math.sin(wph)) * wk]], hands: [[-150 - 40 * Math.sin(wph) * wk, -80], [150 + 40 * Math.sin(wph) * wk, -80]], elbows: [50, 50] }), t);
    const hop = clamp((t - ev.hop) / 0.5), headTop = [r.head[0], r.head[1] - r.R * 0.9];
    const cx = hop > 0 ? lerp(x - 260, headTop[0] + 20, io(hop)) : x - 260 + 0, cy = hop > 0 ? lerp(GY, headTop[1] + 10, io(hop)) - 220 * Math.sin(Math.PI * hop) : GY;
    cat(c, { x: cx, gy: cy, s: hop >= 1 ? 0.5 : 0.55, eyes: 'happy', mouth: t >= ev.meow2 && t < ev.meow2 + 0.5 ? 'meow' : 'smile', bob: hop > 0 ? 0 : 12 * Math.abs(Math.sin(wph + 1)) * wk }, t);
    for (let k = 0; k < 5; k++) { const a = ((t * 0.6 + k / 5) % 1); c.save(); c.globalAlpha = Math.sin(a * Math.PI); heart(c, x - 260 + k * 110, 900 - a * 260, 1.1); c.restore(); }
    if (t >= ev.meow2) word(c, 'BEST FRIENDS!', W / 2 - 40, 420, 80, '#FF5A4E', { scale: pop(t, ev.meow2, 0.3, 3), rot: -0.05 });
  }
  run([
    { at: 0, draw: hook, cam: Cmb(hold(1.75, 1.6, 530 - W / 2, 640 - H / 2), bumps(ev.taps.slice(0, 2), 0.04)) },
    { at: L.title.t - 0.1, draw: (c, t) => titleScene(c, t, 'yasin'), in: { type: 'iris', dur: 0.6 }, cam: push(1.04, 1) },
    { at: L.rain.t - 0.2, draw: rainy, in: 'whip', cam: Cmb(push(1, 1.08), bumps(ev.taps.slice(2), 0.02)) },
    { at: L.tiny.t, draw: windowCat, in: 'cut', cam: hold(1.8, 1.95, 530 - W / 2, 600 - H / 2) },
    { at: L.poor.t, draw: poor, in: 'cut', cam: push(1.05, 1.15, 120, 80) },
    { at: L.brings.t, draw: care, in: 'whip', cam: push(1.05, 1.15, 60, 120) },
    { at: L.follows.t, draw: follows, in: 'push', cam: Cmb(push(1, 1.08, 40, 40), bumps([ev.hop + 0.5, ev.meow2], 0.04)) },
    { at: L.moral.t - 0.25, draw: (c, t) => moralScene(c, t), in: { type: 'iris', dur: 0.6 }, cam: bumps(S.moralStamps, 0.04, 10) },
    { at: L.tota.t - 0.15, draw: (c, t) => endingScene(c, t), in: 'paper', cam: push(1.04, 1) },
  ]);
})();
