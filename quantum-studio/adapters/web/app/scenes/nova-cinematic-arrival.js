(()=>{"use strict";
const root=document.createElement("div");
root.id="nova-cinematic-arrival";
root.style.cssText="position:fixed;inset:0;z-index:49000;pointer-events:none;font-family:system-ui,-apple-system,sans-serif";
root.innerHTML=`
<style>
#nova-cinematic-arrival .nova{position:absolute;left:50%;bottom:18%;transform:translate(-50%,40px);opacity:0;transition:all 1.5s cubic-bezier(.2,.8,.2,1)}
#nova-cinematic-arrival .body{width:86px;height:118px;border-radius:42px 42px 28px 28px;background:linear-gradient(145deg,#8ee6c0,#397b68);border:3px solid rgba(240,199,94,.8);box-shadow:0 0 35px rgba(84,199,138,.35)}
#nova-cinematic-arrival .head{width:62px;height:62px;border-radius:50%;background:#c98f68;border:3px solid #f0c75e;margin:-38px auto 8px}
#nova-cinematic-arrival .dialogue{position:absolute;left:50%;bottom:8%;transform:translateX(-50%);width:min(680px,82vw);padding:20px 24px;border:1px solid rgba(240,199,94,.35);border-radius:18px;background:rgba(4,12,17,.94);color:#fff;opacity:0;transition:opacity .8s;box-shadow:0 20px 70px rgba(0,0,0,.5)}
#nova-cinematic-arrival .name{color:#f0c75e;font-size:12px;font-weight:900;letter-spacing:2px;margin-bottom:7px}
#nova-cinematic-arrival .text{font-size:18px;line-height:1.5}

#nova-cinematic-arrival .nova:before{content:"";position:absolute;z-index:-1;left:50%;bottom:65px;transform:translateX(-50%);width:150px;height:280px;background:linear-gradient(to top,rgba(93,255,196,.38),rgba(93,255,196,.12) 45%,transparent);filter:blur(12px);animation:novaBeam 2.4s ease-in-out infinite alternate;pointer-events:none}
#nova-cinematic-arrival .body{box-shadow:0 0 28px rgba(84,199,138,.45),0 0 70px rgba(93,255,196,.2);animation:novaGlow 2.4s ease-in-out infinite alternate}
#nova-cinematic-arrival .head{box-shadow:0 0 24px rgba(240,199,94,.3)}
#nova-cinematic-arrival .dialogue{backdrop-filter:blur(12px);border-color:rgba(240,199,94,.65)}
@keyframes novaBeam{from{opacity:.45;transform:translateX(-50%) scaleX(.75)}to{opacity:1;transform:translateX(-50%) scaleX(1.15)}}
@keyframes novaGlow{from{filter:brightness(1)}to{filter:brightness(1.25)}}
</style>
<div class="nova"><div class="head"></div><div class="body"></div></div>
<div class="dialogue"><div class="name">NOVA</div><div class="text"></div></div>`;
document.body.appendChild(root);
const nova=root.querySelector(".nova"),box=root.querySelector(".dialogue"),text=root.querySelector(".text");
const lines=[
"I've never seen a city like this...",
"Fifty Spark Coins. That's all I've got.",
"Okay, Nova. Find your way through Spark City.",
"Maybe the city will show me what to do next."
];
let i=0;
function say(){
 if(i>=lines.length){setTimeout(()=>root.remove(),900);return}
 text.textContent=lines[i++];
 box.style.opacity="1";
 setTimeout(()=>{box.style.opacity="0";setTimeout(say,500)},3200);
}
setTimeout(()=>{nova.style.opacity="1";nova.style.transform="translate(-50%,0)"},300);
setTimeout(()=>{say()},1800);
})();
