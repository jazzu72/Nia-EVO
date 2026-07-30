const express=require('express');
const router=express.Router();

const {runAcquisition}=require('./services/acquisition-engine');

router.get('/run',(req,res)=>{
res.json({
success:true,
results:runAcquisition()
});
});

module.exports=router;
