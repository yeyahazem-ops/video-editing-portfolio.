// Bubbly Tales · Did You Know #2 «The octopus has three hearts».
(function () {
  const SCRIPT = { title: 'Three Hearts', lines: [
    { id: 'hook', text: 'This animal has three hearts... and blue blood!' },
    { id: 'gills', text: 'Two hearts pump blood through its gills. The third pumps it to the rest of its body.', gap: 0.3 },
    { id: 'blue', text: 'Its blood uses copper instead of iron to carry oxygen. That makes it blue!', gap: 0.3 },
    { id: 'stop', text: 'And when it swims, its main heart actually stops beating!', gap: 0.3 },
    { id: 'follow', text: 'Follow for more!', gap: 0.4 },
  ] };
  if (typeof module !== 'undefined') module.exports = SCRIPT; else globalThis.SCRIPT = SCRIPT;
})();
