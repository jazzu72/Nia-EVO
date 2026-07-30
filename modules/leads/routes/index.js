const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/leads/data/leads.json";
const {analyzeLead}=require('../services/lead-analyzer');

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

const leads=read();

const lead={
id:Date.now(),
name:req.body.name||"Unknown",
phone:req.body.phone||"",
address:req.body.address||"",
source:req.body.source||"manual",
status:"new",
created:new Date().toISOString()
};

leads.push(lead);
analyzeLead(lead);
save(leads);

res.json({
success:true,
lead
});

});

router.get('/all',(req,res)=>{

res.json({
system:"Nia Lead Intake",
count:read().length,
leads:read()
});

});
router.get('/',(req,res)=>{

const leads=read();

res.json({

system:"Nia Lead Engine",

status:"ONLINE",

total:leads.length,

endpoints:{
add:"POST /api/leads/add",
all:"GET /api/leads/all"
},

leads

});

});
router.get('/',(req,res)=>{

const leads=read();

res.json({

system:"Nia Lead Engine",

status:"ONLINE",

totalLeads:leads.length,

latestLead:leads[leads.length-1] || null,

availableActions:[
"POST /api/leads/add",
"GET /api/leads/all"
]

});

});

module.exports=router;
