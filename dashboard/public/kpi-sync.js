async function loadKPIs(){
 try{
  const [pipeline, revenue, actions, executive] = await Promise.all([
   fetch("/api/pipeline-value").then(r=>r.json()),
   fetch("/api/revenue/report").then(r=>r.json()),
   fetch("/api/actions").then(r=>r.json()),
   fetch("/api/executive/snapshot").then(r=>r.json())
  ]);

  const box=document.getElementById("nia-kpis");

  if(box){
   box.innerHTML=`
    <div class="kpi-card">
     <h3>💰 Pipeline</h3>
     <b>$${Number(pipeline.pipelineValue||0).toLocaleString()}</b>
    </div>

    <div class="kpi-card">
     <h3>🤝 Deals</h3>
     <b>${pipeline.activeDeals||0}</b>
    </div>

    <div class="kpi-card">
     <h3>📈 Revenue</h3>
     <b>$${Number(revenue.totalRevenue||0).toLocaleString()}</b>
    </div>

    <div class="kpi-card">
     <h3>⚡ Actions</h3>
     <b>${(actions.actions||[]).length}</b>
    </div>

    <div class="kpi-card">
     <h3>🎯 Grants</h3>
     <b>${executive.metrics.grantOpportunities||0}</b>
    </div>

    <div class="kpi-card">
     <h3>🏦 Funding</h3>
     <b>$${Number(executive.metrics.grantValue||0).toLocaleString()}</b>
    </div>
   `;
  }

 }catch(e){
  console.log("KPI error:",e.message);
 }
}

loadKPIs();
setInterval(loadKPIs,30000);
