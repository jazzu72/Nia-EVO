const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(CUSTOMERS_FILE)) {
  fs.writeFileSync(CUSTOMERS_FILE, '{}\n', { mode: 0o600 });
}

const PLAN_ENTITLEMENTS = {
  scout: {
    intelligence: true,
    funding_radar: false,
    revenue_operations: false,
    executive_workspace: false,
    enterprise_controls: false,
  },
  growth: {
    intelligence: true,
    funding_radar: true,
    revenue_operations: true,
    executive_workspace: false,
    enterprise_controls: false,
  },
  executive: {
    intelligence: true,
    funding_radar: true,
    revenue_operations: true,
    executive_workspace: true,
    enterprise_controls: false,
  },
  enterprise: {
    intelligence: true,
    funding_radar: true,
    revenue_operations: true,
    executive_workspace: true,
    enterprise_controls: true,
  },
};

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeDB(db) {
  const tmp = `${CUSTOMERS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, CUSTOMERS_FILE);
}

function buildEntitlements(planId) {
  return {
    ...(PLAN_ENTITLEMENTS[planId] || PLAN_ENTITLEMENTS.scout),
    external_execution: false,
    autonomous_execution: false,
    human_approval_required: true,
  };
}

function upsertFromCheckout(session) {
  const db = readDB();
  const customerId = session.customer || `checkout_${session.id}`;
  const planId = session.metadata?.planId || 'scout';

  db[customerId] = {
    ...(db[customerId] || {}),
    customer_id: customerId,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    stripe_checkout_session_id: session.id,
    email: session.customer_details?.email || null,
    plan_id: planId,
    subscription_status: 'active',
    entitlements: buildEntitlements(planId),
    updated_at: new Date().toISOString(),
  };

  writeDB(db);
  return db[customerId];
}

function updateSubscription(subscription) {
  const db = readDB();
  const customerId = subscription.customer;
  const existing = db[customerId] || {};
  const planId = existing.plan_id || subscription.metadata?.planId || 'scout';

  db[customerId] = {
    ...existing,
    customer_id: customerId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan_id: planId,
    subscription_status: subscription.status,
    entitlements: buildEntitlements(planId),
    updated_at: new Date().toISOString(),
  };

  writeDB(db);
  return db[customerId];
}

module.exports = {
  upsertFromCheckout,
  updateSubscription,
};
