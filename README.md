# Knight Knight

A pixel-art auto-battler. Draft an army from across history — medieval knights, Vikings, Spartans,
Egyptians, Romans and samurai — then let them fight it out.

The whole game is one static page: `index.html` plus the sprite sheet. No build step, no dependencies.

## Play

- **Locally:** open `index.html` in a browser.
- **GitHub Pages:** Settings → Pages → deploy from the `main` branch, root folder. The game is then
  at `https://dondany.github.io/knight-knight/`. (Pages on a private repo needs a paid GitHub plan.)

## How to play

- **Recruit.** You get 10 gold a turn. Units and supplies cost 3; a fresh line-up of recruits costs 1.
- **Arrange.** Drag units to reorder them. The front of your line is on the right and fights first.
- **Merge.** Drop a unit on its twin. Three copies make level 2, six make level 3, and abilities
  grow with each level.
- **Armies.** Field 2 or 4 units from the same army to switch on its bonus. Mercenaries count for
  every army you field.
- **Fight.** End the turn and your army battles a rival on its own. Win 10 battles before you lose
  5 lives.
- **Tips.** Freeze a recruit to keep it for next turn. Drag a unit down to the shop to sell it.
  Keys: `R` roll, `F` freeze, `S` sell. Hover a unit (or tap it) to read its ability.

## Armies

| Army | Bonus | With 2 | With 4 |
|---|---|---|---|
| Medieval | Tithe | +1 gold every turn | +3 gold every turn |
| Vikings | Blood Rage | When a Viking faints, the others gain +1/+1 | …gain +2/+2 |
| Spartans | Phalanx | Take 1 less damage | Take 2 less damage |
| Egyptians | Afterlife | First to faint rises as a half-strength Mummy | Every Egyptian rises once |
| Romans | Drill | A random Roman gains +1/+1 each turn | Every Roman does |
| Japanese | Bushido | First attack deals +2 damage | First attack deals +5 damage |

All 32 units, 7 items and the exact numbers are in [docs/DESIGN.md](docs/DESIGN.md).

## Project layout

| Path | What it is |
|---|---|
| `index.html` | The game: styles, markup and script in one file |
| `characters.PNG` | Sprite sheet, 16×16 cells, one army per row |
| `tools/` | Dev helpers: headless rules sim, screenshots, sprite re-embed |
| `docs/ARCHITECTURE.md` | How the code is organised and how to extend it |
| `docs/DESIGN.md` | Rules, units, items, balance |
| `docs/ROADMAP.md` | Open questions and ideas |
| `CLAUDE.md` | Short orientation for AI coding sessions |

## Development

There is nothing to install. Edit `index.html` and reload.

```sh
tools/sim.py              # run a few thousand bot-vs-bot battles to check rules and balance
tools/embed_sprite.py     # after editing characters.PNG, refresh the copy embedded in index.html
tools/shot.sh out.png "#demo=shop:7"   # headless Chrome screenshot (macOS, needs Google Chrome)
```

The sim needs `node`, or falls back to the JavaScriptCore shell that ships with macOS.

One thing to know about the art: served over HTTP the game reads `characters.PNG`, but opened
straight from disk it uses a copy embedded in `index.html` (browsers block pixel access to local
image files). Run `tools/embed_sprite.py` after changing the sheet to keep the two in step.

Text uses the Jersey 10 pixel font from Google Fonts and falls back to a system monospace offline.
