const fs = require("fs");

const DB = "data/revenue/leads.json";


function load(){

    if(!fs.existsSync(DB)){
        return [];
    }

    return JSON.parse(
        fs.readFileSync(DB)
    );

}


function analyze(){

    const leads = load();

    return leads.map(lead=>{

        let score = 0;


        if(Number(lead.value) >= 5000){
            score += 40;
        }
        else if(Number(lead.value) >= 1000){
            score += 25;
        }
        else{
            score += 10;
        }


        if(lead.stage === "closed"){
            score += 30;
        }

        if(lead.stage === "contacted"){
            score += 20;
        }


        let priority =
            score >= 70 ? "HIGH" :
            score >= 40 ? "MEDIUM" :
            "LOW";


        return {

            id: lead.id,

            company: lead.company,

            value: lead.value,

            stage: lead.stage,

            score,

            priority,

            recommendation:
                priority === "HIGH"
                ? "CONTACT IMMEDIATELY"
                :
                priority === "MEDIUM"
                ? "FOLLOW UP"
                :
                "NURTURE"

        };

    });

}


module.exports = {
    analyze
};
