const https = require("https");
const fs = require("fs");
const path = require("path");

const PROFILE_PATH = path.join(
  __dirname, "..", "data", "funding", "house-of-jazzu-profile.json"
);

function loadProfile() {
  return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "Nia-Capital-OS/1.0" }
    }, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP_${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("INVALID_JSON_RESPONSE"));
        }
      });
    }).on("error", reject);
  });
}

function buildSearchPlan() {
  const profile = loadProfile();

  return profile.targetSponsors.corporateProgramKeywords.map(keyword => ({
    query: keyword,
    geography: profile.targetSponsors.geographyPriority,
    industries: profile.targetSponsors.industries,
    impactThemes: profile.impactThemes
  }));
}

async function discover() {
  const profile = loadProfile();

  return {
    organization: profile.organization.name,
    mode: profile.ownerControls.mode,
    generatedAt: new Date().toISOString(),
    searchPlan: buildSearchPlan(),
    sourcePolicy: {
      requireOfficialUrl: true,
      requireEligibilityEvidence: true,
      requireDeadlineEvidence: true,
      requireFundingAmountEvidence: true,
      neverInventEligibility: true,
      neverInventDeadlines: true,
      neverInventFundingAmounts: true
    },
    safety: {
      submissionAllowed: false,
      signingAllowed: false,
      financialExecutionAllowed: false,
      moneyMovementAllowed: false,
      automaticApprovalAllowed: false,
      ownerApprovalRequired: true,
      ownerSignatureRequired: true
    }
  };
}

module.exports = {
  loadProfile,
  buildSearchPlan,
  discover,
  fetchJson
};
