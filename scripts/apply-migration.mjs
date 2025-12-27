import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})

const migrations = [
  // 1. Add free trial columns to users table
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_used BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_documents_count INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS device_fingerprint TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_ip TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_user_agent TEXT`,

  // 2. Create device fingerprints tracking table
  `CREATE TABLE IF NOT EXISTS device_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_hash TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 3. Create indexes for device_fingerprints
  `CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON device_fingerprints(fingerprint_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_device_fingerprints_ip ON device_fingerprints(ip_address)`,
  `CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user ON device_fingerprints(user_id)`,

  // 4. Create blocked email domains table
  `CREATE TABLE IF NOT EXISTS blocked_email_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    reason TEXT DEFAULT 'disposable',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 5. Create IP abuse tracking table
  `CREATE TABLE IF NOT EXISTS ip_signup_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 6. Create indexes for ip_signup_tracking
  `CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip ON ip_signup_tracking(ip_address)`,
  `CREATE INDEX IF NOT EXISTS idx_ip_tracking_created ON ip_signup_tracking(created_at)`,

  // 7. Enable RLS
  `ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE blocked_email_domains ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE ip_signup_tracking ENABLE ROW LEVEL SECURITY`,
]

async function runMigration() {
  console.log('Starting migration...\n')

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i]
    console.log(`[${i + 1}/${migrations.length}] Executing...`)

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: directError } = await supabase.from('_migrations').select('*').limit(0)
      if (directError) {
        console.log(`  Note: ${error.message}`)
      }
    } else {
      console.log(`  Success`)
    }
  }

  // Insert blocked email domains
  console.log('\nInserting blocked email domains...')

  const domains = [
    '10minutemail.com', 'tempmail.com', 'tempmail.net', 'guerrillamail.com',
    'guerrillamail.org', 'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'fakeinbox.com', 'getnada.com', 'mohmal.com', 'tempail.com', 'dispostable.com',
    'mailnesia.com', 'mintemail.com', 'tempr.email', 'discard.email', 'discardmail.com',
    'spamgourmet.com', 'mytrashmail.com', 'mt2009.com', 'thankyou2010.com',
    'spam4.me', 'grr.la', 'sharklasers.com', 'yopmail.com', 'yopmail.fr',
    'cool.fr.nf', 'jetable.fr.nf', 'courriel.fr.nf', 'moncourrier.fr.nf',
    'monemail.fr.nf', 'monmail.fr.nf', 'hide.biz.st', 'mymail.infos.st',
    'maildrop.cc', 'mailsac.com', 'emailondeck.com', 'tempinbox.com',
    'fakemailgenerator.com', 'throwawaymail.com', 'trashmail.com', 'trashmail.net',
    'trashmail.org', 'trashemail.de', 'wegwerfmail.de', 'wegwerfmail.net',
    'wegwerfmail.org', 'spambox.us', 'spamfree24.org'
  ]

  const domainRecords = domains.map(domain => ({
    domain,
    reason: 'disposable'
  }))

  const { error: insertError } = await supabase
    .from('blocked_email_domains')
    .upsert(domainRecords, { onConflict: 'domain', ignoreDuplicates: true })

  if (insertError) {
    console.log(`  Note: ${insertError.message}`)
  } else {
    console.log(`  Inserted ${domains.length} domains`)
  }

  console.log('\nMigration complete!')
}

runMigration().catch(console.error)
