-- ============================================
-- TERMYX - Row Level Security Policies
-- Execute this AFTER 001_initial_schema.sql
-- ============================================

-- ============================================
-- RLS: users table
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS: plans table
-- ============================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- ============================================
-- RLS: templates table
-- ============================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view public templates
CREATE POLICY "Anyone can view public templates"
  ON templates FOR SELECT
  USING (is_public = true);

-- Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can create templates
CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = owner_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = owner_id);

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates"
  ON templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS: documents table
-- ============================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create documents
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS: payments table
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert payments (webhooks)
CREATE POLICY "Service can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS: document_sends table
-- ============================================
ALTER TABLE document_sends ENABLE ROW LEVEL SECURITY;

-- Users can view their own sends
CREATE POLICY "Users can view own sends"
  ON document_sends FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create sends
CREATE POLICY "Users can create sends"
  ON document_sends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS: document_shares table
-- ============================================
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their own shares
CREATE POLICY "Users can view own shares"
  ON document_shares FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create shares
CREATE POLICY "Users can create shares"
  ON document_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can view share by token (for public access)
CREATE POLICY "Anyone can view share by token"
  ON document_shares FOR SELECT
  USING (true);

-- ============================================
-- RLS: audit_logs table
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service can insert logs
CREATE POLICY "Service can insert logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- STORAGE: Create bucket and policies
-- ============================================
-- Note: Run these in the Storage section of Supabase Dashboard
-- or use the Supabase CLI

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false);

-- CREATE POLICY "Users can view own documents"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'documents'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can upload own documents"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'documents'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can delete own documents"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'documents'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

SELECT 'RLS policies created successfully!' as status;
