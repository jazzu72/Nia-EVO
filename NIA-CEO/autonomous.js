/**
 * NIA CEO - Autonomous Capital Management
 * FIXED: No SMS loops, focused execution only
 */

const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const CONFIG = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  cycle: 3600000, // 1 hour (not every minute)
  debug: true
};

// Load leads from file (no API calls during startup)
function loadLeads() {
  try {
    if (fs.existsSync('./data/leads.json')) {
      return JSON.parse(fs.readFileSync('./data/leads.json', 'utf8'));
    }
  } catch (err) {
    console.log('No leads file yet');
  }
  return {};
}

// CEO Decision Loop
function runCycle() {
  console.log('\n🤖 CEO CYCLE STARTED');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  
  const leads = loadLeads();
  const leadCount = Object.keys(leads).length;
  
  console.log(`📊 Status: ${leadCount} leads in system`);
  console.log('✅ Ready for Jason to execute: respond to SMS, schedule inspections, close deals');
}

// Run cycle every hour (not every minute)
runCycle();
setInterval(runCycle, CONFIG.cycle);

console.log('\n✅ CEO Engine running (cycles every 1 hour)\n');
