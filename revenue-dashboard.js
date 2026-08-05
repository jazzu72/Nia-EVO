const fs = require("fs");
const http = require("http");

const PORT = 3010;
const FILE = "nia-revenue.json";

http.createServer((req,res)=>{
  if(req.url === "/revenue") {
    let data = [];

    if(fs.existsSync(FILE)) {
      data = JSON.parse(fs.readFileSync(FILE));
    }

    const total = data.reduce(
      (sum,d)=>sum + Number(d.estimatedProfit || 0),0
    );

    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify({
      system:"NIA-REVENUE-DASHBOARD",
      deals:data.length,
      totalEstimatedProfit:total,
      records:data
    },null,2));

    return;
  }

  res.writeHead(404);
  res.end("NOT FOUND");

}).listen(PORT,()=>{
  console.log("💵 NIA REVENUE DASHBOARD ONLINE PORT",PORT);
});
