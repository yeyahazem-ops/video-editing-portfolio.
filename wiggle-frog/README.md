# Wiggle Wiggle Little Frog — a week of videos

Seven animated sing-along videos for one nursery rhyme. Every frame is drawn in code, the music is synthesized in code,
and the words are spoken by a text-to-speech voice. One timeline (`score.js`) drives the sound and the picture.

## The week

| day | file (`videos/`) | format | what it is |
|---|---|---|---|
| 1 | `day1-full-song.mp4` | 16:9 | The full song: frog, duck and bee verses, the big last chorus, and a goodnight ending |
| 2 | `day2-frog-short.mp4` | 9:16 | Short: the frog verse and chorus |
| 3 | `day3-duck-short.mp4` | 9:16 | Short: the duck verse and chorus |
| 4 | `day4-bee-short.mp4` | 9:16 | Short: the bee verse and chorus |
| 5 | `day5-cat-short.mp4` | 9:16 | Short: a new verse, the cat |
| 6 | `day6-puppy-short.mp4` | 9:16 | Short: a new verse, the puppy |
| 7 | `day7-bedtime-lullaby.mp4` | 16:9 | A slow bedtime version: the frog, the duck and the bee fall asleep |

## Suggested titles

1. Wiggle Wiggle Little Frog 🐸 | Animal Dance Song for Kids | Nursery Rhymes & Kids Songs
2. Hop With the Frog! 🐸 Wiggle Wiggle Little Frog #shorts
3. Flap With the Duck! 🦆 Waddle Waddle Little Duck #shorts
4. Buzz With the Bee! 🐝 Zoom Zoom Little Bee #shorts
5. Pounce With the Cat! 🐱 Wiggle Wiggle Little Cat #shorts
6. Wag With the Puppy! 🐶 Waggle Waggle Little Pup #shorts
7. Night-Night Little Frog 🌙 | Bedtime Lullaby for Kids

## Rebuild

Needs Node 22+, ffmpeg and Chrome. No `npm install`.

```bash
node make.js          # all seven -> videos/
node make.js 3        # only day 3
```

- `lyrics.js`: the words of every animal and the list of episodes. Add an animal or change a line here.
- `tools/voice.js`: speaks any new phrase (ElevenLabs, needs `ELEVENLABS_API_KEY`) into `assets/vo/` and rewrites `voice-data.js`.
- `score.js`: the timeline. `song.js`: the music. `film.js` and `animals.js`: the picture.
- `engine/`: the drawing and audio toolkit (unchanged).
