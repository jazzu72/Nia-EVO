const express=require('express');
const router=express.Router();

const {generateReport}=require('../services/report-engine');

router.get('/daily',(req,res)=>{
res.json(generateReport());
});

router.get('/status',(req,res)=>{
res.json({
system:"Nia Report Engine",
status:"online"
});
});

module.exports=router;
