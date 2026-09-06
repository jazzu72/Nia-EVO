const express = require("express");
const router = express.Router();

const { processOpportunities } = require("../services/opportunity-engine");

const DB = "./modules/opportunities/data/opportunities.json";
const fs = require("fs");

function read(){
  try{
    return JSON.parse(fs.readFileSync(DB,"utf8"));
  }catch{
    return [];
  }
}

function save(data){
  fs.writeFileSync(DB, JSON.stringify(data,null,2));
}


// STATUS
router.get("/", (req,res)=>{
  res.json({
    system:"Nia Opportunity Engine",
    status:"ONLINE",
    total:read().length,
    endpoints:{
      all:"GET /api/opportunities/all",
      create:"POST /api/opportunities/create",
      process:"POST /api/opportunities/process"
    },
    opportunities:read()
  });
});


// VIEW ALL
router.get("/all",(req,res)=>{
  res.json({
    count:read().length,
    opportunities:read()
  });
});


// CREATE OPPORTUNITY
router.post("/create",(req,res)=>{

const opportunities=read();

const opportunity={
 id:Date.now(),
 name:req.body.name || "Unknown Opportunity",
 source:req.body.source || "manual",
 status:"new",
 created:new Date().toISOString()
};

opportunities.push(opportunity);

save(opportunities);

res.json({
 success:true,
 opportunity
});

});


// PROCESS
router.post("/process",(req,res)=>{

const result = processOpportunities(read());

res.json({
success:true,
result
});

});


module.exports=router;
