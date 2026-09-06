const fs=require('fs');

function read(file,fallback){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return fallback;
}
}

function generateReport(){

const deals=read('./modules/realestate/data/deals.json',[]);
const leads=read('./modules/leads/data/leads.json',[]);
const activity=read('./modules/activity/data/activity.json',[]);

return {
system:"Nia Daily Intelligence Report",
status:"online",
date:new Date().toISOString(),

metrics:{
deals:deals.length,
leads:leads.length,
activities:activity.length
},

priorities:[
"Review new leads",
"Analyze property opportunities",
"Follow up active prospects"
],

summary:
`Nia monitored ${leads.length} leads, ${deals.length} deals, and ${activity.length} activities.`

};

}

module.exports={generateReport};
