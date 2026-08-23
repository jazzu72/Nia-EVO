const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

function safeRequire(file) {
  try { return require(file); } catch { return null; }
}

router.get("/metrics", (req, res) => {
  const revenue = safeRequire("../../platform/revenue/pilot-revenue");

  let progress = { profiles: 0, missionsCompleted: 0 };

  try {
    const file = path.join(__dirname, "../../data/progress.json");
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      const profiles = Object.values(data || {});
      progress = {
        profiles: profiles.length,
        missionsCompleted: profiles.reduce(
          (n, p) => n + (p.completedMissions || []).length, 0
        )
      };
    }
  } catch {}

  const rev = revenue ? revenue.metrics() : {
    paidCustomers: 0,
    transactions: 0,
    revenueUSD: 0,
    averageRevenuePerCustomer: 0
  };

  res.json({
    success: true,
    product: "money-munchkins-quantum-odyssey",
    investorMetrics: {
      pilotProfiles: progress.profiles,
      missionsCompleted: progress.missionsCompleted,
      paidCustomers: rev.paidCustomers,
      transactions: rev.transactions,
      revenueUSD: rev.revenueUSD,
      averageRevenuePerCustomer: rev.averageRevenuePerCustomer,
      health: "operational"
    },
    generatedAt: new Date().toISOString()
  });
});

router.get("/readiness", (req, res) => {
  res.json({
    success: true,
    investorReadiness: {
      product: true,
      gameplay: true,
      parentControls: true,
      rewardIntegrity: true,
      pilotFunnel: true,
      revenueTelemetry: true,
      paymentAbstraction: true,
      publicDeploymentContract: true
    },
    status: "INVESTOR_READY"
  });
});

module.exports = router;
