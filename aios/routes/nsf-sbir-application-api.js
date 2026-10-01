const fs = require("fs");
const path = require("path");

module.exports = function registerNsfSbirApplication(app) {
  app.get("/api/owner/funding/nsf-sbir/application-package", (req, res) => {
    try {
      const file = path.join(
        process.cwd(),
        "data/funding/nsf-sbir-phase1-application-package.json"
      );

      const data = JSON.parse(fs.readFileSync(file, "utf8"));

      res.json({
        ok: true,
        mode: "OWNER_REVIEW_ONLY",
        package: data,
        readiness: {
          eligibilityVerified: Object.values(data.eligibilityChecks).every(v => v === true),
          applicationReady: false,
          submissionReady: false
        },
        safety: data.gates
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });
};
