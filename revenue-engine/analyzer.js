const fs = require("fs");
const path = require("path");

const OPPS = path.join(
__dirname,
"../data/opportunities.json"
);


function load(){

if(!fs.existsSync(OPPS))
return [];

return JSON.parse(
fs.readFileSync(OPPS)
);

}


function analyze(){

const opportunities = load();

let total = 0;
let highPriority = [];

opportunities.forEach(o=>{

if(o.amount)
total += Number(o.amount);


if(o.score >= 70){

highPriority.push({
title:o.title,
type:o.type,
score:o.score,
amount:o.amount || 0
});

}

});


return {

timestamp:new Date(),

totalPipelineValue:total,

opportunityCount:opportunities.length,

highPriority

};

}


module.exports={
analyze
};

