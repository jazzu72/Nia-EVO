const http=require("http");
const fs=require("fs");

const PORT=3070;

function read(file){
if(!fs.existsSync(file)) return [];
return JSON.parse(fs.readFileSync(file));
}

function stats(){

return {
system:"NIA MISSION DASHBOARD",
environment:"PRODUCTION",

capitalOS:{
status:"ONLINE",
deals:read("nia-deal-pipeline.json").length,
capitalPackages:read("nia-capital-packages.json").length,
investorPackages:read("nia-investor-packages.json").length
},

execution:{
actions:read("nia-actions.json").length,
completed:read("nia-action-execution.json")
.filter(x=>x.status==="COMPLETED").length
},

governance:{
audits:read("nia-audit-ledger.json").length,
pendingApproval:
read("nia-audit-ledger.json")
.filter(x=>x.approvalRequired && !x.verified).length
},

intelligence:
read("nia-capital-report.json"),

timestamp:new Date().toISOString()

};

}

http.createServer((req,res)=>{

if(req.url==="/mission"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify(stats(),null,2));

return;

}

if(req.url==="/health"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({
system:"NIA-MISSION-DASHBOARD",
status:"ONLINE"
}));

return;

}

res.writeHead(404);
res.end("NOT FOUND");

}).listen(PORT,()=>{

console.log(
"🌐 NIA MISSION DASHBOARD ONLINE PORT",
PORT
);

});
