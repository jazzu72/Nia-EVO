// NIA Lead Scoring Engine

function scoreProspect(prospect){

    let score = 0;


    // Business value
    if(prospect.value >= 5000){
        score += 30;
    }
    else if(prospect.value >= 1000){
        score += 20;
    }
    else{
        score += 10;
    }


    // Company presence
    if(prospect.company){
        score += 20;
    }


    // Contact available
    if(prospect.contact){
        score += 20;
    }


    // Service fit
    if(
        prospect.service === "AI Automation" ||
        prospect.service === "Business OS"
    ){
        score += 30;
    }


    let priority="LOW";

    if(score >= 70){
        priority="HIGH";
    }
    else if(score >= 40){
        priority="MEDIUM";
    }


    return {

        score,

        priority,

        recommendation:
            priority==="HIGH"
            ?
            "Generate proposal immediately"
            :
            "Continue qualification"

    };

}


module.exports={
    scoreProspect
};
