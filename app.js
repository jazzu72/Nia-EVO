const revenue = require("./revenue/revenue-engine");const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// =================================
// NIA SECURITY GOVERNANCE
// =================================

const security =
require("./security/security-engine");


app.post(
"/api/security/audit",
(req,res)=>{

security.logAction(req.body);

res.json({
success:true
});

});


app.get(
"/api/security/audit",
(req,res)=>{

res.json(
security.audit()
);

});
// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});
// =================================
// NIA DOCUMENT AUTOMATION ENGINE
// =================================

const documents =
require("./documents/document-engine");


app.post(
"/api/documents/proposal",
async(req,res)=>{

const file =
await documents.createProposal(
req.body
);

res.json({

success:true,

file

});

});


app.get(
"/api/documents",
(req,res)=>{

res.json(
documents.list()
);

});
// ─── Business OS ─────────────────────────────────────────────
try {
  const businessRoutes = require('./modules/business/routes');
  app.use('/api/business', businessRoutes);
} catch (e) { console.warn('Business OS not loaded:', e.message); }

// ─── Career Engine ───────────────────────────────────────────
try {
  const careerRoutes = require('../../nia-career/app');
  app.use('/api/career', careerRoutes);
} catch (e) { console.warn('Career Engine not loaded:', e.message); }

// ─── Manual lead endpoint ──────────────────────────────────
app.post('/api/leads', (req, res) => {
  const { phone, name, address } = req.body;
  console.log(`📥 Manual lead added: ${name} (${phone}) at ${address}`);
  // In production, save to your leads database
  res.status(201).json({ success: true, message: 'Lead added' });
});
app.use(
"/api/capital",
require("./intelligence/capital-api")
);

// ─── Landing page ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`🏰 Nia OS running on http://${HOST}:${PORT}`);
});

// ─── Rescore all opportunities ──────────────────────────────
app.post('/api/rescore', (req, res) => {
app.post("/api/revenue/lead", (req, res) => {
  res.json(revenue.addLead(req.body));
});

app.get("/api/revenue/pipeline", (req, res) => {
  res.json(revenue.pipeline());
});  // Load your opportunities from database (e.g., grants.json, leads.json)
  // For example, we'll rescore grants from the grant hunter DB
  const fs = require('fs');
  const path = require('path');
  const grantsPath = path.join(__dirname, 'database/grants.json');
  if (!fs.existsSync(grantsPath)) {
    return res.status(404).json({ error: 'Grants database not found' });
  }
  const grants = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
  let updated = 0;
  grants.forEach(grant => {
    grant.score = require('./crm/scoring').scoreOpportunity(grant);
    updated++;
  });
  fs.writeFileSync(grantsPath, JSON.stringify(grants, null, 2));
  res.json({ success: true, rescored: updated });
});
// =================================
// NIA KNOWLEDGE BRAIN
// =================================

const memory =
require("./memory/knowledge-engine");


app.post(
"/api/memory/add",
(req,res)=>{

res.json(
memory.addMemory(req.body)
);

});


app.get(
"/api/memory/search",
(req,res)=>{

res.json(
memory.search(
req.query.q || ""
)
);

});


app.get(
"/api/memory/recent",
(req,res)=>{

res.json(
memory.recent()
);

});
// NIA EXECUTIVE COMMAND CENTER
const executiveAPI = require("./command-center/executive-api");

app.use(
  "/api/executive",
  executiveAPI
);

console.log("🏰 Executive Command Center Connected");
// =================================
// NIA AI AGENT COUNCIL
// =================================

const council =
require("./agents/agent-council");


app.post(
"/api/council/meeting",
(req,res)=>{

res.json(
council.councilMeeting(
req.body
)
);

});


app.get(
"/api/council/history",
(req,res)=>{

res.json(
council.history()
);

});
// =================================
// NIA FOUNDER INTELLIGENCE VAULT
// =================================

const vault =
require("./vault/founder-vault");


app.post(
"/api/vault/profile",
(req,res)=>{

const profile =
vault.updateProfile(req.body);


res.json({

success:true,

profile

});

});


