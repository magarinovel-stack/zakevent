-- Add csrf_tokens table for multi-instance CSRF validation
CREATE TABLE IF NOT EXISTS csrf_tokens (
  token TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires ON csrf_tokens(expires_at);
