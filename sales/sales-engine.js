const fs = require("fs");

const DB = "data/revenue/opportunities.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync("data/revenue",{recursive:true});
        fs.writeFileSync(DB,"[]");
    }

    return JSON.parse(
        fs.readFileSync(DB)
    );
}


function qualifyLead(lead){

    let opportunities = load();


    const opportunity = {

        id:
        "OPP-"+Date.now(),

        company:
        lead.company,

        service:
        lead.service || "AI Automation",

        estimatedValue:
        lead.value || 2500,

        score:
        lead.score || 75,

        stage:
        "qualified",

        nextAction:
        "Send proposal",

        created:
        new Date().toISOString()

    };


    opportunities.push(opportunity);


    fs.writeFileSync(
        DB,
        JSON.stringify(opportunities,null,2)
    );


    return opportunity;

}


function pipeline(){

    return load();

}


module.exports={
    qualifyLead,
    pipeline
};
