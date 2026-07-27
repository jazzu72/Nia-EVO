const fs=require('fs');

function count(file){
 try{
  return JSON.parse(fs.readFileSync(`./modules/realestate/data/${file}.json`)).length;
 }catch{
  return 0;
 }
}

module.exports=function(){

 return {
  system:"Nia Acquisition Command Center",
  date:new Date().toISOString(),

  pipeline:{
   leads:count("leads"),
   properties:count("properties"),
   deals:count("deals"),
   closings:count("closings")
  },

  network:{
   contractors:count("contractors"),
   lenders:count("lenders"),
   attorneys:count("attorneys")
  },

  nextActions:[
   "Review seller leads",
   "Request contractor estimates",
   "Evaluate financing options",
   "Prepare offers"
  ]
 };

};
