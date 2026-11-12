// Bubbly Tales · Science #2 «How Lightning Works». Hook first: the strike is on screen from frame 0.
(function () {
  const SCRIPT = { title: 'How Lightning Works', lines: [
    { id: 'hook', text: 'This is five times hotter than the surface of the Sun.' },
    { id: 'q', text: 'So how does a cloud make it?', gap: 0.3 },
    { id: 'ice', text: 'Inside a storm cloud, ice crystals and hailstones smash into each other.', gap: 0.35 },
    { id: 'charge', text: 'Every crash moves electric charge. The top of the cloud turns positive... the bottom, negative.', gap: 0.3 },
    { id: 'ground', text: 'The ground below gets charged too... and the tension builds.', gap: 0.3 },
    { id: 'leader', text: 'Then an invisible spark zigzags down...', gap: 0.3 },
    { id: 'meet', text: 'and another reaches up from the ground to meet it.', gap: 0.15 },
    { id: 'strike', text: 'Crack! A giant current blasts through the air in a split second.', gap: 1.0 },
    { id: 'heat', text: 'It heats the air to thirty thousand degrees, so fast that the air explodes outward.', gap: 0.3 },
    { id: 'thunder', text: "That explosion is the thunder you hear!", gap: 0.2 },
    { id: 'count', text: 'Count the seconds between the flash and the boom. Every three seconds is about one kilometer.', gap: 0.4 },
    { id: 'twist', text: 'And right now, lightning is hitting Earth about forty times... every second.', gap: 0.4 },
    { id: 'follow', text: 'Follow Bubbly Tales for more science!', gap: 0.7 },
  ] };
  if (typeof module !== 'undefined') module.exports = SCRIPT; else globalThis.SCRIPT = SCRIPT;
})();
