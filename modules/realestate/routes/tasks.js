const express=require('express');
const router=express.Router();

const taskEngine=require('../services/task-engine');

router.get('/daily',(req,res)=>{
 res.json(taskEngine());
});

module.exports=router;
