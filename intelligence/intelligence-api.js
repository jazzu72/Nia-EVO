const express=require("express");

const router=express.Router();

const scoring=require("./lead-scoring");


router.post("/score",(req,res)=>{

    const result =
        scoring.scoreProspect(req.body);


    res.json({

        prospect:req.body,

        intelligence:result,

        timestamp:
        new Date().toISOString()

    });

});


module.exports=router;
