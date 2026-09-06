const express=require("express");
const router=express.Router();
const fs=require("fs");

function read(path){
 try{
  return JSON.parse(fs.readFileSync(path,"utf8"));
 }catch{
  return [];
 }
}

router.get("/",(req,res)=>{

 const grants=read("./modules/grants/data/grants.json");

 const ranked=grants
 .map(g=>({
   ...g,
   score:Number(g.amount||0)
 }))
 .sort((a,b)=>b.score-a.score);

 res.json({
  system:"Nia Grant Intelligence Ranking",
  ranked
 });

});

module.exports=router;
