const express=require("express");
const router=express.Router();
const fs=require("fs");

router.get("/",(req,res)=>{
  res.json({
    system:"NIA CAPITAL OS",
    module:"CEO DASHBOARD",
    status:"ACTIVE",
    timestamp:new Date().toISOString(),
    processes:[
      "grants",
      "nia",
      "nia-ceo-loop",
      "nia-worker",
      "nia-scheduler"
    ],
    actions:fs.existsSync("./ceo/action-queue.json")
      ? JSON.parse(fs.readFileSync("./ceo/action-queue.json"))
      : []
  });
});

module.exports=router;
