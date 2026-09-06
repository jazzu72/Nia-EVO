async function niaIntelligence(){
 try{
  const [snapshot,history]=await Promise.all([
   fetch("/api/executive/snapshot").then(r=>r.json()),
   fetch("/api/command-center/history").then(r=>r.json())
  ]);

  const box=document.getElementById("nia-intelligence");

  if(box){
   box.innerHTML=`
   <div>
    🏰 System: ${snapshot.status}
   </div>

   <div>
    💰 Pipeline: $${Number(snapshot.metrics.pipelineValue||0).toLocaleString()}
   </div>

   <div>
    🤝 Deals: ${snapshot.metrics.deals}
   </div>

   <div>
    ⚡ Pending Actions: ${snapshot.metrics.pendingActions}
   </div>

   <div>
    🧠 Commands Remembered: ${(history.commands||[]).length}
   </div>
   `;
  }

 }catch(e){
  console.log("Nia intelligence error:",e.message);
 }
}

niaIntelligence();
setInterval(niaIntelligence,15000);
