// NIA EXECUTIVE DASHBOARD ENGINE

const revenue =
require("../revenue/revenue-engine");

const memory =
require("../memory/nia-memory");

const fs = require("fs");


function getOpportunities(){

    const file =
    "data/opportunities.json";

    if(!fs.existsSync(file)){
        return [];
    }

    return JSON.parse(
        fs.readFileSync(file,"utf8")
    );

}


function dashboard(){

    let pipeline=[];

    try{
        pipeline =
        revenue.pipeline();
    }
    catch(e){}



    const opportunities =
    getOpportunities();


    return {

        system:
        "NIA CAPITAL OS COMMAND CENTER",

        status:
        "ONLINE",

        revenue:{

            activeDeals:
            pipeline.length,

            pipelineValue:
            pipeline.reduce(
                (sum,d)=>
                sum + Number(d.value || 0),
                0
            )

        },


        intelligence:{

            opportunities:
            opportunities.length

        },


        learning:
        memory.score(),


        generated:
        new Date().toISOString()

    };

}


module.exports={
    dashboard
};
