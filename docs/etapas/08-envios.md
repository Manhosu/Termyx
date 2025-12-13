# Etapa 8: Envios (Email e WhatsApp)

## Objetivo
Implementar os canais de envio de documentos: email (via SendGrid/Postmark) e WhatsApp (via wa.me no MVP, provider no futuro).

---

## Checklist

### 8.1 Envio por Email
- [ ] Setup SendGrid ou Postmark
- [ ] Criar template de email
- [ ] API POST `/api/documents/[id]/send-email`
- [ ] Anexar PDF ao email
- [ ] Registrar envio no historico

### 8.2 Envio por WhatsApp (MVP)
- [ ] Gerar link wa.me com mensagem pre-formatada
- [ ] Criar link publico temporario para o PDF
- [ ] API POST `/api/documents/[id]/share-link`
- [ ] Expirar links apos X horas

### 8.3 WhatsApp API (Futuro)
- [ ] Integrar com provider (360dialog/Z-API)
- [ ] Envio automatico em background
- [ ] Templates de mensagem aprovados
- [ ] Webhooks de delivery

### 8.4 UI de Envio
- [ ] Modal de envio por email
  - [ ] Input de destinatario(s)
  - [ ] Input de assunto
  - [ ] Textarea de mensagem
  - [ ] Preview do email
- [ ] Modal de envio por WhatsApp
  - [ ] Input de telefone
  - [ ] Mensagem pre-formatada
  - [ ] Botao para abrir wa.me
- [ ] Historico de envios no documento

### 8.5 Seguranca
- [ ] Links publicos com token unico
- [ ] Expiracao automatica de links
- [ ] Rate limiting de envios
- [ ] Validacao de email/telefone

---

## Implementacao

### Variaveis de Ambiente
```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@termyx.com.br
SENDGRID_FROM_NAME=Termyx

# Ou Postmark
POSTMARK_API_TOKEN=xxx
POSTMARK_FROM_EMAIL=noreply@termyx.com.br
```

### Servico de Email (SendGrid)
```typescript
// /lib/services/email.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: {
    content: string // base64
    filename: string
    type: string
    disposition: 'attachment'
  }[]
}

export async function sendEmail(options: SendEmailOptions) {
  const msg = {
    to: options.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME!
    },
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error: any) {
    console.error('Email error:', error.response?.body)
    throw new Error('Failed to send email')
  }
}
```

### Template de Email
```typescript
// /lib/services/email-templates.ts

interface DocumentEmailOptions {
  recipientName?: string
  senderName: string
  senderCompany?: string
  documentTitle: string
  message?: string
}

export function createDocumentEmailTemplate(options: DocumentEmailOptions) {
  return {
    subject: `${options.senderName} enviou um documento: ${options.documentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .content { padding: 30px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #888; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #3b82f6; margin: 0;">Termyx</h1>
          </div>
          <div class="content">
            <p>Ola${options.recipientName ? ` ${options.recipientName}` : ''},</p>
            <p><strong>${options.senderName}</strong>${options.senderCompany ? ` (${options.senderCompany})` : ''} enviou um documento para voce:</p>
            <p style="background: #f8fafc; padding: 15px; border-radius: 8px; font-weight: 500;">
              ${options.documentTitle}
            </p>
            ${options.message ? `<p>${options.message}</p>` : ''}
            <p>O documento esta anexado a este email em formato PDF.</p>
          </div>
          <div class="footer">
            <p>Este email foi enviado atraves do <a href="https://termyx.com.br">Termyx</a></p>
            <p>Gerador de documentos profissionais</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${options.senderName}${options.senderCompany ? ` (${options.senderCompany})` : ''} enviou um documento para voce:

${options.documentTitle}

${options.message || ''}

O documento esta anexado a este email em formato PDF.

---
Enviado atraves do Termyx - termyx.com.br
    `.trim()
  }
}
```

### API de Envio por Email
```typescript
// /app/api/documents/[id]/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/services/email'
import { createDocumentEmailTemplate } from '@/lib/services/email-templates'
import { getSignedUrl } from '@/lib/supabase/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { to, subject, message, recipientName } = await request.json()

  if (!to) {
    return NextResponse.json({ error: 'Recipient required' }, { status: 400 })
  }

  // Buscar documento
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, template:templates(name)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (!document.pdf_path) {
    return NextResponse.json({ error: 'PDF not generated' }, { status: 400 })
  }

  // Buscar perfil do usuario
  const { data: profile } = await supabase
    .from('users')
    .select('name, company_name')
    .eq('id', user.id)
    .single()

  // Baixar PDF do Storage
  const { data: pdfData } = await supabase.storage
    .from('documents')
    .download(document.pdf_path)

  if (!pdfData) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 })
  }

  const pdfBuffer = await pdfData.arrayBuffer()
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

  // Criar template de email
  const emailContent = createDocumentEmailTemplate({
    recipientName,
    senderName: profile?.name || user.email!,
    senderCompany: profile?.company_name,
    documentTitle: document.title,
    message
  })

  try {
    await sendEmail({
      to,
      subject: subject || emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: [{
        content: pdfBase64,
        filename: `${document.title.replace(/\s+/g, '_')}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    })

    // Registrar envio
    await supabase.from('document_sends').insert({
      document_id: document.id,
      user_id: user.id,
      channel: 'email',
      recipient: to,
      status: 'sent',
      metadata: { subject, message }
    })

    // Atualizar status do documento
    await supabase
      .from('documents')
      .update({ status: 'sent' })
      .eq('id', document.id)

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'document.sent_email',
      resource_type: 'document',
      resource_id: document.id,
      payload: { to }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

