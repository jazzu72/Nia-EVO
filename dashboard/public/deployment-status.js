async function loadDeploymentStatus(){
 try{
  const res=await fetch("/api/deployment/status");
  const data=await res.json();

  const box=document.getElementById("deployment-status");

  if(box){
   box.innerHTML=`
    <div class="deployment-card">
      🚀 <b>${data.system||"Nia Deployment Readiness"}</b>
      <br>
      Status: 🟢 ${data.status||"checking"}
      <br>
      Time: ${data.timestamp||""}
    </div>

    ${(data.checks||[])
      .map(c=>`
       <div class="check-card">
        ${c.status==="ready"||c.status==="online"?"🟢":"🟡"}
        ${c.name}: ${c.status}
       </div>
      `).join("") || "No checks available"}
   `;
  }

 }catch(e){
  console.log("Deployment status error:",e.message);
 }
}

loadDeploymentStatus();
setInterval(loadDeploymentStatus,30000);
