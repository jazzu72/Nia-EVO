const fs=require('fs');

const DB="./modules/scoring/data/scores.json";

function scoreProperty(data){

const arv=Number(data.arv||0);
const price=Number(data.price||0);
const repairs=Number(data.repairs||0);

const margin=arv-price-repairs;
const score=Math.max(0,Math.min(100,
Math.round((margin/Math.max(arv,1))*100)
));

let list=[];
try{
list=JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{}

const result={
id:Date.now(),
address:data.address||"Unknown",
arv,
price,
repairs,
score,
rating:score>=30?"HIGH":"REVIEW",
created:new Date().toISOString()
};

list.push(result);

fs.writeFileSync(DB,JSON.stringify(list,null,2));

return result;
}

function getScores(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

module.exports={scoreProperty,getScores};
