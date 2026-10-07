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
| Camelot (home) | Medieval | – | – | – | – | – | Norse Fjords, Rome |
| Norse Fjords | Vikings | 3 | 3 | 7 | Jarl Ragnar (Jarl) | +1/+2 | Camelot, Samarkand |
| Rome | Romans | 3 | 3 | 7 | Caesar | +2/+4 | Camelot, Sparta |
| Sparta | Spartans | 4 | 4 | 5 | King Leonidas | +2/+4 | Rome, Thebes, Samarkand |
| Thebes | Egyptians | 4 | 4 | 8 | The Pharaoh | +1/+2 | Sparta, Samarkand |
| Samarkand | Mercenaries | 5 | 4 | 9 | The Warlord (Barbarian) | +4/+8 | Norse Fjords, Sparta, Thebes, Kyoto |
| Kyoto | Japanese | 5 | 5 | 8 | The Shogun (Samurai) | none | Samarkand |

Samarkand's rivals draft from every army (favouring mercenaries), since two units do not make an
army. Conquering all six ends the story.

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

Recruits and items are drawn uniformly from everything unlocked. A roll or a new turn replaces the
whole shop.

**The reserve.** For 1 gold a card (recruit or item) can be set aside on the reserve pile, which
holds up to 4. Reserved cards survive rolls and turn changes, and still cost the usual 3 gold when
played, so a card that waits a turn costs 4 in all. A reserved card can be discarded to free its
place, but the gold is not returned and it cannot go back to the shop. The reserve replaced
freezing, which was free but kept the card in a shop slot. The numbers are `RESERVE_COST` and
`RESERVE_MAX`.

The shop points out twins: a gold arrow on a card means buying it merges with a unit in the army,
a blue mark means its twin is in the reserve, and the pile glows when the shop offers the twin of
something reserved. With 1 or 2 gold left (enough to reserve, not to buy) a coin bobs over the pile.

Bots use the reserve too. With gold left that cannot buy a card, a bot reserves a twin of a unit
it fields, the second copy of a unit it has already reserved, a strong unit of its favoured army,
or useful gear, and otherwise rolls. It plays reserved cards through the same scoring as shop
cards and discards a reserved unit that has fallen two tiers behind without a twin.

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

**Mercenaries are wild.** Each one adds 1 to the count of every army that already has 2 real
members on the team, and receives those armies' bonuses itself. So a mercenary pushes an active
bonus toward its 4-unit tier but cannot switch a bonus on alone, and a team of only mercenaries
has no bonus.

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
| Mercenaries | Sellsword | 3 | 3/5 | Paid in Gold | Wild. End of turn: if you have 2+ unspent gold, gain +1/+1 / +2/+2 / +3/+3 for good. | 2,6 | `sellsword` |
| Mercenaries | Barbarian | 4 | 5/5 | Frenzy | Wild. After attack: gain +2 / +4 / +6 attack. | 0,6 | `barbarian` |

Trigger vocabulary: *Start of battle* (resolved highest attack first), *Before attack* / *After
attack* (the front unit), *Friend ahead attacks* (the second unit in line), *Hurt* (took damage
and survived), *Faint*, *Knockout* (killed the enemy front with its attack), *Friend ahead
faints*, *Friend faints*, and the shop triggers *Buy*, *Sell*, *End of turn*.

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

1. Start-of-battle abilities fire in order of attack, highest first.
2. The two front units hit each other at the same time. First-attack and gear bonuses are added to
   the hit, then blocks and damage reduction apply. Damage never drops below 1 unless blocked.
3. Support abilities, after-attack abilities and knockouts fire, then deaths resolve: faint
   ability, Ankh, Afterlife, Blood Rage, then the reactions of surviving friends.
4. Repeat until a side is empty. Both empty is a draw.

The exact order is in `docs/ARCHITECTURE.md`.

## Opponents

There is no multiplayer. Each rival is produced on the spot by a bot that plays the same shop for
the same number of turns:

- It favours one random army (and mercenaries), fills empty slots first, merges duplicates, and
  replaces its weakest unit when a clearly better one shows up.
- It buys gear for ungeared units, War Manuals and Feasts when the army has 3+ units, and rerolls
  with whatever gold is left.
