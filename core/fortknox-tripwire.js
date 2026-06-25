const { execSync } = require("child_process");

module.exports = function fortKnoxTripwire() {
  const output = execSync(
    `bash $HOME/nia-capital-os/system/fortknox-verify.sh`
  ).toString();

  const tampered = output
    .split("\n")
    .filter(line => line.includes("FAILED"))
    .map(line => line.split(":")[0]);

  return {
    mode: "fort_knox_tripwire",
    tampered,
    safe: tampered.length === 0
  };
};
