const express=require("express");

const router=express.Router();

const acquisition =
require("./lead-acquisition-engine");


router.post("/run",(req,res)=>{

    res.json(
        acquisition.acquire()
    );

});


router.get("/status",(req,res)=>{

    res.json({

        system:
        "Nia Lead Acquisition",

        status:
        "ONLINE"

    });

});


module.exports=router;
