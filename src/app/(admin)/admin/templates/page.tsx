import { createClient } from '@/lib/supabase/server'
import { Search, Plus, FileText, Eye, EyeOff, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

const categoryLabels: Record<string, string> = {
  contrato: 'Contrato',
  recibo: 'Recibo',
  orcamento: 'Orcamento',
  termo: 'Termo',
  outro: 'Outro',
}

const categoryColors: Record<string, string> = {
  contrato: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  recibo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  orcamento: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  termo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  outro: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
}

export default async function AdminTemplatesPage() {
  const supabase = await createClient()

  // Fetch templates with owner info
  const { data: templates, error } = await supabase
    .from('templates')
    .select(`
      *,
      owner:users!templates_owner_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
  }

  // Get template usage stats
  const { data: usageStats } = await supabase
    .from('documents')
    .select('template_id')

  const usageCount: Record<string, number> = {}
  usageStats?.forEach((doc) => {
    if (doc.template_id) {
      usageCount[doc.template_id] = (usageCount[doc.template_id] || 0) + 1
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Templates
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie os templates de documentos da plataforma
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Template
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar templates..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Todas as categorias</option>
          <option value="contrato">Contrato</option>
          <option value="recibo">Recibo</option>
          <option value="orcamento">Orcamento</option>
          <option value="termo">Termo</option>
          <option value="outro">Outro</option>
        </select>
        <select className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Visibilidade</option>
          <option value="public">Publico</option>
          <option value="private">Privado</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
                    {template.name}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[template.category]}`}>
                    {categoryLabels[template.category] || template.category}
                  </span>
                </div>
              </div>
              <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {template.description && (
              <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
              <div className="flex items-center gap-1">
                {template.is_public ? (
                  <>
                    <Eye className="w-4 h-4 text-green-500" />
                    <span>Publico</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-neutral-400" />
                    <span>Privado</span>
                  </>
                )}
              </div>
              <span>{template.price_credit} credito(s)</span>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-500 pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <span>Usado {usageCount[template.id] || 0}x</span>
              <span>v{template.version}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {template.owner ? (
                  <span className="text-neutral-500">
                    Por {template.owner.name || template.owner.email}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">Sistema</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/templates/${template.id}`}
                  className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!templates || templates.length === 0) && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-neutral-500 mb-6">
            Crie seu primeiro template para comecar
          </p>
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Template
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm text-neutral-500 mb-1">Total de Templates</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {templates?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm text-neutral-500 mb-1">Templates Publicos</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {templates?.filter((t) => t.is_public).length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm text-neutral-500 mb-1">Total de Usos</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {Object.values(usageCount).reduce((sum, count) => sum + count, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
