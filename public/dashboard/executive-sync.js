async function loadExecutiveSnapshot(){
 try{
  const res=await fetch("/api/executive/snapshot");
  const data=await res.json();

  const box=document.getElementById("executive-snapshot");

  if(box){
   box.innerHTML=`
    <div class="exec-status">
     🏰 ${data.system}<br>
     🟢 ${data.status}
    </div>

    <div class="exec-metrics">
     <div>🏠 Offers<br><b>${data.metrics.offers}</b></div>
     <div>🤝 Deals<br><b>${data.metrics.deals}</b></div>
     <div>💰 Pipeline<br><b>$${Number(data.metrics.pipelineValue||0).toLocaleString()}</b></div>
     <div>⚡ Actions<br><b>${data.metrics.pendingActions}</b></div>
    </div>

    <h3>Priority Actions</h3>
    ${(data.priorities||[])
      .map(p=>`<div>🔥 ${p.type} - ${p.target}</div>`)
      .join("") || "No priority actions"}
   `;
  }

 }catch(e){
  console.log("Executive sync error:",e.message);
 }
}

loadExecutiveSnapshot();
setInterval(loadExecutiveSnapshot,15000);
