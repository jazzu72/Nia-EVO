const fs = require("fs");
const http = require("http");

const PORT = 3040;

function read(file){
if(!fs.existsSync(file)) return [];
return JSON.parse(fs.readFileSync(file));
}

function dashboard(){

return {
system:"NIA-CAPITAL-OS COMMAND CENTER V2",
status:"PRODUCTION",

deals:{
verified:read("nia-verified-deals.json").length,
ranked:read("nia-ranked-opportunities.json").length,
capitalPackages:read("nia-capital-packages.json").length,
investorPackages:read("nia-investor-packages.json").length
},

execution:{
actions:read("nia-actions.json").length,
tasks:read("nia-action-execution.json").length
},

capital:{
outreach:read("nia-investor-outreach.json").length
},

intelligence:{
report:read("nia-capital-report.json")
},

timestamp:new Date().toISOString()

};

}

http.createServer((req,res)=>{

if(req.url === "/dashboard"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify(
dashboard(),
null,
2
));

return;

}

if(req.url === "/health"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({
system:"NIA-COMMAND-CENTER-V2",
status:"ONLINE"
}));

return;

}

res.writeHead(404);
res.end("NOT FOUND");

}).listen(PORT,()=>{

console.log(
"🏰 NIA COMMAND CENTER V2 ONLINE PORT",
PORT
);

});
