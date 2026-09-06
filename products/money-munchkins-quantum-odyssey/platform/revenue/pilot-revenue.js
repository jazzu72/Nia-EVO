const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../data/pilot-revenue.json");

function load() {
  if (!fs.existsSync(FILE)) return { transactions: [] };
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { transactions: [] }; }
}

function save(data) {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

function record({ customerId, amount, currency = "USD", product = "pilot" }) {
  if (!customerId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("INVALID_REVENUE_EVENT");
  }

  const data = load();

  const existing = data.transactions.find(
    x => x.customerId === customerId && x.product === product
  );

  if (existing) return existing;

  const tx = {
    id: `REV-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    customerId,
    amount: Number(amount),
    currency,
    product,
    status: "paid",
    timestamp: new Date().toISOString()
  };

  data.transactions.push(tx);
  save(data);
  return tx;
}

function metrics() {
  const transactions = load().transactions || [];
  const revenue = transactions.reduce((n, x) => n + Number(x.amount || 0), 0);

  return {
    paidCustomers: new Set(transactions.map(x => x.customerId)).size,
    transactions: transactions.length,
    revenueUSD: Number(revenue.toFixed(2)),
    averageRevenuePerCustomer: transactions.length
      ? Number((revenue / new Set(transactions.map(x => x.customerId)).size).toFixed(2))
      : 0
  };
}

module.exports = { record, metrics };
