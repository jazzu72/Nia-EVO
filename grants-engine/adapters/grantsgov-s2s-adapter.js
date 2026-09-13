const https = require("https");

const CONFIG = Object.freeze({
  mode: process.env.GRANTS_GOV_MODE || "TRAINING",
  trainingEndpoint:
    "https://trainingws.grants.gov/grantsws-applicant/services/v2/ApplicantWebServicesSoapPort",
  productionEndpoint:
    "https://ws07.grants.gov/grantsws-applicant/services/v2/ApplicantWebServicesSoapPort"
});

function getConfig() {
  const productionEnabled =
    CONFIG.mode === "PRODUCTION" &&
    process.env.GRANTS_GOV_PRODUCTION_ENABLED === "true";

  return {
    mode: productionEnabled ? "PRODUCTION" : "TRAINING",
    endpoint: productionEnabled
      ? CONFIG.productionEndpoint
      : CONFIG.trainingEndpoint,
    networkSubmissionEnabled: false
  };
}

async function submitApplication() {
  const config = getConfig();

  throw new Error(
    `Grants.gov adapter is ${config.mode}-configured but network submission is intentionally disabled until S2S package, certificate/authentication, and training validation are complete.`
  );
}

function status() {
  return {
    provider: "grants.gov",
    protocol: "Applicant S2S V2.0",
    ...getConfig(),
    capabilities: {
      opportunityDiscovery: true,
      applicationSubmission: false,
      submissionVerification: false
    }
  };
}

module.exports = {
  status,
  submitApplication
};
