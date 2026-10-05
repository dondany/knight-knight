#!/bin/zsh
# Headless Chrome screenshot of the game.
#   tools/shot.sh <out.png> [url-suffix] [virtual-ms] [width] [height] [html-file]
#   tools/shot.sh /tmp/shop.png "#demo=shop:7"          skirmish shop on turn 7
#   tools/shot.sh /tmp/battle.png "#demo=battle:9" 4000  skirmish battle
#   tools/shot.sh /tmp/map.png "#demo=map:norse,rome"    world map with those lands conquered
#   tools/shot.sh /tmp/won.png "#demo=won:rome"          map right after a conquest (unlock screen)
#   tools/shot.sh /tmp/exp.png "#demo=story:sparta:3"    story expedition shop, turn 3
#   tools/shot.sh /tmp/boss.png "#demo=boss:norse"       a region's champion battle
# TIMEOUT=120 raises the kill timer (default 60s) for long scripted runs.
# A fresh Chrome profile is used every run on purpose: a reused profile restores
# its previous tab and you end up with a screenshot of some other page.
# Console output (errors, console.log) is echoed.
set -e
ROOT="${0:A:h:h}"
OUT="${1:?output png path}"; SUFFIX="${2:-}"; BUDGET="${3:-2500}"; WIDTH="${4:-1280}"; HEIGHT="${5:-720}"; PAGE="${6:-$ROOT/index.html}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
perl -e 'alarm shift; exec @ARGV' ${TIMEOUT:-60} "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run --no-default-browser-check \
  --user-data-dir="$PROFILE" --window-size=$WIDTH,$HEIGHT --virtual-time-budget=$BUDGET --enable-logging=stderr --v=0 \
  --screenshot="$OUT" "file://${PAGE:A}$SUFFIX" 2>&1 | grep -E "CONSOLE|Uncaught" | sed -E 's/.*CONSOLE:[0-9]+\] "//; s/", source.*//' || true
rm -rf "$PROFILE"
ls -la "$OUT"
