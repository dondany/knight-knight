#!/usr/bin/env python3
"""Regenerate docs/index.html, the public field guide, from the game data in index.html.

Runs tools/guide.js with the LOGIC region in scope (like tools/sim.py) plus the PAL and ART
tables from the view half, which hold the item icons.

  tools/guide.py
"""
import pathlib, re, shutil, subprocess, sys, tempfile

root = pathlib.Path(__file__).resolve().parent.parent
page = (root / "index.html").read_text()
logic = re.search(r"//#region LOGIC.*?//#endregion LOGIC[^\n]*", page, re.S)
pal = re.search(r"^const PAL=\{.*?\};$", page, re.M)
art = re.search(r"^const ART=\{.*?^\};$", page, re.M | re.S)
assert logic and pal and art, "LOGIC region, PAL or ART not found in index.html"
prelude = "'use strict';\nlet OUT='';const out=s=>{OUT+=s+'\\n'};\n"
flush = "\n(typeof console!=='undefined'&&console.log?console.log.bind(console):print)(OUT);\n"
jsc = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
runner = shutil.which("node") or (jsc if pathlib.Path(jsc).exists() else None)
assert runner, "need node or macOS jsc"
with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
    f.write("\n".join([prelude, logic.group(0), pal.group(0), art.group(0), (root / "tools" / "guide.js").read_text(), flush]))
res = subprocess.run([runner, f.name], capture_output=True, text=True)
if res.returncode or not res.stdout.lstrip().startswith("<!doctype html>"):
    sys.exit(res.stderr or res.stdout or "guide.js produced no page")
dest = root / "docs" / "index.html"
dest.write_text(res.stdout.strip() + "\n")
print("wrote", dest.relative_to(root), f"({len(res.stdout) // 1024} KB)")
