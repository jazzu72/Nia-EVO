async function loadCEOBriefing(){
 try{
  const res=await fetch("/api/ceo-briefing");
  const data=await res.json();

  const box=document.getElementById("ceo-briefing");

  if(box){
   box.innerHTML=`
    <div class="briefing-card">
      📊 <b>${data.system||"Nia CEO Briefing"}</b>
      <br>
      Status: 🟢 ${data.executive?.status||"ONLINE"}
      <br>
      Time: ${data.timestamp||""}
    </div>

    <div class="briefing-metrics">
      💰 Pipeline:
      <b>$${Number(data.executive?.pipeline||0).toLocaleString()}</b>
      <br>
      🏠 Deals:
      <b>${data.executive?.deals||0}</b>
      <br>
      ⚡ Actions:
      <b>${data.executive?.actions||0}</b>
      <br>
      📝 Events:
      <b>${data.executive?.auditEvents||0}</b>
    </div>

    <h3>Priority Items</h3>
    ${(data.priorities||[])
      .map(p=>`
       <div class="priority-card">
        🔥 ${p.type||"task"} ${p.target||""}
       </div>
      `).join("") || "No priority items"}
   `;
  }

 }catch(e){
  console.log("CEO briefing error:",e.message);
 }
}

loadCEOBriefing();
setInterval(loadCEOBriefing,30000);
