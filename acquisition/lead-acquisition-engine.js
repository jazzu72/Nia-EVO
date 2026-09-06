/*
 * NIA LEAD ACQUISITION ORCHESTRATOR
 *
 * Discovery layer for NIA.
 *
 * This module discovers candidate opportunities and sends
 * them to the canonical revenue acquisition engine.
 *
 * IMPORTANT:
 *   This module does NOT own prospect persistence.
 *   revenue/acquisition/acquisition-engine.js does.
 */

const acquisition = require("../revenue/acquisition/acquisition-engine");

// --------------------------------------------------
// DISCOVERY
// --------------------------------------------------

function generateTargets() {
  return [
    {
      company: "Norfolk Restaurant",
      industry: "Food Service",
      problem: "Needs customer automation",
      employees: 20,
      value: 5000,
      source: "nia-discovery"
    },

    {
      company: "Hampton Roads Contractor",
      industry: "Construction",
      problem: "Needs workflow automation",
      employees: 15,
      value: 7500,
      source: "nia-discovery"
    },

    {
      company: "Local Medical Practice",
      industry: "Healthcare",
      problem: "Needs appointment automation",
      employees: 10,
      value: 5000,
      source: "nia-discovery"
    }
  ];
}

// --------------------------------------------------
// ACQUISITION
// --------------------------------------------------

function acquire() {
  const targets = generateTargets();

  const results = targets.map(target =>
    acquisition.addProspect(target)
  );

  const created =
    results.filter(
      result => result.created === true
    );

  const existing =
    results.filter(
      result => result.duplicate === true
    );

  const hot =
    results.filter(
      result => result.priority === "HOT"
    );

  const warm =
    results.filter(
      result => result.priority === "WARM"
    );

  const cold =
    results.filter(
      result => result.priority === "COLD"
    );

  return {
    discovered: targets.length,

    created: created.length,

    existing: existing.length,

    hot: hot.length,

    warm: warm.length,

    cold: cold.length,

    leads: results,

    timestamp:
      new Date().toISOString()
  };
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------


// Canonical compatibility methods.
// These preserve the existing API contract without creating
// another acquisition engine.

function stats() {
    const targets = generateTargets();
    return {
        ok: true,
        total: Array.isArray(targets) ? targets.length : 0,
        targets: Array.isArray(targets) ? targets : []
    };
}

function topProspects() {
    const targets = generateTargets();

    if (!Array.isArray(targets)) {
        return [];
    }

    return targets
        .slice()
        .sort((a, b) => {
            const as = Number(a.score || a.priorityScore || 0);
            const bs = Number(b.score || b.priorityScore || 0);
            return bs - as;
        });
}

module.exports = {
  acquire,
  generateTargets,
  stats,
  topProspects
};

// Money Munchkins pilot — verified family leads only.
// Never fabricate contacts; candidates require explicit human/parent consent.
function getMoneyMunchkinsPilotTarget() {
  return {
    product: "money-munchkins-quantum-odyssey",
    cohort: "pilot-10",
    target: 10,
    qualification: ["parentGuardian", "K-3", "consentRequired"],
    funnel: ["lead","interest","signup","pilotCohort","activation","missionComplete","retained7d","paid"]
  };
}

module.exports.getMoneyMunchkinsPilotTarget = getMoneyMunchkinsPilotTarget;
