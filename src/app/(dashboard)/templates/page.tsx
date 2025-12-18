import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch public templates
  const { data: publicTemplates } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('category')

  // Fetch user's custom templates
  const { data: myTemplates } = user
    ? await supabase
        .from('templates')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Group by category
  const categories = ['contrato', 'recibo', 'orcamento', 'termo', 'outro']
  const groupedTemplates = categories.reduce((acc, cat) => {
    acc[cat] = publicTemplates?.filter(t => t.category === cat) || []
    return acc
  }, {} as Record<string, typeof publicTemplates>)

  const categoryLabels: Record<string, string> = {
    contrato: 'Contratos',
    recibo: 'Recibos',
    orcamento: 'Orcamentos',
    termo: 'Termos',
    outro: 'Outros',
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Templates
          </h1>
          <p className="text-neutral-500 mt-1">
            Escolha um template para criar seu documento
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      {/* My Templates */}
      {myTemplates && myTemplates.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Meus Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}

      {/* Public Templates by Category */}
      {categories.map((category) => {
        const templates = groupedTemplates[category]
        if (!templates || templates.length === 0) return null

        return (
          <section key={category}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {categoryLabels[category]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Empty State */}
      {(!publicTemplates || publicTemplates.length === 0) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            Nenhum template disponivel
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Os templates estao sendo preparados. Execute as migrations do banco de dados para popular os templates.
          </p>
        </div>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string | null
    category: string
    price_credit: number
    is_public: boolean
  }
}

function TemplateCard({ template }: TemplateCardProps) {
  const categoryColors: Record<string, string> = {
    contrato: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    recibo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    orcamento: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    termo: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    outro: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
  }

  return (
    <Link
      href={`/documents/new?template=${template.id}`}
      className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-500 hover:shadow-lg transition-all"
    >
      {/* Icon */}
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-2">
        {template.name}
      </h3>
      <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
        {template.description || 'Template profissional para seus documentos'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${categoryColors[template.category] || categoryColors.outro}`}>
          {template.category}
        </span>
        {template.price_credit > 0 && (
          <span className="text-xs text-neutral-500">
            {template.price_credit} credito{template.price_credit > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
