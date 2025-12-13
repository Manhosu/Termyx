-- ============================================
-- TERMYX - Add User Profile Fields
-- ============================================

-- Add phone and cpf_cnpj columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index for cpf_cnpj for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_cpf_cnpj ON users(cpf_cnpj);

-- Success message
SELECT 'User profile fields added successfully!' as status;
