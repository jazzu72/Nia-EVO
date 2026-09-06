const express = require("express");

const intelligence =
require("./intelligence-engine");

const router = express.Router();


router.get("/",(req,res)=>{

    res.json(
        intelligence.analyze()
    );

});


module.exports = router;
