const express=require("express");
const router=express.Router();
const fs=require("fs");

const file="./modules/revenue-engine/data/pipeline.json";

function read(){
 try{
  return JSON.parse(fs.readFileSync(file,"utf8"));
 }catch{
  return {};
 }
}

router.get("/",(req,res)=>{
 res.json(read());
});

router.post("/update",(req,res)=>{
 let data=read();

 Object.assign(data,req.body||{});
 data.updatedAt=new Date().toISOString();

 fs.writeFileSync(
  file,
  JSON.stringify(data,null,2)
 );

 res.json({
  status:"updated",
  pipeline:data
 });
});

module.exports=router;
