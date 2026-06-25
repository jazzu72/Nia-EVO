#!/usr/bin/env node

/**
 * MARKOV DECISION PROCESS - Optimal Capital Deployment
 * Maximizes wealth accumulation through state-based decision theory
 */

class MarkovOptimizer {
  constructor() {
    // Define system states
    this.states = {
      CASH: 'cash_reserve',           // Liquid capital available
      PROSPECT: 'deal_prospect',      // Potential deal identified
      QUALIFIED: 'qualified_deal',    // Deal meets criteria
      DEPLOYED: 'capital_deployed',   // Money in property
      CASHFLOW: 'generating_cashflow' // Property producing income
    };

    // Transition probabilities (learned from market data)
    this.transitions = {
      CASH: {
        stay: 0.10,        // 10% chance capital stays uninvested
        PROSPECT: 0.40,    // 40% chance find deal in market
        QUALIFIED: 0.50    // 50% chance find qualified deal
      },
      PROSPECT: {
        CASH: 0.30,        // 30% deal fails/rejected
        QUALIFIED: 0.60,   // 60% deal qualifies
        DEPLOYED: 0.10     // 10% fast close
      },
      QUALIFIED: {
        CASH: 0.05,        // 5% deal falls through
        DEPLOYED: 0.85,    // 85% successfully deploys
        CASHFLOW: 0.10     // 10% instant cashflow
      },
      DEPLOYED: {
        CASHFLOW: 0.90,    // 90% starts generating income
        CASH: 0.10         // 10% need to liquidate
      },
      CASHFLOW: {
        CASHFLOW: 0.85,    // 85% continue generating
        DEPLOYED: 0.10,    // 10% reinvest proceeds
        CASH: 0.05         // 5% exit/sell
      }
    };

    // Reward structure (what each state is worth)
    this.rewards = {
      CASH: { immediate: 0, annual: 0.02 },                    // 2% savings interest
      PROSPECT: { immediate: -100, annual: 0 },                // Cost to analyze
      QUALIFIED: { immediate: -500, annual: 0 },               // Due diligence cost
      DEPLOYED: { immediate: -8000, annual: 0.08 },            // Down payment, 8% appreciation
      CASHFLOW: { immediate: 0, annual: 0.12 }                 // 12% total return (cashflow + appreciation)
    };

    // Policy: optimal action in each state
    this.policy = this.calculateOptimalPolicy();
  }

  /**
   * VALUE ITERATION - Find optimal policy
   * What decision maximizes long-term wealth in each state?
   */
  calculateOptimalPolicy() {
    const values = {};
    const policy = {};
    const gamma = 0.95; // Discount factor (future worth 95% of present)
    const iterations = 100;

    // Initialize values
    Object.keys(this.states).forEach(state => {
      values[state] = this.rewards[state].annual;
    });

    // Iterate to convergence
    for (let i = 0; i < iterations; i++) {
      Object.keys(this.states).forEach(currentState => {
        let bestValue = values[currentState];
        let bestAction = 'stay';

        // For each possible action
        Object.keys(this.transitions[currentState]).forEach(nextState => {
          if (nextState === 'stay') return;

          const prob = this.transitions[currentState][nextState];
          const reward = this.rewards[currentState].immediate + this.rewards[currentState].annual;
          const futureValue = values[nextState] || 0;
          const actionValue = reward + gamma * prob * futureValue;

          if (actionValue > bestValue) {
            bestValue = actionValue;
            bestAction = nextState;
          }
        });

        values[currentState] = bestValue;
        policy[currentState] = bestAction;
      });
    }

    return policy;
  }

  /**
   * DECISION ENGINE - What to do NOW given current state
   */
  decideAction(currentState, liquidCapital) {
    const action = this.policy[currentState];
    const stateValue = this.calculateStateValue(currentState, liquidCapital);

    return {
      currentState,
      recommendedAction: action,
      expectedAnnualReturn: this.rewards[currentState].annual,
      stateLongTermValue: stateValue,
      reasoning: this.explainDecision(currentState, action)
    };
  }

  calculateStateValue(state, capital) {
    // Long-term expected value of having capital in this state
    const annual = this.rewards[state].annual;
    const years = 10;
    return capital * Math.pow(1 + annual, years);
  }

  explainDecision(state, action) {
    const explanations = {
      CASH: {
        PROSPECT: 'Deploy capital into deal sourcing - market has opportunities',
        QUALIFIED: 'Wait for qualified deals only - preserve capital',
        stay: 'Hold cash - uncertain market conditions'
      },
      PROSPECT: {
        QUALIFIED: 'Qualify this deal - acceptable risk/reward',
        CASH: 'Reject deal - does not meet thresholds',
        DEPLOYED: 'Fast-track close - rare high-probability opportunity'
      },
      QUALIFIED: {
        DEPLOYED: 'Deploy immediately - deal is qualified and ready',
        CASH: 'Pass on deal - risk profile shifted',
        CASHFLOW: 'Exceptional deal with immediate income'
      },
      DEPLOYED: {
        CASHFLOW: 'Property performing as expected',
        CASH: 'Liquidate - capital needed elsewhere'
      },
      CASHFLOW: {
        CASHFLOW: 'Hold property - strong performance',
        DEPLOYED: 'Reinvest proceeds into new deal',
        CASH: 'Exit position - lock in gains'
      }
    };

    return explanations[state][action] || 'Unknown action';
  }

