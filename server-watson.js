// ============================================================
// NIA CAPITAL OS - SERVER WATSON
// Clean Executive Runtime
// ============================================================

const express = require("express");
const ceoDashboard = require("./ceo/dashboard-api");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

console.log("🏰 Nia Capital OS Booting...");

app.use("/api/grants", require("./grants-engine/grant-api"));
console.log("✅ /api/grants loaded");

app.use("/api/funding", require("./funding/funding-api"));
console.log("✅ /api/funding loaded");

app.use(
);


// ============================================================
// ROUTE LOADER
// ============================================================

app.use("/api/ceo", require("./ceo/grant-dashboard-api"));

app.use("/api/ceo", require("./ceo/grant-autopilot-api"));
function loadRoute(file, endpoint) {

    try {

        const router = require(file);

        app.use(endpoint, router);

        console.log(`✅ ${endpoint} loaded`);

    } catch (error) {

        console.log(
            `⚠️ ${endpoint} skipped: ${error.message}`
        );

    }

}


// ============================================================
// CORE SYSTEM ROUTES
// ============================================================

loadRoute(
"./hunter/realestate/realestate-api",
"/api/realestate"
);
loadRoute(
    "./command-center/executive-api",
    "/api/executive"
);
loadRoute(
 "./sales/sales-api",
 "/api/sales"
);
loadRoute(
"./autonomous/sales-loop-api",
"/api/autonomous-sales"
);
loadRoute(
"./reports/revenue-briefing-api",
"/api/briefing"
);

loadRoute(
"./outreach/outreach-api",
"/api/outreach"
);

loadRoute(
"./conversion/deal-closer-api",
"/api/conversion"
);
loadRoute(
"./sales/sales-dashboard-api",
"/api/sales-dashboard"
);
loadRoute(
"./acquisition/acquisition-api",
"/api/acquisition"
);
loadRoute(
"./intelligence/revenue-brain-api",
"/api/revenue-brain"
);

loadRoute(
"./command-center/executive-dashboard-api",
"/api/command"
);
loadRoute(
"./cashflow/cashflow-api",
"/api/cashflow"
);
loadRoute(
"./sales/nia-sales-api",
"/api/sales"
);

loadRoute(
"./chief-of-staff/chief-api",
"/api/chief"
);
loadRoute(
"./intelligence/hunter-api",
"/api/intelligence"
);

loadRoute(
"./memory/memory-api",
"/api/memory"
);

loadRoute(
"./dashboard/dashboard-api",
"/api/dashboard"
);
loadRoute(
"./proposals/proposal-api",
"/api/proposals"
);
loadRoute(
"./ceo/ceo-api",
"/api/ceo"
);
loadRoute(
"./opportunities/opportunity-api",
"/api/opportunities"
);
loadRoute(
"./autonomous/autonomous-api",
"/api/autonomous"
);

loadRoute(
"./autopilot/autopilot-api",
"/api/autopilot"
);
loadRoute(
"./intelligence/intelligence-api",
"/api/intelligence"
);
loadRoute(
"./autopilot/autopilot-api",
"/api/autopilot"
);
loadRoute(
"./router/opportunity-router-api",
"/api/router"
);

loadRoute(
 "./command-center/revenue-dashboard-api",
 "/api/command"
);
loadRoute(
"./command-center/revenue-dashboard-api",
"/api/command"
);

loadRoute(
 "./acquisition/acquisition-leads-api",
 "/api/acquisition/leads"
);

app.use("/api/ceo", require("./ceo/decision-api"));

app.use("/api/ceo", require("./ceo/grant-autopilot-api"));
loadRoute(
 "./revenue/automation/automation-api",
 "/api/revenue/automation"
);
loadRoute(
 "./revenue/intelligence/intelligence-api",
 "/api/revenue/intelligence"
);
loadRoute(
 "./revenue/outreach/outreach-api",
 "/api/outreach"
);
loadRoute(
 "./revenue/acquisition/acquisition-api",
 "/api/acquisition/leads"
);
loadRoute("./revenue/intelligence-api", "/api/revenue/intelligence");
loadRoute("./command-center/revenue-dashboard-api", "/api/command");
loadRoute(
 "./revenue/conversion/conversion-api",
 "/api/conversion"
);
loadRoute(
);

loadRoute(
 "./revenue/proposals/proposal-api",
 "/api/proposals"
);
loadRoute(
 "./revenue/operator/operator-api",
 "/api/operator"
);
loadRoute(
 "./revenue/followup/followup-api",
 "/api/followup"
);
loadRoute(
    "./hunter/hunter-api",
    "/api/hunter"
);


loadRoute(
    "./acquisition/acquisition-api",
    "/api/acquisition"
);


loadRoute(
    "./revenue/revenue-api",
    "/api/revenue"
);


loadRoute(
    "./revenue/prospects/prospect-api",
    "/api/prospects"
);

loadRoute(
 "./command-center/revenue-dashboard-api",
 "/api/command"
);

loadRoute(
"./command-center/revenue-dashboard-api",
"/api/command"
);
// ============================================================
// HEALTH SYSTEM
// ============================================================

app.get(
    "/api/system/health",
    (req,res)=>{

        res.json({

            status:"online",

            system:"Nia Capital OS",

            timestamp:new Date().toISOString(),

            uptime:process.uptime()

        });

    }
);



// ============================================================
// ROOT
// ============================================================

app.get(
    "/",
    (req,res)=>{

        res.json({

            system:"Nia Capital OS",

            status:"running",

            version:"1.0"

        });

    }
);



// ============================================================





// CORE FUNDING + GRANTS ROUTES
try {
} catch(e) {
console.log("GRANTS ERROR:",e.message);
}

try {
} catch(e) {
console.log("FUNDING ERROR:",e.message);
}



// ============================================================
// FUNDING + GRANTS API
// ============================================================
app.use("/api/grants", require("./grants-engine/grant-api"));
console.log("✅ /api/grants mounted");

app.use("/api/funding", require("./funding/funding-api"));
console.log("✅ /api/funding mounted");

// 404 HANDLER
// ============================================================

app.use(
    (req,res)=>{

        res.status(404).json({


            path:req.path

        });

    }
);



// ============================================================
// START SERVER
// ============================================================






try {
} catch(e) {
  console.log("⚠️ grants route:", e.message);
}

try {
} catch(e) {
  console.log("⚠️ funding route:", e.message);
}



// ===== FINAL ROUTE REPAIR =====
try {
 console.log("✅ grants mounted");
} catch(e) {
 console.log("❌ grants failed:", e.message);
}

try {
 console.log("✅ funding mounted");
} catch(e) {
 console.log("❌ funding failed:", e.message);
}

app.use((req,res)=>{
 res.status(404).json({
  error:"Route not found",
  path:req.path
 });
});

app.listen(
    PORT,
    "0.0.0.0",
    ()=>{

        console.log(
            `🏰 Nia OS running on http://0.0.0.0:${PORT}`
        );

    }
);




// FINAL FALLBACK