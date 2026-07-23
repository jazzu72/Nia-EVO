const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ status: "online", service: "Nia Capital OS" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

module.exports = app;
