const company = {
  name: "House of Jazzu",
  location: "Norfolk Virginia",
  industry: [
    "Artificial Intelligence",
    "Quantum Technology",
    "Education Technology",
    "FinTech",
    "EV Infrastructure"
  ],
  founder: "Jason Lesane",
  stage: "Startup"
};


function scoreGrant(grant){

let score = 0;
let reasons=[];


if(grant.ai){
 score+=25;
 reasons.push("AI alignment");
}

if(grant.startup){
 score+=20;
 reasons.push("Startup eligible");
}

if(grant.education){
 score+=15;
 reasons.push("Education technology fit");
}

if(grant.technology){
 score+=20;
 reasons.push("Technology innovation fit");
}

if(grant.virginia){
 score+=20;
 reasons.push("Virginia preference");
}


return {
 grant:grant.name,
 score,
 reasons
};

}


function rankGrants(grants){

return grants
.map(scoreGrant)
.sort((a,b)=>b.score-a.score);

}


module.exports={
 scoreGrant,
 rankGrants,
 company
};
