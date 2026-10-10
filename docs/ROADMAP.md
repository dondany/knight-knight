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
- **Freezing.** The frost creeping over a card, the shine, the ice shattering on a thaw or a
  purchase, the frozen cards holding through a roll and the sold unit whisked off its slab were
  checked as still frames only, and none of the new sounds has been heard. Right-click to freeze
  has no touch counterpart: on a phone it is select, then the Freeze button.
- **Other browsers.** Only Chrome was used. Safari and Firefox are untested.

## Known weak spots

- **Story start is thin.** With only the Medieval army there are five units, and turn 1 offers
  nothing but Peasants. It works (and merges come fast) but the first expedition has little choice.
- **Each expedition starts from scratch.** The only things carried between regions are the armies
  and +1 starting gold per land. A persistent army, relics or upgrades could give more of a campaign.
- **Region difficulty** now falls with the danger rating by the bot's measure, but tuning is very
  sensitive: one rival gold can swing a region from 25% to 90%, and any buff to a tier-1 unit
  brings the champion a turn earlier. Thebes and Sparta sit on the edge of their bands.
- **Furor is new and only the bot has played it.** The Gauls stopped being the wild army and got
  their own bonus: a Gaul that attacks gains +2/+2, or +4/+4 with four Gauls. It was sized so a
  Gauls-only bot team wins as often as the other single-army teams (47%); a bot that favours Gauls
  in a mixed draft is the strongest of the seven by about half a point, which is inside the noise.
  Whether one Gaul snowballing at the front is fun to play with or against is unknown. If it is
  too much, the numbers are the `2*sl(u,'gaul')` in `simulateBattle`.
- **The Poles are new and only the bot has played them.** They are the eighth army: Kosynier,
  Haiduk, Pancerny, Husarz and Hetman, with Kraków as their land. Against the Odds gives every
  Pole +2/+2 (+4/+4 with four) the first time the enemy outnumbers you in a battle. Whether
  leaving a slot empty on purpose feels clever or just odd is unknown; for an all-Polish bot it
  is worth about 5 points.
- **Against the Odds is not the bonus first proposed.** "Poles deal more damage while outnumbered"
  was nearly worthless on attacks alone and absurd once it added to the Hetman's hit on every
  enemy. The numbers are in `docs/DESIGN.md`. The bonus that went in is a single rally.
- **Kraków punishes the obvious line-up.** Its rivals field four, so a full army of five sets off
  their rally. The bot wins 52% with five units and 72% with four; a player who does not read the
  blurb may find a danger-3 land much harder than it looks. The champion is Jan III Sobieski as
  a Husarz with no stat bonus: as a Hetman his Odsiecz hit a five-unit player at the start of
  the last battle and the bot won 4% of expeditions.
- **Kyoto reads a little easy now.** With the Poles in the pool the bot conquers it 58% of the
  time (800 runs) against a 45 to 55% target for danger 4. A champion bonus of +1 brings it to 51%.
- **The Ambactus's ability never fires for the bot**, because it never leaves 2 gold unspent. The
  ability also dates from when he was the Sellsword of the Mercenaries.
- **Skirmish balance.** The armies are within 2.1 points of each other on a large sweep. Draws are
  about 10% of battles and cost nothing.
- **Late skirmish.** Bot armies plateau around tier 4 and level 1.7 by turn 14.
- **Unit names and abilities** were assigned by looking at each sprite. Some are guesses.
- **The Gauls' names are first guesses.** The army was called Mercenaries until its row of the
  sheet was finished as Gauls. The rename picked: Ambactus (a chief's sworn retainer) for the old
  Sellsword, Gaesatus (the spearmen who fought stripped) for the old Barbarian, Alesia for the
  land and Vercingetorix, a Chieftain, for its champion. Nobody but the bot has seen them yet.
- **Alesia is easy as a first conquest and hard as a fifth.** It sits next to Camelot with a
  danger of 3. Its rivals now field only Gauls on 5 gold a turn. A bot that owns only the Medieval
  army merges fast and conquers it every time; a bot with five armies to pick from wins 66%. The
  other lands show the same gap (Kyoto 96% against 50%), so the danger ratings are only true for
  the order in the table. Kyoto is now reached straight from the
  Norse Fjords or Thebes, so a player can march on it after a single conquest. The steppe in the
  middle of the map is empty; `docs/ideas.html` has armies proposed for it.
- **Alesia's rival gold is a cliff.** With Furor, a Gauls-only rival on 6 to 9 gold a turn buys
  two units a turn and the five-army bot conquers the land 3 to 30% of the time; on 5 gold it buys
  one and the rate is 66%. There is no setting in between, so the champion's bonus (+3/+6) is the
  fine knob.
- **The wild rule has no army.** It is kept in the code behind a `wild` flag and was checked with a
  throwaway army, but nothing in the game uses it. `docs/ideas.html` proposes the Mercenaries for
  it, hired in every story expedition from turn 1 as the fix for the thin story start.
- **The Chieftain was reworded with Furor.** *Confederation* counted every different army on the
  team, which made sense for a wild unit and left him a bare 5/6 among his own. He now gains
  +1/+1 for each other Gaul and each other army, so he is as good leading four Gauls as leading
  four allies.
- **The world map** is a rough hand-drawn polygon set. Sparta and Rome sit close together.
- **Item variety** is thin (7 items), and every unit costs the same regardless of tier.
- **Local art edits** need `tools/embed_sprite.py` to show up when opening the file from disk.

## Ideas

Worked-out proposals live in `docs/ideas.html`: three more units for every army, five new armies
with a land each, the Mercenaries as the wild army (for hire from the start, which fixes the thin
story start), and a table of ideas from other auto-battlers with the best fits marked. The three
Gauls and the five Poles from that page are drawn and in the game; the other 48 proposed units
have no sprite yet. `docs/art-refs.html` has a drawing brief and reference pictures for 43 of
them; the Mercenaries have none yet. The short list below is the rest.

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
