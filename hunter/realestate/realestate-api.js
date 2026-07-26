const express = require("express");
const router = express.Router();

const hunter =
require("./realestate-hunter");


router.post("/add",(req,res)=>{

    res.json(
        hunter.addBrokerage(req.body)
    );

});


router.get("/list",(req,res)=>{

    res.json(
        hunter.list()
    );

});


module.exports = router;