app.get(
"/api/vault/profile",
(req,res)=>{

res.json(
vault.getProfile()
);

});

// NIA Opportunity Sync

const opportunitySync =
require("./integrations/opportunity-sync");


app.post("/api/sync/opportunities",(req,res)=>{

 const result =
 opportunitySync.syncOpportunities();

 res.json({
   status:"SYNC COMPLETE",
   result
 });

});
// =================================
// NIA AUTONOMOUS WORKFLOW ENGINE
// =================================

const workflow =
require("./workflows/workflow-engine");


app.post(
"/api/workflow/create",
(req,res)=>{

res.json(
workflow.createWorkflow(req.body)
);

});


app.get(
"/api/workflow/active",
(req,res)=>{

res.json(
workflow.active()
);

});


app.put(
"/api/workflow/:id/:stage",
(req,res)=>{

res.json(
workflow.advance(
req.params.id,
req.params.stage
)
);

});
// =================================
// NIA FUNDING CALENDAR
// =================================

const calendar =
require("./funding-calendar/calendar-engine");


app.post(
"/api/funding/deadline",
(req,res)=>{

const result =
calendar.addDeadline(req.body);

res.json({

success:true,

deadline:result

});

});



app.get(
"/api/funding/calendar",
(req,res)=>{

res.json(
calendar.upcoming()
);

});
// =================================
// NIA AUTONOMOUS RESEARCH API
// =================================

const research =
require("./research/research-agent");


app.post(
"/api/research/intel",
(req,res)=>{

const result =
research.addIntel(req.body);

res.json({

success:true,

intel:result

});

});



app.get(
"/api/research/intel",
(req,res)=>{

res.json(
research.getIntel()
);

});



app.get(
"/api/research/high-value",
(req,res)=>{

res.json(
research.highValueIntel()
);

});

// NIA Grant Intelligence

const grantAI =
require("./intelligence/grant-intelligence");


app.post("/api/grants/rank",(req,res)=>{


const ranked =
grantAI.rankGrants(
req.body.grants || []
);
// =================================
// NIA STRATEGIC PLANNING ENGINE
// =================================

const strategy =
require("./strategy/strategy-engine");


app.post(
"/api/strategy/goal",
(req,res)=>{

res.json(
strategy.createGoal(req.body)
);

});


app.get(
"/api/strategy/priorities",
(req,res)=>{

res.json(
strategy.recommend()
);

});


app.put(
"/api/strategy/:id/:status",
(req,res)=>{

res.json(
strategy.updateGoal(
req.params.id,
req.params.status
)
);

});
// =================================
// NIA DATA INTELLIGENCE ENGINE
// =================================

const analytics =
require("./analytics/data-engine");


app.post(
"/api/analytics/metric",
(req,res)=>{

res.json(
analytics.recordMetric(req.body)
);

});


app.get(
"/api/analytics",
(req,res)=>{

res.json(
analytics.getMetrics()
);

});


app.get(
"/api/analytics/summary",
(req,res)=>{

res.json(
analytics.summary()
);

});
grantAI.saveRanked(ranked);


res.json({

status:"GRANTS RANKED",

count:ranked.length,

top:
ranked.slice(0,5)

});


});

// =================================
// NIA CEO ALERT SYSTEM
// =================================

const alerts =
require("./alerts/ceo-alert-engine");


app.post(
"/api/ceo/alert",
(req,res)=>{

const result =
alerts.createAlert(req.body);


res.json({

success:true,

alert:result

});

});



app.get(
"/api/ceo/alerts",
(req,res)=>{

res.json(
alerts.getAlerts()
);

});



app.get(
"/api/ceo/critical",
(req,res)=>{

res.json(
alerts.criticalAlerts()
);

});
// =================================
// NIA LONG TERM MEMORY API
// =================================

const memory =
require("./memory/memory-engine");


app.post(
"/api/memory/add",
(req,res)=>{

const result =
memory.addMemory(req.body);


res.json({

success:true,

memory:result

});

});



