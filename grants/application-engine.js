const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/applications.json"
);


function load(){

if(!fs.existsSync(DB))
return [];

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



function createApplication(grant){


const apps = load();


const application = {

id:
"APP-"+Date.now(),


grantTitle:
grant.title,


organization:
grant.organization || "",


amount:
grant.amount || 0,


company:
"House of Jazzu",


mission:
"Building AI, quantum technology, education, and business automation systems.",


status:
"Draft",


created:
new Date().toISOString()


};


apps.push(application);

save(apps);


return application;

}



function getApplications(){

return load();

}



module.exports={

createApplication,

getApplications

};

