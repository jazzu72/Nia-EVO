const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB='./modules/realestate/data/leads.json';

function load(){
 return JSON.parse(fs.readFileSync(DB));
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post('/lead',(req,res)=>{

let leads=load();

const lead={
 id:Date.now(),
 name:req.body.name || "Unknown",
 phone:req.body.phone || "",
 address:req.body.address || "",
 motivation:req.body.motivation || "",
 status:"new",
 created:new Date().toISOString()
};

leads.push(lead);
save(leads);

res.json({
 success:true,
 message:"Lead captured by Nia",
 lead
});

});


router.get('/leads',(req,res)=>{
res.json(load());
});


module.exports=router;
