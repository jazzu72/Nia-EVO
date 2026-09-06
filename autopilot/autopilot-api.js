const express=require("express");

const router=express.Router();

const engine=require("./revenue-autopilot");


router.post("/run",(req,res)=>{

    res.json(
        engine.processProspect(req.body)
    );

});


module.exports=router;
