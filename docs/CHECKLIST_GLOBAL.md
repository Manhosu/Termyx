# Termyx - Checklist Global de Desenvolvimento

## Status do Projeto
- **Versao**: 1.0 MVP
- **Inicio**: 2025-12-11
- **Stack**: Next.js + Tailwind + Supabase + Node.js

---

## Visao Geral das Etapas

| # | Etapa | Status | Prioridade |
|---|-------|--------|------------|
| 1 | Setup Inicial (Infra + Supabase) | [ ] Pendente | ALTA |
| 2 | Autenticacao e Usuarios | [ ] Pendente | ALTA |
| 3 | Templates e Documentos | [ ] Pendente | ALTA |
| 4 | Geracao de PDF | [ ] Pendente | ALTA |
| 5 | Pagamentos | [ ] Pendente | MEDIA |
| 6 | Frontend Base | [ ] Pendente | ALTA |
| 7 | Dashboard e UI Premium | [ ] Pendente | MEDIA |
| 8 | Envios (Email/WhatsApp) | [ ] Pendente | MEDIA |
| 9 | Admin e Monitoramento | [ ] Pendente | BAIXA |
| 10 | Deploy e Lancamento | [ ] Pendente | ALTA |

---

## Checklist Global MVP

### FASE 1: Fundacao (Etapas 1-2)
- [ ] Projeto Supabase criado e configurado
- [ ] Repositorio Git inicializado
- [ ] Projeto Next.js criado com Tailwind
- [ ] Estrutura de pastas definida
- [ ] Variaveis de ambiente configuradas
- [ ] Tabelas do banco criadas (users, plans, templates, documents, payments)
- [ ] RLS (Row Level Security) configurado
- [ ] Autenticacao Supabase Auth implementada
- [ ] Paginas de login/signup funcionando
- [ ] Onboarding basico implementado

### FASE 2: Core do Produto (Etapas 3-4)
- [ ] CRUD de templates implementado
- [ ] Templates publicos seed criados
- [ ] Sistema de placeholders funcionando
- [ ] Formulario dinamico baseado em placeholders
- [ ] Preview HTML em tempo real
- [ ] Servico de geracao de PDF (Puppeteer)
- [ ] Armazenamento de PDF no Supabase Storage
- [ ] Download de PDF funcionando

### FASE 3: Monetizacao (Etapa 5)
- [ ] Tabela de planos populada
- [ ] Sistema de creditos implementado
- [ ] Integracao Stripe/Mercado Pago
- [ ] Webhooks de pagamento configurados
- [ ] Fluxo de compra de creditos funcionando
- [ ] Fluxo de assinatura funcionando

### FASE 4: Interface (Etapas 6-7)
- [ ] Layout base com Sidebar Liquid Glass
- [ ] Header com busca e toggle Dark/Light
- [ ] Sistema de temas (Dark/Light) implementado
- [ ] Dashboard com metricas
- [ ] Biblioteca de templates
- [ ] Editor de documento com preview
- [ ] Historico de documentos
- [ ] Pagina de billing/plano

### FASE 5: Comunicacao (Etapa 8)
- [ ] Envio de PDF por email (SendGrid/Postmark)
- [ ] Integracao wa.me para WhatsApp
- [ ] Links publicos temporarios para documentos

### FASE 6: Operacao (Etapas 9-10)
- [ ] Painel admin basico
- [ ] Logs de auditoria
- [ ] Sentry configurado
- [ ] CI/CD com GitHub Actions
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Render/Cloud Run)
- [ ] Dominio configurado
- [ ] SSL ativo

---

## Criterios de Aceite MVP

### Funcionalidades Obrigatorias
1. Usuario consegue se cadastrar e fazer login
2. Usuario consegue escolher template e preencher dados
3. Usuario consegue visualizar preview do documento
4. Usuario consegue gerar PDF e fazer download
5. Usuario consegue enviar documento via email ou WhatsApp
6. Sistema cobra creditos ou valida plano
7. Admin consegue ver usuarios e documentos

### Metricas de Qualidade
- Tempo de geracao de PDF < 10 segundos
- Uptime > 99%
- Lighthouse score > 80
- Mobile responsive

---

## Dependencias Entre Etapas

```
Etapa 1 (Setup)
    |
    v
Etapa 2 (Auth) --> Etapa 6 (Frontend Base)
    |                    |
    v                    v
Etapa 3 (Templates) --> Etapa 7 (Dashboard)
    |
    v
Etapa 4 (PDF) --> Etapa 8 (Envios)
    |
    v
Etapa 5 (Pagamentos)
    |
    v
Etapa 9 (Admin) --> Etapa 10 (Deploy)
```

---

## Links das Documentacoes por Etapa

- [Etapa 1: Setup Inicial](./etapas/01-setup-inicial.md)
- [Etapa 2: Autenticacao](./etapas/02-autenticacao.md)
- [Etapa 3: Templates e Documentos](./etapas/03-templates-documentos.md)
- [Etapa 4: Geracao de PDF](./etapas/04-geracao-pdf.md)
- [Etapa 5: Pagamentos](./etapas/05-pagamentos.md)
- [Etapa 6: Frontend Base](./etapas/06-frontend-base.md)
- [Etapa 7: Dashboard e UI](./etapas/07-dashboard-ui.md)
- [Etapa 8: Envios](./etapas/08-envios.md)
- [Etapa 9: Admin e Monitoramento](./etapas/09-admin-monitoramento.md)
- [Etapa 10: Deploy](./etapas/10-deploy.md)

---

## Notas Importantes

### MCP Supabase
- **Status**: Configurado e funcionando
- **Token**: Configurado no .claude.json do projeto

### Decisoes Tecnicas
- Frontend: Next.js 14+ com App Router
- Estilizacao: Tailwind CSS + Framer Motion
- Backend: API Routes do Next.js (inicialmente)
- BaaS: Supabase (Auth, DB, Storage)
- PDF: Puppeteer em container separado
- Pagamentos: Stripe (prioridade) + Mercado Pago (BR)
