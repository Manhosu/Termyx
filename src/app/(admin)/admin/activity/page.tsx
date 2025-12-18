import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Activity, User, FileText, CreditCard, LogIn, Shield, Search, Filter, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const actionConfig: Record<string, { label: string; icon: typeof Activity; color: string }> = {
  'user.login': { label: 'Login', icon: LogIn, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
  'user.signup': { label: 'Cadastro', icon: User, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  'document.generate_pdf': { label: 'PDF Gerado', icon: FileText, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
  'document.send_email': { label: 'Email Enviado', icon: FileText, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  'payment.checkout_created': { label: 'Checkout Criado', icon: CreditCard, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
  'payment.completed': { label: 'Pagamento Completo', icon: CreditCard, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  'subscription.created': { label: 'Assinatura Criada', icon: CreditCard, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
  'subscription.cancelled': { label: 'Assinatura Cancelada', icon: CreditCard, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  'admin.action': { label: 'Acao Admin', icon: Shield, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
}

export default async function AdminActivityPage() {
  const supabase = await createClient()

  // Fetch audit logs with user info
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching audit logs:', error)
  }

  // Stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayLogs = logs?.filter(l => new Date(l.created_at) >= todayStart) || []
  const loginCount = todayLogs.filter(l => l.action === 'user.login').length
  const pdfCount = todayLogs.filter(l => l.action === 'document.generate_pdf').length
  const paymentCount = todayLogs.filter(l => l.action.startsWith('payment.')).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Logs de Atividade
          </h1>
          <p className="text-neutral-500 mt-1">
            Monitore todas as acoes realizadas na plataforma
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-neutral-500">Atividades Hoje</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {todayLogs.length}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-neutral-500">Logins Hoje</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {loginCount}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-sm text-neutral-500">PDFs Gerados</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {pdfCount}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-neutral-500">Pagamentos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {paymentCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por usuario ou acao..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Todas as acoes</option>
          <option value="user.login">Login</option>
          <option value="user.signup">Cadastro</option>
          <option value="document.generate_pdf">PDF Gerado</option>
          <option value="payment.completed">Pagamento</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {logs?.map((log) => {
            const config = actionConfig[log.action] || {
              label: log.action,
              icon: Activity,
              color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800'
            }
            const Icon = config.icon

            return (
              <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {config.label}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {log.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>
                        {log.user?.name || log.user?.email || 'Usuario desconhecido'}
                      </span>
                      {log.resource_type && (
                        <>
                          <span>•</span>
                          <span>{log.resource_type}: {log.resource_id?.substring(0, 8)}...</span>
                        </>
                      )}
                      {log.ip_address && (
                        <>
                          <span>•</span>
                          <span>IP: {log.ip_address}</span>
                        </>
                      )}
                    </div>
                    {log.payload && Object.keys(log.payload).length > 0 && (
                      <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <pre className="text-xs text-neutral-600 dark:text-neutral-400 overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-neutral-400 whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd/MM HH:mm:ss')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {(!logs || logs.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">Nenhuma atividade registrada</p>
          </div>
        )}

        {/* Load More */}
        {logs && logs.length >= 100 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <button className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
