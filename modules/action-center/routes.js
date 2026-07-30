const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/action-center/data/actions.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post("/create",(req,res)=>{
 const actions=read();

 const action={
  id:Date.now(),
  type:req.body.type||"follow-up",
  target:req.body.target||"unknown",
  priority:req.body.priority||"normal",
  status:"pending",
  created:new Date().toISOString()
 };

 actions.push(action);
 save(actions);

 res.json({success:true,action});
});

router.get("/",(req,res)=>{
 res.json({
  system:"Nia Action Center",
  actions:read()
 });
});

module.exports=router;
