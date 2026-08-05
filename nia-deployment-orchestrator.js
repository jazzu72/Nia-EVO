const { exec } = require("child_process");
const fs = require("fs");

const REPORT = "nia-deployment-report.json";

const SERVICES = [
"nia-discovery-gate",
"nia-opportunity-ranker",
"nia-action-generator",
"nia-action-executor",
"nia-revenue-attribution",
"nia-security-hardening",
"nia-command-center",
"nia-capital-intelligence",
"nia-market-scanner",
"nia-intelligence-gateway"
];

function deployCheck(){

exec("pm2 jlist",(err,data)=>{

if(err) return;

const processes = JSON.parse(data);

const health = SERVICES.map(name=>{

const service = processes.find(
p=>p.name === name
);

return {
service:name,
status:service ? service.pm2_env.status : "MISSING",
memory:service ? service.monit.memory : 0,
cpu:service ? service.monit.cpu : 0
};

});

const report = {
system:"NIA-DEPLOYMENT-ORCHESTRATOR",
environment:"TERMUX-PRODUCTION",
status:"LIVE",
services:health,
timestamp:new Date().toISOString()
};

fs.writeFileSync(
REPORT,
JSON.stringify(report,null,2)
);

console.log("🚀 NIA DEPLOYMENT HEALTH CHECK");
console.log(JSON.stringify(report,null,2));

});

}

console.log("🚀 NIA DEPLOYMENT ORCHESTRATOR ONLINE");

deployCheck();

setInterval(deployCheck,300000);
