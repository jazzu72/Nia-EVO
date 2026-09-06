const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return {};
 }
}

router.get("/",(req,res)=>{

 const intelligence=read("./data/intelligence-snapshot.json");
 const heartbeat=read("./data/dashboard-heartbeat.json");
 const deployment=read("./data/deployment-check.json");
 const report=read("./reports/final-ops-report.json");
 const decisionReview=read("./reports/decision-review.json");
 const scorecard=read("./reports/system-scorecard.json");
 const alerts=read("./reports/executive-alerts.json");
 const execMetrics=read("./data/executive-metrics.json");
 const ceoQueue=read("./modules/ceo-queue/data/queue.json");

 res.json({
  system:"Nia CEO Command Report",
  status:"OPERATIONAL",
  timestamp:new Date().toISOString(),

  executive:{
   pipeline:intelligence.metrics?.pipelineValue||0,
   deals:intelligence.metrics?.deals||0,
   actions:intelligence.metrics?.pendingActions||0,
   auditEvents:intelligence.metrics?.auditEvents||0
  },

  infrastructure:{
   heartbeat:heartbeat.status||"unknown",
   deployment:deployment.system||"unknown",
   report:report.system||"unknown",
   decisionReview:decisionReview.status||"unknown",
   decisionsReviewed:decisionReview.summary?.totalDecisions||0,
   systemScore:scorecard.score||0,
   systemGrade:scorecard.grade||"UNKNOWN",
   alertCount:alerts.alertCount||0,
   executiveMetrics:{
    queue:execMetrics.queue||{},
    auditEvents:execMetrics.auditEvents||0
   },
   alerts:alerts.alerts||[],
   pendingCEOActions:Array.isArray(ceoQueue)
    ? ceoQueue.filter(q=>q.status==="pending").length
    : 0
  }
 });

});

module.exports=router;
