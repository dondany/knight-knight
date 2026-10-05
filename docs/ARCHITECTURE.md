# Architecture

Everything lives in `index.html`: a `<style>` block, the DOM overlay markup, and one inline
`<script>`. Find things by function name; line numbers drift.

## Rendering model

- A 320×180 canvas, scaled up by a whole number with `image-rendering: pixelated`. `fit()` sets the
  CSS variable `--u` to the scale (CSS px per game px); below 2× it falls back to a fractional fit.
- All **text and buttons are DOM** in `#ui`, laid over the canvas and sized in `calc(var(--u) * N)`,
  so positions are written in game pixels. `#ui` has `pointer-events:none`; only buttons, the army
  list rows and the full-screen overlays (`#title`, `#banner`, `#modal`) take input.
- The **canvas draws** backgrounds, slots, sprites, stat badges (3×5 pixel digits in `DIGITS`),
  projectiles and particles.
- Colours are the Apollo palette (the palette the sprite sheet is drawn in).
- Font is Jersey 10. Pixelify Sans was tried first and dropped: its 2 and 5 read as 8 and S.

## Script map

### `//#region LOGIC` (pure rules, no DOM)

| Piece | Role |
|---|---|
| `CAP, COST, LIVES, WINS` | Stat cap 50, price 3, 5 lives, 10 wins |
| `makeRng(seed)` | Seeded RNG with `.int`, `.pick`, `.shuffle` |
| `FACTIONS`, `REAL_F` | Army names, colours, bonus text. `merc` is the wild pseudo-army |
| `def(...)` / `UNITS` | Unit table. One `def` call per unit |
| `ITEMS` | Supplies and gear |
| `synergies(units)` | `{army: {n, lvl}}`; each mercenary adds 1 to every army with a real member |
| `newPlayer`, `startTurn`, `refill`, `rollShop`, `buyUnit`, `sellUnit`, `moveUnit`, `mergeInto`, `levelUp`, `useItem`, `endTurn` | Shop-phase actions on a player state `P` |
| `simulateBattle(teamA, teamB, seed)` | Deterministic battle; returns `{ev, result, rounds}` |
| `botShop`, `makeOpponent(turn, rng)` | Greedy bot that drafts through the same shop |

Player state `P`: `{gold, turn, lives, wins, team[5], shop[], items[], fx[]}`.
`team[0]` is the **front**. Unit instance: `{uid, key, atk, hp, xp, gear}`; level comes from
`lvlOf(u)` (xp 0–1 → 1, 2–4 → 2, 5 → 3). Shop entries are `{u, frozen, bonus?}` and
`{item, frozen}`. Shop actions push `{k:'buff'|'gold'|'level'|'text', …}` records onto `P.fx`; the
view drains them with `flushFx()` to show floating text.

### View (everything after the LOGIC region)

| Piece | Role |
|---|---|
| `G` | UI state: `screen` (`title`/`shop`/`battle`), `P`, `sel`, `hover`, `drag`, `busy`, `after` |
| `ART`, `PAL`, `buildIcons` | Hand-drawn pixel icons (items, HUD, 5×5 gear markers) as ASCII grids |
| `buildSprites`, `loadSprites` | Cut units from the sheet into `SPR[key] = {n, w, m}` (normal, white flash, mummy) |
| `paintScenes`, `campfire` | Procedural backgrounds `BG.camp` and `BG.field` |
| `drawUnit`, `slab`, `badge`, `brackets` | Canvas drawing primitives |
| `renderShop`, `renderBattle`, `renderTitle`, `frame` | Per-frame rendering |
| `T`, `wait`, `tween`, `tick`, `flushClock` | Battle clock: speed, skip, timers, tweens |
| `PLAY`, `playBattle` | One async handler per battle event type |
| `refreshUI`, `refreshInfo`, `unitInfo`, `factionInfo`, `floater` | DOM HUD, info panel, floating text |
| `pickEntity`, pointer handlers, `act(src, dst)` | Input. Every shop action goes through `act` |
| `enterShop`, `endTurnFlow`, `showBanner`, `newGame`, `boot` | Game flow |
| `save`, `loadSave` | `localStorage` key `knightknight.v1` |

Screen coordinates: `teamX(i)`, `shopX(j)`, `itemX(k)`, `TEAM_Y`, `SHOP_Y` for the shop;
`slotX(side, i)` and `FIELD_Y` for battle. The `_Y` values are where feet stand.

## Sprites

`buildSprites` reads the sheet, treats the top-left pixel's colour (`#151d28`) as background and
keys it out, then writes each unit into an 18×18 canvas with a 1px dark outline. Units face right;
the enemy side is drawn mirrored.

Two sprites spill a pixel outside their cell and override the origin in their `def`: the Samurai
(`sy:81`) and the Sellsword (`sx:31`). Mummies reuse the fallen unit's sprite through a grey-green
colour ramp (`MUMMY_RAMP`).

`loadSprites` tries `characters.PNG` first and falls back to the base64 copy in `SPRITE_FALLBACK`
when pixel access is refused (always the case on `file://`). `tools/embed_sprite.py` keeps the
embedded copy current.

## Battle simulation

`simulateBattle` clones both teams into battle units
`{id, key, def, side, atk, hp, hp0, lvl, gear, block, dead, risen?, mummy?}` and runs:

