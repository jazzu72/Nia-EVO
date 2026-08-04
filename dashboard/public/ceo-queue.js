async function loadCEOQueue(){
 try{
  const res=await fetch("/api/ceo-queue-api");
  const data=await res.json();

  const box=document.getElementById("ceo-queue");

  if(box){
   box.innerHTML=`
    <div class="queue-card">
      📌 <b>${data.system}</b>
      <br>
      Pending:
      <b>${data.pending||0}</b>
      /
      Total:
      <b>${data.total||0}</b>
    </div>

    ${(data.queue||[])
      .map(q=>`
       <div class="queue-item">
        ⚡ ${q.priority||"normal"}
        <br>
        ${q.action}
        <br>
        Status: ${q.status}
       </div>
      `).join("") || "No executive actions queued"}
   `;
  }

 }catch(e){
  console.log("CEO queue error:",e.message);
 }
}

loadCEOQueue();
setInterval(loadCEOQueue,30000);
