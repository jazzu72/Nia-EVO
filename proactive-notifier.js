const { exec } = require('child_process');

function speak(text) {
  exec(`termux-tts-speak "${text}"`);
  console.log(`🗣️ Jarvis: ${text}`);
}

function checkAndReport() {
  exec('curl http://localhost:3000/api/business/dashboard', (err, out) => {
    try {
      const data = JSON.parse(out);
      if (data.newLeads > 0) {
        speak(`You have ${data.newLeads} new leads.`);
      }
      if (data.outstandingInvoices > 0) {
        speak(`${data.outstandingInvoices} outstanding invoices.`);
      }
    } catch (e) {
      console.error('Dashboard parse error:', e);
    }
  });
}

// Check every hour
setInterval(checkAndReport, 3600000);
