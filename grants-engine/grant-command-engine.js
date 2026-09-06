const fs=require("fs");
const path=require("path");

const FILE=path.join(__dirname,"data","grant-status.json");

function load(){
 if(!fs.existsSync(FILE)){
  fs.writeFileSync(FILE,JSON.stringify([],null,2));
 }
 return JSON.parse(fs.readFileSync(FILE));
}

function save(data){
 fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

function register(grant){
 let grants=load();

 let item={
  id:"GRANT-"+Date.now(),
  name:grant.name,
  amount:grant.amount,
  status:"PREPARED",
  priority:grant.score||0,
  checklist:[
   "Business summary",
   "Technology description",
   "Market opportunity",
   "Budget",
   "Founder information"
  ],
  created:new Date().toISOString()
 };

 grants.push(item);
 save(grants);

 return item;
}

function dashboard(){
 let grants=load();

 return {
  system:"NIA GRANT COMMAND CENTER",
  totalApplications:grants.length,
  totalFundingRequested:
   grants.reduce((a,b)=>a+b.amount,0),
  statuses:{
   prepared:grants.filter(x=>x.status==="PREPARED").length,
   submitted:grants.filter(x=>x.status==="SUBMITTED").length,
   awarded:grants.filter(x=>x.status==="AWARDED").length
  },
  grants
 };
}

module.exports={
 register,
 dashboard
};
