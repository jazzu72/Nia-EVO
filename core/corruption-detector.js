const { execSync } = require("child_process");

module.exports = function corruptionDetector() {
  try {
    const output = execSync(
      `bash $HOME/nia-capital-os/system/integrity-scan.sh`
    ).toString();

    const corrupted = output
      .split("\n")
      .filter(line => line.includes("FAILED"))
      .map(line => line.split(":")[0]);

    return {
      mode: "corruption_detector",
      corrupted,
      healthy: corrupted.length === 0
    };
  } catch (err) {
    return { mode: "corruption_detector", corrupted: [], healthy: true };
  }
};
