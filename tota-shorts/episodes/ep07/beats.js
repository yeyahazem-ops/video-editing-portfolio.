(function () {
  const BEATS = (L) => ({
    sfx: [['crunch', L.hook.t + 0.05], ['boing', L.jump.t + 1.2], ['crunch', L.jump.end - 0.9], ['sad', L.broken.t - 0.2], ['whoosh', L.sorry.t - 0.2], ['tap', L.fix.t + 0.9], ['tap', L.fix.t + 1.3], ['tap', L.fix.t + 2.4], ['sparkle', L.fix.end - 0.6], ['hearts', L.forgive.end - 0.6]],
    ev: { hookCrunch: L.hook.t + 0.05, bounce: L.jump.t + 1.2, crunch: L.jump.end - 0.9, fixTaps: [L.fix.t + 0.9, L.fix.t + 1.3, L.fix.t + 2.4], fixed: L.fix.end - 0.6, hug: L.forgive.end - 0.6 },
    laughs: [[L.forgive.end + 0.05, L.moral.t - 0.15, ['yasin', 'laila']]],
    markers: { crunch: { t: L.jump.end - 0.9, sync: 'av' } },
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
