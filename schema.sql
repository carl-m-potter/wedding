CREATE TABLE IF NOT EXISTS rsvps (
  party TEXT PRIMARY KEY,
  invite_type TEXT NOT NULL,
  logged_in_as TEXT NOT NULL,
  attending TEXT NOT NULL CHECK (attending IN ('Yes', 'No')),
  guests_attending TEXT NOT NULL DEFAULT 'None',
  dietary_requirements TEXT NOT NULL DEFAULT 'None',
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvps_submitted_at
ON rsvps(submitted_at);
