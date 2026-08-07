const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let actions=[];

data.contacts.forEach(c=>{

if(c.dealStatus!=="won"){

let action="Nurture lead";

if(c.priority==="HOT" && c.proposalSent){
 action="Call to confirm proposal + schedule meeting";
}
else if(c.priority==="HOT"){
 action="Immediate outreach call";
}
else if(c.proposalSent){
 action="Proposal follow-up";
}
else if(c.probability>=40){
 action="Send value message";
}

c.nextBestAction=action;

actions.push({
 name:c.name,
 priority:c.priority||"COLD",
 action
});

}

});

data.salesActions=actions;

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log("🧠 Sales Action Engine Updated");
actions.slice(0,10).forEach(a=>{
 console.log(`${a.priority} ${a.name}: ${a.action}`);
});

