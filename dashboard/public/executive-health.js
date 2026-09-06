async function loadExecutiveHealth(){
 try{
  const res=await fetch("/api/executive-health");
  const data=await res.json();

  const box=document.getElementById("executive-health");

  if(box){
   box.innerHTML=`
    <div class="health-card">
      🏰 <b>${data.system}</b>
      <br>
      Status: 🟢 ${data.status}
      <br>
      Updated: ${data.timestamp}
    </div>

    <div class="health-metrics">
      📜 Audit Events: <b>${data.health.auditEvents}</b><br>
      🏠 Active Deals: <b>${data.health.activeDeals}</b><br>
      ⚡ Pending Actions: <b>${data.health.pendingActions}</b><br>
      🛡️ Services: <b>${data.health.services}</b>
    </div>

    <h3>Recent Events</h3>
    ${(data.latest||[])
      .map(e=>`
       <div class="event-card">
        ${e.event}: ${e.detail}
       </div>
      `).join("") || "No recent events"}
   `;
  }

 }catch(e){
  console.log("Executive health error:",e.message);
 }
}

loadExecutiveHealth();
setInterval(loadExecutiveHealth,15000);
