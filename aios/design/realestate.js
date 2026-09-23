/*
  NIA REAL ESTATE — find, evaluate, inquire
  Uses public data sources. Scores deals. Sends owner-approved inquiries.
  No external execution. No money movement.
*/

const fs = require("fs");
const path = require("path");
const envelopes = require("./t2-envelopes");

const DEALS_FILE = "data/realestate/deals.json";
const INQUIRIES_LOG = "data/realestate/inquiries.jsonl";

function ensure() {
  const d = path.dirname(DEALS_FILE);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function loadDeals() {
  ensure();
  try { return JSON.parse(fs.readFileSync(DEALS_FILE, "utf8")); }
  catch (e) { return { deals: [], updated_at: null }; }
}

function saveDeals(data) {
  ensure();
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(DEALS_FILE, JSON.stringify(data, null, 2));
}

// ─── SCORING ────────────────────────────────────────────────
// Cash-flow / flip scoring model
function scoreDeal(deal) {
  const price = Number(deal.price) || 0;
  const rent = Number(deal.rent) || 0;
  const repairs = Number(deal.repairs) || 0;
  const arv = Number(deal.arv) || price * 1.25;  // after-repair value

  // 1% rule — monthly rent / price
  const onePercent = price > 0 ? (rent / price) : 0;
  // 50% rule — NOI estimate
  const noi = rent * 0.5 * 12;
  // Cap rate
  const capRate = price > 0 ? (noi / price) : 0;
  // Cash-on-cash at 25% down, 8% interest, 30y
  const downPayment = price * 0.25;
  const loan = price - downPayment;
  const monthlyRate = 0.08 / 12;
  const n = 30 * 12;
  const mortgage = loan > 0 ? (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : 0;
  const monthlyCashFlow = rent * 0.5 - mortgage;
  const cashOnCash = downPayment > 0 ? (monthlyCashFlow * 12 / downPayment) : 0;
  // Flip spread
  const flipSpread = arv - price - repairs;
  const flipPct = price > 0 ? (flipSpread / price) : 0;

  // Weighted score 0-100
  let score = 0;
  score += Math.min(30, onePercent * 3000);        // 1% rule up to 30 pts
  score += Math.min(25, capRate * 400);            // cap rate up to 25 pts
  score += Math.min(25, cashOnCash * 100);         // CoC up to 25 pts
  score += Math.min(20, flipPct * 100);            // flip spread up to 20 pts

  const verdict = score >= 70 ? "STRONG_BUY" :
                  score >= 55 ? "BUY" :
                  score >= 40 ? "REVIEW" :
                  score >= 25 ? "WATCH" : "PASS";

  return {
    score: Math.round(score),
    verdict: verdict,
    metrics: {
      one_percent_rule: Number(onePercent.toFixed(4)),
      cap_rate: Number(capRate.toFixed(4)),
      cash_on_cash: Number(cashOnCash.toFixed(4)),
      monthly_cash_flow: Math.round(monthlyCashFlow),
      flip_spread: Math.round(flipSpread),
      flip_pct: Number(flipPct.toFixed(4)),
      arv: Math.round(arv)
    }
  };
}

// ─── ADD DEAL ───────────────────────────────────────────────
function addDeal(deal) {
  const data = loadDeals();
  const id = "RE-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
  const scored = scoreDeal(deal);
  const entry = Object.assign({}, deal, {
    id: id,
    added_at: new Date().toISOString(),
    score: scored.score,
    verdict: scored.verdict,
    metrics: scored.metrics,
    status: "NEW"
  });
  data.deals.push(entry);
  saveDeals(data);
  return entry;
}

// ─── LIST / FILTER ──────────────────────────────────────────
function listDeals(filter) {
  filter = filter || {};
  let deals = loadDeals().deals || [];
  if (filter.verdict) deals = deals.filter(function (d) { return d.verdict === filter.verdict; });
  if (filter.status) deals = deals.filter(function (d) { return d.status === filter.status; });
  if (filter.min_score) deals = deals.filter(function (d) { return d.score >= filter.min_score; });
  return deals.sort(function (a, b) { return b.score - a.score; });
}

// ─── SEND INQUIRY ───────────────────────────────────────────
async function sendInquiry(dealId, customMessage) {
  const decision = envelopes.checkEnvelope("inquiry_real_estate", 0, {});
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason };
  }

  const data = loadDeals();
  const deal = (data.deals || []).find(function (d) { return d.id === dealId; });
  if (!deal) return { ok: false, error: "deal_not_found" };
  if (!deal.agent_email) return { ok: false, error: "no_agent_email_on_deal" };

  const exec = require("./executive-actions");
  const body = customMessage || [
    "Hello,",
    "",
    "I'm writing from House of Jazzu LLC, a Norfolk-based real estate investment company.",
    "",
    "Property: " + (deal.address || "[address]"),
    "Listed at: $" + (deal.price || 0).toLocaleString(),
    "",
    "We are actively evaluating this property for acquisition. If it is still available, we would like to schedule a walkthrough and discuss terms with the seller.",
    "",
    "Please advise on availability and next steps.",
    "",
    "Thank you,",
    "Jason LeSane",
    "House of Jazzu LLC",
    "Norfolk, Virginia",
    "757-339-9245",
    "lesane1972@gmail.com"
  ].join("\n");

  const result = await exec.sendViaGmail({
    to: [deal.agent_email],
    subject: "Inquiry: " + (deal.address || "Norfolk area property"),
    body: body,
    reply_to: "lesane1972@gmail.com"
  });

  // Log the inquiry
  ensure();
  fs.appendFileSync(INQUIRIES_LOG, JSON.stringify({
    ts: new Date().toISOString(),
    deal_id: dealId,
    to: deal.agent_email,
    result: result
  }) + "\n");

  if (result.ok) {
    deal.status = "INQUIRED";
    deal.inquired_at = new Date().toISOString();
    saveDeals(data);
  }

  return Object.assign({ deal_id: dealId, to: deal.agent_email }, result);
}

// ─── HAMPTON ROADS SEED DATA ────────────────────────────────
// Starter deals for demonstration — replace with real listings
const SEED_DEALS = [
  { address: "1234 Ocean View Ave, Norfolk, VA 23503", price: 245000, rent: 2100, repairs: 15000, type: "single_family", market: "Norfolk" },
  { address: "567 Colonial Ave, Norfolk, VA 23507", price: 385000, rent: 2800, repairs: 25000, type: "duplex", market: "Norfolk" },
  { address: "890 Portsmouth Blvd, Portsmouth, VA 23704", price: 165000, rent: 1450, repairs: 20000, type: "single_family", market: "Portsmouth" },
  { address: "210 Hampton Roads Ave, Hampton, VA 23669", price: 195000, rent: 1700, repairs: 10000, type: "single_family", market: "Hampton" },
  { address: "3400 Virginia Beach Blvd, Virginia Beach, VA 23452", price: 425000, rent: 3200, repairs: 30000, type: "triplex", market: "Virginia Beach" }
];

function seedDeals() {
  const existing = listDeals({});
  if (existing.length > 0) return { seeded: 0, message: "deals already exist" };
  const added = SEED_DEALS.map(addDeal);
  return { seeded: added.length, deals: added.map(function (d) { return { id: d.id, address: d.address, score: d.score, verdict: d.verdict }; }) };
}

module.exports = { addDeal, listDeals, scoreDeal, sendInquiry, seedDeals };
