const express = require("express");

const engine =
require("./outreach-engine");

const router = express.Router();


router.post("/",(req,res)=>{

    res.json(
        engine.createMessage(req.body)
    );

});


router.get("/queue",(req,res)=>{

    res.json(
        engine.queue()
    );

});


module.exports = router;
