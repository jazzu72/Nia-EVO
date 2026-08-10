const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3100;
const DEPLOYMENT_ID = 'NIA-REVENUE-API-B33C913';
const LEDGER = path.join(__dirname, 'revenue-ledger.json');



const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : null;

async function initDatabase() {
  if (!pool) return false;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revenue_ledger (
      id BIGSERIAL PRIMARY KEY,
      amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      description TEXT NOT NULL DEFAULT 'Revenue entry',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  return true;
}

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); }
  catch { return { revenue: 0, deals: 0, entries: [] }; }
}

app.get('/', (req, res) => {
  res.json({ service: 'Nia-EVO Revenue API', status: 'online' });
});

app.get('/api/revenue', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS revenue,
          COUNT(*)::int AS deals,
          COALESCE(
            json_agg(
              json_build_object(
                'id', id,
                'amount', amount,
                'description', description,
                'timestamp', created_at
              )
              ORDER BY created_at DESC
            ), '[]'
          ) AS entries
        FROM revenue_ledger
      `);

      return res.json({
        revenue: Number(result.rows[0].revenue),
        deals: result.rows[0].deals,
        entries: result.rows[0].entries,
        storage: 'postgresql',
        timestamp: new Date().toISOString()
      });
    }

    const ledger = readLedger();
    res.json({
      revenue: ledger.revenue,
      deals: ledger.deals,
      entries: ledger.entries,
      storage: 'local-fallback',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database unavailable' });
  }
});


app.get('/api/revenue/dashboard', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS revenue,
          COUNT(*)::int AS deals,
          COALESCE(AVG(amount), 0) AS average_deal,
          COALESCE(MAX(amount), 0) AS largest_deal,
          COALESCE(MIN(amount), 0) AS smallest_deal
        FROM revenue_ledger
      `);

      return res.json({
        system: 'NIA-CAPITAL-OS',
        status: 'operational',
        financials: result.rows[0],
        storage: 'postgresql',
        timestamp: new Date().toISOString()
      });
    }

    const ledger = readLedger();
    const amounts = ledger.entries.map(e => Number(e.amount));

    res.json({
      system: 'NIA-CAPITAL-OS',
      status: 'operational',
      financials: {
        revenue: ledger.revenue,
        deals: ledger.deals,
        average_deal: ledger.deals ? ledger.revenue / ledger.deals : 0,
        largest_deal: amounts.length ? Math.max(...amounts) : 0,
        smallest_deal: amounts.length ? Math.min(...amounts) : 0
      },
      storage: 'local-fallback',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Revenue dashboard unavailable' });
  }
});

app.get('/api/revenue/audit', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          id,
          amount,
          description,
          created_at AS timestamp
        FROM revenue_ledger
        ORDER BY created_at DESC
        LIMIT 100
      `);

      return res.json({
        storage: 'postgresql',
        count: result.rows.length,
        entries: result.rows,
        timestamp: new Date().toISOString()
      });
    }

    const ledger = readLedger();

    res.json({
      storage: 'local-fallback',
      count: ledger.entries.length,
      entries: ledger.entries.slice(-100).reverse(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Revenue audit unavailable' });
  }
});

app.get('/api/revenue/summary', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS revenue,
          COUNT(*) AS deals,
          COALESCE(AVG(amount), 0) AS average_deal,
          COALESCE(MAX(amount), 0) AS largest_deal
        FROM revenue_ledger
      `);

      return res.json({
        ...result.rows[0],
        storage: 'postgresql',
        timestamp: new Date().toISOString()
      });
    }

    const ledger = readLedger();

    res.json({
      revenue: ledger.revenue,
      deals: ledger.deals,
      average_deal: ledger.deals ? ledger.revenue / ledger.deals : 0,
      largest_deal: ledger.entries.length
        ? Math.max(...ledger.entries.map(e => e.amount))
        : 0,
      storage: 'local-fallback',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Revenue summary unavailable' });
  }
});

app.post('/api/revenue', express.json(), async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'amount must be a positive number'
    });
  }

  try {
    if (pool) {
      const result = await pool.query(
        `INSERT INTO revenue_ledger (amount, description)
         VALUES ($1, $2)
         RETURNING id, amount, description, created_at`,
        [amount, req.body.description || 'Revenue entry']
      );

      return res.status(201).json({
        ok: true,
        storage: 'postgresql',
        entry: {
          id: `REV-${result.rows[0].id}`,
          amount: Number(result.rows[0].amount),
          description: result.rows[0].description,
          timestamp: result.rows[0].created_at
        }
      });
    }

    const ledger = readLedger();
    const entry = {
      id: `REV-${Date.now()}`,
      amount,
      description: req.body.description || 'Revenue entry',
      timestamp: new Date().toISOString()
    };

    ledger.revenue += amount;
    ledger.deals += 1;
    ledger.entries.push(entry);

    fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));

    res.status(201).json({
      ok: true,
      storage: 'local-fallback',
      entry,
      revenue: ledger.revenue,
      deals: ledger.deals
    });
  } catch (err) {
    res.status(500).json({ error: 'Database unavailable' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Nia-EVO Revenue API',
    deployment: DEPLOYMENT_ID,
    entrypoint: 'revenue-api.js'
  });
});

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Revenue API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  });

/*
*/
