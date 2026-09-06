const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/followups.json';

function load(){
 return JSON.parse(fs.readFileSync(DB));
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get('/',(req,res)=>{
 res.json(load());
});

router.post('/',(req,res)=>{

let tasks=load();

const task={
 id:Date.now(),
 lead:req.body.lead || "",
 phone:req.body.phone || "",
 action:req.body.action || "Call seller",
 status:"pending",
 due:req.body.due || new Date().toISOString(),
 created:new Date().toISOString()
};

tasks.push(task);
save(tasks);

res.json({
 success:true,
 message:"Follow-up scheduled",
 task
});

});

router.put('/:id',(req,res)=>{

let tasks=load();

tasks=tasks.map(t=>{
 if(t.id==req.params.id){
  t.status=req.body.status || t.status;
 }
 return t;
});

save(tasks);

res.json({success:true});

});

module.exports=router;
