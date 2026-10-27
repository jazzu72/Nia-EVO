"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB = path.resolve(
  process.env.NIA_CAPITAL_RADAR_DB ||
  path.join(__dirname, "../runtime/house-capital-radar.json")
);

const DEFAULT_SOURCES = [
  {
    id: "grants_gov",
    name: "Grants.gov",
    type: "grant",
    url: "https://grants.gov/search-results-page",
    status: "manual_review"
  },
  {
    id: "virginia_judicial_sales",
    name: "Virginia Judicial Sales / Foreclosure Notices",
    type: "real_estate",
    url: "https://www.courts.state.va.us/",
    status: "manual_review"
  },
  {
    id: "norfolk_city_auctions",
    name: "City of Norfolk Auctions / Surplus",
    type: "real_estate",
    url: "https://www.norfolk.gov/",
    status: "manual_review"
  },
  {
    id: "hud_homes",
    name: "HUD Home Store",
    type: "real_estate",
    url: "https://hudhomeshs.gov/",
    status: "manual_review"
  }
];

function load() {
  if (!fs.existsSync(DB)) {
    save({
      version: 1,
      sources: DEFAULT_SOURCES,
      opportunities: []
    });
  }
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function save(data) {
  fs.mkdirSync(path.dirname(DB), { recursive: true });
  const temp = DB + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temp, DB);
}

