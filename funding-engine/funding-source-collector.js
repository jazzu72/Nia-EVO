const https = require("https");
const { URL } = require("url");
const adapter = require("./official-source-adapter");
const discovery = require("./funding-discovery-engine");

function fetchPage(url) {
  return adapter.fetchText(url, 15000);
}

function extractEvidence(html, terms) {
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lower = text.toLowerCase();

  return terms
    .filter(term => lower.includes(term.toLowerCase()))
    .map(term => {
      const i = lower.indexOf(term.toLowerCase());
      return text.slice(Math.max(0, i - 120), i + 300);
    });
}

function collectCandidate(candidate, page) {
  const eligibilityEvidence = extractEvidence(page.body, [
    "eligibility",
    "eligible",
    "small business",
    "startup"
  ]);

  const deadlineEvidence = extractEvidence(page.body, [
    "deadline",
    "application period",
    "applications due",
    "apply by"
  ]);

  const fundingAmountEvidence = extractEvidence(page.body, [
    "$",
    "award",
    "funding",
    "grant amount",
    "prize"
  ]);

  const source = adapter.buildSourceRecord(candidate.officialUrl);

  return {
    name: candidate.name,
    source: source.source,
    officialUrl: source.officialUrl,
    eligibilityEvidence: eligibilityEvidence.join(" | "),
    deadlineEvidence: deadlineEvidence.join(" | "),
    fundingAmountEvidence: fundingAmountEvidence.join(" | "),
    verificationStatus:
      eligibilityEvidence.length &&
      deadlineEvidence.length &&
      fundingAmountEvidence.length
        ? "EVIDENCE_FOUND_REQUIRES_REVIEW"
        : "INSUFFICIENT_EVIDENCE",
    ownerReviewOnly: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true
  };
}

async function collect(candidates) {
  const profile = discovery.loadProfile();
  const results = [];

  for (const candidate of candidates) {
    try {
      const page = await fetchPage(candidate.officialUrl);
      const result = collectCandidate(candidate, page);

      results.push({
        ...result,
        httpStatus: page.statusCode,
        contentType: page.contentType
      });
    } catch (err) {
      results.push({
        name: candidate.name || null,
        source: null,
        officialUrl: candidate.officialUrl || null,
        verificationStatus: "SOURCE_FETCH_FAILED",
        error: err.message,
        ownerReviewOnly: true,
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      });
    }
  }

  return {
    organization: profile.organization.name,
    mode: profile.ownerControls.mode,
    candidateCount: results.length,
    evidenceFoundCount: results.filter(
      x => x.verificationStatus === "EVIDENCE_FOUND_REQUIRES_REVIEW"
    ).length,
    results
  };
}

module.exports = {
  collect,
  collectCandidate,
  extractEvidence
};
