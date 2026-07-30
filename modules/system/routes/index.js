const express=require('express');
const router=express.Router();

router.get('/health',(req,res)=>{
res.json({
system:"Nia Capital OS",
status:"online",
timestamp:new Date().toISOString(),
uptime:Math.floor(process.uptime()),
memory:{
rss:process.memoryUsage().rss,
heapUsed:process.memoryUsage().heapUsed,
heapTotal:process.memoryUsage().heapTotal
},
services:{
api:"online",
realEstate:"online",
business:"online",
ceo:"online",
telegram:"online"
}
});
});

module.exports=router;
