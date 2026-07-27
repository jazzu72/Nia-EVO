const express = require("express");
const router = express.Router();

const grantConnector = require("../grants-engine/grant-connector");
const grantDecision = require("../grants-engine/grant-decision-connector");
const priority = require("../decision/priority-engine");


router.get("/grants", (req,res)=>{

  const grants = grantConnector.scan();

  res.json({
    system:"NIA GRANT SUBMISSION DASHBOARD",
    status:"ONLINE",
    fundingPipeline:grants,
    totalPotentialFunding:
      grants.reduce((sum,g)=>sum + g.amount,0),
    generated:new Date().toISOString()
  });

});


router.post("/grants/execute",(req,res)=>{

  const result = grantDecision.executeGrantStrategy();

  res.json(result);

});


router.get("/decision-feed",(req,res)=>{

  const ranked = priority.prioritize();

  const grants = grantConnector.scan();

  res.json({

    system:"NIA CEO FUNDING DECISION FEED",

    recommendation:{
      action:"Prioritize grant submissions",
      reason:"Non-dilutive capital opportunity detected"
    },

    funding:{
      opportunities:grants.length,
      potentialCapital:
        grants.reduce((sum,g)=>sum + g.amount,0)
    },

    taskQueue:ranked.slice(0,5),

    generated:new Date().toISOString()

  });

});


module.exports = router;
