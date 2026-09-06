// NIA CHIEF OF STAFF ENGINE

const revenue =
require("../revenue/revenue-engine");

const memory =
require("../memory/nia-memory");


const followup =
require("../followup/followup-engine");


function generateBriefing(){

    let pipeline = [];

    try {
        pipeline = revenue.pipeline();
    } catch(e){}


    let followups = [];

    try {

        if(followup.queue){
            followups = followup.queue();
        }

    } catch(e){}



    const memoryScore =
    memory.score();



    let priorities = [];


    if(pipeline.length === 0){

        priorities.push(
            "Generate new qualified opportunities"
        );

    }


    if(followups.length > 0){

        priorities.push(
            "Complete pending follow-up actions"
        );

    }


    priorities.push(
        "Review revenue pipeline daily"
    );



    return {

        system:
        "Nia Chief of Staff",

        status:
        "ONLINE",

        metrics:{

            deals:
            pipeline.length,

            pendingFollowups:
            followups.length,

            learning:
            memoryScore

        },


        priorities,

        generated:
        new Date().toISOString()

    };

}



module.exports={
    generateBriefing
};
