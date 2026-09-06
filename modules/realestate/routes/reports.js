const express=require('express');
const router=express.Router();

const report=require('../services/report-engine');

router.get('/daily',(req,res)=>{
 res.json(report());
});

module.exports=router;
