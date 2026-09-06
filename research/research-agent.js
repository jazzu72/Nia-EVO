const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/research/intelligence.json"
);



function load(){

if(!fs.existsSync(DB)){

fs.writeFileSync(
DB,
JSON.stringify([],null,2)
);

}

return JSON.parse(
fs.readFileSync(DB)
);

}



function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function addIntel(item){

const intel = load();


const entry = {

id:
"INTEL-"+Date.now(),

category:
item.category || "general",

title:
item.title,

source:
item.source || "manual",

summary:
item.summary || "",

importance:
item.importance || "medium",

created:
new Date().toISOString()

};


intel.push(entry);

save(intel);


return entry;

}



function getIntel(){

return load()
.reverse();

}



function highValueIntel(){

return load()
.filter(
x =>
x.importance==="high"
||
x.importance==="critical"
);

}



module.exports={

addIntel,

getIntel,

highValueIntel

};