### API de Link Compartilhavel
```typescript
// /app/api/documents/[id]/share-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { expiresIn = 24 } = await request.json() // horas

  // Buscar documento
  const { data: document } = await supabase
    .from('documents')
    .select('id, pdf_path, title')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!document || !document.pdf_path) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Criar token unico
  const shareToken = nanoid(32)
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)

  // Salvar link compartilhavel
  await supabase.from('document_shares').insert({
    document_id: document.id,
    user_id: user.id,
    token: shareToken,
    expires_at: expiresAt.toISOString()
  })

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`

  return NextResponse.json({
    url: shareUrl,
    expiresAt: expiresAt.toISOString()
  })
}
```

### Pagina de Compartilhamento Publico
```typescript
// /app/share/[token]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  // Buscar share
  const { data: share } = await supabase
    .from('document_shares')
    .select('*, document:documents(id, title, pdf_path)')
    .eq('token', params.token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!share || !share.document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Link Expirado</h1>
          <p className="text-neutral-500 mt-2">Este link de compartilhamento nao e mais valido.</p>
        </div>
      </div>
    )
  }

  // Gerar URL assinada para download
  const { data: signedUrl } = await supabase.storage
    .from('documents')
    .createSignedUrl(share.document.pdf_path, 3600)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          {share.document.title}
        </h1>
        <p className="text-neutral-500 mb-6">
          Um documento foi compartilhado com voce
        </p>
        <a
          href={signedUrl?.signedUrl}
          download
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar PDF
        </a>
        <p className="text-xs text-neutral-400 mt-4">
          Enviado via <a href="https://termyx.com.br" className="underline">Termyx</a>
        </p>
      </div>
    </div>
  )
}
```

### Funcao WhatsApp (wa.me)
```typescript
// /lib/utils/whatsapp.ts

interface WhatsAppMessageOptions {
  phone: string
  message: string
  documentUrl: string
}

export function createWhatsAppLink(options: WhatsAppMessageOptions): string {
  // Limpar telefone (apenas numeros)
  const cleanPhone = options.phone.replace(/\D/g, '')

  // Adicionar codigo do pais se nao tiver
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  // Criar mensagem
  const fullMessage = `${options.message}\n\nAcesse o documento: ${options.documentUrl}`

  // Codificar mensagem para URL
  const encodedMessage = encodeURIComponent(fullMessage)

  return `https://wa.me/${fullPhone}?text=${encodedMessage}`
}
```

### Modal de Envio
```typescript
// /components/documents/SendModal.tsx
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Mail, MessageCircle } from 'lucide-react'
import { createWhatsAppLink } from '@/lib/utils/whatsapp'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
}

export function SendModal({ isOpen, onClose, documentId, documentTitle }: SendModalProps) {
  const [tab, setTab] = useState('email')
  const [loading, setLoading] = useState(false)

  // Email state
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(`Documento: ${documentTitle}`)
  const [message, setMessage] = useState('')

  // WhatsApp state
  const [phone, setPhone] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState(`Ola! Estou enviando o documento "${documentTitle}".`)
  const [shareUrl, setShareUrl] = useState('')

  const handleSendEmail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, message })
      })

      if (res.ok) {
        onClose()
        // Show success toast
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = async () => {
    setLoading(true)
    try {
      // Gerar link compartilhavel
      const res = await fetch(`/api/documents/${documentId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 48 })
      })

      const { url } = await res.json()
      setShareUrl(url)

      // Abrir WhatsApp
      const waLink = createWhatsAppLink({
        phone,
        message: whatsappMessage,
        documentUrl: url
      })

      window.open(waLink, '_blank')
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Documento">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="email" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <div className="space-y-4">
            <Input
              label="Email do destinatario"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
            <Input
              label="Assunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              label="Mensagem (opcional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem personalizada..."
              rows={3}
            />
            <Button
              className="w-full"
              onClick={handleSendEmail}
              loading={loading}
            >
              Enviar por Email
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="space-y-4">
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <Textarea
              label="Mensagem"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-neutral-500">
              Sera gerado um link para o documento que expira em 48 horas.
            </p>
            <Button
              className="w-full"
              onClick={handleSendWhatsApp}
              loading={loading}
            >
              Abrir WhatsApp
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  )
}
```

---

## Tabela de Envios
```sql
CREATE TABLE public.document_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  user_id UUID NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_sends_document ON document_sends(document_id);
```

## Tabela de Links Compartilhaveis
```sql
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_shares_token ON document_shares(token);
```

---

## Entregaveis
- [ ] Envio por email funcionando
- [ ] PDF anexado ao email
- [ ] Link compartilhavel gerado
- [ ] Integracao wa.me funcionando
- [ ] Historico de envios
- [ ] Links expirando corretamente

---

## Proxima Etapa
[Etapa 9: Admin e Monitoramento](./09-admin-monitoramento.md)
