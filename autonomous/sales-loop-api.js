const express=require("express");

const router=express.Router();

const loop =
require("./sales-loop-engine");


router.post("/run",(req,res)=>{

    res.json(
        loop.run()
    );

});


router.get("/status",(req,res)=>{

    res.json({

        system:
        "Nia Autonomous Sales Loop",

        status:
        "ONLINE"

    });

});


module.exports=router;
