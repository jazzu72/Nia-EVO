const express=require("express");

const router=express.Router();

const nia =
require("./nia-loop");


router.post("/run",(req,res)=>{

    res.json(
        nia.execute(req.body)
    );

});


module.exports=router;
