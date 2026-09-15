#!/usr/bin/env node
// NIA CLI bridge — invoked when `node .` runs from the project dir.
// Delegates to the ~/bin/nia script if present, else prints help.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const niaCli = path.join(os.homedir(), "bin", "nia");
const args = process.argv.slice(2);

if (fs.existsSync(niaCli)) {
  const child = spawn(niaCli, args, { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code || 0));
} else {
  console.log("NIA CLI not installed.");
  console.log("");
  console.log("Create it with:");
  console.log("  cat > ~/bin/nia << 'EOF'");
  console.log("  ... (see /api/nia/chat endpoint) ...");
  console.log("  EOF");
  console.log("");
  console.log("Or use the API directly:");
  console.log("  curl -X POST http://127.0.0.1:3000/api/nia/chat \\");
  console.log("    -H \"Authorization: Bearer $(cat ~/.nia-owner-token)\" \\");
  console.log("    -H \"Content-Type: application/json\" \\");
  console.log("    -d '{\"message\":\"hello\"}'");
  process.exit(1);
}
