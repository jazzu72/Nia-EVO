const fs=require("fs");

const PRIORITY="nia-mission-priority.json";
const ACTIONS="nia-actions.json";
const OUTPUT="nia-priority-action-queue.json";

function route(){

if(!fs.existsSync(PRIORITY)||!fs.existsSync(ACTIONS)) return;

const mission=JSON.parse(fs.readFileSync(PRIORITY));
const actions=JSON.parse(fs.readFileSync(ACTIONS));

const ranked=actions.map(action=>{

let priority=99;
let missionType="UNASSIGNED";

if(action.action?.includes("GRANT") ||
action.task?.includes("GRANT")){
priority=1;
missionType="GRANTS";
}

else if(action.property){
priority=2;
missionType="REAL_ESTATE";
}

else if(action.action?.includes("INVESTOR")){
priority=3;
missionType="INVESTOR_OUTREACH";
}

return {
...action,
mission:missionType,
priority
};

}).sort((a,b)=>a.priority-b.priority);

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA MISSION ROUTER",
mode:"FUNDING_FIRST",
queue:ranked,
timestamp:new Date().toISOString()
},null,2)
);

console.log("🧭 NIA ROUTER ACTIVE");
console.log("QUEUE SIZE:",ranked.length);
console.log("TOP MISSION:",ranked[0]?.mission);

}

route();
setInterval(route,60000);
