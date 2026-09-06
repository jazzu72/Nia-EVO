const fs = require("fs");

const FILES = [
"execution-queue.json",
"nia-actions.json",
"nia-action-execution.json"
];

function clean(){

FILES.forEach(file=>{

if(!fs.existsSync(file)) return;

let data = JSON.parse(fs.readFileSync(file));

const seen = new Set();

data = data.filter(item=>{

const key =
(item.property || "") +
"-" +
(item.action || item.task || item.status || "");

if(seen.has(key)){
console.log("🧹 REMOVED DUPLICATE:", key);
return false;
}

seen.add(key);
return true;

});

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

console.log(
"✅ CLEANED:",
file,
"RECORDS:",
data.length
);

});

}

console.log("🧹 NIA DEAL DEDUPLICATOR ONLINE");

clean();

setInterval(clean,300000);
