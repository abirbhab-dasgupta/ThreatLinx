

BEGIN;
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  hostname TEXT NOT NULL,
  deep_scan BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'queued',
  phase TEXT NOT NULL DEFAULT 'Investigation queued',
  threat_risk INTEGER,
  verdict TEXT,
  confidence TEXT,
  security_grade TEXT,
  explanation TEXT,
  next_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS scans_user_recent_idx ON scans (user_id, created_at);
CREATE TABLE IF NOT EXISTS scan_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  source TEXT NOT NULL,
  score_impact INTEGER NOT NULL DEFAULT 0,
  observed_at TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  CONSTRAINT scan_evidence_unique UNIQUE(scan_id, code, source)
);
CREATE TABLE IF NOT EXISTS provider_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT provider_check_unique UNIQUE(scan_id, provider)
);
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);
CREATE INDEX IF NOT EXISTS reports_user_idx ON reports(user_id, submitted_at);
COMMIT;
