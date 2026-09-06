const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let seen=new Set();
let removed=0;

data.contacts=data.contacts.filter(c=>{

let key=(c.name||"").toLowerCase().trim();

if(seen.has(key)){
 removed++;
 return false;
}

seen.add(key);
return true;

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`🧹 Duplicate deals removed: ${removed}`);
console.log(`📊 Active deals: ${data.contacts.length}`);

