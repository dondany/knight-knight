// Story-mode difficulty check. Run with: tools/sim.py tools/story.js
// A bot plays each region's expedition with the armies it would typically own by then.
// "solo" is the same region attempted with only the Medieval army.
const rng = makeRng(777);
const ORDER = ['norse', 'rome', 'sparta', 'poland', 'egypt', 'gaul', 'japan'];
function expedition(S, id, cap) {
  const P = newPlayer(storyRun(S, id)); if (cap) P.cap = cap;
  const armies = S.conquered.map(c => REGIONS[c].army), fav = rng.pick(armies.filter(a => !isWild(a)));
  let bossSeen = 0, bossWon = 0;
  while (P.wins < P.goal && P.lives > 0) {
    startTurn(P, rng); botShop(P, rng, fav); endTurn(P, rng); P.fx.length = 0;
    const foe = storyFoe(P), r = simulateBattle(P.team, makeOpponent(P.turn, rng, foe).team, rng.int(1e9)).result;
    if (foe.boss) { bossSeen++; if (r === 'win') bossWon++; }
    if (r === 'win') P.wins++; else if (r === 'lose') P.lives--;
    P.turn++;
    if (P.turn > 40) break;
  }
  return {ok: P.wins >= P.goal, turns: P.turn - 1, bossSeen, bossWon};
}
out('region     wins danger | conquest%  boss-battle win%  avg battles | solo conquest%');
const run = (S, id, cap) => { let ok = 0, t = 0, bs = 0, bw = 0; const N = 400; for (let k = 0; k < N; k++) { const r = expedition(S, id, cap); ok += r.ok; t += r.turns; bs += r.bossSeen; bw += r.bossWon; } return {ok: 100*ok/N, t: t/N, boss: bs ? 100*bw/bs : 0}; };
ORDER.forEach((id, i) => {
  const typical = run({conquered: ['home', ...ORDER.slice(0, i)], at: 'home'}, id), solo = run({conquered: ['home'], at: 'home'}, id);
  const R = REGIONS[id];
  out(`${id.padEnd(10)} ${R.wins}    ${R.danger}      | ${typical.ok.toFixed(0).padStart(5)}%     ${typical.boss.toFixed(0).padStart(5)}%            ${typical.t.toFixed(1)}        | ${solo.ok.toFixed(0).padStart(5)}%`);
});
// Krakow's rivals rally when they are outnumbered, so the land is easier for a player who does not bring the longer line.
{ const i = ORDER.indexOf('poland'), r = run({conquered: ['home', ...ORDER.slice(0, i)], at: 'home'}, 'poland', REGIONS.poland.cap);
  out(`\npoland, with a player who fields only ${REGIONS.poland.cap} units: conquest ${r.ok.toFixed(0)}%, boss-battle win ${r.boss.toFixed(0)}%`); }
