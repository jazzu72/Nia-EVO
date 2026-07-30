const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/audit-log/data/audit.json";

function read(){
 try{
  return JSON.parse(fs.readFileSync(DB,"utf8"));
 }catch{
  return [];
 }
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get("/",(req,res)=>{
 res.json({
  system:"Nia Audit Log",
  events:read().slice(-100).reverse()
 });
});

router.post("/record",(req,res)=>{
 const logs=read();

 logs.push({
  id:Date.now(),
  event:req.body.event||"system",
  detail:req.body.detail||"",
  timestamp:new Date().toISOString()
 });

 save(logs);

try{
 if(global.niaSnapshotRefresh){
  global.niaSnapshotRefresh();
 }
}catch(e){
 console.log("Snapshot refresh skipped:",e.message);
}

 res.json({success:true});
});

module.exports=router;
