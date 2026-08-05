const fs = require("fs");

const INPUT = "nia-investor-packages.json";
const OUTPUT = "nia-investor-outreach.json";

function outreach(){

if(!fs.existsSync(INPUT)) return;

const packages = JSON.parse(fs.readFileSync(INPUT));

let queue = [];

packages.forEach(pkg=>{

const existing = queue.find(
x=>x.packageId === pkg.id
);

if(!existing){

queue.push({

id:"INVESTOR-CONTACT-"+Date.now(),

packageId:pkg.id,

property:pkg.property,

targets:[
"PRIVATE_INVESTORS",
"REAL_ESTATE_FUNDS",
"CAPITAL_PARTNERS"
],

subject:
"NIA Capital Opportunity: "+pkg.property,

message:
"Investment opportunity identified by NIA Capital OS. "+
"Purchase: $"+pkg.summary.purchasePrice+
" | ARV: $"+pkg.summary.afterRepairValue+
" | Projected Spread: $"+pkg.summary.projectedSpread,

status:"READY_FOR_REVIEW",

priority:
pkg.summary.projectedSpread >= 75000 ?
"URGENT" :
"HIGH",

created:new Date().toISOString()

});

console.log(
"📡 INVESTOR OUTREACH READY:",
pkg.property
);

}

});


fs.writeFileSync(
OUTPUT,
JSON.stringify(queue,null,2)
);

console.log(
"📡 OUTREACH QUEUE SIZE:",
queue.length
);

}


console.log(
"📡 NIA INVESTOR OUTREACH ENGINE ONLINE"
);

outreach();

setInterval(outreach,60000);
