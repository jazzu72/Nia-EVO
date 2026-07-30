async function sendNiaCommand(){
 const input=document.getElementById("nia-command");
 const output=document.getElementById("nia-response");

 if(!input || !output) return;

 const command=input.value.trim();

 if(!command) return;

 output.innerHTML="🧠 Nia processing...";

 try{
  const res=await fetch("/api/command-center/chat",{
   method:"POST",
   headers:{
    "Content-Type":"application/json"
   },
   body:JSON.stringify({
    command
   })
  });

  const data=await res.json();

  output.innerHTML=
  "🤖 Nia: "+(data.niaResponse||"Command received.");

 }catch(e){
  output.innerHTML="⚠️ Nia connection error.";
 }
}
