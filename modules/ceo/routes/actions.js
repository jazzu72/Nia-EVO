const express=require('express');
const fs=require('fs');
const router=express.Router();

function load(file,fallback){
  try{
    return JSON.parse(fs.readFileSync(file,'utf8'));
  }catch{
    return fallback;
  }
}

router.get('/',(req,res)=>{

  const deals=load('./modules/realestate/data/deals.json',[]);
  const business=load('./modules/business/data/business.json',{
    leads:[],
    customers:[],
    invoices:[]
  });

  res.json({
    system:"Nia CEO Action Center",
    generated:new Date().toISOString(),
    priorities:[
      {
        task:"Review analyzed deals",
        count:deals.filter(d=>d.status==="analyzed").length
      },
      {
        task:"Follow up business leads",
        count:business.leads.length
      },
      {
        task:"Outstanding invoices",
        count:business.invoices.length
      }
    ],
    nextAction:"Analyze new opportunities and move qualified deals to under_contract."
  });

});

module.exports=router;
