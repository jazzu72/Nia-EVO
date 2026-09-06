const revenue =
require("../revenue/revenue-engine");

const conversion =
require("../revenue/conversion/conversion-engine");

const intelligence =
require("../revenue/intelligence/intelligence-engine");

const automation =
require("../revenue/automation/automation-engine");


function dashboard(){

    const pipeline =
        revenue.pipeline();

    const deals =
        conversion.dashboard();

    const ai =
        intelligence.analyze();

    const actions =
        automation.queue();


    return {

        system:
        "Nia Revenue Command Center",

        status:
        "ONLINE",


        financials:{

            activePipeline:
            pipeline.length,

            closedRevenue:
            deals.revenue,

            totalDeals:
            deals.totalDeals

        },


        intelligence:{

            recommendation:
            ai.recommendation,

            opportunities:
            ai.opportunities.length

        },


        operations:{

            pendingActions:
            actions.filter(
                a=>a.status==="pending"
            ).length,

            completedActions:
            actions.filter(
                a=>a.status==="completed"
            ).length

        },


        executiveSummary:

        deals.revenue > 0

        ?

        "Revenue is active. Scale winning channels."

        :

        "Focus on converting prospects into proposals.",


        timestamp:
        new Date().toISOString()

    };

}


module.exports={
    dashboard
};
