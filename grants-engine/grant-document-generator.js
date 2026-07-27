const fs=require("fs");

const FILE="./grants-engine/generated-documents.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function generate(grant){

 const docs=load();

 const package={
   id:"DOC-"+Date.now(),
   grant:grant.name,
   amount:grant.amount,
   company:"House of Jazzu",
   status:"PACKAGE_READY",
   documents:[
     {
       name:"Executive Summary",
       content:
       "House of Jazzu is developing AI-powered business infrastructure through Nia Capital OS, an autonomous executive intelligence platform."
     },
     {
       name:"Problem Statement",
       content:
       "Small businesses need affordable AI systems to improve operations, discover funding opportunities, and compete digitally."
     },
     {
       name:"Innovation Description",
       content:
       "Nia Capital OS combines AI automation, business intelligence, and capital discovery into one operating system."
     },
     {
       name:"Milestone Plan",
       content:[
         "Complete Nia Capital OS development",
         "Deploy pilot operations",
         "Acquire early customers",
         "Scale technology infrastructure"
       ]
     },
     {
       name:"Budget Allocation",
       content:{
          development:100000,
          infrastructure:50000,
          research:50000,
          operations:50000
       }
     }
   ],
   created:new Date().toISOString()
 };

 docs.push(package);

 fs.writeFileSync(
  FILE,
  JSON.stringify(docs,null,2)
 );

 return package;
}

function dashboard(){
 return load();
}

module.exports={
 generate,
 dashboard
};
