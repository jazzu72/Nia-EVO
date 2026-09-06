const fs = require("fs");
const http = require("http");

const PORT = 3030;

function read(file){
  if(!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

http.createServer((req,res)=>{

if(req.url === "/deals"){

const packages = read("nia-investor-packages.json");

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({
system:"NIA-DEAL-ROOM",
status:"LIVE",
investorPackages:packages.length,
deals:packages,
timestamp:new Date().toISOString()
},null,2));

return;
}


if(req.url === "/health"){

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({
system:"NIA-DEAL-ROOM",
status:"ONLINE"
},null,2));

return;
}


res.writeHead(404);
res.end("NOT FOUND");


}).listen(PORT,()=>{

console.log(
"🏦 NIA DEAL ROOM ONLINE PORT",
PORT
);

});
