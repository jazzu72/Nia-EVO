async function loadOpportunityScore(){
 try{
  const res=await fetch("/api/opportunity-score");
  const data=await res.json();

  const box=document.getElementById("opportunity-score");

  if(box){
   box.innerHTML=(data.top||[])
   .map(o=>`
    <div class="opportunity-card">
      🚀 <b>${o.type.toUpperCase()}</b>
      <br>
      ${o.target}
      <br>
      💰 Value: $${Number(o.value||0).toLocaleString()}
      <br>
      ⭐ Score: ${Number(o.score||0).toFixed(1)}
    </div>
   `)
   .join("") || "No ranked opportunities.";
  }

 }catch(e){
  console.log("Opportunity score error:",e.message);
 }
}

loadOpportunityScore();
setInterval(loadOpportunityScore,30000);
