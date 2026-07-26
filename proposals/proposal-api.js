const express=require("express");

const router=express.Router();

const proposal=require("./proposal-engine");



router.post("/create",(req,res)=>{

    res.json(
        proposal.createProposal(req.body)
    );

});



router.get("/",(req,res)=>{

    res.json(
        proposal.list()
    );

});


module.exports=router;
