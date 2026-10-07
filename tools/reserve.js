// What the reserve is worth. Run with: tools/sim.py tools/reserve.js
// Bots that use the reserve fight bots that never do (`noRes`), at every turn, and the bot's use of
// the pile is counted. Everything from the LOGIC region of index.html is in scope; print with out().
const rng = makeRng(2468), N = 300;
let stowed = 0, played = 0, thrown = 0, turns = 0;
const reserve0 = reserveCard, buy0 = buyUnit, use0 = useItem, drop0 = discardReserve;
reserveCard = (P, L, i) => { const ok = reserve0(P, L, i); if (ok) stowed++; return ok; };
buyUnit = (P, i, slot, r, from) => { const res = buy0(P, i, slot, r, from); if (res && from === P.reserve) played++; return res; };
useItem = (P, i, slot, r, from) => { const ok = use0(P, i, slot, r, from); if (ok && from === P.reserve) played++; return ok; };
discardReserve = (P, i) => { const ok = drop0(P, i); if (ok) thrown++; return ok; };

out('reserve bot against a bot that never reserves (' + N + ' battles a turn):');
out('  turn   wins   draws  losses   stats/unit with  without');
let W = 0, L = 0, D = 0;
for (let turn = 2; turn <= 14; turn += 2) {
  let w = 0, l = 0, d = 0, sa = 0, sb = 0, ca = 0, cb = 0;
  for (let k = 0; k < N; k++) {
    const fav = rng.pick(REAL_F), gold = -rng.int(3);
    const A = makeOpponent(turn, rng, {fav, gold}), B = makeOpponent(turn, rng, {fav, gold, noRes: true});
    turns += turn;
    const r = simulateBattle(A.team, B.team, rng.int(1e9));
    if (r.result === 'win') w++; else if (r.result === 'lose') l++; else d++;
    for (const u of A.team) if (u) { sa += u.atk + u.hp; ca++; }
    for (const u of B.team) if (u) { sb += u.atk + u.hp; cb++; }
  }
  W += w; L += l; D += d;
  const pc = x => (100 * x / N).toFixed(0).padStart(4) + '%';
  out('  ' + String(turn).padStart(4) + '  ' + pc(w) + '  ' + pc(d) + '   ' + pc(l) + '            ' + (sa / ca).toFixed(1).padStart(5) + '    ' + (sb / cb).toFixed(1).padStart(5));
}
out(`\noverall: ${(100 * W / (W + L + D)).toFixed(1)}% wins, ${(100 * D / (W + L + D)).toFixed(1)}% draws, ${(100 * L / (W + L + D)).toFixed(1)}% losses for the reserve bot`);
out(`use: ${(stowed / turns).toFixed(2)} cards reserved a turn; ${(100 * played / stowed).toFixed(0)}% of them played later, ${(100 * thrown / stowed).toFixed(0)}% discarded`);
