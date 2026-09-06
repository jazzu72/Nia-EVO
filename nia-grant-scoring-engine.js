const fs=require("fs");

const INPUT="nia-live-grant-sources.json";
const OUTPUT="nia-ranked-grant-opportunities.json";

function score(){

if(!fs.existsSync(INPUT)){
console.log("❌ Grant sources missing");
return;
}

const data=JSON.parse(fs.readFileSync(INPUT));

const ranked=data.sources.map((s,i)=>({

rank:i+1,
source:s.name,
type:s.type,

fitScore:
s.name.includes("NSF") ? 95 :
s.name.includes("SBA") ? 92 :
s.name.includes("Virginia") ? 88 : 90,

priority:s.priority,

companyFit:[
"AI",
"SOFTWARE",
"FINTECH",
"SMALL_BUSINESS",
"INNOVATION"
],

status:"QUALIFIED",

nextAction:"BUILD_APPLICATION_PACKAGE",

timestamp:new Date().toISOString()

}))
.sort((a,b)=>b.fitScore-a.fitScore);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA GRANT SCORING ENGINE",
mode:"FUNDING_FIRST",
topOpportunity:ranked[0],
opportunities:ranked
},null,2)
);

console.log("🎯 GRANT SCORING ENGINE ONLINE");
console.log("TOP TARGET:",ranked[0].source);
console.log("SCORE:",ranked[0].fitScore);

}

score();

setInterval(score,300000);
