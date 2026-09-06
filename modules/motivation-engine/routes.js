const express=require('express');
const router=express.Router();
const {run}=require('./index');

router.get('/run',(req,res)=>{
res.json({
success:true,
results:run()
});
});

module.exports=router;
