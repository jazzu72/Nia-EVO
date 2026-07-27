const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/conversion/deals.json"
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



function addDeal(deal){

const deals = load();


const item = {

id:
"DEAL-"+Date.now(),

company:
deal.company || "",

contact:
deal.contact || "",

source:
deal.source || "unknown",

value:
Number(deal.value || 0),

stage:
"prospect",

probability:
10,

closeDate:
deal.closeDate || "",

notes:
deal.notes || "",

created:
new Date().toISOString()

};


deals.push(item);

save(deals);


return item;

}



function advanceDeal(id,stage){

const deals = load();

const deal =
deals.find(
d=>d.id===id
);


if(!deal)
return null;


deal.stage=stage;


const probabilities={

prospect:10,

contacted:25,

proposal:50,

negotiation:75,

closed:100,

lost:0

};


deal.probability =
probabilities[stage] || 10;


save(deals);


return deal;

}



function forecast(){

const deals = load();


return {

pipeline:
deals.reduce(
(sum,d)=>sum+d.value,
0
),

expected:
deals.reduce(
(sum,d)=>
sum+(d.value*d.probability/100),
0
),

deals

};

}



module.exports={

addDeal,

advanceDeal,

forecast

};

