app.get("/api/payments/status",(req,res)=>{const p=process.env.PAYMENT_PROVIDER||"manual";res.json({success:true,provider:p,configured:p==="stripe"&&!!process.env.STRIPE_SECRET_KEY});});
const express = require("express");

const api = require("./api");
const progress = require("./api/progress");
const investor = require("./api/investor");
const growth = require("./api/growth");
const analytics = require("./api/analytics");
const audit = require("./api/audit");
const revenue = require("./api/revenue");
const payments = require("./api/payments");
const parent = require("./api/parent");
const pilotFeedback = require("./api/pilot-feedback");
const learning = require("./api/learning");

const app = express();
const PORT = Number(process.env.PORT || process.env.MONEY_MUNCHKINS_PORT || 3310);

app.get("/api/money-munchkins/health",(req,res)=>res.json({ok:true,service:"money-munchkins-2",status:"healthy"}));
app.use(express.json());
const DAILY_MISSION_LIMIT=3;
const dailyMissionLog=new Map();

function enforceDailyLimit(req,res,next){
  const id=req.params.id;
  const today=new Date().toISOString().slice(0,10);
  const key=id+":"+today;
  const count=dailyMissionLog.get(key)||0;
  if(count>=DAILY_MISSION_LIMIT){
    return res.status(429).json({
      success:false,
      error:"DAILY_MISSION_LIMIT_REACHED",
      limit:DAILY_MISSION_LIMIT
    });
  }
  req.dailyMissionKey=key;
  next();
}


app.use("/money-munchkins", express.static(__dirname + "/web"));
app.use("/money-munchkins-pilot", express.static(__dirname + "/../pilot/feedback"));

app.use("/api/money-munchkins", api);
app.use("/api/money-munchkins/progress", progress);
app.use("/api/money-munchkins/investor", investor);
app.use("/api/money-munchkins/growth", growth);
app.use("/api/money-munchkins/analytics", analytics);
app.use("/api/money-munchkins/audit", audit);
app.use("/api/money-munchkins/revenue", revenue);
app.use("/api/money-munchkins/payments", payments);
app.get("/money-munchkins/pilot", (req,res) => {
  res.sendFile(require("path").join(__dirname,"web/pilot/index.html"));
});

app.get("/money-munchkins/investor-center", (req,res) => {
  const configured = process.env.MONEY_MUNCHKINS_INVESTOR_CODE;
  const supplied = req.headers["x-investor-code"];

  if (!configured || supplied !== configured) {
    return res.status(401).send("Investor access required");
  }

  res.sendFile(require("path").join(__dirname,"web/investor/index.html"));
});

app.get("/money-munchkins/investor", (req,res) => {
  res.sendFile(require("path").join(__dirname,"web/investor/index.html"));
});
app.use("/api/money-munchkins/parent", parent);
app.use("/api/money-munchkins/pilot-feedback", pilotFeedback);
app.use("/api/money-munchkins/learning", learning);

app.get("/", (req, res) => {
  res.json({
    name: "Money Munchkins: Quantum Odyssey",
    version: "0.1.0",
    status: "online"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Money Munchkins running");
  console.log(`🌐 http://127.0.0.1:${PORT}`);
});
