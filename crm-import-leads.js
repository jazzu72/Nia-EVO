const fs=require("fs");

const file="./data/revenue-pipeline.json";
const ai=JSON.parse(fs.readFileSync("./data/ai-prospects.json"));
const re=JSON.parse(fs.readFileSync("./data/real-estate-leads.json"));

let crm=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{
contacts:[],appointments:[],proposals:[],closedDeals:[],revenue:0
};

const existing=new Set(crm.contacts.map(c=>c.name));

[...ai.map(x=>({...x,type:"AI_SERVICE"})),
 ...re.map(x=>({...x,name:x.address,type:"REAL_ESTATE"}))]
.forEach(x=>{
 if(!existing.has(x.name)){
  crm.contacts.push({
   id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
   name:x.name||x.company,
   company:x.company||x.name,
   type:x.type,
   phone:x.phone||null,
   score:x.score||0,
   activities:[],
   probability:10,
   createdAt:new Date().toISOString()
  });
 }
});

fs.writeFileSync(file,JSON.stringify(crm,null,2));
console.log("✅ CRM leads imported");
