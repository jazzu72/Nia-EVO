"use strict";

const revenue = require("../../house-of-jazzu/lib/revenue-ledger");

const PLAN = {
  objective: "HOUSE_OF_JAZZU_$1M_ANNUAL_REVENUE",
  mode: "CONTROLLED_EXECUTION",
  ownerAuthorizationRequired: true,

  products: [
    {
      id: "money-munchkins",
      target: 400000,
      priorities: [
        "Finalize production product",
        "Launch paid customer funnel",
        "Acquire pilot families and schools",
        "Track conversion and retention"
      ]
    },
    {
      id: "museforge-os",
      target: 350000,
      priorities: [
        "Define paid offer",
        "Build production MVP",
        "Acquire first design partners",
        "Convert pilots into contracts"
      ]
    },
    {
      id: "polish",
      target: 200000,
      priorities: [
        "Define paid offer",
        "Launch production MVP",
        "Acquire first customers",
        "Build repeatable acquisition"
      ]
    },
    {
      id: "partnerships",
      target: 50000,
      priorities: [
        "Identify strategic partners",
        "Prepare partnership packages",
        "Track qualified opportunities",
        "Require owner approval before commitments"
      ]
    }
  ]
};

function getOperatingPlan() {
  const financial = revenue.snapshot();

  return {
    ok: true,
    system: "HOUSE_OF_JAZZU_REVENUE_OPERATING_PLAN",
    objective: PLAN.objective,
    annualTarget: financial.annualTarget,
    verifiedRevenue: financial.verifiedRevenue,
    remaining: financial.remaining,
    progressPercent: financial.progressPercent,
    products: PLAN.products.map(product => {
      const actual = financial.products[product.id];

      return {
        id: product.id,
        target: product.target,
        verifiedRevenue: actual ? actual.revenue : 0,
        remaining: actual ? actual.remaining : product.target,
        progressPercent: actual ? actual.progressPercent : 0,
        priorities: product.priorities
      };
    }),
    governance: {
      externalExecutionAllowed: false,
      financialTransactions: false,
      contracts: false,
      ownerAuthorizationRequired: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  PLAN,
  getOperatingPlan
};
