async function loadGrantPackages(){
 try{
  const res=await fetch("/api/grant-packages");
  const data=await res.json();

  const box=document.getElementById("grant-packages");

  if(box){
   box.innerHTML=(data||[])
   .slice(0,5)
   .map(p=>`
    <div class="grant-card">
      📄 <b>${p.grant}</b>
      <br>
      💰 $${Number(p.amount||0).toLocaleString()}
      <br>
      ✅ ${p.status}
      <br>
      🆔 ${p.id}<br>📥 <a href="/grant-pdf/${p.id}.pdf" target="_blank">Download PDF</a>
    </div>
   `).join("") || "No packages generated.";
  }
 }catch(e){
  console.log("Grant package error:",e.message);
 }
}
loadGrantPackages();
setInterval(loadGrantPackages,60000);
