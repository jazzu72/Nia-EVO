const express=require("express");

const router=express.Router();

const sales =
require("./nia-sales-engine");


router.post("/analyze",(req,res)=>{

    res.json(
        sales.createSalesAction(req.body)
    );

});


router.get("/status",(req,res)=>{

    res.json({

        system:
        "Nia Sales Agent",

        status:
        "ONLINE",

        timestamp:
        new Date().toISOString()

    });

});


module.exports=router;
