-- Migration: Sistema de Creditos Rigoroso
-- Cada documento (rascunho ou gerado) consome 1 credito
-- Usuario sem creditos NAO pode criar documentos

-- =====================================================
-- FUNCAO ATOMICA PARA DEDUZIR CREDITO
-- =====================================================
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Obter creditos atuais com lock para evitar race condition
  SELECT credits INTO current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Verificar se tem creditos
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RAISE EXCEPTION 'Creditos insuficientes' USING ERRCODE = 'P0001';
  END IF;

  -- Deduzir 1 credito
  UPDATE users
  SET credits = credits - 1, updated_at = NOW()
  WHERE id = p_user_id AND credits > 0
  RETURNING credits INTO new_credits;

  -- Logar transacao de credito
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -1, 'usage', 'Documento criado');

  RETURN new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCAO PARA VERIFICAR SE PODE CRIAR DOCUMENTO
-- =====================================================
CREATE OR REPLACE FUNCTION can_create_document(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(user_credits, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICY PARA BLOQUEAR INSERT SEM CREDITOS
-- =====================================================

-- Remover policy antiga se existir
DROP POLICY IF EXISTS "block_insert_no_credits" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;

-- Nova policy que verifica creditos
CREATE POLICY "Users can insert own documents with credits" ON documents
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.credits > 0
  )
);

-- =====================================================
-- ATUALIZAR CREDITOS INICIAIS PARA USUARIOS FREE
-- =====================================================

-- Garantir que usuarios novos comecem com 2 creditos
ALTER TABLE users ALTER COLUMN credits SET DEFAULT 2;

-- Atualizar usuarios existentes que nao tem creditos e sao free
UPDATE users u
SET credits = 2
WHERE u.credits = 0
  AND (
    u.plan_id IS NULL
    OR EXISTS (
      SELECT 1 FROM plans p
      WHERE p.id = u.plan_id AND p.slug = 'free'
    )
  )
  AND u.free_trial_documents_count IS NULL
  OR u.free_trial_documents_count = 0;

-- =====================================================
-- TRIGGER PARA NOVOS USUARIOS (CREDITOS INICIAIS)
-- =====================================================
CREATE OR REPLACE FUNCTION set_initial_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Novos usuarios comecam com 2 creditos (trial)
  IF NEW.credits IS NULL THEN
    NEW.credits := 2;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_initial_credits ON users;
CREATE TRIGGER trigger_set_initial_credits
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_credits();

-- =====================================================
-- FUNCAO PARA ADICIONAR CREDITOS (COMPRA OU PLANO)
-- =====================================================
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER, p_type TEXT, p_description TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE users
  SET credits = credits + p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO new_credits;

  -- Logar transacao
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, p_description);

  RETURN new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDICE PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits) WHERE credits > 0;
