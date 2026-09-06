const fs = require("fs");

const QUEUE = "execution-queue.json";

function analyze(){

if(!fs.existsSync(QUEUE)) return;

const deals = JSON.parse(fs.readFileSync(QUEUE));

let totalARV = 0;
let totalOffers = 0;
let approved = 0;
let completed = 0;

deals.forEach(d=>{

totalARV += Number(d.arv || 0);
totalOffers += Number(d.offer || 0);

if(d.approved === true){
approved++;
}

if(d.status === "COMPLETED"){
completed++;
}

});

const report = {
system:"NIA-CAPITAL-INTELLIGENCE",
dealsTracked:deals.length,
totalARV,
capitalRequired:totalOffers,
potentialSpread:totalARV-totalOffers,
approvedDeals:approved,
completedDeals:completed,
efficiency:
deals.length ?
((completed/deals.length)*100).toFixed(2)+"%"
:"0%",
timestamp:new Date().toISOString()
};

fs.writeFileSync(
"nia-capital-report.json",
JSON.stringify(report,null,2)
);

console.log("💰 NIA CAPITAL INTELLIGENCE");
console.log(JSON.stringify(report,null,2));

}

console.log("🧠 NIA CAPITAL INTELLIGENCE ONLINE");

analyze();

setInterval(analyze,60000);
