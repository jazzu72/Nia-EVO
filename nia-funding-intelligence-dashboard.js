const fs=require("fs");
const http=require("http");

const PORT=3200;

function read(file){
try{
return JSON.parse(fs.readFileSync(file));
}catch(e){
return {status:"missing"};
}
}

const server=http.createServer((req,res)=>{

const dashboard={

system:"NIA FUNDING INTELLIGENCE DASHBOARD V2",

metrics:{

opportunities:read("nia-funding-opportunity-router.json"),

drafts:read("nia-auto-grant-drafts.json"),

compliance:read("nia-grant-compliance-report.json"),

approvals:read("nia-grant-approval-queue.json"),

packages:read("nia-final-submission-packages.json"),

tracking:read("nia-grant-submission-tracker.json")

},

timestamp:new Date().toISOString()

};

res.writeHead(200,{"Content-Type":"application/json"});
res.end(JSON.stringify(dashboard,null,2));

});

server.listen(PORT,()=>{
console.log("📊 NIA FUNDING INTELLIGENCE DASHBOARD V2 ONLINE");
console.log("PORT:",PORT);
});
