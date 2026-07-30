const express=require("express");
const fs=require("fs");
const router=express.Router();

router.post("/",(req,res)=>{
 const leads=(()=>{
  try{return JSON.parse(fs.readFileSync("./data/revenue-leads.json","utf8"));}
  catch{return {leads:[]};}
 })();

 const lead={
  id:Date.now(),
  ...req.body,
  status:"NEW",
  createdAt:new Date().toISOString()
 };

 leads.leads.push(lead);

 fs.mkdirSync("./data",{recursive:true});
 fs.writeFileSync(
  "./data/revenue-leads.json",
  JSON.stringify(leads,null,2)
 );

 res.json({
  status:"LEAD_CAPTURED",
  lead
 });
});

module.exports=router;
