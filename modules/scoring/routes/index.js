const express=require('express');
const router=express.Router();

const {scoreProperty,getScores}=require('../services/score-engine');

router.post('/analyze',(req,res)=>{
res.json({
success:true,
analysis:scoreProperty(req.body)
});
});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Deal Scoring Engine",
scores:getScores()
});
});

module.exports=router;