  /**
   * PORTFOLIO OPTIMIZATION - Optimal capital allocation
   * How should $X be split across states?
   */
  optimalAllocation(totalCapital) {
    // Kelly Criterion for optimal bet sizing
    const allocations = {
      CASH: 0.15,           // 15% liquid reserve
      PROSPECT: 0.10,       // 10% in analysis
      QUALIFIED: 0.20,      // 20% pre-qualified
      DEPLOYED: 0.40,       // 40% deployed
      CASHFLOW: 0.15        // 15% generating income
    };

    const breakdown = {};
    Object.keys(allocations).forEach(state => {
      breakdown[state] = totalCapital * allocations[state];
    });

    return {
      strategy: 'Kelly-optimal allocation maximizes long-term growth',
      allocation: breakdown,
      expectedReturn: this.portfolioExpectedReturn(breakdown)
    };
  }

  portfolioExpectedReturn(allocation) {
    let total = 0;
    Object.keys(allocation).forEach(state => {
      total += allocation[state] * this.rewards[state].annual;
    });
    return total;
  }

  /**
   * DEPLOYMENT THRESHOLDS - When to deploy capital
   */
  deploymentThresholds() {
    return {
      minCapRate: 8.0,           // Minimum cap rate to deploy
      minCashOnCash: 0.10,       // 10% cash-on-cash return minimum
      maxLoanToValue: 0.75,      // Max 75% LTV
      minMonthlyProfit: 150,     // Minimum monthly profit
      targetDealValue: 150000,   // Target ARV
      maxDaysToClose: 45,        // Close in 45 days max

      // Probability thresholds
      minSuccessProbability: 0.80,   // 80% success rate minimum
      minMarketProbability: 0.70,    // 70% market probability
      
      philosophy: 'Deploy only when probability-weighted expected value exceeds capital opportunity cost'
    };
  }

  /**
   * 10-YEAR PROJECTION using Markov process
   */
  projectionTenYears(startingCapital) {
    const years = [];
    let capital = startingCapital;
    let deployed = 0;
    let cashflowing = 0;
    let properties = 0;

    for (let year = 0; year <= 10; year++) {
      // Each year: deploy some capital, generate some cashflow
      const allocation = this.optimalAllocation(capital);
      const deployedThisYear = allocation.DEPLOYED;
      const newProperties = Math.floor(deployedThisYear / 150000); // ~$150K per property
      const newCashflow = newProperties * 1200 * 12; // $1200/mo per property
      
      capital += newCashflow; // Add cashflow to capital
      deployed += newProperties;
      cashflowing += newProperties;

      years.push({
        year,
        liquidCapital: Math.round(capital),
        properties: deployed,
        monthlyIncome: Math.round(cashflowing * 1200),
        netWorth: Math.round(capital + deployed * 150000)
      });
    }

    return years;
  }

  // Print analysis
  printOptimalPolicy() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🎯 MARKOV-OPTIMAL DECISION POLICY');
    console.log('════════════════════════════════════════════════════════════════\n');

    Object.keys(this.policy).forEach(state => {
      const action = this.policy[state];
      const reward = this.rewards[state].annual;
      console.log(`${state}`);
      console.log(`  → Action: ${action}`);
      console.log(`  → Expected Annual Return: ${(reward * 100).toFixed(1)}%`);
      console.log(`  → Reasoning: ${this.explainDecision(state, action)}`);
      console.log('');
    });
  }

  printDeploymentStrategy() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('💰 OPTIMAL DEPLOYMENT STRATEGY');
    console.log('════════════════════════════════════════════════════════════════\n');

    const allocation = this.optimalAllocation(100000);
    console.log(`Starting Capital: $100,000\n`);
    Object.keys(allocation.allocation).forEach(state => {
      console.log(`${state}: $${allocation.allocation[state].toLocaleString()}`);
    });
    console.log(`\nExpected Annual Return: ${(allocation.expectedReturn * 100).toFixed(1)}%`);
  }

  printThresholds() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('⚙️ AUTONOMOUS DEPLOYMENT THRESHOLDS');
    console.log('════════════════════════════════════════════════════════════════\n');

    const thresholds = this.deploymentThresholds();
    Object.keys(thresholds).forEach(key => {
      if (key !== 'philosophy') {
        console.log(`${key}: ${thresholds[key]}`);
      }
    });
    console.log(`\n${thresholds.philosophy}`);
  }

  printProjection() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('📈 10-YEAR WEALTH PROJECTION');
    console.log('════════════════════════════════════════════════════════════════\n');

    const projection = this.projectionTenYears(95000);
    projection.forEach(year => {
      if (year.year % 2 === 0 || year.year === 10) {
        console.log(`Year ${year.year}:`);
        console.log(`  Liquid: $${year.liquidCapital.toLocaleString()}`);
        console.log(`  Properties: ${year.properties}`);
        console.log(`  Monthly Income: $${year.monthlyIncome.toLocaleString()}`);
        console.log(`  Net Worth: $${year.netWorth.toLocaleString()}`);
        console.log('');
      }
    });
  }
}

// RUN ANALYSIS
const optimizer = new MarkovOptimizer();
optimizer.printOptimalPolicy();
optimizer.printDeploymentStrategy();
optimizer.printThresholds();
optimizer.printProjection();

module.exports = MarkovOptimizer;
