async function loadActionQueue(){
 try{
  const res=await fetch("/api/action-queue");
  const data=await res.json();

  const box=document.getElementById("action-queue");

  if(box){
   box.innerHTML=(data.queue||[])
   .map(a=>`
    <div class="action-card">
      ⚡ <b>${a.priority}</b>
      <br>
      ${a.type}
      <br>
      🎯 ${a.target}
      <br>
      Status: ${a.status}
    </div>
   `)
   .join("") || "No queued actions.";
  }

 }catch(e){
  console.log("Action queue error:",e.message);
 }
}

loadActionQueue();
setInterval(loadActionQueue,30000);
