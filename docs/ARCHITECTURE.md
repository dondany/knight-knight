# Architecture

Everything lives in `index.html`: a `<style>` block, the DOM overlay markup, and one inline
`<script>`. Find things by function name; line numbers drift.

## Rendering model

- Two stacked 320×180 canvases, scaled up by a whole number with `image-rendering: pixelated`:
  `#cv` (the game) under the DOM overlay, and `#fxc` on top of everything for effects that must
  cover the UI (screen wipes, confetti, flying coins, full-screen flashes). `fit()` sets the
  CSS variable `--u` to the scale (CSS px per game px); below 2× it falls back to a fractional fit.
- All **text and buttons are DOM** in `#ui`, laid over the canvas and sized in `calc(var(--u) * N)`,
  so positions are written in game pixels. `#ui` has `pointer-events:none`; only buttons, the army
  list rows, the map card and the full-screen overlays (`#title`, `#banner`, `#modal`) take input.
- The **canvas draws** backgrounds, slots, sprites, stat badges (3×5 pixel digits in `DIGITS`),
  projectiles and particles.
- Colours are the Apollo palette (the palette the sprite sheet is drawn in).
- Font is Jersey 10. Pixelify Sans was tried first and dropped: its 2 and 5 read as 8 and S.

## Script map

### `//#region LOGIC` (pure rules, no DOM)

| Piece | Role |
|---|---|
| `CAP, COST, LIVES, WINS` | Stat cap 50, price 3; skirmish defaults of 5 lives and 10 wins |
| `makeRng(seed)` | Seeded RNG with `.int`, `.pick`, `.shuffle` |
| `FACTIONS`, `REAL_F` | Army names, colours, bonus text. `merc` is the wild pseudo-army |
| `def(...)` / `UNITS` | Unit table. One `def` call per unit |
| `ITEMS` | Supplies and gear |
| `synergies(units)` | `{army: {n, w, lvl}}`; each mercenary adds 1 to every army that already has 2 real members (`w` = wilds counted) |
| `newPlayer(opts)`, `tierOf`, `startTurn`, `refill`, `rollShop`, `buyUnit`, `sellUnit`, `moveUnit`, `mergeInto`, `levelUp`, `useItem`, `endTurn` | Shop-phase actions on a player state `P` |
| `simulateBattle(teamA, teamB, seed)` | Deterministic battle; returns `{ev, result, rounds}` |
| `botShop`, `arrange`, `makeOpponent(turn, rng, foe)` | Greedy bot that drafts through the same shop; `foe` restricts and tunes it |
| `REGIONS`, `ROUTES`, `storyRun`, `storyFoe`, `storyOpen`, `storyPath` | Story mode data and helpers |

Player state `P`: `{gold, turn, lives, goal, wins, team[5], shop[], items[], fx[]}` plus the run
options `pool` (unit keys on offer, `null` = all), `fast` (a new tier every turn instead of every
two), `bonus` (extra gold on turn 1), `cap` (army size, used by rival bots) and `story` (region id).
`team[0]` is the **front**. Unit instance: `{uid, key, atk, hp, xp, gear}`; level comes from
`lvlOf(u)` (xp 0–1 → 1, 2–4 → 2, 5 → 3). Shop entries are `{u, frozen, bonus?}` and
`{item, frozen}`. Shop actions push `{k:'buff'|'gold'|'level'|'text', …}` records onto `P.fx`; the
view drains them with `flushFx()` to show floating text.

### View (everything after the LOGIC region)