- It wastes 0–2 gold a turn (fixed per rival) so strength varies between opponents.
- It lines units up by each unit's placement hint, tougher units first within a group.
- The army's name comes from whichever army it ended up fielding most.
- Story rivals are the same bot with a restricted pool, an army-size cap and a fixed income
  (see the region table). Skirmish rivals have no cap and waste 0–2 gold as above.

## Battlefields

The backdrop follows the enemy army's homeland: dusk castle (Medieval), snowfield with falling
snow (Vikings), green hills and an aqueduct (Romans), rocky coast with a temple (Spartans), desert
and pyramids with blowing sand (Egyptians), a pink-dawn steppe with yurts (Mercenaries), and a red
sun over Fuji with drifting petals (Japanese). Purely cosmetic.

## Balance snapshot

Bot against bot, from `tools/sim.py`. This says how the armies compare when played by the same
simple bot. It says nothing about how hard the game is for a person, which has not been measured.

This sweep is small (about 700 battles per army), so each rate is only good to about ±2 points.
On an 84,000-battle sweep the armies sit within 1.6 points of each other: Medieval 43.0, Vikings
45.5, Spartans 43.7, Egyptians 43.2, Romans 45.8, Japanese 43.7, with 11.7% draws.

```
battles 2100  draws 12.0%  maxRounds 19  maxEvents 126

win rate by the bot's favoured army (bot vs bot):
  medieval 39.4%
  viking   45.0%
  spartan  43.7%
  egypt    47.8%
  roman    43.9%
  japan    44.6%

bot army strength by turn:
  turn  1  stats/unit 4.5  tier 1.00  lvl 1.00
  turn  2  stats/unit 5.3  tier 1.06  lvl 1.09
  turn  3  stats/unit 6.1  tier 1.34  lvl 1.13
  turn  4  stats/unit 6.9  tier 1.52  lvl 1.18
  turn  5  stats/unit 7.8  tier 1.95  lvl 1.23
  turn  6  stats/unit 8.5  tier 2.21  lvl 1.26
  turn  7  stats/unit 9.6  tier 2.62  lvl 1.30
  turn  8  stats/unit 10.9  tier 2.92  lvl 1.35
  turn  9  stats/unit 12.0  tier 3.37  lvl 1.36
  turn 10  stats/unit 12.9  tier 3.59  lvl 1.40
  turn 11  stats/unit 13.9  tier 4.00  lvl 1.44
  turn 12  stats/unit 14.6  tier 4.24  lvl 1.48
  turn 13  stats/unit 15.7  tier 4.31  lvl 1.55
  turn 14  stats/unit 16.8  tier 4.31  lvl 1.71

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
norse      3    1      |    91%        35%            5.1        |    91%
rome       3    1      |    90%        47%            5.3        |    95%
sparta     4    2      |    87%        39%            5.3        |    99%
egypt      4    3      |    77%        35%            5.6        |    92%
steppe     5    3      |    66%        39%            7.0        |    65%
japan      5    4      |    52%        33%            6.8        |    95%
```

These numbers are from after the bots learned to reserve. Before that the same table read 88, 83,
75, 73, 65 and 48: the reserve helps the player's side more than the capped rivals, so every region
got easier and **Sparta and Egypt now sit about 7 points above their bands**. The regions have not
been retuned for it.

### What the reserve is worth

From `tools/sim.py tools/reserve.js`: a bot that reserves against an otherwise identical bot that
never does, 300 battles a turn.

```
  turn   wins   draws  losses   stats/unit with  without
     2    32%    30%     38%              5.5      5.4
     4    40%    21%     39%              7.2      7.0
     6    53%     7%     40%              9.0      8.6
     8    51%     8%     40%             11.2     10.9
    10    53%     8%     39%             13.3     12.9
    12    50%    11%     39%             14.8     14.8
    14    49%    12%     39%             17.0     16.9

overall: 47.0% wins, 13.8% draws, 39.2% losses for the reserve bot
use: 0.49 cards reserved a turn; 69% of them played later, 7% discarded
```

A modest edge that appears from turn 6, when leftover gold starts finding twins worth keeping. A
person who plans merges around the pile should get more out of it than the bot does.

