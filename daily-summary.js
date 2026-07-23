const { loadMemory } = require('./brain-core.js');
const { getForecast } = require('./revenue-engine.js');
const { exec } = require('child_process');

async function sendDailySummary() {
  const mem = loadMemory();
  const forecast = getForecast();

  const summary = `
📊 Daily Summary
Deals: ${forecast.deals}
Revenue: $${forecast.revenue}
Forecast: $${forecast.projectedMonthly}
Target: $${forecast.target}
  `.trim();

  console.log(`📊 Sending daily summary: ${summary}`);
  exec(`./notify.sh "${summary}"`);
}

// Run at 9 AM every day
const now = new Date();
const nextRun = new Date(now);
nextRun.setHours(9, 0, 0, 0);
if (now > nextRun) nextRun.setDate(nextRun.getDate() + 1);
const delay = nextRun - now;
setTimeout(() => {
  sendDailySummary();
  setInterval(sendDailySummary, 24 * 60 * 60 * 1000);
}, delay);
