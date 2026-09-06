const fs=require("fs");

const CRM="./data/revenue-pipeline.json";

function load(){
 return JSON.parse(fs.readFileSync(CRM,"utf8"));
}

function save(data){
 fs.writeFileSync(CRM,JSON.stringify(data,null,2));
}

function generateMessage(contact){

return `Hello ${contact.name},

We help businesses automate operations using AI systems that save time and increase revenue.

I noticed ${contact.company || contact.name} may benefit from workflow automation.

Would you be open to a quick conversation about improving efficiency?

- House of Jazzu AI Solutions`;

}

function run(){

let data=load();

let leads=data.contacts
.filter(c=>c.probability>=50 && c.dealStatus!=="won")
.filter(c=>!c.outreachSent);

let count=0;

leads.forEach(c=>{

c.outreachSent=true;
c.outreachDate=new Date().toISOString();
c.outreachMessage=generateMessage(c);

c.activities=c.activities||[];

c.activities.push({
 id:"out-"+Date.now().toString(36),
 type:"outreach",
 note:"AI generated outreach message created.",
 timestamp:new Date().toISOString()
});

count++;

});

save(data);

console.log(`📨 Outreach Engine processed ${count} leads`);

}

run();

module.exports={run};
