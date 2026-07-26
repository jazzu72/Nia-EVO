// NIA Revenue Autopilot Engine

const scoring = require("../intelligence/lead-scoring");
const proposal = require("../proposals/proposal-engine");
const revenue = require("../revenue/revenue-engine");
const followup = require("../followup/followup-engine");


function processProspect(prospect){

    const intelligence =
        scoring.scoreProspect(prospect);


    if(intelligence.priority !== "HIGH"){

        return {

            status:"waiting",

            intelligence

        };

    }


    const newProposal =
        proposal.createProposal(prospect);


    const deal =
        revenue.addDeal({

            company:prospect.company,

            contact:prospect.contact,

            service:prospect.service,

            value:prospect.value

        });



    let task=null;


    if(followup.create){

        task =
        followup.create({

            prospect:prospect.company,

            action:"Send AI proposal",

            priority:"HIGH"

        });

    }


    return {

        status:"executed",

        intelligence,

        proposal:newProposal,

        deal,

        followup:task

    };

}



module.exports={

processProspect

};
