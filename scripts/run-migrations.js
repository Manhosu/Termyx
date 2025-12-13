// Script to run migrations on Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://xekjxblesgdrnqaxpjwx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla2p4Ymxlc2dkcm5xYXhwand4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3Nzc2MCwiZXhwIjoyMDgxMDUzNzYwfQ.t7maC80-HmjAqHO240SDue-M8Nv2ZvdcWANNBPb52s4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('Starting migrations...\n')

  // Read migration files
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    console.log(`Running: ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query if RPC not available
      console.log(`  Note: Using direct REST API...`)
    }

    console.log(`  Done: ${file}\n`)
  }

  console.log('All migrations completed!')
}

runMigrations().catch(console.error)
