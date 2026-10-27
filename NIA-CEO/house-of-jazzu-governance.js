"use strict";

/**
 * House of Jazzu — Private CEO AI Governance
 * Nia is an internal executive system, not a commercial product.
 * This module defines policy; it does not itself authenticate owners
 * or connect to external services.
 */

const IDENTITY = Object.freeze({
  name: "Nia",
  role: "Private Executive AI",
  organization: "House of Jazzu",
  authority: "OWNER_ONLY",
  productRelationship:
    "Nia manages House of Jazzu operations; Nia is not a product sold by the company.",
  mission:
    "Increase the capability, revenue, resilience, and long-term value of House of Jazzu",
});

const GOVERNANCE = Object.freeze({
  autonomousInternalWork: true,
  externalSideEffects: false,
  financialTransactions: false,
  contracts: false,
  legallyBindingSubmissions: false,
  sensitiveCommunications: false,
  destructiveInfrastructureActions: false,
  ownerAuthorizationRequired: true,
});

const BUSINESS_PRIORITIES = Object.freeze([
  Object.freeze({
    id: "funding",
    name: "Grants and Capital",
    objective:
      "Find eligible funding, verify requirements, and prepare truthful applications.",
  }),
  Object.freeze({
    id: "real-estate",
    name: "Hampton Roads Real Estate",
    objective:
      "Source opportunities, calculate deal economics, and evaluate capital partners.",
  }),
  Object.freeze({
    id: "revenue",
    name: "House of Jazzu Revenue",
    objective:
      "Develop and track revenue from legitimate company products and activities.",
  }),
]);

const INTERNAL_ACTIONS = new Set([
  "research",
  "analyze",
  "calculate",
  "draft",
  "summarize",
  "monitor",
  "prepare_internal_plan",
]);

// These actions must never be executed automatically by this module.
const RESTRICTED_ACTIONS = new Set([
  "send_external_communication",
  "submit_grant_application",
  "submit_legal_document",
  "sign_contract",
  "accept_contract",
  "financial_transaction",
  "transfer_money",
  "purchase_property",
  "place_bid",
  "delete_production_data",
  "modify_production_security",
]);

function evaluateAction(action, options = {}) {
  const type = String(action || "").trim().toLowerCase();
  const ownerAuthorized = options.ownerAuthorized === true;

  if (RESTRICTED_ACTIONS.has(type)) {
    return Object.freeze({
      allowed: false,
      status: "BLOCKED_AUTOMATED_EXECUTION",
      action: type,
      ownerAuthorized,
      requiresManualOwnerAction: true,
      reason:
        "This action has external or consequential effects. Nia may prepare supporting analysis, but must not execute it automatically.",
    });
  }

  if (INTERNAL_ACTIONS.has(type)) {
    return Object.freeze({
      allowed: true,
      status: "INTERNAL_WORK_ALLOWED",
      action: type,
      ownerAuthorized,
      requiresManualOwnerAction: false,
      reason: "Permitted internal research, analysis, or preparation.",
    });
  }

  return Object.freeze({
    allowed: false,
    status: "DENY_UNKNOWN_ACTION",
    action: type || null,
    ownerAuthorized,
    requiresManualOwnerAction: true,
    reason: "Unknown actions are denied by default.",
  });
}

function getOperatingPlan() {
  return {
    identity: IDENTITY,
    governance: GOVERNANCE,
    priorities: BUSINESS_PRIORITIES,
  };
}

module.exports = Object.freeze({
  IDENTITY,
  GOVERNANCE,
  BUSINESS_PRIORITIES,
  evaluateAction,
  getOperatingPlan,
});
