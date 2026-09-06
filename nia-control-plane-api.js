const http=require("http");
const fs=require("fs");

const PORT=3050;

function read(file){
if(!fs.existsSync(file)) return [];
return JSON.parse(fs.readFileSync(file));
}

function response(res,data){
res.writeHead(200,{
"Content-Type":"application/json"
});
res.end(JSON.stringify(data,null,2));
}

http.createServer((req,res)=>{

if(req.url==="/control"){

response(res,{
system:"NIA-CAPITAL-OS CONTROL PLANE",
status:"PRODUCTION",

overview:{
deals:read("nia-deal-pipeline.json").length,
capitalPackages:read("nia-capital-packages.json").length,
investors:read("nia-investor-packages.json").length,
actions:read("nia-actions.json").length,
audits:read("nia-audit-ledger.json").length
},

approvalQueue:
read("nia-audit-ledger.json")
.filter(a=>a.approvalRequired && !a.verified),

timestamp:new Date().toISOString()
});

return;
}


if(req.url==="/health"){

response(res,{
system:"NIA-CONTROL-PLANE",
status:"ONLINE"
});

return;
}


res.writeHead(404);
res.end("NOT FOUND");


}).listen(PORT,()=>{

console.log(
"🎛️ NIA CONTROL PLANE ONLINE PORT",
PORT
);

});
