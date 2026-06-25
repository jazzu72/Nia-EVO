#!/usr/bin/env node

/**
 * MERCURY BANK INTEGRATION
 * Real capital movement - assignment fees & down payments
 * Production-grade, error-handled, audit-logged
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class MercuryIntegration {
  constructor(apiKey, accountId) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseURL = 'https://api.mercury.com/v1';
    this.logPath = path.join(process.env.HOME, '.nia-complete', 'mercury-log.json');
    this.transactions = this.loadLog();
  }

  loadLog() {
    if (fs.existsSync(this.logPath)) {
      return JSON.parse(fs.readFileSync(this.logPath, 'utf8'));
    }
    return { transfers: [], failed: [], balance_history: [] };
  }

  saveLog() {
    fs.writeFileSync(this.logPath, JSON.stringify(this.transactions, null, 2));
  }

  /**
   * CHECK ACCOUNT BALANCE
   * Verify capital available before transfers
   */
  async getBalance() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mercury.com',
        port: 443,
        path: `/v1/accounts/${this.accountId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const balance = {
              available: json.available_balance || 0,
              total: json.balance || 0,
              currency: 'USD',
              timestamp: new Date().toISOString()
            };

            this.transactions.balance_history.push(balance);
            this.saveLog();

            console.log(`\n💰 MERCURY BALANCE CHECK`);
            console.log(`   Available: $${(balance.available / 100).toLocaleString()}`);
            console.log(`   Total: $${(balance.total / 100).toLocaleString()}\n`);

            resolve(balance);
          } catch (e) {
            reject(new Error(`Balance parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * WIRE ASSIGNMENT FEE
   * Send wholesale fee to title company (real money movement)
   */
  async wireAssignmentFee(recipientEmail, amount, dealDescription) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        recipientEmail,
        amount: Math.round(amount * 100), // Convert to cents
        description: `Assignment fee: ${dealDescription}`,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`
      });

      const options = {
        hostname: 'api.mercury.com',
        port: 443,
        path: `/v1/accounts/${this.accountId}/transfers`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);

            if (res.statusCode === 200 || res.statusCode === 201) {
              const transfer = {
                id: json.id,
                type: 'ASSIGNMENT_FEE',
                recipient: recipientEmail,
                amount,
                description: dealDescription,
                status: 'SENT',
                timestamp: new Date().toISOString(),
                mercuryId: json.id
              };

              this.transactions.transfers.push(transfer);
              this.saveLog();

              console.log(`\n✅ ASSIGNMENT FEE WIRED`);
              console.log(`   To: ${recipientEmail}`);
              console.log(`   Amount: $${amount.toLocaleString()}`);
              console.log(`   Deal: ${dealDescription}`);
              console.log(`   Mercury ID: ${json.id}\n`);

              resolve(transfer);
            } else {
              const failed = {
                type: 'ASSIGNMENT_FEE',
                recipient: recipientEmail,
                amount,
                error: json.error || 'Unknown error',
                status: 'FAILED',
                timestamp: new Date().toISOString()
              };

              this.transactions.failed.push(failed);
              this.saveLog();

              console.log(`\n❌ ASSIGNMENT FEE FAILED`);
              console.log(`   Error: ${json.error}`);
              console.log(`   Status Code: ${res.statusCode}\n`);

              reject(new Error(json.error || 'Transfer failed'));
            }
          } catch (e) {
            reject(new Error(`Response parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  /**
   * WIRE DOWN PAYMENT
   * Deploy capital to lender for down payment (real money movement)
   */
  async wireDownPayment(lenderEmail, amount, propertyAddress) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        recipientEmail: lenderEmail,
        amount: Math.round(amount * 100), // Convert to cents
        description: `Down payment: ${propertyAddress}`,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`
      });

      const options = {
        hostname: 'api.mercury.com',
        port: 443,
        path: `/v1/accounts/${this.accountId}/transfers`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);

            if (res.statusCode === 200 || res.statusCode === 201) {
              const transfer = {
                id: json.id,
                type: 'DOWN_PAYMENT',
                recipient: lenderEmail,
                amount,
                property: propertyAddress,
                status: 'SENT',
                timestamp: new Date().toISOString(),
                mercuryId: json.id
              };

              this.transactions.transfers.push(transfer);
              this.saveLog();

              console.log(`\n💳 DOWN PAYMENT WIRED`);
              console.log(`   To: ${lenderEmail}`);
              console.log(`   Amount: $${amount.toLocaleString()}`);
              console.log(`   Property: ${propertyAddress}`);
              console.log(`   Mercury ID: ${json.id}\n`);

              resolve(transfer);
            } else {
              const failed = {
                type: 'DOWN_PAYMENT',
                recipient: lenderEmail,
                amount,
                property: propertyAddress,
                error: json.error || 'Unknown error',
                status: 'FAILED',
                timestamp: new Date().toISOString()
              };

              this.transactions.failed.push(failed);
              this.saveLog();

              console.log(`\n❌ DOWN PAYMENT FAILED`);
              console.log(`   Error: ${json.error}`);
              console.log(`   Status Code: ${res.statusCode}\n`);

              reject(new Error(json.error || 'Transfer failed'));
            }
          } catch (e) {
            reject(new Error(`Response parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  /**
   * GET TRANSACTION HISTORY
   */
  getTransactionHistory() {
    return {
      transfers: this.transactions.transfers,
      failed: this.transactions.failed,
      totalTransferred: this.transactions.transfers.reduce((sum, t) => sum + t.amount, 0),
      failedCount: this.transactions.failed.length
    };
  }

  /**
   * VERIFY API KEY & CONNECTION
   */
  async verifyConnection() {
    try {
      const balance = await this.getBalance();
      console.log(`✅ MERCURY CONNECTION VERIFIED`);
      console.log(`   Account: ${this.accountId}`);
      console.log(`   Status: READY FOR TRANSFERS\n`);
      return true;
    } catch (err) {
      console.log(`❌ MERCURY CONNECTION FAILED`);
      console.log(`   Error: ${err.message}\n`);
      return false;
    }
  }
}

module.exports = MercuryIntegration;

if (require.main === module) {
  const apiKey = process.env.MERCURY_API_KEY;
  const accountId = process.env.MERCURY_ACCOUNT;

  if (!apiKey || !accountId) {
    console.log('❌ Missing MERCURY_API_KEY or MERCURY_ACCOUNT environment variables');
    console.log('\nSet them with:');
    console.log('  export MERCURY_API_KEY="your_key"');
    console.log('  export MERCURY_ACCOUNT="your_account_id"\n');
    process.exit(1);
  }

  const mercury = new MercuryIntegration(apiKey, accountId);
  mercury.verifyConnection();
}
