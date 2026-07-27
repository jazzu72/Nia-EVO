const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/finance/transactions.json"
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

const transactions = load();


const entry = {

id:
"TX-"+Date.now(),

type:
tx.type || "expense",

category:
tx.category || "general",

description:
tx.description || "",

amount:
Number(tx.amount || 0),

date:
new Date().toISOString()

};


transactions.push(entry);

save(transactions);


return entry;

}



function summary(){

const transactions = load();


let income = 0;
let expenses = 0;


transactions.forEach(tx=>{

if(tx.type==="income")
income += tx.amount;

else
expenses += tx.amount;

});


return {

income,

expenses,

cashFlow:
income-expenses,

transactions:
transactions.length

};

}



function runway(cash){

const data = summary();


const monthlyBurn =
data.expenses || 1;


return {

cash,

monthlyBurn,

monthsRemaining:
Math.floor(
cash/monthlyBurn
)

};

}



module.exports={

addTransaction,

summary,

runway

};

