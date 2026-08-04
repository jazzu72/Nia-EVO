async function loadGrantSubmissions(){
 try{
  const r=await fetch("/api/grants/submissions");
  const data=await r.json();
  const box=document.getElementById("grant-submissions");
  if(box){
   box.innerHTML=(data||[]).slice(0,10).map(s=>`
    <div class="grant-card">
     🚀 <b>${s.grant}</b><br>
     💰 $${Number(s.amount).toLocaleString()}<br>
     ✅ ${s.status}<br>
     🆔 ${s.id}<br>📄 <a href="/grant-pdf/${s.id}.pdf" target="_blank">Package PDF</a>
    </div>`).join("") || "No submissions queued.";
  }
 }catch(e){console.log("Submission error:",e.message)}
}
loadGrantSubmissions();
setInterval(loadGrantSubmissions,60000);
