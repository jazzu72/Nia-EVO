CREATE TABLE IF NOT EXISTS revenue_pipeline (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'AI Automation',
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  cash_collected NUMERIC(14,2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS revenue_pipeline_stage_idx ON revenue_pipeline(stage);
CREATE INDEX IF NOT EXISTS revenue_pipeline_created_idx ON revenue_pipeline(created_at DESC);
