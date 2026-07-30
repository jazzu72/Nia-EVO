const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(p){
 try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return [];}
}

router.get("/",(req,res)=>{
 const deals=read("./modules/deal-pipeline/data/deals.json");
 const actions=read("./modules/action-center/data/actions.json");

 const board=[
  ...actions.map(a=>({
    priority:a.priority||"NORMAL",
    type:a.type,
    target:a.target,
    status:a.status,
    value:a.offer||0
  })),
  ...deals.map(d=>({
    priority:"DEAL",
    type:"pipeline",
    target:d.address,
    status:d.stage,
    value:d.value||0
  }))
 ];

 board.sort((a,b)=>Number(b.value)-Number(a.value));

 res.json({
  system:"Nia Revenue Action Board",
  opportunities:board.slice(0,20),
  totalValue:board.reduce((s,x)=>s+Number(x.value||0),0)
 });
});

module.exports=router;
