const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname,"..");

const STATE = path.join(
ROOT,
"runtime",
"ceo-state.json"
);


function loadState(){

    if(!fs.existsSync(STATE)){
        return {
            cycles:0,
            lastRun:null,
            decisions:[]
        };
    }

    return JSON.parse(
        fs.readFileSync(STATE)
    );
}


function saveState(data){

    fs.mkdirSync(
        path.dirname(STATE),
        {recursive:true}
    );

    fs.writeFileSync(
        STATE,
        JSON.stringify(data,null,2)
    );

}



function scanFiles(){

    const checks = {

        opportunities:
        fs.existsSync(
        path.join(ROOT,"data/opportunities.json")
        ),

        pipeline:
        fs.existsSync(
        path.join(ROOT,"data/pipeline.json")
        ),

        revenue:
        fs.existsSync(
        path.join(ROOT,"data/revenue.json")
        )

    };

    return checks;

}



function executiveDecision(){

    const system = scanFiles();

    let decisions=[];


    if(system.opportunities){

        decisions.push({
            area:"Opportunity Hunter",
            action:"Review new opportunities",
            priority:"HIGH"
        });

    }


    if(system.pipeline){

        decisions.push({
            area:"CRM",
            action:"Follow pipeline leads",
            priority:"HIGH"
        });

    }


    if(!system.revenue){

        decisions.push({
            area:"Revenue",
            action:"Create revenue tracking database",
            priority:"MEDIUM"
        });

    }


    return decisions;

}



function runCEO(){

    const state = loadState();


    const decisions =
    executiveDecision();


    state.cycles++;

    state.lastRun =
    new Date().toISOString();


    state.decisions =
    decisions;


    saveState(state);


    console.log("");
    console.log("🏰 NIA CEO LOOP COMPLETE");
    console.log("------------------------");
    console.log(
    JSON.stringify(
        decisions,
        null,
        2
    ));

}



runCEO();

