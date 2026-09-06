async function loadNiaReport(){
 try{
  const res=await fetch('/reports/daily-report.json');
  const data=await res.json();

  const box=document.getElementById('nia-report');

  if(box){
    box.innerHTML=`
      📅 ${new Date(data.date).toLocaleString()}<br>
      🏠 Offers: ${data.metrics.offers}<br>
      🤝 Deals: ${data.metrics.deals}<br>
      ⚡ Pending Actions: ${data.metrics.pendingActions}<br>
      💰 Pipeline: $${Number(data.metrics.pipelineValue||0).toLocaleString()}
    `;
  }

 }catch(e){
  console.log("Report sync error:",e.message);
 }
}

loadNiaReport();
setInterval(loadNiaReport,60000);
