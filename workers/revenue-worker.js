// NIA AUTONOMOUS REVENUE WORKER

const fs = require("fs");

const autopilot =
require("../autopilot/revenue-autopilot");


const prospectDB =
"data/prospects.json";


function loadProspects(){

    if(!fs.existsSync(prospectDB)){
        return [];
    }

    return JSON.parse(
        fs.readFileSync(prospectDB,"utf8")
    );

}



function run(){

    console.log(
        "🤖 NIA Revenue Worker Running..."
    );


    const prospects =
    loadProspects();


    if(prospects.length === 0){

        console.log(
            "No prospects available"
        );

        return;

    }



    prospects.forEach(prospect=>{

        try{

            const result =
            autopilot.processProspect(prospect);


            console.log(
                "Processed:",
                prospect.company,
                result.status
            );


        }catch(error){

            console.log(
                "Worker Error:",
                error.message
            );

        }

    });


}



setInterval(
    run,
    60000
);


run();
