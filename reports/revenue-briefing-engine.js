// NIA MORNING REVENUE BRIEFING ENGINE

const closer =
require("../conversion/deal-closer-engine");

const brain =
require("../intelligence/revenue-brain");


function generate(){

    const deals =
    closer.pipeline();


    const intelligence =
    brain.analyzePipeline(
        deals
    );


    const actions =
    intelligence.ranking
    .filter(
        d=>d.priority==="HIGH"
    )
    .map(
        d =>
        `Contact ${d.company} - ${d.value} opportunity`
    );


    return {

        system:
        "NIA MORNING REVENUE BRIEFING",


        status:
        "READY",


        metrics:{

            activeDeals:
            intelligence.totalDeals,


            pipelineValue:
            intelligence.estimatedRevenue,


            highPriority:
            intelligence.highPriority

        },


        recommendedActions:
        actions.length
        ?
        actions
        :
        [
          "Acquire more qualified leads",
          "Run sales outreach campaign",
          "Create new proposals"
        ],


        generated:
        new Date().toISOString()

    };

}


module.exports={
    generate
};
