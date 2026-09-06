const { exec } = require('child_process');

function checkStaleLeads() {
  exec('curl http://localhost:3000/api/leads/stale', (err, out) => {
    const leads = JSON.parse(out);
    for (const lead of leads) {
      exec(`curl -X POST http://localhost:3000/api/sms/send -d '{"to":"${lead.phone}","message":"Hi, are you still interested?"}'`);
    }
  });
}

// Check every 6 hours
setInterval(checkStaleLeads, 21600000);
