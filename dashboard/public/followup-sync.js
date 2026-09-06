async function loadFollowups(){
 try{
  const res=await fetch('/api/followup-live');
  const data=await res.json();

  const box=document.getElementById('followup-feed');

  if(box){
    box.innerHTML=(data.followups||[])
    .filter(f=>f.status==="queued")
    .map(f=>`
      <div class="followup-item">
        📞 ${f.action}
        <br>
        <b>${f.target}</b>
      </div>
    `)
    .join('') || "No pending follow-ups.";
  }

 }catch(e){
  console.log("Follow-up sync error:",e.message);
 }
}

loadFollowups();
setInterval(loadFollowups,30000);
