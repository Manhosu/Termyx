# Etapa 3: Templates e Documentos

## Objetivo
Implementar o sistema de templates com placeholders e a estrutura base de documentos, incluindo formulario dinamico e preview em tempo real.

---

## Checklist

### 3.1 Modelo de Templates
- [ ] Definir estrutura de placeholders (JSON Schema)
- [ ] Criar tipos TypeScript para templates
- [ ] Criar tipos para placeholders

### 3.2 Templates Publicos (Seed)
- [ ] Contrato de Prestacao de Servicos
- [ ] Recibo de Pagamento
- [ ] Orcamento
- [ ] Termo de Responsabilidade
- [ ] Popular banco com templates iniciais

### 3.3 API de Templates
- [ ] GET `/api/templates` - listar templates (publicos + proprios)
- [ ] GET `/api/templates/[id]` - detalhes do template
- [ ] POST `/api/templates` - criar template custom
- [ ] PATCH `/api/templates/[id]` - editar template
- [ ] DELETE `/api/templates/[id]` - excluir template
- [ ] POST `/api/templates/[id]/duplicate` - duplicar template

### 3.4 Biblioteca de Templates (UI)
- [ ] Pagina `/templates`
- [ ] Grid de cards de templates
- [ ] Filtro por categoria
- [ ] Busca por nome
- [ ] Tabs: Publicos / Meus Templates
- [ ] Botao "Usar Template"
- [ ] Botao "Criar Template" (Pro+)

### 3.5 Formulario Dinamico
- [ ] Componente `DynamicForm`
- [ ] Renderizacao baseada em placeholders
- [ ] Tipos de campo suportados:
  - [ ] text (texto curto)
  - [ ] textarea (texto longo)
  - [ ] number
  - [ ] currency (dinheiro)
  - [ ] date
  - [ ] select (opcoes)
  - [ ] cpf_cnpj
  - [ ] phone
  - [ ] email
- [ ] Validacao por campo
- [ ] Mascara para campos especiais

### 3.6 Preview em Tempo Real
- [ ] Componente `DocumentPreview`
- [ ] Substituicao de placeholders pelo valor
- [ ] Estilizacao do preview (tipografia, espacamento)
- [ ] Zoom in/out
- [ ] Scroll sincronizado com formulario

### 3.7 Modelo de Documentos
- [ ] CRUD de documentos
- [ ] Status: draft, generated, sent, archived
- [ ] Salvar dados preenchidos (JSON)
- [ ] Auto-save de rascunhos

### 3.8 API de Documentos
- [ ] POST `/api/documents` - criar documento (rascunho)
- [ ] GET `/api/documents` - listar documentos do usuario
- [ ] GET `/api/documents/[id]` - detalhes
- [ ] PATCH `/api/documents/[id]` - atualizar dados
- [ ] DELETE `/api/documents/[id]` - excluir

---

## Estrutura de Placeholders

```typescript
// /types/template.ts

interface Placeholder {
  name: string           // Ex: "PROVIDER_NAME"
  label: string          // Ex: "Nome do Prestador"
  type: PlaceholderType
  required: boolean
  defaultValue?: string
  options?: string[]     // Para tipo select
  mask?: string          // Para mascaras
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

type PlaceholderType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'cpf_cnpj'
  | 'phone'
  | 'email'

interface Template {
  id: string
  owner_id: string | null
  name: string
  category: 'contrato' | 'recibo' | 'orcamento' | 'termo' | 'outro'
  description: string
  content_html: string
  placeholders: Placeholder[]
  is_public: boolean
  price_credit: number
  version: number
  created_at: string
  updated_at: string
}

interface Document {
  id: string
  user_id: string
  template_id: string
  title: string
  data: Record<string, any>
  pdf_path: string | null
  status: 'draft' | 'generated' | 'sent' | 'archived'
  credits_charged: number
  created_at: string
  generated_at: string | null
}
```

---

## Templates Seed

