-- Optional manual D1 schema.
-- The Worker runs CREATE TABLE IF NOT EXISTS automatically, so you do not
-- need to execute this unless you want to create/inspect the tables yourself.

CREATE TABLE IF NOT EXISTS rsvp_responses (
  party_key TEXT PRIMARY KEY,
  party_name TEXT NOT NULL,
  invite_type TEXT NOT NULL,
  attending TEXT NOT NULL,
  guests_json TEXT NOT NULL DEFAULT '[]',
  email TEXT NOT NULL,
  dietary TEXT NOT NULL DEFAULT 'None',
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  login_display_name TEXT NOT NULL,
  first_submitted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  submission_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rsvp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL UNIQUE,
  party_key TEXT NOT NULL,
  party_name TEXT NOT NULL,
  invite_type TEXT NOT NULL,
  attending TEXT NOT NULL,
  guests_json TEXT NOT NULL DEFAULT '[]',
  email TEXT NOT NULL,
  dietary TEXT NOT NULL DEFAULT 'None',
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  login_display_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvp_history_party_key
ON rsvp_history (party_key);
