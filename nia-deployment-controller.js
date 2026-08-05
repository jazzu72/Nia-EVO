const fs = require("fs");

const SERVICES = [
"nia-discovery-engine",
"nia-market-scanner",
"nia-opportunity-ranker",
"nia-action-generator",
"nia-action-executor",
"nia-execution-worker",
"nia-capital-intelligence",
"nia-command-center"
];

const REPORT = "nia-deployment-report.json";

function deployCheck(){

const pm2 = require("child_process")
.execSync("pm2 jlist")
.toString();

const processes = JSON.parse(pm2);

const status = SERVICES.map(service=>{

const found = processes.find(
p=>p.name===service
);

return {
service,
online: found ? found.pm2_env.status === "online" : false,
pid: found ? found.pid : null
};

});

const online = status.filter(
s=>s.online
).length;

const report = {
system:"NIA-CAPITAL-OS",
deployment:"ACTIVE_BUILD",
servicesChecked:SERVICES.length,
servicesOnline:online,
health:
online === SERVICES.length
? "DEPLOYMENT_READY"
: "REVIEW_REQUIRED",
timestamp:new Date().toISOString(),
services:status
};

fs.writeFileSync(
REPORT,
JSON.stringify(report,null,2)
);

console.log("🚀 NIA DEPLOYMENT CONTROLLER");
console.log(report.health);
console.log(
"ONLINE:",
online + "/" + SERVICES.length
);

}

console.log("🏰 NIA DEPLOYMENT CONTROLLER ONLINE");

deployCheck();

setInterval(deployCheck,60000);
