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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deals (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'unknown',
      category TEXT NOT NULL DEFAULT 'general',
      status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open','won','lost','cancelled')),
      expected_value NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (expected_value >= 0),
      actual_value NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (actual_value >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id BIGSERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('revenue','expense')),
      amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      description TEXT NOT NULL DEFAULT 'Financial transaction',
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


app.post('/api/deals', express.json(), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const source = String(req.body.source || 'unknown').trim();
    const category = String(req.body.category || 'general').trim();
    const status = String(req.body.status || 'open').toLowerCase();
    const expectedValue = Number(req.body.expected_value || 0);
    const actualValue = Number(req.body.actual_value || 0);

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!['open','won','lost','cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'invalid deal status'
      });
    }

    if (
      !Number.isFinite(expectedValue) ||
      expectedValue < 0 ||
      !Number.isFinite(actualValue) ||
      actualValue < 0
    ) {
      return res.status(400).json({
        error: 'deal values must be non-negative numbers'
      });
    }

    if (!pool) {
      return res.status(503).json({
        error: 'Deal storage unavailable'
      });
    }

    const result = await pool.query(
      `INSERT INTO deals
       (name, source, category, status, expected_value, actual_value)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, source, category, status,
                 expected_value, actual_value, created_at, updated_at`,
      [
        name,
        source,
        category,
        status,
        expectedValue,
        actualValue
      ]
    );

    res.status(201).json({
      ok: true,
      storage: 'postgresql',
      deal: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      error: 'Deal creation failed'
    });
  }
});

