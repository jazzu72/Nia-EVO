const express = require("express");

const engine =
require("./acquisition-engine");

const router = express.Router();


router.post("/",(req,res)=>{

    res.json(
        engine.addProspect(req.body)
    );

});


router.get("/top",(req,res)=>{

    res.json(
        engine.topProspects()
    );

});


module.exports = router;
