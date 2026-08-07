const express=require("express");
const fs=require("fs");

const app=express();
const PORT=process.env.PORT || 3100;
const FILE="./data/revenue-pipeline.json";

app.get("/api/revenue",(req,res)=>{

const data=JSON.parse(fs.readFileSync(FILE,"utf8"));
const contacts=data.contacts||[];

res.json({
 system:"NIA-CAPITAL-OS",
 timestamp:new Date().toISOString(),
 leads:contacts.length,
 hotLeads:contacts.filter(c=>c.probability>=70).length,
 proposals:contacts.filter(c=>c.proposalSent).length,
 closedDeals:(data.closedDeals||[]).length,
 revenue:data.revenue||0,
 pipelineValue:contacts
  .filter(c=>c.dealStatus!=="won")
  .reduce((s,c)=>s+((c.probability||0)/100)*2500,0)
});

});

app.listen(PORT,()=>{
 console.log(`📊 Revenue API running on port ${PORT}`);
});

app.get("/api/followups",(req,res)=>{
 const data=JSON.parse(fs.readFileSync(FILE,"utf8"));
 res.json({
  followUps:data.contacts
   .filter(c=>c.nextAction||c.followUpScheduled||c.priority==="FOLLOW_UP")
   .map(c=>({
    name:c.name,
    priority:c.priority,
    action:c.nextAction||c.lastAction,
    date:c.followUpDate||c.nextFollowUp
   }))
 });
});
