// NIA SALES COMMAND CENTER

const fs = require("fs");

const revenue =
require("../revenue/revenue-engine");


function getFollowups(){

    const file =
    "data/followups.json";


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



    const followups =
    getFollowups();



    const highValue =
    pipeline.filter(
        d => Number(d.value || 0) >= 5000
    );



    return {

        system:
        "NIA SALES COMMAND CENTER",


        status:
        "ONLINE",


        sales:{

            activeLeads:
            pipeline.length,


            highPriority:
            highValue.length,


            pipelineValue:
            pipeline.reduce(
                (sum,d)=>
                sum + Number(d.value || 0),
                0
            )

        },


        followups:{

            pending:
            followups.length

        },


        recommendations:[

            "Contact HIGH priority prospects first",

            "Send personalized AI automation proposals",

            "Move qualified leads into revenue pipeline"

        ],


        generated:
        new Date().toISOString()

    };

}



module.exports={
    dashboard
};