| Piece | Role |
|---|---|
| `G` | UI state: `screen` (`title`/`map`/`shop`/`battle`), `mode` (`story`/`skirmish`), `P`, `S` (story progress), `sel`, `hover`, `drag`, `busy`, `trans`, `after`, `opp`, `theme`, `map` |
| `ART`, `PAL`, `buildIcons` | Hand-drawn pixel icons (items, HUD, 5×5 gear markers) as ASCII grids |
| `buildSprites`, `loadSprites` | Cut units from the sheet into `SPR[key] = {n, w, m}` (normal, white flash, mummy) |
| `paintCamp`, `THEMES`, `paintField`, `field`, `paintMap`, `LANDS` | Procedural backgrounds: the camp, one battlefield per army homeland (painted lazily, cached in `BG.field`), and the world map |
| `part`, `burst`, `dust`, `sparkle`, `coins`, `confetti`, `firework`, `ring`, `spark`, `beam`, `flash`, `shake`, `splash`, `bump`, `go`, `anim`/`animOf`, `ambient` | The juice layer (see below) |
| `drawUnit`, `slab`, `badge`, `brackets` | Canvas drawing primitives |
| `renderShop`, `renderBattle`, `renderTitle`, `renderMap`, `renderFx`, `frame` | Per-frame rendering |
| `routePts`, `mapTick`, `mapCard`, `march`, `enterMap`, `finale` | World map: routes, the walking knight, the region card, conquest celebration |
| `T`, `wait`, `tween`, `tick`, `flushClock`, `hold` | Battle clock: speed, skip, timers, tweens, hit-stop, slow motion |
| `PLAY`, `playBattle` | One async handler per battle event type |
| `refreshUI`, `refreshInfo`, `unitInfo`, `factionInfo`, `floater` | DOM HUD, info panel, floating text |
| `collection(tab)`, `closeCollection` | The Collection screen (`#coll`): a DOM overlay with one tab per army plus items, built straight from `FACTIONS`, `UNITS` and `ITEMS`. Opened from the title and from the list button in the HUD; `G.coll` holds the open tab and pauses the battle clock while set |
| `pickEntity`, pointer handlers, `act(src, dst)` | Input. Every shop action goes through `act` |
| `enterTitle`, `enterShop`, `startRun`, `newSkirmish`, `endTurnFlow`, `showBanner`, `clearStage`, `boot` | Game flow |
| `save`, `loadSave` | `localStorage`: `knightknight.v1` (skirmish run) and `knightknight.story.v1` (`{S, P}`: map progress plus the expedition in progress, if any) |

Screen coordinates: `teamX(i)`, `shopX(j)`, `itemX(k)`, `TEAM_Y`, `SHOP_Y` for the shop;
`slotX(side, i)` and `FIELD_Y` for battle. The `_Y` values are where feet stand.

## Juice layer

Everything that makes the game feel alive goes through a few helpers, all of which do nothing
while a battle is being skipped (`skipping()`) and respect `prefers-reduced-motion` (`CALM`):

- **Particles** (`PT`): `part({x,y,vx,vy,g,life,col,…})` plus presets `burst`, `dust`, `sparkle`,
  `coins` (fly to the gold counter and tick it), `confetti`, `firework`. `layer:1` draws on `#fxc`
  above the UI. Flags: `tw` twinkle, `wob` sway, `fade`, `drag`, `home` (seek a point).
- **Shapes** (`FX`): `ring`, `spark`, `beam`, `flash`, shooting `star`. Timed on `G.time`.
- **Camera**: `shake(magnitude, ms)` moves the whole `#stage`; `flash(colour, ms)` tints the screen.
- **Slot animations**: `anim(id, kind, delay)` with kinds `drop`, `pop`, `land`, `hop`, `shake`,
  keyed by unit `uid` or item `id`. `renderShop` reads them through `animOf(id)`.
- **Screen changes**: `go(fn)` runs a block wipe on `#fxc` and calls `fn` while the screen is
  covered. Input is ignored while `G.trans` is set. `clearStage()` resets per-screen state.
- **Text**: `floater` (rising text), `splash(title, sub, cls, ms)` (centre-screen slam), `bump(id)`
  (HUD pop). Their motion is CSS keyframes.
- **Battle feel**: `hold(ms)` freezes the battle clock for a hit-stop, `T.slowUntil` gives slow
  motion on the final blow, `BV.dead` holds flung corpses, unit views carry squash (`sx`, `sy`),
  knockback (`kx`) and `cheer`.
- **Ambience**: `ambient(dt)` spawns fireflies and embers at camp and weather per battlefield
  theme (`THEMES[key].amb`: snow, sand, petals, embers, seeds, leaves, dust).
- **Sound**: `SFX` is synthesised (`tone` + filtered `noise`); `vary()` adds pitch variety and
  `coin` rises in pitch on a streak.

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

