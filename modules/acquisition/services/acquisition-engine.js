const fs=require('fs');

const PROPERTIES="./modules/property-data/data/properties.json";
const SCORES="./modules/scoring/data/scores.json";
const OFFERS="./modules/offers/data/offers.json";

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function save(file,data){
fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function processProperty(property){

const scores=read(SCORES);
const offers=read(OFFERS);

const margin=property.arv-property.price-property.repairs;

const score=Math.max(0,Math.min(100,
Math.round((margin/Math.max(property.arv,1))*100)
));

const scored={
id:Date.now(),
address:property.address,
arv:property.arv,
price:property.price,
repairs:property.repairs,
score,
rating:score>=30?"GOOD DEAL":"REVIEW"
};

scores.push(scored);
save(SCORES,scores);

if(score>=30){

offers.push({
id:Date.now(),
address:property.address,
arv:property.arv,
offerPrice:property.price,
profitTarget:margin,
status:"prepared",
created:new Date().toISOString()
});

save(OFFERS,offers);

}

return scored;

}

function runAcquisition(){
return read(PROPERTIES).map(processProperty);
}

module.exports={runAcquisition};
