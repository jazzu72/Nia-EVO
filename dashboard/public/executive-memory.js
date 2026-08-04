async function loadExecutiveMemory(){
 try{
  const res=await fetch("/api/executive-memory");
  const data=await res.json();

  const box=document.getElementById("executive-memory");

  if(box){
   box.innerHTML=`
    <div class="memory-card">
      🧠 <b>${data.system||"Nia Executive Memory"}</b>
      <br>
      Records Stored:
      <b>${(data.records||[]).length}</b>
    </div>

    ${(data.records||[])
      .slice(-10)
      .reverse()
      .map(r=>`
       <div class="memory-entry">
        📅 ${r.timestamp||""}
        <br>
        💰 Pipeline:
        $${Number(r.pipeline||0).toLocaleString()}
        <br>
        🏠 Deals:
        ${r.deals||0}
        | ⚡ Actions:
        ${r.actions||0}
        | ${r.status||"unknown"}
       </div>
      `).join("") || "No archived executive records"}
   `;
  }

 }catch(e){
  console.log("Executive memory error:",e.message);
 }
}

loadExecutiveMemory();
setInterval(loadExecutiveMemory,60000);
