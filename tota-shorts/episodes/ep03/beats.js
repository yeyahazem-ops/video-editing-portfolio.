(function () {
  const BEATS = (L) => ({
    sfx: [['spooky', L.hook.t, 2.2], ['click', L.bed.end - 0.4], ['spooky', L.shadow.t, 3.0], ['gasp', L.monster.t - 0.15], ['click', L.breath.end - 0.5], ['meow', L.cat.t + 0.15], ['hearts', L.fluffy.end - 0.6]],
    ev: { dark: L.bed.end - 0.4, shadow: L.shadow.t + 0.4, light: L.breath.end - 0.5, meow: L.cat.t + 0.15, hug: L.fluffy.end - 0.6 },
    music: { quiet: [[0, L.title.t - 0.1], [L.bed.end - 0.4, L.breath.end - 0.5]] },
    laughs: [[L.fluffy.end + 0.1, L.moral.t - 0.15, ['laila', 'yasin']]],
    markers: { light: { t: L.breath.end - 0.5, sync: 'av' } },
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
