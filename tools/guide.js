// Builds docs/index.html, the public field guide. Run with: tools/guide.py
// In scope: everything from the LOGIC region of index.html, plus PAL and ART (the icon pixel grids).
// Every number on the page is read from the game data, so the guide cannot drift from the rules.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lv = t => esc(t).replace(/\{([^}]+)\}/g, (m, s) => `<b class="lv">${s.split('|').join('<i>/</i>')}</b>`);
const spr = (k, cls) => { const d = UNITS[k]; return `<i class="spr${cls ? ' ' + cls : ''}" style="--x:${d.sx};--y:${d.sy}" role="img" aria-label="${esc(d.name)}" title="${esc(d.name)}"></i>`; };
function icon(k) {
  const rows = ART[k]; let r = '';
  rows.forEach((row, y) => { for (let x = 0; x < row.length;) { let n = 1; while (row[x + n] === row[x]) n++; if (PAL[row[x]]) r += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[row[x]]}"/>`; x += n; } });
  return `<svg class="ico" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
const ARMIES = [...REAL_F, 'merc'];
const WHERE = {medieval: 'in the shop', roman: 'in the shop'};
const regionOf = f => Object.keys(REGIONS).find(id => REGIONS[id].army === f);
const pips = n => `<span class="pips" title="Danger ${n} of 4">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

// ---------- sections ----------
function unitCard(k) {
  const d = UNITS[k];
  return `<article class="unit" id="u-${k}">${spr(k)}<div><h4>${esc(d.name)}<span class="tier">Tier ${d.tier}</span></h4>
<p class="stats"><b class="atk">${d.atk} ATK</b><b class="hp">${d.hp} HP</b></p><p><em>${esc(d.ability)}.</em> ${lv(d.text)}</p></div></article>`;
}
function armySection(f) {
  const F = FACTIONS[f], R = REGIONS[regionOf(f)], us = armyUnits(f), wild = f === 'merc';
  const tiers = wild ? `<dt>Wild</dt><dd>${esc(F.tiers[0])}</dd>` : `<dt>2 units</dt><dd>${esc(F.tiers[0])}</dd><dt>4 units</dt><dd>${esc(F.tiers[1])}</dd>`;
  const token = f === 'egypt' ? `<article class="unit token">${spr('medjay')}<div><h4>${MUMMY.name}<span class="tier">Token</span></h4><p>${esc(MUMMY.text)} Raised by Egyptian abilities and by Afterlife. Mummies get no army bonus and never rise a second time.</p></div></article>` : '';
  return `<div class="army" id="${f}" style="--c:${F.color}"><header><h3>${F.name}</h3>
<span class="home">${R.name}${R.boss ? ` · champion: ${esc(R.boss[1])}` : ' · your starting army in Story'} · ${us.length} units, tiers ${us.map(k => UNITS[k].tier).join(', ')}</span></header>
<dl class="bonus"><div class="name">${wild ? 'Wild' : 'Army bonus: ' + F.syn}${wild ? '' : `<small>works ${WHERE[f] || 'in battle'}</small>`}</div>${tiers}</dl>
<div class="units">${us.map(unitCard).join('')}${token}</div></div>`;
}
function turnTable() {
  let rows = '';
  for (let T = 1; T <= 6; T++) rows += `<tr><td class="k">Tier ${T}</td><td>${T < 6 ? `${2 * T - 1}–${2 * T}` : '11+'}</td><td>${T < 6 ? T : '6+'}</td><td>${T > 1 ? '1–' + T : '1'}</td><td class="n">${shopSize(T)}</td><td class="n">${itemSlots(T)}</td></tr>`;
  return `<div class="scroll"><table><tr><th>Shop tier</th><th>Skirmish turn</th><th>Story turn</th><th>Unit tiers on offer</th><th class="n">Recruit slots</th><th class="n">Item slots</th></tr>${rows}</table></div>`;
}
function regionTable() {
  const rows = Object.keys(REGIONS).map(id => {
    const R = REGIONS[id], F = FACTIONS[R.army], roads = neighbours(id).map(n => REGIONS[n].name).join(', ');
    if (!R.boss) return `<tr><td class="k" style="color:${F.color}">${R.name}</td><td>${F.name}</td><td colspan="5">Home. Yours from the start.</td><td>${roads}</td></tr>`;
    const b = UNITS[R.boss[0]], bonus = R.boss[2] ? `+${R.boss[2]}/+${R.boss[2] * 2}` : 'no bonus';
    return `<tr><td class="k" style="color:${F.color}">${R.name}</td><td>${F.name}</td><td>${pips(R.danger)}</td><td class="n">${R.wins}</td><td class="n">${R.cap}</td><td class="n">${10 + R.gold}</td><td>${esc(R.boss[1])} <span class="note">(${esc(b.name)}, ${bonus})</span></td><td>${roads}</td></tr>`;
  }).join('');
  return `<div class="scroll"><table><tr><th>Region</th><th>Army unlocked</th><th>Danger</th><th class="n">Wins needed</th><th class="n">Rival army size</th><th class="n">Rival gold</th><th>Champion</th><th>Roads to</th></tr>${rows}</table></div>`;
}
function mapSvg() {
  const roads = ROUTES.map(r => { const a = REGIONS[r[0]], b = REGIONS[r[1]]; return `<path d="M${a.x} ${a.y}Q${2 * r[2] - (a.x + b.x) / 2} ${2 * r[3] - (a.y + b.y) / 2} ${b.x} ${b.y}" fill="none" stroke="#577277" stroke-width="1.2" stroke-dasharray="3 2"/>`; }).join('');
  const nodes = Object.keys(REGIONS).map(id => { const R = REGIONS[id], c = FACTIONS[R.army].color; return `<circle cx="${R.x}" cy="${R.y}" r="5" fill="${c}" stroke="#090a14" stroke-width="1.5"/><text x="${R.x}" y="${R.y + 14}" text-anchor="middle">${R.name}</text>`; }).join('');
  return `<svg class="map" viewBox="62 20 262 124" role="img" aria-label="Route map of the story regions">${roads}${nodes}</svg>`;
}
// the tools/sim.js sweep with 6x the battles: at 150 per turn an army's rate is only good to about 2 points
function balance() {
  const rng = makeRng(12345), stat = {}; REAL_F.forEach(f => stat[f] = {w: 0, n: 0}); let n = 0, draws = 0;
  for (let turn = 1; turn <= 14; turn++) for (let k = 0; k < 900; k++) {
    const A = makeOpponent(turn, rng), Bo = makeOpponent(turn, rng), r = simulateBattle(A.team, Bo.team, rng.int(1e9)).result;
    n++; stat[A.fav].n++; stat[Bo.fav].n++;
    if (r === 'win') stat[A.fav].w++; else if (r === 'lose') stat[Bo.fav].w++; else draws++;
  }
  const bars = REAL_F.map(f => { const p = 100 * stat[f].w / stat[f].n; return `<span style="color:${FACTIONS[f].color}">${FACTIONS[f].name}</span><div class="t" style="--c:${FACTIONS[f].color}"><i style="width:${(p / 60 * 100).toFixed(1)}%"></i></div><span>${p.toFixed(1)}%</span>`; }).join('');
  return `<div class="bars">${bars}</div><p class="note">Win rate of a bot that favours each army, over ${n.toLocaleString('en-US')} bot-against-bot skirmish battles across turns 1–14 (bars scaled to 60%). ${(100 * draws / n).toFixed(1)}% of those battles were draws, which is why the rates sit below 50%. This compares the armies with each other when the same simple bot plays them. It does not measure how hard the game is for a person.</p>`;
}

const nUnits = UNIT_KEYS.length, nRegions = REGION_KEYS.length;
out(`<!doctype html>
<!-- Generated by tools/guide.py from the game data in index.html. Do not edit by hand. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Knight Knight · Field Guide</title>
<meta name="description" content="Every army, unit, ability and rule in Knight Knight, a pixel-art auto-battler.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap" rel="stylesheet">
<link rel="stylesheet" href="guide.css">
</head>
<body>
<nav class="top"><div class="wrap"><a class="brand" href="#top">Field Guide</a><a href="#run">The run</a><a href="#armies">Armies</a><a href="#items">Items</a><a href="#battle">Battle</a><a href="#story">Story</a><a href="#rivals">Rivals</a><a href="#balance">Balance</a><a href="ideas.html">Ideas</a><a class="play" href="../">Play ▸</a></div></nav>
<header class="hero" id="top"><div class="wrap">
<h1>KNIGHT KNIGHT</h1>
<p>A pixel-art auto-battler. Draft an army from across history in the shop, line it up, and watch it fight a rival on its own. This page lists everything in the game as it stands today.</p>
<a class="play" href="../">Play the game ▸</a>
<ul class="facts"><li><b>${REAL_F.length}</b>armies + mercenaries</li><li><b>${nUnits}</b>units</li><li><b>${ITEM_KEYS.length}</b>items</li><li><b>${nRegions}</b>lands to conquer</li><li><b>2</b>modes</li></ul>
<div class="parade">${UNIT_KEYS.map(k => `<a href="#u-${k}">${spr(k, 'sm')}</a>`).join('')}</div>
</div></header>
<main class="wrap">

<section id="run">
<h2>The run</h2>
<p class="lead">Every turn has two halves: a shop phase where you spend gold, and a battle you only watch. Win enough battles before your lives run out.</p>
<div class="cols">
<div class="box"><h3>Skirmish</h3><p>One run with every army on offer from the start. Win <b>${WINS}</b> battles before you lose <b>${LIVES}</b> lives. A new unit tier unlocks every two turns.</p></div>
<div class="box"><h3>Story</h3><p>A campaign on a world map. You start with only the Medieval army. Each land is a short expedition: <b>3</b> lives, <b>${Math.min(...REGION_KEYS.map(k => REGIONS[k].wins))}–${Math.max(...REGION_KEYS.map(k => REGIONS[k].wins))}</b> wins, a new tier every turn, and a champion in the last battle. Conquer a land and its army joins your recruits for good. <a href="#story">More below.</a></p></div>
</div>

<h3>Gold and the shop</h3>
<ul>
<li>You get <b>10 gold</b> each turn. Gold you do not spend is lost.</li>
<li>Every unit and every item costs <b>${COST} gold</b>, whatever its tier. A reroll of the shop costs <b>1</b>.</li>
<li>Selling a unit returns gold equal to its <b>level</b> (1, 2 or 3).</li>
<li>For <b>${RESERVE_COST}</b> gold you can set a recruit or item aside on the <b>reserve</b> pile, which holds up to ${RESERVE_MAX} cards. It stays there through rerolls and into later turns, and costs the usual ${COST} when you play it. A reserved card you no longer want can be discarded, with no gold back.</li>
<li>Your army has <b>5 slots</b>. The front of the line fights first; in the shop the front is on the right.</li>
<li>A loss costs 1 life. A draw costs nothing. Either way the turn counter moves on.</li>
<li>No stat can go above <b>${CAP}</b>.</li>
</ul>
${turnTable()}
<p class="note">Recruits and items are drawn with equal odds from everything unlocked so far.</p>

<h3>Merging and levels</h3>
<ul>
<li>Drop a unit on a copy of itself to merge them. The result keeps the higher attack and the higher health of the two, plus 1 each.</li>
<li><b>Level 2</b> takes three copies in total, <b>level 3</b> takes six. A level 3 unit cannot merge further.</li>
<li>Every ability has three strengths, one per level. They are written as <b class="lv">a<i>/</i>b<i>/</i>c</b> on this page.</li>
<li>Each level-up adds one bonus recruit from the <b>next tier up</b> to the shop.</li>
<li>Gear stays on the unit being merged into. If it has none, it takes the other unit's.</li>
</ul>
</section>

<section id="armies">
<h2>Armies</h2>
<p class="lead">Field <b>2</b> units of the same army to switch on its bonus, and <b>4</b> to improve it. Copies of the same unit count. Stats are shown as base attack and health at level 1.</p>
<p class="lead">Mercenaries are wild: ${esc(FACTIONS.merc.tiers[0].replace(/^Counts/, 'each one counts').replace(/\.$/, ''))}, and gets those armies' bonuses itself. A mercenary cannot switch a bonus on alone.</p>
${ARMIES.map(armySection).join('\n')}
</section>

<section id="items">
<h2>Items</h2>
<p class="lead">Supplies are used up on the spot. Gear stays on the unit for the rest of the run; a unit holds one piece and a new one replaces it. Items appear from the shop tier shown.</p>
<div class="items">${ITEM_KEYS.map(k => { const it = ITEMS[k]; return `<article class="item">${icon(k)}<div><h4>${esc(it.name)}</h4><span class="tier">${it.gear ? 'Gear' : 'Supply'} · Tier ${it.tier}</span><p>${esc(it.text.replace('Gear: ', '').replace(/^./, c => c.toUpperCase()))}</p></div></article>`; }).join('')}</div>
</section>

<section id="battle">
<h2>Battle</h2>
<p class="lead">Battles are fully automatic and decided by a seeded simulation, so the same two armies with the same seed always play out the same way.</p>
<ol class="steps">
<li><b>Start of battle.</b> Every start-of-battle ability fires once, in order of attack, highest first. Units felled here are removed before the next ability fires.</li>
<li><b>The clash.</b> The two front units hit each other at the same moment. Gear and first-attack bonuses are added to the hit. Then blocks cancel the hit entirely, or armour reduces it. A hit that lands always deals at least 1.</li>
<li><b>Reactions.</b> The unit second in line fires its support ability, then the fronts fire their after-attack abilities and knockouts.</li>
<li><b>Deaths.</b> For each fallen unit, in order: its faint ability, an Ankh revival, Egyptian Afterlife, Viking Blood Rage, then the reactions of the friends still standing.</li>
<li><b>Repeat</b> until one side is empty. If both sides are empty at once, it is a draw.</li>
</ol>
<h3>Ability triggers</h3>
<div class="vocab">
<div><b>Start of battle</b><br>Once, before the first clash.</div>
<div><b>Before attack / After attack</b><br>When this unit is at the front and attacks.</div>
<div><b>Friend ahead attacks</b><br>When this unit is second in line.</div>
<div><b>Hurt</b><br>Took damage and survived.</div>
<div><b>Faint</b><br>This unit falls.</div>
<div><b>Knockout</b><br>Its attack felled the enemy front and it survived.</div>
<div><b>Friend ahead faints / Friend faints</b><br>The unit directly in front, or any friend, falls.</div>
<div><b>Buy / Sell / End of turn</b><br>Shop triggers. Their gains are permanent.</div>
</div>
<p class="note">Units summoned in battle do not appear if the side already has 5 units standing. Buffs gained in battle last only for that battle; buffs gained in the shop are kept.</p>
</section>

<section id="story">
<h2>Story</h2>
<p class="lead">You rule Camelot. A land can be attacked once a road reaches it from land you hold.</p>
${mapSvg()}
<ul>
<li>Each expedition is a fresh run: 3 lives, an empty army, and recruits only from armies you own.</li>
<li>You start each expedition with <b>+1 gold for every land already conquered</b> (first turn only).</li>
<li>Rivals field that land's own army. In the early lands they have a smaller army and less gold than you.</li>
<li>The battle that would complete the goal is against the land's <b>champion</b>: the usual rival army plus a named leader with bonus stats.</li>
<li>Lose all 3 lives, or retreat, and you are back on the map with nothing lost.</li>
<li>Conquering all ${nRegions} lands ends the story.</li>
</ul>
${regionTable()}
<p class="note">"Rival gold" is what the rival bot gets to spend each turn against your 10. Samarkand's rivals draft from every army, favouring mercenaries.</p>
</section>

<section id="rivals">
<h2>Rivals</h2>
<p class="lead">There is no multiplayer. Each rival is built on the spot by a bot that plays the same shop as you for the same number of turns.</p>
<ul>
<li>It favours one army (and mercenaries), fills empty slots first, merges copies, and swaps out its weakest unit when a clearly better one shows up.</li>
<li>It buys gear for units without any, and War Manuals and Feasts once it has 3 units, then rerolls with what is left.</li>
<li>In Skirmish each rival wastes 0–2 gold a turn, so some are stronger than others.</li>
<li>It lines up bruisers in front and support units behind.</li>
</ul>
</section>

<section id="balance">
<h2>Balance</h2>
${balance()}
</section>

</main>
<footer><div class="wrap">Generated from the game's own data, so the numbers here are the numbers the game uses. Looking ahead: <a href="ideas.html">proposed armies, new units and ideas borrowed from other auto-battlers</a>.</div></footer>
</body>
</html>`);
