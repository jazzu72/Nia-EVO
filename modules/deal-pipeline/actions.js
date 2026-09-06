const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/deal-pipeline/data/deals.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function save(d){
 fs.writeFileSync(DB,JSON.stringify(d,null,2));
}

router.post("/advance/:id",(req,res)=>{
 const deals=read();

 const deal=deals.find(d=>String(d.id)===String(req.params.id));

 if(!deal){
  return res.json({success:false,message:"Deal not found"});
 }

 const stages=["new","contact","negotiation","closed"];
 const next=stages[Math.min(stages.indexOf(deal.stage)+1,stages.length-1)];

 deal.stage=next;
 deal.updated=new Date().toISOString();

 save(deals);

 res.json({
  success:true,
  deal
 });
});

module.exports=router;
