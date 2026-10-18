const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const ROOT = path.join(__dirname, "..");

function readJSON(file, fallback = []) {
try {
return JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
return fallback;
}
}

function countRecords(value) {
return Array.isArray(value) ? value.length : 0;
}

router.get("/overview", (req, res) => {
const opportunities = readJSON(path.join(ROOT, "data/opportunities.json"));
const revenue = readJSON(path.join(ROOT, "data/revenue.json"));
const deals = readJSON(path.join(ROOT, "nia-deal-pipeline.json"));
const investorPackages = readJSON(path.join(ROOT, "nia-investor-packages.json"));

const acquisitionLeads = readJSON(
path.join(ROOT, "data/revenue/prospects.json")
);
const realEstateLeads = readJSON(
path.join(ROOT, "data/real-estate-leads.json")
);
const aiProspects = readJSON(
path.join(ROOT, "data/ai-prospects.json")
);

const validDeals = Array.isArray(deals) ? deals : [];
const validOpportunities = Array.isArray(opportunities) ? opportunities : [];

res.json({
system: "Nia Capital OS Online",
opportunities: validOpportunities.length +
validDeals.filter(d => d && typeof d.property === "string" && d.property.trim()).length,
leads: countRecords(acquisitionLeads),
realEstateLeadRecords: countRecords(realEstateLeads),
aiProspectRecords: countRecords(aiProspects),
dealsInPipeline: validDeals.length,
investorPackages: countRecords(investorPackages),
recordedRevenueEntries: countRecords(revenue),
timestamp: new Date().toISOString()
});
});

module.exports = router;
