const express=require("express");
const router=express.Router();
const fs=require("fs");

const DB="./modules/action-queue/data/queue.json";

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
  system:"Nia Action Queue",
  queue:read()
 });
});

router.post("/generate",(req,res)=>{

 const actions=[];

 const deals=readFile("./modules/deal-pipeline/data/deals.json");
 const grants=readFile("./modules/grants/data/grants.json");

 function add(type,target,priority){
  actions.push({
   id:Date.now()+actions.length,
   type,
   target,
   priority,
   status:"pending",
   created:new Date().toISOString()
  });
 }

 deals.slice(0,5).forEach(d=>
  add("deal-review",d.address,"HIGH")
 );

 grants.slice(0,5).forEach(g=>
  add("grant-review",g.name,"HIGH")
 );

 save(actions);

 res.json({
  success:true,
  generated:actions.length
 });

});

function readFile(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return [];
 }
}

module.exports=router;
