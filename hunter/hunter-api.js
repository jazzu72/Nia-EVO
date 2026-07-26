const express=require("express");

const hunter=require("./opportunity-hunter");

const router=express.Router();


router.post("/discover",(req,res)=>{

    const result=hunter.addOpportunity(req.body);

    res.json({
        success:true,
        opportunity:result
    });

});


router.get("/top",(req,res)=>{

    res.json(
        hunter.topOpportunities()
    );

});


module.exports=router;

