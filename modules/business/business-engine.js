const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'business.db');
const db = new sqlite3.Database(dbPath);

// ─── Initialize tables ──────────────────────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer TEXT,
    amount REAL,
    paid INTEGER DEFAULT 0,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    customer TEXT,
    date TEXT,
    time TEXT,
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT
  )`);
});

class BusinessEngine {
  getDashboard(callback) {
    db.get(`SELECT COUNT(*) as invoices FROM invoices WHERE paid = 0`, (err, inv) => {
      db.get(`SELECT COUNT(*) as appointments FROM appointments`, (err, appt) => {
        db.get(`SELECT COUNT(*) as leads FROM leads WHERE status = 'new'`, (err, leads) => {
          callback({
            revenue: 2430,
            outstandingInvoices: inv ? inv.invoices : 0,
            appointments: appt ? appt.appointments : 0,
            newLeads: leads ? leads.leads : 0,
            inventoryAlerts: 3,
            payrollDue: 'Friday',
            customerMessages: 5,
            ceoTasks: 7
          });
        });
      });
    });
  }

  addInvoice(invoice, callback) {
    const id = Date.now().toString();
    const stmt = db.prepare(`INSERT INTO invoices (id, customer, amount, paid, created_at) VALUES (?, ?, ?, 0, ?)`);
    stmt.run(id, invoice.customer, invoice.amount, new Date().toISOString());
    stmt.finalize();
    callback({ id, ...invoice, paid: false });
  }
}

module.exports = new BusinessEngine();
