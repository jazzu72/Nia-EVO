const fs=require("fs");
const http=require("http");

const PORT=3100;

function read(file){
try{
return JSON.parse(fs.readFileSync(file));
}catch(e){
return {status:"missing"};
}
}

const server=http.createServer((req,res)=>{

const dashboard={

system:"NIA FUNDING COMMAND DASHBOARD",

pipeline:{
readiness:read("nia-grant-readiness-report.json"),
responseIntelligence:read("nia-grant-response-intelligence.json"),
lifecycle:read("nia-grant-lifecycle-report.json"),
alerts:read("nia-grant-alert-queue.json")
},

timestamp:new Date().toISOString()

};

res.writeHead(200,{"Content-Type":"application/json"});
res.end(JSON.stringify(dashboard,null,2));

});

server.listen(PORT,()=>{
console.log("📊 NIA FUNDING COMMAND DASHBOARD ONLINE");
console.log("PORT:",PORT);
});
