
BEGIN;
CREATE TABLE IF NOT EXISTS message_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('sms','email','social','other')),
  redacted_text TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  phase TEXT NOT NULL DEFAULT 'Queued for evidence analysis',
  verdict TEXT,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  confidence TEXT,
  explanation TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS message_cases_user_recent_idx ON message_cases(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS message_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES message_cases(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  CONSTRAINT message_link_unique UNIQUE(message_id,url)
);
CREATE INDEX IF NOT EXISTS message_links_domain_idx ON message_links(domain);
CREATE TABLE IF NOT EXISTS report_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','publishing','confirmed','failed')),
  digest TEXT NOT NULL,
  salt TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  contract_address TEXT,
  chain_id INTEGER NOT NULL DEFAULT 84532,
  tx_hash TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT report_commitment_unique UNIQUE(report_id,version)
);
COMMIT;
