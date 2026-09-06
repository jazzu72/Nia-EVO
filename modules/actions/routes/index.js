const express=require('express');
const router=express.Router();

const {generateActions}=require('../services/action-engine');

router.get('/today',(req,res)=>{
res.json(generateActions());
});

module.exports=router;
