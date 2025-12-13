import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CreditCard, FileText, Crown, Plus, ArrowRight } from 'lucide-react'

interface RecentDocument {
  id: string
  title: string
  status: string
  created_at: string
  templates: { name: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*, plan:plans(*)')
    .eq('id', user.id)
    .single()

  // Count documents this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: docsThisMonth } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  // Recent documents
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('id, title, status, created_at, templates(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5) as { data: RecentDocument[] | null }

  // Public templates
  const { data: publicTemplates } = await supabase
    .from('templates')
    .select('id, name, category, description')
    .eq('is_public', true)
    .limit(4)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Ola, {profile?.name || 'Usuario'}!
          </h1>
          <p className="text-neutral-500 mt-1">
            Bem-vindo ao seu painel de documentos
          </p>
        </div>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={CreditCard}
          label="Creditos Disponiveis"
          value={profile?.credits || 0}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Documentos este Mes"
          value={docsThisMonth || 0}
          color="green"
        />
        <StatCard
          icon={Crown}
          label="Plano Atual"
          value={profile?.plan?.name || 'Free'}
          color="purple"
          isText
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Documentos Recentes
            </h2>
            <Link
              href="/documents"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentDocs && recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {doc.templates?.name} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhum documento ainda"
              description="Crie seu primeiro documento a partir de um template"
              action={
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Documento
                </Link>
              }
            />
          )}
        </div>

        {/* Quick Actions / Templates */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
            Templates Populares
          </h2>

          {publicTemplates && publicTemplates.length > 0 ? (
            <div className="space-y-3">
              {publicTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/documents/new?template=${template.id}`}
                  className="block p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <p className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {template.description?.slice(0, 60)}...
                  </p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400 capitalize">
                    {template.category}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Nenhum template disponivel ainda.
            </p>
          )}

          <Link
            href="/templates"
            className="block text-center mt-4 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos os templates
          </Link>
        </div>
      </div>
    </div>
  )
}

// Components
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: 'blue' | 'green' | 'purple'
  isText?: boolean
}

function StatCard({ icon: Icon, label, value, color, isText }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className={`${isText ? 'text-xl' : 'text-2xl'} font-bold text-neutral-900 dark:text-white`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    generated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  }

  const labels: Record<string, string> = {
    draft: 'Rascunho',
    generated: 'Gerado',
    sent: 'Enviado',
    archived: 'Arquivado',
  }

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}
