const express=require('express');
const fs=require('fs');
const router=express.Router();

const DB="./modules/activity/data/activity.json";

function load(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.get('/',(req,res)=>{
res.json({
system:"Nia Activity Log",
total:load().length,
events:load()
});
});

router.post('/',(req,res)=>{

const events=load();

const event={
id:Date.now(),
type:req.body.type||"system",
message:req.body.message||"",
data:req.body.data||{},
timestamp:new Date().toISOString()
};

events.push(event);
save(events);

res.json({
success:true,
event
});

});

module.exports=router;
