// THE WORDS — every animal's verse and chorus, one phrase per bar, and the seven episodes of the week.
// Loaded by Node (score.js, tools/voice.js) and by the browser (index.html), so it is a UMD file.
(function () {
  // verse: 8 bars, one spoken phrase per bar. Bars 4 and 5 end with the animal's sound on beat 4.
  // chorus: 8 bars. Bars 1 and 3 are "action" bars (three hops on beats 1, 2, 3); bar 4 gets claps, bar 5 stomps.
  const ANIMALS = {
    frog: {
      name: 'Frog', color: '#5DBB4A', beat: 'froggy', sound: 'boing', move: 'Hop',
      verse: ['Little frog, little frog,', 'sitting on a log!', 'Wiggle, wiggle, wiggle,', 'goes the little green frog!',
        'Hop to the left!', 'Hop to the right!', 'Wiggle, wiggle, wiggle,', 'in the morning light!'],
      chorus: ['Ribbit, ribbit!', 'Hop, hop, hop!', 'Ribbit, ribbit!', 'Never stop!'],
    },
    duck: {
      name: 'Duck', color: '#FFD23F', beat: 'ducky', sound: 'Quack!', move: 'Flap',
      verse: ['Little duck, little duck,', 'splashing in the pond!', 'Waddle, waddle, waddle,', 'with a quack-quack song!',
        'Flap to the left!', 'Flap to the right!', 'Waddle, waddle, waddle,', 'what a silly sight!'],
      chorus: ['Quack, quack!', 'Flap, flap, flap!', 'Quack, quack!', 'Clap, clap, clap!'],
    },
    bee: {
      name: 'Bee', color: '#FFC233', beat: 'buzzy', sound: 'Bzzz!', move: 'Buzz',
      verse: ['Little bee, little bee,', 'buzzing in the sun!', 'Zoom, zoom, zooming,', 'having so much fun!',
        'Buzz to the left!', 'Buzz to the right!', 'Zoom, zoom, zooming,', 'what a happy flight!'],
      chorus: ['Buzz, buzz!', 'Zoom, zoom, zoom!', 'Buzz, buzz!', 'Flowers bloom!'],
    },
    cat: {
      name: 'Cat', color: '#F29A4A', beat: 'kitty', sound: 'Meow!', move: 'Pounce',
      verse: ['Little cat, little cat,', 'sitting on a mat!', 'Wiggle, wiggle, wiggle,', 'goes the fluffy cat!',
        'Pounce to the left!', 'Pounce to the right!', 'Wiggle, wiggle, wiggle,', 'in the cozy light!'],
      chorus: ['Meow, meow!', 'Pounce, pounce, pounce!', 'Meow, meow!', 'Bounce, bounce, bounce!'],
    },
    pup: {
      name: 'Puppy', color: '#C98A4B', beat: 'puppy', sound: 'Woof!', move: 'Wag',
      verse: ['Little pup, little pup,', 'playing in the yard!', 'Waggle, waggle, waggle,', 'wag your tail so hard!',
        'Wag to the left!', 'Wag to the right!', 'Waggle, waggle, waggle,', 'with all your might!'],
      chorus: ['Woof, woof!', 'Wag, wag, wag!', 'Woof, woof!', 'Zig and zag!'],
    },
  };
  for (const k in ANIMALS) {
    const a = ANIMALS[k];
    a.id = k;
    a.chorus = [...a.chorus, 'Clap your hands,', 'and stomp your feet!', `Wiggle to the ${a.beat} beat!`, 'Yay!'];
  }

  const FINAL = ['Ribbit! Quack!', 'Buzz, buzz, buzz!', "That's what every friend here does!", null,
    'Clap your hands,', 'and stomp your feet!', 'Wiggle to the froggy beat!', 'Yay!'];
  const SLEEPY = ['Little frog, little frog,', 'sleepy on a log.', 'Night-night, night-night,', 'little green frog.'];

  // the bedtime version: one phrase per (slow) bar
  const LULLABY = [
    { animal: 'frog', lines: ['Little frog, little frog,', 'sleepy on a log.', 'Close your eyes, close your eyes,', 'little green frog.'] },
    { animal: 'duck', lines: ['Little duck, little duck,', 'floating on the pond.', 'Hush now, hush now,', 'the day is gone.'] },
    { animal: 'bee', lines: ['Little bee, little bee,', 'snuggled in a flower.', 'Dream sweet dreams,', 'in the moonlight hour.'] },
    { animal: 'all', lines: ['Night-night, frog.', 'Night-night, duck.', 'Night-night, bee.', 'And night-night, me.'] },
  ];

  // ---------- the week ----------
  const EPISODES = {
    1: { slug: 'day1-full-song', title: 'Wiggle Wiggle Little Frog', sub: 'the full sing-along', format: '16:9', kind: 'song', animals: ['frog', 'duck', 'bee'], final: true },
    2: { slug: 'day2-frog-short', title: 'Wiggle Wiggle Little Frog', sub: 'hop with the frog!', format: '9:16', kind: 'song', animals: ['frog'] },
    3: { slug: 'day3-duck-short', title: 'Waddle Waddle Little Duck', sub: 'flap with the duck!', format: '9:16', kind: 'song', animals: ['duck'] },
    4: { slug: 'day4-bee-short', title: 'Zoom Zoom Little Bee', sub: 'buzz with the bee!', format: '9:16', kind: 'song', animals: ['bee'] },
    5: { slug: 'day5-cat-short', title: 'Wiggle Wiggle Little Cat', sub: 'pounce with the cat!', format: '9:16', kind: 'song', animals: ['cat'] },
    6: { slug: 'day6-puppy-short', title: 'Waggle Waggle Little Pup', sub: 'wag with the puppy!', format: '9:16', kind: 'song', animals: ['pup'] },
    7: { slug: 'day7-bedtime-lullaby', title: 'Night-Night Little Frog', sub: 'a bedtime lullaby', format: '16:9', kind: 'lullaby', animals: ['frog', 'duck', 'bee'] },
  };

  const LYRICS = { ANIMALS, FINAL, SLEEPY, LULLABY, EPISODES };
  if (typeof module !== 'undefined') module.exports = LYRICS; else globalThis.LYRICS = LYRICS;
})();
