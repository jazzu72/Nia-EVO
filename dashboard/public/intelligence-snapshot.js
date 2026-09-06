async function loadIntelligenceSnapshot(){
 try{
  const res=await fetch("/api/intelligence/snapshot");
  const data=await res.json();

  const box=document.getElementById("intelligence-snapshot");

  if(box){
   const m=data.metrics||{};

   box.innerHTML=`
    <div class="intelligence-card">
      🧠 <b>${data.system||"Nia Intelligence"}</b>
      <br>
      Status: 🟢 ${data.status||"ONLINE"}
      <br>
      Updated: ${data.timestamp||""}
    </div>

    <div class="metrics-grid">
      🏠 Deals: <b>${m.deals||0}</b><br>
      📋 Offers: <b>${m.offers||0}</b><br>
      💰 Pipeline: <b>$${Number(m.pipelineValue||0).toLocaleString()}</b><br>
      🎯 Grants: <b>$${Number(m.grantValue||0).toLocaleString()}</b><br>
      ⚡ Actions: <b>${m.pendingActions||0}</b><br>
      📝 Events: <b>${m.auditEvents||0}</b>
    </div>

    <h3>Priority Queue</h3>
    ${(data.priorities||[])
      .map(p=>`
       <div class="priority-card">
        🔥 ${p.type||"task"} - ${p.target||""}
       </div>
      `).join("") || "No priority items"}

   `;
  }

 }catch(e){
  console.log("Intelligence snapshot error:",e.message);
 }
}

loadIntelligenceSnapshot();
setInterval(loadIntelligenceSnapshot,30000);