app.get('/api/finance/transactions', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          id,
          type,
          amount,
          description,
          created_at AS timestamp
        FROM financial_transactions
        ORDER BY created_at DESC
        LIMIT 100
      `);

      return res.json({
        system: 'NIA-CAPITAL-OS',
        storage: 'postgresql',
        count: result.rows.length,
        transactions: result.rows,
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      system: 'NIA-CAPITAL-OS',
      storage: 'local-fallback',
      count: 0,
      transactions: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Financial transaction audit unavailable'
    });
  }
});


function financialWriteAllowed() {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, 'src', 'vault', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    return (
      config.allowFinancialActions === true &&
      process.env.NIA_FINANCIAL_ACTION_APPROVED === 'true' &&
      process.env.NIA_FINANCIAL_ACTIONS_ENABLED === 'true'
    );
  } catch {
    return false;
  }
}

function requireFinancialWriteApproval(req, res) {
  if (!financialWriteAllowed()) {
    return res.status(403).json({
      ok: false,
      error: 'Financial write blocked by Quantum Vault policy',
      policy: 'allowFinancialActions=false',
      approvalRequired: true,
      readOnly: true,
      databaseModified: false
    });
  }
  return true;
}

app.post('/api/finance/transaction', express.json(), async (req, res) => {
  if (requireFinancialWriteApproval(req, res) !== true) return;
  try {
    const type = String(req.body.type || '').toLowerCase();
    const amount = Number(req.body.amount);
    const description = String(req.body.description || 'Financial transaction').trim();

    if (!['revenue', 'expense'].includes(type)) {
      return res.status(400).json({
        error: 'type must be revenue or expense'
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'amount must be a positive number'
      });
    }

    if (!description) {
      return res.status(400).json({
        error: 'description is required'
      });
    }

    if (pool) {
      const result = await pool.query(
        `INSERT INTO financial_transactions (type, amount, description)
         VALUES ($1, $2, $3)
         RETURNING id, type, amount, description, created_at AS timestamp`,
        [type, amount, description]
      );

      return res.status(201).json({
        ok: true,
        storage: 'postgresql',
        transaction: result.rows[0]
      });
    }

    res.status(503).json({
      error: 'Financial transaction storage unavailable'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Financial transaction failed'
    });
  }
});

app.get('/api/executive/status', async (req, res) => {
  return res.json({
    system: 'NIA-CAPITAL-OS',
    mode: 'CONTROLLED_EXECUTION',
    decisionEngine: 'AVAILABLE',
    financialExecution: 'BLOCKED',
    approvalRequired: true,
    automaticMoneyMovement: false,
    databaseWriteAuthorization: false,
    reconciliationRequired: true,
    status: 'operational_safe_mode',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/nia/decision', async (req,res) => {
  res.json({
    system:'NIA-CAPITAL-OS',
    status:'decision_support_only',
    readOnly:true,
    recommendation:'OWNER_REVIEW_REQUIRED',
    confidence:'UNVERIFIED',
    evidenceRequired:true,
    financialExecutionAllowed:false,
    externalExecutionAllowed:false,
    ownerApprovalRequired:true,
    actions:[
      'collect_evidence',
      'classify',
      'verify',
      'prepare_owner_review'
    ]
  });
});

app.get('/api/nia/truth', async (req,res) => {
  res.json({
    system:'NIA-CAPITAL-OS',
    status:'truth_control_only',
    readOnly:true,
    states:[
      {state:'OBSERVED',requires:'source evidence'},
      {state:'CLASSIFIED',requires:'NIA classification'},
      {state:'VERIFIED',requires:'independent confirmation'},
      {state:'APPROVED',requires:'owner approval'},
      {state:'EXECUTED',requires:'authorized execution'}
    ],
    promotionRules:{
      observedToClassified:true,
      classifiedToVerified:false,
      verifiedToApproved:false,
      approvedToExecuted:false
    },
    note:'No state promotion creates financial authority.'
  });
});

app.get('/api/nia/opportunities', async (req,res) => {
  try {
    const opportunities = [
      {id:'OPP-REVENUE',type:'revenue',truthState:'OBSERVED',verified:false,approved:false,executable:false},
      {id:'OPP-GRANT',type:'grant',truthState:'OBSERVED',verified:false,approved:false,executable:false},
      {id:'OPP-CONTRACT',type:'contract',truthState:'OBSERVED',verified:false,approved:false,executable:false},
      {id:'OPP-PARTNERSHIP',type:'partnership',truthState:'OBSERVED',verified:false,approved:false,executable:false},
      {id:'OPP-REAL-ESTATE',type:'real_estate',truthState:'OBSERVED',verified:false,approved:false,executable:false}
    ];
    res.json({system:'NIA-CAPITAL-OS',status:'opportunity_control_only',readOnly:true,executionAllowed:false,ownerApprovalRequired:true,opportunities});
  } catch(err) {
    res.status(500).json({system:'NIA-CAPITAL-OS',status:'unavailable',readOnly:true});
  }
});

app.get('/api/nia/status', async (req, res) => {
  try {
    let vaultStatus = { status: 'unavailable' };

    try {
      const vault = require('./vault-integration');
      vaultStatus = vault.health();
    } catch (err) {
      vaultStatus = {
        status: 'error',
        error: 'Vault health unavailable'
      };
    }

    let databaseStatus = 'unavailable';
    let revenueEntries = 0;
    let transactionEntries = 0;

    if (pool) {
      try {
        const revenueResult = await pool.query(
          'SELECT COUNT(*)::int AS count FROM revenue_ledger'
        );

        const transactionResult = await pool.query(
          'SELECT COUNT(*)::int AS count FROM financial_transactions'
        );

        revenueEntries = revenueResult.rows[0].count;
        transactionEntries = transactionResult.rows[0].count;
        databaseStatus = 'healthy';
      } catch (err) {
        databaseStatus = 'error';
      }
    }

    const financialApproved =
      process.env.NIA_FINANCIAL_ACTION_APPROVED === 'true';

    const financialActionsEnabled =
      process.env.NIA_FINANCIAL_ACTIONS_ENABLED === 'true';

    return res.json({
      system: 'NIA-CAPITAL-OS',
      mode: 'controlled-autonomous',
      status: 'operational',
      read_only_status: true,

      vault: {
        status: vaultStatus.status || 'initialized',
        encryption: 'AES-256-GCM',
        approvalRequired: true
      },

      database: {
        status: databaseStatus,
        revenueEntries,
        transactionEntries
      },

      financialControl: {
        allowFinancialActions: false,
        approvalRequired: true,
        environmentApproved: financialApproved,
        actionsEnabled: financialActionsEnabled,
        executionAllowed:
          financialApproved && financialActionsEnabled
      },

      capabilities: {
        monitoring: true,
        classification: true,
        reconciliation: true,
        opportunityAnalysis: true,
        decisionSupport: true,
        ownerApprovalQueue: true,
        automaticMoneyMovement: false,
        automaticFinancialWrites: false,
        automaticDeletion: false
      },

      truthModel: [
        'OBSERVED',
        'CLASSIFIED',
        'VERIFIED',
        'APPROVED',
        'EXECUTED'
      ],

      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('NIA status error:', err);

    return res.status(500).json({
      system: 'NIA-CAPITAL-OS',
      status: 'status_unavailable',
      readOnly: true
    });
  }
});

app.get('/api/finance/classification', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({
        error: 'Financial classification requires PostgreSQL'
      });
    }

    const revenueResult = await pool.query(`
      SELECT
        id,
        amount,
        description,
        created_at AS timestamp
      FROM revenue_ledger
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const entries = revenueResult.rows.map(row => {
      const description = String(row.description || '').toLowerCase();

      let classification = 'REQUIRES_BUSINESS_CONFIRMATION';

      if (
        description.includes('test') ||
        description.includes('connectivity') ||
        description.includes('validation') ||
        description.includes('probe')
      ) {
        classification = 'TEST';
      } else if (
        description.includes('simulation') ||
        description.includes('simulated') ||
        description.includes('paper') ||
        description.includes('backtest')
      ) {
        classification = 'SIMULATION';
      } else if (
        description.includes('internal') ||
        description.includes('transfer')
      ) {
        classification = 'INTERNAL';
      }

      return {
        id: row.id,
        amount: row.amount,
        description: row.description,
        classification,
        timestamp: row.timestamp
      };
    });

    const totals = {
      TEST: 0,
      SIMULATION: 0,
      INTERNAL: 0,
      REQUIRES_BUSINESS_CONFIRMATION: 0
    };

    for (const entry of entries) {
      totals[entry.classification] += Number(entry.amount || 0);
    }

    return res.json({
      system: 'NIA-CAPITAL-OS',
      status: 'classification_only',
      read_only: true,
      entries,
      totals,
      note: 'Classification is advisory only. No financial records modified.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Financial classification error:', err);
    return res.status(500).json({
      error: 'Financial classification unavailable'
    });
  }
});

