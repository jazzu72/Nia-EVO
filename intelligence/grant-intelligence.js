const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/grants-ranked.json"
);



function scoreGrant(grant){

let score = 0;


// Funding size

if(grant.amount >= 1000000)
score += 40;

else if(grant.amount >= 250000)
score += 30;

else if(grant.amount >= 50000)
score += 20;


// Technology alignment

if(grant.ai)
score += 15;

if(grant.quantum)
score += 15;

if(grant.education)
score += 10;


// Startup fit

if(grant.startup)
score += 10;

if(grant.smallBusiness)
score += 10;


// Deadline

if(grant.deadline)
score += 5;


return score;

}



function rankGrants(grants){

return grants.map(g=>{

return {

...g,

score:
scoreGrant(g),

priority:
scoreGrant(g)>=80
?"EXECUTE NOW":
scoreGrant(g)>=60
?"HIGH":
"REVIEW"

};

})
.sort(
(a,b)=>b.score-a.score
);

}



function saveRanked(grants){

fs.writeFileSync(
DB,
JSON.stringify(grants,null,2)
);

}


module.exports={
rankGrants,
saveRanked
};

