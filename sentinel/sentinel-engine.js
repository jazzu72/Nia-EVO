const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");


const DB =
path.join(
__dirname,
"../data/sentinel/health.json"
);


function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function load(){

if(!fs.existsSync(DB))
return [];

return JSON.parse(
fs.readFileSync(DB)
);

}



function checkServices(){

return new Promise((resolve)=>{

exec(
"pm2 jlist",
(error,stdout)=>{

if(error){

return resolve({

status:"error",

message:error.message

});

}


const processes =
JSON.parse(stdout);


const health =
processes.map(app=>({

name:app.name,

status:
app.pm2_env.status,

memory:
app.monit.memory,

cpu:
app.monit.cpu

}));


save(health);


resolve(health);


});

});

}



function detectFailures(data){

return data.filter(
service =>
service.status !== "online"
);

}



module.exports={

checkServices,

detectFailures,

load

};

