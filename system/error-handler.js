module.exports = function errorHandler(err, context = {}) {
  console.error("[NIA ERROR]", { err: err.message || err, context });
};
