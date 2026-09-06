// NIA CASHFLOW ENGINE

const revenue =
require("../revenue/revenue-engine");

const followup =
require("../followup/followup-engine");


function createOffer(company){

    const deal =
    revenue.addDeal({

        company: company.name,

        contact: company.contact || "Owner",

        service:
        "AI Automation Setup",

        value:
        company.value || 2500

    });


    let task=null;


    if(followup.create){

        task =
        followup.create({

            prospect:company.name,

            action:
            "Send AI automation proposal",

            priority:
            "HIGH"

        });

    }


    return {

        company,

        deal,

        followup:task,

        status:
        "READY_FOR_CONTACT"

    };

}


module.exports={
    createOffer
};
