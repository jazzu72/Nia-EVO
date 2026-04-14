# NIA-EVO · Deployment Runbook
## Node 23505-Sovereign · House of Jazzu · Institutional Operations

---

## Architecture

```
Internet
    │
    ▼
[Nginx]  ── TLS termination, rate limiting, WebSocket upgrade
    │         443 → 4000 (API)   /terminal → WS
    │
    ▼
[PM2 Cluster]  ── one worker per vCPU, shared port 4000
    │
    ▼
NiaBrain / NiaEVO
    │
    ├── PipelineEngine  (intent + entity parsing)
    ├── Savon           (deal scoring)
    ├── TrustController (input validation, compliance)
    ├── QuantumGoverness (integrity, audit, vault sealing)
    ├── Kano            (strike authorization, deal execution)
    └── VaultEngine     (capital allocation, P&L tracking)
         │
         └── ExposureManager / AssetRegistry / VaultCore
    │
    ▼
[Monitor Sidecar]  ── :4001/metrics + :4001/alive
```

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| PM2 | latest | `npm install -g pm2` |
| Nginx | 1.18+ | Optional — required for HTTPS/production |
| OS | Ubuntu 22.04+ / macOS / Android (Termux) | |

---

## First-Time Setup

### 1. Clone & configure

```bash
git clone https://github.com/jazzu72/Nia-Prime-lite.git /opt/nia-evo
cd /opt/nia-evo/apps/api
cp .env.example .env
nano .env
```

Minimum required in `.env`:
```
OPENAI_API_KEY=sk-...
PORT=4000
NODE_ENV=production
```

Generate `API_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Create system user (server deployments only)

```bash
sudo useradd --system --home /opt/nia-evo --shell /bin/false nia-evo
sudo chown -R nia-evo:nia-evo /opt/nia-evo
sudo mkdir -p /var/log/nia-evo
sudo chown nia-evo:nia-evo /var/log/nia-evo
```

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh --env production
```

### 4. Enable on system boot (server only)

```bash
pm2 startup systemd -u nia-evo --hp /opt/nia-evo
# Run the command it outputs, then:
pm2 save
```

Or use the systemd unit:
```bash
sudo cp deploy/systemd/nia-evo.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable nia-evo
sudo systemctl start nia-evo
```

### 5. Configure Nginx (production only)

```bash
sudo cp deploy/nginx/nia-evo.conf /etc/nginx/sites-available/nia-evo
sudo ln -s /etc/nginx/sites-available/nia-evo /etc/nginx/sites-enabled/
# Update server_name to your actual domain, then:
sudo certbot --nginx -d your-domain.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## Termux / Android Deployment

```bash
pkg install nodejs git
npm install -g pm2
git clone https://github.com/jazzu72/Nia-Prime-lite.git /sdcard/nia-evo
cd /sdcard/nia-evo/apps/api
cp .env.example .env
# Edit .env, then:
bash /sdcard/nia-evo/scripts/nia-launch.sh
```

---

## Day-to-Day Operations

### Deploy update (zero downtime)
```bash
git pull
./deploy.sh --env production
```

### Staging deploy
```bash
./deploy.sh --env staging
```

### Build check only (no deploy)
```bash
./deploy.sh --check-only
```

### View logs
```bash
pm2 logs nia-evo             # live tail all workers
pm2 logs nia-evo --lines 100 # last 100 lines
pm2 logs nia-monitor         # monitor sidecar
tail -f logs/deploy-*.log    # last deploy log
```

### Process management
```bash
pm2 status                   # all processes
pm2 monit                    # live dashboard (CPU, memory, logs)
pm2 reload nia-evo           # zero-downtime reload (cluster mode)
pm2 restart nia-evo          # hard restart (brief downtime)
pm2 stop nia-evo             # stop
pm2 delete nia-evo           # remove from PM2
```

### Scale workers
```bash
pm2 scale nia-evo 4          # set to exactly 4 workers
pm2 scale nia-evo +2         # add 2 workers
pm2 scale nia-evo max        # max = one per vCPU
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Full system status + vault snapshot |
| POST | `/cmd` | Natural language pipeline entry |
| POST | `/analyze` | Numeric ARV/MAO deal math |
| POST | `/strike` | Strike authorization |
| GET | `/deals` | All deals |
| GET | `/deals/active` | Active deals only |
| GET | `/deals/:id` | Single deal |
| GET | `/vault` | Vault statement |
| POST | `/vault/deposit` | Deposit to sovereign pool |
| GET | `/audit` | Audit log |
| GET | `/security` | Security report |
| WS | `/terminal` | Jarvis WebSocket terminal |

**Monitor (sidecar):**

| Method | Endpoint | Description |
|---|---|---|
| GET | `:4001/metrics` | System + latency metrics |
| GET | `:4001/alive` | Liveness probe (503 if DOWN) |

---

## Environment Variables

| Key | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | OpenAI API key (`sk-...`) |
| `PORT` | — | `4000` | API server port |
| `NODE_ENV` | — | `development` | `production` \| `staging` \| `development` |
| `LOG_LEVEL` | — | `info` | `error` \| `warn` \| `info` \| `debug` |
| `VAULT_INITIAL_BALANCE` | — | `10000000` | Sovereign pool size |
| `VAULT_MAX_PER_DEAL` | — | `500000` | Single deal cap |
| `VAULT_MAX_TOTAL` | — | `5000000` | Total portfolio exposure cap |
| `API_SECRET` | — | — | 32-char hex string for request signing |
| `RATE_LIMIT_MAX` | — | `60` | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | — | `60000` | Rate limit window (ms) |
| `CENSUS_API_KEY` | — | — | Improves market data (free) |
| `MONITOR_PORT` | — | `4001` | Monitor sidecar port |
| `ALERT_WEBHOOK_URL` | — | — | Slack/Discord webhook for alerts |

---

## Troubleshooting

**API not starting:**
```bash
pm2 logs nia-evo --lines 50 --nostream
node apps/api/server.js   # run directly to see full error
```

**AI in fallback mode:**
```bash
grep OPENAI_API_KEY apps/api/.env
# Ensure key starts with sk- and isn't YOUR_OPENAI_KEY_HERE
```

**Port already in use:**
```bash
lsof -i :4000
kill -9 <PID>
```

**High memory / restart loop:**
```bash
pm2 monit                  # watch RSS
# Increase max_memory_restart in ecosystem.config.js if needed
```

**Vault integrity alert:**
```bash
curl http://localhost:4000/security | jq '.report.anomalies_open'
curl http://localhost:4000/audit?limit=20 | jq '.entries[-5:]'
```

---

## Security Checklist

- [ ] `OPENAI_API_KEY` in `.env` only — never in source code
- [ ] `.env` in `.gitignore`
- [ ] `API_SECRET` set and rotated every 90 days
- [ ] Nginx TLS configured with valid certificate
- [ ] Port 4000 and 4001 NOT exposed to internet (Nginx proxies)
- [ ] systemd `PrivateTmp=yes` and `NoNewPrivileges=yes` active
- [ ] `pm2 startup` configured for auto-restart on reboot
- [ ] Log rotation configured (`logrotate` or PM2 log rotation module)
- [ ] `VAULT_MAX_PER_DEAL` and `VAULT_MAX_TOTAL` set to real limits
- [ ] `ALERT_WEBHOOK_URL` set so anomaly alerts reach you immediately

---

*NIA-EVO · Node 23505-Sovereign · House of Jazzu*
