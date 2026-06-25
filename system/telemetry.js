module.exports = function telemetry(event, data = {}) {
  console.log("[NIA TELEMETRY]", { event, ...data, ts: new Date().toISOString() });
};
