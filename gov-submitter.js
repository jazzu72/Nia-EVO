const axios = require('axios');

// ─── YOUR REAL CREDENTIALS ──────────────────────────────────
const USERNAME = 'jazzu72';        // Replace with your actual grants.gov username
const PASSWORD = 'your_actual_password';  // Replace with your actual grants.gov password
const BASE_URL = 'https://api.grants.gov/api/v1';

let authToken = null;

async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/token`, {
      username: USERNAME,
      password: PASSWORD
    });
    authToken = response.data.access_token;
    console.log('✅ Grants.gov authenticated');
    return authToken;
  } catch (err) {
    console.error('❌ Grants.gov auth failed:', err.message);
    return null;
  }
}

async function submitApplication(grant) {
  if (!authToken) await authenticate();
  if (!authToken) return { success: false, reason: 'Auth failed' };
  try {
    const payload = {
      grantId: grant.id || 'G-' + Date.now(),
      title: grant.title,
      amount: grant.amount || 0,
      deadline: grant.deadline || '2026-12-31',
      agency: grant.source || 'NSF',
      submissionDate: new Date().toISOString()
    };
    const response = await axios.post(`${BASE_URL}/applications`, payload, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Submitted grant: ${grant.title} (ID: ${response.data.id})`);
    return { success: true, id: response.data.id };
  } catch (err) {
    console.error(`❌ Submission failed for ${grant.title}:`, err.message);
    return { success: false, reason: err.message };
  }
}

module.exports = { authenticate, submitApplication };