app.get(
"/api/memory/search",
(req,res)=>{

res.json(
memory.searchMemory(
req.query.q || ""
)
);

});



app.get(
"/api/memory",
(req,res)=>{

res.json(
memory.allMemory()
);

});

// NIA Grant Application Factory

const applicationEngine =
require("./grants/application-engine");



app.post("/api/grants/application",(req,res)=>{


const application =
applicationEngine.createApplication(
req.body
);


res.json({

status:"APPLICATION CREATED",

application

});


});



app.get("/api/grants/applications",(req,res)=>{


res.json(
applicationEngine.getApplications()
);


});

// =================================
// NIA DECISION ENGINE
// =================================

const decision =
require("./decision/decision-engine");


app.post(
"/api/decision/evaluate",
(req,res)=>{

const result =
decision.evaluate(req.body);


res.json(result);

});



app.get(
// =================================
// NIA SENTINEL MONITORING
// =================================

const sentinel =
require("./sentinel/sentinel-engine");


app.get(
"/api/system/health",
async(req,res)=>{

const health =
await sentinel.checkServices();


res.json({

status:"Nia Sentinel Active",

services:health,

failures:
sentinel.detectFailures(health)

});

});"/api/decision/history",
(req,res)=>{

res.json(
decision.history()
);

});


// NIA DOCUMENT INTELLIGENCE

const docs =
require("./documents/document-engine");



// =================================
// NIA EXTERNAL CONNECTION HUB
// =================================

const connections =
require("./integrations/connection-engine");


app.post(
"/api/integrations/connect",
(req,res)=>{

res.json(
connections.addConnection(req.body)
);

});


app.get(
"/api/integrations",
(req,res)=>{

res.json(
connections.list()
);

});app.post("/api/documents/grant", async(req,res)=>{


const narrative =
docs.buildGrantNarrative(
req.body
);


const pdf =
await docs.createPDF(
"House-of-Jazzu-Grant-Proposal",
narrative
);



res.json({

status:"DOCUMENT CREATED",

file:pdf

});


});

// Revenue Intelligence

const revenue =
require("./revenue-engine/analyzer");


app.get(
"/api/revenue/intelligence",
(req,res)=>{

res.json(
revenue.analyze()
);

});

// ===============================
// NIA REVENUE INTELLIGENCE API
// ===============================

const revenue =
require("./intelligence/revenue-engine");


app.post("/api/revenue/add",(req,res)=>{

    res.json(
        revenue.addRevenue(req.body)
    );

});


app.get("/api/revenue/summary",(req,res)=>{

    res.json(
        revenue.summary()
    );

});

// =================================
// NIA COMMUNICATION ENGINE
// =================================

const communication =
require("./communication/communication-engine");


app.post(
"/api/communication/create",
(req,res)=>{

const message =
communication.createMessage(req.body);


res.json({

success:true,

message

});

});



app.get(
"/api/communication/messages",
(req,res)=>{

res.json(
communication.getMessages()
);

});

// ================================
// NIA GRANT EXECUTION ENGINE
// ================================

const grantExecution =
require("./grants/execution-engine");



app.post("/api/grants/plan",(req,res)=>{

const result =
grantExecution.createPlan(req.body);


res.json({

status:"GRANT PLAN CREATED",

result

});

});



app.get("/api/grants/plans",(req,res)=>{

res.json(
grantExecution.getPlans()
);

});



app.put("/api/grants/checklist/:id",(req,res)=>{


const result =
grantExecution.updateChecklist(
req.params.id,
req.body.task
);


if(!result)
return res.status(404)
.json({
error:"Grant not found"
});


res.json(result);


});

// =================================
// NIA EXECUTIVE DECISION ENGINE
// =================================

const executive =
require("./executive/executive-engine");


app.get(
"/api/executive/decision",
(req,res)=>{

res.json(
executive.analyze()
);

});



app.get(
"/api/executive/state",
(req,res)=>{

res.json(
executive.load()
);

});
// =================================
// NIA REVENUE CONVERSION ENGINE
// =================================

const revenue =
require("./conversion/revenue-engine");


