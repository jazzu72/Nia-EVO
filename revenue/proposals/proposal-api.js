const express = require("express");

const engine =
require("./proposal-engine");

const router = express.Router();


router.post("/",(req,res)=>{

    res.json(
        engine.createProposal(req.body)
    );

});


router.get("/",(req,res)=>{

    res.json(
        engine.list()
    );

});


module.exports = router;
