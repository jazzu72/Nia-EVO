const fs = require("fs");

const MEMORY = "nia-deal-memory.json";
const QUEUE = "execution-queue.json";

function gate(){

if(!fs.existsSync(QUEUE)) return;

const queue = JSON.parse(fs.readFileSync(QUEUE));

let memory = [];

if(fs.existsSync(MEMORY)){
memory = JSON.parse(fs.readFileSync(MEMORY));
}

let approved = [];

queue.forEach(task=>{

const seen = memory.find(
m => m.property === task.property
);

if(seen){

approved.push({
...task,
discoveryStatus:"VERIFIED",
verifiedAt:new Date().toISOString()
});

console.log(
"✅ DISCOVERY VERIFIED:",
task.property
);

}

});

fs.writeFileSync(
"nia-verified-deals.json",
JSON.stringify(approved,null,2)
);

console.log(
"🔎 VERIFIED DEALS:",
approved.length
);

}

console.log("🔎 NIA DISCOVERY GATE ONLINE");

gate();

setInterval(gate,60000);
