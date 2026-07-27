// NIA CEO Decision Engine

const revenue = require("../revenue/revenue-engine");
const proposal = require("../proposals/proposal-engine");
const followup = require("../followup/followup-engine");


function status(){

    const dashboard = revenue.dashboard();

    const proposals = proposal.list();

    const actions = followup.queue();


    let recommendations = [];


    if(dashboard.totalDeals === 0){
        recommendations.push(
            "Generate qualified business leads"
        );
    }


    if(actions.length > 0){
        recommendations.push(
            "Complete pending follow-up actions"
        );
    }


    if(proposals.length > 0){
        recommendations.push(
            "Convert proposals into signed deals"
        );
    }


    return {

        system:
        "NIA CEO DECISION CENTER",

        status:
        "ONLINE",

        revenue:dashboard,

        proposals:{
            total:proposals.length
        },

        followups:{
            pending:actions.length
        },

        recommendations,

        generated:
        new Date().toISOString()

    };

}


module.exports={
    status
};
