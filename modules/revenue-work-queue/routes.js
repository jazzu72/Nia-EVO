const express=require("express");
const fs=require("fs");
const router=express.Router();

const FILE="./reports/revenue-work-queue.json";

function load(){
  try{return JSON.parse(fs.readFileSync(FILE,"utf8"));}
  catch{return {queue:[]};}
}

function save(data){
  fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

router.get("/",(req,res)=>res.json(load()));

router.post("/complete/:id",(req,res)=>{
  const data=load();
  const id=Number(req.params.id);
  const item=data.queue.find(x=>x.id===id);

  if(!item){
    return res.status(404).json({success:false,error:"Task not found"});
  }

  item.status="COMPLETED";
  item.completedAt=new Date().toISOString();
  save(data);

  res.json({success:true,task:item});
});

module.exports=router;
