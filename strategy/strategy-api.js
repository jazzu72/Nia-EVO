const express=require("express");

const engine =
require("./decision-engine");


const router=express.Router();


router.post("/decision",(req,res)=>{

res.json(
engine.createDecision(req.body)
);

});


router.get("/priority",(req,res)=>{

res.json(
engine.topActions()
);

});


module.exports=router;

