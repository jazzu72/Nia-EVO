const fs = require("fs");
const path = require("path");

const file = path.join(__dirname,"data/revenue-pipeline.json");

let pipeline = fs.existsSync(file)
 ? JSON.parse(fs.readFileSync(file))
 : [];

function add(type, target, action){
 pipeline.push({
   id: Date.now(),
   type,
   target,
   action,
   status:"OPEN",
   created:new Date().toISOString()
 });
 fs.writeFileSync(file,JSON.stringify(pipeline,null,2));
}

if(require.main===module){
 console.log(JSON.stringify(pipeline,null,2));
}

module.exports={add};
