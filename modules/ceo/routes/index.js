const express=require('express');
const fs=require('fs');
const router=express.Router();
const actions=require('./actions');

function load(file,fallback){
  try{
    return JSON.parse(fs.readFileSync(file,'utf8'));
  }catch{
    return fallback;
  }
}

router.get('/dashboard',(req,res)=>{

  const deals=load('./modules/realestate/data/deals.json',[]);
  const business=load('./modules/business/data/business.json',{
    customers:[],
    leads:[],
    invoices:[]
  });

  const estimatedProfit=deals.reduce(
    (t,d)=>t+(Number(d.estimatedProfit)||0),0
  );

  res.json({
    system:"Nia CEO Dashboard",
    status:"online",
    timestamp:new Date().toISOString(),
    realEstate:{
      totalDeals:deals.length,
      closed:deals.filter(d=>d.status==="closed").length,
      estimatedProfit
    },
    business:{
      customers:business.customers.length,
      leads:business.leads.length,
      invoices:business.invoices.length
    }
  });

});

router.use('/actions',actions);

module.exports=router;
