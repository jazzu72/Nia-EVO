async function loadRevenueBoard(){
 try{
  const res=await fetch("/api/revenue-board");
  const data=await res.json();

  const box=document.getElementById("revenue-board");

  if(box){
   box.innerHTML=`
   <div class="revenue-total">
    💰 Opportunity Value: $${Number(data.totalValue||0).toLocaleString()}
   </div>

   ${(data.opportunities||[])
    .map(o=>`
      <div class="revenue-card">
        <b>${o.priority}</b>
        <br>
        ${o.type}: ${o.target}
        <br>
        Status: ${o.status}
        <br>
        Value: $${Number(o.value||0).toLocaleString()}
      </div>
    `).join("") || "No revenue opportunities found."}
   `;
  }

 }catch(e){
  console.log("Revenue board error:",e.message);
 }
}

loadRevenueBoard();
setInterval(loadRevenueBoard,30000);
