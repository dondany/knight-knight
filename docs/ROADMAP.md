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
- **The card hand.** The shop's cards (deal-in, the discard on a roll, the row re-centring after a
  purchase, a dragged card turning into its unit above the hand) were checked frame by frame, never
  in motion. Card names are DOM text placed over canvas cards each frame; whether the two stay
  glued together at speed and on fractional scales is unknown.
- **Other browsers.** Only Chrome was used. Safari and Firefox are untested.

## Known weak spots

- **Story start is thin.** With only the Medieval army there are five units, and turn 1 offers
  nothing but Peasants. It works (and merges come fast) but the first expedition has little choice.
- **Each expedition starts from scratch.** The only things carried between regions are the armies
  and +1 starting gold per land. A persistent army, relics or upgrades could give more of a campaign.
- **Region difficulty** now falls with the danger rating by the bot's measure, but tuning is very
  sensitive: one rival gold can swing a region from 25% to 90%, and any buff to a tier-1 unit
  brings the champion a turn earlier. Thebes and Sparta sit on the edge of their bands.
- **Mercenaries are weak for the bot.** Since they stopped switching bonuses on alone, bot teams
  holding one win 38% and lose 54% against teams without (they were 53/39 before, which was the
  exploit). The gap opens from turn 7. The bot still values them like favoured-army units, and
  Sellsword's ability never fires for it because it never leaves 2 gold unspent.
- **Skirmish balance.** The armies are within 1.6 points of each other on a large sweep. Draws are
  about 12% of battles and cost nothing.
- **Late skirmish.** Bot armies plateau around tier 4 and level 1.7 by turn 14.
- **Unit names and abilities** were assigned by looking at each sprite. Some are guesses.
- **The world map** is a rough hand-drawn polygon set. Sparta and Rome sit close together.
- **Item variety** is thin (7 items), and every unit costs the same regardless of tier.
- **Local art edits** need `tools/embed_sprite.py` to show up when opening the file from disk.

## Ideas

Worked-out proposals live in `docs/ideas.html`: three more units for every army (fixes the thin
story start), five new armies with a land each, and a table of ideas from other auto-battlers with
the best fits marked. None of the 46 proposed units has a sprite yet; `docs/art-refs.html` has a
drawing brief and reference pictures for each. The short list below is the rest.

- Campaign depth: persistent veterans, a relic per conquered land, optional side battles, a final
  boss fielding every army.
- Region modifiers (snow slows the first attack, desert drains health, and so on).
- Attack and walk animation frames, if the sprite sheet grows.
- A battle log or step-by-step replay.
- Daily seed or shareable run code (the simulator is already deterministic per seed).
- Real opponents: store finished armies per turn and fight other players' saved line-ups.
- More armies and regions; rows can simply be added to the sheet.
- Portrait layout for phones.
- Background music.
