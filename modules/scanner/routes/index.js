const express=require('express');
const router=express.Router();

const {scanProperty,getOpportunities}=require('../services/scanner');

router.post('/analyze',(req,res)=>{
res.json(scanProperty(req.body));
});

router.get('/opportunities',(req,res)=>{
res.json({
system:"Nia Deal Scanner",
count:getOpportunities().length,
opportunities:getOpportunities()
});
});

module.exports=router;
