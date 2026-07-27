const express=require("express");

const router=express.Router();

const memory =
require("./nia-memory");


router.post("/remember",(req,res)=>{

    res.json(
        memory.remember(req.body)
    );

});


router.get("/recall",(req,res)=>{

    res.json(
        memory.recall()
    );

});


router.get("/score",(req,res)=>{

    res.json(
        memory.score()
    );

});


module.exports=router;
