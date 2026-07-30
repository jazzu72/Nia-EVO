async function loadSystemHealth(){
 try{
  const res=await fetch("/api/system-health");
  const data=await res.json();

  const box=document.getElementById("system-health");

  if(box){
   box.innerHTML=`
    <div class="health-card">
      🟢 <b>${data.status}</b>
      <br>
      ${data.system}
      <br>
      <small>${data.timestamp}</small>
    </div>

    ${Object.entries(data.services||{})
      .map(([name,status])=>`
       <div class="health-item">
        ${status==="online"?"🟢":"🔴"} ${name}: ${status}
       </div>
      `).join("")}
   `;
  }

 }catch(e){
  console.log("Health check error:",e.message);
 }
}

loadSystemHealth();
setInterval(loadSystemHealth,15000);
