-- ============================================
-- TERMYX - Initial Database Schema
-- Execute this in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: plans
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC(10,2) DEFAULT 0,
  price_annual NUMERIC(10,2) DEFAULT 0,
  credits_included INTEGER DEFAULT 0,
  max_templates INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  gateway_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: users (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company_name TEXT,
  company_logo TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
  plan_id UUID REFERENCES plans(id),
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  business_category TEXT,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

-- ============================================
-- TABLE: templates
-- ============================================
CREATE TABLE IF NOT EXISTS public.templates (
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
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_owner ON templates(owner_id);

-- ============================================
-- TABLE: documents
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
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

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- TABLE: document_sends
-- ============================================
CREATE TABLE IF NOT EXISTS public.document_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_sends_doc ON document_sends(document_id);

-- ============================================
-- TABLE: document_shares
-- ============================================
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares(token);

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  payload JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTION: update_updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: handle_new_user
-- Creates a profile when a new user signs up
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED: Plans
-- ============================================
INSERT INTO plans (name, slug, price_monthly, price_annual, credits_included, max_templates, features) VALUES
('Free', 'free', 0, 0, 3, 0, '["3 documentos/mes", "Watermark no PDF", "Templates publicos"]'),
('Basic', 'basic', 19.00, 190.00, 0, 3, '["Documentos ilimitados", "Sem watermark", "3 templates customizados", "Envio por email"]'),
('Pro', 'pro', 49.00, 490.00, 100, -1, '["Tudo do Basic", "Templates ilimitados", "100 creditos inclusos", "Assinatura em tela", "Envio WhatsApp", "Suporte prioritario"]'),
('Enterprise', 'enterprise', 150.00, 1500.00, 500, -1, '["Tudo do Pro", "Multi-usuarios", "Marca branca", "API de integracao", "Gerente de conta"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED: Public Templates
-- ============================================
INSERT INTO templates (name, category, description, content_html, placeholders, is_public, price_credit) VALUES
(
  'Contrato de Prestacao de Servicos',
  'contrato',
  'Modelo completo para formalizacao de prestacao de servicos entre prestador e contratante.',
  '<div class="document">
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
</div>',
  '[
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
  ]',
  true,
  1
),
(
  'Recibo de Pagamento',
  'recibo',
  'Modelo simples de recibo para comprovacao de pagamento por servicos ou produtos.',
  '<div class="document">
  <h1>RECIBO DE PAGAMENTO</h1>

  <p class="amount-box">R$ {{VALUE}}</p>

  <p>Recebi de <strong>{{PAYER_NAME}}</strong>, inscrito no CPF/CNPJ n {{PAYER_CPF_CNPJ}}, a quantia de <strong>{{VALUE_WRITTEN}}</strong>, referente a: {{DESCRIPTION}}.</p>

  <p>Forma de pagamento: {{PAYMENT_METHOD}}</p>

  <p>Para maior clareza, firmo o presente recibo para que produza os efeitos legais.</p>

  <div class="signatures">
    <p>{{CITY}}, {{DATE}}</p>
    <div class="signature-line">
      <p>_______________________________</p>
      <p>{{RECEIVER_NAME}}</p>
      <p>CPF/CNPJ: {{RECEIVER_CPF_CNPJ}}</p>
    </div>
  </div>
</div>',
  '[
    {"name": "VALUE", "label": "Valor (R$)", "type": "currency", "required": true},
    {"name": "VALUE_WRITTEN", "label": "Valor por Extenso", "type": "text", "required": true},
    {"name": "PAYER_NAME", "label": "Nome do Pagador", "type": "text", "required": true},
    {"name": "PAYER_CPF_CNPJ", "label": "CPF/CNPJ do Pagador", "type": "cpf_cnpj", "required": true},
    {"name": "DESCRIPTION", "label": "Referente a", "type": "textarea", "required": true},
    {"name": "PAYMENT_METHOD", "label": "Forma de Pagamento", "type": "select", "required": true, "options": ["Dinheiro", "PIX", "Transferencia Bancaria", "Cartao de Credito", "Cartao de Debito", "Boleto", "Cheque"]},
    {"name": "RECEIVER_NAME", "label": "Nome do Recebedor", "type": "text", "required": true},
    {"name": "RECEIVER_CPF_CNPJ", "label": "CPF/CNPJ do Recebedor", "type": "cpf_cnpj", "required": true},
    {"name": "CITY", "label": "Cidade", "type": "text", "required": true},
    {"name": "DATE", "label": "Data", "type": "date", "required": true}
  ]',
  true,
  1
),
(
  'Orcamento de Servicos',
  'orcamento',
  'Modelo profissional de orcamento para apresentacao de propostas comerciais.',
  '<div class="document">
  <h1>ORCAMENTO</h1>

  <div class="header-info">
    <p><strong>De:</strong> {{COMPANY_NAME}}</p>
    <p>{{COMPANY_ADDRESS}}</p>
    <p>Tel: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}</p>
  </div>

  <div class="client-info">
    <p><strong>Para:</strong> {{CLIENT_NAME}}</p>
    <p>{{CLIENT_ADDRESS}}</p>
    <p>Tel: {{CLIENT_PHONE}}</p>
  </div>

  <p><strong>Data:</strong> {{DATE}}</p>
  <p><strong>Validade:</strong> {{VALIDITY}} dias</p>

  <h2>DESCRICAO DOS SERVICOS</h2>
  <p>{{SERVICES_DESCRIPTION}}</p>

  <h2>VALORES</h2>
  <table>
    <tr>
      <td>Subtotal:</td>
      <td>{{SUBTOTAL}}</td>
    </tr>
    <tr>
      <td>Desconto:</td>
      <td>{{DISCOUNT}}</td>
    </tr>
    <tr class="total">
      <td><strong>TOTAL:</strong></td>
      <td><strong>{{TOTAL}}</strong></td>
    </tr>
  </table>

  <h2>CONDICOES DE PAGAMENTO</h2>
  <p>{{PAYMENT_CONDITIONS}}</p>

  <h2>OBSERVACOES</h2>
  <p>{{OBSERVATIONS}}</p>

  <div class="signatures">
    <div class="signature-line">
      <p>_______________________________</p>
      <p>{{COMPANY_NAME}}</p>
    </div>
  </div>
</div>',
  '[
    {"name": "COMPANY_NAME", "label": "Nome da Empresa", "type": "text", "required": true},
    {"name": "COMPANY_ADDRESS", "label": "Endereco da Empresa", "type": "textarea", "required": true},
    {"name": "COMPANY_PHONE", "label": "Telefone da Empresa", "type": "phone", "required": true},
    {"name": "COMPANY_EMAIL", "label": "Email da Empresa", "type": "email", "required": true},
    {"name": "CLIENT_NAME", "label": "Nome do Cliente", "type": "text", "required": true},
    {"name": "CLIENT_ADDRESS", "label": "Endereco do Cliente", "type": "textarea", "required": false},
    {"name": "CLIENT_PHONE", "label": "Telefone do Cliente", "type": "phone", "required": false},
    {"name": "DATE", "label": "Data do Orcamento", "type": "date", "required": true},
    {"name": "VALIDITY", "label": "Validade (dias)", "type": "number", "required": true},
    {"name": "SERVICES_DESCRIPTION", "label": "Descricao dos Servicos", "type": "textarea", "required": true},
    {"name": "SUBTOTAL", "label": "Subtotal", "type": "currency", "required": true},
    {"name": "DISCOUNT", "label": "Desconto", "type": "currency", "required": false},
    {"name": "TOTAL", "label": "Valor Total", "type": "currency", "required": true},
    {"name": "PAYMENT_CONDITIONS", "label": "Condicoes de Pagamento", "type": "textarea", "required": true},
    {"name": "OBSERVATIONS", "label": "Observacoes", "type": "textarea", "required": false}
  ]',
  true,
  1
),
(
  'Termo de Responsabilidade',
  'termo',
  'Modelo de termo de responsabilidade para diversas finalidades.',
  '<div class="document">
  <h1>TERMO DE RESPONSABILIDADE</h1>

  <p>Eu, <strong>{{RESPONSIBLE_NAME}}</strong>, portador(a) do RG n {{RESPONSIBLE_RG}} e inscrito(a) no CPF sob o n {{RESPONSIBLE_CPF}}, residente e domiciliado(a) em {{RESPONSIBLE_ADDRESS}}, declaro para os devidos fins que:</p>

  <p>{{DECLARATION_TEXT}}</p>

  <p>Assumo inteira responsabilidade por {{RESPONSIBILITY_SCOPE}}, isentando {{BENEFICIARY_NAME}} de quaisquer responsabilidades decorrentes.</p>

  <p>Declaro ainda que estou ciente das consequencias legais em caso de descumprimento do presente termo.</p>

  <p>Por ser expressao da verdade, firmo o presente termo.</p>

  <div class="signatures">
    <p>{{CITY}}, {{DATE}}</p>
    <div class="signature-line">
      <p>_______________________________</p>
      <p>{{RESPONSIBLE_NAME}}</p>
      <p>CPF: {{RESPONSIBLE_CPF}}</p>
    </div>
  </div>
</div>',
  '[
    {"name": "RESPONSIBLE_NAME", "label": "Nome do Responsavel", "type": "text", "required": true},
    {"name": "RESPONSIBLE_RG", "label": "RG", "type": "text", "required": true},
    {"name": "RESPONSIBLE_CPF", "label": "CPF", "type": "cpf_cnpj", "required": true},
    {"name": "RESPONSIBLE_ADDRESS", "label": "Endereco Completo", "type": "textarea", "required": true},
    {"name": "DECLARATION_TEXT", "label": "Texto da Declaracao", "type": "textarea", "required": true},
    {"name": "RESPONSIBILITY_SCOPE", "label": "Escopo da Responsabilidade", "type": "textarea", "required": true},
    {"name": "BENEFICIARY_NAME", "label": "Nome do Beneficiario", "type": "text", "required": true},
    {"name": "CITY", "label": "Cidade", "type": "text", "required": true},
    {"name": "DATE", "label": "Data", "type": "date", "required": true}
  ]',
  true,
  1
)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Schema created successfully!' as status;
