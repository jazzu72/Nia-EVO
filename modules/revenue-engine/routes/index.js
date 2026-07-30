const express=require('express');
const router=express.Router();
const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

router.get('/report',(req,res)=>{

const closings=read("./modules/closing-tracker/data/closings.json");

const closed=closings.filter(c=>c.stage==="closed");

const revenue=closed.reduce(
(sum,c)=>sum+Number(c.revenue||0),0
);

res.json({
system:"Nia Revenue Engine",
closedDeals:closed.length,
totalRevenue:revenue,
averageDeal:closed.length?revenue/closed.length:0,
pipeline:closings.length,
timestamp:new Date().toISOString()
});

});

module.exports=router;
