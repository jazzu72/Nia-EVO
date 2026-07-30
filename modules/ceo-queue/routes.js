const express=require("express");
const router=express.Router();
const fs=require("fs");

const file="./modules/ceo-queue/data/queue.json";

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
 fs.mkdirSync("./modules/ceo-queue/data",{recursive:true});
 fs.writeFileSync(file,JSON.stringify(data.slice(-500),null,2));
}

router.get("/",(req,res)=>{
 res.json({
  system:"Nia CEO Decision Queue",
  queue:read()
 });
});

router.post("/",(req,res)=>{
 const queue=read();

 queue.push({
  id:Date.now(),
  action:req.body.action||"review",
  priority:req.body.priority||"normal",
  status:"pending",
  timestamp:new Date().toISOString()
 });

 save(queue);

 res.json({
  status:"queued",
  total:queue.length
 });
});


router.patch("/:id",(req,res)=>{

 const queue=read();

 const item=queue.find(
  q=>String(q.id)===String(req.params.id)
 );

 if(!item){
  return res.status(404).json({
   status:"not_found"
  });
 }

 item.status=req.body.status||"completed";
 item.completedAt=new Date().toISOString();

 save(queue);

 audit(
  "ceo_queue_update",
  `${item.id}: ${item.status}`
 );

 res.json({
  status:"updated",
  item
 });

});

module.exports=router;
