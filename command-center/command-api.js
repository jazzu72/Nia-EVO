const express=require("express");

const engine =
require("./funding-command");


const router=express.Router();


router.post("/funding",(req,res)=>{

res.json(
engine.addFunding(req.body)
);

});


router.get("/dashboard",(req,res)=>{

res.json(
engine.dashboard()
);

});


router.get("/funding",(req,res)=>{

res.json(
engine.load()
);

});


module.exports=router;

