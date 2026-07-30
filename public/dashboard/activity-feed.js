async function loadActivity(){
 try{
  const res=await fetch("/api/activity");
  const data=await res.json();

  const box=document.getElementById("activity-feed");

  if(box){
   box.innerHTML=(data.activity||[])
   .map(a=>`
    <div class="activity-item">
      ⚡ <b>${a.event}</b>
      <br>
      ${a.detail||""}
      <br>
      <small>${a.timestamp}</small>
    </div>
   `)
   .join("") || "Waiting for activity...";
  }

 }catch(e){
  console.log("Activity feed error:",e.message);
 }
}

loadActivity();
setInterval(loadActivity,10000);
