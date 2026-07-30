const fs=require('fs');

const DB="./modules/scanner/data/opportunities.json";

function scanProperty(data){

let opportunities=[];

try{
opportunities=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

const investment=
Number(data.purchasePrice||0)+
Number(data.repairs||0);

const profit=
Number(data.arv||0)-investment;

const roi=investment?
((profit/investment)*100).toFixed(2):"0.00";

const result={
id:Date.now(),
address:data.address||"Unknown",
purchasePrice:data.purchasePrice||0,
repairs:data.repairs||0,
arv:data.arv||0,
profit,
roi:roi+"%",
recommendation:Number(roi)>=25?"GOOD DEAL":"REVIEW",
created:new Date().toISOString()
};

opportunities.push(result);

fs.writeFileSync(DB,JSON.stringify(opportunities,null,2));

return result;
}

function getOpportunities(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

module.exports={scanProperty,getOpportunities};
