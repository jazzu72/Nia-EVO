const fs=require("fs");

const INPUTS=[
"nia-grant-submission-tracker.json",
"nia-funding-alert-queue.json",
"nia-owner-notifications.json"
];

const OUTPUT="nia-funding-memory.json";

function remember(){

let memory=[];

INPUTS.forEach(file=>{

if(!fs.existsSync(file)) return;

const data=JSON.parse(fs.readFileSync(file));

memory.push({
source:file,
snapshot:data,
captured:new Date().toISOString()
});

});

fs.writeFileSync(
OUTPUT,
JSON.stringify({
system:"NIA FUNDING MEMORY ENGINE",
mode:"LEARNING_HISTORY",
records:memory.length,
memory
},null,2)
);

console.log("🧠 FUNDING MEMORY ENGINE ONLINE");
console.log("RECORDS:",memory.length);

}

remember();

setInterval(remember,86400000);
