"use strict";

const express = require("express");
const router = express.Router();
const roadmap = require("../NIA-CEO/strategy/million-dollar-roadmap");
const revenue = require("./lib/revenue-ledger");

function snapshot() {
  const financial = revenue.snapshot();

  return {
    ok: true,
    company: "House of Jazzu",
    executive: {
      name: "Nia",
      role: "Private AI CEO",
      visibility: "PRIVATE",
      ownerOnly: true,
      externalExecution: false,
      ownerAuthorizationRequired: true
    },
    objective: {
      name: "Million-Dollar House",
      annualRevenueTarget: 1000000,
      actualRevenue: financial.verifiedRevenue,
      remainingRevenue: financial.remaining,
      progressPercent: financial.progressPercent
    },
    verifiedRevenue: financial,
    publicProducts: [
      "Money Munchkins",
      "MuseForge OS",
      "Polish"
    ],
    roadmap: {
      phases: roadmap.ROADMAP.phases,
      kpis: roadmap.ROADMAP.kpis
    },
    timestamp: new Date().toISOString()
  };
}

router.get("/snapshot", (_req, res) => {
  res.json(snapshot());
});

router.get("/revenue", (_req, res) => {
  res.json(revenue.snapshot());
});

router.get("/roadmap", (_req, res) => {
  res.json({ ok: true, roadmap: roadmap.getRoadmap() });
});

router.get("/ventures", (_req, res) => {
  res.json({
    ok: true,
    ventures: revenue.snapshot().products
  });
});

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    system: "HOUSE_OF_JAZZU",
    executive: "NIA",
    mode: "PRIVATE_EXECUTIVE",
    execution: "CONTROLLED",
    revenueAuthority: "VERIFIED_PAYMENT_LEDGER",
    externalExecutionAllowed: false,
    ownerAuthorizationRequired: true
  });
});

/*
 * Owner-only revenue verification.
 * No payment processing occurs here.
 * This records a payment only after the owner confirms it was actually PAID.
 */
router.post("/revenue/verify", (req, res) => {
  try {
    const entry = revenue.recordPayment(req.body || {});
    res.status(201).json({
      ok: true,
      verified: true,
      transaction: entry,
      snapshot: revenue.snapshot()
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      verified: false,
      error: err.message
    });
  }
});

module.exports = router;
