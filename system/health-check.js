module.exports = function healthCheck() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    components: {
      core: "ok",
      ui: "ok",
      memory: "ok"
    }
  };
};
