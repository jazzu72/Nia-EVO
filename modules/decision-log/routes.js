const express=require("express");
const router=express.Router();
const fs=require("fs");

const file="./modules/decision-log/data/decisions.json";

function audit(event,detail){
 const path="./modules/audit-log/data/audit.json";
 let logs=[];
 try{
  logs=JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{}

 logs.push({
  id:Date.now(),
  event,
  detail,
  timestamp:new Date().toISOString()
 });

 fs.mkdirSync("./modules/audit-log/data",{recursive:true});
 fs.writeFileSync(path,JSON.stringify(logs.slice(-200),null,2));
}

function read(){
 try{
  return JSON.parse(fs.readFileSync(file,"utf8"));
 }catch{
  return [];
 }
}

function save(data){
 fs.mkdirSync("./modules/decision-log/data",{recursive:true});
 fs.writeFileSync(file,JSON.stringify(data.slice(-500),null,2));
}

router.get("/",(req,res)=>{
 res.json({
  system:"Nia Decision History",
  decisions:read()
 });
});

router.post("/",(req,res)=>{
 const decisions=read();

 decisions.push({
  id:Date.now(),
  decision:req.body.decision||"unknown",
  reason:req.body.reason||"",
  timestamp:new Date().toISOString()
 });

 save(decisions);

 audit(
  "executive_decision",
  req.body.decision||"unknown"
 );

 res.json({
  status:"recorded",
  total:decisions.length
 });
});

module.exports=router;
