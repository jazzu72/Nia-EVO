"use strict";

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/verified-revenue-ledger.json");

const PRODUCTS = {
  "money-munchkins": { name: "Money Munchkins", target: 400000 },
  "museforge-os": { name: "MuseForge OS", target: 350000 },
  "polish": { name: "Polish", target: 200000 },
  partnerships: { name: "Partnerships & Licensing", target: 50000 }
};

const DEFAULT_LEDGER = {
  version: "1.0.0",
  system: "HOUSE_OF_JAZZU_VERIFIED_REVENUE",
  currency: "USD",
  entries: []
};

function ensure() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(DEFAULT_LEDGER, null, 2));
  }
}

function load() {
  ensure();
  try {
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!Array.isArray(data.entries)) data.entries = [];
    return data;
  } catch {
    fs.writeFileSync(FILE, JSON.stringify(DEFAULT_LEDGER, null, 2));
    return structuredClone(DEFAULT_LEDGER);
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function verifiedTotal(entries) {
  return entries
    .filter(e => e.status === "VERIFIED" && e.paymentStatus === "PAID")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

function snapshot() {
  const ledger = load();
  const entries = ledger.entries;

  const products = {};
  for (const [id, product] of Object.entries(PRODUCTS)) {
    const revenue = entries
      .filter(e =>
        e.status === "VERIFIED" &&
        e.paymentStatus === "PAID" &&
        e.product === id
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    products[id] = {
      name: product.name,
      revenue,
      target: product.target,
      remaining: Math.max(product.target - revenue, 0),
      progressPercent: Number(((revenue / product.target) * 100).toFixed(2))
    };
  }

  const total = verifiedTotal(entries);
  const target = 1000000;

  return {
    ok: true,
    system: "HOUSE_OF_JAZZU_VERIFIED_REVENUE",
    currency: "USD",
    verifiedRevenue: total,
    annualTarget: target,
    remaining: Math.max(target - total, 0),
    progressPercent: Number(((total / target) * 100).toFixed(2)),
    verifiedTransactions: entries.filter(
      e => e.status === "VERIFIED" && e.paymentStatus === "PAID"
    ).length,
    products,
    entries,
    timestamp: new Date().toISOString()
  };
}

function recordPayment(input) {
  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("A positive payment amount is required");
  }

  if (!PRODUCTS[input.product]) {
    throw new Error("Invalid House of Jazzu product");
  }

  if (input.paymentStatus !== "PAID") {
    throw new Error("Only PAID transactions can enter verified revenue");
  }

  const ledger = load();

  const entry = {
    id: "REV-" + Date.now(),
    customer: String(input.customer || "Unknown"),
    product: input.product,
    description: String(input.description || "Verified payment"),
    amount,
    paymentStatus: "PAID",
    status: "VERIFIED",
    verifiedBy: "OWNER",
    verifiedAt: new Date().toISOString(),
    source: String(input.source || "MANUAL_OWNER_VERIFICATION")
  };

  ledger.entries.push(entry);
  save(ledger);

  return entry;
}

module.exports = {
  PRODUCTS,
  load,
  snapshot,
  recordPayment
};
