const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function calculateRevenue(){

const closings=read('./modules/closings/data/closings.json');
const offers=read('./modules/offers/data/offers.json');

const projected=offers.reduce((sum,o)=>{
return sum + Math.max(0,Number(o.profitTarget||0));
},0);

const underContract=closings.filter(
c=>c.status==="under_contract"
).length;

return {
system:"Nia Revenue Engine",
status:"online",

pipeline:{
offers:offers.length,
underContract,
projectedRevenue:projected
},

metrics:{
closedDeals:closings.filter(c=>c.status==="closed").length,
averagePotential:
offers.length?Math.round(projected/offers.length):0
},

timestamp:new Date().toISOString()
};

}

module.exports={calculateRevenue};
