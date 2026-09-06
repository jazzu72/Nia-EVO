async function loadPipelineValue(){
 try{
  const res=await fetch('/api/pipeline-value');
  const data=await res.json();

  const box=document.getElementById('pipeline-value');

  if(box){
    box.innerHTML=`
      💼 Active Deals: ${data.activeDeals || 0}<br>
      💰 Pipeline Value: $${Number(data.pipelineValue || 0).toLocaleString()}<br>
      📈 Projected Revenue: $${Number(data.projectedRevenue || 0).toLocaleString()}
    `;
  }

 }catch(e){
  console.log("Pipeline sync error:",e.message);
 }
}

loadPipelineValue();
setInterval(loadPipelineValue,30000);
