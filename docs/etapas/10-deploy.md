# Etapa 10: Deploy e Lancamento

## Objetivo
Configurar CI/CD, realizar deploy da aplicacao em producao e preparar para o lancamento do MVP.

---

## Checklist

### 10.1 Preparacao
- [ ] Revisar todas as variaveis de ambiente
- [ ] Verificar segredos e chaves de producao
- [ ] Testar todos os fluxos criticos
- [ ] Otimizar bundle size
- [ ] Configurar dominio

### 10.2 CI/CD (GitHub Actions)
- [ ] Workflow de build
- [ ] Workflow de testes
- [ ] Workflow de deploy (staging)
- [ ] Workflow de deploy (production)
- [ ] Protecao de branch main

### 10.3 Deploy Frontend (Vercel)
- [ ] Conectar repositorio
- [ ] Configurar variaveis de ambiente
- [ ] Configurar dominio customizado
- [ ] Habilitar analytics
- [ ] Configurar redirects/rewrites

### 10.4 Deploy Backend (se separado)
- [ ] Render / Cloud Run / Railway
- [ ] Configurar variaveis de ambiente
- [ ] Configurar autoscaling
- [ ] Configurar health checks

### 10.5 Supabase Producao
- [ ] Projeto de producao criado
- [ ] Migracoes aplicadas
- [ ] RLS verificado
- [ ] Backups configurados
- [ ] Edge Functions (se houver)

### 10.6 Dominio e SSL
- [ ] Registrar dominio
- [ ] Configurar DNS
- [ ] SSL automatico (Vercel)
- [ ] Configurar www redirect

### 10.7 Performance
- [ ] Lighthouse score > 80
- [ ] Core Web Vitals OK
- [ ] Imagens otimizadas
- [ ] Fonts otimizadas
- [ ] Cache configurado

### 10.8 SEO e Analytics
- [ ] Meta tags configuradas
- [ ] Open Graph tags
- [ ] Sitemap
- [ ] robots.txt
- [ ] Google Analytics
- [ ] Pixel do Facebook (se usar)

### 10.9 Checklist de Lancamento
- [ ] Termos de uso publicados
- [ ] Politica de privacidade publicada
- [ ] Pagina de FAQ/Ajuda
- [ ] Email de suporte configurado
- [ ] Social media preparada

---

## Implementacao

### GitHub Actions - CI
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  test:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

### GitHub Actions - Deploy
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/app",
      "destination": "/dashboard",
      "permanent": true
    }
  ]
}
```

### Variaveis de Ambiente Producao
```env
# .env.production (template)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://termyx.com.br
NODE_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@termyx.com.br

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Next.js Config Producao
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    domains: ['xxx.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizeCss: true,
  },

  // Headers de seguranca
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

// Sentry
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'termyx',
  project: 'termyx-web',
})
```

### SEO - Metadata
```typescript
// /app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Termyx - Gerador de Documentos Profissionais',
    template: '%s | Termyx'
  },
  description: 'Crie contratos, recibos e documentos profissionais em minutos. Simples, rapido e confiavel.',
  keywords: ['gerador de contratos', 'documentos', 'recibos', 'orcamentos', 'MEI', 'autonomo'],
  authors: [{ name: 'Termyx' }],
  creator: 'Termyx',
  publisher: 'Termyx',
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://termyx.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://termyx.com.br',
    siteName: 'Termyx',
    title: 'Termyx - Gerador de Documentos Profissionais',
    description: 'Crie contratos, recibos e documentos profissionais em minutos.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Termyx'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Termyx - Gerador de Documentos Profissionais',
    description: 'Crie contratos, recibos e documentos profissionais em minutos.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}
```

### Sitemap
```typescript
// /app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://termyx.com.br'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

### robots.txt
```typescript
// /app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/documents/'],
    },
    sitemap: 'https://termyx.com.br/sitemap.xml',
  }
}
```

---

## Checklist Final de Lancamento

### Pre-Lancamento
- [ ] Todos os testes passando
- [ ] Nenhum erro no Sentry
- [ ] Performance OK (Lighthouse > 80)
- [ ] Mobile testado
- [ ] Fluxo de pagamento testado (modo producao)
- [ ] Emails sendo enviados
- [ ] Backup do banco funcionando

### No Dia do Lancamento
- [ ] Deploy final em producao
- [ ] Verificar logs por erros
- [ ] Testar fluxo completo em producao
- [ ] Monitorar metricas
- [ ] Equipe de suporte pronta

### Pos-Lancamento
- [ ] Monitorar taxa de erro
- [ ] Coletar feedback inicial
- [ ] Responder tickets de suporte
- [ ] Acompanhar conversoes
- [ ] Iterar baseado em dados

---

## Comandos Uteis

```bash
# Build local
npm run build

# Preview producao local
npm run start

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Deploy manual Vercel
vercel --prod

# Logs Vercel
vercel logs

# Verificar Lighthouse
npx lighthouse https://termyx.com.br --view
```

---

## Entregaveis
- [ ] CI/CD funcionando
- [ ] Deploy automatico configurado
- [ ] Aplicacao em producao
- [ ] Dominio configurado
- [ ] SSL ativo
- [ ] Monitoring ativo
- [ ] Performance validada

---

## Conclusao

Com esta etapa concluida, o MVP do Termyx estara pronto para lancamento. O sistema tera:

- Autenticacao completa
- Geracao de documentos profissionais
- Sistema de pagamentos
- Envio por email e WhatsApp
- Painel administrativo
- Monitoramento e logs

**Proximo passo**: Iterar baseado no feedback dos usuarios e implementar features do produto final (editor WYSIWYG, assinatura eletronica, WhatsApp API, etc).
