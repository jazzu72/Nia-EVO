const express=require('express');
const router=express.Router();

const report=require('../realestate/services/report-engine');

router.get('/status',(req,res)=>{
res.json({
system:"Nia Telegram Command Center",
status:"online",
report:report()
});
});

router.get('/message',(req,res)=>{
res.json({
message:"Telegram bridge ready",
commands:[
"/status",
"/deals",
"/tasks",
"/report"
]
});
});

module.exports=router;
