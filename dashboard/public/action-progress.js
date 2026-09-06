async function loadActionProgress(){
 try{
  const res=await fetch("/api/action-tracker");
  const data=await res.json();

  const box=document.getElementById("action-progress");

  if(box){
   box.innerHTML=`
    <div class="progress-card">
      ✅ Completed Actions:
      <b>${data.completed||0}</b>
    </div>

    ${(data.actions||[])
      .slice(-10)
      .reverse()
      .map(a=>`
       <div class="completed-action">
        ✅ ${a.type}
        <br>
        🎯 ${a.target}
        <br>
        <small>${a.timestamp}</small>
       </div>
      `).join("") || "No completed actions yet."}
   `;
  }

 }catch(e){
  console.log("Action progress error:",e.message);
 }
}

loadActionProgress();
setInterval(loadActionProgress,30000);