`endTurnFlow` runs end-of-turn effects, builds an opponent with `makeOpponent(P.turn, rng, foe)`
(`foe` is `storyFoe(P)` in story mode, nothing in skirmish), simulates the battle, **applies the result and saves immediately**, and only then starts the
replay. A reload during a battle therefore lands on the next shop turn with the result already
counted; it cannot re-roll a fight. `G.after` carries what the banner needs.

The replay runs on its own clock (`T.clock`), advanced by `tick(dt * speed)`. `wait()` and
`tween()` are scheduled on that clock, which is what makes 2×/4× and Skip work. Skip sets
`T.skip`, completes every pending timer and tween, and lets the remaining handlers run instantly.

## Story mode

`G.S = {conquered[], at, intro}` is the campaign. A region is conquered by winning a short
expedition: `storyRun(S, id)` builds the options for a fresh run (3 lives, `goal` = the region's
`wins`, `fast` tiers, `pool` = units of every army owned so far, `bonus` gold = lands conquered).
`storyFoe(P)` describes the rival: the region's army only (the mercenary region drafts from
everything), capped army size, shifted income, and the champion on the battle that would complete
the goal. `makeOpponent` adds the champion after drafting, replacing the weakest unit if the army
is full; it carries `boss:true` into the battle snapshot so the view can crown it.

When the run ends `endTurnFlow` updates `G.S` and saves before the replay; the banner's Continue
then goes to `enterMap({won|lost: id})`, which plays the celebration and the army-unlock screen.
On the map, `storyOpen(S)` lists regions with a road from conquered land, `march(id)` walks the
knight along `storyPath` (through conquered regions only) and starts the expedition on arrival.

Battlefields follow the enemy: `ARMY_THEME` maps an army to a `THEMES` entry, used for the region
in story mode and for the rival's dominant army in skirmish.

## Recipes

**Add a region.** An entry in `REGIONS` (position, army, `wins`, `cap`, `gold`, `boss`), at least
one `ROUTES` entry `[from, to, waypointX, waypointY]`, and a look at `#demo=map`. Then
`tools/sim.py tools/story.js`.

**Add a battlefield.** A `THEMES` entry (sky bands, sun, two ridges, ground and road colours,
ambient weather), optional scenery in `paintField`, and a mapping in `ARMY_THEME`.

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
- `tools/sim.py tools/story.js` has a bot play every region's expedition and reports how often it
  conquers the region and how often it beats the champion.
- `tools/shot.sh` takes headless Chrome screenshots. `#demo=` hashes jump straight to a screen
  with sound, transitions and drop-in animations off: `shop:N`, `battle:N`, `map:id,id`,
  `won:id`, `story:id:N`, `boss:id`, `coll:tab` (listed in the script's header).
- `tools/guide.py` rebuilds `docs/index.html`, the public field guide, by running `tools/guide.js`
  with the LOGIC region plus `PAL` and `ART` in scope. The page shows sprites straight from
  `../characters.PNG` with CSS, and repeats the `tools/sim.js` sweep for its balance bars.
- `tools/inject.py` writes a copy of the page with a script appended that can drive the UI with
  synthetic pointer events (`click`, `dragTo`), log state with `st()`, and `freeze(t)` CSS animations.

Gotchas met so far:

- Headless Chrome with `--virtual-time-budget` fires `requestAnimationFrame` only rarely, so the
  battle replay stalls. Drive it from an injected script with `tick(40)` on a `setInterval`.
- CSS animations do not advance there either, so floaters, splashes, the title logo and anything
  else that animates in from `opacity:0` look missing. `freeze(.45)` pins every animation 0.45s in.
  `setTimeout` still fires on virtual time, so short-lived elements may already be removed; stub
  `window.setTimeout` in the test if you need to see them.
- For flows that depend on `G.time` (transitions, slot animations, the map walk) pump
  `frame(ts += 40)` from a `setInterval`, or bypass them: `G.demo = true` makes `go()` and `march()`
  immediate. Long pumped runs sometimes stall in headless Chrome with the CPU idle; prefer several
  short synchronous tests over one long one.
- Reusing a Chrome `--user-data-dir` restores the last session's tab and screenshots the wrong
  page. Always use a throwaway profile.
- Other local projects may already be serving on common ports; pick a free one rather than
  assuming, and never stop a server you did not start.
- `file://` works for almost everything and exercises the embedded-sprite fallback. Use a local
  HTTP server only when testing the external `characters.PNG` path.
