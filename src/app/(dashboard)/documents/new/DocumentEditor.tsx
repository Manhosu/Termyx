'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, FileText, Download, Save, Eye, EyeOff, Loader2, Users, Building2, ChevronDown, Plus, Check } from 'lucide-react'
import Link from 'next/link'
import NoCreditsModal from '@/components/billing/NoCreditsModal'

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

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  document_number: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
}

interface CompanyProfile {
  id: string
  name: string
  legal_name: string | null
  document_number: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  website: string | null
}

// Map placeholder names to data fields
const companyFieldMap: Record<string, keyof CompanyProfile> = {
  'COMPANY_NAME': 'name',
  'COMPANY_LEGAL_NAME': 'legal_name',
  'COMPANY_DOCUMENT': 'document_number',
  'COMPANY_CNPJ': 'document_number',
  'COMPANY_ADDRESS': 'address',
  'COMPANY_CITY': 'city',
  'COMPANY_STATE': 'state',
  'COMPANY_ZIP': 'zip_code',
  'COMPANY_EMAIL': 'email',
  'COMPANY_PHONE': 'phone',
  'COMPANY_WEBSITE': 'website',
}

const clientFieldMap: Record<string, keyof Client> = {
  'CLIENT_NAME': 'name',
  'CLIENT_DOCUMENT': 'document_number',
  'CLIENT_CPF': 'document_number',
  'CLIENT_CNPJ': 'document_number',
  'CLIENT_ADDRESS': 'address',
  'CLIENT_CITY': 'city',
  'CLIENT_STATE': 'state',
  'CLIENT_ZIP': 'zip_code',
  'CLIENT_EMAIL': 'email',
  'CLIENT_PHONE': 'phone',
}

