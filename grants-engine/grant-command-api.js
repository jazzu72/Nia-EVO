const express=require("express");
const router=express.Router();

const engine=require("./grant-command-engine");

router.get("/dashboard",(req,res)=>{
 res.json(engine.dashboard());
});

router.post("/register",(req,res)=>{
 res.json(engine.register(req.body));
});

module.exports=router;
