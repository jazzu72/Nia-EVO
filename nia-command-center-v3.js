const fs = require("fs");
const http = require("http");

const PORT = 3050;

function read(file){
if(!fs.existsSync(file)) return [];
return JSON.parse(fs.readFileSync(file));
}

function build(){

return {
system:"NIA-CAPITAL-OS COMMAND CENTER V3",
status:"LIVE",

pipeline:read("nia-deal-pipeline.json"),

capital:read("nia-capital-packages.json"),

investors:read("nia-investor-packages.json"),

execution:{
actions:read("nia-actions.json"),
tasks:read("nia-action-execution.json")
},

intelligence:read("nia-capital-report.json"),

timestamp:new Date().toISOString()
};

}

http.createServer((req,res)=>{

if(req.url==="/"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify(
build(),
null,
2
));

return;

}

res.writeHead(404);
res.end("NOT FOUND");

}).listen(PORT,()=>{

console.log(
"🏰 NIA COMMAND CENTER V3 ONLINE PORT",
PORT
);

});
