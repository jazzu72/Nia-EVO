const express=require("express");
const fs=require("fs");
const router=express.Router();

const FILE="./data/revenue-ledger.json";

function load(){
  try{return JSON.parse(fs.readFileSync(FILE,"utf8"));}
  catch{return {transactions:[]};}
}

function save(data){
  fs.mkdirSync("./data",{recursive:true});
  fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

router.get("/",(req,res)=>res.json(load()));

router.post("/add",(req,res)=>{
  const data=load();
  const tx={
    id:Date.now(),
    customer:req.body.customer||"Unknown",
    description:req.body.description||"",
    amount:Number(req.body.amount)||0,
    timestamp:new Date().toISOString()
  };
  data.transactions.push(tx);
  save(data);
  res.json({success:true,transaction:tx});
});

module.exports=router;
