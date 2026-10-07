#!/usr/bin/env python3
"""Make a copy of index.html with a test script injected, for scripted UI checks.

  tools/inject.py /tmp/t.html "dragTo(shopX(0),HAND_Y,teamX(1),TEAM_Y-8); st();"
  tools/shot.sh /tmp/t.png "#demo=shop:7" 2500 1280 720 /tmp/t.html

Helpers available to the injected script (coordinates are the game's 320x180 space):
  click(x,y)  dragTo(x0,y0,x1,y1[,drop])  pe(type,x,y)  st()  -> logs gold/team/shop state
  freeze(t)   pins every CSS animation at t seconds in (headless Chrome does not advance them,
              so without this, animated text sits at its invisible first frame)
Everything in the game's script scope is reachable too (G, T, BV, act, tick, ...).

Headless Chrome barely advances requestAnimationFrame under --virtual-time-budget,
so battles do not play on their own there. Step the battle clock by hand instead:
  const iv=setInterval(()=>{ if(G.screen==='battle'&&$('banner').classList.contains('hide')) for(let k=0;k<5;k++) tick(40); },1);
"""
import pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
out, js = sys.argv[1], sys.argv[2]
inj = """<script>
const V=(x,y)=>{const r=cv.getBoundingClientRect();return{clientX:r.left+x/320*r.width,clientY:r.top+y/180*r.height,pointerId:1,pointerType:'mouse',bubbles:true}};
const pe=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,V(x,y)));
const click=(x,y)=>{pe('pointerdown',x,y);pe('pointerup',x,y)};
const dragTo=(x0,y0,x1,y1,drop=true)=>{pe('pointerdown',x0,y0);pe('pointermove',(x0+x1)/2,(y0+y1)/2);pe('pointermove',x1,y1);if(drop)pe('pointerup',x1,y1)};
const freeze=(t=.45)=>{const e=document.createElement('style');e.textContent='*{animation-play-state:paused!important;animation-delay:-'+t+'s!important}';document.head.appendChild(e)};
const st=()=>console.log('STATE gold='+G.P.gold+' team='+G.P.team.map(u=>u?u.key+':'+u.atk+'/'+u.hp+':x'+u.xp:'-').join(',')+' shop='+G.P.shop.map(s=>s.u.key).join(',')+' items='+G.P.items.map(s=>s.item).join(',')+' reserve='+G.P.reserve.map(s=>s.u?s.u.key:s.item).join(',')+(G.res.open?' (open)':'')+' screen='+G.screen);
window.addEventListener('error',e=>console.log('JSERR '+e.message+' @'+e.lineno));
window.addEventListener('unhandledrejection',e=>console.log('REJ '+(e.reason&&e.reason.stack||e.reason)));
setTimeout(()=>{try{ %s }catch(e){console.log('TESTERR '+e.stack)}},600);
</script></body>""" % js
pathlib.Path(out).write_text((root / "index.html").read_text().replace("</body>", inj))
print("wrote", out)
