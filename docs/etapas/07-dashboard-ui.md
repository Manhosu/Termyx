# Etapa 7: Dashboard e UI Premium

## Objetivo
Implementar todas as paginas do dashboard com a experiencia premium definida no escopo: Dashboard, Biblioteca de Templates, Editor de Documento, Historico, Billing.

---

## Checklist

### 7.1 Dashboard Principal
- [ ] Card de creditos disponiveis
- [ ] Card de documentos gerados (mes)
- [ ] Card de plano atual
- [ ] Ultimos documentos (lista rapida)
- [ ] Botao CTA "Novo Documento"
- [ ] Grafico de uso (opcional)

### 7.2 Biblioteca de Templates
- [ ] Grid de TemplateCards
- [ ] Filtro por categoria (tabs ou dropdown)
- [ ] Busca por nome
- [ ] Separacao: Publicos / Meus Templates
- [ ] Empty state
- [ ] Loading state (skeletons)

### 7.3 Editor de Documento
- [ ] Layout split: Form (esquerda) + Preview (direita)
- [ ] Header com titulo do documento
- [ ] Formulario dinamico renderizando
- [ ] Preview HTML em tempo real
- [ ] Barra inferior fixa com acoes:
  - [ ] Salvar Rascunho
  - [ ] Gerar PDF
  - [ ] Cancelar
- [ ] Auto-save a cada 30s
- [ ] Indicador de alteracoes nao salvas

### 7.4 Historico de Documentos
- [ ] Tabela com colunas: Titulo, Template, Status, Data, Acoes
- [ ] Filtros: Status, Data, Template
- [ ] Ordenacao por colunas
- [ ] Paginacao
- [ ] Acoes por linha: Ver, Download, Enviar, Arquivar, Excluir
- [ ] Bulk actions (selecionar multiplos)

### 7.5 Visualizador de Documento
- [ ] Preview do PDF
- [ ] Informacoes do documento
- [ ] Botoes: Download, Enviar Email, Enviar WhatsApp
- [ ] Historico de envios

### 7.6 Pagina de Billing
- [ ] Plano atual com detalhes
- [ ] Creditos disponiveis
- [ ] Botao "Upgrade" ou "Gerenciar Assinatura"
- [ ] Cards de pacotes de creditos
- [ ] Historico de pagamentos (tabela)

### 7.7 Pagina de Configuracoes
- [ ] Dados pessoais (nome, email)
- [ ] Dados da empresa (nome, logo)
- [ ] Preferencias (tema, idioma)
- [ ] Alterar senha
- [ ] Excluir conta

---

## Implementacao

### Dashboard Page
```typescript
// /app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreditCard, FileText, Crown, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*, plan:plans(*)')
    .eq('id', user!.id)
    .single()

  const { count: docsThisMonth } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .gte('created_at', new Date(new Date().setDate(1)).toISOString())

  const { data: recentDocs } = await supabase
    .from('documents')
    .select('id, title, status, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-neutral-500">
            Bem-vindo de volta, {profile?.name || 'Usuario'}
          </p>
        </div>
        <Link href="/templates">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Documento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Creditos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {profile?.credits || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Docs este mes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {docsThisMonth || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Plano</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {profile?.plan?.name || 'Free'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">
          Documentos Recentes
        </h2>
        {recentDocs && recentDocs.length > 0 ? (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {doc.title}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum documento ainda</p>
            <Link href="/templates">
              <Button variant="ghost" className="mt-2">
                Criar primeiro documento
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    generated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
  }

  const labels = {
    draft: 'Rascunho',
    generated: 'Gerado',
    sent: 'Enviado',
    archived: 'Arquivado'
  }

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}
```

