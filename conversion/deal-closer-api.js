const express=require("express");

const router=express.Router();

const closer =
require("./deal-closer-engine");


router.post("/deal",(req,res)=>{

    res.json(
        closer.createDeal(req.body)
    );

});


router.put("/deal/:id",(req,res)=>{

    const result =
    closer.updateStage(
        req.params.id,
        req.body.stage
    );


    if(!result){

        return res.status(404)
        .json({
            error:"Deal not found"
        });

    }


    res.json(result);

});



router.get("/pipeline",(req,res)=>{

    res.json(
        closer.pipeline()
    );

});


module.exports=router;
