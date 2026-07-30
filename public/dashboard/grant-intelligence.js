async function loadGrantIntelligence(){
 try{
  const res=await fetch("/api/grant-intelligence");
  const data=await res.json();

  const box=document.getElementById("grant-intelligence");

  if(box){
   box.innerHTML=(data.ranked||[])
   .slice(0,10)
   .map(g=>`
    <div class="grant-card">
      🎯 <b>${g.name||"Funding Opportunity"}</b>
      <br>
      💰 Amount: $${Number(g.amount||0).toLocaleString()}
      <br>
      📌 Status: ${g.status||"identified"}
      <br>
      <small>${g.source||"Nia Discovery"}</small>
    </div>
   `)
   .join("") || "No grant opportunities loaded.";
  }

 }catch(e){
  console.log("Grant intelligence error:",e.message);
 }
}

loadGrantIntelligence();
setInterval(loadGrantIntelligence,60000);
