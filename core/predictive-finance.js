const fs = require("fs");
const path = require("path");

const LEDGER_PATH = path.join(process.env.HOME, ".nia-complete", "ledger.json");

function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return { transactions: [], balance: { available: 0, total: 0 } };
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
}

function movingAverage(values, window = 5) {
  if (values.length === 0) return 0;
  const recent = values.slice(-window);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

module.exports = {
  forecastRevenue(daysAhead = 30) {
    const ledger = loadLedger();
    const revTx = ledger.transactions.filter(t => t.type === "revenue");

    const dailyMap = {};
    revTx.forEach(t => {
      const day = t.timestamp.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    });

    const days = Object.keys(dailyMap).sort();
    const values = days.map(d => dailyMap[d]);

    const avg = movingAverage(values, 5);
    const forecastTotal = avg * daysAhead;

    return {
      avgDailyRevenue: avg,
      forecastDays: daysAhead,
      forecastTotal
    };
  }
};
