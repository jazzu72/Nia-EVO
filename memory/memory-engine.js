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



function addMemory(item){

const memory = load();


const entry = {

id:
"MEM-"+Date.now(),

category:
item.category || "general",

title:
item.title,

content:
item.content,

importance:
item.importance || "normal",

tags:
item.tags || [],

created:
new Date().toISOString()

};


memory.push(entry);

save(memory);


return entry;

}



function searchMemory(keyword){

const memory = load();


return memory.filter(item=>{

const text =
JSON.stringify(item)
.toLowerCase();


return text.includes(
keyword.toLowerCase()
);

});

}



function allMemory(){

return load();

}



module.exports={

addMemory,

searchMemory,

allMemory

};

