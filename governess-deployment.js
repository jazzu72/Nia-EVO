#!/usr/bin/env node

/**
 * GOVERNESS DEPLOYMENT ENGINE
 * Autonomous capital deployment to real estate
 * Realistic Baltimore market thresholds
 */

class GovernessDeployment {
  constructor(ledger, properties) {
    this.ledger = ledger;
    this.properties = properties;
    this.deploymentThresholds = {
      minCapRate: 8.0,
      minDSCR: 1.20,
      minMonthlyProfit: 100,
      minStrategicFit: 60
    };
    this.approvedNeighborhoods = ['Canton', 'Hampden', 'Fells Point', 'Remington', 'Downtown'];
    this.decisions = [];
  }

  analyzeProperty(property) {
    const analysis = {
      address: property.address,
      purchasePrice: property.purchasePrice,
      monthlyRent: property.monthlyRent,
      downPayment: property.downPayment,
      neighborhood: property.neighborhood,
      timestamp: new Date().toISOString(),
      metrics: {}
    };

    const annualIncome = property.monthlyRent * 12;
    const capRate = (annualIncome / property.purchasePrice) * 100;
    analysis.metrics.capRate = capRate.toFixed(2);

    const loanAmount = property.purchasePrice * 0.8;
    const monthlyRate = 0.06 / 12;
    const numPayments = 30 * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const estimatedExpenses = property.monthlyRent * 0.3;
    const netOperatingIncome = property.monthlyRent - estimatedExpenses;
    const dscr = netOperatingIncome / monthlyPayment;
    analysis.metrics.dscr = dscr.toFixed(2);

    const monthlyProfit = netOperatingIncome - monthlyPayment;
    analysis.metrics.monthlyProfit = monthlyProfit.toFixed(2);

    let strategicFit = 0;
    if (this.approvedNeighborhoods.includes(property.neighborhood)) strategicFit += 30;
    if (capRate >= this.deploymentThresholds.minCapRate) strategicFit += 25;
    if (dscr >= this.deploymentThresholds.minDSCR) strategicFit += 25;
    if (monthlyProfit >= this.deploymentThresholds.minMonthlyProfit) strategicFit += 20;
    analysis.metrics.strategicFit = strategicFit;

    analysis.approval = {
      capRateOK: capRate >= this.deploymentThresholds.minCapRate,
      dscrOK: dscr >= this.deploymentThresholds.minDSCR,
      profitOK: monthlyProfit >= this.deploymentThresholds.minMonthlyProfit,
      neighborhoodOK: this.approvedNeighborhoods.includes(property.neighborhood),
      strategicFitOK: strategicFit >= this.deploymentThresholds.minStrategicFit,
      approved: capRate >= this.deploymentThresholds.minCapRate &&
                dscr >= this.deploymentThresholds.minDSCR &&
                monthlyProfit >= this.deploymentThresholds.minMonthlyProfit &&
                strategicFit >= this.deploymentThresholds.minStrategicFit
    };

    return analysis;
  }

  shouldDeploy(property) {
    const analysis = this.analyzeProperty(property);

    if (analysis.approval.approved) {
      const balance = this.ledger.getBalance();
      if (balance.available >= property.downPayment) {
        return { deploy: true, analysis };
      } else {
        return { deploy: false, reason: 'Insufficient capital', analysis };
      }
    }

    return { deploy: false, reason: 'Does not meet thresholds', analysis };
  }

  deploy(property) {
    const decision = this.shouldDeploy(property);

    if (!decision.deploy) {
      console.log(`\n❌ DEPLOYMENT REJECTED: ${property.address}`);
      console.log(`   Reason: ${decision.reason}`);
      console.log(`   Cap Rate: ${decision.analysis.metrics.capRate}% (need ${this.deploymentThresholds.minCapRate}%)`);
      console.log(`   DSCR: ${decision.analysis.metrics.dscr} (need ${this.deploymentThresholds.minDSCR})`);
      console.log(`   Monthly Profit: $${decision.analysis.metrics.monthlyProfit} (need $${this.deploymentThresholds.minMonthlyProfit})`);
      console.log(`   Strategic Fit: ${decision.analysis.metrics.strategicFit}% (need ${this.deploymentThresholds.minStrategicFit}%)`);
      decision.status = 'REJECTED';
      this.decisions.push(decision);
      return decision;
    }

    try {
      this.ledger.addExpense(property.downPayment, `Property deployment: ${property.address}`);
      console.log(`\n✅ DEPLOYMENT EXECUTED: ${property.address}`);
      console.log(`   Down Payment: $${property.downPayment.toLocaleString()}`);
      console.log(`   Cap Rate: ${decision.analysis.metrics.capRate}%`);
      console.log(`   DSCR: ${decision.analysis.metrics.dscr}`);
      console.log(`   Monthly Profit: $${decision.analysis.metrics.monthlyProfit}`);
      console.log(`   Strategic Fit: ${decision.analysis.metrics.strategicFit}%`);

      decision.status = 'EXECUTED';
      decision.deployment = {
        timestamp: new Date().toISOString(),
        downPaymentDeployed: property.downPayment
      };
      this.decisions.push(decision);
      return decision;
    } catch (err) {
      console.log(`\n❌ DEPLOYMENT FAILED: ${err.message}`);
      decision.status = 'FAILED';
      decision.error = err.message;
      this.decisions.push(decision);
      return decision;
    }
  }

  getDecisions() {
    return this.decisions;
  }
}

module.exports = GovernessDeployment;
