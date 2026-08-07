const fs=require("fs");

const INPUT="nia-execution-queue.json";
const OUTPUT="nia-priority-execution-queue.json";

function guard(){

if(!fs.existsSync(INPUT)){
console.log("❌ Execution queue missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const ranked=(data.tasks||[]).map(t=>{

let priority=t.priority||50;

if(t.type==="GRANTS"){
priority=1;
}

if(t.type==="REAL_ESTATE"){
priority=2;
}

if(t.type==="INVESTOR"){
priority=3;
}

return {
...t,
executionPriority:priority
};

}).sort((a,b)=>a.executionPriority-b.executionPriority);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA FUNDING PRIORITY GUARD",
mode:"GRANTS_FIRST",
rule:"NON_DILUTIVE_CAPITAL_BEFORE_ASSET_DEPLOYMENT",
queueSize:ranked.length,
queue:ranked,
timestamp:new Date().toISOString()
},null,2)
);

console.log("🛡️ FUNDING PRIORITY GUARD ONLINE");
console.log("TOP:",ranked[0]?.type);
console.log("QUEUE:",ranked.length);

}

guard();

setInterval(guard,60000);
