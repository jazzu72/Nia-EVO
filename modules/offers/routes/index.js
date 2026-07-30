const express=require('express');
const router=express.Router();

const {createOffer,getOffers}=require('../services/offer-engine');

router.post('/generate',(req,res)=>{
res.json({
success:true,
offer:createOffer(req.body)
});
});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Offer Engine",
count:getOffers().length,
offers:getOffers()
});
});

module.exports=router;
