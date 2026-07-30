const express=require("express");
const router=express.Router();
const zapierAuth=require('../zapier-auth');
router.use(zapierAuth);
const fs=require("fs");

router.get("/",(req,res)=>{

let actions={tasks:[]};

try{
 actions=JSON.parse(
  fs.readFileSync("./data/revenue-execution-queue.json","utf8")
 );
}catch(e){}

res.json({
 system:"Nia Zapier Outbound Bridge",
 status:"ONLINE",
 timestamp:new Date().toISOString(),
 pendingActions:actions.tasks.length,
 actions:actions.tasks
});

});

module.exports=router;
