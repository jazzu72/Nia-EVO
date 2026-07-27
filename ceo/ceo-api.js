const express=require("express");

const router=express.Router();

const ceo=require("./ceo-engine");


router.get("/status",(req,res)=>{

    res.json(
        ceo.status()
    );

});


module.exports=router;
