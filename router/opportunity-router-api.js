const express=require("express");

const router=express.Router();

const engine =
require("./opportunity-router");


router.post("/evaluate",(req,res)=>{

    res.json(
        engine.evaluate(req.body)
    );

});


module.exports=router;
