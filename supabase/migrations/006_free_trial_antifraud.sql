-- =============================================
-- FREE TRIAL & ANTI-FRAUD SYSTEM
-- =============================================

-- 1. Add free trial columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_used BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_documents_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_ip TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_user_agent TEXT;

-- 2. Create device fingerprints tracking table
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast fingerprint lookup
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_ip ON device_fingerprints(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user ON device_fingerprints(user_id);

-- 3. Create blocked email domains table
CREATE TABLE IF NOT EXISTS blocked_email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  reason TEXT DEFAULT 'disposable',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create IP abuse tracking table
CREATE TABLE IF NOT EXISTS ip_signup_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip ON ip_signup_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_tracking_created ON ip_signup_tracking(created_at);

-- 5. Enable RLS on new tables
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_signup_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage device_fingerprints" ON device_fingerprints
  FOR ALL USING (true);

CREATE POLICY "Anyone can read blocked_email_domains" ON blocked_email_domains
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage ip_signup_tracking" ON ip_signup_tracking
  FOR ALL USING (true);

-- 6. Populate blocked email domains (common disposable email providers)
INSERT INTO blocked_email_domains (domain, reason) VALUES
  ('10minutemail.com', 'disposable'),
  ('tempmail.com', 'disposable'),
  ('tempmail.net', 'disposable'),
  ('guerrillamail.com', 'disposable'),
  ('guerrillamail.org', 'disposable'),
  ('mailinator.com', 'disposable'),
  ('throwaway.email', 'disposable'),
  ('temp-mail.org', 'disposable'),
  ('fakeinbox.com', 'disposable'),
  ('getnada.com', 'disposable'),
  ('mohmal.com', 'disposable'),
  ('tempail.com', 'disposable'),
  ('dispostable.com', 'disposable'),
  ('mailnesia.com', 'disposable'),
  ('mintemail.com', 'disposable'),
  ('tempr.email', 'disposable'),
  ('discard.email', 'disposable'),
  ('discardmail.com', 'disposable'),
  ('spamgourmet.com', 'disposable'),
  ('mytrashmail.com', 'disposable'),
  ('mt2009.com', 'disposable'),
  ('thankyou2010.com', 'disposable'),
  ('spam4.me', 'disposable'),
  ('grr.la', 'disposable'),
  ('sharklasers.com', 'disposable'),
  ('yopmail.com', 'disposable'),
  ('yopmail.fr', 'disposable'),
  ('cool.fr.nf', 'disposable'),
  ('jetable.fr.nf', 'disposable'),
  ('courriel.fr.nf', 'disposable'),
  ('moncourrier.fr.nf', 'disposable'),
  ('monemail.fr.nf', 'disposable'),
  ('monmail.fr.nf', 'disposable'),
  ('hide.biz.st', 'disposable'),
  ('mymail.infos.st', 'disposable'),
  ('maildrop.cc', 'disposable'),
  ('mailsac.com', 'disposable'),
  ('emailondeck.com', 'disposable'),
  ('tempinbox.com', 'disposable'),
  ('fakemailgenerator.com', 'disposable'),
  ('throwawaymail.com', 'disposable'),
  ('trashmail.com', 'disposable'),
  ('trashmail.net', 'disposable'),
  ('trashmail.org', 'disposable'),
  ('trashemail.de', 'disposable'),
  ('wegwerfmail.de', 'disposable'),
  ('wegwerfmail.net', 'disposable'),
  ('wegwerfmail.org', 'disposable'),
  ('spambox.us', 'disposable'),
  ('spamfree24.org', 'disposable'),
  ('tuamaeaquelaursa.com', 'disposable')
ON CONFLICT (domain) DO NOTHING;

-- 7. Function to check if email domain is blocked
CREATE OR REPLACE FUNCTION is_email_domain_blocked(email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  email_domain TEXT;
BEGIN
  email_domain := LOWER(SPLIT_PART(email, '@', 2));
  RETURN EXISTS (
    SELECT 1 FROM blocked_email_domains WHERE domain = email_domain
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Function to count signups from IP in last 24 hours
CREATE OR REPLACE FUNCTION count_signups_from_ip(check_ip TEXT, hours INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM ip_signup_tracking
    WHERE ip_address = check_ip
    AND created_at > NOW() - (hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Function to check if fingerprint was used by another account
CREATE OR REPLACE FUNCTION is_fingerprint_used(fp_hash TEXT, current_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF current_user_id IS NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM device_fingerprints WHERE fingerprint_hash = fp_hash
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 FROM device_fingerprints
      WHERE fingerprint_hash = fp_hash
      AND user_id != current_user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
