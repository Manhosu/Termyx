'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Sparkles,
  FileSignature,
  Receipt,
  Calculator,
  ScrollText,
  Folder,
  ArrowRight,
  Star,
  Zap,
  User,
  X,
} from 'lucide-react'
import type { Template } from './page'

interface TemplatesClientProps {
  publicTemplates: Template[]
  myTemplates: Template[]
}

const categories = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'contrato', label: 'Contratos', icon: FileSignature },
  { id: 'recibo', label: 'Recibos', icon: Receipt },
  { id: 'orcamento', label: 'Orcamentos', icon: Calculator },
  { id: 'termo', label: 'Termos', icon: ScrollText },
  { id: 'outro', label: 'Outros', icon: Folder },
]

const categoryIcons: Record<string, React.ElementType> = {
  contrato: FileSignature,
  recibo: Receipt,
  orcamento: Calculator,
  termo: ScrollText,
  outro: Folder,
}

const categoryGradients: Record<string, string> = {
  contrato: 'from-emerald-500 to-teal-600',
  recibo: 'from-green-500 to-emerald-600',
  orcamento: 'from-teal-500 to-cyan-600',
  termo: 'from-amber-500 to-orange-600',
  outro: 'from-neutral-500 to-neutral-600',
}

const categoryBadges: Record<string, string> = {
  contrato: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  recibo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  orcamento: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  termo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  outro: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function TemplatesClient({ publicTemplates, myTemplates }: TemplatesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMyTemplates, setShowMyTemplates] = useState(false)

  const filteredTemplates = useMemo(() => {
    let templates = showMyTemplates ? myTemplates : publicTemplates

    if (selectedCategory !== 'all') {
      templates = templates.filter((t) => t.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      )
    }

    return templates
  }, [publicTemplates, myTemplates, selectedCategory, searchQuery, showMyTemplates])

  const featuredTemplates = publicTemplates.slice(0, 3)

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Header */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 md:p-12"
        variants={itemVariants}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-emerald-100 font-medium">Biblioteca de Templates</span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Encontre o template perfeito
          </motion.h1>

          <motion.p
            className="text-emerald-100 text-lg max-w-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Escolha entre nossa colecao de templates profissionais e comece a criar seus documentos em segundos.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="relative max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar templates por nome, categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-900 border-0 rounded-2xl shadow-xl shadow-black/10 focus:outline-none focus:ring-4 focus:ring-white/30 text-neutral-900 dark:text-white placeholder-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-neutral-800/40 p-4 text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {publicTemplates.length}
          </p>
          <p className="text-sm text-neutral-500">Templates Disponiveis</p>
        </div>
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-neutral-800/40 p-4 text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {categories.length - 1}
          </p>
          <p className="text-sm text-neutral-500">Categorias</p>
        </div>
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-neutral-800/40 p-4 text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {myTemplates.length}
          </p>
          <p className="text-sm text-neutral-500">Meus Templates</p>
        </div>
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-neutral-800/40 p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-5 h-5 text-amber-500" />
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">1</p>
          </div>
          <p className="text-sm text-neutral-500">Credito por doc</p>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          {myTemplates.length > 0 && (
            <button
              onClick={() => setShowMyTemplates(!showMyTemplates)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                showMyTemplates
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-teal-500'
              }`}
            >
              <User className="w-4 h-4" />
              Meus Templates
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id

            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Featured Templates (only when showing all and no search) */}
      {selectedCategory === 'all' && !searchQuery && !showMyTemplates && featuredTemplates.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Templates em Destaque
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates.map((template, index) => (
              <FeaturedTemplateCard
                key={template.id}
                template={template}
                index={index}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Templates Grid */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {showMyTemplates ? 'Meus Templates' : 'Todos os Templates'}
            {searchQuery && (
              <span className="text-neutral-500 font-normal ml-2">
                ({filteredTemplates.length} resultado{filteredTemplates.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {filteredTemplates.length > 0 ? (
            <motion.div
              key="templates-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-3xl flex items-center justify-center mx-auto mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {searchQuery
                  ? 'Nenhum template encontrado'
                  : 'Nenhum template disponivel'}
              </h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                {searchQuery
                  ? `Nao encontramos templates com "${searchQuery}". Tente buscar por outro termo.`
                  : 'Os templates estao sendo preparados. Em breve voce tera acesso a nossa colecao completa.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                >
                  Limpar busca
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}

function FeaturedTemplateCard({
  template,
  index,
}: {
  template: Template
  index: number
}) {
  const Icon = categoryIcons[template.category] || Folder
  const gradient = categoryGradients[template.category] || categoryGradients.outro

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/documents/new?template=${template.id}`}
        className="group relative block overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
      >
        {/* Featured Badge */}
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
            <Star className="w-3 h-3" />
            Destaque
          </span>
        </div>

        {/* Icon */}
        <motion.div
          className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-2">
          {template.name}
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
          {template.description || 'Template profissional para seus documentos'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${
              categoryBadges[template.category] || categoryBadges.outro
            }`}
          >
            {template.category}
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
            Usar
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function TemplateCard({
  template,
  index,
}: {
  template: Template
  index: number
}) {
  const Icon = categoryIcons[template.category] || Folder
  const gradient = categoryGradients[template.category] || categoryGradients.outro

  return (
    <motion.div
      variants={itemVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <Link
        href={`/documents/new?template=${template.id}`}
        className="group block h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
      >
        {/* Icon */}
        <motion.div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-md`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-2">
          {template.name}
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
          {template.description || 'Template profissional para seus documentos'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${
              categoryBadges[template.category] || categoryBadges.outro
            }`}
          >
            {template.category}
          </span>
          <div className="flex items-center gap-2">
            {template.price_credit > 0 && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Zap className="w-3 h-3 text-amber-500" />
                {template.price_credit}
              </span>
            )}
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
