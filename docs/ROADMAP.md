# Roadmap

Story mode, skirmish mode and a first pass of game feel exist. This file tracks what has not been
checked and what could come next.

## Not yet verified by a person

Everything was exercised through scripted headless tests and still screenshots. Nobody has played
it by hand, so the things that only show up in motion are unverified:

- **Feel of the juice.** Screen shake strength, hit-stop length, slow motion on the last blow,
  flash brightness, how busy the particles get at 4× speed. All of it was tuned by reasoning, not
  by eye. If something is too much, the numbers are in the `PLAY` handlers and the juice helpers.
- **Sound.** The synthesised effects have never been listened to.
- **Difficulty.** Rivals are a greedy bot. Story regions were tuned so that a bot player conquers
  them 45–90% of the time; whether that feels right to a person is unknown.
- **Transitions and the map walk** in a real browser (verified only by pumping frames by hand).
- **Touch.** Tap-to-select and dragging on a real phone. There is no portrait layout; a phone in
  landscape gets a 2× scale with small text.
- **Other browsers.** Only Chrome was used. Safari and Firefox are untested.

## Known weak spots

- **Story start is thin.** With only the Medieval army there are five units, and turn 1 offers
  nothing but Peasants. It works (and merges come fast) but the first expedition has little choice.
- **Each expedition starts from scratch.** The only things carried between regions are the armies
  and +1 starting gold per land. A persistent army, relics or upgrades could give more of a campaign.
- **Region difficulty is uneven** by the bot's measure: Thebes is easier than its danger rating,
  Samarkand is the hardest, and champions are beaten 30–50% of the time. Tuning is very sensitive
  to the rival's gold (one gold can swing a region from 25% to 90%).
- **Mercenaries.** One mercenary plus four different armies turns on four tier-1 bonuses.
- **Skirmish balance.** Romans sit a few points above the other armies in bot-vs-bot win rate;
  Medieval and Japanese sit lowest. Draws are about 14% of battles and cost nothing.
- **Late skirmish.** Bot armies plateau around tier 4 and level 1.7 by turn 14.
- **Unit names and abilities** were assigned by looking at each sprite. Some are guesses.
- **The world map** is a rough hand-drawn polygon set. Sparta and Rome sit close together.
- **Item variety** is thin (7 items), and every unit costs the same regardless of tier.
- **Local art edits** need `tools/embed_sprite.py` to show up when opening the file from disk.

## Ideas

- Campaign depth: persistent veterans, a relic per conquered land, optional side battles, a final
  boss fielding every army.
- Region modifiers (snow slows the first attack, desert drains health, and so on).
- Attack and walk animation frames, if the sprite sheet grows.
- A battle log or step-by-step replay.
- A collection screen listing every unit, ability and army bonus.
- Daily seed or shareable run code (the simulator is already deterministic per seed).
- Real opponents: store finished armies per turn and fight other players' saved line-ups.
- More armies and regions; rows can simply be added to the sheet.
- Portrait layout for phones.
- Background music.
