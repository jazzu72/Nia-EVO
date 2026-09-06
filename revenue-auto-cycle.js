const {exec}=require("child_process");

const steps=[
"node lead-ingestion-guard.js",
"node crm-hot-lead-engine.js",
"node revenue-priority-engine.js",
"node sales-action-engine.js",
"node auto-proposal-trigger.js",
"node payment-trigger-engine.js",
"node invoice-dispatch-engine.js"
];

let i=0;

function run(){
 if(i>=steps.length){
  console.log("🚀 Revenue Auto Cycle Complete");
  return;
 }

 console.log("▶️ "+steps[i]);

 exec(steps[i],(err,out)=>{
  if(err) console.log("ERROR:",err.message);
  else console.log(out);

  i++;
  run();
 });
}

run();
