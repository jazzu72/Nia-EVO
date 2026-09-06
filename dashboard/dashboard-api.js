const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();


function readJSON(file){

    try {

        return JSON.parse(
            fs.readFileSync(file)
        );

    } catch {

        return [];

    }

}


// Executive overview

router.get("/overview",(req,res)=>{


const opportunities =
readJSON(
path.join(__dirname,"../data/opportunities.json")
);


const pipeline =
readJSON(
path.join(__dirname,"../data/pipeline.json")
);


const revenue =
readJSON(
path.join(__dirname,"../data/revenue.json")
);



res.json({

    system:
    "Nia Capital OS Online",


    opportunities:
    opportunities.length,


    leads:
    pipeline.leads ?
    pipeline.leads.length : 0,


    deals:
    revenue.length,


    timestamp:
    new Date().toISOString()

});


});


module.exports = router;

