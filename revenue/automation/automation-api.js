const express = require("express");

const engine =
require("./automation-engine");

const router = express.Router();


router.post("/run",(req,res)=>{

    res.json(
        engine.run()
    );

});


router.get("/queue",(req,res)=>{

    res.json(
        engine.queue()
    );

});


module.exports = router;
