// NIA SALES AGENT ENGINE

const prospects =
require("../revenue/prospects/prospect-db");

const followup =
require("../followup/followup-engine");


function analyzeLead(lead){

    let score = 0;


    if(lead.company)
        score += 20;


    if(lead.problem)
        score += 30;


    if(lead.employees)
        score += 20;


    if(lead.value)
        score += 30;



    let priority =
    score >= 70
    ? "HIGH"
    :
    score >= 40
    ? "MEDIUM"
    :
    "LOW";


    return {

        lead,

        score,

        priority

    };

}



function createSalesAction(lead){

    const analysis =
    analyzeLead(lead);


    let task=null;


    if(analysis.priority==="HIGH"){

        if(followup.create){

            task =
            followup.create({

                prospect:
                lead.company,

                action:
                "Send AI automation proposal",

                priority:
                "HIGH"

            });

        }

    }


    return {

        analysis,

        action:task,

        message:
        "Nia Sales Agent processed lead"

    };

}



module.exports={

    analyzeLead,

    createSalesAction

};
