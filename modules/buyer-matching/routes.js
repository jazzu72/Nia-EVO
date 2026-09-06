const express=require('express');
const router=express.Router();
const {run}=require('./index');

router.get('/run',(req,res)=>{
res.json({
success:true,
matches:run()
});
});

router.get('/all',(req,res)=>{
const fs=require('fs');
try{
res.json(JSON.parse(fs.readFileSync("./modules/buyer-matching/data/matches.json")));
}catch{
res.json([]);
}
});

module.exports=router;
