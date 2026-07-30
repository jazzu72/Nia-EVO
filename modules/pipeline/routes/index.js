const express=require('express');
const router=express.Router();

const {buildPipeline}=require('../services/pipeline');

router.get('/dashboard',(req,res)=>{
res.json(buildPipeline());
});

module.exports=router;
