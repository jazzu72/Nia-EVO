#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     📈 PREPARE SALES PITCH — NIA CAPITAL OS         ║"
echo "  ║     One‑Pager · Pitch Deck · Live Demo Script       ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

mkdir -p sales_pitch

# ─── 1. Generate One‑Pager Sales PDF (HTML → PDF) ──────────
echo "📄 Generating One‑Pager Sales Sheet..."
cat > sales_pitch/one_pager.html << 'HTML_EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nia Capital OS · One‑Pager</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0e14; color: #e8edf5; padding: 2rem; max-width: 900px; margin: auto; }
    h1 { font-size: 2.5rem; background: linear-gradient(135deg, #6c5ce7, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    h2 { color: #94a3b8; border-bottom: 1px solid #2a3548; padding-bottom: 0.5rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .card { background: #151e2a; border: 1px solid #2a3548; border-radius: 12px; padding: 1rem; }
    .stat { font-size: 2rem; font-weight: 700; color: #60a5fa; }
    .footer { margin-top: 2rem; font-size: 0.875rem; color: #64748b; }
  </style>
</head>
<body>
  <h1>🏰 Nia Capital OS</h1>
  <p style="font-size: 1.2rem; color: #94a3b8;">The First Fully Autonomous CEO for Small Business Operations</p>

  <h2>What She Does</h2>
  <div class="grid">
    <div class="card"><strong>📱 Outbound SMS</strong><br>Automated lead engagement via Twilio</div>
    <div class="card"><strong>🧠 AI Negotiation</strong><br>LLM‑powered reply generation (Mistral 7B)</div>
    <div class="card"><strong>📊 Deal Tracking</strong><br>Memory‑driven lead scoring and staging</div>
    <div class="card"><strong>💰 Revenue Reporting</strong><br>Quantum Vault treasury logging</div>
    <div class="card"><strong>📋 Grant Automation</strong><br>$1.625M pipeline auto‑submission</div>
    <div class="card"><strong>🩹 Self‑Healing</strong><br>Automatic crash recovery and restart</div>
  </div>

  <h2>Key Metrics</h2>
  <div class="grid">
    <div class="card"><span class="stat">7</span><br>Autonomous services</div>
    <div class="card"><span class="stat">$1.6M</span><br>Grant pipeline</div>
    <div class="card"><span class="stat">24/7</span><br>Uptime</div>
    <div class="card"><span class="stat">0</span><br>Human interventions</div>
  </div>

  <h2>What She Replaces</h2>
  <ul>
    <li>❌ Outbound sales teams</li>
    <li>❌ Manual lead follow‑up</li>
    <li>❌ Grant writers</li>
    <li>❌ Revenue tracking spreadsheets</li>
    <li>❌ IT support</li>
  </ul>

  <h2>The Pitch</h2>
  <p><em>“Nia Capital OS is a fully autonomous CEO that runs your entire sales and operations pipeline — without a human in the loop. Deploy in 15 minutes, run on any cloud, and start closing deals immediately.”</em></p>

  <div class="footer">House of Jazzu · Nia Capital OS v1.0 · Confidential</div>
</body>
</html>
HTML_EOF

# ─── 2. Generate Pitch Deck Outline ──────────────────────────
echo "📊 Generating Pitch Deck Outline..."
cat > sales_pitch/pitch_deck_outline.md << 'MD_EOF'
# Nia Capital OS — Pitch Deck Outline

## Slide 1: Title
- **Nia Capital OS**
- *The First Fully Autonomous CEO for Small Business Operations*
- House of Jazzu

## Slide 2: The Problem
- Small businesses rely on manual sales, outreach, and grant applications
- Human error, slow response times, and burnout limit revenue
- Hiring a sales team costs $100K–$200K/year

## Slide 3: The Solution
- **Nia Capital OS** — an autonomous CEO that runs operations 24/7
- Handles SMS outreach, AI negotiation, deal tracking, and grants
- No human in the loop

## Slide 4: How It Works
1. Outbound SMS via Twilio
2. Inbound replies → AI negotiation (Mistral 7B)
3. Lead scoring and staging in memory
4. Revenue logged in Quantum Vault
5. Grants submitted automatically

## Slide 5: Traction
- $1.625M grant pipeline
- 7 autonomous services running
- Live system deployed on Render
- Zero manual interventions

## Slide 6: Market Opportunity
- Small businesses: 33 million in the US
- $300B spent annually on sales and operations
- Addressable market: $10B+

## Slide 7: The Ask
- Seeking $500K seed
- Use: scaling deployment, adding more LLM capabilities, marketing
- Valuation: $5M pre‑money

## Slide 8: Team
- Built by a solo founder
- Nia handles operations
- You focus on growth

## Slide 9: Closing
- *“Nia Capital OS is not a tool — it’s a replacement for a COO.”*
- Live demo: http://localhost:3000
- Contact: lesane1972@gmail.com
MD_EOF

# ─── 3. Generate Live Demo Script ────────────────────────────
echo "🎬 Generating Live Demo Script..."
cat > sales_pitch/demo_script.txt << 'SCRIPT_EOF'
# Nia Capital OS — Live Demo Script (5 minutes)

## 0:00–0:30 — Intro
"Good morning. My name is [Your Name], founder of House of Jazzu. I'm going to show you Nia — a fully autonomous CEO that runs sales, outreach, and deal closing without a human in the loop."

## 0:30–1:00 — Dashboard Walkthrough
"Open your browser to http://localhost:3000. You'll see a live dashboard showing revenue, pipeline, leads, and deals — all updated in real time."

## 1:00–1:30 — Outbound SMS
"Behind the scenes, Nia is already sending SMS to sellers via Twilio. I'll show you the logs."

## 1:30–2:00 — AI Negotiation
"When a seller replies, Nia reads the message, detects intent, and generates a reply using Mistral 7B. This is not a script — it's real AI negotiation."

## 2:00–2:30 — Deal Tracking
"Every interaction is logged in memory. She remembers who she talked to, what they said, and what stage they're at."

## 2:30–3:00 — Revenue Tracking
"Every closed deal is logged in the Quantum Vault treasury. This shows you real‑time revenue."

## 3:00–4:00 — Q&A
"What questions do you have about the system, the AI, or the deployment model?"

## 4:00–5:00 — Close
"Nia Capital OS is production‑ready. She's running right now. Let me show you."
SCRIPT_EOF

# ─── 4. Create a Sales Summary Text File ─────────────────────
echo "📋 Creating Sales Summary..."
cat > sales_pitch/sales_summary.txt << 'SUMMARY_EOF'
NIA CAPITAL OS — SALES SUMMARY

Product: Nia Capital OS
Type: Fully Autonomous CEO for Small Business Operations
Deployment: 15 minutes, cloud‑agnostic
Pricing: $2,500/month or $25,000/year (includes support)

Capabilities:
- Outbound SMS (Twilio)
- AI negotiation (Mistral 7B)
- Lead tracking (memory.json)
- Revenue logging (Quantum Vault)
- Grant automation ($1.625M pipeline)
- Self‑healing (watcher.js)
- 7 autonomous services

Target Market:
- Real estate investors
- Property management companies
- Small business owners
- Grant‑dependent nonprofits

Key Differentiators:
- No human in the loop
- 24/7 uptime
- Self‑healing infrastructure
- Turnkey deployment

Pitch:
"Run your entire operations for less than the cost of one salary."

Contact:
lesane1972@gmail.com
SUMMARY_EOF

# ─── 5. Package everything ──────────────────────────────────
echo "📦 Packaging sales materials..."
cd sales_pitch
tar -czf nia_sales_pitch.tar.gz one_pager.html pitch_deck_outline.md demo_script.txt sales_summary.txt
cd ..

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     ✅ SALES PITCH PACKAGE READY                    ║"
echo "  ║     Files are in: ./sales_pitch/                    ║"
echo "  ║     ├── one_pager.html     (printable sales sheet)  ║"
echo "  ║     ├── pitch_deck_outline.md  (deck structure)    ║"
echo "  ║     ├── demo_script.txt    (live presentation)     ║"
echo "  ║     ├── sales_summary.txt  (quick overview)        ║"
echo "  ║     └── nia_sales_pitch.tar.gz  (all files)       ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
