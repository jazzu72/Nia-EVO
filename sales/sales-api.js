const express=require("express");

const sales =
require("./sales-engine");

const router=express.Router();


router.post("/qualify",(req,res)=>{

    res.json(
        sales.qualifyLead(req.body)
    );

});


router.get("/pipeline",(req,res)=>{

    res.json(
        sales.pipeline()
    );

});


module.exports=router;
