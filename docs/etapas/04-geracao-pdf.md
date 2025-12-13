# Etapa 4: Geracao de PDF

## Objetivo
Implementar o servico de geracao de PDF usando Puppeteer, armazenamento no Supabase Storage e sistema de filas para processamento assincrono.

---

## Checklist

### 4.1 Setup Puppeteer
- [ ] Instalar dependencias: `puppeteer`, `puppeteer-core`
- [ ] Criar servico de geracao de PDF
- [ ] Configurar opcoes de PDF (tamanho, margem, etc)
- [ ] Template HTML para o PDF (com estilos)

### 4.2 Supabase Storage
- [ ] Criar bucket `documents` no Storage
- [ ] Configurar politicas de acesso
- [ ] Criar funcao para upload de PDF
- [ ] Criar funcao para gerar URL assinada

### 4.3 API de Geracao
- [ ] POST `/api/documents/[id]/generate` - gerar PDF
- [ ] GET `/api/documents/[id]/download` - download do PDF
- [ ] Validar creditos antes de gerar
- [ ] Debitar creditos apos geracao
- [ ] Atualizar status do documento

### 4.4 Sistema de Filas (Opcional MVP)
- [ ] Setup Redis + BullMQ
- [ ] Worker para processar geracao
- [ ] Endpoint de status do job
- [ ] Retry em caso de falha

### 4.5 Template HTML do PDF
- [ ] Estrutura base do documento
- [ ] Estilos CSS para impressao
- [ ] Header configuravel (logo, nome empresa)
- [ ] Footer com paginacao
- [ ] Fontes incorporadas

### 4.6 UI de Geracao
- [ ] Botao "Gerar PDF" no editor
- [ ] Loading state durante geracao
- [ ] Feedback de sucesso/erro
- [ ] Botao de download apos geracao
- [ ] Preview do PDF gerado

---

## Implementacao

### Servico de PDF
```typescript
// /lib/services/pdf.ts
import puppeteer from 'puppeteer'

interface GeneratePDFOptions {
  html: string
  options?: {
    format?: 'A4' | 'Letter'
    margin?: {
      top: string
      right: string
      bottom: string
      left: string
    }
    printBackground?: boolean
  }
}

export async function generatePDF({ html, options }: GeneratePDFOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0'
  })

  const pdf = await page.pdf({
    format: options?.format || 'A4',
    margin: options?.margin || {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: options?.printBackground ?? true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `
  })

  await browser.close()

  return Buffer.from(pdf)
}
```

### Template HTML Base
```typescript
// /lib/services/pdf-template.ts

interface PDFTemplateOptions {
  content: string
  title: string
  companyLogo?: string
  companyName?: string
}

export function createPDFTemplate(options: PDFTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1a1a1a;
        }

        .document {
          padding: 10mm;
        }

        h1 {
          font-size: 18pt;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20pt;
          text-transform: uppercase;
        }

        h2 {
          font-size: 14pt;
          font-weight: 600;
          margin-top: 16pt;
          margin-bottom: 8pt;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 4pt;
        }

        p {
          margin-bottom: 10pt;
          text-align: justify;
        }

        strong {
          font-weight: 600;
        }

        .signatures {
          margin-top: 40pt;
          page-break-inside: avoid;
        }

        .signature-line {
          display: inline-block;
          width: 45%;
          text-align: center;
          margin-top: 40pt;
        }

        .signature-line p {
          text-align: center;
          margin-bottom: 5pt;
        }

        .header {
          text-align: center;
          margin-bottom: 20pt;
          padding-bottom: 10pt;
          border-bottom: 2px solid #333;
        }

        .header img {
          max-height: 50px;
          margin-bottom: 10pt;
        }

        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72pt;
          color: rgba(0,0,0,0.05);
          z-index: -1;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      ${options.companyLogo ? `
        <div class="header">
          <img src="${options.companyLogo}" alt="Logo">
          ${options.companyName ? `<p>${options.companyName}</p>` : ''}
        </div>
      ` : ''}

      ${options.content}
    </body>
    </html>
  `
}
```

### Upload para Storage
```typescript
// /lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/server'

export async function uploadPDF(
  userId: string,
  documentId: string,
  pdfBuffer: Buffer
): Promise<string> {
  const supabase = createClient()

  const fileName = `${userId}/${documentId}.pdf`

  const { error } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) throw error

  return fileName
}

export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, expiresIn)

  if (error) throw error

  return data.signedUrl
}
```

### API de Geracao
```typescript
// /app/api/documents/[id]/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePDF } from '@/lib/services/pdf'
import { createPDFTemplate } from '@/lib/services/pdf-template'
import { uploadPDF } from '@/lib/supabase/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // Verificar usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Buscar documento
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, template:templates(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Buscar usuario para verificar creditos
  const { data: profile } = await supabase
    .from('users')
    .select('credits, plan_id')
    .eq('id', user.id)
    .single()

  // Verificar creditos (se nao tiver plano ilimitado)
  const creditCost = document.template?.price_credit || 1
  if (!profile?.plan_id && profile?.credits < creditCost) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  try {
    // Substituir placeholders
    let content = document.template.content_html
    for (const [key, value] of Object.entries(document.data)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    // Criar HTML completo
    const html = createPDFTemplate({
      content,
      title: document.title
    })

    // Gerar PDF
    const pdfBuffer = await generatePDF({ html })

    // Upload para Storage
    const pdfPath = await uploadPDF(user.id, document.id, pdfBuffer)

    // Atualizar documento
    await supabase
      .from('documents')
      .update({
        pdf_path: pdfPath,
        status: 'generated',
        generated_at: new Date().toISOString(),
        credits_charged: creditCost
      })
      .eq('id', document.id)

    // Debitar creditos (se aplicavel)
    if (!profile?.plan_id) {
      await supabase
        .from('users')
        .update({ credits: profile.credits - creditCost })
        .eq('id', user.id)
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'document.generated',
      resource_type: 'document',
      resource_id: document.id,
      payload: { credits_charged: creditCost }
    })

    return NextResponse.json({
      success: true,
      pdf_path: pdfPath
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
```

### Politicas Storage
```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Politica: usuarios podem ver seus proprios documentos
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politica: usuarios podem fazer upload em sua pasta
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Configuracao Docker (Puppeteer)

```dockerfile
# Dockerfile.pdf
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["node", "worker.js"]
```

---

## Entregaveis
- [ ] Servico de PDF gerando documentos
- [ ] Upload funcionando no Storage
- [ ] Download com URL assinada
- [ ] Creditos sendo debitados
- [ ] Status do documento atualizado
- [ ] Qualidade do PDF aceitavel

---

## Proxima Etapa
[Etapa 5: Pagamentos](./05-pagamentos.md)
