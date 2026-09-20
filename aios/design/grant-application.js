/*
  NIA GRANT APPLICATION GENERATOR
  Produces a COMPLETE grant application ready for owner signature.
  Every section filled. Every unknown marked [TO BE CONFIRMED].
  No submission without owner signature. No exceptions.
*/

const fs = require("fs");
const path = require("path");
const llm = require("../../tools/llm");

const OUT_DIR = "runtime/applications";

function ensure() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Standard grant application sections — matches most funders
const SECTIONS = [
  { key: "organization_overview", title: "Organization Overview", words: 150,
    prompt: "Describe House of Jazzu: who we are, what we do, where we operate. Evidence-only." },
  { key: "executive_summary", title: "Executive Summary", words: 200,
    prompt: "Summarize the project in 2 paragraphs. What we'll build, who benefits, expected outcome." },
  { key: "problem_statement", title: "Problem Statement", words: 250,
    prompt: "What problem does this project solve? Cite the specific grant program focus area." },
  { key: "project_description", title: "Project Description", words: 400,
    prompt: "Detailed description of the project. What will be built/delivered. Timeline. Deliverables." },
  { key: "innovation", title: "Innovation & Approach", words: 250,
    prompt: "What is novel about this approach? How does it differ from existing solutions?" },
  { key: "business_need", title: "Commercialization & Business Need", words: 200,
    prompt: "Market need. Who will use this. Revenue model. Traction to date." },
  { key: "milestones", title: "Milestones & Timeline", words: 200,
    prompt: "Key milestones by quarter. Concrete deliverables. Success metrics." },
  { key: "budget_narrative", title: "Budget Narrative", words: 200,
    prompt: "How funds will be used. Categories: personnel, equipment, materials, travel, other." },
  { key: "team", title: "Team & Capabilities", words: 150,
    prompt: "Who will execute this. Relevant experience. Advisory support." },
  { key: "impact", title: "Expected Impact", words: 200,
    prompt: "Measurable outcomes. Jobs created, revenue generated, people served." },
];

function applicationPrompt(opp, section) {
  return [
    "You are drafting section \"" + section.title + "\" of a grant application for House of Jazzu.",
    "",
    "CRITICAL RULES:",
    "- Evidence-only. Do NOT invent facts, numbers, or timelines.",
    "- If information is missing, write [TO BE CONFIRMED: specific detail needed].",
    "- Do not use generic AI language (cutting-edge, revolutionary, game-changing).",
    "- Be specific, direct, professional. Government grant reviewers read hundreds of these.",
    "- Target length: " + section.words + " words.",
    "- Plain text, no markdown headers. Just clean paragraphs.",
    "",
    "OPPORTUNITY:",
    "Title: " + (opp.organization || opp.title || "Untitled"),
    "Funder: " + (opp.source || "Unknown"),
    "Lane: " + (opp.lane || "grants"),
    "Amount: $" + (opp.amount || 0).toLocaleString(),
    "Program focus: " + (opp.description || "[TO BE CONFIRMED: program focus]"),
    "",
    "SECTION TO WRITE: " + section.title,
    section.prompt,
  ].join("\n");
}

function fallbackSection(opp, section) {
  return "[" + section.title.toUpperCase() + "]\n\n" +
    "This section addresses " + (opp.organization || opp.title) + " under the " +
    (opp.source || "grant") + " program. Estimated value: $" + (opp.amount || 0).toLocaleString() + ".\n\n" +
    "[TO BE CONFIRMED: " + section.prompt.slice(0, 80) + "]\n\n" +
    "House of Jazzu operates NIA Capital Observatory, an autonomous capital intelligence system " +
    "that discovers, verifies, and prepares funding opportunities with owner approval required " +
    "for every submission.";
}

async function generateSection(opp, section) {
  const prompt = applicationPrompt(opp, section);
  const result = await llm.generate(prompt, function () { return fallbackSection(opp, section); });
  return {
    key: section.key,
    title: section.title,
    generator: result.generator,
    word_count: result.text.split(/\s+/).length,
    content: result.text.trim(),
  };
}

async function generateApplication(opp) {
  ensure();

  const application_id = "APP-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const sections = [];

  for (const section of SECTIONS) {
    const s = await generateSection(opp, section);
    sections.push(s);
  }

  const totalWords = sections.reduce(function (a, s) { return a + s.word_count; }, 0);

  const application = {
    application_id: application_id,
    opportunity: {
      id: opp.id,
      name: opp.organization || opp.title || "Untitled",
      funder: opp.source || "Unknown",
      lane: opp.lane || "grants",
      amount: opp.amount || 0,
      confidence: Math.round((opp.probability || 0) * 100),
    },
    status: "DRAFT_READY_FOR_OWNER",
    sections: sections,
    total_word_count: totalWords,
    created_at: new Date().toISOString(),
    owner_action_required: "REVIEW_AND_SIGN",
    safety: {
      submission_blocked: true,
      requires_owner_signature: true,
      requires_owner_approval: true,
    },
  };

  const file = path.join(OUT_DIR, application_id + ".json");
  fs.writeFileSync(file, JSON.stringify(application, null, 2));

  return application;
}

function listApplications() {
  ensure();
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs.readdirSync(OUT_DIR)
    .filter(function (f) { return f.endsWith(".json"); })
    .map(function (f) {
      try {
        const a = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
        return {
          application_id: a.application_id,
          opportunity: a.opportunity.name,
          funder: a.opportunity.funder,
          amount: a.opportunity.amount,
          status: a.status,
          words: a.total_word_count,
          created_at: a.created_at,
        };
      } catch (e) { return null; }
    })
    .filter(Boolean)
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function loadApplication(id) {
  const file = path.join(OUT_DIR, id + ".json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function signApplication(id, ownerNote) {
  const app = loadApplication(id);
  if (!app) return null;
  app.status = "OWNER_SIGNED";
  app.signed_at = new Date().toISOString();
  app.owner_note = ownerNote || null;
  app.safety.submission_blocked = false;
  app.safety.ready_for_submission = true;
  fs.writeFileSync(path.join(OUT_DIR, id + ".json"), JSON.stringify(app, null, 2));
  return app;
}

function toSubmissionText(app) {
  const lines = [
    "═══════════════════════════════════════════════════",
    "GRANT APPLICATION — " + app.opportunity.name,
    "Funder: " + app.opportunity.funder,
    "Amount requested: $" + app.opportunity.amount.toLocaleString(),
    "Application ID: " + app.application_id,
    "Status: " + app.status,
    "Prepared: " + app.created_at,
    app.signed_at ? "Signed: " + app.signed_at : "",
    "═══════════════════════════════════════════════════",
    "",
  ].filter(Boolean);

  app.sections.forEach(function (s) {
    lines.push("── " + s.title.toUpperCase() + " ──");
    lines.push("");
    lines.push(s.content);
    lines.push("");
  });

  lines.push("═══════════════════════════════════════════════════");
  lines.push("END OF APPLICATION");
  lines.push("═══════════════════════════════════════════════════");

  return lines.join("\n");
}

module.exports = { generateApplication, listApplications, loadApplication, signApplication, toSubmissionText, SECTIONS };
