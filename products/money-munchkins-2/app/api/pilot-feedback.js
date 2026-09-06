const express=require("express");
const fs=require("fs");
const path=require("path");

const router=express.Router();
const file=path.join(__dirname,"../../data/pilot/feedback.json");

router.post("/",(req,res)=>{
  const record={
    ...req.body,
    receivedAt:new Date().toISOString()
  };

  let records=[];
  if(fs.existsSync(file)){
    try{records=JSON.parse(fs.readFileSync(file,"utf8"));}catch{}
  }

  records.push(record);
  fs.writeFileSync(file,JSON.stringify(records,null,2));

  res.json({
    success:true,
    message:"PILOT_FEEDBACK_RECORDED"
  });
});

router.get("/stats",(req,res)=>{
  let records=[];
  if(fs.existsSync(file)){
    try{records=JSON.parse(fs.readFileSync(file,"utf8"));}catch{}
  }

  const avg=(field)=>{
    const values=records.map(x=>Number(x[field])).filter(Number.isFinite);
    return values.length
      ? Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2))
      : 0;
  };

  res.json({
    success:true,
    totalResponses:records.length,
    averageEngagement:avg("engagement"),
    averageClarity:avg("clarity"),
    repeatIntent:records.filter(x=>x.repeat==="Definitely").length
  });
});

module.exports=router;
