const fs = require('fs');
const path = require('path');

const POLICY_PATH = path.join(__dirname, 'autonomy-policy.json');
const policy = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));

function evaluate(action = {}) {
  const type = String(action.type || '').toLowerCase();

  const protectedTypes = [
    'financial',
    'money_movement',
    'application_submission',
    'external_commitment',
    'irreversible',
    'owner_approval'
  ];

  if (protectedTypes.includes(type)) {
    return {
      allowed: false,
      requiresOwnerApproval: true,
      reason: `${type} requires explicit owner approval`
    };
  }

  return {
    allowed: true,
    requiresOwnerApproval: false,
    reason: 'Action permitted under autonomous operator policy'
  };
}

function status() {
  return {
    system: policy.system,
    mode: policy.mode,
    policyVersion: policy.policyVersion,
    financialExecution: 'BLOCKED',
    moneyMovement: 'BLOCKED',
    applicationSubmission: 'BLOCKED',
    irreversibleActions: 'BLOCKED',
    ownerApprovalAutomation: 'BLOCKED'
  };
}

module.exports = { evaluate, status };
