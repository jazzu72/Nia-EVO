const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/api/grants', (req, res) => {
  const grantsFile = path.join(__dirname, 'data/grants.json');
  if (!fs.existsSync(grantsFile)) {
    return res.json([]);
  }
  const grants = JSON.parse(fs.readFileSync(grantsFile, 'utf8'));
  res.json(grants);
});

app.get('/api/realestate', (req, res) => {
  const leadsFile = path.join(__dirname, 'data/real-estate-leads.json');
  if (!fs.existsSync(leadsFile)) {
    return res.json([]);
  }
  const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
  res.json(leads);
});

app.post('/api/realestate', (req, res) => {
  const leadsFile = path.join(__dirname, 'data/real-estate-leads.json');
  let leads = [];
  if (fs.existsSync(leadsFile)) {
    leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
  }
  const newLead = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
  leads.push(newLead);
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
  res.status(201).json(newLead);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏰 Nia OS (Grants + Real Estate) running on http://localhost:${PORT}`);
});

app.get('/api/revenue/leads',(req,res)=>{
  const ai = require('./data/ai-prospects.json');
  res.json(ai);
});

app.get('/api/revenue/pipeline',(req,res)=>{
  res.json({
    status:"active",
    aiProspects: require('./data/ai-prospects.json').length,
    realEstate: require('./data/real-estate-leads.json').length
  });
});


app.get('/api/revenue/pipeline',(req,res)=>{
  const pipeline=require('./data/revenue-pipeline.json');
  res.json({
    status:"Nia Revenue Pipeline Active",
    contacts:pipeline.contacts.length,
    appointments:pipeline.appointments.length,
    proposals:pipeline.proposals.length,
    closedDeals:pipeline.closedDeals.length,
    revenue:pipeline.revenue
  });
});


app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/public/dashboard/elite.html');
});

// ─── Revenue Pipeline Endpoint (full data) ──────────────────
app.get('/api/revenue/pipeline', (req, res) => {
  const pipeline = require('./data/revenue-pipeline.json');
  res.json({
    status: 'active',
    contacts: pipeline.contacts ? pipeline.contacts.length : 0,
    appointments: pipeline.appointments ? pipeline.appointments.length : 0,
    proposals: pipeline.proposals ? pipeline.proposals.length : 0,
    closedDeals: pipeline.closedDeals ? pipeline.closedDeals.length : 0,
    revenue: pipeline.revenue || 0
  });
});

// ─── CRM Activity Endpoints ──────────────────────────────────
const crmActivity = require('./crm-activity');

// Log a call/email/followup
app.post('/api/crm/activity/:contactId', (req, res) => {
  const { type, note } = req.body;
  const result = crmActivity.logActivity(req.params.contactId, type, note);
  if (!result) return res.status(404).json({ error: 'Contact not found' });
  res.json(result);
});

// Set follow-up date
app.post('/api/crm/followup/:contactId', (req, res) => {
  const { followUpDate } = req.body;
  const result = crmActivity.setFollowUp(req.params.contactId, followUpDate);
  if (!result) return res.status(404).json({ error: 'Contact not found' });
  res.json(result);
});

// Add a note
app.post('/api/crm/note/:contactId', (req, res) => {
  const { note } = req.body;
  const result = crmActivity.addNote(req.params.contactId, note);
  if (!result) return res.status(404).json({ error: 'Contact not found' });
  res.json(result);
});

// Get activity stats
app.get('/api/crm/activity/:contactId', (req, res) => {
  const stats = crmActivity.getActivityStats(req.params.contactId);
  if (!stats) return res.status(404).json({ error: 'Contact not found' });
  res.json(stats);
});

// Get deal probability
app.get('/api/crm/probability/:contactId', (req, res) => {
  const prob = crmActivity.getDealProbability(req.params.contactId);
  if (prob === null) return res.status(404).json({ error: 'Contact not found' });
  res.json({ probability: prob });
});

// ─── Revenue Conversion Engine ──────────────────────────────
const revenueEngine=require('./crm-revenue-engine');

app.post('/api/crm/proposal/:contactId/sent',(req,res)=>{
 res.json(revenueEngine.update(req.params.contactId,"proposalStatus","sent"));
});

app.post('/api/crm/proposal/:contactId/viewed',(req,res)=>{
 res.json(revenueEngine.update(req.params.contactId,"proposalStatus","viewed"));
});

app.post('/api/crm/appointment/:contactId',(req,res)=>{
 res.json(revenueEngine.update(req.params.contactId,"dealStatus","meeting"));
});

app.post('/api/crm/deal/:contactId/won',(req,res)=>{
 res.json(revenueEngine.update(req.params.contactId,"dealStatus","won"));
});

app.post('/api/crm/deal/:contactId/lost',(req,res)=>{
 res.json(revenueEngine.update(req.params.contactId,"dealStatus","lost"));
});

app.get('/api/crm/revenue-dashboard',(req,res)=>{
 const data=JSON.parse(fs.readFileSync('./data/revenue-pipeline.json'));
 res.json({
  revenue:data.revenue||0,
  closedDeals:data.closedDeals||[],
  activePipeline:data.contacts.filter(c=>c.probability>50).length
 });
});

// ─── MRR Endpoint ────────────────────────────────────────────
app.get('/api/crm/mrr', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/revenue-pipeline.json'));
  // Sum monthly values from closed deals (assuming each deal adds MRR)
  // For now, we use a simple placeholder: 10% of total revenue
  const mrr = Math.round(data.revenue * 0.1);
  res.json({
    mrr,
    totalRevenue: data.revenue,
    closedDeals: data.closedDeals?.length || 0
  });
});

// ─── Deposit Endpoint ────────────────────────────────────────
app.get('/api/crm/deposits', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/revenue-pipeline.json'));
  res.json({
    deposits: data.deposits || [],
    totalDeposited: (data.deposits || []).reduce((sum, d) => sum + d.amount, 0)
  });
});

// ─── Stripe Invoice & Payment Link ──────────────────────────
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

app.post('/api/crm/invoice/:contactId', async (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/revenue-pipeline.json'));
  const contact = data.contacts.find(c => c.id === req.params.contactId);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const amount = req.body.amount || 2500;
  const description = req.body.description || 'AI Automation Package';

  try {
    const invoice = await stripe.invoices.create({
      customer_email: contact.email || 'customer@example.com',
      description: description,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: { contactId: contact.id },
    });

    const invoiceItem = await stripe.invoiceItems.create({
      customer: invoice.customer,
      amount: amount * 100,
      currency: 'usd',
      description: description,
    });

    const finalInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    const invoiceUrl = finalInvoice.hosted_invoice_url;

    res.json({ success: true, invoiceId: invoice.id, invoiceUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
