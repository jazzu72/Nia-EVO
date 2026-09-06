async function niaLiveSync(){
 try{
  const endpoints=[
   "/api/activity",
   "/api/status",
   "/api/revenue/report",
   "/api/runtime-supervisor/health"
  ];

  const results=await Promise.all(
   endpoints.map(e=>fetch(e).then(r=>r.json()))
  );

  const status=results[0];
  const revenue=results[1];
  const health=results[2];

  const feed=document.getElementById("nia-response");

  if(feed){
    feed.innerHTML=
    `🟢 ${status.status}<br>
     💰 Revenue tracked: $${Number(revenue.totalRevenue||0).toLocaleString()}<br>
     ⚙️ Runtime checks active: ${Object.values(health.checks||{}).filter(Boolean).length}`;
  }

 }catch(e){
  console.log("Nia sync error",e.message);
 }
}

niaLiveSync();
setInterval(niaLiveSync,30000);
