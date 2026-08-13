// ============================================================
// NIA CAPITAL OS - SERVER WATSON
// Clean Production Runtime
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("🏰 Nia Capital OS Booting...");

// ============================================================
// ROUTE LOADER - SAFE LOADING WITH ERROR HANDLING
// ============================================================

function loadRoute(filePath, endpoint) {
  try {
    const router = require(filePath);
    app.use(endpoint, router);
    console.log(`✅ ${endpoint} loaded`);
  } catch (error) {
    console.warn(`⚠️  ${endpoint} skipped: ${error.message}`);
  }
}

// ============================================================
// CORE SYSTEM ROUTES
// ============================================================

// Grants & Funding
loadRoute("./grants-engine/grant-api", "/api/grants");
loadRoute("./funding/funding-api", "/api/funding");

// Owner & CEO
loadRoute("./owner-draft-api", "/api/owner");
loadRoute("./ceo/grant-dashboard-api", "/api/ceo/dashboard");
loadRoute("./ceo/grant-autopilot-api", "/api/ceo/autopilot");
loadRoute("./ceo/decision-api", "/api/ceo/decision");
loadRoute("./ceo/ceo-api", "/api/ceo");

// Real Estate & Sales
loadRoute("./hunter/realestate/realestate-api", "/api/realestate");
loadRoute("./sales/sales-api", "/api/sales");
loadRoute("./sales/sales-dashboard-api", "/api/sales-dashboard");
loadRoute("./sales/nia-sales-api", "/api/sales");

// Acquisition & Conversion
loadRoute("./acquisition/acquisition-api", "/api/acquisition");
loadRoute("./acquisition/acquisition-leads-api", "/api/acquisition/leads");
loadRoute("./conversion/deal-closer-api", "/api/conversion");

// Autonomous & Autopilot
loadRoute("./autonomous/sales-loop-api", "/api/autonomous-sales");
loadRoute("./autonomous/autonomous-api", "/api/autonomous");
loadRoute("./autopilot/autopilot-api", "/api/autopilot");

// Intelligence & Analytics
loadRoute("./intelligence/revenue-brain-api", "/api/revenue-brain");
loadRoute("./intelligence/hunter-api", "/api/intelligence");
loadRoute("./intelligence/intelligence-api", "/api/intelligence");

// Reports & Insights
loadRoute("./reports/revenue-briefing-api", "/api/briefing");
loadRoute("./revenue/intelligence-api", "/api/revenue/intelligence");

// Command Center & Executive
loadRoute("./command-center/executive-api", "/api/executive");
loadRoute("./command-center/executive-dashboard-api", "/api/command");
loadRoute("./command-center/revenue-dashboard-api", "/api/command");

// Chief of Staff
loadRoute("./chief-of-staff/chief-api", "/api/chief");

// Outreach & Engagement
loadRoute("./outreach/outreach-api", "/api/outreach");
loadRoute("./revenue/outreach/outreach-api", "/api/outreach");

// Cashflow & Finances
loadRoute("./cashflow/cashflow-api", "/api/cashflow");

// Revenue & Operations
loadRoute("./revenue/revenue-api", "/api/revenue");
loadRoute("./revenue/prospects/prospect-api", "/api/prospects");
loadRoute("./revenue/automation/automation-api", "/api/revenue/automation");
loadRoute("./revenue/acquisition/acquisition-api", "/api/acquisition/leads");
loadRoute("./revenue/conversion/conversion-api", "/api/conversion");
loadRoute("./revenue/proposals/proposal-api", "/api/proposals");
loadRoute("./revenue/operator/operator-api", "/api/operator");
loadRoute("./revenue/followup/followup-api", "/api/followup");

// Opportunities & Router
loadRoute("./opportunities/opportunity-api", "/api/opportunities");
loadRoute("./router/opportunity-router-api", "/api/router");

// Memory & Dashboard
loadRoute("./memory/memory-api", "/api/memory");
loadRoute("./dashboard/dashboard-api", "/api/dashboard");
loadRoute("./proposals/proposal-api", "/api/proposals");

// ============================================================
// HEALTH CHECK ENDPOINTS
// ============================================================

app.get("/api/health", (req, res) => {
  res.json({
    system: "Nia Capital OS",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node: process.version
  });
});

app.get("/api/watson/health", (req, res) => {
  res.json({
    status: "Watson Online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production"
  });
});

