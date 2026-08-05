const fs = require("fs");
const http = require("http");

const PORT = 3020;

function read(file){
  if(!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

http.createServer((req,res)=>{

  if(req.url === "/status"){

    const queue = read("execution-queue.json");
    const alerts = read("nia-alerts.json");
    const actions = read("nia-actions.json");

    const report = {
      system:"NIA-CAPITAL-OS",
      status:"ONLINE",
      executionQueue:queue.length,
      activeActions:actions.length,
      alerts:alerts.length,
      completedDeals:
        queue.filter(q=>q.status==="COMPLETED").length,
      timestamp:new Date().toISOString()
    };

    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(report,null,2));
    return;
  }

  res.writeHead(404);
  res.end("NOT FOUND");

}).listen(PORT,()=>{
  console.log(
    "🏰 NIA COMMAND CENTER ONLINE PORT",
    PORT
  );
});
