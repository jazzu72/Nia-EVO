const express=require('express');
const router=express.Router();

const {calculateRevenue}=require('../services/revenue-engine');

router.get('/dashboard',(req,res)=>{
res.json(calculateRevenue());
});

module.exports=router;
