#!/usr/bin/env python3
"""Run a headless JS harness against the game rules.

Extracts the `//#region LOGIC` block from index.html (pure rules, no DOM),
appends a harness script and runs it with node, or with macOS's bundled
JavaScriptCore if node is not installed.

  tools/sim.py                 # balance + crash sweep (tools/sim.js)
  tools/sim.py tools/units.js  # print the unit/item tables as Markdown
"""
import pathlib, re, shutil, subprocess, sys, tempfile

root = pathlib.Path(__file__).resolve().parent.parent
harness = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "tools" / "sim.js"
m = re.search(r"//#region LOGIC.*?//#endregion LOGIC[^\n]*", (root / "index.html").read_text(), re.S)
assert m, "LOGIC region markers not found in index.html"
prelude = "'use strict';\nconst out=(typeof console!=='undefined'&&console.log)?console.log.bind(console):print;\n"
jsc = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
runner = shutil.which("node") or (jsc if pathlib.Path(jsc).exists() else None)
assert runner, "need node or macOS jsc"
with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
    f.write(prelude + m.group(0) + "\n" + harness.read_text())
sys.exit(subprocess.call([runner, f.name]))
