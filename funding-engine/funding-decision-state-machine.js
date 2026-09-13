"use strict";

const STATES = Object.freeze({
  DISCOVERED: "DISCOVERED",
  VERIFIED: "VERIFIED",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  OWNER_APPROVED: "OWNER_APPROVED",
  SIGNED: "SIGNED",
  SUBMITTED: "SUBMITTED"
});

const TRANSITIONS = Object.freeze({
  DISCOVERED: ["VERIFIED"],
  VERIFIED: ["REVIEW_REQUIRED"],
  REVIEW_REQUIRED: ["OWNER_APPROVED"],
  OWNER_APPROVED: ["SIGNED"],
  SIGNED: ["SUBMITTED"],
  SUBMITTED: []
});

const OWNER_ONLY_STATES = new Set([
  STATES.OWNER_APPROVED,
  STATES.SIGNED,
  STATES.SUBMITTED
]);

const SAFETY = Object.freeze({
  submissionAllowed: false,
  signingAllowed: false,
  financialExecutionAllowed: false,
  moneyMovementAllowed: false,
  automaticApprovalAllowed: false,
  ownerApprovalRequired: true,
  ownerSignatureRequired: true
});

function assertState(state) {
  if (!Object.values(STATES).includes(state)) {
    throw new Error(`INVALID_FUNDING_STATE:${state}`);
  }
}

function canTransition(from, to) {
  assertState(from);
  assertState(to);

  return TRANSITIONS[from].includes(to);
}

function transition(from, to, actor = "SYSTEM") {
  assertState(from);
  assertState(to);

  if (!canTransition(from, to)) {
    throw new Error(`INVALID_FUNDING_TRANSITION:${from}->${to}`);
  }

  if (OWNER_ONLY_STATES.has(to) && actor !== "OWNER") {
    throw new Error(`OWNER_AUTHORITY_REQUIRED:${to}`);
  }

  return {
    from,
    to,
    actor,
    safety: SAFETY
  };
}

function initialRecord(id) {
  if (!id) {
    throw new Error("FUNDING_RECORD_ID_REQUIRED");
  }

  return {
    id,
    state: STATES.DISCOVERED,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false
  };
}

function advance(record, actor = "SYSTEM") {
  if (!record || !record.state) {
    throw new Error("FUNDING_RECORD_REQUIRED");
  }

  const next = TRANSITIONS[record.state];

  if (!next || next.length === 0) {
    throw new Error(`TERMINAL_FUNDING_STATE:${record.state}`);
  }

  const result = transition(record.state, next[0], actor);

  return {
    ...record,
    state: result.to
  };
}

module.exports = {
  STATES,
  TRANSITIONS,
  OWNER_ONLY_STATES,
  SAFETY,
  assertState,
  canTransition,
  transition,
  initialRecord,
  advance
};