### Contrato de Prestacao de Servicos
```html
<div class="document">
  <h1>CONTRATO DE PRESTACAO DE SERVICOS</h1>

  <h2>PARTES</h2>
  <p><strong>PRESTADOR:</strong> {{PROVIDER_NAME}}, inscrito no CPF/CNPJ sob o n {{PROVIDER_CPF_CNPJ}}, residente/sediado em {{PROVIDER_ADDRESS}}.</p>

  <p><strong>CONTRATANTE:</strong> {{CONTRACTOR_NAME}}, inscrito no CPF/CNPJ sob o n {{CONTRACTOR_CPF_CNPJ}}, residente/sediado em {{CONTRACTOR_ADDRESS}}.</p>

  <h2>CLAUSULA 1 - DO OBJETO</h2>
  <p>O presente contrato tem como objeto a prestacao dos seguintes servicos: {{SERVICE_DESCRIPTION}}</p>

  <h2>CLAUSULA 2 - DO VALOR</h2>
  <p>Pelos servicos prestados, o CONTRATANTE pagara ao PRESTADOR o valor de {{VALUE}}, a ser pago da seguinte forma: {{PAYMENT_METHOD}}.</p>

  <h2>CLAUSULA 3 - DO PRAZO</h2>
  <p>O presente contrato tera vigencia de {{START_DATE}} a {{END_DATE}}.</p>

  <h2>CLAUSULA 4 - DAS OBRIGACOES</h2>
  <p>{{OBLIGATIONS}}</p>

  <h2>CLAUSULA 5 - DISPOSICOES GERAIS</h2>
  <p>{{ADDITIONAL_CLAUSES}}</p>

  <div class="signatures">
    <p>{{CITY}}, {{SIGNATURE_DATE}}</p>
    <div class="signature-line">
      <p>_______________________________</p>
      <p>{{PROVIDER_NAME}}</p>
      <p>PRESTADOR</p>
    </div>
    <div class="signature-line">
      <p>_______________________________</p>
      <p>{{CONTRACTOR_NAME}}</p>
      <p>CONTRATANTE</p>
    </div>
  </div>
</div>
```

### Placeholders do Contrato
```json
[
  {"name": "PROVIDER_NAME", "label": "Nome do Prestador", "type": "text", "required": true},
  {"name": "PROVIDER_CPF_CNPJ", "label": "CPF/CNPJ do Prestador", "type": "cpf_cnpj", "required": true},
  {"name": "PROVIDER_ADDRESS", "label": "Endereco do Prestador", "type": "textarea", "required": true},
  {"name": "CONTRACTOR_NAME", "label": "Nome do Contratante", "type": "text", "required": true},
  {"name": "CONTRACTOR_CPF_CNPJ", "label": "CPF/CNPJ do Contratante", "type": "cpf_cnpj", "required": true},
  {"name": "CONTRACTOR_ADDRESS", "label": "Endereco do Contratante", "type": "textarea", "required": true},
  {"name": "SERVICE_DESCRIPTION", "label": "Descricao do Servico", "type": "textarea", "required": true},
  {"name": "VALUE", "label": "Valor do Servico", "type": "currency", "required": true},
  {"name": "PAYMENT_METHOD", "label": "Forma de Pagamento", "type": "text", "required": true},
  {"name": "START_DATE", "label": "Data de Inicio", "type": "date", "required": true},
  {"name": "END_DATE", "label": "Data de Termino", "type": "date", "required": true},
  {"name": "OBLIGATIONS", "label": "Obrigacoes das Partes", "type": "textarea", "required": false},
  {"name": "ADDITIONAL_CLAUSES", "label": "Clausulas Adicionais", "type": "textarea", "required": false},
  {"name": "CITY", "label": "Cidade", "type": "text", "required": true},
  {"name": "SIGNATURE_DATE", "label": "Data de Assinatura", "type": "date", "required": true}
]
```

---

## Componentes UI

### TemplateCard
```
- Thumbnail do template (preview miniatura)
- Nome do template
- Categoria (badge)
- Descricao curta
- Preco em creditos (se aplicavel)
- Botao "Usar"
```

### DynamicForm
```
- Renderiza campos baseado em placeholders[]
- Agrupa por secoes (se houver)
- Validacao em tempo real
- Feedback visual de campos preenchidos
- Botoes: Salvar Rascunho | Gerar PDF
```

### DocumentPreview
```
- Renderiza HTML do template
- Substitui {{PLACEHOLDER}} por valores
- Estilo de pagina A4
- Header com logo (configuravel)
- Rodape com paginacao
```

---

## Entregaveis
- [ ] Templates seed inseridos no banco
- [ ] API de templates funcionando
- [ ] Biblioteca de templates com filtros
- [ ] Formulario dinamico renderizando
- [ ] Preview atualizando em tempo real
- [ ] Documentos salvando como rascunho

---

## Proxima Etapa
[Etapa 4: Geracao de PDF](./04-geracao-pdf.md)
