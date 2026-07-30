const express=require('express');
const router=express.Router();
const fs=require('fs');

const DB="./modules/investor-crm/data/investors.json";

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

const investors=read();

const investor={
id:Date.now(),
name:req.body.name||"Unknown",
contact:req.body.contact||"",
type:req.body.type||"investor",
status:"new",
notes:req.body.notes||"",
created:new Date().toISOString()
};

investors.push(investor);
save(investors);

res.json({
success:true,
investor
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Investor CRM",
count:read().length,
investors:read()
});
});

module.exports=router;
