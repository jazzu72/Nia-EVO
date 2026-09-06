const express=require("express");

const engine =
require("./financial-engine");


const router=express.Router();


router.post("/transaction",(req,res)=>{

res.json(
engine.addTransaction(req.body)
);

});



router.get("/summary",(req,res)=>{

res.json(
engine.summary()
);

});



router.get("/ledger",(req,res)=>{

res.json(
engine.load()
);

});


module.exports=router;

