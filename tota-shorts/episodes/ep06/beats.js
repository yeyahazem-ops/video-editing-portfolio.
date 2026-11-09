(function () {
  const BEATS = (L) => ({
    sfx: [['drip', L.hook.t + 0.1], ['drip', L.hook.t + 0.9], ['drip', L.hook.t + 1.7], ['whoosh', L.left.end - 1.0], ['sad', L.waste.end - 0.5], ['gasp', L.oops.t - 0.15], ['click', L.oops.end - 0.4], ['pop', L.plant.end - 1.4], ['sparkle', L.smiling.t + 0.4], ['hearts', L.smiling.end - 0.3]],
    ev: { drips: [L.hook.t + 0.1, L.hook.t + 0.9, L.hook.t + 1.7], run: L.left.end - 1.0, off: L.oops.end - 0.4, pour: L.plant.end - 1.4, bloom: L.smiling.t + 0.4, love: L.smiling.end - 0.3 },
    laughs: [[L.smiling.end + 0.05, L.moral.t - 0.15, ['yasin', 'fathy']]],
    markers: { off: { t: L.oops.end - 0.4, sync: 'av' } },
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
