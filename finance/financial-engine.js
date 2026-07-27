const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/finance/ledger.json"
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



function addTransaction(tx){

const data = load();


const entry={

id:
"TX-"+Date.now(),

type:
tx.type || "expense",

category:
tx.category || "general",

amount:
Number(tx.amount || 0),

description:
tx.description || "",

date:
new Date().toISOString()

};


data.push(entry);

save(data);

return entry;

}



function summary(){

const data=load();


let revenue=0;
let expenses=0;
let funding=0;


data.forEach(tx=>{

if(tx.type==="revenue")
revenue += tx.amount;


if(tx.type==="expense")
expenses += tx.amount;


if(tx.type==="funding")
funding += tx.amount;

});


return {

revenue,

expenses,

funding,

cashPosition:
(revenue + funding) - expenses,

transactions:
data.length,

updated:
new Date().toISOString()

};


}



module.exports={
addTransaction,
summary,
load
};

