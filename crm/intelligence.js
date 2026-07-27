const scoreOpportunity = (opp)=>{

let score = 0;

if(opp.type === "grant") score += 40;
if(opp.type === "investor") score += 35;
if(opp.type === "contract") score += 30;
if(opp.type === "real_estate") score += 25;

if(opp.amount){
    if(opp.amount >= 1000000) score += 30;
    else if(opp.amount >= 250000) score += 20;
    else if(opp.amount >= 50000) score += 10;
}

if(opp.deadline){
    score += 10;
}

return score;

};


function recommendation(score){

if(score >=80)
 return "🔥 EXECUTE NOW";

if(score >=60)
 return "⚡ HIGH PRIORITY";

if(score >=40)
 return "📌 REVIEW";

return "⏳ LOW PRIORITY";

}


module.exports={
scoreOpportunity,
recommendation
};

