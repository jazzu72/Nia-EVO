const express=require("express");
const engine=require("./capital-engine");

const router=express.Router();


router.post("/analyze",(req,res)=>{

const result =
engine.addOpportunity(req.body);

res.json(result);

});


router.get("/top",(req,res)=>{

res.json(
engine.top()
);

});


module.exports=router;

