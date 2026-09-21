const express=require("express");
const fs=require("fs");
const path=require("path");
const router=express.Router();
const DB=path.join(process.cwd(),"data/revenue/pipeline.json");

function load(){if(!fs.existsSync(DB)){fs.mkdirSync(path.dirname(DB),{recursive:true});fs.writeFileSync(DB,"[]");}return JSON.parse(fs.readFileSync(DB,"utf8"))}
function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}

router.get("/pipeline",(req,res)=>{const x=load();res.json({ok:true,metrics:{leads:x.length,qualified:x.filter(a=>a.stage==="qualified").length,proposals:x.filter(a=>a.stage==="proposal").length,closed:x.filter(a=>a.stage==="closed").length,cashCollected:x.reduce((n,a)=>n+Number(a.cashCollected||0),0),pipelineValue:x.reduce((n,a)=>n+Number(a.value||0),0)},records:x})});

router.post("/pipeline",(req,res)=>{const x=load();const r={id:"REV-"+Date.now(),name:req.body.name||"Unnamed Opportunity",type:req.body.type||"AI Automation",value:Number(req.body.value||0),cashCollected:Number(req.body.cashCollected||0),stage:req.body.stage||"lead",created:new Date().toISOString()};x.push(r);save(x);res.status(201).json({ok:true,record:r})});

module.exports=router;
