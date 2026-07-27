const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/analytics/metrics.json"
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



function recordMetric(metric){

const data = load();


data.push({

id:
"MET-"+Date.now(),

name:
metric.name,

value:
metric.value,

category:
metric.category || "general",

timestamp:
new Date().toISOString()

});


save(data);


return data[data.length-1];

}



function getMetrics(){

return load()
.slice(-100)
.reverse();

}



function summary(){

const data = load();


let total = 0;


data.forEach(m=>{

if(
typeof m.value === "number"
){

total += m.value;

}

});


return {

records:
data.length,

totalValue:
total,

updated:
new Date().toISOString()

};

}



module.exports={

recordMetric,

getMetrics,

summary

};

