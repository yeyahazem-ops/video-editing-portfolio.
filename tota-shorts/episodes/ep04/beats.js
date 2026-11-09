(function () {
  const BEATS = (L) => ({
    sfx: [['rain', 0, 12], ['tap', L.hook.t + 0.6], ['tap', L.hook.t + 1.0], ['tap', L.rain.t + 1.6], ['tap', L.rain.t + 2.0], ['tap', L.rain.t + 2.4], ['meow', L.tiny.end - 0.6], ['sad', L.tiny.end - 0.3], ['whoosh', L.brings.t + 0.4], ['sparkle', L.safe.t + 0.4], ['hearts', L.follows.t + 1.0], ['boing', L.follows.end - 1.6], ['meow', L.follows.end - 0.8]],
    ev: { taps: [L.hook.t + 0.6, L.hook.t + 1.0, L.rain.t + 1.6, L.rain.t + 2.0, L.rain.t + 2.4], meow: L.tiny.end - 0.6, purr: L.follows.t + 1.0, hop: L.follows.end - 1.6, meow2: L.follows.end - 0.8 },
    laughs: [],
    markers: {},
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
