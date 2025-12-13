-- Migration: Add credit_transactions and document_shares tables
-- Date: 2025-12-13

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
    description TEXT,
    reference_id UUID, -- Optional reference to payment or document
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
ON public.credit_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
ON public.credit_transactions (created_at DESC);

-- Enable RLS for credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own credit transactions"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only system can insert transactions (via service role)
CREATE POLICY "Service role can insert credit transactions"
ON public.credit_transactions FOR INSERT
TO service_role
WITH CHECK (true);

-- Create document_shares table
CREATE TABLE IF NOT EXISTS public.document_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for document_shares
CREATE INDEX IF NOT EXISTS idx_document_shares_token
ON public.document_shares (token);

CREATE INDEX IF NOT EXISTS idx_document_shares_user_id
ON public.document_shares (user_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id
ON public.document_shares (document_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_expires_at
ON public.document_shares (expires_at);

-- Enable RLS for document_shares
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Users can manage their own shares
CREATE POLICY "Users can view own document shares"
ON public.document_shares FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create document shares"
ON public.document_shares FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own document shares"
ON public.document_shares FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Public can view shares by token (for share page)
CREATE POLICY "Anyone can view share by token"
ON public.document_shares FOR SELECT
TO anon
USING (expires_at > NOW());

-- Comments
COMMENT ON TABLE public.credit_transactions IS 'Track all credit transactions for users';
COMMENT ON TABLE public.document_shares IS 'Manage public share links for documents';
COMMENT ON COLUMN public.credit_transactions.type IS 'Transaction type: purchase, usage, refund, bonus';
COMMENT ON COLUMN public.document_shares.token IS 'Unique secure token for share URL';
COMMENT ON COLUMN public.document_shares.view_count IS 'Number of times the share link was accessed';
