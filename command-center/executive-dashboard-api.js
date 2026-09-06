const express=require("express");

const router=express.Router();

const dashboard =
require("./executive-dashboard");


router.get("/",(req,res)=>{

    res.json(
        dashboard.dashboard()
    );

});


module.exports=router;
