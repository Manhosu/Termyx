'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Filter, Download, Send, Eye, Trash2, Plus, Calendar, MoreVertical, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  title: string
  status: 'draft' | 'generated' | 'sent' | 'archived'
  created_at: string
  updated_at: string
  generated_at: string | null
  pdf_path: string | null
  templates: {
    name: string
    category: string
  } | null
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  generated: { label: 'Gerado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  sent: { label: 'Enviado', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  archived: { label: 'Arquivado', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        generated_at,
        pdf_path,
        templates (name, category)
      `)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setDocuments(data as unknown as Document[])
    }
    setLoading(false)
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (!error) {
      setDocuments(docs => docs.filter(d => d.id !== id))
    }
    setActiveMenu(null)
  }

  const handleDownload = async (doc: Document) => {
    if (!doc.pdf_path) return

    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.pdf_path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
    setActiveMenu(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Meus Documentos
          </h1>
          <p className="text-neutral-500 mt-1">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} no total
          </p>
        </div>

        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              statusFilter !== 'all'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {['all', 'draft', 'generated', 'sent', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setShowFilters(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                    statusFilter === status ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {status === 'all' ? 'Todos' : statusConfig[status as keyof typeof statusConfig].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
          </h2>
          <p className="text-neutral-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro documento a partir de um template'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Documento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                      {doc.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[doc.status].color}`}>
                      {statusConfig[doc.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    {doc.templates && (
                      <span className="truncate">{doc.templates.name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {doc.status === 'draft' && (
                    <Link
                      href={`/documents/${doc.id}/edit`}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                      title="Editar"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  )}

                  {doc.pdf_path && (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}

                  {doc.status === 'generated' && (
                    <Link
                      href={`/documents/${doc.id}/send`}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                      title="Enviar"
                    >
                      <Send className="w-5 h-5" />
                    </Link>
                  )}

                  {/* More Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenu === doc.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </Link>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menus */}
      {(activeMenu || showFilters) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setActiveMenu(null)
            setShowFilters(false)
          }}
        />
      )}
    </div>
  )
}
