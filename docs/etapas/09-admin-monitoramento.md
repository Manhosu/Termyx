# Etapa 9: Admin e Monitoramento

## Objetivo
Implementar painel administrativo basico e configurar ferramentas de monitoramento, logs e metricas.

---

## Checklist

### 9.1 Painel Admin
- [ ] Layout admin separado
- [ ] Protecao de rota (role = admin)
- [ ] Dashboard admin com metricas

### 9.2 Gestao de Usuarios
- [ ] Listagem de usuarios (tabela paginada)
- [ ] Busca e filtros
- [ ] Detalhes do usuario
- [ ] Editar usuario (plano, creditos, status)
- [ ] Bloquear/desbloquear usuario

### 9.3 Gestao de Documentos
- [ ] Listagem de todos os documentos
- [ ] Filtros: usuario, status, data
- [ ] Visualizar documento
- [ ] Estatisticas de geracao

### 9.4 Gestao de Templates
- [ ] Listagem de templates publicos
- [ ] Criar/editar template publico
- [ ] Ativar/desativar template

### 9.5 Financeiro
- [ ] Metricas: MRR, receita total, conversoes
- [ ] Listagem de pagamentos
- [ ] Grafico de receita

### 9.6 Logs de Auditoria
- [ ] Visualizacao de logs
- [ ] Filtros: usuario, acao, data
- [ ] Exportar logs

### 9.7 Monitoramento
- [ ] Setup Sentry (erros)
- [ ] Metricas de performance
- [ ] Alertas configurados
- [ ] Health check endpoint

---

## Implementacao

### Middleware Admin
```typescript
// /middleware.ts (adicionar)

// Verificar role admin
const adminRoutes = ['/admin']
const isAdminRoute = adminRoutes.some(route =>
  request.nextUrl.pathname.startsWith(route)
)

if (isAdminRoute) {
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### Layout Admin
```typescript
// /app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    </div>
  )
}
```

### Dashboard Admin
```typescript
// /app/(admin)/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Users, FileText, CreditCard, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Metricas
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalDocuments } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'paid')

  const totalRevenue = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

  // Usuarios recentes
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, email, name, created_at, plan:plans(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Documentos recentes
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('id, title, status, created_at, user:users(email)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Usuarios</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Documentos</p>
              <p className="text-2xl font-bold">{totalDocuments}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Receita Total</p>
              <p className="text-2xl font-bold">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Conversao</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Usuarios Recentes</h2>
          <div className="space-y-3">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {user.plan?.name || 'Free'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Documentos Recentes</h2>
          <div className="space-y-3">
            {recentDocs?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-neutral-500">{doc.user?.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  doc.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
```

### API Admin - Usuarios
```typescript
// /app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('users')
    .select('*, plan:plans(name)', { count: 'exact' })

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    users: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  })
}
```

### Setup Sentry
```typescript
// /lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

export { Sentry }
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

```javascript
// sentry.server.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Health Check
```typescript
// /app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      storage: 'unknown'
    }
  }

  try {
    const supabase = createClient()

    // Check database
    const { error: dbError } = await supabase
      .from('plans')
      .select('id')
      .limit(1)

    checks.services.database = dbError ? 'unhealthy' : 'healthy'

    // Check storage
    const { error: storageError } = await supabase.storage
      .listBuckets()

    checks.services.storage = storageError ? 'unhealthy' : 'healthy'

    // Overall status
    const allHealthy = Object.values(checks.services).every(s => s === 'healthy')
    checks.status = allHealthy ? 'healthy' : 'degraded'

    return NextResponse.json(checks, {
      status: checks.status === 'healthy' ? 200 : 503
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}
```

---

## Metricas a Monitorar

### KPIs de Negocio
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate
- Conversao free -> pago
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)

### Metricas Tecnicas
- Tempo de geracao de PDF
- Taxa de erro de geracao
- Latencia das APIs
- Uptime
- Uso de storage

### Alertas Recomendados
- Taxa de erro > 5%
- Latencia P95 > 3s
- Downtime detectado
- Falhas de pagamento
- Storage > 80%

---

## Entregaveis
- [ ] Painel admin acessivel
- [ ] Listagem de usuarios
- [ ] Listagem de documentos
- [ ] Metricas basicas
- [ ] Logs de auditoria
- [ ] Sentry configurado
- [ ] Health check funcionando

---

## Proxima Etapa
[Etapa 10: Deploy](./10-deploy.md)
