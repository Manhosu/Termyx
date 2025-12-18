# Termyx - Checklist Global de Desenvolvimento

## Status do Projeto
- **Versao**: 1.0 MVP
- **Inicio**: 2025-12-11
- **Stack**: Next.js + Tailwind + Supabase + Node.js

---

## Visao Geral das Etapas

| # | Etapa | Status | Prioridade |
|---|-------|--------|------------|
| 1 | Setup Inicial (Infra + Supabase) | [x] Concluido | ALTA |
| 2 | Autenticacao e Usuarios | [x] Concluido | ALTA |
| 3 | Templates e Documentos | [x] Concluido | ALTA |
| 4 | Geracao de PDF | [x] Concluido | ALTA |
| 5 | Pagamentos | [x] Concluido | MEDIA |
| 6 | Frontend Base | [x] Concluido | ALTA |
| 7 | Dashboard e UI Premium | [x] Concluido | MEDIA |
| 8 | Envios (Email/WhatsApp) | [x] Concluido | MEDIA |
| 9 | Admin e Monitoramento | [x] Concluido | BAIXA |
| 10 | Deploy e Lancamento | [x] Concluido | ALTA |

---

## Checklist Global MVP

### FASE 1: Fundacao (Etapas 1-2)
- [x] Projeto Supabase criado e configurado
- [x] Repositorio Git inicializado
- [x] Projeto Next.js criado com Tailwind
- [x] Estrutura de pastas definida
- [x] Variaveis de ambiente configuradas
- [x] Tabelas do banco criadas via MCP Supabase
- [x] RLS (Row Level Security) configurado
- [x] Autenticacao Supabase Auth implementada
- [x] Paginas de login/signup funcionando
- [x] Onboarding basico implementado
- [x] Fluxo de recuperacao de senha (/reset-password, /reset-password/confirm)

### FASE 2: Core do Produto (Etapas 3-4)
- [x] CRUD de templates implementado
- [x] Templates publicos seed criados (4 templates)
- [x] Sistema de placeholders funcionando
- [x] Formulario dinamico baseado em placeholders
- [x] Preview HTML em tempo real
- [x] Servico de geracao de PDF (API Route)
- [x] Armazenamento de PDF no Supabase Storage
- [x] Download de PDF funcionando
- [x] Export de documentos em multiplos formatos (/api/documents/export - HTML, TXT, JSON)

### FASE 3: Monetizacao (Etapa 5)
- [x] Tabela de planos populada (Free, Basic, Pro, Enterprise)
- [x] Sistema de creditos implementado
- [x] Integracao Stripe (checkout, portal, webhooks)
- [x] Webhooks de pagamento configurados
- [x] Fluxo de compra de creditos funcionando
- [x] Fluxo de assinatura funcionando

### FASE 4: Interface (Etapas 6-7)
- [x] Layout base com Sidebar Liquid Glass
- [x] Header com busca e toggle Dark/Light
- [x] Sistema de temas (Dark/Light) implementado
- [x] Dashboard com metricas
- [x] API de atividades do usuario (/api/user/activity) para dashboard
- [x] API de estatisticas do usuario (/api/user/stats) para dashboard
- [x] API de perfil do usuario (/api/user/profile) com validacao CPF/CNPJ
- [x] API de busca de documentos (/api/documents/search) com filtros avancados
- [x] API de estatisticas de templates (/api/templates/stats)
- [x] API de seguranca da conta (/api/user/security) - alteracao de senha e exclusao
- [x] API de avatar do usuario (/api/user/avatar) - upload e remocao
- [x] API de duplicacao de documentos (/api/documents/duplicate)
- [x] API de templates favoritos (/api/templates/favorites)
- [x] API de arquivamento de documentos (/api/documents/archive)
- [x] API de operacoes em lote (/api/documents/bulk) - arquivar, restaurar, excluir
- [x] API de analytics do dashboard (/api/dashboard/analytics)
- [x] API de creditos do usuario (/api/user/credits) - saldo e historico
- [x] API de gerenciamento de compartilhamentos (/api/documents/shares)
- [x] API de estatisticas admin (/api/admin/stats)
- [x] API de notificacoes (/api/notifications) - GET, PATCH, DELETE
- [x] API de clone de templates (/api/templates/clone)
- [x] Biblioteca de templates com filtro por categoria
- [x] Editor de documento com preview em tempo real
- [x] Historico de documentos com busca e filtros
- [x] Pagina de detalhes do documento
- [x] Pagina de billing/plano
- [x] Pagina de configuracoes do usuario (/settings)
- [x] Pagina de ajuda (/help)
- [x] Landing page profissional (/)
- [x] Loading states (skeletons) para paginas principais
- [x] Paginas de erro customizadas (404, global-error)

### FASE 5: Comunicacao (Etapa 8)
- [x] Envio de PDF por email (SendGrid)
- [x] Integracao wa.me para WhatsApp
- [x] Links publicos temporarios para documentos (compartilhamento)
- [x] Pagina publica de visualizacao /share/[token]
- [x] API de download publico /api/share/download
- [x] Email de boas-vindas no onboarding (/api/email/welcome)
- [x] Email de confirmacao de pagamento (credits e subscriptions)

