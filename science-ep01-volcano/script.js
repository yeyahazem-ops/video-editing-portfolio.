// Bubbly Tales · Science · «How a Volcano Erupts». All-ages science short (9:16).
// Facts: magma is roughly 700–1,300 °C; it rises because it is less dense than the rock around it;
// dissolved gas drives explosive eruptions; ash columns can reach tens of kilometres; volcanoes build
// mountains and islands (e.g. Hawaii) over many thousands of years.
(function () {
  const SCRIPT = { id: 'volcano', lines: [
    { id: 'hook', text: "There's a monster sleeping under your feet." },
    { id: 'magma', text: 'It\'s called magma: melted rock, up to twelve hundred degrees!', gap: 0.35 },
    { id: 'chamber', text: 'Deep underground, it collects in a giant chamber.', gap: 0.35 },
    { id: 'rises', text: "It's lighter than the solid rock around it... so it rises.", gap: 0.3 },
    { id: 'gas', text: "And it's full of gas, like a shaken soda bottle.", gap: 0.3 },
    { id: 'pressure', text: 'The pressure builds... and builds...', gap: 0.35 },
    { id: 'hold', text: "until the rock can't hold it anymore.", gap: 0.2 },
    { id: 'lava', text: 'Lava pours out, and ash shoots kilometers into the sky!', gap: 2.0 },
    { id: 'build', text: 'Over thousands of years, eruptions like this build whole mountains... and even islands.', gap: 0.4 },
    { id: 'sleeping', text: 'So next time you see a quiet mountain... is it really sleeping?', gap: 0.5 },
    { id: 'follow', text: 'Follow Bubbly Tales for more science!', gap: 0.9 },
  ] };
  if (typeof module !== 'undefined') module.exports = SCRIPT; else globalThis.SCRIPT = SCRIPT;
})();