app.post(
"/api/revenue/deal",
(req,res)=>{

res.json(
revenue.addDeal(req.body)
);

});



app.put(
"/api/revenue/deal/:id/:stage",
(req,res)=>{

res.json(
revenue.advanceDeal(
req.params.id,
req.params.stage
)
);

});



app.get(
"/api/revenue/forecast",
(req,res)=>{

res.json(
revenue.forecast()
);

});

// ───────── Revenue Engine API ─────────

const revenue =
require("./revenue/revenue-engine");
// =================================
// NIA AUTONOMOUS TASK SCHEDULER
// =================================

const scheduler =
require("./scheduler/task-engine");


app.post(
"/api/tasks/generate",
(req,res)=>{

res.json(
scheduler.generateDailyTasks()
);

});


app.get(
"/api/tasks",
(req,res)=>{

res.json(
scheduler.getPending()
);

});
// =================================
// NIA REVENUE CONVERSION ENGINE
// =================================

const revenue =
require("./revenue/revenue-engine");


app.post(
"/api/revenue/deal",
(req,res)=>{

const deal =
revenue.addDeal(req.body);


res.json({

success:true,

deal

});

});



app.get(
"/api/revenue/pipeline",
(req,res)=>{

res.json(
revenue.totals()
);

});



app.get(
"/api/revenue/forecast",
(req,res)=>{

res.json(
revenue.forecast()
);

});



app.put(
"/api/revenue/deal/:id",
(req,res)=>{

const deal =
revenue.updateDeal(
req.params.id,
req.body
);


res.json(deal);

});
app.post("/api/revenue/add",(req,res)=>{

const result =
revenue.addRevenue(req.body);

res.json(result);

});


app.get("/api/revenue/dashboard",(req,res)=>{

res.json(
revenue.pipeline()
);

});


const revenue =
require("./revenue/revenue-engine");


app.post("/api/revenue/add",(req,res)=>{

const result =
revenue.recordRevenue(req.body);

res.json({
success:true,
revenue:result
});

});


app.get("/api/revenue/dashboard",(req,res)=>{

res.json(
revenue.dashboard()
);

});
const grantHunter =
require("./grants-engine/grant-hunter");


app.post("/api/grants/add",
(req,res)=>{

const grant =
grantHunter.addGrant(req.body);

res.json({
success:true,
grant
});

});


app.get("/api/grants/top",
(req,res)=>{

res.json(
grantHunter.topGrants()
);

});
const grantWriter =
require("./grant-writer/application-generator");


app.post(
"/api/grants/application",
(req,res)=>{

const application =
grantWriter.createApplication(req.body);


res.json({

success:true,

application

});

});
// =================================
// NIA GRANT SUBMISSION ASSISTANT
// =================================

const submission =
require("./submission-engine/submission-manager");


app.post(
"/api/submissions/create",
(req,res)=>{

const result =
submission.createSubmission(req.body);

res.json({
success:true,
submission:result
});

});


app.get(
"/api/submissions",
(req,res)=>{

res.json(
submission.getSubmissions()
);

});


app.put(
"/api/submissions/:id/document",
(req,res)=>{

const result =
submission.updateDocument(
req.params.id,
req.body.document
);


if(!result)
return res.status(404)
.json({
error:"Submission not found"
});


res.json(result);

});
// =================================
// NIA GRANT AUTO PACKET GENERATOR
// =================================

const packageGenerator =
require("./grant-writer/package-generator");


app.post(
"/api/grants/package",
(req,res)=>{


const result =
packageGenerator.generatePackage(
req.body.grant,
req.body.founder
);


res.json({

success:true,

packageLocation:result

});


});
// =================================
// NIA AUTONOMOUS ACTION ENGINE
// =================================

const actions =
require("./action/action-engine");


app.post(
"/api/actions/create",
(req,res)=>{

const result =
actions.createAction(req.body);


res.json({

success:true,

action:result

});

});



app.get(
"/api/actions",
(req,res)=>{

res.json(
actions.getActions()
);

});



