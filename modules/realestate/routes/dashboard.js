const express=require('express');
const router=express.Router();
const fs=require('fs');

function count(f){
 try{return JSON.parse(fs.readFileSync('./modules/realestate/data/'+f+'.json')).length}
 catch{return 0}
}

router.get('/',(req,res)=>{
 res.json({
  system:"Nia Acquisition Command Center",
  pipeline:{
   leads:count('leads'),
   properties:count('properties'),
   deals:count('deals'),
   closings:count('closings')
  },
  network:{
   contractors:count('contractors'),
   lenders:count('lenders'),
   attorneys:count('attorneys')
  },
  status:"operational"
 });
});

module.exports=router;
