const fs=require("fs");
const http=require("http");

console.log("🚀 NIA-CAPITAL-OS Deployment Check");

if(!fs.existsSync("./data/revenue-pipeline.json")){
 console.error("❌ Revenue pipeline missing");
 process.exit(1);
}

let data=JSON.parse(fs.readFileSync("./data/revenue-pipeline.json","utf8"));

console.log(`✅ Pipeline loaded: ${data.contacts.length} deals`);
console.log(`💰 Revenue: $${data.revenue||0}`);

