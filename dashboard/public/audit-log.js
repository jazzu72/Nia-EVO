async function loadAuditLog(){
 try{
  const res=await fetch("/api/audit-log");
  const data=await res.json();

  const box=document.getElementById("audit-log");

  if(box){
   box.innerHTML=(data.events||[])
   .slice(0,20)
   .map(e=>`
    <div class="audit-card">
      📝 <b>${e.event}</b>
      <br>
      ${e.detail||""}
      <br>
      <small>${e.timestamp}</small>
    </div>
   `)
   .join("") || "No audit events recorded.";
  }

 }catch(e){
  console.log("Audit log error:",e.message);
 }
}

loadAuditLog();
setInterval(loadAuditLog,30000);
