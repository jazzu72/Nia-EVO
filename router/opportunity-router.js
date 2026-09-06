// NIA OPPORTUNITY AUTO ROUTER

const revenue =
require("../revenue/revenue-engine");

const followup =
require("../followup/followup-engine");


function evaluate(opportunity){

    let decision = {
        status:"",
        reason:"",
        action:""
    };


    // High-value opportunities
    if(opportunity.value >= 2500){

        const deal =
        revenue.addDeal({

            company: opportunity.company,

            contact: opportunity.contact || "Owner",

            service: opportunity.service || "AI Automation",

            value: opportunity.value

        });


        let task = null;


        if(followup.create){

            task =
            followup.create({

                prospect: opportunity.company,

                action:"Send AI automation proposal",

                priority:"HIGH"

            });

        }


        decision = {

            status:"accepted",

            action:"pipeline_created",

            deal,

            followup:task,

            reason:
            "High-value opportunity"

        };


    } else {


        decision = {

            status:"review",

            action:"manual_review",

            reason:
            "Opportunity value below threshold"

        };


    }


    return decision;

}



module.exports={
    evaluate
};
