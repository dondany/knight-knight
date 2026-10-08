# Knight Knight

A 2D pixel-art auto-battler. Draft units from six historical armies in a shop phase, then watch
them fight a rival army on their own. Two modes: **Story** (a world map; start with the Medieval
army, conquer regions to unlock the others) and **Skirmish** (every army, 10 wins before 5 losses).
Ships as one static page for GitHub Pages.

## Layout

- `index.html` – the whole game: CSS, markup and one inline script. No build step, no dependencies.
- `characters.PNG` – 80×112 sprite sheet, 16×16 cells, 5 per row, 7 rows. Rows 0–5 are the armies
  (medieval, vikings, spartans, egyptians, romans, japanese); row 6 holds the two mercenaries.
  That row was drawn as Gauls and is unfinished: three sprites are still to come, and the game's
  "Mercenaries" naming predates knowing that (see `docs/ROADMAP.md`).
- `tools/` – dev helpers (rules sim, screenshots, sprite re-embed). Not needed to run the game.
- `docs/ARCHITECTURE.md` – code map, battle event log, recipes for adding content, testing, gotchas.
- `docs/DESIGN.md` – rules, numbers, every unit and item, balance snapshot.
- `docs/ROADMAP.md` – what is untested, known weak spots, ideas.
- `docs/index.html` – the public field guide (GitHub Pages: `/knight-knight/docs/`). **Generated** by
  `tools/guide.py` from the game data; edit `tools/guide.js`, never the page.
- `docs/ideas.html` – hand-written proposals: extra units, new armies, ideas from other auto-battlers.
- `docs/art-refs.html` – hand-maintained drawing briefs for the units proposed in `ideas.html`: what
  each looked like, what must read at 16px, palette swatches, and reference pictures hot-linked from
  Wikimedia Commons (credited at the foot of the page). Also states the sprite rules the code imposes.
  `docs/guide.css` styles all three pages.

Read the doc that matches the task instead of re-deriving it from `index.html`.

## The two halves of the script

1. `//#region LOGIC` … `//#endregion LOGIC` – pure rules: unit/item/army data, shop actions, the
   battle simulator, the opponent bot, the story regions and routes. **No DOM in here.**
   `tools/sim.py` extracts this block and runs it headless, so a DOM reference breaks the sim.
2. Everything after it – the view: sprite cutting, backgrounds, the juice layer (particles, shake,
   flashes, transitions, slot animations), canvas rendering, battle replay, world map, DOM HUD,
   input, game flow, saves.

`simulateBattle()` returns a flat event log and the view only replays it. Change a rule in the
simulator; change how it looks in the matching `PLAY` handler.

## Commands

```sh
tools/sim.py                       # 2,100 bot-vs-bot battles: crashes, draw rate, win rate per army
tools/sim.py tools/story.js        # story difficulty: bot conquest rate and champion win rate per region
tools/sim.py tools/units.js        # regenerate the unit/item tables for docs/DESIGN.md
tools/guide.py                     # regenerate docs/index.html (the public field guide)
tools/embed_sprite.py              # re-embed characters.PNG after editing the art
tools/shot.sh /tmp/s.png "#demo=shop:7"       # headless Chrome screenshot (shop on turn 7)
tools/shot.sh /tmp/b.png "#demo=battle:9"     # same, entering a battle
tools/shot.sh /tmp/m.png "#demo=map:norse"    # world map (more hooks listed in tools/shot.sh)
tools/shot.sh /tmp/c.png "#demo=coll:viking"  # collection screen on a tab (army key or `items`)
tools/inject.py /tmp/t.html "<js>"            # copy of the page with a scripted UI test injected
```

## Rules of thumb

- After any rules change run `tools/sim.py`; after any visual change take a screenshot and look at it.
- After changing unit, item, army or region data, refresh the tables in `docs/DESIGN.md` from
  `tools/units.js` and run `tools/guide.py`. The in-game Collection screen reads the data directly.
- After editing `characters.PNG`, run `tools/embed_sprite.py` or local `file://` opens show old art.
- Keep the game a single self-contained `index.html`. Colours come from the Apollo palette the
  sprites use; text is DOM over the canvas, stat numbers are the 3×5 pixel digits drawn in canvas.
- Headless Chrome hardly advances `requestAnimationFrame` or CSS animations. Battles do not play by
  themselves there and animated text sits at its invisible first frame. From an injected script,
  step the battle with `tick()`, pump `frame(ts)` for transitions, and call `freeze(t)` to pin CSS
  animations at a visible moment (see `tools/inject.py` and docs/ARCHITECTURE.md).
- New visual effects go through the juice helpers (`burst`, `sparkle`, `ring`, `shake`, `flash`,
  `anim`, `splash`, `go`) so they respect Skip, demo mode and `prefers-reduced-motion`.
- Story difficulty lives in `REGIONS` (`wins`, `cap`, `gold`, champion bonus). Re-run
  `tools/sim.py tools/story.js` after touching it or any unit numbers.
- Use a fresh Chrome profile per screenshot (the tool does) and don't assume a local port is free.
