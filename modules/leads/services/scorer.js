function scoreLead(lead){

let score=0;

if(lead.phone) score+=30;
if(lead.email) score+=20;
if(lead.type==="seller") score+=20;
if(lead.type==="investor") score+=15;
if(lead.type==="buyer") score+=10;

let rating="cold";

if(score>=60) rating="hot";
else if(score>=35) rating="warm";

return {
...lead,
score,
rating
};

}

module.exports={scoreLead};
