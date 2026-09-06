const fs=require("fs");

const MODEL="nia-evolved-grant-scoring-model.json";
const ROUTER="nia-funding-opportunity-router.json";
const OUTPUT="nia-funding-opportunity-router.json";

if(!fs.existsSync(MODEL)||!fs.existsSync(ROUTER)){
  console.log("❌ Required files missing");
  process.exit(1);
}

const model=JSON.parse(fs.readFileSync(MODEL));
const router=JSON.parse(fs.readFileSync(ROUTER));

const scores={};
(model.models||[]).forEach(m=>scores[m.grant]=m.evolvedScore);

(router.opportunities||[]).forEach(o=>{
  if(scores[o.source]){
    o.fitScore=scores[o.source];
    o.learningEnhanced=true;
  }
});

(router.opportunities||[]).sort((a,b)=>(b.fitScore||0)-(a.fitScore||0));

fs.writeFileSync(OUTPUT,JSON.stringify(router,null,2));

console.log("🧠 NIA GRANT PRIORITY UPDATER ONLINE");
console.log("TOP:",router.opportunities?.[0]?.source||"NONE");
