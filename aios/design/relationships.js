/*
  NIA RELATIONSHIP GRAPH — who's who in House of Jazzu's orbit
  Additive. Used to enrich drafts and answers.
*/

const fs = require("fs");
const FILE = process.env.RELATIONSHIPS_FILE || "config/relationships.json";

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch (e) { return { people: [], organizations: [], relationships: [] }; }
}

function lookupOrganization(name) {
  if (!name) return null;
  const db = load();
  const lower = name.toLowerCase();
  return (db.organizations || []).find(function (o) {
    return (o.name || "").toLowerCase().includes(lower) || lower.includes((o.name || "").toLowerCase());
  }) || null;
}

function buildRelationshipBlock(opportunities) {
  if (!Array.isArray(opportunities) || !opportunities.length) return "";
  const db = load();
  if (!db.organizations || !db.organizations.length) return "";

  const hits = [];
  opportunities.slice(0, 10).forEach(function (o) {
    const text = (o.organization || "") + " " + (o.title || "") + " " + (o.source || "");
    (db.organizations || []).forEach(function (org) {
      if (text.toLowerCase().includes((org.name || "").toLowerCase())) {
        hits.push("- " + org.name + " (" + org.type + "): " + (org.notes || ""));
      }
    });
  });

  if (!hits.length) return "";
  return "PRIOR RELATIONSHIPS DETECTED:\n" + hits.slice(0, 8).join("\n");
}

module.exports = { load, lookupOrganization, buildRelationshipBlock };
