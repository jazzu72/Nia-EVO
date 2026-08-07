const fs=require("fs");

const INPUT="nia-evolved-grant-scoring-model.json";
const OUTPUT="nia-funding-learning-sync.json";

function sync(){

if(!fs.existsSync(INPUT)){
  console.log("❌ Evolved scoring model missing");
  return;
}

const model=JSON.parse(fs.readFileSync(INPUT));

const syncData={
  system:"NIA FUNDING LEARNING SYNC",
  mode:"SELF_IMPROVING",
  synced:true,
  modelVersion:model.modelVersion||"1.0",
  topTarget:model.topTarget||null,
  totalModels:(model.models||[]).length,
  lastSync:new Date().toISOString()
};

fs.writeFileSync(OUTPUT,JSON.stringify(syncData,null,2));

console.log("🔄 FUNDING LEARNING SYNC ONLINE");
console.log("MODELS:",syncData.totalModels);

}

sync();
setInterval(sync,86400000);
