const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/memory/knowledge.json"
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



function addMemory(entry){

const memories = load();


const item = {

id:
"MEM-"+Date.now(),

category:
entry.category || "general",

title:
entry.title || "",

content:
entry.content || "",

importance:
entry.importance || "medium",

created:
new Date().toISOString()

};


memories.push(item);

save(memories);


return item;

}



function search(term){

const memories = load();

return memories.filter(m=>

JSON.stringify(m)
.toLowerCase()
.includes(
term.toLowerCase()
)

);

}



function recent(){

return load()
.slice(-10)
.reverse();

}



module.exports={

addMemory,

search,

recent

};

