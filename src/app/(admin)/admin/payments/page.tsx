import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { CreditCard, DollarSign, TrendingUp, Search, Filter, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  // Fetch payments with user info
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      user:users(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching payments:', error)
  }

  // Calculate stats
  const totalRevenue = payments?.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0) || 0
  const totalPaid = payments?.filter(p => p.status === 'paid').length || 0
  const totalPending = payments?.filter(p => p.status === 'pending').length || 0
  const avgTicket = totalPaid > 0 ? totalRevenue / totalPaid : 0

  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    refunded: { label: 'Reembolsado', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' },
  }

  const typeLabels: Record<string, string> = {
    subscription: 'Assinatura',
    credits: 'Creditos',
    one_time: 'Avulso',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Pagamentos
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie e monitore todos os pagamentos da plataforma
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-neutral-500">Receita Total</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-neutral-500">Pagamentos Pagos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {totalPaid}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-neutral-500">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {totalPending}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-sm text-neutral-500">Ticket Medio</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            R$ {avgTicket.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por usuario ou ID..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Todos os status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="failed">Falhou</option>
          <option value="refunded">Reembolsado</option>
        </select>
        <select className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Todos os tipos</option>
          <option value="subscription">Assinatura</option>
          <option value="credits">Creditos</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Filter className="w-4 h-4" />
          Mais filtros
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID Gateway
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {payments?.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {payment.user?.name || 'Sem nome'}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {payment.user?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {typeLabels[payment.type] || payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      R$ {Number(payment.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status]?.color || 'bg-neutral-100 text-neutral-700'}`}>
                      {statusConfig[payment.status]?.label || payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-neutral-400">
                      {payment.gateway_id ? `${payment.gateway_id.substring(0, 20)}...` : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(!payments || payments.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">Nenhum pagamento encontrado</p>
          </div>
        )}

        {/* Pagination */}
        {payments && payments.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Mostrando {payments.length} pagamentos
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50" disabled>
                Anterior
              </button>
              <button className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                Proximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