function run() {
  const [command, ...args] = process.argv.slice(2);
  const data = load();

  if (command === "sources") {
    console.table(data.sources.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      status: s.status,
      url: s.url
    })));
    return;
  }

  if (command === "add") {
    const [type, title, sourceId, url, amount, notes] = args;

    if (!["grant", "real_estate"].includes(type)) {
      throw new Error("Type must be grant or real_estate");
    }

    const opportunity = {
      id: crypto.randomUUID().slice(0, 8),
      type,
      title,
      sourceId: sourceId || "",
      url: url || "",
      estimatedValue: Number(amount) || 0,
      notes: notes || "",
      status: "new",
      ownerApprovalRequired: true,
      externalExecutionAllowed: false,
      created_at: new Date().toISOString()
    };

    data.opportunities.push(opportunity);
    save(data);

    console.log("Saved opportunity:", opportunity.id);
    console.log("Title:", opportunity.title);
    console.log("Next step: Review source, eligibility, deadline, and required evidence.");
    return;
  }

  if (command === "list") {
    console.table(data.opportunities.map(o => ({
      id: o.id,
      type: o.type,
      title: o.title,
      source: o.sourceId,
      value: o.estimatedValue,
      status: o.status
    })));
    return;
  }

  if (command === "score") {
    const id = args[0];
    const opportunity = data.opportunities.find(o => o.id === id);

    if (!opportunity) throw new Error("Opportunity not found: " + id);

    let score = 0;
    const missing = [];

    if (opportunity.url) score += 15;
    else missing.push("source URL");

    if (opportunity.notes) score += 10;
    else missing.push("research notes");

    if (opportunity.type === "grant") {
      if (opportunity.eligibility) score += 25;
      else missing.push("eligibility determination");

      if (opportunity.deadline) score += 25;
      else missing.push("deadline");

      if (opportunity.requiredDocuments) score += 15;
      else missing.push("required documents");
    }

    if (opportunity.type === "real_estate") {
      if (opportunity.address) score += 15;
      else missing.push("property address");

      if (opportunity.estimatedValue) score += 20;
      else missing.push("estimated value");

      if (opportunity.repairEstimate !== undefined) score += 20;
      else missing.push("repair estimate");

      if (opportunity.maxOffer) score += 20;
      else missing.push("maximum offer");
    }

    opportunity.readinessScore = score;
    opportunity.missingEvidence = missing;
    opportunity.updated_at = new Date().toISOString();

    save(data);

    console.log("Opportunity:", opportunity.title);
    console.log("Readiness score:", score + "/100");
    console.log("Missing evidence:", missing.length ? missing.join(", ") : "none");
    return;
  }
  if (command === "export-to-opportunities") {
    const fs = require("fs");
    const target = path.resolve(__dirname, "../data/opportunities.json");

    let existing = [];

    if (fs.existsSync(target)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(target, "utf8"));
        if (Array.isArray(parsed)) existing = parsed;
      } catch (error) {
        throw new Error("Cannot read data/opportunities.json: " + error.message);
      }
    }

    const existingIds = new Set(
      existing
        .map(item => item.radarId)
        .filter(Boolean)
    );

    let added = 0;

    data.opportunities.forEach(opportunity => {
      if (existingIds.has(opportunity.id)) return;

      existing.push({
        radarId: opportunity.id,
        company: opportunity.title || "Unknown opportunity",
        source: opportunity.sourceId || opportunity.type || "capital_radar",
        problem: opportunity.notes || "",
        value: Number(opportunity.estimatedValue || 0),
        status: "new",
        created: opportunity.created_at || new Date().toISOString(),
        type: opportunity.type,
        url: opportunity.url || "",
        ownerApprovalRequired: true,
        externalExecutionAllowed: false
      });

      added += 1;
    });

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(existing, null, 2));

    console.log("Exported " + added + " new Capital Radar opportunities.");
    console.log("Total opportunities in data/opportunities.json: " + existing.length);
    return;
  }

  if (command === "export-to-revenue-deals") {
    const fs = require("fs");
    const target = path.resolve(__dirname, "../data/revenue/deals.json");

    let deals = [];

    if (fs.existsSync(target)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(target, "utf8"));
        if (Array.isArray(parsed)) deals = parsed;
      } catch (error) {
        throw new Error("Cannot read data/revenue/deals.json: " + error.message);
      }
    }

    const existingRadarIds = new Set(
      deals
        .map(deal => deal.radarId)
        .filter(Boolean)
    );

    let added = 0;

    data.opportunities.forEach(opportunity => {
      if (existingRadarIds.has(opportunity.id)) return;

      deals.push({
        radarId: opportunity.id,
        company: opportunity.title || "Unknown opportunity",
        contact: "Owner",
        service: opportunity.type === "grant"
          ? "Grant Opportunity"
          : opportunity.type === "real_estate"
            ? "Real Estate Opportunity"
            : "Capital Opportunity",
        value: Number(opportunity.estimatedValue || 0),
        stage: "new",
        created: opportunity.created_at || new Date().toISOString(),
        type: opportunity.type,
        url: opportunity.url || "",
        ownerApprovalRequired: true,
        externalExecutionAllowed: false
      });

      added += 1;
    });

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(deals, null, 2));

    console.log("Exported " + added + " new Capital Radar opportunities to revenue deals.");
    console.log("Total revenue deals: " + deals.length);
    return;
  }  if (command === "briefing") {
    const grants = data.opportunities.filter(o => o.type === "grant");
    const properties = data.opportunities.filter(o => o.type === "real_estate");

    console.log("NIA CAPITAL RADAR BRIEFING");
    console.log("Grants tracked:", grants.length);
    console.log("Properties tracked:", properties.length);
    console.log("");

    console.log("TOP GRANT OPPORTUNITIES");
    grants
      .slice()
      .sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0))
      .slice(0, 5)
      .forEach(o => {
        console.log("- " + o.title);
        console.log("  Readiness: " + (o.readinessScore || 0) + "/100");
        console.log("  Deadline: " + (o.deadline || "Unknown"));
        console.log("  Missing: " + ((o.missingEvidence || []).join(", ") || "none"));
      });

    console.log("");
    console.log("TOP REAL-ESTATE OPPORTUNITIES");
    properties
      .slice()
      .sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0))
      .slice(0, 5)
      .forEach(o => {
        console.log("- " + o.title);
        console.log("  Readiness: " + (o.readinessScore || 0) + "/100");
        console.log("  Estimated value: $" + (o.estimatedValue || 0));
        console.log("  Max offer: " + (o.maxOffer ? "$" + o.maxOffer : "Not set"));
        console.log("  Missing: " + ((o.missingEvidence || []).join(", ") || "none"));
      });

    console.log("");
    console.log("NIA prepares and scores opportunities. Owner approval is required for submissions, offers, and bids.");
    return;
  }

  console.log("NIA HOUSE CAPITAL RADAR");
  console.log("Commands:");
  console.log("  node tools/house-capital-radar.js sources");
  console.log('  node tools/house-capital-radar.js add grant "Grant title" grants_gov "https://..." 25000 "notes"');
  console.log('  node tools/house-capital-radar.js add real_estate "Property lead" source_id "https://..." 180000 "notes"');
  console.log("  node tools/house-capital-radar.js list");
  console.log("  node tools/house-capital-radar.js score ID");
  console.log("  node tools/house-capital-radar.js briefing");
}

try {
  run();
} catch (error) {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
}
