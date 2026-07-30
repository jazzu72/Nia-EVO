const express=require("express");
const router=express.Router();
const {exec}=require("child_process");

router.get("/",(req,res)=>{

 exec("pm2 jlist",(err,out)=>{

  if(err){
   return res.status(500).json({
    system:"Nia Master Status",
    status:"ERROR"
   });
  }

  const apps=JSON.parse(out);

  const core=[
   "nia",
   "revenue-loop",
   "action-queue-loop",
   "nia-intelligence",
   "nia-self-healer",
   "nia-backup",
   "nia-ops-report",
   "nia-deployment-check"
  ];

  const services=core.map(name=>{
   const app=apps.find(a=>a.name===name);

   return {
    service:name,
    status:app?.pm2_env?.status || "missing"
   };
  });

  res.json({
   system:"Nia Capital OS Master Status",
   timestamp:new Date().toISOString(),
   services
  });

 });

});

module.exports=router;
