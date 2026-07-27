const express=require("express");

const router=express.Router();

const engine=require("./opportunity-engine");


router.post("/",(req,res)=>{

    res.json(
        engine.add(req.body)
    );

});


router.get("/",(req,res)=>{

    res.json(
        engine.getAll()
    );

});


module.exports=router;
