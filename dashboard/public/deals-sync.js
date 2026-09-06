async function loadDeals(){
 try{
  const res=await fetch('/api/deal-pipeline');
  const data=await res.json();

  const box=document.getElementById('deal-feed');

  if(box){
    box.innerHTML=(data.deals||[])
    .map(d=>`
      <div class="deal-card">
        <h3>🏠 ${d.address}</h3>
        <p>💰 Value: $${Number(d.value||0).toLocaleString()}</p>
        <p>📌 Stage: ${d.stage}</p>
        <button onclick="advanceDeal('${d.id}')">
          Advance Deal
        </button>
      </div>
    `)
    .join('') || "No deals available.";
  }

 }catch(e){
  console.log("Deal sync error:",e.message);
 }
}

loadDeals();
setInterval(loadDeals,30000);
