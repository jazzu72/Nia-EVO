const express=require('express');
const router=express.Router();
const {logActivity}=require('../../activity/services/logger');

const {decide}=require('../services/engine');
const {dealAlert}=require('../../alerts/deal-alert');

router.post('/analyze',(req,res)=>{
logActivity('api_action','Module request processed',req.body);
res.json({
system:"Nia Decision Engine",
...decide(req.body),
timestamp:new Date().toISOString()
});
});

router.get('/status',(req,res)=>{
res.json({
system:"Nia Decision Engine",
status:"online"
});
});

module.exports=router;
