const fetch = require('node-fetch');

class HermesAI {
  constructor(apiKey = process.env.HERMES_API_KEY) {
    this.apiKey = apiKey || null;
    this.base = "http://localhost:5005"; // Change if Hermes runs elsewhere
  }

  async request(endpoint, method = "GET", body = null) {
    const url = `${this.base}${endpoint}`;

    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };

    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    return res.json().catch(() => ({}));
  }

  // Pull signals from Hermes
  async getSignals() {
    return this.request("/signals");
  }

  // Send notifications through Hermes
  async notify(title, payload) {
    return this.request("/notify", "POST", { title, payload });
  }
}

module.exports = HermesAI;
