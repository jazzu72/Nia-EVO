const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/grants/data/grants.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get("/",(req,res)=>{
 const grants=read();

 res.json({
  system:"Nia Grant Intelligence",
  opportunities:grants.length,
  estimatedFunding:grants.reduce(
   (s,g)=>s+Number(g.amount||0),0
  ),
  grants
 });
});

router.post("/add",(req,res)=>{
 const grants=read();

 const grant={
  id:Date.now(),
  name:req.body.name||"Unknown Grant",
  amount:Number(req.body.amount||0),
  source:req.body.source||"manual",
  status:"identified",
  created:new Date().toISOString()
 };

 grants.push(grant);
 save(grants);

 res.json({
  success:true,
  grant
 });
});

module.exports=router;
