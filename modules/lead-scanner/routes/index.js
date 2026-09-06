const express=require('express');
const router=express.Router();
const fs=require('fs');

function logActivity(event,detail){
 const path="./modules/activity/data/activity.json";
 let data=[];
 try{
  data=JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{}

 data.push({
  id:Date.now(),
  event,
  detail,
  timestamp:new Date().toISOString()
 });

 fs.mkdirSync("./modules/activity/data",{recursive:true});
 fs.writeFileSync(path,JSON.stringify(data.slice(-100),null,2));
}

const DB="./modules/lead-scanner/data/sources.json";

function read(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post('/add',(req,res)=>{

const sources=read();

const lead={
id:Date.now(),
address:req.body.address||"Unknown",
source:req.body.source||"manual",
motivation:req.body.motivation||"unknown",
status:"new",
created:new Date().toISOString()
};

sources.push(lead);
save(sources);

logActivity(
 "new_lead",
 `New lead added: ${lead.address} from ${lead.source}`
);

res.json({
success:true,
lead
});

});

router.get('/scan',(req,res)=>{

const leads=read();

res.json({
system:"Nia Lead Source Scanner",
count:leads.length,
priorityLeads:leads.filter(l=>l.motivation!=="unknown"),
leads
});

});

module.exports=router;
