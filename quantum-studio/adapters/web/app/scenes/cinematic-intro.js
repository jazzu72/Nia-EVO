(()=>{"use strict";
const params=new URLSearchParams(location.search);
if(localStorage.getItem("mmq_intro_seen")==="true"&&params.get("cinematic")!=="1")return;
if(document.getElementById("mmq-cinematic-intro"))return;
const root=document.createElement("div");
root.id="mmq-cinematic-intro";
root.innerHTML=`

<style>
#mmq-cinematic-intro{position:fixed;inset:0;z-index:50000;background:#020710;color:white;overflow:hidden;font-family:system-ui,sans-serif}
#mmq-cinematic-intro canvas{position:absolute;inset:0;width:100%;height:100%}
#mmq-cinematic-intro .grade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.42),transparent 45%,rgba(0,0,0,.18)),linear-gradient(0deg,rgba(0,0,0,.75),transparent 40%,rgba(0,0,0,.25));pointer-events:none}
#mmq-cinematic-intro .bar{position:absolute;left:0;right:0;height:8%;background:#010307;z-index:3}
#mmq-cinematic-intro .top{top:0}.bottom{bottom:0}
#mmq-cinematic-intro .caption{position:absolute;z-index:4;left:8%;right:8%;bottom:15%;text-align:center;opacity:0;transform:translateY(16px);transition:opacity 1.1s,transform 1.1s;text-shadow:0 3px 25px #000}
#mmq-cinematic-intro .caption.show{opacity:1;transform:translateY(0)}
#mmq-cinematic-intro .eyebrow{font-size:11px;letter-spacing:5px;font-weight:900;color:#f4d17b;margin-bottom:14px}
#mmq-cinematic-intro h1{font-size:clamp(30px,7vw,76px);line-height:.98;letter-spacing:-2px;margin:0 0 15px;text-transform:uppercase}
#mmq-cinematic-intro p{font-size:clamp(14px,2.5vw,21px);line-height:1.55;color:#d4e0e8;margin:auto;max-width:700px}
#mmq-cinematic-intro .skip{position:absolute;z-index:8;right:20px;top:10%;border:1px solid #ffffff55;background:#07121acc;color:white;padding:10px 15px;border-radius:30px;letter-spacing:1px;font-size:11px;font-weight:800}
#mmq-cinematic-intro .enter{display:none;margin-top:22px;padding:15px 26px;border:1px solid #f4d17b;background:#d7a943;color:#10151a;border-radius:3px;font-weight:1000;letter-spacing:2px}
#mmq-cinematic-intro .enter.show{display:inline-block}
#mmq-cinematic-intro .brand{position:absolute;z-index:4;top:10%;left:8%;font-size:10px;letter-spacing:3px;color:#ffffff99}
</style><canvas id="mmq-movie"></canvas><div class="grade"></div><div class="bar top"></div><div class="bar bottom"></div>

<div class="brand">QUANTUM BRANCH STUDIO · ORIGINAL ADVENTURE</div><button class="skip" id="mmqSkipMovie">SKIP INTRO ↗</button>
<div class="caption show" id="mmqCaption"><div class="eyebrow">A QUANTUM ODYSSEY</div><h1>Before the first spark…</h1><p>Every great journey begins in a world waiting to change.</p></div>`;
document.body.appendChild(root);
const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d");
let w=0,h=0,dpr=1,start=performance.now(),raf=0,finished=false;
const stars=Array.from({length:180},()=>({x:Math.random(),y:Math.random()*.72,r:Math.random()*1.8+.3,p:Math.random()*7}));
const buildings=Array.from({length:48},(_,i)=>({x:i/48,width:.009+Math.random()*.018,height:.08+Math.random()*.32,seed:Math.random()*10}));
const particles=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),s:Math.random()*2+0.5,v:Math.random()*.0008+.0002}));
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();
function line(x1,y1,x2,y2,color,width){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function draw(t){
const sec=(t-start)/1000;const travel=Math.min(sec/17,1);
ctx.clearRect(0,0,w,h);
const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#020611");sky.addColorStop(.48,"#102c42");sky.addColorStop(1,"#d28a51");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
const cx=w*(.5+Math.sin(sec*.12)*.035),cy=h*.43;
const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,h*.52);glow.addColorStop(0,"#ffdf91aa");glow.addColorStop(.25,"#36cbb344");glow.addColorStop(1,"#06101a00");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
for(const s of stars){ctx.globalAlpha=.25+.65*(.5+.5*Math.sin(sec*1.3+s.p));ctx.fillStyle="#e8f7ff";ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
const horizon=h*.68;
for(let i=0;i<buildings.length;i++){const b=buildings[i],x=b.x*w+Math.sin(sec*.08+i)*w*.002,bh=b.height*h*(.7+travel*.5),bw=b.width*w;const y=horizon-bh;const g=ctx.createLinearGradient(x,y,x+bw,horizon);g.addColorStop(0,"#16354a");g.addColorStop(1,"#050e19");ctx.fillStyle=g;ctx.fillRect(x,y,bw,bh);ctx.fillStyle=i%3===0?"#f4ce78":"#46e3c0";for(let wy=y+10;wy<horizon-5;wy+=13){for(let wx=x+4;wx<x+bw-3;wx+=9){if(Math.sin(wx*wy+b.seed)>-.1){ctx.globalAlpha=.35+.45*Math.abs(Math.sin(sec+wx));ctx.fillRect(wx,wy,2,4)}}}ctx.globalAlpha=1;if(i%7===0){line(x+bw/2,y,x+bw/2,y-15,"#f4ce78aa",1)}}
const coreR=12+Math.sin(sec*2)*3+travel*25;
ctx.shadowBlur=35;ctx.shadowColor="#f7ce76";ctx.fillStyle="#fff1b9";ctx.beginPath();ctx.arc(cx,cy,Math.max(3,coreR*(1-travel*.3)),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(cx,cy,coreR*(2+k*.8),coreR*(.45+k*.13),sec*.18+k,0,Math.PI*2);ctx.strokeStyle="rgba(94,245,215,"+(.45-k*.1)+")";ctx.lineWidth=1.5;ctx.stroke()}
for(const p of particles){p.y-=p.v*16;if(p.y<0)p.y=1;ctx.fillStyle="#f4d17b";ctx.globalAlpha=.2+Math.abs(Math.sin(sec+p.x*8))*.6;ctx.fillRect(p.x*w,p.y*h,p.s,p.s)}ctx.globalAlpha=1;
const shipX=((sec*.045)%1.3-.15)*w,shipY=h*(.27+Math.sin(sec*.7)*.025);ctx.save();ctx.translate(shipX,shipY);ctx.fillStyle="#162c3d";ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(-10,-5);ctx.lineTo(19,-2);ctx.lineTo(28,2);ctx.lineTo(5,6);ctx.closePath();ctx.fill();ctx.fillStyle="#f4d17b";ctx.fillRect(-19,2,10,2);ctx.restore();
if(sec>5){const a=Math.min((sec-5)/2,1);ctx.save();ctx.globalAlpha=a;ctx.translate(w*.5,h*(.65-Math.min((sec-5)*.018,.12)));ctx.scale(Math.min(w,h)/500,Math.min(w,h)/500);ctx.fillStyle="#07101b";ctx.beginPath();ctx.ellipse(0,26,17,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111f2d";ctx.beginPath();ctx.moveTo(-10,24);ctx.lineTo(-13,0);ctx.lineTo(-7,-13);ctx.lineTo(0,-17);ctx.lineTo(7,-13);ctx.lineTo(13,0);ctx.lineTo(10,24);ctx.closePath();ctx.fill();ctx.fillStyle="#e8bd65";ctx.shadowColor="#e8bd65";ctx.shadowBlur=16;ctx.beginPath();ctx.arc(0,-9,3,0,Math.PI*2);ctx.fill();ctx.restore()}
raf=requestAnimationFrame(draw)}
const captions=[
[0,"A QUANTUM ODYSSEY","Before the first spark…","Every great journey begins in a world waiting to change."],
[4,"SOMEWHERE BEYOND TOMORROW","A city powered by possibility.","Here, every coin carries a choice—and every choice can change a future."],
[8,"MEET NOVA","One small spark can change everything.","Nova has 50 Spark Coins. Ahead lies a city full of dreams, needs, and surprises."],
[12,"THE FIRST CHOICE","The future is not written yet.","A friend needs help. A mysterious energy is fading. The adventure begins now."],
[16,"YOUR STORY BEGINS","Welcome to Spark City.","Explore. Discover. Decide what kind of future you want to build."]
];
const cap=root.querySelector("#mmqCaption");let last=-1;
function story(){if(finished)return;const sec=(performance.now()-start)/1000;let n=0;for(let j=0;j<captions.length;j++)if(sec>=captions[j][0])n=j;if(n!==last){last=n;cap.classList.remove("show");setTimeout(()=>{if(finished)return;cap.querySelector(".eyebrow").textContent=captions[n][1];cap.querySelector("h1").textContent=captions[n][2];cap.querySelector("p").textContent=captions[n][3];cap.classList.add("show");if(n===4)root.querySelector("#mmqEnterMovie").classList.add("show")},250)}if(sec<20)requestAnimationFrame(story);else root.querySelector("#mmqEnterMovie").classList.add("show")}
const enter=document.createElement("button");enter.id="mmqEnterMovie";enter.className="enter";enter.textContent="ENTER SPARK CITY →";cap.appendChild(enter);
function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);root.remove();localStorage.setItem("mmq_intro_seen","true");setTimeout(()=>{const s=document.createElement("script");s.src="/scenes/nova-intro.js";document.body.appendChild(s)},350)}
root.querySelector("#mmqSkipMovie").onclick=finish;enter.onclick=finish;
requestAnimationFrame(draw);requestAnimationFrame(story);
})();
