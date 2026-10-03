const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const ENGINE_DEFINITIONS = {
    capital: [
        "intelligence/capital-engine.js",
        "capital-decision-engine.js",
        "funding-engine/capital-radar-live.js"
    ],

    revenue: [
        "revenue/revenue-engine.js",
        "intelligence/revenue-engine.js",
        "modules/revenue/services/revenue-engine.js",
        "modules/revenue-engine/routes/index.js"
    ],

    acquisition: [
        "acquisition/acquisition-engine.js",
        "acquisition/lead-acquisition-engine.js",
        "modules/acquisition/services/acquisition-engine.js"
    ],

    intelligence: [
        "intelligence/intelligence-api.js",
        "intelligence/opportunity-hunter.js",
        "intelligence/lead-scoring.js"
    ],

    operations: [
        "operations/operations-engine.js",
        "core/tasks.js",
        "core/tools.js"
    ],

    automation: [
        "automation/automation-engine.js",
        "autopilot/revenue-autopilot.js",
        "ceo/autonomous-loop.js"
    ],

    real_estate: [
        "modules/realestate/realestate-engine.js",
        "hunter/realestate/realestate-hunter.js"
    ],

    ip_assets: [
        "documents/document-engine.js"
    ],

    communications: [
        "integrations/outreach-engine.js",
        "outreach/outreach-engine.js",
        "outreach/outreach-execution-engine.js"
    ],

    products: [
        "products/money-munchkins-2",
        "products/money-munchkins-quantum-odyssey"
    ],

    memory: [
        "memory/memory-engine.js",
        "memory/nia-memory.js"
    ],

    governance: [
        "aios/approvals/approval-api.js",
        "aios/approvals/approval-ledger.js",
        "aios/guardrails/decision-gate.js"
    ]
};

function exists(relativePath) {
    return fs.existsSync(path.join(ROOT, relativePath));
}

function inspect(name) {
    const candidates = ENGINE_DEFINITIONS[name] || [];

    const found = candidates.filter(exists);

    return {
        name,
        registered: candidates.length > 0,
        healthy: found.length > 0,
        implementations: found,
        missing: candidates.filter(file => !exists(file))
    };
}

function inspectAll() {
    return Object.keys(ENGINE_DEFINITIONS).map(inspect);
}

function summary() {
    const engines = inspectAll();

    return {
        total: engines.length,
        healthy: engines.filter(e => e.healthy).length,
        unavailable: engines.filter(e => !e.healthy).length,
        engines
    };
}

module.exports = {
    ENGINE_DEFINITIONS,
    inspect,
    inspectAll,
    summary
};
