

const fs=require("fs");

function read(path){
 try{return JSON.parse(fs.readFileSync(path,"utf8"));}catch{return [];}
}

function updateCEOReport(){

 const deals=read("./modules/deal-pipeline/data/deals.json");
 const actions=read("./modules/action-center/data/actions.json");

 const report={
  date:new Date().toISOString(),
  system:"Nia Capital OS CEO Report",
  metrics:{
   activeDeals:deals.length,
   pipelineValue:deals.reduce((s,d)=>s+Number(d.value||0),0),
   pendingActions:actions.filter(a=>a.status==="pending").length
  },
  deals:deals.slice(-10),
  priorities:actions.filter(a=>a.priority==="HIGH")
 };

 fs.mkdirSync("./reports",{recursive:true});
 fs.writeFileSync(
  "./reports/daily-report.json",
  JSON.stringify(report,null,2)
 );
}

updateCEOReport();
setInterval(updateCEOReport,60000);