### Editor de Documento
```typescript
// /app/(dashboard)/documents/new/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { Button } from '@/components/ui/Button'
import { Save, FileDown, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

export default function NewDocumentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('template')

  const [template, setTemplate] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Carregar template
  useEffect(() => {
    if (templateId) {
      fetch(`/api/templates/${templateId}`)
        .then(res => res.json())
        .then(data => setTemplate(data))
    }
  }, [templateId])

  // Auto-save
  const autoSave = useCallback(
    debounce(async (data: Record<string, any>) => {
      if (!template) return

      setSaving(true)
      try {
        const endpoint = documentId
          ? `/api/documents/${documentId}`
          : '/api/documents'

        const res = await fetch(endpoint, {
          method: documentId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: template.id,
            title: data.title || `${template.name} - ${new Date().toLocaleDateString()}`,
            data
          })
        })

        const result = await res.json()
        if (!documentId && result.id) {
          setDocumentId(result.id)
        }
        setHasChanges(false)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setSaving(false)
      }
    }, 2000),
    [template, documentId]
  )

  const handleFormChange = (data: Record<string, any>) => {
    setFormData(data)
    setHasChanges(true)
    autoSave(data)
  }

  const handleGenerate = async () => {
    if (!documentId) return

    setGenerating(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/generate`, {
        method: 'POST'
      })

      if (res.ok) {
        router.push(`/documents/${documentId}`)
      }
    } catch (error) {
      console.error('Generate failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (!template) {
    return <div>Carregando...</div>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <X className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-neutral-900 dark:text-white">
              {template.name}
            </h1>
            <p className="text-sm text-neutral-500">
              {saving ? 'Salvando...' : hasChanges ? 'Alteracoes nao salvas' : 'Salvo'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Panel */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-neutral-200 dark:border-neutral-800">
          <DynamicForm
            placeholders={template.placeholders}
            values={formData}
            onChange={handleFormChange}
          />
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950">
          <DocumentPreview
            html={template.content_html}
            data={formData}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-16 border-t border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-end gap-3 bg-white dark:bg-neutral-900">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          onClick={handleGenerate}
          loading={generating}
          disabled={!documentId}
        >
          <FileDown className="w-4 h-4" />
          Gerar PDF
        </Button>
      </div>
    </div>
  )
}
```

### DynamicForm Component
```typescript
// /components/forms/DynamicForm.tsx
'use client'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { formatCurrency, formatCPFCNPJ, formatPhone } from '@/lib/utils/masks'

interface Placeholder {
  name: string
  label: string
  type: string
  required: boolean
  options?: string[]
}

interface DynamicFormProps {
  placeholders: Placeholder[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

export function DynamicForm({ placeholders, values, onChange }: DynamicFormProps) {
  const handleChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value })
  }

  const renderField = (placeholder: Placeholder) => {
    const value = values[placeholder.name] || ''

    switch (placeholder.type) {
      case 'textarea':
        return (
          <Textarea
            label={placeholder.label}
            value={value}
            onChange={(e) => handleChange(placeholder.name, e.target.value)}
            required={placeholder.required}
            rows={4}
          />
        )

      case 'select':
        return (
          <Select
            label={placeholder.label}
            value={value}
            onChange={(e) => handleChange(placeholder.name, e.target.value)}
            required={placeholder.required}
            options={placeholder.options || []}
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            label={placeholder.label}
            value={value}
            onChange={(e) => handleChange(placeholder.name, e.target.value)}
            required={placeholder.required}
          />
        )

      case 'currency':
        return (
          <Input
            label={placeholder.label}
            value={formatCurrency(value)}
            onChange={(e) => handleChange(placeholder.name, e.target.value.replace(/\D/g, ''))}
            required={placeholder.required}
            placeholder="R$ 0,00"
          />
        )

      case 'cpf_cnpj':
        return (
          <Input
            label={placeholder.label}
            value={formatCPFCNPJ(value)}
            onChange={(e) => handleChange(placeholder.name, e.target.value.replace(/\D/g, ''))}
            required={placeholder.required}
            maxLength={18}
          />
        )

      case 'phone':
        return (
          <Input
            label={placeholder.label}
            value={formatPhone(value)}
            onChange={(e) => handleChange(placeholder.name, e.target.value.replace(/\D/g, ''))}
            required={placeholder.required}
            maxLength={15}
          />
        )

      default:
        return (
          <Input
            label={placeholder.label}
            value={value}
            onChange={(e) => handleChange(placeholder.name, e.target.value)}
            required={placeholder.required}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {placeholders.map((placeholder) => (
        <div key={placeholder.name}>
          {renderField(placeholder)}
        </div>
      ))}
    </div>
  )
}
```

### DocumentPreview Component
```typescript
// /components/documents/DocumentPreview.tsx
'use client'

interface DocumentPreviewProps {
  html: string
  data: Record<string, any>
}

export function DocumentPreview({ html, data }: DocumentPreviewProps) {
  // Substituir placeholders
  let content = html
  for (const [key, value] of Object.entries(data)) {
    content = content.replace(
      new RegExp(`{{${key}}}`, 'g'),
      String(value) || `<span class="placeholder">[${key}]</span>`
    )
  }

  // Marcar placeholders nao preenchidos
  content = content.replace(
    /{{(\w+)}}/g,
    '<span class="placeholder">[$1]</span>'
  )

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 min-h-[800px]">
      <style jsx global>{`
        .preview-content h1 {
          font-size: 18pt;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20pt;
        }
        .preview-content h2 {
          font-size: 14pt;
          font-weight: 600;
          margin-top: 16pt;
          margin-bottom: 8pt;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 4pt;
        }
        .preview-content p {
          margin-bottom: 10pt;
          line-height: 1.6;
        }
        .preview-content .placeholder {
          background-color: #fef3c7;
          color: #92400e;
          padding: 2px 4px;
          border-radius: 4px;
          font-style: italic;
        }
        .preview-content .signatures {
          margin-top: 40pt;
        }
        .preview-content .signature-line {
          display: inline-block;
          width: 45%;
          text-align: center;
          margin-top: 40pt;
        }
      `}</style>
      <div
        className="preview-content text-neutral-900"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
```

---

## Entregaveis
- [ ] Dashboard com metricas
- [ ] Biblioteca de templates funcionando
- [ ] Editor com form + preview
- [ ] Historico de documentos
- [ ] Pagina de billing
- [ ] Configuracoes do usuario

---

## Proxima Etapa
[Etapa 8: Envios](./08-envios.md)
