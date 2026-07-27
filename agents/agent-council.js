const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/agents/recommendations.json"
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



function runAgent(role,context){

let recommendation="";


switch(role){


case "finance":

recommendation =
context.expenses > context.income

?

"Reduce expenses and increase revenue focus"

:

"Maintain current financial strategy";

break;



case "sales":

recommendation =
context.pipeline > 0

?

"Prioritize highest-value deals"

:

"Increase prospect discovery";

break;



case "funding":

recommendation =
"Review highest scoring funding opportunities";

break;



case "operations":

recommendation =
"Review system health and pending tasks";

break;



case "risk":

recommendation =
"Monitor cash flow and execution risks";

break;



default:

recommendation =
"Continue strategic analysis";

}


return {

agent:role,

recommendation,

timestamp:
new Date().toISOString()

};

}



function councilMeeting(context){

const agents=[

"finance",

"sales",

"funding",

"operations",

"risk"

];


const results =
agents.map(
agent=>
runAgent(agent,context)
);



const meeting={

id:
"COUNCIL-"+Date.now(),

agents:results,

decision:
results
.sort()
[0],

created:
new Date().toISOString()

};


const history=load();

history.push(meeting);

save(history);


return meeting;

}



function history(){

return load()
.slice(-10)
.reverse();

}



module.exports={

councilMeeting,

history

};

