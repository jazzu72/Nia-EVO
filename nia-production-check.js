const {exec}=require("child_process");
const fs=require("fs");

console.log("🚀 NIA PRODUCTION READINESS CHECK");

exec("pm2 jlist",(err,data)=>{

if(err)return;

const services=JSON.parse(data);

const online=services.filter(
s=>s.pm2_env.status==="online"
).length;

const failed=services.filter(
s=>s.pm2_env.status!=="online"
).map(s=>s.name);

const report={
system:"NIA-CAPITAL-OS",
mode:"PRODUCTION_READINESS",
servicesOnline:online,
failedServices:failed,
files:{
mission:fs.existsSync("nia-mission-dashboard-api.js"),
audit:fs.existsSync("nia-audit-ledger.json"),
pipeline:fs.existsSync("nia-deal-pipeline.json"),
investors:fs.existsSync("nia-investor-packages.json")
},
timestamp:new Date().toISOString()
};

fs.writeFileSync(
"nia-production-readiness.json",
JSON.stringify(report,null,2)
);

console.log(JSON.stringify(report,null,2));

});

