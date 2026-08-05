const fs = require("fs");

const INPUT = "nia-verified-deals.json";
const OUTPUT = "nia-ranked-opportunities.json";

function rank(){

if(!fs.existsSync(INPUT)) return;

let deals = JSON.parse(fs.readFileSync(INPUT));

deals = deals.map(deal=>{

const arv = Number(deal.arv || 0);
const offer = Number(deal.offer || 0);

const spread = arv - offer;
const margin = arv ? (spread / arv) * 100 : 0;

let score = 0;

if(margin >= 40) score += 40;
else if(margin >= 30) score += 30;
else if(margin >= 20) score += 20;

if(deal.confidence === "91.01%") score += 30;

if(deal.discoveryStatus === "VERIFIED") score += 20;

if(deal.source) score += 10;

return {
...deal,
spread,
margin: margin.toFixed(2)+"%",
opportunityScore: score,
rank:
score >= 80 ? "A" :
score >= 60 ? "B" :
"C"
};

});

deals.sort(
(a,b)=>b.opportunityScore-a.opportunityScore
);

fs.writeFileSync(
OUTPUT,
JSON.stringify(deals,null,2)
);

console.log("🏆 NIA OPPORTUNITY RANKER");
console.log(
"TOP DEAL:",
deals[0]?.property || "NONE",
deals[0]?.opportunityScore || 0
);

}

console.log("🏆 NIA OPPORTUNITY RANKER ONLINE");

rank();

setInterval(rank,60000);
