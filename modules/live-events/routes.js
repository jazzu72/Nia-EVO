const express=require("express");
const fs=require("fs");
const router=express.Router();
const eventAuth=require('./event-auth');
router.use(eventAuth);

router.post("/",(req,res)=>{

let inbox={events:[]};

try{
 inbox=JSON.parse(
  fs.readFileSync("./data/nia-event-inbox.json","utf8")
 );
}catch(e){}

const event={
 id:Date.now(),
 type:req.body.type||"UNKNOWN_EVENT",
 payload:req.body,
 receivedAt:new Date().toISOString()
};

inbox.events.push(event);

fs.mkdirSync("./data",{recursive:true});

fs.writeFileSync(
 "./data/nia-event-inbox.json",
 JSON.stringify(inbox,null,2)
);

res.json({
 status:"EVENT_RECEIVED",
 event
});

});

module.exports=router;
