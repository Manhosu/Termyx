// Execute SQL commands via Supabase Management API
// Run with: node scripts/execute-sql.mjs

const PROJECT_REF = 'xekjxblesgdrnqaxpjwx'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla2p4Ymxlc2dkcm5xYXhwand4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3Nzc2MCwiZXhwIjoyMDgxMDUzNzYwfQ.t7maC80-HmjAqHO240SDue-M8Nv2ZvdcWANNBPb52s4'

// SQL commands to execute
const sqlCommands = [
  {
    name: 'Create plans table',
    sql: `CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC(10,2) DEFAULT 0,
  price_annual NUMERIC(10,2) DEFAULT 0,
  credits_included INTEGER DEFAULT 0,
  max_templates INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  gateway_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Create users table',
    sql: `CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company_name TEXT,
  company_logo TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
  plan_id UUID REFERENCES plans(id),
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  business_category TEXT,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);`
  },
  {
    name: 'Create templates table',
    sql: `CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('contrato', 'recibo', 'orcamento', 'termo', 'outro')),
  description TEXT,
  content_html TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  price_credit INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Create documents table',
    sql: `CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ
);`
  },
  {
    name: 'Create payments table',
    sql: `CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  gateway TEXT NOT NULL,
  gateway_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'credits', 'one_time')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Create document_sends table',
    sql: `CREATE TABLE IF NOT EXISTS public.document_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Create document_shares table',
    sql: `CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Create audit_logs table',
    sql: `CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  payload JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);`
  },
  {
    name: 'Seed plans table',
    sql: `INSERT INTO plans (name, slug, price_monthly, price_annual, credits_included, max_templates, features) VALUES
('Free', 'free', 0, 0, 3, 0, '["3 documentos/mes", "Watermark no PDF", "Templates publicos"]'),
('Basic', 'basic', 19.00, 190.00, 0, 3, '["Documentos ilimitados", "Sem watermark", "3 templates customizados", "Envio por email"]'),
('Pro', 'pro', 49.00, 490.00, 100, -1, '["Tudo do Basic", "Templates ilimitados", "100 creditos inclusos", "Assinatura em tela", "Envio WhatsApp", "Suporte prioritario"]'),
('Enterprise', 'enterprise', 150.00, 1500.00, 500, -1, '["Tudo do Pro", "Multi-usuarios", "Marca branca", "API de integracao", "Gerente de conta"]')
ON CONFLICT (slug) DO NOTHING;`
  }
]

async function executeSql(name, sql) {
  console.log(`\n${name}...`)

  try {
    const response = await fetch(
      `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ ERROR (${response.status}): ${errorText}`)
      return { success: false, error: `${response.status}: ${errorText}` }
    }

    console.log(`✅ SUCCESS`)
    return { success: true }
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`)
    return { success: false, error: err.message }
  }
}

async function main() {
  console.log('🚀 Executing SQL commands on Supabase...\n')
  console.log('=' .repeat(60))

  const results = []

  for (const command of sqlCommands) {
    const result = await executeSql(command.name, command.sql)
    results.push({ name: command.name, ...result })
    // Wait a bit between commands to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 SUMMARY:\n')

  let successCount = 0
  let failureCount = 0

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}`)
      successCount++
    } else {
      console.log(`❌ ${result.name}: ${result.error}`)
      failureCount++
    }
  })

  console.log(`\n✨ Complete! ${successCount} successful, ${failureCount} failed`)

  if (failureCount === 0) {
    console.log('\n🎉 All commands executed successfully!')
  } else {
    console.log('\n⚠️  Some commands failed. You may need to execute them manually via Supabase Dashboard.')
    console.log('Go to: https://supabase.com/dashboard/project/xekjxblesgdrnqaxpjwx/sql/new')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
