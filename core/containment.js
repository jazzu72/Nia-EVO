const fs = require("fs");
const flag = "/data/data/com.termux/files/home/nia-capital-os/system/CONTAINMENT";

module.exports = {
  enable() {
    fs.writeFileSync(flag, "1");
    return { mode: "containment_enabled" };
  },
  disable() {
    if (fs.existsSync(flag)) fs.unlinkSync(flag);
    return { mode: "containment_disabled" };
  },
  active() {
    return fs.existsSync(flag);
  }
};
