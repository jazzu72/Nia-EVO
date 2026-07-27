const express=require('express');
const router=express.Router();

const scoreDeal=require('../services/deal-score');

router.post('/',(req,res)=>{
 res.json(scoreDeal(req.body));
});

module.exports=router;
