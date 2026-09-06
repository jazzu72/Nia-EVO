const express=require("express");

const router=express.Router();

const hunter =
require("./opportunity-hunter");


router.post("/scan",(req,res)=>{

    res.json(
        hunter.scan()
    );

});


module.exports=router;
