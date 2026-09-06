#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const PropertyManager = require('./property-manager');

class FinancialLedger {
  constructor() {
    this.transactions = [];
    this.balance = { available: 0, reserved: 0, total: 0 };
  }

  addRevenue(amount, source) {
    this.transactions.push({
      type: 'revenue',
      amount,
      source,
      timestamp: new Date()
    });
    this.balance.available += amount;
    this.balance.total += amount;
    return true;
  }

  addExpense(amount, reason) {
    if (this.balance.available < amount) {
      console.log('❌ Insufficient funds');
      return false;
    }
    this.transactions.push({
      type: 'expense',
      amount,
      reason,
      timestamp: new Date()
    });
    this.balance.available -= amount;
    this.balance.total -= amount;
    return true;
  }

  getBalance() {
    return { ...this.balance };
  }

  getTransactions(limit = null) {
    if (limit) {
      return this.transactions.slice(-limit);
    }
    return this.transactions;
  }
}

class NIAEVO {
  constructor() {
    this.founder = 'Jason LeSane';
    this.company = 'House of Jazzu LLC';
    this.location = 'Norfolk, VA';
    this.running = true;
    this.startTime = Date.now();

    this.ledger = new FinancialLedger();
    this.properties = new PropertyManager();
  }

  displayHelp() {
    console.log('\n📚 COMMANDS:');
    console.log('  balance              - Show account balance');
    console.log('  add <amt> <src>      - Add revenue (wholesale fee)');
    console.log('  spend <amt> <reason> - Add expense');
    console.log('  history              - Show transactions');
    console.log('  status               - Show system status');
    console.log('  portfolio            - Show property portfolio');
    console.log('  addprop              - Add new property');
    console.log('  income <id> <amt>    - Log property rent income');
    console.log('  expense <id> <amt>   - Log property expense');
    console.log('  help                 - This menu');
    console.log('  quit                 - Exit\n');
  }

  displayBalance() {
    const b = this.ledger.getBalance();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    console.log(`
💰 NIA-EVO FINANCIAL STATUS
─────────────────────────────
   Available: $${b.available.toLocaleString()}
   Total:     $${b.total.toLocaleString()}
   Uptime:    ${Math.floor(uptime / 60)}m ${uptime % 60}s
`);
  }

  displayStatus() {
    const b = this.ledger.getBalance();
    console.log(`
🏛️ HOUSE OF JAZZU - NIA-EVO
─────────────────────────────
   Status:        OPERATIONAL
   Liquid:        $${b.available.toLocaleString()}
   Total Worth:   $${b.total.toLocaleString()}
   Transactions:  ${this.ledger.getTransactions().length}
   Owner:         Jason LeSane
   Location:      Norfolk, VA
   Constitution:  ENFORCED
`);
  }

  displayPortfolio() {
    const summary = this.properties.getPortfolioSummary();
    const props = this.properties.getAllProperties();

    console.log(`
🏠 PROPERTY PORTFOLIO
─────────────────────────────
   Properties:      ${summary.propertyCount}
   Total Value:     $${summary.totalValue.toLocaleString()}
   Deployed:        $${summary.totalDeployed.toLocaleString()}
   Monthly Income:  $${summary.monthlyIncome.toLocaleString()}
   Annual Income:   $${(summary.monthlyIncome * 12).toLocaleString()}
`);

    if (props.length > 0) {
      console.log('PROPERTIES:');
      props.forEach(prop => {
        const metrics = this.properties.getPropertyMetrics(prop.id);
        console.log(`
  📍 ${prop.address} (ID: ${prop.id})
     Purchase:   $${prop.purchasePrice.toLocaleString()}
     Down:       $${prop.downPayment.toLocaleString()}
     Rent/mo:    $${prop.monthlyRent.toLocaleString()}
     Income:     $${metrics.totalIncome.toLocaleString()}
     Expenses:   $${metrics.totalExpenses.toLocaleString()}
     Profit:     $${metrics.netProfit.toLocaleString()}
     ROI:        ${metrics.roi}%
     Status:     ${prop.status.toUpperCase()}
`);
      });
    } else {
      console.log('\nNo properties yet. Use "addprop" to add one.');
    }
  }

