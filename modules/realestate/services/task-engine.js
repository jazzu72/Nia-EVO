const fs=require('fs');

function count(file){
 try{
  return JSON.parse(
   fs.readFileSync(`./modules/realestate/data/${file}.json`)
  ).length;
 }catch{
  return 0;
 }
}

module.exports=function(){

let tasks=[];

if(count("leads")===0)
 tasks.push("Generate seller leads");

if(count("contractors")===0)
 tasks.push("Add contractor contacts");

if(count("lenders")===0)
 tasks.push("Add hard money lenders");

if(count("attorneys")===0)
 tasks.push("Add closing attorney");

if(count("pipeline")>0)
 tasks.push("Review active deals");

tasks.push("Check follow-up queue");

return {
 system:"Nia Chief of Staff",
 date:new Date().toISOString(),
 priorityTasks:tasks,
 metrics:{
  leads:count("leads"),
  deals:count("deals"),
  closings:count("closings")
 }
};

};
