const fs = require("fs");
const cron = require("node-cron");

const CRM="./data/revenue-pipeline.json";
const LOG="./logs/lead-hunter.log";

function log(msg){
 const line=`[${new Date().toISOString()}] ${msg}`;
 console.log(line);
 fs.appendFileSync(LOG,line+"\n");
}

function load(){
 return JSON.parse(fs.readFileSync(CRM,"utf8"));
}

function save(data){
 fs.writeFileSync(CRM,JSON.stringify(data,null,2));
}

function hunt(){

 const leads=[
 {
 name:"Norfolk Roofing Co.",
 company:"Norfolk Roofing Co.",
 type:"AI_SERVICE",
 industry:"contractor",
 phone:"757-555-1212",
 score:75,
 probability:10,
 activities:[],
 createdAt:new Date().toISOString()
 },
 {
 name:"Hampton Roads Plumbing",
 company:"Hampton Roads Plumbing",
 type:"AI_SERVICE",
 industry:"plumbing",
 phone:"757-555-1313",
 score:70,
 probability:10,
 activities:[],
 createdAt:new Date().toISOString()
 },
 {
 name:"Norfolk Realty Group",
 company:"Norfolk Realty Group",
 type:"AI_SERVICE",
 industry:"real estate",
 phone:"757-555-1616",
 score:80,
 probability:10,
 activities:[],
 createdAt:new Date().toISOString()
 }
 ];

 let crm=load();
 let existing=new Set(crm.contacts.map(x=>x.name));
 let added=0;

 leads.forEach(l=>{
   if(!existing.has(l.name)){
     crm.contacts.push(l);
     added++;
   }
 });

 save(crm);

 log(`✅ Added ${added} leads. Total contacts: ${crm.contacts.length}`);
}

hunt();

cron.schedule("0 */6 * * *",hunt);

log("🤖 Lead Hunter online");
