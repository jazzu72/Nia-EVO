const express=require('express');
const router=express.Router();
const fs=require('fs');

function count(file){
 try{
  return JSON.parse(
   fs.readFileSync(`./modules/realestate/data/${file}.json`)
  ).length;
 }catch{
  return 0;
 }
}

function sumProfit(){
 try{
  const data=JSON.parse(
   fs.readFileSync('./modules/realestate/data/financials.json')
  );

  return data.reduce((total,item)=>{
   return total + Number(item.profit || 0);
  },0);

 }catch{
  return 0;
 }
}

router.get('/',(req,res)=>{

res.json({

system:"Nia Acquisition Command Center",

status:"operational",

pipeline:{
 sellerLeads:count("leads"),
 properties:count("properties"),
 deals:count("deals"),
 offers:count("pipeline"),
 closings:count("closings")
},

network:{
 contractors:count("contractors"),
 lenders:count("lenders"),
 attorneys:count("attorneys")
},

financials:{
 closedProfit:sumProfit()
},

nextActions:[
"Review new leads",
"Analyze properties",
"Generate offers",
"Follow up with sellers"
],

timestamp:new Date().toISOString()

});

});

module.exports=router;
