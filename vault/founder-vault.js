const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/vault/founder.json"
);



function load(){

if(!fs.existsSync(DB)){

fs.writeFileSync(
DB,
JSON.stringify({},null,2)
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



function updateProfile(profile){

const current = load();


const updated = {

...current,

...profile,

updated:
new Date().toISOString()

};


save(updated);


return updated;

}



function getProfile(){

return load();

}



module.exports={

updateProfile,

getProfile

};

