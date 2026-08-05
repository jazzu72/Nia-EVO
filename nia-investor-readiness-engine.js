const fs = require("fs");

const INPUT = "nia-capital-packages.json";
const OUTPUT = "nia-investor-readiness.json";

function evaluate(){

if(!fs.existsSync(INPUT)) return;

const packages = JSON.parse(fs.readFileSync(INPUT));

const results = packages.map(pkg=>{

let score = 0;

const spread = Number(pkg.estimatedSpread || 0);
const arv = Number(pkg.arv || 0);

if(spread >= 50000) score += 40;
else if(spread >= 25000) score += 25;

if(arv >= 150000) score += 20;

if(pkg.requirements.includes("TITLE_REPORT"))
score += 10;

if(pkg.requirements.includes("FUNDING_CONFIRMATION"))
score += 10;

score += 20;

return {
...pkg,

investorScore:score,

investorGrade:
score >= 80 ? "FUND_READY" :
score >= 60 ? "REVIEW_READY" :
"NEEDS_WORK",

nextStep:
score >= 80 ?
"SUBMIT_TO_CAPITAL_PARTNER" :
"CONTINUE_DUE_DILIGENCE",

evaluatedAt:new Date().toISOString()
};

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(results,null,2)
);

console.log("📈 NIA INVESTOR READINESS COMPLETE");
console.log(
"PACKAGES EVALUATED:",
results.length
);

}

console.log("📈 NIA INVESTOR READINESS ENGINE ONLINE");

evaluate();

setInterval(evaluate,60000);
