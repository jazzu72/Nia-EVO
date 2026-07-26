const revenue = require("../revenue-engine");
const followup = require("../followup/followup-engine");


function runDailyReview(){

    const pipeline = revenue.pipeline();

    const queue = followup.queue();


    const totalPipeline =
        pipeline.reduce(
            (sum,item)=>
            sum + Number(item.value || 0),
            0
        );


    const highPriority =
        queue.filter(
            item=>item.priority==="HIGH"
        );


    return {

        system:"Nia Daily Revenue Operator",

        status:"ONLINE",

        summary:{

            activeDeals:pipeline.length,

            pipelineValue:totalPipeline,

            pendingActions:queue.length,

            urgentActions:highPriority.length

        },


        recommendedActions:[
            "Contact HIGH priority prospects first",
            "Update deal stages daily",
            "Convert qualified leads into proposals"
        ],


        generated:new Date().toISOString()

    };

}


module.exports={
    runDailyReview
};
