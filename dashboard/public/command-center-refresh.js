const panels=[
 "/api/status",
 "/api/runtime-supervisor/health",
 "/api/pipeline-value",
 "/api/activity",
 "/api/priority",
 "/api/followup-live",
 "/api/deal-pipeline"
];

async function niaRefresh(){
 const stamp=document.getElementById("nia-last-sync");

 if(stamp){
   stamp.innerHTML="Last sync: "+new Date().toLocaleTimeString();
 }

 for(const endpoint of panels){
  try{
   await fetch(endpoint);
  }catch(e){}
 }
}

niaRefresh();
setInterval(niaRefresh,10000);
