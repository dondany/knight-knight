# Knight Knight

A 2D pixel-art auto-battler. Draft units from six historical armies in a shop phase, then watch
them fight a rival army on their own. Ships as one static page for GitHub Pages.

## Layout

- `index.html` – the whole game: CSS, markup and one inline script. No build step, no dependencies.
- `characters.PNG` – 80×112 sprite sheet, 16×16 cells, 5 per row, 7 rows. Rows 0–5 are the armies
  (medieval, vikings, spartans, egyptians, romans, japanese); row 6 holds the two mercenaries.
- `tools/` – dev helpers (rules sim, screenshots, sprite re-embed). Not needed to run the game.
- `docs/ARCHITECTURE.md` – code map, battle event log, recipes for adding content, testing, gotchas.
- `docs/DESIGN.md` – rules, numbers, every unit and item, balance snapshot.
- `docs/ROADMAP.md` – what is untested, known weak spots, ideas.

Read the doc that matches the task instead of re-deriving it from `index.html`.

## The two halves of the script

1. `//#region LOGIC` … `//#endregion LOGIC` – pure rules: unit/item/army data, shop actions, the
   battle simulator, the opponent bot. **No DOM in here.** `tools/sim.py` extracts this block and
   runs it headless, so a DOM reference breaks the sim.
2. Everything after it – the view: sprite cutting, canvas rendering, battle replay, DOM HUD, input,
   game flow, save.

`simulateBattle()` returns a flat event log and the view only replays it. Change a rule in the
simulator; change how it looks in the matching `PLAY` handler.

## Commands

```sh
tools/sim.py                       # 2,100 bot-vs-bot battles: crashes, draw rate, win rate per army
tools/sim.py tools/units.js        # regenerate the unit/item tables for docs/DESIGN.md
tools/embed_sprite.py              # re-embed characters.PNG after editing the art
tools/shot.sh /tmp/s.png "#demo=shop:7"       # headless Chrome screenshot (shop on turn 7)
tools/shot.sh /tmp/b.png "#demo=battle:9"     # same, entering a battle
tools/inject.py /tmp/t.html "<js>"            # copy of the page with a scripted UI test injected
```

## Rules of thumb

- After any rules change run `tools/sim.py`; after any visual change take a screenshot and look at it.
- After changing unit or item data, refresh the tables in `docs/DESIGN.md` from `tools/units.js`.
- After editing `characters.PNG`, run `tools/embed_sprite.py` or local `file://` opens show old art.
- Keep the game a single self-contained `index.html`. Colours come from the Apollo palette the
  sprites use; text is DOM over the canvas, stat numbers are the 3×5 pixel digits drawn in canvas.
- Headless Chrome hardly advances `requestAnimationFrame`, so battles do not play by themselves
  there. Step the clock with `tick()` from an injected script (see `tools/inject.py`).
- Use a fresh Chrome profile per screenshot (the tool does) and don't assume a local port is free.
