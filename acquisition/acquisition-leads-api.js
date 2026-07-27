const express=require("express");

const engine =
require("./intelligence/lead-generator");


const router=express.Router();


router.post("/generate",(req,res)=>{

    res.json(
        engine.generateLead(req.body)
    );

});


router.get("/top",(req,res)=>{

    res.json(
        engine.topLeads()
    );

});


module.exports=router;
