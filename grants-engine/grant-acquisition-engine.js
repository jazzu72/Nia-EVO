const fs=require("fs");
const path=require("path");

const FILE=path.join(__dirname,"../data/grants/opportunities.json");
const APP=path.join(__dirname,"../data/grants/applications.json");

function load(file,def=[]){
 if(!fs.existsSync(file)){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(def,null,2));
 }
 return JSON.parse(fs.readFileSync(file));
}

function save(file,data){
 fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function scoreGrant(g){
 let score=0;

 if(g.category?.includes("technology")) score+=30;
 if(g.category?.includes("small business")) score+=25;
 if(g.category?.includes("innovation")) score+=25;
 if(g.category?.includes("AI")) score+=20;
 if(g.amount>=100000) score+=20;

 return score;
}

function scan(){
 const grants=load(FILE,[
 {
  name:"Virginia Innovation Partnership Corporation",
  category:"technology innovation AI small business",
  amount:250000
 },
 {
  name:"NSF America Seed Fund",
  category:"AI innovation technology startup",
  amount:256000
 },
 {
  name:"Small Business Innovation Research",
  category:"technology AI research",
  amount:150000
 }
 ]);

 return grants.map(g=>({
  ...g,
  score:scoreGrant(g),
  fit:"House of Jazzu AI / Quantum Technology"
 }))
 .sort((a,b)=>b.score-a.score);
}

function createApplications(){
 const apps=scan().map(g=>({
  grant:g.name,
  status:"READY_FOR_REVIEW",
  requestedAmount:g.amount,
  created:new Date().toISOString()
 }));

 save(APP,apps);
 return apps;
}

module.exports={
 scan,
 createApplications
};
