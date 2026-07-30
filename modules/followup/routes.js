const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/followup/data/followups.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

router.get("/",(req,res)=>{
 const followups=read();

 res.json({
  system:"Nia Follow-Up Engine",
  pending:followups.filter(f=>f.status==="queued").length,
  followups:followups
 });
});

router.post("/complete/:id",(req,res)=>{
 const data=read();

 const item=data.find(f=>String(f.id)===String(req.params.id));

 if(item){
  item.status="completed";
  item.completed=new Date().toISOString();
 }

 fs.writeFileSync(DB,JSON.stringify(data,null,2));

 res.json({
  success:true,
  followup:item
 });
});

module.exports=router;
