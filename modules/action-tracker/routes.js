const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/action-tracker/data/completed.json";

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
 const completed=read();

 res.json({
  system:"Nia Action Tracker",
  completed:completed.length,
  actions:completed
 });
});

router.post("/complete",(req,res)=>{
 const completed=read();

 const action={
  id:Date.now(),
  type:req.body.type||"task",
  target:req.body.target||"unknown",
  result:req.body.result||"completed",
  timestamp:new Date().toISOString()
 };

 completed.push(action);
 save(completed);

 res.json({
  success:true,
  action
 });
});

module.exports=router;
