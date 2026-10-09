// Prints the unit and item tables as Markdown (used to refresh docs/DESIGN.md).
// Run with: tools/sim.py tools/units.js
const plain = t => t.replace(/\{([^}]+)\}/g, (m, s) => s.split('|').join(' / '));
out('| Army | Unit | Tier | ATK/HP | Ability | Effect (Lv1 / Lv2 / Lv3) | Sprite (col,row) | Key |');
out('|---|---|---|---|---|---|---|---|');
for (const f of ARMIES) for (const k of UNIT_KEYS) {
  const d = UNITS[k]; if (d.faction !== f) continue;
  out(`| ${FACTIONS[f].name} | ${d.name} | ${d.tier} | ${d.atk}/${d.hp} | ${d.ability} | ${plain(d.text)} | ${Math.round(d.sx/16)},${Math.floor(d.sy/16)} | \`${k}\` |`);
}
out('');
out('| Item | Tier | Kind | Effect | Key |');
out('|---|---|---|---|---|');
for (const k of ITEM_KEYS) { const it = ITEMS[k]; out(`| ${it.name} | ${it.tier} | ${it.gear ? 'Gear' : 'Supply'} | ${(t => t[0].toUpperCase() + t.slice(1))(it.text.replace('Gear: ', ''))} | \`${k}\` |`); }