export default function NewDocumentPage() {
  const router = useRouter()
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

  // New states for company and clients
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Credits and eligibility state
  const [credits, setCredits] = useState<number | null>(null)
  const [canCreate, setCanCreate] = useState<boolean | null>(null)
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false)
  const [checkingCredits, setCheckingCredits] = useState(true)

  const supabase = createClient()

  // Check credits on mount
  useEffect(() => {
    async function checkCreditsEligibility() {
      try {
        const response = await fetch('/api/documents/validate-eligibility')
        const data = await response.json()

        setCredits(data.credits)
        setCanCreate(data.canCreate)

        if (!data.canCreate) {
          setShowNoCreditsModal(true)
        }
      } catch (error) {
        console.error('Error checking credits:', error)
        setCanCreate(false)
      } finally {
        setCheckingCredits(false)
      }
    }

    checkCreditsEligibility()
  }, [])

  // Load company profile and clients
  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load company profile
      const { data: company } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (company) {
        setCompanyProfile(company)
      }

      // Load clients
      const { data: clientsList } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (clientsList) {
        setClients(clientsList)
      }
    }

    loadUserData()
  }, [supabase])

  useEffect(() => {
    async function loadTemplate() {
      if (templateId === null) {
        return
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

  // Auto-fill company data when available
  useEffect(() => {
    if (!template || !companyProfile) return

    setFormData(prev => {
      const newData = { ...prev }
      template.placeholders.forEach(p => {
        const companyField = companyFieldMap[p.name]
        if (companyField && companyProfile[companyField]) {
          newData[p.name] = String(companyProfile[companyField])
        }
      })
      return newData
    })
  }, [template, companyProfile])

  // Auto-fill client data when selected
  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClient(client)
    setShowClientDropdown(false)

    if (!template) return

    setFormData(prev => {
      const newData = { ...prev }
      template.placeholders.forEach(p => {
        const clientField = clientFieldMap[p.name]
        if (clientField && client[clientField]) {
          newData[p.name] = String(client[clientField])
        }
      })
      return newData
    })
  }, [template])

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const renderPreview = useCallback(() => {
    if (!template) return ''

    let html = template.content_html

    // Replace placeholders with values or styled empty placeholders
    template.placeholders.forEach(p => {
      const value = formData[p.name]
      const regex = new RegExp(`\\{\\{${p.name}\\}\\}`, 'g')

      if (value) {
        html = html.replace(regex, `<span class="filled-value">${value}</span>`)
      } else {
        html = html.replace(regex, `<span class="empty-placeholder">${p.label}</span>`)
      }
    })

    return html
  }, [template, formData])

  const handleSaveDraft = async () => {
    if (!template) return

    // VERIFICACAO DE CREDITOS - Bloquear se sem creditos
    if (!canCreate || (credits !== null && credits <= 0)) {
      setShowNoCreditsModal(true)
      return
    }

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

      if (error) {
        // Se RLS bloqueou por falta de creditos
        if (error.code === '42501' || error.message?.includes('credits')) {
          setShowNoCreditsModal(true)
          return
        }
        throw error
      }

      // DEDUZIR CREDITO apos sucesso
      const deductResponse = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: data.id })
      })

      if (deductResponse.ok) {
        const deductData = await deductResponse.json()
        setCredits(deductData.newBalance)
        setCanCreate(deductData.newBalance > 0)
      }

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

    // VERIFICACAO DE CREDITOS - Bloquear se sem creditos
    if (!canCreate || (credits !== null && credits <= 0)) {
      setShowNoCreditsModal(true)
      return
    }

    setGenerating(true)
    setError(null)
    try {
      // Validar ANTES de inserir documento
      const eligibilityResponse = await fetch('/api/documents/validate-eligibility')
      const eligibility = await eligibilityResponse.json()

      if (!eligibility.canCreate) {
        setCredits(eligibility.credits)
        setCanCreate(false)
        setShowNoCreditsModal(true)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario nao autenticado')

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

      if (saveError) {
        // Se RLS bloqueou por falta de creditos
        if (saveError.code === '42501' || saveError.message?.includes('credits')) {
          setShowNoCreditsModal(true)
          return
        }
        throw saveError
      }

      const response = await fetch('/api/documents/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          html: renderPreview()
        })
      })

      const result = await response.json()

      // Check if no credits
      if (!response.ok) {
        if (result.code === 'FREE_TRIAL_EXHAUSTED' || result.code === 'NO_CREDITS') {
          setCredits(0)
          setCanCreate(false)
          setShowNoCreditsModal(true)
          // Clean up the draft document
          await supabase.from('documents').delete().eq('id', doc.id)
          return
        }
        throw new Error(result.error || 'Erro ao gerar PDF')
      }

      await supabase
        .from('documents')
        .update({
          pdf_path: result.pdfPath,
          status: 'generated',
          generated_at: new Date().toISOString(),
          credits_charged: template.price_credit
        })
        .eq('id', doc.id)

      // DEDUZIR CREDITO apos sucesso
      const deductResponse = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id })
      })

      if (deductResponse.ok) {
        const deductData = await deductResponse.json()
        setCredits(deductData.newBalance)
        setCanCreate(deductData.newBalance > 0)
      }

      router.push(`/documents/${doc.id}`)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      setError(err instanceof Error ? err.message : 'Erro ao gerar o PDF')
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

  // Check if template has client-related fields
  const hasClientFields = template.placeholders.some(p => Object.keys(clientFieldMap).includes(p.name))

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
            disabled={saving || !canCreate || checkingCredits}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canCreate ? 'Sem creditos disponiveis' : 'Salvar como rascunho'}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Salvar Rascunho</span>
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={generating || !canCreate || checkingCredits}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canCreate ? 'Sem creditos disponiveis' : 'Gerar PDF do documento'}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* No Credits Warning Banner */}
      {!checkingCredits && !canCreate && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Voce nao tem creditos disponiveis
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Cada documento (rascunho ou finalizado) consome 1 credito. Compre creditos ou assine um plano para continuar.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/billing"
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Comprar Creditos
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 border border-amber-600 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Credits Info Badge */}
      {!checkingCredits && credits !== null && canCreate && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-neutral-500">Creditos disponiveis:</span>
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg">
            {credits}
          </span>
        </div>
      )}

      {/* Quick Select Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Company Info Card */}
        {companyProfile ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Dados da Empresa</p>
                <p className="text-neutral-900 dark:text-white font-semibold truncate">{companyProfile.name}</p>
              </div>
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        ) : (
          <Link
            href="/settings?tab=company"
            className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Dados da Empresa</p>
                <p className="text-neutral-900 dark:text-white font-medium">Configurar dados</p>
              </div>
              <Plus className="w-5 h-5 text-neutral-400" />
            </div>
          </Link>
        )}

        {/* Client Selector */}
        {hasClientFields && (
          <div className="relative">
            <button
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                selectedClient
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
                  : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-teal-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedClient ? 'bg-teal-500' : 'bg-neutral-200 dark:bg-neutral-700'
                }`}>
                  <Users className={`w-5 h-5 ${selectedClient ? 'text-white' : 'text-neutral-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${selectedClient ? 'text-teal-600 dark:text-teal-400' : 'text-neutral-500'}`}>
                    Cliente
                  </p>
                  <p className="text-neutral-900 dark:text-white font-semibold truncate">
                    {selectedClient ? selectedClient.name : 'Selecionar cliente'}
                  </p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showClientDropdown ? 'rotate-180' : ''} ${
                  selectedClient ? 'text-teal-500' : 'text-neutral-400'
                }`} />
              </div>
            </button>

            {/* Dropdown */}
            {showClientDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-20 max-h-64 overflow-y-auto">
                {clients.length > 0 ? (
                  <>
                    {clients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                          selectedClient?.id === client.id ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                            {client.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-neutral-900 dark:text-white">{client.name}</p>
                          {client.email && (
                            <p className="text-xs text-neutral-500">{client.email}</p>
                          )}
                        </div>
                        {selectedClient?.id === client.id && (
                          <Check className="w-4 h-4 text-teal-500" />
                        )}
                      </button>
                    ))}
                    <div className="border-t border-neutral-200 dark:border-neutral-800">
                      <Link
                        href="/clients"
                        className="flex items-center gap-2 p-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <Plus className="w-4 h-4" />
                        Cadastrar novo cliente
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-neutral-500 text-sm mb-3">Nenhum cliente cadastrado</p>
                    <Link
                      href="/clients"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar cliente
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
        .document-preview .filled-value {
          color: #059669;
          font-weight: 500;
        }
        .document-preview .empty-placeholder {
          display: inline-block;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #16a34a;
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-family: system-ui, -apple-system, sans-serif;
          border: 1px dashed #86efac;
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

      {/* No Credits Modal */}
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        credits={credits || 0}
      />
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

  // Check if this field is auto-filled
  const isCompanyField = Object.keys(companyFieldMap).includes(placeholder.name)
  const isClientField = Object.keys(clientFieldMap).includes(placeholder.name)
  const isAutoFilled = (isCompanyField || isClientField) && value

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
        {placeholder.label}
        {placeholder.required && <span className="text-red-500">*</span>}
        {isAutoFilled && (
          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
            Auto
          </span>
        )}
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
