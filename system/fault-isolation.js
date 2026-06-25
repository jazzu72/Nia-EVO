const errorHandler = require("./error-handler");
const telemetry = require("./telemetry");

function isolate(name, fn) {
  return async function isolated(...args) {
    try {
      return await fn(...args);
    } catch (err) {
      errorHandler(err, { component: name });
      telemetry("fault_isolated", { component: name, error: err.message || String(err) });
      return null;
    }
  };
}

module.exports = { isolate };
