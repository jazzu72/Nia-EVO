#!/usr/bin/env node

/**
 * MERCURY WEBHOOK HANDLER
 * Receives wholesale assignment fees and triggers Governess deployment
 */

const express = require('express');
const router = express.Router();

class MercuryHandler {
  constructor(ledger, governess, properties) {
    this.ledger = ledger;
    this.governess = governess;
    this.properties = properties;
    this.transactions = [];
  }

  handleWebhook(req, res) {
    const { amount, source, dealAddress, buyerInfo } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ error: 'Missing amount or source' });
    }

    try {
      // Record incoming fee
      this.ledger.addRevenue(amount, source);
      
      const transaction = {
        timestamp: new Date().toISOString(),
        type: 'WHOLESALE_FEE',
        amount,
        source,
        dealAddress,
        status: 'RECEIVED'
      };

      this.transactions.push(transaction);

      console.log(`\n💰 WHOLESALE FEE RECEIVED`);
      console.log(`   Amount: $${amount.toLocaleString()}`);
      console.log(`   Source: ${source}`);
      console.log(`   Deal: ${dealAddress || 'Unknown'}`);

      // Check if we should auto-deploy
      this.checkAutoDeployment();

      res.json({ 
        success: true, 
        message: 'Fee recorded',
        availableBalance: this.ledger.getBalance().available
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  checkAutoDeployment() {
    const balance = this.ledger.getBalance();
    const allProperties = this.properties.getAllProperties();

    // Find properties that haven't been fully deployed yet
    for (const prop of allProperties) {
      const decision = this.governess.deploy(prop);
      if (decision.status === 'EXECUTED') {
        console.log(`\n🚀 AUTONOMOUS DEPLOYMENT TRIGGERED`);
        break; // Deploy one at a time
      }
    }
  }

  getTransactions() {
    return this.transactions;
  }

  simulateDeal(dealData) {
    // For testing without real Mercury account
    this.handleWebhook(
      { body: dealData },
      {
        json: (data) => {
          console.log('Simulated webhook response:', data);
          return data;
        }
      }
    );
  }
}

module.exports = MercuryHandler;
