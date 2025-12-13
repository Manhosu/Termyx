import { createClient } from '@/lib/supabase/server'
import { Users, FileText, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'

interface StatCard {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get date ranges
  const now = new Date()
  const startOfThisMonth = startOfMonth(now)

  // Fetch stats
  const [
    { count: totalUsers },
    { count: newUsersThisMonth },
    { count: totalDocuments },
    { count: documentsThisMonth },
    { data: paymentsThisMonth },
    { data: recentUsers },
    { data: recentDocuments },
  ] = await Promise.all([
    // Total users
    supabase.from('users').select('*', { count: 'exact', head: true }),
    // New users this month
    supabase.from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonth.toISOString()),
    // Total documents
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    // Documents this month
    supabase.from('documents').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonth.toISOString()),
    // Payments this month
    supabase.from('payments').select('amount')
      .eq('status', 'paid')
      .gte('created_at', startOfThisMonth.toISOString()),
    // Recent users
    supabase.from('users').select('id, name, email, created_at, plan:plans(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    // Recent documents
    supabase.from('documents').select('id, title, status, created_at, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const revenueThisMonth = paymentsThisMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const stats: StatCard[] = [
    {
      title: 'Total de Usuarios',
      value: totalUsers || 0,
      change: newUsersThisMonth || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Documentos Gerados',
      value: totalDocuments || 0,
      change: documentsThisMonth || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Receita do Mes',
      value: `R$ ${revenueThisMonth.toFixed(2)}`,
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Taxa de Conversao',
      value: totalUsers ? `${((documentsThisMonth || 0) / (totalUsers || 1) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Dashboard Admin
        </h1>
        <p className="text-neutral-500 mt-1">
          Visao geral da plataforma Termyx
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  +{stat.change} este mes
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-neutral-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Usuarios Recentes
          </h2>
          <div className="space-y-4">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {user.name || 'Sem nome'}
                    </p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">
                    {format(new Date(user.created_at), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-blue-600">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(user.plan as any)?.name || 'Free'}
                  </p>
                </div>
              </div>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-sm text-neutral-500 text-center py-4">
                Nenhum usuario encontrado
              </p>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Documentos Recentes
          </h2>
          <div className="space-y-4">
            {recentDocuments?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                      {doc.title}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(doc.users as any)?.name || (doc.users as any)?.email || 'Usuario'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'generated'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : doc.status === 'sent'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {doc.status === 'generated' ? 'Gerado' :
                     doc.status === 'sent' ? 'Enviado' :
                     doc.status === 'draft' ? 'Rascunho' : doc.status}
                  </span>
                  <p className="text-xs text-neutral-500 mt-1">
                    {format(new Date(doc.created_at), 'dd/MM HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {(!recentDocuments || recentDocuments.length === 0) && (
              <p className="text-sm text-neutral-500 text-center py-4">
                Nenhum documento encontrado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
