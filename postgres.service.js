// services/postgres.service.js
// ╔══════════════════════════════════════════════════════════════╗
// ║  NIA-EVO  ·  PostgreSQL Data Layer                          ║
// ║  Persistent storage for deals · vault ledger · audit log    ║
// ║  Falls back to in-memory if DB unavailable (dev mode)        ║
// ╚══════════════════════════════════════════════════════════════╝
"use strict";

// ── Schema DDL ────────────────────────────────────────────────────
const SCHEMA = `
-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id            TEXT        PRIMARY KEY,
  address       TEXT,
  zip           TEXT,
  prop_type     TEXT        NOT NULL DEFAULT 'unknown',
  arv           NUMERIC(14,2),
  ask_price     NUMERIC(14,2),
  repair_cost   NUMERIC(14,2) DEFAULT 0,
  holding_cost  NUMERIC(14,2) DEFAULT 0,
  closing_cost  NUMERIC(14,2) DEFAULT 0,
  mao           NUMERIC(14,2),
  equity        NUMERIC(14,2),
  roi           NUMERIC(8,4),
  verdict       TEXT,
  savon_score   NUMERIC(5,2),
  savon_grade   TEXT,
  stage         TEXT        NOT NULL DEFAULT 'PROSPECT',
  stage_history JSONB       NOT NULL DEFAULT '[]',
  source        TEXT        DEFAULT 'manual',
  notes         TEXT        DEFAULT '',
  tags          TEXT[]      DEFAULT '{}',
  assigned_to   TEXT        DEFAULT 'NIA',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deals_stage      ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_zip        ON deals(zip);

-- Vault ledger (append-only)
CREATE TABLE IF NOT EXISTS vault_ledger (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT        NOT NULL,
  amount       NUMERIC(14,2) NOT NULL,
  deal_id      TEXT,
  note         TEXT        DEFAULT '',
  balance      NUMERIC(14,2) NOT NULL,
  hash         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vault_deal_id    ON vault_ledger(deal_id);
CREATE INDEX IF NOT EXISTS idx_vault_created_at ON vault_ledger(created_at DESC);

-- Grants
CREATE TABLE IF NOT EXISTS grants (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  program      TEXT,
  amount       NUMERIC(14,2),
  status       TEXT        NOT NULL DEFAULT 'IDENTIFIED',
  deadline     TEXT,
  notes        TEXT        DEFAULT '',
  applied_at   TIMESTAMPTZ,
  awarded_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log (append-only — no updates or deletes)
CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  operation    TEXT        NOT NULL,
  actor        TEXT        NOT NULL,
  severity     TEXT        NOT NULL DEFAULT 'INFO',
  data         JSONB       DEFAULT '{}',
  hash         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_operation  ON audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_severity   ON audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC);

-- Sessions (pipeline context)
CREATE TABLE IF NOT EXISTS sessions (
  session_id   TEXT        PRIMARY KEY,
  context      JSONB       NOT NULL DEFAULT '[]',
  intent_counts JSONB      NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// ═══════════════════════════════════════════════════════════════════
class PostgresService {
  constructor() {
    this._pool  = null;
    this._ready = false;
  }

  async connect(connectionString) {
    const url = connectionString || process.env.DATABASE_URL;
    if (!url) {
      console.warn("[POSTGRES] DATABASE_URL not set — running without persistence");
      return false;
    }

    try {
      const { Pool } = require("pg");
      this._pool = new Pool({
        connectionString: url,
        max:              10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });

      // Validate connection
      const client = await this._pool.connect();
      await client.query("SELECT 1");
      client.release();

      // Run schema
      await this._pool.query(SCHEMA);
      this._ready = true;
      console.log("[POSTGRES] Connected and schema ready");
      return true;
    } catch (err) {
      console.warn("[POSTGRES] Unavailable — in-memory mode:", err.message);
      this._ready = false;
      return false;
    }
  }

  // ── Deals ──────────────────────────────────────────────────────

  async upsertDeal(deal) {
    if (!this._ready) return null;
    const q = `
      INSERT INTO deals (id, address, zip, prop_type, arv, ask_price, repair_cost,
        holding_cost, closing_cost, mao, equity, roi, verdict, savon_score, savon_grade,
        stage, stage_history, source, notes, tags, assigned_to, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,NOW())
      ON CONFLICT (id) DO UPDATE SET
        stage         = EXCLUDED.stage,
        stage_history = EXCLUDED.stage_history,
        savon_score   = EXCLUDED.savon_score,
        savon_grade   = EXCLUDED.savon_grade,
        equity        = EXCLUDED.equity,
        roi           = EXCLUDED.roi,
        verdict       = EXCLUDED.verdict,
        notes         = EXCLUDED.notes,
        updated_at    = NOW()
      RETURNING *`;
    const vals = [
      deal.id, deal.address, deal.zip, deal.propType,
      deal.arv, deal.askPrice, deal.repairCost, deal.holdingCost, deal.closingCost,
      deal.mao, deal.equity, deal.roi, deal.verdict,
      deal.score, deal.grade, deal.stage,
      JSON.stringify(deal.stageHistory || []),
      deal.source, deal.notes, deal.tags || [], deal.assignedTo,
    ];
    const { rows } = await this._pool.query(q, vals);
    return rows[0];
  }

  async getDeal(id) {
    if (!this._ready) return null;
    const { rows } = await this._pool.query("SELECT * FROM deals WHERE id=$1", [id]);
    return rows[0] || null;
  }

  async getDeals(filter = {}) {
    if (!this._ready) return [];
    let q = "SELECT * FROM deals WHERE 1=1";
    const vals = [];
    if (filter.stage)      { q += ` AND stage=$${vals.push(filter.stage)}`; }
    if (filter.activeOnly) { q += ` AND stage NOT IN ('CLOSED','DEAD')`; }
    if (filter.zip)        { q += ` AND zip=$${vals.push(filter.zip)}`; }
    q += " ORDER BY created_at DESC";
    if (filter.limit)      { q += ` LIMIT $${vals.push(filter.limit)}`; }
    const { rows } = await this._pool.query(q, vals);
    return rows;
  }

  // ── Vault Ledger ───────────────────────────────────────────────

  async appendLedger(tx) {
    if (!this._ready) return null;
    const q = `INSERT INTO vault_ledger (id, type, amount, deal_id, note, balance, hash)
               VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const { rows } = await this._pool.query(q, [tx.id, tx.type, tx.amount, tx.dealId, tx.note, tx.balance, tx.hash]);
    return rows[0];
  }

  async getLedger(filter = {}) {
    if (!this._ready) return [];
    let q = "SELECT * FROM vault_ledger WHERE 1=1";
    const vals = [];
    if (filter.dealId) { q += ` AND deal_id=$${vals.push(filter.dealId)}`; }
    if (filter.type)   { q += ` AND type=$${vals.push(filter.type)}`; }
    q += " ORDER BY created_at DESC";
    if (filter.limit)  { q += ` LIMIT $${vals.push(filter.limit || 100)}`; }
    const { rows } = await this._pool.query(q, vals);
    return rows;
  }

  // ── Audit Log ──────────────────────────────────────────────────

  async appendAudit(entry) {
    if (!this._ready) return null;
    const q = `INSERT INTO audit_log (id, operation, actor, severity, data, hash)
               VALUES ($1,$2,$3,$4,$5::jsonb,$6) RETURNING id`;
    const { rows } = await this._pool.query(q, [
      entry.id, entry.operation, entry.actor, entry.severity,
      JSON.stringify(entry.data || {}), entry.hash,
    ]);
    return rows[0];
  }

  async getAuditLog(filter = {}) {
    if (!this._ready) return [];
    let q = "SELECT * FROM audit_log WHERE 1=1";
    const vals = [];
    if (filter.operation) { q += ` AND operation=$${vals.push(filter.operation)}`; }
    if (filter.severity)  { q += ` AND severity=$${vals.push(filter.severity)}`; }
    if (filter.actor)     { q += ` AND actor=$${vals.push(filter.actor)}`; }
    q += " ORDER BY created_at DESC";
    q += ` LIMIT $${vals.push(filter.limit || 200)}`;
    const { rows } = await this._pool.query(q, vals);
    return rows;
  }

  // ── Grants ─────────────────────────────────────────────────────

  async upsertGrant(grant) {
    if (!this._ready) return null;
    const q = `
      INSERT INTO grants (id, name, program, amount, status, deadline, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (id) DO UPDATE SET
        status=EXCLUDED.status, notes=EXCLUDED.notes,
        applied_at=CASE WHEN EXCLUDED.status='APPLIED' THEN NOW() ELSE grants.applied_at END,
        awarded_at=CASE WHEN EXCLUDED.status='AWARDED' THEN NOW() ELSE grants.awarded_at END,
        updated_at=NOW()
      RETURNING *`;
    const { rows } = await this._pool.query(q, [grant.id, grant.name, grant.program, grant.amount, grant.status, grant.deadline, grant.notes]);
    return rows[0];
  }

  // ── Health ─────────────────────────────────────────────────────

  async ping() {
    if (!this._ready) return false;
    try { await this._pool.query("SELECT 1"); return true; }
    catch { return false; }
  }

  get ready() { return this._ready; }

  async disconnect() {
    await this._pool?.end();
    this._ready = false;
  }
}

module.exports = new PostgresService();
module.exports.PostgresService = PostgresService;
