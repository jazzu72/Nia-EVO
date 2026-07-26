// NIA REVENUE API

const express = require("express");
const router = express.Router();

const revenue = require("./revenue-engine");


// Add a deal
router.post("/deal", (req, res) => {

    try {

        const deal = revenue.addDeal(req.body);

        res.json({
            status: "success",
            deal
        });

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

});


// View pipeline
router.get("/pipeline", (req, res) => {

    try {

        res.json(
            revenue.pipeline()
        );

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

});


// Revenue dashboard
router.get("/dashboard", (req, res) => {

    try {

        res.json(
            revenue.dashboard()
        );

    } catch(err){

        res.status(500).json({
            error: err.message
        });

    }

});


module.exports = router;
