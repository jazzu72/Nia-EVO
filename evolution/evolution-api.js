const express=require("express");

const engine =
require("./improvement-engine");


const router=express.Router();


router.post("/event",(req,res)=>{

res.json(
engine.recordEvent(req.body)
);

});


router.get("/analysis",(req,res)=>{

res.json(
engine.analyze()
);

});


router.get("/recommendations",(req,res)=>{

res.json(
engine.recommendations()
);

});


module.exports=router;

