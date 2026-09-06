const fs=require("fs");

const INPUT="nia-funding-memory.json";
const OUTPUT="nia-grant-performance-report.json";

function analyze(){

if(!fs.existsSync(INPUT)){
console.log("❌ Funding memory missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

let grants={};

(data.memory||[]).forEach(record=>{

const text=JSON.stringify(record);

["NSF SBIR","SBA SBIR","Grants.gov","Virginia Innovation Funding"].forEach(grant=>{

if(text.includes(grant)){

if(!grants[grant]){
grants[grant]={
grant,
mentions:0,
priorityScore:0,
recommendation:"MONITOR"
};
}

grants[grant].mentions++;

}

});

});

const results=Object.values(grants).map(g=>({

...g,

priorityScore:g.mentions*10,

recommendation:
g.mentions>=3 ? "INCREASE_PRIORITY" :
"CONTINUE_MONITORING"

}))
.sort((a,b)=>b.priorityScore-a.priorityScore);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT PERFORMANCE ANALYZER",
mode:"LEARNING_OPTIMIZATION",
totalAnalyzed:results.length,
topGrant:results[0]||null,
results,
updated:new Date().toISOString()
},null,2)
);

console.log("📈 GRANT PERFORMANCE ANALYZER ONLINE");
console.log("ANALYZED:",results.length);

}

analyze();

setInterval(analyze,86400000);
