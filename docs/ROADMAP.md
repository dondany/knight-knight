# Roadmap

A working first version exists. This file tracks what has not been checked and what could come next.

## Not yet verified by a person

Everything below was only exercised through scripted headless tests, never played by hand:

- **Difficulty.** Rivals are a greedy bot. Whether a run is too easy or too hard is unknown.
- **Feel.** Drag and drop, battle pacing at 1×, how readable a busy fight is.
- **Sound.** The synthesised effects have never been listened to.
- **Touch.** Tap-to-select and dragging on a real phone. There is no portrait layout; a phone in
  landscape gets a 2× scale with small text.
- **Other browsers.** Only Chrome was used. Safari and Firefox are untested.

## Known weak spots

- **Mercenaries.** One mercenary plus four different armies turns on four tier-1 bonuses. May be
  too strong, or may be a fun build. Needs play.
- **Romans** sit a few points above the other armies in bot-vs-bot win rate; Medieval and
  Japanese sit lowest. Tithe (extra gold) is probably undervalued by the bot rather than weak.
- **Draws** are around 14% of bot-vs-bot battles and currently cost nothing.
- **Late game.** Bot armies plateau around tier 4 and level 1.5 by turn 12; a player who merges
  well may outscale them. Rivals could get a boost in later turns.
- **Unit names and abilities** were assigned by looking at each sprite. Some are guesses.
- **Item variety** is thin (7 items), and every unit costs the same regardless of tier.
- **Local art edits** need `tools/embed_sprite.py` to show up when opening the file from disk.

## Ideas

- Attack and walk animation frames, if the sprite sheet grows.
- A battle log or step-by-step replay.
- A collection screen listing every unit, ability and army bonus.
- Daily seed or shareable run code (the simulator is already deterministic per seed).
- Real opponents: store finished armies per turn and fight other players' saved line-ups.
- More armies; rows can simply be added to the sheet.
- Portrait layout for phones.
- Background music.
