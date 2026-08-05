const fs = require("fs");

const INPUT = "nia-investor-readiness.json";
const OUTPUT = "nia-funding-submissions.json";

function submit(){

if(!fs.existsSync(INPUT)) return;

const packages = JSON.parse(fs.readFileSync(INPUT));

let submissions = [];

packages.forEach(pkg=>{

if(pkg.investorGrade === "FUND_READY"){

const submission = {
id:"FUND-SUBMISSION-"+Date.now(),

property:pkg.property,

capitalRequest:{
purchaseOffer:pkg.purchaseOffer,
arv:pkg.arv,
estimatedSpread:pkg.estimatedSpread
},

investorScore:pkg.investorScore,

status:"READY_FOR_CAPITAL_PARTNER",

packet:[
"DEAL_SUMMARY",
"ARV_ANALYSIS",
"PROFIT_MARGIN",
"TITLE_REPORT_REQUEST",
"EXIT_STRATEGY"
],

created:new Date().toISOString()
};

submissions.push(submission);

console.log(
"💰 FUNDING SUBMISSION READY:",
pkg.property
);

}

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(submissions,null,2)
);

console.log(
"🚀 FUNDING SUBMISSIONS:",
submissions.length
);

}

console.log("🚀 NIA FUNDING SUBMISSION ENGINE ONLINE");

submit();

setInterval(submit,60000);
