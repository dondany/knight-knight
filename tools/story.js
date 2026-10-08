// Story-mode difficulty check. Run with: tools/sim.py tools/story.js
// A bot plays each region's expedition with the armies it would typically own by then.
// "solo" is the same region attempted with only the Medieval army.
const rng = makeRng(777);
const ORDER = ['norse', 'rome', 'sparta', 'egypt', 'gaul', 'japan'];
function expedition(S, id) {
  const P = newPlayer(storyRun(S, id));
  const armies = S.conquered.map(c => REGIONS[c].army), fav = rng.pick(armies.filter(a => a !== 'gaul'));
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
ORDER.forEach((id, i) => {
  const run = S => { let ok = 0, t = 0, bs = 0, bw = 0; const N = 400; for (let k = 0; k < N; k++) { const r = expedition(S, id); ok += r.ok; t += r.turns; bs += r.bossSeen; bw += r.bossWon; } return {ok: 100*ok/N, t: t/N, boss: bs ? 100*bw/bs : 0}; };
  const typical = run({conquered: ['home', ...ORDER.slice(0, i)], at: 'home'}), solo = run({conquered: ['home'], at: 'home'});
  const R = REGIONS[id];
  out(`${id.padEnd(10)} ${R.wins}    ${R.danger}      | ${typical.ok.toFixed(0).padStart(5)}%     ${typical.boss.toFixed(0).padStart(5)}%            ${typical.t.toFixed(1)}        | ${solo.ok.toFixed(0).padStart(5)}%`);
});
