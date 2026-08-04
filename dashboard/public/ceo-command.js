async function loadCEOCommand(){
 try{
  const res=await fetch("/api/ceo-command");
  const data=await res.json();

  const box=document.getElementById("ceo-command");

  if(box){
   box.innerHTML=`
    <div class="ceo-card">
      👑 <b>${data.system}</b>
      <br>
      Status: 🟢 ${data.status}
      <br>
      Updated: ${data.timestamp}
    </div>

    <div class="executive-metrics">
      💰 Pipeline:
      <b>$${Number(data.executive?.pipeline||0).toLocaleString()}</b>
      <br>
      🏠 Deals:
      <b>${data.executive?.deals||0}</b>
      <br>
      ⚡ Actions:
      <b>${data.executive?.actions||0}</b>
      <br>
      📝 Audit Events:
      <b>${data.executive?.auditEvents||0}</b>
    </div>

    <div class="system-summary">
      ❤️ Heartbeat:
      ${data.infrastructure?.heartbeat||"unknown"}
      <br>
      🚀 Deployment:
      ${data.infrastructure?.deployment||"unknown"}
      <br>
      📊 Report:
      ${data.infrastructure?.report||"unknown"}
    </div>
   `;
  }

 }catch(e){
  console.log("CEO command error:",e.message);
 }
}

loadCEOCommand();
setInterval(loadCEOCommand,30000);
