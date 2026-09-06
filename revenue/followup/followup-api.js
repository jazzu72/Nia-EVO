const express = require("express");

const engine =
require("./followup-engine");

const router = express.Router();


router.post("/",(req,res)=>{

    res.json(
        engine.addFollowup(req.body)
    );

});


router.get("/queue",(req,res)=>{

    res.json(
        engine.queue()
    );

});


module.exports = router;
