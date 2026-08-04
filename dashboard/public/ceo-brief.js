async function loadCEOBrief(){
 try{
  const res=await fetch("/api/ceo-brief");
  const data=await res.json();

  const box=document.getElementById("ceo-brief");

  if(box){
   box.innerHTML=`
    <div class="brief-card">
     🏰 <b>${data.system}</b>
     <br>
     📅 ${data.date}
    </div>

    <div class="brief-grid">
     <div>🤝 Deals<br><b>${data.summary.activeDeals}</b></div>
     <div>📋 Offers<br><b>${data.summary.offers}</b></div>
     <div>💰 Pipeline<br><b>$${Number(data.summary.pipelineValue||0).toLocaleString()}</b></div>
     <div>🎯 Grants<br><b>$${Number(data.summary.grantPipeline||0).toLocaleString()}</b></div>
     <div>⚡ Actions<br><b>${data.summary.pendingActions}</b></div>
    </div>

    <h3>Priority Actions</h3>

    ${(data.nextActions||[])
      .map(a=>`
       <div class="brief-action">
        🔥 ${a.type||"action"} - ${a.target||""}
       </div>
      `)
      .join("") || "No priority actions."}
   `;
  }

 }catch(e){
  console.log("CEO brief error:",e.message);
 }
}

loadCEOBrief();
setInterval(loadCEOBrief,60000);
