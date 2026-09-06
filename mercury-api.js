const fetch = require('node-fetch');

class MercuryAPI {
  constructor(apiKey = process.env.MERCURY_API_KEY) {
    if (!apiKey) {
      throw new Error("Missing MERCURY_API_KEY");
    }
    this.apiKey = apiKey;
    this.base = "https://api.mercury.com/api/v1";
  }

  async request(endpoint, method = "GET", body = null, retries = 3) {
    const url = `${this.base}${endpoint}`;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      }
    };

    if (body) options.body = JSON.stringify(body);

    while (retries > 0) {
      try {
        const res = await fetch(url, options);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(`Mercury API error: ${res.status} ${JSON.stringify(data)}`);
        }

        return data;
      } catch (err) {
        retries--;
        console.error(`Mercury request failed (${endpoint}), retries left: ${retries}`, err);
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  // 🔹 Get account balance
  async getBalance(accountId) {
    return this.request(`/accounts/${accountId}/balance`);
  }

  // 🔹 List transactions
  async getTransactions(accountId) {
    return this.request(`/accounts/${accountId}/transactions`);
  }

  // 🔹 Send ACH payment
  async sendPayment({ amount, memo, fromAccountId, toName, toRouting, toAccount }) {
    return this.request(`/payments`, "POST", {
      amount,
      memo,
      fromAccountId,
      recipient: {
        name: toName,
        routingNumber: toRouting,
        accountNumber: toAccount,
        type: "ach"
      }
    });
  }
}

module.exports = MercuryAPI;