1. Emit `init`. Fire `start` abilities, highest attack first, resolving deaths after each.
2. Loop while both sides have units: `beforeAttack` for both fronts → `attack` → damage exchange
   (a unit with `iaido` strikes first and takes nothing back if it kills) → `friendAheadAttacks`
   for the second in line → `afterAttack` → `knockout` → resolve deaths.
3. `resolve()` handles each death in order: remove the unit, its `faint` ability, Ankh revival,
   Egyptian Afterlife, Viking Blood Rage, `friendAheadFaints` for the unit behind, `friendFaints`
   for everyone on that side.

Damage goes through `hit()`: blocks absorb the hit entirely; otherwise armour (`def.armor`), the
Spartan bonus and Chainmail reduce it, to a minimum of 1. Summons fail quietly when the side
already has 5 living units.

Ability hooks live on a unit's `def.on`: `start`, `beforeAttack`, `afterAttack`, `hurt`, `faint`,
`knockout`, `friendAheadAttacks`, `friendAheadFaints`, `friendFaints`. They receive `(u, B, …)`
where `B` offers `foes`, `allies`, `isF`, `say`, `buff`, `buffAll`, `hit`, `shoot`, `summon`,
`ward`, `kick`, `rng`. An ability calls `B.say(u)` itself when it actually does something, so no
callout appears for a no-op. Shop-phase hooks live on `def.shop`: `buy`, `sell`, `endTurn`.
Passive flags on the def: `blocks`, `armor`, `iaido`.

### Event log

| Event | Fields | Meaning |
|---|---|---|
| `init` | `units[]` | Starting snapshots for both sides |
| `ability` | `id, name` | A unit's ability fires |
| `shot` | `from, to[]` | Projectiles |
| `dmg` | `id, amt, hp, q` | Damage taken, new HP |
| `block` | `id, block, q` | A hit was blocked; blocks left |
| `buff` | `id, da, dh, atk, hp, q` | Stat change (negative `da` is a debuff) |
| `status` | `id, block` | Block count granted |
| `attack` | `a, b` | The two fronts clash |
| `faint` | `id` | Unit removed from its line |
| `summon` | `side, index, unit` | New unit inserted at `index` |
| `order` | `side, ids[], kicked` | Line reordered |
| `syn` | `side, f` | An army bonus triggered |
| `end` | `result` | `win`, `lose` or `draw`, from side 0's view |

`q: true` means "don't pause after this one", which is how simultaneous hits play together. A
`faint` event and the unit's removal from the simulator's line happen at the same moment, so a
`summon` index is valid for the view's list at that point in the replay.

## Game flow

`endTurnFlow` runs end-of-turn effects, builds an opponent with `makeOpponent(P.turn, rng)`,
simulates the battle, **applies the result and saves immediately**, and only then starts the
replay. A reload during a battle therefore lands on the next shop turn with the result already
counted; it cannot re-roll a fight. `G.after` carries what the banner needs.

The replay runs on its own clock (`T.clock`), advanced by `tick(dt * speed)`. `wait()` and
`tween()` are scheduled on that clock, which is what makes 2×/4× and Skip work. Skip sets
`T.skip`, completes every pending timer and tween, and lets the remaining handlers run instantly.

## Recipes

**Add a unit.** One `def(key, name, faction, tier, atk, hp, col, row, pos, ability, text, extra)`
call in the LOGIC region. `col,row` is the sheet cell; `pos` is a bot placement hint (0 front,
1 middle, 2 back). `text` uses `{a|b|c}` for values at levels 1/2/3. Put behaviour in
`extra.on` / `extra.shop`. Then run `tools/sim.py` and refresh the table in `docs/DESIGN.md`.

**Add an item.** An entry in `ITEMS` (`gear:true` for persistent gear, `noTarget:true` if it
needs no unit), its effect in `useItem` or in the simulator (`hit`, `strike`, `resolve`), a 10×10
icon in `ART`, and for gear a 5×5 `g_<key>` marker.

**Add an army.** An entry in `FACTIONS`, its key in `REAL_F`, names in `ARMY_NAMES`, and the bonus
itself wherever it applies (`startTurn`/`endTurn` for shop effects, `sl(u, f)` checks in the
simulator for battle effects).

**Add a battle effect that needs new visuals.** Emit a new event type from the simulator and add a
`PLAY` handler of the same name. Unknown event types are skipped by the replay.

## Testing

- `tools/sim.py` runs bot-vs-bot battles and reports crashes, draw rate, win rate by army, bot
  strength by turn, and any ability that never fired.
- `tools/shot.sh` takes headless Chrome screenshots. The `#demo=shop:N` / `#demo=battle:N` hash
  starts a muted, bot-drafted run on turn N.
- `tools/inject.py` writes a copy of the page with a script appended that can drive the UI with
  synthetic pointer events (`click`, `dragTo`) and log state with `st()`.

Gotchas met so far:

- Headless Chrome with `--virtual-time-budget` fires `requestAnimationFrame` only rarely, so the
  battle replay stalls. Drive it from an injected script with `tick(40)` on a `setInterval`.
- Reusing a Chrome `--user-data-dir` restores the last session's tab and screenshots the wrong
  page. Always use a throwaway profile.
- Other local projects may already be serving on common ports; pick a free one rather than
  assuming, and never stop a server you did not start.
- `file://` works for almost everything and exercises the embedded-sprite fallback. Use a local
  HTTP server only when testing the external `characters.PNG` path.
