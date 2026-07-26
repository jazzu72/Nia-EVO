// NIA REAL ESTATE REVENUE CONNECTOR

const revenue = require("../../revenue/revenue-engine");


function createOpportunity(brokerage){

    return revenue.addDeal({

        company: brokerage.company,

        contact: brokerage.contact || "Owner",

        service: "AI Automation for Real Estate",

        value: brokerage.value || 5000,

        stage: "new"

    });

}


module.exports = {
    createOpportunity
};
