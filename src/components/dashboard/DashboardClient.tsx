'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, FileText, Crown, Plus, ArrowRight, Sparkles } from 'lucide-react'

interface RecentDocument {
  id: string
  title: string
  status: string
  created_at: string
  templates: { name: string } | null
}

interface Template {
  id: string
  name: string
  category: string
  description: string | null
}

interface Profile {
  name: string | null
  credits: number
  plan: { name: string } | null
}

interface DashboardClientProps {
  profile: Profile | null
  docsThisMonth: number
  recentDocs: RecentDocument[] | null
  publicTemplates: Template[] | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardClient({
  profile,
  docsThisMonth,
  recentDocs,
  publicTemplates,
}: DashboardClientProps) {
  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Ola, {profile?.name || 'Usuario'}!
          </motion.h1>
          <motion.p
            className="text-neutral-500 mt-1 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Bem-vindo ao seu painel de documentos
          </motion.p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Plus className="w-5 h-5" />
            Novo Documento
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={itemVariants}
      >
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
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <motion.div
          className="lg:col-span-2 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-neutral-800/40 p-6 shadow-xl shadow-black/5"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Documentos Recentes
            </h2>
            <Link
              href="/documents"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentDocs && recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc, index) => (
                <DocumentCard key={doc.id} doc={doc} index={index} />
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Criar Documento
                </Link>
              }
            />
          )}
        </motion.div>

        {/* Quick Actions / Templates */}
        <motion.div
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-neutral-800/40 p-6 shadow-xl shadow-black/5"
          variants={itemVariants}
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Templates Populares
          </h2>

          {publicTemplates && publicTemplates.length > 0 ? (
            <div className="space-y-3">
              {publicTemplates.map((template, index) => (
                <TemplateCard key={template.id} template={template} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Nenhum template disponivel ainda.
            </p>
          )}

          <Link
            href="/templates"
            className="block text-center mt-4 py-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
          >
            Ver todos os templates
          </Link>
        </motion.div>
      </div>
    </motion.div>
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
  const gradients = {
    blue: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
    green: 'from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20',
    purple: 'from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20',
  }

  const iconColors = {
    blue: 'text-emerald-600 dark:text-emerald-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-teal-600 dark:text-teal-400',
  }

  const iconBg = {
    blue: 'bg-emerald-100 dark:bg-emerald-900/40',
    green: 'bg-green-100 dark:bg-green-900/40',
    purple: 'bg-teal-100 dark:bg-teal-900/40',
  }

  return (
    <motion.div
      className={`relative overflow-hidden bg-gradient-to-br ${gradients[color]} bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-neutral-800/40 p-6 shadow-xl shadow-black/5`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className={`p-3 rounded-2xl ${iconBg[color]}`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        </motion.div>
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className={`${isText ? 'text-xl' : 'text-2xl'} font-bold text-neutral-900 dark:text-white`}>
            {value}
          </p>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40 ${
        color === 'blue' ? 'bg-emerald-400' :
        color === 'green' ? 'bg-green-400' : 'bg-teal-400'
      }`} />
    </motion.div>
  )
}

function DocumentCard({ doc, index }: { doc: RecentDocument; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/documents/${doc.id}`}
        className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-all group border border-transparent hover:border-white/50 dark:hover:border-neutral-700/50"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-2xl flex items-center justify-center"
            whileHover={{ rotate: 5 }}
          >
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {doc.title}
            </p>
            <p className="text-sm text-neutral-500">
              {doc.templates?.name} • {formatDate(doc.created_at)}
            </p>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </Link>
    </motion.div>
  )
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/documents/new?template=${template.id}`}
        className="block p-4 rounded-2xl border border-white/50 dark:border-neutral-700/50 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all group bg-white/40 dark:bg-neutral-800/40"
      >
        <p className="font-medium text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
          {template.name}
        </p>
        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
          {template.description?.slice(0, 60)}...
        </p>
        <span className="inline-block mt-2 text-xs px-2.5 py-1 bg-gradient-to-r from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-lg text-neutral-600 dark:text-neutral-400 capitalize font-medium">
          {template.category}
        </span>
      </Link>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 dark:from-yellow-900/40 dark:to-amber-900/40 dark:text-yellow-400',
    generated: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-400',
    sent: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 dark:from-teal-900/40 dark:to-cyan-900/40 dark:text-teal-400',
    archived: 'bg-gradient-to-r from-neutral-100 to-slate-100 text-neutral-600 dark:from-neutral-800 dark:to-slate-900 dark:text-neutral-400',
  }

  const labels: Record<string, string> = {
    draft: 'Rascunho',
    generated: 'Gerado',
    sent: 'Enviado',
    archived: 'Arquivado',
  }

  return (
    <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${styles[status] || styles.draft}`}>
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
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-3xl flex items-center justify-center mx-auto mb-4"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Icon className="w-10 h-10 text-emerald-500" />
      </motion.div>
      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-4">{description}</p>
      {action}
    </motion.div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}
