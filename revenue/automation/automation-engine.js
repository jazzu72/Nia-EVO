const intelligence =
require("../intelligence/intelligence-engine");

const fs = require("fs");

const DB =
"data/revenue/actions.json";


function load(){

    if(!fs.existsSync(DB)){

        fs.mkdirSync(
            "data/revenue",
            {recursive:true}
        );

        fs.writeFileSync(DB,"[]");

    }

    return JSON.parse(
        fs.readFileSync(DB)
    );

}



function run(){

    const actions = load();

    const report =
        intelligence.analyze();


    let action = {

        id:
        "ACTION-"+Date.now(),

        type:
        "REVENUE_TASK",

        priority:
        "NORMAL",

        instruction:
        report.recommendation,

        status:
        "pending",

        created:
        new Date().toISOString()

    };


    if(report.opportunities.length){

        action.priority="HIGH";

        action.instruction =
        "Contact highest value opportunity: "
        +
        report.opportunities[0].company;

    }


    actions.push(action);


    fs.writeFileSync(
        DB,
        JSON.stringify(actions,null,2)
    );


    return action;

}



function queue(){

    return load();

}


module.exports={
    run,
    queue
};
