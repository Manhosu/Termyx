# Guia de Deploy - Termyx

## Pre-requisitos

Antes de fazer o deploy, certifique-se de ter:

1. **Conta no Vercel** (vercel.com)
2. **Projeto Supabase de producao** configurado
3. **Conta Stripe** com produtos/precos criados
4. **Conta SendGrid** com API key
5. **Conta Sentry** (opcional, mas recomendado)

---

## Passo 1: Preparar Supabase de Producao

### 1.1 Criar projeto de producao
- Acesse dashboard.supabase.com
- Crie um novo projeto para producao
- Anote a URL e as chaves (anon key e service role key)

### 1.2 Aplicar migrations
Execute as migrations no projeto de producao:

```sql
-- Copie o conteudo de supabase/migrations/ e execute no SQL Editor
```

Ou use o Supabase CLI:
```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

### 1.3 Configurar Storage
- Crie o bucket `documents` no Storage
- Configure as policies de acesso

### 1.4 Configurar Auth
- Configure os provedores de auth desejados
- Atualize as URLs de redirect para o dominio de producao

---

## Passo 2: Configurar Stripe

### 2.1 Criar produtos e precos
No Dashboard do Stripe (modo producao):

1. Criar produtos:
   - Basic Plan (mensal e anual)
   - Pro Plan (mensal e anual)
   - Enterprise Plan (mensal e anual)

2. Anotar os Price IDs de cada plano

### 2.2 Configurar Webhook
1. Vá em Developers > Webhooks
2. Adicione endpoint: `https://seudominio.com/api/stripe/webhook`
3. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Anote o Webhook Secret

---

## Passo 3: Configurar Sentry

### 3.1 Criar projeto
1. Acesse sentry.io
2. Crie uma nova organizacao (ou use existente)
3. Crie um novo projeto Next.js
4. Anote o DSN

### 3.2 Gerar Auth Token
1. Vá em Settings > Auth Tokens
2. Crie um novo token com permissoes de upload de source maps
3. Anote o token

---

## Passo 4: Deploy no Vercel

### 4.1 Conectar repositorio
1. Acesse vercel.com/new
2. Importe o repositorio do GitHub
3. Selecione o framework: Next.js

### 4.2 Configurar variaveis de ambiente

No painel de configuracoes do projeto, adicione:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://termyx.com.br
NODE_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_BASIC_MONTHLY=price_xxx
STRIPE_PRICE_BASIC_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx

# Email
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@termyx.com.br
SENDGRID_FROM_NAME=Termyx

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=termyx
SENTRY_PROJECT=termyx-web
```

### 4.3 Fazer deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL gerada para testar

---

## Passo 5: Configurar Dominio

### 5.1 No Vercel
1. Vá em Settings > Domains
2. Adicione seu dominio (ex: termyx.com.br)
3. Configure como Primary Domain

### 5.2 No seu provedor DNS
Adicione os registros:
- Tipo A: @ -> IP do Vercel
- Tipo CNAME: www -> cname.vercel-dns.com

### 5.3 SSL
- O SSL e configurado automaticamente pelo Vercel
- Aguarde ate 24h para propagacao completa

---

## Passo 6: Pos-Deploy

### 6.1 Verificacoes
- [ ] Login/signup funcionando
- [ ] Criacao de documentos funcionando
- [ ] Pagamentos processando
- [ ] Emails sendo enviados
- [ ] Erros aparecendo no Sentry

### 6.2 Monitoramento
- Configure alertas no Sentry
- Configure alertas no Vercel Analytics
- Monitore logs no Vercel

### 6.3 Backups
- Configure backups automaticos no Supabase
- Exporte regularmente os dados criticos

---

## Troubleshooting

### Build falha com erro de Html
Este e um bug conhecido do Next.js 15. O Vercel geralmente resolve automaticamente.

### Webhook nao recebe eventos
1. Verifique se a URL esta correta
2. Verifique os logs do Stripe
3. Confirme que o STRIPE_WEBHOOK_SECRET esta correto

### Emails nao sao enviados
1. Verifique a API key do SendGrid
2. Confirme que o dominio esta verificado no SendGrid
3. Verifique os logs do SendGrid

---

## Comandos Uteis

```bash
# Verificar build localmente
npm run build

# Rodar em modo producao local
npm run start

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Deploy manual (se necessario)
vercel --prod
```

---

## Suporte

Para problemas:
1. Verifique os logs no Vercel
2. Verifique erros no Sentry
3. Consulte a documentacao das ferramentas utilizadas
