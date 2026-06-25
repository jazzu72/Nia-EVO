const { execSync } = require("child_process");

module.exports = function systemRebuilder(file) {
  const moduleName = file.replace(".js", "");

  execSync(
    `bash $HOME/nia-capital-os/system/auto-builder.sh build ${moduleName}`
  );

  execSync(
    `bash $HOME/nia-capital-os/system/auto-builder.sh integrate`
  );

  return {
    mode: "system_rebuilder",
    rebuilt: file
  };
};
