const express = require("express");

const operator =
require("./daily-operator");

const router = express.Router();


router.get("/daily",(req,res)=>{

    res.json(
        operator.runDailyReview()
    );

});


module.exports = router;
