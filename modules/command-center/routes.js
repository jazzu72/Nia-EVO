const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/command-center/data/commands.json";

function read(){
 try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch{return [];}
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post("/chat",(req,res)=>{
 const commands=read();

 const entry={
  id:Date.now(),
  command:req.body.command||"",
  response:"Command received. Nia is processing.",
  timestamp:new Date().toISOString()
 };

 commands.push(entry);
 save(commands);

 res.json({
  success:true,
  niaResponse:entry.response,
  command:entry
 });
});

router.get("/history",(req,res)=>{
 res.json({
  system:"Nia Command Memory",
  commands:read().slice(-20)
 });
});

module.exports=router;
