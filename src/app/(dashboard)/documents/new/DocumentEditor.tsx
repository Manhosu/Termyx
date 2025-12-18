'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, FileText, Download, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Placeholder {
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'currency' | 'cpf_cnpj' | 'phone' | 'email' | 'number' | 'select'
  required: boolean
  options?: string[]
}

interface Template {
  id: string
  name: string
  category: string
  description: string | null
  content_html: string
  placeholders: Placeholder[]
  price_credit: number
}

export default function NewDocumentPage() {
  const router = useRouter()

  // Get template ID from URL on client side
  const [templateId, setTemplateId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTemplateId(params.get('template') || '')
  }, [])

  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadTemplate() {
      // Wait for templateId to be loaded from URL
      if (templateId === null) {
        return // Still loading URL params
      }

      if (templateId === '') {
        setError('Nenhum template selecionado')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error || !data) {
        setError('Template nao encontrado')
        setLoading(false)
        return
      }

      setTemplate(data as Template)
      setTitle(`${data.name} - ${new Date().toLocaleDateString('pt-BR')}`)

      // Initialize form data with empty values
      const initialData: Record<string, string> = {}
      const placeholders = data.placeholders as Placeholder[]
      placeholders.forEach((p: Placeholder) => {
        initialData[p.name] = ''
      })
      setFormData(initialData)
      setLoading(false)
    }

    loadTemplate()
  }, [templateId, supabase])

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const renderPreview = useCallback(() => {
    if (!template) return ''

    let html = template.content_html
    Object.entries(formData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      html = html.replace(regex, value || `<span class="placeholder">{{${key}}}</span>`)
    })

    return html
  }, [template, formData])

  const handleSaveDraft = async () => {
    if (!template) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario nao autenticado')

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          template_id: template.id,
          title,
          data: formData,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/documents/${data.id}`)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setError('Erro ao salvar o documento')
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!template) return

    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario nao autenticado')

      // First save the document
      const { data: doc, error: saveError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          template_id: template.id,
          title,
          data: formData,
          status: 'draft'
        })
        .select()
        .single()

      if (saveError) throw saveError

      // Then call PDF generation API
      const response = await fetch('/api/documents/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          html: renderPreview()
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar PDF')

      const result = await response.json()

      // Update document with PDF path
      await supabase
        .from('documents')
        .update({
          pdf_path: result.pdfPath,
          status: 'generated',
          generated_at: new Date().toISOString(),
          credits_charged: template.price_credit
        })
        .eq('id', doc.id)

      router.push(`/documents/${doc.id}`)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      setError('Erro ao gerar o PDF')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          {error || 'Template nao encontrado'}
        </h2>
        <p className="text-neutral-500 mb-6">
          Selecione um template valido para criar seu documento.
        </p>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Templates
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/templates"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-neutral-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full"
              placeholder="Titulo do documento"
            />
            <p className="text-sm text-neutral-500">
              {template.name} • {template.price_credit} credito{template.price_credit > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Salvar Rascunho</span>
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
            Preencha os dados
          </h2>

          <div className="space-y-4">
            {template.placeholders.map((placeholder) => (
              <FormField
                key={placeholder.name}
                placeholder={placeholder}
                value={formData[placeholder.name] || ''}
                onChange={(value) => handleInputChange(placeholder.name, value)}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Preview do Documento
            </h2>

            <div
              className="document-preview bg-white rounded-xl border border-neutral-200 p-8 min-h-[500px] text-neutral-900 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          </div>
        </div>
      </div>

      {/* Preview Styles */}
      <style jsx global>{`
        .document-preview {
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.6;
        }
        .document-preview h1 {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        .document-preview h2 {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .document-preview .placeholder {
          background-color: #fef3c7;
          color: #92400e;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.75rem;
        }
        .document-preview .signatures {
          margin-top: 3rem;
          text-align: center;
        }
        .document-preview .signature-line {
          display: inline-block;
          margin: 1rem 2rem;
          text-align: center;
        }
        .document-preview .amount-box {
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          padding: 1rem;
          border: 2px solid #000;
          margin: 1rem 0;
        }
        .document-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .document-preview table td {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        .document-preview table .total td {
          font-weight: bold;
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  )
}

interface FormFieldProps {
  placeholder: Placeholder
  value: string
  onChange: (value: string) => void
}

function FormField({ placeholder, value, onChange }: FormFieldProps) {
  const baseInputClass = "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm"

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '')
    const formatted = (parseInt(num) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return formatted
  }

  const formatCPFCNPJ = (val: string) => {
    const num = val.replace(/\D/g, '')
    if (num.length <= 11) {
      return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatPhone = (val: string) => {
    const num = val.replace(/\D/g, '')
    if (num.length <= 10) {
      return num.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return num.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const handleChange = (val: string) => {
    let formatted = val
    switch (placeholder.type) {
      case 'currency':
        formatted = formatCurrency(val)
        break
      case 'cpf_cnpj':
        formatted = formatCPFCNPJ(val)
        break
      case 'phone':
        formatted = formatPhone(val)
        break
    }
    onChange(formatted)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
        {placeholder.label}
        {placeholder.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {placeholder.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} min-h-[100px] resize-y`}
          placeholder={`Digite ${placeholder.label.toLowerCase()}`}
          required={placeholder.required}
        />
      ) : placeholder.type === 'select' && placeholder.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          required={placeholder.required}
        >
          <option value="">Selecione...</option>
          {placeholder.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : placeholder.type === 'date' ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          required={placeholder.required}
        />
      ) : placeholder.type === 'number' ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          placeholder={`Digite ${placeholder.label.toLowerCase()}`}
          required={placeholder.required}
        />
      ) : placeholder.type === 'email' ? (
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          placeholder="email@exemplo.com"
          required={placeholder.required}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClass}
          placeholder={`Digite ${placeholder.label.toLowerCase()}`}
          required={placeholder.required}
        />
      )}
    </div>
  )
}
