module.exports = function watchdog(lastCycleTimestamp) {
  const now = Date.now();
  if (!lastCycleTimestamp) return { status: "unknown" };

  const diff = now - lastCycleTimestamp;
  return {
    status: diff > 60000 ? "stalled" : "healthy",
    lastCycleMsAgo: diff
  };
};
