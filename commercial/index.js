const express = require('express');
const router = express.Router();
router.use((req,res,next)=>{
  if(req.path === '/webhook') return next();
  express.json()(req,res,next);
});
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const entitlements = require('./customer-entitlements');

const PLANS = {
  scout: {
    id: 'scout',
    name: 'Nia Scout',
    monthly: 99,
    description: 'Opportunity intelligence for founders and small businesses.',
    priceId: process.env.STRIPE_PRICE_SCOUT,
  },
  growth: {
    id: 'growth',
    name: 'Nia Growth',
    monthly: 299,
    description: 'Funding, revenue and opportunity operations with approval workflows.',
    priceId: process.env.STRIPE_PRICE_GROWTH,
  },
  executive: {
    id: 'executive',
    name: 'Nia Executive',
    monthly: 799,
    description: 'Executive-level intelligence, workflows and operating visibility.',
    priceId: process.env.STRIPE_PRICE_EXECUTIVE,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Nia Enterprise',
    monthly: 2500,
    description: 'Custom deployment, governance and enterprise operating support.',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
  },
};

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    product: 'Nia Executive OS',
    commercial_layer: 'online',
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    webhook_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    governance: {
      external_execution: false,
      autonomous_execution: false,
      human_approval_required: true,
    },
  });
});

router.get('/plans', (req, res) => {
  const plans = Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    monthly: p.monthly,
    description: p.description,
    checkout_configured: !!p.priceId,
  }));
  res.json({ ok: true, product: 'Nia Executive OS', plans });
});

router.post('/create-checkout-session', async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan id' });
  }
  const priceId = plan.priceId;
  if (!priceId) {
    return res.status(400).json({ error: 'Plan price not configured in .env' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { planId: plan.id },
      success_url: `${process.env.PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_APP_URL || 'http://localhost:3000'}/cancel`,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(400).send('Webhook secret not configured');
  }
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`Webhook received: ${event.type}`);
    if (event.type === 'checkout.session.completed') {
      entitlements.upsertFromCheckout(event.data.object);
      console.log('[COMMERCIAL] Customer entitlement activated');
    } else if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      entitlements.updateSubscription(event.data.object);
      console.log('[COMMERCIAL] Subscription entitlement synchronized');
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

router.get('/customer/:id', (req, res) => {
  const fs = require('fs');
  const db = JSON.parse(fs.readFileSync(
    require('path').join(__dirname, 'data', 'customers.json'), 'utf8'
  ));
  const customer = db[req.params.id];
  if (!customer) return res.status(404).json({ ok: false, error: 'Customer not found' });
  res.json({ ok: true, customer });
});

module.exports = router;