app.get("/api/system/health", (req, res) => {
  res.json({
    status: "online",
    system: "Nia Capital OS",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================================
// STATUS ENDPOINTS
// ============================================================

app.get("/api/status", (req, res) => {
  res.json({
    system: "Nia Capital OS",
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
    version: "1.0",
    environment: process.env.NODE_ENV || "production"
  });
});

app.get("/api/owner/funding/review/decisions", (req, res) => {
  try {
    const engine = require("./funding-engine/funding-review-decision-engine");
    const result = engine.buildDecisionQueue();

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_DECISION_QUEUE_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/funding/review/queue", (req, res) => {
  try {
    const prioritizer = require("./funding-engine/funding-review-prioritizer");
    const result = prioritizer.buildReviewQueue();

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_REVIEW_QUEUE_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/funding/review", (req, res) => {
  try {
    const ledger = require("./funding-engine/funding-review-ledger");
    const data = ledger.loadLedger();

    const entries = Array.isArray(data.entries) ? data.entries : [];

    return res.status(200).json({
      ok: true,
      organization: data.organization,
      entryCount: entries.length,
      entries,
      safety: {
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_REVIEW_LOAD_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/funding/opportunities", (req, res) => {
  try {
    const registry = require("./funding-engine/funding-opportunity-registry");
    const result = registry.loadRegistry();

    if (result.organization !== "House of Jazzu") {
      return res.status(500).json({
        ok: false,
        error: "REGISTRY_ORGANIZATION_MISMATCH"
      });
    }

    return res.status(200).json({
      ok: true,
      organization: result.organization,
      opportunityCount: result.opportunities.length,
      opportunities: result.opportunities,
      safety: {
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_OPPORTUNITY_REGISTRY_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/funding/decisions", (req, res) => {
  try {
    const ledger = require("./funding-engine/funding-decision-ledger");
    const result = ledger.loadLedger();

    if (result.organization !== "House of Jazzu") {
      return res.status(500).json({
        ok: false,
        error: "LEDGER_ORGANIZATION_MISMATCH"
      });
    }

    return res.status(200).json({
      ok: true,
      organization: result.organization,
      entryCount: result.entries.length,
      entries: result.entries,
      safety: {
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_DECISION_LEDGER_FAILED",
      message: err.message
    });
  }
});

app.post("/api/owner/funding/pipeline", async (req, res) => {
  try {
    const pipeline = require("./funding-engine/funding-pipeline");
    const body = req.body || {};
    const candidates = Array.isArray(body.candidates) ? body.candidates : [];

    const result = await pipeline.run(candidates);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_PIPELINE_FAILED",
      message: err.message
    });
  }
});

app.post("/api/owner/funding/collect", async (req, res) => {
  try {
    const collector = require("./funding-engine/funding-source-collector");
    const body = req.body || {};
    const candidates = Array.isArray(body.candidates) ? body.candidates : [];

    if (!candidates.length) {
      return res.status(400).json({
        ok: false,
        error: "FUNDING_CANDIDATES_REQUIRED"
      });
    }

    const invalid = candidates.find(
      x => !x || !x.name || !x.officialUrl
    );

    if (invalid) {
      return res.status(400).json({
        ok: false,
        error: "CANDIDATE_NAME_AND_OFFICIAL_URL_REQUIRED"
      });
    }

    const result = await collector.collect(candidates);

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_COLLECTION_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/funding/discovery", async (req, res) => {
  try {
    const engine = require("./funding-engine/funding-discovery-engine");
    const result = await engine.discover();

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_DISCOVERY_FAILED",
      message: err.message
    });
  }
});

app.post("/api/owner/funding/intake", (req, res) => {
  try {
    const intake = require("./funding-engine/verified-funding-intake");
    const body = req.body || {};
    const candidates = Array.isArray(body.candidates) ? body.candidates : [];

    if (!candidates.length) {
      return res.status(400).json({
        ok: false,
        error: "FUNDING_CANDIDATES_REQUIRED"
      });
    }

    const result = intake.intake(candidates);

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_INTAKE_FAILED",
      message: err.message
    });
  }
});

app.post("/api/owner/funding/analyze", (req, res) => {
  try {
    const engine = require("./funding-engine/house-of-jazzu-funding-engine");
    const opportunity = req.body || {};

    if (!opportunity.name && !opportunity.title) {
      return res.status(400).json({
        ok: false,
        error: "FUNDING_OPPORTUNITY_NAME_REQUIRED"
      });
    }

    const result = engine.analyze(opportunity);

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "FUNDING_ANALYSIS_FAILED",
      message: err.message
    });
  }
});

app.get("/api/owner/grant-registry", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const file = path.join(__dirname, "data/canonical-grant-registry.json");
    if (!fs.existsSync(file)) {
      return res.status(404).json({
        ok: false,
        error: "CANONICAL_GRANT_REGISTRY_MISSING"
      });
    }
    const registry = JSON.parse(fs.readFileSync(file, "utf8"));
    return res.status(200).json({
      ok: true,
      mode: "OWNER_REVIEW_ONLY",
      registryVersion: registry.registryVersion,
      canonicalOpportunityCount: registry.canonicalOpportunityCount,
      verifiedDraftCount: registry.verifiedDraftCount,
      quarantinedDraftCount: registry.quarantinedDraftCount,
      safety: {
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      },
      verified: registry.verified || [],
      quarantined: registry.quarantined || []
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "CANONICAL_GRANT_REGISTRY_READ_FAILED",
      message: err.message
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    system: "Nia Capital OS",
    deployment: "NIA-CAPITAL-OS",
    entrypoint: "server-watson.js",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    system: "Nia Capital OS",
    status: "running",
    version: "1.0",
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Nia Capital OS ONLINE`);
  console.log(`📍 Listening on port ${PORT}`);
  console.log(`🌍 http://0.0.0.0:${PORT}`);
  console.log(`⏰ Started at ${new Date().toISOString()}\n`);
});

module.exports = app;
