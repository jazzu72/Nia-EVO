const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/deals.json';

function load(){
  try{
    return JSON.parse(fs.readFileSync(DB,'utf8'));
  }catch{
    return [];
  }
}

router.get('/',(req,res)=>{
  const deals=load();

  const summary={
    totalDeals:deals.length,
    analyzed:deals.filter(d=>d.status==="analyzed").length,
    underContract:deals.filter(d=>d.status==="under_contract").length,
    closed:deals.filter(d=>d.status==="closed").length,
    estimatedProfit:deals.reduce((t,d)=>t+(Number(d.estimatedProfit)||0),0)
  };

  res.json({
    system:"Nia Real Estate Pipeline",
    summary
  });
});

module.exports=router;
