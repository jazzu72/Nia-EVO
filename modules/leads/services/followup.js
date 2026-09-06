const fs=require('fs');

const DB="./modules/leads/data/leads.json";

function load(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

function generateFollowUps(){

const leads=load();

const updated=leads.map(lead=>{

let action="Monitor";

if(lead.rating==="hot"){
action="Call within 24 hours";
}
else if(lead.rating==="warm"){
action="Follow up within 3 days";
}
else{
action="Nurture";
}

return {
...lead,
nextAction:action,
followUpDate:new Date(
Date.now()+
(lead.rating==="hot"?86400000:259200000)
).toISOString()
};

});

save(updated);

return updated;

}

module.exports={generateFollowUps};
