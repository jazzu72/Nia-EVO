async function loadLaunchGate(){
 try{
  const res=await fetch("/api/launch-gate");
  const data=await res.json();

  const box=document.getElementById("launch-gate");

  if(box){
   box.innerHTML=`
    <div class="launch-card">
      🚀 <b>${data.system}</b>
      <br>
      Status:
      <strong>${data.status}</strong>
      <br>
      Pipeline:
      $${Number(data.summary?.pipeline||0).toLocaleString()}
      <br>
      Pending Actions:
      ${data.summary?.actions||0}
      <br>
      Audit Events:
      ${data.summary?.events||0}
    </div>

    ${(Object.entries(data.checks||{}))
      .map(([k,v])=>`
       <div class="launch-check">
        ${v===true?"🟢":"🟡"} ${k}: ${v}
       </div>
      `).join("")}
   `;
  }

 }catch(e){
  console.log("Launch gate error:",e.message);
 }
}

loadLaunchGate();
setInterval(loadLaunchGate,30000);
