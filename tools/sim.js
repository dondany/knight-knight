// Balance + crash sweep. Run with: tools/sim.py
// Everything from the LOGIC region of index.html is in scope; print with out().
const rng = makeRng(12345);
const stat = {}; REAL_F.forEach(f => stat[f] = {w:0, l:0, d:0});
let n = 0, draws = 0, maxRounds = 0, maxEvents = 0;
const perTurn = {};
for (let turn = 1; turn <= 14; turn++) {
  let stats = 0, tier = 0, lvl = 0, cnt = 0;
  for (let k = 0; k < 150; k++) {
    const A = makeOpponent(turn, rng), Bo = makeOpponent(turn, rng);
    const r = simulateBattle(A.team, Bo.team, rng.int(1e9));
    n++; maxRounds = Math.max(maxRounds, r.rounds); maxEvents = Math.max(maxEvents, r.ev.length);
    if (r.result === 'win') { stat[A.fav].w++; stat[Bo.fav].l++; }
    else if (r.result === 'lose') { stat[A.fav].l++; stat[Bo.fav].w++; }
    else { draws++; stat[A.fav].d++; stat[Bo.fav].d++; }
    for (const e of r.ev) if (e.t === 'dmg' && !(e.amt >= 1)) throw new Error('bad dmg ' + JSON.stringify(e));
    for (const u of A.team) if (u) { stats += u.atk + u.hp; tier += UNITS[u.key].tier; lvl += lvlOf(u); cnt++; }
  }
  perTurn[turn] = `stats/unit ${(stats/cnt).toFixed(1)}  tier ${(tier/cnt).toFixed(2)}  lvl ${(lvl/cnt).toFixed(2)}`;
}
out(`battles ${n}  draws ${(100*draws/n).toFixed(1)}%  maxRounds ${maxRounds}  maxEvents ${maxEvents}`);
out('\nwin rate by the bot\'s favoured army (bot vs bot):');
for (const f in stat) { const s = stat[f]; out('  ' + f.padEnd(9) + (100*s.w/(s.w+s.l+s.d)).toFixed(1) + '%'); }
out('\nbot army strength by turn:');
for (const t in perTurn) out('  turn ' + String(t).padStart(2) + '  ' + perTurn[t]);

// every battle ability should fire at least once across a broad sample
const fired = {};
for (let k = 0; k < 1500; k++) {
  const t = 1 + k % 14, r = simulateBattle(makeOpponent(t, rng).team, makeOpponent(t, rng).team, k);
  r.ev.forEach(e => { if (e.t === 'ability') fired[e.name] = 1; });
}
out('\nabilities that never fired: ' + (UNIT_KEYS.filter(k => UNITS[k].on && !fired[UNITS[k].ability]).join(', ') || 'none'));
