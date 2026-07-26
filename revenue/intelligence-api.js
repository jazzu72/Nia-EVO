const express = require("express");
const revenue = require("./revenue-engine");

const router = express.Router();

router.get("/", (req,res)=>{

    const deals = revenue.pipeline();

    const total = deals.reduce(
        (sum,d)=>sum + (Number(d.value)||0),
        0
    );

    const stages = {};

    deals.forEach(d=>{
        stages[d.stage] = (stages[d.stage] || 0) + 1;
    });


    const priority = deals
        .sort((a,b)=>
            (b.value||0)-(a.value||0)
        )
        .slice(0,5);


    res.json({

        system:"Nia Revenue Intelligence",

        status:"ONLINE",

        metrics:{
            totalDeals:deals.length,
            pipelineValue:total,
            stages
        },

        recommendations:[
            "Contact highest value prospects first",
            "Move new leads into contacted stage",
            "Create follow-up tasks"
        ],

        priorityDeals:priority,

        timestamp:new Date().toISOString()

    });

});


module.exports = router;
