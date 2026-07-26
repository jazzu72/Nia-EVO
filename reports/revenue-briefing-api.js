const express=require("express");

const router=express.Router();

const briefing =
require("./revenue-briefing-engine");


router.get("/",(req,res)=>{

    res.json(
        briefing.generate()
    );

});


module.exports=router;
