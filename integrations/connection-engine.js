const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/integrations/connections.json"
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



function addConnection(connection){

const data = load();


const item = {

id:
"CON-"+Date.now(),

type:
connection.type,

name:
connection.name,

status:
"active",

endpoint:
connection.endpoint || "",

created:
new Date().toISOString()

};


data.push(item);

save(data);


return item;

}



function list(){

return load();

}



module.exports={

addConnection,

list

};

