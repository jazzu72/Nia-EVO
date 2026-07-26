const express = require("express");
const router = express.Router();

const revenue = require("../revenue/revenue-engine");

const automation = require("../revenue/automation-engine");


// Revenue Command Center Overview
router.get("/revenue", (req,res)=>{

    const deals = revenue.pipeline();

    const totalValue = deals.reduce(
        (sum,deal)=> sum + (deal.value || 0),
        0
    );


    res.json({

        system:"Nia Revenue Command Center",

        status:"ONLINE",

        metrics:{
            activeDeals: deals.length,
            pipelineValue: totalValue,
            timestamp:new Date().toISOString()
        },

        recommendations:[
            "Generate qualified leads",
            "Contact high priority prospects",
            "Convert leads into proposals"
        ]

    });

});


// Revenue Automation Queue
router.get("/revenue/queue",(req,res)=>{

    if(automation && automation.queue){

        return res.json(
            automation.queue()
        );

    }


    res.json([]);

});


// Add Revenue Task
router.post("/revenue/task",(req,res)=>{


    const task={

        id:"TASK-"+Date.now(),

        type:"REVENUE",

        instruction:req.body.instruction || 
        "Find new customers",

        priority:req.body.priority || 
        "NORMAL",

        status:"pending",

        created:new Date().toISOString()

    };


    res.json({

        success:true,

        task

    });


});


module.exports = router;
