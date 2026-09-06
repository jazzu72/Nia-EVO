const express=require("express");
const fs=require("fs");

const router=express.Router();

router.get("/funding-dashboard",(req,res)=>{

const files=[
"nia-grant-readiness-report.json",
"nia-grant-response-intelligence.json",
"nia-grant-lifecycle-report.json",
"nia-grant-alert-queue.json"
];

const data={};

files.forEach(f=>{
try{
data[f]=JSON.parse(fs.readFileSync(f));
}catch(e){
data[f]={status:"unavailable"};
}
});

res.json({
system:"NIA FUNDING DASHBOARD API",
status:"ONLINE",
data
});

});

module.exports=router;
