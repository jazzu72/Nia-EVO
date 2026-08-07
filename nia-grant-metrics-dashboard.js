const fs=require("fs");

const files={
  readiness:"nia-grant-readiness-report.json",
  alerts:"nia-funding-alert-queue.json",
  tracker:"nia-grant-submission-tracker.json",
  performance:"nia-grant-performance-report.json",
  router:"nia-funding-opportunity-router.json"
};

const out="nia-grant-metrics-dashboard.json";

function load(f){
  try{return JSON.parse(fs.readFileSync(f));}
  catch{return {};}
}

function build(){
  const r=load(files.readiness);
  const a=load(files.alerts);
  const t=load(files.tracker);
  const p=load(files.performance);
  const o=load(files.router);

  const dashboard={
    system:"NIA GRANT METRICS DASHBOARD",
    generated:new Date().toISOString(),
    grantsTracked:(r.reports||[]).length,
    alerts:(a.alerts||[]).length,
    submissionsReady:(t.tracked||[]).filter(x=>x.status==="READY_FOR_SUBMISSION").length,
    analyzed:(p.results||[]).length,
    topOpportunity:o.topOpportunity||null
  };

  fs.writeFileSync(out,JSON.stringify(dashboard,null,2));

  console.log("📊 GRANT METRICS DASHBOARD ONLINE");
  console.log(dashboard);
}

build();
setInterval(build,300000);
