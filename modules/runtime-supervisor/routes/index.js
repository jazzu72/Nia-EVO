const express=require('express');
const router=express.Router();
const fs=require('fs');

router.get('/health',(req,res)=>{

const report={
timestamp:new Date().toISOString(),
uptime:Math.floor(process.uptime()),
memory:process.memoryUsage(),
checks:{
heartbeat:fs.existsSync("./runtime/heartbeat.json"),
leadScanner:fs.existsSync("./modules/lead-scanner"),
offerEngine:fs.existsSync("./modules/offer-engine"),
buyerCRM:fs.existsSync("./modules/buyer-crm"),
closingTracker:fs.existsSync("./modules/closing-tracker"),
revenueEngine:fs.existsSync("./modules/revenue-engine"),
scheduler:fs.existsSync("./modules/scheduler")
}
};

fs.writeFileSync("./runtime/supervisor.json",JSON.stringify(report,null,2));

res.json(report);

});

module.exports=router;
