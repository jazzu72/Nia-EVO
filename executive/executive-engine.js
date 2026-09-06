const fs = require("fs");
const path = require("path");


const STATE =
path.join(
__dirname,
"../data/executive/state.json"
);



function save(data){

fs.writeFileSync(
STATE,
JSON.stringify(data,null,2)
);

}



function load(){

if(!fs.existsSync(STATE)){

return {
lastRun:null,
decisions:[]
};

}

return JSON.parse(
fs.readFileSync(STATE)
);

}



function analyze(){

const revenue =
require("../revenue/revenue-engine");

const finance =
require("../finance/finance-engine");

const crm =
require("../crm/pipeline");


const pipeline =
revenue.totals();


const financial =
finance.summary();


const leads =
crm.loadPipeline().leads;


let decisions=[];


// Revenue decisions

if(pipeline.forecast > 100000){

decisions.push({

priority:"HIGH",

action:
"Focus on closing high-value opportunities",

reason:
"Revenue forecast exceeds $100k"

});

}



// CRM decisions

if(leads.length > 0){

decisions.push({

priority:"MEDIUM",

action:
"Review active pipeline leads",

reason:
`${leads.length} CRM opportunities require attention`

});

}

const strategy =
require("../strategy/strategy-engine");


const priorities =
strategy.recommend();


console.log(
"Strategic Priorities:",
priorities
);

// Financial decisions

if(financial.expenses > financial.income){

decisions.push({

priority:"URGENT",

action:
"Reduce expenses or increase revenue",

reason:
"Negative cash flow detected"

});

}



if(decisions.length===0){

decisions.push({

priority:"LOW",

action:
"Continue opportunity discovery",

reason:
"No critical actions detected"

});

}



const result={

timestamp:
new Date().toISOString(),

pipeline,

financial,

decisions

};


save(result);


return result;

}



module.exports={

analyze,

load

};

const funding =
require("../funding/funding-engine");


const topFunding =
funding.prioritize();


if(topFunding.length > 0){

decisions.push({

priority:"HIGH",

action:
"Review highest scoring funding opportunities",

reason:
`${topFunding.length} funding opportunities identified`

});

}
const memory =
require("../memory/knowledge-engine");


memory.addMemory({

category:"decision",

title:"Daily Executive Review",

content:
JSON.stringify(decisions),

importance:"medium"

});
const analytics =
require("../analytics/data-engine");


analytics.recordMetric({

name:"executive_cycle",

value:1,

category:"operations"

});
