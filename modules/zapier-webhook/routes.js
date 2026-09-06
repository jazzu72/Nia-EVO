const express=require("express");
const fs=require("fs");
const router=express.Router();
const zapierAuth=require('../zapier-auth');
router.use(zapierAuth);

router.post("/",(req,res)=>{

 const file="./data/revenue-leads.json";

 let leads={leads:[]};

 try{
  leads=JSON.parse(fs.readFileSync(file,"utf8"));
 }catch(e){}

 const lead={
  id:Date.now(),
  source:req.body.source||"Zapier",
  name:req.body.name||req.body.company||"Unknown",
  email:req.body.email||"",
  phone:req.body.phone||"",
  type:req.body.type||"external_lead",
  estimatedValue:Number(req.body.value)||0,
  status:"NEW",
  createdAt:new Date().toISOString()
 };

 leads.leads.push(lead);

 fs.mkdirSync("./data",{recursive:true});

 fs.writeFileSync(
  file,
  JSON.stringify(leads,null,2)
 );

 res.json({
  status:"LEAD_RECEIVED",
  system:"Nia Zapier Revenue Bridge",
  lead
 });

});

module.exports=router;
