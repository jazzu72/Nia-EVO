const intelligence = require("./intelligence");
const express = require("express");
const Datastore = require("@seald-io/nedb");

const app = express();
app.use(express.json());

const PORT = process.env.CRM_PORT || 4000;

const db = new Datastore({
  filename: "./opportunities.db",
  autoload: true
});

app.get("/health",(req,res)=>{
  db.count({},(err,count)=>{
    res.json({
      status:"Nia Opportunity CRM Online",
      opportunities:count,
      time:new Date().toISOString()
    });
  });
});

app.get("/opportunities",(req,res)=>{
  db.find({}).sort({created:-1}).exec((err,docs)=>{
    if(err) return res.status(500).json(err);
    res.json(docs);
  });
});

app.post("/opportunities",(req,res)=>{
  const item={
    created:Date.now(),
    type:req.body.type || "Grant",
    title:req.body.title || "Untitled",
    organization:req.body.organization || "",
    contact:req.body.contact || "",
    value:req.body.value || 0,
    status:req.body.status || "Discovered",
    deadline:req.body.deadline || "",
    notes:req.body.notes || ""
  };

  db.insert(item,(err,newDoc)=>{
    if(err) return res.status(500).json(err);
    res.json(newDoc);
  });
});

app.listen(PORT,"0.0.0.0",()=>{
  console.log("");
  console.log("🏰 Nia Opportunity CRM Online");
  console.log("Port:",PORT);
  console.log("Health: http://localhost:"+PORT+"/health");
  console.log("");
});
app.get("/ai-ranking",(req,res)=>{

db.find({})
.exec((err,docs)=>{

if(err)
return res.status(500).json(err);


const ranked = docs.map(o=>{

let score=intelligence.scoreOpportunity(o);

return {
...o,
score,
recommendation:
intelligence.recommendation(score)
};

});


ranked.sort((a,b)=>b.score-a.score);


res.json(ranked.slice(0,10));

});

});
