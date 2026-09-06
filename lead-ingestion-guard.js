const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let blocked=0;

function normalize(v){
 return (v||"").toLowerCase().replace(/[^a-z0-9]/g,"");
}

let existing=new Set(
(data.contacts||[]).map(c =>
 normalize(c.name)
)
);

(data.incomingLeads||[]).forEach(lead=>{

let key=normalize(lead.name);

if(existing.has(key)){
 lead.status="DUPLICATE_BLOCKED";
 blocked++;
}else{
 data.contacts.push({
  ...lead,
  status:"NEW"
 });
 existing.add(key);
}

});

data.incomingLeads=[];

data.duplicateBlocks=(data.duplicateBlocks||0)+blocked;

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`🛡️ Duplicate leads blocked: ${blocked}`);
console.log(`📊 CRM contacts: ${data.contacts.length}`);

