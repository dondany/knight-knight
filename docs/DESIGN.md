# Game design

The numbers here mirror `index.html`. The unit and item tables are generated: after changing
content run `tools/sim.py tools/units.js` and paste the output over them.

## Modes

**Skirmish** is a single run with every army on offer: 5 lives, 10 wins.

**Story** is a campaign across a world map. You start in Camelot owning only the Medieval army.
Each other region is a short expedition, a fresh run with its own rules:

- 3 lives, and 3 to 5 wins needed depending on the region.
- Recruits come only from armies you own (Medieval plus every conquered region's army).
- Tiers unlock one per turn (turn 1 = tier 1 … turn 6 = tier 6), so short runs still reach big units.
- +1 gold on the first turn for every land already conquered ("Tribute").
- Rivals field only that region's army, with a smaller army and less gold in the early regions.
- The battle that would complete the goal is against the region's **champion**: the usual rival
  army plus a named leader with bonus stats.
- Win and the region's army is yours for every later expedition. Lose all 3 lives and you are back
  on the map with nothing lost; retreating from the shop does the same.

A region can be attacked once a road reaches it from conquered land.

| Region | Army unlocked | Wins | Rival army size | Rival gold | Champion | Bonus | Roads to |
|---|---|---|---|---|---|---|---|
| Camelot (home) | Medieval | – | – | – | – | – | Norse Fjords, Alesia, Rome |
| Norse Fjords | Vikings | 3 | 3 | 7 | Jarl Ragnar (Jarl) | +1/+2 | Camelot, Kraków, Kyoto |
| Rome | Romans | 3 | 3 | 7 | Caesar | +2/+4 | Camelot, Kraków, Alesia, Sparta |
| Sparta | Spartans | 4 | 4 | 5 | King Leonidas | +2/+4 | Rome, Thebes |
| Kraków | Poles | 4 | 4 | 5 | Jan III Sobieski (Husarz) | none | Norse Fjords, Rome |
| Thebes | Egyptians | 4 | 4 | 8 | The Pharaoh | +1/+2 | Sparta, Kyoto |
| Alesia | Gauls | 5 | 4 | 5 | Vercingetorix (Chieftain) | +3/+6 | Camelot, Rome |
| Kyoto | Japanese | 5 | 5 | 8 | The Shogun (Samurai) | none | Norse Fjords, Thebes |

Alesia's rivals field only Gauls, like every other land's (they drafted from every army while
the Gauls were the wild army and had no bonus of their own). Alesia sits next to Camelot and can be
attacked first; it is rated danger 3 for a player who already owns several armies.

Kraków is a puzzle more than a wall. Its rivals field four Poles, so a player who marches in with
five units outnumbers them, and that switches on Against the Odds for the whole rival line before
the first clash. Match their four and it never fires. The bot conquers Kraków 52% of the time
fielding five and 72% fielding four; the land's blurb hints at it.

Conquering all seven ends the story.

## Run structure

- Skirmish: 5 lives, 10 wins. Story expeditions: 3 lives and the region's win count.
- A loss costs 1 life; a draw costs nothing. Every battle advances the turn.
- 10 gold each turn. Unspent gold is lost.
- Units and items cost 3. A reroll costs 1. Selling a unit returns gold equal to its level.
- 5 army slots. Slot 0 is the front (drawn on the right in the shop).
- Stats cap at 50.

| Skirmish turn | Story turn | Unit tiers on offer | Recruit slots | Item slots |
|---|---|---|---|---|
| 1–2 | 1 | 1 | 3 | 1 |
| 3–4 | 2 | 1–2 | 3 | 1 |
| 5–6 | 3 | 1–3 | 4 | 2 |
| 7–8 | 4 | 1–4 | 4 | 2 |
| 9–10 | 5 | 1–5 | 5 | 2 |
| 11+ | 6+ | 1–6 | 5 | 2 |

Recruits and items are drawn uniformly from everything unlocked. Frozen entries survive rerolls
and turn changes.

## Merging and levels

- Dropping a unit on a copy of itself merges them: the result takes the higher attack and the
  higher health of the two, plus 1 each, and the combined experience plus 1.
- Level 2 at 2 experience (three copies), level 3 at 5 (six copies). Level 3 units cannot merge.
- Gear stays with the unit being merged into; if it has none it inherits the other's.
- Levelling up adds one bonus recruit from the next tier up to the shop (at most 6 recruits shown).
  In story mode, if no owned army has a unit of that tier, it is the highest tier available below it.
- Every ability has three strengths, one per level.

## Armies

A bonus switches on with 2 units of an army and improves with 4. Duplicates count.

| Army | Bonus | 2 units | 4 units | Where it applies |
|---|---|---|---|---|
| Medieval | Tithe | +1 gold at the start of each turn | +3 gold | Shop |
| Vikings | Blood Rage | When a Viking faints, the other Vikings gain +1/+1 | +2/+2 | Battle |
| Spartans | Phalanx | Spartans take 1 less damage (min 1) | 2 less | Battle |
| Egyptians | Afterlife | The first Egyptian to faint rises as a Mummy with half its attack and half its starting health | Every Egyptian rises once | Battle |
| Romans | Drill | End of turn: a random Roman gains +1 health permanently | Every Roman does | Shop |
| Japanese | Bushido | Each Japanese unit deals +2 damage with its first attack | +5 | Battle |
| Gauls | Furor | After a Gaul attacks, it gains +2/+2 | +4/+4 | Battle |
| Poles | Against the Odds | The first time the enemy outnumbers you in a battle, every Pole gains +2/+2 | +4/+4 | Battle |

Furor goes to a Gaul that attacked and is still standing, after its own after-attack ability, and
lasts for that battle. Only the front unit attacks, so it rewards keeping one Gaul alive at the
front: the Carnyx Player's health feeds it, and the Gaesatus stacks his own Frenzy on top.

Against the Odds fires once a battle, the moment the enemy has more units standing than you: at
the very start if you field the shorter line, otherwise after the deaths that put you behind. It
lasts for that battle. Four Poles and an empty fifth slot get +4/+4 each before anything else
happens, and the Hetman's Odsiecz fires at the same moment; a fifth unit delays both until you
are already losing. The Pancerny's Hold Fast uses the same count but is on for as long as you are
outnumbered.

It was first written as "Poles deal +2/+4 damage while outnumbered". That tested badly: counting
only attacks it was worth almost nothing (single-army Poles won 21%, against 16% with no bonus),
and counting ability damage too it turned the Hetman's Odsiecz into 7 damage to every enemy at
the start of a battle. The rally is worth as much as the other bonuses and happens at one moment
you can see.

**Wild is a rule without an army.** The Gauls were the wild army (called Mercenaries before that)
until their row was complete and they got Furor. The rule is still in the code for a future army:
flag an army `wild:true` in `FACTIONS` and each of its units adds 1 to the count of every army
that already has 2 real members on the team, and receives those armies' bonuses itself. So a wild
unit pushes an active bonus toward its 4-unit tier but cannot switch a bonus on alone, and a team
of only wild units has no bonus. `docs/ideas.html` proposes the Mercenaries for it.

Mummies are tokens: no ability, no army bonus, and they are never raised a second time.

## Units

`ATK/HP` are base stats. Sprite is the cell in `characters.PNG`.

| Army | Unit | Tier | ATK/HP | Ability | Effect (Lv1 / Lv2 / Lv3) | Sprite (col,row) | Key |
|---|---|---|---|---|---|---|---|
| Medieval | Peasant | 1 | 3/2 | Harvest | Sell: gain 1 / 2 / 3 extra gold. | 2,0 | `peasant` |
| Medieval | Longbowman | 2 | 2/3 | Volley | Start of battle: deal 2 / 4 / 6 damage to the rearmost enemy. | 0,0 | `longbow` |
| Medieval | Knight | 3 | 3/4 | Plate Armor | Blocks the first hit / 2 hits / 3 hits it takes each battle. | 1,0 | `knight` |
| Medieval | Halberdier | 4 | 4/5 | Reach | Before attack: deal 3 / 6 / 9 damage to the enemy behind the front. | 4,0 | `halberdier` |
| Medieval | King | 6 | 5/7 | Royal Decree | Start of battle: give every other friend +2/+2 / +4/+4 / +6/+6. | 3,0 | `king` |
| Vikings | Raider | 1 | 2/1 | Last Gift | Faint: give a random friend +2/+1 / +4/+2 / +6/+3. | 0,1 | `raider` |
| Vikings | Berserker | 2 | 2/4 | Fury | Hurt: gain +2 / +4 / +6 attack. | 1,1 | `berserker` |
| Vikings | Huscarl | 3 | 3/4 | Avenger | Friend ahead faints: gain +2/+2 / +4/+4 / +6/+6. | 2,1 | `huscarl` |
| Vikings | Skald | 4 | 2/4 | War Horn | Start of battle: give all friends ahead +1/+1 / +2/+2 / +3/+3. | 4,1 | `skald` |
| Vikings | Jarl | 5 | 6/6 | Rampage | Knockout: deal 5 / 10 / 15 damage to the next enemy. | 3,1 | `jarl` |
| Spartans | Peltast | 1 | 2/2 | Javelins | Start of battle: deal 1 damage to 1 random enemy / 2 random enemies / 3 random enemies. | 3,2 | `peltast` |
| Spartans | Hoplite | 2 | 2/3 | Spear Wall | Friend ahead attacks: deal 1 / 2 / 3 damage to the front enemy. | 0,2 | `hoplite` |
| Spartans | Phalangite | 3 | 2/6 | Aspis | Takes 1 / 2 / 3 less damage from every hit (min 1). | 1,2 | `phalangite` |
| Spartans | Lochagos | 4 | 3/5 | Hold the Line | Start of battle: give adjacent friends +1/+3 / +2/+6 / +3/+9. | 4,2 | `lochagos` |
| Spartans | Leonidas | 6 | 7/7 | This is Sparta! | Start of battle: kick the front enemy to the back of their line for 5 / 10 / 15 damage. | 2,2 | `leonidas` |
| Egyptians | Laborer | 1 | 1/3 | Tribute | Buy: give a random friend +1/+1 / +2/+2 / +3/+3. | 0,3 | `laborer` |
| Egyptians | Medjay | 2 | 3/3 | Embalmed | Faint: rise as a 3/3 / 6/6 / 9/9 Mummy. | 3,3 | `medjay` |
| Egyptians | Priest of Set | 3 | 2/4 | Curse | Start of battle: the strongest enemy loses 3 / 6 / 9 attack (min 1). | 1,3 | `priest` |
| Egyptians | Cleopatra | 5 | 5/6 | Asp | After attack: deal 4 / 8 / 12 damage to the weakest enemy. | 4,3 | `cleopatra` |
| Egyptians | Pharaoh | 6 | 4/8 | Eternal Kingdom | Friend faints: raise it as a 4/4 / 8/8 / 12/12 Mummy. | 2,3 | `pharaoh` |
| Romans | Velite | 1 | 3/1 | Parting Shot | Faint: deal 2 / 4 / 6 damage to a random enemy. | 3,4 | `velite` |
| Romans | Legionary | 2 | 2/2 | Formation | Start of battle: gain +1/+1 / +2/+2 / +3/+3 for each other Roman friend. | 0,4 | `legionary` |
| Romans | Aquilifer | 3 | 2/4 | Eagle Standard | End of turn: give the friend ahead +1 / +2 / +3 attack for good. | 2,4 | `aquilifer` |
| Romans | Centurion | 4 | 4/5 | Command | Before attack: give the friend behind +2/+1 / +4/+2 / +6/+3. | 1,4 | `centurion` |
| Romans | Caesar | 5 | 5/5 | Veni, Vidi, Vici | Start of battle: deal 3 / 6 / 9 damage to the three front enemies. | 4,4 | `caesar` |
| Japanese | Ashigaru | 1 | 2/2 | Vanguard | Start of battle: if in the front slot, gain +1/+2 / +2/+4 / +3/+6. | 3,5 | `ashigaru` |
| Japanese | Ronin | 2 | 3/3 | Blood Price | Knockout: gain +2/+2 / +4/+4 / +6/+6. | 0,5 | `ronin` |
| Japanese | Yumi Archer | 3 | 1/3 | Arrow Rain | Friend ahead attacks: deal 2 / 4 / 6 damage to the rearmost enemy. | 2,5 | `yumi` |
| Japanese | Sohei | 4 | 3/6 | Ward | Start of battle: the friend ahead blocks its / the 2 friends ahead block their / the 3 friends ahead block their first hit. | 4,5 | `sohei` |
| Japanese | Samurai | 5 | 6/4 | Iaido | Strikes first: an enemy it fells cannot strike back. Attacks deal +0 / +3 / +6 damage. | 1,5 | `samurai` |
| Gauls | Carnyx Player | 1 | 1/2 | Rally | End of turn: give the friend ahead +1 / +2 / +3 health for good. | 4,6 | `carnyx` |
| Gauls | Druid | 2 | 2/3 | Omen | Start of battle: deal 3 / 6 / 9 damage to the enemy with the highest attack. | 1,6 | `druid` |
| Gauls | Ambactus | 3 | 3/5 | Paid in Gold | End of turn: if you have 2+ unspent gold, gain +1/+1 / +2/+2 / +3/+3 for good. | 2,6 | `ambactus` |
| Gauls | Gaesatus | 4 | 5/5 | Frenzy | After attack: gain +2 / +4 / +6 attack. | 0,6 | `gaesatus` |
| Gauls | Chieftain | 5 | 4/5 | Confederation | Start of battle: gain +1/+1 / +2/+2 / +3/+3 for each other Gaul and each other army on your team. | 3,6 | `chieftain` |
| Poles | Kosynier | 1 | 3/1 | Scythes Upright | Before attack: deal 1 / 2 / 3 damage to the front enemy. | 0,7 | `kosynier` |
| Poles | Haiduk | 2 | 2/3 | Salvo | Friend ahead faints: deal 3 / 6 / 9 damage to the front enemy. | 4,7 | `haiduk` |
| Poles | Pancerny | 3 | 3/5 | Hold Fast | Takes 1 / 2 / 3 less damage (min 1) while the enemy has more units standing. | 3,7 | `pancerny` |
| Poles | Husarz | 5 | 6/5 | Szarża | Its first attack also strikes the enemy / 2 enemies / 3 enemies behind the front. | 1,7 | `husarz` |
| Poles | Hetman | 6 | 5/7 | Odsiecz | The first time the enemy outnumbers you each battle: deal 3 / 6 / 9 damage to every enemy. | 2,7 | `hetman` |

Trigger vocabulary: *Start of battle* (resolved highest attack first), *Before attack* / *After
attack* (the front unit), *Friend ahead attacks* (the second unit in line), *Hurt* (took damage
and survived), *Faint*, *Knockout* (killed the enemy front with its attack), *Friend ahead
faints*, *Friend faints*, *Outnumbered* (the first time each battle the enemy has more units
standing, checked at the start and after every round of deaths), and the shop triggers *Buy*,
*Sell*, *End of turn*.

## Items

Supplies are used up. Gear stays on the unit; a unit holds one piece and a new one replaces it.

| Item | Tier | Kind | Effect | Key |
|---|---|---|---|---|
| Ration | 1 | Supply | Give a unit +1/+1. | `ration` |
| Whetstone | 2 | Gear | Attacks deal +3 damage. | `whetstone` |
| Chainmail | 3 | Gear | Take 2 less damage (min 1). | `chainmail` |
| Feast | 4 | Supply | Give 3 random units +1/+1. | `feast` |
| War Manual | 4 | Supply | Give a unit +1 experience. | `manual` |
| Tower Shield | 5 | Gear | Block the first hit each battle. | `shield` |
| Ankh | 6 | Gear | Once per battle, return from death as a 1/1. | `ankh` |

## Battle rules in short

1. A side that starts with the shorter line is outnumbered at once: Against the Odds and Odsiecz
   fire. Then start-of-battle abilities fire in order of attack, highest first.
2. The two front units hit each other at the same time. First-attack and gear bonuses are added to
   the hit, then blocks and damage reduction apply. Damage never drops below 1 unless blocked.
3. A Husarz's first attack carries on into the units behind. Support abilities, after-attack
   abilities, Furor and knockouts fire, then deaths resolve: faint ability, Ankh, Afterlife,
   Blood Rage, then the reactions of surviving friends. If the deaths leave a side outnumbered for
   the first time, Against the Odds and Odsiecz fire.
4. Repeat until a side is empty. Both empty is a draw.

The exact order is in `docs/ARCHITECTURE.md`.

## Opponents

There is no multiplayer. Each rival is produced on the spot by a bot that plays the same shop for
the same number of turns:

- It favours one random army, fills empty slots first, merges duplicates, and
  replaces its weakest unit when a clearly better one shows up.
- It buys gear for ungeared units, War Manuals and Feasts when the army has 3+ units, and rerolls
  with whatever gold is left.
- It wastes 0–2 gold a turn (fixed per rival) so strength varies between opponents.
- It lines units up by each unit's placement hint, tougher units first within a group.
- A bot that favours the Poles stops recruiting at four units once all four are Poles, so that
  Against the Odds fires at the start. That is worth about 5 points to an all-Polish team and
  costs a mixed team about 5, so it never does it with fewer than four Poles.
- The army's name comes from whichever army it ended up fielding most.
- Story rivals are the same bot with a restricted pool, an army-size cap and a fixed income
  (see the region table). Skirmish rivals have no cap and waste 0–2 gold as above.

## Battlefields

The backdrop follows the enemy army's homeland: dusk castle (Medieval), snowfield with falling
snow (Vikings), green hills and an aqueduct (Romans), rocky coast with a temple (Spartans), desert
and pyramids with blowing sand (Egyptians), a misty oak forest with thatched huts and a palisade (Gauls), a red
sun over Fuji with drifting petals (Japanese), and green fields with a band of wheat, Wawel castle
on its hill and a red-and-white banner (Poles). Purely cosmetic.

## Balance snapshot

Bot against bot, from `tools/sim.py`. This says how the armies compare when played by the same
simple bot. It says nothing about how hard the game is for a person, which has not been measured.

This sweep is small (about 500 battles per army), so each rate is only good to about ±2 points.
On a 21,000-battle sweep the armies sit within 2.1 points of each other: Medieval 43.4, Vikings
43.4, Spartans 45.5, Egyptians 43.4, Romans 44.6, Japanese 43.7, Gauls 45.1, Poles 44.2, with
11.7% draws.

Those bots favour one army but draft from all eight, so an army bonus barely shows. With every
bot restricted to a single army (turns 2 to 12, each army against each other), the bonuses decide
it: Medieval 42, Vikings 50, Spartans 27, Egyptians 43, Romans 54, Japanese 46, Gauls 43, Poles
50. Furor and Against the Odds were both sized on that test: without a bonus the Gauls win 15% of
those battles and the Poles 16%, about where the other armies land with their bonus switched off
(18 to 35%).

```
battles 2100  draws 12.3%  maxRounds 16  maxEvents 113

win rate by the bot's favoured army (bot vs bot):
  medieval 41.4%
  viking   47.0%
  spartan  44.2%
  egypt    41.1%
  roman    43.7%
  japan    45.2%
  gaul     45.6%
  poland   43.0%

bot army strength by turn:
  turn  1  stats/unit 4.4  tier 1.00  lvl 1.01
  turn  2  stats/unit 5.1  tier 1.03  lvl 1.05
  turn  3  stats/unit 5.9  tier 1.32  lvl 1.07
  turn  4  stats/unit 6.7  tier 1.54  lvl 1.14
  turn  5  stats/unit 7.7  tier 1.95  lvl 1.17
  turn  6  stats/unit 8.4  tier 2.16  lvl 1.22
  turn  7  stats/unit 9.5  tier 2.63  lvl 1.24
  turn  8  stats/unit 10.5  tier 2.91  lvl 1.30
  turn  9  stats/unit 11.8  tier 3.36  lvl 1.31
  turn 10  stats/unit 12.5  tier 3.76  lvl 1.34
  turn 11  stats/unit 13.7  tier 4.09  lvl 1.36
  turn 12  stats/unit 14.3  tier 4.36  lvl 1.37
  turn 13  stats/unit 15.3  tier 4.49  lvl 1.46
  turn 14  stats/unit 16.4  tier 4.52  lvl 1.55

abilities that never fired: none
```

### Story difficulty

From `tools/sim.py tools/story.js`: the same bot plays each expedition 400 times. "conquest%" uses
the armies a player would typically own by then (regions in table order); "solo" uses only the
Medieval army. The bot buys greedily and never plays around a champion, so a person should do
better. The bot actually does worse with more armies to choose from, because it merges less.
Targets by danger rating: 80–90% conquest at danger 1, 70–80% at 2, 55–70% at 3, 45–55% at 4, and
a champion win rate of 30–50%. With 400 runs a region can read a few points outside its band.

```
region     wins danger | conquest%  boss-battle win%  avg battles | solo conquest%
norse      3    1      |    88%        34%            5.2        |    87%
rome       3    1      |    83%        41%            5.4        |    94%
sparta     4    2      |    75%        29%            5.6        |    98%
poland     4    3      |    52%        19%            6.0        |    98%
egypt      4    3      |    62%        27%            5.8        |    82%
gaul       5    3      |    67%        30%            6.5        |   100%
japan      5    4      |    58%        32%            6.7        |    95%

poland, with a player who fields only 4 units: conquest 72%, boss-battle win 28%
```

