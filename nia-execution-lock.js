const fs=require("fs");

const INPUT="nia-action-execution.json";
const OUTPUT="nia-action-execution.json";

function lock(){

if(!fs.existsSync(INPUT)) return;

let tasks=JSON.parse(fs.readFileSync(INPUT));

const seen=new Set();

tasks=tasks.filter(task=>{

const key=task.property+"-"+task.task;

if(seen.has(key) && task.status==="COMPLETED"){
return false;
}

seen.add(key);
return true;

});

fs.writeFileSync(
OUTPUT,
JSON.stringify(tasks,null,2)
);

console.log("🔒 EXECUTION LOCK ACTIVE:",tasks.length);

}

lock();
