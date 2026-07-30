async function loadCommandMemory(){
 try{
  const res=await fetch("/api/command-center/history");
  const data=await res.json();

  const box=document.getElementById("command-memory");

  if(box){
    box.innerHTML=(data.commands||[])
    .reverse()
    .map(c=>`
      <div class="command-item">
        🧠 <b>${c.command}</b>
        <br>
        <small>${c.timestamp}</small>
        <br>
        🤖 ${c.response}
      </div>
    `)
    .join("") || "No command history yet.";
  }

 }catch(e){
  console.log("Memory sync error:",e.message);
 }
}

loadCommandMemory();
setInterval(loadCommandMemory,30000);
