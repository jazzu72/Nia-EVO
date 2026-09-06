const express = require("express");
const router = express.Router();

const brain = require("./revenue-brain");
const revenue = require("../revenue/revenue-engine");

router.get("/pipeline", (req, res) => {

    const deals = revenue.pipeline();

    res.json(
        brain.analyzePipeline(deals)
    );

});

module.exports = router;
