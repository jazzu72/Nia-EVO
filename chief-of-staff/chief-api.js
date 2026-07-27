const express=require("express");

const router=express.Router();

const chief =
require("./chief-engine");


router.get("/briefing",(req,res)=>{

    res.json(
        chief.generateBriefing()
    );

});


module.exports=router;
