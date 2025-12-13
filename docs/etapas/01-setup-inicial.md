# Etapa 1: Setup Inicial

## Objetivo
Configurar toda a infraestrutura base do projeto: repositorio, Supabase, projeto Next.js e estrutura de pastas.

---

## Checklist

### 1.1 Supabase
- [ ] Criar projeto no Supabase Dashboard
- [ ] Anotar URL do projeto e chaves (anon, service_role)
- [ ] Configurar regiao (preferencialmente South America)
- [ ] Habilitar Auth (Email/Password)

### 1.2 Repositorio Git
- [ ] Inicializar repositorio Git
- [ ] Criar .gitignore adequado
- [ ] Criar branch principal (main)
- [ ] Configurar remote (GitHub)

### 1.3 Projeto Next.js
- [ ] Criar projeto: `npx create-next-app@latest termyx --typescript --tailwind --app`
- [ ] Instalar dependencias base:
  - [ ] `@supabase/supabase-js`
  - [ ] `@supabase/auth-helpers-nextjs`
  - [ ] `framer-motion`
  - [ ] `lucide-react` (icones)
  - [ ] `date-fns`
  - [ ] `zod` (validacao)
  - [ ] `react-hook-form`

### 1.4 Estrutura de Pastas
- [ ] Criar estrutura:
```
/src
  /app
    /(auth)
      /login
      /signup
    /(dashboard)
      /dashboard
      /templates
      /documents
      /billing
    /(admin)
      /admin
    /api
  /components
    /ui
    /layout
    /forms
  /lib
    /supabase
    /utils
    /hooks
  /types
  /styles
```

### 1.5 Variaveis de Ambiente
- [ ] Criar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
- [ ] Criar `.env.example` (sem valores sensiveis)

### 1.6 Banco de Dados - Tabelas Base
- [ ] Criar tabela `users` (extensao do auth.users)
- [ ] Criar tabela `plans`
- [ ] Criar tabela `templates`
- [ ] Criar tabela `documents`
- [ ] Criar tabela `payments`
- [ ] Criar tabela `audit_logs`
- [ ] Configurar indices

### 1.7 RLS (Row Level Security)
- [ ] Habilitar RLS em todas as tabelas
- [ ] Criar politicas para `users` (usuario ve apenas seus dados)
- [ ] Criar politicas para `templates` (publicos + proprios)
- [ ] Criar politicas para `documents` (apenas proprios)
- [ ] Criar politicas para `payments` (apenas proprios)

---

## Scripts SQL

### Criar Tabela Users (Profile)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
  plan_id UUID REFERENCES plans(id),
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Criar Tabela Plans
```sql
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC(10,2),
  price_annual NUMERIC(10,2),
  credits_included INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  gateway_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Seed dos planos
INSERT INTO plans (name, slug, price_monthly, credits_included, features) VALUES
('Free', 'free', 0, 3, '["3 docs/mes", "Watermark"]'),
('Basic', 'basic', 19.00, 0, '["Docs ilimitados", "Sem watermark", "3 templates custom"]'),
('Pro', 'pro', 49.00, 100, '["Templates ilimitados", "100 creditos", "Assinatura em tela"]'),
('Enterprise', 'enterprise', 150.00, 500, '["Multiusuario", "Marca branca", "API"]');
```

### Criar Tabela Templates
```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('contrato', 'recibo', 'orcamento', 'termo', 'outro')),
  description TEXT,
  content_html TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  price_credit INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public);
CREATE INDEX idx_templates_owner ON templates(owner_id);
```

### Criar Tabela Documents
```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
```

### Criar Tabela Payments
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  gateway TEXT NOT NULL,
  gateway_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'credits', 'one_time')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### Criar Tabela Audit Logs
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  payload JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### Politicas RLS
```sql
-- Users: usuario ve apenas seu perfil
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Templates: publicos ou proprios
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
  ON templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Documents: apenas proprios
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Entregaveis
- [ ] Projeto rodando localmente (`npm run dev`)
- [ ] Conexao com Supabase funcionando
- [ ] Tabelas criadas no banco
- [ ] RLS configurado e testado

---

## Proxima Etapa
[Etapa 2: Autenticacao](./02-autenticacao.md)
