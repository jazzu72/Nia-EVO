const fs=require("fs");

const path=require("path");
const FILE = path.join(__dirname,"qualified-grants.json");
function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function addGrant(grant){
 const grants=load();
 grants.push(grant);
 fs.writeFileSync(FILE,JSON.stringify(grants,null,2));
 return grant;
}

function scoreGrant(grant){
 let score=0;

 score += grant.score || 0;

 if(grant.amount >= 500000)
  score += 20;

 if(grant.category==="technology")
  score += 15;

 return score;
}

function topGrants(){

 return load()
 .map(g=>({
   ...g,
   niaScore:scoreGrant(g)
 }))
 .sort((a,b)=>b.niaScore-a.niaScore);

}

module.exports={
 addGrant,
 topGrants,
 scoreGrant
};
