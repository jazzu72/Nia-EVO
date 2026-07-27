const express=require("express");

const engine =
require("./outreach-engine");

const router=express.Router();


router.post("/create",(req,res)=>{

    const msg =
    engine.queueOutreach(req.body);

    res.json({
        success:true,
        message:msg
    });

});


router.get("/queue",(req,res)=>{

    res.json(
        engine.getQueue()
    );

});


router.post("/approve/:id",(req,res)=>{

    const msg =
    engine.approveMessage(req.params.id);


    if(!msg)
        return res.status(404)
        .json({
            error:"Message not found"
        });


    res.json(msg);

});


module.exports=router;