app.get(
"/api/actions/pending",
(req,res)=>{

res.json(
actions.pending()
);

});



app.put(
"/api/actions/:id/complete",
(req,res)=>{

const result =
actions.completeAction(
req.params.id
);


res.json(result);

});
// =================================
// NIA OUTREACH AUTOMATION ENGINE
// =================================

const outreach =
require("./outreach/outreach-engine");


app.post(
"/api/outreach/contact",
(req,res)=>{

const contact =
outreach.addContact(req.body);


res.json({
success:true,
contact
});

});



app.get(
"/api/outreach/contacts",
(req,res)=>{

res.json(
outreach.all()
);

});



app.get(
"/api/outreach/followups",
(req,res)=>{

res.json(
outreach.followUps()
);

});



app.put(
"/api/outreach/contact/:id",
(req,res)=>{

const result =
outreach.updateContact(
req.params.id,
req.body
);


res.json(result);

});
// =================================
// NIA FINANCIAL INTELLIGENCE ENGINE
// =================================

const finance =
require("./finance/finance-engine");



app.post(
"/api/finance/transaction",
(req,res)=>{

const tx =
finance.addTransaction(req.body);


res.json({

success:true,

transaction:tx

});

});



app.get(
"/api/finance/summary",
(req,res)=>{

res.json(
finance.summary()
);

});



app.get(
"/api/finance/runway/:cash",
(req,res)=>{

res.json(
finance.runway(
Number(req.params.cash)
)
);

});
// =================================
// NIA COMMUNICATION ENGINE
// =================================

const communication =
require("./communication/message-engine");


app.post(
"/api/messages/create",
(req,res)=>{

res.json(
communication.createMessage(req.body)
);

});


app.get(
"/api/messages",
(req,res)=>{

res.json(
communication.getQueue()
);

});


app.post(
"/api/messages/followup",
(req,res)=>{

res.json(
communication.queueFollowUp(req.body)
);

});
// =================================
// NIA SALES INTELLIGENCE ENGINE
// =================================

const sales =
require("./sales/sales-engine");


app.post(
"/api/sales/interaction",
(req,res)=>{

res.json(
sales.addInteraction(req.body)
);

});


app.post(
"/api/sales/analyze",
(req,res)=>{

res.json(
sales.analyzeLead(req.body)
);

});


app.get(
"/api/sales/performance",
(req,res)=>{

res.json(
sales.performance()
);

});
// =================================
// NIA FUNDING INTELLIGENCE 2.0
// =================================

const funding =
require("./funding/funding-engine");


app.post(
"/api/funding/add",
(req,res)=>{

res.json(
funding.addFunding(req.body)
);

});


app.get(
"/api/funding/top",
(req,res)=>{

res.json(
funding.prioritize()
);

});


app.put(
"/api/funding/:id/:status",
(req,res)=>{

res.json(
funding.updateStatus(
req.params.id,
req.params.status
)
);

});

// ─── Prospects API ──────────────────────────────────────────
const prospects = require('./modules/revenue/prospects');

app.post('/api/prospects', (req, res) => {
  const prospect = prospects.add(req.body);
  res.status(201).json(prospect);
});

app.get('/api/prospects', (req, res) => {
  const { highPriority, minScore } = req.query;
  if (highPriority === 'true') {
    const min = parseInt(minScore) || 50;
    res.json(prospects.getHighPriority(min));
  } else {
    res.json(prospects.list());
  }
});

app.put('/api/prospects/:id', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const prospect = prospects.updateStatus(req.params.id, status);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
  res.json(prospect);
});

app.delete('/api/prospects/:id', (req, res) => {
  const count = prospects.remove(req.params.id);
  res.json({ removed: count });
});

// ─── Prospect Discovery API ──────────────────────────────────
const hunter = require('./modules/revenue/prospects/prospect-hunter');

app.post('/api/prospects/discover', (req, res) => {
  const prospects = hunter.discoverBusinesses();
  res.json(prospects);
});

app.get('/api/prospects/top', (req, res) => {
  res.json(hunter.topProspects());
});
