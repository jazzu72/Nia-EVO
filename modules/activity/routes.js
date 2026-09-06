const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/activity/data/activity.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function write(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get("/",(req,res)=>{
 res.json({
  system:"Nia Activity Feed",
  activity:read().slice(-50).reverse()
 });
});

router.post("/log",(req,res)=>{
 const data=read();

 data.push({
  id:Date.now(),
  event:req.body.event||"system_event",
  detail:req.body.detail||"",
  timestamp:new Date().toISOString()
 });

 write(data);

 res.json({success:true});
});

module.exports=router;
