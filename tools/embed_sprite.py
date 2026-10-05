#!/usr/bin/env python3
"""Re-embed characters.PNG into index.html as the base64 fallback.

Run this after editing the sprite sheet. The game prefers the external
characters.PNG when served over HTTP, but when index.html is opened straight
from disk browsers refuse pixel access to local images, so it falls back to
the copy embedded in SPRITE_FALLBACK.
"""
import base64, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = root / "index.html"
b64 = base64.b64encode((root / "characters.PNG").read_bytes()).decode()
src = html.read_text()
out, n = re.subn(r"(const SPRITE_FALLBACK='data:image/png;base64,)[^']*(')", lambda m: m.group(1) + b64 + m.group(2), src)
assert n == 1, "SPRITE_FALLBACK constant not found in index.html"
if out != src:
    html.write_text(out)
    print("index.html updated with the current characters.PNG")
else:
    print("embedded sprite already up to date")
