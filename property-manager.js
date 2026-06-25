#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.env.HOME, '.nia-complete', 'properties.json');

class PropertyManager {
  constructor() {
    this.ensureDB();
  }

  ensureDB() {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({
        properties: [],
        nextId: 1
      }, null, 2));
    }
  }

  loadDB() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  }

  saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  addProperty(address, purchasePrice, downPayment, monthlyRent, neighborhood) {
    const db = this.loadDB();
    const id = db.nextId++;

    db.properties.push({
      id,
      address,
      purchasePrice,
      downPayment,
      loanAmount: purchasePrice - downPayment,
      monthlyRent,
      neighborhood,
      status: 'active',
      income: [],
      expenses: [],
      deployment: [],
      createdAt: new Date().toISOString()
    });

    this.saveDB(db);
    return id;
  }

  addIncome(propertyId, amount, type, notes) {
    const db = this.loadDB();
    const prop = db.properties.find(p => p.id === propertyId);
    
    if (!prop) throw new Error(`Property ${propertyId} not found`);

    prop.income.push({
      amount,
      type,
      notes,
      date: new Date().toISOString().split('T')[0]
    });

    this.saveDB(db);
    return true;
  }

  addExpense(propertyId, amount, category, notes) {
    const db = this.loadDB();
    const prop = db.properties.find(p => p.id === propertyId);
    
    if (!prop) throw new Error(`Property ${propertyId} not found`);

    prop.expenses.push({
      amount,
      category,
      notes,
      date: new Date().toISOString().split('T')[0]
    });

    this.saveDB(db);
    return true;
  }

  getPropertyById(propertyId) {
    const db = this.loadDB();
    return db.properties.find(p => p.id === propertyId);
  }

  getAllProperties() {
    const db = this.loadDB();
    return db.properties.filter(p => p.status === 'active');
  }

  getPropertyMetrics(propertyId) {
    const prop = this.getPropertyById(propertyId);
    if (!prop) return null;

    const totalIncome = prop.income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = prop.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDeployed = prop.downPayment;
    const netProfit = totalIncome - totalExpenses;
    const roi = totalDeployed > 0 ? ((netProfit / totalDeployed) * 100).toFixed(2) : 0;

    return {
      totalIncome,
      totalExpenses,
      totalDeployed,
      netProfit,
      roi,
      transactionCount: prop.income.length + prop.expenses.length
    };
  }

  getPortfolioSummary() {
    const props = this.getAllProperties();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalDeployed = 0;
    let totalValue = 0;

    props.forEach(prop => {
      totalIncome += prop.income.reduce((sum, i) => sum + i.amount, 0);
      totalExpenses += prop.expenses.reduce((sum, e) => sum + e.amount, 0);
      totalDeployed += prop.downPayment;
      totalValue += prop.purchasePrice;
    });

    return {
      propertyCount: props.length,
      monthlyIncome: props.reduce((sum, p) => sum + p.monthlyRent, 0),
      totalDeployed,
      totalValue,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses
    };
  }

  close() {
    return Promise.resolve();
  }
}

module.exports = PropertyManager;
