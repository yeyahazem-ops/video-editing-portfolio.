(function () {
  const BEATS = (L) => ({
    sfx: [['whistle', L.match.t + 0.2], ['kick', L.goal.t + 1.3], ['cheer', L.goal.t + 1.9], ['whistle', L.goal.end - 0.3], ['sad', L.unfair.t - 0.25], ['scratch', L.grumpy.t + 2.0], ['sparkle', L.goodgame.t + 0.3], ['hearts', L.again.end - 0.4]],
    ev: { start: L.match.t + 0.2, kick: L.goal.t + 1.3, goal: L.goal.t + 1.9, think: L.grumpy.t + 2.0, shake: L.goodgame.t + 0.3, friends: L.again.end - 0.4 },
    laughs: [[L.again.end + 0.05, L.moral.t - 0.15, ['yasin', 'leo']]],
    markers: { goal: { t: L.goal.t + 1.9, sync: 'av' } },
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
