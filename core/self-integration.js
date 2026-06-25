const fs = require("fs");
const path = require("path");

module.exports = function selfIntegration(generated) {
  const base = path.join(__dirname, "generated");

  if (!fs.existsSync(base)) fs.mkdirSync(base);

  generated.generatedModules.forEach(mod => {
    const filePath = path.join(base, `${mod.name}.js`);
    fs.writeFileSync(filePath, mod.code);
  });

  return {
    mode: "self_integration",
    installed: generated.generatedModules.map(m => m.name),
    status: "success"
  };
};
