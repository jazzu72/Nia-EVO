const express=require('express');
const router=express.Router();

const generateOffer=require('../services/offer-engine');

router.post('/generate',(req,res)=>{
 res.json(generateOffer(req.body));
});

module.exports=router;
