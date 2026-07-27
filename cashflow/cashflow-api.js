const express=require("express");

const router=express.Router();

const cashflow =
require("./cashflow-engine");


router.post("/create",(req,res)=>{

    res.json(
        cashflow.createOffer(req.body)
    );

});


module.exports=router;