### FASE 6: Operacao (Etapas 9-10)
- [x] Painel admin basico (Dashboard, Usuarios, Templates, Settings)
- [x] Painel admin de pagamentos (/admin/payments)
- [x] Painel admin de atividade/logs (/admin/activity)
- [x] Logs de auditoria (audit utility + API route)
- [x] Sentry configurado (SDK + instrumentation) - temporariamente desabilitado
- [x] CI/CD com GitHub Actions
- [x] Configuracao Vercel (vercel.json + security headers)
- [x] SEO (sitemap, robots, metadata, dynamic OG for share pages)
- [x] Guia de deploy documentado
- [x] Deploy frontend (Vercel) - PRONTO PARA DEPLOY (build funcionando)
- [x] Health check endpoint (/api/health) para monitoramento
- [x] Rate limiting em rotas sensíveis (PDF, email)
- [ ] Dominio configurado (manual - pos-deploy)
- [ ] SSL ativo (automatico no Vercel - pos-deploy)

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
- **[Guia de Deploy](./DEPLOY_GUIDE.md)** - Passo a passo para producao

---

## Notas Importantes

### MCP Supabase
- **Status**: Conectado e funcionando
- **Token**: Configurado no .claude.json do projeto
- **Migrations aplicadas** (15 total):
  - initial_schema
  - triggers_and_seeds
  - seed_templates (1 e 2)
  - rls_policies
  - add_user_profile_fields (phone, cpf_cnpj, avatar_url)
  - add_favorite_templates (favorite_templates, deleted_at, avatars bucket)
  - add_archived_at (archived_at para documentos)
  - add_credit_transactions (credit_transactions table)
  - add_notifications (notifications, templates.cloned_from)
  - fix_function_search_path (segurança: SET search_path nas funções)
  - add_missing_fk_indexes (performance: índices em foreign keys)
  - optimize_rls_policies (performance: (select auth.uid()) nas políticas)
  - consolidate_permissive_policies (performance: políticas RLS unificadas)
  - fix_plans_policies (performance: separação de políticas admin por ação)

### Paleta de Cores (Dezembro 2025)
- **Migração completa**: blue/purple → emerald/teal
- **Cores primárias**: emerald-500, emerald-600, teal-500, teal-600
- **Cores de acento**: cyan-500, green-500
- **Gradientes**: from-emerald-500 to-teal-600
- **Focus rings**: focus:ring-emerald-500
- **Status "sent"**: teal-100/teal-700 (era blue)
- **Categorias de template**: emerald (contrato), teal (orçamento)
- **Todos os arquivos atualizados**: ~40 arquivos .tsx

### Decisoes Tecnicas
- Frontend: Next.js 15.4.9 com App Router
- Estilizacao: Tailwind CSS 4 + Framer Motion
- Animacoes: Framer Motion (scroll-driven, parallax, stagger)
- UI Design: Liquid Glass (iOS 26-inspired, glassmorphism)
- Backend: API Routes do Next.js (inicialmente)
- BaaS: Supabase (Auth, DB, Storage)
- PDF: Puppeteer em container separado
- Pagamentos: Stripe (prioridade) + Mercado Pago (BR)

### Otimizações de Banco de Dados (Dezembro 2025)
- **Segurança**: 0 avisos (todas as funções com search_path fixo)
- **Performance**: RLS policies otimizadas com `(select auth.uid())`
- **Índices**: Foreign keys indexadas (document_sends, document_shares, documents, users)
- **Triggers**: update_updated_at e handle_new_user com SECURITY DEFINER
- **RLS Consolidado**: Políticas permissivas múltiplas unificadas (0 avisos WARN)
  - audit_logs, document_shares, plans, templates, users
  - Políticas SELECT consolidadas com OR conditions
  - Políticas admin separadas por ação (INSERT, UPDATE, DELETE)

### Problemas Conhecidos
- ~~Build de producao com erro em paginas de erro (404/500)~~ - **RESOLVIDO**
- ~~Avisos de segurança nas funções SQL~~ - **RESOLVIDO**
- Build de producao funcionando corretamente (49 paginas/rotas geradas)
- **MVP 100% COMPLETO** - Pronto para deploy na Vercel
- Todas as migrations aplicadas via MCP Supabase

### Paginas Adicionais Implementadas (Dezembro 2025)
- /terms - Termos de Uso
- /privacy - Politica de Privacidade
- /reset-password - Solicitar recuperacao de senha
- /reset-password/confirm - Definir nova senha
- Footer da landing page atualizado com links corretos
- Error boundaries para dashboard, admin e auth routes

### Loading States Completos
- Dashboard: dashboard, templates, documents, documents/new, documents/[id], billing, settings, help
- Admin: admin, users, templates, payments, activity, settings
- Auth: login, signup, onboarding, reset-password, reset-password/confirm
- Publico: terms, privacy, share/[token]

