-- Migration: Add archived_at column to documents table
-- This column tracks when a document was archived
-- Date: 2025-12-13

-- Add archived_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'documents'
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE public.documents
        ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Add 'archived' to document status enum if not already present
-- Note: This assumes status is stored as text. If it's an enum, you'll need to modify the enum type

-- Create index for faster archived document queries
CREATE INDEX IF NOT EXISTS idx_documents_archived_at
ON public.documents (archived_at)
WHERE archived_at IS NOT NULL;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_documents_status
ON public.documents (status);

-- Create composite index for user's archived documents
CREATE INDEX IF NOT EXISTS idx_documents_user_archived
ON public.documents (user_id, archived_at)
WHERE archived_at IS NOT NULL;

-- Comment on new column
COMMENT ON COLUMN public.documents.archived_at IS 'Timestamp when document was archived (soft delete)';
