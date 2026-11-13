// Bubbly Tales · 3D · «How Deep Is the Ocean?» narration: one short line per landmark (each must fit ~3.5 s).
(function () {
  const SCRIPT = { title: 'How Deep Is the Ocean?', lines: [
    { id: 'hook', text: "How deep is the ocean? Let's find out." },
    { id: 'diver', text: 'Forty meters. Most scuba divers stop here.' },
    { id: 'whale', text: 'One hundred meters. A blue whale, the biggest animal ever.' },
    { id: 'twilight', text: 'Two hundred meters. Sunlight ends here.' },
    { id: 'record', text: 'Three hundred thirty-two meters. The deepest scuba dive ever.' },
    { id: 'burj', text: 'The Burj Khalifa, upside down, would end here.' },
    { id: 'angler', text: 'One thousand meters. The Midnight Zone. No sunlight, ever.' },
    { id: 'sperm', text: 'Sperm whales hunt giant squid down here.' },
    { id: 'titanic', text: 'Three thousand eight hundred meters. The Titanic.' },
    { id: 'hadal', text: 'Six thousand meters. The pressure is six hundred times the surface.' },
    { id: 'everest', text: 'Mount Everest, upside down... and still not the bottom.' },
    { id: 'land', text: 'Challenger Deep. The deepest point on Earth.' },
    { id: 'twist', text: 'And over eighty percent of the ocean has never been explored.' },
  ] };
  if (typeof module !== 'undefined') module.exports = SCRIPT; else globalThis.SCRIPT = SCRIPT;
})();
