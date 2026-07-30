const express=require('express');
const router=express.Router();

const {processOpportunities}=require('../services/opportunity-engine');

router.get('/process',(req,res)=>{
res.json({
success:true,
results:processOpportunities()
});
});

module.exports=router;
