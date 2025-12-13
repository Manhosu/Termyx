// Setup database script - Run with: node scripts/setup-database.mjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xekjxblesgdrnqaxpjwx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla2p4Ymxlc2dkcm5xYXhwand4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3Nzc2MCwiZXhwIjoyMDgxMDUzNzYwfQ.t7maC80-HmjAqHO240SDue-M8Nv2ZvdcWANNBPb52s4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function setupDatabase() {
  console.log('🚀 Setting up Termyx database...\n')

  // Test connection
  const { data: test, error: testError } = await supabase.from('plans').select('count')

  if (!testError) {
    console.log('✅ Database already has tables. Checking data...\n')

    // Check plans
    const { data: plans } = await supabase.from('plans').select('*')
    console.log(`📋 Plans: ${plans?.length || 0} found`)

    // Check templates
    const { data: templates } = await supabase.from('templates').select('*')
    console.log(`📄 Templates: ${templates?.length || 0} found`)

    // Check users
    const { data: users } = await supabase.from('users').select('*')
    console.log(`👥 Users: ${users?.length || 0} found`)

    return
  }

  console.log('⚠️  Tables not found. Please run the SQL migrations manually:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Copy and paste the content from:')
  console.log('   - supabase/migrations/001_initial_schema.sql')
  console.log('   - supabase/migrations/002_rls_policies.sql')
  console.log('3. Run each script')
}

async function createStorageBucket() {
  console.log('\n📦 Setting up Storage bucket...')

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.log('❌ Error listing buckets:', listError.message)
    return
  }

  const documentsBucket = buckets?.find(b => b.name === 'documents')

  if (documentsBucket) {
    console.log('✅ Bucket "documents" already exists')
    return
  }

  const { data, error } = await supabase.storage.createBucket('documents', {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf']
  })

  if (error) {
    console.log('❌ Error creating bucket:', error.message)
  } else {
    console.log('✅ Bucket "documents" created successfully')
  }
}

async function main() {
  await setupDatabase()
  await createStorageBucket()
  console.log('\n✨ Setup complete!')
}

main().catch(console.error)
