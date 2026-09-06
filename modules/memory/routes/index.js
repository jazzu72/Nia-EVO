const express=require('express');
const router=express.Router();

const {searchMemory}=require('../services/search');

router.get('/search',(req,res)=>{

res.json({
system:"Nia Memory Engine",
query:req.query.q||"",
results:searchMemory(req.query.q||"")
});

});

router.get('/status',(req,res)=>{
res.json({
system:"Nia Memory Engine",
status:"online"
});
});

module.exports=router;
