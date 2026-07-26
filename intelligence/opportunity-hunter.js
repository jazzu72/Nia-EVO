// NIA OPPORTUNITY HUNTER ENGINE

const opportunities =
require("../opportunities/opportunity-engine");


function scan(){

    const discoveries = [

        {
            company:"Norfolk Small Business",
            source:"local_market",
            problem:"Needs AI automation",
            service:"AI Automation",
            value:5000
        },

        {
            company:"Hampton Roads Contractor",
            source:"business_growth",
            problem:"Needs workflow automation",
            service:"Business OS Setup",
            value:7500
        }

    ];


    const results =
    discoveries.map(item=>{

        return opportunities.add(item);

    });


    return {

        scanned:
        discoveries.length,

        added:
        results.length,

        opportunities:
        results,

        timestamp:
        new Date().toISOString()

    };

}


module.exports={
    scan
};
