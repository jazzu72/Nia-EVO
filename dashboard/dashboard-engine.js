// NIA COMMAND DASHBOARD ENGINE

const ceo = require("../ceo/ceo-engine");
const revenue = require("../revenue/revenue-engine");
const proposal = require("../proposals/proposal-engine");
const followup = require("../followup/followup-engine");


function overview(){

    const executive = ceo.status();

    return {

        system:
        "NIA COMMAND CENTER",

        status:
        "ONLINE",

        executive,

        revenue:
        revenue.dashboard(),

        proposals:{
            total:
            proposal.list().length
        },

        followups:{
            queue:
            followup.queue().length
        },

        modules:[
            "Revenue Engine",
            "Prospect Engine",
            "Proposal Engine",
            "Follow-up Engine",
            "CEO Decision Center"
        ],

        timestamp:
        new Date().toISOString()

    };

}


module.exports={
    overview
};
