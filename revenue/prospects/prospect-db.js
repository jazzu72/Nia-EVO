const fs=require("fs");

const DB="data/revenue/prospects.json";


function load(){

if(!fs.existsSync(DB))
fs.writeFileSync(DB,"[]");

return JSON.parse(fs.readFileSync(DB));

}


function add(company){

let data=load();

const prospect={

id:"P-"+Date.now(),

company:company.name,

industry:company.industry,

phone:company.phone || "",

status:"new",

score:calculate(company),

created:new Date().toISOString()

};

data.push(prospect);

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

return prospect;

}


function calculate(c){

let score=0;

if(
["HVAC","roofing","real estate","contractor"]
.includes(c.industry?.toLowerCase())
)
score+=50;

if(c.phone)
score+=20;

return score;

}


module.exports={add};

