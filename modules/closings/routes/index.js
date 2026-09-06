const express=require('express');
const router=express.Router();

const {createClosing,getClosings}=require('../services/closing-engine');

router.post('/add',(req,res)=>{
res.json({
success:true,
closing:createClosing(req.body)
});
});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Closing Tracker",
count:getClosings().length,
closings:getClosings()
});
});

module.exports=router;