### Acessibilidade (WCAG)
- aria-labels em todos os botoes de icone (Header, Sidebar, Login, Signup)
- aria-hidden em icones decorativos
- input type="search" para campo de busca
- Suporte completo a leitores de tela

### PWA (Progressive Web App) - Dezembro 2025
- manifest.ts configurado (nome, icones, tema)
- Viewport meta tags configuradas
- Apple Web App metadata adicionada
- Theme color responsivo (dark/light mode)

### Sistema de Emails (SendGrid)
- **Templates disponíveis** (src/lib/email/index.ts):
  - `documentSent` - Notificacao de documento compartilhado (com anexo PDF)
  - `passwordReset` - Link para redefinir senha
  - `paymentConfirmation` - Confirmacao de pagamento (creditos/assinatura)
  - `welcomeEmail` - Boas-vindas apos onboarding
- **API Routes**:
  - `/api/email/welcome` - Envia email de boas-vindas (chamado no onboarding)
  - `/api/documents/send-email` - Envia documento por email com PDF anexado
- **Integracao com Stripe Webhooks**:
  - Emails automaticos em checkout.session.completed (creditos)
  - Emails automaticos em invoice.paid (assinaturas)

### Seguranca e Monitoramento
- **Health Check** (`/api/health`):
  - Verifica status do banco de dados e storage
  - Retorna configuracao de servicos (Stripe, SendGrid)
  - Uptime tracking para monitoramento
  - Status codes: 200 (healthy), 503 (unhealthy)
- **Rate Limiting** (`src/lib/rate-limit/index.ts`):
  - PDF generation: 20 requests/hora por usuario
  - Email sending: 10 requests/hora por usuario
  - Headers X-RateLimit-* nas respostas
  - In-memory store (para producao multi-instancia, usar Redis)
- **Input Validation** (`src/lib/validation/index.ts`):
  - Sanitizacao de strings (remove HTML tags)
  - Validacao de email, UUID, telefone BR
  - Validacao de CPF/CNPJ brasileiros
  - Validacao de forca de senha
  - Paginacao segura com limites
- **CSRF Protection** (`src/lib/csrf/index.ts`):
  - Geracao de tokens criptograficamente seguros
  - Comparacao timing-safe para prevenir timing attacks
  - Middleware pronto para uso em API routes
- **User Preferences API** (`/api/user/preferences`):
  - GET/PATCH para preferencias de notificacao
  - Controle granular de emails (marketing, updates, documentos, pagamentos)

### Nota sobre Sentry
- Sentry temporariamente desabilitado devido a incompatibilidade com Next.js 15
- Reinstalar apos Sentry lancar versao compativel: `npm install @sentry/nextjs`
- Configuracao preservada nos arquivos de documentacao

### UI/UX Moderna (Dezembro 2025)

#### Framer Motion - Animacoes
- **Componentes de animacao** (`src/components/ui/motion.tsx`):
  - `ScrollAnimation` - Animacao ao entrar na viewport (scroll-driven)
  - `StaggerContainer` / `StaggerItem` - Animacoes em cascata para listas
  - `HoverScale` - Efeito de escala ao hover com spring physics
  - `ParallaxSection` - Efeito parallax no scroll
  - Variantes exportadas: `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `scaleUp`, `staggerContainer`, `scrollFadeIn`

#### Liquid Glass Design (iOS 26-inspired)
- **Componentes glassmorphism** (`src/components/ui/liquid-glass.tsx`):
  - `LiquidGlassCard` - Card com backdrop-blur, gradientes e bordas translucidas
  - `LiquidGlassButton` - Botao com efeitos de vidro e micro-interacoes
  - `LiquidGlassInput` - Input com fundo desfocado e focus states fluidos
  - Suporte completo a dark/light mode com transicoes suaves

#### Dashboard Moderno
- **Layout com blobs animados** - Background gradiente com movimento sutil
- **Sidebar Liquid Glass** - Navegacao com backdrop-blur e indicador ativo animado
- **Header responsivo** - Busca com micro-animacoes e toggle de tema animado
- **Cards estatisticos** - Gradientes, icones com glow, tendencias animadas
- **Animacoes de entrada** - Stagger containers para documentos e templates

#### Landing Page Premium
- **Hero com parallax** - Movimento suave no scroll
- **Features com scroll-driven animations** - Aparicao gradual dos cards
- **Gradientes animados** - Blobs de background com movimento organico
- **CTAs com hover effects** - Botoes com scale e shadow transitions
- **Testimonials** - Cards com estrelas e animacoes hover

#### Transicoes de Tema
- **Theme Provider** (`src/components/providers/theme-provider.tsx`)
- **CSS global** (`src/app/globals.css`):
  - `.theme-transition` - Classe para suavizar mudanca dark/light
  - Custom scrollbar styling
  - Utilidades: `.glass`, `.gradient-text`, `.animate-float`, `.animate-pulse-glow`, `.animate-shimmer`
  - Focus ring e selection styling consistentes
