# NIA-EVO
### Sovereign Real Estate Acquisition Platform
**House of Jazzu · Operator: J. LeSane · Node: 23505-Sovereign**

---

NIA-EVO is a full-stack deal pipeline and automation platform built for sovereign real estate acquisition. It combines a modular Node.js intelligence API with a Next.js dashboard, real-time WebSocket deal feeds, a multi-agent brain engine, and an n8n workflow bridge — all deployable from a Pixel/Termux environment to Render and Vercel.

---

## Table of Contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Agent System](#agent-system)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [WebSocket Protocol](#websocket-protocol)
- [n8n Integration](#n8n-integration)
- [Jarvis Commands](#jarvis-commands)
- [Deal Schema](#deal-schema)
- [Scoring Model](#scoring-model)
- [Risk Flag Matrix](#risk-flag-matrix)

---

## Stack

| Layer       | Technology                          | Host     |
|-------------|-------------------------------------|----------|
| API         | Node.js · Express · WebSockets (ws) | Render   |
| Frontend    | Next.js 14 · Tailwind CSS           | Vercel   |
| Agents      | NiaBrain · Savon · Kano             | In-proc  |
| Persistence | JSON flat-file (db.json)            | Local / Render disk |
| Automation  | n8n webhook bridge                  | Self-hosted |
| Dev device  | Pixel / Termux · Lexar 128GB vault  | Local    |

---

## Architecture

```
Client Request (UI / curl / WebSocket)
        │
        ▼
API Gateway — Express (server.js)
  CORS · JSON middleware · broadcast injected via req
        │
        ▼
Router — routes/cmd.route.js
  POST /cmd · CRUD /deals · GET /metrics
        │
        ▼
Controller — controllers/cmd.controller.js
  Parse input · call Brain · write DB · shape response
        │
        ├──────────────────────────────┐
        ▼                              ▼
Brain Engine                    DB Layer (db.js)
  NiaBrain (orchestrator)         readDB / writeDB
    ├── Savon (deal analyst)       JSON persistence
    └── Kano  (risk + execution)   Auto-seeds on first boot
        │
        ▼
Event Logger — utils/logger.js
  Console (colored) + logs/nia.log (2MB rotation)
        │
        ▼
n8n Bridge — services/n8n.service.js
  Fire-and-forget · 8s timeout · 1 retry · never blocks response
        │
        ▼
n8n Workflows / External APIs (optional)
```

---

## Project Structure

```
nia-evo/
│
├── apps/
│   │
│   ├── api/                          # Node.js backend → Render
│   │   ├── server.js                 # HTTP + WebSocket bootstrap
│   │   │
│   │   ├── config/
│   │   │   └── env.js                # Single source for all env vars
│   │   │
│   │   ├── routes/
│   │   │   └── cmd.route.js          # Route map — no logic here
│   │   │
│   │   ├── controllers/
│   │   │   └── cmd.controller.js     # Request handling + response shaping
│   │   │
│   │   ├── agents/
│   │   │   ├── NiaBrain.js           # Master orchestrator + session memory
│   │   │   ├── Savon.js              # Deal analyst — scoring + LOI params
│   │   │   └── Kano.js               # Risk intelligence + execution planner
│   │   │
│   │   ├── services/
│   │   │   └── n8n.service.js        # n8n webhook bridge
│   │   │
│   │   ├── utils/
│   │   │   └── logger.js             # Named loggers, file + console output
│   │   │
│   │   ├── db.js                     # readDB / writeDB — shared persistence
│   │   ├── package.json              # CJS — no "type":"module"
│   │   ├── .env                      # Local dev env vars
│   │   └── render.yaml               # Render deploy config
│   │
│   └── web/                          # Next.js frontend → Vercel
│       ├── src/
│       │   ├── pages/
│       │   │   ├── _app.js
│       │   │   └── index.js          # Main dashboard
│       │   ├── components/
│       │   │   ├── DealCard.js
│       │   │   ├── StatusPill.js
│       │   │   ├── Stat.js
│       │   │   └── Terminal.js       # Jarvis terminal UI
│       │   ├── hooks/
│       │   │   └── useWebSocket.js   # Auto-reconnect WS hook
│       │   ├── lib/
│       │   │   └── fmt.js            # Currency + percentage formatters
│       │   └── styles/
│       │       └── globals.css
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── vercel.json
│       └── .env.local
│
├── logs/
│   └── nia.log                       # Rolling log (2MB max)
│
├── .env                              # Root env (Termux dev)
├── package.json                      # Root scripts
└── README.md
```

---

## Agent System

The brain engine uses three cooperating agents. Every request to `POST /cmd` flows through this chain.

### NiaBrain — Master Orchestrator
**File:** `agents/NiaBrain.js`

Routes incoming commands to the correct specialist. Maintains a rolling 20-exchange session memory so context carries across commands in the same server session.

**Routing logic:**

| Input contains | Routes to |
|---|---|
| `risk` · `flag` · `assess` · `comps` | Kano (risk-only) |
| `analyze` · `arv` · `equity` · `subject-to` | Savon → NiaBrain → conditional Kano |
| `strike` · `execute` · `authorize` | Strike sequence (Savon + Kano) |
| `pipeline` · `whale` · `metrics` · `status` | Direct info response from db |
| Anything else | Savon analyze → threshold decision |

**Score thresholds:**

| Score | Action |
|---|---|
| ≥ 0.75 + risk < 0.25 | `STRIKE_READY` → full Kano execution plan |
| ≥ 0.60 | `EXECUTE` → Kano execution plan |
| ≥ 0.40 | `NEGOTIATE` → Savon result only, no Kano |
| < 0.40 | `PASS` → hold with reason |

---

### Savon — Deal Analyst
**File:** `agents/Savon.js`

Scores deals on four deterministic factors. Same deal always produces the same score — no randomness.

See [Scoring Model](#scoring-model) for full weight breakdown.

**Accepts:** deal object from db, or free-text containing dollar amounts
**Returns:** `{ score, risk, recommendation, breakdown, deal, loi, flags }`

---

### Kano — Risk Intelligence & Execution Agent
**File:** `agents/Kano.js`

**Two entry points:**

`kano.execute(input, savonResult)` — called by NiaBrain when score ≥ 0.60. Builds a step-by-step execution plan branched by strategy (Subject-To, Creative Finance, Wholesale). Appends a BLOCKED step if HIGH-severity flags are present.

`kano.assessDeal(deal)` — called directly for risk-only queries. Returns flag report, risk score, rating, checklist, and comps context.

See [Risk Flag Matrix](#risk-flag-matrix) for all flag definitions.

---

## API Reference

**Base URL (local):** `http://localhost:4000`
**Base URL (Render):** `https://nia-api.onrender.com`

---

### Health

```
GET /health
```

```json
{
  "status": "ok",
  "service": "NIA-EVO",
  "node": "23505-Sovereign",
  "operator": "J. LeSane",
  "env": "production",
  "time": "2024-01-15T12:00:00.000Z"
}
```

---

### Jarvis Command

```
POST /cmd
Content-Type: application/json

{ "input": "analyze MD-WHALE" }
```

```json
{
  "status": "success",
  "id": "uuid",
  "input": "analyze MD-WHALE",
  "result": {
    "status": "STRIKE_READY",
    "score": 0.847,
    "risk": 0.1,
    "recommendation": "STRIKE",
    "analysis": { ... },
    "execution": { ... }
  },
  "ts": "2024-01-15T12:00:00.000Z",
  "operator": "J. LeSane"
}
```

---

### Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cmd/deals` | All deals |
| `POST` | `/cmd/deals` | Create deal |
| `PUT` | `/cmd/deals/:id` | Update deal |
| `DELETE` | `/cmd/deals/:id` | Delete deal |
| `POST` | `/cmd/deals/:id/strike` | Authorize strike — sets status to ACQUIRING |

**Create / Update body:**

```json
{
  "target":   "MD-WHALE",
  "address":  "4722 Chesapeake Dr, Annapolis MD 21401",
  "value":    125500,
  "arv":      210000,
  "equity":   84500,
  "status":   "ACQUIRING",
  "strategy": "SUBJECT_TO",
  "priority": "CRITICAL"
}
```

---

### Metrics

```
GET /cmd/metrics
```

```json
{
  "dealCount":   3,
  "totalEquity": 313000,
  "totalValue":  592500,
  "totalArv":    905000,
  "liveStrikes": 1,
  "byStrategy": {
    "SUBJECT_TO": 1,
    "CREATIVE_FINANCE": 1,
    "WHOLESALE": 1
  }
}
```

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Express server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `DB_PATH` | `./db.json` | JSON database path. Use `/sdcard/Lexar_Vault/db.json` on Termux |
| `N8N_URL` | `null` | n8n base URL e.g. `https://your-n8n.com` |
| `N8N_WEBHOOK_PATH` | `/webhook/nia-evo` | n8n webhook path |
| `N8N_SECRET` | `null` | Shared secret sent as `x-nia-secret` header |
| `LOG_LEVEL` | `info` | `debug` · `info` · `warn` · `error` |

### Frontend (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL e.g. `https://nia-api.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL e.g. `wss://nia-api.onrender.com` |

---

## Local Development

### Requirements

- Node.js 18+
- Termux (Android) or any Unix terminal
- npm

### Setup

```bash
# Clone
git clone https://github.com/jazzu72/nia-evo.git
cd nia-evo

# Install API deps
cd apps/api
npm install

# Install frontend deps
cd ../web
npm install
```

### Run (two terminal tabs)

```bash
# Tab 1 — API
cd ~/nia-evo/apps/api
npm run dev
# → http://localhost:4000

# Tab 2 — Frontend
cd ~/nia-evo/apps/web
npm run dev
# → http://localhost:3000
```

### Watch logs

```bash
cd ~/nia-evo/apps/api
npm run logs
# tails logs/nia.log in real time
```

### Test the API directly

```bash
# Health check
curl http://localhost:4000/health

# Jarvis command
curl -X POST http://localhost:4000/cmd \
  -H "Content-Type: application/json" \
  -d '{"input":"status"}'

# Analyze a deal
curl -X POST http://localhost:4000/cmd \
  -H "Content-Type: application/json" \
  -d '{"input":"analyze MD-WHALE"}'

# Risk assessment
curl -X POST http://localhost:4000/cmd \
  -H "Content-Type: application/json" \
  -d '{"input":"risk DC-DUPLEX"}'

# Full pipeline
curl http://localhost:4000/cmd/deals

# Metrics
curl http://localhost:4000/cmd/metrics
```

---

## Deployment

### API → Render

1. Push `apps/api` to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service** → connect repo
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in the Render dashboard:

```
NODE_ENV=production
DB_PATH=./db.json
FRONTEND_URL=https://your-app.vercel.app
N8N_URL=https://your-n8n-instance.com      (optional)
N8N_SECRET=your-strong-secret              (optional)
```

6. Note your service URL: `https://nia-api.onrender.com`

> **Note:** Render free tier spins down after 15 minutes of inactivity. The WebSocket heartbeat (25s ping) keeps connections alive once a client is connected, but the first cold request after spin-down takes ~30s. Upgrade to a paid instance for always-on production use.

---

### Frontend → Vercel

```bash
cd ~/nia-evo/apps/web
npm install -g vercel
vercel login
vercel --prod
```

Then in the **Vercel dashboard → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://nia-api.onrender.com
NEXT_PUBLIC_WS_URL=wss://nia-api.onrender.com
```

Redeploy after adding env vars.

---

### Cross-link Render ↔ Vercel

Once both are deployed, update Render's `FRONTEND_URL` env var to your Vercel URL. This ensures the API's CORS policy allows the frontend origin.

---

## WebSocket Protocol

Connect to the same URL as the API (`ws://localhost:4000` in dev, `wss://nia-api.onrender.com` in prod).

### Server → Client messages

| Type | Payload | Trigger |
|---|---|---|
| `INIT` | Full db snapshot `{ deals, commands, meta }` | On connect |
| `PING` | `{ ts: timestamp }` | Every 25s (keep-alive) |
| `DEAL_ADDED` | New deal object | `POST /cmd/deals` |
| `DEAL_UPDATED` | Updated deal object | `PUT /cmd/deals/:id` or strike |
| `DEAL_REMOVED` | `{ id }` | `DELETE /cmd/deals/:id` |
| `CMD_EXECUTED` | `{ id, input, result, ts }` | `POST /cmd` |

### Client → Server messages

```json
{ "type": "CMD", "payload": "analyze MD-WHALE" }
```

Returns a `CMD_RESPONSE` message with the brain result.

---

## n8n Integration

The n8n bridge is **optional**. If `N8N_URL` is not set, all n8n calls are silently skipped — the API functions fully without it.

### How it works

Every significant event in the API fires a named n8n trigger:

| Event | Trigger | Payload |
|---|---|---|
| `DEAL_ADDED` | New deal created | deal object |
| `DEAL_UPDATED` | Deal updated | deal object |
| `STRIKE_EXECUTED` | Strike authorized | deal object |
| `CMD_RECEIVED` | Jarvis command processed | command + result |
| `DEAL_ANALYZED` | Savon analysis complete | deal + analysis |
| `DEAL_EXECUTED` | Kano execution plan built | deal + plan |
| `SOVEREIGN_ALERT` | Manual alert | message + meta |

### n8n workflow setup

1. In your n8n instance, create a **Webhook** trigger node
2. Set the path to `/webhook/nia-evo` (or your custom `N8N_WEBHOOK_PATH`)
3. Set authentication to **Header Auth**, header name `x-nia-secret`
4. Branch on `body.event` to route to the correct workflow

### Future queue layer

The n8n service is architected to be swapped for a proper job queue (BullMQ + Redis) without changing any callers. When ready:

```bash
npm install bullmq ioredis
```

Create `services/queue.service.js`, replace the `axios.post` in `triggerN8n` with `queue.add(event, body)`, and add a worker. The `n8n.*` wrapper API stays identical.

---

## Jarvis Commands

Send any of these via `POST /cmd` or the in-app terminal.

| Command | Description |
|---|---|
| `status` | System health, agent status, node info, n8n config |
| `pipeline` | All deals with value, equity, strategy, priority |
| `whale` | Primary target (CRITICAL + ACQUIRING) deep status |
| `metrics` | Portfolio totals — equity, value, ARV, by strategy |
| `analyze [target]` | Savon full analysis + LOI params for named deal |
| `analyze $125k arv $210k` | Ad-hoc analysis from raw numbers |
| `risk [target]` | Kano risk flags + due diligence checklist |
| `strike [target]` | Initiate full acquisition sequence |
| `help` | Full command reference |
| `↑ / ↓` | Command history navigation (terminal UI) |

---

## Deal Schema

```json
{
  "id":       "uuid-v4",
  "target":   "MD-WHALE",
  "address":  "4722 Chesapeake Dr, Annapolis MD 21401",
  "value":    125500,
  "arv":      210000,
  "equity":   84500,
  "status":   "ACQUIRING",
  "strategy": "SUBJECT_TO",
  "priority": "CRITICAL",
  "created":  "2024-01-15T12:00:00.000Z",
  "updated":  "2024-01-15T14:00:00.000Z",
  "strikeAt": "2024-01-15T14:00:00.000Z"
}
```

**Status values:** `ACQUIRING` · `ANALYSIS` · `PIPELINE` · `CLOSED`

**Strategy values:** `SUBJECT_TO` · `CREATIVE_FINANCE` · `WHOLESALE`

**Priority values:** `CRITICAL` · `HIGH` · `MEDIUM` · `LOW`

---

## Scoring Model

Savon scores every deal on four independent factors. The model is deterministic — no randomness, no ML. Same inputs always produce the same score.

### Equity Spread (40 points)

| Equity % of ARV | Points |
|---|---|
| ≥ 40% | 40 |
| ≥ 30% | 32 |
| ≥ 25% | 26 |
| ≥ 20% | 18 |
| ≥ 10% | 8  |
| < 10% | 0  |

### LTV (25 points)

| LTV | Points |
|---|---|
| ≤ 60% | 25 |
| ≤ 65% | 22 |
| ≤ 70% | 18 |
| ≤ 75% | 12 |
| ≤ 80% | 5  |
| > 80% | 0  |

### Strategy Fit (20 points)

| Strategy | Equity required | Points |
|---|---|---|
| SUBJECT_TO | ≥ 25% | 20 |
| SUBJECT_TO | ≥ 20% | 12 |
| CREATIVE_FINANCE | ≥ 20% | 18 |
| CREATIVE_FINANCE | ≥ 15% | 10 |
| WHOLESALE | ≥ 15% | 16 |
| WHOLESALE | ≥ 10% | 8 |

### Data Completeness (15 points)

Scored proportionally across 6 required fields: `value` · `arv` · `equity` · `address` · `strategy` · `target`

---

## Risk Flag Matrix

Kano evaluates every deal against 8 flag definitions. Flags are de-duplicated (only the highest LTV tier fires).

| Flag | Condition | Severity | Points |
|---|---|---|---|
| `ltvCritical` | LTV > 85% | HIGH | 30 |
| `ltvHigh` | LTV 80–85% | HIGH | 30 |
| `ltvModerate` | LTV 70–80% | MEDIUM | 15 |
| `thinEquity` | Equity < 20% of ARV | HIGH | 30 |
| `noArv` | ARV missing or zero | HIGH | 30 |
| `noAddress` | Address not set | MEDIUM | 15 |
| `subToLowEquity` | SUBJECT_TO + equity < 25% | HIGH | 30 |
| `timePressure` | Priority = CRITICAL | LOW | 5 |

**Risk rating:**

| Score | Rating | Icon |
|---|---|---|
| 0–19 | LOW RISK | 🟢 |
| 20–39 | GUARDED | 🟡 |
| 40–64 | ELEVATED | 🟠 |
| 65–100 | HIGH RISK | 🔴 |

---

## License

Private — House of Jazzu · Node 23505-Sovereign · All rights reserved.

---

*T-Mobile Secured · Lexar Encrypted · Built on a Pixel, deployed to the world.*
