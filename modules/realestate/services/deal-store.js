const fs=require('fs');

const DB='./modules/realestate/data/deals.json';

function load(){
  try{
    return JSON.parse(fs.readFileSync(DB,'utf8'));
  }catch{
    return [];
  }
}

function save(data){
  fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

function addDeal(deal){
  const deals=load();
  const record={
    id:Date.now(),
    created:new Date().toISOString(),
    status:"analyzed",
    ...deal
  };
  deals.push(record);
  save(deals);
  return record;
}

module.exports={addDeal,load};
