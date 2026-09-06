const express=require("express");

const engine=
require("./growth-engine");


const router=express.Router();


router.post("/lead",(req,res)=>{

res.json(
engine.addLead(req.body)
);

});


router.get("/funnel",(req,res)=>{

res.json(
engine.funnel()
);

});


router.get("/leads",(req,res)=>{

res.json(
engine.load()
);

});


module.exports=router;