  processCommand(input, rl) {
    const trimmed = input.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'balance':
      case 'bal':
        this.displayBalance();
        break;

      case 'add':
        if (parts[1] && parts[2]) {
          const amt = parseFloat(parts[1]);
          const src = parts.slice(2).join(' ');
          if (this.ledger.addRevenue(amt, src)) {
            console.log(`✅ Added: $${amt.toLocaleString()} from ${src}`);
          }
        } else {
          console.log('Usage: add <amount> <source>');
        }
        break;

      case 'spend':
      case 'pay':
        if (parts[1] && parts[2]) {
          const amt = parseFloat(parts[1]);
          const reason = parts.slice(2).join(' ');
          if (this.ledger.addExpense(amt, reason)) {
            console.log(`✅ Paid: $${amt.toLocaleString()} for ${reason}`);
          }
        } else {
          console.log('Usage: spend <amount> <reason>');
        }
        break;

      case 'history':
        const txns = this.ledger.getTransactions(10);
        if (txns.length === 0) {
          console.log('No transactions yet');
        } else {
          console.log('\n📜 RECENT TRANSACTIONS:');
          txns.forEach(t => {
            const icon = t.type === 'revenue' ? '💰' : '💸';
            console.log(`   ${icon} $${t.amount.toLocaleString()} - ${t.source || t.reason}`);
          });
          console.log('');
        }
        break;

      case 'portfolio':
        this.displayPortfolio();
        break;

      case 'addprop':
        const newRl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        newRl.question('Address: ', (addr) => {
          newRl.question('Purchase Price: $', (price) => {
            newRl.question('Down Payment: $', (down) => {
              newRl.question('Monthly Rent: $', (rent) => {
                newRl.question('Neighborhood: ', (hood) => {
                  try {
                    const id = this.properties.addProperty(
                      addr,
                      parseFloat(price),
                      parseFloat(down),
                      parseFloat(rent),
                      hood
                    );
                    console.log(`✅ Property added (ID: ${id})`);
                  } catch (err) {
                    console.error('❌ Error:', err.message);
                  }
                  newRl.close();
                });
              });
            });
          });
        });
        break;

      case 'income':
        if (parts[1] && parts[2]) {
          const propId = parseInt(parts[1]);
          const amt = parseFloat(parts[2]);
          try {
            this.properties.addIncome(propId, amt, 'rent', 'Monthly rent');
            console.log(`✅ Logged: $${amt.toLocaleString()} income for property ${propId}`);
          } catch (err) {
            console.error('❌ Error:', err.message);
          }
        } else {
          console.log('Usage: income <property_id> <amount>');
        }
        break;

      case 'expense':
        if (parts[1] && parts[2]) {
          const propId = parseInt(parts[1]);
          const amt = parseFloat(parts[2]);
          try {
            this.properties.addExpense(propId, amt, 'maintenance', 'Expense');
            console.log(`✅ Logged: $${amt.toLocaleString()} expense for property ${propId}`);
          } catch (err) {
            console.error('❌ Error:', err.message);
          }
        } else {
          console.log('Usage: expense <property_id> <amount>');
        }
        break;

      case 'status':
        this.displayStatus();
        break;

      case 'help':
        this.displayHelp();
        break;

      case 'quit':
      case 'exit':
        console.log('\n🛑 Shutting down NIA-EVO...\n');
        this.running = false;
        break;

      default:
        console.log(`❌ Unknown command: ${cmd}. Type 'help' for commands.`);
    }
  }

  start() {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NIA-EVO - House of Jazzu Autonomous OS');
    console.log('='.repeat(50));
    this.displayStatus();
    this.displayHelp();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'nia> '
    });

    rl.prompt();

    rl.on('line', (line) => {
      this.processCommand(line, rl);
      if (this.running) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      process.exit(0);
    });
  }
}

const nia = new NIAEVO();
nia.start();

module.exports = NIAEVO;