app.get('/api/finance/reconciliation', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({
        error: 'Financial reconciliation requires PostgreSQL'
      });
    }

    const revenueResult = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS revenue_total,
        COUNT(*)::int AS revenue_entries
      FROM revenue_ledger
    `);

    const financeResult = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'revenue'), 0) AS cash_revenue,
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expenses,
        COUNT(*)::int AS finance_entries
      FROM financial_transactions
    `);

    const revenue = Number(revenueResult.rows[0].revenue_total);
    const cashRevenue = Number(financeResult.rows[0].cash_revenue);
    const expenses = Number(financeResult.rows[0].expenses);

    return res.json({
      system: 'NIA-CAPITAL-OS',
      status: 'reconciliation_only',
      revenue_ledger: {
        total: revenue,
        entries: revenueResult.rows[0].revenue_entries
      },
      cash_flow: {
        revenue: cashRevenue,
        expenses,
        net_cash: cashRevenue - expenses,
        entries: financeResult.rows[0].finance_entries
      },
      difference: revenue - cashRevenue,
      note: 'READ-ONLY reconciliation. No financial records modified.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Financial reconciliation unavailable'
    });
  }
});

app.get('/api/finance/summary', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE type = 'revenue'), 0) AS revenue,
          COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expenses,
          COALESCE(SUM(amount) FILTER (WHERE type = 'revenue'), 0) -
          COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS net_cash
        FROM financial_transactions
      `);

      return res.json({
        system: 'NIA-CAPITAL-OS',
        financials: result.rows[0],
        storage: 'postgresql',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      system: 'NIA-CAPITAL-OS',
      financials: {
        revenue: 0,
        expenses: 0,
        net_cash: 0
      },
      storage: 'local-fallback',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Financial summary unavailable' });
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
  if (requireFinancialWriteApproval(req, res) !== true) return;
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
