// NIA AUTONOMOUS SALES LOOP

const acquisition =
require("../acquisition/lead-acquisition-engine");

const sales =
require("../sales/nia-sales-engine");

const outreach =
require("../outreach/outreach-engine");

const closer =
require("../conversion/deal-closer-engine");


function run(){

    const discovered =
    acquisition.acquire();


    const processed =
    discovered.leads.map(lead=>{


        const analysis =
        sales.analyzeLead(
            lead.lead
        );


        let message=null;


        if(analysis.priority==="HIGH"){

            message =
            outreach.generate(
                lead.lead
            );

        }


        let deal=null;


        if(analysis.priority==="HIGH"){

            deal =
            closer.createDeal(
                lead.lead
            );

        }


        return {

            company:
            lead.lead.company,

            priority:
            analysis.priority,

            score:
            analysis.score,

            outreach:
            !!message,

            deal

        };


    });



    return {

        system:
        "NIA AUTONOMOUS SALES LOOP",

        status:
        "COMPLETE",

        discovered:
        discovered.discovered,

        processed,

        timestamp:
        new Date().toISOString()

    };

}



module.exports={
    run
};
