const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/messages.json';

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

let messages=load();

const message={
 id:Date.now(),
 contact:req.body.contact || "",
 phone:req.body.phone || "",
 type:req.body.type || "seller",
 message:req.body.message || "Hello, Nia would like to discuss your property.",
 status:"queued",
 created:new Date().toISOString()
};

messages.push(message);
save(messages);

res.json({
 success:true,
 message:"Communication queued",
 data:message
});

});

router.put('/:id',(req,res)=>{

let messages=load();

messages=messages.map(m=>{
 if(m.id==req.params.id){
  m.status=req.body.status || m.status;
 }
 return m;
});

save(messages);

res.json({success:true});

});

module.exports=router;
