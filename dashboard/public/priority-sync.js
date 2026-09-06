async function loadPriorities(){
 try{
  const res=await fetch('/api/priority');
  const data=await res.json();

  const box=document.getElementById('priority-feed');

  if(box){
    box.innerHTML=(data.topActions||[])
    .map(a=>`
      <div class="priority-item">
        <b>${a.priority||"NORMAL"}</b>
        <span>${a.target||"Unknown"}</span>
        <small>${a.type||"action"}</small>
      </div>
    `)
    .join('') || "No priority actions.";
  }

 }catch(e){
  console.log("Priority sync error:",e.message);
 }
}

loadPriorities();
setInterval(loadPriorities,30000);
