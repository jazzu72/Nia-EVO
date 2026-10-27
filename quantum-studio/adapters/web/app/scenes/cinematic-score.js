(()=>{"use strict";
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC)return;
let ctx=null,master=null,current=null;
const themes={
 intro:{notes:[261.63,329.63,392,523.25],tempo:62},
 city:{notes:[196,246.94,293.66,392],tempo:92},
 nova:{notes:[261.63,293.66,349.23,392,523.25],tempo:76},
 quantum:{notes:[174.61,233.08,311.13,466.16],tempo:54},
 reward:{notes:[261.63,329.63,392,523.25,659.25],tempo:108}
};
function init(){
 ctx=new AC();
 master=ctx.createGain();
 master.gain.value=.055;
 master.connect(ctx.destination);
}
function play(name){
 if(!ctx)init();
 if(ctx.state==="suspended")ctx.resume();
 if(current)clearInterval(current);
 const t=themes[name]||themes.city;
 let i=0;
 current=setInterval(()=>{
   const now=ctx.currentTime;
   const osc=ctx.createOscillator();
   const gain=ctx.createGain();
   osc.type=name==="quantum"?"sine":"triangle";
   osc.frequency.value=t.notes[i++%t.notes.length];
   gain.gain.setValueAtTime(0,now);
   gain.gain.linearRampToValueAtTime(.18,now+.04);
   gain.gain.exponentialRampToValueAtTime(.001,now+1.6);
   osc.connect(gain);gain.connect(master);
   osc.start(now);osc.stop(now+1.7);
 },60000/t.tempo);
}
window.MMQScore={play,init};
document.addEventListener("click",()=>{if(!ctx)init();play("intro")},{once:true});
})();
