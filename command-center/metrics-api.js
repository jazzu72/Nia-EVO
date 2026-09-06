const express=require("express");

const router=express.Router();

const analytics =
require("../analytics/data-engine");


router.get(
"/metrics",
(req,res)=>{

res.json(
analytics.summary()
);

});


module.exports=router;

