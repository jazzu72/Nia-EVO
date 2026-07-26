const revenue = require("../revenue-engine");
const conversion = require("../conversion/conversion-engine");


function analyze(){

    const pipeline = revenue.pipeline();
    const deals = conversion.dashboard();


    let recommendation =
        "Generate more qualified leads";


    if(deals.revenue > 0){

        recommendation =
        "Increase outreach to high-value opportunities";

    }
    else if(pipeline.length > 0){

        recommendation =
        "Convert pipeline leads into proposals";

    }


    const opportunities =
        pipeline.map(item => ({

            company:
                item.company || "Unknown",

            value:
                item.value || 0,

            priority:
                Number(item.value || 0) > 5000
                ? "HIGH"
                : "NORMAL"

        }));


    return {

        system:
            "Nia Revenue Intelligence",

        status:
            "ONLINE",

        metrics:{

            activePipeline:
                pipeline.length,

            closedRevenue:
                deals.revenue,

            totalDeals:
                deals.totalDeals

        },

        recommendation,

        opportunities,

        timestamp:
            new Date().toISOString()

    };

}


module.exports={
    analyze
};
