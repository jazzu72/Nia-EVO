const express = require("express");

const engine =
require("./conversion-engine");

const router = express.Router();


router.post("/",(req,res)=>{

    res.json(
        engine.updateDeal(req.body)
    );

});


router.get("/dashboard",(req,res)=>{

    res.json(
        engine.dashboard()
    );

});


module.exports = router;
