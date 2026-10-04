"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const roadmap = require("../NIA-CEO/strategy/million-dollar-roadmap");

const DATA_FILE = path.join(__dirname, "data", "house-state.json");

const DEFAULT_STATE = {
  revenue: {
    actual: 0,
    annualTarget: 1000000
  },
  ventures: {
    "money-munchkins": { revenue: 0, target: 400000, customers: 0 },
    "museforge-os": { revenue: 0, target: 350000, customers: 0 },
    "polish": { revenue: 0, target: 200000, customers: 0 },
    partnerships: { revenue: 0, target: 50000, customers: 0 }
  }
};

function ensureState() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
  }
}

function readState() {
  ensureState();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return structuredClone(DEFAULT_STATE);
  }
}

function snapshot() {
  const state = readState();
  const target = 1000000;
  const actual = Number(state.revenue.actual) || 0;

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
      annualRevenueTarget: target,
      actualRevenue: actual,
      remainingRevenue: Math.max(target - actual, 0),
      progressPercent: Number(((actual / target) * 100).toFixed(2))
    },
    ventures: state.ventures,
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

/*
 * READ-ONLY executive House dashboard API.
 * No financial transactions.
 * No contracts.
 * No external execution.
 */
router.get("/snapshot", (_req, res) => {
  res.json(snapshot());
});

router.get("/roadmap", (_req, res) => {
  res.json({
    ok: true,
    roadmap: roadmap.getRoadmap()
  });
});

router.get("/ventures", (_req, res) => {
  res.json({
    ok: true,
    ventures: snapshot().ventures
  });
});

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    system: "HOUSE_OF_JAZZU",
    executive: "NIA",
    mode: "PRIVATE_EXECUTIVE",
    execution: "CONTROLLED",
    externalExecutionAllowed: false,
    ownerAuthorizationRequired: true
  });
});

module.exports = router;
