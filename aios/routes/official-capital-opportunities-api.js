const fs = require("fs");
const path = require("path");

module.exports = function registerOfficialCapitalOpportunities(app) {
  app.get("/api/owner/funding/official-capital-opportunities", (req, res) => {
    try {
      const file = path.join(
        process.cwd(),
        "data/funding/official-capital-opportunities.json"
      );

      const data = JSON.parse(fs.readFileSync(file, "utf8"));

      res.json({
        ok: true,
        mode: data.mode,
        version: data.version,
        organization: data.organization,
        operatingState: data.operatingState,
        opportunities: data.opportunities,
        summary: {
          total: data.opportunities.length,
          open: data.opportunities.filter(x => x.status === "OPEN").length,
          highPotential: data.opportunities.filter(x => x.fit === "HIGH_POTENTIAL").length,
          technicalReviewRequired: data.opportunities.filter(
            x => x.fit === "REQUIRES_TECHNICAL_SCOPE_REVIEW"
          ).length,
          applicationReady: data.opportunities.filter(x => x.applicationReady).length,
          submissionReady: data.opportunities.filter(x => x.submissionReady).length
        },
        safety: data.ownerControls
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  });
};
