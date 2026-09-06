const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/live",(req,res)=>{
  try{
    const report=JSON.parse(
      fs.readFileSync("./runtime/reports/revenue.json","utf8")
    );
    res.json(report);
  }catch(e){
    res.json({
      status:"initializing",
      offers:0,
      activeClosings:0,
      projectedRevenue:0
    });
  }
});

module.exports=router;
