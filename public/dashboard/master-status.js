async function loadMasterStatus(){
 try{
  const res=await fetch("/api/master-status");
  const data=await res.json();

  const box=document.getElementById("master-status");

  if(box){
   box.innerHTML=`
    <div class="master-card">
      🏰 <b>${data.system}</b>
      <br>
      Updated: ${data.timestamp}
    </div>

    ${(data.services||[])
      .map(s=>`
       <div class="service-card">
        ${s.status==="online"?"🟢":"🔴"}
        ${s.service}: ${s.status}
       </div>
      `).join("")}
   `;
  }

 }catch(e){
  console.log("Master status error:",e.message);
 }
}

loadMasterStatus();
setInterval(loadMasterStatus,15000);
