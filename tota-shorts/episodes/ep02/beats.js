// ep02 hits: every sound and its picture read these times (single source of truth)
(function () {
  const BEATS = (L) => ({
    sfx: [['sparkle', L.hook.t + 0.1], ['pop', L.lunch.end - 0.55], ['sad', L.sees.end - 1.3], ['whoosh', L.looks.t + 0.9], ['whoosh', L.looks.t + 2.2], ['whoosh', L.looks.t + 3.6], ['pop', L.share.t + 0.5], ['sparkle', L.share.t + 0.55], ['hearts', L.thanks.t + 0.3], ['hearts', L.friend.end - 0.9]],
    ev: { yum: L.lunch.end - 0.55, sad: L.sees.end - 1.3, glances: [L.looks.t + 0.9, L.looks.t + 2.2, L.looks.t + 3.6], split: L.share.t + 0.5, love: L.thanks.t + 0.3, friends: L.friend.end - 0.9 },
    laughs: [[L.friend.end + 0.05, L.moral.t - 0.15, ['yasin', 'leo']]],
    markers: { split: { t: L.share.t + 0.5, sync: 'av' } },
  });
  if (typeof module !== 'undefined') module.exports = BEATS; else globalThis.BEATS = BEATS;
})();
